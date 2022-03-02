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
    newSubPartnerRegistered,
    linksRequested,
    requestedPayment,
}
