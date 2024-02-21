'use strict';

const config = require('config');
const P = require('bluebird');
const _ = require('lodash');
const model = require('../model');
const utils = require('../lib/utils');
const c = require('../lib/const');
const moment = require('moment');


const fail = {
  code: -1
};
const success = function(r) {
  return {
    code: 0,
    msg: "success",
    r: r
  }
}

const Init = function(req, res) {
  console.log(req.body);

  var auth = model.auth.verifyToken(req.body.gameToken);
  if (!auth) {
    res.json(fail);
    return
  }

  var denom = model.slot.getDenom(auth.gameId);
  if (denom != req.body.gn_denom) {
    res.json(fail);
    return
  }

  var state = model.state.getState(auth.playerId);

  // if (state.status != c.status.DONE) {
  //   console.log("Last Game has not done");
  //   res.json(fail);
  //   return
  // }

  var bet = state.bet;
  var credit = state.credit;
  var gai_symbols = state.symbols;
  var rs = model.slot.checkResult("math model", gai_symbols, bet, credit, denom);
  var winInfo = rs.winInfo;
  var freespin = state.freespin;
  var saved = state.saved;
  var totalpay = state.totalpay;
  var p = state.p;
  var curr = state.c;
  var n = state.n;
  var balance = model.balance.getBalance(auth.player_id);

  var feature = {
    freespin: 0,
    bonus: {},
    totalpay: 0,
  }

  feature.freespin = freespin;

  if (curr == c.state.BONUS) {
    feature.bonus = saved;
  }

  if (curr != c.state.BASE) {
    feature.totalpay = totalpay
  }

  var json = {
    gi_bet: bet,
    gn_credit: credit,
    gn_balance: balance,
    go_state: {
      p: p,
      c: curr,
      n: n,
    },
    gai_symbols: gai_symbols,
    gao_winInfo: winInfo,
    go_feature: feature
  }

  res.json(success(json));
}

