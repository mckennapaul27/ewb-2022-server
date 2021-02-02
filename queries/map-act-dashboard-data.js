const mongoose = require('mongoose');

const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat); // https://day.js.org/docs/en/plugin/localized-format

const { setCurrency, defaultActStats } = require('../config/deals');
const {
    Account,
    Application,
    Report,
    SubReport,
    ActiveUser,
    Payment
} = require('../models/personal/index');

const { createUserNotification } = require('../utils/notifications-functions');
const { updatePersonalBalance } = require('../utils/balance-helpers');
// createUserNotification = ({ message, type, belongsTo }) => UserNotification.create({ message, type, belongsTo });

const updateActUserStats = async (brand, month, date) => {
    let arr = await ActiveUser.find({ // only find() users that have at least 1 account in the accounts array or have referred friends
        $or: [  
            { 'friends.0': { $exists: true } },
            { 'accounts.0': { $exists: true } }
        ] 
    })
    .select('deals friends accounts referredBy');

    console.log(`Processing data for ${arr.length} activeusers ...`);
    
    let processStatsOne = arr.reduce(async (previousPartner, nextPartner) => {
        await previousPartner;
        return setCashback(nextPartner, brand, month); // set cashback
    }, Promise.resolve());
    console.log('Processing activeuser data [1] ...');
    processStatsOne.then(() => {
        let processStatsTwo = arr.reduce(async (previousPartner, nextPartner) => {
            await previousPartner;
            return createUpdateSubReport(nextPartner, brand, month, date); // create or update sub report
        }, Promise.resolve());
        console.log('Processing activeuser data [2] ...');
        processStatsTwo.then(() => {
            let processStatsThree = arr.reduce(async (previousPartner, nextPartner) => {
                await previousPartner;
                return setBalance(nextPartner); // update balance  
            }, Promise.resolve());
            console.log('Processing activeuser data [3] ...');
            processStatsThree.then(() => console.log('Completed activeuser data ... ')) // return null to end sequence 
        })
    });
};

const setCashback = ({ _id, deals, referredBy }, brand, month) => {

    return new Promise(resolve => {
        resolve (
            (async () => {
                const rate = await getCashbackRate({ _id, deals, brand, month });
                const reports = await Report.find({ belongsToActiveUser: _id, brand, month, 'account.transValue': { $gt: 0 } }).select('account.transValue account.commission account.earnedFee').lean(); // only find accounts that have transValue > 0
                
                await reports.reduce(async (previousReport, nextReport) => { // this was previously causing the process to not run synchronously - important bit is to await it
                    await previousReport;

                    const { commission, earnedFee, transValue } = nextReport.account;
                    const cashback = earnedFee * rate;
                    const rafCashback = referredBy ? cashback * 0.05 : 0;
                    const cashbackRate = cashback / transValue;
                    const profit = commission - (cashback + rafCashback);

                    await Report.findByIdAndUpdate(nextReport._id, {
                        lastUpdate: Date.now(),
                        'account.cashbackRate': cashbackRate,
                        'account.cashback': cashback,
                        'account.rafCashback': rafCashback,
                        'account.profit': profit
                    }, { new: true, select: 'lastUpdate account.cashbackRate account.accountId account.cashback account.rafCashback account.profit' }).exec();

                    return new Promise(resolve => resolve(nextReport)); // this is important bit - we return a promise that resolves to another promise
                }, Promise.resolve());
            })()
        )
    })      
};

const getCashbackRate = ({ _id, deals, brand, month }) => {
    return new Promise(resolve => {
        resolve (
            Promise.all([
                getReportsVolume({ _id, brand, month }),
                getSubUserVolume({ _id, brand, month }),
                deals.find(d => d.brand === brand).rates
            ])
            .then(( [myVol, mySubVol, myDeal] ) => {
                const transValue = myVol + mySubVol;
                return myDeal.reduce((acc, deal) => (transValue <= deal.maxVol && transValue >= deal.minVol) ? (acc += deal.cashback, acc) : acc, 0)
            }).catch(e => e)
        )
    });
};

const getReportsVolume = async ({ _id, brand, month }) => { // search by month ONLY for all brands
    let transValue = 0;
    for await (const report of Report.find({ belongsToActiveUser: _id, brand, month, 'account.transValue': { $gt: 0 } }).select('account.transValue').lean()) {
        transValue += report.account.transValue;
    };
    return transValue;
};

const getSubUserVolume = async ({ _id, brand, month }) => Promise.resolve(
    ActiveUser.find({ referredBy: _id }).select('_id').lean() // get all partners that have BEEN referredBy this activeuser
    .then(subUsers => {
        return subUsers.reduce(async (total, nextSubUser) => {
            let acc = await total;
            for await (const report of Report.find({ belongsToActiveUser: nextSubUser._id, brand, month, 'account.transValue': { $gt: 0 } }).select('account.transValue').lean()) {
                acc += report.account.transValue;
            };
            return acc;
        }, Promise.resolve(0))
    })
);

const createUpdateSubReport = ({ _id }, brand, month, date) => {
    return new Promise(resolve => {
        resolve (
            (async () => {
                const subUsers = await ActiveUser.find({ referredBy: _id, 'accounts.0': { $exists: true } }).select('_id epi') // { referredBy: _id } === the partner we are checking
                if (subUsers.length > 0) {
                    await subUsers.reduce(async (previousSubUser, nextSubUser) => { // this was previously causing the process to not run synchronously - important bit is to await it
                        
                        await previousSubUser;

                        const aggregateReports = await Report.aggregate([
                            { $match: { $and: [ { belongsToActiveUser: mongoose.Types.ObjectId(nextSubUser._id)}, { brand }, { month }, { 'account.transValue': { $gt: 0 } } ] } },
                            { $project: { 'account.cashback': 1, 'account.commission': 1, 'account.transValue': 1, 'account.rafCashback': 1, 'account.deposits': 1 } }, // selected values to return 1 = true, 0 = false
                            { $group: { 
                                '_id': null, 
                                deposits: { $sum: '$account.deposits' },
                                transValue: { $sum: '$account.transValue' },
                                cashback: { $sum: '$account.cashback' },
                                commission: { $sum: '$account.commission' },
                                rafCashback: { $sum: '$account.rafCashback' }
                            }}, 
                        ]);              
                        const { userId, email } = (await ActiveUser.findById(nextSubUser._id).select('belongsTo').populate({ path: 'belongsTo', select: 'userId email' })).belongsTo;

                        if (aggregateReports.length > 0) {
                            const { deposits, transValue, commission, cashback, rafCashback } = aggregateReports[0];
                            const cashbackRate = cashback / transValue;
                            const subReport = await SubReport.bulkWrite([
                                {
                                    updateOne: { 
                                        filter: { belongsTo: _id, month, brand, userId }, 
                                        update: { 
                                            $set: {
                                                date,
                                                month,
                                                lastUpdate: Date.now(),
                                                userId,
                                                email,
                                                deposits,
                                                transValue,
                                                commission,
                                                cashback,
                                                rafCommission: rafCashback,
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

const setBalance = ({ _id }) => {
    return new Promise(resolve => {
        resolve (
            (async () => {
                await updatePersonalBalance({ _id })
            })()
        )
    })
};

module.exports = {
    updateActUserStats,
    getCashbackRate,
    getCashbackRate
}