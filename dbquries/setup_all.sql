-- ============================================================================
-- MYYSIGNATUREMYYSTYLE — FULL DATABASE SETUP
-- Run this once to create all tables, apply migrations, and seed all data.
-- Safe to re-run: CREATE TABLE IF NOT EXISTS + ON CONFLICT guards throughout.
-- Order: Schema → Extra Tables → Column Migrations → Seed Data
-- ============================================================================


-- ============================================================================
-- SECTION 1: CORE SCHEMA (15 tables + triggers)
-- ============================================================================

-- 1. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    service_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    price_min DECIMAL(10, 2) NOT NULL,
    price_max DECIMAL(10, 2) NOT NULL,
    images JSONB DEFAULT '[]',
    staff_ids JSONB DEFAULT '[]', -- array of staff_id strings; empty = all staff
    status VARCHAR(20) DEFAULT 'active',
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_service_id ON services(service_id);

-- 2. STAFF TABLE
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    bio TEXT,
    photo TEXT,
    instagram_handle VARCHAR(100),
    booking_slug VARCHAR(100),
    specialties JSONB DEFAULT '[]',
    availability JSONB DEFAULT '{}',
    is_bookable BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_staff_staff_id ON staff(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_is_bookable ON staff(is_bookable);

-- 3. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    preferences JSONB DEFAULT '{}',
    loyalty_points INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    marketing_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON customers(customer_id);

-- 4. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    appointment_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    admin_notes TEXT,
    cancellation_reason TEXT,
    deposit_required BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10, 2),
    deposit_paid BOOLEAN DEFAULT false,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    reminder_sent BOOLEAN DEFAULT false,
    confirmation_sent BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_id ON appointments(appointment_id);

-- 5. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(50) UNIQUE NOT NULL,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_type VARCHAR(50) DEFAULT 'full',
    transaction_id VARCHAR(255),
    processor VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    currency VARCHAR(10) DEFAULT 'USD',
    payment_details JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    review_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT NOT NULL,
    customer_name VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending',
    admin_response TEXT,
    responded_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_staff_id ON reviews(staff_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_is_featured ON reviews(is_featured);
CREATE INDEX IF NOT EXISTS idx_reviews_review_id ON reviews(review_id);

-- 7. GALLERY TABLE
CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    gallery_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT false,
    is_before_after BOOLEAN DEFAULT false,
    before_image_url TEXT,
    display_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    tags JSONB DEFAULT '[]',
    instagram_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_status ON gallery(status);
CREATE INDEX IF NOT EXISTS idx_gallery_is_featured ON gallery(is_featured);
CREATE INDEX IF NOT EXISTS idx_gallery_staff_id ON gallery(staff_id);
CREATE INDEX IF NOT EXISTS idx_gallery_gallery_id ON gallery(gallery_id);

-- 8. CONTACT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    submission_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    message_type VARCHAR(50) NOT NULL,
    service VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    assigned_to INTEGER REFERENCES staff(id) ON DELETE SET NULL,
    response TEXT,
    responded_at TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'normal',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_message_type ON contact_submissions(message_type);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submission_id ON contact_submissions(submission_id);

-- 9. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    subscriber_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    preferences JSONB DEFAULT '{}',
    source VARCHAR(100),
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscriber_id ON newsletter_subscribers(subscriber_id);

-- 10. CAREER APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS career_applications (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    position VARCHAR(255) NOT NULL,
    employment_type VARCHAR(50),
    license_number VARCHAR(100) NOT NULL,
    years_experience INTEGER NOT NULL,
    specialties TEXT,
    portfolio_url TEXT,
    portfolio_files JSONB DEFAULT '[]',
    resume_file TEXT,
    certifications TEXT,
    availability TEXT,
    why_join TEXT,
    "references" TEXT,
    status VARCHAR(20) DEFAULT 'new',
    assigned_to INTEGER REFERENCES staff(id) ON DELETE SET NULL,
    interview_date TIMESTAMP,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    decision_notes TEXT,
    responded_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status);
CREATE INDEX IF NOT EXISTS idx_career_applications_position ON career_applications(position);
CREATE INDEX IF NOT EXISTS idx_career_applications_email ON career_applications(email);
CREATE INDEX IF NOT EXISTS idx_career_applications_created_at ON career_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_career_applications_application_id ON career_applications(application_id);

-- 11. BUSINESS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS business_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_business_settings_key ON business_settings(setting_key);

-- 12. APP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);

