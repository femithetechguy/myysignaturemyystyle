# Frontend Database Scripts

This folder contains SQL scripts to set up all database tables needed for the frontend application.

## Overview

The frontend app requires 15 main tables to support all features described in `app.json`:

1. **services** - Hair salon services (cuts, color, braids, treatments, etc.)
2. **staff** - Stylists and staff members with availability schedules
3. **customers** - Customer profiles with preferences and history
4. **appointments** - Booking system with date/time/status tracking
5. **payments** - Payment records with transaction details
6. **reviews** - Customer reviews and ratings
7. **gallery** - Portfolio images and Instagram posts
8. **contact_submissions** - Contact form submissions
9. **newsletter_subscribers** - Email newsletter subscriptions
10. **career_applications** - Job applications from stylists wanting to join the team
11. **business_settings** - Business info, hours, contact (from app.json)
12. **app_settings** - Branding, features, SEO config (from app.json)
13. **service_packages** - Bundled service packages with discounts
14. **staff_availability** - Detailed weekly schedules for each staff member
15. **promotional_codes** - Promo codes and discounts

## Scripts

### 1. `create-frontend-tables.sql`

Creates all 15 tables with:
- Proper indexes for performance
- Foreign key relationships
- JSONB columns for flexible data storage
- Auto-updating `updated_at` timestamps
- Constraints and validations

**Run this first.**

```bash
psql -U your_username -d your_database -f scripts/create-frontend-tables.sql
```

### 2. `seed-frontend-data.sql`

Seeds the database with initial data from `app.json`:
- 22 services with pricing
- 1 staff member (Egwono Okpako)
- Business settings (hours, contact, location)
- App settings (branding, features)
- 11 gallery items
- 3 sample reviews
- 3 service packages
- Staff availability schedule
- 2 promotional codes
- 3 sample career applications

**Run this after `create-frontend-tables.sql`.**

```bash
psql -U your_username -d your_database -f scripts/seed-frontend-data.sql
```

## Using Environment Variables

If you're using `.env.local` for database credentials:

```bash
# Load environment variables
source .env.local

# Run scripts using environment variables
psql $DATABASE_URL -f scripts/create-frontend-tables.sql
psql $DATABASE_URL -f scripts/seed-frontend-data.sql
```

## Integration with Admin Panel

After running these scripts, update `config/admin.json` to map the tables:

```json
{
  "database": {
    "tables": {
      "services": "services",
      "staff": "staff",
      "customers": "customers",
      "appointments": "appointments",
      "payments": "payments",
      "reviews": "reviews",
      "gallery": "gallery",
      "contacts": "contact_submissions",
      "newsletter": "newsletter_subscribers",
      "careers": "career_applications",
      "packages": "service_packages",
      "promo_codes": "promotional_codes"
    }
  }
}
```

## Next Steps

1. **Create API endpoints** - Build API routes in `pages/api/` to serve this data to the frontend
2. **Update admin panel** - Add tabs in admin.json for managing each table
3. **Connect frontend** - Update `src/lib/config.ts` to fetch data from API instead of app.json
4. **Test CRUD operations** - Verify admin can create/read/update/delete records

## Table Relationships

```
customers ──┬──→ appointments ──→ payments
            │         ↓
            │      services
            │         ↓
            │       staff
            │
            └──→ reviews ──→ services
                            ↓
                          staff
```

## Important Notes

- All tables use `SERIAL` for auto-incrementing IDs
- Each table has a unique string identifier (e.g., `service_id`, `staff_id`)
- `JSONB` columns allow flexible data storage for metadata and preferences
- Timestamps are auto-managed with triggers
- Status fields use VARCHAR for flexibility (can be customized per app)

## Verification

After running both scripts, verify with:

```sql
-- List all tables
\dt

-- Count records in each table
SELECT 'services' as table_name, COUNT(*) FROM services
UNION ALL
SELECT 'staff', COUNT(*) FROM staff
UNION ALL
SELECT 'gallery', COUNT(*) FROM gallery
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'business_settings', COUNT(*) FROM business_settings
UNION ALL
SELECT 'app_settings', COUNT(*) FROM app_settings
UNION ALL
SELECT 'career_applications', COUNT(*) FROM career_applications;
```

Expected output:
- services: 22
- staff: 1
- gallery: 11
- reviews: 3
- business_settings: 6
- app_settings: 4
- career_applications: 3

## Troubleshooting

### "relation already exists"
Tables already exist. Either:
- Drop existing tables: `DROP TABLE table_name CASCADE;`
- Skip creation (scripts use `IF NOT EXISTS`)

### "duplicate key value violates unique constraint"
Data already seeded. Scripts use `ON CONFLICT DO NOTHING` to prevent duplicates.

### Permission denied
Ensure your PostgreSQL user has CREATE and INSERT privileges:
```sql
GRANT ALL PRIVILEGES ON DATABASE your_database TO your_username;
```

## Cleanup

To remove all frontend tables and start fresh:

```sql
DROP TABLE IF EXISTS promotional_codes CASCADE;
DROP TABLE IF EXISTS staff_availability CASCADE;
DROP TABLE IF EXISTS service_packages CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;
DROP TABLE IF EXISTS business_settings CASCADE;
DROP TABLE IF EXISTS career_applications CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS contact_submissions CASCADE;
DROP TABLE IF EXISTS gallery CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS services CASCADE;
```

Then re-run both scripts.
