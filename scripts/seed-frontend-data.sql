-- Frontend Application Database Seed Script
-- Run this AFTER create-frontend-tables.sql to populate with initial data from app.json

-- ============================================================================
-- SEED SERVICES FROM APP.JSON
-- ============================================================================
INSERT INTO services (service_id, name, description, duration, price, category, display_order, status) VALUES
('service_001', 'Women''s Haircut', 'Professional women''s cut with expert styling', 60, 50.00, 'Cuts', 1, 'active'),
('service_002', 'Men''s Haircut', 'Classic men''s cut with fade and finish', 30, 35.00, 'Cuts', 2, 'active'),
('service_003', 'Kids Haircut', 'Professional haircut for children', 30, 28.00, 'Cuts', 3, 'active'),
('service_004', 'Full Head Color', 'Complete hair coloring service', 120, 95.00, 'Color', 4, 'active'),
('service_005', 'Highlights/Balayage', 'Partial highlights or balayage coloring', 120, 85.00, 'Color', 5, 'active'),
('service_006', 'Color Touch-Up', 'Root touch-up and color refresh', 90, 65.00, 'Color', 6, 'active'),
('service_007', 'Ombre/Sombre', 'Gradient color technique for modern look', 150, 110.00, 'Color', 7, 'active'),
('service_008', 'Blow Dry Style', 'Professional blow dry and styling', 45, 45.00, 'Styling', 8, 'active'),
('service_009', 'Blowout', 'Voluminous blowout styling', 45, 50.00, 'Styling', 9, 'active'),
('service_010', 'Braids', 'Various braiding styles and extensions', 180, 120.00, 'Braids', 10, 'active'),
('service_011', 'Box Braids', 'Box braids with extensions', 240, 150.00, 'Braids', 11, 'active'),
('service_012', 'Cornrows', 'Cornrows with or without extensions', 180, 100.00, 'Braids', 12, 'active'),
('service_013', 'Twists', 'Senegalese twists or two-strand twists', 180, 110.00, 'Braids', 13, 'active'),
('service_014', 'Goddess Braids', 'Elegant goddess braid styles', 150, 130.00, 'Braids', 14, 'active'),
('service_015', 'Locs Installation', 'Install or retwist locs', 180, 120.00, 'Locs', 15, 'active'),
('service_016', 'Loc Retwist', 'Retwist and maintain locs', 120, 80.00, 'Locs', 16, 'active'),
('service_017', 'Hair Treatment', 'Deep conditioning or keratin treatment', 60, 60.00, 'Treatments', 17, 'active'),
('service_018', 'Silk Press', 'Relaxer-free straightening treatment', 90, 75.00, 'Treatments', 18, 'active'),
('service_019', 'Scalp Treatment', 'Therapeutic scalp massage and treatment', 45, 50.00, 'Treatments', 19, 'active'),
('service_020', 'Hair Extension Installation', 'Install hair extensions (tape-in, sew-in, clip-in)', 120, 150.00, 'Extensions', 20, 'active'),
('service_021', 'Weave Removal & Install', 'Remove existing weave and install new weave', 180, 140.00, 'Extensions', 21, 'active'),
('service_022', 'Wig Styling', 'Cut, style, and color wig to preference', 60, 65.00, 'Styling', 22, 'active')
ON CONFLICT (service_id) DO NOTHING;

-- ============================================================================
-- SEED STAFF FROM APP.JSON
-- ============================================================================
INSERT INTO staff (
    staff_id, 
    name, 
    title, 
    email, 
    phone, 
    bio, 
    photo, 
    specialties, 
    availability, 
    is_bookable,
    display_order,
    status
) VALUES (
    'staff_001',
    'Egwono Okpako',
    'Owner & Lead Stylist',
    'egwono@myysignaturemyystyle.com',
    '209-362-8295',
    'Passionate hair stylist with expertise in all hair types and textures. Specializing in cuts, color, braids, and natural hair care.',
    './assets/images/team/egwono.jpg',
    '[]'::jsonb,
    '{
        "monday": "09:00-18:00",
        "tuesday": "09:00-18:00",
        "wednesday": "09:00-18:00",
        "thursday": "09:00-18:00",
        "friday": "09:00-18:00",
        "saturday": "10:00-16:00",
        "sunday": "closed"
    }'::jsonb,
    true,
    1,
    'active'
)
ON CONFLICT (staff_id) DO NOTHING;

