// Adds a demo seller account and sample listings so a fresh database isn't empty.
// Usage (from the project root): npm run seed
// Safe to run more than once: it skips seeding if the demo seller already has listings.
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Item = require('../models/Item');

// Demo account used only for sample data. Change it after seeding if the site is public.
const DEMO_SELLER = {
    fullName: 'Campus Demo Seller',
    email: 'demo.seller@studentmarket.test',
    password: 'DemoSeller@2026'
};

const MIME = { '.avif': 'image/avif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

const SAMPLE_ITEMS = [
    { name: 'Engineering Mathematics (B.S. Grewal)', category: 'textbooks', price: 350, condition: 'Good', image: 'books.avif', description: '44th edition, a few highlighted pages, no torn pages. Great for 1st and 2nd year.' },
    { name: 'Semester Study Material Bundle', category: 'textbooks', price: 40, type: 'borrow', deposit: 200, rentalPeriod: '2 weeks', condition: 'Like New', image: 'study-materials.avif', description: 'Printed notes and previous year papers for 3rd semester CSE. Borrow for exam prep.' },
    { name: 'Casio fx-991EX Scientific Calculator', category: 'gadgets', price: 900, condition: 'Like New', image: 'scientific-calculator.avif', description: 'Exam-approved scientific calculator, works perfectly, comes with cover.' },
    { name: 'Wireless Headphones', category: 'gadgets', price: 1200, condition: 'Good', image: 'headphones.avif', description: 'Bluetooth over-ear headphones, 20h battery backup. Charging cable included.' },
    { name: 'Portable Bluetooth Speaker', category: 'gadgets', price: 30, type: 'borrow', deposit: 500, rentalPeriod: '3 days', condition: 'Good', image: 'speaker.avif', description: 'Good for hostel parties and college events. Borrow per day.' },
    { name: 'Digital Wrist Watch', category: 'gadgets', price: 650, condition: 'Good', image: 'watch.jpg', description: 'Water resistant digital watch with alarm and stopwatch.' },
    { name: 'Highlighter Set (6 colours)', category: 'stationery', price: 120, condition: 'New', image: 'highlighters.avif', description: 'Unopened pack of pastel highlighters.' },
    { name: 'Ruled Notebooks (pack of 5)', category: 'stationery', price: 200, condition: 'New', image: 'notebooks.avif', description: '200-page long notebooks, unused.' },
    { name: 'Gel Pen Set', category: 'stationery', price: 90, condition: 'New', image: 'pens.avif', description: 'Pack of 10 blue and black gel pens.' },
    { name: 'Mini Drafter for Engineering Drawing', category: 'stationery', price: 25, type: 'borrow', deposit: 300, rentalPeriod: '1 month', condition: 'Good', image: 'drafters.jpeg', description: 'Mini drafter in good condition for ED classes. Borrow for the semester.' },
    { name: 'Glass Beaker Set', category: 'lab-equipment', price: 450, condition: 'Like New', image: 'beakers.avif', description: 'Borosilicate beakers: 50ml, 100ml, 250ml and 500ml.' },
    { name: 'White Lab Coat (M)', category: 'lab-equipment', price: 20, type: 'borrow', deposit: 250, rentalPeriod: '1 week', condition: 'Good', image: 'white-apron.jpeg', description: 'Clean cotton lab apron, medium size. Borrow for practical exams.' }
];

function imageDataUrl(file) {
    const fullPath = path.join(__dirname, 'seed-images', file);
    const mime = MIME[path.extname(file).toLowerCase()];
    return `data:${mime};base64,${fs.readFileSync(fullPath).toString('base64')}`;
}

async function main() {
    await connectDB();

    let seller = await User.findOne({ email: DEMO_SELLER.email });
    if (!seller) {
        seller = await User.create({
            fullName: DEMO_SELLER.fullName,
            email: DEMO_SELLER.email,
            password: await bcrypt.hash(DEMO_SELLER.password, 10)
        });
        console.log(`Created demo seller ${DEMO_SELLER.email}`);
    }

    if (await Item.exists({ sellerId: seller._id })) {
        console.log('Demo listings already exist, nothing to do.');
        return;
    }

    await Item.insertMany(
        SAMPLE_ITEMS.map(({ image, ...item }) => ({
            type: 'sale',
            ...item,
            image: imageDataUrl(image),
            hasImage: true,
            sellerId: seller._id,
            sellerName: seller.fullName
        }))
    );
    console.log(`Added ${SAMPLE_ITEMS.length} sample listings.`);
}

main()
    .catch((err) => {
        console.error(err.message);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
