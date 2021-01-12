const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AffNotification = require('./AffNotification');

const AffAccount = new Schema({ 
    brand: String,
    accountId: String,
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

// AffAccount.pre('save', async function (next) { // https://medium.com/@justinmanalad/pre-save-hooks-in-mongoose-js-cf1c0959dba2
//     const a = this;
//     try {
//         if (a.isNew) await createAffNotification({ message: `Account ${a.accountId} has been added to your dashboard`, type: 'Account', belongsTo: a.belongsTo });
//         next();
//     } catch (error) {
//         next();
//     }
// })



async function createAffNotification ({ message, type, belongsTo }) { return Promise.resolve(AffNotification.create({ message, type, belongsTo })) } ;

module.exports = mongoose.model('affaccount', AffAccount);