-- ============================================================================
-- SEED BUSINESS SETTINGS FROM APP.JSON
-- ============================================================================
INSERT INTO business_settings (setting_key, setting_value, description, is_active) VALUES
(
    'business_info',
    '{
        "name": "Myy Signature Myy Style Salon",
        "businessId": "EGWONO-001",
        "address": "668 Peeksville Road, Locust Grove, GA 30248",
        "county": "Henry County",
        "state": "Georgia",
        "country": "United States",
        "timezone": "America/Chicago"
    }'::jsonb,
    'Primary business information',
    true
),
(
    'contact',
    '{
        "phone": "209-362-8295",
        "email": "info@myysignaturemyystyle.com",
        "website": "https://www.myysignaturemyystyle.com"
    }'::jsonb,
    'Contact information',
    true
),
(
    'social',
    '{
        "instagram": "https://www.instagram.com/myysignaturemyystyle",
        "facebook": ""
    }'::jsonb,
    'Social media links',
    true
),
(
    'hours',
    '{
        "monday": "09:00-18:00",
        "tuesday": "09:00-18:00",
        "wednesday": "09:00-18:00",
        "thursday": "09:00-18:00",
        "friday": "09:00-18:00",
        "saturday": "10:00-16:00",
        "sunday": "closed"
    }'::jsonb,
    'Business hours of operation',
    true
),
(
    'booking_settings',
    '{
        "enabled": true,
        "type": "custom",
        "multi_staff": true,
        "buffer_time": 15,
        "cancellation_policy": "24_hours_notice",
        "rescheduling": true,
        "waitlist": true
    }'::jsonb,
    'Booking system configuration',
    true
),
(
    'payment_settings',
    '{
        "enabled": true,
        "processors": ["stripe", "square", "paypal"],
        "deposit_required": true,
        "deposit_percentage": 50,
        "full_payment_option": true,
        "accepted_cards": ["visa", "mastercard", "amex", "discover"],
        "currencies": ["USD"]
    }'::jsonb,
    'Payment processing configuration',
    true
)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- SEED APP SETTINGS FROM APP.JSON
-- ============================================================================
INSERT INTO app_settings (setting_key, setting_value, description, is_active) VALUES
(
    'branding',
    '{
        "theme": "Warm Elegance - Sophisticated & Refined",
        "colors": {
            "primary": "#2a2420",
            "primary_name": "Warm Brown",
            "secondary": "#b8a89a",
            "secondary_name": "Warm Tan",
            "accent": "#a89880",
            "accent_name": "Muted Gold",
            "accent_light": "#e8d8d0",
            "background": "#1a1a1a",
            "text_dark": "#1a1a1a",
            "text_light": "#f5f5f5",
            "success": "#6B9E7F",
            "error": "#C1666B",
            "warning": "#D4A373",
            "info": "#7B9FC9"
        },
        "typography": {
            "primary_font": "Trebuchet MS",
            "secondary_font": "Arial",
            "headings": "Trebuchet MS",
            "body": "Trebuchet MS"
        }
    }'::jsonb,
    'Brand colors and typography',
    true
),
(
    'features',
    '{
        "booking_system": true,
        "payment_processing": true,
        "contact_forms": true,
        "newsletter": true,
        "social_media": true,
        "notifications": true,
        "customer_engagement": true
    }'::jsonb,
    'Enabled application features',
    true
),
(
    'seo',
    '{
        "enabled": true,
        "sitemap": true,
        "robots_txt": true,
        "meta_tags": {
            "title": "Myy Signature Myy Style Salon - Book Your Appointment Online",
            "description": "Premium salon services in Locust Grove, GA. Book hair styling, coloring, nails, and more. Fast, easy online booking with secure payment.",
            "keywords": "salon, hair styling, coloring, nails, booking, Locust Grove, Henry County"
        }
    }'::jsonb,
    'SEO configuration',
    true
),
(
    'notifications',
    '{
        "appointment_reminders": true,
        "sms_enabled": true,
        "email_notifications": true,
        "push_notifications": true
    }'::jsonb,
    'Notification settings',
    true
)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================================
-- SEED GALLERY ITEMS FROM APP.JSON
-- ============================================================================
INSERT INTO gallery (gallery_id, title, description, category, image_url, display_order, status, tags) VALUES
('gal_001', 'Box Braids', 'Neat and uniform box braids with decorative beads', 'Braids', '/assets/images/portfolio/braids-1.jpg', 1, 'active', '["braids", "protective styles"]'::jsonb),
('gal_002', 'Crown Braids', 'Elegant crown braid design for special occasions', 'Braids', '/assets/images/portfolio/braids-2.jpg', 2, 'active', '["braids", "special occasion"]'::jsonb),
('gal_003', 'Glam Waves', 'Beautiful salon waves with lasting volume', 'Styling', '/assets/images/portfolio/style-1.jpg', 3, 'active', '["styling", "waves"]'::jsonb),
('gal_004', 'Sleek Blowout', 'Smooth and shiny blowout with professional finish', 'Styling', '/assets/images/portfolio/style-2.jpg', 4, 'active', '["styling", "blowout"]'::jsonb),
('gal_005', 'Hair Treatment', 'Deep conditioning treatment for healthy, shiny hair', 'Treatments', '/assets/images/portfolio/treatment-1.jpg', 5, 'active', '["treatment", "conditioning"]'::jsonb),
('gal_006', 'Instagram Post 1', 'Featured work from our Instagram', 'Featured', '/assets/images/portfolio/ig-post-1.jpg', 6, 'active', '["instagram", "featured"]'::jsonb),
('gal_007', 'Instagram Post 2', 'Featured work from our Instagram', 'Featured', '/assets/images/portfolio/ig-post-2.jpg', 7, 'active', '["instagram", "featured"]'::jsonb),
('gal_008', 'Instagram Post 3', 'Featured work from our Instagram', 'Featured', '/assets/images/portfolio/ig-post-3.jpg', 8, 'active', '["instagram", "featured"]'::jsonb),
('gal_009', 'Instagram Post 4', 'Featured work from our Instagram', 'Featured', '/assets/images/portfolio/ig-post-4.jpg', 9, 'active', '["instagram", "featured"]'::jsonb),
('gal_010', 'Instagram Post 5', 'Featured work from our Instagram', 'Featured', '/assets/images/portfolio/ig-post-5.jpg', 10, 'active', '["instagram", "featured"]'::jsonb),
('gal_011', 'Instagram Post 6', 'Featured work from our Instagram', 'Featured', '/assets/images/portfolio/ig-post-6.jpg', 11, 'active', '["instagram", "featured"]'::jsonb)
ON CONFLICT (gallery_id) DO NOTHING;

