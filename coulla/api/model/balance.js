'use strict';

const _ = require('lodash');

var balance = 100000;

const getBalance = function (playerId) {
  return balance;
};

const updateBalance = function (playerId, v) {
  if (balance + v > 0) {
    balance = _.round(balance + v, 2);
    return balance
  }
  return "err";
};

module.exports = exports = {
  getBalance,
  updateBalance
};
