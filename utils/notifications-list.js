const C = require('chance');
const chance = new C();
// message: chance.sentence({ words: 8 }),

const welcome = (user) => {
    return { 
        message: `Welcome to eWalletBooster.com, ${user.name}`, 
        type: 'General', 
        belongsTo: user._id 
    }
};

const welcomeSocial = (user) => {
    return { 
        message: `Welcome, ${user.name}`, 
        type: 'General', 
        belongsTo: user._id 
    }
}


module.exports = {
    welcome,
    welcomeSocial
}