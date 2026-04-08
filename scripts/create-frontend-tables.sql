-- Frontend Application Database Schema
-- Run this script to create all tables needed for the frontend app
-- Tables are designed to match app.json structure and support admin panel CRUD

-- ============================================================================
-- 1. SERVICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    service_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., "service_001"
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- duration in minutes
    category VARCHAR(100) NOT NULL, -- Cuts, Color, Braids, Styling, etc.
    price_min DECIMAL(10, 2) NOT NULL, -- minimum / starting price
    price_max DECIMAL(10, 2) NOT NULL, -- maximum price (same as min for fixed pricing)
    images JSONB DEFAULT '[]', -- array of Cloudinary public IDs
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, archived
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}', -- additional flexible data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_service_id ON services(service_id);

-- ============================================================================
-- 2. STAFF TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    staff_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., "staff_001"
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255), -- Owner & Lead Stylist, Senior Stylist, etc.
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    bio TEXT,
    photo TEXT, -- URL to staff photo (Cloudinary or local path)
    instagram_handle VARCHAR(100), -- e.g. jmenendezcolour (no @)
    booking_slug VARCHAR(100), -- e.g. jairo → links to /book_jairo
    specialties JSONB DEFAULT '[]', -- array of specialty services
    availability JSONB DEFAULT '{}', -- weekly schedule
    is_bookable BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, on_leave
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_status ON staff(status);
CREATE INDEX idx_staff_staff_id ON staff(staff_id);
CREATE INDEX idx_staff_is_bookable ON staff(is_bookable);

-- ============================================================================
-- 3. CUSTOMERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., "cust_001"
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    preferences JSONB DEFAULT '{}', -- preferred stylist, services, communication preferences
    loyalty_points INTEGER DEFAULT 0,
    total_appointments INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, blocked
    notes TEXT, -- admin notes about customer
    marketing_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_customer_id ON customers(customer_id);

-- ============================================================================
-- 4. APPOINTMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    appointment_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., "appt_001"
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INTEGER NOT NULL, -- minutes
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled, no_show
    notes TEXT, -- customer notes/requests
    admin_notes TEXT, -- internal admin notes
    cancellation_reason TEXT,
    deposit_required BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10, 2),
    deposit_paid BOOLEAN DEFAULT false,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'unpaid', -- unpaid, partial, paid, refunded
    reminder_sent BOOLEAN DEFAULT false,
    confirmation_sent BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}', -- booking source, campaign tracking, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_appointment_id ON appointments(appointment_id);

