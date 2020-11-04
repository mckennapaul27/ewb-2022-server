const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const Admin = new Schema({ 
    name: String,
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    isDeleted: Boolean,
    resetPasswordToken: String,
    role: String, // superadmin, admin, viewer
    resetPasswordExpires: Date
});

Admin.pre('validate', function (next) {
    const admin = this;
    if (!admin.isModified('password')) return next();
    bcrypt.hash(admin.password, 10)
    .then(hash => {
        admin.password = hash;
        next();
    }, err => next(err))
});


// compare password for login
Admin.methods.checkPassword = function (password, callback) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
}

module.exports = mongoose.model('admin', Admin);
