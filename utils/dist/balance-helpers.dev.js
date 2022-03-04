"use strict";

var _require = require('../models/personal'),
    Report = _require.Report,
    SubReport = _require.SubReport,
    Payment = _require.Payment,
    ActiveUser = _require.ActiveUser;

var _require2 = require('../models/affiliate/index'),
    AffReport = _require2.AffReport,
    AffSubReport = _require2.AffSubReport,
    AffPayment = _require2.AffPayment,
    AffPartner = _require2.AffPartner;

var mongoose = require('mongoose');

var updatePersonalBalance = function updatePersonalBalance(_ref) {
  var _id = _ref._id,
      brand = _ref.brand;
  // THIS IS UPDATED MARCH '22 FOR NEW BALANCE SCHEMA
  return new Promise(function (resolve) {
    resolve(function _callee() {
      var reports, subReports, payments, commission, cashback, rafCommission, paid, requested, current;
      return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return regeneratorRuntime.awrap(Report.aggregate([{
                $match: {
                  $and: [{
                    belongsToActiveUser: mongoose.Types.ObjectId(_id)
                  }, {
                    brand: brand
                  }, {
                    'account.transValue': {
                      $gt: 0
                    }
                  }]
                }
              }, // only search if transValue > 0
              {
                $project: {
                  'account.cashback': 1,
                  'account.commission': 1,
                  'account.currency': 1
                }
              }, // selected values to return 1 = true, 0 = false
              {
                $group: {
                  // https://docs.mongodb.com/manual/reference/operator/aggregation/group/
                  _id: {
                    currency: '$account.currency'
                  },
                  cashback: {
                    $sum: '$account.cashback'
                  },
                  commission: {
                    $sum: '$account.commission'
                  }
                }
              }]));

            case 3:
              reports = _context.sent;
              _context.next = 6;
              return regeneratorRuntime.awrap(SubReport.aggregate([{
                $match: {
                  $and: [{
                    belongsTo: mongoose.Types.ObjectId(_id)
                  }, {
                    brand: brand
                  }]
                }
              }, {
                $project: {
                  rafCommission: 1,
                  currency: 1
                }
              }, // selected values to return 1 = true, 0 = false
              {
                $group: {
                  // https://docs.mongodb.com/manual/reference/operator/aggregation/group/
                  _id: {
                    currency: '$currency'
                  },
                  total: {
                    $sum: '$rafCommission'
                  }
                }
              }]));

            case 6:
              subReports = _context.sent;
              _context.next = 9;
              return regeneratorRuntime.awrap(Payment.aggregate([{
                $match: {
                  $and: [{
                    belongsTo: mongoose.Types.ObjectId(_id)
                  }, {
                    brand: brand
                  }]
                }
              }, {
                $project: {
                  currency: 1,
                  status: 1,
                  amount: 1
                }
              }, // selected values to return 1 = true, 0 = false
              {
                $group: {
                  _id: {
                    status: '$status'
                  },
                  total: {
                    $sum: '$amount'
                  }
                }
              }]));

            case 9:
              payments = _context.sent;
              commission = reports.reduce(function (acc, item) {
                return acc += item.commission, acc;
              }, 0);
              cashback = reports.reduce(function (acc, item) {
                return acc += item.cashback, acc;
              }, 0);
              rafCommission = subReports.reduce(function (acc, item) {
                return acc += item.total, acc;
              }, 0);
              paid = payments.reduce(function (acc, item) {
                return item._id.status === 'Paid' ? (acc += item.total, acc) : acc;
              }, 0);
              requested = payments.reduce(function (acc, item) {
                return item._id.status === 'Requested' ? (acc += item.total, acc) : acc;
              }, 0);
              current = cashback + rafCommission - (paid + requested);
              _context.next = 18;
              return regeneratorRuntime.awrap(ActiveUser.findOneAndUpdate( // THIS IS UPDATED MARCH '22 FOR NEW BALANCE SCHEMA
              {
                _id: _id
              }, {
                'balances.$[el].current': current,
                'balances.$[el].commission': commission,
                'balances.$[el].raf': rafCommission,
                'balances.$[el].cashback': cashback,
                'balances.$[el].payments': paid,
                'balances.$[el].requested': requested
              }, {
                "new": true,
                arrayFilters: [{
                  'el.brand': brand
                }],
                select: 'balances'
              }));

            case 18:
              _context.next = 23;
              break;

            case 20:
              _context.prev = 20;
              _context.t0 = _context["catch"](0);
              return _context.abrupt("return", _context.t0);

            case 23:
            case "end":
              return _context.stop();
          }
        }
      }, null, null, [[0, 20]]);
    }());
  });
};