-- 13. SERVICE PACKAGES TABLE
CREATE TABLE IF NOT EXISTS service_packages (
    id SERIAL PRIMARY KEY,
    package_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    services JSONB NOT NULL,
    regular_price DECIMAL(10, 2) NOT NULL,
    package_price DECIMAL(10, 2) NOT NULL,
    savings DECIMAL(10, 2) GENERATED ALWAYS AS (regular_price - package_price) STORED,
    duration INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_packages_status ON service_packages(status);
CREATE INDEX IF NOT EXISTS idx_service_packages_package_id ON service_packages(package_id);

-- 14. STAFF AVAILABILITY TABLE
CREATE TABLE IF NOT EXISTS staff_availability (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    break_start TIME,
    break_end TIME,
    effective_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (staff_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_staff_availability_staff_id ON staff_availability(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_availability_day ON staff_availability(day_of_week);

-- 15. PROMOTIONAL CODES TABLE
CREATE TABLE IF NOT EXISTS promotional_codes (
    id SERIAL PRIMARY KEY,
    promo_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    customer_limit INTEGER DEFAULT 1,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    applicable_services JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promotional_codes(promo_code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_status ON promotional_codes(status);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid_dates ON promotional_codes(valid_from, valid_until);

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_updated_at ON gallery;
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletter_subscribers_updated_at ON newsletter_subscribers;
CREATE TRIGGER update_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_career_applications_updated_at ON career_applications;
CREATE TRIGGER update_career_applications_updated_at BEFORE UPDATE ON career_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_settings_updated_at ON business_settings;
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_packages_updated_at ON service_packages;
CREATE TRIGGER update_service_packages_updated_at BEFORE UPDATE ON service_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_availability_updated_at ON staff_availability;
CREATE TRIGGER update_staff_availability_updated_at BEFORE UPDATE ON staff_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promotional_codes_updated_at ON promotional_codes;
CREATE TRIGGER update_promotional_codes_updated_at BEFORE UPDATE ON promotional_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- SECTION 2: ADDITIONAL TABLES (admins, orders, products)
-- ============================================================================

-- ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- ORDERS TABLE
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL DEFAULT (
        'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('order_number_seq')::text, 6, '0')
    ),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    recipient_name VARCHAR(255),
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    delivery_option VARCHAR(50) NOT NULL DEFAULT 'pickup',
    delivery_address TEXT,
    delivery_date TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    shipping NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL,
    special_instructions TEXT,
    message TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT orders_order_number_key UNIQUE (order_number),
    CONSTRAINT orders_delivery_option_check CHECK (delivery_option IN ('pickup', 'delivery', 'shipping')),
    CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('zelle', 'cash', 'card', 'paypal')),
    CONSTRAINT orders_status_check CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    price JSONB NOT NULL,
    duration_minutes INT NOT NULL,
    staff_required INT DEFAULT 1,
    difficulty_level VARCHAR(20) DEFAULT 'Intermediate',
    required_materials JSONB,
    availability_status VARCHAR(20) DEFAULT 'Available',
    is_active BOOLEAN DEFAULT TRUE,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
    CHECK (availability_status IN ('Available', 'Unavailable', 'Special Request'))
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(availability_status);

CREATE OR REPLACE FUNCTION update_products_updated_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_timestamp ON products;
CREATE TRIGGER products_updated_timestamp
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_products_updated_timestamp();


-- ============================================================================
-- SECTION 3: COLUMN MIGRATIONS (safe to re-run)
-- ============================================================================

ALTER TABLE staff ADD COLUMN IF NOT EXISTS instagram_handle VARCHAR(100);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS booking_slug VARCHAR(100);
ALTER TABLE services ADD COLUMN IF NOT EXISTS staff_ids JSONB DEFAULT '[]';


-- ============================================================================
-- SECTION 4: SEED DATA
-- ============================================================================

-- ── Admin users ──────────────────────────────────────────────────────────────
-- dev / dev
INSERT INTO admins (username, password_hash, email)
VALUES ('dev', '$2b$10$nOUIs5kJ7naTuTFkBy1i.OPST9/jWAyS79zQRkFkGxDGGA.wSThga', 'fttgsolutions@gmail.com')
ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email, updated_at = CURRENT_TIMESTAMP;

-- admin / admin1$
INSERT INTO admins (username, password_hash, email)
VALUES ('admin', '$2b$10$ha2UuXQZyBx0tmxasOLGUu5uhMdnxXpXukk7H7Ge2XhNl/hGnkrbO', 'egwonookpako559@gmail.com')
ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email, updated_at = CURRENT_TIMESTAMP;

-- ── Services ─────────────────────────────────────────────────────────────────
INSERT INTO services (service_id, name, description, duration, price_min, price_max, category, images, display_order, status) VALUES
('cut_001', 'Hair Trim', 'Clean-up trim to remove split ends and maintain shape', 60, 30.00, 45.00, 'Hair Cut', '["hair_cut_hair_trim_1_e6zogm"]', 1, 'active'),
('cut_002', 'Bang / Edge Trim', 'Precision trim of bangs and edges for a polished finish', 60, 50.00, 65.00, 'Hair Cut', '["hair_cut_bang_edge_trim_1_fiwdf3"]', 2, 'active'),
('cut_003', 'Adult Haircut', 'Full haircut with expert shaping and styling', 60, 65.00, 85.00, 'Hair Cut', '["hair_cut_adult_haircut_1_dm498g"]', 3, 'active'),
('cut_004', 'Kids Haircut', 'Fun and quick haircut for kids with gentle styling', 45, 25.00, 40.00, 'Hair Cut', '["hair_cut_kids_haircut_1_lemrhk"]', 4, 'active'),
('cut_005', 'Military Haircut', 'Clean, precise military-style cut with sharp lines', 45, 30.00, 45.00, 'Hair Cut', '["hair_cut_military_haircut_1_kax3ty"]', 5, 'active'),
('cut_006', 'Fade', 'Smooth gradient fade blended to perfection', 60, 45.00, 65.00, 'Hair Cut', '["hair_cut_fade_1_kn74at"]', 6, 'active'),
('chem_001', 'Relaxer / Texturizer', 'Chemical straightening or light texture softening service', 120, 80.00, 130.00, 'Chemical Service', '["chemical_service_relaxer_texturizer_1_ztcwng"]', 7, 'active'),
('chem_002', 'Perm', 'Chemical wave or curl perm service', 120, 100.00, 150.00, 'Chemical Service', '["chemical_service_perm_1_rnlr9v"]', 8, 'active'),
('chem_003', 'Grey Coverage', 'Full grey coverage color application', 90, 75.00, 110.00, 'Chemical Service', '["chemical_service_grey_coverage_1_cohkb6"]', 9, 'active'),
('chem_004', 'Root Touchup', 'Color refresh and root touch-up application', 90, 60.00, 95.00, 'Chemical Service', '["chemical_service_root_touchup_1_xsarcu"]', 10, 'active'),
('chem_005', 'Single Process Color', 'One all-over color application', 120, 85.00, 130.00, 'Chemical Service', '["chemical_service_single_process_color_1_evfe0a"]', 11, 'active'),
('chem_006', 'Double Process Color', 'Two-step color process — lift and tone', 180, 130.00, 190.00, 'Chemical Service', '["chemical_service_double_process_color_1_ajdrdo"]', 12, 'active'),
('chem_007', 'Partial / Full Highlight', 'Partial or full foil highlights for dimension and brightness', 120, 100.00, 160.00, 'Chemical Service', '["chemical_service_partial_full_highlight_1_ecr66p"]', 13, 'active'),
('treat_001', 'Deep Conditioning Treatment', 'Intensive moisture replenishment for dry or damaged hair', 30, 35.00, 55.00, 'Hair Treatment', '["hair_treatment_deep_conditioning_treatment_1_atanzx"]', 14, 'active'),
('treat_002', 'Protein Treatment', 'Strengthening protein treatment to restore hair integrity', 30, 35.00, 60.00, 'Hair Treatment', '["hair_treatment_protein_treatment_1_gdc8d2"]', 15, 'active'),
('treat_003', 'Oil Treatment', 'Nourishing hot oil treatment for shine and softness', 30, 30.00, 50.00, 'Hair Treatment', '["hair_treatment_oil_treatment_1_gnraef"]', 16, 'active'),
('treat_004', 'Scalp Treatment', 'Therapeutic scalp treatment targeting dryness or buildup', 45, 40.00, 65.00, 'Hair Treatment', '["hair_treatment_scalp_treatment_1_dcwosx"]', 17, 'active'),
('treat_005', 'Olaplex / Bond Repair Treatment', 'Bond-building treatment to repair chemically or heat-damaged hair', 45, 50.00, 85.00, 'Hair Treatment', '["hair_treatment_olaplex_bond_repair_treatment_1_x3zi81"]', 18, 'active'),
('treat_006', 'Dr C Tuna Hair Treatment', 'Farmasi Dr C Tuna restorative hair and scalp care treatment', 45, 50.00, 80.00, 'Hair Treatment', '["hair_treatment_dr_c_tuna_hair_treatment_1_g9g6n5"]', 19, 'active'),
('ext_001', 'Sew-In', 'Full sew-in weave installation with natural hair braided down', 180, 175.00, 260.00, 'Extensions', '["extensions_sew_in_1_ykde9i"]', 20, 'active'),
('ext_002', 'Microlinks', 'Individual microlink / I-tip extension installation', 240, 200.00, 350.00, 'Extensions', '["extensions_microlinks_1_dwz3mw"]', 21, 'active'),
('ext_003', 'Tape In', 'Tape-in weft extension application', 180, 150.00, 250.00, 'Extensions', '["extensions_tape_in_1_xey1u0"]', 22, 'active'),
('ext_004', 'Wig Installation', 'Custom wig fitting, glueless or adhesive installation', 180, 80.00, 150.00, 'Extensions', '["extensions_wig_installation_1_odifga"]', 23, 'active'),
('ext_005', 'Up Do', 'Elegant pinned or swept-up style with extensions', 120, 75.00, 130.00, 'Extensions', '["extensions_up_do_1_ydegfi"]', 24, 'active'),
('ext_006', 'Pixie Natural Hair / Sew-In', 'Pixie cut style achieved with natural hair or sew-in technique', 180, 150.00, 220.00, 'Extensions', '["extensions_pixie_natural_hair_sew_in_1_kifoul"]', 25, 'active'),
('ext_007', 'Weave Maintenance', 'Upkeep, tightening, and care for existing weave installation', 60, 60.00, 100.00, 'Extensions', '["extensions_weave_maintenance_1_gl8ooj"]', 26, 'active'),
('ext_008', 'Weave Take Down', 'Safe removal of weave and gentle detangle of natural hair', 45, 40.00, 75.00, 'Extensions', '["extensions_weave_take_down_1_lqlx1c"]', 27, 'active'),
('braid_001', 'Feeding / Fulani / Lemonade Braids', 'Feed-in, Fulani, or lemonade braid styles with extensions', 180, 150.00, 260.00, 'Braids', '["braids_feeding_fulani_lemonade_braids_1_pv28jy"]', 28, 'active'),
('braid_002', 'Senegalese Twist', 'Rope twist style using Kanekalon or Marley hair', 180, 150.00, 230.00, 'Braids', '["braids_senegalese_twist_1_cpe6w3"]', 29, 'active'),
('braid_003', 'Crochet', 'Crochet braid installation with various hair textures', 120, 100.00, 180.00, 'Braids', '["braids_crochet_1_xblgtb"]', 30, 'active'),
('braid_004', 'Braids Maintenance', 'Re-do edges, moisturize, and maintain existing braid style', 120, 75.00, 130.00, 'Braids', '["braids_braids_maintenance_1_jpt93t"]', 31, 'active'),
('braid_005', 'Braids Take Down', 'Careful removal of braids with detangle and wash option', 60, 50.00, 80.00, 'Braids', '["braids_braids_take_down_1_sfd3qz"]', 32, 'active'),
('locs_001', 'Starter Locs', 'Begin your loc journey — two-strand, interloc, or comb coils', 120, 100.00, 180.00, 'Locs', '["locs_starter_locs_1_kke1gs"]', 33, 'active'),
('locs_002', 'Retwist / Interloc / Styles', 'Professional retwist, interlocking, or styled loc maintenance', 120, 80.00, 160.00, 'Locs', '["locs_retwist_interloc_styles_1_dbyb9v"]', 34, 'active'),
('locs_003', 'Loc Maintenance', 'General loc upkeep including cleansing, conditioning, and re-palmrolling', 120, 65.00, 130.00, 'Locs', '["locs_loc_maintenance_1_eqzlwq"]', 35, 'active'),
('nat_001', 'Silk Press', 'Relaxer-free silk press for smooth, sleek, heat-styled natural hair', 180, 75.00, 130.00, 'Natural Hair Styles', '["natural_hair_styles_silk_press_1_ym0dka"]', 36, 'active'),
('nat_002', 'Two Strands Twist', 'Two-strand twists on natural hair with or without extensions', 120, 80.00, 140.00, 'Natural Hair Styles', '["natural_hair_styles_two_strands_twist_1_wiqcpp"]', 37, 'active'),
('nat_003', 'Flat Twist', 'Flat twists styled close to the scalp for a sleek natural look', 90, 65.00, 110.00, 'Natural Hair Styles', '["natural_hair_styles_flat_twist_1_oj0cxg"]', 38, 'active'),
('nat_004', 'Wash and Go', 'Cleanse, condition, and define natural curl pattern — no heat', 120, 60.00, 100.00, 'Natural Hair Styles', '["natural_hair_styles_wash_and_go_1_jw8k0m"]', 39, 'active'),
('nat_005', 'Wash and Set', 'Shampoo, condition, and roller or wrap set for a smooth finish', 120, 65.00, 110.00, 'Natural Hair Styles', '["natural_hair_styles_wash_and_set_1_zc0jzk"]', 40, 'active'),
('bridal_001', 'Bridal Trial', 'Pre-wedding style rehearsal to perfect your wedding day look', 90, 100.00, 200.00, 'Bridal', '["bridal_bridal_trial_1_jsdnlo"]', 41, 'active'),
('bridal_002', 'Wedding Day Style', 'Full bridal styling service on your wedding day', 120, 150.00, 300.00, 'Bridal', '["bridal_wedding_day_style_1_uyueqg"]', 42, 'active'),
('addon_001', 'Shampoo / Hydrate and Trim', 'Cleansing shampoo, deep hydration, and light trim add-on', 120, 30.00, 55.00, 'Add On', '["add_on_shampoo_hydrate_and_trim_1_f1une7"]', 43, 'active'),
('addon_002', 'Scalp Stimulator', 'Invigorating scalp massage and stimulating serum application', 30, 25.00, 45.00, 'Add On', '["add_on_scalp_stimulator_1_evcbvb"]', 44, 'active')
ON CONFLICT (service_id) DO NOTHING;

-- ── Staff (Jairo, Andrea, Char) ───────────────────────────────────────────────
INSERT INTO staff (staff_id, name, title, email, phone, bio, photo, instagram_handle, booking_slug, specialties, is_bookable, status, display_order)
VALUES (
    'staff_001', 'Jairo', 'Color Specialist',
    'jairo@myysignaturemyystyle.com', '(678) 663-5999',
    'Originally from New York, Jairo brings 7 years of experience as a colorist to the team. Jairo specializes in lived-in blondes, brunettes, fantasy colors, and vivid reds! Beyond the chair you can find him practicing yoga, cooking, or spending time with his two puppies.',
    '', 'jmenendezcolour', 'jairo',
    '["Color", "Blondes", "Fantasy Color", "Vivid Reds", "Brunettes"]'::jsonb,
    true, 'active', 1
)
ON CONFLICT (staff_id) DO UPDATE SET
    name = EXCLUDED.name, title = EXCLUDED.title, phone = EXCLUDED.phone,
    bio = EXCLUDED.bio, photo = EXCLUDED.photo, instagram_handle = EXCLUDED.instagram_handle,
    booking_slug = EXCLUDED.booking_slug, specialties = EXCLUDED.specialties,
    display_order = EXCLUDED.display_order, updated_at = CURRENT_TIMESTAMP;

INSERT INTO staff (staff_id, name, title, email, phone, bio, photo, instagram_handle, booking_slug, specialties, is_bookable, status, display_order)
VALUES (
    'staff_002', 'Andrea', 'Senior Colorist',
    'andrea@myysignaturemyystyle.com', '(443) 570-7274',
    'Originally from London, England, color is Andrea''s specialty! With over 15 years of experience as a L''Oreal Professional colorist, her work includes freelancing for magazine and TV. Andrea''s passion for art and painting can be seen through her work as she is truly a master of her craft.',
    '', 'andreamitchelluk', 'andrea',
    '["Color", "L''Oreal Color", "Magazine Work", "TV Styling"]'::jsonb,
    true, 'active', 2
)
ON CONFLICT (staff_id) DO UPDATE SET
    name = EXCLUDED.name, title = EXCLUDED.title, phone = EXCLUDED.phone,
    bio = EXCLUDED.bio, photo = EXCLUDED.photo, instagram_handle = EXCLUDED.instagram_handle,
    booking_slug = EXCLUDED.booking_slug, specialties = EXCLUDED.specialties,
    display_order = EXCLUDED.display_order, updated_at = CURRENT_TIMESTAMP;

INSERT INTO staff (staff_id, name, title, email, phone, bio, photo, instagram_handle, booking_slug, specialties, is_bookable, status, display_order)
VALUES (
    'staff_003', 'Char', 'Licensed Stylist',
    'char@myysignaturemyystyle.com', '(770) 744-3095',
    'Originally from New York, Char brings a Trinidadian flare and spunky vibe to the salon! Char has been a licensed stylist for 15 years and specializes in blowouts, silk press, color, pixie cuts, and haircutting. Char loves sneakers, nature documentaries, trying new foods and hiking in her spare time.',
    '', 'chardryce', 'char',
    '["Blowouts", "Silk Press", "Color", "Pixie Cuts", "Haircutting"]'::jsonb,
    true, 'active', 3
)
ON CONFLICT (staff_id) DO UPDATE SET
    name = EXCLUDED.name, title = EXCLUDED.title, phone = EXCLUDED.phone,
    bio = EXCLUDED.bio, photo = EXCLUDED.photo, instagram_handle = EXCLUDED.instagram_handle,
    booking_slug = EXCLUDED.booking_slug, specialties = EXCLUDED.specialties,
    display_order = EXCLUDED.display_order, updated_at = CURRENT_TIMESTAMP;

-- ── Reviews ───────────────────────────────────────────────────────────────────
INSERT INTO reviews (review_id, customer_name, rating, title, review_text, is_featured, status) VALUES
('rev_001', 'Sarah Johnson', 5, 'Amazing experience!',
 'Amazing experience! The team is so talented and made me feel so comfortable. My hair looks and feels incredible.',
 true, 'approved'),
('rev_002', 'Maria Garcia', 5, 'Best salon in Henry County!',
 'Best salon in Henry County! The attention to detail and care is unmatched. I''ve been coming for 3 years.',
 true, 'approved'),
('rev_003', 'Jennifer Williams', 5, 'Highly recommend!',
 'Absolutely love the vibe here. Professional, friendly, and my hair always turns out perfect. Highly recommend!',
 true, 'approved')
ON CONFLICT (review_id) DO UPDATE SET
    customer_name = EXCLUDED.customer_name, rating = EXCLUDED.rating,
    title = EXCLUDED.title, review_text = EXCLUDED.review_text,
    is_featured = EXCLUDED.is_featured, status = EXCLUDED.status,
    updated_at = CURRENT_TIMESTAMP;

-- ── Business settings ─────────────────────────────────────────────────────────
INSERT INTO business_settings (setting_key, setting_value, description, is_active) VALUES
('business_info', '{
    "name": "Myy Signature Myy Style Salon",
    "businessId": "EGWONO-001",
    "address": "668 Peeksville Road, Locust Grove, GA 30248",
    "county": "Henry County",
    "state": "Georgia",
    "country": "United States",
    "timezone": "America/Chicago"
}'::jsonb, 'Primary business information', true),
('contact', '{
    "phone": "209-362-8295",
    "email": "info@myysignaturemyystyle.com",
    "website": "https://www.myysignaturemyystyle.com"
}'::jsonb, 'Contact information', true),
('social', '{
    "instagram": "https://www.instagram.com/myysignaturemyystyle",
    "facebook": ""
}'::jsonb, 'Social media links', true),
('hours', '{
    "monday": "09:00-18:00",
    "tuesday": "09:00-18:00",
    "wednesday": "09:00-18:00",
    "thursday": "09:00-18:00",
    "friday": "09:00-18:00",
    "saturday": "10:00-16:00",
    "sunday": "closed"
}'::jsonb, 'Business hours of operation', true),
('booking_settings', '{
    "enabled": true,
    "type": "custom",
    "multi_staff": true,
    "buffer_time": 15,
    "cancellation_policy": "24_hours_notice",
    "rescheduling": true,
    "waitlist": true
}'::jsonb, 'Booking system configuration', true),
('payment_settings', '{
    "enabled": true,
    "processors": ["stripe", "square", "paypal"],
    "deposit_required": true,
    "deposit_percentage": 50,
    "full_payment_option": true,
    "accepted_cards": ["visa", "mastercard", "amex", "discover"],
    "currencies": ["USD"]
}'::jsonb, 'Payment processing configuration', true),
('salon_policies', '{
    "title": "Salon Policies & Guest Guidelines",
    "intro": "At Myy Signature Myy Style Salon, we are committed to delivering exceptional beauty services in a comfortable, professional, and luxurious environment. To ensure a seamless experience for all clients, please review our policies below.",
    "booking": {
        "title": "Booking Policy",
        "points": [
            "All appointments must be scheduled through our official booking system.",
            "A deposit is required to secure your booking — amount depends on the service.",
            "Please ensure you book the correct service to allow proper timing.",
            "For questions or service clarification, contact us directly before booking."
        ]
    },
    "confirmation": {
        "title": "Appointment Confirmation",
        "points": [
            "A confirmation reminder will be sent 24–48 hours prior to your appointment.",
            "Clients are required to confirm their appointment via the provided link.",
            "Failure to confirm may result in automatic cancellation and loss of your reserved time."
        ]
    },
    "cancellation": {
        "title": "Cancellation Policy",
        "intro": "We understand that schedules may change; however, we kindly request:",
        "points": [
            "A call or text to notify us of any changes as early as possible.",
            "Cancellations made less than 12 hours in advance will incur your deposit service charge.",
            "No-shows receive no refund."
        ]
    },
    "deposits": {"title": "Deposits", "points": ["All deposits are non-refundable."]},
    "late_arrival": {
        "title": "Late Policy",
        "points": [
            "Please arrive on time to ensure full service.",
            "A grace period of 10–20 minutes may be allowed.",
            "Late arrivals may result in a shortened service or cancellation, with applicable fees."
        ]
    },
    "payment": {
        "title": "Payment Policy",
        "points": [
            "All payments must be made through approved salon payment methods only.",
            "We accept: card, Cash App, Zelle, and other approved options.",
            "No personal payments to stylists are permitted."
        ]
    },
    "salon_experience": {
        "title": "Salon Experience",
        "points": [
            "We strive to provide a peaceful and relaxing atmosphere.",
            "Please respect all staff and guests at all times.",
            "Only serviced kids allowed; additional children must remain seated and supervised."
        ]
    },
    "service_guarantee": {
        "title": "Service Guarantee",
        "text": "Your satisfaction is important to us. If you experience any concerns, please notify us within 48 hours of your service so we can address it promptly."
    },
    "promise": {
        "title": "Our Promise",
        "text": "At Myy Signature Myy Style Salon, our goal is simple: To enhance your beauty while ensuring your comfort, every visit."
    }
}'::jsonb, 'Full salon policies and guest guidelines displayed on the website', true),
('booking_disclaimer', '{
    "deposit_note": "A deposit is required to secure your appointment (amount depends on the service). Payment options are listed below.",
    "cancellation_note": "Cancellations made less than 12 hours in advance will incur your deposit service charge. No-shows receive no refund.",
    "late_policy": "A grace period of 10–20 minutes may be allowed. Late arrivals may result in a shortened service or cancellation with applicable fees.",
    "confirmation_note": "By completing this booking you agree to our deposit, cancellation, and late-arrival policies."
}'::jsonb, 'Short policy text shown inside the booking modal', true)
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;

-- ── Sample orders (dev/testing data) ─────────────────────────────────────────
INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_option, payment_method, subtotal, tax, total, status)
VALUES
  ('John Smith',    'john.smith@email.com', '555-0101', 'pickup',   'cash',   45.00,   3.60,  48.60, 'pending'),
  ('Sarah Johnson', 'sarah.j@email.com',    '555-0102', 'delivery', 'zelle',  125.00, 10.00, 135.00, 'processing'),
  ('Michael Brown', 'mbrown@email.com',     '555-0103', 'shipping', 'card',    89.99,  7.20,  97.19, 'shipped'),
  ('Emily Davis',   'emily.davis@email.com','555-0104', 'pickup',   'paypal', 199.50, 15.96, 215.46, 'delivered'),
  ('Robert Wilson', 'rwilson@email.com',    '555-0105', 'delivery', 'cash',    55.00,  4.40,  59.40, 'cancelled')
ON CONFLICT DO NOTHING;


-- ============================================================================
-- SECTION 5: UPDATE TEMPLATES (uncomment and edit before running)
-- ============================================================================

-- ── Update a specific staff member ───────────────────────────────────────────
-- UPDATE staff
-- SET
--     name             = 'Jairo',
--     title            = 'Color Specialist',
--     phone            = '(678) 663-5999',
--     bio              = 'Updated bio text here.',
--     photo            = '',
--     instagram_handle = 'jmenendezcolour',
--     booking_slug     = 'jairo',
--     specialties      = '["Color", "Blondes", "Fantasy Color", "Vivid Reds", "Brunettes"]'::jsonb,
--     is_bookable      = true,
--     status           = 'active',
--     display_order    = 1,
--     updated_at       = CURRENT_TIMESTAMP
-- WHERE staff_id = 'staff_001';

-- ── Deactivate a staff member ─────────────────────────────────────────────────
-- UPDATE staff SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE staff_id = 'staff_001';

-- ── Update staff availability schedule ───────────────────────────────────────
-- UPDATE staff
-- SET availability = '{"Mon":["9:00","17:00"],"Tue":["9:00","17:00"]}'::jsonb,
--     updated_at   = CURRENT_TIMESTAMP
-- WHERE staff_id = 'staff_001';

-- ── Assign services to a specific stylist ────────────────────────────────────
-- UPDATE services SET staff_ids = '["staff_001"]'::jsonb       WHERE service_id IN ('chem_001','chem_003');
-- UPDATE services SET staff_ids = '["staff_001","staff_002"]'::jsonb WHERE service_id = 'chem_007';
-- UPDATE services SET staff_ids = '[]'::jsonb                  WHERE service_id = 'cut_001'; -- all staff

-- ── Update display order for all staff ───────────────────────────────────────
-- UPDATE staff SET display_order = CASE staff_id
--     WHEN 'staff_001' THEN 1
--     WHEN 'staff_002' THEN 2
--     WHEN 'staff_003' THEN 3
-- END WHERE staff_id IN ('staff_001','staff_002','staff_003');


-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ setup_all.sql complete — schema, migrations, and seed data applied.';
END $$;
