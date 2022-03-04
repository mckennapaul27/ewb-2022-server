"use strict";

var passport = require('passport');

require('../../auth/admin-passport')(passport);

var mongoose = require('mongoose');

var express = require('express');

var router = express.Router();

var dayjs = require('dayjs');

var advancedFormat = require('dayjs/plugin/advancedFormat');

dayjs.extend(advancedFormat);

var _require = require('../../utils/token.utils'),
    getToken = _require.getToken;

var _require2 = require('../../models/personal/index'),
    Application = _require2.Application,
    ActiveUser = _require2.ActiveUser,
    Report = _require2.Report,
    Payment = _require2.Payment,
    Upgrade = _require2.Upgrade;

var crypto = require('crypto');

var _require3 = require('../../utils/helper-functions'),
    mapRegexQueryFromObj = _require3.mapRegexQueryFromObj,
    mapQueryForAggregate = _require3.mapQueryForAggregate,
    mapQueryForPopulate = _require3.mapQueryForPopulate,
    isPopulatedValue = _require3.isPopulatedValue;

var _require4 = require('../../utils/notifications-functions'),
    createUserNotification = _require4.createUserNotification;

var _require5 = require('../../utils/notifications-list'),
    applicationYY = _require5.applicationYY,
    applicationYN = _require5.applicationYN,
    applicationNN = _require5.applicationNN,
    paymentResult = _require5.paymentResult;

var _require6 = require('../../utils/account-functions'),
    createAccountReport = _require6.createAccountReport;

var _require7 = require('../../utils/balance-helpers'),
    updatePersonalBalance = _require7.updatePersonalBalance;

var _require8 = require('../../utils/sib-helpers'),
    sendEmail = _require8.sendEmail;

var _require9 = require('../../models/common'),
    Brand = _require9.Brand,
    Quarter = _require9.Quarter;

var _require10 = require('../../utils/sib-transactional-templates'),
    sibApplicationYY = _require10.sibApplicationYY,
    sibApplicationYN = _require10.sibApplicationYN,
    sibApplicationNN = _require10.sibApplicationNN,
    sibPaymentResult = _require10.sibPaymentResult; // POST /admin/active-user/get-active-user


router.post('/get-active-user', passport.authenticate('admin', {
  session: false
}), function _callee(req, res) {
  var token, partner;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context.next = 14;
            break;
          }

          _context.prev = 2;
          _context.next = 5;
          return regeneratorRuntime.awrap(ActiveUser.findById(req.body._id).select(req.body.select).lean());

        case 5:
          partner = _context.sent;
          return _context.abrupt("return", res.status(200).send(partner));

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](2);
          return _context.abrupt("return", res.status(400).send({
            msg: 'Server error'
          }));

        case 12:
          _context.next = 15;
          break;

        case 14:
          return _context.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[2, 9]]);
}); // POST /admin/active-user/update-active-user/:_id

router.post('/update-active-user/:_id', passport.authenticate('admin', {
  session: false
}), function _callee2(req, res) {
  var token, update, partner;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          token = getToken(req.headers);
          update = req.body;

          if (!token) {
            _context2.next = 15;
            break;
          }

          _context2.prev = 3;
          _context2.next = 6;
          return regeneratorRuntime.awrap(ActiveUser.findByIdAndUpdate(req.params._id, update, {
            "new": true
          }));

        case 6:
          partner = _context2.sent;
          return _context2.abrupt("return", res.status(200).send(partner));

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](3);
          return _context2.abrupt("return", res.status(400).send({
            msg: 'Server error'
          }));

        case 13:
          _context2.next = 16;
          break;

        case 15:
          return _context2.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 16:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[3, 10]]);
}); // POST /admin/active-user/fetch-reports

