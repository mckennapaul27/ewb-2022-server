const proxy = process.env.QUOTAGUARDSTATIC_URL;
const util = require('util');

const request = require('superagent');
require('superagent-proxy')(request);

const parseString = require('xml2js').parseString;
const parseStringPromise = util.promisify(parseString);

const { CURRENT_MONTH_NET_ACCOUNT_REPORT, startOfMonthX } = require('./config')

const { formatEpi } = require('../utils/helper-functions');
const { dataReducer } = require('./map-accounts-reports');

const fetchAccountReport = (brand, month, date) => {
   
    // (async () => {
    //     // const a = await AffAccount.deleteMany({ 'accountId': { $exists: false } })
    //     // const b = await AffReport.deleteMany({ 'account.accountId': { $exists: false } })
    //     // const c = await AffApplication.deleteMany({ 'accountId': { $exists: false } })
    //     const a = await AffAccount.deleteMany()
    //     const b = await AffReport.deleteMany()
    //     const c = await AffApplication.deleteMany()
    //     console.log(a, b, c) 
    // })();
    (async () => {
        try {
            const res = await request.get(CURRENT_MONTH_NET_ACCOUNT_REPORT()).proxy(proxy);
            checkData(res.text, brand, month, date);
        } catch (err) {
           return err;
        }
    })();
};

const checkData = async (res, brand, month, date) => {
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
            fetchAccountReport (brand, month, date); // need to add fetchData parameters
        }, 500);
    };
};

const mapRawData = async (data, brand, month, date) => {
    const results = data.reduce((acc, item) => {
        acc.push({
            memberId: item.memberid[0],
            siteId: item.siteid[0],
            playerId: item.playerid[0],
            accountId: item.merchplayername[0],
            epi: item.affcustomid[0] === '' ? null : formatEpi(item.affcustomid[0]),
            country: item.playercountry[0] === '' ? '' : item.playercountry[0],
            commission: Number(item.Commission[0]),
            transValue: Number(item.Commission[0]) === 0 ? 0 : Number(item.trans_value[0]),
            deposits: Number(item.Deposits[0]),
            earnedFee: Number(item.Nettrans_to_fee[0])
        });
        return acc;
    }, []);
    return dataReducer(results, brand, month, date);
};

module.exports = {
    fetchAccountReport
}


// https://stackoverflow.com/questions/31978347/fs-writefile-in-a-promise-asynchronous-synchronous-stuff