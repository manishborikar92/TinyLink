-- TinyLink Database Schema
-- PostgreSQL Database Schema for URL Shortener

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  last_clicked TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_code ON links(code);
CREATE INDEX IF NOT EXISTS idx_created_at ON links(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE links IS 'Stores shortened URL links and their statistics';
COMMENT ON COLUMN links.code IS 'Unique 6-8 character alphanumeric code for the short URL';
COMMENT ON COLUMN links.url IS 'Original long URL to redirect to';
COMMENT ON COLUMN links.clicks IS 'Total number of times this link has been clicked';
COMMENT ON COLUMN links.last_clicked IS 'Timestamp of the most recent click';
COMMENT ON COLUMN links.created_at IS 'Timestamp when the link was created';
