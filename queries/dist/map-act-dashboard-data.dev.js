"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _asyncIterator(iterable) { var method; if (typeof Symbol !== "undefined") { if (Symbol.asyncIterator) { method = iterable[Symbol.asyncIterator]; if (method != null) return method.call(iterable); } if (Symbol.iterator) { method = iterable[Symbol.iterator]; if (method != null) return method.call(iterable); } } throw new TypeError("Object is not async iterable"); }

var mongoose = require('mongoose');

var dayjs = require('dayjs');

var localizedFormat = require('dayjs/plugin/localizedFormat');

var advancedFormat = require('dayjs/plugin/advancedFormat');

dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat); // https://day.js.org/docs/en/plugin/localized-format

var _require = require('../config/deals'),
    setCurrency = _require.setCurrency,
    defaultActStats = _require.defaultActStats;

var _require2 = require('../models/personal/index'),
    Account = _require2.Account,
    Application = _require2.Application,
    Report = _require2.Report,
    SubReport = _require2.SubReport,
    ActiveUser = _require2.ActiveUser,
    Payment = _require2.Payment;

var _require3 = require('../utils/quarter-helpers'),
    setPersonalQuarterData = _require3.setPersonalQuarterData;

var _require4 = require('../utils/notifications-functions'),
    createUserNotification = _require4.createUserNotification;

var _require5 = require('../utils/balance-helpers'),
    updatePersonalBalance = _require5.updatePersonalBalance;

var _require6 = require('../utils/quarter-data'),
    getQuarterData = _require6.getQuarterData; // createUserNotification = ({ message, type, belongsTo }) => UserNotification.create({ message, type, belongsTo });


var updateActUserStats = function updateActUserStats(brand, month, date) {
  var arr, processStatsOne;
  return regeneratorRuntime.async(function updateActUserStats$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(ActiveUser.find({
            // only find() users that have at least 1 account in the accounts array or have referred friends
            $or: [{
              'friends.0': {
                $exists: true
              }
            }, {
              'accounts.0': {
                $exists: true
              }
            }]
          }).select('deals friends accounts referredBy'));

        case 2:
          arr = _context4.sent;
          console.log("Processing data for ".concat(arr.length, " activeusers ..."));
          processStatsOne = arr.reduce(function _callee(previousPartner, nextPartner) {
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(previousPartner);

                  case 2:
                    return _context.abrupt("return", setCashback(nextPartner, brand, month));

                  case 3:
                  case "end":
                    return _context.stop();
                }
              }
            });
          }, Promise.resolve());
          console.log('Processing activeuser data [1] ...');
          processStatsOne.then(function () {
            var processStatsTwo = arr.reduce(function _callee2(previousPartner, nextPartner) {
              return regeneratorRuntime.async(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.next = 2;
                      return regeneratorRuntime.awrap(previousPartner);

                    case 2:
                      return _context2.abrupt("return", createUpdateSubReport(nextPartner, brand, month, date));

                    case 3:
                    case "end":
                      return _context2.stop();
                  }
                }
              });
            }, Promise.resolve());
            console.log('Processing activeuser data [2] ...');
            processStatsTwo.then(function () {
              var processStatsThree = arr.reduce(function _callee3(previousPartner, nextPartner) {
                return regeneratorRuntime.async(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.next = 2;
                        return regeneratorRuntime.awrap(previousPartner);

                      case 2:
                        return _context3.abrupt("return", setBalance(nextPartner, brand));

                      case 3:
                      case "end":
                        return _context3.stop();
                    }
                  }
                });
              }, Promise.resolve());
              console.log('Processing activeuser data [3] ...');
              processStatsThree.then(function () {
                return console.log('Completed activeuser data ... ');
              }); // return null to end sequence
            });
          });

        case 7:
        case "end":
          return _context4.stop();
      }
    }
  });
};

