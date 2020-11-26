const mongoose = require('mongoose');
const { setCurrency } = require('../config/deals');
const { 
    AffPartner,
    AffPayment,
    AffReport,
    AffReportMonthly,
    AffSubReport 
} = require('../models/affiliate/index');

const updatePartnerStats = async (brand, month, date) => {
    let arr = await AffPartner.find({ 'accounts.0': { $exists: true } }).select('-accounts -stats -notifications -statistics -subPartners -subAffReports -paymentDetails')
    // only find() partners that have at least 1 account in the accounts array
    let processStatsOne = arr.reduce(async (previousPartner, nextPartner) => {
        await previousPartner;
        return setCashback(nextPartner, brand, month).then(() => {
            return partnerStatusCheck(nextPartner);
        })
    }, Promise.resolve());
    console.log('Processing [1] ...');
    processStatsOne.then(() => {
        let processStatsTwo = arr.reduce(async (previousPartner, nextPartner) => {
            await previousPartner;
            return updateMonthlyReport(nextPartner, brand, month, date);
        }, Promise.resolve());
        console.log('Processing [2] ...');
        processStatsTwo.then(() => {
            let processStatsThree = arr.reduce(async (previousPartner, nextPartner) => {
                await previousPartner;
                return createUpdateAffSubReport(nextPartner, brand, month, date);
            }, Promise.resolve());
            console.log('Processing [3] ...');
            processStatsThree.then(() => {
                let processStatsFour = arr.reduce(async (previousPartner, nextPartner) => {
                    await previousPartner;
                    return setAffPartnerBalance(nextPartner)
                }, Promise.resolve());
                console.log('Processing [4] ...');
                processStatsFour.then(() => {

                    return null;
                })
            })            
        })
    });
};

const getSubPartnerRate = async ({ referredBy }) => { // finding the partner that referred THIS partner
    if (referredBy) {
        const rate = await AffPartner.findById(referredBy).select('subPartnerRate epi').exec();
        return rate;
    } else return 0;
}

const setCashback = ({ _id, deals, referredBy, revShareActive, fixedDealActive, epi }, brand, month) => {

    return new Promise(resolve => {
        resolve (
            (async () => {
                const rate = await getCashbackRate({ _id, referredBy, deals, brand, month });
                const reports = await AffReport.find({ belongsToPartner: _id, brand, month, 'account.transValue': { $gt: 0 } }).select('account.transValue account.commission account.earnedFee').lean(); // only find accounts that have transValue > 0
                const subPartnerRate = (await getSubPartnerRate({ referredBy })).subPartnerRate;
                // console.log(epi)
                // const referredByEpi =
                // console.log(subPartnerRate)

                await reports.reduce(async (previousReport, nextReport) => { // this was previously causing the process to not run synchronously - important bit is to await it
                    await previousReport;

                    const { transValue, commission, earnedFee } = nextReport.account;
                    const levels = (twentyPercentRate, c) => { // c = commission
                        if (c === 0) return 0;
                        else if (revShareActive) return rate; // if revShareActive, just return rate like 25% or 27.5%
                        else if (fixedDealActive['isActive']) return fixedDealActive['rate']; // if fixed deal active return the rate. Have put it in ['rate'] just in case in passes rate from function param
                        else if (twentyPercentRate < 0.0050 && rate >= 0.0050) return twentyPercentRate;
                        else if (twentyPercentRate < 0.0039) return twentyPercentRate;
                        else return rate;
                    };
                    const twentyPercentRate = (earnedFee / 5) / transValue;
                    const verifiedRate = (brand === 'Skrill' || brand === 'Neteller') ? levels(twentyPercentRate, commission) : rate;
                    const cashback = revShareActive ? earnedFee * rate : transValue * verifiedRate;
                    const subAffCommission = referredBy ?  (
                        (twentyPercentRate < 0.005 && rate >= 0.005) ? cashback * 0.05 : cashback * subPartnerRate
                    ) : 0;   
                    
                    const profit = commission - (subAffCommission + cashback);

                    await AffReport.findByIdAndUpdate(nextReport._id, {
                        lastUpdate: Date.now(),
                        'account.cashbackRate': verifiedRate,
                        'account.cashback': cashback,
                        'account.subAffCommission': subAffCommission,
                        'account.profit': profit
                    }, { new: true, select: 'lastUpdate account.cashbackRate account.accountId account.cashback account.subAffCommission account.profit' }).exec();

                    return new Promise(resolve => resolve(nextReport)); // this is important bit - we return a promise that resolves to another promise
                }, Promise.resolve());
            })()
        )
    })      
};

