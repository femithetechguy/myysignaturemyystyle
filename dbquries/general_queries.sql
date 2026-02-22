-- General Admin Queries
-- Useful queries for managing admin users and data

-- ==========================================
-- UPDATE ADMIN USER EMAILS
-- ==========================================

-- Update dev user email
UPDATE admins 
SET email = 'dev@fttgsolutions.com', updated_at = CURRENT_TIMESTAMP 
WHERE username = 'dev';

-- Update admin user email
UPDATE admins 
SET email = 'fttgsolutions@gmail.com', updated_at = CURRENT_TIMESTAMP 
WHERE username = 'admin';

-- Verify the email changes
SELECT id, username, email, is_active, created_at, updated_at FROM admins;


-- ==========================================
-- USEFUL ADMIN USER QUERIES
-- ==========================================

-- Get all active admins
SELECT id, username, email, created_at FROM admins WHERE is_active = true;

-- Deactivate a user
-- UPDATE admins SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE username = 'username';

-- Activate a user
-- UPDATE admins SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE username = 'username';

-- Delete a user (BE CAREFUL!)
-- DELETE FROM admins WHERE username = 'username';

-- Count total admins
SELECT COUNT(*) as total_admins FROM admins;

-- Check for duplicate users
SELECT * FROM admins ORDER BY id;

-- Delete old duplicate records (keep only the latest 2)
-- DELETE FROM admins WHERE id NOT IN (SELECT id FROM admins ORDER BY created_at DESC LIMIT 2);

-- Or delete specific old records by ID (if you know which ones are duplicates)
-- DELETE FROM admins WHERE id IN (3, 4);
