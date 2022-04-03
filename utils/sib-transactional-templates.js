const en = require('../locales/en/email-template-ids.json')
const es = require('../locales/es/email-template-ids.json')

/* helpers for translations */
const locales = {
    en: en,
    es: es,
}
function getTemplateIdByKey(key, locale) {
    const id = locales[locale] ? locales[locale][key] : locales['en'][key]
    return id
}
/* helpers for translations */

const sibRequestLinks = ({ locale, smtpParams, email }) => {
    const templateId = getTemplateIdByKey('sibRequestLinks', locale)
    return {
        templateId,
        smtpParams,
        tags: ['Affiliate'],
        email,
    }
}

const sibPersonalApplicationSubmit = ({ locale, smtpParams, email }) => {
    const templateId = getTemplateIdByKey(
        'sibPersonalApplicationSubmit',
        locale
    )

    return {
        templateId,
        smtpParams,
        tags: ['Application'],
        email,
    }
}

const sibForgotPassword = ({ locale, smtpParams, email }) => {
    const templateId = getTemplateIdByKey('sibForgotPassword', locale)

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
    const templateId = getTemplateIdByKey('sibPaymentDetailsUpdate', locale)

    return {
        templateId,
        smtpParams,
        tags: ['Account'],
        email,
    }
}
const sibPaymentRequest = ({ locale, smtpParams, email }) => {
    const templateId = getTemplateIdByKey('sibPaymentRequest', locale)

    return {
        templateId,
        smtpParams,
        tags: ['Payment'],
        email,
    }
}
const sibApplicationYY = ({ locale, smtpParams, email }) => {
    const templateId = getTemplateIdByKey('sibApplicationYY', locale)

    return {
        templateId,
        smtpParams,
        tags: ['Application'],
        email,
    }
}
const sibApplicationYN = ({ locale, smtpParams, email }) => {
    const templateId = getTemplateIdByKey('sibApplicationYN', locale)

    return {
        templateId,
        smtpParams,
        tags: ['Application'],
        email,
    }
}
const sibApplicationNN = ({ locale, smtpParams, email }) => {
    const templateId = getTemplateIdByKey('sibApplicationNN', locale)

    return {
        templateId,
        smtpParams,
        tags: ['Application'],
        email,
    }
}
const sibAccountAdded = ({ locale, smtpParams, email }) => {
    const templateId = getTemplateIdByKey('sibAccountAdded', locale)

    return {
        templateId,
        smtpParams,
        tags: ['Account'],
        email,
    }
}

const sibPaymentResult = ({ locale, smtpParams, email, status }) => {
    const templateId =
        status === 'Paid'
            ? getTemplateIdByKey('sibPaymentResult-paid', locale)
            : getTemplateIdByKey('sibPaymentResult-rejected', locale)

    return {
        templateId,
        smtpParams,
        tags: ['Payment'],
        email,
    }
}

const sibActiveLinksFromAdmin = ({ locale, smtpParams, email }) => {
    const templateId = getTemplateIdByKey('sibActiveLinksFromAdmin', locale)

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
    sibApplicationYY,
    sibApplicationYN,
    sibApplicationNN,
    sibAccountAdded,
    sibPaymentResult,
    sibActiveLinksFromAdmin,
}