-- ============================================================================
-- 5. PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., "pay_001"
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- stripe, square, paypal, cash, card
    payment_type VARCHAR(50) DEFAULT 'full', -- full, deposit, refund
    transaction_id VARCHAR(255), -- external payment processor transaction ID
    processor VARCHAR(50), -- stripe, square, paypal
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
    currency VARCHAR(10) DEFAULT 'USD',
    payment_details JSONB DEFAULT '{}', -- card last 4, receipt URL, etc.
    metadata JSONB DEFAULT '{}',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_id ON payments(payment_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- ============================================================================
-- 6. REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    review_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., "rev_001"
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT NOT NULL,
    customer_name VARCHAR(255), -- display name (may differ from customer record)
    is_verified BOOLEAN DEFAULT false, -- verified purchase/appointment
    is_featured BOOLEAN DEFAULT false, -- featured on homepage
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, hidden
    admin_response TEXT, -- optional response from salon
    responded_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_staff_id ON reviews(staff_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_is_featured ON reviews(is_featured);
CREATE INDEX idx_reviews_review_id ON reviews(review_id);

-- ============================================================================
-- 7. GALLERY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    gallery_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., "gal_001"
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- Cuts, Colors, Braids, Styling, Treatments, etc.
    image_url TEXT NOT NULL,
    thumbnail_url TEXT, -- optimized thumbnail
    staff_id INTEGER REFERENCES staff(id) ON DELETE SET NULL, -- stylist who did the work
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT false,
    is_before_after BOOLEAN DEFAULT false,
    before_image_url TEXT, -- if before/after
    display_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, hidden, archived
    tags JSONB DEFAULT '[]', -- array of tags for filtering
    instagram_url TEXT, -- link to Instagram post
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gallery_category ON gallery(category);
CREATE INDEX idx_gallery_status ON gallery(status);
CREATE INDEX idx_gallery_is_featured ON gallery(is_featured);
CREATE INDEX idx_gallery_staff_id ON gallery(staff_id);
CREATE INDEX idx_gallery_gallery_id ON gallery(gallery_id);

-- ============================================================================
-- 8. CONTACT SUBMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_submissions (
    id SERIAL PRIMARY KEY,
    submission_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., "contact_001"
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    message_type VARCHAR(50) NOT NULL, -- inquiry, booking, review, recommendation, feedback
    service VARCHAR(255), -- service they're interested in
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new', -- new, read, responded, resolved, archived
    assigned_to INTEGER REFERENCES staff(id) ON DELETE SET NULL, -- assigned staff member
    response TEXT, -- admin response
    responded_at TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_message_type ON contact_submissions(message_type);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX idx_contact_submissions_submission_id ON contact_submissions(submission_id);

-- ============================================================================
-- 9. NEWSLETTER SUBSCRIBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    subscriber_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., "sub_001"
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active', -- active, unsubscribed, bounced
    preferences JSONB DEFAULT '{}', -- frequency, topics of interest
    source VARCHAR(100), -- website, instagram, referral, etc.
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX idx_newsletter_subscribers_subscriber_id ON newsletter_subscribers(subscriber_id);

-- ============================================================================
-- 10. CAREER APPLICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS career_applications (
    id SERIAL PRIMARY KEY,
    application_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., "app_001"
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    position VARCHAR(255) NOT NULL, -- position they're applying for
    employment_type VARCHAR(50), -- full-time, part-time, flexible
    license_number VARCHAR(100) NOT NULL,
    years_experience INTEGER NOT NULL,
    specialties TEXT, -- areas of expertise
    portfolio_url TEXT, -- Instagram, website, etc.
    portfolio_files JSONB DEFAULT '[]', -- array of uploaded file paths
    resume_file TEXT, -- path to uploaded resume
    certifications TEXT, -- education and certifications
    availability TEXT, -- when they can start, hours available
    why_join TEXT, -- why they want to join
    "references" TEXT, -- professional references
    status VARCHAR(20) DEFAULT 'new', -- new, under_review, interview_scheduled, accepted, rejected, withdrawn
    assigned_to INTEGER REFERENCES staff(id) ON DELETE SET NULL, -- assigned reviewer
    interview_date TIMESTAMP,
    notes TEXT, -- admin notes
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- internal rating
    decision_notes TEXT, -- reason for acceptance/rejection
    responded_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_career_applications_status ON career_applications(status);
CREATE INDEX idx_career_applications_position ON career_applications(position);
CREATE INDEX idx_career_applications_email ON career_applications(email);
CREATE INDEX idx_career_applications_created_at ON career_applications(created_at);
CREATE INDEX idx_career_applications_application_id ON career_applications(application_id);

-- ============================================================================
-- 11. BUSINESS SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS business_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL, -- business_info, hours, contact, social
    setting_value JSONB NOT NULL, -- stores complete business configuration
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_business_settings_key ON business_settings(setting_key);

-- ============================================================================
-- 12. APP SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL, -- branding, features, integrations, seo
    setting_value JSONB NOT NULL, -- stores app configuration
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_settings_key ON app_settings(setting_key);

-- ============================================================================
-- 13. SERVICE PACKAGES TABLE (Optional - for bundled services)
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_packages (
    id SERIAL PRIMARY KEY,
    package_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    services JSONB NOT NULL, -- array of service IDs included
    regular_price DECIMAL(10, 2) NOT NULL,
    package_price DECIMAL(10, 2) NOT NULL, -- discounted price
    savings DECIMAL(10, 2) GENERATED ALWAYS AS (regular_price - package_price) STORED,
    duration INTEGER, -- total duration in minutes
    status VARCHAR(20) DEFAULT 'active',
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_packages_status ON service_packages(status);
CREATE INDEX idx_service_packages_package_id ON service_packages(package_id);

-- ============================================================================
-- 14. STAFF AVAILABILITY TABLE (Detailed scheduling)
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff_availability (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    break_start TIME, -- lunch/break time
    break_end TIME,
    effective_date DATE, -- when this schedule starts (for future changes)
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (staff_id, day_of_week)
);

CREATE INDEX idx_staff_availability_staff_id ON staff_availability(staff_id);
CREATE INDEX idx_staff_availability_day ON staff_availability(day_of_week);

-- ============================================================================
-- 15. PROMOTIONAL CODES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS promotional_codes (
    id SERIAL PRIMARY KEY,
    promo_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- percentage, fixed_amount
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2), -- cap on percentage discounts
    usage_limit INTEGER, -- total times code can be used
    usage_count INTEGER DEFAULT 0,
    customer_limit INTEGER DEFAULT 1, -- times per customer
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    applicable_services JSONB DEFAULT '[]', -- specific services or empty for all
    status VARCHAR(20) DEFAULT 'active', -- active, expired, disabled
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_promo_codes_code ON promotional_codes(promo_code);
CREATE INDEX idx_promo_codes_status ON promotional_codes(status);
CREATE INDEX idx_promo_codes_valid_dates ON promotional_codes(valid_from, valid_until);

-- ============================================================================
-- TRIGGER FUNCTIONS FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_updated_at ON gallery;
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletter_subscribers_updated_at ON newsletter_subscribers;
CREATE TRIGGER update_newsletter_subscribers_updated_at BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_career_applications_updated_at ON career_applications;
CREATE TRIGGER update_career_applications_updated_at BEFORE UPDATE ON career_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_settings_updated_at ON business_settings;
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_packages_updated_at ON service_packages;
CREATE TRIGGER update_service_packages_updated_at BEFORE UPDATE ON service_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_availability_updated_at ON staff_availability;
CREATE TRIGGER update_staff_availability_updated_at BEFORE UPDATE ON staff_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promotional_codes_updated_at ON promotional_codes;
CREATE TRIGGER update_promotional_codes_updated_at BEFORE UPDATE ON promotional_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE 'Frontend tables created successfully!';
    RAISE NOTICE 'Tables created: services, staff, customers, appointments, payments, reviews, gallery, contact_submissions, newsletter_subscribers, career_applications, business_settings, app_settings, service_packages, staff_availability, promotional_codes';
END $$;
