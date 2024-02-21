'use strict';

const c = require('../lib/const');

var moodState = {
  player_id: "betbb",
  model: "math model",
  round_id: 0,
  bet_id: 0,
  status: c.status.DONE,
  p:"base",
  c:"base",
  n:"base",
  symbols: [],
  freespin: 0,
  bonus: [],
  bet: 0,
  credit: 0,
  totalpay: 0,
  saved: {},
  settle: true,
};

const getState = function (playerId) {
  return moodState;
};

const updateState = function (playerId, {round_id, bet_id, status, p, c, n, symbols, freespin, bonus, bet, credit, totalpay, saved, settle}) {

  moodState.round_id = round_id;
  moodState.bet_id = bet_id;
  moodState.status = status;
  moodState.p = p;
  moodState.c = c;
  moodState.n = n;
  moodState.symbols = symbols;
  moodState.freespin = freespin;
  moodState.bonus = bonus;
  moodState.bet = bet;
  moodState.credit = credit;
  moodState.totalpay = totalpay;
  moodState.saved = saved;
  moodState.settle = settle;

  return true;
};

module.exports = exports = {
  getState,
  updateState
};
