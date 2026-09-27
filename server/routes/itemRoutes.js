const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/items
// @desc    Get all items with optional filters (category, type, search)
router.get('/', async (req, res) => {
    try {
        const { category, type, search, status } = req.query;
        let query = { status: status || 'available' };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (type && (type === 'sale' || type === 'borrow')) {
            query.type = type;
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { category: searchRegex }
            ];
        }

        const items = await Item.find(query).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ message: 'Server error fetching items' });
    }
});

// @route   GET /api/items/seller/my-listings
// @desc    Get logged in user's listed items
router.get('/seller/my-listings', protect, async (req, res) => {
    try {
        const items = await Item.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user listings' });
    }
});

// @route   GET /api/items/:id
// @desc    Get single item by ID
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        item.views = (item.views || 0) + 1;
        await item.save();
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching item' });
    }
});

// @route   POST /api/items
// @desc    Create a new item for sale or borrow
router.post('/', protect, async (req, res) => {
    try {
        const { name, price, category, description, condition, type, deposit, rentalPeriod, image } = req.body;

        if (!name || price === undefined || !category || !description) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const newItem = new Item({
            name,
            price: parseFloat(price),
            category,
            description,
            condition: condition || 'Good',
            type: type || 'sale',
            deposit: deposit ? parseFloat(deposit) : 0,
            rentalPeriod: rentalPeriod || '',
            image: image || '',
            sellerId: req.user._id,
            sellerName: req.user.fullName,
            status: 'available'
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ message: 'Server error creating item listing' });
    }
});

// @route   PUT /api/items/:id
// @desc    Update an item
router.put('/:id', protect, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (item.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to edit this item' });
        }

        Object.assign(item, req.body);
        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating item' });
    }
});

// @route   DELETE /api/items/:id
// @desc    Delete an item
router.delete('/:id', protect, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (item.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this item' });
        }

        await item.deleteOne();
        res.json({ message: 'Item removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item' });
    }
});

module.exports = router;
