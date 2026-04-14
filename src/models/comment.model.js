'use strict'

const { model, Schema, Types } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Comment'
const COLLECTION_NAME = 'Comments'

// Declare the Schema of the Mongo model
const commentSchema = new Schema({
    comment_productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    comment_userId: { type: Schema.Types.ObjectId, ref: 'Shop' },
    comment_content: { type: String, default: 'text' },
    comment_left: { type: Number, default: 0 },
    comment_right: { type: Number, default: 0 },
    comment_parentId: { type: Schema.Types.ObjectId, ref: DOCUMENT_NAME },
    isDeleted: { type: Boolean, default: false }
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
});

commentSchema.index({
    comment_productId: 1, comment_left: 1, comment_right: 1
});
commentSchema.index({
    comment_content: 'text'
});

//Export the model
module.exports = model(DOCUMENT_NAME, commentSchema)