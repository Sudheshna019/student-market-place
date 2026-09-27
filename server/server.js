// Local development entry point. On Vercel, api/index.js imports app.js directly.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}/api/health`);
    connectDB()
        .then((conn) => console.log(`MongoDB connected: ${conn.connection.host}`))
        .catch((err) => console.error(`MongoDB connection failed: ${err.message}`));
});
