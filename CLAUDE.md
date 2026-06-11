# Myy Signature Myy Style — Project Context for Claude

## What This Project Is
Myy Signature Myy Style is a hair salon booking site based in Locust Grove, GA. Full-stack Next.js 14 app with a customer-facing landing page, online booking system, stylist profiles, and a multi-tab admin panel. Backend uses Neon PostgreSQL for live data (appointments, services, staff, reviews). Currently in active development — not yet deployed to production.

---

## Tech Stack
- **Framework:** Next.js 14 (mixed App Router + Pages Router), React 18, TypeScript
- **Styling:** Tailwind CSS — utility classes in JSX, global overrides in `src/app/globals.css`
- **Icons:** `react-icons` (`fi`, `si` packages)
- **Email:** Nodemailer via SMTP — 6 HTML templates in `emails/`, shared `lib/mailer.ts`
- **Database:** Neon PostgreSQL — connected via `pg` package
- **Image hosting:** Cloudinary (optimisation + CDN), local fallbacks in `public/assets/images/`
- **Auth:** JWT (`jsonwebtoken`) + `bcryptjs` — admin panel only
- **Deployment:** Vercel (not yet deployed)
- **Content:** `app.json` is the single source of truth for all public site copy and config

---

## Project Structure

```
src/app/                  — App Router pages
  layout.tsx              — root layout, metadata, OG tags
  page.tsx                — entire customer-facing SPA (single large file)
  globals.css             — global style overrides (Tailwind base is in tailwind.config.js)
  opengraph-image.tsx     — dynamic OG card via next/og (edge runtime, 1200×630)
  api/                    — App Router API stubs (mostly redirects to pages/api)
  about/ careers/ contact/ gallery/ services/ stylists/ book/  — shallow route shells

pages/api/                — Pages Router API routes (all real backend logic lives here)
  booking.ts              — POST: saves appointment to DB + sends 2 emails
  contact.ts              — POST: contact form → 2 emails
  application.ts          — POST: hairstylist application → 2 emails
  reviews.js              — GET: approved reviews from DB
  services.js             — GET: all services from DB
  staff.js                — GET: active staff from DB
  admin/
    login.js              — POST: bcrypt auth → JWT cookie
    users.js              — generic CRUD for all admin tabs (?table=X)
    stats.js              — GET: live row counts for dashboard
    policies.js           — GET/PUT: salon_policies + booking_disclaimer from business_settings

components/               — legacy component files (some still imported)
  admin/                  — all admin panel tab components (AdminLayout.js, tabs/*.js)
  Gallery.js / Hero.js / Reviews.js / Services.js

lib/
  mailer.ts               — shared email utility: load template, hydrate vars, sendMail()
  dbQueries.js            — DB query helpers (getActiveServices, getServicesByCategory, etc.)
  jwtMiddleware.js        — JWT verify middleware for admin routes
  config.ts               — getAppConfig(), getContent(), getGallery(), getCareers()

emails/                   — 6 HTML email templates (inline styles, {{double_brace}} vars)
  appointment-confirmation-customer.html
  appointment-notification-admin.html
  application-confirmation-applicant.html
  application-notification-admin.html
  contact-confirmation-visitor.html
  contact-notification-admin.html

app.json                  — ALL public site text, business info, services, disclaimer copy
config/admin.json         — admin panel tabs, theme, login UI config (13 tabs)
data/services.json        — 44 services across 9 categories (Cloudinary IDs, prices, durations)

dbquries/                 — SQL scripts
  setup_all.sql           — single idempotent script: all tables + migrations + seed data
  staff.sql               — staff table ALTER + seed (3 sample stylists)
  reviews.sql             — reviews table create + seed

scripts/                  — Python/Node utility scripts (Cloudinary, DB seeding, etc.)

public/assets/images/
  services/               — 44 placeholder JPEGs (Cloudinary fallback)
  others/                 — logo-main.svg, logo-icon.svg, favicon.svg, landing.png
  portfolio/              — 7 placeholder IG posts (real images TBD)
```

---

## Key Decisions & Patterns

### Content is JSON-driven
All public copy, business info, social links, services list, and disclaimer text live in `app.json`. Read via `lib/config.ts` helpers (`getAppConfig()`, `getContent()`, etc.). Never hardcode content in components — update `app.json`.

### Styling
Tailwind utility classes in JSX. Global CSS overrides in `src/app/globals.css`. No per-component CSS files. Custom keyframes (`reviewCursor`, `reviewGlow`, `fadeInUp`) defined in `globals.css`.

### Architecture: App Router + Pages Router (mixed)
- **Customer-facing routes** use Next.js 14 App Router (`src/app/`)
- **All API routes** use Pages Router (`pages/api/`) — this is intentional and should stay
- The entire customer site renders from one file: `src/app/page.tsx` (SPA with modals)

### Navigation (customer site)
- Sticky header: dark on hero, transitions to frosted glass on scroll via `is-scrolled` class (triggered at `scrollY > 50`)
- Mobile: `justify-between` flex header with in-flow logo + hamburger (not absolute positioned)
- Nav scroll uses `header.offsetHeight` dynamically — not hardcoded offset
- Center mobile branding is a `button` that scrolls to top, constrained to `left-16 right-12`

### Admin Panel
- 13 tabs: Dashboard · Customers · Orders · Services · Appointments · Staff · Applications · Reviews · Gallery · Contacts · Policies · Admin Users · Settings
- All tab data flows through `pages/api/admin/users.js?table=X` (generic CRUD)
- Login: `pages/api/admin/login.js` — bcrypt DB lookup → JWT cookie (not ENV var comparison)
- Dashboard: `pages/api/admin/stats.js` — live row counts from 9 tables
- Policies tab: reads/writes `business_settings` DB table via `pages/api/admin/policies.js`