router.post('/fetch-reports', passport.authenticate('admin', {
  session: false
}), function _callee3(req, res) {
  var token, pageSize, pageIndex, _req$body, sort, query, skippage, searchQuery, aggregateQuery, reports, pageCount, brands, months, currencies, totals, allTotals;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context3.next = 38;
            break;
          }

          pageSize = parseInt(req.query.pageSize);
          pageIndex = parseInt(req.query.pageIndex);
          _req$body = req.body, sort = _req$body.sort, query = _req$body.query;
          skippage = pageSize * pageIndex; // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

          searchQuery = mapRegexQueryFromObj(query);
          aggregateQuery = mapQueryForAggregate(query); // have to create this for aggregation query because need to make it mongoose.Types.ObjectId

          _context3.prev = 8;
          _context3.next = 11;
          return regeneratorRuntime.awrap(Report.find(searchQuery).collation({
            locale: 'en',
            strength: 1
          }).sort(sort).skip(skippage).limit(pageSize));

        case 11:
          reports = _context3.sent;
          _context3.next = 14;
          return regeneratorRuntime.awrap(Report.countDocuments(searchQuery));

        case 14:
          pageCount = _context3.sent;
          _context3.next = 17;
          return regeneratorRuntime.awrap(Report.distinct('brand'));

        case 17:
          brands = _context3.sent;
          _context3.next = 20;
          return regeneratorRuntime.awrap(Report.distinct('month'));

        case 20:
          months = _context3.sent;
          _context3.next = 23;
          return regeneratorRuntime.awrap(Report.distinct('account.currency'));

        case 23:
          currencies = _context3.sent;
          _context3.next = 26;
          return regeneratorRuntime.awrap(Report.aggregate([{
            $match: {
              $and: [aggregateQuery]
            }
          }, {
            $group: {
              _id: null,
              commission: {
                $sum: '$account.commission'
              },
              cashback: {
                $sum: '$account.cashback'
              },
              volume: {
                $sum: '$account.transValue'
              },
              deposits: {
                $sum: '$account.deposits'
              },
              rafCashback: {
                $sum: '$account.rafCashback'
              },
              profit: {
                $sum: '$account.profit'
              }
            }
          }]));

        case 26:
          totals = _context3.sent;
          _context3.next = 29;
          return regeneratorRuntime.awrap(Report.aggregate([// all time totals = excludes the $match pipe
          // { $match: { belongsToActiveUser: mongoose.Types.ObjectId(query.belongsToActiveUser) } },
          {
            $group: {
              _id: null,
              allCommission: {
                $sum: '$account.commission'
              },
              allCashback: {
                $sum: '$account.cashback'
              },
              allVolume: {
                $sum: '$account.transValue'
              },
              allDeposits: {
                $sum: '$account.deposits'
              },
              allRafCashback: {
                $sum: '$account.rafCashback'
              },
              allProfit: {
                $sum: '$account.profit'
              }
            }
          }]));

        case 29:
          allTotals = _context3.sent;
          return _context3.abrupt("return", res.status(200).send({
            reports: reports,
            pageCount: pageCount,
            brands: brands,
            months: months,
            currencies: currencies,
            totals: totals,
            allTotals: allTotals
          }));

        case 33:
          _context3.prev = 33;
          _context3.t0 = _context3["catch"](8);
          return _context3.abrupt("return", res.status(400).send(_context3.t0));

        case 36:
          _context3.next = 39;
          break;

        case 38:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 39:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[8, 33]]);
}); // POST /admin/active-user/fetch-applications

router.post('/fetch-applications', passport.authenticate('admin', {
  session: false
}), function _callee4(req, res) {
  var token, pageSize, pageIndex, _req$body2, sort, query, skippage, applications, pageCount, brands, statuses;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context4.next = 27;
            break;
          }

          pageSize = parseInt(req.query.pageSize);
          pageIndex = parseInt(req.query.pageIndex);
          _req$body2 = req.body, sort = _req$body2.sort, query = _req$body2.query;
          skippage = pageSize * pageIndex; // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

          _context4.prev = 6;
          _context4.next = 9;
          return regeneratorRuntime.awrap(Application.find(query).collation({
            locale: 'en',
            strength: 1
          }).sort(sort).skip(skippage).limit(pageSize));

        case 9:
          applications = _context4.sent;
          _context4.next = 12;
          return regeneratorRuntime.awrap(Application.countDocuments(query));

        case 12:
          pageCount = _context4.sent;
          _context4.next = 15;
          return regeneratorRuntime.awrap(Application.distinct('brand'));

        case 15:
          brands = _context4.sent;
          _context4.next = 18;
          return regeneratorRuntime.awrap(Application.distinct('status'));

        case 18:
          statuses = _context4.sent;
          return _context4.abrupt("return", res.status(200).send({
            applications: applications,
            pageCount: pageCount,
            brands: brands,
            statuses: statuses
          }));

        case 22:
          _context4.prev = 22;
          _context4.t0 = _context4["catch"](6);
          return _context4.abrupt("return", res.status(400).send(_context4.t0));

        case 25:
          _context4.next = 28;
          break;

        case 27:
          return _context4.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 28:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[6, 22]]);
}); // POST /admin/active-user/update-application/:_id`, { accountId, action });

