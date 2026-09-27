const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 60 },
        email: { type: String, required: true, trim: true, lowercase: true },
        subject: { type: String, required: true, trim: true, maxlength: 120 },
        message: { type: String, required: true, maxlength: 2000 },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        status: { type: String, enum: ['new', 'read'], default: 'new' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
