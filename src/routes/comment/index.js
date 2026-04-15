'use strict'

const express = require('express')
const router = express.Router()
const CommentController = require('../../controllers/comment.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')

router.get('', asyncHandler(CommentController.getCommentByParentId))

// authenticattion 
router.use(authenticationV2)

router.post('', asyncHandler(CommentController.createComment))
router.delete('', asyncHandler(CommentController.deleteComment))

module.exports = router