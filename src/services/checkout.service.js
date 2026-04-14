'use strict'

const { findCartById, checkProductByServer, deleteItemsInCart } = require("../models/repository/cart.repo")
const { BadRequestError, ConflictRequestError, AuthFailureError, ForbiddenError, InternalServerError } = require('../core/error.response')
const { getDiscountAmount } = require("./discount.service")
const { releaseLock, acquireLock } = require("./redis.service")
const { reservationInventory, rollbackInventory, restoreInventoryStock } = require("../models/repository/inventory.repo")
const orderModel = require("../models/order.model")
const { getOneOrderByUser, updateStatus, extractProductsFromOrder, findOrderById } = require("../models/repository/order.repo")
const { withTransaction } = require("../utils")

const VALID_TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],      // terminal state
    cancelled: []       // terminal state
}

class CheckoutService {

    /**
     * Validate cart, verify products, calculate prices and apply discounts
     * @param {Object} params
     * @param {string} params.cartId - Active cart ID
     * @param {string} params.userId - User ID
     * @param {Array<{shopId, shop_discounts, item_products}>} params.shop_order_ids - Orders grouped by shop
     * @returns {{shop_order_ids, shop_order_ids_new, checkout_order}} Review summary with pricing
     * @throws {BadRequestError} If cart not found or products unavailable
     */
    static async checkoutReview({
        cartId, userId, shop_order_ids
    }) {
        // 1. validate input
        if (!cartId || !userId) throw new BadRequestError('Missing cartId or userId')
        if (!Array.isArray(shop_order_ids) || !shop_order_ids.length) {
            throw new BadRequestError('shop_order_ids must be a non-empty array')
        }

        const foundCart = await findCartById(cartId)
        if (!foundCart) throw new BadRequestError(`Cart not found`)

        const checkout_order = {
            totalPrice: 0,
            feeShip: 0,
            totalDiscount: 0,
            totalCheckout: 0
        }, shop_order_ids_new = []

        // 2. calculate total bill
        for (const shopOrderId of shop_order_ids) {
            const { shopId, shop_discounts = [], item_products = [] } = shopOrderId

            const checkProductServer = await checkProductByServer(item_products)

            // find invalid products (returned null from repo)
            const invalidProducts = item_products.filter(
                (_, idx) => !checkProductServer[idx]
            )
            if (invalidProducts.length) {
                const invalidIds = invalidProducts.map(p => p.productId).join(', ')
                throw new BadRequestError(`Products not found or unavailable: ${invalidIds}`)
            }

            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, // tien truoc khi giam gia
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer
            }

            // apply discount (currently supports single discount per shop)
            if (shop_discounts.length > 0) {
                const { totalPrice, discount = 0 } = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })
                checkout_order.totalDiscount += discount

                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }

            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)

        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }

    /**
    * Reserve inventory for all products with distributed locking
    * @throws {BadRequestError} if lock fails or out of stock
    * @returns {Array<{productId, quantity}>} reserved products for rollback
    */
    static async _reserveAllProducts(products, cartId, session = null) {
        const reservedProducts = []
        for (const product of products) {
            const { productId, quantity } = product;

            // 1. lock
            const keyLock = await acquireLock(productId);
            if (!keyLock) throw new BadRequestError(`Product ${productId} changed, please back to cart!`)

            // 2. reserve
            const isReservation = await reservationInventory({
                productId, quantity, cartId, session
            })

            if (!isReservation.modifiedCount) {
                await releaseLock(keyLock);
                throw new BadRequestError(`Product ${productId} out of stock!`)

            }
            await releaseLock(keyLock);
            reservedProducts.push({ productId, quantity })
        }
        return reservedProducts
    }

    static async _rollbackReservations(reservedProducts, cartId) {
        for (const { productId, quantity } of reservedProducts) {
            try {
                await rollbackInventory({ productId, quantity, cartId })
            } catch (err) {
                console.error('Rollback failed:', productId, err)
            }
        }
    }

    // order 

    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }) {
        const { shop_order_ids_new, checkout_order } = await CheckoutService.checkoutReview({
            cartId,
            userId,
            shop_order_ids: shop_order_ids
        })

        // double check if overstock or not 
        // get new array Products
        const products = extractProductsFromOrder(shop_order_ids_new)
        console.log('[1]:', products)

        return await withTransaction(async (session) => {
            // 1. Reserve inventory for all products
            await CheckoutService._reserveAllProducts(products, cartId, session)

            // 2. Create order
            const newOrder = await orderModel.create([{
                order_userId: userId,
                order_checkout: checkout_order,
                user_shipping: user_address,
                order_payment: user_payment,
                order_products: shop_order_ids_new
            }], { session })

            if (!newOrder) throw new BadRequestError(`create order failed`)

            // 3. Remove products in cart
            const productIds = products.map(p => p.productId)
            const delItem = await deleteItemsInCart({ userId, productIds, session })
            if (!delItem.modifiedCount) throw new BadRequestError('Cart cleanup failed')

            return newOrder[0] // Mongoose .create returns an array when session is passed
        })
    }



    /**
     * Cancel Order [Users]
     * Restore inventory stock and mark order as cancelled
     * @param {Object} params
     * @param {string} params.userId
     * @param {string} params.orderId
     * @returns {Object} updated order
     * @throws {BadRequestError} if order not found or not cancellable
     */
    static async cancelOrderByUser({ userId, orderId }) {
        const orderItem = await getOneOrderByUser({ userId, orderId })
        if (!orderItem) throw new BadRequestError('Order not found!')

        if (!VALID_TRANSITIONS[orderItem.order_status]?.includes('cancelled')) {
            throw new BadRequestError(`Cannot cancel order with status: ${orderItem.order_status}`)
        }

        const products = extractProductsFromOrder(orderItem.order_products)

        for (const { productId, quantity } of products) {
            try {
                await restoreInventoryStock({ productId, quantity })
            } catch (err) {
                console.error('Restore stock failed:', productId, err)
            }
        }

        return await updateStatus({ orderId: orderItem._id, orderStatus: 'cancelled' })
    }

    /**
     * Update Order Status [Shop | Admin]
     * Includes authorization check and status transition validation
     * @param {Object} params
     * @param {string} params.shopId
     * @param {string} params.orderId
     * @param {string} params.newStatus
     * @returns {Object} Updated order result
     * @throws {BadRequestError} if order not found or invalid transition
     * @throws {ForbiddenError} if shop has no permission
     */
    static async updateOrderStatusByShop({ shopId, orderId, newStatus }) {
        // 1. Find the order
        const orderItem = await findOrderById(orderId)
        if (!orderItem) throw new BadRequestError('Order not found!')

        // 2. Authorization: Check if shop has items in this order
        const shopProducts = orderItem.order_products.filter(item => item.shopId === shopId)
        if (shopProducts.length === 0) {
            throw new ForbiddenError('Shop does not have permission to update this order')
        }

        // 3. Validate transition
        const currentStatus = orderItem.order_status
        if (!VALID_TRANSITIONS[currentStatus]?.includes(newStatus)) {
            throw new BadRequestError(`Invalid status transition: ${currentStatus} -> ${newStatus}`)
        }

        // 4. Side effects
        if (newStatus === 'cancelled') {
            const products = extractProductsFromOrder(shopProducts)
            for (const { productId, quantity } of products) {
                try {
                    await restoreInventoryStock({ productId, quantity })
                } catch (err) {
                    console.error('Restore stock failed:', productId, err)
                }
            }
        }

        // 5. Update status
        return await updateStatus({ orderId: orderItem._id, orderStatus: newStatus })
    }
}

module.exports = CheckoutService