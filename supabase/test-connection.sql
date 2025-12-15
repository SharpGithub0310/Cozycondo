-- Test Supabase connection and blog_posts table structure
-- Run these queries in your Supabase SQL Editor

-- 1. Check if blog_posts table exists and its structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'blog_posts'
ORDER BY ordinal_position;

-- 2. Test inserting a simple blog post
INSERT INTO blog_posts (title, slug, excerpt, content, author, category, published)
VALUES (
  'Test Connection Post',
  'test-connection-post',
  'Testing Supabase connection',
  'This is a test post to verify Supabase is working correctly.',
  'System Test',
  'test',
  false
);

-- 3. Check if the post was inserted
SELECT id, title, slug, published, created_at
FROM blog_posts
WHERE slug = 'test-connection-post';

-- 4. Clean up test post
DELETE FROM blog_posts WHERE slug = 'test-connection-post';