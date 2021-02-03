
const passport = require('passport');
require('../../auth/admin-passport')(passport);

const express = require('express');
const router = express.Router();

const { getToken } = require('../../utils/token.utils');

const {
    User
} = require('../../models/common/index');
const {
    AdminJob
} = require('../../models/admin/index')

const { mapRegexQueryFromObj, isPopulatedValue, mapQueryForPopulate } = require('../../utils/helper-functions');

// POST /admin/user/fetch-users
router.post('/fetch-users', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        let pageSize = parseInt(req.query.pageSize);
        let pageIndex = parseInt(req.query.pageIndex);
        let { sort, query } = req.body;
        let skippage = pageSize * (pageIndex); // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
        
        let searchQuery = mapRegexQueryFromObj(query);  
        let populateQuery = mapQueryForPopulate(query); 

        let users;

        try {
            if (isPopulatedValue(query)) { // use this way to query for a populated field - in this case, partner.epi
                users = (await User.find(searchQuery)
                .collation({ locale: 'en', strength: 1 })
                .sort(sort)
                .skip(skippage)
                .limit(pageSize)
                .populate({ path: 'partner', match: populateQuery }))
                .filter(a => a.partner); // this works because we are only populating partner where the epi matches the query epi so it firstly returns all the users and then filters out all where the partner is null. the partner will be null if it does not match the query
            } else {
                users = await User.find(searchQuery)
                .collation({ locale: 'en', strength: 1 })
                .sort(sort)
                .skip(skippage)
                .limit(pageSize)
                .populate({ path: 'partner', select: 'epi' })
                .select('-password')
            };
            const pageCount = await User.countDocuments(searchQuery);
            return res.status(200).send({ users, pageCount }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/user/delete-user
router.post('/delete-user', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        try {
            const user = await User.findById(req.body._id);
            if (!user) throw { status: 400, msg: 'Invalid User.' };
            return User.findByIdAndDelete(req.body._id)
            .then(() => res.status(200).send({ msg: 'User deleted successfully!' }))
        } catch (err) {
            return res.status(400).send({ msg: 'Account could not be deleted' })
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// GET /admin/user/get-user
router.post('/get-user', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        try {
            const user = await User.findById(req.body._id).select('-password').lean()
            return res.status(200).send(user);
        } catch (err) {
            return res.status(400).send({ msg: 'Account could not be deleted' })
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});


// POST /admin/user/fetch-admin-jobs?pageSize=${pageSize}&pageIndex=${pageIndex}
router.post('/fetch-admin-jobs', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        let pageSize = parseInt(req.query.pageSize);
        let pageIndex = parseInt(req.query.pageIndex);
        let { sort, query } = req.body;
        let skippage = pageSize * (pageIndex); // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
        query = mapRegexQueryFromObj(query); 
        try {
            const jobs = await AdminJob.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize).lean();
            const pageCount = await AdminJob.countDocuments(query);
            const statuses = await AdminJob.distinct('status');
            const types = await AdminJob.distinct('type');
            return res.status(200).send({ jobs, pageCount, statuses, types }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/user/update-admin-job/:_id
router.post('/update-admin-job/:_id', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        try {
            const { status, completed } = req.body;
            if (status === 'Delete') await AdminJob.findByIdAndDelete(req.params._id);
            else await AdminJob.findByIdAndUpdate(req.params._id, {
                status,
                completed
            }, { new: true })
            return res.status(201).send({ msg: `Updated job` }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});






module.exports = router;
