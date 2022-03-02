const err1 = ({ locale }) => {
    switch (locale) {
        case 'de':
            msg = `Please enter your name and try again`
            break
        case 'es':
            msg = `Please enter your name and try again`
            break
        case 'it':
            msg = `Please enter your name and try again`
            break
        case 'pl':
            msg = `Please enter your name and try again`
            break
        case 'pt':
            msg = `Please enter your name and try again`
            break
        default:
            msg = `Please enter your name and try again`
    }
    return {
        msg,
    }
}
const err2 = ({ locale }) => {
    switch (locale) {
        case 'de':
            msg = `Please enter an email address and try again`
            break
        case 'es':
            msg = `Please enter an email address and try again`
            break
        case 'it':
            msg = `Please enter an email address and try again`
            break
        case 'pl':
            msg = `Please enter an email address and try again`
            break
        case 'pt':
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
        case 'de':
            msg = `Please enter a password and try again`
            break
        case 'es':
            msg = `Please enter a password and try again`
            break
        case 'it':
            msg = `Please enter a password and try again`
            break
        case 'pl':
            msg = `Please enter a password and try again`
            break
        case 'pt':
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
        case 'de':
            msg = `Please select your country and try again`
            break
        case 'es':
            msg = `Please select your country and try again`
            break
        case 'it':
            msg = `Please select your country and try again`
            break
        case 'pl':
            msg = `Please select your country and try again`
            break
        case 'pt':
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
        case 'de':
            msg = `Please select your preferred language try again`
            break
        case 'es':
            msg = `Please select your preferred language try again`
            break
        case 'it':
            msg = `Please select your preferred language try again`
            break
        case 'pl':
            msg = `Please select your preferred language try again`
            break
        case 'pt':
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
        case 'de':
            msg = `El correo electrónico ${email} ya existe.`
            break
        case 'es':
            msg = `${email} already exists.`
            break
        case 'it':
            msg = `El correo electrónico ${email} ya existe.`
            break
        case 'pl':
            msg = `${email} already exists.`
            break
        case 'pt':
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
        case 'de':
            msg = `There is an existing application for ${accountId}`
            break
        case 'es':
            msg = `There is an existing application for ${accountId}`
            break
        case 'it':
            msg = `There is an existing application for ${accountId}`
            break
        case 'pl':
            msg = `There is an existing application for ${accountId}`
            break
        case 'pt':
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
        case 'de':
            msg = 'Server error: Please contact support'
            break
        case 'es':
            msg = 'Server error: Please contact support'
            break
        case 'it':
            msg = 'Server error: Please contact support'
            break
        case 'pl':
            msg = 'Server error: Please contact support'
            break
        case 'pt':
            msg = 'Server error: Please contact support'
            break
        default:
            msg = 'Server error: Please contact support'
    }
    return {
        msg,
    }
}
const errNoAccountExists = ({ locale, email }) => {
    switch (locale) {
        case 'de':
            msg = `No account exists with email address ${email}`
            break
        case 'es':
            msg = `No account exists with email address ${email}`
            break
        case 'it':
            msg = `No account exists with email address ${email}`
            break
        case 'pl':
            msg = `No account exists with email address ${email}`
            break
        case 'pt':
            msg = `No account exists with email address ${email}`
            break
        default:
            msg = `No account exists with email address ${email}`
    }
    return {
        msg,
    }
}
const errSibContactExists = ({ locale }) => {
    switch (locale) {
        case 'de':
            msg = 'You have already subscribed to our newsletter'
            break
        case 'es':
            msg = 'You have already subscribed to our newsletter'
            break
        case 'it':
            msg = 'You have already subscribed to our newsletter'
            break
        case 'pl':
            msg = 'You have already subscribed to our newsletter'
            break
        case 'pt':
            msg = 'You have already subscribed to our newsletter'
            break
        default:
            msg = 'You have already subscribed to our newsletter'
    }
    return {
        msg,
    }
}
const errInvalidToken = ({ locale }) => {
    switch (locale) {
        case 'de':
            msg = `Password reset token is invalid or has expired`
            break
        case 'es':
            msg = `Password reset token is invalid or has expired`
            break
        case 'it':
            msg = `Password reset token is invalid or has expired`
            break
        case 'pl':
            msg = `Password reset token is invalid or has expired`
            break
        case 'pt':
            msg = `Password reset token is invalid or has expired`
            break
        default:
            msg = `Password reset token is invalid or has expired`
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
    errSibContactExists,
    errNoAccountExists,
    errInvalidToken,
}
