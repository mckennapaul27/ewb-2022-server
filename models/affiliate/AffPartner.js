const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const AffPartner = new Schema({ 
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
    revShareActive: {
        type: Boolean,
        default: false
    },
    fixedDealActive: {
        type: Boolean,
        default: false
    },
    ecoPayz: {
        link: {
            type: String,
            default: ''
        }      
    },
    epi: {
        type: Number,
        required: true,
        unique: true
    },
    siteId: {
        type: Number,
        unique: true,
        required: false
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
    notifications: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'affnotification'
        }]
    },
    accounts: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'affaccount'
        }]
    },
    statistics: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'affstats'
        }]
    },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false
    }, // below are new fields for subaffiliate
    subPartnerCode: { // only used for landing page searchBy & searchKey
        type: String,
        unique: true
    },
    subPartnerRate: {
        type: Number,
        default: 0.10
    },
    isSubPartner: {
        type: Boolean,
        default: false
    },
    isOfficialPartner: {
        type: Boolean,
        default: false
    },
    subPartners: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'affpartner'
        }]
    },
    subAffReports: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'affsubreport'
        }]
    },
    referredByPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner'
    },
    isDisabled: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('affpartner', AffPartner);
