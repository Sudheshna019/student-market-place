const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Item = require('../models/Item');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/orders
// @desc    Create new order & mark items as sold/borrowed
router.post('/', protect, async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        const processedItems = [];

        for (const itemData of items) {
            const item = await Item.findById(itemData.itemId || itemData._id);
            if (!item) continue;

            // Mark item status as sold/borrowed
            item.status = item.type === 'borrow' ? 'borrowed' : 'sold';
            await item.save();

            processedItems.push({
                itemId: item._id,
                name: item.name,
                price: item.price,
                category: item.category,
                image: item.image,
                type: item.type,
                sellerId: item.sellerId
            });
        }

        const order = new Order({
            buyerId: req.user._id,
            buyerName: req.user.fullName,
            buyerEmail: req.user.email,
            items: processedItems,
            totalAmount: totalAmount || processedItems.reduce((acc, curr) => acc + curr.price, 0),
            shippingAddress: shippingAddress || {},
            paymentMethod: paymentMethod || 'Cash on Delivery',
            status: 'confirmed'
        });

        const createdOrder = await order.save();

        // Clear user's cart
        let cart = await Cart.findOne({ userId: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        console.error('Order Creation Error:', error);
        res.status(500).json({ message: 'Server error placing order' });
    }
});

// @route   GET /api/orders/my-orders
// @desc    Get orders placed by or received by logged-in user
router.get('/my-orders', protect, async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [
                { buyerId: req.user._id },
                { 'items.sellerId': req.user._id }
            ]
        }).sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Fetch Orders Error:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order details by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order details' });
    }
});

module.exports = router;
