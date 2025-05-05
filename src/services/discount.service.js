'use strict'

const { BadRequestError } = require("../core/error.response")
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
        const foundDiscount = await findDiscount(code, shopId)

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
        const foundDiscount = await findDiscount(code, shopId)

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
        code, shopId, userId, limit, page
    }) {
        // create index for discount_code
        const foundDiscount = await findDiscount(code, shopId)

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
                limit: +limit,
                page: +page,
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
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
    }

    /**
     * Get all discount code of shop
     */

    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = await findAllDiscountCodesUnSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        })

        return discounts
    }

}