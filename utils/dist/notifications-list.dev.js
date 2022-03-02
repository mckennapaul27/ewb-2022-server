"use strict";

// USER NOTIFICATIONS (belongs to user)
var welcome = function welcome(_ref) {
  var user = _ref.user,
      locale = _ref.locale;

  switch (locale) {
    case 'de':
      message = 'Thank you for registering and welcome to VolumeKings.com';
      break;

    case 'es':
      message = 'Thank you for registering and welcome to VolumeKings.com';
      break;

    case 'it':
      message = 'Thank you for registering and welcome to VolumeKings.com';
      break;

    case 'pl':
      message = 'Thank you for registering and welcome to VolumeKings.com';
      break;

    case 'pt':
      message = 'Thank you for registering and welcome to VolumeKings.com';
      break;

    default:
      message = 'Thank you for registering and welcome to VolumeKings.com';
  }

  return {
    message: message,
    type: 'General',
    belongsTo: user._id
  };
};

var hasApplied = function hasApplied(_ref2) {
  var accountId = _ref2.accountId,
      _id = _ref2._id,
      locale = _ref2.locale;

  switch (locale) {
    case 'de':
      message = "We have received your application for ".concat(accountId);
      break;

    case 'es':
      message = "We have received your application for ".concat(accountId);
      break;

    case 'it':
      message = "We have received your application for ".concat(accountId);
      break;

    case 'pl':
      message = "We have received your application for ".concat(accountId);
      break;

    case 'pt':
      message = "We have received your application for ".concat(accountId);
      break;

    default:
      message = "We have received your application for ".concat(accountId);
  }

  return {
    message: message,
    type: 'Application',
    belongsTo: _id
  };
};

var updateApplication = function updateApplication(_ref3) {
  var status = _ref3.status,
      accountId = _ref3.accountId,
      _id = _ref3._id,
      locale = _ref3.locale;

  switch (locale) {
    case 'de':
      message = "Requested ".concat(status, " VIP upgrade for ").concat(accountId);
      break;

    case 'es':
      message = "Requested ".concat(status, " VIP upgrade for ").concat(accountId);
      break;

    case 'it':
      message = "Requested ".concat(status, " VIP upgrade for ").concat(accountId);
      break;

    case 'pl':
      message = "Requested ".concat(status, " VIP upgrade for ").concat(accountId);
      break;

    case 'pt':
      message = "Requested ".concat(status, " VIP upgrade for ").concat(accountId);
      break;

    default:
      message = "Requested ".concat(status, " VIP upgrade for ").concat(accountId);
  }

  return {
    message: message,
    type: 'Application',
    belongsTo: _id
  };
};

var requestedPayment = function requestedPayment(_ref4) {
  var symbol = _ref4.symbol,
      amount = _ref4.amount,
      brand = _ref4.brand,
      paymentAccount = _ref4.paymentAccount,
      belongsTo = _ref4.belongsTo,
      locale = _ref4.locale;

  switch (locale) {
    case 'de':
      message = "You have requested ".concat(symbol).concat(amount.toFixed(2), " to be sent to ").concat(brand, " account ").concat(paymentAccount);
      break;

    case 'es':
      message = "You have requested ".concat(symbol).concat(amount.toFixed(2), " to be sent to ").concat(brand, " account ").concat(paymentAccount);
      break;

    case 'it':
      message = "You have requested ".concat(symbol).concat(amount.toFixed(2), " to be sent to ").concat(brand, " account ").concat(paymentAccount);
      break;

    case 'pl':
      message = "You have requested ".concat(symbol).concat(amount.toFixed(2), " to be sent to ").concat(brand, " account ").concat(paymentAccount);
      break;

    case 'pt':
      message = "You have requested ".concat(symbol).concat(amount.toFixed(2), " to be sent to ").concat(brand, " account ").concat(paymentAccount);
      break;

    default:
      message = "You have requested ".concat(symbol).concat(amount.toFixed(2), " to be sent to ").concat(brand, " account ").concat(paymentAccount);
  }

  return {
    message: message,
    type: 'Payment',
    belongsTo: belongsTo
  };
};

var applicationYY = function applicationYY(_ref5) {
  var brand = _ref5.brand,
      accountId = _ref5.accountId,
      belongsTo = _ref5.belongsTo;
  return {
    message: "".concat(brand, " account ").concat(accountId, " has been upgraded to VIP"),
    type: 'Application',
    belongsTo: belongsTo
  };
};

var applicationYN = function applicationYN(_ref6) {
  var brand = _ref6.brand,
      accountId = _ref6.accountId,
      belongsTo = _ref6.belongsTo;
  return {
    message: "".concat(brand, " account ").concat(accountId, " could not be upgraded - please verify and request again"),
    type: 'Application',
    belongsTo: belongsTo
  };
};

var applicationNN = function applicationNN(_ref7) {
  var brand = _ref7.brand,
      accountId = _ref7.accountId,
      belongsTo = _ref7.belongsTo;
  return {
    message: "Your application for ".concat(brand, " account ").concat(accountId, " has been rejected"),
    type: 'Application',
    belongsTo: belongsTo
  };
};
/* AFFILIATE NOTIFICATIONS */


var newSubPartnerRegistered = function newSubPartnerRegistered(_ref8) {
  var user = _ref8.user,
      referredByPartner = _ref8.referredByPartner,
      locale = _ref8.locale;

  switch (locale) {
    case 'de':
      message = "".concat(user.email, " has registered as your subpartner");
      break;

    case 'es':
      message = "".concat(user.email, " has registered as your subpartner");
      break;

    case 'it':
      message = "".concat(user.email, " has registered as your subpartner");
      break;

    case 'pl':
      message = "".concat(user.email, " has registered as your subpartner");
      break;

    case 'pt':
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

var linksRequested = function linksRequested(_ref9) {
  var locale = _ref9.locale,
      brand = _ref9.brand,
      belongsTo = _ref9.belongsTo;

  // remember this is also called from auth router
  switch (locale) {
    case 'de':
      message = "You have requested additional links for ".concat(brand);
      break;

    case 'es':
      message = "You have requested additional links for ".concat(brand);
      break;

    case 'it':
      message = "You have requested additional links for ".concat(brand);
      break;

    case 'pl':
      message = "You have requested additional links for ".concat(brand);
      break;

    case 'pt':
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
  hasApplied: hasApplied,
  updateApplication: updateApplication,
  applicationYY: applicationYY,
  applicationYN: applicationYN,
  applicationNN: applicationNN,
  newSubPartnerRegistered: newSubPartnerRegistered,
  linksRequested: linksRequested,
  requestedPayment: requestedPayment
};