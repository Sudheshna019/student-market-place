const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyerName: {
        type: String,
        required: true
    },
    buyerEmail: {
        type: String,
        required: true
    },
    items: [
        {
            itemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            name: String,
            price: Number,
            category: String,
            image: String,
            type: String,
            sellerId: mongoose.Schema.Types.ObjectId
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        fullName: String,
        address: String,
        city: String,
        phone: String,
        postalCode: String
    },
    paymentMethod: {
        type: String,
        default: 'Cash on Delivery'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
