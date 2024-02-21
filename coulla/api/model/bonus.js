'use strict';
const _ = require('lodash');

const generalResult = function(id, bet, credit, denom) {

  var result;
  var total = 0;

  switch (id) {
    case "0001":
      result = [];

      for (var i = 0; i < 5; i++) {
        var m = _.sample([1,3,5]);
        result.push(m);
        total += m;
      };
    break;

    case "0002":
      var len = _.sample([10,11,12,13,14,15]);
      result = _.sampleSize([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],len);
      var c = _.countBy(result)
      total = c[0] * (_.defaultTo(c[1], 0) + 1);
    break;

    case "0003":
      result = _.sampleSize([1,2,3,4,5,6,7,8,9],3);
      total = _.sum(result)
    break;
  }

  return {
    bonus_id: id,
    gai_bonus_result: result,
    gi_bonus_total_multiplier:  _.round(total,2),
    gi_bonus_total_credit:  _.round(total * bet * credit,2),
    gi_bonus_total_pay:  _.round(total * bet * credit * denom,2),
  }
}

module.exports = exports = {
  generalResult
};
