const Cart = require('../models/Cart');
const Item = require('../models/Item');

// Returns the cart as a plain list of items. Listings that were deleted are
// dropped; ones sold to someone else are kept but flagged so the UI can say so.
async function cartResponse(userId) {
    const cart = await Cart.findOne({ userId }).populate('items.itemId');
    if (!cart) return { items: [] };

    const live = cart.items.filter((line) => line.itemId);
    if (live.length !== cart.items.length) {
        cart.items = live.map((line) => ({ itemId: line.itemId._id, addedAt: line.addedAt }));
        await cart.save();
    }

    return {
        items: live.map((line) => ({
            ...line.itemId.toJSON(),
            available: line.itemId.status === 'available'
        }))
    };
}

// GET /api/cart
const getCart = async (req, res) => {
    res.json(await cartResponse(req.user._id));
};

// POST /api/cart/:itemId
const addToCart = async (req, res) => {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.status !== 'available') {
        return res.status(400).json({ message: 'Sorry, this item is no longer available' });
    }
    if (item.sellerId.equals(req.user._id)) {
        return res.status(400).json({ message: "You can't add your own listing to the cart" });
    }

    const result = await Cart.updateOne(
        { userId: req.user._id, 'items.itemId': { $ne: item._id } },
        { $push: { items: { itemId: item._id } } }
    );

    if (result.matchedCount === 0) {
        // Either the cart doesn't exist yet or the item is already in it.
        const cart = await Cart.findOne({ userId: req.user._id });
        if (cart) return res.status(400).json({ message: 'This item is already in your cart' });
        await Cart.create({ userId: req.user._id, items: [{ itemId: item._id }] });
    }

    res.json(await cartResponse(req.user._id));
};

// DELETE /api/cart/:itemId
const removeFromCart = async (req, res) => {
    await Cart.updateOne({ userId: req.user._id }, { $pull: { items: { itemId: req.params.itemId } } });
    res.json(await cartResponse(req.user._id));
};

// DELETE /api/cart
const clearCart = async (req, res) => {
    await Cart.updateOne({ userId: req.user._id }, { $set: { items: [] } });
    res.json({ items: [] });
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };
