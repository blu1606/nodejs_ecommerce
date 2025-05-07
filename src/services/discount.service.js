'use strict'

const { BadRequestError, NotFoundError } = require("../core/error.response")
const { convertToObjectIdMongodb } = require("../utils")
const discount = require('../models/discount.model')
const { findDiscount, findAllDiscountCodesUnSelect, findAllDiscountCodesSelect } = require('../models/repository/discount.repo')
const { findAllProducts } = require("./product.service.xxx")

/*
    Discount Service
    1 - Generator Discount Code [Shop \ Admin]
    2 - Get discount amount [User]
    3 - Get all discount codes [User \ Shop \ Admin]
    4 - Verify discount code [User]
    5 - Delete discount code [Shop \ Admin]
    6 - Cancel discount code [User]
*/

class DiscountService {

    static async createDiscountCode( payload ) {
        const {
            code, start_date, end_date, is_active, 
            shopId, min_order_value, product_ids, 
            type, value, max_value, max_uses, uses_count,
            max_uses_per_user, applies_to, name, description,
            users_used
        } = payload

        // check
        if ( new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
            throw new BadRequestError('Discount code has expired!!')
        } 

        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError('Start date must be before end date')
        }

        // create index for discount code
        const foundDiscount = await findDiscount({ discount_code: code, discount_shopId: shopId })

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount exist!')
        }

        const newDiscount = await discount.create({
            discount_name: name, 
            discount_description: description, 
            discount_type: type, 
            discount_value: value,
            discount_code: code, 
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used, 
            discount_max_uses_per_user: max_uses_per_user,
            discount_min_order_value: min_order_value,
            discount_shopId: shopId, 
            discount_is_active: is_active,
            discount_applies_to: applies_to, 
            discount_product_ids: applies_to === 'all' ? [] : product_ids
        })

        return newDiscount
    }

    static async updateDiscountCode( discountId, payload ) { 
        const {
            code, start_date, end_date, is_active, 
            shopId, min_order_value, product_ids, 
            type, value, max_value, max_uses, uses_count,
            max_uses_per_user, applies_to, name, description
        } = payload

        // check
        if ( new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
            throw new BadRequestError('Discount code has expired!!')
        } 

        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError('Start date must be before end date')
        }

        // create index for discount code
        const foundDiscount = await findDiscount({ discount_code: code, discount_shopId: shopId })

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount exist!')
        }

        const updatedDiscount = await discount.findByIdAndUpdate(discountId, {
            discount_name: name, 
            discount_description: description, 
            discount_type: type, 
            discount_value: value,
            discount_code: code, 
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used, 
            discount_max_uses_per_user: max_uses_per_user,
            discount_min_order_value: min_order_value,
            discount_shopId: shopId, 
            discount_is_active: is_active,
            discount_applies_to: applies_to, 
            discount_product_ids: applies_to === 'all' ? [] : product_ids
        }, {new: true})

        return updatedDiscount
    }

    /**
     * Get all discount codes available with products
     */

    static async getAllDiscountCodesWithProduct({
        code, shopId, userId, limit = 50, page = 1 // Added default values for limit and page
    }) {
        // create index for discount_code
        const foundDiscount = await findDiscount({ discount_code: code, discount_shopId: shopId })

        if (!foundDiscount || foundDiscount.discount_is_active === false) {
            throw new BadRequestError('Discount code not exists!')
        }
        
        const { discount_applies_to, discount_product_ids } = foundDiscount
        let products 
        if (discount_applies_to === 'all') {
            // get all product
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true
                }, 
                limit: +limit, // Ensure limit is a number
                page: +page,   // Ensure page is a number
                sort: 'ctime',
                select: ['product_name']
            })
        }

        if (discount_applies_to === 'specific') {
            // get the products ids
            products = await findAllProducts({
                filter: {
                    _id: {$in: discount_product_ids},
                    isPublished: true
                }, 
                limit: +limit, // Ensure limit is a number
                page: +page,   // Ensure page is a number
                sort: 'ctime',
                select: ['product_name']
            })
        }
        return products
    }

    /**
     * Get all discount code of shop
     */

    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = await findAllDiscountCodesSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            select: ['discount_name', 'discount_code'],
            model: discount
        })

        return discounts
    }

    /**
     * Apply Discount Code 
     * 
     */

    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        const foundDiscount = await findDiscount({ discount_code: codeId, discount_shopId: shopId })
        if (!foundDiscount) throw new NotFoundError('Discount code not exists!')

        const { 
            discount_is_active, 
            discount_max_uses,
            discount_start_date,
            disount_end_date,
            discount_min_order_value,
            discount_users_used,
            discount_type,
            discount_max_uses_per_user,
            discount_value,
            
        } = foundDiscount

        if (!discount_is_active) throw new NotFoundError('Discount code expired!')
        if (!discount_max_uses) throw new NotFoundError('Discount code not available!')
        
        if (new Date() < new Date(discount_start_date) || new Date() > new Date(disount_end_date)) {
            throw new NotFoundError('Discount code has expired!')
        }

        // check xem co xet gia tri toi thieu khong
        let totalOrder = 0
        if (discount_min_order_value > 0) {
            // get total
            totalOrder = products.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            if (totalOrder < discount_min_order_value) 
                throw new NotFoundError(`discount requires a minimun order value of ${discount_min_order_value}!`)
        }

        if (discount_max_uses_per_user > 0) {
            const userUsedDiscount = discount_users_used.find( user => user.userId === userId) 
            if (userUsedDiscount) {
                if (userUsedDiscount > discount_max_uses_per_user) throw new NotFoundError(`discount can not use`)
            }
        }

        // check xem discount nay la fixed_amount hay percentage
        const amount = discount_type == 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)

        return {
            totalOrder, 
            discount: amount,
            totalPrice : totalOrder - amount
        }
    }


    // xoa ra khoi db 
    static async deleteDiscountCode({ shopId, codeId }) {
        const foundDiscount = await findDiscount({ discount_code: codeId, discount_shopId: shopId })
        
        if (!foundDiscount) throw new NotFoundError(`discount not available`)
        
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId, 
            discount_shopId: convertToObjectIdMongodb(shopId)
        })

        return deleted
    }
    // co the cai thien bang cach day qua db khac (trace back)

    /**
     * Cancel Discount Code ()
     */
    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await findDiscount({ discount_code: codeId, discount_shopId: shopId })
        if (!foundDiscount) throw new NotFoundError(`discount not available`)
        
        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
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
}

module.exports = DiscountService