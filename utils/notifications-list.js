const C = require('chance');
const app = require('../server');
const chance = new C();
// message: chance.sentence({ words: 8 }),

// UserNotifications (belongs to user)
const welcome = user => ({ message: `Welcome to eWalletBooster.com, ${user.name}`, type: 'General', belongsTo: user._id }); 
const welcomeSocial = user => ({ message: `Welcome, ${user.name}`, type: 'General', belongsTo: user._id });

const createApplication = (a, _id) => ({ message: `We have received your application for ${a.accountId}`, type: 'Application', belongsTo: _id });
const updateApplication = (a, _id) => ({ message: `Requested ${a.availableUpgrade.status} VIP upgrade for ${a.accountId}`, type: 'Application', belongsTo: _id });

const applicationYY = ({ brand, accountId, belongsTo }) => ({ message: `${brand} account ${accountId} has been upgraded to VIP`, type: 'Application', belongsTo:  belongsTo });
const applicationYN = ({ brand, accountId, belongsTo }) => ({ message: `${brand} account ${accountId} could not be upgraded - please verify and request again`, type: 'Application', belongsTo:  belongsTo });
const applicationNN = ({ brand, accountId, belongsTo }) => ({ message: `Your application for ${brand} account ${accountId} has been rejected`, type: 'Application', belongsTo:  belongsTo });

module.exports = {
    welcome,
    welcomeSocial,
    createApplication,
    updateApplication,
    applicationYY,
    applicationYN,
    applicationNN
}