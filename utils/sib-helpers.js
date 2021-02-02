const path = require('path');
require('dotenv').config({path: path.join(__dirname, '../.env')});

const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SIBKEY;


// 1. List functions

// Add contact to list. Pass array of email addresses and listId - This function is to move an EXISTING contact to a new list
const addContactToList = async (listId, emails) => { // emails is Array of strings
    const apiInstance = new SibApiV3Sdk.ContactsApi();
    const contactEmails = new SibApiV3Sdk.AddContactToList();
    contactEmails.emails = emails;
    try {
        const res = await apiInstance.addContactToList(listId, contactEmails);
        console.log(res);
        Promise.resolve(res);
    } catch (error) {
        console.log(error);
        Promise.reject(error);
    }
}

// addContactToList(9, ['mckennapaul27@gmail.com', 'paulmckenna191986@hotmail.co.uk']) // Test call

// Remove contact from list. Pass array of email addresses and listId
function removeContactFromList (listId, emails) {
    const apiInstance = new SibApiV3Sdk.ContactsApi();
    const contactEmails = new SibApiV3Sdk.RemoveContactFromList();
    contactEmails.emails = emails;
    apiInstance.removeContactFromList(listId, contactEmails)
    .then(r => r)
    .catch(e => e)
}

// removeContactFromList(9, ['mckennapaul27@gmail.com', 'paulmckenna191986@hotmail.co.uk']) // Test call

// 2. Attribute functions

// Get all contact attributes
function getAttributes () {
    const apiInstance = new SibApiV3Sdk.AttributesApi();
    apiInstance.getAttributes()
    .then(r => r)
    .catch(e => e)
}

function updateAttribute (attributeName) {
    const apiInstance = new SibApiV3Sdk.AttributesApi();
    const attributeCategory = 'normal';
    const updateAttribute = new SibApiV3Sdk.UpdateAttribute();
    apiInstance.updateAttribute(attributeCategory, attributeName, updateAttribute)
    .then(r => r)
    .catch(e => e)
}

// 3. Contact functions

// Update contact by passing email, attributes object, listIds to link and unlink
function updateContact (email, attributes, listIds, unlinkListIds) { // Pass in email, object of attrbutes, array of listIds and unlinkIds
    const apiInstance = new SibApiV3Sdk.ContactsApi();
    const updateContact = new SibApiV3Sdk.UpdateContact();
    updateContact.attributes = attributes;
    updateContact.listIds = listIds; // array of listIds to add contact to
    updateContact.unlinkListIds = unlinkListIds; // array of listIds to remove contact from
    apiInstance.updateContact(email, updateContact)
    .then(r => r)
    .catch(e => e)
};


// 4. Emails

const sendEmail = async ({ templateId, smtpParams, tags, email }) => { // templateId = ID of SIB template, smtpParams = params object {}, tags = Array, email is who it is sent to
    
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    let sender = {
        name: 'eWalletBooster',
        email: 'support@ewalletbooster.com'
    }
    sendSmtpEmail = {
        sender: sender,
        to: [{ email }], // array of objects
        replyTo: sender,
        templateId,
        tags,
        params: smtpParams
    };
    try {
        const res = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(res);
        Promise.resolve(res);
    } catch (error) {
        console.log(error);
        Promise.reject(error);
    }
}

module.exports = {
    addContactToList,
    removeContactFromList,
    getAttributes,
    updateAttribute,
    updateContact,
    sendEmail
}











