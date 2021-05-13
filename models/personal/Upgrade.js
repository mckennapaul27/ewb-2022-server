const mongoose = require('mongoose');
const { sendEmail } = require('../../utils/sib-helpers');
const UserNotification = require('../common/UserNotification');
const ActiveUser = require('./ActiveUser');
const Application = require('./Application');
const Schema = mongoose.Schema;

const Upgrade = new Schema({ 
    level: String,
    quarter: String,
    accountId: String,
    brand: String,
    startDate: Number,
    endDate: Number,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'application',
        required: false
    }
});

Upgrade.pre('save', async function (next) {
    const a = this;
    const { isNew, accountId, quarter, brand, level } = a;
    try {
        if (isNew) {
            const { belongsTo } = (await Application.findOne({ accountId }).select('belongsTo').lean()); // find application
            if (belongsTo) {
                const res = await ActiveUser.findById(belongsTo).select('email belongsTo').populate({ path: 'belongsTo', select: 'belongsTo email' }).lean();
                await createUserNotification({ 
                    message: `Account ${accountId} is eligible for a ${level} VIP upgrade for ${quarter}`, 
                    type: 'Application', 
                    belongsTo: res.belongsTo._id 
                });
                await sendEmail({
                    templateId: 73, 
                    smtpParams: {
                        BRAND: brand,
                        ACCOUNTID: accountId,
                        QUARTER: quarter,
                        LEVEL: level
                    }, 
                    tags: ['Application'], 
                    email: res.belongsTo.email
                })
                next();
            } else {
                next()
            }
        }
    } catch (error) {
        next();
    }
});

async function createUserNotification ({ message, type, belongsTo }) { return Promise.resolve(UserNotification.create({ message, type, belongsTo })); }



module.exports = mongoose.model('upgrade', Upgrade);



