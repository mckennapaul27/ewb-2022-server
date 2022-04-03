const Mustache = require('mustache')
const en = require('../locales/en/translation.json')
const es = require('../locales/es/translation.json')

/* helpers for translations */
const locales = {
    en: en,
    es: es,
}
function getMessageByKey(key, locale, variables = {}) {
    const msg = Mustache.render(
        locales[locale] ? locales[locale][key] : locales['en'][key],
        variables
    )
    return msg
}
/* helpers for translations */

// USER NOTIFICATIONS (belongs to user)
const welcome = ({ user, locale }) => {
    const message = getMessageByKey('welcome', locale)
    return {
        message: message,
        type: 'General',
        belongsTo: user._id,
    }
}

const hasApplied = ({ accountId, _id, locale }) => {
    const message = getMessageByKey('hasApplied', locale, { accountId })

    return {
        message,
        type: 'Application',
        belongsTo: _id,
    }
}
const updateApplication = ({ status, accountId, _id, locale }) => {
    const message = getMessageByKey('updateApplication', locale, {
        accountId,
        status,
    })
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
    const message = getMessageByKey('requestedPayment', locale, {
        symbol,
        amount: amount.toFixed(2),
        brand,
        paymentAccount,
    })
    return {
        message,
        type: 'Payment',
        belongsTo,
    }
}
const applicationYY = ({ brand, accountId, belongsTo, locale }) => {
    const message = getMessageByKey('applicationYY', locale, {
        accountId,
        brand,
    })
    return {
        message,
        type: 'Application',
        belongsTo,
    }
}
const applicationYN = ({ brand, accountId, belongsTo, locale }) => {
    const message = getMessageByKey('applicationYN', locale, {
        accountId,
        brand,
    })
    return {
        message,
        type: 'Application',
        belongsTo,
    }
}
const applicationNN = ({ brand, accountId, belongsTo, locale }) => {
    const message = getMessageByKey('applicationNN', locale, {
        accountId,
        brand,
    })
    return {
        message,
        type: 'Application',
        belongsTo,
    }
}

const accountAdded = ({ accountId, belongsTo, locale }) => {
    const message = getMessageByKey('accountAdded', locale, {
        accountId,
    })

    return {
        message,
        type: 'Account',
        belongsTo,
    }
}

const paymentResult = ({ symbol, amount, status, belongsTo, locale }) => {
    const paid = {
        en: 'paid',
        de: 'paid',
        es: 'paid',
        it: 'paid',
        pl: 'paid',
        pt: 'paid',
    }
    const rejected = {
        en: 'rejected',
        de: 'rejected',
        es: 'rechazado',
        it: 'rejected',
        pl: 'rejected',
        pt: 'rejected',
    }
    const message = getMessageByKey('paymentResult', locale, {
        symbol,
        amount: amount.toFixed(2),
        status: status === 'Paid' ? paid[locale] : rejected[locale],
    })

    return {
        message,
        type: 'Payment',
        belongsTo,
    }
}

/* AFFILIATE NOTIFICATIONS */
const newSubPartnerRegistered = ({ user, referredByPartner, locale }) => {
    const message = getMessageByKey('newSubPartnerRegistered', locale, {
        email: user.email,
    })
    return {
        message: message,
        type: 'Partner',
        belongsTo: referredByPartner,
    }
}

const linksRequested = ({ locale, brand, belongsTo }) => {
    // remember this is also called from auth router
    const message = getMessageByKey('linksRequested', locale, {
        brand,
    })
    return {
        message,
        type: 'Partner',
        belongsTo,
    }
}

const affAccountAdded = ({ locale, accountId, belongsTo }) => {
    const message = getMessageByKey('affAccountAdded', locale, {
        accountId,
    })
    return {
        message,
        type: 'Account',
        belongsTo,
    }
}
const affUpgradeEligible = ({
    locale,
    accountId,
    level,
    quarter,
    belongsTo,
}) => {
    const message = getMessageByKey('affUpgradeEligible', locale, {
        accountId,
        level,
        quarter,
    })
    return {
        message,
        type: 'Account',
        belongsTo,
    }
}

const reportsHaveUpdated = ({ brand }) => {
    // remember this is also called from auth router
    const message = getMessageByKey('reportsHaveUpdated', locale, {
        brand,
        day: dayjs().format('LLLL'),
    })

    return {
        message,
        type: 'Report',
        isGeneral: true,
    }
}

const updatedPaymentDetails = ({ locale, brand, belongsTo }) => {
    const message = getMessageByKey('updatedPaymentDetails', locale, {
        brand,
    })
    return {
        message,
        type: 'Account',
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
    affAccountAdded,
    affUpgradeEligible,
    updatedPaymentDetails,
}
