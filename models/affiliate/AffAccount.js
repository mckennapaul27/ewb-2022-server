const mongoose = require('mongoose');
const { sendEmail } = require('../../utils/sib-helpers');
const Schema = mongoose.Schema;
const AffNotification = require('./AffNotification');
const AffPartner = require('./AffPartner');

const AffAccount = new Schema({ 
    brand: String,
    accountId: String,
    country: String,
    dateAdded: { type: Number, default: Date.now },
    reports: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affreport'
    }],
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});

AffAccount.pre('save', async function (next) { // https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2
    const a = this;
    try {
        if (a.isNew) {
            const { email, isPermitted } = (await AffPartner.findById(a.belongsTo).select('email isPermitted').lean());
            if (isPermitted) {
                await createAffNotification({ message: `Account ${a.accountId} has been added to your dashboard`, type: 'Account', belongsTo: a.belongsTo });
                await sendEmail({
                    templateId: 22, 
                    smtpParams: {
                        BRAND: a.brand,
                        ACCOUNTID: a.accountId
                    }, 
                    tags: ['Account'], 
                    email
                })
                next();
            } else {
                next()
            }
        } 
    } catch (error) {
        next();
    }
})



async function createAffNotification ({ message, type, belongsTo }) { return Promise.resolve(AffNotification.create({ message, type, belongsTo })) } ;

module.exports = mongoose.model('affaccount', AffAccount);



