const mongoose = require('mongoose');
const { sendEmail } = require('../../utils/sib-helpers');
const AffApplication = require('./AffApplication');
const Schema = mongoose.Schema;
const AffNotification = require('./AffNotification');
const AffPartner = require('./AffPartner');

const AffUpgrade = new Schema({ 
    level: String,
    quarter: String,
    accountId: String,
    brand: String,
    startDate: Number,
    endDate: Number,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affapplication',
        required: false
    }
});

AffUpgrade.pre('save', async function (next) { // https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2
    const a = this;
    const { isNew, accountId, quarter, brand, level } = a;
    try {
        if (isNew) {
            const { belongsTo } = (await AffApplication.findOne({ accountId }).select('belongsTo').lean()); // find affpartner
            
            const { email } = (await AffPartner.findById(belongsTo).select('email').lean()); // find email
            await createAffNotification({ message: `Account ${accountId} is eligible for a ${level} VIP upgrade for ${quarter}`, type: 'Application', belongsTo });
            await sendEmail({
                templateId: 73, 
                smtpParams: {
                    BRAND: brand,
                    ACCOUNTID: accountId,
                    QUARTER: quarter,
                    LEVEL: level
                }, 
                tags: ['Application'], 
                email
            })
            next();
        }
    } catch (error) {
        console.log(error);
        next();
    }
})



async function createAffNotification ({ message, type, belongsTo }) { return Promise.resolve(AffNotification.create({ message, type, belongsTo })) } ;

module.exports = mongoose.model('affupgrade', AffUpgrade);



