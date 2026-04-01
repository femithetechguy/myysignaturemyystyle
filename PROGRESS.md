# Project Progress — Myy Signature Myy Style
Last updated: April 1, 2026

---

## ✅ Completed

### Environment & Setup
- [x] `npm install` — dependencies installed, `npm run dev` working
- [x] `.env.local` created with `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and a 64-byte `JWT_SECRET`
- [x] `.env.example` already present as reference template

### Mobile Responsiveness (6 fixes — committed `f256b72` on `develop`)
- [x] Hero H1 font size reduced on small screens
- [x] Hamburger menu tap target enlarged to 44×44px minimum
- [x] Benefits grid fixed from forced 6-col to responsive breakpoints
- [x] Calendar gap/overflow corrected on narrow viewports
- [x] FABs (chat + scroll-to-top) repositioned above iOS safe area
- [x] Gallery component: added `sm:grid-cols-2` breakpoint

### Admin Panel
- [x] All "Company Name" placeholder text replaced with "Myy Signature Myy Style" in `config/admin.json`
  - `app.name`, `adminLogin.subtitle`, `adminLogin.footer`
- [x] Admin login working with env-var credentials (`dev` / `dev` locally)
- [x] JWT auth flow verified end-to-end
- [x] 11 admin tabs configured in `config/admin.json`:
  Dashboard · Customers · Orders · Services · Appointments · Staff · Applications · Reviews · Gallery · Contacts · Admin Users

### Booking System — Policy & UX
- [x] `booking_disclaimer` block added to `app.json` with 4 fields:
  - 25% non-refundable deposit note
  - 24-hour cancellation policy
  - 15-minute late arrival / forfeit policy
  - Consent confirmation line
- [x] Disclaimer rendered in the **booking modal** as an amber policy box with 3 bullet points
- [x] Disclaimer consent line rendered in the **confirmation modal**
- [x] **Policy acceptance checkbox** added to the booking modal
  - `w-6 h-6` (24px) — thumb-friendly tap target
  - Full label row also tappable (`<label>` wraps checkbox + text)
  - "Confirm Booking" button disabled until checkbox is checked
  - Checkbox state resets to unchecked whenever the booking modal is closed (all 5 close paths handled)

### Payment Options — Zelle & Cash App
- [x] `zelle` and `cashapp` entries added to `app.json → integrations.payment_gateway`
  - `zelle_id`: `zelleid@gmail.com`
  - `cashapp_id`: `$cashapid`
- [x] Payment options displayed in **booking modal** (below policy box) and **confirmation modal** (below disclaimer)
  - Official brand icons via `react-icons/si` — `SiZelle` (purple) and `SiCashapp` (green)
  - Cards stack vertically on mobile (`grid-cols-1`), side-by-side on `sm+` (`sm:grid-cols-2`)
- [x] `deposit_note` in `app.json` updated to inform users payment options are listed below
- [x] Confirmation modal includes booking reference in payment memo hint

---

## 🔄 In Progress / Needs Attention

### Database
- [ ] PostgreSQL is **not connected** — all admin data tabs return `ECONNREFUSED 127.0.0.1:5432`
  - Services dropdown in the booking modal is empty as a result
  - Need to provision a local or remote Postgres instance and run migrations
  - Schema SQL files exist in `scripts/` — run `scripts/create-frontend-tables.sql` and `scripts/seed-frontend-data.sql` to bootstrap

### Admin API Coverage
- [ ] API routes only exist for: `customers`, `orders`, `products`, `users`, `login`
- [ ] **Missing API routes** for tabs that exist in the UI:
  - `pages/api/admin/appointments.js`
  - `pages/api/admin/services.js`
  - `pages/api/admin/staff.js`
  - `pages/api/admin/applications.js`
  - `pages/api/admin/reviews.js`
  - `pages/api/admin/gallery.js`
  - `pages/api/admin/contacts.js`

---

## 📋 Yet To Do

### Content & Branding
- [ ] Replace placeholder logo files — `logo_trans.png` and `logo_opoque.jpg` in `public/assets/images/others/`
- [ ] Replace `landing.png` hero background image
- [ ] Add real portfolio/gallery images to `public/assets/images/portfolio/` (currently 7 placeholder IG posts)
- [ ] Fill in `app.json` → `business.social.facebook` (currently empty string)
- [ ] Review and finalise all service names, descriptions, and pricing in `app.json → services.default_services`
- [ ] Review and update staff bios / headshots
- [ ] Verify business address, phone, email are live and correct

### Booking System
- [ ] Wire booking form submissions to a backend endpoint (`pages/api/bookings.js` or similar)
  - Currently no API route handles `POST` booking data — form submissions go nowhere
- [ ] Send confirmation email on booking (nodemailer or third-party, e.g. Resend / SendGrid)
- [ ] Integrate payment processor for the 25% deposit (Stripe recommended)
  - Stripe setup: create `pages/api/payments/create-checkout.js`, add `STRIPE_SECRET_KEY` to `.env.local`
- [ ] Build available-dates logic (block already-booked slots on the booking calendar)
- [ ] Admin: allow staff to confirm / reject / reschedule appointments from the Appointments tab

### Admin Panel
- [ ] Create the 7 missing API routes listed above
- [ ] Admin Settings tab — connect font/colour customisation to live CSS variables
- [ ] Admin Gallery tab — support image upload to cloud storage (e.g. Cloudinary / S3)
- [ ] Admin Reviews tab — add approve/reject moderation workflow
- [ ] Secure admin credentials for production (switch from plain-text env vars to hashed passwords with bcrypt)

### Contact & Careers
- [ ] Wire contact form to a backend endpoint and send email notification
- [ ] Wire careers application form submissions to `career_applications` DB table / send email alert
- [ ] Validate `careers@myysignaturemyystyle.com` inbox is live

### Infrastructure & Deployment
- [ ] Provision production PostgreSQL database (PlanetScale, Supabase, Railway, or self-hosted)
- [ ] Set production environment variables on hosting platform
- [ ] Deploy to production (Vercel recommended for Next.js)
- [ ] Configure custom domain (`myysignaturemyystyle.com`)
- [ ] Set up SSL certificate (automatic on Vercel)
- [ ] Add `robots.txt` and `sitemap.xml` for SEO
- [ ] Set up error monitoring (Sentry or similar)
- [ ] Set up uptime monitoring

### QA & Polish
- [ ] Cross-browser test (Safari iOS, Chrome Android, Chrome desktop, Safari macOS)
- [ ] Accessibility audit (focus states, ARIA labels, colour contrast)
- [ ] Lighthouse performance / SEO audit
- [ ] Test full booking flow end-to-end once DB is connected
- [ ] Test admin login with production credentials
- [ ] Change `.env.local` `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `dev`/`dev` before go-live

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `app.json` | All public site text, services, branding, disclaimer copy |
| `config/admin.json` | Admin panel tabs, theme, login UI text |
| `src/app/page.tsx` | Entire customer-facing single-page site |
| `src/lib/config.ts` | Helper functions that read `app.json` |
| `pages/api/admin/login.js` | Admin auth endpoint (JWT) |
| `lib/jwtMiddleware.js` | JWT verify middleware for protected routes |
| `.env.local` | Local secrets (gitignored) |
| `scripts/create-frontend-tables.sql` | DB schema bootstrap |
| `scripts/seed-frontend-data.sql` | DB seed data |
