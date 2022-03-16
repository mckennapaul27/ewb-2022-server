"use strict";

var express = require('express');

var router = express.Router();

var passport = require('passport');

require('../../auth/passport')(passport);

var dayjs = require('dayjs');

var _require = require('../../utils/token.utils'),
    getToken = _require.getToken;

var _require2 = require('../../models/personal'),
    Application = _require2.Application,
    ActiveUser = _require2.ActiveUser;

var _require3 = require('../../models/affiliate/index'),
    AffApplication = _require3.AffApplication;

var _require4 = require('../../utils/notifications-functions'),
    createUserNotification = _require4.createUserNotification;

var _require5 = require('../../utils/notifications-list'),
    updateApplication = _require5.updateApplication,
    hasApplied = _require5.hasApplied;

var _require6 = require('../../utils/helper-functions'),
    mapRegexQueryFromObj = _require6.mapRegexQueryFromObj;

var _require7 = require('../../utils/sib-helpers'),
    sendEmail = _require7.sendEmail;

var _require8 = require('../../utils/error-messages'),
    err7 = _require8.err7;

var _require9 = require('../../utils/success-messages'),
    msgVIPRequestSubmitted = _require9.msgVIPRequestSubmitted,
    msgApplicationSubmitted = _require9.msgApplicationSubmitted;

var _require10 = require('../../utils/sib-transactional-templates'),
    sibPersonalApplicationSubmit = _require10.sibPersonalApplicationSubmit; //  /personal/application/request-upgrade/:_id`) - THIS IS UP-TO-DATE 2/3/22


router.post('/request-upgrade/:_id', passport.authenticate('jwt', {
  session: false
}), function _callee(req, res, next) {
  var token, vipRequest, _id;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context.next = 14;
            break;
          }

          _context.next = 4;
          return regeneratorRuntime.awrap(Application.findByIdAndUpdate(req.params._id, {
            upgradeStatus: "Requested ".concat(dayjs().format('DD/MM/YYYY')),
            'availableUpgrade.valid': false,
            $inc: {
              requestCount: 1
            }
          }, {
            "new": true
          }).select('availableUpgrade.status accountId belongsTo'));

        case 4:
          vipRequest = _context.sent;

          if (!vipRequest.belongsTo) {
            _context.next = 10;
            break;
          }

          _context.next = 8;
          return regeneratorRuntime.awrap(ActiveUser.findById(vipRequest.belongsTo).select('belongsTo').lean());

        case 8:
          _id = _context.sent.belongsTo;
          // get the _id of the user that activeuser belongsTo
          createUserNotification(updateApplication({
            status: vipRequest.availableUpgrade.status,
            accountId: vipRequest.accountId,
            _id: _id,
            locale: req.body.locale
          }));

        case 10:
          req.vipRequest = vipRequest;
          next();
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
  });
}, getApplications); // /personal/application/create-personal-application-from-dashboard - THIS IS UP-TO-DATE 2/3/22 (for use when submitting from new dashboard FORM)

