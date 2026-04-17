# MAISON SHOP

Minimal fullstack fashion e-commerce site built with Next.js App Router, MongoDB, Cloudinary, and Vercel-ready route handlers.

## Stack

- Frontend: Next.js App Router + Tailwind CSS
- Backend: Next.js Route Handlers
- Database: MongoDB via Mongoose
- Image storage: Cloudinary
- Auth: simple JWT for admin
- Deployment target: Vercel

## Features

- Customer storefront with seeded products visible on first run
- Product variants with size, color, and stock
- No customer login required
- Persistent cart, checkout, vouchers, reviews, FOMO, and viewed products
- Optional address image upload for Taiwan-friendly checkout
- Vietnamese default + Traditional Chinese toggle
- Admin login, product CRUD, orders, vouchers, FOMO, and store config

## Local Run

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
cp .env.example .env
```

3. Fill in the required variables:

```env
ADMIN_JWT_SECRET=change-this-secret
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/maisonshop
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Start development:

```bash
npm run dev
```

This project uses `next dev --webpack` for local development to avoid Turbopack HMR reload loops that can happen on some Windows setups.

5. Open:

- Storefront: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

## Admin Login

- Username: `admin`
- Password: `Sinhnam2000@@`

## MongoDB Data Model

### Product

- `id`
- `name`
- `description`
- `price`
- `images`
- `category`
- `genderType`
- `isOversize`
- `status`
- `discountPercent`
- `isFreeShip`
- `variants`
- `reviews`
- `createdAt`

### Order

- `id`
- `name`
- `phone`
- `addressText`
- `addressImage`
- `items`
- `total`
- `currency`
- `voucherCode`
- `voucherDiscount`
- `createdAt`

### Voucher

- `id`
- `code`
- `discountPercent`
- `isActive`
- `maxUsage`
- `usedCount`
- `createdAt`

### Supporting collections

- `settings`
- `fomo`
- `counters`

## Cloudinary Uploads

- Admin product image uploads go through `/api/upload`
- Customer address images are uploaded during order submit when Cloudinary credentials are present
- If Cloudinary is temporarily unavailable, address images fall back to the submitted data URI so checkout is not blocked

## Environment Notes

- `MONGODB_URI` is required for all server data access
- `CLOUDINARY_*` variables are required for product uploads
- `NEXT_PUBLIC_BASE_URL` should match your deployed Vercel domain in production
- `ADMIN_JWT_SECRET` should be a strong secret in every environment

## Vercel Deployment

1. Push the project to a Git provider connected to Vercel.
2. Create a Vercel project from the repository.
3. Add all environment variables from `.env.example`.
4. Deploy.

This app uses stateless route handlers and a cached Mongoose connection, so it is compatible with Vercel serverless execution.

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
