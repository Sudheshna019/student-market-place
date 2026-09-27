const rateLimit = require('express-rate-limit');

// Slows down password guessing and form spam. Limits are per IP.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again in a few minutes.' }
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many messages sent. Please try again later.' }
});

module.exports = { authLimiter, contactLimiter };
