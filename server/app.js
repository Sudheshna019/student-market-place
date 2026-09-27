const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

// Vercel sits behind a proxy; needed for correct client IPs in rate limiting.
app.set('trust proxy', 1);
app.disable('x-powered-by');

// In production the React app and the API share one domain, so CORS is only
// needed when the frontend is hosted elsewhere (set CLIENT_ORIGIN for that).
if (process.env.CLIENT_ORIGIN) {
    app.use(cors({ origin: process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim()) }));
}

app.use(express.json({ limit: '4mb' }));

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'not connected'
    });
});

// Make sure the database is connected before any route touches a model.
app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection error:', error.message);
        res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });
    }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use('/api', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
});

// Express 5 forwards errors thrown in async handlers here.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid ID' });
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((e) => e.message).join(', ');
        return res.status(400).json({ message });
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Upload too large. Please use a smaller image.' });
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Invalid JSON body' });
    }
    console.error(err);
    res.status(err.status || 500).json({ message: err.expose ? err.message : 'Something went wrong on the server' });
});

module.exports = app;
