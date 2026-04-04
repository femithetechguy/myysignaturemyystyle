# Project Progress — Myy Signature Myy Style
Last updated: April 4, 2026

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

### Booking Modal — UX Consolidation
- [x] 3 modals (Booking → Confirmation → Success) merged into 2
  - Success view embedded inside confirmation modal via `confirmationStep: 'review' | 'confirmed'` state
  - Old standalone success modal removed
  - Done button resets all state and scrolls to top

### Services Data
- [x] `data/services.json` created — 44 services across 9 categories with `price_min`, `price_max`, `duration`, `images`
- [x] Hair Cut category: **Adult Haircut**, **Kids Haircut**, **Military Haircut**, **Fade** added (`cut_003`–`cut_006`)
- [x] All 44 services have Cloudinary public IDs wired in
- [x] 44 placeholder JPEGs generated in `public/assets/images/services/` via `scripts/generate-service-images.py`
- [x] `scripts/seed-services.py` — pandas script to regenerate `data/services.json`

### Gallery
- [x] `Gallery.tsx` fully rewritten — powered by `data/services.json` + Cloudinary
  - 4-col square grid (2 mobile, 3 tablet, 4 desktop)
  - Hover overlay shows service name + price
  - Category filter tabs auto-generated from service categories
  - **Lightbox modal**: prev/next arrows, dot indicators, counter, keyboard nav (← → Esc), body scroll lock
  - Modal shows: image, service name, category, description, price range, duration
- [x] `res.cloudinary.com` added to `next.config.js` `remotePatterns`
- [x] Modal details cutoff fixed (image uses `flex-shrink` instead of `flex-shrink-0`)
- [x] Gallery tiles changed from square to **4:5 portrait aspect ratio** (IG-style)
- [x] `unoptimized` prop added to both `<Image>` components — Cloudinary handles optimization, fixes "upstream response is invalid" error
- [x] `onError` fallback added — grid falls back to local placeholder JPEGs if Cloudinary image fails
- [x] All 44 Cloudinary public IDs verified and corrected via API (all return HTTP 200)
  - Root-level IDs only — `MyySignatureMyyStyle/` folder prefix stripped from all entries
  - Individual suffix typos corrected using live Cloudinary API response
  - `scripts/fetch-cloudinary-ids.py` — fetches all 181 assets from Cloudinary API, auto-matches to services
  - `scripts/fix-cloudinary-ids.py` — applies known-good ID mapping for all 44 services

### Booking Modal — Success View
- [x] Copy button added to booking reference block in the confirmed/success view
  - Reuses existing `copiedRef` / `setCopiedRef` state
  - Shows "✓ Copied!" for 2 seconds after click

### Instagram Integration
- No access to client IG account — integration deferred
- **Recommended approach when ready**: Behold.so embed widget (free tier, client self-serves login, one script tag to add)
- Alternative: client generates a Graph API long-lived token → `scripts/fetch-instagram-posts.js` → `data/instagram.json` → rendered in Gallery

### Hero & Storefront Images
- [x] `landing.png` hero background replaced with updated image (Next.js image cache cleared)
- [x] Hero image migrated to Cloudinary — `landing_m6le9k` (`f_auto,q_auto,w_1920`)
- [x] Local `/assets/images/others/landing.png` kept as `onError` fallback

### Contact Section
- [x] Storefront photo (`out_landing_vnkdxq`) added to Contact section below "Leave A Message" button
  - Migrated to Cloudinary — `out_landing_vnkdxq` (`f_auto,q_auto,w_900`)
  - Local file kept as `onError` fallback
- [x] **Copy** and **Directions** buttons added to the "Visit Us" address
  - Copy: writes address to clipboard, shows "Copied!" for 2 s
  - Directions: opens `maps.google.com/?q=<address>` — hands off to native Maps app on mobile

### Reviews Section
- [x] Typewriter animation on active review card — text types in at ~22 ms/char with blinking cursor
- [x] Auto-rotate active card every 6 s; clicking a card sets it as active
- [x] Active card: scaled up (`scale-105`), pulsing gold glow, larger glowing stars, accent-coloured author name
- [x] Inactive cards: dimmed to 60% opacity
- [x] Dot indicators below grid — active dot expands into a pill shape
- [x] New CSS keyframes added to `globals.css`: `reviewCursor`, `reviewGlow`

### Booking Modal — UX Fixes
- [x] Service category dropdown no longer pre-selects "Hair Cut" — shows `— Choose a Hair Service —` placeholder by default
- [x] Booking reference (`BK…`) generated the moment the confirmation modal opens — eliminates "Generating..." flash
- [x] Hamburger menu icon enlarged from `w-6 h-6` → `w-9 h-9` for easier tap on mobile

### Apply for Hairstylist Modal — Full Overhaul
- [x] **GA Cosmetology License field removed** — replaced with a small italic note that it may be requested during final selection
- [x] **Certifications & Education** replaced with tap-friendly pill checkboxes (2-col mobile, 3-col desktop):
  - Licensed Cosmetologist, Cosmetology School, Self Taught, Natural Hair Certified, Color Specialist, Braiding Certified, Extensions Certified, Locs Specialist, Advanced Workshops
