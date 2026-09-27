const mongoose = require('mongoose');
const { CATEGORIES, CONDITIONS, ITEM_TYPES } = require('../utils/validate');

const itemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        price: { type: Number, required: true, min: 0 },
        category: { type: String, required: true, enum: CATEGORIES },
        description: { type: String, required: true, maxlength: 1000 },
        condition: { type: String, enum: CONDITIONS, default: 'Good' },
        type: { type: String, enum: ITEM_TYPES, default: 'sale' },
        // Borrow listings: refundable deposit and how long the item can be borrowed for.
        deposit: { type: Number, default: 0, min: 0 },
        rentalPeriod: { type: String, default: '', maxlength: 50 },
        // Compressed image stored as a data URL; served via GET /api/items/:id/image
        // and excluded from list responses to keep them small.
        image: { type: String, default: '', select: false },
        hasImage: { type: Boolean, default: false },
        sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        sellerName: { type: String, default: 'Anonymous' },
        status: { type: String, enum: ['available', 'sold', 'borrowed'], default: 'available' },
        views: { type: Number, default: 0 }
    },
    { timestamps: true }
);

itemSchema.index({ status: 1, category: 1, createdAt: -1 });
itemSchema.index({ sellerId: 1, createdAt: -1 });

module.exports = mongoose.model('Item', itemSchema);
