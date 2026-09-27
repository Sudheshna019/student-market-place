const express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const ContactMessage = require('../models/ContactMessage');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { str, escapeRegex } = require('../utils/validate');

const router = express.Router();

router.use(protect, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    const [totalUsers, availableItems, totalItems, totalOrders, pendingOrders, newMessages, revenue, recentOrders] =
        await Promise.all([
            User.countDocuments(),
            Item.countDocuments({ status: 'available' }),
            Item.countDocuments(),
            Order.countDocuments(),
            Order.countDocuments({ status: 'pending' }),
            ContactMessage.countDocuments({ status: 'new' }),
            Order.aggregate([
                { $match: { status: 'delivered' } },
                { $group: { _id: null, total: { $sum: '$subtotal' } } }
            ]),
            Order.find().sort({ createdAt: -1 }).limit(6)
        ]);

    res.json({
        totalUsers,
        availableItems,
        totalItems,
        totalOrders,
        pendingOrders,
        newMessages,
        deliveredSales: revenue[0] ? revenue[0].total : 0,
        recentOrders
    });
});

// GET /api/admin/users?search=
router.get('/users', async (req, res) => {
    const search = str(req.query.search).slice(0, 100);
    const query = {};
    if (search) {
        const regex = new RegExp(escapeRegex(search), 'i');
        query.$or = [{ fullName: regex }, { email: regex }];
    }

    const users = await User.find(query).select('-photoURL').sort({ createdAt: -1 }).lean();
    const ids = users.map((u) => u._id);
    const [listingCounts, orderCounts] = await Promise.all([
        Item.aggregate([{ $match: { sellerId: { $in: ids } } }, { $group: { _id: '$sellerId', n: { $sum: 1 } } }]),
        Order.aggregate([{ $match: { buyerId: { $in: ids } } }, { $group: { _id: '$buyerId', n: { $sum: 1 } } }])
    ]);
    const toMap = (rows) => new Map(rows.map((r) => [r._id.toString(), r.n]));
    const listings = toMap(listingCounts);
    const orders = toMap(orderCounts);

    res.json(
        users.map((u) => ({
            ...u,
            listings: listings.get(u._id.toString()) || 0,
            orders: orders.get(u._id.toString()) || 0
        }))
    );
});

// PATCH /api/admin/users/:id/role  { role: 'user' | 'admin' }
router.patch('/users/:id/role', async (req, res) => {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    if (req.user._id.equals(req.params.id)) {
        return res.status(400).json({ message: "You can't change your own role" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { returnDocument: 'after' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.toPublic());
});

// GET /api/admin/items?search=&status=
router.get('/items', async (req, res) => {
    const search = str(req.query.search).slice(0, 100);
    const query = {};
    if (['available', 'sold', 'borrowed'].includes(req.query.status)) query.status = req.query.status;
    if (search) {
        const regex = new RegExp(escapeRegex(search), 'i');
        query.$or = [{ name: regex }, { sellerName: regex }, { category: regex }];
    }
    res.json(await Item.find(query).sort({ createdAt: -1 }).limit(200));
});

// DELETE /api/admin/items/:id
router.delete('/items/:id', async (req, res) => {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    await Cart.updateMany({}, { $pull: { items: { itemId: item._id } } });
    res.json({ message: 'Listing removed' });
});

// GET /api/admin/orders?status=
router.get('/orders', async (req, res) => {
    const query = {};
    if (Order.ORDER_STATUSES.includes(req.query.status)) query.status = req.query.status;
    res.json(await Order.find(query).sort({ createdAt: -1 }).limit(200));
});

// GET /api/admin/messages
router.get('/messages', async (req, res) => {
    res.json(await ContactMessage.find().sort({ createdAt: -1 }).limit(200));
});

// PATCH /api/admin/messages/:id  { status: 'new' | 'read' }
router.patch('/messages/:id', async (req, res) => {
    if (!['new', 'read'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' });
    const message = await ContactMessage.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { returnDocument: 'after' }
    );
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json(message);
});

// DELETE /api/admin/messages/:id
router.delete('/messages/:id', async (req, res) => {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted' });
});

module.exports = router;
