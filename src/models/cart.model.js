'use strict'

const {model, Schema, Types } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'carts'

// Declare the Schema of the Mongo model
var cartSchema = new Schema({
    cart_state: { type: String, required: true, enum: ['active', 'complete', 'failed', 'pending'], default: 'active'},
    cart_products: { type: Array, required: true, default: []},
    /*
        [
            {
                productId, 
                shopId,
                quantity:
                name:
                price:
            }
        ]    
    */
   cart_count_product: { type: Number, default: 0},
   cart_userID: { type: Number, required: true},


}, {
    collection: COLLECTION_NAME,
    timeseries: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    }
});

//Export the model
module.exports = {
    cart: model(DOCUMENT_NAME, cartSchema)
}