const Bet = function(req, res) {
  console.log("*******************************************************************");
  console.log(req.body);

  // Step 1: check player token and
  var auth = model.auth.verifyToken(req.body.gameToken);
  if (!auth) {
    console.log("Auth Fail: " + req.body.gameToken);
    res.json(fail);
    return
  }

  // Step 2: check game denom
  var denom = model.slot.getDenom(auth.gameId);
  if (denom != req.body.gn_denom) {
    console.log("Denom Mismatch: " + req.body.gn_denom);
    res.json(fail);
    return
  }

  // Step 3: check bet req params is vaild
  if (!_.isNumber(req.body.gi_bet) || !_.isNumber(req.body.gn_credit)) {
    console.log("Invaild Bet");
    res.json(fail);
    return
  }

  // Step 4: check state
  var state = model.state.getState(auth.playerId);
  if (state.status != c.status.DONE) {
    console.log("Last Game has not done");
    res.json(fail);
    return
  }

  // Step 4: Send API request wallet debit
  var bet;
  var credit;
  var totalBet;

  switch (state.n) {
    case "freespin":
    case "bonus":
      bet = state.bet;
      credit = state.credit;
      totalBet = 0;
      break;
    default:
      bet = req.body.gi_bet;
      credit = req.body.gn_credit;
      totalBet = bet * credit * denom;
  }

  var balanceAB = model.balance.updateBalance(auth.playerId, -1 * totalBet);
  var balanceOG = _.round(balanceAB + totalBet);

  if (balanceAB == "err") {
    res.json(fail);
    return
  }
  console.log("old balance (CNY) -- " + balanceOG);
  console.log("totalBet (CNY) -- " + totalBet);
  console.log("balance after bet (CNY) -- " + balanceAB);

  // Step 5: Insert Bet Record
  var round_id = state.settle ? utils.genRoundId() : state.round_id;
  var bet_id = utils.genBetId();

  var info = model.history.getStruct();
  info.round_id = round_id;
  info.bet_id = bet_id;
  info.player_id = auth.player_id;
  info.status = 0;
  info.state = state.n;
  info.origin_balance = balanceOG;
  info.bet = req.body.gi_bet;
  info.credit = req.body.gn_credit;
  info.denom = denom;
  info.total_bet = totalBet;
  info.bet_time = moment().unix();

  var transactionId = model.history.createHistory(info)

  // Step 6: Gen Bet Result
  var gai_symbols;
  var winInfo;
  var payout;
  var freespin;
  var bonus;
  var saved;

  switch (state.n) {
    case "base":
    case "freespin":
      gai_symbols = model.slot.generalResult(state.n);

      if (req.body.cheat) {
        gai_symbols = req.body.cheat
      }

      var rs = model.slot.checkResult("math model", gai_symbols, bet, credit, denom);
      winInfo = rs.winInfo;
      payout = rs.totalwin;
      freespin = state.freespin + rs.freespin
      bonus = _.concat(state.bonus, rs.bonus);
      saved = {};

      console.log("symbols -- " + gai_symbols);
      console.log("win info -- " + JSON.stringify(winInfo));
      console.log("total win (CNY) -- " + payout);
      break;

    case "bonus":
      gai_symbols = state.symbols;
      var rs = model.slot.checkResult("math model", gai_symbols, bet, credit, denom);
      var nbonus = state.bonus[0];
      var brs = model.bonus.generalResult(nbonus, bet, credit, denom);
      winInfo = rs.winInfo;
      payout = brs.gi_bonus_total_pay;
      freespin = state.freespin;
      bonus = state.bonus;
      saved = brs;
      break;
  }

  payout = _.round(payout,2);

  // Step 7: Update state
  var p;
  var curr;
  var n;
  var status;
  var totalpay;
  var settle;

  p = state.c;
  curr = state.n;

  switch (curr) {
    case c.state.BASE:
      status = c.status.COMPLETE;
      totalpay = payout;
      break;
    case c.state.FREESPIN:
      freespin -= 1;
      status = c.status.COMPLETE;
      totalpay = state.totalpay + payout;
      settle = false;
      break;
    case c.state.BONUS:
      bonus = _.drop(state.bonus);
      status = c.status.PRCOESS;
      totalpay = state.totalpay + payout;
      break;
  }

  totalpay = _.round(totalpay,2);

  if (status == c.status.PRCOESS) {
    n = "";
    settle = false;
  } else if (bonus.length > 0) {
    n = c.state.BONUS;
    settle = false;
  } else if (freespin > 0) {
    n = c.state.FREESPIN;
    settle = false;
  } else {
    n = c.state.BASE;
    settle = true;
  }

  var stateOpts = {
    round_id: round_id,
    bet_id: bet_id,
    status: status,
    p: p,
    c: curr,
    n: n,
    symbols: gai_symbols,
    freespin: freespin,
    bonus: bonus,
    bet: bet,
    credit: credit,
    totalpay: totalpay,
    saved: saved,
    settle: settle,
  }

  model.state.updateState(auth.player_id, stateOpts);

  // Step 8: Prepare json reponse
  var balanceAW = _.round(balanceAB + payout,2);
  var feature = {
    freespin: 0,
    bonus: {},
    totalpay: 0,
  }

  feature.freespin = freespin;

  if (curr == c.state.BONUS) {
    feature.bonus = saved;
    balanceAW = balanceAB;
  }

  if (curr != c.state.BASE) {
    feature.totalpay = totalpay
  }

  var json = {
    gn_balance: balanceAW,
    go_state: {
      p: p,
      c: curr,
      n: n,
    },
    gai_symbols: gai_symbols,
    gao_winInfo: winInfo,
    go_feature: feature
  }

  if (status == c.status.COMPLETE) {
    // Step 9: Send API request wallet credit
    balanceAW = model.balance.updateBalance(auth.playerId, payout);
    json.gn_balance = balanceAW

    // Step 10: Update noticed state
    stateOpts.status = status = c.status.DONE;
    model.state.updateState(auth.player_id, stateOpts);

    // Step 11: Update Bet Record
    info.status = 1;
    info.payout = payout;
    info.winloss = _.round(payout - totalBet,2);
    info.info = json;
    info.payout_time = moment().unix();
    model.history.updateHistory(transactionId, info)

    console.log("new balance (CNY) -- " + balanceAW);
    console.log("has freespin -- " + freespin);
    console.log("has bonus -- " + bonus);
    console.log("next game state -- " + n);
  }

  console.log("*******************************************************************");

  res.json(success(json));
}

