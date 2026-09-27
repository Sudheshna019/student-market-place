const mongoose = require('mongoose');

// Every listing is a single physical item, so a cart line has no quantity.
const cartSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        items: [
            {
                _id: false,
                itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
                addedAt: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
