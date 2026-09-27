# Student MarketPlace

A campus marketplace where students **buy, sell and borrow** academic items: textbooks, gadgets, stationery and lab equipment.

Built with the **MERN stack**: MongoDB, Express, React and Node.js. Deployed on Vercel.

## Features

**Students**
- Register and log in with JWT auth and a "Remember me" option
- Browse 4 categories, filter by *For Sale* / *For Borrow*, and search listings
- List items **for sale** or **for lending**. A lending listing has a rent, a refundable deposit and a borrow period. Photos are compressed in the browser before upload.
- Edit, relist, mark as sold/borrowed, or delete your listings
- Cart and checkout with **Cash on Delivery**. Prices and totals are always calculated on the server.
- Checkout creates one order per seller, so each seller manages their own order
- Order tracking: `pending → confirmed → delivered` (or `cancelled`, which puts the items back on sale)
- Profile page: photo, name, phone, and change password
- Contact form

**Admin panel** (`/admin`)
- Dashboard with stats and recent orders
- Manage users (promote/demote admins), remove listings, update order status, read contact messages

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, React Router 7, React-Bootstrap / Bootstrap 5, Font Awesome, Vite |
| Backend | Node.js, Express 5, Mongoose 9, JWT, bcrypt, express-rate-limit |
| Database | MongoDB Atlas |
| Hosting | Vercel: static React build plus the Express API as a serverless function |

## Project structure

```
├── api/index.js        # Vercel serverless entry → exports the Express app
├── client/             # React app (Vite)
│   ├── public/images/  # Hero and category images
│   └── src/
│       ├── components/ # Navbar, modals, item cards, etc.
│       ├── context/    # Auth, cart, alerts and modal state
│       └── pages/      # Home, Category, Cart, Checkout, Orders, Profile, admin/…
├── server/             # Express API
│   ├── app.js          # Express app (routes, error handling)
│   ├── server.js       # Local dev entry (app.listen)
│   ├── models/         # User, Item, Cart, Order, ContactMessage
│   ├── routes/         # auth, items, cart, orders, contact, admin
│   └── scripts/        # seed.js (demo data), makeAdmin.js
└── vercel.json
```

## Run locally

Requires Node.js 20.19+ and a MongoDB connection string (a free MongoDB Atlas cluster works).

```bash
npm install
cp server/.env.example server/.env   # then fill in MONGO_URI and JWT_SECRET
npm run seed                         # optional: adds a demo seller and 12 sample listings
npm run dev                          # API on :5000, React on http://localhost:5173
```

Make yourself an admin: register on the site, then run

```bash
npm run make-admin -- you@example.com
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. On [vercel.com](https://vercel.com), click **Add New → Project** and import the repo. Leave the build settings as they are; `vercel.json` sets them.
3. Under **Environment Variables**, add:
   - `MONGO_URI`: your MongoDB Atlas connection string
   - `JWT_SECRET`: a long random string
4. Click **Deploy**.
5. In MongoDB Atlas → **Network Access**, allow `0.0.0.0/0`. Vercel's servers don't have fixed IP addresses.

## API overview

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/register`, `/api/auth/login` | Public |
| GET / PUT | `/api/auth/me`, `/api/auth/profile`, `/api/auth/password` | Logged in |
| GET | `/api/items?category=&type=&search=`, `/api/items/:id`, `/api/items/:id/image` | Public |
| POST / PUT / DELETE | `/api/items`, `/api/items/:id` | Owner or admin |
| GET / POST / DELETE | `/api/cart`, `/api/cart/:itemId` | Logged in |
| POST / GET | `/api/orders`, `/api/orders/my-orders`, `/api/orders/:id` | Buyer, seller or admin |
| PATCH | `/api/orders/:id/status` | Buyer (cancel) / seller or admin |
| POST | `/api/contact` | Public |
| GET / PATCH / DELETE | `/api/admin/...` | Admin |

## Future work

- Online payments (Razorpay) alongside Cash on Delivery
- Forgot-password emails and email notifications for orders
- Image hosting on a CDN (e.g. Cloudinary) instead of MongoDB
- Buyer–seller chat, and reviews and ratings
- Pagination and more search filters