const getCashbackRate = ({ _id, referredBy, deals, isSubPartner, brand, month }) => {
    return new Promise(resolve => {
        resolve (
            Promise.all([
                getReportsVolume({ _id, month }),
                getNetworkShareVolume({ referredBy, month }),
                getSubPartnerVolume({ _id, isSubPartner, month }),
                deals.find(d => d.brand === brand).rates
            ])
            .then(( [myVol, myNetworkVol, mySubVol, myDeal] ) => {
                const transValue = myVol + myNetworkVol + mySubVol;
                return myDeal.reduce((acc, deal) => (transValue <= deal.maxVol && transValue >= deal.minVol) ? (acc += deal.cashback, acc) : acc, 0)
            })
        )
    });
};

const getReportsVolume = async ({ _id, month }) => { // search by month ONLY for all brands
    let transValue = 0;
    for await (const report of AffReport.find({ belongsToPartner: _id, month, 'account.transValue': { $gt: 0 } }).select('account.transValue').lean()) {
        transValue += report.account.transValue;
    };
    return transValue;
};

const getNetworkShareVolume = ({ referredBy, month }) => { 
    if (referredBy) {
        return new Promise(resolve => {
            resolve (
                AffPartner.find({ referredBy }).select('_id').lean() // get all partners that have the SAME referredBy as this partner
                .then(partnersReferredBySameNetwork => {
                    return partnersReferredBySameNetwork.reduce(async (total, nextPartner) => {
                        let acc = await total;
                        for await (const report of AffReport.find({ belongsToPartner: nextPartner._id, month, 'account.transValue': { $gt: 0 } }).select('account.transValue').lean()) {
                            acc += report.account.transValue;
                        };
                        return acc;
                    }, Promise.resolve(0))
                })
            )
        });
    } else return 0;
};

const getSubPartnerVolume = ({ _id, month, isSubPartner }) => {
    if (isSubPartner) {
        return new Promise(resolve => {
            resolve (
                AffPartner.find({ referredBy: _id }).select('_id').lean() // get all partners that have BEEN referredBy this partner
                .then(subPartners => {
                    return subPartners.reduce(async (total, nextSubPartner) => {
                        let acc = await total;
                        for await (const report of AffReport.find({ belongsToPartner: nextSubPartner._id, month, 'account.transValue': { $gt: 0 } }).select('account.transValue').lean()) {
                            acc += report.account.transValue;
                        };
                        return acc;
                    }, Promise.resolve(0))
                })
            )
        });
    } else return 0;
};

const updateMonthlyReport = ({ _id, referredBy, deals }, brand, month, date) => {
    return new Promise(resolve => {
        resolve (
            (async () => {
                const rate = await getCashbackRate({ _id, referredBy, deals, brand, month });
                const transValue = await getVolumeByBrand({ _id }, brand, month);
                const commission = await getCommissionByBrand({ _id }, brand, month);
                const cashback = await getCashBackByBrand({ _id }, brand, month);
                const subAffCommission = await getSubAffCommissionByBrand({ _id }, brand, month);
                const commissionRate = commission / transValue;
                const profit = commission - (cashback + subAffCommission);
                
                if (transValue > 0) { // can't use await AffReportMonthly.bulkWrite([ here anymore because we need to use .pre('validate') to add parameters
                    const existingReport = await AffReportMonthly.findOne({ belongsTo: _id, month, brand }).select('_id').lean();
                    if (existingReport) {
                        await AffReportMonthly.findByIdAndUpdate(existingReport._id, {
                            lastUpdate: Date.now(),
                            transValue,
                            commission,
                            commissionRate,
                            cashback,
                            cashbackRate: rate,
                            subAffCommission,
                            profit
                        }, { new: true })
                    } else {
                        await AffReportMonthly.create({
                            date,
                            month,
                            brand,
                            lastUpdate: Date.now(),
                            transValue,
                            commission,
                            commissionRate,
                            cashback,
                            cashbackRate: rate,
                            subAffCommission,
                            belongsTo: _id,
                            profit
                        })
                    };
                } else return;
            })()
        )
    })
};

const getCashBackByBrand = async ({ _id }, brand, month) => {
    let cashback = 0;
    for await (const report of AffReport.find({ belongsToPartner: _id, brand, month, 'account.transValue': { $gt: 0 } }).select('account.cashback').lean()) {
        cashback += report.account.cashback;
    };
    return cashback;
};