var setCashback = function setCashback(_ref, brand, month) {
  var _id = _ref._id,
      deals = _ref.deals,
      referredBy = _ref.referredBy;
  return new Promise(function (resolve) {
    resolve(function _callee5() {
      var rate, reports;
      return regeneratorRuntime.async(function _callee5$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return regeneratorRuntime.awrap(getCashbackRate({
                _id: _id,
                deals: deals,
                brand: brand,
                month: month
              }));

            case 2:
              rate = _context6.sent;
              _context6.next = 5;
              return regeneratorRuntime.awrap(Report.find({
                belongsToActiveUser: _id,
                brand: brand,
                month: month,
                'account.transValue': {
                  $gt: 0
                }
              }).select('account.transValue account.accountId account.commission account.earnedFee').lean());

            case 5:
              reports = _context6.sent;
              _context6.next = 8;
              return regeneratorRuntime.awrap(reports.reduce(function _callee4(previousReport, nextReport) {
                var _nextReport$account, commission, earnedFee, transValue, accountId, cashback, rafCashback, cashbackRate, profit, quarter;

                return regeneratorRuntime.async(function _callee4$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        _context5.next = 2;
                        return regeneratorRuntime.awrap(previousReport);

                      case 2:
                        _nextReport$account = nextReport.account, commission = _nextReport$account.commission, earnedFee = _nextReport$account.earnedFee, transValue = _nextReport$account.transValue, accountId = _nextReport$account.accountId;
                        cashback = earnedFee * rate;
                        rafCashback = referredBy ? cashback * 0.05 : 0;
                        cashbackRate = cashback / transValue;
                        profit = commission - (cashback + rafCashback);

                        if (!(brand === 'Skrill' || brand === 'Neteller')) {
                          _context5.next = 13;
                          break;
                        }

                        _context5.next = 10;
                        return regeneratorRuntime.awrap(getQuarterData({
                          month: month
                        }));

                      case 10:
                        _context5.t0 = _context5.sent.quarter;
                        _context5.next = 14;
                        break;

                      case 13:
                        _context5.t0 = '-';

                      case 14:
                        quarter = _context5.t0;
                        _context5.next = 17;
                        return regeneratorRuntime.awrap(Report.findByIdAndUpdate(nextReport._id, {
                          lastUpdate: Date.now(),
                          'account.cashbackRate': cashbackRate,
                          'account.cashback': cashback,
                          'account.rafCashback': rafCashback,
                          'account.profit': profit,
                          quarter: quarter
                        }, {
                          "new": true,
                          select: 'lastUpdate account.cashbackRate account.accountId account.cashback account.rafCashback account.profit'
                        }).exec());

                      case 17:
                        _context5.next = 19;
                        return regeneratorRuntime.awrap(setPersonalQuarterData({
                          month: month,
                          brand: brand,
                          accountId: accountId
                        }));

                      case 19:
                        return _context5.abrupt("return", new Promise(function (resolve) {
                          return resolve(nextReport);
                        }));

                      case 20:
                      case "end":
                        return _context5.stop();
                    }
                  }
                });
              }, Promise.resolve()));

            case 8:
            case "end":
              return _context6.stop();
          }
        }
      });
    }());
  });
};

var getCashbackRate = function getCashbackRate(_ref2) {
  var _id = _ref2._id,
      deals = _ref2.deals,
      brand = _ref2.brand,
      month = _ref2.month;
  return new Promise(function (resolve) {
    resolve(Promise.all([getReportsVolume({
      _id: _id,
      brand: brand,
      month: month
    }), getSubUserVolume({
      _id: _id,
      brand: brand,
      month: month
    }), deals.find(function (d) {
      return d.brand === brand;
    }).rates]).then(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 3),
          myVol = _ref4[0],
          mySubVol = _ref4[1],
          myDeal = _ref4[2];

      var transValue = myVol + mySubVol;
      return myDeal.reduce(function (acc, deal) {
        return transValue <= deal.maxVol && transValue >= deal.minVol ? (acc += deal.cashback, acc) : acc;
      }, 0);
    })["catch"](function (e) {
      return e;
    }));
  });
};

var getReportsVolume = function getReportsVolume(_ref5) {
  var _id, brand, month, transValue, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, report;

  return regeneratorRuntime.async(function getReportsVolume$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _id = _ref5._id, brand = _ref5.brand, month = _ref5.month;
          // search by month ONLY for all brands
          transValue = 0;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _context7.prev = 4;
          _iterator = _asyncIterator(Report.find({
            belongsToActiveUser: _id,
            brand: brand,
            month: month,
            'account.transValue': {
              $gt: 0
            }
          }).select('account.transValue').lean());

        case 6:
          _context7.next = 8;
          return regeneratorRuntime.awrap(_iterator.next());

        case 8:
          _step = _context7.sent;
          _iteratorNormalCompletion = _step.done;
          _context7.next = 12;
          return regeneratorRuntime.awrap(_step.value);

        case 12:
          _value = _context7.sent;

          if (_iteratorNormalCompletion) {
            _context7.next = 19;
            break;
          }

          report = _value;
          transValue += report.account.transValue;

        case 16:
          _iteratorNormalCompletion = true;
          _context7.next = 6;
          break;

        case 19:
          _context7.next = 25;
          break;

        case 21:
          _context7.prev = 21;
          _context7.t0 = _context7["catch"](4);
          _didIteratorError = true;
          _iteratorError = _context7.t0;

        case 25:
          _context7.prev = 25;
          _context7.prev = 26;

          if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
            _context7.next = 30;
            break;
          }

          _context7.next = 30;
          return regeneratorRuntime.awrap(_iterator["return"]());

        case 30:
          _context7.prev = 30;

          if (!_didIteratorError) {
            _context7.next = 33;
            break;
          }

          throw _iteratorError;

        case 33:
          return _context7.finish(30);

        case 34:
          return _context7.finish(25);

        case 35:
          return _context7.abrupt("return", transValue);

        case 36:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[4, 21, 25, 35], [26,, 30, 34]]);
};

