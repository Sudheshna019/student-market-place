const ContactMessage = require('../models/ContactMessage');
const { str, isEmail } = require('../utils/validate');

// POST /api/contact
const sendMessage = async (req, res) => {
    const name = str(req.body.name);
    const email = str(req.body.email).toLowerCase();
    const subject = str(req.body.subject);
    const message = str(req.body.message);

    if (name.length < 2 || name.length > 60) return res.status(400).json({ message: 'Enter your name' });
    if (!isEmail(email)) return res.status(400).json({ message: 'Enter a valid email address' });
    if (subject.length < 3 || subject.length > 120) return res.status(400).json({ message: 'Subject must be 3-120 characters' });
    if (message.length < 10 || message.length > 2000) return res.status(400).json({ message: 'Message must be 10-2000 characters' });

    await ContactMessage.create({ name, email, subject, message, userId: req.user ? req.user._id : null });
    res.status(201).json({ message: "Thanks for reaching out! We'll get back to you soon." });
};

module.exports = { sendMessage };
