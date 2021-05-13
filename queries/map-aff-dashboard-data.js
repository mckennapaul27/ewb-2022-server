const mongoose = require('mongoose');

const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat); // https://day.js.org/docs/en/plugin/localized-format

const { setCurrency } = require('../config/deals');
const { 
    AffPartner,
    AffPayment,
    AffReport,
    AffReportMonthly,
    AffSubReport 
} = require('../models/affiliate/index');

const { createAffNotification } = require('../utils/notifications-functions');
const { createAdminJob } = require('../utils/admin-job-functions');
const { updateAffiliateBalance } = require('../utils/balance-helpers');
const { setAffQuarterData } = require('../utils/quarter-helpers');
const { getQuarterData } = require('../utils/quarter-data');

const updatePartnerStats = async (brand, month, date) => {
    let arr = await AffPartner.find({ 
        $or: [  // only find() partners that have at least 1 account in the accounts array or have referred subpartners
            { isSubPartner: true }, 
            { 'accounts.0': { $exists: true } }
        ] 
    }).select('-accounts -stats -notifications -statistics -subPartners -subAffReports -paymentDetails');
   
    let processStatsOne = arr.reduce(async (previousPartner, nextPartner) => {
        await previousPartner;
        return setCashback(nextPartner, brand, month).then(() => {
            return partnerStatusCheck(nextPartner);
        })
    }, Promise.resolve());
    console.log('Processing partner stats [1] ...');
    processStatsOne.then(() => {
        let processStatsTwo = arr.reduce(async (previousPartner, nextPartner) => {
            await previousPartner;
            return updateMonthlyReport(nextPartner, brand, month, date);
        }, Promise.resolve());
        console.log('Processing partner stats [2] ...');
        processStatsTwo.then(() => {
            let processStatsThree = arr.reduce(async (previousPartner, nextPartner) => {
                await previousPartner;
                return createUpdateAffSubReport(nextPartner, brand, month, date);
            }, Promise.resolve());
            console.log('Processing partner stats [3] ...');
            processStatsThree.then(() => {
                let processStatsFour = arr.reduce(async (previousPartner, nextPartner) => {
                    await previousPartner;
                    return setAffPartnerBalance(nextPartner)
                }, Promise.resolve());
                console.log('Processing partner stats [4] ...');
                processStatsFour.then(() => {
                    // createAffNotification({ // once complete - add notification
                    //     message: `${brand} data was fetched on ${dayjs().format('LLLL')}`, 
                    //     type: 'Report', 
                    //     isGeneral: true 
                    // });
                    // createAdminJob({
                    //     message: `${brand} reports and dashboard data was fetched on ${dayjs().format('LLLL')}`, 
                    //     completed: true,
                    //     status: 'Completed',
                    //     type: 'Reports'
                    // });
                    console.log('Completed partner data ... ')
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
};

const setCashback = ({ _id, deals, referredBy, revShareActive, fixedDealActive, epi, isPermitted }, brand, month) => {

    return new Promise(resolve => {
        resolve (
            (async () => {
                const rate = await getCashbackRate({ _id, referredBy, deals, brand, month });
                const reports = await AffReport
                .find({ belongsToPartner: _id, brand, month, 'account.transValue': { $gt: 0 } })
                .select('account.transValue account.commission account.earnedFee country account.accountId belongsToPartner')
                .lean(); // only find accounts that have transValue > 0
                const subPartnerRate = (await getSubPartnerRate({ referredBy })).subPartnerRate;

                await reports.reduce(async (previousReport, nextReport) => { // this was previously causing the process to not run synchronously - important bit is to await it
                    await previousReport;

                    const { transValue, commission, earnedFee, accountId } = nextReport.account;
                    const levels = (twentyPercentRate, c) => { // c = commission
                        if ((nextReport.country === 'IN' || nextReport.country === 'BD') && (isPermitted !== undefined && !isPermitted)) return 0; // If the report country is IN or BD and partner isPermitted = false return 0;
                        else if (c === 0) return 0;
                        else if (revShareActive) return rate; // if revShareActive, just return rate like 25% or 27.5%
                        else if (fixedDealActive['isActive']) return fixedDealActive['rate']; // if fixed deal active return the rate. Have put it in ['rate'] just in case in passes rate from function param
                        else if (twentyPercentRate < 0.0050 && rate >= 0.0050) return twentyPercentRate;
                        else if (twentyPercentRate < 0.0039) return twentyPercentRate;
                        else return rate;
                    };
                    const twentyPercentRate = (earnedFee / 5) / transValue;
                    const verifiedRate = (brand === 'Skrill' || brand === 'Neteller') ? levels(twentyPercentRate, commission) : rate;
                    const cashback = revShareActive ? (earnedFee * verifiedRate) : (transValue * verifiedRate);
                    const subAffCommission = referredBy ?  (
                        (twentyPercentRate < 0.005 && rate >= 0.005) ? cashback * 0.05 : cashback * subPartnerRate
                    ) : 0;   
                    const profit = commission - (subAffCommission + cashback);
                    const quarter = (brand === 'Skrill' || brand === 'Neteller') ? (await getQuarterData({ month })).quarter : '-'; // if brand is skrill or neteller, set the quarter of the report
                    await AffReport.findByIdAndUpdate(nextReport._id, {
                        lastUpdate: Date.now(),
                        'account.cashbackRate': verifiedRate,
                        'account.cashback': cashback,
                        'account.subAffCommission': subAffCommission,
                        'account.profit': profit,
                        comment: (nextReport.country === 'IN' || nextReport.country === 'BD') && (isPermitted !== undefined || !isPermitted) ? 'IN & BD accounts not eligible for commission' : '',
                        quarter
                    }, { new: true }).exec();
                    await setAffQuarterData({ month, brand, accountId, _id: nextReport.belongsToPartner });

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
            }).catch(e => e)
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
    for await (const report of AffReport.find({ belongsToPartner: _id, brand, month, 'account.transValue': { $gt: 0 } }).select('account.subAffCommission').lean()) {
        subAffCommission += report.account.subAffCommission;
    };
    return subAffCommission;
};

const createUpdateAffSubReport = ({ _id }, brand, month, date) => {
    return new Promise(resolve => {
        resolve (
            (async () => {
                const subPartners = await AffPartner.find({ referredBy: _id, 'accounts.0': { $exists: true } }).select('_id epi') // { referredBy: _id } === the partner we are checking
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
                await updateAffiliateBalance({ _id })
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
};




module.exports = {
    updatePartnerStats,
    getCashbackRate,
    getCashbackRate,
    getVolumeByBrand,
    getCashBackByBrand,
    getSubAffCommissionByBrand
}