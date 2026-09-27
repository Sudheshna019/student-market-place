const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true, maxlength: 60 },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        photoURL: { type: String, default: '' },
        phone: { type: String, default: '' }
    },
    { timestamps: true }
);

userSchema.methods.toPublic = function toPublic() {
    return {
        _id: this._id,
        fullName: this.fullName,
        email: this.email,
        role: this.role,
        photoURL: this.photoURL,
        phone: this.phone,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.model('User', userSchema);
