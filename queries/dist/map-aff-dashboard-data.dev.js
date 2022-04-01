"use strict";

var _module$exports;

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
    setCurrency = _require.setCurrency;

var _require2 = require('../models/affiliate/index'),
    AffPartner = _require2.AffPartner,
    AffPayment = _require2.AffPayment,
    AffReport = _require2.AffReport,
    AffReportMonthly = _require2.AffReportMonthly,
    AffSubReport = _require2.AffSubReport,
    AffMonthlySummary = _require2.AffMonthlySummary,
    AffAccount = _require2.AffAccount,
    AffReportDaily = _require2.AffReportDaily;

var lucyNetwork = [566, 583, 671, 753, 1099, 3636, 585, 578, 577, 585, 585, 3654, 703, 911, 805];

var _require3 = require('../utils/admin-job-functions'),
    createAdminJob = _require3.createAdminJob;

var _require4 = require('../utils/balance-helpers'),
    updateAffiliateBalance = _require4.updateAffiliateBalance;

var _require5 = require('../utils/quarter-helpers'),
    setAffQuarterData = _require5.setAffQuarterData;

var _require6 = require('../utils/quarter-data'),
    getQuarterData = _require6.getQuarterData;

var updatePartnerStats = function updatePartnerStats(brand, month, date) {
  var arr, processStatsOne;
  return regeneratorRuntime.async(function updatePartnerStats$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          console.log('called here');
          _context6.next = 3;
          return regeneratorRuntime.awrap(AffPartner.find({
            $or: [// only find() partners that have at least 1 account in the accounts array or have referred subpartners
            {
              isSubPartner: true
            }, {
              'accounts.0': {
                $exists: true
              }
            }, {
              _id: '62431271a645744b68016ab7'
            } // testing
            // { epi: 566 },
            // { referredBy: '5e2f053a1172020004798372' }, // this is _id of 566
            ]
          }).select('-accounts -stats -notifications -statistics -subPartners -subAffReports -paymentDetails'));

        case 3:
          arr = _context6.sent;
          processStatsOne = arr.reduce(function _callee(previousPartner, nextPartner) {
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return regeneratorRuntime.awrap(previousPartner);

                  case 2:
                    return _context.abrupt("return", setCashback(nextPartner, brand, month).then(function () {
                      return partnerStatusCheck(nextPartner);
                    }));

                  case 3:
                  case "end":
                    return _context.stop();
                }
              }
            });
          }, Promise.resolve());
          console.log('Processing partner stats [1] ...');
          processStatsOne.then(function () {
            var processStatsTwo = arr.reduce(function _callee2(previousPartner, nextPartner) {
              return regeneratorRuntime.async(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.next = 2;
                      return regeneratorRuntime.awrap(previousPartner);

                    case 2:
                      return _context2.abrupt("return", updateMonthlyReport(nextPartner, brand, month, date));

                    case 3:
                    case "end":
                      return _context2.stop();
                  }
                }
              });
            }, Promise.resolve());
            console.log('Processing partner stats [2] ...');
            processStatsTwo.then(function () {
              var processStatsThree = arr.reduce(function _callee3(previousPartner, nextPartner) {
                return regeneratorRuntime.async(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.next = 2;
                        return regeneratorRuntime.awrap(previousPartner);

                      case 2:
                        return _context3.abrupt("return", createUpdateAffSubReport(nextPartner, brand, month, date));

                      case 3:
                      case "end":
                        return _context3.stop();
                    }
                  }
                });
              }, Promise.resolve());
              console.log('Processing partner stats [3] ...');
              processStatsThree.then(function () {
                var processStatsFour = arr.reduce(function _callee4(previousPartner, nextPartner) {
                  return regeneratorRuntime.async(function _callee4$(_context4) {
                    while (1) {
                      switch (_context4.prev = _context4.next) {
                        case 0:
                          _context4.next = 2;
                          return regeneratorRuntime.awrap(previousPartner);

                        case 2:
                          return _context4.abrupt("return", setAffPartnerBalance(nextPartner));

                        case 3:
                        case "end":
                          return _context4.stop();
                      }
                    }
                  });
                }, Promise.resolve());
                console.log('Processing partner stats [4] ...');
                processStatsFour.then(function () {
                  var processStatsFive = arr.reduce(function _callee5(previousPartner, nextPartner) {
                    return regeneratorRuntime.async(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            _context5.next = 2;
                            return regeneratorRuntime.awrap(previousPartner);

                          case 2:
                            return _context5.abrupt("return", createUpdateAffMonthlySummary(nextPartner, month, date));

                          case 3:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    });
                  }, Promise.resolve());
                  console.log('Processing partner stats [5] ...');
                  processStatsFive.then(function () {
                    console.log('Completed partner data ... ');
                  });
                });
              });
            });
          });

        case 7:
        case "end":
          return _context6.stop();
      }
    }
  });
};

var getSubPartnerRate = function getSubPartnerRate(_ref) {
  var referredBy, rate;
  return regeneratorRuntime.async(function getSubPartnerRate$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          referredBy = _ref.referredBy;

          if (!referredBy) {
            _context7.next = 8;
            break;
          }

          _context7.next = 4;
          return regeneratorRuntime.awrap(AffPartner.findById(referredBy).select('subPartnerRate epi').exec());

        case 4:
          rate = _context7.sent;
          return _context7.abrupt("return", rate);

        case 8:
          return _context7.abrupt("return", 0);

        case 9:
        case "end":
          return _context7.stop();
      }
    }
  });
};

var setCashback = function setCashback(_ref2, brand, month) {
  var _id = _ref2._id,
      deals = _ref2.deals,
      referredBy = _ref2.referredBy,
      revShareActive = _ref2.revShareActive,
      fixedDealActive = _ref2.fixedDealActive,
      epi = _ref2.epi,
      isPermitted = _ref2.isPermitted;
  return new Promise(function (resolve) {
    resolve(function _callee7() {
      var rate, reports, subPartnerRate;
      return regeneratorRuntime.async(function _callee7$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return regeneratorRuntime.awrap(getCashbackRate({
                _id: _id,
                referredBy: referredBy,
                deals: deals,
                brand: brand,
                month: month
              }));

            case 2:
              rate = _context9.sent;
              _context9.next = 5;
              return regeneratorRuntime.awrap(AffReport.find({
                belongsToPartner: _id,
                brand: brand,
                month: month,
                'account.transValue': {
                  $gt: 0
                }
              }).select('account.transValue account.commission account.earnedFee country account.accountId belongsToPartner').lean());

            case 5:
              reports = _context9.sent;
              _context9.next = 8;
              return regeneratorRuntime.awrap(getSubPartnerRate({
                referredBy: referredBy
              }));

            case 8:
              subPartnerRate = _context9.sent.subPartnerRate;
              _context9.next = 11;
              return regeneratorRuntime.awrap(reports.reduce(function _callee6(previousReport, nextReport) {
                var _nextReport$account, transValue, commission, earnedFee, accountId, levels, twentyPercentRate, verifiedRate, cashback, subAffCommission, profit, quarter;

                return regeneratorRuntime.async(function _callee6$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        _context8.next = 2;
                        return regeneratorRuntime.awrap(previousReport);

                      case 2:
                        _nextReport$account = nextReport.account, transValue = _nextReport$account.transValue, commission = _nextReport$account.commission, earnedFee = _nextReport$account.earnedFee, accountId = _nextReport$account.accountId;

                        levels = function levels(twentyPercentRate, c) {
                          if (nextReport.country === 'IN' || // If the report country is IN or BD return 0;
                          nextReport.country === 'BD') return 0;
                          if (c === 0) return 0;else if (revShareActive) return rate; // if revShareActive, just return rate like 25% or 27.5%
                          else if (fixedDealActive['isActive']) return fixedDealActive['rate']; // if fixed deal active return the rate. Have put it in ['rate'] just in case in passes rate from function param
                            else if (twentyPercentRate < 0.005 && rate >= 0.005) return twentyPercentRate;else if (twentyPercentRate < 0.0039) return twentyPercentRate;else return rate;
                        };

                        twentyPercentRate = earnedFee / 5 / transValue;
                        verifiedRate = brand === 'Skrill' || brand === 'Neteller' ? levels(twentyPercentRate, commission) : rate;
                        cashback = revShareActive ? earnedFee * verifiedRate : transValue * verifiedRate;
                        subAffCommission = referredBy ? twentyPercentRate < 0.005 && rate >= 0.005 ? cashback * 0.05 : cashback * subPartnerRate : 0;
                        profit = commission - (subAffCommission + cashback);

                        if (!(brand === 'Skrill' || brand === 'Neteller')) {
                          _context8.next = 15;
                          break;
                        }

                        _context8.next = 12;
                        return regeneratorRuntime.awrap(getQuarterData({
                          month: month
                        }));

                      case 12:
                        _context8.t0 = _context8.sent.quarter;
                        _context8.next = 16;
                        break;

                      case 15:
                        _context8.t0 = '-';

                      case 16:
                        quarter = _context8.t0;
                        _context8.next = 19;
                        return regeneratorRuntime.awrap(AffReport.findByIdAndUpdate(nextReport._id, {
                          lastUpdate: Date.now(),
                          'account.cashbackRate': verifiedRate,
                          'account.cashback': cashback,
                          'account.subAffCommission': subAffCommission,
                          'account.profit': profit,
                          comment: nextReport.country === 'IN' || nextReport.country === 'BD' ? 'IN & BD accounts not eligible for commission' : '',
                          quarter: quarter
                        }, {
                          "new": true
                        }).exec());

                      case 19:
                        _context8.next = 21;
                        return regeneratorRuntime.awrap(setAffQuarterData({
                          month: month,
                          brand: brand,
                          accountId: accountId,
                          _id: nextReport.belongsToPartner
                        }));

                      case 21:
                        return _context8.abrupt("return", new Promise(function (resolve) {
                          return resolve(nextReport);
                        }));

                      case 22:
                      case "end":
                        return _context8.stop();
                    }
                  }
                });
              }, Promise.resolve()));

            case 11:
            case "end":
              return _context9.stop();
          }
        }
      });
    }());
  });
};

