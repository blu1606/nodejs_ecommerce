'use strict'

const { NotFoundError } = require('../core/error.response')
const Comment = require('../models/comment.model')
const { findMaxRightValue, updateRightNode, updateLeftNode, getChildComments, getRootComments, deleteCommentsWithRange, updateCommentsRight, updateCommentsLeft, findCommentById } = require('../models/repository/comment.repo')
const { findProduct } = require('../models/repository/product.repo')
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
                const parentComment = await findCommentById(parentCommentId, session)
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
            const parent = await findCommentById(sanitizedParentId)
            if (!parent) throw new NotFoundError('Not found comment for product')

            return await getChildComments({ parent, productId, limit, offset })
        }

        return await getRootComments({ sanitizedParentId, productId, limit, offset })
    }

    static async deleteComments({ commentId, productId }) {
        // check if product exits
        const foundProduct = await findProduct({ product_id: productId })
        if (!foundProduct) throw new NotFoundError('Product not found')

        await withTransaction(async (session) => {
            // 1. determine left and right value of parent comment 
            const comment = await findCommentById(commentId, session)
            if (!comment) throw new NotFoundError('Comment not found')

            const leftValue = comment.comment_left
            const rightValue = comment.comment_right

            // 2. cal width
            const width = rightValue - leftValue + 1
            const comment_productId = convertToObjectIdMongodb(productId)
            await deleteCommentsWithRange({ comment_productId, leftValue, rightValue, session })
            await updateCommentsRight({ comment_productId, rightValue, width, session })
            await updateCommentsLeft({ comment_productId, rightValue, width, session })
            return true
        })
    }

}

module.exports = CommentService