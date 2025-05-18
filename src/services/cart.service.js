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
            // Ensure product data passed to createUserCart is structured correctly for cart_products
            const productDataForNewCart = {
                productId: product.productId,
                name: product.product_name, // Assuming product object has product_name
                price: product.product_price, // Assuming product object has product_price
                quantity: product.quantity,
                shopId: product.shopId // Ensure shopId is included if needed by your schema/logic
            };
            return await CartService.createUserCart({ userId, product: productDataForNewCart });
        }

        // Neu gio hang ton tai
        const { productId, quantity } = product;
        // It's better to fetch the canonical product details from the DB
        // instead of relying on potentially incomplete/incorrect details from the request body.
        const foundProductDetails = await getProductById(productId);
        if (!foundProductDetails) {
            throw new NotFoundError('Product not found');
        }

        const productDataForCart = {
            productId: productId, 
            name: foundProductDetails.product_name,
            price: foundProductDetails.product_price,
            quantity: quantity,
            shopId: foundProductDetails.product_shop.toString() // Assuming product_shop is the shopId
        };

        // Check if product already exists in cart
        const existingProductIndex = userCart.cart_products.findIndex(p => p.productId === productId);

        if (existingProductIndex > -1) {
            // Product exists, update quantity using updateUserCartQuantity
            // updateUserCartQuantity expects the quantity to be the increment amount
            // If productDataForCart.quantity is the new total quantity, adjust accordingly
            // For now, assuming productDataForCart.quantity is the amount to add
            return await CartService.updateUserCartQuantity({ 
                userId, 
                product: { 
                    productId: productId, 
                    quantity: productDataForCart.quantity // This should be the delta, not new total
                } 
            });
        } else {
            // Product does not exist, add to cart_products array
            userCart.cart_products.push(productDataForCart);
            userCart.cart_count_product = userCart.cart_products.length;
            return await userCart.save();
        }
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