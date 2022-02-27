"use strict";

var success1 = function success1(_ref) {
  var token = _ref.token,
      user = _ref.user,
      locale = _ref.locale;

  switch (locale) {
    case 'es':
      msg = "Thank you. You have successfully registered.";
      break;

    case 'de':
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

module.exports = {
  success1: success1
};