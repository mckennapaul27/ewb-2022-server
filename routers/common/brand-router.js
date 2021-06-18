const express = require('express')
const router = express.Router()
const passport = require('passport')
require('../../auth/passport')(passport)
const { getToken } = require('../../utils/token.utils')
const { Brand } = require('../../models/common/index')

// /common/brand/fetch-brand
router.post('/fetch-brand', async (req, res) => {
    const { brand } = req.body
    try {
        const b = await Brand.findOne({ brand })
        return res.status(200).send(b)
    } catch (error) {
        return res.status(400).send({ success: false })
    }
})

// /common/brand/update-brand
router.post(
    '/update-brand',
    passport.authenticate('admin', {
        session: false,
    }),
    async (req, res) => {
        const token = getToken(req.headers)
        if (token) {
            const {
                brand,
                branding,
                initialUpgrade,
                benefits,
                terms,
                link,
                infoLink,
            } = req.body
            try {
                await Brand.bulkWrite([
                    {
                        updateOne: {
                            filter: { brand },
                            update: {
                                $set: {
                                    brand,
                                    branding,
                                    initialUpgrade,
                                    benefits,
                                    terms,
                                    link,
                                    infoLink,
                                },
                            },
                            upsert: true, // upsert must be placed within updateOne object or every object that is traversed through / https://stackoverflow.com/questions/39988848/trying-to-do-a-bulk-upsert-with-mongoose-whats-the-cleanest-way-to-do-this
                        },
                    },
                ])
                const updatedBrand = await Brand.findOne({ brand })
                return res.status(200).send(updatedBrand)
            } catch (error) {
                return res.status(400).send({ success: false })
            }
        } else return res.status(403).send({ msg: 'Unauthorised' })
    }
)

module.exports = router
