// Hybrid blog storage utility that works with Supabase or falls back to localStorage
import { supabase, createAdminClient, isSupabaseConfigured } from '@/lib/supabase';

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

const BLOG_STORAGE_KEY = 'cozy_condo_blog_posts';

// ============= LOCALSTORAGE FUNCTIONS =============

function getLocalStoragePosts(): BlogPost[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(BLOG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return [];
  }
}

function saveLocalStoragePosts(posts: BlogPost[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// ============= HYBRID FUNCTIONS =============

// Get all blog posts (admin view)
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      if (!adminClient) throw new Error('Admin client not available');

      const { data, error } = await adminClient
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Supabase error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  return getLocalStoragePosts();
}

// Get published blog posts only (public view)
export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Supabase error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const posts = getLocalStoragePosts();
  return posts.filter(post => post.published);
}

// Get blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Supabase error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const posts = getLocalStoragePosts();
  return posts.find(post => post.slug === slug) || null;
}

// Get blog post by ID (admin)
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      if (!adminClient) throw new Error('Admin client not available');

      const { data, error } = await adminClient
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Supabase error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const posts = getLocalStoragePosts();
  return posts.find(post => post.id === id) || null;
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
    if (isSupabaseConfigured()) {
      try {
        const adminClient = createAdminClient();
        if (!adminClient) throw new Error('Admin client not available');

        let query = adminClient
          .from('blog_posts')
          .select('id')
          .eq('slug', slug);

        if (excludeId) {
          query = query.neq('id', excludeId);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (!data || data.length === 0) {
          return slug;
        }
      } catch (error) {
        console.error('Supabase error, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    const posts = getLocalStoragePosts();
    const existing = posts.find(p => p.slug === slug && p.id !== excludeId);

    if (!existing) {
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
  // Generate ID and timestamps
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  // If no slug provided, generate one
  if (!postData.slug) {
    postData.slug = await generateUniqueSlug(postData.title);
  }

  // Set published_at if publishing
  const publishedAt = postData.published && !postData.published_at
    ? now
    : postData.published_at;

  const newPost: BlogPost = {
    ...postData,
    id,
    published_at: publishedAt,
    created_at: now,
    updated_at: now,
    tags: postData.tags || []
  };

  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      if (!adminClient) throw new Error('Admin client not available');

      const { data, error } = await adminClient
        .from('blog_posts')
        .insert([newPost])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const posts = getLocalStoragePosts();
  posts.unshift(newPost);
  saveLocalStoragePosts(posts);
  return newPost;
}

// Update blog post
export async function updateBlogPost(
  id: string,
  postData: Partial<Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>>
): Promise<BlogPost> {
  // If updating slug, ensure it's unique
  if (postData.slug) {
    postData.slug = await generateUniqueSlug(postData.title || '', id);
  }

  // Set published_at if publishing for the first time
  if (postData.published && !postData.published_at) {
    postData.published_at = new Date().toISOString();
  }

  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      if (!adminClient) throw new Error('Admin client not available');

      const { data, error } = await adminClient
        .from('blog_posts')
        .update({
          ...postData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Supabase error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const posts = getLocalStoragePosts();
  const index = posts.findIndex(p => p.id === id);

  if (index === -1) {
    throw new Error('Blog post not found');
  }

  posts[index] = {
    ...posts[index],
    ...postData,
    updated_at: new Date().toISOString()
  };

  saveLocalStoragePosts(posts);
  return posts[index];
}

// Delete blog post
export async function deleteBlogPost(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      if (!adminClient) throw new Error('Admin client not available');

      const { error } = await adminClient
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return;
    } catch (error) {
      console.error('Supabase error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const posts = getLocalStoragePosts();
  const filtered = posts.filter(p => p.id !== id);
  saveLocalStoragePosts(filtered);
}

// Upload image to Supabase Storage or convert to base64
export async function uploadBlogImage(file: File): Promise<string> {
  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      if (!adminClient) throw new Error('Admin client not available');

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await adminClient.storage
        .from('blog-images')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = adminClient.storage
        .from('blog-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Supabase storage error, falling back to base64:', error);
    }
  }

  // Fallback to base64 for localStorage
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Clear localStorage blog posts
export function clearLocalStorageBlogPosts(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(BLOG_STORAGE_KEY);
  }
}

// Get blog posts by category
export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .eq('category', category)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Supabase error, falling back to localStorage:', error);
    }
  }

  // Fallback to localStorage
  const posts = getLocalStoragePosts();
  return posts.filter(post => post.published && post.category === category);
}