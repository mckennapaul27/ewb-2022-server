"use strict";

var sibRequestLinks = function sibRequestLinks(_ref) {
  var locale = _ref.locale,
      smtpParams = _ref.smtpParams,
      email = _ref.email;

  switch (locale) {
    case 'es':
      templateId = 44;
      break;

    case 'de':
      templateId = 44;
      break;

    default:
      templateId = 44;
  }

  return {
    templateId: templateId,
    smtpParams: smtpParams,
    tags: ['Application'],
    email: email
  };
};

module.exports = {
  sibRequestLinks: sibRequestLinks
};