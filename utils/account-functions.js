const {
    AffPartner,
    AffReport,
    AffAccount,
} = require('../models/affiliate/index');
const {
    ActiveUser,
    Account,
    Report,
} = require('../models/personal/index');

let dayjs = require('dayjs');
let advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const createAccountReport = ({ accountId, brand, belongsTo }) => {
    return new Promise (resolve => { // have to return a promise to be able to await it. E.G  await createAccountReport ({ accountId, brand, belongsTo });
        resolve (
            (async () => {
                const existingAccount = await Account.findOne({ accountId }).select('accountId'); // select accounts
                if (!existingAccount) {
                    const newAccount = await Account.create({ brand, accountId, belongsTo }); // calls .pre('save') middleware here [1]
                    const newReport = await Report.create({ 
                        date: Number(dayjs().startOf('month').format('x')),
                        month: dayjs().format('MMMM YYYY'),
                        brand, 
                        belongsTo: newAccount._id,
                        belongsToActiveUser: newAccount.belongsTo,
                        'account.accountId': accountId,
                        'account.deposits': 0,
                        'account.transValue': 0,
                        'account.commission': 0,
                        'account.commissionRate': 0,
                        'account.earnedFee': 0,
                        'account.cashbackRate': 0,
                    });
                    newAccount.reports.push(newReport); // Push new report to reports array
                    await newAccount.save(); // calls .pre('save') middleware here again [2]
                    await ActiveUser.findByIdAndUpdate(newAccount.belongsTo, { $push: { accounts: newAccount } }, { select: 'accounts', new: true }); 
                } else return;
            })()
        )
    })
};

const createAffAccAffReport = ({ accountId, brand, belongsTo }) => {
    return new Promise (resolve => { // have to return a promise to be able to await it. E.G  await createAffAccAffReport ({ accountId, brand, belongsTo });
        resolve (
            (async () => {
                const existingAccount = await AffAccount.findOne({ accountId }).select('accountId'); // select accounts
                if (!existingAccount) {
                    const newAccount = await AffAccount.create({ brand, accountId, belongsTo }); // calls .pre('save') middleware here [1]
                    const newReport = await AffReport.create({ 
                        date: Number(dayjs().startOf('month').format('x')),
                        month: dayjs().format('MMMM YYYY'),
                        brand, 
                        belongsTo: newAccount._id,
                        belongsToPartner: newAccount.belongsTo,
                        'account.accountId': accountId,
                        'account.deposits': 0,
                        'account.transValue': 0,
                        'account.commission': 0,
                        'account.commissionRate': 0,
                        'account.earnedFee': 0,
                        'account.cashbackRate': 0,
                    });
                    newAccount.reports.push(newReport); // Push new report to reports array
                    await newAccount.save(); // calls .pre('save') middleware here again [2]
                    await AffPartner.findByIdAndUpdate(newAccount.belongsTo, { $push: { accounts: newAccount } }, { select: 'accounts', new: true }); 
                } else return;
            })()
        )
    })
};

module.exports = {
    createAccountReport,
    createAffAccAffReport
}