"use strict";

var _require = require('../models/affiliate/index'),
    AffPartner = _require.AffPartner,
    AffReport = _require.AffReport,
    AffAccount = _require.AffAccount,
    AffReportMonthly = _require.AffReportMonthly,
    AffSubReport = _require.AffSubReport;

var _require2 = require('../models/personal/index'),
    ActiveUser = _require2.ActiveUser,
    Account = _require2.Account,
    Report = _require2.Report,
    SubReport = _require2.SubReport;

var _require3 = require('../models/common'),
    User = _require3.User;

var dayjs = require('dayjs');

var advancedFormat = require('dayjs/plugin/advancedFormat');

dayjs.extend(advancedFormat);

var createAccountReport = function createAccountReport(_ref) {
  var accountId = _ref.accountId,
      brand = _ref.brand,
      belongsTo = _ref.belongsTo;
  return new Promise(function (resolve) {
    // have to return a promise to be able to await it. E.G  await createAccountReport ({ accountId, brand, belongsTo });
    resolve(function _callee() {
      var existingAccount, newAccount, newReport;
      return regeneratorRuntime.async(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return regeneratorRuntime.awrap(Account.findOne({
                accountId: accountId
              }).select('accountId'));

            case 2:
              existingAccount = _context.sent;

              if (existingAccount) {
                _context.next = 17;
                break;
              }

              _context.next = 6;
              return regeneratorRuntime.awrap(Account.create({
                brand: brand,
                accountId: accountId,
                belongsTo: belongsTo
              }));

            case 6:
              newAccount = _context.sent;
              _context.next = 9;
              return regeneratorRuntime.awrap(Report.create({
                date: Number(dayjs().startOf('month').format('x')),
                month: dayjs().format('MMMM YYYY'),
                brand: brand,
                belongsTo: newAccount._id,
                belongsToActiveUser: newAccount.belongsTo,
                'account.accountId': accountId,
                'account.deposits': 0,
                'account.transValue': 0,
                'account.commission': 0,
                'account.commissionRate': 0,
                'account.earnedFee': 0,
                'account.cashbackRate': 0
              }));

            case 9:
              newReport = _context.sent;
              newAccount.reports.push(newReport); // Push new report to reports array

              _context.next = 13;
              return regeneratorRuntime.awrap(newAccount.save());

            case 13:
              _context.next = 15;
              return regeneratorRuntime.awrap(ActiveUser.findByIdAndUpdate(newAccount.belongsTo, {
                $push: {
                  accounts: newAccount
                }
              }, {
                select: 'accounts',
                "new": true
              }));

            case 15:
              _context.next = 18;
              break;

            case 17:
              return _context.abrupt("return");

            case 18:
            case "end":
              return _context.stop();
          }
        }
      });
    }());
  });
};

var createAffAccAffReport = function createAffAccAffReport(_ref2) {
  var accountId = _ref2.accountId,
      brand = _ref2.brand,
      belongsTo = _ref2.belongsTo;
  return new Promise(function (resolve) {
    // have to return a promise to be able to await it. E.G  await createAffAccAffReport ({ accountId, brand, belongsTo });
    resolve(function _callee2() {
      var existingAccount, newAccount, newReport;
      return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return regeneratorRuntime.awrap(AffAccount.findOne({
                accountId: accountId
              }).select('accountId'));

            case 2:
              existingAccount = _context2.sent;

              if (existingAccount) {
                _context2.next = 17;
                break;
              }

              _context2.next = 6;
              return regeneratorRuntime.awrap(AffAccount.create({
                brand: brand,
                accountId: accountId,
                belongsTo: belongsTo
              }));

            case 6:
              newAccount = _context2.sent;
              _context2.next = 9;
              return regeneratorRuntime.awrap(AffReport.create({
                date: Number(dayjs().startOf('month').format('x')),
                month: dayjs().format('MMMM YYYY'),
                brand: brand,
                belongsTo: newAccount._id,
                belongsToPartner: newAccount.belongsTo,
                'account.accountId': accountId,
                'account.deposits': 0,
                'account.transValue': 0,
                'account.commission': 0,
                'account.commissionRate': 0,
                'account.earnedFee': 0,
                'account.cashbackRate': 0
              }));

            case 9:
              newReport = _context2.sent;
              newAccount.reports.push(newReport); // Push new report to reports array

              _context2.next = 13;
              return regeneratorRuntime.awrap(newAccount.save());

            case 13:
              _context2.next = 15;
              return regeneratorRuntime.awrap(AffPartner.findByIdAndUpdate(newAccount.belongsTo, {
                $push: {
                  accounts: newAccount
                }
              }, {
                select: 'accounts',
                "new": true
              }));

            case 15:
              _context2.next = 18;
              break;

            case 17:
              return _context2.abrupt("return");

            case 18:
            case "end":
              return _context2.stop();
          }
        }
      });
    }());
  });
}; // deleting after wrong month upload


