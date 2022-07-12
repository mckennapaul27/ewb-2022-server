const mongoose = require('mongoose')
const Schema = mongoose.Schema

const {
    defaultDealOne,
    defaultDealTwo,
    defaultActStats,
    defaultBalances,
    affiliateDealOne,
    affiliateDealTwo,
} = require('../../config/deals')

const ActiveUser = new Schema({
    paymentDetails: [
        {
            // array of currency options so that they can add as many as they like
            currency: String,
            brand: String,
            email: String,
            address: String,
            name: String,
            accountId: String,
            phoneCode: String,
            phoneNumber: String,
        },
    ],
    email: String,
    deals: [
        {
            brand: String,
            rates: [
                {
                    level: Number,
                    minVol: Number,
                    maxVol: Number,
                    cashback: Number,
                },
            ],
        },
    ],

    balances: [
        {
            // array of balances so that we can separate balances by brand
            brand: String,
            currency: String,
            current: { type: Number, default: 0 },
            commission: { type: Number, default: 0 },
            raf: { type: Number, default: 0 },
            cashback: { type: Number, default: 0 },
            payments: { type: Number, default: 0 },
            requested: { type: Number, default: 0 },
        },
    ],
    accounts: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'account',
            },
        ],
    },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    friends: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'activeuser',
            },
        ],
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activeuser',
    },
})

// pre save hook to generate dealTier's for personal dashboard
ActiveUser.pre('validate', function (next) {
    const activeUser = this
    // changed to be same as affiliate deal on 12/7/22 so that personal & affiliate are the same.
    activeUser.deals.push(affiliateDealOne('Neteller'))
    activeUser.deals.push(affiliateDealOne('Skrill'))
    activeUser.deals.push(affiliateDealTwo('ecoPayz'))
    activeUser.balances = defaultBalances
    next()
})

module.exports = mongoose.model('activeuser', ActiveUser)
