'use strict'

const { Types } = require('mongoose')
const keytokenModel = require("../keytoken.model")

const createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
    try {
        const filter = { user: userId }, update = {
            publicKey, privateKey, refreshTokenUsed: [], refreshToken
        }, options = { upsert: true, new: true }

        const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

        return tokens ? tokens.publicKey : null
    } catch (error) {
        return error
    }
}

const findByUserId = async (userId) => {
    return await keytokenModel.findOne({ user: new Types.ObjectId(userId) })
}

const removeKeyById = async (id) => {
    return await keytokenModel.deleteOne(id)
}

const findByRefreshTokenUsed = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshTokenUsed: refreshToken })
}

const findByRefreshToken = async (refreshToken) => {
    return await keytokenModel.findOne({ refreshToken })
}

const deleteKeyById = async (userId) => {
    return await keytokenModel.findByIdAndDelete({ user: userId })
}

const updateRefreshTokenById = async ({ id, refreshToken, tokens }) => {
    return await keytokenModel.updateOne({ _id: id }, {
        $set: {
            refreshToken: tokens.refreshToken
        },
        $addToSet: {
            refreshTokensUsed: refreshToken // da dung de lay token moi
        }
    })
}

module.exports = {
    createKeyToken,
    findByUserId,
    removeKeyById,
    findByRefreshTokenUsed,
    findByRefreshToken,
    deleteKeyById,
    updateRefreshTokenById
}