"use strict";

var en = require('../locales/en/email-template-ids.json');

var es = require('../locales/es/email-template-ids.json');
/* helpers for translations */


var locales = {
  en: en,
  es: es
};

function getTemplateIdByKey(key, locale) {
  var id = locales[locale] ? locales[locale][key] : locales['en'][key];
  return id;
}
/* helpers for translations */


var sibRequestLinks = function sibRequestLinks(_ref) {
  var locale = _ref.locale,
      smtpParams = _ref.smtpParams,
      email = _ref.email;
  var templateId = getTemplateIdByKey('sibRequestLinks', locale);
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
  var templateId = getTemplateIdByKey('sibPersonalApplicationSubmit', locale);
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
  var templateId = getTemplateIdByKey('sibForgotPassword', locale);
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
  var templateId = getTemplateIdByKey('sibPaymentDetailsUpdate', locale);
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
  var templateId = getTemplateIdByKey('sibPaymentRequest', locale);
  return {
    templateId: templateId,
    smtpParams: smtpParams,
    tags: ['Payment'],
    email: email
  };
};

var sibApplicationYY = function sibApplicationYY(_ref7) {
  var locale = _ref7.locale,
      smtpParams = _ref7.smtpParams,
      email = _ref7.email;
  var templateId = getTemplateIdByKey('sibApplicationYY', locale);
  return {
    templateId: templateId,
    smtpParams: smtpParams,
    tags: ['Application'],
    email: email
  };
};

var sibApplicationYN = function sibApplicationYN(_ref8) {
  var locale = _ref8.locale,
      smtpParams = _ref8.smtpParams,
      email = _ref8.email;
  var templateId = getTemplateIdByKey('sibApplicationYN', locale);
  return {
    templateId: templateId,
    smtpParams: smtpParams,
    tags: ['Application'],
    email: email
  };
};

var sibApplicationNN = function sibApplicationNN(_ref9) {
  var locale = _ref9.locale,
      smtpParams = _ref9.smtpParams,
      email = _ref9.email;
  var templateId = getTemplateIdByKey('sibApplicationNN', locale);
  return {
    templateId: templateId,
    smtpParams: smtpParams,
    tags: ['Application'],
    email: email
  };
};

var sibAccountAdded = function sibAccountAdded(_ref10) {
  var locale = _ref10.locale,
      smtpParams = _ref10.smtpParams,
      email = _ref10.email;
  var templateId = getTemplateIdByKey('sibAccountAdded', locale);
  return {
    templateId: templateId,
    smtpParams: smtpParams,
    tags: ['Account'],
    email: email
  };
};

var sibPaymentResult = function sibPaymentResult(_ref11) {
  var locale = _ref11.locale,
      smtpParams = _ref11.smtpParams,
      email = _ref11.email,
      status = _ref11.status;
  var templateId = status === 'Paid' ? getTemplateIdByKey('sibPaymentResult-paid', locale) : getTemplateIdByKey('sibPaymentResult-rejected', locale);
  return {
    templateId: templateId,
    smtpParams: smtpParams,
    tags: ['Payment'],
    email: email
  };
};

var sibActiveLinksFromAdmin = function sibActiveLinksFromAdmin(_ref12) {
  var locale = _ref12.locale,
      smtpParams = _ref12.smtpParams,
      email = _ref12.email;
  var templateId = getTemplateIdByKey('sibActiveLinksFromAdmin', locale);
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
  sibPaymentRequest: sibPaymentRequest,
  sibApplicationYY: sibApplicationYY,
  sibApplicationYN: sibApplicationYN,
  sibApplicationNN: sibApplicationNN,
  sibAccountAdded: sibAccountAdded,
  sibPaymentResult: sibPaymentResult,
  sibActiveLinksFromAdmin: sibActiveLinksFromAdmin
};