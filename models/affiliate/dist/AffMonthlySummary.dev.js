"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var AffMonthlySummary = new Schema({
  date: {
    type: Number,
    required: true // first day of month

  },
  month: String,
  clicks: Number,
  conversions: Number,
  points: Number,
  epi: Number,
  commissionEUR: Number,
  commissionUSD: Number,
  subCommissionEUR: Number,
  subCommissionUSD: Number,
  lastUpdate: Date,
  belongsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'affpartner',
    required: true
  }
});
AffMonthlySummary.pre('save', function _callee(next) {
  var a;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2
          a = this;

          try {
            if (a.isNew) {
              next();
            } else {
              next();
            }
          } catch (error) {
            next();
          }

        case 2:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
});
module.exports = mongoose.model('affmonthlysummary', AffMonthlySummary);