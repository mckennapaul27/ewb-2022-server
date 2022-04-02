"use strict";

var express = require('express');

var router = express.Router();

var passport = require('passport');

require('../../auth/passport')(passport);

var _require = require('../../utils/token.utils'),
    getToken = _require.getToken;

var _require2 = require('../../models/common/index'),
    User = _require2.User,
    UserNotification = _require2.UserNotification;

var _require3 = require('../../utils/error-messages'),
    serverErr = _require3.serverErr,
    errSibContactExists = _require3.errSibContactExists;

var _require4 = require('../../utils/sib-helpers'),
    createNewSubscriber = _require4.createNewSubscriber;

var _require5 = require('../../utils/success-messages'),
    msgSubscribed = _require5.msgSubscribed; // /common/user/get-user


router.get('/get-user', passport.authenticate('jwt', {
  session: false
}), function (req, res) {
  var token = getToken(req.headers);

  if (token) {
    User.findById(req.user._id).select('name email userId _id activeUser').lean().then(function (user) {
      return res.status(200).send(user);
    })["catch"](function (err) {
      return res.status(500).send({
        msg: 'Server error: Please contact support'
      });
    });
  } else return res.status(403).send({
    msg: 'Unauthorised'
  });
}); // /common/user/update-user/:_id

router.post('/update-user/:_id', passport.authenticate('jwt', {
  session: false
}), function _callee(req, res) {
  var token, email, _id, update, exists, count;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context.next = 16;
            break;
          }

          email = req.body.email; // receives these regardless of any change through

          _id = req.params._id;
          update = req.body;
          exists = false;

          if (!update['email']) {
            _context.next = 11;
            break;
          }

          _context.next = 9;
          return regeneratorRuntime.awrap(User.countDocuments({
            email: update['email']
          }).select('email').lean());

        case 9:
          count = _context.sent;
          // check if user exists
          if (count > 0) exists = true;

        case 11:
          if (!(exists > 0)) {
            _context.next = 13;
            break;
          }

          return _context.abrupt("return", res.status(400).send({
            msg: "Account already exists with email ".concat(email)
          }));

        case 13:
          User.findByIdAndUpdate(_id, update, {
            "new": true
          }).select('name email userId _id activeUser partner').populate({
            path: 'partner',
            select: 'isSubPartner epi siteId referredBy'
          }).lean().then(function (updatedUser) {
            return res.status(201).send({
              msg: 'You have successfully updated your settings.',
              updatedUser: updatedUser
            });
          })["catch"](function (err) {
            return res.status(500).send({
              msg: 'Server error: Please contact support'
            });
          });
          _context.next = 17;
          break;

        case 16:
          return _context.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 17:
        case "end":
          return _context.stop();
      }
    }
  });
}); // /common/user/get-new-notifications/:_id

router.get('/get-new-notifications/:_id', passport.authenticate('jwt', {
  session: false
}), function _callee2(req, res) {
  var unRead;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(UserNotification.countDocuments({
            belongsTo: req.params._id,
            read: false
          }).select('read').lean());

        case 2:
          unRead = _context2.sent;
          return _context2.abrupt("return", res.status(200).send({
            unRead: unRead
          }));

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // /common/user/get-notifications/:_id?page=number

router.get('/get-notifications/:_id', passport.authenticate('jwt', {
  session: false
}), getNotifications); // /common/user/update-notifications/:_id'

router.get('/update-notifications/:_id', passport.authenticate('jwt', {
  session: false
}), updateNotifications, getNotifications);

function updateNotifications(req, res, next) {
  var token;
  return regeneratorRuntime.async(function updateNotifications$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          token = getToken(req.headers);

          if (!token) {
            _context3.next = 7;
            break;
          }

          _context3.next = 4;
          return regeneratorRuntime.awrap(UserNotification.updateMany({
            belongsTo: req.params._id
          }, {
            read: true
          }));

        case 4:
          next();
          _context3.next = 8;
          break;

        case 7:
          return _context3.abrupt("return", res.status(403).send({
            msg: 'Unauthorised'
          }));

        case 8:
        case "end":
          return _context3.stop();
      }
    }
  });
}

function getNotifications(req, res) {
  var token = getToken(req.headers);

  if (token) {
    var pageLimit = 10; // 4, 4, 4

    var skippage = pageLimit * (req.query.page - 1); // with increments of one = 5 * (1 - 1) = 0 |  5 * (2 - 1) = 5 | 5 * (3 - 1) = 10;

    UserNotification.find({
      belongsTo: req.params._id
    }).select('message read type createdAt').sort('-createdAt').skip(skippage).limit(pageLimit).lean().then(function _callee3(notifications) {
      var total, unRead;
      return regeneratorRuntime.async(function _callee3$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return regeneratorRuntime.awrap(UserNotification.countDocuments({
                belongsTo: req.params._id
              }).select('read').lean());

            case 2:
              total = _context4.sent;
              _context4.next = 5;
              return regeneratorRuntime.awrap(UserNotification.countDocuments({
                belongsTo: req.params._id,
                read: false
              }).select('read').lean());

            case 5:
              unRead = _context4.sent;
              return _context4.abrupt("return", res.status(200).send({
                notifications: notifications,
                total: total,
                unRead: unRead
              }));

            case 7:
            case "end":
              return _context4.stop();
          }
        }
      });
    })["catch"](function (err) {
      return res.status(500).send({
        msg: 'Server error: Please contact support'
      });
    });
  } else return res.status(403).send({
    msg: 'Unauthorised'
  });
} // /common/user/subscribe-to-list - THIS IS UP-TO-DATE 1/3/22


router.post('/subscribe-to-list', function _callee4(req, res) {
  var msg;
  return regeneratorRuntime.async(function _callee4$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(createNewSubscriber({
            email: req.body.email,
            locale: req.body.locale
          }));

        case 3:
          return _context5.abrupt("return", res.status(201).send(msgSubscribed({
            locale: req.body.locale
          })));

        case 6:
          _context5.prev = 6;
          _context5.t0 = _context5["catch"](0);
          msg = JSON.parse(_context5.t0.message);

          if (!(msg.code === 'duplicate_parameter')) {
            _context5.next = 11;
            break;
          }

          return _context5.abrupt("return", res.status(401).send(errSibContactExists({
            locale: req.body.locale
          })));

        case 11:
          return _context5.abrupt("return", res.status(500).send(serverErr({
            locale: req.body.locale
          })));

        case 12:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 6]]);
});
module.exports = router;