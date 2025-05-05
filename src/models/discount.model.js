'use strict'

const {model, Schema, Types } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'discounts'

// Declare the Schema of the Mongo model
var discountSchema = new Schema({
    discount_name: { type: String, required: true },
    discount_description: { type: String, required: true},
    discount_type: { type: String, default: 'fixed_amount', }, // percentage
    discount_value: { type: Number, required: true, }, // 10.00, 
    discount_code: { type: String, required: true, }, // discount code
    discount_start_date: { type: Date, required: true,},
    discount_end_date: { type: Date, required: true, },
    discount_maximum_uses: { type: Number, required: true, }, // 0: unlimited
    discount_uses_count: { type: Number, required: true, }, // maximum discount per user
    discount_users_used: { type: Array, default: [], }, // userId that used the discount code
    discount_max_uses_per_user: { type: Number, required: true, }, // maximum discount per user
    discount_min_order_value: { type: Number, required: true, default: 0, }, // minimum order value to apply discount
    discount_shopId: { type: Types.ObjectId, ref: 'Shop', required: true, }, // shopId that created the discount code
    discount_is_active: { type: Boolean, default: true, }, // is active discount code
    discount_applies_to: { type: String, required: true, enum: ['all', 'specific'] ,default: 'all', }, // all, category, product
    discount_product_ids: { type: Array, default: [], }, // productId that discount code applies to
    
}, {
    collection: COLLECTION_NAME,
    timestamps: true
});

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);