router.post('/update-application/:_id', passport.authenticate('admin', {
  session: false
}), function _callee5(req, res) {
  var token, action, today, update, aa, brand, belongsTo, accountId, email, currency, availableUpgrade, activeUser;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context5.next = 42;
            break;
          }

          _context5.prev = 2;
          action = req.body.action;
          today = dayjs().format('DD/MM/YYYY');
          update = {
            status: action === 'YY' || action === 'YN' ? 'Approved' : 'Declined',
            upgradeStatus: action === 'YY' ? "Upgraded ".concat(today) : action === 'YN' ? "Not verified ".concat(today) : "Declined ".concat(today),
            'availableUpgrade.valid': action === 'YY' || action === 'NN' ? false : true
          };
          if (action === 'YY' || action === 'NN') update['availableUpgrade.status'] = '-';
          _context5.next = 9;
          return regeneratorRuntime.awrap(Application.findByIdAndUpdate(req.params._id, update));

        case 9:
          aa = _context5.sent;
          // find and update application and return new application
          brand = aa.brand, belongsTo = aa.belongsTo, accountId = aa.accountId, email = aa.email, currency = aa.currency, availableUpgrade = aa.availableUpgrade; // deconstruct updated application

          _context5.next = 13;
          return regeneratorRuntime.awrap(ActiveUser.findById(belongsTo).select('belongsTo email').populate({
            path: 'belongsTo',
            select: '_id locale'
          }).lean());

        case 13:
          activeUser = _context5.sent;

          if (!(activeUser && activeUser.belongsTo)) {
            _context5.next = 28;
            break;
          }

          if (!(action === 'YY')) {
            _context5.next = 21;
            break;
          }

          createUserNotification(applicationYY({
            brand: brand,
            accountId: accountId,
            belongsTo: activeUser.belongsTo,
            locale: activeUser.belongsTo.locale
          }));
          _context5.next = 19;
          return regeneratorRuntime.awrap(sendEmail(sibApplicationYY({
            locale: activeUser.belongsTo.locale,
            smtpParams: {
              BRAND: brand,
              ACCOUNTID: accountId,
              EMAIL: email,
              OFFER: availableUpgrade.status
            },
            email: activeUser.email
          })));

        case 19:
          _context5.next = 28;
          break;

        case 21:
          if (!(action === 'YN')) {
            _context5.next = 27;
            break;
          }

          createUserNotification(applicationYN({
            brand: brand,
            accountId: accountId,
            belongsTo: activeUser.belongsTo,
            locale: activeUser.belongsTo.locale
          }));
          _context5.next = 25;
          return regeneratorRuntime.awrap(sendEmail(sibApplicationYN({
            locale: activeUser.belongsTo.locale,
            smtpParams: {
              BRAND: brand,
              ACCOUNTID: accountId,
              EMAIL: email,
              OFFER: availableUpgrade.status
            },
            email: activeUser.email
          })));

        case 25:
          _context5.next = 28;
          break;

        case 27:
          if (action === 'NN') {
            createUserNotification(applicationNN({
              brand: brand,
              accountId: accountId,
              belongsTo: activeUser.belongsTo,
              locale: activeUser.belongsTo.locale
            })); // Do not send email as covering NN below
          } else null;

        case 28:
          if (!(action === 'NN')) {
            _context5.next = 31;
            break;
          }

          _context5.next = 31;
          return regeneratorRuntime.awrap(sendEmail(sibApplicationNN({
            locale: activeUser.belongsTo.locale,
            smtpParams: {
              BRAND: brand,
              ACCOUNTID: accountId,
              EMAIL: email
            },
            email: activeUser.email
          })));

        case 31:
          if (!((action === 'YY' || action === 'YN') && belongsTo)) {
            _context5.next = 34;
            break;
          }

          _context5.next = 34;
          return regeneratorRuntime.awrap(createAccountReport({
            accountId: accountId,
            brand: brand,
            belongsTo: belongsTo
          }));

        case 34:
          return _context5.abrupt("return", res.status(201).send(aa));

        case 37:
          _context5.prev = 37;
          _context5.t0 = _context5["catch"](2);
          return _context5.abrupt("return", res.status(400).send({
            msg: 'Error whilst updating application'
          }));

        case 40:
          _context5.next = 43;
          break;

        case 42:
          return _context5.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 43:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[2, 37]]);
}); // POST /admin/active-user/fetch-payments

