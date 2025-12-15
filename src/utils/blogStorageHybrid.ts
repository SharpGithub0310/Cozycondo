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

    // If it's a quota error, try to clean up old posts
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        // Keep only the 3 most recent posts and try again
        const recentPosts = posts.slice(0, 3);
        localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(recentPosts));
        console.warn('Storage quota exceeded. Kept only the 3 most recent posts.');
      } catch (retryError) {
        console.error('Failed to save even after cleanup:', retryError);
        // Clear all blog posts as last resort
        localStorage.removeItem(BLOG_STORAGE_KEY);
        throw new Error('Storage quota exceeded and cleanup failed. All blog posts have been cleared.');
      }
    } else {
      throw error;
    }
  }
}

// ============= HYBRID FUNCTIONS =============

// Get all blog posts (admin view)
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  // Always try localStorage first if in browser
  if (typeof window !== 'undefined') {
    const localPosts = getLocalStoragePosts();
    if (localPosts.length > 0) {
      return localPosts;
    }
  }

  // Then try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      // Use API route for server-side Supabase operations
      const response = await fetch('/api/blog');

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data || [];
    } catch (error) {
      console.error('Supabase API error, falling back to localStorage:', error);
    }
  }

  // Final fallback to localStorage
  return getLocalStoragePosts();
}

// Get published blog posts only (public view)
export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  // Try both localStorage and Supabase, then combine results
  let allPosts: BlogPost[] = [];

  // First try localStorage if in browser
  if (typeof window !== 'undefined') {
    const localPosts = getLocalStoragePosts();
    const publishedLocalPosts = localPosts.filter(post => post.published);
    allPosts.push(...publishedLocalPosts);
  }

  // Then try Supabase if configured and add to results
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (!error && data) {
        allPosts.push(...data);
      }
    } catch (error) {
      console.error('Supabase error:', error);
    }
  }

  // Remove duplicates by slug and return sorted by date
  const uniquePosts = allPosts.filter((post, index, array) =>
    array.findIndex(p => p.slug === post.slug) === index
  );

  return uniquePosts.sort((a, b) =>
    new Date(b.published_at || b.created_at).getTime() -
    new Date(a.published_at || a.created_at).getTime()
  );
}

// Get blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  // Client-side: Check localStorage first
  if (typeof window !== 'undefined') {
    const posts = getLocalStoragePosts();
    const localPost = posts.find(post => post.slug === slug);
    if (localPost) {
      return localPost;
    }

    // If not in localStorage, try Supabase via client
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
        console.error('Supabase error:', error);
        return null;
      }
    }

    return null;
  }

  // Server-side: First try Supabase with admin client
  if (isSupabaseConfigured()) {
    try {
      const adminClient = createAdminClient();
      if (adminClient) {
        const { data, error } = await adminClient
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .single();

        if (!error && data) {
          return data;
        }
      }
    } catch (error) {
      console.error('Supabase error on server:', error);
    }
  }

  // If we're on server and not found in Supabase, it might only exist in localStorage
  // In this case, return null (the client will need to handle this case)
  return null;
}

// Get blog post by ID (admin)
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  // Always try localStorage first if in browser
  if (typeof window !== 'undefined') {
    const posts = getLocalStoragePosts();
    const localPost = posts.find(post => post.id === id);
    if (localPost) {
      return localPost;
    }

    // If in browser and not found in localStorage, check Supabase via API
    if (isSupabaseConfigured()) {
      try {
        // Use API route for client-side Supabase operations
        const response = await fetch(`/api/blog/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        return data || null;
      } catch (error) {
        console.error('Supabase API error:', error);
        return null;
      }
    }

    // Not found in localStorage and no Supabase
    return null;
  }

  // Server-side: Try Supabase with admin client
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

  // Final fallback to localStorage
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
    // On client-side, only use localStorage
    if (typeof window !== 'undefined') {
      const posts = getLocalStoragePosts();
      const existing = posts.find(p => p.slug === slug && p.id !== excludeId);

      if (!existing) {
        return slug;
      }
    } else if (isSupabaseConfigured()) {
      // Server-side: can use admin client
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
        // Fallback to localStorage check
        const posts = getLocalStoragePosts();
        const existing = posts.find(p => p.slug === slug && p.id !== excludeId);

        if (!existing) {
          return slug;
        }
      }
    } else {
      // No Supabase, use localStorage
      const posts = getLocalStoragePosts();
      const existing = posts.find(p => p.slug === slug && p.id !== excludeId);

      if (!existing) {
        return slug;
      }
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
      // Use API route for server-side Supabase operations
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('Supabase API error, falling back to localStorage:', error);
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

  // Client-side: Use API route
  if (typeof window !== 'undefined' && isSupabaseConfigured()) {
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error) {
      console.error('Supabase API error, falling back to localStorage:', error);
    }
  }

  // Server-side: Use admin client
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
  // Client-side: Use API route
  if (typeof window !== 'undefined' && isSupabaseConfigured()) {
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return;
    } catch (error) {
      console.error('Supabase API error, falling back to localStorage:', error);
    }
  }

  // Server-side: Use admin client
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

// Upload image to Supabase Storage or compress for localStorage
export async function uploadBlogImage(file: File): Promise<string> {
  // On client-side, skip Supabase and use compressed images
  if (typeof window !== 'undefined') {
    // For now, always use compressed base64 on client-side
    // TODO: Could create an API route for image uploads if needed
    return compressImageForLocalStorage(file);
  }

  // Server-side: can use Supabase storage
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
      console.error('Supabase storage error, falling back to compressed image:', error);
    }
  }

  // Fallback to compressed base64 for localStorage to avoid quota issues
  return compressImageForLocalStorage(file);
}

// Helper function to compress images for localStorage
async function compressImageForLocalStorage(file: File, maxSize: number = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions to fit within maxSize while maintaining aspect ratio
      let { width, height } = img;

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to compressed base64
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
      resolve(compressedDataUrl);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Clear localStorage blog posts
export function clearLocalStorageBlogPosts(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(BLOG_STORAGE_KEY);
  }
}

// Check localStorage usage and warn if getting full
export function checkLocalStorageUsage(): { percentage: number; message?: string } {
  if (typeof window === 'undefined') return { percentage: 0 };

  try {
    // Estimate localStorage size
    const allItems = Object.keys(localStorage);
    let totalSize = 0;

    for (const key of allItems) {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
      }
    }

    // Estimate percentage (localStorage limit is typically 5MB)
    const percentage = (totalSize / (5 * 1024 * 1024)) * 100;

    let message;
    if (percentage > 90) {
      message = 'Storage is almost full! Consider setting up Supabase for unlimited storage.';
    } else if (percentage > 75) {
      message = 'Storage is getting full. Consider setting up Supabase for better performance.';
    }

    return { percentage: Math.min(percentage, 100), message };
  } catch (error) {
    console.error('Error checking localStorage usage:', error);
    return { percentage: 100, message: 'Unable to check storage usage.' };
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