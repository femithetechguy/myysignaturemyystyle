-- ============================================================================
-- STAFF TABLE: Add new columns + Seed sample stylists
-- Safe to re-run: ALTER TABLE uses IF NOT EXISTS, INSERT uses ON CONFLICT
-- Run AFTER create-frontend-tables.sql
-- ============================================================================

-- Add new columns if table was already created without them
ALTER TABLE staff ADD COLUMN IF NOT EXISTS instagram_handle VARCHAR(100);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS booking_slug VARCHAR(100);

-- ============================================================================
-- Seed: Sample Stylists (replace with real staff before go-live)
-- ============================================================================

INSERT INTO staff (staff_id, name, title, email, phone, bio, photo, instagram_handle, booking_slug, specialties, is_bookable, status, display_order)
VALUES (
    'staff_001',
    'Jairo',
    'Color Specialist',
    'jairo@myysignaturemyystyle.com',
    '(678) 663-5999',
    'Originally from New York, Jairo brings 7 years of experience as a colorist to the team. Jairo specializes in lived-in blondes, brunettes, fantasy colors, and vivid reds! Beyond the chair you can find him practicing yoga, cooking, or spending time with his two puppies.',
    '',
    'jmenendezcolour',
    'jairo',
    '["Color", "Blondes", "Fantasy Color", "Vivid Reds", "Brunettes"]'::jsonb,
    true,
    'active',
    1
)
ON CONFLICT (staff_id) DO UPDATE SET
    name             = EXCLUDED.name,
    title            = EXCLUDED.title,
    phone            = EXCLUDED.phone,
    bio              = EXCLUDED.bio,
    photo            = EXCLUDED.photo,
    instagram_handle = EXCLUDED.instagram_handle,
    booking_slug     = EXCLUDED.booking_slug,
    specialties      = EXCLUDED.specialties,
    display_order    = EXCLUDED.display_order,
    updated_at       = CURRENT_TIMESTAMP;

INSERT INTO staff (staff_id, name, title, email, phone, bio, photo, instagram_handle, booking_slug, specialties, is_bookable, status, display_order)
VALUES (
    'staff_002',
    'Andrea',
    'Senior Colorist',
    'andrea@myysignaturemyystyle.com',
    '(443) 570-7274',
    'Originally from London, England, color is Andrea''s specialty! With over 15 years of experience as a L''Oreal Professional colorist, her work includes freelancing for magazine and TV. Andrea''s passion for art and painting can be seen through her work as she is truly a master of her craft.',
    '',
    'andreamitchelluk',
    'andrea',
    '["Color", "L''Oreal Color", "Magazine Work", "TV Styling"]'::jsonb,
    true,
    'active',
    2
)
ON CONFLICT (staff_id) DO UPDATE SET
    name             = EXCLUDED.name,
    title            = EXCLUDED.title,
    phone            = EXCLUDED.phone,
    bio              = EXCLUDED.bio,
    photo            = EXCLUDED.photo,
    instagram_handle = EXCLUDED.instagram_handle,
    booking_slug     = EXCLUDED.booking_slug,
    specialties      = EXCLUDED.specialties,
    display_order    = EXCLUDED.display_order,
    updated_at       = CURRENT_TIMESTAMP;

INSERT INTO staff (staff_id, name, title, email, phone, bio, photo, instagram_handle, booking_slug, specialties, is_bookable, status, display_order)
VALUES (
    'staff_003',
    'Char',
    'Licensed Stylist',
    'char@myysignaturemyystyle.com',
    '(770) 744-3095',
    'Originally from New York, Char brings a Trinidadian flare and spunky vibe to the salon! Char has been a licensed stylist for 15 years and specializes in blowouts, silk press, color, pixie cuts, and haircutting. Char loves sneakers, nature documentaries, trying new foods and hiking in her spare time.',
    '',
    'chardryce',
    'char',
    '["Blowouts", "Silk Press", "Color", "Pixie Cuts", "Haircutting"]'::jsonb,
    true,
    'active',
    3
)
ON CONFLICT (staff_id) DO UPDATE SET
    name             = EXCLUDED.name,
    title            = EXCLUDED.title,
    phone            = EXCLUDED.phone,
    bio              = EXCLUDED.bio,
    photo            = EXCLUDED.photo,
    instagram_handle = EXCLUDED.instagram_handle,
    booking_slug     = EXCLUDED.booking_slug,
    specialties      = EXCLUDED.specialties,
    display_order    = EXCLUDED.display_order,
    updated_at       = CURRENT_TIMESTAMP;

DO $$
BEGIN
    RAISE NOTICE 'staff: columns added (if needed), 3 sample stylists seeded';
END $$;
