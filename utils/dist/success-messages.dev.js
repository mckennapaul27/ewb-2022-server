"use strict";

var _require = require('./helper-functions'),
    getMessageByKey = _require.getMessageByKey;

var msgRegistered = function msgRegistered(_ref) {
  var token = _ref.token,
      user = _ref.user,
      locale = _ref.locale;
  var msg = getMessageByKey('msgRegistered', locale);
  return {
    msg: msg,
    token: token,
    user: user
  };
};

var msgSubscribed = function msgSubscribed(_ref2) {
  var locale = _ref2.locale;
  var msg = getMessageByKey('msgSubscribed', locale);
  return {
    msg: msg
  };
};

var msgForgotPassword = function msgForgotPassword(_ref3) {
  var locale = _ref3.locale,
      token = _ref3.token;
  var msg = getMessageByKey('msgForgotPassword', locale);
  return {
    msg: msg,
    token: token
  };
};

var msgPasswordReset = function msgPasswordReset(_ref4) {
  var locale = _ref4.locale,
      user = _ref4.user;
  var msg = getMessageByKey('msgPasswordReset', locale);
  return {
    msg: msg,
    user: user
  };
};

var msgSupportSubmitted = function msgSupportSubmitted(_ref5) {
  var locale = _ref5.locale;
  var msg = getMessageByKey('msgSupportSubmitted', locale);
  return {
    msg: msg
  };
};

var msgVIPRequestSubmitted = function msgVIPRequestSubmitted(_ref6) {
  var locale = _ref6.locale,
      status = _ref6.status,
      accountId = _ref6.accountId;
  var msg = getMessageByKey('msgVIPRequestSubmitted', locale, {
    status: status,
    accountId: accountId
  });
  return {
    msg: msg
  };
};

var msgApplicationSubmitted = function msgApplicationSubmitted(_ref7) {
  var locale = _ref7.locale,
      accountId = _ref7.accountId;
  var msg = getMessageByKey('msgApplicationSubmitted', locale, {
    accountId: accountId
  });
  return {
    msg: msg
  };
};

var msgPaymentDetailsUpdate = function msgPaymentDetailsUpdate(_ref8) {
  var locale = _ref8.locale,
      activeUser = _ref8.activeUser;
  var msg = getMessageByKey('msgPaymentDetailsUpdate', locale);
  return {
    msg: msg,
    activeUser: activeUser
  };
};

var msgPaymentRequest = function msgPaymentRequest(_ref9) {
  var locale = _ref9.locale,
      currency = _ref9.currency,
      amount = _ref9.amount,
      newPayment = _ref9.newPayment;
  var msg = getMessageByKey('msgPaymentRequest', locale, {
    currency: currency,
    amount: amount.toFixed(2)
  });
  return {
    msg: msg,
    newPayment: newPayment
  };
};

var msgRequestedLinks = function msgRequestedLinks(_ref10) {
  var locale = _ref10.locale,
      brand = _ref10.brand,
      partner = _ref10.partner;
  var msg = getMessageByKey('msgRequestedLinks', locale, {
    brand: brand
  });
  return {
    partner: partner,
    msg: msg
  };
};

module.exports = {
  msgRegistered: msgRegistered,
  msgSubscribed: msgSubscribed,
  msgForgotPassword: msgForgotPassword,
  msgPasswordReset: msgPasswordReset,
  msgSupportSubmitted: msgSupportSubmitted,
  msgVIPRequestSubmitted: msgVIPRequestSubmitted,
  msgApplicationSubmitted: msgApplicationSubmitted,
  msgPaymentDetailsUpdate: msgPaymentDetailsUpdate,
  msgPaymentRequest: msgPaymentRequest,
  msgRequestedLinks: msgRequestedLinks
};