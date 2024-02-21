'use strict';

const config = require('config');
const logger = require('@ikoala/logger');

const initLogger = function() {
  logger.init({
    console: {
      timestamp: function() {
        return (new Date());
      }
    }
  }).replaceConsole();
};

module.exports = exports = {
  initLogger: initLogger
};