-- ============================================================================
-- SEED SAMPLE REVIEWS FROM APP.JSON
-- ============================================================================
INSERT INTO reviews (review_id, customer_name, rating, title, review_text, is_featured, status) VALUES
('rev_001', 'Sarah Johnson', 5, 'Amazing experience!', 'Amazing experience! The team is so talented and made me feel so comfortable. My hair looks and feels incredible.', true, 'approved'),
('rev_002', 'Maria Garcia', 5, 'Best salon in Henry County!', 'Best salon in Henry County! The attention to detail and care is unmatched. I''ve been coming for 3 years.', true, 'approved'),
('rev_003', 'Jennifer Williams', 5, 'Highly recommend!', 'Absolutely love the vibe here. Professional, friendly, and my hair always turns out perfect. Highly recommend!', true, 'approved')
ON CONFLICT (review_id) DO NOTHING;

-- ============================================================================
-- SEED SAMPLE SERVICE PACKAGES
-- ============================================================================
INSERT INTO service_packages (package_id, name, description, services, regular_price, package_price, duration, is_featured, display_order, status) VALUES
(
    'pkg_001',
    'Cut & Color Combo',
    'Women''s haircut with full head color - save $15!',
    '["service_001", "service_004"]'::jsonb,
    145.00,
    130.00,
    180,
    true,
    1,
    'active'
),
(
    'pkg_002',
    'Braids & Treatment',
    'Get box braids with complimentary scalp treatment',
    '["service_011", "service_019"]'::jsonb,
    200.00,
    175.00,
    285,
    true,
    2,
    'active'
),
(
    'pkg_003',
    'Silk Press Special',
    'Silk press with deep conditioning treatment',
    '["service_018", "service_017"]'::jsonb,
    135.00,
    120.00,
    150,
    true,
    3,
    'active'
)
ON CONFLICT (package_id) DO NOTHING;

