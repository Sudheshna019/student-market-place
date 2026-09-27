const express = require('express');
const { optionalAuth } = require('../middleware/authMiddleware');
const { contactLimiter } = require('../middleware/rateLimit');
const { sendMessage } = require('../controllers/contactController');

const router = express.Router();

router.post('/', contactLimiter, optionalAuth, sendMessage);

module.exports = router;