router.post('/fetch-payments', passport.authenticate('admin', {
  session: false
}), function _callee6(req, res) {
  var token, pageSize, pageIndex, _req$body3, sort, query, skippage, searchQuery, populateQuery, payments, pageCount, brands, statuses, currencies;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context6.next = 40;
            break;
          }

          pageSize = parseInt(req.query.pageSize);
          pageIndex = parseInt(req.query.pageIndex);
          _req$body3 = req.body, sort = _req$body3.sort, query = _req$body3.query;
          skippage = pageSize * pageIndex; // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

          searchQuery = mapRegexQueryFromObj(query);
          populateQuery = mapQueryForPopulate(query);
          _context6.prev = 8;

          if (!isPopulatedValue(query)) {
            _context6.next = 16;
            break;
          }

          _context6.next = 12;
          return regeneratorRuntime.awrap(Payment.find(searchQuery).collation({
            locale: 'en',
            strength: 1
          }).sort(sort).skip(skippage).limit(pageSize).populate({
            path: 'belongsTo',
            select: 'belongsTo',
            populate: {
              path: 'belongsTo',
              match: populateQuery
            }
          }));

        case 12:
          _context6.t0 = function (a) {
            return a.belongsTo.belongsTo;
          };

          payments = _context6.sent.filter(_context6.t0);
          _context6.next = 19;
          break;

        case 16:
          _context6.next = 18;
          return regeneratorRuntime.awrap(Payment.find(searchQuery).collation({
            locale: 'en',
            strength: 1
          }).sort(sort).skip(skippage).limit(pageSize).populate({
            path: 'belongsTo',
            select: 'belongsTo',
            populate: {
              path: 'belongsTo',
              select: 'userId'
            }
          }));

        case 18:
          payments = _context6.sent;

        case 19:
          _context6.next = 21;
          return regeneratorRuntime.awrap(Payment.countDocuments(searchQuery));

        case 21:
          pageCount = _context6.sent;
          _context6.next = 24;
          return regeneratorRuntime.awrap(Payment.distinct('brand'));

        case 24:
          brands = _context6.sent;
          _context6.next = 27;
          return regeneratorRuntime.awrap(Payment.distinct('status'));

        case 27:
          statuses = _context6.sent;
          _context6.next = 30;
          return regeneratorRuntime.awrap(Payment.distinct('currency'));

        case 30:
          currencies = _context6.sent;
          return _context6.abrupt("return", res.status(200).send({
            payments: payments,
            pageCount: pageCount,
            brands: brands,
            statuses: statuses,
            currencies: currencies
          }));

        case 34:
          _context6.prev = 34;
          _context6.t1 = _context6["catch"](8);
          console.log(_context6.t1);
          return _context6.abrupt("return", res.status(400).send(_context6.t1));

        case 38:
          _context6.next = 41;
          break;

        case 40:
          return _context6.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 41:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[8, 34]]);
}); // POST /admin/active-user/update-payment/:_id`, { status });

