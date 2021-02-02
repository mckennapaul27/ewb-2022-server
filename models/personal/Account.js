const mongoose = require('mongoose');
const { sendEmail } = require('../../utils/sib-helpers');
const Schema = mongoose.Schema;
const UserNotification = require('../common/UserNotification');
const ActiveUser = require('./ActiveUser');

const Account = new Schema({
    brand: String,
    accountId: String,
    dateAdded: { type: Number, default: Date.now },
    accountEmail: String,
    country: String,
    reports: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'report'
    }],
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activeuser'
    }
});


Account.pre('save', async function (next) {
    const a = this;
    try {
        if (a.isNew && a.belongsTo) {
            let activeUser = (await ActiveUser.findById(a.belongsTo).select('belongsTo email').lean()); // get the _id of the user that activeuser belongsTo
            await createUserNotification({ message: `Account ${a.accountId} has been added to your dashboard and is now eligible`, type: 'Account', belongsTo: activeUser.belongsTo });
            await sendEmail({
                templateId: 22, 
                smtpParams: {
                    BRAND: a.brand,
                    ACCOUNTID: a.accountId
                }, 
                tags: ['Account'], 
                email: activeUser.email
            })
            next();
        }
    } catch (error) {
        next();
    }
});

async function createUserNotification ({ message, type, belongsTo }) { return Promise.resolve(UserNotification.create({ message, type, belongsTo })); }


module.exports = mongoose.model('account', Account);