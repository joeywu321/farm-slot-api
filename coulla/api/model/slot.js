'use strict';

const P = require('bluebird');
const _ = require('lodash');

const totalLine = 20;
const denom = 20;

const row = 5;
const column = 3;

const reel = [
  [92, 3, 2, 91, 8, 1, 4, 91, 4, 94, 1, 7, 90, 1, 8, 91, 5, 3, 7, 4, 90, 2, 5, 3, 8, 1, 5, 8, 1, 92, 94, 1, 91, 1, 90, 1, 1, 8, 92, 3, 8, 91, 5, 6, 1, 7, 94, 3, 4, 2, 91, 7, 92, 91, 7, 2, 1, 2, 92, 8, 1, 8, 92, 90, 4, 91, 3, 8, 2],
  [2, 91, 7, 6, 5, 6, 4, 95, 3, 92, 91, 5, 8, 8, 90, 91, 92, 5, 2, 7, 2, 1, 5, 95, 2, 92, 91, 4, 8, 91, 2, 5, 92, 8, 95, 6, 3, 6, 7, 90, 3, 8, 6, 6, 2, 5],
  [1, 2, 92, 4, 3, 7, 91, 90, 4, 3, 95, 93, 4, 4, 94, 90, 7, 3, 3, 7, 5, 2, 90, 4, 95, 5, 3, 2, 4, 93, 92, 3, 1, 94, 5, 8, 7, 6, 95, 4, 2, 5, 8, 4, 93, 5, 2, 6, 95, 7, 4, 5, 94, 4, 2, 4, 93, 5, 8, 3, 90, 6, 5, 4, 5, 91, 5],
  [8, 8, 5, 4, 7, 90, 2, 3, 95, 1, 92, 93, 1, 90, 8, 95, 2, 7, 3, 90, 90, 4, 3, 90, 2, 90, 93, 4, 91, 95, 3, 3, 2, 5, 3, 91, 3, 92, 5, 90, 2, 3, 3, 4, 3, 95, 90, 1, 90, 93, 6, 2, 3, 7, 90, 6, 2, 90, 6, 91, 8, 92, 4, 91],
  [7, 6, 1, 4, 91, 1, 94, 7, 8, 4, 1, 93, 4, 91, 5, 7, 8, 94, 6, 7, 4, 93, 91, 3, 7, 8, 5, 6, 91, 4, 94, 5, 6, 7, 4, 5, 93, 7, 4, 5, 4, 3, 94, 2, 3, 91, 93, 5, 3, 6, 92, 5, 91, 2, 1, 8, 4, 91, 6, 4, 6, 4, 91, 6, 4, 92, 91, 6, 7, 5, 6, 5, 6, 3, 90, 92]
];

// *** SYMBOL *** //
// 90 : WILD
// 1  : K
// 2  : Q
// 3  : J
// 4  : 豬
// 5  : 高麗菜
// 6  : 土豆
// 7  : 綿羊
// 8  : 辣椒
// 91 : 大蒜
// 92 : FreeSpin

// *** GRID *** //
// 1 4 7 10 13  //
// 2 5 8 11 14  //
// 3 6 9 12 15  //

const wild = {
  symbol: 90
}

const freespin = {
  symbol: 92,
  3: 5,
  4: 10,
  5: 15,
}

const scatter = {
  symbol: 91,
  3: 5,
  4: 10,
  5: 15
}

const bonus = [{
    symbol: 93,
    3: "0001"
  },
  {
    symbol: 94,
    3: "0002"
  },
  {
    symbol: 95,
    3: "0003"
  }
]

const line = {
  1: [2, 5, 8, 11, 14],
  2: [1, 4, 7, 10, 13],
  3: [3, 6, 9, 12, 15],
  4: [1, 5, 9, 11, 13],
  5: [3, 5, 7, 11, 15],
  6: [1, 4, 8, 12, 15],
  7: [3, 6, 8, 10, 13],
  8: [2, 4, 8, 12, 14],
  9: [2, 6, 8, 10, 14],
  10: [1, 5, 8, 11, 15],
  11: [3, 5, 8, 11, 13],
  12: [2, 4, 7, 11, 15],
  13: [2, 6, 9, 11, 13],
  14: [2, 5, 7, 11, 15],
  15: [2, 5, 9, 11, 13],
  16: [1, 4, 8, 12, 14],
  17: [3, 6, 8, 10, 14],
  18: [2, 4, 8, 12, 13],
  19: [2, 6, 8, 10, 15],
  20: [1, 4, 7, 11, 15],
}

