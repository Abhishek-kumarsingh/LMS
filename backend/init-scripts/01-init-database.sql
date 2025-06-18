-- Database Initialization Script
-- This script ensures the database and user are properly set up

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS modern_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create test database for CI/CD
CREATE DATABASE IF NOT EXISTS test_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to the application user
GRANT ALL PRIVILEGES ON modern_lms.* TO 'lms_user'@'%';
GRANT ALL PRIVILEGES ON test_lms.* TO 'test_user'@'%';

-- Flush privileges to ensure they take effect
FLUSH PRIVILEGES;

-- Log successful initialization
SELECT 'Database initialization completed successfully!' as status;
