# Project Progress — Myy Signature Myy Style
Last updated: April 8, 2026 (session 3)

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

### Email System — Polish & Fixes (commits `e49f854`–`98fd0c8`)
- [x] **Conditional template rendering** — `mailer.ts` now processes `{{#if var}}...{{else}}...{{/if}}` blocks via regex before simple `{{var}}` replacement — eliminates raw template syntax in sent emails
- [x] **Email color contrast** improved across all 6 templates:
  - Header category labels on dark bg: `#8C6E5A` → `#C8A882`
  - Table row labels on light bg: `#8C6E5A` → `#5C3D2E`
  - Fallback/empty text: `#8C6E5A` → `#6B4226`
  - Footer secondary text on dark: `#6B5040` → `#A08060`
- [x] **Reply-To header** set on all outgoing mail — client replies route to admin (`fttgsolutions@gmail.com`), not to the sending SMTP address
- [x] **`EMAIL_REPLY_TO`** added as dedicated env var in `.env.local` (falls back to `EMAIL_ADMIN` if unset)
- [x] **Business contact vars injected from `app.json`** — all 6 templates fully dynamic, no hardcoded contact info:
  - `{{business_phone}}`, `{{business_phone_raw}}`, `{{business_email}}`, `{{business_address}}`, `{{business_name}}`
  - Auto-injected in every `sendMail()` call from `appConfig.business.*`
- [x] **Booking policy section** added to appointment email templates:
  - Customer confirmation: full "Booking Policy — Accepted" table with 3 bullets (deposit / cancellation / late arrival)
  - Admin notification: compact "Policy Acknowledged by Client" sidebar with left border accent

### Mobile Navigation — Scroll & Header Fixes (commits `1730681`–`d82a5d2`)
- [x] **Mobile nav link scroll fixed** — `preventDefault` + 50 ms deferred `scrollTo` prevents menu-close re-render from interrupting hash navigation
- [x] **Fixed-header offset** — scroll target uses `header.offsetHeight` dynamically (not hardcoded) so content lands below the sticky header
- [x] **Mobile menu top padding** increased to `pt-28` to fully clear the actual header height
- [x] **Business name always visible in mobile header** — `absolute` centered div shows `{content.navigation.brand}` + "— Hair Salon —" subtext at all times; `pointer-events-none` prevents tap-through interference

### Database — Neon PostgreSQL
- [x] `DATABASE_URL` added to `.env.local` — Neon pooler endpoint (`ep-little-block-a4d8gzbg-pooler.us-east-1.aws.neon.tech`)
- [x] `scripts/create-frontend-tables.sql` fixed and ready to run:
  - `services` table schema corrected: `price_min`/`price_max`/`images JSONB` (was `price`/`image_url`)
  - `UNIQUE(staff_id, day_of_week)` constraint added to `staff_availability`
  - All triggers wrapped with `DROP TRIGGER IF EXISTS` (safe to re-run)
- [x] `scripts/seed-frontend-data.sql` fixed: replaced 22 generic placeholder services with all 44 real services from `data/services.json`
- [x] `dbquries/admins.sql` updated:
  - `dev` user → `fttgsolutions@gmail.com`; `admin` user → `egwonookpako559@gmail.com`
  - `ON CONFLICT DO UPDATE SET email` (was `DO NOTHING`)
  - Real bcrypt hashes generated via `bcryptjs`: `dev`/`dev` and `admin`/`admin1$`
- [x] `dbquries/reviews.sql` created — standalone create + seed for reviews table (3 reviews from `app.json`)
- [x] Redundant SQL files deleted: `scripts/fix-career-table.sql`, `dbquries/customers.sql`, `dbquries/general_queries.sql`
- [x] `lib/dbQueries.js` updated — `getActiveServices()` now returns `price_min`, `price_max`, `images`

### Frontend — DB-Driven Data (replaces JSON files)
- [x] `pages/api/reviews.js` **new** — public endpoint: `SELECT … FROM reviews WHERE status = 'approved'` ordered by featured first
- [x] `src/lib/config.ts` — `getServices()` and `import services from 'data/services.json'` removed; services now always come from DB
- [x] `src/app/page.tsx` — services + reviews fetched from `/api/services` and `/api/reviews` on mount
  - `useState([])` for services; `useState(content.reviews_section.reviews)` as fallback for reviews until DB resolves
  - All `content.reviews_section.reviews.map()` references replaced with `reviews.map()`
  - Typewriter effect and auto-rotate use `reviews` state

