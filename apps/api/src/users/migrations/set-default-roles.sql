-- Migration: Set default 'user' role for existing users without a role
-- Run this SQL script once to update existing users in the database

UPDATE users 
SET role = 'user' 
WHERE role IS NULL OR role = '';

-- Verify the update
SELECT COUNT(*) as updated_count 
FROM users 
WHERE role = 'user';
