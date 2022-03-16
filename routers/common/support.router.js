const express = require('express')
const { serverErr } = require('../../utils/error-messages')
const { sendEmail } = require('../../utils/sib-helpers')
const {
    sibSupportSubmitted,
} = require('../../utils/sib-transactional-templates')
const { msgSupportSubmitted } = require('../../utils/success-messages')
const router = express.Router()

// /common/support/submit-ticket - THIS IS UP-TO-DATE 1/3/22
router.post('/submit-ticket', async (req, res) => {
    const { locale, name, email, subject, message } = req.body
    try {
        await sendEmail(
            sibSupportSubmitted({
                locale,
                email,
                smtpParams: {
                    NAME: name,
                    EMAIL: email,
                    SUBJECT: subject,
                    MESSAGE: message,
                },
            })
        )
        await sendEmail({
            templateId: 144,
            smtpParams: {
                NAME: name,
                EMAIL: email,
                SUBJECT: subject,
                MESSAGE: message,
            },
            tags: ['Admin'],
            email: 'support@volumekings.com', // need to change this as soft bouncing in SIB
        })
        return res.status(201).send(
            msgSupportSubmitted({
                locale,
            })
        )
    } catch (error) {
        return res.status(500).send(serverErr({ locale }))
    }
})

// /common/support/player-registration-postback
router.post('/player-registration-postback', (req, res) => {
    try {
        console.log('req.body >>>> ')
        console.log(req.body)
        console.log('req.body <<<< ')
        console.log('req.params >>>> ')
        console.log(req.params)
        console.log('req.params <<<< ')
        console.log('req.query >>>> ')
        console.log(req.query)
        console.log('req.query <<<< ')
        res.status(200).send({
            msg: 'Successfully posted data',
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: 'Error: Please contact support' })
    }
})

// /common/auth/validate-account-Id
// router.post('/validate-account-Id', validateAccountId)
// async function validateAccountId(req, res) {
//     const { accountId } = req.body
//     let existsOne = await Application.countDocuments({ accountId })
//         .select('accountId')
//         .lean() // check if application exists
//     let existsTwo = await AffApplication.countDocuments({ accountId })
//         .select('accountId')
//         .lean() // check if affapplication exists
//     if (existsOne > 0 || existsTwo > 0) {
//         return res.status(400).send(err7({ accountId, locale }))
//     } else return res.status(200)
// }
module.exports = router
