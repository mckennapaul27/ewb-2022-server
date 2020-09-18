const {
    Notification
} = require('../models/common/index')
const UserCounter = require('../models/common/UserCounter')

// create notification
const createUserNotification = ({ message, type, belongsTo }) => Notification.create({ message, type, belongsTo })




module.exports = {
    createUserNotification
}