### Database (Neon PostgreSQL)
- Connection via `pg` package, `DATABASE_URL` in `.env.local`
- All tables defined + seeded in `dbquries/setup_all.sql` — run once, fully idempotent
- Core tables: `services`, `staff`, `appointments`, `reviews`, `customers`, `business_settings`, `contact_submissions`, `career_applications`, `newsletter_subscribers`, `admins`
- Services now DB-driven (not from `data/services.json`) — fetched at runtime via `/api/services`
- Reviews fetched from `/api/reviews` — `app.json` reviews used only as initial state fallback

### Booking System
- Booking modal in `page.tsx` — stylist-first flow: select stylist → filters services by `staff_ids`
- `selectedBookingStylist` and `selectedBookingService` state control the two-panel modal
- On submit: `POST /api/booking` → saves to `appointments` table + sends 2 emails in parallel
- Booking reference (`BK…`) generated when confirmation modal opens — no flash
- Policy acceptance checkbox required; resets on all 5 close paths
- 2-modal flow: Booking modal → Confirmation modal (with embedded Success view)
- Booking disclaimer fetched live from `business_settings` DB — admin edits reflect immediately

### Email System
- `lib/mailer.ts` loads HTML template from `emails/`, hydrates `{{vars}}` + `{{#if}}` blocks, sends
- Business contact vars (`{{business_name}}`, `{{business_phone}}`, etc.) auto-injected from `app.json`
- `EMAIL_REPLY_TO` env var routes client replies to admin (not the sending SMTP address)
- All 6 templates: inline styles, no external CSS — email-client safe

### Gallery
- `src/app/` Gallery component — Cloudinary images with `onError` fallback to local placeholder JPEGs
- Tiles: 4:5 portrait aspect ratio (`aspect-[4/5]`), `unoptimized` prop (Cloudinary handles optimisation)
- Lightbox: keyboard nav (← → Esc), body scroll lock, dot indicators, service detail panel
- Category filter tabs auto-generated from service categories in DB

### Booking Modal — Service Filtering by Stylist
- `staff_ids JSONB` column on `services` table — empty array means available with any stylist
- `getServicesByCategory()` in `lib/dbQueries.js` filters by `staff_ids` when stylist is selected
- Category dropdown only shows categories with ≥1 service for the selected stylist

### OG / SEO
- `src/app/opengraph-image.tsx` — dynamic edge-rendered card (1200×630, dark brand background)
- `metadataBase` set from `NEXT_PUBLIC_SITE_URL` in `layout.tsx`

### SVG Logo System
- `public/assets/images/others/logo-main.svg` — horizontal wordmark (header desktop, footer)
- `public/assets/images/others/logo-icon.svg` — "M" monogram transparent bg (mobile header)
- `public/favicon.svg` — "M" on dark rounded square (browser tab)
- Developer credit: gold `</>` badge in footer copyright row → `fttgsolutions.com`

### Cloudinary
- Base URL: `res.cloudinary.com` — added to `next.config.js` `remotePatterns`
- Transform string used: `f_auto,q_auto,w_<size>` for all hero/storefront images
- Root-level public IDs only — NO `MyySignatureMyyStyle/` folder prefix in `data/services.json`

---

## Environment Variables
Stored in `.env.local` (gitignored) and Vercel dashboard when deployed:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon pooler connection string |
| `JWT_SECRET` | 64-byte secret for admin JWT signing |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Legacy local-only fallback (NOT used in prod — DB auth) |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_SECURE` | SMTP server config |
| `EMAIL_USER` / `EMAIL_PASS` | SMTP credentials |
| `EMAIL_FROM` | Sending address |
| `EMAIL_ADMIN` | Admin notification destination |
| `EMAIL_REPLY_TO` | Reply-To header (falls back to `EMAIL_ADMIN`) |
| `NEXT_PUBLIC_SITE_URL` | Site URL for metadata + admin email links |

`.env.example` committed with documented placeholders.

---

## How to Run Locally
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # verify production build
```

Clean build: `rm -rf .next && npm run build`

Reset DB (first time or after schema changes):
```bash
psql $DATABASE_URL -f dbquries/setup_all.sql
```

---

## Git / Linear Integration

**Commit message format:**
```
Fixes FTTG-XX: what you changed   ← closes the Linear issue
Ref FTTG-XX: what you changed     ← progress, issue stays open
```

- `Fixes` / `Closes` / `Resolves` → closes and logs in Linear activity
- `Ref` / `Refs` → links commit, issue stays open
- Day-to-day work on `develop` branch — no feature branches for small changes

---

## Pending Work (from PROGRESS.md)
- [ ] Real portfolio/gallery images (currently 7 placeholders)
- [ ] Real staff headshots + bios via admin Staff tab
- [ ] `business.social.facebook` in `app.json` is empty string
- [ ] Stripe integration for 25% deposit (`pages/api/payments/create-checkout.js`)
- [ ] Available-dates logic — block already-booked slots on booking calendar
- [ ] Admin: appointment confirm/reject/reschedule workflow
- [ ] Admin Settings tab — connect font/colour customisation to live CSS variables
- [ ] Admin Gallery tab — Cloudinary/S3 image upload
- [ ] Admin Reviews tab — approve/reject moderation
- [ ] Production deployment (Vercel), custom domain, SSL, env vars
- [ ] Cross-browser QA, accessibility audit, Lighthouse audit
- [ ] Validate `careers@myysignaturemyystyle.com` inbox is live

---

> **Read `PROGRESS.md` for full session history, completed work, and detailed pending items.**
