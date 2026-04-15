'use strict'

const Comment = require("../comment.model")
const { convertToObjectIdMongodb } = require('../../utils/index')

/**
 * Get the current maximum right value for a specific product.
 * Used to determine the starting point for root comments.
 * @param {string} productId - The product ID
 * @returns {Promise<Object|null>} - The document with the max comment_right or null
 */
const findMaxRightValue = async (productId, session = null) => {
    return await Comment.findOne({
        comment_productId: convertToObjectIdMongodb(productId)
    }, 'comment_right', {
        sort: { comment_right: -1 },
        session
    }).lean()
}

/**
 * Shift (increase by 2) the right coefficients of all nodes starting from a specific mark.
 * Used to "expand" the parent node's boundary or push sibling nodes to the right.
 * @param {string} productId 
 * @param {number} rightValue - The coordinate mack to start shifting from
 * @returns {Promise<Object>} - Mongoose update result
 */
const updateRightNode = async (productId, rightValue, session = null) => {
    const filter = {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_right: { $gte: rightValue }
    }
    const update = { $inc: { comment_right: 2 } }
    return await Comment.updateMany(filter, update, { session })
}

/**
 * Shift (increase by 2) the left coefficients of all nodes that are located after a specific mark.
 * Used to prevent coordinate overlapping when a new node is inserted into the tree.
 * @param {string} productId 
 * @param {number} rightValue 
 * @returns {Promise<Object>} - Mongoose update result
 */
const updateLeftNode = async (productId, rightValue, session = null) => {
    const filter = {
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gt: rightValue }
    }
    const update = { $inc: { comment_left: 2 } }
    return await Comment.updateMany(filter, update, { session })
}

const getChildComments = async ({ parent, productId, limit = 50, offset = 0 }) => {
    return await Comment.find({
        comment_productId: convertToObjectIdMongodb(productId),
        comment_left: { $gt: parent.comment_left },
        comment_right: { $lt: parent.comment_right }
    }).select({
        comment_left: 1, comment_right: 1, comment_content: 1, comment_parentId: 1
    }).sort({ comment_left: 1 })
        .skip(offset)
        .limit(limit)
        .lean()
}

const getRootComments = async ({ parentCommentId, productId, limit = 50, offset = 0 }) => {
    return await Comment.find({
        comment_productId: convertToObjectIdMongodb(productId),
        comment_parentId: parentCommentId ? convertToObjectIdMongodb(parentCommentId) : null
    }).select({
        comment_left: 1, comment_right: 1, comment_content: 1, comment_parentId: 1
    }).sort({ comment_left: 1 })
        .skip(offset)
        .limit(limit)
        .lean()
}

const findCommentById = async (commentId, session = null) => {
    return await Comment.findById(commentId).session(session).lean()
}

const deleteCommentsWithRange = async ({ comment_productId, leftValue, rightValue, session = null }) => {
    return await Comment.deleteMany({
        comment_productId: comment_productId,
        comment_left: { $gte: leftValue },
        comment_right: { $lte: rightValue }
    }, { session })
}
const updateCommentsRight = async ({ comment_productId, rightValue, width, session = null }) => {
    return await Comment.updateMany({
        comment_productId: comment_productId,
        comment_right: { $gt: rightValue }
    }, {
        $inc: { comment_right: -width }
    }, { session })
}
const updateCommentsLeft = async ({ comment_productId, rightValue, width, session = null }) => {
    return await Comment.updateMany({
        comment_productId: comment_productId,
        comment_left: { $gt: rightValue }
    }, {
        $inc: { comment_left: -width }
    }, { session })
}

module.exports = {
    findMaxRightValue,
    updateRightNode,
    updateLeftNode,
    getChildComments,
    getRootComments,
    deleteCommentsWithRange,
    updateCommentsLeft,
    updateCommentsRight,
    findCommentById
}
