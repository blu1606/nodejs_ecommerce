'use strict'
const { BadRequestError, NotFoundError } = require("../core/error.response")
const cart = require('../models/cart.model')
const { getProductById } = require("../models/repository/product.repo")
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
        const { productId, product_name, product_price, quantity } = product
        const foundProduct = await getProductById(productId)
        
        if (product_name && foundProduct.product_name !== product_name) {
            throw new BadRequestError(`Product name ${product_name} not equal to ${foundProduct.product_name}`)
        }

        if (product_price && foundProduct.product_price !== product_price) {
            throw new BadRequestError(`Product price ${product_price} not equal to ${foundProduct.product_price}`)
        }

        const productDataForCart = {
            productId: productId, 
            name: foundProduct.product_name,
            price: foundProduct.product_price,
            quantity: quantity
        };

        // neu co gio hang nhung chua co san pham
        if (!userCart.cart_products.length) {
            userCart.cart_products = [productDataForCart]
            return await userCart.save()
        }

        // gio hang ton tai, va co san pham nay thi update quantity
        return await CartService.updateUserCartQuantity({ userId, product: productDataForCart })
    }

    // update
    /*
        shop_order_ids: [
            {
                shopId, 
                item_products: [
                    {
                        quantity,
                        price,
                        shopId, 
                        old_quantity:,
                        productId,
                    }
                ],
                version
            }
        ]
    */
    static async addToCartV2({ userId, shop_order_ids = {} }) {
        const { productId, quantity, old_quantity } = shop_order_ids[0]?.item_products[0]

        // check product
        const foundProduct = await getProductById(productId)
        if (!foundProduct) throw new NotFoundError(`Product not exist`)
        
        // compare whether foundProduct equal shopId
        if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId) 
            throw new NotFoundError('Product do not belong to the shop')

        if (quantity === 0) {
            // deleted
        }

        return await CartService.updateUserCartQuantity({
            userId, 
            product: {
                productId, 
                quantity: quantity - old_quantity
            }
        })
    }

    static async deleteUserCartItem({ userId, productId }) {
        const query = { cart_userId : userId, cart_state : 'active'},
        updateSet = {
            $pull: {
                cart_products: {
                    productId
                }
            }
        }

        const deleteCart = await cart.updateOne( query, updateSet )

        return deleteCart
    }

    static async getListUserCart ({ userId}) {
        return await cart.findOne({
            cart_userId: +userId
        }).lean()
    }
}

module.exports = CartService