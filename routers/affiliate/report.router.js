
const passport = require('passport');
require('../../auth/passport')(passport)
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getToken } = require('../../utils/token.utils')
const {
    AffAccount,
    AffReport,
    AffSubReport,
    AffReportDaily,
    AffReportMonthly,
    AffPartner,
    AffApplication,
    AffUpgrade
} = require('../../models/affiliate/index');
const { 
    mapRegexQueryFromObj, 
    mapQueryForAggregate 
} = require('../../utils/helper-functions');
const { 
    getCashbackRate,
    getVolumeByBrand,
    getCashBackByBrand, 
} = require('../../queries/map-aff-dashboard-data');
const { Quarter } = require('../../models/common');


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

// POST /affiliate/report/fetch-daily-reports
router.post('/fetch-daily-reports', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const { _id, startDate, endDate } = req.body;
        try {
            const reports = await AffReportDaily.find({ belongsTo: _id, date: { $gte: startDate, $lte: endDate } }).sort({ date: 'asc' });
            return res.send({ reports });
        } catch (error) {
            return res.status(403).send({ success: false, msg: error });
        };
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /affiliate/report/fetch-daily-reports
router.post('/fetch-daily-reports', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const { _id, startDate, endDate } = req.body;
        try {
            const reports = await AffReportDaily.find({ belongsTo: _id, date: { $gte: startDate, $lte: endDate } }).sort({ date: 'asc' });
            return res.status(200).send({ reports });
        } catch (error) {
            return res.status(403).send({ success: false, msg: error });
        };
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /affiliate/report/fetch-monthly-reports
router.post('/fetch-monthly-reports', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const { _id, months } = req.body;
        try {
            const reports = await AffReportMonthly.find({ belongsTo: _id }).where({ month: { $in: months } }).sort({ date: 'asc' });
            return res.status(200).send({ reports });
        } catch (error) {
            return res.status(403).send({ success: false, msg: error });
        };
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /affiliate/report/fetch-monthly-summary
router.post('/fetch-monthly-summary', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const { _id, month, start, end } = req.body;
        try {
            const { isSubPartner } = (await AffPartner.findById(_id).select('referredBy isSubPartner subPartnerRate').lean());

            const nCashback = await getCashBackByBrand({ _id }, 'Neteller', month);
            const nSubCashback = await getSubPartnerCashbackByBrand({ _id, isSubPartner, month, brand: 'Neteller' });
            const sCashback = await getCashBackByBrand({ _id }, 'Skrill', month);
            const sSubCashback = await getSubPartnerCashbackByBrand({ _id, isSubPartner, month, brand: 'Skrill' });
            const data = await AffReportDaily.aggregate([
                { $match: { $and: [ { belongsTo: mongoose.Types.ObjectId(_id) }, { date: { $gte: start, $lte: end } } ] } },
                { $project: { 'clicks': 1, 'registrations': 1, 'brand': 1 } },
                { $group: {
                    '_id': {
                        brand: '$brand'
                    },
                    clicks: { $sum: '$clicks' },
                    registrations: { $sum: '$registrations' }
                }}
            ]);
            
            const nRegs = data.reduce((acc, i) => i._id.brand === 'Neteller' ? (acc += i.clicks, acc) : acc, 0);
            const sRegs = data.reduce((acc, i) => i._id.brand === 'Skrill' ? (acc += i.clicks, acc) : acc, 0);

            const nClicks = data.reduce((acc, i) => i._id.brand === 'Neteller' ? (acc += i.registrations, acc) : acc, 0);
            const sClicks = data.reduce((acc, i) => i._id.brand === 'Skrill' ? (acc += i.registrations, acc) : acc, 0);

            const nApplications = await AffApplication.countDocuments({ belongsTo: _id, brand: 'Neteller', dateAdded: { $gte: start, $lte: end } });
            const sApplications = await AffApplication.countDocuments({ belongsTo: _id, brand: 'Skrill', dateAdded: { $gte: start, $lte: end } });

            return res.status(200).send({ 
                nCashback,
                nSubCashback,
                sCashback,
                sSubCashback,
                nApplications,
                sApplications,
                sRegs,
                nRegs,
                nClicks,
                sClicks
            });
        } catch (error) {
            return res.status(403).send({ success: false, msg: error });
        };
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /affiliate/report/accountId/table
router.post('/accountId/table', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        let pageSize = parseInt(req.query.pageSize);
        let pageIndex = parseInt(req.query.pageIndex);
        
        let { sort, query } = req.body;
        let skippage = pageSize * (pageIndex);
    
        const reports = await AffReport.find(query).collation({ locale: 'en', strength: 1 }).sort(sort).skip(skippage).limit(pageSize); // NEED TO ADD SELECT AND LEAN
        const pageCount = await AffReport.countDocuments(query);
    
        return res.send({ reports, pageCount });
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /affiliate/report/accountId/chart
router.post('/accountId/chart', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        let { months, query } = req.body;
        const reports = await AffReport.find(query).where({ month: { $in: months } } ).sort({ date: 1 }); // NEED TO ADD SELECT AND LEAN
        return res.send({ reports });
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /affiliate/report/fetch-deal-progress
router.post('/fetch-deal-progress', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const { _id, month } = req.body;
        try {
            const partner = await AffPartner.findById(req.body._id).select('referredBy deals isSubPartner revShareActive').lean()
            const { referredBy, deals, isSubPartner, revShareActive } = partner;

            const nRate = await getCashbackRate({ _id, referredBy, deals, isSubPartner, brand: 'Neteller', month });
            const sRate = await getCashbackRate({ _id, referredBy, deals, isSubPartner, brand: 'Skrill', month });
            const eRate = await getCashbackRate({ _id, referredBy, deals, isSubPartner, brand: 'ecoPayz', month });

            return res.status(200).send({ nRate, sRate, eRate, deals, revShareActive });
        } catch (error) {
            return res.status(403).send({ success: false, msg: error });
        }
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /affiliate/report/fetch-quarter-data
router.post('/fetch-quarter-data', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const { accountId, quarter } = req.body;
        try {
            const q = await Quarter.findOne({ accountId, quarter });
            const upgrades = await AffUpgrade.find({ accountId, quarter })
            return res.status(200).send({ q, upgrades });
        } catch (error) {
            return res.status(403).send({ success: false, msg: error });
        }
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

// POST /affiliate/report/fetch-monthly-statement
router.post('/fetch-monthly-statement', passport.authenticate('jwt', {
    session: false
}), async (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const { _id, month } = req.body;
        try {
            const partner = await AffPartner.findById(req.body._id).select('referredBy isSubPartner subPartnerRate').lean()
            const { referredBy, isSubPartner, subPartnerRate } = partner;
            
            const nVolume = await getVolumeByBrand({ _id }, 'Neteller', month);
            const nCashback = await getCashBackByBrand({ _id }, 'Neteller', month);
            const nSubVol = await getSubPartnerVolumeByBrand({ _id, isSubPartner, month, brand: 'Neteller' });
            const nSubCashback = await getSubPartnerCashbackByBrand({ _id, isSubPartner, month, brand: 'Neteller' });
            const nNetworkShare = await getNetworkShareVolumeByBrand({ referredBy, month, brand: 'Neteller' });

            const sVolume = await getVolumeByBrand({ _id }, 'Skrill', month);
            const sCashback = await getCashBackByBrand({ _id }, 'Skrill', month);
            const sSubVol = await getSubPartnerVolumeByBrand({ _id, isSubPartner, month, brand: 'Skrill' });
            const sSubCashback = await getSubPartnerCashbackByBrand({ _id, isSubPartner, month, brand: 'Skrill' });
            const sNetworkShare = await getNetworkShareVolumeByBrand({ referredBy, month, brand: 'Skrill' });

            const eVolume = await getVolumeByBrand({ _id }, 'ecoPayz', month);
            const eCashback = await getCashBackByBrand({ _id }, 'ecoPayz', month);
            const eSubVol = await getSubPartnerVolumeByBrand({ _id, isSubPartner, month, brand: 'ecoPayz' });
            const eSubCashback = await getSubPartnerCashbackByBrand({ _id, isSubPartner, month, brand: 'ecoPayz' });
            const eNetworkShare = await getNetworkShareVolumeByBrand({ referredBy, month, brand: 'ecoPayz' });

            return res.status(200).send({ 
                subPartnerRate,
                nVolume,
                nCashback,
                nSubVol,
                nSubCashback,
                nNetworkShare,

                sVolume,
                sCashback,
                sSubVol,
                sSubCashback,
                sNetworkShare,

                eVolume,
                eCashback,
                eSubVol,
                eSubCashback,
                eNetworkShare
            });
        } catch (error) {
            // return error;
            return res.status(403).send({ success: false, msg: error });
        }
    } else res.status(403).send({ success: false, msg: 'Unauthorised' });
});

const getSubPartnerVolumeByBrand = ({ _id, isSubPartner, brand, month }) => { // this is used for /affiliate/report/fetch-monthly-statement in router/affiliate/report.router.js
    if (isSubPartner) {
        return new Promise(resolve => {
            resolve (
                AffPartner.find({ referredBy: _id }).select('_id').lean() // get all partners that have BEEN referredBy this partner
                .then(subPartners => {
                    return subPartners.reduce(async (total, nextSubPartner) => {
                        let acc = await total;
                        for await (const report of AffReport.find({ belongsToPartner: nextSubPartner._id, brand, month, 'account.transValue': { $gt: 0 } }).select('account.transValue').lean()) {
                            acc += report.account.transValue;
                        };
                        return acc;
                    }, Promise.resolve(0))
                })
            )
        });
    } else return 0;
};

const getNetworkShareVolumeByBrand = ({ referredBy, month, brand }) => { 
    if (referredBy) {
        return new Promise(resolve => {
            resolve (
                AffPartner.find({ referredBy }).select('_id').lean() // get all partners that have the SAME referredBy as this partner
                .then(partnersReferredBySameNetwork => {
                    return partnersReferredBySameNetwork.reduce(async (total, nextPartner) => {
                        let acc = await total;
                        for await (const report of AffReport.find({ belongsToPartner: nextPartner._id, brand, month, 'account.transValue': { $gt: 0 } }).select('account.transValue').lean()) {
                            acc += report.account.transValue;
                        };
                        return acc;
                    }, Promise.resolve(0))
                })
            )
        });
    } else return 0;
};

const getSubPartnerCashbackByBrand = ({ _id, brand, month, isSubPartner }) => {
    if (isSubPartner) {
        return new Promise(resolve => {
            resolve (
                AffPartner.find({ referredBy: _id }).select('_id').lean() // get all partners that have BEEN referredBy this partner
                .then(subPartners => {
                    return subPartners.reduce(async (total, nextSubPartner) => {
                        let acc = await total;
                        for await (const report of AffReport.find({ belongsToPartner: nextSubPartner._id, brand, month, 'account.transValue': { $gt: 0 } }).select('account.subAffCommission').lean()) {
                            acc += report.account.subAffCommission;
                        };
                        return acc;
                    }, Promise.resolve(0))
                })
            )
        });
    } else return 0;
};



module.exports = router;
