const express = require('express')
const router = express.Router()

const authRouter = require('./auth.router')
const userRouter = require('./user.router')
const supportRouter = require('./support.router')

router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/support', supportRouter)

module.exports = router
