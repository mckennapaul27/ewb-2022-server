
const passport = require('passport');
require('../../auth/admin-passport')(passport);

const express = require('express');
const router = express.Router();
const dayjs = require('dayjs')
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser')

const { getToken } = require('../../utils/token.utils');

const {
    AffPartner,
    AffReport,
    AffApplication,
    AffPayment
} = require('../../models/affiliate/index');
const {
    Application
} = require('../../models/personal/index');


const { mapRegexQueryFromObj, isPopulatedValue, mapQueryForAggregate } = require('../../utils/helper-functions');



// POST /admin/partner/get-partner
router.post('/get-partner', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        try {
            const partner = await AffPartner.findById(req.body._id).select(req.body.select).lean()
            return res.status(200).send(partner);
        } catch (err) {
            return res.status(400).send({ msg: 'Server error' })
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/partner/update-deal/:_id
router.post('/update-deal/:_id', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        try {
            const partner = await AffPartner.findByIdAndUpdate(req.params._id, {
                $set: { deals: req.body.deals },
            }, { new: true });
            return res.status(200).send(partner);
        } catch (err) {
            return res.status(400).send({ msg: 'Server error' })
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/partner/fetch-reports
router.post('/fetch-reports', passport.authenticate('admin', {
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
                        '_id': null, 
                        commission: { $sum: '$account.commission' }, 
                        cashback: { $sum: '$account.cashback' }, 
                        volume: { $sum: '$account.transValue' },
                        deposits: { $sum: '$account.deposits' },
                        subAffCommission: { $sum: '$account.subAffCommission' } 
                    } 
                }
            ]);  
            return res.status(200).send({ reports, pageCount, brands, months, totals  }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /admin/partner/fetch-applications
router.post('/fetch-applications', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        let pageSize = parseInt(req.query.pageSize);
        let pageIndex = parseInt(req.query.pageIndex);
        let { sort, query } = req.body;
        let skippage = pageSize * (pageIndex); // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
        mapRegexQueryFromObj(query);  
        try {
            const applications = await AffApplication.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize).lean();
            const pageCount = await AffApplication.countDocuments(query);
            const brands = await AffApplication.distinct('brand');
            const statuses = await AffApplication.distinct('status');      
            return res.status(200).send({ applications, pageCount, brands, statuses  }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/partner/update-application/${_id}`, { accountId, action });
router.post('/update-application/:_id', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        
    } else return res.status(403).send({ msg: 'Unauthorised' });
})

// POST /admin/partner/upload-application-results
router.post('/upload-application-results', passport.authenticate('admin', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        let transactionFile = req.files.file;
        let fileName = path.join(__dirname, '../../csv/transactionFile.csv');
        transactionFile.mv(fileName, function (err) {
            if (err) {
                console.log(err)
                return res.status(500).send(err)
            };
            let applicationData = [];
            let inputStream = fs.createReadStream(fileName, 'utf8');
            inputStream.pipe(csv(['accountId', 'Tagged', 'Upgraded'])) // set headers manually
            .on('data', data => applicationData.push(data))
            .on('end', () => {
                applicationData = applicationData.reduce((acc, item) => acc.some(a => a.accountId === item.accountId) ? acc : (acc.push(item), acc), []); // remove duplicates - have to put second return of acc inside brackets (acc.push(item), acc) otherwise it will not return acc
                return applicationData.map(async app => {
                    const today = dayjs().format('DD/MM/YYYY');
                    const update = {
                        'status': app.Tagged === 'Y' ? 'Approved' : 'Declined',
                        'upgradeStatus': (app.Upgraded === 'Y') ? `Upgraded (${today})` : (app.Tagged === 'Y' && app.Upgraded === 'N') ? `Not verified ${today}` : `Declined ${today}`,
                        'availableUpgrade.valid': (app.Upgraded === 'Y') ? false :( app.Tagged === 'N') ? false : true 
                    };
                    if (app.Upgraded === 'Y' || app.Tagged === 'N') update['availableUpgrade.status'] = '-';
                    const aa = await AffApplication.findOne({ 'accountId': app.accountId });
                    const ab = await Application.findOne({ 'accountId': app.accountId });
                    try {
                        if (aa) {
                            // send email
                            // add notification
                            // if successfull create affaccount and affreport
                            await AffApplication.findByIdAndUpdate(aa._id, update, { new: true });
                        } 
                        if (ab) {
                            // send email
                            // add notification
                            // if successfull create affaccount and affreport
                            await Application.findByIdAndUpdate(ab._id, update, { new: true });
                        } 
                        return res.status(201).send({ msg: 'Successfully updated applications' })
                    } catch (err) {
                        return res.status(400).send({ msg: 'Error whilst updating applications' })
                    };
                })
            })  
        });        
    } else return res.status(403).send({ msg: 'Unauthorised' });
});

// POST /admin/partner/fetch-payments
router.post('/fetch-payments', passport.authenticate('admin', {
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
            const payments = await AffPayment.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize)
            const pageCount = await AffPayment.countDocuments(query);
            const brands = await AffPayment.distinct('brand'); 
            const statuses = await AffPayment.distinct('status');   
            const currencies = await AffPayment.distinct('currency');           
            return res.status(200).send({ payments, pageCount, brands, statuses, currencies }); 
        } catch (err) {
            return res.status(400).send(err)
        }    
    } else return res.status(403).send({ msg: 'Unauthorised' })
});







module.exports = router;
