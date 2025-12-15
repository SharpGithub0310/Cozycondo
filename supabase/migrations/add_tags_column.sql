-- Add tags column to blog_posts table
-- Run this in your Supabase SQL Editor to add the missing tags column

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for tags for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_tags ON blog_posts USING GIN(tags);