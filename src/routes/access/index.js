'use strict'

const express = require('express')
const router = express.Router()
const accessController = require('../../controllers/access.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')

// sign up
router.post('/shop/signup', asyncHandler(accessController.signUp))

// login
router.post('/shop/login', asyncHandler(accessController.login))

// authenticattion 
router.use(authentication)

// logout
router.post('/shop/logout', asyncHandler(accessController.logout))
module.exports = router