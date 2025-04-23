'use strict'

const express = require('express')
const router = express.Router()

router.use('/v1/api', require('./access'))
// router.get('/', (req, res, next) => {
//     const strCompress = 'Hello'
//     return res.status(200).json({
//         message: 'Welcome!!',
//         // metadata: strCompress.repeat(10000)
//     })
// })

module.exports = router