### Salon Policies — Content & DB
- [x] Full salon policies document captured in `app.json → content.salon_policies` (9 sections: booking, confirmation, cancellation, deposits, late_arrival, payment, salon_experience, service_guarantee, promise)
- [x] `booking_disclaimer` updated in `app.json`: `cancellation_policy` → 12 hours (was 24); `deposit_percentage` → null with `deposit_note`; `deposit_non_refundable: true`
- [x] `dbquries/business_settings.sql` **new** — creates `business_settings` table + seeds `salon_policies` and `booking_disclaimer` as JSONB rows (`ON CONFLICT DO UPDATE`)
- [x] `pages/api/admin/policies.js` **new** — GET returns both settings; PUT updates either by `setting_key` with allowed-key validation
- [x] `components/admin/tabs/AdminPolicies.js` **new** — full admin edit UI:
  - Section 1: Booking Modal Disclaimer (4 textarea fields) — own Save button
  - Section 2: Full Salon Policies (page title, intro, 9 sections with editable bullet arrays and text) — own Save button
  - Success toast on save, graceful empty state pointing to seed SQL if table not yet populated
- [x] `config/admin.json` — `policies` tab added (13 tabs total); `admin.policies` config block added
- [x] `components/admin/AdminLayout.js` — `AdminPolicies` imported and registered in `TAB_COMPONENTS`

### Booking Modal — Policy UX Enhancement
- [x] Booking policy box expanded from 3 bullets to 5:
  - Deposit required
  - Cancellation < 12 hours = deposit charged + no-show no refund
  - Late arrival grace period
  - *New*: Failure to confirm = auto cancellation (from `salon_policies.confirmation`)
  - *New*: No personal payments to stylists (from `salon_policies.payment`)
- [x] **"📄 Read Full Salon Policies →"** full-width amber button added below bullets
- [x] Full-policy modal (`z-70`) opens on button click, layered above booking modal:
  - All 9 policy sections rendered with headings, bullets, and text paragraphs
  - Sticky header + sticky Close button at bottom
  - Click-outside to dismiss

### Mobile Header — Height & Hamburger Fixes (session 3)
- [x] Mobile header padding reduced: `py-5` → `py-3` (desktop `md:py-6` unchanged)
- [x] Mobile logo height reduced: `h-20` → `h-16` (desktop `h-28` unchanged)
- [x] Mobile menu dropdown top offset updated: `pt-28` → `pt-[88px]` to match new header height
- [x] Center branding (`div.pointer-events-none`) converted to a `button` that scrolls to top on tap
- [x] Hamburger menu restored — center branding button constrained to `left-16 right-12` so it no longer covers the hamburger tap target

### Connect With Us Section (session 3)
- [x] New section (`id="connect"`) added between Contact and Footer on the landing page
  - Left: phone mockup image (`msms_ig_image.png`) — actual IG profile screenshot
  - Right: Instagram (gradient icon), Email (amber icon), Phone (muted icon) — all tappable links
  - Uses `business.contact.email` and `business.contact.phone` from `app.json` (not `business.email`)
- [x] "Connect With Us" link added to Footer Quick Links in `app.json` → `#connect`

### Stylists Section (session 3)
- [x] "Stylists" nav item added to `app.json` between Services and Gallery → `#stylists`
- [x] `scripts/create-frontend-tables.sql` — `instagram_handle VARCHAR(100)` and `booking_slug VARCHAR(100)` columns added to `staff` table definition
- [x] `dbquries/staff.sql` **new** — `ALTER TABLE … ADD COLUMN IF NOT EXISTS` (safe re-run) + seeds 3 sample stylists (`staff_001` Jairo, `staff_002` Andrea, `staff_003` Char) with `ON CONFLICT DO UPDATE`
- [x] `pages/api/staff.js` **new** — public GET endpoint: `SELECT … FROM staff WHERE status = 'active' ORDER BY display_order ASC, id ASC`
- [x] Full Stylists section (`id="stylists"`) built in `page.tsx` between Services and Gallery:
  - `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` card grid
  - Card: `aspect-[3/4]` portrait photo with `onError` initials fallback
  - Name, title, bio, specialties pills (`bg-amber-100 text-amber-800`)
  - Phone (`FiPhone` + `tel:`) and Instagram (`FiInstagram` + `instagram.com/`) contact links
  - **Book Now** button → `/book_${booking_slug}` (per-stylist booking page)
  - Empty state: "Stylists coming soon" message

