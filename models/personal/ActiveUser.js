const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { defaultDealOne, defaultDealTwo, defaultActStats } = require('../../config/deals');

const ActiveUser = new Schema({ 
    paymentDetails: [{ // array of currency options so that they can add as many as they like
        currency: String,
        brand: String,
        email: String,
        address: String,
        name: String,
        accountId: String,
        phoneCode: String,
        phoneNumber: String,
    }],
    deals: [{
        brand: String,
        rates: [{
            level: Number,
            minVol: Number,
            maxVol: Number,
            cashback: Number
        }]
    }],
    stats: {
        balance: [{
            amount: {
                type: Number,
                default: 0
            },
            currency: String
        }],
        commission: [{
            amount: {
                type: Number,
                default: 0
            },
            currency: String
        }],
        raf: [{
            amount: {
                type: Number,
                default: 0
            },
            currency: String
        }],
        cashback: [{
            amount: {
                type: Number,
                default: 0
            },
            currency: String
        }],
        payments: [{
            amount: {
                type: Number,
                default: 0
            },
            currency: String
        }],
        requested: [{
            amount: {
                type: Number,
                default: 0
            },
            currency: String
        }],
    },
    accounts: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'account'
        }]
    },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }, 
    friends: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'activeuser'
        }]
    },    
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activeuser'
    }    
});

// pre save hook to generate dealTier's for personal dashboard
ActiveUser.pre('validate', function (next) {
    const activeUser = this;
    activeUser.deals.push(defaultDealOne('Neteller'));
    activeUser.deals.push(defaultDealOne('Skrill'));
    activeUser.deals.push(defaultDealTwo('ecoPayz'));
    activeUser.stats = defaultActStats;
    next();   
})

module.exports = mongoose.model('activeuser', ActiveUser);
