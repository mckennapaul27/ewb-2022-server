"use strict";

var _require = require('./helper-functions'),
    getMessageByKey = _require.getMessageByKey;

var err1 = function err1(_ref) {
  var locale = _ref.locale;
  var msg = getMessageByKey('err1', locale);
  return {
    msg: msg
  };
};

var err2 = function err2(_ref2) {
  var locale = _ref2.locale;
  var msg = getMessageByKey('err2', locale);
  return {
    msg: msg
  };
};

var err3 = function err3(_ref3) {
  var locale = _ref3.locale;
  var msg = getMessageByKey('err3', locale);
  return {
    msg: msg
  };
};

var err4 = function err4(_ref4) {
  var locale = _ref4.locale;
  var msg = getMessageByKey('err4', locale);
  return {
    msg: msg
  };
};

var err5 = function err5(_ref5) {
  var locale = _ref5.locale;
  var msg = getMessageByKey('err5', locale);
  return {
    msg: msg
  };
};

var err6 = function err6(_ref6) {
  var email = _ref6.email,
      locale = _ref6.locale;
  var msg = getMessageByKey('err6', locale, {
    email: email
  });
  return {
    msg: msg
  };
};

var err7 = function err7(_ref7) {
  var accountId = _ref7.accountId,
      locale = _ref7.locale;
  var msg = getMessageByKey('err7', locale, {
    accountId: accountId
  });
  return {
    msg: msg
  };
};

var serverErr = function serverErr(_ref8) {
  var locale = _ref8.locale;
  var msg = getMessageByKey('serverErr', locale);
  return {
    msg: msg
  };
};

var errNoAccountExists = function errNoAccountExists(_ref9) {
  var locale = _ref9.locale,
      email = _ref9.email;
  var msg = getMessageByKey('errNoAccountExists', locale, {
    email: email
  });
  return {
    msg: msg
  };
};

var errSibContactExists = function errSibContactExists(_ref10) {
  var locale = _ref10.locale;
  var msg = getMessageByKey('errSibContactExists', locale);
  return {
    msg: msg
  };
};

var errInvalidToken = function errInvalidToken(_ref11) {
  var locale = _ref11.locale;
  var msg = getMessageByKey('errInvalidToken', locale);
  return {
    msg: msg
  };
};

var errRequestNotSuccess = function errRequestNotSuccess(_ref12) {
  var locale = _ref12.locale;
  var msg = getMessageByKey('errRequestNotSuccess', locale);
  return {
    msg: msg
  };
};

var errInsufficientFunds = function errInsufficientFunds(_ref13) {
  var locale = _ref13.locale;
  var msg = getMessageByKey('errInsufficientFunds', locale);
  return {
    msg: msg
  };
};

var errIncorrectPassword = function errIncorrectPassword(_ref14) {
  var locale = _ref14.locale;
  var msg = getMessageByKey('errInsufficientFunds', locale);
  return {
    msg: msg
  };
};

module.exports = {
  err1: err1,
  err2: err2,
  err3: err3,
  err4: err4,
  err5: err5,
  err6: err6,
  err7: err7,
  serverErr: serverErr,
  errSibContactExists: errSibContactExists,
  errNoAccountExists: errNoAccountExists,
  errInvalidToken: errInvalidToken,
  errRequestNotSuccess: errRequestNotSuccess,
  errInsufficientFunds: errInsufficientFunds,
  errIncorrectPassword: errIncorrectPassword
};