const proxy = process.env.QUOTAGUARDSTATIC_URL;
const util = require('util');

const request = require('superagent');
require('superagent-proxy')(request);

const parseString = require('xml2js').parseString;
const parseStringPromise = util.promisify(parseString);

const { setCurrency } = require('../config/deals');

const {
    AffAccount,
    AffReport,
    AffApplication,
    AffPartner
} = require('../models/affiliate/index');

const fetchPlayerRegistrationsReport = ({ brand, month, date, url }) => {  
    console.log('here: ', brand, month, date, url);
    (async () => {
        try {
            const res = await request.get(url).proxy(proxy);
            checkData(res.text, brand, month, date, url);
        } catch (err) {
           return err;
        }
    })();
};

const checkData = async (res, brand, month, date, url) => {
    try {
        const reports = await parseStringPromise(res);
        if (!reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['reportresponse']) {
            if (reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['SOAP-ENV:Fault'][0].faultstring[0] === 'no permission 1' || reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['SOAP-ENV:Fault'][0].faultstring[0] === 'no permission 2') {
                throw new Error('Permission denied')
            } else throw new Error('No reports'); 
        };
        const data = reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0].reportresponse[0].row
        return mapRawData(data, brand, month, date);
    } catch (err) {
        if (err.message === 'Permission denied') setTimeout(() => {
            fetchPlayerRegistrationsReport ({ brand, month, date, url }); // need to add fetchData parameters if it fails api fetch
        }, 500);
    };
};

const mapRawData = async (data, brand, month, date) => {
    const results = data.reduce((acc, item) => {
        acc.push({
            currency: setCurrency(brand),
            memberId: item.memberid[0],
            siteId: item.siteid[0],
            playerId: item.playerid[0],
            accountId: item.Merchplayername[0],
            epi: null,
            country: item.playercountry[0] === '' ? '' : item.playercountry[0],
            commission: 0,
            cashback: 0,
            transValue: 0,
            deposits: 0,
            subAffCommission: 0,
            earnedFee: 0,
            cashbackRate: 0,
            commissionRate: 0,
            profit: 0
        });
        return acc;
    }, []);
    return mapPlayerRegistrations(results, brand, month, date); // just follows same entry path as paysafe-account-report 
};

const mapPlayerRegistrations = async (results, brand, month, date) => {
    await results.map(async a => {
        const {
            currency,
            memberId,
            siteId,
            playerId,
            accountId,
            country,
            transValue,
            commission,
            deposits,
            cashback,
            subAffCommission,
            profit,
            earnedFee,
            cashbackRate,
            commissionRate
        } = a;
        console.log(siteId);
        const defaultSiteIds = ['75417', '75418', '40278', '56']; 
        try {
            const existingAccount = await AffAccount.exists({ accountId });
            const application = await AffApplication.findOne({ accountId }).select('accountId belongsTo').lean();
            if (!existingAccount && application) {  // if application for account ID exists and AffAccount does not exist
                const newAccount = await AffAccount.create({ // create new account
                    brand,
                    belongsTo: application.belongsTo,
                    accountId
                });
                const newReport = await AffReport.create({ // create new report
                    date,
                    month,
                    brand,
                    siteId,
                    memberId,
                    playerId,
                    country,
                    belongsTo: newAccount._id,
                    belongsToPartner: newAccount.belongsTo,
                    account: {
                        accountId,  
                        deposits,
                        transValue,
                        commission,
                        commissionRate, 
                        earnedFee,
                        currency, 
                        cashbackRate,
                        cashback,
                        subAffCommission,
                        profit
                    }
                });         
                newAccount.reports.push(newReport); // Push new report to reports array
                await newAccount.save(); //  and save it
                await AffApplication.findByIdAndUpdate(application._id, { siteId }); // update original application with siteId
                await AffPartner.findByIdAndUpdate(newAccount.belongsTo, { $push: { accounts: newAccount } }, { select: 'accounts', new: true });  // Put select into options // push new account to partner array of accounts
                // send emails and notifications
               
            } else if (!existingAccount && !application && !defaultSiteIds.includes(siteId)) { // if account does not exist and site is neither ['75417', '75418', '40278', '56'] defaults
                
                // db.inventory.find( { "instock": { $elemMatch: { qty: 5, warehouse: "A" } } } )

                const partner = await AffPartner.findOne({ brandAssets: { $elemMatch: { brand, siteId } } }).select('_id');
                // This works >> 'brandAssets.brand': brand, 'brandAssets.siteId': siteId }).select('_id');
                if (partner) {
                    const newAccount = await AffAccount.create({ // create new account
                        brand,
                        belongsTo: partner._id,
                        accountId
                    });
                    const newReport = await AffReport.create({ // create new report
                        date,
                        month,
                        brand,
                        siteId,
                        memberId,
                        playerId,
                        country,
                        belongsTo: newAccount._id,
                        belongsToPartner: newAccount.belongsTo,
                        account: {
                            accountId,  
                            deposits,
                            transValue,
                            commission,
                            commissionRate, 
                            earnedFee,
                            currency, 
                            cashbackRate,
                            cashback,
                            subAffCommission,
                            profit
                        }
                    }); 
                    newAccount.reports.push(newReport); // Push new report to reports array
                    await newAccount.save(); // and save it
                    await AffApplication.create({ brand, accountId, belongsTo: partner._id, siteId }); // Create new application with siteId
                    await AffPartner.findByIdAndUpdate(newAccount.belongsTo, { $push: { accounts: newAccount } }, { select: 'accounts', new: true });  // Put select into options // push new account to partner array of accounts
                    // send emails and notifications
                } else return;
            } else return;
        } catch (error) {
            return error;
        }
    })
}



module.exports = {
    fetchPlayerRegistrationsReport
}


// https://stackoverflow.com/questions/31978347/fs-writefile-in-a-promise-asynchronous-synchronous-stuff