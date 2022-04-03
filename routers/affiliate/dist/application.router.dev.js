"use strict";

var passport = require('passport');

require('../../auth/passport')(passport);

var express = require('express');

var router = express.Router();

var _require = require('../../utils/token.utils'),
    getToken = _require.getToken;

var _require2 = require('../../models/affiliate/index'),
    AffApplication = _require2.AffApplication,
    AffPartner = _require2.AffPartner,
    AffUpgrade = _require2.AffUpgrade;

var _require3 = require('../../models/personal/index'),
    Application = _require3.Application;

var _require4 = require('../../utils/helper-functions'),
    mapRegexQueryFromObj = _require4.mapRegexQueryFromObj;

var dayjs = require('dayjs');

var _require5 = require('../../utils/notifications-functions'),
    createAffNotification = _require5.createAffNotification;

var _require6 = require('../../models/common'),
    Quarter = _require6.Quarter,
    User = _require6.User;

var _require7 = require('../../utils/notifications-list'),
    hasApplied = _require7.hasApplied; // POST /affiliate/application/create


router.post('/create', passport.authenticate('jwt', {
  session: false
}), function _callee(req, res) {
  var token, applications, partner, _ref, locale;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context.next = 24;
            break;
          }

          _context.prev = 2;
          _context.next = 5;
          return regeneratorRuntime.awrap(AffApplication.create(req.body.applications));

        case 5:
          applications = _context.sent;
          _context.next = 8;
          return regeneratorRuntime.awrap(AffPartner.findById(applications[0].belongsTo).select('belongsTo').lean());

        case 8:
          partner = _context.sent;
          _context.next = 11;
          return regeneratorRuntime.awrap(User.findById(partner.belongsTo).select('locale').lean());

        case 11:
          _ref = _context.sent;
          locale = _ref.locale;
          _context.next = 15;
          return regeneratorRuntime.awrap(applications.map(function (a) {
            createAffNotification(hasApplied({
              accountId: a.accountId,
              _id: a.belongsTo,
              locale: locale
            }));
          }));

        case 15:
          return _context.abrupt("return", res.status(201).send(applications));

        case 18:
          _context.prev = 18;
          _context.t0 = _context["catch"](2);
          console.log(_context.t0);
          return _context.abrupt("return", res.status(400).send({
            success: false
          }));

        case 22:
          _context.next = 25;
          break;

        case 24:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 25:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[2, 18]]);
}); // GET /affiliate/application/request-upgrade/:_id`

router.get('/request-upgrade/:_id', passport.authenticate('jwt', {
  session: false
}), function _callee2(req, res) {
  var token, vipRequest;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context2.next = 8;
            break;
          }

          _context2.next = 4;
          return regeneratorRuntime.awrap(AffApplication.findByIdAndUpdate(req.params._id, {
            upgradeStatus: "Requested ".concat(dayjs().format('DD/MM/YYYY')),
            'availableUpgrade.valid': false,
            $inc: {
              requestCount: 1
            }
          }, {
            "new": true
          }).select('availableUpgrade.status accountId belongsTo').lean());

        case 4:
          vipRequest = _context2.sent;
          return _context2.abrupt("return", res.status(200).send(vipRequest));

        case 8:
          return _context2.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // GET /affiliate/application/check/:accountId

router.get('/check/:accountId', passport.authenticate('jwt', {
  session: false
}), function _callee3(req, res) {
  var accountId, token, existsOne, existsTwo;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          accountId = req.params.accountId;
          token = getToken(req.headers);

          if (!token) {
            _context3.next = 16;
            break;
          }

          _context3.next = 5;
          return regeneratorRuntime.awrap(Application.countDocuments({
            accountId: accountId
          }).select('accountId').lean());

        case 5:
          existsOne = _context3.sent;
          _context3.next = 8;
          return regeneratorRuntime.awrap(AffApplication.countDocuments({
            accountId: accountId
          }).select('accountId').lean());

        case 8:
          existsTwo = _context3.sent;

          if (!(existsOne === 0 && existsTwo === 0)) {
            _context3.next = 13;
            break;
          }

          return _context3.abrupt("return", res.send({
            success: true
          }));

        case 13:
          return _context3.abrupt("return", res.send({
            success: false
          }));

        case 14:
          _context3.next = 17;
          break;

        case 16:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 17:
        case "end":
          return _context3.stop();
      }
    }
  });
}); // POST /affiliate/application/fetch-applications?pageSize=${pageSize}&pageIndex=${pageIndex}

router.post('/fetch-applications', passport.authenticate('jwt', {
  session: false
}), getApplications); // returns applications

function getApplications(req, res) {
  var token, pageSize, pageIndex, _req$body, sort, query, skippage, applications, pageCount, brands, statuses;

  return regeneratorRuntime.async(function getApplications$(_context4) {
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
          _req$body = req.body, sort = _req$body.sort, query = _req$body.query;
          skippage = pageSize * pageIndex; // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

          query = mapRegexQueryFromObj(query);
          _context4.prev = 7;
          _context4.next = 10;
          return regeneratorRuntime.awrap(AffApplication.find(query).collation({
            locale: 'en',
            strength: 1
          }).sort(sort).skip(skippage).limit(pageSize).lean());

        case 10:
          applications = _context4.sent;
          _context4.next = 13;
          return regeneratorRuntime.awrap(AffApplication.countDocuments(query));

        case 13:
          pageCount = _context4.sent;
          _context4.next = 16;
          return regeneratorRuntime.awrap(AffApplication.distinct('brand'));

        case 16:
          brands = _context4.sent;
          _context4.next = 19;
          return regeneratorRuntime.awrap(AffApplication.distinct('status'));

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
} // POST /affiliate/application/request-extra-upgrade` { accountId, quarter, level }


router.post('/request-extra-upgrade', passport.authenticate('jwt', {
  session: false
}), function _callee4(req, res) {
  var token, _req$body2, accountId, quarter, level;

  return regeneratorRuntime.async(function _callee4$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context5.next = 10;
            break;
          }

          _req$body2 = req.body, accountId = _req$body2.accountId, quarter = _req$body2.quarter, level = _req$body2.level;
          _context5.next = 5;
          return regeneratorRuntime.awrap(AffApplication.findOneAndUpdate({
            accountId: accountId
          }, {
            upgradeStatus: "Requested ".concat(dayjs().format('DD/MM/YYYY')),
            'availableUpgrade.valid': false,
            requestCount: 1
          }, {
            "new": true
          }).select('availableUpgrade.status availableUpgrade.valid requestCount accountId belongsTo').lean());

        case 5:
          _context5.next = 7;
          return regeneratorRuntime.awrap(AffUpgrade.deleteOne({
            accountId: accountId,
            quarter: quarter,
            level: level
          }));

        case 7:
          return _context5.abrupt("return", res.status(200).send({
            msg: "We have received your ".concat(level, " VIP request for ").concat(accountId)
          }));

        case 10:
          return _context5.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 11:
        case "end":
          return _context5.stop();
      }
    }
  });
});
module.exports = router;