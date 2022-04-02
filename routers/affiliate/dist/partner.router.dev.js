"use strict";

var passport = require('passport');

require('../../auth/passport')(passport);

var express = require('express');

var router = express.Router();

var _require = require('../../utils/token.utils'),
    getToken = _require.getToken;

var _require2 = require('../../models/affiliate/index'),
    AffPartner = _require2.AffPartner,
    AffNotification = _require2.AffNotification,
    AffApproval = _require2.AffApproval;

var _require3 = require('../../models/common'),
    User = _require3.User;

var _require4 = require('../../utils/helper-functions'),
    mapRegexQueryFromObj = _require4.mapRegexQueryFromObj;

var _require5 = require('../../utils/notifications-functions'),
    createAffNotification = _require5.createAffNotification;

var _require6 = require('../../utils/admin-job-functions'),
    createAdminJob = _require6.createAdminJob;

var _require7 = require('../../utils/sib-helpers'),
    sendEmail = _require7.sendEmail;

var _require8 = require('../../utils/notifications-list'),
    updatedPaymentDetails = _require8.updatedPaymentDetails,
    linksRequested = _require8.linksRequested;

var _require9 = require('../../utils/success-messages'),
    msgRequestedLinks = _require9.msgRequestedLinks;

var _require10 = require('../../utils/error-messages'),
    errRequestNotSuccess = _require10.errRequestNotSuccess; // POST /affiliate/partner/fetch-details/:_id


router.post('/fetch-details/:_id', passport.authenticate('jwt', {
  // with this function we can return any fields we need by sending req.body.select
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
          return regeneratorRuntime.awrap(AffPartner.findById(req.params._id).select(req.body.select).lean());

        case 5:
          partner = _context.sent;
          return _context.abrupt("return", res.status(200).send(partner));

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](2);
          return _context.abrupt("return", res.status(400).send({
            success: false
          }));

        case 12:
          _context.next = 15;
          break;

        case 14:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[2, 9]]);
}); // POST /affiliate/partner/update-partner-payment-details/:_id

router.post('/update-payment-details/:_id', passport.authenticate('jwt', {
  session: false
}), function _callee2(req, res) {
  var token, partner, _ref, _locale;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context2.next = 20;
            break;
          }

          _context2.prev = 2;
          _context2.next = 5;
          return regeneratorRuntime.awrap(AffPartner.findByIdAndUpdate(req.params._id, {
            paymentDetails: req.body.paymentDetails
          }, {
            "new": true,
            select: 'paymentDetails email belongsTo'
          }));

        case 5:
          partner = _context2.sent;
          _context2.next = 8;
          return regeneratorRuntime.awrap(User.findById(partner.belongsTo));

        case 8:
          _ref = _context2.sent;
          _locale = _ref.locale;
          createAffNotification(updatedPaymentDetails({
            locale: _locale,
            brand: req.body.brand,
            belongsTo: req.params._id
          }));
          sendEmail({
            // send email ( doesn't matter if belongsTo or not because it is just submitting );
            templateId: 19,
            smtpParams: {
              NONE: null
            },
            tags: ['Account'],
            email: partner.email
          });
          return _context2.abrupt("return", res.status(200).send(partner));

        case 15:
          _context2.prev = 15;
          _context2.t0 = _context2["catch"](2);
          return _context2.abrupt("return", res.status(400).send({
            success: false
          }));

        case 18:
          _context2.next = 21;
          break;

        case 20:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 21:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[2, 15]]);
}); // POST /affiliate/partner/request-links/:_id

