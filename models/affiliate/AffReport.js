const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { setCurrency } = require('../../config/deals');
const AffPartner = require('./AffPartner');

const AffReport = new Schema({ 
    date: {
        type: Number,
        required: true // first day of month
    },
    month: String,
    lastUpdate: { type: Number, default: Date.now }, // The static Date.now() method returns the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC
    brand: String,
    account: {
        accountId: String,  
        deposits: Number,
        transValue: Number,
        commission: Number,
        cashback: Number,
        commissionRate: Number, // need to start storing this in data so that we can access in react-table filters
        cashbackRate: Number,
        subAffCommission: Number,
        earnedFee: Number,
        currency: { type: String, required: true }, // this is so we can calculate balances on the aggregation. Very important that we set this according to the brand!!
        profit: Number // need to start storing this in data so that we can access in react-table filters
    },
    siteId: Number,
    memberId: String,
    playerId: String,
    country: String,
    epi: Number,
    referredByEpi: Number,
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affaccount',
        required: false
    },
    belongsToPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'affpartner',
        required: false
    }
});

// using pre validate to set report currency - very important for calculating balances.
AffReport.pre('validate', async function (next) { // https://stackoverflow.com/questions/30141492/mongoose-presave-does-not-trigger
    try {
        const report = this;
        const partner = await AffPartner.findById(report.belongsToPartner).select('epi referredBy').populate({ path: 'referredBy', select: 'epi' });
        report.epi = partner.epi; // setting epi
        report.referredByEpi = partner.referredBy ? partner.referredBy.epi : null; // setting referredByEpi
        report.account.currency = setCurrency(report.brand); // setting currency (this does not always work because when we set account: {} object properties in map-dashboard-data etc we update full object)
        next();
    } catch (error) {
        console.log('error: ', error);
        next(error);
    } 
});




module.exports = mongoose.model('affreport', AffReport);






 // if (isPopulatedValue(query)) { // use this way to query for a populated field - in this case, belongsToPartner.epi
//     reports = (await AffReport.find(searchQuery)
//     .collation({ locale: 'en', strength: 1 })
//     .sort(sort).skip(skippage)
//     .limit(pageSize)
//     .populate({ path: 'belongsToPartner', select: 'referredBy epi', match: populateQuery, populate: { path: 'referredBy', select: 'epi' } }))
//     .filter(a => a.belongsToPartner); // 'epi': query['belongsToPartner.epi] = 'epi': 558
// } else {
//     reports = await AffReport.find(searchQuery).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize).populate({ path: 'belongsToPartner', select: 'epi', populate: { path: 'referredBy', select: 'epi' } }).lean();
// };