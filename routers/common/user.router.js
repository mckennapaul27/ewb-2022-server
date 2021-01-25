const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../../auth/passport')(passport);
const { getToken } = require('../../utils/token.utils')
const {
    User,
    UserNotification
} = require('../../models/common/index');

// /common/user/get-user
router.get('/get-user', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        User.findById(req.user._id).select('name email userId _id activeUser').lean()
        .then(user => res.status(200).send(user))
        .catch((err) => {
            return res.status(500).send({ msg: 'Server error: Please contact support' })
        })
    } else return res.status(403).send({ msg: 'Unauthorised' })
});

// /common/user/update-user/:_id
router.post('/update-user/:_id', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const { email } = req.body; // receives these regardless of any change through 
        const { _id } = req.params;
        let update = req.body;
        let exists = false;
        if (update['email']) {
            let count = await User.countDocuments({ email: update['email'] }).select('email').lean() // check if user exists  
            if (count > 0) exists = true;
        };
        if (exists > 0) return res.status(400).send({ msg: `Account already exists with email ${email}` });
        User.findByIdAndUpdate(_id, update, { new: true }).select('name email userId _id activeUser partner').populate({ path: 'partner', select: 'isSubPartner epi siteId referredBy' }).lean()
        .then(updatedUser => res.status(201).send({ msg: 'You have successfully updated your settings.', updatedUser }))
        .catch((err) => res.status(500).send({ msg: 'Server error: Please contact support' }))
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// /common/user/get-new-notifications/:_id
router.get('/get-new-notifications/:_id', passport.authenticate('jwt', { 
    session: false 
}), async (req, res) => {
    const unRead = await UserNotification.countDocuments({ belongsTo: req.params._id, read: false }).select('read').lean();
    return res.status(200).send({ unRead });
});


// /common/user/get-notifications/:_id?page=number
router.get('/get-notifications/:_id', passport.authenticate('jwt', { 
    session: false 
}), getNotifications);

// /common/user/update-notifications/:_id'
router.get('/update-notifications/:_id', passport.authenticate('jwt', {
    session: false
}), updateNotifications, getNotifications);

async function updateNotifications (req, res, next) {
    const token = getToken(req.headers);
    if (token) {
        await UserNotification.updateMany({ belongsTo: req.params._id }, { read: true });
        next();
    } else return res.status(403).send({ msg: 'Unauthorised' });
};

function getNotifications (req, res) {
    const token = getToken(req.headers);
    if (token) {
        let pageLimit = 10; // 4, 4, 4
        let skippage = pageLimit * (req.query.page - 1); // with increments of one = 5 * (1 - 1) = 0 |  5 * (2 - 1) = 5 | 5 * (3 - 1) = 10;
        UserNotification.find({ belongsTo: req.params._id }).select('message read type createdAt').sort('-createdAt').skip(skippage).limit(pageLimit).lean()
        .then(async notifications => {
            const total = await UserNotification.countDocuments({ belongsTo: req.params._id }).select('read').lean();
            const unRead = await UserNotification.countDocuments({ belongsTo: req.params._id, read: false }).select('read').lean();
            return res.status(200).send({ notifications, total, unRead });
        })
        .catch((err) => res.status(500).send({ msg: 'Server error: Please contact support' }))
    } else return res.status(403).send({ msg: 'Unauthorised' });
};

module.exports = router;
