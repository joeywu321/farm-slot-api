'use strict';

process.env.NODE_CONFIG_DIR = "./coulla/config";

const util = require('util');
const fs = require('fs');
const P = require('bluebird');
const moment = require('moment');
const db = require('../lib/mysql-p');
const json2csv = require('json2csv');
const configure = require('../coulla/configure');

configure.initDatabase();

// var stmt = 'SELECT `recordId`, `recordDate`, `amtReceived` FROM `xmr_amount_due_daily` WHERE `recordId` >= 130000000055 AND `amtReceived` > 0;';
// var params = [];
// var fields = ['recordId', 'recordDate', 'amtReceived'];

var stmt = 'SELECT `recordId`, `recordTime`, `ETH`, `USD` FROM `xmr_exchange_rate_daily` WHERE `recordId` >= 1000000123';
var params = [];
var fields = ['recordId', 'recordTime', 'ETH', 'USD'];

const dataToCSV = function(dataset) {
  return new P(function(resolve, reject) {
    try {
      var result = json2csv({
        data: dataset,
        fields: fields
      });

      console.log(result);

      resolve(result);

    } catch (err) {
      // Errors are thrown for bad options, or if the data is empty and no fields are provided.
      // Be sure to provide fields if it is possible that your data array will be empty.
      // console.error(err);

      reject(err);
    }
  });
};

const writeFile = function(data) {
  return P.fromCallback(function(cb) {
    var filename = util.format('csv_%s.csv', moment().format('YYYYMMDDHHmmss'));
    fs.writeFile('./data/' + filename, data, cb);
  });
};

db.query(stmt, params)
  .then(function(rs) {
    console.log(rs);

    return dataToCSV(rs);

  }).then(function(data) {
    return writeFile(data);
  }).catch(function(err) {
    console.error(err);
  });
