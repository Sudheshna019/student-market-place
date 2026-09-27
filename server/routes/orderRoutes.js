const express = require('express');
const Order = require('../models/Order');
const Item = require('../models/Item');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/authMiddleware');
const { str, isEmail, isPhone } = require('../utils/validate');

const router = express.Router();

router.use(protect);

function role(user, order) {
    if (order.buyerId.equals(user._id)) return 'buyer';
    if (order.sellerId.equals(user._id)) return 'seller';
    if (user.role === 'admin') return 'admin';
    return null;
}

// Which status changes each role may make, from a given current status.
const TRANSITIONS = {
    buyer: { pending: ['cancelled'], confirmed: ['cancelled'] },
    seller: { pending: ['confirmed', 'cancelled'], confirmed: ['delivered', 'cancelled'] },
    admin: { pending: ['confirmed', 'cancelled'], confirmed: ['delivered', 'cancelled'] }
};

async function releaseItems(itemIds) {
    if (itemIds.length) {
        await Item.updateMany({ _id: { $in: itemIds } }, { $set: { status: 'available' } });
    }
}

// POST /api/orders — checkout the whole cart (Cash on Delivery).
// Prices and totals come from the database, never from the request body.
router.post('/', async (req, res) => {
    const address = req.body.shippingAddress || {};
    const shippingAddress = {
        fullName: str(address.fullName),
        email: str(address.email).toLowerCase(),
        phone: str(address.phone),
        address: str(address.address)
    };

    if (shippingAddress.fullName.length < 2) return res.status(400).json({ message: 'Enter your full name' });
    if (!isEmail(shippingAddress.email)) return res.status(400).json({ message: 'Enter a valid email address' });
    if (!isPhone(shippingAddress.phone)) return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });
    if (shippingAddress.address.length < 10) return res.status(400).json({ message: 'Enter your complete address' });

    const cart = await Cart.findOne({ userId: req.user._id });
    const itemIds = cart ? cart.items.map((line) => line.itemId) : [];
    if (itemIds.length === 0) return res.status(400).json({ message: 'Your cart is empty' });

    const items = await Item.find({ _id: { $in: itemIds } });

    // Claim each item atomically so two buyers can't purchase the same listing.
    const claimed = [];
    for (const item of items) {
        const updated = await Item.findOneAndUpdate(
            { _id: item._id, status: 'available', sellerId: { $ne: req.user._id } },
            { $set: { status: item.type === 'borrow' ? 'borrowed' : 'sold' } }
        );
        if (!updated) {
            await releaseItems(claimed.map((i) => i._id));
            await Cart.updateOne({ userId: req.user._id }, { $pull: { items: { itemId: item._id } } });
            return res.status(409).json({
                message: `"${item.name}" is no longer available and was removed from your cart. Please review your cart.`
            });
        }
        claimed.push(item);
    }

    if (claimed.length === 0) {
        await Cart.updateOne({ userId: req.user._id }, { $set: { items: [] } });
        return res.status(400).json({ message: 'Items in your cart are no longer available' });
    }

    // One order per seller.
    const bySeller = new Map();
    for (const item of claimed) {
        const key = item.sellerId.toString();
        if (!bySeller.has(key)) bySeller.set(key, []);
        bySeller.get(key).push(item);
    }

    let orders;
    try {
        orders = await Order.insertMany(
            [...bySeller.values()].map((sellerItems) => {
                const subtotal = sellerItems.reduce((sum, i) => sum + i.price, 0);
                const depositTotal = sellerItems.reduce((sum, i) => sum + (i.type === 'borrow' ? i.deposit : 0), 0);
                return {
                    buyerId: req.user._id,
                    buyerName: req.user.fullName,
                    buyerEmail: req.user.email,
                    sellerId: sellerItems[0].sellerId,
                    sellerName: sellerItems[0].sellerName,
                    items: sellerItems.map((i) => ({
                        itemId: i._id,
                        name: i.name,
                        price: i.price,
                        deposit: i.type === 'borrow' ? i.deposit : 0,
                        rentalPeriod: i.rentalPeriod,
                        category: i.category,
                        type: i.type
                    })),
                    subtotal,
                    depositTotal,
                    totalAmount: subtotal + depositTotal,
                    shippingAddress,
                    paymentMethod: 'Cash on Delivery',
                    status: 'pending'
                };
            })
        );
    } catch (error) {
        await releaseItems(claimed.map((i) => i._id));
        throw error;
    }

    const claimedIds = claimed.map((i) => i._id);
    await Cart.updateOne({ userId: req.user._id }, { $set: { items: [] } });
    // These listings are gone, so drop them from everyone else's carts too.
    await Cart.updateMany({}, { $pull: { items: { itemId: { $in: claimedIds } } } });

    res.status(201).json(orders);
});

// GET /api/orders/my-orders — { purchases, sales }
router.get('/my-orders', async (req, res) => {
    const [purchases, sales] = await Promise.all([
        Order.find({ buyerId: req.user._id }).sort({ createdAt: -1 }),
        Order.find({ sellerId: req.user._id }).sort({ createdAt: -1 })
    ]);
    res.json({ purchases, sales });
});

// GET /api/orders/:id — buyer, seller or admin only
router.get('/:id', async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const viewerRole = role(req.user, order);
    if (!viewerRole) return res.status(404).json({ message: 'Order not found' });

    res.json({ ...order.toJSON(), viewerRole });
});

// PATCH /api/orders/:id/status  { status }
router.patch('/:id/status', async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const viewerRole = role(req.user, order);
    if (!viewerRole) return res.status(404).json({ message: 'Order not found' });

    const next = req.body.status;
    const allowed = (TRANSITIONS[viewerRole][order.status] || []);
    if (!allowed.includes(next)) {
        return res.status(400).json({ message: `Can't change this order from ${order.status} to ${next}` });
    }

    order.status = next;
    await order.save();

    // A cancelled order puts its items back on the marketplace.
    if (next === 'cancelled') {
        await releaseItems(order.items.map((i) => i.itemId).filter(Boolean));
    }

    res.json({ ...order.toJSON(), viewerRole });
});

module.exports = router;
