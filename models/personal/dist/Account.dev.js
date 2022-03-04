"use strict";

var mongoose = require('mongoose');

var _require = require('../../utils/sib-helpers'),
    sendEmail = _require.sendEmail;

var Schema = mongoose.Schema;

var UserNotification = require('../common/UserNotification');

var ActiveUser = require('./ActiveUser');

var _require2 = require('../../utils/sib-transactional-templates'),
    sibAccountAdded = _require2.sibAccountAdded;

var _require3 = require('../../utils/notifications-list'),
    accountAdded = _require3.accountAdded;

var Account = new Schema({
  brand: String,
  accountId: String,
  dateAdded: {
    type: Number,
    "default": Date.now
  },
  accountEmail: String,
  country: String,
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'report'
  }],
  belongsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'activeuser'
  }
});
Account.pre('save', function _callee(next) {
  var a, activeUser;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          a = this;
          _context.prev = 1;

          if (!(a.isNew && a.belongsTo)) {
            _context.next = 11;
            break;
          }

          _context.next = 5;
          return regeneratorRuntime.awrap(ActiveUser.findById(a.belongsTo).select('belongsTo email').populate({
            path: 'belongsTo',
            select: 'locale'
          }).lean());

        case 5:
          activeUser = _context.sent;
          _context.next = 8;
          return regeneratorRuntime.awrap(createUserNotification(accountAdded({
            accountId: a.accountId,
            belongsTo: activeUser.belongsTo,
            locale: activeUser.belongsTo.locale
          })));

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap(sendEmail(sibAccountAdded({
            locale: activeUser.belongsTo.locale,
            smtpParams: {
              BRAND: a.brand,
              ACCOUNTID: a.accountId
            },
            email: activeUser.email
          })));

        case 10:
          next();

        case 11:
          _context.next = 16;
          break;

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](1);
          next();

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, this, [[1, 13]]);
});

function createUserNotification(_ref) {
  var message, type, belongsTo;
  return regeneratorRuntime.async(function createUserNotification$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          message = _ref.message, type = _ref.type, belongsTo = _ref.belongsTo;
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

module.exports = mongoose.model('account', Account);