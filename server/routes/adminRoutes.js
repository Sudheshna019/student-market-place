const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/stats
// @desc    Get dashboard metrics
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalItems = await Item.countDocuments({ status: 'available' });
        const totalOrders = await Order.countDocuments();
        
        const orders = await Order.find();
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        res.json({
            totalUsers,
            totalItems,
            totalOrders,
            totalRevenue
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// @route   GET /api/admin/users
// @desc    List all registered users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// @route   DELETE /api/admin/items/:id
// @desc    Admin moderate/delete item
router.delete('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        await item.deleteOne();
        res.json({ message: 'Item moderated and deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item' });
    }
});

module.exports = router;
