const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('../common/User');
const ActiveUser = require('../personal/ActiveUser');

const Application = new Schema({ 
    brand: String,
    accountId: {
        type: String,
        unique: true
    },
    email: String,
    tagged: {
        type: String,
        default: 'Pending'
    },
    upgradeStatus: { type: String, default: 'Not upgraded' }, 
    availableUpgrade: {
        status: String,
        valid: { type: Boolean, default: true }
    }, 
    requestCount: { type: Number, default: 1 }, // every time user requests we can  $inc: { requestCount: 1 } }, to make sure they don't keep requesting
    currency: String,
    dateAdded: { type: Number, default: Date.now },
    belongsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activeuser',
        required: false
    }
});

// Application.pre('save', function (next) {
//     const application = this;
//     if (application.belongsTo) {
//         const activeUser = ActiveUser.findById(application.belongsTo).select('belongsTo').populate({ path: 'belongsTo', select: 'belongsTo' })
//         // const user = User.findById(activeUser.belongsTo).select('_id').lean();
//         console.log(activeUser.belongsTo)
//     }
// })


// User.pre('save', function (next) {
//     const user = this;
//     if (!user.isModified('password')) return next();
//     bcrypt.hash(user.password, 10)
//     .then(async hash => {
//         const userId = await getNextSequence('userid');
//         const activeUser = await createActiveUser(user._id);
//         user.activeUser = activeUser;
//         user.userId = userId;
//         user.password = hash;
//         next()
//     }).catch(err => next(err))
// })

module.exports = mongoose.model('application', Application);
