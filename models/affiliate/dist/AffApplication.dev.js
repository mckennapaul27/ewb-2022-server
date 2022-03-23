"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var _require = require('../../config/deals'),
    defaultSiteId = _require.defaultSiteId;

var dayjs = require('dayjs');

var Brand = require('../common/Brand');

var AffApplication = new Schema({
  brand: String,
  accountId: {
    type: String,
    unique: true
  },
  email: String,
  siteId: Number,
  status: {
    type: String,
    "default": 'Pending'
  },
  upgradeStatus: {
    type: String,
    "default": 'Not upgraded'
  },
  availableUpgrade: {
    status: String,
    valid: {
      type: Boolean,
      "default": false
    }
  },
  requestCount: {
    type: Number,
    "default": 1
  },
  // every time user requests we can  $inc: { requestCount: 1 } }, to make sure they don't keep requesting
  currency: String,
  dateAdded: {
    type: Number,
    "default": Date.now
  },
  belongsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'affpartner',
    required: false
  }
});
AffApplication.pre('validate', function _callee(next) {
  var a;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // https://stackoverflow.com/questions/30141492/mongoose-presave-does-not-trigger
          a = this; // a = affApplication

          if (!a.siteId) a.siteId = defaultSiteId[a.brand]; // if no siteId is provided on creation - use defauly siteIds
          // const { initialUpgrade } = await Brand.findOne({ brand: a.brand }).select('initialUpgrade').lean();

          a.availableUpgrade.status = initialUpgrade[a.brand];
          a.availableUpgrade.valid = false;
          a.upgradeStatus = "Requested ".concat(dayjs().format('DD/MM/YYYY'));
          next();

        case 6:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
});
var initialUpgrade = {
  Neteller: 'Fast Silver',
  Skrill: 'Fast Silver',
  ecoPayz: 'Gold'
}; // async function createAffNotification ({ message, type, belongsTo }) {
//     await AffNotification.create({ message, type, belongsTo });
// };
// AffApplication.pre('findOneAndUpdate', async function () { // https://stackoverflow.com/questions/44614734/modifying-mongoose-document-on-pre-hook-of-findoneandupdate
//     const docToUpdate = await this.model.findOne(this.getFilter());
//     console.log('docToUpdate: ', docToUpdate);
// });

module.exports = mongoose.model('affapplication', AffApplication);