'use strict';
const _ = require('lodash');

var moodHistory = []

const getStruct = function() {
  return {
    round_id: 0,
    bet_id: 0,
    player_id: 0,
    status: 0,
    state: "",
    origin_balance: 0,
    bet: 0,
    credit: 0,
    denom: 0,
    total_bet: 0,
    payout: 0,
    winloss: 0,
    info: {},
    bet_time: 0,
    payout_time: 0,
  }
}

const createHistory = function(s) {
  // Step 1: check if round_id, bet_id is already used

  // Step 2: insert record and return transaction id
  moodHistory.push(s)
  return _.findIndex(moodHistory, s)
}

const updateHistory = function(id, s) {
  moodHistory[id] = s;
}

const search = function({bet_id}) {
  return {
    transactionId: _.findIndex(moodHistory, {"bet_id":bet_id}),
    info: _.find(moodHistory, {"bet_id":bet_id})
  }
}

const getHistory = function({startTime, endTime, size, page}) {

  var rs = _.reverse(_.filter(moodHistory, function(o) {
    var sc = startTime > 0? o.bet_time >= startTime: true;
    var ec = endTime > 0? o.bet_time <= endTime: true;
    return sc && ec;
  }));

  var total = rs.length;

  if(page > 0 && size > 0) {
    var start = (page-1) * size;
    rs = _.slice(rs, start, start+size);
  }

  return {
    totalRecord: total,
    gao_history: rs,
  }
}

module.exports = exports = {
  getStruct,
  createHistory,
  updateHistory,
  getHistory,
  search
};
