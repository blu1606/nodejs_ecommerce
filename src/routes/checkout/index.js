'use strict'

const express = require('express')
const router = express.Router()
const checkoutController = require('../../controllers/checkout.controller')
const asyncHandler = require('../../helpers/asyncHandler')

router.post('/review', asyncHandler(checkoutController.checkoutReview))

module.exports = router
