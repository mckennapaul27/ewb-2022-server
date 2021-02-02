const {
    AffApplication,
    AffPartner
} = require('../models/affiliate/index');
const {
    Account,
    Application,
    Report,
    ActiveUser
} = require('../models/personal/index');

const { setCurrency } = require('../config/deals');
const { updateActUserStats } = require('./map-act-dashboard-data');
const { createUserNotification } = require('../utils/notifications-functions');
const { sendEmail } = require('../utils/sib-helpers');

const actDataReducer = (results, brand, month, date) => {
    let completedAccountMapping = results.reduce((previousAccount, nextAccount) => {
        return previousAccount.then(() => {
            return mapAccountReports(nextAccount, brand, month, date) // need to update properly
        })
    }, Promise.resolve())
    completedAccountMapping
    .then(() => {
        return updateActUserStats(brand, month, date);
    })
    .catch(e => e)
};

const mapAccountReports = async (a, brand, month, date) => {
    const dateAdded = Date.now();
    const lastUpdate = Date.now();
    return new Promise(resolve => {
        resolve (
            (async () => { // anonymous async function  
                // NOTE: DO NOT USE { new: true } on .create()
                // NOTE: can only use the .save() method on newly created documents - cannot use it on findOne() such as AffPartner.findOne({ epi }).select('epi').lean();
                let {
                    epi,
                    currency,
                    accountId,
                    country,
                    transValue,
                    commission,
                    deposits,
                    earnedFee
                } = a;
                
                currency = currency ? currency : await setCurrency(brand);
                let commissionRate = transValue > 0 ? (commission / transValue) : 0;
                let defaultCashback = earnedFee > 0 ? (earnedFee / 5) : 0;
                let defaultCashbackRate = defaultCashback > 0 ? (defaultCashback / transValue) : 0;
                let defaultRafCashback = 0;
                let defaultProfit = commission - (defaultCashback + defaultRafCashback);

                try {
                    const isPartnerEpi = await AffPartner.findOne({ epi }).select('epi').lean(); // 1. If partner epi throw error
                    if (isPartnerEpi) throw new Error(`Account ID ${accountId} belongs to partner: ${epi}`);
                    const isExistingAffApp = await AffApplication.findOne({ accountId }).select('accountId').lean(); // 2. If affapplication throw error
                    if (isExistingAffApp) throw new Error(`AffAccount exists for this account ID: ${accountId}`);

                    const existingAccount = await Account.findOne({ accountId }).select('accountId reports belongsTo'); // check if existing account
                    const existingApplication = await Application.findOne({ accountId }).select('accountId belongsTo email').lean(); // 
                    const existingReport = await Report.findOne({ 'account.accountId': accountId, month }).select('account.accountId belongsToActiveUser').lean();

                    if (existingAccount) {  // if account already exists in db 
                        if (!existingAccount.belongsTo && existingApplication && existingApplication.belongsTo) { // if existing account DOES NOT belong to an activeusuer and there is an existing application which HAS a belongsTo value
                            const updatedAccount = await Account.findByIdAndUpdate(existingAccount._id, 
                                { belongsTo: existingApplication.belongsTo, accountEmail: existingApplication.email }, 
                                { select: 'belongsTo accountEmail', new: true }
                            );
                            const activeUser = await ActiveUser.findByIdAndUpdate(updatedAccount.belongsTo, { $push: { accounts: updatedAccount } }, { select: 'accounts belongsTo', new: true })
                            
                            createUserNotification({ 
                                message: `Account ${updatedAccount.accountId} has been added to your dashboard and is now eligible`, 
                                type: 'Account', 
                                belongsTo: updatedAccount.belongsTo 
                            });
                            sendEmail({
                                templateId: 22, 
                                smtpParams: {
                                    BRAND: brand,
                                    ACCOUNTID: accountId 
                                }, 
                                tags: ['Account'], 
                                email: activeUser.email
                            })
                        } 
                        if (existingReport) { // [3-a] if existing Account and Report for the month = UPDATE IT
                            await Report.findByIdAndUpdate(existingReport._id, {
                                lastUpdate,
                                country,
                                account: {
                                    accountId,
                                    deposits,
                                    transValue,
                                    commission,
                                    cashback: defaultCashback,
                                    cashbackRate: defaultCashbackRate,
                                    commissionRate,
                                    rafCashback: defaultRafCashback,
                                    earnedFee,
                                    currency,
                                    profit: defaultProfit
                                }
                            }, { new: true })
                            if (!existingReport.belongsToActiveUser && existingApplication && existingApplication.belongsTo) { // if existing report DOES NOT belongsToActiveUser and there is an existing application which has belongsTo property
                                await Report.findByIdAndUpdate(existingReport._id, 
                                    { belongsToActiveUser: existingApplication.belongsTo }, 
                                    { select: 'belongsToActiveUser', new: true }
                                )
                            } 
                        } else {  // [3-b] if existing Account and if NO existing report for the month = CREATE IT
                            const newReport = await Report.create({
                                date,
                                month,
                                brand,
                                country,
                                account: {
                                    accountId,
                                    deposits,
                                    transValue,
                                    commission,
                                    cashback: defaultCashback,
                                    cashbackRate: defaultCashbackRate,
                                    commissionRate,
                                    rafCashback: defaultRafCashback,
                                    earnedFee,
                                    currency,
                                    profit: defaultProfit
                                },
                                belongsTo: existingAccount._id,
                                belongsToActiveUser: existingAccount.belongsTo
                            });
                            existingAccount.reports.push(newReport._id); // selected reports from line 139 as need to push it
                            await existingAccount.save(); // Push new report to reports array and sav
                        }
                    } else { // if account does not exist in db
                        // [4] if no existing account but valid existingApplication - create account and report
                        if (existingApplication && existingApplication.belongsTo) { // if existingApplication does exist in db and it belongs to an activeuser
                            const newAccount = await Account.create({ // create new account
                                accountId,
                                brand,
                                dateAdded,
                                belongsTo: existingApplication.belongsTo,
                                accountEmail: existingApplication.email
                            }); 
                            const newReport = await Report.create({
                                date,
                                month,
                                brand,
                                country,
                                account: {
                                    accountId,
                                    deposits,
                                    transValue,
                                    commission,
                                    cashback: defaultCashback,
                                    cashbackRate: defaultCashbackRate,
                                    commissionRate,
                                    rafCashback: defaultRafCashback,
                                    earnedFee,
                                    currency,
                                    profit: defaultProfit
                                },
                                belongsTo: newAccount._id,
                                belongsToActiveUser: newAccount.belongsTo
                            });
                            newAccount.reports.push(newReport); // Push new report to reports array
                            await newAccount.save(); //  and save it
                            await Application.findByIdAndUpdate(existingApplication._id, { status: 'Approved' }, { select: 'status', new: true });
                            await ActiveUser.findByIdAndUpdate(newAccount.belongsTo, { $push: { accounts: newAccount } }, { select: 'accounts', new: true });
                            // No need to createUserNotification or email as will be done with pre hooks
                        } else { // [5] if no Application and no account or report - create without belongsToActiveUser for this accountId
                            const newAccount = await Account.create({ // create new account
                                accountId,
                                brand,
                                dateAdded,                              
                            }); 
                            const newReport = await Report.create({
                                date,
                                month,
                                brand,
                                country,
                                account: {
                                    accountId,
                                    deposits,
                                    transValue,
                                    commission,
                                    cashback: defaultCashback,
                                    cashbackRate: defaultCashbackRate,
                                    commissionRate,
                                    rafCashback: defaultRafCashback,
                                    earnedFee,
                                    currency,
                                    profit: defaultProfit
                                },
                                belongsTo: newAccount._id,
                            });
                            newAccount.reports.push(newReport); // Push new report to reports array
                            await newAccount.save(); //  and save it
                        }
                    }
                } catch (error) {
                    // return error;
                    return error;
                };
            })() // which we have to call
        )
    });
};

// const createUpdateReport = ({ 
//     date,
//     month,
//     brand,
//     country,
//     accountId,
//     deposits,
//     transValue,
//     commission,
//     defaultCashback,
//     defaultCashbackRate,
//     commissionRate,
//     defaultRafCashback,
//     earnedFee,
//     currency,
//     defaultProfit,
//     newAccount   
// }) => {
//     return new Promise(resolve => resolve(
//         (async() => {
//             await Report.create({
//                 date,
//                 month,
//                 brand,
//                 country,
//                 account: {
//                     accountId,
//                     deposits,
//                     transValue,
//                     commission,
//                     cashback: defaultCashback,
//                     cashbackRate: defaultCashbackRate,
//                     commissionRate,
//                     rafCashback: defaultRafCashback,
//                     earnedFee,
//                     currency,
//                     profit: defaultProfit
//                 },
//                 belongsTo: newAccount._id,
//                 belongsToActiveUser: newAccount.belongsToActiveUser
//             });
//         })()
//     ))
// }

module.exports = {
    actDataReducer
}
