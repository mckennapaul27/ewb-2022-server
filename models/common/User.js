const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const UserCounter = require('./UserCounter');

const Schema = mongoose.Schema;

const User = new Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    userId: {
        type: Number,
        unique: true
    },
    regDate: { type: Date, default: Date.now },
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
})

// pre save hook to has password and generate userId
User.pre('save', function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    bcrypt.hash(user.password, 10)
    .then(async hash => {
        const userId = await getNextSequence('userid');
        user.userId = userId;
        user.password = hash;
        next()
    }).catch(err => next(err))
})


// compare password for login
User.methods.checkPassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    })
}

// google login
User.statics.upsertGoogleUser = function(accessToken, refreshToken, profile, cb) {
    const userObj = this;
    return userObj.findOne({ 'googleProvider.id': profile.id }, async function(err, existingUser) {
        if (err) return next(err);
        else if (!existingUser) { // no user was found, lets create a new one
            const userId = await getNextSequence('userid');
            const newUser = new userObj({      
                name: `${profile._json.given_name} ${profile._json.family_name}`,        
                email: profile.emails[0].value,          
                userId,                
                googleProvider: {
                    id: profile.id,
                    token: accessToken
                }
            });
            newUser.save(function(error, savedUser) {
                if (error) return error;
                return cb(error, savedUser);
            });
        } else return cb(err, existingUser);
    });
};

// facebook login
User.statics.upsertFbUser = function (accessToken, refreshToken, profile, cb) {
    const userObj = this;
    return userObj.findOne({ 'facebookProvider.id': profile.id }, async function (err, existingUser) {
        if (err) return next(err);
        else if (!existingUser) {
            const userId = await getNextSequence('userid');
            const newUser = new userObj({      
                name: `${profile.name.givenName} ${profile.name.familyName}`,        
                email: profile.emails[0].value,
                userId,                
                facebookProvider: {
                    id: profile.id,
                    token: accessToken
                }
            });
            newUser.save(function(error, savedUser) {
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


// Get time in locale by passing in actual date so in this case would be moment.tz(dateToPass, 'Europe/London') using moment-timezone


module.exports = mongoose.model('user', User);