var getCashbackRate = function getCashbackRate(_ref3) {
  var _id = _ref3._id,
      referredBy = _ref3.referredBy,
      deals = _ref3.deals,
      isSubPartner = _ref3.isSubPartner,
      brand = _ref3.brand,
      month = _ref3.month;
  return new Promise(function (resolve) {
    resolve(Promise.all([getReportsVolume({
      _id: _id,
      month: month
    }), getNetworkShareVolume({
      referredBy: referredBy,
      month: month
    }), getSubPartnerVolume({
      _id: _id,
      isSubPartner: isSubPartner,
      month: month
    }), deals.find(function (d) {
      return d.brand === brand;
    }).rates]).then(function (_ref4) {
      var _ref5 = _slicedToArray(_ref4, 4),
          myVol = _ref5[0],
          myNetworkVol = _ref5[1],
          mySubVol = _ref5[2],
          myDeal = _ref5[3];

      var transValue = myVol + myNetworkVol + mySubVol;
      return myDeal.reduce(function (acc, deal) {
        return transValue <= deal.maxVol && transValue >= deal.minVol ? (acc += deal.cashback, acc) : acc;
      }, 0);
    })["catch"](function (e) {
      return e;
    }));
  });
};

var getReportsVolume = function getReportsVolume(_ref6) {
  var _id, month, transValue, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, report;

  return regeneratorRuntime.async(function getReportsVolume$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _id = _ref6._id, month = _ref6.month;
          // search by month ONLY for all brands
          transValue = 0;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _context10.prev = 4;
          _iterator = _asyncIterator(AffReport.find({
            belongsToPartner: _id,
            month: month,
            'account.transValue': {
              $gt: 0
            }
          }).select('account.transValue').lean());

        case 6:
          _context10.next = 8;
          return regeneratorRuntime.awrap(_iterator.next());

        case 8:
          _step = _context10.sent;
          _iteratorNormalCompletion = _step.done;
          _context10.next = 12;
          return regeneratorRuntime.awrap(_step.value);

        case 12:
          _value = _context10.sent;

          if (_iteratorNormalCompletion) {
            _context10.next = 19;
            break;
          }

          report = _value;
          transValue += report.account.transValue;

        case 16:
          _iteratorNormalCompletion = true;
          _context10.next = 6;
          break;

        case 19:
          _context10.next = 25;
          break;

        case 21:
          _context10.prev = 21;
          _context10.t0 = _context10["catch"](4);
          _didIteratorError = true;
          _iteratorError = _context10.t0;

        case 25:
          _context10.prev = 25;
          _context10.prev = 26;

          if (!(!_iteratorNormalCompletion && _iterator["return"] != null)) {
            _context10.next = 30;
            break;
          }

          _context10.next = 30;
          return regeneratorRuntime.awrap(_iterator["return"]());

        case 30:
          _context10.prev = 30;

          if (!_didIteratorError) {
            _context10.next = 33;
            break;
          }

          throw _iteratorError;

        case 33:
          return _context10.finish(30);

        case 34:
          return _context10.finish(25);

        case 35:
          return _context10.abrupt("return", transValue);

        case 36:
        case "end":
          return _context10.stop();
      }
    }
  }, null, null, [[4, 21, 25, 35], [26,, 30, 34]]);
};

var getNetworkShareVolume = function getNetworkShareVolume(_ref7) {
  var referredBy = _ref7.referredBy,
      month = _ref7.month;

  if (referredBy) {
    return new Promise(function (resolve) {
      resolve(AffPartner.find({
        referredBy: referredBy
      }).select('_id').lean() // get all partners that have the SAME referredBy as this partner
      .then(function (partnersReferredBySameNetwork) {
        return partnersReferredBySameNetwork.reduce(function _callee8(total, nextPartner) {
          var acc, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _value2, report;

          return regeneratorRuntime.async(function _callee8$(_context11) {
            while (1) {
              switch (_context11.prev = _context11.next) {
                case 0:
                  _context11.next = 2;
                  return regeneratorRuntime.awrap(total);

                case 2:
                  acc = _context11.sent;
                  _iteratorNormalCompletion2 = true;
                  _didIteratorError2 = false;
                  _context11.prev = 5;
                  _iterator2 = _asyncIterator(AffReport.find({
                    belongsToPartner: nextPartner._id,
                    month: month,
                    'account.transValue': {
                      $gt: 0
                    }
                  }).select('account.transValue').lean());

                case 7:
                  _context11.next = 9;
                  return regeneratorRuntime.awrap(_iterator2.next());

                case 9:
                  _step2 = _context11.sent;
                  _iteratorNormalCompletion2 = _step2.done;
                  _context11.next = 13;
                  return regeneratorRuntime.awrap(_step2.value);

                case 13:
                  _value2 = _context11.sent;

                  if (_iteratorNormalCompletion2) {
                    _context11.next = 20;
                    break;
                  }

                  report = _value2;
                  acc += report.account.transValue;

                case 17:
                  _iteratorNormalCompletion2 = true;
                  _context11.next = 7;
                  break;

                case 20:
                  _context11.next = 26;
                  break;

                case 22:
                  _context11.prev = 22;
                  _context11.t0 = _context11["catch"](5);
                  _didIteratorError2 = true;
                  _iteratorError2 = _context11.t0;

                case 26:
                  _context11.prev = 26;
                  _context11.prev = 27;

                  if (!(!_iteratorNormalCompletion2 && _iterator2["return"] != null)) {
                    _context11.next = 31;
                    break;
                  }

                  _context11.next = 31;
                  return regeneratorRuntime.awrap(_iterator2["return"]());

                case 31:
                  _context11.prev = 31;

                  if (!_didIteratorError2) {
                    _context11.next = 34;
                    break;
                  }

                  throw _iteratorError2;

                case 34:
                  return _context11.finish(31);

                case 35:
                  return _context11.finish(26);

                case 36:
                  return _context11.abrupt("return", acc);

                case 37:
                case "end":
                  return _context11.stop();
              }
            }
          }, null, null, [[5, 22, 26, 36], [27,, 31, 35]]);
        }, Promise.resolve(0));
      }));
    });
  } else return 0;
};

