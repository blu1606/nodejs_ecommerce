'use strict'

const { NotFoundError } = require('../core/error.response')
const Comment = require('../models/comment.model')
const { findMaxRightValue, updateRightNode, updateLeftNode, getChildComments, getRootComments } = require('../models/repository/comment.repo')
const { withTransaction, convertToObjectIdMongodb } = require('../utils')

/**
    key features: comment service
    - add comment [user, shop]
    - get a list of comments [user, shop]
    - delete a comment [user, shop, admin]
 */
class CommentService {

    static async createComment({
        productId, userId, content, parentCommentId = null
    }) {
        return await withTransaction(async (session) => {
            const comment = new Comment({
                comment_productId: productId,
                comment_userId: userId,
                comment_content: content,
                comment_parentId: parentCommentId
            })

            if (parentCommentId) {
                // Reply comment logic
                const parentComment = await Comment.findById(parentCommentId).session(session)
                if (!parentComment) throw new NotFoundError('Parent comment not found')
                await updateRightNode(productId, parentComment.comment_right, session)
                await updateLeftNode(productId, parentComment.comment_right, session)
                comment.comment_left = parentComment.comment_right
                comment.comment_right = parentComment.comment_right + 1
            } else {
                // Root comment logic
                const maxRightValue = await findMaxRightValue(productId, session)
                const rightValue = maxRightValue ? maxRightValue.comment_right + 1 : 1
                comment.comment_left = rightValue
                comment.comment_right = rightValue + 1
            }
            await comment.save({ session })
            return comment
        });
    }

    static async getCommentsByParentId({
        productId,
        parentCommentId = null,
        limit = 50,
        offset = 0 // skip
    }) {
        limit = parseInt(limit)
        offset = parseInt(offset)

        const sanitizedParentId = (parentCommentId === 'null' || !parentCommentId) ? null : parentCommentId;

        if (sanitizedParentId) {
            const parent = await Comment.findById(sanitizedParentId)
            if (!parent) throw new NotFoundError('Not found comment for product')

            return await getChildComments({ parent, productId, limit, offset })
        }

        return await getRootComments({ sanitizedParentId, productId, limit, offset })
    }
}

module.exports = CommentService