-- ============================================================================
-- SEED STAFF AVAILABILITY (Detailed schedule for staff_001)
-- ============================================================================
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time, is_available, break_start, break_end) VALUES
((SELECT id FROM staff WHERE staff_id = 'staff_001'), 1, '09:00', '18:00', true, '12:00', '13:00'), -- Monday
((SELECT id FROM staff WHERE staff_id = 'staff_001'), 2, '09:00', '18:00', true, '12:00', '13:00'), -- Tuesday
((SELECT id FROM staff WHERE staff_id = 'staff_001'), 3, '09:00', '18:00', true, '12:00', '13:00'), -- Wednesday
((SELECT id FROM staff WHERE staff_id = 'staff_001'), 4, '09:00', '18:00', true, '12:00', '13:00'), -- Thursday
((SELECT id FROM staff WHERE staff_id = 'staff_001'), 5, '09:00', '18:00', true, '12:00', '13:00'), -- Friday
((SELECT id FROM staff WHERE staff_id = 'staff_001'), 6, '10:00', '16:00', true, NULL, NULL),      -- Saturday
((SELECT id FROM staff WHERE staff_id = 'staff_001'), 0, '00:00', '00:00', false, NULL, NULL)      -- Sunday (closed)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED SAMPLE PROMOTIONAL CODE
-- ============================================================================
INSERT INTO promotional_codes (promo_code, description, discount_type, discount_value, min_purchase_amount, usage_limit, valid_from, valid_until, status) VALUES
(
    'FIRSTTIME15',
    'First-time customer 15% discount',
    'percentage',
    15.00,
    50.00,
    100,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '90 days',
    'active'
),
(
    'SPRING25',
    'Spring special - $25 off services over $100',
    'fixed_amount',
    25.00,
    100.00,
    50,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '60 days',
    'active'
)
ON CONFLICT (promo_code) DO NOTHING;

