const proxy = process.env.QUOTAGUARDSTATIC_URL;
const util = require('util');

const request = require('superagent');
require('superagent-proxy')(request);

const parseString = require('xml2js').parseString;
const parseStringPromise = util.promisify(parseString);

const dayjs = require('dayjs');
const advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);
const { formatEpi } = require('../utils/helper-functions');

const {
    AffPartner,
    AffReportDaily
} = require('../models/affiliate/index');

const fetchACIDReport = ({ brand, url }) => {   
    console.log('here: ', brand, url); 
    (async () => {
        try {
            const res = await request.get(url).proxy(proxy);
            checkData(res.text, brand, url);
        } catch (err) {
           return err;
        }
    })();
};

const checkData = async (res, brand, url) => {
    try {
        const reports = await parseStringPromise(res);
        if (!reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['reportresponse']) {
            if (reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['SOAP-ENV:Fault'][0].faultstring[0] === 'no permission 1' || reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['SOAP-ENV:Fault'][0].faultstring[0] === 'no permission 2') {
                throw new Error('Permission denied')
            } else throw new Error('No reports'); 
        };
        const data = reports['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0].reportresponse[0].row
        return mapRawData(data, brand);
    } catch (err) {
        if (err.message === 'Permission denied') setTimeout(() => {
            fetchACIDReport ({ brand, url }); // need to add fetchData parameters
        }, 500);
    };
};

const mapRawData = async (data, brand) => {
    let results = await data.reduce(async (previousPromise, item) => {
        const acc = await previousPromise;
        const epi = item.affcustomid[0] === '' ? null : formatEpi(item.affcustomid[0]);
        if (epi) {
            const partner = await AffPartner.findOne({ epi }).select('_id');
            if (partner) {
                acc.push({
                    epi,
                    date: Number(dayjs().subtract(1, 'days').format('x')),
                    period: dayjs().subtract(1, 'days').format('DD/MM/YYYY'),
                    clicks: Number(item.clicks[0]),
                    registrations: Number(item.downloads[0]),
                    deposits: Number(item.Deposits[0]),
                    transValue: Number(item.trans_value[0]),
                    commission: Number(item.Commission[0]),
                    brand,
                    belongsTo: partner._id
                });
                return acc;
            } else return acc;
        } else return acc;
    }, Promise.resolve([]))
    results = results.filter(a => (a.clicks > 0 || a.registrations > 0 || a.transValue > 0 || a.commission > 0)); // filter out reports with no data
    return updateDailyStats(results);
};

const updateDailyStats = async (reports) => {
    await reports.reduce(async (previousPromise, report) => {
        const acc = await previousPromise;
        const { 
            epi, 
            date,
            period,
            clicks,
            registrations,
            deposits,
            transValue,
            commission,
            brand,
            belongsTo
        } = report;
        await AffReportDaily.bulkWrite([{
            updateOne: {
                filter: { epi, period, brand },
                update: {
                    $set: {
                        epi, 
                        date,
                        period,
                        clicks,
                        registrations,
                        deposits,
                        transValue,
                        commission,
                        brand,
                        belongsTo
                    }
                },
                upsert: true // upsert must be placed within updateOne object or every object that is traversed through / https://stackoverflow.com/questions/39988848/trying-to-do-a-bulk-upsert-with-mongoose-whats-the-cleanest-way-to-do-this
            }
        }])
        return acc;
    }, Promise.resolve())
};

module.exports = {
    fetchACIDReport
}


// https://stackoverflow.com/questions/31978347/fs-writefile-in-a-promise-asynchronous-synchronous-stuff