var getSubUserVolume = function getSubUserVolume(_ref6) {
  var _id, brand, month;

  return regeneratorRuntime.async(function getSubUserVolume$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _id = _ref6._id, brand = _ref6.brand, month = _ref6.month;
          return _context9.abrupt("return", Promise.resolve(ActiveUser.find({
            referredBy: _id
          }).select('_id').lean() // get all partners that have BEEN referredBy this activeuser
          .then(function (subUsers) {
            return subUsers.reduce(function _callee6(total, nextSubUser) {
              var acc, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _value2, report;

              return regeneratorRuntime.async(function _callee6$(_context8) {
                while (1) {
                  switch (_context8.prev = _context8.next) {
                    case 0:
                      _context8.next = 2;
                      return regeneratorRuntime.awrap(total);

                    case 2:
                      acc = _context8.sent;
                      _iteratorNormalCompletion2 = true;
                      _didIteratorError2 = false;
                      _context8.prev = 5;
                      _iterator2 = _asyncIterator(Report.find({
                        belongsToActiveUser: nextSubUser._id,
                        brand: brand,
                        month: month,
                        'account.transValue': {
                          $gt: 0
                        }
                      }).select('account.transValue').lean());

                    case 7:
                      _context8.next = 9;
                      return regeneratorRuntime.awrap(_iterator2.next());

                    case 9:
                      _step2 = _context8.sent;
                      _iteratorNormalCompletion2 = _step2.done;
                      _context8.next = 13;
                      return regeneratorRuntime.awrap(_step2.value);

                    case 13:
                      _value2 = _context8.sent;

                      if (_iteratorNormalCompletion2) {
                        _context8.next = 20;
                        break;
                      }

                      report = _value2;
                      acc += report.account.transValue;

                    case 17:
                      _iteratorNormalCompletion2 = true;
                      _context8.next = 7;
                      break;

                    case 20:
                      _context8.next = 26;
                      break;

                    case 22:
                      _context8.prev = 22;
                      _context8.t0 = _context8["catch"](5);
                      _didIteratorError2 = true;
                      _iteratorError2 = _context8.t0;

                    case 26:
                      _context8.prev = 26;
                      _context8.prev = 27;

                      if (!(!_iteratorNormalCompletion2 && _iterator2["return"] != null)) {
                        _context8.next = 31;
                        break;
                      }

                      _context8.next = 31;
                      return regeneratorRuntime.awrap(_iterator2["return"]());

                    case 31:
                      _context8.prev = 31;

                      if (!_didIteratorError2) {
                        _context8.next = 34;
                        break;
                      }

                      throw _iteratorError2;

                    case 34:
                      return _context8.finish(31);

                    case 35:
                      return _context8.finish(26);

                    case 36:
                      return _context8.abrupt("return", acc);

                    case 37:
                    case "end":
                      return _context8.stop();
                  }
                }
              }, null, null, [[5, 22, 26, 36], [27,, 31, 35]]);
            }, Promise.resolve(0));
          })));

        case 2:
        case "end":
          return _context9.stop();
      }
    }
  });
};

