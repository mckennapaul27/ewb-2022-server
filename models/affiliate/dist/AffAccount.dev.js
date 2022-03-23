"use strict";

var mongoose = require('mongoose');

var _require = require('../../utils/sib-helpers'),
    sendEmail = _require.sendEmail;

var Schema = mongoose.Schema;

var AffNotification = require('./AffNotification');

var AffPartner = require('./AffPartner');

var dayjs = require('dayjs');

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
  var a, _ref, email;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2
          a = this;
          _context.prev = 1;

          if (!a.isNew) {
            _context.next = 9;
            break;
          }

          a.monthAdded = dayjs().format('MMMM YYYY');
          _context.next = 6;
          return regeneratorRuntime.awrap(AffPartner.findById(a.belongsTo).select('email').lean());

        case 6:
          _ref = _context.sent;
          email = _ref.email;
          // await createAffNotification({
          //     message: `Account ${a.accountId} has been added to your dashboard`,
          //     type: 'Account',
          //     belongsTo: a.belongsTo,
          // })
          // await sendEmail({
          //     templateId: 22,
          //     smtpParams: {
          //         BRAND: a.brand,
          //         ACCOUNTID: a.accountId,
          //     },
          //     tags: ['Account'],
          //     email,
          // })
          next();

        case 9:
          _context.next = 14;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](1);
          next();

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, null, this, [[1, 11]]);
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