router.post('/request-links/:_id', passport.authenticate('jwt', {
  session: false
}), function _callee3(req, res) {
  var token, partner, _ref2, _locale2;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context3.next = 21;
            break;
          }

          _context3.prev = 2;
          _context3.next = 5;
          return regeneratorRuntime.awrap(AffPartner.findByIdAndUpdate(req.params._id, {
            brandAssets: req.body.brandAssets
          }, {
            "new": true,
            select: 'brandAssets email epi belongsTo'
          }));

        case 5:
          partner = _context3.sent;
          _context3.next = 8;
          return regeneratorRuntime.awrap(User.findById(partner.belongsTo));

        case 8:
          _ref2 = _context3.sent;
          _locale2 = _ref2.locale;
          createAffNotification(linksRequested({
            brand: req.body.brand,
            locale: _locale2,
            belongsTo: req.params._id
          }));
          createAdminJob({
            message: "Partner ".concat(partner.email, " / ").concat(partner.epi, " has requested additional links for ").concat(req.body.brand),
            status: 'Pending',
            partner: req.params._id,
            type: 'Links'
          });
          sendEmail({
            templateId: 44,
            smtpParams: {
              BRAND: req.body.brand
            },
            tags: ['Account'],
            email: partner.email
          });
          return _context3.abrupt("return", res.status(200).send(msgRequestedLinks({
            locale: _locale2,
            brand: req.body.brand,
            partner: partner
          })));

        case 16:
          _context3.prev = 16;
          _context3.t0 = _context3["catch"](2);
          return _context3.abrupt("return", res.status(400).send(errRequestNotSuccess({
            locale: locale
          })));

        case 19:
          _context3.next = 22;
          break;

        case 21:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 22:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[2, 16]]);
}); // POST /affiliate/partner/request-approval/:_id

router.post('/request-approval/:_id', passport.authenticate('jwt', {
  session: false
}), function _callee4(req, res) {
  var token, _req$body$data, brand, accountId, name, _id, partner;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context4.next = 19;
            break;
          }

          _context4.prev = 2;
          _req$body$data = req.body.data, brand = _req$body$data.brand, accountId = _req$body$data.accountId, name = _req$body$data.name, _id = _req$body$data._id;
          _context4.next = 6;
          return regeneratorRuntime.awrap(AffPartner.findByIdAndUpdate(req.params._id, {
            requestedApproval: true,
            isPermitted: null
          }, {
            "new": true,
            select: 'requestedApproval email epi'
          }));

        case 6:
          partner = _context4.sent;
          _context4.next = 9;
          return regeneratorRuntime.awrap(AffApproval.create({
            brand: brand,
            accountId: accountId,
            name: name,
            belongsTo: _id
          }));

        case 9:
          createAdminJob({
            message: "Partner ".concat(partner.email, " / ").concat(partner.epi, " requested approval for BD and IN"),
            status: 'Pending',
            partner: req.params._id,
            type: 'Links'
          });
          sendEmail({
            templateId: 76,
            smtpParams: {
              NAME: name,
              BRAND: brand,
              ACCOUNTID: accountId
            },
            tags: ['Account'],
            email: partner.email
          });
          return _context4.abrupt("return", res.status(200).send(partner));

        case 14:
          _context4.prev = 14;
          _context4.t0 = _context4["catch"](2);
          return _context4.abrupt("return", res.status(400).send({
            success: false
          }));

        case 17:
          _context4.next = 20;
          break;

        case 19:
          res.status(403).send({
            success: false,
            msg: 'Unauthorised'
          });

        case 20:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[2, 14]]);
}); // POST /affiliate/partner/fetch-notifications?pageSize=${pageSize}&pageIndex=${pageIndex}

