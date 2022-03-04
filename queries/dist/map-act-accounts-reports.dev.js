"use strict";

var _require = require('../models/affiliate/index'),
    AffApplication = _require.AffApplication,
    AffPartner = _require.AffPartner;

var _require2 = require('../models/personal/index'),
    Account = _require2.Account,
    Application = _require2.Application,
    Report = _require2.Report,
    ActiveUser = _require2.ActiveUser;

var _require3 = require('../config/deals'),
    setCurrency = _require3.setCurrency;

var _require4 = require('./map-act-dashboard-data'),
    updateActUserStats = _require4.updateActUserStats;

var _require5 = require('../utils/notifications-functions'),
    createUserNotification = _require5.createUserNotification;

var actDataReducer = function actDataReducer(results, brand, month, date) {
  var completedAccountMapping = results.reduce(function (previousAccount, nextAccount) {
    return previousAccount.then(function () {
      return mapAccountReports(nextAccount, brand, month, date); // need to update properly
    });
  }, Promise.resolve());
  completedAccountMapping.then(function () {
    return updateActUserStats(brand, month, date);
  })["catch"](function (e) {
    return e;
  });
};

var mapAccountReports = function mapAccountReports(a, brand, month, date) {
  var dateAdded, lastUpdate;
  return regeneratorRuntime.async(function mapAccountReports$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          dateAdded = Date.now();
          lastUpdate = Date.now();
          return _context2.abrupt("return", new Promise(function (resolve) {
            resolve(function _callee() {
              var epi, currency, accountId, country, transValue, commission, deposits, earnedFee, commissionRate, defaultCashback, defaultCashbackRate, defaultRafCashback, defaultProfit, isPartnerEpi, isExistingAffApp, existingAccount, existingApplication, existingReport, updatedAccount, activeUser, newReport, newAccount, _newReport, _newAccount, _newReport2;

              return regeneratorRuntime.async(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      // anonymous async function
                      // NOTE: DO NOT USE { new: true } on .create()
                      // NOTE: can only use the .save() method on newly created documents - cannot use it on findOne() such as AffPartner.findOne({ epi }).select('epi').lean();
                      epi = a.epi, currency = a.currency, accountId = a.accountId, country = a.country, transValue = a.transValue, commission = a.commission, deposits = a.deposits, earnedFee = a.earnedFee;

                      if (!currency) {
                        _context.next = 5;
                        break;
                      }

                      _context.t0 = currency;
                      _context.next = 8;
                      break;

                    case 5:
                      _context.next = 7;
                      return regeneratorRuntime.awrap(setCurrency(brand));

                    case 7:
                      _context.t0 = _context.sent;

                    case 8:
                      currency = _context.t0;
                      commissionRate = transValue > 0 ? commission / transValue : 0;
                      defaultCashback = earnedFee > 0 ? earnedFee / 5 : 0;
                      defaultCashbackRate = defaultCashback > 0 ? defaultCashback / transValue : 0;
                      defaultRafCashback = 0;
                      defaultProfit = commission - (defaultCashback + defaultRafCashback);
                      _context.prev = 14;
                      _context.next = 17;
                      return regeneratorRuntime.awrap(AffPartner.findOne({
                        epi: epi
                      }).select('epi').lean());

                    case 17:
                      isPartnerEpi = _context.sent;

                      if (!isPartnerEpi) {
                        _context.next = 20;
                        break;
                      }

                      throw new Error("Account ID ".concat(accountId, " belongs to partner: ").concat(epi));

                    case 20:
                      _context.next = 22;
                      return regeneratorRuntime.awrap(AffApplication.findOne({
                        accountId: accountId
                      }).select('accountId').lean());

                    case 22:
                      isExistingAffApp = _context.sent;

                      if (!isExistingAffApp) {
                        _context.next = 25;
                        break;
                      }

                      throw new Error("AffAccount exists for this account ID: ".concat(accountId));

                    case 25:
                      _context.next = 27;
                      return regeneratorRuntime.awrap(Account.findOne({
                        accountId: accountId
                      }).select('accountId reports belongsTo'));

                    case 27:
                      existingAccount = _context.sent;
                      _context.next = 30;
                      return regeneratorRuntime.awrap(Application.findOne({
                        accountId: accountId
                      }).select('accountId belongsTo email').lean());

                    case 30:
                      existingApplication = _context.sent;
                      _context.next = 33;
                      return regeneratorRuntime.awrap(Report.findOne({
                        'account.accountId': accountId,
                        month: month
                      }).select('account.accountId belongsToActiveUser').lean());

                    case 33:
                      existingReport = _context.sent;

                      if (!existingAccount) {
                        _context.next = 58;
                        break;
                      }

                      if (!(!existingAccount.belongsTo && existingApplication && existingApplication.belongsTo)) {
                        _context.next = 42;
                        break;
                      }

                      _context.next = 38;
                      return regeneratorRuntime.awrap(Account.findByIdAndUpdate(existingAccount._id, {
                        belongsTo: existingApplication.belongsTo,
                        accountEmail: existingApplication.email
                      }, {
                        select: 'belongsTo accountEmail',
                        "new": true
                      }));

                    case 38:
                      updatedAccount = _context.sent;
                      _context.next = 41;
                      return regeneratorRuntime.awrap(ActiveUser.findByIdAndUpdate(updatedAccount.belongsTo, {
                        $push: {
                          accounts: updatedAccount
                        }
                      }, {
                        select: 'accounts belongsTo',
                        "new": true
                      }));

                    case 41:
                      activeUser = _context.sent;

                    case 42:
                      if (!existingReport) {
                        _context.next = 50;
                        break;
                      }

                      _context.next = 45;
                      return regeneratorRuntime.awrap(Report.findByIdAndUpdate(existingReport._id, {
                        lastUpdate: lastUpdate,
                        country: country,
                        account: {
                          accountId: accountId,
                          deposits: deposits,
                          transValue: transValue,
                          commission: commission,
                          cashback: defaultCashback,
                          cashbackRate: defaultCashbackRate,
                          commissionRate: commissionRate,
                          rafCashback: defaultRafCashback,
                          earnedFee: earnedFee,
                          currency: currency,
                          profit: defaultProfit
                        }
                      }, {
                        "new": true
                      }));

                    case 45:
                      if (!(!existingReport.belongsToActiveUser && existingApplication && existingApplication.belongsTo)) {
                        _context.next = 48;
                        break;
                      }

                      _context.next = 48;
                      return regeneratorRuntime.awrap(Report.findByIdAndUpdate(existingReport._id, {
                        belongsToActiveUser: existingApplication.belongsTo
                      }, {
                        select: 'belongsToActiveUser',
                        "new": true
                      }));

                    case 48:
                      _context.next = 56;
                      break;

                    case 50:
                      _context.next = 52;
                      return regeneratorRuntime.awrap(Report.create({
                        date: date,
                        month: month,
                        brand: brand,
                        country: country,
                        account: {
                          accountId: accountId,
                          deposits: deposits,
                          transValue: transValue,
                          commission: commission,
                          cashback: defaultCashback,
                          cashbackRate: defaultCashbackRate,
                          commissionRate: commissionRate,
                          rafCashback: defaultRafCashback,
                          earnedFee: earnedFee,
                          currency: currency,
                          profit: defaultProfit
                        },
                        belongsTo: existingAccount._id,
                        belongsToActiveUser: existingAccount.belongsTo
                      }));

                    case 52:
                      newReport = _context.sent;
                      existingAccount.reports.push(newReport._id); // selected reports from line 139 as need to push it

                      _context.next = 56;
                      return regeneratorRuntime.awrap(existingAccount.save());

                    case 56:
                      _context.next = 83;
                      break;

                    case 58:
                      if (!(existingApplication && existingApplication.belongsTo)) {
                        _context.next = 74;
                        break;
                      }

                      _context.next = 61;
                      return regeneratorRuntime.awrap(Account.create({
                        // create new account
                        accountId: accountId,
                        brand: brand,
                        dateAdded: dateAdded,
                        belongsTo: existingApplication.belongsTo,
                        accountEmail: existingApplication.email
                      }));

                    case 61:
                      newAccount = _context.sent;
                      _context.next = 64;
                      return regeneratorRuntime.awrap(Report.create({
                        date: date,
                        month: month,
                        brand: brand,
                        country: country,
                        account: {
                          accountId: accountId,
                          deposits: deposits,
                          transValue: transValue,
                          commission: commission,
                          cashback: defaultCashback,
                          cashbackRate: defaultCashbackRate,
                          commissionRate: commissionRate,
                          rafCashback: defaultRafCashback,
                          earnedFee: earnedFee,
                          currency: currency,
                          profit: defaultProfit
                        },
                        belongsTo: newAccount._id,
                        belongsToActiveUser: newAccount.belongsTo
                      }));

                    case 64:
                      _newReport = _context.sent;
                      newAccount.reports.push(_newReport); // Push new report to reports array

                      _context.next = 68;
                      return regeneratorRuntime.awrap(newAccount.save());

                    case 68:
                      _context.next = 70;
                      return regeneratorRuntime.awrap(Application.findByIdAndUpdate(existingApplication._id, {
                        status: 'Approved'
                      }, {
                        select: 'status',
                        "new": true
                      }));

                    case 70:
                      _context.next = 72;
                      return regeneratorRuntime.awrap(ActiveUser.findByIdAndUpdate(newAccount.belongsTo, {
                        $push: {
                          accounts: newAccount
                        }
                      }, {
                        select: 'accounts',
                        "new": true
                      }));

                    case 72:
                      _context.next = 83;
                      break;

                    case 74:
                      _context.next = 76;
                      return regeneratorRuntime.awrap(Account.create({
                        // create new account
                        accountId: accountId,
                        brand: brand,
                        dateAdded: dateAdded
                      }));

                    case 76:
                      _newAccount = _context.sent;
                      _context.next = 79;
                      return regeneratorRuntime.awrap(Report.create({
                        date: date,
                        month: month,
                        brand: brand,
                        country: country,
                        account: {
                          accountId: accountId,
                          deposits: deposits,
                          transValue: transValue,
                          commission: commission,
                          cashback: defaultCashback,
                          cashbackRate: defaultCashbackRate,
                          commissionRate: commissionRate,
                          rafCashback: defaultRafCashback,
                          earnedFee: earnedFee,
                          currency: currency,
                          profit: defaultProfit
                        },
                        belongsTo: _newAccount._id
                      }));

                    case 79:
                      _newReport2 = _context.sent;

                      _newAccount.reports.push(_newReport2); // Push new report to reports array


                      _context.next = 83;
                      return regeneratorRuntime.awrap(_newAccount.save());

                    case 83:
                      _context.next = 88;
                      break;

                    case 85:
                      _context.prev = 85;
                      _context.t1 = _context["catch"](14);
                      return _context.abrupt("return", _context.t1);

                    case 88:
                    case "end":
                      return _context.stop();
                  }
                }
              }, null, null, [[14, 85]]);
            }() // which we have to call
            );
          }));

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
}; // const createUpdateReport = ({
//     date,
//     month,
//     brand,
//     country,
//     accountId,
//     deposits,
//     transValue,
//     commission,
//     defaultCashback,
//     defaultCashbackRate,
//     commissionRate,
//     defaultRafCashback,
//     earnedFee,
//     currency,
//     defaultProfit,
//     newAccount
// }) => {
//     return new Promise(resolve => resolve(
//         (async() => {
//             await Report.create({
//                 date,
//                 month,
//                 brand,
//                 country,
//                 account: {
//                     accountId,
//                     deposits,
//                     transValue,
//                     commission,
//                     cashback: defaultCashback,
//                     cashbackRate: defaultCashbackRate,
//                     commissionRate,
//                     rafCashback: defaultRafCashback,
//                     earnedFee,
//                     currency,
//                     profit: defaultProfit
//                 },
//                 belongsTo: newAccount._id,
//                 belongsToActiveUser: newAccount.belongsToActiveUser
//             });
//         })()
//     ))
// }


module.exports = {
  actDataReducer: actDataReducer
};