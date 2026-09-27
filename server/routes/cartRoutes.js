const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');

const router = express.Router();

router.use(protect);

router.get('/', getCart);
router.post('/:itemId', addToCart);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
