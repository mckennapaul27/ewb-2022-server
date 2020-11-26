
const passport = require('passport');
require('../../auth/passport')(passport)
const express = require('express');
const router = express.Router();

const { getToken } = require('../../utils/token.utils')
const {
    AffAccount,
    AffReport,
    AffSubReport
} = require('../../models/affiliate/index');
const { mapRegexQueryFromObj, mapQueryForAggregate } = require('../../utils/helper-functions');
const dayjs = require('dayjs')


// POST /affiliate/application/create
router.post('/create', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        try {
            const applications = await AffReport.create(req.body.applications);
            return res.status(201).send(applications)
        } catch (err) {
            return res.status(400).send({ success: false })
        }
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});


// POST /affiliate/report/fetch-reports
router.post('/fetch-reports', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        let pageSize = parseInt(req.query.pageSize);
        let pageIndex = parseInt(req.query.pageIndex);
        let { sort, query } = req.body;
        let skippage = pageSize * (pageIndex); // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
        query = mapRegexQueryFromObj(query);  
        let aggregateQuery = mapQueryForAggregate(query); // have to create this for aggregation query because need to make it mongoose.Types.ObjectId        
        try {
            const reports = await AffReport.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize)
            const pageCount = await AffReport.countDocuments(query);
            const brands = await AffReport.distinct('brand'); 
            const months = await AffReport.distinct('month');   
            const totals = await AffReport.aggregate([ 
                { $match: { $and: [ aggregateQuery ] } }, 
                { $group: {
                        _id: {
                            currency: '$account.currency',
                        },
                        cashback: { $sum: '$account.cashback' }, 
                        volume: { $sum: '$account.transValue' },
                        deposits: { $sum: '$account.deposits' } 
                    } 
                }
            ]); 
            return res.status(200).send({ reports, pageCount, brands, months, totals  }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /affiliate/report/fetch-sub-reports
router.post('/fetch-sub-reports', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        let pageSize = parseInt(req.query.pageSize);
        let pageIndex = parseInt(req.query.pageIndex);
        let { sort, query } = req.body;
        let skippage = pageSize * (pageIndex); // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
        query = mapRegexQueryFromObj(query);  
        let aggregateQuery = mapQueryForAggregate(query); // have to create this for aggregation query because need to make it mongoose.Types.ObjectId        
        try {
            const reports = await AffSubReport.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize)
            const pageCount = await AffSubReport.countDocuments(query);
            const brands = await AffSubReport.distinct('brand'); 
            const months = await AffSubReport.distinct('month');  
            const totals = await AffSubReport.aggregate([ 
                { $match: { $and: [ aggregateQuery ] } }, 
                { $group: {
                        _id: {
                           currency: '$currency',
                        },
                        cashback: { $sum: '$cashback' }, 
                        volume: { $sum: '$transValue' },
                        deposits: { $sum: '$deposits' },
                        subAffCommission: { $sum: '$subAffCommission' } 
                    } 
                }
            ]);  
            return res.status(200).send({ reports, pageCount, brands, months, totals  }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /affiliate/report/accountId/table
router.post('/accountId/table', async (req, res) => {

    let pageSize = parseInt(req.query.pageSize);
    let pageIndex = parseInt(req.query.pageIndex);
    
    let { sort, query } = req.body;
    let skippage = pageSize * (pageIndex);

    const reports = await AffReport.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize); // NEED TO ADD SELECT AND LEAN
    const pageCount = await AffReport.countDocuments(query);

    return res.send({ reports, pageCount });
});

// POST /affiliate/report/accountId/chart
router.post('/accountId/chart', async (req, res) => {
    let { months, query } = req.body;
    const reports = await AffReport.find(query).where({ month: { $in: months } } ).sort({ date: 1 }); // NEED TO ADD SELECT AND LEAN
    return res.send({ reports });
});



module.exports = router;
