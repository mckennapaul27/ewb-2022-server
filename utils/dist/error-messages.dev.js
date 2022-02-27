"use strict";

var err1 = function err1(_ref) {
  var locale = _ref.locale;

  switch (locale) {
    case 'es':
      msg = "'Please enter your name and try again'";
      break;

    case 'de':
      msg = "'Please enter your name and try again'";
      break;

    default:
      msg = "'Please enter your name and try again'";
  }

  return {
    msg: msg
  };
};

var err2 = function err2(_ref2) {
  var locale = _ref2.locale;

  switch (locale) {
    case 'es':
      msg = "Please enter an email address and try again";
      break;

    case 'de':
      msg = "Please enter an email address and try again";
      break;

    default:
      msg = "Please enter an email address and try again";
  }

  return {
    msg: msg
  };
};

var err3 = function err3(_ref3) {
  var locale = _ref3.locale;

  switch (locale) {
    case 'es':
      msg = "Please enter a password and try again";
      break;

    case 'de':
      msg = "Please enter a password and try again";
      break;

    default:
      msg = "Please enter a password and try again";
  }

  return {
    msg: msg
  };
};

var err4 = function err4(_ref4) {
  var locale = _ref4.locale;

  switch (locale) {
    case 'es':
      msg = "Please select your country and try again";
      break;

    case 'de':
      msg = "Please select your country and try again";
      break;

    default:
      msg = "Please select your country and try again";
  }

  return {
    msg: msg
  };
};

var err5 = function err5(_ref5) {
  var locale = _ref5.locale;

  switch (locale) {
    case 'es':
      msg = "Please select your preferred language try again";
      break;

    case 'de':
      msg = "Please select your preferred language try again";
      break;

    default:
      msg = "Please select your preferred language try again";
  }

  return {
    msg: msg
  };
};

var err6 = function err6(_ref6) {
  var email = _ref6.email,
      locale = _ref6.locale;

  switch (locale) {
    case 'es':
      msg = "El correo electr\xF3nico ".concat(email, " ya existe.");
      break;

    case 'de':
      msg = "".concat(email, " already exists.");
      break;

    default:
      msg = "Email ".concat(email, " already exists.");
  }

  return {
    msg: msg
  };
};

var err7 = function err7(_ref7) {
  var accountId = _ref7.accountId,
      locale = _ref7.locale;

  switch (locale) {
    case 'es':
      msg = "There is an existing application for ".concat(accountId);
      break;

    case 'de':
      msg = "There is an existing application for ".concat(accountId);
      break;

    default:
      msg = "There is an existing application for ".concat(accountId);
  }

  return {
    msg: msg
  };
};

var serverErr = function serverErr(_ref8) {
  var locale = _ref8.locale;

  switch (locale) {
    case 'es':
      msg = 'Server error: Please contact support';
      break;

    case 'de':
      msg = 'Server error: Please contact support';
      break;

    default:
      msg = 'Server error: Please contact support';
  }

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
  serverErr: serverErr
};