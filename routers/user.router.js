const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../auth/passport')(passport);
const { getToken } = require('../utils/token.utils')
const {
    User,
    Notification
} = require('../models/common/index');

// /user/get-user
router.get('/get-user', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        User.findById(req.user._id, { password: 0 })
        .then(user => {
            return res.status(200).send(user)
        }).catch(() => res.status(500).send({ msg: 'Server error: Please contact support' }))
    } else return res.status(403).send({ msg: 'Unauthorised' })
});

// /user/update-user
router.post('/update-user', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const token = getToken(req.headers);
    if (token) {

    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// /user/get-notifications/:_id?page=number
router.get('/get-notifications/:_id', passport.authenticate('jwt', { 
    session: false 
}), getNotifications);

// /user/update-notifications/:_id'
router.get('/update-notifications/:_id', passport.authenticate('jwt', {
    session: false
}), updateNotifications, getNotifications)

function getNotifications (req, res) {
    const token = getToken(req.headers);
    if (token) {
        let pageLimit = 5; // 4, 4, 4
        let skippage = pageLimit * (req.query.page - 1); // with increments of one = 5 * (1 - 1) = 0 |  5 * (2 - 1) = 5 | 5 * (3 - 1) = 10;
        Notification.find({ belongsTo: req.params._id }).select('message read type createdAt').sort('-createdAt').skip(skippage).limit(pageLimit).lean()
        .then(async notifications => {
            const total = await Notification.countDocuments({ belongsTo: req.params._id }).select('read').lean();
            const unRead = await Notification.countDocuments({ belongsTo: req.params._id, read: false }).select('read').lean();
            return res.status(200).send({ notifications, total, unRead });
        })
        .catch((err) => res.status(500).send({ msg: 'Server error: Please contact support' }))
    } else return res.status(403).send({ msg: 'Unauthorised' });
};

async function updateNotifications (req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        await Notification.updateMany({ belongsTo: req.params._id }, { read: true });
        next()
    } else return res.status(403).send({ msg: 'Unauthorised' });
}


// const Notification = new Schema({ 
//     message: String,
//     read: { 
//         type: Boolean, 
//         default: false 
//     },
//     type: String, // is this needed?
//     createdAt: { 
//         type: Date, 
//         default: Date.now, // we don't call this function with Date.now() otherwise it would store it once,       
//         index: true // Have to include this to make it work
//     },    
//     belongsTo: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'user',
//         required: true
//     }
// });




module.exports = router;