var updateAffiliateBalance = function updateAffiliateBalance(_ref2) {
  var _id = _ref2._id;
  return new Promise(function (resolve) {
    resolve(function _callee3() {
      var affReports, affSubReports, affPayments, commission, cashback, subCommission, paid, requested, balance;
      return regeneratorRuntime.async(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(AffReport.aggregate([{
                $match: {
                  $and: [{
                    belongsToPartner: mongoose.Types.ObjectId(_id)
                  }, {
                    'account.transValue': {
                      $gt: 0
                    }
                  }]
                }
              }, // only search if transValue > 0
              {
                $project: {
                  'account.cashback': 1,
                  'account.commission': 1,
                  'account.currency': 1
                }
              }, // selected values to return 1 = true, 0 = false
              {
                $group: {
                  // https://docs.mongodb.com/manual/reference/operator/aggregation/group/
                  _id: {
                    currency: '$account.currency'
                  },
                  cashback: {
                    $sum: '$account.cashback'
                  },
                  commission: {
                    $sum: '$account.commission'
                  }
                }
              }]));

            case 2:
              affReports = _context3.sent;
              _context3.next = 5;
              return regeneratorRuntime.awrap(AffSubReport.aggregate([{
                $match: {
                  $and: [{
                    belongsTo: mongoose.Types.ObjectId(_id)
                  }]
                }
              }, {
                $project: {
                  subAffCommission: 1,
                  currency: 1
                }
              }, // selected values to return 1 = true, 0 = false
              {
                $group: {
                  // https://docs.mongodb.com/manual/reference/operator/aggregation/group/
                  _id: {
                    currency: '$currency'
                  },
                  total: {
                    $sum: '$subAffCommission'
                  }
                }
              }]));

            case 5:
              affSubReports = _context3.sent;
              _context3.next = 8;
              return regeneratorRuntime.awrap(AffPayment.aggregate([{
                $match: {
                  $and: [{
                    belongsTo: mongoose.Types.ObjectId(_id)
                  }]
                }
              }, {
                $project: {
                  currency: 1,
                  status: 1,
                  amount: 1
                }
              }, // selected values to return 1 = true, 0 = false
              {
                $group: {
                  _id: {
                    currency: '$currency',
                    status: '$status'
                  },
                  total: {
                    $sum: '$amount'
                  }
                }
              }]));

            case 8:
              affPayments = _context3.sent;
              commission = affReports.reduce(function (acc, item) {
                return acc[item._id.currency] += item.commission, acc;
              }, {
                USD: 0,
                EUR: 0
              });
              cashback = affReports.reduce(function (acc, item) {
                return acc[item._id.currency] += item.cashback, acc;
              }, {
                USD: 0,
                EUR: 0
              });
              subCommission = affSubReports.reduce(function (acc, item) {
                return acc[item._id.currency] += item.total, acc;
              }, {
                USD: 0,
                EUR: 0
              });
              paid = affPayments.reduce(function (acc, item) {
                return item._id.status === 'Paid' ? (acc[item._id.currency] += item.total, acc) : acc;
              }, {
                USD: 0,
                EUR: 0
              });
              requested = affPayments.reduce(function (acc, item) {
                return item._id.status === 'Requested' ? (acc[item._id.currency] += item.total, acc) : acc;
              }, {
                USD: 0,
                EUR: 0
              });
              balance = {
                USD: cashback['USD'] + subCommission['USD'] - (paid['USD'] + requested['USD']),
                EUR: cashback['EUR'] + subCommission['EUR'] - (paid['EUR'] + requested['EUR'])
              };
              _context3.next = 17;
              return regeneratorRuntime.awrap(['USD', 'EUR'].reduce(function _callee2(acc, currency) {
                var partner;
                return regeneratorRuntime.async(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.next = 2;
                        return regeneratorRuntime.awrap(acc);

                      case 2:
                        _context2.next = 4;
                        return regeneratorRuntime.awrap(AffPartner.findByIdAndUpdate(_id, {
                          'stats.balance.$[el].amount': balance[currency],
                          'stats.commission.$[el].amount': commission[currency],
                          'stats.cashback.$[el].amount': cashback[currency],
                          'stats.payments.$[el].amount': paid[currency],
                          'stats.requested.$[el].amount': requested[currency],
                          'stats.subCommission.$[el].amount': subCommission[currency] // Currently the affpartners we have in local db does not include subCommission in stats array - for this reason it may fail. When we load data from old site, we need to make sure every partner has stats.subCommission in their balance array

                        }, {
                          "new": true,
                          arrayFilters: [{
                            'el.currency': currency
                          }],
                          select: 'stats'
                        }));

                      case 4:
                        partner = _context2.sent;
                        return _context2.abrupt("return", new Promise(function (resolve) {
                          return resolve(partner);
                        }));

                      case 6:
                      case "end":
                        return _context2.stop();
                    }
                  }
                });
              }, Promise.resolve()));

            case 17:
            case "end":
              return _context3.stop();
          }
        }
      });
    }());
  });
};

module.exports = {
  updatePersonalBalance: updatePersonalBalance,
  updateAffiliateBalance: updateAffiliateBalance
};