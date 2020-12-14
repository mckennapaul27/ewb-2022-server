const mongoose = require('mongoose');

const keysToConvertToRegex = ['accountId', 'account.accountId', 'brand', 'paymentAccount', 'email', 'name', 'message'];
const keysToConvertToMongooseId = ['belongsTo', 'belongsToPartner'];
const populatedFieldQueries = ['partner.epi', 'belongsTo.epi', 'belongsToPartner.epi'];

const mapRegexQueryFromObj = (query) => Object.keys(query)
.filter(key => !populatedFieldQueries.includes(key))
.reduce((acc, item) => keysToConvertToRegex.includes(item) 
? (acc[item] = new RegExp(query[item]), acc) 
: (acc[item] = query[item], acc), {});

const mapQueryForPopulate = (query) => Object.keys(query)
.filter(key => populatedFieldQueries.includes(key))
.reduce((acc, item) => (acc[item.slice(item.lastIndexOf('.') + 1)] = query[item], acc), {});

const mapQueryForAggregate = (query) => {
    const aggregateMap = Object.keys(query)
    .filter(key => !populatedFieldQueries.includes(key))
    .reduce((acc, item) => keysToConvertToMongooseId.includes(item) 
    ? (acc[item] = mongoose.Types.ObjectId(query[item]), acc) 
    : (acc[item] = query[item], acc), {});
    return mapRegexQueryFromObj(aggregateMap)
};

const isPopulatedValue = (query) => Object.keys(query).some(key => populatedFieldQueries.includes(key));

const formatEpi = (epi) => parseInt(epi.split('').map(b => parseInt(b)).filter(b => b || b === 0).join(''));


// const memoryData = process.memoryUsage()

// const memoryUsage = {
//     rss: `${formatMemmoryUsage(memoryData.rss)} -> Resident Set Size - total memory allocated for the process execution`,
//     heapTotal: `${formatMemmoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
//     heapUsed: `${formatMemmoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
//     external: `${formatMemmoryUsage(memoryData.external)} -> V8 external memory`,
// }

// console.log(memoryUsage)



module.exports = {
    mapRegexQueryFromObj,
    mapQueryForAggregate,
    isPopulatedValue,
    mapQueryForPopulate,
    formatEpi
}

// REGEX ONLY WORKS ON STRINGS - NOT NUMBERS 
// https://stackoverflow.com/questions/30722650/mongoose-find-regexp-for-number-type-field
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries



// const r = await AffReport.bulkWrite([ // This function does not trigger any middleware, neither save(), nor update(). If you need to trigger save() middleware for every document use create() instead.
//     { 
//         updateOne: { 
//             filter: { 'account.accountId': accountId, month }, 
//             update: { 
//                 $set: {
//                     date,
//                     month,
//                     lastUpdate,
//                     brand,
//                     siteId,
//                     memberId,
//                     playerId,
//                     country,
//                     // belongsTo: account._id,
//                     // belongsToPartner: account.belongsTo,
//                     account: {
//                         accountId,  
//                         deposits,
//                         transValue,
//                         commission,
//                         cashback: 0,
//                         commissionRate: commission / transValue, // need to start storing this in data so that we can access in react-table filters
//                         cashbackRate: 0,
//                         subAffCommission: 0,
//                         earnedFee,
//                         currency: currency ? currency : setCurrency(brand), // this is so we can calculate balances on the aggregation. Very important that we set this according to the brand!!
//                         profit: 0 // need to start storing this in data so that we can access in react-table filters
//                     }
//                 },
//             },
//             upsert: true, // if doesn't exist we create the document
//             new: true
//         }
//     }
// ]);