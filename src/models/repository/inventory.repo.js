'use strict'

const inventory = require('../inventory.model')

const { Types } = require('mongoose')
const { convertToObjectIdMongodb } = require('../../utils')

const insertInventory = async ({
    productId, shopId, stock, location = 'unKnown'
}) => {
    return await inventory.create({
        inven_productId: productId,
        inven_stock: stock,
        inven_location: location,
        inven_shopId: shopId
    })
}

const addStock = async ({ shopId, productId, stock, location }) => {
    const query = {
        inven_shopId: shopId,
        inven_productId: productId
    }, updateSet = {
        $inc: {
            inven_stock: stock
        },
        $set: {
            inven_location: location
        }
    }, options = { upsert: true, new: true }

    return await inventoryModel.findOneAndUpdate(query, updateSet, options)
}

const reservationInventory = async ({ productId, quantity, cartId }) => {
    const query = {
        inven_productId: convertToObjectIdMongodb(productId),
        inven_stock: { $gte: quantity }
    }, updateSet = {
        $inc: {
            inven_stock: -quantity
        },
        $push: {
            inven_reservations: {
                quantity,
                cartId,
                createOn: new Date()
            }
        }
    }, options = { new: true }

    return await inventory.updateOne(query, updateSet, options)
}

const rollbackInventory = async ({ productId, quantity, cartId }) => {
    const query = {
        inven_productId: convertToObjectIdMongodb(productId),
    }, updateSet = {
        $inc: {
            inven_stock: +quantity
        },
        $pull: {
            inven_reservations: {
                quantity,
                cartId
            }
        }
    }, options = { new: true }

    return await inventory.updateOne(query, updateSet, options)
}


/**
 * Restore stock when order is cancelled (no reservation cleanup needed)
 * @param {string} productId
 * @param {number} quantity - amount to restore
 * @returns {Promise<UpdateResult>}
 */
const restoreInventoryStock = async ({ productId, quantity }) => {
    return await inventory.updateOne(
        { inven_productId: convertToObjectIdMongodb(productId) },
        { $inc: { inven_stock: quantity } }
    )
}

module.exports = {
    insertInventory,
    reservationInventory,
    rollbackInventory,
    restoreInventoryStock,
    addStock
}