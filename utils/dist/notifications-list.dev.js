"use strict";

var Mustache = require('mustache');

var en = require('../locales/en/translation.json');

var es = require('../locales/es/translation.json');
/* helpers for translations */


var locales = {
  en: en,
  es: es
};

function getMessageByKey(key, locale) {
  var variables = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var msg = Mustache.render(locales[locale] ? locales[locale][key] : locales['en'][key], variables);
  return msg;
}
/* helpers for translations */
// USER NOTIFICATIONS (belongs to user)


var welcome = function welcome(_ref) {
  var user = _ref.user,
      locale = _ref.locale;
  var message = getMessageByKey('welcome', locale);
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
  var message = getMessageByKey('hasApplied', locale, {
    accountId: accountId
  });
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
  var message = getMessageByKey('updateApplication', locale, {
    accountId: accountId,
    status: status
  });
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
  var message = getMessageByKey('requestedPayment', locale, {
    symbol: symbol,
    amount: amount.toFixed(2),
    brand: brand,
    paymentAccount: paymentAccount
  });
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
  var message = getMessageByKey('applicationYY', locale, {
    accountId: accountId,
    brand: brand
  });
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
  var message = getMessageByKey('applicationYN', locale, {
    accountId: accountId,
    brand: brand
  });
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
  var message = getMessageByKey('applicationNN', locale, {
    accountId: accountId,
    brand: brand
  });
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
  var message = getMessageByKey('accountAdded', locale, {
    accountId: accountId
  });
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
  var paid = {
    en: 'paid',
    de: 'paid',
    es: 'paid',
    it: 'paid',
    pl: 'paid',
    pt: 'paid'
  };
  var rejected = {
    en: 'rejected',
    de: 'rejected',
    es: 'rechazado',
    it: 'rejected',
    pl: 'rejected',
    pt: 'rejected'
  };
  var message = getMessageByKey('paymentResult', locale, {
    symbol: symbol,
    amount: amount.toFixed(2),
    status: status === 'Paid' ? paid[locale] : rejected[locale]
  });
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
  var message = getMessageByKey('newSubPartnerRegistered', locale, {
    email: user.email
  });
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
  var message = getMessageByKey('linksRequested', locale, {
    brand: brand
  });
  return {
    message: message,
    type: 'Partner',
    belongsTo: belongsTo
  };
};

var affAccountAdded = function affAccountAdded(_ref12) {
  var locale = _ref12.locale,
      accountId = _ref12.accountId,
      belongsTo = _ref12.belongsTo;
  var message = getMessageByKey('affAccountAdded', locale, {
    accountId: accountId
  });
  return {
    message: message,
    type: 'Account',
    belongsTo: belongsTo
  };
};

var affUpgradeEligible = function affUpgradeEligible(_ref13) {
  var locale = _ref13.locale,
      accountId = _ref13.accountId,
      level = _ref13.level,
      quarter = _ref13.quarter,
      belongsTo = _ref13.belongsTo;
  var message = getMessageByKey('affUpgradeEligible', locale, {
    accountId: accountId,
    level: level,
    quarter: quarter
  });
  return {
    message: message,
    type: 'Account',
    belongsTo: belongsTo
  };
};

var reportsHaveUpdated = function reportsHaveUpdated(_ref14) {
  var brand = _ref14.brand;
  // remember this is also called from auth router
  var message = getMessageByKey('reportsHaveUpdated', locale, {
    brand: brand,
    day: dayjs().format('LLLL')
  });
  return {
    message: message,
    type: 'Report',
    isGeneral: true
  };
};

var updatedPaymentDetails = function updatedPaymentDetails(_ref15) {
  var locale = _ref15.locale,
      brand = _ref15.brand,
      belongsTo = _ref15.belongsTo;
  var message = getMessageByKey('updatedPaymentDetails', locale, {
    brand: brand
  });
  return {
    message: message,
    type: 'Account',
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
  paymentResult: paymentResult,
  affAccountAdded: affAccountAdded,
  affUpgradeEligible: affUpgradeEligible,
  updatedPaymentDetails: updatedPaymentDetails
};