-- ============================================================================
-- SEED SAMPLE CAREER APPLICATIONS
-- ============================================================================
INSERT INTO career_applications (
    application_id,
    full_name,
    email,
    phone,
    position,
    employment_type,
    license_number,
    years_experience,
    specialties,
    portfolio_url,
    certifications,
    availability,
    why_join,
    "references",
    status
) VALUES
(
    'app_001',
    'Jessica Martinez',
    'jessica.martinez@example.com',
    '470-555-0123',
    'Hairstylist',
    'Full-time',
    'GA-COS-123456',
    5,
    'Balayage, Color Corrections, Bridal Styling, Cutting all hair types',
    'https://instagram.com/jessicamartinez_hair',
    'Georgia State Board Licensed Cosmetologist (2019), Redken Color Certification (2020), Wella Master Color Expert (2022)',
    'Available to start in 2 weeks. Prefer Tuesday-Saturday schedule.',
    'I''ve been following Myy Signature Myy Style on Instagram for over a year and I''m impressed by the quality of work and the inclusive, welcoming vibe. I''m looking for a salon that values creativity and continuous education, and your team embodies that. I''d love to bring my expertise in color and my loyal clientele to contribute to your growing success.',
    '1) Sarah Johnson - Salon Manager, Luxe Hair Studio, sarah@luxe.com, (404) 555-0199\n2) Maria Garcia - Senior Stylist, Glamour Salon, maria.g@glamour.com, (678) 555-0144\n3) David Chen - Cosmetology Instructor, Atlanta Beauty Academy, dchen@aba.edu, (770) 555-0177',
    'new'
),
(
    'app_002',
    'Aisha Thompson',
    'aisha.t.braids@example.com',
    '678-555-0198',
    'Hairstylist',
    'Part-time',
    'GA-BRAID-789123',
    7,
    'Box Braids, Cornrows, Goddess Braids, Knotless Braids, Locs Installation & Maintenance, Natural Hair Care',
    'https://instagram.com/aishabraids',
    'Licensed Braider - Georgia (2017), Natural Hair Specialist Certification (2018), Loc Technician Training (2020)',
    'Available immediately. Flexible schedule, prefer 4-5 days per week.',
    'Natural hair is my passion, and I''ve dedicated my career to mastering protective styling techniques. I love educating clients on proper hair care and seeing their confidence grow. Your salon''s commitment to serving all hair types aligns perfectly with my values. I believe my expertise in braiding and natural hair would be a great addition to your team.',
    '1) Keisha Williams - Salon Owner, Natural Beauty Bar, keisha@naturalbeautybar.com, (404) 555-0211\n2) Tanya Brown - Master Braider, Braids & Beyond, tanya@braidsandbeyond.com, (770) 555-0133\n3) Nicole Davis - Client, nicole.davis@example.com, (678) 555-0188',
    'under_review'
),
(
    'app_003',
    'Emily Rodriguez',
    'emily.rodriguez.hair@example.com',
    '404-555-0165',
    'Hairstylist',
    'Full-time',
    'GA-COS-456789',
    1,
    'Basic cuts, styling, color assistance, eager to learn advanced techniques',
    'https://instagram.com/emily_hairstylist',
    'Georgia State Board Licensed Cosmetologist - Just graduated from Aveda Institute Atlanta (2025), Honor Graduate',
    'Available to start immediately! Open to any schedule.',
    'I just graduated top of my class and I''m so excited to start my career! During my training, I fell in love with the creative side of hairstyling and the relationships you build with clients. I''m looking for a salon with a strong mentorship program where I can learn from experienced stylists and grow my skills. Your salon has an amazing reputation and I would be honored to be part of your team.',
    '1) Linda Martinez - Instructor, Aveda Institute Atlanta, linda.m@aveda-atlanta.edu, (404) 555-0122\n2) Rachel Green - Salon Manager (Internship), Rachel@internshipsalon.com, (770) 555-0199',
    'interview_scheduled'
);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Frontend database seeded successfully!';
    RAISE NOTICE 'Data inserted:';
    RAISE NOTICE '  - 22 services';
    RAISE NOTICE '  - 1 staff member (Egwono Okpako)';
    RAISE NOTICE '  - Business settings (info, contact, social, hours, booking, payment)';
    RAISE NOTICE '  - App settings (branding, features, SEO, notifications)';
    RAISE NOTICE '  - 11 gallery items';
    RAISE NOTICE '  - 3 sample reviews';
    RAISE NOTICE '  - 3 service packages';
    RAISE NOTICE '  - Staff availability schedule';
    RAISE NOTICE '  - 2 promotional codes';
    RAISE NOTICE '  - 3 sample career applications';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Update config/admin.json with new table mappings';
    RAISE NOTICE '  2. Create API endpoints for frontend tables';
    RAISE NOTICE '  3. Connect admin panel to manage this data';
END $$;
