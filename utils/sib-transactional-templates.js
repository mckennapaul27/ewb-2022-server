const sibRequestLinks = ({ locale, smtpParams, email }) => {
    switch (locale) {
        case 'es':
            templateId = 44
            break
        case 'de':
            templateId = 44
            break
        default:
            templateId = 44
    }
    return {
        templateId,
        smtpParams,
        tags: ['Application'],
        email,
    }
}

module.exports = {
    sibRequestLinks,
}
