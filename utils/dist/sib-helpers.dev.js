"use strict";

var dayjs = require('dayjs');

var path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../.env')
});

var SibApiV3Sdk = require('sib-api-v3-sdk');

var defaultClient = SibApiV3Sdk.ApiClient.instance; // Configure API key authorization: api-key

var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SIBKEY; // // 1. List functions
// Add contact to list. Pass array of email addresses and listId - This function is to move an EXISTING contact to a new list

var addContactToList = function addContactToList(listId, emails) {
  var apiInstance, contactEmails, res;
  return regeneratorRuntime.async(function addContactToList$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // emails is Array of strings
          apiInstance = new SibApiV3Sdk.ContactsApi();
          contactEmails = new SibApiV3Sdk.AddContactToList();
          contactEmails.emails = emails;
          _context.prev = 3;
          _context.next = 6;
          return regeneratorRuntime.awrap(apiInstance.addContactToList(listId, contactEmails));

        case 6:
          res = _context.sent;
          Promise.resolve(res);
          _context.next = 13;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](3);
          Promise.reject(_context.t0);

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[3, 10]]);
}; // addContactToList(9, ['mckennapaul27@gmail.com', 'paulmckenna191986@hotmail.co.uk']) // Test call
// Remove contact from list. Pass array of email addresses and listId


function removeContactFromList(listId, emails) {
  var apiInstance = new SibApiV3Sdk.ContactsApi();
  var contactEmails = new SibApiV3Sdk.RemoveContactFromList();
  contactEmails.emails = emails;
  apiInstance.removeContactFromList(listId, contactEmails).then(function (r) {
    return r;
  })["catch"](function (e) {
    return e;
  });
} // removeContactFromList(9, ['mckennapaul27@gmail.com', 'paulmckenna191986@hotmail.co.uk']) // Test call
// // 2. Attribute functions
// Get all contact attributes


function getAttributes() {
  var apiInstance = new SibApiV3Sdk.AttributesApi();
  apiInstance.getAttributes().then(function (r) {
    return r;
  })["catch"](function (e) {
    return e;
  });
}

function updateAttribute(attributeName) {
  var apiInstance = new SibApiV3Sdk.AttributesApi();
  var attributeCategory = 'normal';
  var updateAttribute = new SibApiV3Sdk.UpdateAttribute();
  apiInstance.updateAttribute(attributeCategory, attributeName, updateAttribute).then(function (r) {
    return r;
  })["catch"](function (e) {
    return e;
  });
} // // 3. Contact functions
// create new contact by passing email, name, userId, country and regDate


var createNewContact = function createNewContact(_ref) {
  var _ref$user, email, name, userId, country, locale, apiInstance, createContact, res;

  return regeneratorRuntime.async(function createNewContact$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _ref$user = _ref.user, email = _ref$user.email, name = _ref$user.name, userId = _ref$user.userId, country = _ref$user.country, locale = _ref$user.locale;
          apiInstance = new SibApiV3Sdk.ContactsApi();
          createContact = new SibApiV3Sdk.CreateContact();
          createContact.email = email;
          createContact.attributes = {
            FIRSTNAME: name,
            USERID: userId,
            COUNTRY: country
          };
          _context2.t0 = locale;
          _context2.next = _context2.t0 === 'de' ? 8 : _context2.t0 === 'es' ? 10 : _context2.t0 === 'it' ? 12 : _context2.t0 === 'pl' ? 14 : _context2.t0 === 'pt' ? 16 : 18;
          break;

        case 8:
          listIds = [27];
          return _context2.abrupt("break", 19);

        case 10:
          listIds = [28];
          return _context2.abrupt("break", 19);

        case 12:
          listIds = [33];
          return _context2.abrupt("break", 19);

        case 14:
          listIds = [30];
          return _context2.abrupt("break", 19);

        case 16:
          listIds = [31];
          return _context2.abrupt("break", 19);

        case 18:
          listIds = [32];

        case 19:
          createContact.listIds = listIds;
          _context2.prev = 20;
          _context2.next = 23;
          return regeneratorRuntime.awrap(apiInstance.createContact(createContact));

        case 23:
          res = _context2.sent;
          Promise.resolve(res);
          _context2.next = 30;
          break;

        case 27:
          _context2.prev = 27;
          _context2.t1 = _context2["catch"](20);
          return _context2.abrupt("return", _context2.t1);

        case 30:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[20, 27]]);
}; // Update contact by passing email, attributes object, listIds to link and unlink


