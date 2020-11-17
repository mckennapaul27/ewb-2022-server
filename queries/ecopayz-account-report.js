const fs = require('fs');
const path = require('path');
const csv = require('csv-parser')

const { getToken } = require('../utils/token.utils');
const { dataReducer } = require('./map-accounts-reports');

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
        acc.push({
            epi: inValidEpi.includes(item.trackingcodename) ? 0 : Number(item.trackingcodename),
            accountId: Number(item.clientaccountnumber),
            country: item.country,
            transValue: Number((item.trxamtprogcur).replace(',', '')),
            commission: Number((item.affiliatesfee).replace(',', '')),
            earnedFee: Number((item.affiliatesfee).replace(',', '') * 3.076923)
        });
        return acc;
    }, []);
    return dataReducer(results, brand = 'ecoPayz', month, date);
};


module.exports = {
    uploadAffReports
}