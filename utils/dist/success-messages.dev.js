"use strict";

var msgRegistered = function msgRegistered(_ref) {
  var token = _ref.token,
      user = _ref.user,
      locale = _ref.locale;

  switch (locale) {
    case 'de':
      msg = "Thank you. You have successfully registered.";
      break;

    case 'es':
      msg = "Thank you. You have successfully registered.";
      break;

    case 'it':
      msg = "Thank you. You have successfully registered.";
      break;

    case 'pl':
      msg = "Thank you. You have successfully registered.";
      break;

    case 'pt':
      msg = "Thank you. You have successfully registered.";
      break;

    default:
      msg = "Thank you. You have successfully registered.";
  }

  return {
    msg: msg,
    token: token,
    user: user
  };
};

var msgSubscribed = function msgSubscribed(_ref2) {
  var locale = _ref2.locale;

  switch (locale) {
    case 'de':
      msg = "Thank you. You have joined our newsletter and have requested more information on our deals";
      break;

    case 'es':
      msg = "Thank you. You have joined our newsletter and have requested more information on our deals";
      break;

    case 'it':
      msg = "Thank you. You have joined our newsletter and have requested more information on our deals";
      break;

    case 'pl':
      msg = "Thank you. You have joined our newsletter and have requested more information on our deals";
      break;

    case 'pt':
      msg = "Thank you. You have joined our newsletter and have requested more information on our deals";
      break;

    default:
      msg = "Thank you. You have joined our newsletter and have requested more information on our deals";
  }

  return {
    msg: msg
  };
};

var msgForgotPassword = function msgForgotPassword(_ref3) {
  var locale = _ref3.locale,
      token = _ref3.token;

  switch (locale) {
    case 'de':
      msg = "Kindly check your email for further instructions";
      break;

    case 'es':
      msg = "Kindly check your email for further instructions";
      break;

    case 'it':
      msg = "Kindly check your email for further instructions";
      break;

    case 'pl':
      msg = "Kindly check your email for further instructions";
      break;

    case 'pt':
      msg = "Kindly check your email for further instructions";
      break;

    default:
      msg = "Kindly check your email for further instructions";
  }

  return {
    msg: msg,
    token: token
  };
};

var msgPasswordReset = function msgPasswordReset(_ref4) {
  var locale = _ref4.locale,
      user = _ref4.user;

  switch (locale) {
    case 'de':
      msg = "Password successfully reset. Please login";
      break;

    case 'es':
      msg = "Password successfully reset. Please login";
      break;

    case 'it':
      msg = "Password successfully reset. Please login";
      break;

    case 'pl':
      msg = "Password successfully reset. Please login";
      break;

    case 'pt':
      msg = "Password successfully reset. Please login";
      break;

    default:
      msg = "Password successfully reset. Please login";
  }

  return {
    msg: msg,
    user: user
  };
};

var msgSupportSubmitted = function msgSupportSubmitted(_ref5) {
  var locale = _ref5.locale;

  switch (locale) {
    case 'de':
      msg = "We have received your support enquiry";
      break;

    case 'es':
      msg = "We have received your support enquiry";
      break;

    case 'it':
      msg = "We have received your support enquiry";
      break;

    case 'pl':
      msg = "We have received your support enquiry";
      break;

    case 'pt':
      msg = "We have received your support enquiry";
      break;

    default:
      msg = "We have received your support enquiry";
  }

  return {
    msg: msg
  };
};

var msgVIPRequestSubmitted = function msgVIPRequestSubmitted(_ref6) {
  var locale = _ref6.locale,
      status = _ref6.status,
      accountId = _ref6.accountId;

  switch (locale) {
    case 'de':
      msg = "Requested ".concat(status, " for ").concat(accountId);
      break;

    case 'es':
      msg = "Requested ".concat(status, " for ").concat(accountId);
      break;

    case 'it':
      msg = "Requested ".concat(status, " for ").concat(accountId);
      break;

    case 'pl':
      msg = "Requested ".concat(status, " for ").concat(accountId);
      break;

    case 'pt':
      msg = "Requested ".concat(status, " for ").concat(accountId);
      break;

    default:
      msg = "Requested ".concat(status, " for ").concat(accountId);
  }

  return {
    msg: msg
  };
};

var msgApplicationSubmitted = function msgApplicationSubmitted(_ref7) {
  var locale = _ref7.locale,
      accountId = _ref7.accountId;

  switch (locale) {
    case 'de':
      msg = "You have successfully submitted an application for ".concat(accountId);
      break;

    case 'es':
      msg = "You have successfully submitted an application for ".concat(accountId);
      break;

    case 'it':
      msg = "You have successfully submitted an application for ".concat(accountId);
      break;

    case 'pl':
      msg = "You have successfully submitted an application for ".concat(accountId);
      break;

    case 'pt':
      msg = "You have successfully submitted an application for ".concat(accountId);
      break;

    default:
      msg = "You have successfully submitted an application for ".concat(accountId);
  }

  return {
    msg: msg
  };
};

var msgPaymentDetailsUpdate = function msgPaymentDetailsUpdate(_ref8) {
  var locale = _ref8.locale,
      activeUser = _ref8.activeUser;

  switch (locale) {
    case 'de':
      msg = "Successfully updated payment method";
      break;

    case 'es':
      msg = "Successfully updated payment method";
      break;

    case 'it':
      msg = "Successfully updated payment method";
      break;

    case 'pl':
      msg = "Successfully updated payment method";
      break;

    case 'pt':
      msg = "Successfully updated payment method";
      break;

    default:
      msg = "Successfully updated payment method";
  }

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

  switch (locale) {
    case 'de':
      msg = "You have requested ".concat(currency, " ").concat(amount);
      break;

    case 'es':
      msg = "Este es requested ".concat(currency, " ").concat(amount);
      break;

    case 'it':
      msg = "You have requested ".concat(currency, " ").concat(amount);
      break;

    case 'pl':
      msg = "You have requested ".concat(currency, " ").concat(amount);
      break;

    case 'pt':
      msg = "You have requested ".concat(currency, " ").concat(amount);
      break;

    default:
      msg = "You have requested ".concat(currency, " ").concat(amount);
  }

  return {
    msg: msg,
    newPayment: newPayment
  };
};

var msgRequestedLinks = function msgRequestedLinks(_ref10) {
  var locale = _ref10.locale,
      brand = _ref10.brand,
      partner = _ref10.partner;

  switch (locale) {
    case 'de':
      msg = "Requested additional links for ".concat(brand);
      break;

    case 'es':
      msg = "Requested additional links for ".concat(brand);
      break;

    case 'it':
      msg = "Requested additional links for ".concat(brand);
      break;

    case 'pl':
      msg = "Requested additional links for ".concat(brand);
      break;

    case 'pt':
      msg = "Requested additional links for ".concat(brand);
      break;

    default:
      msg = "Requested additional links for ".concat(brand);
  }

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