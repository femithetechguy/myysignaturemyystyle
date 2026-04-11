-- Create admins table for authentication
-- Run this once to set up the admin user management system

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- Insert default dev user
-- Default: username = "dev", password = "dev" (bcrypted)
-- Hash: $2b$10$vthPJsdWmcf4g9YK1.M7Oufn13nVIcHLhbzzTbfHg/XHvpcV0LVr6
INSERT INTO admins (username, password_hash, email) 
VALUES ('dev', '$2b$10$vthPJsdWmcf4g9YK1.M7Oufn13nVIcHLhbzzTbfHg/XHvpcV0LVr6', 'fttgsolutions@gmail.com')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, email = EXCLUDED.email, updated_at = CURRENT_TIMESTAMP;

-- Insert admin user\n-- Default: username = "admin", password = "admin1$" (bcrypted)
INSERT INTO admins (username, password_hash, email) 
VALUES ('admin', '$2b$10$ha2UuXQZyBx0tmxasOLGUu5uhMdnxXpXukk7H7Ge2XhNl/hGnkrbO', 'egwonookpako559@gmail.com')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, email = EXCLUDED.email, updated_at = CURRENT_TIMESTAMP;

-- View all admins
SELECT id, username, email, is_active, created_at FROM admins;
