"use strict";

var mongoose = require('mongoose');

var _require = require('../../utils/notifications-list'),
    affUpgradeEligible = _require.affUpgradeEligible;

var Schema = mongoose.Schema;

var AffNotification = require('./AffNotification');

var AffPartner = require('./AffPartner');

var AffUpgrade = new Schema({
  level: String,
  quarter: String,
  accountId: String,
  brand: String,
  startDate: Number,
  endDate: Number,
  belongsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'affapplication',
    required: false
  }
});
AffUpgrade.pre('save', function _callee(next) {
  var a, isNew, accountId, quarter, brand, level, partner, _ref, locale;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2
          a = this;
          isNew = a.isNew, accountId = a.accountId, quarter = a.quarter, brand = a.brand, level = a.level;
          _context.prev = 2;

          if (!isNew) {
            _context.next = 14;
            break;
          }

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
          return regeneratorRuntime.awrap(createAffNotification(affUpgradeEligible({
            locale: locale,
            accountId: accountId,
            level: level,
            quarter: quarter,
            belongsTo: a.belongsTo
          })));

        case 13:
          next();

        case 14:
          _context.next = 19;
          break;

        case 16:
          _context.prev = 16;
          _context.t0 = _context["catch"](2);
          next();

        case 19:
        case "end":
          return _context.stop();
      }
    }
  }, null, this, [[2, 16]]);
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

module.exports = mongoose.model('affupgrade', AffUpgrade);