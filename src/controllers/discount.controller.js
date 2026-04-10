'use strict'

const { SuccessResponse } = require('../core/success.response')
const DiscountService = require('../services/discount.service')

class DiscountController {

    createDiscountCode = async (req, res, next) => {
        new SuccessResponse ({
            message: 'Successful Code Generations',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getAllDiscountCode = async (req, res, next) => {
        new SuccessResponse ({
            message: 'Successful Code Found',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse ({
            message: 'Successful Code Found',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body
            })
        }).send(res)
    }

    getAllDiscountCodesWithProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Code Found',
            metadata: await DiscountService.getAllDiscountCodesWithProduct({
                ...req.query
            })
        }).send(res)
    }

    deleteDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Code Deleted',
            metadata: await DiscountService.deleteDiscountCode({
                shopId: req.user.userId,
                codeId: req.params.codeId
            })
        }).send(res)
    }

    cancelDiscountCode = async (req, res, next) => {
        new SuccessResponse({
            message: 'Successful Code Canceled',
            metadata: await DiscountService.cancelDiscountCode({
                ...req.body,
                userId: req.user.userId
            })
        }).send(res)
    }

}

module.exports = new DiscountController