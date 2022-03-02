"use strict";

var sibRequestLinks = function sibRequestLinks(_ref) {
  var locale = _ref.locale,
      smtpParams = _ref.smtpParams,
      email = _ref.email;

  switch (locale) {
    case 'de':
      templateId = 104;
      break;

    case 'es':
      templateId = 104;
      break;

    case 'it':
      templateId = 104;
      break;

    case 'pl':
      templateId = 104;
      break;

    case 'pt':
      templateId = 104;
      break;

    default:
      templateId = 104;
  }

  return {
    templateId: templateId,
    smtpParams: smtpParams,
    tags: ['Affiliate'],
    email: email
  };
};

var sibPersonalApplicationSubmit = function sibPersonalApplicationSubmit(_ref2) {
  var locale = _ref2.locale,
      smtpParams = _ref2.smtpParams,
      email = _ref2.email;

  switch (locale) {
    case 'de':
      templateId = 123;
      break;

    case 'es':
      templateId = 123;
      break;

    case 'it':
      templateId = 123;
      break;

    case 'pl':
      templateId = 123;
      break;

    case 'pt':
      templateId = 123;
      break;

    default:
      templateId = 123;
  }

  return {
    templateId: templateId,
    smtpParams: smtpParams,
    tags: ['Application'],
    email: email
  };
};

var sibForgotPassword = function sibForgotPassword(_ref3) {
  var locale = _ref3.locale,
      smtpParams = _ref3.smtpParams,
      email = _ref3.email;

  switch (locale) {
    case 'de':
      templateId = 142;
      break;

    case 'es':
      templateId = 142;
      break;

    case 'it':
      templateId = 142;
      break;

    case 'pl':
      templateId = 142;
      break;

    case 'pt':
      templateId = 142;
      break;

    default:
      templateId = 142;
  }

  return {
    templateId: templateId,
    smtpParams: smtpParams,
    tags: ['Auth'],
    email: email
  };
};

var sibSupportSubmitted = function sibSupportSubmitted(_ref4) {
  var locale = _ref4.locale,
      smtpParams = _ref4.smtpParams,
      email = _ref4.email;

  switch (locale) {
    case 'de':
      templateId = 143;
      break;

    case 'es':
      templateId = 143;
      break;

    case 'it':
      templateId = 143;
      break;

    case 'pl':
      templateId = 143;
      break;

    case 'pt':
      templateId = 143;
      break;

    default:
      templateId = 143;
  }

  return {
    templateId: templateId,
    smtpParams: smtpParams,
    tags: ['Support'],
    email: email
  };
};

var sibPaymentDetailsUpdate = function sibPaymentDetailsUpdate(_ref5) {
  var locale = _ref5.locale,
      smtpParams = _ref5.smtpParams,
      email = _ref5.email;

  switch (locale) {
    case 'de':
      templateId = 145;
      break;

    case 'es':
      templateId = 145;
      break;

    case 'it':
      templateId = 145;
      break;

    case 'pl':
      templateId = 145;
      break;

    case 'pt':
      templateId = 145;
      break;

    default:
      templateId = 145;
  }

  return {
    templateId: templateId,
    smtpParams: smtpParams,
    tags: ['Account'],
    email: email
  };
};

var sibPaymentRequest = function sibPaymentRequest(_ref6) {
  var locale = _ref6.locale,
      smtpParams = _ref6.smtpParams,
      email = _ref6.email;

  switch (locale) {
    case 'de':
      templateId = 147;
      break;

    case 'es':
      templateId = 147;
      break;

    case 'it':
      templateId = 147;
      break;

    case 'pl':
      templateId = 147;
      break;

    case 'pt':
      templateId = 147;
      break;

    default:
      templateId = 147;
  }

  return {
    templateId: templateId,
    smtpParams: smtpParams,
    tags: ['Payment'],
    email: email
  };
};

module.exports = {
  sibRequestLinks: sibRequestLinks,
  sibPersonalApplicationSubmit: sibPersonalApplicationSubmit,
  sibForgotPassword: sibForgotPassword,
  sibSupportSubmitted: sibSupportSubmitted,
  sibPaymentDetailsUpdate: sibPaymentDetailsUpdate,
  sibPaymentRequest: sibPaymentRequest
};