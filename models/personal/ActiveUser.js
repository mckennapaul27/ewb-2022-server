const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { defaultDealOne, defaultDealTwo, activeUserStats } = require('../../config/deals');

const ActiveUser = new Schema({ 
    paymentDetails: {
        EUR: {
            brand: String,
            email: String,
            name: String,
            accountId: String
        },
        USD: {
            brand: String,
            email: String
        }
    },
    dealTier: {
        Neteller: [{
            level: Number,
            minVol: Number,
            maxVol: Number,
            cashback: Number
        }],
        Skrill: [{
            level: Number,
            minVol: Number,
            maxVol: Number,
            cashback: Number
        }],
        ecoPayz: [{
            level: Number,
            minVol: Number,
            maxVol: Number,
            cashback: Number
        }]
    },    
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
ActiveUser.pre('save', function (next) {
    const activeUser = this;
    activeUser.dealTier.Neteller = defaultDealOne;
    activeUser.dealTier.Skrill = defaultDealOne;
    activeUser.dealTier.ecoPayz = defaultDealTwo;
    activeUser.stats = activeUserStats;
    next();   
})

module.exports = mongoose.model('activeuser', ActiveUser);
