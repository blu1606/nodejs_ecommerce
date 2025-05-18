'use strict'

const cart = require('../cart.model')
const { convertToObjectIdMongodb } = require('../../utils')
const { getProductById } = require('./product.repo')

const findCartById = async(cartId) => {
    return await cart.findOne({ _id: convertToObjectIdMongodb(cartId), cart_state: 'active'}).lean()

}

const checkProductByServer = async (products) => {
    return await Promise.all( products.map( async product => {
        const foundProduct = await getProductById(product.productId)
        if (foundProduct) {
            return {
                price: foundProduct.product_price,
                quantity: product.quantity,
                productId: product.productId
            }
        }
    }))
}

module.exports = {
    findCartById,
    checkProductByServer
}