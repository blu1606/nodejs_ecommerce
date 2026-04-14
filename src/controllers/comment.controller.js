'use strict'

const { SuccessResponse } = require("../core/success.response")
const CommentService = require("../services/comment.service")

class CommentController {
    createComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'create new comment',
            metadata: await CommentService.createComment({
                ...req.body,
                userId: req.user.userId
            })
        }).send(res)
    }

    getCommentByParentId = async (req, res, next) => {
        new SuccessResponse({
            message: 'get comment by parent id',
            metadata: await CommentService.getCommentsByParentId({ ...req.query })
        }).send(res)
    }


}

module.exports = new CommentController() 