'use strict'

const { OK, CREATED, SuccessResponse } = require('../core/success.response')
const AccessService = require('../services/access.service')
const keytokenModel = require('../models/keytoken.model') // Assuming this is the model for key tokens

class AccessController {

    handlerRefreshToken = async (req, res, next) => {
        // new SuccessResponse({
        //     message: 'Get token success',
        //     metadata: await AccessService.handlerRefreshToken( req.body.refreshToken )
        // }).send(res)

        // v2 fixed, no need accessToken
        new SuccessResponse({
            message: 'Get token success!',
            metadata: await AccessService.handlerRefreshTokenV2({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore
            })

        }).send(res)
    }

    logout = async (req, res, next) => {
        const delKey = await keytokenModel.deleteOne({ _id: req.keyStore._id })
        console.log({delKey})
        new SuccessResponse({
            message: 'Logout Success',
            metadata: delKey
        }).send(res)
    }

    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AccessService.login( req.body )
        }).send(res)
    }

    signUp = async ( req, res, next ) => {
        new CREATED({
            message: 'Regiserted OK!',
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10
            }
        }).send(res)
    }
}

module.exports = new AccessController