router.post('/create-personal-application-from-dashboard', passport.authenticate('jwt', {
  session: false
}), function _callee2(req, res) {
  var token, _req$body, accountId, activeUser, brand, upgrade, locale, existsOne, existsTwo, newApp, _ref, belongsTo, email;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context2.next = 25;
            break;
          }

          _req$body = req.body, accountId = _req$body.accountId, activeUser = _req$body.activeUser, brand = _req$body.brand, upgrade = _req$body.upgrade, locale = _req$body.locale;
          _context2.next = 5;
          return regeneratorRuntime.awrap(Application.countDocuments({
            accountId: accountId
          }).select('accountId').lean());

        case 5:
          existsOne = _context2.sent;
          _context2.next = 8;
          return regeneratorRuntime.awrap(AffApplication.countDocuments({
            accountId: accountId
          }).select('accountId').lean());

        case 8:
          existsTwo = _context2.sent;

          if (!(existsOne > 0 || existsTwo > 0)) {
            _context2.next = 11;
            break;
          }

          return _context2.abrupt("return", res.status(400).send(err7({
            accountId: accountId,
            locale: locale
          })));

        case 11:
          _context2.next = 13;
          return regeneratorRuntime.awrap(Application.create({
            brand: brand,
            accountId: accountId,
            email: req.body.email,
            // using req.body as need to access email from activeuser below
            belongsTo: activeUser,
            'availableUpgrade.status': upgrade
          }));

        case 13:
          newApp = _context2.sent;
          _context2.next = 16;
          return regeneratorRuntime.awrap(ActiveUser.findById(newApp.belongsTo).select('belongsTo email').lean());

        case 16:
          _ref = _context2.sent;
          belongsTo = _ref.belongsTo;
          email = _ref.email;
          // get the _id of the user that activeuser belongsTo
          createUserNotification(hasApplied({
            accountId: newApp.accountId,
            _id: belongsTo,
            locale: locale
          }));
          _context2.next = 22;
          return regeneratorRuntime.awrap(sendEmail(sibPersonalApplicationSubmit({
            locale: locale,
            smtpParams: {
              BRAND: brand,
              ACCOUNTID: accountId,
              EMAIL: req.body.email,
              // different 'email' to one used below
              STATUS: newApp.status
            },
            email: email
          })));

        case 22:
          return _context2.abrupt("return", res.status(201).send(msgApplicationSubmitted({
            locale: locale,
            accountId: accountId
          })));

        case 25:
          return _context2.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 26:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // returns applications - THIS IS UP-TO-DATE 2/3/22

function getApplications(req, res) {
  var token, vipRequest, newApp, msg, applications;
  return regeneratorRuntime.async(function getApplications$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context3.next = 17;
            break;
          }

          vipRequest = req.vipRequest ? req.vipRequest : null;
          newApp = req.newApp ? req.newApp : null;
          msg = req.vipRequest ? msgVIPRequestSubmitted({
            locale: req.body.locale,
            status: req.vipRequest.availableUpgrade.status,
            accountId: req.vipRequest.accountId
          }) : req.newApp ? msgVIPRequestSubmitted({
            locale: req.body.locale,
            status: req.newApp.availableUpgrade.status,
            accountId: req.newApp.accountId
          }) : '';
          _context3.prev = 5;
          _context3.next = 8;
          return regeneratorRuntime.awrap(Application.find({
            belongsTo: req.body.activeUser,
            status: {
              $in: ['Approved', 'Confirmed']
            }
          }).sort({
            dateAdded: 'desc'
          }).lean());

        case 8:
          applications = _context3.sent;
          return _context3.abrupt("return", res.status(200).send({
            applications: applications,
            vipRequest: vipRequest,
            newApp: newApp,
            msg: msg.msg
          }));

        case 12:
          _context3.prev = 12;
          _context3.t0 = _context3["catch"](5);
          return _context3.abrupt("return", res.status(500).send(serverErr({
            locale: req.body.locale
          })));

        case 15:
          _context3.next = 18;
          break;

        case 17:
          return _context3.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 18:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[5, 12]]);
} // POST /personal/application/fetch-applications - THIS IS UP-TO-DATE 2/3/22


router.post('/fetch-applications', passport.authenticate('jwt', {
  session: false
}), function _callee3(req, res) {
  var token, pageSize, pageIndex, _req$body2, sort, query, skippage, applications, pageCount, brands, statuses;

  return regeneratorRuntime.async(function _callee3$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context4.next = 28;
            break;
          }

          pageSize = parseInt(req.query.pageSize);
          pageIndex = parseInt(req.query.pageIndex);
          _req$body2 = req.body, sort = _req$body2.sort, query = _req$body2.query;
          skippage = pageSize * pageIndex; // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

          query = mapRegexQueryFromObj(query);
          _context4.prev = 7;
          _context4.next = 10;
          return regeneratorRuntime.awrap(Application.find(query).collation({
            locale: 'en',
            strength: 2
          }).sort(sort).skip(skippage).limit(pageSize));

        case 10:
          applications = _context4.sent;
          _context4.next = 13;
          return regeneratorRuntime.awrap(Application.countDocuments(query));

        case 13:
          pageCount = _context4.sent;
          _context4.next = 16;
          return regeneratorRuntime.awrap(Application.distinct('brand'));

        case 16:
          brands = _context4.sent;
          _context4.next = 19;
          return regeneratorRuntime.awrap(Application.distinct('status'));

        case 19:
          statuses = _context4.sent;
          return _context4.abrupt("return", res.status(200).send({
            applications: applications,
            pageCount: pageCount,
            brands: brands,
            statuses: statuses
          }));

        case 23:
          _context4.prev = 23;
          _context4.t0 = _context4["catch"](7);
          return _context4.abrupt("return", res.status(400).send(_context4.t0));

        case 26:
          _context4.next = 29;
          break;

        case 28:
          return _context4.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 29:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[7, 23]]);
});
module.exports = router;