const jwt = require('jsonwebtoken');
const User = require('../models/User');

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not set. Add it to server/.env (local) or the Vercel project settings.');
    }
    return secret;
}

function generateToken(id) {
    return jwt.sign({ id }, getJwtSecret(), { expiresIn: '7d' });
}

async function userFromRequest(req) {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return null;

    const token = header.slice(7);
    const decoded = jwt.verify(token, getJwtSecret());
    return User.findById(decoded.id);
}

const protect = async (req, res, next) => {
    let user;
    try {
        user = await userFromRequest(req);
    } catch (error) {
        return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    if (!user) {
        return res.status(401).json({ message: 'Please log in to continue' });
    }
    req.user = user;
    next();
};

// Attaches req.user when a valid token is present, but never blocks the request.
const optionalAuth = async (req, res, next) => {
    try {
        req.user = await userFromRequest(req);
    } catch {
        req.user = null;
    }
    next();
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') return next();
    return res.status(403).json({ message: 'Admin access required' });
};

module.exports = { protect, optionalAuth, adminOnly, generateToken };
