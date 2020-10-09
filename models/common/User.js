const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const UserCounter = require('./UserCounter');
const ActiveUser = require('../personal/ActiveUser');

const Schema = mongoose.Schema;

const User = new Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    country: String,
    userId: {
        type: Number,
        unique: true
    },
    regDate: { type: Number, default: Date.now },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    facebookProvider: {
        id: String,
        token: String
    },   
    googleProvider: {
        id: String,
        token: String
    },
    activeUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activeuser',
        required: true
    },
    referredBy: { // will be userId of referrer
        type: Number,
    },
    referredByActiveUser: { // will be activeuser _id of referrer
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activeuser'
    },

})

// pre save hook to has password and generate userId
User.pre('validate', function (next) { // https://stackoverflow.com/questions/30141492/mongoose-presave-does-not-trigger

    const user = this;

    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, 10)
    .then(async hash => {
        
        const userId = await getNextSequence('userid');
        const activeUser = await createActiveUser(user._id, user.referredByActiveUser);
       
        user.activeUser = activeUser;
        user.userId = userId;
        user.password = hash;
       
        next();

    }).catch(err => {
        console.log(err)
        return next(err)
    })
})


// compare password for login
User.methods.checkPassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    })
}

// google login
User.statics.upsertGoogleUser = function(referredBy, referredByActiveUser, accessToken, refreshToken, profile, cb) {
    const userModelCopy = this; // this is so that we can use User model without calling direct instance of User.create or whatever
    return userModelCopy.findOne({ 'googleProvider.id': profile.id }, async function(err, existingUser) {
        if (err) return next(err);
        else if (!existingUser) { // no user was found, lets create a new one
            const userId = await getNextSequence('userid');
            let newUser = new userModelCopy({      
                name: `${profile._json.given_name} ${profile._json.family_name}`,        
                email: profile.emails[0].value,          
                userId,    
                referredBy,
                referredByActiveUser,     
                googleProvider: {
                    id: profile.id,
                    token: accessToken
                }
            });
            newUser.activeUser = await createActiveUser(newUser._id, referredByActiveUser); 
            newUser.save(async function(error, savedUser) {
                if (error) return error;
                return cb(error, savedUser);
            });
        } else return cb(err, existingUser);
    });
};

// facebook login
User.statics.upsertFbUser = function (referredBy, referredByActiveUser, accessToken, refreshToken, profile, cb) {
    const userModelCopy = this; // this is so that we can use User model without calling direct instance of User.create or whatever
    return userModelCopy.findOne({ 'facebookProvider.id': profile.id }, async function (err, existingUser) {
        if (err) return next(err);
        else if (!existingUser) {
            const userId = await getNextSequence('userid');
            let newUser = new userModelCopy({      
                name: `${profile.name.givenName} ${profile.name.familyName}`,        
                email: profile.emails[0].value,
                userId,    
                referredBy,
                referredByActiveUser,   
                facebookProvider: {
                    id: profile.id,
                    token: accessToken
                }
            });
            newUser.activeUser = await createActiveUser(newUser._id, referredByActiveUser); 
            newUser.save(async function(error, savedUser) {
                if (error) return error;
                return cb(error, savedUser);
            });
        } else return cb(err, existingUser)
    })
}

// next sequence for userId
function getNextSequence (name) {
    return new Promise(resolve => {
        resolve(
            UserCounter.findOneAndUpdate(
                { _id: name },
                { $inc: { seq: 1 } } ,
                { new: true }
            ).then(c => c.seq).catch(e => e)   
        )
    }) 
};

// create new ActiveUser with default dealTiers
async function createActiveUser (belongsTo, referredBy) { // creates new activeuser, sets referredBy if applicable and pushes new active user to friends array [] of the referrer
    const newActiveUser = await ActiveUser.create({ belongsTo, referredBy });
    if (newActiveUser.referredBy) await ActiveUser.findByIdAndUpdate(newActiveUser.referredBy, { $push: { friends: newActiveUser } }, { new: true });
    return newActiveUser; // it has to RETURN the new active user, otherwise it won't work as the await await createActiveUser() expects activeUser to be returned.
};


module.exports = mongoose.model('user', User);