const pay = {
  1: [0, 0, 0, 5, 10, 20],
  2: [0, 0, 0, 10, 20, 30],
  3: [0, 0, 0, 15, 30, 50],
  4: [0, 0, 0, 20, 40, 100],
  5: [0, 0, 0, 25, 50, 200],
  6: [0, 0, 0, 30, 100, 300],
  7: [0, 0, 10, 40, 120, 140],
  8: [0, 0, 20, 50, 150, 500],
}

const getDenom = function(gameId) {
  return denom;
}

const generalResult = function(type) {
  var result = [row * column];

  _.each(reel, function(v) {
    var reelid = _.random(0, v.length - 1);
    for (var r = 0; r < column; r++) {
      result.push(v[(reelid + r) % v.length]);
    }
  })

  return result;
}

const checkResult = function(model, result, bet, credit, denom) {
  var winInfo = [];
  var totalwinCredit = 0;
  var freespinTrigger = 0;
  var bonusTrigger = [];

  //check line win
  _.each(line, function(v, k) {

    var reelcount = 0;
    var checker = wild.symbol;

    while (reelcount < row) {
      if (checker == wild.symbol) {
        checker = result[v[reelcount]];
        reelcount++;
      } else if (result[v[reelcount]] == checker || result[v[reelcount]] == wild.symbol) {
        reelcount++;
      } else {
        break;
      }
    }

    if (pay[checker] && pay[checker][reelcount] > 0) {
      console.log(`win ` + checker + ` x` + reelcount);
      winInfo.push({
        gi_winLine: k,
        gi_winLinePay: pay[checker][reelcount] / totalLine * bet * credit,
        gai_winLineSymbols: _.take(v, reelcount),
        gi_winLineMultiplier: 1
      });
      totalwinCredit += pay[checker][reelcount] / totalLine * bet * credit;
    }
  });

  //check scatter win
  var scattercount = _.countBy(result)[scatter.symbol];
  if (scatter[scattercount]) {
    console.log(`win scatter x` + scattercount);
    var pos = [];
    for (var sp = 1; sp <= row * column; sp++) {
      if (result[sp] == scatter.symbol) {
        pos.push(sp);
      }
    }
    winInfo.push({
      gi_winLine: 0,
      gi_winLinePay: scatter[scattercount] * bet * credit,
      gai_winLineSymbols: pos,
      gi_winLineMultiplier: 1
    });

    totalwinCredit += scatter[scattercount] * bet * credit;
  }

  //check freespin win
  var freespincount = _.countBy(result)[freespin.symbol];
  if (freespin[freespincount]) {
    console.log(`win freespin x` + freespincount);
    var pos = [];
    for (var fsp = 1; fsp <= row * column; fsp++) {
      if (result[fsp] == freespin.symbol) {
        pos.push(fsp);
      }
    }
    winInfo.push({
      gi_winLine: 0,
      gi_winLinePay: 0,
      gai_winLineSymbols: pos,
      gi_winLineMultiplier: 1
    });

    freespinTrigger += freespin[freespincount];
  }

  //check bonus win
  _.forEach(bonus, function(bv) {
    var bonusCount = _.countBy(result)[bv.symbol];
    if (bv[bonusCount]) {
      console.log(`win bonus x` + bonusCount + " : bonus id = " + bv[bonusCount]);
      var pos = [];
      for (var bp = 1; bp <= row * column; bp++) {
        if (result[bp] == bv.symbol) {
          pos.push(bp);
        }
      }
      winInfo.push({
        gi_winLine: 0,
        gi_winLinePay: 0,
        gai_winLineSymbols: pos,
        gi_winLineMultiplier: 1
      });

      bonusTrigger.push(bv[bonusCount]);
    }
  });

  return {
    winInfo: winInfo,
    totalwin: _.round(totalwinCredit,2) * denom,
    freespin: freespinTrigger,
    bonus: bonusTrigger
  };
}

module.exports = exports = {
  getDenom,
  generalResult,
  checkResult,
};
