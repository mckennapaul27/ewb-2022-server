const success1 = ({ token, user, locale }) => {
    switch (locale) {
        case 'es':
            msg = `Thank you. You have successfully registered.`
            break
        case 'de':
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

module.exports = {
    success1,
}
