const { UserNotification } = require('../models/common/index');

// create notification that belongs to User
const createUserNotification = ({ message, type, belongsTo }) => UserNotification.create({ message, type, belongsTo })

module.exports = {
    createUserNotification,
}


