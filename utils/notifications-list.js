const C = require('chance')
const app = require('../server')
const chance = new C()
// message: chance.sentence({ words: 8 }),

// USER NOTIFICATIONS (belongs to user)
const welcome = ({ user, locale }) => {
    switch (locale) {
        case 'es':
            message = 'Bienvenido to VolumeKings.com'
            break
        case 'de':
            message = 'Wilkommen to VolumeKings.com'
            break
        default:
            message = 'Welcome to VolumeKings.com'
    }
    return {
        message: message,
        type: 'General',
        belongsTo: user._id,
    }
}
const welcomeSocial = (user) => ({
    message: `Welcome, ${user.name}`,
    type: 'General',
    belongsTo: user._id,
})

const hasApplied = ({ newApp, _id, locale }) => {
    switch (locale) {
        case 'es':
            message = `We have received your application for ${newApp.accountId}`
            break
        case 'de':
            message = `We have received your application for ${newApp.accountId}`
            break
        default:
            message = `We have received your application for ${newApp.accountId}`
    }
    return {
        message,
        type: 'Application',
        belongsTo: _id,
    }
}
const updateApplication = (a, _id) => ({
    message: `Requested ${a.availableUpgrade.status} VIP upgrade for ${a.accountId}`,
    type: 'Application',
    belongsTo: _id,
})

const applicationYY = ({ brand, accountId, belongsTo }) => ({
    message: `${brand} account ${accountId} has been upgraded to VIP`,
    type: 'Application',
    belongsTo: belongsTo,
})
const applicationYN = ({ brand, accountId, belongsTo }) => ({
    message: `${brand} account ${accountId} could not be upgraded - please verify and request again`,
    type: 'Application',
    belongsTo: belongsTo,
})
const applicationNN = ({ brand, accountId, belongsTo }) => ({
    message: `Your application for ${brand} account ${accountId} has been rejected`,
    type: 'Application',
    belongsTo: belongsTo,
})

/* AFFILIATE NOTIFICATIONS */
const newSubPartnerRegistered = ({ user, referredByPartner, locale }) => {
    switch (locale) {
        case 'es':
            message = `${user.email} has registered as your subpartner`
            break
        case 'de':
            message = `${user.email} has registered as your subpartner`
            break
        default:
            message = `${user.email} has registered as your subpartner`
    }
    return {
        message: message,
        type: 'Partner',
        belongsTo: referredByPartner,
    }
}

const linksRequested = ({ locale, brand, belongsTo }) => {
    // remember this is also called from auth router
    switch (locale) {
        case 'es':
            message = `You have requested additional links for ${brand}`
            break
        case 'de':
            message = `You have requested additional links for ${brand}`
            break
        default:
            message = `You have requested additional links for ${brand}`
    }
    return {
        message,
        type: 'Partner',
        belongsTo,
    }
}

module.exports = {
    welcome,
    welcomeSocial,
    hasApplied,
    updateApplication,
    applicationYY,
    applicationYN,
    applicationNN,
    newSubPartnerRegistered,
    linksRequested,
}
