# DPM Custom Prints and Ink Supplies

Premium custom printing ecommerce platform for **DPM Custom Prints** — personalized products, custom design workflows, consultation booking, and a full admin CMS.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, MongoDB/Mongoose, NextAuth credentials auth, GSAP motion, and project-root `/uploads` media storage.

## Route map

### Public
| Route | Description |
|-------|-------------|
| `/` | Homepage with cinematic intro (once per session) |
| `/about` | About the brand |
| `/services` | Service categories |
| `/services/[slug]` | Dynamic service detail pages |
| `/shop` | Product catalogue with filters |
| `/shop/[slug]` | Product detail, customization, add to cart |
| `/customize` | Personalization studio |
| `/gallery` | Portfolio with lightbox |
| `/testimonials` | Customer testimonials |
| `/faqs` | Searchable FAQ accordion |
| `/booking` | Consultation **request** (not confirmed appointment) |
| `/contact` | Contact form |
| `/blog`, `/blog/[slug]` | Design journal |
| `/cart`, `/checkout`, `/order/success` | Commerce flow |
| `/shipping-returns`, `/privacy`, `/terms` | Legal/utility |

### Admin (`/admin/login`)
Dashboard, Pages, Products, Orders, Custom Orders, Services, Pricing, Gallery, Testimonials, FAQs, Bookings, Blogs, Messages, Settings.

## Prerequisites

- **Node.js** 20+
- **MongoDB** 7+ (local or Docker)
- **MongoDB Compass** (optional GUI — connect to the same URI)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env
# Edit .env — set AUTH_SECRET, ADMIN_PASSWORD, etc.

# 3. Start MongoDB (Docker)
docker compose up -d

# 4. Seed database (idempotent — skips existing records)
npm run seed

# 5. Create admin user
npm run create-admin

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and admin at [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## MongoDB & Compass

Default URI:

```
mongodb://127.0.0.1:27017/dpm_custom_prints
```

In Compass: **New Connection** → paste the URI → connect → browse `dpm_custom_prints` collections.

## Environment variables

See `.env.example` for the full list. Key values:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string |
| `AUTH_SECRET` | NextAuth session secret (long random string) |
| `NEXTAUTH_URL` | Full site URL (must match deployed domain) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial admin (create-admin script) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |
| `UPLOAD_DIR` | `./uploads` — public & private media root |
| `STRIPE_*` | Optional Stripe Checkout (disabled when empty) |
| `SMTP_*` | Optional email notifications |
| `ORDER_NOTIFICATION_EMAIL` | Order/booking notification recipient |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest unit tests |
| `npm run seed` | Seed database (idempotent) |
| `npm run create-admin` | Create admin from env vars |
| `npm run uploads:cleanup:dry` | Dry-run orphan public media cleanup |

## Commerce behavior

### Fixed-price vs quote-only
- **Fixed-price** products (mug, tumbler, pens with min 5, etc.) can be added to cart and checked out.
- **Quote-only** products (Blanket Cover, Couch Pillow Case, Cap, Hoodie) show **Contact for price** — never $0 or invented amounts.
- Mixed carts: fixed items proceed to checkout; quote items create a **Custom Quote Request**.

### Payment
- **Default:** Manual invoice — order saved with `awaiting_payment` status. Customer receives confirmation; final totals including shipping/tax confirmed before payment.
- **Optional Stripe:** Set `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` to enable Stripe Checkout.

### Currency
Seeded as **CAD** (Canadian phone number). **Confirm currency before launch** in Settings.

## Media storage

```
/uploads/public/2026/08/<uuid>.webp     → served via /media/[...path]
/uploads/private/customer-artwork/...   → admin-only download, never public
```

- Runtime uploads are gitignored.
- **Production requires persistent disk** on a Node/VPS — ephemeral serverless storage is not durable.
- Logo: `public/brand/dpm-logo.png` (supplied client asset on white background).

## Logo replacement

Replace `public/brand/dpm-logo.png` with an approved variant. Update path in **Admin → Settings → General** if using a different file. Present on a white/light plaque — the supplied PNG is not transparent.

## Optional SMTP

When `SMTP_*` variables are set, the platform records requests in MongoDB and can be extended with `nodemailer` for live delivery. Without SMTP, forms truthfully state the request was **saved**, not emailed.

## Pre-launch checklist

- [ ] **Confirm CAD currency** (or update in Settings)
- [ ] Add prices for Blanket Cover, Couch Pillow Case, Cap, Hoodie
- [ ] Verify social platform + URL for `Dpm.customprints` (handle seeded; URL/platform unset)
- [ ] Replace demo product photos with real photography
- [ ] Replace demo testimonials and draft blog posts
- [ ] Define shipping, tax, returns, turnaround in Settings
- [ ] Confirm accepted artwork formats and policies
- [ ] Set production `AUTH_SECRET` and `ADMIN_PASSWORD`
- [ ] Configure persistent `/uploads` volume on server

## Production deploy

```bash
npm run build
npm start
```

Or with Docker (persistent `./uploads` volume required):

```bash
docker build -t dpm-custom-prints .
docker run -p 3000:3000 --env-file .env -v dpm_uploads:/app/uploads dpm-custom-prints
```

Before going live, set `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` to your real domain (e.g. `https://yourdomain.com`).

## Verification (last run)

```bash
npm test          # 4/4 pricing tests pass
npm run build     # Production build succeeds (72 routes)
```

## Brand

**DPM Custom Prints and Ink Supplies**  
Email: dpmsuppliesinfo@gmail.com  
Phone: +1 613-970-3046  
WhatsApp: https://wa.me/16139703046

Headline: *DPM Custom Printing — Bring Your Ideas to Life.*
