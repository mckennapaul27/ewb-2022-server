const mongoose = require('mongoose');

const keysToConvertToRegex = ['accountId', 'account.accountId', 'brand', 'paymentAccount', 'email', 'name'];
const keysToConvertToMongooseId = ['belongsTo', 'belongsToPartner'];
const populatedFieldQueries = ['partner.epi'];

function mapRegexQueryFromObj (query) { // have to complete this on backend - doesn't format regex on front-end;
    for (let key in query) {
        if (keysToConvertToRegex.includes(key)) {
            try {
                query[key] = new RegExp(query[key]); // https://stackoverflow.com/questions/17250815/how-to-check-if-the-input-string-is-a-valid-regular-expression
            } catch {
                query[key] = query[key];
            }
        } 
    }
    return query;
};
function mapQueryForAggregate (query) { // this for aggreation when we need to have a mongoose type set
    for (let key in query) {
        if (keysToConvertToMongooseId.includes(key)) {
            try {
                query[key] = mongoose.Types.ObjectId(query[key]);
            } catch {
                query[key] = query[key];
            }
        }
    }
    return query;
};

function isPopulatedValue (query) {
    for (let key in query) {
        if (populatedFieldQueries.includes(key)) return true;
        else return false;
    }
}

// const pipeline = [
//     { $lookup: {

//     } }
// ]

module.exports = {
    mapRegexQueryFromObj,
    mapQueryForAggregate,
    isPopulatedValue
}

// REGEX ONLY WORKS ON STRINGS - NOT NUMBERS 
// https://stackoverflow.com/questions/30722650/mongoose-find-regexp-for-number-type-field