const GetBalance = function(req, res) {
  console.log(req.body);

  var auth = model.auth.verifyToken(req.body.gameToken);
  if (!auth) {
    res.json(fail);
    return
  }

  res.json(success({
    gn_balance: model.balance.getBalance(auth.player_id)
  }));
}

const BonusEnd = function(req, res) {
  console.log(req.body);

  var auth = model.auth.verifyToken(req.body.gameToken);
  if (!auth) {
    res.json(fail);
    return
  }

  var denom = model.slot.getDenom(auth.gameId);
  if (denom != req.body.gn_denom) {
    res.json(fail);
    return
  }

  var state = model.state.getState(auth.playerId);
  if (state.c != c.state.BONUS || state.status != c.status.PRCOESS) {
    res.json(fail);
    return
  }

  var round_id = state.round_id;
  var bet_id = state.bet_id;
  var bet = state.bet;
  var credit = state.credit;
  var totalBet = state.totalBet;
  var gai_symbols = state.symbols;
  var rs = model.slot.checkResult("math model", gai_symbols, bet, credit, denom);
  var brs = state.saved;
  var winInfo = rs.winInfo;
  var payout = brs.gi_bonus_total_pay;
  var freespin = state.freespin;
  var bonus = state.bonus;
  var saved = brs;
  var status = c.status.COMPLETE;
  var totalpay = state.totalpay;
  var settle = false;
  var p = state.p;
  var curr = state.c;
  var n;
  var history = model.history.search({
    bet_id
  });

  if (bonus.length > 0) {
    n = c.state.BONUS;
  } else if (freespin > 0) {
    n = c.state.FREESPIN;
  } else {
    n = c.state.BASE;
  }

  var stateOpts = {
    round_id: round_id,
    bet_id: bet_id,
    status: status,
    p: p,
    c: curr,
    n: n,
    symbols: gai_symbols,
    freespin: freespin,
    bonus: bonus,
    bet: bet,
    credit: credit,
    totalpay: totalpay,
    saved: saved,
    settle: settle,
  }

  model.state.updateState(auth.player_id, stateOpts);

  var feature = {
    freespin: 0,
    bonus: {},
    totalpay: 0,
  }

    feature.freespin = freespin;

  if (curr == c.state.BONUS) {
    feature.bonus = saved;
  }

  if (curr != c.state.BASE) {
    feature.totalpay = totalpay
  }

  var json = {
    gn_balance: _.round(history.info.balanceOG - totalBet + payout,2),
    go_state: {
      p: p,
      c: curr,
      n: n,
    },
    gai_symbols: gai_symbols,
    gao_winInfo: winInfo,
    go_feature: feature
  }

  if (status == c.status.COMPLETE) {
    // Step 9: Send API request wallet credit
    var balanceAW = model.balance.updateBalance(auth.playerId, payout);
    json.gn_balance = balanceAW

    // Step 10: Update noticed state
    stateOpts.status = status = c.status.DONE;
    model.state.updateState(auth.player_id, stateOpts);

    // Step 11: Update Bet Record
    history.info.status = 1;
    history.info.payout = payout;
    history.info.winloss = payout;
    history.info.info = json;
    history.info.payout_time = moment().unix();
    model.history.updateHistory(history.transactionId, history.info)

    res.json(success(json));
  }
}

const GetHistory = function(req, res) {

  console.log(req.body);

  var history = model.history.getHistory({
    startTime: _.defaultTo(req.body.start_time, 0),
    endTime: _.defaultTo(req.body.end_time, 0),
    size: _.defaultTo(req.body.size, 0),
    page: _.defaultTo(req.body.page, 0),
  })

  res.json(success(history));
}

const GetState = function(req, res) {
  res.json(success(model.state.getState()));
}

module.exports = exports = {
  initRouter: function(router) {
    router.post('/init', Init);
    router.post('/bet', Bet);
    router.post('/getBalance', GetBalance);
    router.post('/bonusEnd', BonusEnd);
    router.get('/state', GetState);
    router.post('/history', GetHistory);
    // router.use('/notification', middleware.checkIPWhitelist());
  }
};
