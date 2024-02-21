'use strict';

process.env.NODE_CONFIG_DIR = "./coulla/config";

const util = require('util');
const fs = require('fs');
const P = require('bluebird');
const moment = require('moment');
const db = require('../lib/mysql-p');
const configure = require('../coulla/configure');
const crypto = require('crypto');
const config = require('config');
const Chance = require('chance');
const _ = require('lodash');


configure.initDatabase();

const tbl = 'customer_account';
var password = "password";
var phoneArr = [
  '10000000', '20000000', '30000000', '40000000', '50000000', '60000000', '70000000', '80000000', '90000000'
];
var bankArr = [
  '中國銀行', '滙豐銀行', '恒生銀行'
];
var companyArr = [
  'River Company', 'Stick Company', 'Space Company', 'Star Company', 'Wood Company'
];
var loopTimes = phoneArr.length;

const insertAccount = function(data) {
  var stmt = 'INSERT INTO '+ tbl +' SET ?';
  var params = [data];
  return db.query(stmt, params);
};

P.try(function(){

  var secret_key = config.get('SBT.PASSWORD_SECRET');
  var chance = new Chance();
  var promiseArr = [];

  return P.resolve()
    .then(function() {

      _.times(loopTimes, function(i) {
        var count = i;
        promiseArr.push(
          insertAccount({
            utime: moment().unix(),
            ctime: moment().unix(),
            phonenumber: phoneArr[count],
            email: chance.email({domain: "gmail.com"}),
            username: chance.name(),
            password: crypto.createHash("sha256").update(password + secret_key).digest('hex'),
            company: chance.company(),
            credit: chance.integer({ min: 1, max: 99 }),
            tradeSuccess: chance.integer({ min: 1, max: 99 }),
            tradeTotalPrice: chance.integer({ min: 1, max: 99 }),
            registerNumber: phoneArr[count],
            bank: chance.pickone(bankArr)
          })
        );
      });

    }).then(function() {
      return P.all(promiseArr);
    });

}).catch(function(err) {
  console.log(err);
}).done();