var deleteReportsWrongMonth = function deleteReportsWrongMonth() {
  var affreports, affreportsmonthly, affsubreports, reports, subreport;
  return regeneratorRuntime.async(function deleteReportsWrongMonth$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _context3.next = 3;
          return regeneratorRuntime.awrap(AffReport.deleteMany({
            month: 'March 2021',
            brand: 'ecoPayz'
          }));

        case 3:
          affreports = _context3.sent;
          _context3.next = 6;
          return regeneratorRuntime.awrap(AffReportMonthly.deleteMany({
            month: 'March 2021',
            brand: 'ecoPayz'
          }));

        case 6:
          affreportsmonthly = _context3.sent;
          _context3.next = 9;
          return regeneratorRuntime.awrap(AffSubReport.find({
            month: 'March 2021',
            brand: 'ecoPayz'
          }));

        case 9:
          affsubreports = _context3.sent;
          _context3.next = 12;
          return regeneratorRuntime.awrap(Report.deleteMany({
            month: 'March 2021',
            brand: 'ecoPayz'
          }));

        case 12:
          reports = _context3.sent;
          _context3.next = 15;
          return regeneratorRuntime.awrap(SubReport.deleteMany({
            month: 'March 2021',
            brand: 'ecoPayz'
          }));

        case 15:
          subreport = _context3.sent;
          _context3.next = 21;
          break;

        case 18:
          _context3.prev = 18;
          _context3.t0 = _context3["catch"](0);
          console.log(_context3.t0);

        case 21:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 18]]);
}; // connecting accountid to user


var connectAccountIdToUser = function connectAccountIdToUser() {
  var user, updatedAccount, activeUserUpdate, updatedReport;
  return regeneratorRuntime.async(function connectAccountIdToUser$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            email: 'sigsun95@gmail.com'
          }));

        case 3:
          user = _context4.sent;
          console.log(user);
          _context4.next = 7;
          return regeneratorRuntime.awrap(Account.findOneAndUpdate({
            accountId: '1100896201'
          }, {
            belongsTo: user.activeUser
          }, {
            "new": true
          }));

        case 7:
          updatedAccount = _context4.sent;
          _context4.next = 10;
          return regeneratorRuntime.awrap(ActiveUser.findByIdAndUpdate(user.activeUser, {
            $push: {
              accounts: updatedAccount
            }
          }));

        case 10:
          activeUserUpdate = _context4.sent;
          _context4.next = 13;
          return regeneratorRuntime.awrap(Report.updateMany({
            'account.accountId': '1100896201'
          }, {
            belongsTo: updatedAccount._id,
            belongsToActiveUser: updatedAccount.belongsTo
          }, {
            "new": true
          }));

        case 13:
          updatedReport = _context4.sent;
          console.log(updatedAccount);
          console.log(updatedReport);
          _context4.next = 21;
          break;

        case 18:
          _context4.prev = 18;
          _context4.t0 = _context4["catch"](0);
          console.log(_context4.t0);

        case 21:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 18]]);
};

module.exports = {
  createAccountReport: createAccountReport,
  createAffAccAffReport: createAffAccAffReport,
  deleteReportsWrongMonth: deleteReportsWrongMonth,
  connectAccountIdToUser: connectAccountIdToUser
};