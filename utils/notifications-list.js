// USER NOTIFICATIONS (belongs to user)
const welcome = ({ user, locale }) => {
    switch (locale) {
        case 'de':
            message = 'Thank you for registering and welcome to VolumeKings.com'
            break
        case 'es':
            message = 'Thank you for registering and welcome to VolumeKings.com'
            break
        case 'it':
            message = 'Thank you for registering and welcome to VolumeKings.com'
            break
        case 'pl':
            message = 'Thank you for registering and welcome to VolumeKings.com'
            break
        case 'pt':
            message = 'Thank you for registering and welcome to VolumeKings.com'
            break

        default:
            message = 'Thank you for registering and welcome to VolumeKings.com'
    }
    return {
        message: message,
        type: 'General',
        belongsTo: user._id,
    }
}

const hasApplied = ({ accountId, _id, locale }) => {
    switch (locale) {
        case 'de':
            message = `We have received your application for ${accountId}`
            break
        case 'es':
            message = `We have received your application for ${accountId}`
            break
        case 'it':
            message = `We have received your application for ${accountId}`
            break
        case 'pl':
            message = `We have received your application for ${accountId}`
            break
        case 'pt':
            message = `We have received your application for ${accountId}`
            break
        default:
            message = `We have received your application for ${accountId}`
    }
    return {
        message,
        type: 'Application',
        belongsTo: _id,
    }
}
const updateApplication = ({ status, accountId, _id, locale }) => {
    switch (locale) {
        case 'de':
            message = `Requested ${status} VIP upgrade for ${accountId}`
            break
        case 'es':
            message = `Requested ${status} VIP upgrade for ${accountId}`
            break
        case 'it':
            message = `Requested ${status} VIP upgrade for ${accountId}`
            break
        case 'pl':
            message = `Requested ${status} VIP upgrade for ${accountId}`
            break
        case 'pt':
            message = `Requested ${status} VIP upgrade for ${accountId}`
            break
        default:
            message = `Requested ${status} VIP upgrade for ${accountId}`
    }
    return {
        message,
        type: 'Application',
        belongsTo: _id,
    }
}
const requestedPayment = ({
    symbol,
    amount,
    brand,
    paymentAccount,
    belongsTo,
    locale,
}) => {
    switch (locale) {
        case 'de':
            message = `You have requested ${symbol}${amount.toFixed(
                2
            )} to be sent to ${brand} account ${paymentAccount}`
            break
        case 'es':
            message = `You have requested ${symbol}${amount.toFixed(
                2
            )} to be sent to ${brand} account ${paymentAccount}`
            break
        case 'it':
            message = `You have requested ${symbol}${amount.toFixed(
                2
            )} to be sent to ${brand} account ${paymentAccount}`
            break
        case 'pl':
            message = `You have requested ${symbol}${amount.toFixed(
                2
            )} to be sent to ${brand} account ${paymentAccount}`
            break
        case 'pt':
            message = `You have requested ${symbol}${amount.toFixed(
                2
            )} to be sent to ${brand} account ${paymentAccount}`
            break
        default:
            message = `You have requested ${symbol}${amount.toFixed(
                2
            )} to be sent to ${brand} account ${paymentAccount}`
    }
    return {
        message,
        type: 'Payment',
        belongsTo,
    }
}
const applicationYY = ({ brand, accountId, belongsTo, locale }) => {
    switch (locale) {
        case 'de':
            message = `${brand} account ${accountId} has been upgraded to VIP`
            break
        case 'es':
            message = `${brand} account ${accountId} has been upgraded to VIP`
            break
        case 'it':
            message = `${brand} account ${accountId} has been upgraded to VIP`
            break
        case 'pl':
            message = `${brand} account ${accountId} has been upgraded to VIP`
            break
        case 'pt':
            message = `${brand} account ${accountId} has been upgraded to VIP`
            break
        default:
            message = `${brand} account ${accountId} has been upgraded to VIP`
    }
    return {
        message,
        type: 'Application',
        belongsTo,
    }
}
const applicationYN = ({ brand, accountId, belongsTo, locale }) => {
    switch (locale) {
        case 'de':
            message = `${brand} account ${accountId} is eligible for cashback but could not be upgraded - please verify and request again`
            break
        case 'es':
            message = `${brand} account ${accountId} is eligible for cashback but could not be upgraded - please verify and request again`
            break
        case 'it':
            message = `${brand} account ${accountId} is eligible for cashback but could not be upgraded - please verify and request again`
            break
        case 'pl':
            message = `${brand} account ${accountId} is eligible for cashback but could not be upgraded - please verify and request again`
            break
        case 'pt':
            message = `${brand} account ${accountId} is eligible for cashback but could not be upgraded - please verify and request again`
            break
        default:
            message = `${brand} account ${accountId} is eligible for cashback but could not be upgraded - please verify and request again`
    }
    return {
        message,
        type: 'Application',
        belongsTo,
    }
}
const applicationNN = ({ brand, accountId, belongsTo, locale }) => {
    switch (locale) {
        case 'de':
            message = `Your application for ${brand} account ${accountId} has been rejected`
            break
        case 'es':
            message = `Your application for ${brand} account ${accountId} has been rejected`
            break
        case 'it':
            message = `Your application for ${brand} account ${accountId} has been rejected`
            break
        case 'pl':
            message = `Your application for ${brand} account ${accountId} has been rejected`
            break
        case 'pt':
            message = `Your application for ${brand} account ${accountId} has been rejected`
            break
        default:
            message = `Your application for ${brand} account ${accountId} has been rejected`
    }
    return {
        message,
        type: 'Application',
        belongsTo,
    }
}