- [x] **2-column desktop layout** — fields grouped in `md:grid-cols-2` rows to reduce scrolling
- [x] **Availability section** redesigned:
  - Day-of-week pill toggles (Mon–Sun)
  - Mini calendar for earliest start date (past dates disabled, selected date highlighted in accent)
- [x] **Form validation** matching booking modal pattern:
  - Inline red border + error message per required field
  - Red `⚠️` toast listing all missing fields (e.g. *"Still needed: your name, a valid email"*)
  - Auto-scrolls to first error element via `data-app-error` attribute
  - Inline errors clear as user types; toast dismisses after 4 s
- [x] **Input text colour** fixed — all apply form inputs/textareas now have `text-primary` so typed text is readable (was grey)
- [x] **Share button** added to each Open Positions card:
  - Always copies shareable text + `#careers` link to clipboard immediately
  - Also opens native OS share sheet on mobile (iMessage, WhatsApp, etc.)
  - Button briefly shows "Link Copied!" for 2.5 s
  - Dark `✓` toast shown on page: *"Link copied! Ready to share."*
  - Validation toast inside modal remains red `⚠️`; share toast uses dark primary colour

### Mobile Header — Hamburger Position Fix
- [x] Root cause identified: `absolute` positioning for mobile logo + hamburger inside `flex justify-center` caused layout shift on render
- [x] Header restructured — mobile uses `justify-between` with logo and hamburger as **in-flow flex children** (no `absolute`)
- [x] Desktop layout unchanged — logo stays `absolute left-8`, nav centered via `md:justify-center`
- [x] Hamburger `flex-shrink-0`; mobile logo `flex-shrink-0` — no reflow

### Email System (Nodemailer)
- [x] `nodemailer` already in `package.json` — no install needed
- [x] **6 HTML email templates** created in `emails/` folder (inline styles, email-client safe):
  - `appointment-confirmation-customer.html` — sent to customer on booking
  - `appointment-notification-admin.html` — sent to admin on booking
  - `application-confirmation-applicant.html` — sent to applicant on application submit
  - `application-notification-admin.html` — sent to admin on application submit
  - `contact-confirmation-visitor.html` — sent to visitor on contact form submit
  - `contact-notification-admin.html` — sent to admin on contact form submit
  - All templates use `{{double_brace}}` variables; admin templates link to `{{base_url}}/admin`
- [x] **`lib/mailer.ts`** — shared utility: creates transporter, loads & hydrates templates, sends via `sendMail()`
- [x] **3 new API routes** created:
  - `pages/api/contact.ts` — `POST /api/contact`
  - `pages/api/booking.ts` — `POST /api/booking`
  - `pages/api/application.ts` — `POST /api/application`
  - Each route sends 2 emails in parallel (`Promise.all`) — one to the user, one to admin
- [x] **Forms wired** to their API routes:
  - Contact form (`handleSubmitMessage`) — `fetch('/api/contact', ...)`
  - Booking "Complete Booking" button — `fetch('/api/booking', ...)`
  - Application form submit — `fetch('/api/application', ...)`
- [x] **`.env.local`** updated with all email config:
  - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, `EMAIL_ADMIN`
  - `NEXT_PUBLIC_SITE_URL` — controls the "View in Admin Panel" link in admin emails; set per environment
- [x] SMTP connection verified (`transporter.verify()` → ✅) and test email confirmed delivered
- [x] Public-facing email in `app.json` updated to `egwonookpako559@gmail.com`

---

## 🔄 In Progress / Needs Attention

### Database
- [ ] PostgreSQL is **not connected** — all admin data tabs return `ECONNREFUSED 127.0.0.1:5432`
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
- [x] `landing.png` hero background image replaced and migrated to Cloudinary
- [ ] Add real portfolio/gallery images to `public/assets/images/portfolio/` (currently 7 placeholder IG posts)
- [ ] Fill in `app.json` → `business.social.facebook` (currently empty string)
- [x] Hair Cut category expanded: **Adult Haircut**, **Kids Haircut**, **Military Haircut**, **Fade** added to `data/services.json` (44 services total)
  - `cut_003` renamed from "Haircut" → "Adult Haircut"
  - `cut_004` Kids Haircut ($25–$40, 45 min)
  - `cut_005` Military Haircut ($30–$45, 45 min)
  - `cut_006` Fade ($45–$65, 60 min)
- [x] 44 placeholder JPEGs regenerated in `public/assets/images/services/` (covers all services including 3 new haircut services)
- [x] Cloudinary public IDs wired into all 4 new haircut services in `data/services.json`
  - `hair_cut_adult_haircut_1_dm498g`
  - `hair_cut_kids_haircut_1_lemrhk`
  - `hair_cut_military_haircut_1_kax3ty`
  - `hair_cut_fade_1_kn74at`
- [ ] Review and finalise all service names, descriptions, and pricing in `data/services.json`
- [ ] Review and update staff bios / headshots
- [ ] Verify business address, phone, email are live and correct

### Booking System
- [ ] Wire booking form submissions to a backend endpoint (`pages/api/bookings.js` or similar)
  - Currently no API route handles `POST` booking data — form submissions go nowhere
- [x] Send confirmation email on booking — nodemailer wired, `POST /api/booking` sends customer + admin emails
- [x] Contact form email — `POST /api/contact` sends visitor confirmation + admin notification
- [x] Application form email — `POST /api/application` sends applicant confirmation + admin notification
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