var getSubPartnerVolume = function getSubPartnerVolume(_ref8) {
  var _id = _ref8._id,
      month = _ref8.month,
      isSubPartner = _ref8.isSubPartner;

  if (isSubPartner) {
    return new Promise(function (resolve) {
      resolve(AffPartner.find({
        referredBy: _id
      }).select('_id').lean() // get all partners that have BEEN referredBy this partner
      .then(function (subPartners) {
        return subPartners.reduce(function _callee9(total, nextSubPartner) {
          var acc, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _value3, report;

          return regeneratorRuntime.async(function _callee9$(_context12) {
            while (1) {
              switch (_context12.prev = _context12.next) {
                case 0:
                  _context12.next = 2;
                  return regeneratorRuntime.awrap(total);

                case 2:
                  acc = _context12.sent;
                  _iteratorNormalCompletion3 = true;
                  _didIteratorError3 = false;
                  _context12.prev = 5;
                  _iterator3 = _asyncIterator(AffReport.find({
                    belongsToPartner: nextSubPartner._id,
                    month: month,
                    'account.transValue': {
                      $gt: 0
                    }
                  }).select('account.transValue').lean());

                case 7:
                  _context12.next = 9;
                  return regeneratorRuntime.awrap(_iterator3.next());

                case 9:
                  _step3 = _context12.sent;
                  _iteratorNormalCompletion3 = _step3.done;
                  _context12.next = 13;
                  return regeneratorRuntime.awrap(_step3.value);

                case 13:
                  _value3 = _context12.sent;

                  if (_iteratorNormalCompletion3) {
                    _context12.next = 20;
                    break;
                  }

                  report = _value3;
                  acc += report.account.transValue;

                case 17:
                  _iteratorNormalCompletion3 = true;
                  _context12.next = 7;
                  break;

                case 20:
                  _context12.next = 26;
                  break;

                case 22:
                  _context12.prev = 22;
                  _context12.t0 = _context12["catch"](5);
                  _didIteratorError3 = true;
                  _iteratorError3 = _context12.t0;

                case 26:
                  _context12.prev = 26;
                  _context12.prev = 27;

                  if (!(!_iteratorNormalCompletion3 && _iterator3["return"] != null)) {
                    _context12.next = 31;
                    break;
                  }

                  _context12.next = 31;
                  return regeneratorRuntime.awrap(_iterator3["return"]());

                case 31:
                  _context12.prev = 31;

                  if (!_didIteratorError3) {
                    _context12.next = 34;
                    break;
                  }

                  throw _iteratorError3;

                case 34:
                  return _context12.finish(31);

                case 35:
                  return _context12.finish(26);

                case 36:
                  return _context12.abrupt("return", acc);

                case 37:
                case "end":
                  return _context12.stop();
              }
            }
          }, null, null, [[5, 22, 26, 36], [27,, 31, 35]]);
        }, Promise.resolve(0));
      }));
    });
  } else return 0;
};

var updateMonthlyReport = function updateMonthlyReport(_ref9, brand, month, date) {
  var _id = _ref9._id,
      referredBy = _ref9.referredBy,
      deals = _ref9.deals;
  return new Promise(function (resolve) {
    resolve(function _callee10() {
      var rate, transValue, commission, cashback, subAffCommission, commissionRate, profit, existingReport;
      return regeneratorRuntime.async(function _callee10$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return regeneratorRuntime.awrap(getCashbackRate({
                _id: _id,
                referredBy: referredBy,
                deals: deals,
                brand: brand,
                month: month
              }));

            case 2:
              rate = _context13.sent;
              _context13.next = 5;
              return regeneratorRuntime.awrap(getVolumeByBrand({
                _id: _id
              }, brand, month));

            case 5:
              transValue = _context13.sent;
              _context13.next = 8;
              return regeneratorRuntime.awrap(getCommissionByBrand({
                _id: _id
              }, brand, month));

            case 8:
              commission = _context13.sent;
              _context13.next = 11;
              return regeneratorRuntime.awrap(getCashBackByBrand({
                _id: _id
              }, brand, month));

            case 11:
              cashback = _context13.sent;
              _context13.next = 14;
              return regeneratorRuntime.awrap(getSubAffCommissionByBrand({
                _id: _id
              }, brand, month));

            case 14:
              subAffCommission = _context13.sent;
              commissionRate = commission / transValue;
              profit = commission - (cashback + subAffCommission);

              if (!(transValue > 0)) {
                _context13.next = 30;
                break;
              }

              _context13.next = 20;
              return regeneratorRuntime.awrap(AffReportMonthly.findOne({
                belongsTo: _id,
                month: month,
                brand: brand
              }).select('_id').lean());

            case 20:
              existingReport = _context13.sent;

              if (!existingReport) {
                _context13.next = 26;
                break;
              }

              _context13.next = 24;
              return regeneratorRuntime.awrap(AffReportMonthly.findByIdAndUpdate(existingReport._id, {
                lastUpdate: Date.now(),
                transValue: transValue,
                commission: commission,
                commissionRate: commissionRate,
                cashback: cashback,
                cashbackRate: rate,
                subAffCommission: subAffCommission,
                profit: profit
              }, {
                "new": true
              }));

            case 24:
              _context13.next = 28;
              break;

            case 26:
              _context13.next = 28;
              return regeneratorRuntime.awrap(AffReportMonthly.create({
                date: date,
                month: month,
                brand: brand,
                lastUpdate: Date.now(),
                transValue: transValue,
                commission: commission,
                commissionRate: commissionRate,
                cashback: cashback,
                cashbackRate: rate,
                subAffCommission: subAffCommission,
                belongsTo: _id,
                profit: profit
              }));

            case 28:
              _context13.next = 31;
              break;

            case 30:
              return _context13.abrupt("return");

            case 31:
            case "end":
              return _context13.stop();
          }
        }
      });
    }());
  });
};

var getCashBackByBrand = function getCashBackByBrand(_ref10, brand, month) {
  var _id, cashback, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _value4, report;

  return regeneratorRuntime.async(function getCashBackByBrand$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          _id = _ref10._id;
          cashback = 0;
          _iteratorNormalCompletion4 = true;
          _didIteratorError4 = false;
          _context14.prev = 4;
          _iterator4 = _asyncIterator(AffReport.find({
            belongsToPartner: _id,
            brand: brand,
            month: month,
            'account.transValue': {
              $gt: 0
            }
          }).select('account.cashback').lean());

        case 6:
          _context14.next = 8;
          return regeneratorRuntime.awrap(_iterator4.next());

        case 8:
          _step4 = _context14.sent;
          _iteratorNormalCompletion4 = _step4.done;
          _context14.next = 12;
          return regeneratorRuntime.awrap(_step4.value);

        case 12:
          _value4 = _context14.sent;

          if (_iteratorNormalCompletion4) {
            _context14.next = 19;
            break;
          }

          report = _value4;
          cashback += report.account.cashback;

        case 16:
          _iteratorNormalCompletion4 = true;
          _context14.next = 6;
          break;

        case 19:
          _context14.next = 25;
          break;

        case 21:
          _context14.prev = 21;
          _context14.t0 = _context14["catch"](4);
          _didIteratorError4 = true;
          _iteratorError4 = _context14.t0;

        case 25:
          _context14.prev = 25;
          _context14.prev = 26;

          if (!(!_iteratorNormalCompletion4 && _iterator4["return"] != null)) {
            _context14.next = 30;
            break;
          }

          _context14.next = 30;
          return regeneratorRuntime.awrap(_iterator4["return"]());

        case 30:
          _context14.prev = 30;

          if (!_didIteratorError4) {
            _context14.next = 33;
            break;
          }

          throw _iteratorError4;

        case 33:
          return _context14.finish(30);

        case 34:
          return _context14.finish(25);

        case 35:
          return _context14.abrupt("return", cashback);

        case 36:
        case "end":
          return _context14.stop();
      }
    }
  }, null, null, [[4, 21, 25, 35], [26,, 30, 34]]);
};

