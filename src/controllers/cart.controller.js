'use strict'

const { SuccessResponse } = require('../core/success.response')
const CartService = require('../services/cart.service')

class CartController {

    /**
     * @desc add to cart for user
     * @param {int} userId
     * @param {*} res 
     * @param {*} next 
     * @method POST
     * @url /v1/api/cart/user
     * @return {
     * }
     */
    addToCart = async (req, res, next) => {
        new SuccessResponse ({
            message: "Add to cart success!",
            metadata: await CartService.addToCart( req.body )
        }).send(res)
    }

    // update + - 
    update = async (req, res, next) => {
        new SuccessResponse ({
            message: "Update cart success!",
            metadata: await CartService.addToCartV2( req.body )
        }).send(res)
    }

    // delete
    delete = async (req, res, next) => {
        new SuccessResponse ({
            message: "delete cart success!",
            metadata: await CartService.deleteUserCartItem( req.body )
        }).send(res)
    }

    // list to cart
    listToCart = async (req, res, next) => {
        new SuccessResponse ({
            message: "List cart success!",
            metadata: await CartService.getListUserCart( req.query )
        }).send(res)
    }
}

module.exports = new CartController