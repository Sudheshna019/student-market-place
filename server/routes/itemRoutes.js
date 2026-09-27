const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    getItems,
    getMyItems,
    getItemImage,
    getItemById,
    createItem,
    updateItem,
    deleteItem
} = require('../controllers/itemController');

const router = express.Router();

router.get('/', getItems);
router.get('/mine', protect, getMyItems);
router.get('/:id/image', getItemImage);
router.get('/:id', getItemById);
router.post('/', protect, createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