var getCommissionByBrand = function getCommissionByBrand(_ref11, brand, month) {
  var _id, commission, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _value5, report;

  return regeneratorRuntime.async(function getCommissionByBrand$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          _id = _ref11._id;
          commission = 0;
          _iteratorNormalCompletion5 = true;
          _didIteratorError5 = false;
          _context15.prev = 4;
          _iterator5 = _asyncIterator(AffReport.find({
            belongsToPartner: _id,
            brand: brand,
            month: month,
            'account.transValue': {
              $gt: 0
            }
          }).select('account.commission').lean());

        case 6:
          _context15.next = 8;
          return regeneratorRuntime.awrap(_iterator5.next());

        case 8:
          _step5 = _context15.sent;
          _iteratorNormalCompletion5 = _step5.done;
          _context15.next = 12;
          return regeneratorRuntime.awrap(_step5.value);

        case 12:
          _value5 = _context15.sent;

          if (_iteratorNormalCompletion5) {
            _context15.next = 19;
            break;
          }

          report = _value5;
          commission += report.account.commission;

        case 16:
          _iteratorNormalCompletion5 = true;
          _context15.next = 6;
          break;

        case 19:
          _context15.next = 25;
          break;

        case 21:
          _context15.prev = 21;
          _context15.t0 = _context15["catch"](4);
          _didIteratorError5 = true;
          _iteratorError5 = _context15.t0;

        case 25:
          _context15.prev = 25;
          _context15.prev = 26;

          if (!(!_iteratorNormalCompletion5 && _iterator5["return"] != null)) {
            _context15.next = 30;
            break;
          }

          _context15.next = 30;
          return regeneratorRuntime.awrap(_iterator5["return"]());

        case 30:
          _context15.prev = 30;

          if (!_didIteratorError5) {
            _context15.next = 33;
            break;
          }

          throw _iteratorError5;

        case 33:
          return _context15.finish(30);

        case 34:
          return _context15.finish(25);

        case 35:
          return _context15.abrupt("return", commission);

        case 36:
        case "end":
          return _context15.stop();
      }
    }
  }, null, null, [[4, 21, 25, 35], [26,, 30, 34]]);
};

var getVolumeByBrand = function getVolumeByBrand(_ref12, brand, month) {
  var _id, transValue, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _value6, report;

  return regeneratorRuntime.async(function getVolumeByBrand$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          _id = _ref12._id;
          transValue = 0;
          _iteratorNormalCompletion6 = true;
          _didIteratorError6 = false;
          _context16.prev = 4;
          _iterator6 = _asyncIterator(AffReport.find({
            belongsToPartner: _id,
            brand: brand,
            month: month,
            'account.transValue': {
              $gt: 0
            }
          }).select('account.transValue').lean());

        case 6:
          _context16.next = 8;
          return regeneratorRuntime.awrap(_iterator6.next());

        case 8:
          _step6 = _context16.sent;
          _iteratorNormalCompletion6 = _step6.done;
          _context16.next = 12;
          return regeneratorRuntime.awrap(_step6.value);

        case 12:
          _value6 = _context16.sent;

          if (_iteratorNormalCompletion6) {
            _context16.next = 19;
            break;
          }

          report = _value6;
          transValue += report.account.transValue;

        case 16:
          _iteratorNormalCompletion6 = true;
          _context16.next = 6;
          break;

        case 19:
          _context16.next = 25;
          break;

        case 21:
          _context16.prev = 21;
          _context16.t0 = _context16["catch"](4);
          _didIteratorError6 = true;
          _iteratorError6 = _context16.t0;

        case 25:
          _context16.prev = 25;
          _context16.prev = 26;

          if (!(!_iteratorNormalCompletion6 && _iterator6["return"] != null)) {
            _context16.next = 30;
            break;
          }

          _context16.next = 30;
          return regeneratorRuntime.awrap(_iterator6["return"]());

        case 30:
          _context16.prev = 30;

          if (!_didIteratorError6) {
            _context16.next = 33;
            break;
          }

          throw _iteratorError6;

        case 33:
          return _context16.finish(30);

        case 34:
          return _context16.finish(25);

        case 35:
          return _context16.abrupt("return", transValue);

        case 36:
        case "end":
          return _context16.stop();
      }
    }
  }, null, null, [[4, 21, 25, 35], [26,, 30, 34]]);
};

var getSubAffCommissionByBrand = function getSubAffCommissionByBrand(_ref13, brand, month) {
  var _id, subAffCommission, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, _value7, report;

  return regeneratorRuntime.async(function getSubAffCommissionByBrand$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          _id = _ref13._id;
          subAffCommission = 0;
          _iteratorNormalCompletion7 = true;
          _didIteratorError7 = false;
          _context17.prev = 4;
          _iterator7 = _asyncIterator(AffReport.find({
            belongsToPartner: _id,
            brand: brand,
            month: month,
            'account.transValue': {
              $gt: 0
            }
          }).select('account.subAffCommission').lean());

        case 6:
          _context17.next = 8;
          return regeneratorRuntime.awrap(_iterator7.next());

        case 8:
          _step7 = _context17.sent;
          _iteratorNormalCompletion7 = _step7.done;
          _context17.next = 12;
          return regeneratorRuntime.awrap(_step7.value);

        case 12:
          _value7 = _context17.sent;

          if (_iteratorNormalCompletion7) {
            _context17.next = 19;
            break;
          }

          report = _value7;
          subAffCommission += report.account.subAffCommission;

        case 16:
          _iteratorNormalCompletion7 = true;
          _context17.next = 6;
          break;

        case 19:
          _context17.next = 25;
          break;

        case 21:
          _context17.prev = 21;
          _context17.t0 = _context17["catch"](4);
          _didIteratorError7 = true;
          _iteratorError7 = _context17.t0;

        case 25:
          _context17.prev = 25;
          _context17.prev = 26;

          if (!(!_iteratorNormalCompletion7 && _iterator7["return"] != null)) {
            _context17.next = 30;
            break;
          }

          _context17.next = 30;
          return regeneratorRuntime.awrap(_iterator7["return"]());

        case 30:
          _context17.prev = 30;

          if (!_didIteratorError7) {
            _context17.next = 33;
            break;
          }

          throw _iteratorError7;

        case 33:
          return _context17.finish(30);

        case 34:
          return _context17.finish(25);

        case 35:
          return _context17.abrupt("return", subAffCommission);

        case 36:
        case "end":
          return _context17.stop();
      }
    }
  }, null, null, [[4, 21, 25, 35], [26,, 30, 34]]);
};

