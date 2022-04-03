const { getMessageByKey } = require('./helper-functions')

const err1 = ({ locale }) => {
    const msg = getMessageByKey('err1', locale)
    return {
        msg,
    }
}
const err2 = ({ locale }) => {
    const msg = getMessageByKey('err2', locale)
    return {
        msg,
    }
}
const err3 = ({ locale }) => {
    const msg = getMessageByKey('err3', locale)
    return {
        msg,
    }
}
const err4 = ({ locale }) => {
    const msg = getMessageByKey('err4', locale)
    return {
        msg,
    }
}
const err5 = ({ locale }) => {
    const msg = getMessageByKey('err5', locale)
    return {
        msg,
    }
}
const err6 = ({ email, locale }) => {
    const msg = getMessageByKey('err6', locale, {
        email,
    })
    return {
        msg,
    }
}

const err7 = ({ accountId, locale }) => {
    const msg = getMessageByKey('err7', locale, { accountId })
    return {
        msg,
    }
}
const serverErr = ({ locale }) => {
    const msg = getMessageByKey('serverErr', locale)
    return {
        msg,
    }
}
const errNoAccountExists = ({ locale, email }) => {
    const msg = getMessageByKey('errNoAccountExists', locale, { email })
    return {
        msg,
    }
}
const errSibContactExists = ({ locale }) => {
    const msg = getMessageByKey('errSibContactExists', locale)
    return {
        msg,
    }
}

const errInvalidToken = ({ locale }) => {
    const msg = getMessageByKey('errInvalidToken', locale)
    return {
        msg,
    }
}

const errRequestNotSuccess = ({ locale }) => {
    const msg = getMessageByKey('errRequestNotSuccess', locale)
    return {
        msg,
    }
}

const errInsufficientFunds = ({ locale }) => {
    const msg = getMessageByKey('errInsufficientFunds', locale)
    return {
        msg,
    }
}

const errIncorrectPassword = ({ locale }) => {
    const msg = getMessageByKey('errInsufficientFunds', locale)
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
    errRequestNotSuccess,
    errInsufficientFunds,
    errIncorrectPassword,
}
