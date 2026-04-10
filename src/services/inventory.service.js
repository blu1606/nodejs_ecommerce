'use strict'

const { BadRequestError } = require("../core/error.response")
const inventoryModel = require("../models/inventory.model")
const { addStock } = require("../models/repository/inventory.repo")
const { getProductById } = require("../models/repository/product.repo")

class InventoryService {

    static async addStockToInventory({
        stock, productId, shopId, location = 'HCM'
    }) {
        const product = await getProductById(productId)
        if (!product) throw new BadRequestError('Product not found or not exists!')

        return await addStock({ shopId, productId, stock, location })
    }
}

module.exports = InventoryService