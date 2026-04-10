'use strict'

const discountModel = require('../../models/discount.model') // Changed import
const { convertToObjectIdMongodb, getSelectData, unGetSelectData } = require('../../utils')
const { NotFoundError } = require('../../core/error.response')

const findDiscount = async ({ discount_code, discount_shopId }) => {
    return await discountModel.findOne({ // Changed to use discountModel
        discount_code,
        discount_shopId: convertToObjectIdMongodb(discount_shopId)
    }).lean()

}

const findAllDiscountCodesSelect = async ({
    limit = 50, page = 1, sort = 'ctime',
    filter, select, model
}) => {
    const skip = (page - 1) * limit
    const sortBy = sort == 'ctime' ? { _id: -1 } : { _id: 1 }
    const products = await model.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean()

    return products
}

const findAllDiscountCodesUnSelect = async ({
    limit = 50, page = 1, sort = 'ctime',
    filter, unSelect, model
}) => {
    const skip = (page - 1) * limit
    const sortBy = sort == 'ctime' ? { _id: -1 } : { _id: 1 }
    const products = await model.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(unGetSelectData(unSelect))
        .lean()

    return products
}

// xoa ra khoi db 
const deleteDiscountCode = async ({ shopId, codeId }) => {
    const foundDiscount = await findDiscount({ discount_code: codeId, discount_shopId: shopId })

    if (!foundDiscount) throw new NotFoundError(`discount not available`)

    const deleted = await discountModel.findOneAndDelete({
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId)
    })

    return deleted
}

/**
 * Cancel Discount Code ()
*/
const cancelDiscountCode = async ({ codeId, shopId, userId }) => {
    const foundDiscount = await findDiscount({ discount_code: codeId, discount_shopId: shopId })
    if (!foundDiscount) throw new NotFoundError(`discount not available`)

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
        $pull: {
            discount_users_used: userId,
        },
        $inc: {
            discount_max_uses: 1,
            discount_uses_count: -1
        }
    })

    return result
}

module.exports = {
    findDiscount,
    findAllDiscountCodesUnSelect,
    findAllDiscountCodesSelect,
    deleteDiscountCode,
    cancelDiscountCode
}
