'use strict'

const cart = require('../cart.model')
const { convertToObjectIdMongodb } = require('../../utils')
const { getProductById } = require('./product.repo')

const findCartById = async (cartId) => {
    return await cart.findOne({ _id: convertToObjectIdMongodb(cartId), cart_state: 'active' }).lean()

}

const findCartByUserId = async (userId) => {
    return await cart.findOne({ cart_userId: userId, cart_state: 'active' })
}

const checkProductByServer = async (products) => {
    return await Promise.all(products.map(async product => {
        const foundProduct = await getProductById(product.productId)
        if (foundProduct) {
            return {
                price: foundProduct.product_price,
                quantity: product.quantity,
                productId: product.productId
            }
        }
        return null
    }))
}

const createUserCart = async ({ userId, product }) => {
    const query = { cart_userId: userId, cart_state: 'active' },
        updateOrInsert = {
            $addToSet: {
                cart_products: product
            }
        }, options = { new: true }

    return await cart.findOneAndUpdate(query, updateOrInsert, options)
}

const updateUserCartQuantity = async ({ userId, product }) => {
    const { productId, quantity } = product
    const query = {
        cart_userId: userId,
        'cart_products.productId': productId,
        cart_state: 'active'
    }, updateSet = {
        $inc: {
            'cart_products.$.quantity': quantity
        }
    }, options = { upsert: true, new: true }

    return await cart.findOneAndUpdate(query, updateSet, options)
}

const deleteItemInCart = async ({ userId, productId }) => {
    const query = { cart_userId: userId, cart_state: 'active' },
        updateSet = {
            $pull: {
                cart_products: {
                    productId
                }
            }
        }

    return await cart.updateOne(query, updateSet)
}

const deleteItemsInCart = async ({ userId, productIds = [] }) => {
    const query = { cart_userId: userId, cart_state: 'active' },
        updateSet = {
            $pull: {
                cart_products: {
                    productId: { $in: productIds }
                }
            }
        }

    return await cart.updateOne(query, updateSet)
}

module.exports = {
    findCartById,
    checkProductByServer,
    createUserCart,
    updateUserCartQuantity,
    deleteItemInCart,
    findCartByUserId,
    deleteItemsInCart
}