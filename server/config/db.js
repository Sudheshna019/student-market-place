const mongoose = require('mongoose');

// Reuse one connection across requests. On Vercel each serverless instance
// keeps module state between invocations, so this avoids reconnecting per request.
const cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not set. Add it to server/.env (local) or the Vercel project settings.');
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
            .catch((err) => {
                cached.promise = null;
                throw err;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = connectDB;
