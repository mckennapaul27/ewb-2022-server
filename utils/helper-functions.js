const { query } = require('express');
const mongoose = require('mongoose');

const keysToConvertToRegex = ['accountId', 'account.accountId', 'brand', 'paymentAccount', 'email', 'name'];
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
} 




// function mapQueryForAggregate (query) { // this for aggreation when we need to have a mongoose type set
//     for (let key in query) {
//         if (keysToConvertToMongooseId.includes(key)) {
//             try {
//                 query[key] = mongoose.Types.ObjectId(query[key]);
//             } catch {
//                 query[key] = query[key];
//             }
//         }
//     }
//     return query;
// };

const isPopulatedValue = (query) => Object.keys(query).some(key => populatedFieldQueries.includes(key));




module.exports = {
    mapRegexQueryFromObj,
    mapQueryForAggregate,
    isPopulatedValue,
    mapQueryForPopulate
}

// REGEX ONLY WORKS ON STRINGS - NOT NUMBERS 
// https://stackoverflow.com/questions/30722650/mongoose-find-regexp-for-number-type-field
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
