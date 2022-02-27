"use strict";

var C = require('chance');

var app = require('../server');

var chance = new C(); // message: chance.sentence({ words: 8 }),
// USER NOTIFICATIONS (belongs to user)

var welcome = function welcome(_ref) {
  var user = _ref.user,
      locale = _ref.locale;

  switch (locale) {
    case 'es':
      message = 'Bienvenido to VolumeKings.com';
      break;

    case 'de':
      message = 'Wilkommen to VolumeKings.com';
      break;

    default:
      message = 'Welcome to VolumeKings.com';
  }

  return {
    message: message,
    type: 'General',
    belongsTo: user._id
  };
};

var welcomeSocial = function welcomeSocial(user) {
  return {
    message: "Welcome, ".concat(user.name),
    type: 'General',
    belongsTo: user._id
  };
};

var hasApplied = function hasApplied(_ref2) {
  var newApp = _ref2.newApp,
      _id = _ref2._id,
      locale = _ref2.locale;

  switch (locale) {
    case 'es':
      message = "We have received your application for ".concat(newApp.accountId);
      break;

    case 'de':
      message = "We have received your application for ".concat(newApp.accountId);
      break;

    default:
      message = "We have received your application for ".concat(newApp.accountId);
  }

  return {
    message: message,
    type: 'Application',
    belongsTo: _id
  };
};

var updateApplication = function updateApplication(a, _id) {
  return {
    message: "Requested ".concat(a.availableUpgrade.status, " VIP upgrade for ").concat(a.accountId),
    type: 'Application',
    belongsTo: _id
  };
};

var applicationYY = function applicationYY(_ref3) {
  var brand = _ref3.brand,
      accountId = _ref3.accountId,
      belongsTo = _ref3.belongsTo;
  return {
    message: "".concat(brand, " account ").concat(accountId, " has been upgraded to VIP"),
    type: 'Application',
    belongsTo: belongsTo
  };
};

var applicationYN = function applicationYN(_ref4) {
  var brand = _ref4.brand,
      accountId = _ref4.accountId,
      belongsTo = _ref4.belongsTo;
  return {
    message: "".concat(brand, " account ").concat(accountId, " could not be upgraded - please verify and request again"),
    type: 'Application',
    belongsTo: belongsTo
  };
};

var applicationNN = function applicationNN(_ref5) {
  var brand = _ref5.brand,
      accountId = _ref5.accountId,
      belongsTo = _ref5.belongsTo;
  return {
    message: "Your application for ".concat(brand, " account ").concat(accountId, " has been rejected"),
    type: 'Application',
    belongsTo: belongsTo
  };
};
/* AFFILIATE NOTIFICATIONS */


var newSubPartnerRegistered = function newSubPartnerRegistered(_ref6) {
  var user = _ref6.user,
      referredByPartner = _ref6.referredByPartner,
      locale = _ref6.locale;

  switch (locale) {
    case 'es':
      message = "".concat(user.email, " has registered as your subpartner");
      break;

    case 'de':
      message = "".concat(user.email, " has registered as your subpartner");
      break;

    default:
      message = "".concat(user.email, " has registered as your subpartner");
  }

  return {
    message: message,
    type: 'Partner',
    belongsTo: referredByPartner
  };
};

var linksRequested = function linksRequested(_ref7) {
  var locale = _ref7.locale,
      brand = _ref7.brand,
      belongsTo = _ref7.belongsTo;

  // remember this is also called from auth router
  switch (locale) {
    case 'es':
      message = "You have requested additional links for ".concat(brand);
      break;

    case 'de':
      message = "You have requested additional links for ".concat(brand);
      break;

    default:
      message = "You have requested additional links for ".concat(brand);
  }

  return {
    message: message,
    type: 'Partner',
    belongsTo: belongsTo
  };
};

module.exports = {
  welcome: welcome,
  welcomeSocial: welcomeSocial,
  hasApplied: hasApplied,
  updateApplication: updateApplication,
  applicationYY: applicationYY,
  applicationYN: applicationYN,
  applicationNN: applicationNN,
  newSubPartnerRegistered: newSubPartnerRegistered,
  linksRequested: linksRequested
};