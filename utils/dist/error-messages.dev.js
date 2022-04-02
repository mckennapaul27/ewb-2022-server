"use strict";

var en = require('../locales/en/translation.json');

var es = require('../locales/es/translation.json');

var locales = {
  en: en,
  es: es
};

var err1 = function err1(_ref) {
  var locale = _ref.locale;

  switch (locale) {
    case 'de':
      msg = "Please enter your name and try again";
      break;

    case 'es':
      msg = "Please enter your name and try again";
      break;

    case 'it':
      msg = "Please enter your name and try again";
      break;

    case 'pl':
      msg = "Please enter your name and try again";
      break;

    case 'pt':
      msg = "Please enter your name and try again";
      break;

    default:
      msg = "Please enter your name and try again";
  }

  return {
    msg: msg
  };
};

var err2 = function err2(_ref2) {
  var locale = _ref2.locale;

  switch (locale) {
    case 'de':
      msg = "Please enter an email address and try again";
      break;

    case 'es':
      msg = "Please enter an email address and try again";
      break;

    case 'it':
      msg = "Please enter an email address and try again";
      break;

    case 'pl':
      msg = "Please enter an email address and try again";
      break;

    case 'pt':
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
    case 'de':
      msg = "Please enter a password and try again";
      break;

    case 'es':
      msg = "Please enter a password and try again";
      break;

    case 'it':
      msg = "Please enter a password and try again";
      break;

    case 'pl':
      msg = "Please enter a password and try again";
      break;

    case 'pt':
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
    case 'de':
      msg = "Please select your country and try again";
      break;

    case 'es':
      msg = "Please select your country and try again";
      break;

    case 'it':
      msg = "Please select your country and try again";
      break;

    case 'pl':
      msg = "Please select your country and try again";
      break;

    case 'pt':
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
    case 'de':
      msg = "Please select your preferred language try again";
      break;

    case 'es':
      msg = "Please select your preferred language try again";
      break;

    case 'it':
      msg = "Please select your preferred language try again";
      break;

    case 'pl':
      msg = "Please select your preferred language try again";
      break;

    case 'pt':
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
    case 'de':
      msg = "El correo electr\xF3nico ".concat(email, " ya existe.");
      break;

    case 'es':
      msg = "".concat(email, " already exists.");
      break;

    case 'it':
      msg = "El correo electr\xF3nico ".concat(email, " ya existe.");
      break;

    case 'pl':
      msg = "".concat(email, " already exists.");
      break;

    case 'pt':
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
    case 'de':
      msg = "There is an existing application for ".concat(accountId);
      break;

    case 'es':
      msg = "There is an existing application for ".concat(accountId);
      break;

    case 'it':
      msg = "There is an existing application for ".concat(accountId);
      break;

    case 'pl':
      msg = "There is an existing application for ".concat(accountId);
      break;

    case 'pt':
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
    case 'de':
      msg = 'Server error: Please contact support';
      break;

    case 'es':
      msg = 'Server error: Please contact support';
      break;

    case 'it':
      msg = 'Server error: Please contact support';
      break;

    case 'pl':
      msg = 'Server error: Please contact support';
      break;

    case 'pt':
      msg = 'Server error: Please contact support';
      break;

    default:
      msg = 'Server error: Please contact support';
  }

  return {
    msg: msg
  };
};

var errNoAccountExists = function errNoAccountExists(_ref9) {
  var locale = _ref9.locale,
      email = _ref9.email;

  switch (locale) {
    case 'de':
      msg = "No account exists with email address ".concat(email);
      break;

    case 'es':
      msg = "No account exists with email address ".concat(email);
      break;

    case 'it':
      msg = "No account exists with email address ".concat(email);
      break;

    case 'pl':
      msg = "No account exists with email address ".concat(email);
      break;

    case 'pt':
      msg = "No account exists with email address ".concat(email);
      break;

    default:
      msg = "No account exists with email address ".concat(email);
  }

  return {
    msg: msg
  };
};

var errSibContactExists = function errSibContactExists(_ref10) {
  var locale = _ref10.locale;
  var msg = locales[locale] ? locales[locale]['errSibContactExists'] : locales[locale]['en']; // switch (locale) {
  //     case 'de':
  //         msg = 'You have already subscribed to our newsletter'
  //         break
  //     case 'es':
  //         msg = 'You have already subscribed to our newsletter'
  //         break
  //     case 'it':
  //         msg = 'You have already subscribed to our newsletter'
  //         break
  //     case 'pl':
  //         msg = 'You have already subscribed to our newsletter'
  //         break
  //     case 'pt':
  //         msg = 'You have already subscribed to our newsletter'
  //         break
  //     default:
  //         msg = 'You have already subscribed to our newsletter'
  // }

  return {
    msg: msg
  };
};

var errInvalidToken = function errInvalidToken(_ref11) {
  var locale = _ref11.locale;

  switch (locale) {
    case 'de':
      msg = "Password reset token is invalid or has expired";
      break;

    case 'es':
      msg = "Password reset token is invalid or has expired";
      break;

    case 'it':
      msg = "Password reset token is invalid or has expired";
      break;

    case 'pl':
      msg = "Password reset token is invalid or has expired";
      break;

    case 'pt':
      msg = "Password reset token is invalid or has expired";
      break;

    default:
      msg = "Password reset token is invalid or has expired";
  }

  return {
    msg: msg
  };
};

var errRequestNotSuccess = function errRequestNotSuccess(_ref12) {
  var locale = _ref12.locale;

  switch (locale) {
    case 'de':
      msg = "Request was not successful. Please contact\n            support";
      break;

    case 'es':
      msg = "Request was not successful. Please contact\n            support";
      break;

    case 'it':
      msg = "Request was not successful. Please contact\n            support";
      break;

    case 'pl':
      msg = "Request was not successful. Please contact\n            support";
      break;

    case 'pt':
      msg = "Request was not successful. Please contact\n            support";
      break;

    default:
      msg = "Request was not successful. Please contact\n            support";
  }

  return {
    success: false,
    msg: msg
  };
};

var errInsufficientFunds = function errInsufficientFunds(_ref13) {
  var locale = _ref13.locale;

  switch (locale) {
    case 'de':
      msg = 'You have insufficient funds to request this amount';
      break;

    case 'es':
      msg = 'No tiene fondos suficientes para solicitar esta cantidad';
      break;

    case 'it':
      msg = 'You have insufficient funds to request this amount';
      break;

    case 'pl':
      msg = 'You have insufficient funds to request this amount';
      break;

    case 'pt':
      msg = 'You have insufficient funds to request this amount';
      break;

    default:
      msg = 'You have insufficient funds to request this amount';
  }

  return {
    msg: msg
  };
};

var errIncorrectPassword = function errIncorrectPassword(_ref14) {
  var locale = _ref14.locale;

  switch (locale) {
    case 'de':
      msg = 'Authentication failed. Incorrect password';
      break;

    case 'es':
      msg = 'La autenticación falló. Contraseña incorrecta';
      break;

    case 'it':
      msg = 'Authentication failed. Incorrect password';
      break;

    case 'pl':
      msg = 'Authentication failed. Incorrect password';
      break;

    case 'pt':
      msg = 'Authentication failed. Incorrect password';
      break;

    default:
      msg = 'Authentication failed. Incorrect password';
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
  serverErr: serverErr,
  errSibContactExists: errSibContactExists,
  errNoAccountExists: errNoAccountExists,
  errInvalidToken: errInvalidToken,
  errRequestNotSuccess: errRequestNotSuccess,
  errInsufficientFunds: errInsufficientFunds,
  errIncorrectPassword: errIncorrectPassword
};