### Admin Panel — Full DB Integration
- [x] `pages/api/admin/login.js` rewritten — now queries `admins` table + `bcryptjs.compare()` (was plain-text ENV var comparison)
- [x] `pages/api/admin/users.js` bugs fixed:
  - Parameter shadow in `handleGet` removed
  - `service_id` special-case exception removed from UPDATE field filter
  - POST method + `handleCreate()` function added
  - JSONB serialization fix: arrays/objects now `JSON.stringify()`'d before passing to `pg` (fixes 500 on save)
- [x] `pages/api/admin/stats.js` **new file** — returns live row counts for 9 tables via parallel `COUNT(*)` queries
- [x] `components/admin/tabs/AdminDashboard.js` — fetches `/api/admin/stats` on mount, displays real DB counts as clickable nav cards

---

## 🔄 In Progress / Needs Attention

### Database — SQL Scripts (run via Azure Data Studio)
- [ ] Run scripts in this order:
  1. `dbquries/admins.sql` — creates admins table + seeds `dev` and `admin` users
  2. `scripts/create-frontend-tables.sql` — creates all 15 app tables
  3. `scripts/seed-frontend-data.sql` — seeds 44 services + gallery + reviews
  4. `dbquries/orders.sql` — orders-specific setup
  5. `dbquries/products.sql` — products-specific setup
  6. `dbquries/reviews.sql` — creates reviews table + seeds 3 reviews from `app.json`
  7. `dbquries/business_settings.sql` — creates business_settings table + seeds `salon_policies` + `booking_disclaimer`
  8. `dbquries/staff.sql` — adds `instagram_handle`/`booking_slug` columns + seeds 3 sample stylists

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
- [ ] Build individual `/book_[slug]` pages (e.g. `/book_jairo`) — Stylists section Book Now buttons link to these; pages don't exist yet
- [ ] Add real Cloudinary photo URLs to the 3 seeded staff records (currently empty strings — update via admin Staff tab once DB is seeded)
- [ ] Integrate payment processor for the 25% deposit (Stripe recommended)
  - Stripe setup: create `pages/api/payments/create-checkout.js`, add `STRIPE_SECRET_KEY` to `.env.local`
- [ ] Build available-dates logic (block already-booked slots on the booking calendar)
- [ ] Admin: allow staff to confirm / reject / reschedule appointments from the Appointments tab

### Admin Panel
- [x] All 7 previously missing API routes now handled by `users.js` generic API (Services, Staff, Appointments, Applications, Reviews, Gallery, Contacts all route through `/api/admin/users?table=X`)
- [x] Admin auth secured with bcrypt + DB (no longer uses plain-text ENV vars)
- [x] **Policies tab** fully implemented — reads/writes `business_settings` table via `/api/admin/policies`
- [ ] Admin Settings tab — connect font/colour customisation to live CSS variables
- [ ] Admin Gallery tab — support image upload to cloud storage (e.g. Cloudinary / S3)
- [ ] Admin Reviews tab — add approve/reject moderation workflow
- [ ] `AdminSettings` and `AdminPages` — currently read from `config/admin.json` only; decide if settings should persist to `business_settings` DB table
- [ ] Booking modal: make disclaimer content dynamic (fetch `booking_disclaimer` from DB so admin edits reflect live on site)

### Contact & Careers
- [x] Contact form wired to `POST /api/contact` — sends visitor + admin emails
- [x] Application form wired to `POST /api/application` — sends applicant + admin emails
- [ ] Validate `careers@myysignaturemyystyle.com` inbox is live

### Infrastructure & Deployment
- [x] Production PostgreSQL provisioned — Neon (`myysignaturemyystyle_dev` database)
- [ ] Run all SQL scripts to create and seed tables (see In Progress above)
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
