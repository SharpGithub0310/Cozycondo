// Supabase-based blog storage utility
import { supabase, createAdminClient } from '@/lib/supabase';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  featured_image: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// Get all blog posts (admin view)
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const adminClient = createAdminClient();

  if (!adminClient) {
    throw new Error('Admin client not available');
  }

  const { data, error } = await adminClient
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error(`Failed to fetch blog posts: ${error.message}`);
  }

  return data || [];
}

// Get published blog posts only (public view)
export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching published blog posts:', error);
    throw new Error(`Failed to fetch published blog posts: ${error.message}`);
  }

  return data || [];
}

// Get blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No row found
      return null;
    }
    console.error('Error fetching blog post by slug:', error);
    throw new Error(`Failed to fetch blog post: ${error.message}`);
  }

  return data;
}

// Get blog post by ID (admin)
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const adminClient = createAdminClient();

  if (!adminClient) {
    throw new Error('Admin client not available');
  }

  const { data, error } = await adminClient
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching blog post by ID:', error);
    throw new Error(`Failed to fetch blog post: ${error.message}`);
  }

  return data;
}

// Generate unique slug
export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const adminClient = createAdminClient();

    if (!adminClient) {
      throw new Error('Admin client not available');
    }

    let query = adminClient
      .from('blog_posts')
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error checking slug uniqueness:', error);
      throw new Error(`Failed to generate unique slug: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Save blog post (create or update)
export async function saveBlogPost(
  postData: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>
): Promise<BlogPost> {
  const adminClient = createAdminClient();

  if (!adminClient) {
    throw new Error('Admin client not available');
  }

  // If no slug provided, generate one
  if (!postData.slug) {
    postData.slug = await generateUniqueSlug(postData.title);
  }

  // Set published_at if publishing
  const publishedAt = postData.published && !postData.published_at
    ? new Date().toISOString()
    : postData.published_at;

  const { data, error } = await adminClient
    .from('blog_posts')
    .insert([{
      ...postData,
      published_at: publishedAt,
      tags: postData.tags || []
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving blog post:', error);
    throw new Error(`Failed to save blog post: ${error.message}`);
  }

  return data;
}

// Update blog post
export async function updateBlogPost(
  id: string,
  postData: Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>
): Promise<BlogPost> {
  const adminClient = createAdminClient();

  if (!adminClient) {
    throw new Error('Admin client not available');
  }

  // If updating slug, ensure it's unique
  if (postData.slug) {
    postData.slug = await generateUniqueSlug(postData.title || '', id);
  }

  // Set published_at if publishing for the first time
  if (postData.published && !postData.published_at) {
    postData.published_at = new Date().toISOString();
  }

  const { data, error } = await adminClient
    .from('blog_posts')
    .update({
      ...postData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating blog post:', error);
    throw new Error(`Failed to update blog post: ${error.message}`);
  }

  return data;
}

// Delete blog post
export async function deleteBlogPost(id: string): Promise<void> {
  const adminClient = createAdminClient();

  if (!adminClient) {
    throw new Error('Admin client not available');
  }

  const { error } = await adminClient
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting blog post:', error);
    throw new Error(`Failed to delete blog post: ${error.message}`);
  }
}

// Upload image to Supabase Storage
export async function uploadBlogImage(file: File): Promise<string> {
  const adminClient = createAdminClient();

  if (!adminClient) {
    throw new Error('Admin client not available');
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { data, error } = await adminClient.storage
    .from('blog-images')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = adminClient.storage
    .from('blog-images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}



// Get blog posts by category
export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts by category:', error);
    throw new Error(`Failed to fetch blog posts by category: ${error.message}`);
  }

  return data || [];
}