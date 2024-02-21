'use strict';

const testToken = "betbb";

const verifyToken = function (token) {

  if (token == testToken) {
    return {
      playerId:"betbb",
      gameId:"farm"
    };
  }
  return null
};

module.exports = exports = {
  verifyToken
};
