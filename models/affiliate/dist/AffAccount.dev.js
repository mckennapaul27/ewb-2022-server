"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AffNotification = require('./AffNotification');

var AffPartner = require('./AffPartner');

var _require = require('../common/index'),
    User = _require.User;

var dayjs = require('dayjs');

var _require2 = require('../../utils/notifications-list'),
    affAccountAdded = _require2.affAccountAdded;

var AffAccount = new Schema({
  brand: String,
  accountId: String,
  country: String,
  dateAdded: {
    type: Number,
    "default": Date.now
  },
  monthAdded: String,
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'affreport'
  }],
  belongsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'affpartner',
    required: false
  }
});
AffAccount.pre('save', function _callee(next) {
  var a, partner, _ref, locale;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2
          a = this;
          _context.prev = 1;

          if (!a.isNew) {
            _context.next = 14;
            break;
          }

          a.monthAdded = dayjs().format('MMMM YYYY');
          _context.next = 6;
          return regeneratorRuntime.awrap(AffPartner.findById(a.belongsTo).select('email belongsTo').lean());

        case 6:
          partner = _context.sent;
          _context.next = 9;
          return regeneratorRuntime.awrap(User.findById(partner.belongsTo).select('locale').lean());

        case 9:
          _ref = _context.sent;
          locale = _ref.locale;
          _context.next = 13;
          return regeneratorRuntime.awrap(createAffNotification( // updated 1st April
          affAccountAdded({
            locale: locale,
            belongsTo: a.belongsTo,
            accountId: a.accountId
          })));

        case 13:
          next();

        case 14:
          _context.next = 19;
          break;

        case 16:
          _context.prev = 16;
          _context.t0 = _context["catch"](1);
          next();

        case 19:
        case "end":
          return _context.stop();
      }
    }
  }, null, this, [[1, 16]]);
});

function createAffNotification(_ref2) {
  var message, type, belongsTo;
  return regeneratorRuntime.async(function createAffNotification$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          message = _ref2.message, type = _ref2.type, belongsTo = _ref2.belongsTo;
          return _context2.abrupt("return", Promise.resolve(AffNotification.create({
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

module.exports = mongoose.model('affaccount', AffAccount);