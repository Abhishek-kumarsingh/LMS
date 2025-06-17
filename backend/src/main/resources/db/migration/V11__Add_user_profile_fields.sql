-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN bio TEXT,
ADD COLUMN website VARCHAR(255),
ADD COLUMN linkedin VARCHAR(255),
ADD COLUMN twitter VARCHAR(255),
ADD COLUMN github VARCHAR(255);
