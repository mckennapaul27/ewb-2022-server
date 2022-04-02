"use strict";

var mongoose = require('mongoose');

var _require = require('../models/affiliate'),
    AffPartner = _require.AffPartner;

var _require2 = require('../models/common'),
    User = _require2.User;

var keysToConvertToRegex = ['accountId', 'account.accountId', 'brand', 'paymentAccount', 'email', 'name', 'message', 'upgradeStatus'];
var keysToConvertToMongooseId = ['belongsTo', 'belongsToPartner', 'belongsToActiveUser'];
var populatedFieldQueries = ['partner.epi', 'belongsTo.epi', 'belongsToPartner.epi', 'belongsTo.belongsTo.userId'];

var mapRegexQueryFromObj = function mapRegexQueryFromObj(query) {
  return Object.keys(query).filter(function (key) {
    return !populatedFieldQueries.includes(key);
  }).reduce(function (acc, item) {
    return keysToConvertToRegex.includes(item) ? (acc[item] = new RegExp(query[item]), acc) : (acc[item] = query[item], acc);
  }, {});
};

var mapQueryForPopulate = function mapQueryForPopulate(query) {
  return Object.keys(query).filter(function (key) {
    return populatedFieldQueries.includes(key);
  }).reduce(function (acc, item) {
    return acc[item.slice(item.lastIndexOf('.') + 1)] = query[item], acc;
  }, {});
};

var mapQueryForAggregate = function mapQueryForAggregate(query) {
  var aggregateMap = Object.keys(query).filter(function (key) {
    return !populatedFieldQueries.includes(key);
  }).reduce(function (acc, item) {
    return keysToConvertToMongooseId.includes(item) ? (acc[item] = mongoose.Types.ObjectId(query[item]), acc) : (acc[item] = query[item], acc);
  }, {});
  return mapRegexQueryFromObj(aggregateMap);
};

var isPopulatedValue = function isPopulatedValue(query) {
  return Object.keys(query).some(function (key) {
    return populatedFieldQueries.includes(key);
  });
};

var formatEpi = function formatEpi(epi) {
  return parseInt(epi.split('').map(function (b) {
    return parseInt(b);
  }).filter(function (b) {
    return b || b === 0;
  }).join(''));
};

var getLocaleFromPartnerUser = function getLocaleFromPartnerUser(_id) {
  var partner, _ref, locale;

  return regeneratorRuntime.async(function getLocaleFromPartnerUser$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(AffPartner.findById(_id).select('belongsTo').lean());

        case 2:
          partner = _context.sent;
          _context.next = 5;
          return regeneratorRuntime.awrap(User.findById(partner.belongsTo).select('locale').lean());

        case 5:
          _ref = _context.sent;
          locale = _ref.locale;
          return _context.abrupt("return", locale);

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
}; // const memoryData = process.memoryUsage()
// const memoryUsage = {
//     rss: `${formatMemmoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
//     heapTotal: `${formatMemmoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
//     heapUsed: `${formatMemmoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
//     external: `${formatMemmoryUsage(memoryData.external)} -> V8 external memory`,
// }


module.exports = {
  mapRegexQueryFromObj: mapRegexQueryFromObj,
  mapQueryForAggregate: mapQueryForAggregate,
  isPopulatedValue: isPopulatedValue,
  mapQueryForPopulate: mapQueryForPopulate,
  formatEpi: formatEpi,
  getLocaleFromPartnerUser: getLocaleFromPartnerUser
}; // REGEX ONLY WORKS ON STRINGS - NOT NUMBERS
// https://stackoverflow.com/questions/30722650/mongoose-find-regexp-for-number-type-field
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
// const r = await AffReport.bulkWrite([ // This function does not trigger any middleware, neither save(), nor update(). If you need to trigger save() middleware for every document use create() instead.
//     {
//         updateOne: {
//             filter: { 'account.accountId': accountId, month },
//             update: {
//                 $set: {
//                     date,
//                     month,
//                     lastUpdate,
//                     brand,
//                     siteId,
//                     memberId,
//                     playerId,
//                     country,
//                     // belongsTo: account._id,
//                     // belongsToPartner: account.belongsTo,
//                     account: {
//                         accountId,
//                         deposits,
//                         transValue,
//                         commission,
//                         cashback: 0,
//                         commissionRate: commission / transValue, // need to start storing this in data so that we can access in react-table filters
//                         cashbackRate: 0,
//                         subAffCommission: 0,
//                         earnedFee,
//                         currency: currency ? currency : setCurrency(brand), // this is so we can calculate balances on the aggregation. Very important that we set this according to the brand!!
//                         profit: 0 // need to start storing this in data so that we can access in react-table filters
//                     }
//                 },
//             },
//             upsert: true, // if doesn't exist we create the document
//             new: true
//         }
//     }
// ]);