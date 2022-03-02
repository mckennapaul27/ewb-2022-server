const sibRequestLinks = ({ locale, smtpParams, email }) => {
    switch (locale) {
        case 'de':
            templateId = 104
            break
        case 'es':
            templateId = 104
            break
        case 'it':
            templateId = 104
            break
        case 'pl':
            templateId = 104
            break
        case 'pt':
            templateId = 104
            break
        default:
            templateId = 104
    }
    return {
        templateId,
        smtpParams,
        tags: ['Affiliate'],
        email,
    }
}

const sibPersonalApplicationSubmit = ({ locale, smtpParams, email }) => {
    switch (locale) {
        case 'de':
            templateId = 123
            break
        case 'es':
            templateId = 123
            break
        case 'it':
            templateId = 123
            break
        case 'pl':
            templateId = 123
            break
        case 'pt':
            templateId = 123
            break
        default:
            templateId = 123
    }
    return {
        templateId,
        smtpParams,
        tags: ['Application'],
        email,
    }
}

const sibForgotPassword = ({ locale, smtpParams, email }) => {
    switch (locale) {
        case 'de':
            templateId = 142
            break
        case 'es':
            templateId = 142
            break
        case 'it':
            templateId = 142
            break
        case 'pl':
            templateId = 142
            break
        case 'pt':
            templateId = 142
            break
        default:
            templateId = 142
    }
    return {
        templateId,
        smtpParams,
        tags: ['Auth'],
        email,
    }
}
const sibSupportSubmitted = ({ locale, smtpParams, email }) => {
    switch (locale) {
        case 'de':
            templateId = 143
            break
        case 'es':
            templateId = 143
            break
        case 'it':
            templateId = 143
            break
        case 'pl':
            templateId = 143
            break
        case 'pt':
            templateId = 143
            break
        default:
            templateId = 143
    }
    return {
        templateId,
        smtpParams,
        tags: ['Support'],
        email,
    }
}
const sibPaymentDetailsUpdate = ({ locale, smtpParams, email }) => {
    switch (locale) {
        case 'de':
            templateId = 145
            break
        case 'es':
            templateId = 145
            break
        case 'it':
            templateId = 145
            break
        case 'pl':
            templateId = 145
            break
        case 'pt':
            templateId = 145
            break
        default:
            templateId = 145
    }
    return {
        templateId,
        smtpParams,
        tags: ['Account'],
        email,
    }
}
const sibPaymentRequest = ({ locale, smtpParams, email }) => {
    switch (locale) {
        case 'de':
            templateId = 147
            break
        case 'es':
            templateId = 147
            break
        case 'it':
            templateId = 147
            break
        case 'pl':
            templateId = 147
            break
        case 'pt':
            templateId = 147
            break
        default:
            templateId = 147
    }

    return {
        templateId,
        smtpParams,
        tags: ['Payment'],
        email,
    }
}
module.exports = {
    sibRequestLinks,
    sibPersonalApplicationSubmit,
    sibForgotPassword,
    sibSupportSubmitted,
    sibPaymentDetailsUpdate,
    sibPaymentRequest,
}
