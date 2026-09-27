// Promote an existing account to admin.
// Usage (from the project root): npm run make-admin -- someone@example.com
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

async function main() {
    const email = (process.argv[2] || '').trim().toLowerCase();
    if (!email) {
        console.error('Usage: npm run make-admin -- <email>');
        process.exit(1);
    }

    await connectDB();
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { returnDocument: 'after' });

    if (!user) {
        console.error(`No account found for ${email}. Register on the site first, then run this again.`);
        process.exitCode = 1;
    } else {
        console.log(`${user.fullName} <${user.email}> is now an admin.`);
    }
    await mongoose.disconnect();
}

main().catch(async (err) => {
    console.error(err.message);
    await mongoose.disconnect();
    process.exit(1);
});