var createUpdateAffSubReport = function createUpdateAffSubReport(_ref14, brand, month, date) {
  var _id = _ref14._id;
  return new Promise(function (resolve) {
    resolve(function _callee12() {
      var subPartners;
      return regeneratorRuntime.async(function _callee12$(_context19) {
        while (1) {
          switch (_context19.prev = _context19.next) {
            case 0:
              _context19.next = 2;
              return regeneratorRuntime.awrap(AffPartner.find({
                referredBy: _id,
                'accounts.0': {
                  $exists: true
                }
              }).select('_id epi'));

            case 2:
              subPartners = _context19.sent;

              if (!(subPartners.length > 0)) {
                _context19.next = 8;
                break;
              }

              _context19.next = 6;
              return regeneratorRuntime.awrap(subPartners.reduce(function _callee11(previousSubPartner, nextSubPartner) {
                var aggregateReports, _aggregateReports$, deposits, transValue, commission, cashback, subAffCommission, cashbackRate, subReport;

                return regeneratorRuntime.async(function _callee11$(_context18) {
                  while (1) {
                    switch (_context18.prev = _context18.next) {
                      case 0:
                        _context18.next = 2;
                        return regeneratorRuntime.awrap(previousSubPartner);

                      case 2:
                        _context18.next = 4;
                        return regeneratorRuntime.awrap(AffReport.aggregate([{
                          $match: {
                            $and: [{
                              belongsToPartner: mongoose.Types.ObjectId(nextSubPartner._id)
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
                            'account.subAffCommission': 1,
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
                            subAffCommission: {
                              $sum: '$account.subAffCommission'
                            }
                          }
                        }]));

                      case 4:
                        aggregateReports = _context18.sent;

                        if (!(aggregateReports.length > 0)) {
                          _context18.next = 14;
                          break;
                        }

                        _aggregateReports$ = aggregateReports[0], deposits = _aggregateReports$.deposits, transValue = _aggregateReports$.transValue, commission = _aggregateReports$.commission, cashback = _aggregateReports$.cashback, subAffCommission = _aggregateReports$.subAffCommission;
                        cashbackRate = cashback / transValue;
                        _context18.next = 10;
                        return regeneratorRuntime.awrap(AffSubReport.bulkWrite([{
                          updateOne: {
                            filter: {
                              belongsTo: _id,
                              month: month,
                              brand: brand,
                              epi: nextSubPartner.epi
                            },
                            update: {
                              $set: {
                                date: date,
                                month: month,
                                lastUpdate: Date.now(),
                                brand: brand,
                                epi: nextSubPartner.epi,
                                deposits: deposits,
                                transValue: transValue,
                                commission: commission,
                                cashback: cashback,
                                subAffCommission: subAffCommission,
                                cashbackRate: cashbackRate,
                                currency: setCurrency(brand),
                                belongsTo: _id
                              }
                            },
                            upsert: true // upsert must be placed within updateOne object or every object that is traversed through / https://stackoverflow.com/questions/39988848/trying-to-do-a-bulk-upsert-with-mongoose-whats-the-cleanest-way-to-do-this

                          }
                        }]));

                      case 10:
                        subReport = _context18.sent;
                        return _context18.abrupt("return", new Promise(function (resolve) {
                          return resolve(subReport);
                        }));

                      case 14:
                        return _context18.abrupt("return");

                      case 15:
                      case "end":
                        return _context18.stop();
                    }
                  }
                });
              }, Promise.resolve()));

            case 6:
              _context19.next = 9;
              break;

            case 8:
              return _context19.abrupt("return");

            case 9:
            case "end":
              return _context19.stop();
          }
        }
      });
    }());
  });
};

var setAffPartnerBalance = function setAffPartnerBalance(_ref15) {
  var _id = _ref15._id;
  return new Promise(function (resolve) {
    resolve(function _callee13() {
      return regeneratorRuntime.async(function _callee13$(_context20) {
        while (1) {
          switch (_context20.prev = _context20.next) {
            case 0:
              _context20.next = 2;
              return regeneratorRuntime.awrap(updateAffiliateBalance({
                _id: _id
              }));

            case 2:
            case "end":
              return _context20.stop();
          }
        }
      });
    }());
  });
};

var partnerStatusCheck = function partnerStatusCheck(_ref16) {
  var _id = _ref16._id,
      isSubPartner = _ref16.isSubPartner,
      isOfficialPartner = _ref16.isOfficialPartner,
      referredBy = _ref16.referredBy,
      epi = _ref16.epi;
  return new Promise(function (resolve) {
    resolve(function _callee16() {
      var subPartners, myVol, subVol, total, isSub, isOfficial;
      return regeneratorRuntime.async(function _callee16$(_context23) {
        while (1) {
          switch (_context23.prev = _context23.next) {
            case 0:
              if (!(!isSubPartner || !isOfficialPartner)) {
                _context23.next = 26;
                break;
              }

              _context23.next = 3;
              return regeneratorRuntime.awrap(AffPartner.find({
                referredBy: _id
              }).select('_id').lean());

            case 3:
              subPartners = _context23.sent;
              _context23.next = 6;
              return regeneratorRuntime.awrap(function _callee14() {
                var transValue, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, _value8, report;

                return regeneratorRuntime.async(function _callee14$(_context21) {
                  while (1) {
                    switch (_context21.prev = _context21.next) {
                      case 0:
                        transValue = 0;
                        _iteratorNormalCompletion8 = true;
                        _didIteratorError8 = false;
                        _context21.prev = 3;
                        _iterator8 = _asyncIterator(AffReport.find({
                          belongsToPartner: _id,
                          'account.transValue': {
                            $gt: 0
                          }
                        }).select('account.transValue').lean());

                      case 5:
                        _context21.next = 7;
                        return regeneratorRuntime.awrap(_iterator8.next());

                      case 7:
                        _step8 = _context21.sent;
                        _iteratorNormalCompletion8 = _step8.done;
                        _context21.next = 11;
                        return regeneratorRuntime.awrap(_step8.value);

                      case 11:
                        _value8 = _context21.sent;

                        if (_iteratorNormalCompletion8) {
                          _context21.next = 18;
                          break;
                        }

                        report = _value8;
                        transValue += report.account.transValue;

                      case 15:
                        _iteratorNormalCompletion8 = true;
                        _context21.next = 5;
                        break;

                      case 18:
                        _context21.next = 24;
                        break;

                      case 20:
                        _context21.prev = 20;
                        _context21.t0 = _context21["catch"](3);
                        _didIteratorError8 = true;
                        _iteratorError8 = _context21.t0;

                      case 24:
                        _context21.prev = 24;
                        _context21.prev = 25;

                        if (!(!_iteratorNormalCompletion8 && _iterator8["return"] != null)) {
                          _context21.next = 29;
                          break;
                        }

                        _context21.next = 29;
                        return regeneratorRuntime.awrap(_iterator8["return"]());

                      case 29:
                        _context21.prev = 29;

                        if (!_didIteratorError8) {
                          _context21.next = 32;
                          break;
                        }

                        throw _iteratorError8;

                      case 32:
                        return _context21.finish(29);

                      case 33:
                        return _context21.finish(24);

                      case 34:
                        return _context21.abrupt("return", transValue);

                      case 35:
                      case "end":
                        return _context21.stop();
                    }
                  }
                }, null, null, [[3, 20, 24, 34], [25,, 29, 33]]);
              }());

            case 6:
              myVol = _context23.sent;
              _context23.next = 9;
              return regeneratorRuntime.awrap(subPartners.reduce(function _callee15(total, nextSubPartner) {
                var acc, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, _value9, report;

                return regeneratorRuntime.async(function _callee15$(_context22) {
                  while (1) {
                    switch (_context22.prev = _context22.next) {
                      case 0:
                        _context22.next = 2;
                        return regeneratorRuntime.awrap(total);

                      case 2:
                        acc = _context22.sent;
                        _iteratorNormalCompletion9 = true;
                        _didIteratorError9 = false;
                        _context22.prev = 5;
                        _iterator9 = _asyncIterator(AffReport.find({
                          belongsToPartner: nextSubPartner._id,
                          'account.transValue': {
                            $gt: 0
                          }
                        }).select('account.transValue').lean());

                      case 7:
                        _context22.next = 9;
                        return regeneratorRuntime.awrap(_iterator9.next());

                      case 9:
                        _step9 = _context22.sent;
                        _iteratorNormalCompletion9 = _step9.done;
                        _context22.next = 13;
                        return regeneratorRuntime.awrap(_step9.value);

                      case 13:
                        _value9 = _context22.sent;

                        if (_iteratorNormalCompletion9) {
                          _context22.next = 20;
                          break;
                        }

                        report = _value9;
                        acc += report.account.transValue;

                      case 17:
                        _iteratorNormalCompletion9 = true;
                        _context22.next = 7;
                        break;

                      case 20:
                        _context22.next = 26;
                        break;

                      case 22:
                        _context22.prev = 22;
                        _context22.t0 = _context22["catch"](5);
                        _didIteratorError9 = true;
                        _iteratorError9 = _context22.t0;

                      case 26:
                        _context22.prev = 26;
                        _context22.prev = 27;

                        if (!(!_iteratorNormalCompletion9 && _iterator9["return"] != null)) {
                          _context22.next = 31;
                          break;
                        }

                        _context22.next = 31;
                        return regeneratorRuntime.awrap(_iterator9["return"]());

                      case 31:
                        _context22.prev = 31;

                        if (!_didIteratorError9) {
                          _context22.next = 34;
                          break;
                        }

                        throw _iteratorError9;

                      case 34:
                        return _context22.finish(31);

                      case 35:
                        return _context22.finish(26);

                      case 36:
                        return _context22.abrupt("return", acc);

                      case 37:
                      case "end":
                        return _context22.stop();
                    }
                  }
                }, null, null, [[5, 22, 26, 36], [27,, 31, 35]]);
              }, Promise.resolve(0)));

            case 9:
              subVol = _context23.sent;
              total = subVol + myVol;
              isSub = total > 10000 ? true : false;
              isOfficial = total > 250000 ? true : false;

              if (!isSub) {
                _context23.next = 18;
                break;
              }

              _context23.next = 16;
              return regeneratorRuntime.awrap(AffPartner.findByIdAndUpdate(_id, {
                isSubPartner: isSub
              }, {
                select: 'isSubPartner'
              }));

            case 16:
              _context23.next = 24;
              break;

            case 18:
              if (!isOfficial) {
                _context23.next = 23;
                break;
              }

              _context23.next = 21;
              return regeneratorRuntime.awrap(AffPartner.findByIdAndUpdate(_id, {
                isOfficialPartner: isOfficial
              }, {
                select: 'isOfficialPartner'
              }));

            case 21:
              _context23.next = 24;
              break;

            case 23:
              return _context23.abrupt("return");

            case 24:
              _context23.next = 27;
              break;

            case 26:
              return _context23.abrupt("return");

            case 27:
            case "end":
              return _context23.stop();
          }
        }
      });
    }());
  });
}; // createUpdateAffMonthlySummary(nextPartner, month, date)


var createUpdateAffMonthlySummary = function createUpdateAffMonthlySummary(_ref17, month, date) {
  var _id = _ref17._id,
      isSubPartner = _ref17.isSubPartner,
      isOfficialPartner = _ref17.isOfficialPartner,
      epi = _ref17.epi,
      referredBy = _ref17.referredBy;
  return new Promise(function (resolve) {
    resolve(function _callee17() {
      var existingReport, clicks, conversions, commissionUSD, commissionEUR, subCommissionUSD, subCommissionEUR, personalVol, subVol, networkShare, points;
      return regeneratorRuntime.async(function _callee17$(_context24) {
        while (1) {
          switch (_context24.prev = _context24.next) {
            case 0:
              _context24.next = 2;
              return regeneratorRuntime.awrap(AffMonthlySummary.findOne({
                belongsTo: _id,
                month: month
              }).select('_id').lean());

            case 2:
              existingReport = _context24.sent;
              _context24.next = 5;
              return regeneratorRuntime.awrap(getClicksByMonth({
                _id: _id,
                month: month
              }));

            case 5:
              clicks = _context24.sent;
              _context24.next = 8;
              return regeneratorRuntime.awrap(getAffAccountsAddedByMonth({
                _id: _id,
                monthAdded: month
              }));

            case 8:
              conversions = _context24.sent;
              _context24.next = 11;
              return regeneratorRuntime.awrap(getCashBackByCurrencyAndMonth({
                _id: _id
              }, 'USD', month));

            case 11:
              commissionUSD = _context24.sent;
              _context24.next = 14;
              return regeneratorRuntime.awrap(getCashBackByCurrencyAndMonth({
                _id: _id
              }, 'EUR', month));

            case 14:
              commissionEUR = _context24.sent;
              _context24.next = 17;
              return regeneratorRuntime.awrap(getSubPartnerCashbackByCurrencyAndMonth({
                _id: _id,
                currency: 'USD',
                month: month,
                isSubPartner: isSubPartner
              }));

            case 17:
              subCommissionUSD = _context24.sent;
              _context24.next = 20;
              return regeneratorRuntime.awrap(getSubPartnerCashbackByCurrencyAndMonth({
                _id: _id,
                currency: 'EUR',
                month: month,
                isSubPartner: isSubPartner
              }));

            case 20:
              subCommissionEUR = _context24.sent;
              _context24.next = 23;
              return regeneratorRuntime.awrap(getVolumeByMonth({
                _id: _id
              }, month));

            case 23:
              personalVol = _context24.sent;
              _context24.next = 26;
              return regeneratorRuntime.awrap(getSubPartnerVolumeByMonth({
                _id: _id,
                isSubPartner: isSubPartner,
                month: month
              }));

            case 26:
              subVol = _context24.sent;
              _context24.next = 29;
              return regeneratorRuntime.awrap(getNetworkShareVolumeByMonth({
                referredBy: referredBy,
                month: month
              }));

            case 29:
              networkShare = _context24.sent;
              points = personalVol + subVol + networkShare;

              if (!existingReport) {
                _context24.next = 36;
                break;
              }

              _context24.next = 34;
              return regeneratorRuntime.awrap(AffMonthlySummary.findByIdAndUpdate(existingReport._id, {
                lastUpdate: Date.now(),
                clicks: clicks,
                conversions: conversions,
                points: points,
                epi: epi,
                commissionEUR: commissionEUR,
                commissionUSD: commissionUSD,
                subCommissionEUR: subCommissionEUR,
                subCommissionUSD: subCommissionUSD
              }, {
                "new": true
              }));

            case 34:
              _context24.next = 38;
              break;

            case 36:
              _context24.next = 38;
              return regeneratorRuntime.awrap(AffMonthlySummary.create({
                date: date,
                month: month,
                lastUpdate: Date.now(),
                clicks: clicks,
                conversions: conversions,
                points: points,
                epi: epi,
                commissionEUR: commissionEUR,
                commissionUSD: commissionUSD,
                subCommissionEUR: subCommissionEUR,
                subCommissionUSD: subCommissionUSD,
                belongsTo: _id
              }));

            case 38:
            case "end":
              return _context24.stop();
          }
        }
      });
    }());
  });
};

var getClicksByMonth = function getClicksByMonth(_ref18) {
  var _id, month, clickData;

  return regeneratorRuntime.async(function getClicksByMonth$(_context25) {
    while (1) {
      switch (_context25.prev = _context25.next) {
        case 0:
          _id = _ref18._id, month = _ref18.month;
          _context25.next = 3;
          return regeneratorRuntime.awrap(AffReportDaily.aggregate([// gets all the clicks from Neteller/Skrill - still need to do for ecoPayz
          {
            $match: {
              $and: [{
                belongsTo: mongoose.Types.ObjectId(_id)
              }, {
                month: month
              }]
            }
          }, {
            $project: {
              clicks: 1
            }
          }, {
            $group: {
              _id: null,
              clicks: {
                $sum: '$clicks'
              }
            }
          }]));

        case 3:
          clickData = _context25.sent;
          return _context25.abrupt("return", clickData.length === 0 ? 0 : clickData[0].clicks);

        case 5:
        case "end":
          return _context25.stop();
      }
    }
  });
};

var getAffAccountsAddedByMonth = function getAffAccountsAddedByMonth(_ref19) {
  var _id, monthAdded, accountData;

  return regeneratorRuntime.async(function getAffAccountsAddedByMonth$(_context26) {
    while (1) {
      switch (_context26.prev = _context26.next) {
        case 0:
          _id = _ref19._id, monthAdded = _ref19.monthAdded;
          _context26.next = 3;
          return regeneratorRuntime.awrap(AffAccount.countDocuments({
            belongsTo: _id,
            monthAdded: monthAdded
          }));

        case 3:
          accountData = _context26.sent;
          return _context26.abrupt("return", accountData);

        case 5:
        case "end":
          return _context26.stop();
      }
    }
  });
};

var getCashBackByCurrencyAndMonth = function getCashBackByCurrencyAndMonth(_ref20, currency, month) {
  var _id, cashback, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, _value10, report;

  return regeneratorRuntime.async(function getCashBackByCurrencyAndMonth$(_context27) {
    while (1) {
      switch (_context27.prev = _context27.next) {
        case 0:
          _id = _ref20._id;
          cashback = 0;
          _iteratorNormalCompletion10 = true;
          _didIteratorError10 = false;
          _context27.prev = 4;
          _iterator10 = _asyncIterator(AffReport.find({
            belongsToPartner: _id,
            'account.currency': currency,
            month: month,
            'account.transValue': {
              $gt: 0
            }
          }).select('account.cashback').lean());

        case 6:
          _context27.next = 8;
          return regeneratorRuntime.awrap(_iterator10.next());

        case 8:
          _step10 = _context27.sent;
          _iteratorNormalCompletion10 = _step10.done;
          _context27.next = 12;
          return regeneratorRuntime.awrap(_step10.value);

        case 12:
          _value10 = _context27.sent;

          if (_iteratorNormalCompletion10) {
            _context27.next = 19;
            break;
          }

          report = _value10;
          cashback += report.account.cashback;

        case 16:
          _iteratorNormalCompletion10 = true;
          _context27.next = 6;
          break;

        case 19:
          _context27.next = 25;
          break;

        case 21:
          _context27.prev = 21;
          _context27.t0 = _context27["catch"](4);
          _didIteratorError10 = true;
          _iteratorError10 = _context27.t0;

        case 25:
          _context27.prev = 25;
          _context27.prev = 26;

          if (!(!_iteratorNormalCompletion10 && _iterator10["return"] != null)) {
            _context27.next = 30;
            break;
          }

          _context27.next = 30;
          return regeneratorRuntime.awrap(_iterator10["return"]());

        case 30:
          _context27.prev = 30;

          if (!_didIteratorError10) {
            _context27.next = 33;
            break;
          }

          throw _iteratorError10;

        case 33:
          return _context27.finish(30);

        case 34:
          return _context27.finish(25);

        case 35:
          return _context27.abrupt("return", cashback);

        case 36:
        case "end":
          return _context27.stop();
      }
    }
  }, null, null, [[4, 21, 25, 35], [26,, 30, 34]]);
};

var getSubPartnerCashbackByCurrencyAndMonth = function getSubPartnerCashbackByCurrencyAndMonth(_ref21) {
  var _id = _ref21._id,
      currency = _ref21.currency,
      month = _ref21.month,
      isSubPartner = _ref21.isSubPartner;

  if (isSubPartner) {
    return new Promise(function (resolve) {
      resolve(AffPartner.find({
        referredBy: _id
      }).select('_id').lean() // get all partners that have BEEN referredBy this partner
      .then(function (subPartners) {
        return subPartners.reduce(function _callee18(total, nextSubPartner) {
          var acc, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, _value11, report;

          return regeneratorRuntime.async(function _callee18$(_context28) {
            while (1) {
              switch (_context28.prev = _context28.next) {
                case 0:
                  _context28.next = 2;
                  return regeneratorRuntime.awrap(total);

                case 2:
                  acc = _context28.sent;
                  _iteratorNormalCompletion11 = true;
                  _didIteratorError11 = false;
                  _context28.prev = 5;
                  _iterator11 = _asyncIterator(AffReport.find({
                    belongsToPartner: nextSubPartner._id,
                    'account.currency': currency,
                    month: month,
                    'account.transValue': {
                      $gt: 0
                    }
                  }).select('account.subAffCommission').lean());

                case 7:
                  _context28.next = 9;
                  return regeneratorRuntime.awrap(_iterator11.next());

                case 9:
                  _step11 = _context28.sent;
                  _iteratorNormalCompletion11 = _step11.done;
                  _context28.next = 13;
                  return regeneratorRuntime.awrap(_step11.value);

                case 13:
                  _value11 = _context28.sent;

                  if (_iteratorNormalCompletion11) {
                    _context28.next = 20;
                    break;
                  }

                  report = _value11;
                  acc += report.account.subAffCommission;

                case 17:
                  _iteratorNormalCompletion11 = true;
                  _context28.next = 7;
                  break;

                case 20:
                  _context28.next = 26;
                  break;

                case 22:
                  _context28.prev = 22;
                  _context28.t0 = _context28["catch"](5);
                  _didIteratorError11 = true;
                  _iteratorError11 = _context28.t0;

                case 26:
                  _context28.prev = 26;
                  _context28.prev = 27;

                  if (!(!_iteratorNormalCompletion11 && _iterator11["return"] != null)) {
                    _context28.next = 31;
                    break;
                  }

                  _context28.next = 31;
                  return regeneratorRuntime.awrap(_iterator11["return"]());

                case 31:
                  _context28.prev = 31;

                  if (!_didIteratorError11) {
                    _context28.next = 34;
                    break;
                  }

                  throw _iteratorError11;

                case 34:
                  return _context28.finish(31);

                case 35:
                  return _context28.finish(26);

                case 36:
                  return _context28.abrupt("return", acc);

                case 37:
                case "end":
                  return _context28.stop();
              }
            }
          }, null, null, [[5, 22, 26, 36], [27,, 31, 35]]);
        }, Promise.resolve(0));
      }));
    });
  } else return 0;
};

var getVolumeByMonth = function getVolumeByMonth(_ref22, month) {
  var _id, transValue, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, _value12, report;

  return regeneratorRuntime.async(function getVolumeByMonth$(_context29) {
    while (1) {
      switch (_context29.prev = _context29.next) {
        case 0:
          _id = _ref22._id;
          // get volume for ALL BRANDS for current and previous - this is for VK points
          transValue = 0;
          _iteratorNormalCompletion12 = true;
          _didIteratorError12 = false;
          _context29.prev = 4;
          _iterator12 = _asyncIterator(AffReport.find({
            belongsToPartner: _id,
            month: month,
            'account.transValue': {
              $gt: 0
            }
          }).select('account.transValue').lean());

        case 6:
          _context29.next = 8;
          return regeneratorRuntime.awrap(_iterator12.next());

        case 8:
          _step12 = _context29.sent;
          _iteratorNormalCompletion12 = _step12.done;
          _context29.next = 12;
          return regeneratorRuntime.awrap(_step12.value);

        case 12:
          _value12 = _context29.sent;

          if (_iteratorNormalCompletion12) {
            _context29.next = 19;
            break;
          }

          report = _value12;
          transValue += report.account.transValue;

        case 16:
          _iteratorNormalCompletion12 = true;
          _context29.next = 6;
          break;

        case 19:
          _context29.next = 25;
          break;

        case 21:
          _context29.prev = 21;
          _context29.t0 = _context29["catch"](4);
          _didIteratorError12 = true;
          _iteratorError12 = _context29.t0;

        case 25:
          _context29.prev = 25;
          _context29.prev = 26;

          if (!(!_iteratorNormalCompletion12 && _iterator12["return"] != null)) {
            _context29.next = 30;
            break;
          }

          _context29.next = 30;
          return regeneratorRuntime.awrap(_iterator12["return"]());

        case 30:
          _context29.prev = 30;

          if (!_didIteratorError12) {
            _context29.next = 33;
            break;
          }

          throw _iteratorError12;

        case 33:
          return _context29.finish(30);

        case 34:
          return _context29.finish(25);

        case 35:
          return _context29.abrupt("return", transValue);

        case 36:
        case "end":
          return _context29.stop();
      }
    }
  }, null, null, [[4, 21, 25, 35], [26,, 30, 34]]);
};

var getSubPartnerVolumeByMonth = function getSubPartnerVolumeByMonth(_ref23) {
  var _id = _ref23._id,
      isSubPartner = _ref23.isSubPartner,
      month = _ref23.month;

  // this is used for /affiliate/report/fetch-monthly-statement in router/affiliate/report.router.js
  if (isSubPartner) {
    return new Promise(function (resolve) {
      resolve(AffPartner.find({
        referredBy: _id
      }).select('_id').lean() // get all partners that have BEEN referredBy this partner
      .then(function (subPartners) {
        return subPartners.reduce(function _callee19(total, nextSubPartner) {
          var acc, _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, _value13, report;

          return regeneratorRuntime.async(function _callee19$(_context30) {
            while (1) {
              switch (_context30.prev = _context30.next) {
                case 0:
                  _context30.next = 2;
                  return regeneratorRuntime.awrap(total);

                case 2:
                  acc = _context30.sent;
                  _iteratorNormalCompletion13 = true;
                  _didIteratorError13 = false;
                  _context30.prev = 5;
                  _iterator13 = _asyncIterator(AffReport.find({
                    belongsToPartner: nextSubPartner._id,
                    month: month,
                    'account.transValue': {
                      $gt: 0
                    }
                  }).select('account.transValue').lean());

                case 7:
                  _context30.next = 9;
                  return regeneratorRuntime.awrap(_iterator13.next());

                case 9:
                  _step13 = _context30.sent;
                  _iteratorNormalCompletion13 = _step13.done;
                  _context30.next = 13;
                  return regeneratorRuntime.awrap(_step13.value);

                case 13:
                  _value13 = _context30.sent;

                  if (_iteratorNormalCompletion13) {
                    _context30.next = 20;
                    break;
                  }

                  report = _value13;
                  acc += report.account.transValue;

                case 17:
                  _iteratorNormalCompletion13 = true;
                  _context30.next = 7;
                  break;

                case 20:
                  _context30.next = 26;
                  break;

                case 22:
                  _context30.prev = 22;
                  _context30.t0 = _context30["catch"](5);
                  _didIteratorError13 = true;
                  _iteratorError13 = _context30.t0;

                case 26:
                  _context30.prev = 26;
                  _context30.prev = 27;

                  if (!(!_iteratorNormalCompletion13 && _iterator13["return"] != null)) {
                    _context30.next = 31;
                    break;
                  }

                  _context30.next = 31;
                  return regeneratorRuntime.awrap(_iterator13["return"]());

                case 31:
                  _context30.prev = 31;

                  if (!_didIteratorError13) {
                    _context30.next = 34;
                    break;
                  }

                  throw _iteratorError13;

                case 34:
                  return _context30.finish(31);

                case 35:
                  return _context30.finish(26);

                case 36:
                  return _context30.abrupt("return", acc);

                case 37:
                case "end":
                  return _context30.stop();
              }
            }
          }, null, null, [[5, 22, 26, 36], [27,, 31, 35]]);
        }, Promise.resolve(0));
      }));
    });
  } else return 0;
};

var getNetworkShareVolumeByMonth = function getNetworkShareVolumeByMonth(_ref24) {
  var referredBy = _ref24.referredBy,
      month = _ref24.month;

  if (referredBy) {
    return new Promise(function (resolve) {
      resolve(AffPartner.find({
        referredBy: referredBy
      }).select('_id').lean() // get all partners that have the SAME referredBy as this partner
      .then(function (partnersReferredBySameNetwork) {
        return partnersReferredBySameNetwork.reduce(function _callee20(total, nextPartner) {
          var acc, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, _value14, report;

          return regeneratorRuntime.async(function _callee20$(_context31) {
            while (1) {
              switch (_context31.prev = _context31.next) {
                case 0:
                  _context31.next = 2;
                  return regeneratorRuntime.awrap(total);

                case 2:
                  acc = _context31.sent;
                  _iteratorNormalCompletion14 = true;
                  _didIteratorError14 = false;
                  _context31.prev = 5;
                  _iterator14 = _asyncIterator(AffReport.find({
                    belongsToPartner: nextPartner._id,
                    month: month,
                    'account.transValue': {
                      $gt: 0
                    }
                  }).select('account.transValue').lean());

                case 7:
                  _context31.next = 9;
                  return regeneratorRuntime.awrap(_iterator14.next());

                case 9:
                  _step14 = _context31.sent;
                  _iteratorNormalCompletion14 = _step14.done;
                  _context31.next = 13;
                  return regeneratorRuntime.awrap(_step14.value);

                case 13:
                  _value14 = _context31.sent;

                  if (_iteratorNormalCompletion14) {
                    _context31.next = 20;
                    break;
                  }

                  report = _value14;
                  acc += report.account.transValue;

                case 17:
                  _iteratorNormalCompletion14 = true;
                  _context31.next = 7;
                  break;

                case 20:
                  _context31.next = 26;
                  break;

                case 22:
                  _context31.prev = 22;
                  _context31.t0 = _context31["catch"](5);
                  _didIteratorError14 = true;
                  _iteratorError14 = _context31.t0;

                case 26:
                  _context31.prev = 26;
                  _context31.prev = 27;

                  if (!(!_iteratorNormalCompletion14 && _iterator14["return"] != null)) {
                    _context31.next = 31;
                    break;
                  }

                  _context31.next = 31;
                  return regeneratorRuntime.awrap(_iterator14["return"]());

                case 31:
                  _context31.prev = 31;

                  if (!_didIteratorError14) {
                    _context31.next = 34;
                    break;
                  }

                  throw _iteratorError14;

                case 34:
                  return _context31.finish(31);

                case 35:
                  return _context31.finish(26);

                case 36:
                  return _context31.abrupt("return", acc);

                case 37:
                case "end":
                  return _context31.stop();
              }
            }
          }, null, null, [[5, 22, 26, 36], [27,, 31, 35]]);
        }, Promise.resolve(0));
      }));
    });
  } else return 0;
};

module.exports = (_module$exports = {
  updatePartnerStats: updatePartnerStats,
  getCashbackRate: getCashbackRate
}, _defineProperty(_module$exports, "getCashbackRate", getCashbackRate), _defineProperty(_module$exports, "getVolumeByBrand", getVolumeByBrand), _defineProperty(_module$exports, "getCashBackByBrand", getCashBackByBrand), _defineProperty(_module$exports, "getSubAffCommissionByBrand", getSubAffCommissionByBrand), _defineProperty(_module$exports, "getClicksByMonth", getClicksByMonth), _defineProperty(_module$exports, "getAffAccountsAddedByMonth", getAffAccountsAddedByMonth), _defineProperty(_module$exports, "getCashBackByCurrencyAndMonth", getCashBackByCurrencyAndMonth), _defineProperty(_module$exports, "getSubPartnerCashbackByCurrencyAndMonth", getSubPartnerCashbackByCurrencyAndMonth), _defineProperty(_module$exports, "getVolumeByMonth", getVolumeByMonth), _defineProperty(_module$exports, "getSubPartnerVolumeByMonth", getSubPartnerVolumeByMonth), _defineProperty(_module$exports, "getNetworkShareVolumeByMonth", getNetworkShareVolumeByMonth), _module$exports);