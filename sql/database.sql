-- SQL Database Schema for Emad QA Portfolio Site
-- This file is for documentation purposes. The backend application will automatically create these tables if they don't exist.

-- Create Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Views Table
CREATE TABLE IF NOT EXISTS views (
  id INT PRIMARY KEY DEFAULT 1,
  count INT DEFAULT 0
);

-- Insert initial row for views (if not exists)
INSERT IGNORE INTO views (id, count) VALUES (1, 0);
