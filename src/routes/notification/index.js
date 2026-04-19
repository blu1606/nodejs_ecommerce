'use strict'

const express = require('express')
const router = express.Router()
const NotificationController = require('../../controllers/notification.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

// not login user 

// authenticattion 
router.use(authenticationV2)

// login user
router.get('', asyncHandler(NotificationController.listNotiByUser))
module.exports = router