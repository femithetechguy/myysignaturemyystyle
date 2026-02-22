-- Fix career_applications table creation
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status);
CREATE INDEX IF NOT EXISTS idx_career_applications_position ON career_applications(position);
CREATE INDEX IF NOT EXISTS idx_career_applications_email ON career_applications(email);
CREATE INDEX IF NOT EXISTS idx_career_applications_created_at ON career_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_career_applications_application_id ON career_applications(application_id);

-- Create trigger
CREATE TRIGGER update_career_applications_updated_at BEFORE UPDATE ON career_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
