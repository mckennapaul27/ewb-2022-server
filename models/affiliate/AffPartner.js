const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { affiliateDealOne, affiliateDealTwo, defaultAffStats } = require('../../config/deals');
const AffCounter = require('../affiliate/AffCounter');

const AffPartner = new Schema({ 
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
    email: String,
    deals: [{
        brand: String,
        rates: [{
            level: Number,
            minVol: Number,
            maxVol: Number,
            cashback: Number
        }]
    }],
    brandAssets: [{ 
        brand: String,
        siteId: String, 
        link: String
    }],
    revShareActive: { type: Boolean, default: false },
    fixedDealActive: { 
        isActive: { type: Boolean, default: false },
        rate: Number,
    },
    epi: { type: Number, required: true, unique: true },
    
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
        subCommission: [{
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
    accounts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affaccount'
    }],
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }, // below are new fields for subaffiliate
    subPartnerCode: { // only used for landing page searchBy & searchKey
        type: String,
        unique: true,
        required: false,
        sparse: true
    },
    subPartnerRate: { type: Number, default: 0.10 },
    isSubPartner: { type: Boolean, default: false },
    isOfficialPartner: { type: Boolean, default: false },
    subPartners: [{ // Need to have this for checking partners to query in map-aff-dashboard example Lucy Bandy
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner'
    }],    
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner'
    },
    isDisabled: {
        type: Boolean,
        default: false
    }
});


// pre save hook to generate dealTier's and stats for affiliates
AffPartner.pre('validate', async function (next) {
    const affPartner = this;
    affPartner.epi = await getNextSequence('partnerid');

    affPartner.deals.push(affiliateDealOne('Neteller'));
    affPartner.deals.push(affiliateDealOne('Skrill'));
    affPartner.deals.push(affiliateDealTwo('ecoPayz'));

    affPartner.stats = defaultAffStats;
    next();   
});

// next sequence for epi
async function getNextSequence (name) {
    const newCounter = await AffCounter.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true });
    return newCounter.seq;
};



// siteId: {
//     type: Number,
//     unique: true,
//     required: false,
//     sparse: true // https://docs.mongodb.com/v3.0/tutorial/create-a-unique-index/ ... https://stackoverflow.com/questions/44639377/mongoose-field-not-required-but-unique
// },




module.exports = mongoose.model('affpartner', AffPartner);
