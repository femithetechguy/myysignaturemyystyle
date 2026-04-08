-- ============================================================================
-- BUSINESS SETTINGS TABLE: Create + Seed from app.json
-- Safe to re-run: ON CONFLICT DO UPDATE keeps data in sync
-- ============================================================================

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

-- ============================================================================
-- Seed: salon_policies
-- ============================================================================
INSERT INTO business_settings (setting_key, setting_value, description) VALUES (
    'salon_policies',
    '{
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
        "deposits": {
            "title": "Deposits",
            "points": [
                "All deposits are non-refundable."
            ]
        },
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
    }'::jsonb,
    'Full salon policies and guest guidelines displayed on the website'
)
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description   = EXCLUDED.description,
    updated_at    = CURRENT_TIMESTAMP;

-- ============================================================================
-- Seed: booking_disclaimer (shown in booking modal)
-- ============================================================================
INSERT INTO business_settings (setting_key, setting_value, description) VALUES (
    'booking_disclaimer',
    '{
        "deposit_note": "A deposit is required to secure your appointment (amount depends on the service). Payment options are listed below.",
        "cancellation_note": "Cancellations made less than 12 hours in advance will incur your deposit service charge. No-shows receive no refund.",
        "late_policy": "A grace period of 10–20 minutes may be allowed. Late arrivals may result in a shortened service or cancellation with applicable fees.",
        "confirmation_note": "By completing this booking you agree to our deposit, cancellation, and late-arrival policies."
    }'::jsonb,
    'Short policy text shown inside the booking modal'
)
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description   = EXCLUDED.description,
    updated_at    = CURRENT_TIMESTAMP;

-- ============================================================================
-- Auto-update updated_at trigger (safe to re-run)
-- ============================================================================
DROP TRIGGER IF EXISTS set_business_settings_updated_at ON business_settings;

CREATE OR REPLACE FUNCTION update_business_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_business_settings_updated_at
BEFORE UPDATE ON business_settings
FOR EACH ROW EXECUTE FUNCTION update_business_settings_updated_at();

DO $$
BEGIN
    RAISE NOTICE 'business_settings: table created/verified, salon_policies and booking_disclaimer seeded';
END $$;