const accountAdded = ({ accountId, belongsTo, locale }) => {
    switch (locale) {
        case 'de':
            message = `Account ${accountId} has been added to your dashboard and is now eligible`
            break
        case 'es':
            message = `Account ${accountId} has been added to your dashboard and is now eligible`
            break
        case 'it':
            message = `Account ${accountId} has been added to your dashboard and is now eligible`
            break
        case 'pl':
            message = `Account ${accountId} has been added to your dashboard and is now eligible`
            break
        case 'pt':
            message = `Account ${accountId} has been added to your dashboard and is now eligible`
            break
        default:
            message = `Account ${accountId} has been added to your dashboard and is now eligible`
    }
    return {
        message,
        type: 'Account',
        belongsTo,
    }
}

const paymentResult = ({ symbol, amount, status, belongsTo, locale }) => {
    switch (locale) {
        case 'de':
            message = `Your payout request for ${symbol}${amount.toFixed(
                2
            )} has been ${status.toLowerCase()}`
            break
        case 'es':
            message = `You have requested ${symbol}${amount.toFixed(
                2
            )} to be sent to ${brand} account ${paymentAccount}`
            break
        case 'it':
            message = `You have requested ${symbol}${amount.toFixed(
                2
            )} to be sent to ${brand} account ${paymentAccount}`
            break
        case 'pl':
            message = `You have requested ${symbol}${amount.toFixed(
                2
            )} to be sent to ${brand} account ${paymentAccount}`
            break
        case 'pt':
            message = `You have requested ${symbol}${amount.toFixed(
                2
            )} to be sent to ${brand} account ${paymentAccount}`
            break
        default:
            message = `You have requested ${symbol}${amount.toFixed(
                2
            )} to be sent to ${brand} account ${paymentAccount}`
    }
    return {
        message,
        type: 'Payment',
        belongsTo,
    }
}

/* AFFILIATE NOTIFICATIONS */
const newSubPartnerRegistered = ({ user, referredByPartner, locale }) => {
    switch (locale) {
        case 'de':
            message = `${user.email} has registered as your subpartner`
            break
        case 'es':
            message = `${user.email} has registered as your subpartner`
            break
        case 'it':
            message = `${user.email} has registered as your subpartner`
            break
        case 'pl':
            message = `${user.email} has registered as your subpartner`
            break
        case 'pt':
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
        case 'de':
            message = `You have requested additional links for ${brand}`
            break
        case 'es':
            message = `You have requested additional links for ${brand}`
            break
        case 'it':
            message = `You have requested additional links for ${brand}`
            break
        case 'pl':
            message = `You have requested additional links for ${brand}`
            break
        case 'pt':
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
    hasApplied,
    updateApplication,
    applicationYY,
    applicationYN,
    applicationNN,
    accountAdded,
    newSubPartnerRegistered,
    linksRequested,
    requestedPayment,
    paymentResult,
}
