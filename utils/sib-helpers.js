const dayjs = require('dayjs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const SibApiV3Sdk = require('sib-api-v3-sdk')
const defaultClient = SibApiV3Sdk.ApiClient.instance

// Configure API key authorization: api-key
let apiKey = defaultClient.authentications['api-key']
apiKey.apiKey = process.env.SIBKEY

const isEmpty = require('lodash.isempty')
// // 1. List functions

// Add contact to list. Pass array of email addresses and listId - This function is to move an EXISTING contact to a new list
const addContactToList = async (listId, emails) => {
    // emails is Array of strings
    const apiInstance = new SibApiV3Sdk.ContactsApi()
    const contactEmails = new SibApiV3Sdk.AddContactToList()
    contactEmails.emails = emails
    try {
        const res = await apiInstance.addContactToList(listId, contactEmails)
        Promise.resolve(res)
    } catch (error) {
        Promise.reject(error)
    }
}
// addContactToList(9, ['mckennapaul27@gmail.com', 'paulmckenna191986@hotmail.co.uk']) // Test call

// Remove contact from list. Pass array of email addresses and listId
function removeContactFromList(listId, emails) {
    const apiInstance = new SibApiV3Sdk.ContactsApi()
    const contactEmails = new SibApiV3Sdk.RemoveContactFromList()
    contactEmails.emails = emails
    apiInstance
        .removeContactFromList(listId, contactEmails)
        .then((r) => r)
        .catch((e) => e)
}
// removeContactFromList(9, ['mckennapaul27@gmail.com', 'paulmckenna191986@hotmail.co.uk']) // Test call

// // 2. Attribute functions

// Get all contact attributes
function getAttributes() {
    const apiInstance = new SibApiV3Sdk.AttributesApi()
    apiInstance
        .getAttributes()
        .then((r) => r)
        .catch((e) => e)
}

function updateAttribute(attributeName) {
    const apiInstance = new SibApiV3Sdk.AttributesApi()
    const attributeCategory = 'normal'
    const updateAttribute = new SibApiV3Sdk.UpdateAttribute()
    apiInstance
        .updateAttribute(attributeCategory, attributeName, updateAttribute)
        .then((r) => r)
        .catch((e) => e)
}

// // 3. Contact functions
// create new contact by passing email, name, userId, country and regDate
const createNewContact = async ({
    user: { email, name, userId, country, locale },
}) => {
    const apiInstance = new SibApiV3Sdk.ContactsApi()
    let createContact = new SibApiV3Sdk.CreateContact()
    createContact.email = email
    createContact.attributes = {
        FIRSTNAME: name,
        USERID: userId,
        COUNTRY: country,
    }

    switch (locale) {
        case 'de':
            listIds = [27]
            break
        case 'es':
            listIds = [28]
            break
        case 'it':
            listIds = [33]
            break
        case 'pl':
            listIds = [30]
            break
        case 'pt':
            listIds = [31]
            break
        default:
            listIds = [32]
    }

    createContact.listIds = listIds
    try {
        const res = await apiInstance.createContact(createContact)
        Promise.resolve(res)
    } catch (error) {
        // return error so it dowan't send error to front end in .catch of auth.router createUser
        return error
    }
}

// Update contact by passing email, attributes object, listIds to link and unlink
function updateContact(email, attributes, listIds, unlinkListIds) {
    // Pass in email, object of attrbutes, array of listIds and unlinkIds
    const apiInstance = new SibApiV3Sdk.ContactsApi()
    const updateContact = new SibApiV3Sdk.UpdateContact()
    updateContact.attributes = attributes
    updateContact.listIds = listIds // array of listIds to add contact to
    updateContact.unlinkListIds = unlinkListIds // array of listIds to remove contact from
    apiInstance
        .updateContact(email, updateContact)
        .then((r) => r)
        .catch((e) => e)
}

// 4. Emails

const sendEmail = async ({ templateId, smtpParams = {}, tags, email }) => {
    // templateId = ID of SIB template, smtpParams = params object {}, tags = Array, email is who it is sent to

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
    let sender = {
        name: 'Volume Kings Support',
        email: 'support@volumekings.com',
    }
    sendSmtpEmail = {
        sender: sender,
        to: [{ email }], // array of objects
        replyTo: sender,
        templateId,
        tags,
    }
    if (!isEmpty(smtpParams)) sendSmtpEmail[params] = smtpParams

    console.log(sendSmtpEmail)

    try {
        const res = await apiInstance.sendTransacEmail(sendSmtpEmail)
        Promise.resolve(res)
    } catch (error) {
        console.log(error)
        Promise.reject(error)
    }
}

const getContactInfo = ({ email }) => {
    const apiInstance = new SibApiV3Sdk.ContactsApi()
    try {
        const res = apiInstance.getContactInfo(email)
        console.log
    } catch (error) {
        console.error()
    }
}

// 5. Adding a 'light' subscriber to list by locale - THIS IS UP-TO-DATE 1/3/22
const createNewSubscriber = async ({ email, locale }) => {
    // add newsletter subscriber to locale
    const apiInstance = new SibApiV3Sdk.ContactsApi()
    let createContact = new SibApiV3Sdk.CreateContact()
    createContact.email = email
    switch (locale) {
        case 'de':
            listIds = [24]
            break
        case 'es':
            listIds = [22]
            break
        case 'it':
            listIds = [25]
            break
        case 'pl':
            listIds = [26]
            break
        case 'pt':
            listIds = [23]
            break
        default:
            listIds = [19]
    }

    createContact.listIds = listIds
    try {
        const res = await apiInstance.createContact(createContact)
        return res
    } catch (error) {
        throw new Error(error.response.res.text)
    }
}

module.exports = {
    addContactToList,
    removeContactFromList,
    getAttributes,
    updateAttribute,
    updateContact,
    sendEmail,
    createNewContact,
    createNewSubscriber,
}
