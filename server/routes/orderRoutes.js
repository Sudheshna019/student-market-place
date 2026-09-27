const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { placeOrder, getMyOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');

const router = express.Router();

router.use(protect);

router.post('/', placeOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
