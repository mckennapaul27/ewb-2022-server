const msgRegistered = ({ token, user, locale }) => {
    switch (locale) {
        case 'de':
            msg = `Thank you. You have successfully registered.`
            break
        case 'es':
            msg = `Thank you. You have successfully registered.`
            break
        case 'it':
            msg = `Thank you. You have successfully registered.`
            break
        case 'pl':
            msg = `Thank you. You have successfully registered.`
            break
        case 'pt':
            msg = `Thank you. You have successfully registered.`
            break
        default:
            msg = `Thank you. You have successfully registered.`
    }
    return {
        msg,
        token,
        user,
    }
}

const msgSubscribed = ({ locale }) => {
    switch (locale) {
        case 'de':
            msg = `Thank you. You have joined our newsletter and have requested more information on our deals`
            break
        case 'es':
            msg = `Thank you. You have joined our newsletter and have requested more information on our deals`
            break
        case 'it':
            msg = `Thank you. You have joined our newsletter and have requested more information on our deals`
            break
        case 'pl':
            msg = `Thank you. You have joined our newsletter and have requested more information on our deals`
            break
        case 'pt':
            msg = `Thank you. You have joined our newsletter and have requested more information on our deals`
            break
        default:
            msg = `Thank you. You have joined our newsletter and have requested more information on our deals`
    }
    return {
        msg,
    }
}
const msgForgotPassword = ({ locale, token }) => {
    switch (locale) {
        case 'de':
            msg = `Kindly check your email for further instructions`
            break
        case 'es':
            msg = `Kindly check your email for further instructions`
            break
        case 'it':
            msg = `Kindly check your email for further instructions`
            break
        case 'pl':
            msg = `Kindly check your email for further instructions`
            break
        case 'pt':
            msg = `Kindly check your email for further instructions`
            break
        default:
            msg = `Kindly check your email for further instructions`
    }
    return {
        msg,
        token,
    }
}
const msgPasswordReset = ({ locale, user }) => {
    switch (locale) {
        case 'de':
            msg = `Password successfully reset. Please login`
            break
        case 'es':
            msg = `Password successfully reset. Please login`
            break
        case 'it':
            msg = `Password successfully reset. Please login`
            break
        case 'pl':
            msg = `Password successfully reset. Please login`
            break
        case 'pt':
            msg = `Password successfully reset. Please login`
            break
        default:
            msg = `Password successfully reset. Please login`
    }
    return {
        msg,
        user,
    }
}

const msgSupportSubmitted = ({ locale }) => {
    switch (locale) {
        case 'de':
            msg = `We have received your support enquiry`
            break
        case 'es':
            msg = `We have received your support enquiry`
            break
        case 'it':
            msg = `We have received your support enquiry`
            break
        case 'pl':
            msg = `We have received your support enquiry`
            break
        case 'pt':
            msg = `We have received your support enquiry`
            break
        default:
            msg = `We have received your support enquiry`
    }
    return {
        msg,
    }
}
const msgVIPRequestSubmitted = ({ locale, status, accountId }) => {
    switch (locale) {
        case 'de':
            msg = `Requested ${status} for ${accountId}`
            break
        case 'es':
            msg = `Requested ${status} for ${accountId}`
            break
        case 'it':
            msg = `Requested ${status} for ${accountId}`
            break
        case 'pl':
            msg = `Requested ${status} for ${accountId}`
            break
        case 'pt':
            msg = `Requested ${status} for ${accountId}`
            break
        default:
            msg = `Requested ${status} for ${accountId}`
    }
    return {
        msg,
    }
}

const msgApplicationSubmitted = ({ locale, accountId }) => {
    switch (locale) {
        case 'de':
            msg = `You have successfully submitted an application for ${accountId}`
            break
        case 'es':
            msg = `You have successfully submitted an application for ${accountId}`
            break
        case 'it':
            msg = `You have successfully submitted an application for ${accountId}`
            break
        case 'pl':
            msg = `You have successfully submitted an application for ${accountId}`
            break
        case 'pt':
            msg = `You have successfully submitted an application for ${accountId}`
            break
        default:
            msg = `You have successfully submitted an application for ${accountId}`
    }
    return {
        msg,
    }
}

const msgPaymentDetailsUpdate = ({ locale, activeUser }) => {
    switch (locale) {
        case 'de':
            msg = `Successfully updated payment method`
            break
        case 'es':
            msg = `Successfully updated payment method`
            break
        case 'it':
            msg = `Successfully updated payment method`
            break
        case 'pl':
            msg = `Successfully updated payment method`
            break
        case 'pt':
            msg = `Successfully updated payment method`
            break
        default:
            msg = `Successfully updated payment method`
    }
    return {
        msg,
        activeUser,
    }
}

const msgPaymentRequest = ({ locale, currency, amount, newPayment }) => {
    switch (locale) {
        case 'de':
            msg = `You have requested ${currency} ${amount}`
            break
        case 'es':
            msg = `Este es requested ${currency} ${amount}`
            break
        case 'it':
            msg = `You have requested ${currency} ${amount}`
            break
        case 'pl':
            msg = `You have requested ${currency} ${amount}`
            break
        case 'pt':
            msg = `You have requested ${currency} ${amount}`
            break
        default:
            msg = `You have requested ${currency} ${amount}`
    }
    return {
        msg,
        newPayment,
    }
}

const msgRequestedLinks = ({ locale, brand, partner }) => {
    switch (locale) {
        case 'de':
            msg = `Requested additional links for ${brand}`
            break
        case 'es':
            msg = `Requested additional links for ${brand}`
            break
        case 'it':
            msg = `Requested additional links for ${brand}`
            break
        case 'pl':
            msg = `Requested additional links for ${brand}`
            break
        case 'pt':
            msg = `Requested additional links for ${brand}`
            break
        default:
            msg = `Requested additional links for ${brand}`
    }
    return {
        partner,
        msg,
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
}