var createUpdateSubReport = function createUpdateSubReport(_ref7, brand, month, date) {
  var _id = _ref7._id;
  return new Promise(function (resolve) {
    resolve(function _callee8() {
      var subUsers;
      return regeneratorRuntime.async(function _callee8$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return regeneratorRuntime.awrap(ActiveUser.find({
                referredBy: _id,
                'accounts.0': {
                  $exists: true
                }
              }).select('_id epi'));

            case 2:
              subUsers = _context11.sent;

              if (!(subUsers.length > 0)) {
                _context11.next = 8;
                break;
              }

              _context11.next = 6;
              return regeneratorRuntime.awrap(subUsers.reduce(function _callee7(previousSubUser, nextSubUser) {
                var aggregateReports, _belongsTo, userId, email, _aggregateReports$, deposits, transValue, commission, cashback, rafCashback, cashbackRate, subReport;

                return regeneratorRuntime.async(function _callee7$(_context10) {
                  while (1) {
                    switch (_context10.prev = _context10.next) {
                      case 0:
                        _context10.next = 2;
                        return regeneratorRuntime.awrap(previousSubUser);

                      case 2:
                        _context10.next = 4;
                        return regeneratorRuntime.awrap(Report.aggregate([{
                          $match: {
                            $and: [{
                              belongsToActiveUser: mongoose.Types.ObjectId(nextSubUser._id)
                            }, {
                              brand: brand
                            }, {
                              month: month
                            }, {
                              'account.transValue': {
                                $gt: 0
                              }
                            }]
                          }
                        }, {
                          $project: {
                            'account.cashback': 1,
                            'account.commission': 1,
                            'account.transValue': 1,
                            'account.rafCashback': 1,
                            'account.deposits': 1
                          }
                        }, // selected values to return 1 = true, 0 = false
                        {
                          $group: {
                            _id: null,
                            deposits: {
                              $sum: '$account.deposits'
                            },
                            transValue: {
                              $sum: '$account.transValue'
                            },
                            cashback: {
                              $sum: '$account.cashback'
                            },
                            commission: {
                              $sum: '$account.commission'
                            },
                            rafCashback: {
                              $sum: '$account.rafCashback'
                            }
                          }
                        }]));

                      case 4:
                        aggregateReports = _context10.sent;
                        _context10.next = 7;
                        return regeneratorRuntime.awrap(ActiveUser.findById(nextSubUser._id).select('belongsTo').populate({
                          path: 'belongsTo',
                          select: 'userId email'
                        }));

                      case 7:
                        _belongsTo = _context10.sent.belongsTo;
                        userId = _belongsTo.userId;
                        email = _belongsTo.email;

                        if (!(aggregateReports.length > 0)) {
                          _context10.next = 19;
                          break;
                        }

                        _aggregateReports$ = aggregateReports[0], deposits = _aggregateReports$.deposits, transValue = _aggregateReports$.transValue, commission = _aggregateReports$.commission, cashback = _aggregateReports$.cashback, rafCashback = _aggregateReports$.rafCashback;
                        cashbackRate = cashback / transValue;
                        _context10.next = 15;
                        return regeneratorRuntime.awrap(SubReport.bulkWrite([{
                          updateOne: {
                            filter: {
                              belongsTo: _id,
                              month: month,
                              brand: brand,
                              userId: userId
                            },
                            update: {
                              $set: {
                                date: date,
                                month: month,
                                lastUpdate: Date.now(),
                                userId: userId,
                                email: email,
                                deposits: deposits,
                                transValue: transValue,
                                commission: commission,
                                cashback: cashback,
                                rafCommission: rafCashback,
                                cashbackRate: cashbackRate,
                                currency: setCurrency(brand),
                                belongsTo: _id
                              }
                            },
                            upsert: true // upsert must be placed within updateOne object or every object that is traversed through / https://stackoverflow.com/questions/39988848/trying-to-do-a-bulk-upsert-with-mongoose-whats-the-cleanest-way-to-do-this

                          }
                        }]));

                      case 15:
                        subReport = _context10.sent;
                        return _context10.abrupt("return", new Promise(function (resolve) {
                          return resolve(subReport);
                        }));

                      case 19:
                        return _context10.abrupt("return");

                      case 20:
                      case "end":
                        return _context10.stop();
                    }
                  }
                });
              }, Promise.resolve()));

            case 6:
              _context11.next = 9;
              break;

            case 8:
              return _context11.abrupt("return");

            case 9:
            case "end":
              return _context11.stop();
          }
        }
      });
    }());
  });
};

var setBalance = function setBalance(_ref8, brand) {
  var _id = _ref8._id;
  return new Promise(function (resolve) {
    resolve(function _callee9() {
      return regeneratorRuntime.async(function _callee9$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return regeneratorRuntime.awrap(updatePersonalBalance({
                _id: _id,
                brand: brand
              }));

            case 2:
            case "end":
              return _context12.stop();
          }
        }
      });
    }());
  });
};

module.exports = _defineProperty({
  updateActUserStats: updateActUserStats,
  getCashbackRate: getCashbackRate
}, "getCashbackRate", getCashbackRate);