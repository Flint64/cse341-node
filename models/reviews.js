const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    username: { type: String, required: true },
    review: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },  
});

module.exports = mongoose.model('Review', reviewSchema);