function updateContact(email, attributes, listIds, unlinkListIds) {
  // Pass in email, object of attrbutes, array of listIds and unlinkIds
  var apiInstance = new SibApiV3Sdk.ContactsApi();
  var updateContact = new SibApiV3Sdk.UpdateContact();
  updateContact.attributes = attributes;
  updateContact.listIds = listIds; // array of listIds to add contact to

  updateContact.unlinkListIds = unlinkListIds; // array of listIds to remove contact from

  apiInstance.updateContact(email, updateContact).then(function (r) {
    return r;
  })["catch"](function (e) {
    return e;
  });
} // 4. Emails


var sendEmail = function sendEmail(_ref2) {
  var templateId, smtpParams, tags, email, apiInstance, sendSmtpEmail, sender, res;
  return regeneratorRuntime.async(function sendEmail$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          templateId = _ref2.templateId, smtpParams = _ref2.smtpParams, tags = _ref2.tags, email = _ref2.email;
          // templateId = ID of SIB template, smtpParams = params object {}, tags = Array, email is who it is sent to
          apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
          sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
          sender = {
            name: 'Volume Kings Support',
            email: 'support@volumekings.com'
          };
          sendSmtpEmail = {
            sender: sender,
            to: [{
              email: email
            }],
            // array of objects
            replyTo: sender,
            templateId: templateId,
            tags: tags,
            params: smtpParams
          };
          _context3.prev = 5;
          _context3.next = 8;
          return regeneratorRuntime.awrap(apiInstance.sendTransacEmail(sendSmtpEmail));

        case 8:
          res = _context3.sent;
          Promise.resolve(res);
          _context3.next = 16;
          break;

        case 12:
          _context3.prev = 12;
          _context3.t0 = _context3["catch"](5);
          console.log(_context3.t0);
          Promise.reject(_context3.t0);

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[5, 12]]);
};

var getContactInfo = function getContactInfo(_ref3) {
  var email = _ref3.email;
  var apiInstance = new SibApiV3Sdk.ContactsApi();

  try {
    var res = apiInstance.getContactInfo(email);
    console.log;
  } catch (error) {
    console.error();
  }
}; // 5. Adding a 'light' subscriber to list by locale - THIS IS UP-TO-DATE 1/3/22


var createNewSubscriber = function createNewSubscriber(_ref4) {
  var email, locale, apiInstance, createContact, res;
  return regeneratorRuntime.async(function createNewSubscriber$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          email = _ref4.email, locale = _ref4.locale;
          // add newsletter subscriber to locale
          apiInstance = new SibApiV3Sdk.ContactsApi();
          createContact = new SibApiV3Sdk.CreateContact();
          createContact.email = email;
          _context4.t0 = locale;
          _context4.next = _context4.t0 === 'de' ? 7 : _context4.t0 === 'es' ? 9 : _context4.t0 === 'it' ? 11 : _context4.t0 === 'pl' ? 13 : _context4.t0 === 'pt' ? 15 : 17;
          break;

        case 7:
          listIds = [24];
          return _context4.abrupt("break", 18);

        case 9:
          listIds = [22];
          return _context4.abrupt("break", 18);

        case 11:
          listIds = [25];
          return _context4.abrupt("break", 18);

        case 13:
          listIds = [26];
          return _context4.abrupt("break", 18);

        case 15:
          listIds = [23];
          return _context4.abrupt("break", 18);

        case 17:
          listIds = [19];

        case 18:
          createContact.listIds = listIds;
          _context4.prev = 19;
          _context4.next = 22;
          return regeneratorRuntime.awrap(apiInstance.createContact(createContact));

        case 22:
          res = _context4.sent;
          return _context4.abrupt("return", res);

        case 26:
          _context4.prev = 26;
          _context4.t1 = _context4["catch"](19);
          throw new Error(_context4.t1.response.res.text);

        case 29:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[19, 26]]);
};

module.exports = {
  addContactToList: addContactToList,
  removeContactFromList: removeContactFromList,
  getAttributes: getAttributes,
  updateAttribute: updateAttribute,
  updateContact: updateContact,
  sendEmail: sendEmail,
  createNewContact: createNewContact,
  createNewSubscriber: createNewSubscriber
};