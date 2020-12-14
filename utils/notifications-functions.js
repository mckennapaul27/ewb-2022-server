const { UserNotification } = require('../models/common/index');
const { AffNotification } = require('../models/affiliate/index');

// create notification that belongs to User
const createUserNotification = ({ message, type, belongsTo }) => UserNotification.create({ message, type, belongsTo });

const createAffNotification = ({ message, type, accountId, isGeneral, belongsTo }) => AffNotification.create({ message, type, accountId, isGeneral, belongsTo });

module.exports = {
    createUserNotification,
    createAffNotification
};




// const AffNotification = new Schema({ 
//     message: String,
//     read: { type: Boolean, default: false },
//     type: String,
//     createdAt: { 
//         type: Number, 
//         default: Date.now, // we don't call this function with Date.now() otherwise it would store it once,       
//     },   
//     accountId: String, // so we can display in table / not need for 
//     isGeneral: { type: Boolean, default: false }, // so we can add general notification from admin which shows in everybody's accounts
//     belongsTo: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'affpartner',
//         required: false
//     }
// });



