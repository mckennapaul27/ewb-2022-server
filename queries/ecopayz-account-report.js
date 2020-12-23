const fs = require('fs');
const path = require('path');
const csv = require('csv-parser')

const { getToken } = require('../utils/token.utils');
const { affDataReducer } = require('./map-aff-accounts-reports');
const { actDataReducer } = require('./map-act-accounts-reports');

const uploadAffReports = (req, res) => {
    const token = getToken(req.headers);
    if (token) {
        const { month, date } = req.query;
        let transactionFile = req.files.file;
        let fileName = path.join(__dirname, '../csv/ecopayz-partner-reports.csv');
        transactionFile.mv(fileName, function (err) {
            if (err) return res.status(500).send(err);
            let reportData = [];
            const requiredHeaders = ['Tracking Code Name', 'Client Account Number', 'Trx Amt Prog Cur', "Affiliate's Fee", 'Country'];
            let inputStream = fs.createReadStream(fileName);
            inputStream.pipe(csv({ 
                mapHeaders: ({ header, index }) => {
                if (requiredHeaders.includes(header)) {
                    return header.replace("\'", '').split(' ').join('').toLowerCase() 
                } else return null; } // returning null removes colum from sheet
            }))
            .on('data', data => reportData.push(data))
            .on('end', () => {
                try {
                    mapRawData(reportData, month, date);
                    return res.status(201).send({ msg: 'Successfully uploaded reports' })
                } catch (error) {
                    return res.status(400).send({ msg: 'Error whilst uploading reports' })
                }
            })  
        });        
    } else return res.status(403).send({ msg: 'Unauthorised' });
};

const mapRawData = async (data, month, date) => {
    const results = data.reduce((acc, item) => {

        const inValidEpi = ['couponarbitrage', 'ewb'];
        const epi = inValidEpi.includes(item.trackingcodename) ? 0 : Number(item.trackingcodename);
        const accountId = Number(item.clientaccountnumber);
        const country = item.country;
        const transValue = Number((item.trxamtprogcur).replace(',', ''));
        const commission = Number((item.affiliatesfee).replace(',', ''));
        const earnedFee = Number((item.affiliatesfee).replace(',', '') * 3.076923);

        let obj = {
            epi,
            accountId,
            country,
            transValue,
            commission,
            earnedFee
        };
        if (!acc.some(a => a.accountId === accountId)) { acc.push(obj); return acc; }
        else if (acc.some(b => b.accountId === accountId)) {
            acc = acc.map(c => {
                if (c.accountId === accountId) {
                    c.transValue += transValue;
                    c.commission += commission;
                    c.earnedFee += earnedFee;
                    return c;
                } else return c;
            })
            return acc;
        } else return acc;
    }, []);
    actDataReducer(results, brand = 'ecoPayz', month, date);
    affDataReducer(results, brand = 'ecoPayz', month, date);
};


module.exports = {
    uploadAffReports
}