const getCommissionByBrand = async ({ _id }, brand, month) => {
    let commission = 0;
    for await (const report of AffReport.find({ belongsToPartner: _id, brand, month, 'account.transValue': { $gt: 0 } }).select('account.commission').lean()) {
        commission += report.account.commission;
    };
    return commission;
};

const getVolumeByBrand = async ({ _id }, brand, month) => {
    let transValue = 0;
    for await (const report of AffReport.find({ belongsToPartner: _id, brand, month, 'account.transValue': { $gt: 0 } }).select('account.transValue').lean()) {
        transValue += report.account.transValue;
    };
    return transValue;
};

const getSubAffCommissionByBrand = async ({ _id }, brand, month) => {
    let subAffCommission = 0;
    for await (const report of AffReport.find({ belongsToPartner: _id, brand, month, 'account.transValue': { $gt: 0 } }).lean()) {
        subAffCommission += report.account.subAffCommission;
    };
    return subAffCommission;
};

const createUpdateAffSubReport = ({ _id }, brand, month, date) => {
    return new Promise(resolve => {
        resolve (
            (async () => {
                const subPartners = await AffPartner.find({ referredBy: _id }).select('_id epi') // referredBy the partner we are checking
                if (subPartners.length > 0) {

                    await subPartners.reduce(async (previousSubPartner, nextSubPartner) => { // this was previously causing the process to not run synchronously - important bit is to await it
                        
                        await previousSubPartner;

                        const aggregateReports = await AffReport.aggregate([
                            { $match: { $and: [ { belongsToPartner: mongoose.Types.ObjectId(nextSubPartner._id)}, { brand }, { month }, { 'account.transValue': { $gt: 0 } } ] } },
                            { $project: { 'account.cashback': 1, 'account.commission': 1, 'account.transValue': 1, 'account.subAffCommission': 1, 'account.deposits': 1 } }, // selected values to return 1 = true, 0 = false
                            { $group: { 
                                '_id': null, 
                                deposits: { $sum: '$account.deposits' },
                                transValue: { $sum: '$account.transValue' },
                                cashback: { $sum: '$account.cashback' },
                                commission: { $sum: '$account.commission' },
                                subAffCommission: { $sum: '$account.subAffCommission' }
                            }}, 
                        ]);                       

                        if (aggregateReports.length > 0) {
                            const { deposits, transValue, commission, cashback, subAffCommission } = aggregateReports[0];
                            const cashbackRate = cashback / transValue;
                            const subReport = await AffSubReport.bulkWrite([
                                {
                                    updateOne: { 
                                        filter: { belongsTo: _id, month, brand, epi: nextSubPartner.epi }, 
                                        update: { 
                                            $set: {
                                                date,
                                                month,
                                                lastUpdate: Date.now(),
                                                brand,
                                                epi: nextSubPartner.epi,
                                                deposits,
                                                transValue,
                                                commission,
                                                cashback,
                                                subAffCommission,
                                                cashbackRate,
                                                currency: setCurrency(brand),
                                                belongsTo: _id
                                            }
                                        },
                                        upsert: true // upsert must be placed within updateOne object or every object that is traversed through / https://stackoverflow.com/questions/39988848/trying-to-do-a-bulk-upsert-with-mongoose-whats-the-cleanest-way-to-do-this
                                    },
                                }
                            ]);
                            console.log(subReport)
                            return new Promise(resolve => resolve(subReport)); // this is important bit - we return a promise that resolves to another promise
                        } else return;
                    }, Promise.resolve());
                } else return;
            })()
        )
    })
};

