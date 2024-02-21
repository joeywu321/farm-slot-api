'use strict';

process.env.NODE_CONFIG_DIR = "./coulla/config";

const P = require('bluebird');
const _ = require('lodash');
const util = require('util');
const prompt = require('prompt');
const configure = require('../coulla/configure');
const db = require('../lib/mysql-p');

configure.initDatabase();

var createStmt = "CREATE TABLE `ticket_%s` (" +
  "`stub` varchar(50) NOT NULL UNIQUE, " +
  "`id` bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY " +
  ") ENGINE='InnoDB' COLLATE 'utf8_unicode_ci' AUTO_INCREMENT=%s;";

var insertStmt = "INSERT INTO `ticket_%s` (`stub`) VALUES (?);";

var createTableStmt = "CREATE TABLE ?? (" +
  "`id` bigint unsigned NOT NULL PRIMARY KEY," +
  " `utime` int unsigned NOT NULL," +
  " `ctime` int unsigned NOT NULL," +
  " `active` tinyint NOT NULL DEFAULT 1" +
  ") ENGINE='InnoDB' COLLATE 'utf8_unicode_ci';";

var schema = {
  properties: {
    'tableName': {
      description: 'Table Name',
      required: true,
    },
    'id': {
      description: 'ID for Auto Increment',
      default: 1000000000,
      required: false,
      pattern: /^\d+$/,
      message: 'Must be integer',
      before: function(val) {
        return _.toInteger(val);
      }
    }
  }
};

P.try(function() {

  return P.promisify(prompt.get)(schema)
    .then(function(result) {

      console.info(result);

      var {tableName, id} = result;

      var pmList = [
        [util.format(createStmt, tableName, id), []],
        [util.format(insertStmt, tableName), [tableName, id]],
        [createTableStmt, [tableName]]
      ];

      return P.each(pmList, function(p) {
        return db.query.apply(null, p);
      });
    });

}).catch(function(err) {
  console.error(err);
}).finally(function() {
  process.exit();
});
