'use strict';
const crypto = require('crypto');

const genRoundId = function() {
  return crypto.randomBytes(20).toString('hex');
}

const genBetId = function() {
  return crypto.randomBytes(10).toString('hex');
}

module.exports = exports = {
  genRoundId,
  genBetId
};
