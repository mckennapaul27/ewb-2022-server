"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var dayjs = require('dayjs');

var AffReportDaily = new Schema({
  epi: Number,
  date: Number,
  month: String,
  period: String,
  clicks: Number,
  registrations: Number,
  deposits: Number,
  transValue: Number,
  commission: Number,
  brand: String,
  belongsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'affpartner',
    required: false
  }
});
AffReportDaily.pre('save', function _callee(next) {
  var a;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2
          a = this;

          try {
            if (a.isNew) {
              a.month = dayjs().subtract(1, 'days').format('MMMM YYYY');
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
module.exports = mongoose.model('affreportdaily', AffReportDaily);