"use strict";

var mongoose = require('mongoose');

var _require = require('../../utils/sib-helpers'),
    sendEmail = _require.sendEmail;

var UserNotification = require('../common/UserNotification');

var ActiveUser = require('./ActiveUser');

var Application = require('./Application');

var Schema = mongoose.Schema;
var Upgrade = new Schema({
  level: String,
  quarter: String,
  accountId: String,
  brand: String,
  startDate: Number,
  endDate: Number,
  belongsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'application',
    required: false
  }
});
Upgrade.pre('save', function _callee(next) {
  var a, isNew, accountId, quarter, brand, level, _ref, belongsTo, res;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          a = this;
          isNew = a.isNew, accountId = a.accountId, quarter = a.quarter, brand = a.brand, level = a.level;
          _context.prev = 2;

          if (!isNew) {
            _context.next = 18;
            break;
          }

          _context.next = 6;
          return regeneratorRuntime.awrap(Application.findOne({
            accountId: accountId
          }).select('belongsTo').lean());

        case 6:
          _ref = _context.sent;
          belongsTo = _ref.belongsTo;

          if (!belongsTo) {
            _context.next = 17;
            break;
          }

          _context.next = 11;
          return regeneratorRuntime.awrap(ActiveUser.findById(belongsTo).select('email belongsTo').populate({
            path: 'belongsTo',
            select: 'belongsTo email'
          }).lean());

        case 11:
          res = _context.sent;
          _context.next = 14;
          return regeneratorRuntime.awrap(createUserNotification({
            message: "Account ".concat(accountId, " is eligible for a ").concat(level, " VIP upgrade for ").concat(quarter),
            type: 'Application',
            belongsTo: res.belongsTo._id
          }));

        case 14:
          // 3/4/22 - not currently needed as don't know whether upgrades will be incorporated
          // await sendEmail({
          //     templateId: 73,
          //     smtpParams: {
          //         BRAND: brand,
          //         ACCOUNTID: accountId,
          //         QUARTER: quarter,
          //         LEVEL: level
          //     },
          //     tags: ['Application'],
          //     email: res.belongsTo.email
          // })
          next();
          _context.next = 18;
          break;

        case 17:
          next();

        case 18:
          _context.next = 23;
          break;

        case 20:
          _context.prev = 20;
          _context.t0 = _context["catch"](2);
          next();

        case 23:
        case "end":
          return _context.stop();
      }
    }
  }, null, this, [[2, 20]]);
});

function createUserNotification(_ref2) {
  var message, type, belongsTo;
  return regeneratorRuntime.async(function createUserNotification$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          message = _ref2.message, type = _ref2.type, belongsTo = _ref2.belongsTo;
          return _context2.abrupt("return", Promise.resolve(UserNotification.create({
            message: message,
            type: type,
            belongsTo: belongsTo
          })));

        case 2:
        case "end":
          return _context2.stop();
      }
    }
  });
}

module.exports = mongoose.model('upgrade', Upgrade);