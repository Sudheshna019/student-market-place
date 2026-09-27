const mongoose = require('mongoose');

const ORDER_STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled'];

// Checkout creates one order per seller so each seller manages their own order.
const orderSchema = new mongoose.Schema(
    {
        buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        buyerName: { type: String, required: true },
        buyerEmail: { type: String, required: true },
        sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        sellerName: { type: String, default: '' },
        items: [
            {
                _id: false,
                itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
                name: String,
                price: Number,
                deposit: { type: Number, default: 0 },
                rentalPeriod: { type: String, default: '' },
                category: String,
                type: { type: String, enum: ['sale', 'borrow'] }
            }
        ],
        subtotal: { type: Number, required: true },
        depositTotal: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        shippingAddress: {
            fullName: String,
            email: String,
            phone: String,
            address: String
        },
        paymentMethod: { type: String, default: 'Cash on Delivery' },
        status: { type: String, enum: ORDER_STATUSES, default: 'pending' }
    },
    { timestamps: true }
);

orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ sellerId: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
