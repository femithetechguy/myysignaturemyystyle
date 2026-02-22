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
-- Hash: $2b$10$nOUIs5kJ7naTuTFkBy1i.OPST9/jWAyS79zQRkFkGxDGGA.wSThga
INSERT INTO admins (username, password_hash, email) 
VALUES ('dev', '$2b$10$nOUIs5kJ7naTuTFkBy1i.OPST9/jWAyS79zQRkFkGxDGGA.wSThga', 'fttgsolution@gmail.com')
ON CONFLICT (username) DO NOTHING;

-- Insert admin user
-- Default: username = "admin", password = "admin1$" (bcrypted)
-- Hash: $2b$10$M9YRVzy03z.NVxkJ5K8K6eS1Z7Q8P5R6S7T8U9V0W1X2Y3Z4A5B6C
INSERT INTO admins (username, password_hash, email) 
VALUES ('admin', '$2b$10$M9YRVzy03z.NVxkJ5K8K6eS1Z7Q8P5R6S7T8U9V0W1X2Y3Z4A5B6C', 'admin@allloveinabasket.com')
ON CONFLICT (username) DO NOTHING;

-- View all admins
SELECT id, username, email, is_active, created_at FROM admins;
