'use strict';

const util = require('util');

function AppError(code, message) {
  this.code = code;
  this.message = message;
}

util.inherits(AppError, Error);

module.exports = exports = AppError;
