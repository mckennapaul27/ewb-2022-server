const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../auth/passport')(passport);
const uniq = require('lodash.uniq');
const { getToken } = require('../utils/token.utils')
const {
    User,
    Notification
} = require('../models/common/index');
const {
    Report
} = require('../models/personal/index');
const { query } = require('express');

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

function mapRegexQueryFromObj (query) {
    for (let key in query) {
        if (query.hasOwnProperty(key)) {
            query[key] = new RegExp(query[key]); // have to complete this on backend - doesn't format regex on front-end
        }
    }
    return query;
};


// report/test - testing for react-table population
router.post('/test', async (req, res) => {

    let pageSize = parseInt(req.query.pageSize);
    let pageIndex = parseInt(req.query.pageIndex);
    let { sort, query } = req.body;
    let skippage = pageSize * (pageIndex); // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
    
    mapRegexQueryFromObj(query); // turn react-table query into regex query
    // NEED TO ADD SELECT AND LEAN
    const reports = await Report.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize); // data for pagination
    const pageCount = await Report.countDocuments(query); // total documents to create pageCount 
    const brands = await Report.distinct('brand'); // number of distinct brands in reports collection for select filter
    const months = await Report.distinct('month'); // number of distinct brands in brands collection for select filter
    const totals  = await Report.aggregate([ 
        { $match: { $and: [ query ] } }, 
        { $group: { 
                '_id': null, 
                cashback: { $sum: '$account.cashback' }, 
                volume: { $sum: '$account.transValue' },
                deposits: { $sum: '$account.deposits' } 
            } 
        }
    ]);  
    return res.send({ reports, totals, pageCount, brands, months });
});

// report/accountId/table
router.post('/accountId/table', async (req, res) => {

    let pageSize = parseInt(req.query.pageSize);
    let pageIndex = parseInt(req.query.pageIndex);
    
    let { sort, query } = req.body;
    let skippage = pageSize * (pageIndex);

    const reports = await Report.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize); // NEED TO ADD SELECT AND LEAN
    const pageCount = await Report.countDocuments(query);

    return res.send({ reports, pageCount });
});

// report/accountId/chart
router.post('/accountId/chart', async (req, res) => {
    let { months, query } = req.body;
    const reports = await Report.find(query).where({ month: { $in: months } } ).sort({ lastUpdate: 1 });// NEED TO ADD SELECT AND LEAN
    return res.send({ reports });
});




module.exports = router;

// useful links
// https://docs.mongodb.com/manual/reference/collation/
// https://stackoverflow.com/questions/14279924/mongoose-sort-alphabetically