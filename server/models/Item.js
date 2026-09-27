const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['textbooks', 'gadgets', 'stationery', 'lab-equipment', 'other']
    },
    description: {
        type: String,
        required: true
    },
    condition: {
        type: String,
        enum: ['New', 'Like New', 'Good', 'Fair'],
        default: 'Good'
    },
    type: {
        type: String,
        enum: ['sale', 'borrow'],
        default: 'sale'
    },
    deposit: {
        type: Number,
        default: 0
    },
    rentalPeriod: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerName: {
        type: String,
        default: 'Anonymous'
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'borrowed'],
        default: 'available'
    },
    views: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Item', itemSchema);
