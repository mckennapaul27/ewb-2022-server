const err1 = ({ locale }) => {
    switch (locale) {
        case 'es':
            msg = `'Please enter your name and try again'`
            break
        case 'de':
            msg = `'Please enter your name and try again'`
            break
        default:
            msg = `'Please enter your name and try again'`
    }
    return {
        msg,
    }
}
const err2 = ({ locale }) => {
    switch (locale) {
        case 'es':
            msg = `Please enter an email address and try again`
            break
        case 'de':
            msg = `Please enter an email address and try again`
            break
        default:
            msg = `Please enter an email address and try again`
    }
    return {
        msg,
    }
}
const err3 = ({ locale }) => {
    switch (locale) {
        case 'es':
            msg = `Please enter a password and try again`
            break
        case 'de':
            msg = `Please enter a password and try again`
            break
        default:
            msg = `Please enter a password and try again`
    }
    return {
        msg,
    }
}
const err4 = ({ locale }) => {
    switch (locale) {
        case 'es':
            msg = `Please select your country and try again`
            break
        case 'de':
            msg = `Please select your country and try again`
            break
        default:
            msg = `Please select your country and try again`
    }
    return {
        msg,
    }
}
const err5 = ({ locale }) => {
    switch (locale) {
        case 'es':
            msg = `Please select your preferred language try again`
            break
        case 'de':
            msg = `Please select your preferred language try again`
            break
        default:
            msg = `Please select your preferred language try again`
    }
    return {
        msg,
    }
}
const err6 = ({ email, locale }) => {
    switch (locale) {
        case 'es':
            msg = `El correo electrónico ${email} ya existe.`
            break
        case 'de':
            msg = `${email} already exists.`
            break
        default:
            msg = `Email ${email} already exists.`
    }
    return {
        msg,
    }
}
const err7 = ({ accountId, locale }) => {
    switch (locale) {
        case 'es':
            msg = `There is an existing application for ${accountId}`
            break
        case 'de':
            msg = `There is an existing application for ${accountId}`
            break
        default:
            msg = `There is an existing application for ${accountId}`
    }
    return {
        msg,
    }
}
const serverErr = ({ locale }) => {
    switch (locale) {
        case 'es':
            msg = 'Server error: Please contact support'
            break
        case 'de':
            msg = 'Server error: Please contact support'
            break
        default:
            msg = 'Server error: Please contact support'
    }
    return {
        msg,
    }
}

module.exports = {
    err1,
    err2,
    err3,
    err4,

    err5,
    err6,
    err7,
    serverErr,
}
