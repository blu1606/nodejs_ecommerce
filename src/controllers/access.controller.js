'use strict'

const { OK, CREATED, SuccessResponse } = require('../core/success.response')
const AccessService = require('../services/access.service')
const keytokenModel = require('../models/keytoken.model') // Assuming this is the model for key tokens

class AccessController {

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