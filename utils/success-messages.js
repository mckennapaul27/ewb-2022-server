const { getMessageByKey } = require('./helper-functions')

const msgRegistered = ({ token, user, locale }) => {
    const msg = getMessageByKey('msgRegistered', locale)
    return {
        msg,
        token,
        user,
    }
}

const msgSubscribed = ({ locale }) => {
    const msg = getMessageByKey('msgSubscribed', locale)
    return {
        msg,
    }
}
const msgForgotPassword = ({ locale, token }) => {
    const msg = getMessageByKey('msgForgotPassword', locale)
    return {
        msg,
        token,
    }
}
const msgPasswordReset = ({ locale, user }) => {
    const msg = getMessageByKey('msgPasswordReset', locale)
    return {
        msg,
        user,
    }
}

const msgSupportSubmitted = ({ locale }) => {
    const msg = getMessageByKey('msgSupportSubmitted', locale)
    return {
        msg,
    }
}
const msgVIPRequestSubmitted = ({ locale, status, accountId }) => {
    const msg = getMessageByKey('msgVIPRequestSubmitted', locale, {
        status,
        accountId,
    })
    return {
        msg,
    }
}

const msgApplicationSubmitted = ({ locale, accountId }) => {
    const msg = getMessageByKey('msgApplicationSubmitted', locale, {
        accountId,
    })
    return {
        msg,
    }
}

const msgPaymentDetailsUpdate = ({ locale, activeUser }) => {
    const msg = getMessageByKey('msgPaymentDetailsUpdate', locale)

    return {
        msg,
        activeUser,
    }
}

const msgPaymentRequest = ({ locale, currency, amount, newPayment }) => {
    const msg = getMessageByKey('msgPaymentRequest', locale, {
        currency,
        amount: amount.toFixed(2),
    })

    return {
        msg,
        newPayment,
    }
}

const msgRequestedLinks = ({ locale, brand, partner }) => {
    const msg = getMessageByKey('msgRequestedLinks', locale, {
        brand,
    })
    return {
        partner,
        msg,
    }
}

const msgUpdatedDetails = ({ locale, updatedUser }) => {
    const msg = getMessageByKey('msgUpdatedDetails', locale)

    return {
        msg,
        updatedUser,
    }
}

module.exports = {
    msgRegistered,
    msgSubscribed,
    msgForgotPassword,
    msgPasswordReset,
    msgSupportSubmitted,
    msgVIPRequestSubmitted,
    msgApplicationSubmitted,
    msgPaymentDetailsUpdate,
    msgPaymentRequest,
    msgRequestedLinks,
    msgUpdatedDetails,
}
