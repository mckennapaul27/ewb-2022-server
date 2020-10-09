const C = require('chance');
const app = require('../server');
const chance = new C();
// message: chance.sentence({ words: 8 }),

// UserNotifications (belongs to user)
const welcome = user => ({ message: `Welcome to eWalletBooster.com, ${user.name}`, type: 'General', belongsTo: user._id }); 
const welcomeSocial = user => ({ message: `Welcome, ${user.name}`, type: 'General', belongsTo: user._id });

const createApplication = (a, _id) => ({ message: `We have received your application for ${a.accountId}`, type: 'Application', belongsTo: _id });
const updateApplication = (a, _id) => ({ message: `${a.availableUpgrade.status} VIP upgrade for ${a.accountId}`, type: 'Application', belongsTo: _id });

module.exports = {
    welcome,
    welcomeSocial,
    createApplication,
    updateApplication
}