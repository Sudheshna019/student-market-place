const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getStats,
    getUsers,
    updateUserRole,
    getAllItems,
    removeItem,
    getAllOrders,
    getMessages,
    updateMessageStatus,
    deleteMessage
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/items', getAllItems);
router.delete('/items/:id', removeItem);
router.get('/orders', getAllOrders);
router.get('/messages', getMessages);
router.patch('/messages/:id', updateMessageStatus);
router.delete('/messages/:id', deleteMessage);

module.exports = router;
