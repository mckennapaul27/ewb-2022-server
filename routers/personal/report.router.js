const express = require('express')
const router = express.Router()
const passport = require('passport')
require('../../auth/passport')(passport)
const { getToken } = require('../../utils/token.utils')
const { Report, SubReport } = require('../../models/personal/index')
const {
    mapRegexQueryFromObj,
    mapQueryForAggregate,
} = require('../../utils/helper-functions')

// /personal/report/fetch-reports - testing for react-table population
router.post(
    '/fetch-reports',
    passport.authenticate('jwt', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            let pageSize = parseInt(req.query.pageSize)
            let pageIndex = parseInt(req.query.pageIndex)
            let { sort, query } = req.body
            let skippage = pageSize * pageIndex // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table

            let aggregateQuery = mapQueryForAggregate(query) // have to create this for aggregation query because need to make it mongoose.Types.ObjectId
            query = mapRegexQueryFromObj(query) // turn react-table query into regex query

            const reports = await Report.find(query)
                .collation({ locale: 'en', strength: 1 })
                .sort(sort)
                .skip(skippage)
                .limit(pageSize) // data for pagination
            const pageCount = await Report.countDocuments(query) // total documents to create pageCount
            const brands = await Report.distinct('brand') // number of distinct brands in reports collection for select filter
            const months = await Report.distinct('month') // number of distinct brands in brands collection for select filter
            const totals = await Report.aggregate([
                { $match: { $and: [aggregateQuery] } },
                {
                    $group: {
                        _id: null,
                        cashback: { $sum: '$account.cashback' },
                        volume: { $sum: '$account.transValue' },
                        deposits: { $sum: '$account.deposits' },
                    },
                },
            ])
            return res.send({ reports, totals, pageCount, brands, months })
        } else res.status(403).send({ success: false, msg: 'Unauthorised' })
    }
)

// POST /personal/report/fetch-sub-reports
router.post(
    '/fetch-sub-reports',
    passport.authenticate('jwt', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            let pageSize = parseInt(req.query.pageSize)
            let pageIndex = parseInt(req.query.pageIndex)
            let { sort, query } = req.body
            let skippage = pageSize * pageIndex // with increments of one = 10 * 0 = 0 |  10 * 1 = 10 | 10 * 2 = 20; // skippage tells how many to skip over before starting - start / limit tells us how many to stoo at - end - This is also because pageIndex starts with 0 on table
            query = mapRegexQueryFromObj(query)
            let aggregateQuery = mapQueryForAggregate(query) // have to create this for aggregation query because need to make it mongoose.Types.ObjectId
            try {
                const reports = await SubReport.find(query)
                    .collation({ locale: 'en', strength: 1 })
                    .sort(sort)
                    .skip(skippage)
                    .limit(pageSize)
                const pageCount = await SubReport.countDocuments(query)
                const currencies = await SubReport.distinct('currency')
                const brands = await SubReport.distinct('brand')
                const months = await SubReport.distinct('month')
                const totals = await SubReport.aggregate([
                    { $match: { $and: [aggregateQuery] } },
                    {
                        $group: {
                            _id: {
                                currency: '$currency',
                            },
                            cashback: { $sum: '$cashback' },
                            volume: { $sum: '$transValue' },
                            deposits: { $sum: '$deposits' },
                            rafCommission: { $sum: '$rafCommission' },
                        },
                    },
                ])
                return res.status(200).send({
                    reports,
                    pageCount,
                    currencies,
                    brands,
                    months,
                    totals,
                })
            } catch (err) {
                return res.status(400).send(err)
            }
        } else res.status(403).send({ success: false, msg: 'Unauthorised' })
    }
)

module.exports = router

// useful links
// https://docs.mongodb.com/manual/reference/collation/
// https://stackoverflow.com/questions/14279924/mongoose-sort-alphabetically
