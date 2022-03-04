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
      belongsTo = _ref5.belongsTo,
      locale = _ref5.locale;

  switch (locale) {
    case 'de':
      message = "".concat(brand, " account ").concat(accountId, " has been upgraded to VIP");
      break;

    case 'es':
      message = "".concat(brand, " account ").concat(accountId, " has been upgraded to VIP");
      break;

    case 'it':
      message = "".concat(brand, " account ").concat(accountId, " has been upgraded to VIP");
      break;

    case 'pl':
      message = "".concat(brand, " account ").concat(accountId, " has been upgraded to VIP");
      break;

    case 'pt':
      message = "".concat(brand, " account ").concat(accountId, " has been upgraded to VIP");
      break;

    default:
      message = "".concat(brand, " account ").concat(accountId, " has been upgraded to VIP");
  }

  return {
    message: message,
    type: 'Application',
    belongsTo: belongsTo
  };
};

var applicationYN = function applicationYN(_ref6) {
  var brand = _ref6.brand,
      accountId = _ref6.accountId,
      belongsTo = _ref6.belongsTo,
      locale = _ref6.locale;

  switch (locale) {
    case 'de':
      message = "".concat(brand, " account ").concat(accountId, " is eligible for cashback but could not be upgraded - please verify and request again");
      break;

    case 'es':
      message = "".concat(brand, " account ").concat(accountId, " is eligible for cashback but could not be upgraded - please verify and request again");
      break;

    case 'it':
      message = "".concat(brand, " account ").concat(accountId, " is eligible for cashback but could not be upgraded - please verify and request again");
      break;

    case 'pl':
      message = "".concat(brand, " account ").concat(accountId, " is eligible for cashback but could not be upgraded - please verify and request again");
      break;

    case 'pt':
      message = "".concat(brand, " account ").concat(accountId, " is eligible for cashback but could not be upgraded - please verify and request again");
      break;

    default:
      message = "".concat(brand, " account ").concat(accountId, " is eligible for cashback but could not be upgraded - please verify and request again");
  }

  return {
    message: message,
    type: 'Application',
    belongsTo: belongsTo
  };
};

var applicationNN = function applicationNN(_ref7) {
  var brand = _ref7.brand,
      accountId = _ref7.accountId,
      belongsTo = _ref7.belongsTo,
      locale = _ref7.locale;

  switch (locale) {
    case 'de':
      message = "Your application for ".concat(brand, " account ").concat(accountId, " has been rejected");
      break;

    case 'es':
      message = "Your application for ".concat(brand, " account ").concat(accountId, " has been rejected");
      break;

    case 'it':
      message = "Your application for ".concat(brand, " account ").concat(accountId, " has been rejected");
      break;

    case 'pl':
      message = "Your application for ".concat(brand, " account ").concat(accountId, " has been rejected");
      break;

    case 'pt':
      message = "Your application for ".concat(brand, " account ").concat(accountId, " has been rejected");
      break;

    default:
      message = "Your application for ".concat(brand, " account ").concat(accountId, " has been rejected");
  }

  return {
    message: message,
    type: 'Application',
    belongsTo: belongsTo
  };
};

var accountAdded = function accountAdded(_ref8) {
  var accountId = _ref8.accountId,
      belongsTo = _ref8.belongsTo,
      locale = _ref8.locale;

  switch (locale) {
    case 'de':
      message = "Account ".concat(accountId, " has been added to your dashboard and is now eligible");
      break;

    case 'es':
      message = "Account ".concat(accountId, " has been added to your dashboard and is now eligible");
      break;

    case 'it':
      message = "Account ".concat(accountId, " has been added to your dashboard and is now eligible");
      break;

    case 'pl':
      message = "Account ".concat(accountId, " has been added to your dashboard and is now eligible");
      break;

    case 'pt':
      message = "Account ".concat(accountId, " has been added to your dashboard and is now eligible");
      break;

    default:
      message = "Account ".concat(accountId, " has been added to your dashboard and is now eligible");
  }

  return {
    message: message,
    type: 'Account',
    belongsTo: belongsTo
  };
};

var paymentResult = function paymentResult(_ref9) {
  var symbol = _ref9.symbol,
      amount = _ref9.amount,
      status = _ref9.status,
      belongsTo = _ref9.belongsTo,
      locale = _ref9.locale;

  switch (locale) {
    case 'de':
      message = "Your payout request for ".concat(symbol).concat(amount.toFixed(2), " has been ").concat(status.toLowerCase());
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
/* AFFILIATE NOTIFICATIONS */


var newSubPartnerRegistered = function newSubPartnerRegistered(_ref10) {
  var user = _ref10.user,
      referredByPartner = _ref10.referredByPartner,
      locale = _ref10.locale;

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

var linksRequested = function linksRequested(_ref11) {
  var locale = _ref11.locale,
      brand = _ref11.brand,
      belongsTo = _ref11.belongsTo;

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
  accountAdded: accountAdded,
  newSubPartnerRegistered: newSubPartnerRegistered,
  linksRequested: linksRequested,
  requestedPayment: requestedPayment,
  paymentResult: paymentResult
};