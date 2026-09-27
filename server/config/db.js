const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_marketplace');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.log('Ensure MongoDB service is running locally or MONGO_URI in .env is set to your MongoDB Atlas connection string.');
    }
};

module.exports = connectDB;