router.post('/update-payment/:_id', passport.authenticate('admin', {
  session: false
}), function _callee7(req, res, next) {
  var token, status, update, updatedPayment, currency, amount, belongsTo, brand, paymentAccount, activeUser;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context7.next = 24;
            break;
          }

          status = req.body.status;
          update = {
            status: "".concat(status),
            paidDate: status === 'Paid' ? Date.now() : null
          };
          _context7.prev = 4;
          _context7.next = 7;
          return regeneratorRuntime.awrap(Payment.findByIdAndUpdate(req.params._id, update, {
            "new": true
          }));

        case 7:
          updatedPayment = _context7.sent;
          currency = updatedPayment.currency, amount = updatedPayment.amount, belongsTo = updatedPayment.belongsTo, brand = updatedPayment.brand, paymentAccount = updatedPayment.paymentAccount;
          _context7.next = 11;
          return regeneratorRuntime.awrap(ActiveUser.findById(belongsTo).select('belongsTo email').populate({
            path: 'belongsTo',
            select: 'locale'
          }));

        case 11:
          activeUser = _context7.sent;
          // get the _id of the user that activeuser belongsTo
          createUserNotification(paymentResult({
            symbol: currency === 'USD' ? '$' : '€',
            amount: amount,
            status: status,
            belongsTo: activeUser.belongsTo,
            locale: activeUser.belongsTo.locale
          }));
          sendEmail(sibPaymentResult({
            smtpParams: {
              AMOUNT: amount.toFixed(2),
              CURRENCY: currency,
              SYMBOL: currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '$',
              BRAND: brand,
              ACCOUNT: paymentAccount
            },
            email: activeUser.email,
            locale: activeUser.belongsTo.locale,
            status: status
          }));
          req.body = updatedPayment;
          req.params._id = updatedPayment.belongsTo; // changing req.params._id to belongsTo to keep update balance function consistent

          next();
          _context7.next = 22;
          break;

        case 19:
          _context7.prev = 19;
          _context7.t0 = _context7["catch"](4);
          return _context7.abrupt("return", res.status(400).send(_context7.t0));

        case 22:
          _context7.next = 25;
          break;

        case 24:
          return _context7.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 25:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[4, 19]]);
}, updateBalances);

function updateBalances(req, res) {
  // After next() is called on /update-payment/:_id it comes next to updateBalances()
  return updatePersonalBalance({
    _id: req.params._id,
    brand: req.body.brand
  }).then(function () {
    return res.status(201).send({
      msg: "You have paid  ".concat(req.body.currency, " ").concat(req.body.amount.toFixed(2), " ")
    });
  })["catch"](function () {
    return res.status(500).send({
      msg: 'Server error: Please contact support'
    });
  });
} // POST /admin/active-user/delete-application { _id }


router.post('/delete-application', passport.authenticate('admin', {
  session: false
}), function _callee8(req, res) {
  var application;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return regeneratorRuntime.awrap(Application.findByIdAndDelete(req.body._id));

        case 3:
          application = _context8.sent;
          return _context8.abrupt("return", res.status(200).send(application));

        case 7:
          _context8.prev = 7;
          _context8.t0 = _context8["catch"](0);
          return _context8.abrupt("return", res.status(400).send(_context8.t0));

        case 10:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // POST /admin/active-user/fetch-quarter-data

router.post('/fetch-quarter-data', passport.authenticate('admin', {
  session: false
}), function _callee9(req, res) {
  var token, _req$body4, accountId, quarter, q, upgrades;

  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context9.next = 18;
            break;
          }

          _req$body4 = req.body, accountId = _req$body4.accountId, quarter = _req$body4.quarter;
          _context9.prev = 3;
          _context9.next = 6;
          return regeneratorRuntime.awrap(Quarter.findOne({
            accountId: accountId,
            quarter: quarter
          }));

        case 6:
          q = _context9.sent;
          _context9.next = 9;
          return regeneratorRuntime.awrap(Upgrade.find({
            accountId: accountId,
            quarter: quarter
          }));

        case 9:
          upgrades = _context9.sent;
          return _context9.abrupt("return", res.status(200).send({
            q: q,
            upgrades: upgrades
          }));

        case 13:
          _context9.prev = 13;
          _context9.t0 = _context9["catch"](3);
          return _context9.abrupt("return", res.status(403).send({
            success: false,
            msg: _context9.t0
          }));

        case 16:
          _context9.next = 19;
          break;

        case 18:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 19:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[3, 13]]);
});
module.exports = router;