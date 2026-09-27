const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Item = require('../models/Item');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/cart
// @desc    Get user's shopping cart
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id }).populate('items.itemId');
        if (!cart) {
            cart = await Cart.create({ userId: req.user._id, items: [] });
        }
        res.json(cart);
    } catch (error) {
        console.error('Fetch Cart Error:', error);
        res.status(500).json({ message: 'Error fetching cart' });
    }
});

// @route   POST /api/cart/add
// @desc    Add item to shopping cart
router.post('/add', protect, async (req, res) => {
    try {
        const { itemId, quantity = 1 } = req.body;
        
        const item = await Item.findById(itemId);
        if (!item || item.status !== 'available') {
            return res.status(400).json({ message: 'Item is no longer available' });
        }

        let cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            cart = new Cart({ userId: req.user._id, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(i => i.itemId.toString() === itemId);

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({ itemId, quantity });
        }

        cart.updatedAt = Date.now();
        await cart.save();
        
        const populatedCart = await Cart.findById(cart._id).populate('items.itemId');
        res.json(populatedCart);
    } catch (error) {
        console.error('Add to Cart Error:', error);
        res.status(500).json({ message: 'Error adding item to cart' });
    }
});

// @route   POST /api/cart/remove
// @desc    Remove item from cart
router.post('/remove', protect, async (req, res) => {
    try {
        const { itemId } = req.body;
        let cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(i => i.itemId.toString() !== itemId);
        cart.updatedAt = Date.now();
        await cart.save();

        const populatedCart = await Cart.findById(cart._id).populate('items.itemId');
        res.json(populatedCart);
    } catch (error) {
        res.status(500).json({ message: 'Error removing item from cart' });
    }
});

// @route   DELETE /api/cart/clear
// @desc    Clear all items from cart
router.delete('/clear', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing cart' });
    }
});

module.exports = router;