const setAffPartnerBalance = ({ _id }) => {
    return new Promise(resolve => {
        resolve (
            (async () => {

                const affReports = await AffReport.aggregate([
                    { $match: { $and: [ { belongsToPartner: mongoose.Types.ObjectId(_id) }, { 'account.transValue': { $gt: 0 } } ] } }, // only search if transValue > 0
                    { $project: { 'account.cashback': 1, 'account.commission': 1, 'account.currency': 1 } }, // selected values to return 1 = true, 0 = false
                    { $group: { // https://docs.mongodb.com/manual/reference/operator/aggregation/group/
                        '_id': {
                            currency: '$account.currency'
                        },
                        cashback: { $sum: '$account.cashback' },
                        commission: { $sum: '$account.commission' }
                    }},
                ]);
                const affSubReports = await AffSubReport.aggregate([
                    { $match: { $and: [ { belongsTo: mongoose.Types.ObjectId(_id) } ] } },
                    { $project: { 'subAffCommission': 1, 'currency': 1 } }, // selected values to return 1 = true, 0 = false
                    { $group: { // https://docs.mongodb.com/manual/reference/operator/aggregation/group/
                        '_id': {
                            currency: '$currency'
                        },
                        total: { $sum: '$subAffCommission' }
                    }},
                ]);
                const affPayments = await AffPayment.aggregate([
                    { $match: { $and: [ { belongsTo: mongoose.Types.ObjectId(_id) } ] } },
                    { $project: { 'currency': 1, 'status': 1, 'amount': 1 } }, // selected values to return 1 = true, 0 = false
                    { $group: {
                        '_id': {
                            currency: '$currency',
                            status: '$status'
                        },
                        total: { $sum: '$amount' }
                    }}
                ]);
                
                const commission = affReports.reduce((acc, item) => (acc[item._id.currency] += item.commission, acc), { USD: 0, EUR: 0 });
                const cashback = affReports.reduce((acc, item) => (acc[item._id.currency] += item.cashback, acc), { USD: 0, EUR: 0 });
                const subCommission = affSubReports.reduce((acc, item) => (acc[item._id.currency] += item.total, acc), { USD: 0, EUR: 0 });
                const paid = affPayments.reduce((acc, item) => item._id.status === 'Paid' ? (acc[item._id.currency] += item.total, acc) : acc, { USD: 0, EUR: 0 });
                const requested = affPayments.reduce((acc, item) => item._id.status === 'Requested' ? (acc[item._id.currency] += item.total, acc) : acc, { USD: 0, EUR: 0 });
                let balance = {
                    USD: (cashback['USD'] + subCommission['USD']) - (paid['USD'] + requested['USD']),
                    EUR: (cashback['EUR'] + subCommission['EUR']) - (paid['EUR'] + requested['EUR']),
                };

                await ['USD', 'EUR'].reduce(async (acc, currency) => {
                    await acc;

                    const partner = await AffPartner.findByIdAndUpdate(_id, {
                        'stats.balance.$[el].amount': balance[currency],
                        'stats.commission.$[el].amount': commission[currency], 
                        'stats.cashback.$[el].amount': cashback[currency],
                        'stats.payments.$[el].amount': paid[currency], 
                        'stats.requested.$[el].amount': requested[currency], 
                        // 'stats.subCommission.$[el].amount': subCommission[currency] // NEED TO ADD TO STATS ARRAY // MongoError: The path 'stats.subCommission' must exist in the document in order to apply array updates.
                    }, {
                        new: true,
                        arrayFilters: [{ 'el.currency': currency }],
                        select: 'stats'
                    });
                    return new Promise(resolve => resolve(partner)); // this is important bit - we return a promise that resolves to another promise
                }, Promise.resolve());   
            })()
        )
    })
};

const partnerStatusCheck = ({ _id, isSubPartner, isOfficialPartner, epi }) => {
    return new Promise(resolve => {
        resolve (
            (async () => {
                if (!isSubPartner || !isOfficialPartner) { // only call queries if not already isSubPartner OR; isOfficialPartner === false

                    const subPartners = await AffPartner.find({ referredBy: _id }).select('_id').lean(); 
                    const myVol = await (async () => {
                        let transValue = 0;
                        for await (const report of AffReport.find({ belongsToPartner: _id, 'account.transValue': { $gt: 0 } }).select('account.transValue').lean()) {
                            transValue += report.account.transValue;
                        };
                        return transValue;
                    })()
                    const subVol = await subPartners.reduce(async (total, nextSubPartner) => {
                        let acc = await total;
                        for await (const report of AffReport.find({ belongsToPartner: nextSubPartner._id, 'account.transValue': { $gt: 0 } }).select('account.transValue').lean()) {
                            acc += report.account.transValue;
                        };
                        return acc;
                    }, Promise.resolve(0));

                    const total = subVol + myVol;
                    const isSub = total > 10000 ? true : false;
                    const isOfficial = total > 250000 ? true : false;

                    if (isSub) {
                        // send email
                        await AffPartner.findByIdAndUpdate(_id, {
                            isSubPartner: isSub
                        }, { select: 'isSubPartner' });
                    } else if (isOfficial) {
                        // send email
                        await AffPartner.findByIdAndUpdate(_id, {
                            isOfficialPartner: isOfficial
                        }, { select: 'isOfficialPartner' });
                    } else return;
                } else return;
            })()
        )
    })
}




module.exports = {
    updatePartnerStats
}