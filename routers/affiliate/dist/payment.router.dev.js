"use strict";

var express = require('express');

var router = express.Router();

var passport = require('passport');

require('../../auth/passport')(passport);

var _require = require('../../utils/token.utils'),
    getToken = _require.getToken;

var _require2 = require('../../models/affiliate'),
    AffPayment = _require2.AffPayment,
    AffPartner = _require2.AffPartner;

var _require3 = require('../../models/common'),
    User = _require3.User;

var _require4 = require('../../utils/helper-functions'),
    mapRegexQueryFromObj = _require4.mapRegexQueryFromObj;

var _require5 = require('../../utils/notifications-functions'),
    createAffNotification = _require5.createAffNotification;

var _require6 = require('../../utils/admin-job-functions'),
    createAdminJob = _require6.createAdminJob;

var _require7 = require('../../utils/balance-helpers'),
    updateAffiliateBalance = _require7.updateAffiliateBalance;

var _require8 = require('../../utils/sib-helpers'),
    sendEmail = _require8.sendEmail;

var _require9 = require('../../utils/notifications-list'),
    requestedPayment = _require9.requestedPayment; // /affiliate/payment/create-payment/:_id


router.post('/create-payment/:_id', passport.authenticate('jwt', {
  session: false
}), createPayment, updateBalances); // returns activeUser

function createPayment(req, res, next) {
  var token, balance, newPayment, currency, amount, brand, paymentAccount, belongsTo, partner, _ref, locale, email, cryptos;

  return regeneratorRuntime.async(function createPayment$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context.next = 30;
            break;
          }

          _context.next = 4;
          return regeneratorRuntime.awrap(AffPartner.findById(req.params._id).select('stats'));

        case 4:
          _context.t0 = function (a) {
            return a.currency === req.body.currency;
          };

          balance = _context.sent.stats.balance.find(_context.t0).amount;

          if (!(balance < req.body.amount)) {
            _context.next = 8;
            break;
          }

          return _context.abrupt("return", res.status(403).send({
            msg: 'You have insufficient funds to request this amount'
          }));

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(AffPayment.create({
            amount: req.body.amount,
            currency: req.body.currency,
            brand: req.body.brand,
            paymentAccount: req.body.paymentAccount,
            belongsTo: req.params._id
          }));

        case 10:
          newPayment = _context.sent;
          currency = newPayment.currency, amount = newPayment.amount, brand = newPayment.brand, paymentAccount = newPayment.paymentAccount, belongsTo = newPayment.belongsTo;
          _context.next = 14;
          return regeneratorRuntime.awrap(AffPartner.findById(belongsTo).select('belongsTo').lean());

        case 14:
          partner = _context.sent;
          _context.next = 17;
          return regeneratorRuntime.awrap(User.findById(partner.belongsTo));

        case 17:
          _ref = _context.sent;
          locale = _ref.locale;
          createAffNotification(requestedPayment({
            symbol: currency === 'USD' ? '$' : '€',
            amount: amount,
            brand: brand,
            paymentAccount: paymentAccount,
            belongsTo: belongsTo,
            locale: locale
          }));
          _context.next = 22;
          return regeneratorRuntime.awrap(AffPartner.findById(req.params._id).select('belongsTo').populate({
            path: 'belongsTo',
            select: 'email'
          }));

        case 22:
          email = _context.sent.belongsTo.email;
          sendEmail({
            // send email ( doesn't matter if belongsTo or not because it is just submitting );
            templateId: 23,
            smtpParams: {
              AMOUNT: amount.toFixed(2),
              CURRENCY: currency,
              SYMBOL: currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '$',
              BRAND: brand,
              ACCOUNT: paymentAccount
            },
            tags: ['Payment'],
            email: email
          });
          cryptos = ['BitCoin'];

          if (cryptos.includes(req.body.brand)) {
            sendEmail({
              // send email ( doesn't matter if belongsTo or not because it is just submitting );
              templateId: 70,
              smtpParams: {
                AMOUNT: amount.toFixed(2),
                CURRENCY: currency,
                SYMBOL: currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '$',
                BRAND: brand,
                ACCOUNT: paymentAccount
              },
              tags: ['Payment'],
              email: email
            });
          }

          req.newPayment = newPayment; // creates new payment and then adds it to req object before calling return next()

          next();
          _context.next = 31;
          break;

        case 30:
          return _context.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 31:
        case "end":
          return _context.stop();
      }
    }
  });
}

function updateBalances(req, res) {
  // After next() is called on createPayment() it comes next to updateBalances()
  return updateAffiliateBalance({
    _id: req.params._id
  }).then(function () {
    return res.status(201).send({
      newPayment: req.newPayment,
      msg: "You have requested ".concat(req.body.currency, " ").concat(req.body.amount.toFixed(2), " ")
    });
  })["catch"](function () {
    return res.status(500).send({
      msg: 'Server error: Please contact support'
    });
  });
} // POST /affiliate/payment/fetch-payments


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
          return regeneratorRuntime.awrap(AffPayment.find(query).collation({
            locale: 'en',
            strength: 1
          }).sort(sort).skip(skippage).limit(pageSize));

        case 10:
          payments = _context2.sent;
          _context2.next = 13;
          return regeneratorRuntime.awrap(AffPayment.countDocuments(query));

        case 13:
          pageCount = _context2.sent;
          _context2.next = 16;
          return regeneratorRuntime.awrap(AffPayment.distinct('brand'));

        case 16:
          brands = _context2.sent;
          _context2.next = 19;
          return regeneratorRuntime.awrap(AffPayment.distinct('status'));

        case 19:
          statuses = _context2.sent;
          _context2.next = 22;
          return regeneratorRuntime.awrap(AffPayment.distinct('currency'));

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