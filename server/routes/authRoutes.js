const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimit');
const { str, isEmail, isPhone, isImageDataUrl } = require('../utils/validate');

const router = express.Router();

const MIN_PASSWORD = 6;
const MAX_PROFILE_PHOTO = 400 * 1024;

function authResponse(user) {
    return { token: generateToken(user._id), user: user.toPublic() };
}

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
    const fullName = str(req.body.fullName);
    const email = str(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (fullName.length < 2 || fullName.length > 60) {
        return res.status(400).json({ message: 'Full name must be 2-60 characters' });
    }
    if (!isEmail(email)) {
        return res.status(400).json({ message: 'Enter a valid email address' });
    }
    if (password.length < MIN_PASSWORD) {
        return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD} characters` });
    }

    if (await User.exists({ email })) {
        return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
        fullName,
        email,
        password: await bcrypt.hash(password, 10)
    });

    res.status(201).json(authResponse(user));
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
    const email = str(req.body.email).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter your email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.json(authResponse(user));
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
    res.json({ user: req.user.toPublic() });
});

// PUT /api/auth/profile — name, phone and profile photo
router.put('/profile', protect, async (req, res) => {
    const { fullName, phone, photoURL } = req.body;

    if (fullName !== undefined) {
        const name = str(fullName);
        if (name.length < 2 || name.length > 60) {
            return res.status(400).json({ message: 'Full name must be 2-60 characters' });
        }
        req.user.fullName = name;
    }

    if (phone !== undefined) {
        const value = str(phone);
        if (value && !isPhone(value)) {
            return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });
        }
        req.user.phone = value;
    }

    if (photoURL !== undefined) {
        if (photoURL !== '' && (!isImageDataUrl(photoURL) || photoURL.length > MAX_PROFILE_PHOTO)) {
            return res.status(400).json({ message: 'Profile photo must be an image under 300 KB' });
        }
        req.user.photoURL = photoURL;
    }

    await req.user.save();
    res.json({ user: req.user.toPublic() });
});

// PUT /api/auth/password
router.put('/password', protect, authLimiter, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD) {
        return res.status(400).json({ message: `New password must be at least ${MIN_PASSWORD} characters` });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (typeof currentPassword !== 'string' || !(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
});

module.exports = router;
