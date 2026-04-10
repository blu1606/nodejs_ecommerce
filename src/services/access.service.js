'use strict'
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { createKeyToken,
    removeKeyById,
    findByRefreshTokenUsed,
    findByRefreshToken,
    deleteKeyById,
    updateRefreshTokenById } = require('../models/repository/keytoken.repo')
const { createTokenPair, verifyJWT } = require('../auth/authUtils')
const { getInfoData } = require('../utils/index')
const { BadRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response')
const { findByEmail, createShop } = require('../models/repository/shop.repo')

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

class AccessService {

    /**
     * Handles token rotation with replay attack detection 
     * @param {Object} params
     * @param {Object} params.keyStore - Token document attached by auth middleware
     * @param {Object} params.user {{userId: string, email: string}} - user from request
     * @param {string} params.refreshToken - refreshToken from request
     * @returns {Object} new tokens { accessToken, refreshToken } and user
     * @throws {ForbiddenError} If refresh token was already used (replay attack detected) 
     * @throws {AuthFailureError} if refreshToken from keyStore dont match with refreshToken from current session in req
     * @throws {AuthFailureError} if didnt find any shop by email 
     */
    static handlerRefreshToken = async ({ keyStore, user, refreshToken }) => {
        const { userId, email } = user;

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await deleteKeyById(userId)
            throw new ForbiddenError('Something wrong happend!! Please re-login')
        }

        if (keyStore.refreshToken !== refreshToken) throw new AuthFailureError(' Shop not registered!!')

        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new AuthFailureError(' Shop not registered!!')

        const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey)

        await updateRefreshTokenById({
            id: keyStore._id,
            refreshToken,
            tokens
        })

        return { user, tokens }
    }

    /**
     * Logout user
     * @param {Object} keyStore - Token document attached by auth middleware
     * @returns {{acknowledged: boolean, deletedCount: number}} MongoDB deletion result
     */
    static logout = async (keyStore) => {
        const delKey = await removeKeyById(keyStore._id)
        console.log({ delKey })
        return delKey
    }


    /**
     * Generates cryptographic key pair and creates authentication tokens
     * @param {{_id: string, email: string}} shop - Mongoose shop document 
     * @returns {{accessToken: String, refreshToken: String}}
     * @throws {BadRequestError} If createKeyToken errors return nulls
     * @access private
     */
    static _handleTokenAndKey = async (shop) => {
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        const tokens = await createTokenPair({ userId: shop._id, email: shop.email }, publicKey, privateKey)
        const keyStore = await createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, publicKey,
            userId: shop._id
        })
        if (!keyStore) throw new BadRequestError('Error: keyStore error!')

        return tokens
    }

    /**
     * Handle login user and create new tokens pair for user
     * @param {Object} params
     * @param {string} params.email - User's email
     * @param {string} params.password - User's password
     * @returns {{shop: Object, tokens: Object}} Shop info and auth tokens
     * @throws {BadRequestError} If didnt find shop via user's email
     * @throws {AuthFailureError} If password decrypt not match with one in the dbs
     */
    static login = async ({ email, password }) => {

        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new BadRequestError('Error: Shop not registered!')

        const matchPassword = await bcrypt.compare(password, foundShop.password)
        if (!matchPassword) throw new AuthFailureError('Error: Auth Failure!')

        const tokens = await this._handleTokenAndKey(foundShop)

        return {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
            tokens
        }
    }

    /**
    * Register a new shop account
    * @param {Object} params
    * @param {string} params.name - Shop display name
    * @param {string} params.email - Shop email (must be unique)
    * @param {string} params.password - Plain-text password (will be hashed)
    * @returns {{shop: Object, tokens: Object}} Created shop info and auth tokens
    * @throws {BadRequestError} If email already registered
    * @throws {BadRequestError} If shop creation fails
    */
    static signUp = async ({ name, email, password }) => {

        const holderShop = await findByEmail({ email })
        if (holderShop) throw new BadRequestError('Error: Shop already registered!')

        const passwordHash = await bcrypt.hash(password, 10)

        const newShop = await createShop({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })
        if (!newShop) throw new BadRequestError('Error: Create shop failed!')

        const tokens = await this._handleTokenAndKey(newShop)
        return {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
            tokens
        }
    }
}

module.exports = AccessService