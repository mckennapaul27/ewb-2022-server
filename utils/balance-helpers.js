const { Report, SubReport, Payment, ActiveUser } = require('../models/personal');
const { AffReport, AffSubReport, AffPayment, AffPartner } = require('../models/affiliate/index');
const mongoose = require('mongoose');

const updatePersonalBalance = ({ _id }) => {
    return new Promise(resolve => {
        resolve (
            (async () => {
                try {
                    const reports = await Report.aggregate([
                        { $match: { $and: [ { belongsToActiveUser: mongoose.Types.ObjectId(_id) }, { 'account.transValue': { $gt: 0 } } ] } }, // only search if transValue > 0
                        { $project: { 'account.cashback': 1, 'account.commission': 1, 'account.currency': 1 } }, // selected values to return 1 = true, 0 = false
                        { $group: { // https://docs.mongodb.com/manual/reference/operator/aggregation/group/
                            '_id': {
                                currency: '$account.currency'
                            },
                            cashback: { $sum: '$account.cashback' },
                            commission: { $sum: '$account.commission' }
                        }},
                    ]);
                    const subReports = await SubReport.aggregate([
                        { $match: { $and: [ { belongsTo: mongoose.Types.ObjectId(_id) } ] } },
                        { $project: { 'rafCommission': 1, 'currency': 1 } }, // selected values to return 1 = true, 0 = false
                        { $group: { // https://docs.mongodb.com/manual/reference/operator/aggregation/group/
                            '_id': {
                                currency: '$currency'
                            },
                            total: { $sum: '$rafCommission' }
                        }},
                    ]);
                    const payments = await Payment.aggregate([
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
                    const commission = reports.reduce((acc, item) => (acc[item._id.currency] += item.commission, acc), { USD: 0, EUR: 0 });
                    const cashback = reports.reduce((acc, item) => (acc[item._id.currency] += item.cashback, acc), { USD: 0, EUR: 0 });
                    const rafCommission = subReports.reduce((acc, item) => (acc[item._id.currency] += item.total, acc), { USD: 0, EUR: 0 });
                    const paid = payments.reduce((acc, item) => item._id.status === 'Paid' ? (acc[item._id.currency] += item.total, acc) : acc, { USD: 0, EUR: 0 });
                    const requested = payments.reduce((acc, item) => item._id.status === 'Requested' ? (acc[item._id.currency] += item.total, acc) : acc, { USD: 0, EUR: 0 });
                    let balance = {
                        USD: (cashback['USD'] + rafCommission['USD']) - (paid['USD'] + requested['USD']),
                        EUR: (cashback['EUR'] + rafCommission['EUR']) - (paid['EUR'] + requested['EUR']),
                    };

                    await ['USD', 'EUR'].reduce(async (acc, currency) => {
                        await acc;

                        const activeUser = await ActiveUser.findByIdAndUpdate(_id, { 
                            'stats.balance.$[el].amount': balance[currency],
                            'stats.commission.$[el].amount': commission[currency], 
                            'stats.cashback.$[el].amount': cashback[currency],
                            'stats.payments.$[el].amount': paid[currency], 
                            'stats.requested.$[el].amount': requested[currency], 
                            'stats.raf.$[el].amount': rafCommission[currency] 
                        }, {
                            new: true,
                            arrayFilters: [{ 'el.currency': currency }],
                            select: 'stats'
                        });
                        return new Promise(resolve => resolve(activeUser)); // this is important bit - we return a promise that resolves to another promise
                    }, Promise.resolve());   
                } catch (error) {
                    console.log(error);
                }
            })()
        )
    })
};

const updateAffiliateBalance = ({ _id }) => {
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
                        'stats.subCommission.$[el].amount': subCommission[currency] // Currently the affpartners we have in local db does not include subCommission in stats array - for this reason it may fail. When we load data from old site, we need to make sure every partner has stats.subCommission in their balance array
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
}

module.exports = {
    updatePersonalBalance,
    updateAffiliateBalance
}


