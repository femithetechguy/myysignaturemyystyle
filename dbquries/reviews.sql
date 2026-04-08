-- ============================================================================
-- REVIEWS TABLE: Create + Seed from app.json reviews_section
-- ============================================================================

-- Create reviews table (safe to re-run)
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
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, hidden
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

-- ============================================================================
-- Seed 3 reviews from app.json reviews_section
-- ON CONFLICT DO UPDATE keeps data in sync if you re-run
-- ============================================================================
INSERT INTO reviews (review_id, customer_name, rating, title, review_text, is_featured, status) VALUES
(
    'rev_001',
    'Sarah Johnson',
    5,
    'Amazing experience!',
    'Amazing experience! The team is so talented and made me feel so comfortable. My hair looks and feels incredible.',
    true,
    'approved'
),
(
    'rev_002',
    'Maria Garcia',
    5,
    'Best salon in Henry County!',
    'Best salon in Henry County! The attention to detail and care is unmatched. I''ve been coming for 3 years.',
    true,
    'approved'
),
(
    'rev_003',
    'Jennifer Williams',
    5,
    'Highly recommend!',
    'Absolutely love the vibe here. Professional, friendly, and my hair always turns out perfect. Highly recommend!',
    true,
    'approved'
)
ON CONFLICT (review_id) DO UPDATE SET
    customer_name = EXCLUDED.customer_name,
    rating        = EXCLUDED.rating,
    title         = EXCLUDED.title,
    review_text   = EXCLUDED.review_text,
    is_featured   = EXCLUDED.is_featured,
    status        = EXCLUDED.status,
    updated_at    = CURRENT_TIMESTAMP;

-- ============================================================================
-- Auto-update updated_at trigger (safe to re-run)
-- ============================================================================
DROP TRIGGER IF EXISTS set_reviews_updated_at ON reviews;

CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_reviews_updated_at();

DO $$
BEGIN
    RAISE NOTICE 'reviews: table created/verified, 3 records seeded from app.json';
END $$;