router.post('/fetch-notifications', passport.authenticate('jwt', {
  session: false
}), function _callee5(req, res) {
  var token, pageSize, pageIndex, _req$body, sort, query, skippage, regDate, orQuery, searchQuery, notifications, pageCount, types;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context5.next = 31;
            break;
          }

          pageSize = parseInt(req.query.pageSize);
          pageIndex = parseInt(req.query.pageIndex);
          _req$body = req.body, sort = _req$body.sort, query = _req$body.query;
          skippage = pageSize * pageIndex; // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

          _context5.next = 8;
          return regeneratorRuntime.awrap(AffPartner.findById(query.belongsTo).select('belongsTo').populate({
            path: 'belongsTo',
            select: 'regDate'
          }));

        case 8:
          regDate = _context5.sent.belongsTo.regDate;
          orQuery = {
            isGeneral: true,
            createdAt: {
              $gte: regDate
            }
          };
          query = mapRegexQueryFromObj(query);
          if (query.type) orQuery['type'] = query.type; // we need orQuery to look for general notifications. We also only add 'type' to the orQuery if it exists in query, otherwise it will just return all isGeneral: true messages despite the filter

          searchQuery = query.message ? query : {
            $or: [query, orQuery]
          }; // only use orQuery if no 'message' is queried.

          _context5.prev = 13;
          _context5.next = 16;
          return regeneratorRuntime.awrap(AffNotification.find(searchQuery).collation({
            locale: 'en',
            strength: 1
          }).sort(sort).skip(skippage).limit(pageSize).lean());

        case 16:
          notifications = _context5.sent;
          _context5.next = 19;
          return regeneratorRuntime.awrap(AffNotification.countDocuments(query));

        case 19:
          pageCount = _context5.sent;
          _context5.next = 22;
          return regeneratorRuntime.awrap(AffNotification.distinct('type'));

        case 22:
          types = _context5.sent;
          return _context5.abrupt("return", res.status(200).send({
            notifications: notifications,
            pageCount: pageCount,
            types: types
          }));

        case 26:
          _context5.prev = 26;
          _context5.t0 = _context5["catch"](13);
          return _context5.abrupt("return", res.status(400).send(_context5.t0));

        case 29:
          _context5.next = 32;
          break;

        case 31:
          return _context5.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 32:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[13, 26]]);
}); // POST /affiliate/partner/fetch-notifications-new

router.post('/fetch-notifications-new', passport.authenticate('jwt', {
  session: false
}), function _callee6(req, res) {
  var token, _id, count;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context6.next = 15;
            break;
          }

          _id = req.body._id;
          _context6.prev = 3;
          _context6.next = 6;
          return regeneratorRuntime.awrap(AffNotification.countDocuments({
            belongsTo: _id,
            read: false
          }));

        case 6:
          count = _context6.sent;
          return _context6.abrupt("return", res.status(200).send({
            count: count
          }));

        case 10:
          _context6.prev = 10;
          _context6.t0 = _context6["catch"](3);
          return _context6.abrupt("return", res.status(400).send(_context6.t0));

        case 13:
          _context6.next = 16;
          break;

        case 15:
          return _context6.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 16:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[3, 10]]);
}); // POST /affiliate/partner/update-notifications

router.post('/update-notifications', passport.authenticate('jwt', {
  session: false
}), function _callee7(req, res) {
  var token, _id, count;

  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context7.next = 17;
            break;
          }

          _id = req.body._id;
          _context7.prev = 3;
          _context7.next = 6;
          return regeneratorRuntime.awrap(AffNotification.updateMany({
            belongsTo: _id,
            read: false
          }, {
            read: true
          }));

        case 6:
          _context7.next = 8;
          return regeneratorRuntime.awrap(AffNotification.countDocuments({
            belongsTo: _id,
            read: false
          }));

        case 8:
          count = _context7.sent;
          return _context7.abrupt("return", res.status(200).send({
            count: count
          }));

        case 12:
          _context7.prev = 12;
          _context7.t0 = _context7["catch"](3);
          return _context7.abrupt("return", res.status(400).send(_context7.t0));

        case 15:
          _context7.next = 18;
          break;

        case 17:
          return _context7.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 18:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[3, 12]]);
}); // GET /affiliate/partner/accept-terms/:_id

router.get('/accept-terms/:_id', passport.authenticate('jwt', {
  session: false
}), function _callee8(req, res) {
  var token, _id, partner;

  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context8.next = 15;
            break;
          }

          _id = req.params._id;
          _context8.prev = 3;
          _context8.next = 6;
          return regeneratorRuntime.awrap(AffPartner.findByIdAndUpdate(_id, {
            termsAccepted: true
          }, {
            "new": true,
            select: 'termsAccepted'
          }));

        case 6:
          partner = _context8.sent;
          return _context8.abrupt("return", res.status(200).send(partner));

        case 10:
          _context8.prev = 10;
          _context8.t0 = _context8["catch"](3);
          return _context8.abrupt("return", res.status(400).send(_context8.t0));

        case 13:
          _context8.next = 16;
          break;

        case 15:
          return _context8.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 16:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[3, 10]]);
});
module.exports = router;