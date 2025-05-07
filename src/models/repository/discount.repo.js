'use strict'

const discountModel = require('../../models/discount.model') // Changed import
const { convertToObjectIdMongodb, getSelectData, unGetSelectData} = require('../../utils')

const findDiscount = async ({ discount_code, discount_shopId}) => {
    return await discountModel.findOne({ // Changed to use discountModel
        discount_code,
        discount_shopId: convertToObjectIdMongodb(discount_shopId)
    }).lean()

}

const findAllDiscountCodesSelect = async({
    limit = 50, page = 1, sort = 'ctime', 
    filter, select , model
}) => {
    const skip = ( page - 1 ) * limit
    const sortBy = sort == 'ctime' ? {_id: -1} : {_id: 1}
    const products = await model.find( filter ) 
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()

    return products
}

const findAllDiscountCodesUnSelect = async({
    limit = 50, page = 1, sort = 'ctime', 
    filter, unSelect, model
}) => {
    const skip = ( page - 1 ) * limit
    const sortBy = sort == 'ctime' ? {_id: -1} : {_id: 1}
    const products = await model.find( filter ) 
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(unSelect))
    .lean()

    return products
}
module.exports = {
    findDiscount,
    findAllDiscountCodesUnSelect,
    findAllDiscountCodesSelect
}
