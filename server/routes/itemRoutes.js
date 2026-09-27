const express = require('express');
const mongoose = require('mongoose');
const Item = require('../models/Item');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/authMiddleware');
const { str, escapeRegex, validateItem, CATEGORIES, ITEM_TYPES } = require('../utils/validate');

const router = express.Router();

const EDITABLE_FIELDS = ['name', 'price', 'category', 'description', 'condition', 'type', 'deposit', 'rentalPeriod'];
const OWNER_STATUSES = ['available', 'sold', 'borrowed'];

function canManage(user, item) {
    return item.sellerId.equals(user._id) || user.role === 'admin';
}

function applyFields(item, body) {
    for (const field of EDITABLE_FIELDS) {
        if (body[field] === undefined) continue;
        if (field === 'price' || field === 'deposit') item[field] = Number(body[field]) || 0;
        else if (typeof body[field] === 'string') item[field] = body[field].trim();
    }
    if (item.type === 'sale') {
        item.deposit = 0;
        item.rentalPeriod = '';
    }
    if (body.image !== undefined) {
        item.image = body.image;
        item.hasImage = Boolean(body.image);
    }
}

// GET /api/items?category=&type=&search=&limit=
router.get('/', async (req, res) => {
    const { category, type } = req.query;
    const search = str(req.query.search).slice(0, 100);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 60, 1), 100);

    const query = { status: 'available' };
    if (CATEGORIES.includes(category)) query.category = category;
    if (ITEM_TYPES.includes(type)) query.type = type;
    if (search) {
        const regex = new RegExp(escapeRegex(search), 'i');
        query.$or = [{ name: regex }, { description: regex }, { category: regex }];
    }

    const items = await Item.find(query).sort({ createdAt: -1 }).limit(limit);
    res.json(items);
});

// GET /api/items/mine — the logged-in user's listings, any status
router.get('/mine', protect, async (req, res) => {
    const items = await Item.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
});

// GET /api/items/:id/image — serves the stored image as a cacheable file
router.get('/:id/image', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).end();

    const item = await Item.findById(req.params.id).select('+image');
    const match = item && /^data:(image\/[a-z+]+);base64,(.+)$/.exec(item.image || '');
    if (!match) return res.status(404).end();

    res.set('Content-Type', match[1]);
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(Buffer.from(match[2], 'base64'));
});

// GET /api/items/:id
router.get('/:id', async (req, res) => {
    const item = await Item.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { returnDocument: 'after' });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
});

// POST /api/items — create a listing for sale or borrow
router.post('/', protect, async (req, res) => {
    const error = validateItem(req.body);
    if (error) return res.status(400).json({ message: error });

    const item = new Item({ sellerId: req.user._id, sellerName: req.user.fullName });
    applyFields(item, req.body);
    await item.save();

    res.status(201).json(await Item.findById(item._id));
});

// PUT /api/items/:id — owner or admin
router.put('/:id', protect, async (req, res) => {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (!canManage(req.user, item)) {
        return res.status(403).json({ message: 'You can only edit your own listings' });
    }

    const error = validateItem(req.body, { partial: true });
    if (error) return res.status(400).json({ message: error });

    applyFields(item, req.body);

    if (req.body.status !== undefined) {
        if (!OWNER_STATUSES.includes(req.body.status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        item.status = req.body.status;
    }

    await item.save();
    res.json(await Item.findById(item._id));
});

// DELETE /api/items/:id — owner or admin
router.delete('/:id', protect, async (req, res) => {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (!canManage(req.user, item)) {
        return res.status(403).json({ message: 'You can only delete your own listings' });
    }

    await item.deleteOne();
    await Cart.updateMany({}, { $pull: { items: { itemId: item._id } } });
    res.json({ message: 'Listing deleted' });
});

module.exports = router;
