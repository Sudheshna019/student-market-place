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
student-marketplace/
├── client/                    # Frontend: React (Vite)
│   ├── public/images/         # Hero and category images
│   ├── index.html
│   ├── vite.config.js         # Dev server + /api proxy to :5000
│   └── src/
│       ├── components/        # Navbar, Footer, ItemCard, modals, OrdersList, …
│       ├── context/           # AuthContext, CartContext, UIContext, AlertContext
│       ├── hooks/             # useAdminData
│       ├── pages/             # Home, Category, Cart, Checkout, MyOrders, Profile, …
│       │   └── admin/         # Dashboard, Users, Products, Orders, Messages
│       ├── services/api.js    # fetch wrapper that talks to the Express API
│       ├── utils/helpers.js   # categories, price/date formatting, image compression
│       ├── App.jsx            # Routes
│       ├── main.jsx           # Entry point + providers
│       └── index.css
├── server/                    # Backend: Node.js + Express + MongoDB
│   ├── config/db.js           # MongoDB (Mongoose) connection
│   ├── controllers/           # Request logic: auth, item, cart, order, contact, admin
│   ├── middleware/            # JWT auth (protect, adminOnly), rate limiting
│   ├── models/                # Mongoose schemas: User, Item, Cart, Order, ContactMessage
│   ├── routes/                # URL → controller mapping
│   ├── utils/validate.js      # Input validation helpers
│   ├── scripts/               # seed.js (demo data), makeAdmin.js
│   ├── app.js                 # Express app (middleware, routes, error handler)
│   ├── server.js              # Starts the server locally (app.listen)
│   └── .env.example           # Environment variables template
├── api/index.js               # Vercel serverless entry (exports the Express app)
├── vercel.json                # Vercel build + routing config
├── package.json               # npm workspaces: client + server
└── README.md
```

Request flow: **React page → `services/api.js` → Express route → middleware → controller → Mongoose model → MongoDB Atlas**.

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
