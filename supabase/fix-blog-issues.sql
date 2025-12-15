-- Comprehensive fix for Supabase blog issues
-- Run these queries in your Supabase SQL Editor

-- 1. First, check the current structure of blog_posts table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'blog_posts'
ORDER BY ordinal_position;

-- 2. Add tags column if it doesn't exist (you already ran this)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 3. Check current RLS policies
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'blog_posts';

-- 4. Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Service role full access to blog" ON blog_posts;

-- 5. Create proper RLS policies
-- Allow public to read published posts
CREATE POLICY "Public can view published blog posts" ON blog_posts
  FOR SELECT USING (published = true);

-- Allow service role full access for admin operations
CREATE POLICY "Service role full access to blog" ON blog_posts
  FOR ALL USING (
    auth.role() = 'service_role' OR
    current_user = 'service_role'
  );

-- 6. Alternative: If service role policy doesn't work, try this
-- This allows full access when using the service role key
CREATE POLICY "Service role bypass RLS" ON blog_posts
  FOR ALL TO service_role
  USING (true);

-- 7. Test inserting a blog post (this should work with service role)
DO $$
DECLARE
    test_id UUID;
BEGIN
    INSERT INTO blog_posts (title, slug, excerpt, content, author, category, tags, published)
    VALUES (
        'Test Supabase Blog Post',
        'test-supabase-blog-post',
        'Testing if Supabase blog insertion works',
        'This is a test post to verify that Supabase can save blog posts correctly.',
        'System Test',
        'test',
        ARRAY['test', 'supabase'],
        false
    )
    RETURNING id INTO test_id;

    RAISE NOTICE 'Test blog post created with ID: %', test_id;

    -- Clean up
    DELETE FROM blog_posts WHERE id = test_id;
    RAISE NOTICE 'Test blog post cleaned up';
END $$;

-- 8. Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'blog_posts';

-- 9. If needed, you can temporarily disable RLS for testing (NOT recommended for production)
-- ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;