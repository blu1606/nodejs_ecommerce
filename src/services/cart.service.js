'use strict'
const { BadRequestError, NotFoundError } = require("../core/error.response")
const cart = require('../models/cart.model')
/*
    Key Features: Cart Service
    - add product to cart [User]
    - reduce product quantity by one [User]
    - increase product quantity by one [User]
    - get cart [User]
    - delete cart [User]
    - delete cart item [User]
*/

class CartService {

    /// START REPO CART///
    static async createUserCart({userId, product }) {
        const query = { cart_userId: userId, cart_state: 'active'}, 
        updateOrInsert = {
            $addToSet: {
                cart_products: product
            }
        }, options = { upsert: true, new: true}

        return await cart.findOneAndUpdate( query, updateOrInsert, options)
    }

    static async updateUserCartQuantity({userId, product }) {
        const { productId, quantity } = product
        const query = { 
            cart_userId: userId, 
            'cart_products.productId': productId,
            cart_state: 'active'
        }, updateSet = {
            $inc: {
                'cart_products.$.quantity': quantity
            }
        }, options = {upsert: true, new: true}

        return await cart.findOneAndUpdate( query, updateSet, options)
    }

    /// END REPO CART///
    static async addToCart ({ userId, product = {}}) {
        // check cart ton tai hay khong
        const userCart = await cart.findOne({ cart_userId: userId})
        if (!userCart) {
            // create cart for User

            return await CartService.createUserCart({ userId, product })
        }

        // neu co gio hang nhung chua co san pham
        if (!userCart.cart_products.length) {
            userCart.cart_products = [product]
            return await userCart.save()
        }

        // gio hang ton tai, va co san pham nay thi update quantity
        return await CartService.updateUserCartQuantity({ userId, product })
    }

    // 
}

module.exports = CartService