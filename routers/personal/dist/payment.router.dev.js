"use strict";

var express = require('express');

var router = express.Router();

var passport = require('passport');

require('../../auth/passport')(passport);

var _require = require('../../utils/token.utils'),
    getToken = _require.getToken;

var _require2 = require('../../models/personal'),
    ActiveUser = _require2.ActiveUser,
    Payment = _require2.Payment;

var _require3 = require('../../utils/notifications-functions'),
    createUserNotification = _require3.createUserNotification;

var _require4 = require('../../utils/notifications-list'),
    requestedPayment = _require4.requestedPayment;

var _require5 = require('../../utils/helper-functions'),
    mapRegexQueryFromObj = _require5.mapRegexQueryFromObj;

var _require6 = require('../../utils/balance-helpers'),
    updatePersonalBalance = _require6.updatePersonalBalance;

var _require7 = require('../../utils/sib-helpers'),
    sendEmail = _require7.sendEmail;

var _require8 = require('../../utils/sib-transactional-templates'),
    sibPaymentRequest = _require8.sibPaymentRequest;

var _require9 = require('../../utils/success-messages'),
    msgPaymentRequest = _require9.msgPaymentRequest;

var _require10 = require('accounting'),
    formatMoney = _require10.formatMoney;

var _require11 = require('../../utils/error-messages'),
    serverErr = _require11.serverErr; // /personal/payment/create-payment/:_id - THIS IS UP-TO-DATE 1/3/22


router.post('/create-payment/:_id', passport.authenticate('jwt', {
  session: false
}), createPayment, updateBalances); // returns activeUser

function createPayment(req, res, next) {
  var token, current, newPayment, currency, amount, brand, paymentAccount, belongsTo, activeUser;
  return regeneratorRuntime.async(function createPayment$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // - THIS IS UP-TO-DATE 1/3/22
          token = getToken(req.headers);

          if (!token) {
            _context.next = 23;
            break;
          }

          _context.next = 4;
          return regeneratorRuntime.awrap(ActiveUser.findById(req.params._id).select('balances'));

        case 4:
          _context.t0 = function (a) {
            return a.brand === req.body.brand;
          };

          current = _context.sent.balances.find(_context.t0).current;

          if (!(current < req.body.amount)) {
            _context.next = 10;
            break;
          }

          return _context.abrupt("return", res.status(403).send({
            msg: 'You have insufficient funds to request this amount'
          }));

        case 10:
          _context.next = 12;
          return regeneratorRuntime.awrap(Payment.create({
            amount: req.body.amount,
            currency: req.body.currency,
            brand: req.body.brand,
            paymentAccount: req.body.paymentAccount,
            belongsTo: req.params._id
          }));

        case 12:
          newPayment = _context.sent;
          currency = newPayment.currency, amount = newPayment.amount, brand = newPayment.brand, paymentAccount = newPayment.paymentAccount, belongsTo = newPayment.belongsTo;
          _context.next = 16;
          return regeneratorRuntime.awrap(ActiveUser.findById(belongsTo).select('belongsTo').populate({
            path: 'belongsTo',
            select: 'email'
          }));

        case 16:
          activeUser = _context.sent;
          createUserNotification(requestedPayment({
            symbol: currency === 'USD' ? '$' : '€',
            amount: amount,
            brand: brand,
            paymentAccount: paymentAccount,
            locale: req.body.locale,
            belongsTo: activeUser.belongsTo._id
          }));
          sendEmail(sibPaymentRequest({
            locale: req.body.locale,
            smtpParams: {
              AMOUNT: amount.toFixed(2),
              CURRENCY: currency,
              SYMBOL: currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '$',
              BRAND: brand,
              ACCOUNT: paymentAccount
            },
            email: activeUser.belongsTo.email
          }));
          req.newPayment = newPayment; // creates new payment and then adds it to req object before calling return next()

          next();

        case 21:
          _context.next = 24;
          break;

        case 23:
          return _context.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 24:
        case "end":
          return _context.stop();
      }
    }
  });
}

function updateBalances(req, res) {
  // After next() is called on createPayment() it comes next to updateBalances()
  return updatePersonalBalance({
    _id: req.params._id,
    brand: req.body.brand
  }).then(function () {
    return res.status(201).send(msgPaymentRequest({
      locale: req.body.locale,
      currency: req.body.currency,
      amount: formatMoney(req.body.amount, req.body.currency === 'USD' ? '$' : req.body.currency === 'EUR' ? '€' : '$', 2),
      newPayment: req.newPayment
    }));
  })["catch"](function (err) {
    return res.status(500).send(serverErr({
      locale: req.body.locale
    }));
  });
} // POST /personal/payment/fetch-payments - THIS IS UP-TO-DATE 1/3/22


router.post('/fetch-payments', passport.authenticate('jwt', {
  session: false
}), function _callee(req, res) {
  var token, pageSize, pageIndex, _req$body, sort, query, skippage, payments, pageCount, brands, statuses, currencies;

  return regeneratorRuntime.async(function _callee$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context2.next = 31;
            break;
          }

          pageSize = parseInt(req.query.pageSize);
          pageIndex = parseInt(req.query.pageIndex);
          _req$body = req.body, sort = _req$body.sort, query = _req$body.query;
          skippage = pageSize * pageIndex; // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

          query = mapRegexQueryFromObj(query);
          _context2.prev = 7;
          _context2.next = 10;
          return regeneratorRuntime.awrap(Payment.find(query).collation({
            locale: 'en',
            strength: 1
          }).sort(sort).skip(skippage).limit(pageSize));

        case 10:
          payments = _context2.sent;
          _context2.next = 13;
          return regeneratorRuntime.awrap(Payment.countDocuments(query));

        case 13:
          pageCount = _context2.sent;
          _context2.next = 16;
          return regeneratorRuntime.awrap(Payment.distinct('brand'));

        case 16:
          brands = _context2.sent;
          _context2.next = 19;
          return regeneratorRuntime.awrap(Payment.distinct('status'));

        case 19:
          statuses = _context2.sent;
          _context2.next = 22;
          return regeneratorRuntime.awrap(Payment.distinct('currency'));

        case 22:
          currencies = _context2.sent;
          return _context2.abrupt("return", res.status(200).send({
            payments: payments,
            pageCount: pageCount,
            brands: brands,
            statuses: statuses,
            currencies: currencies
          }));

        case 26:
          _context2.prev = 26;
          _context2.t0 = _context2["catch"](7);
          return _context2.abrupt("return", res.status(400).send(_context2.t0));

        case 29:
          _context2.next = 32;
          break;

        case 31:
          return _context2.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 32:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[7, 26]]);
}); // useful links
// https://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-express-js

module.exports = router;