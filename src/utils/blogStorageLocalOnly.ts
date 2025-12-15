// Temporary localStorage-only blog storage for testing
// This bypasses Supabase completely to test the blog functionality

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

    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        const recentPosts = posts.slice(0, 5);
        localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(recentPosts));
        console.warn('Storage quota exceeded. Kept only the 5 most recent posts.');
      } catch (retryError) {
        console.error('Failed to save even after cleanup:', retryError);
        localStorage.removeItem(BLOG_STORAGE_KEY);
        throw new Error('Storage quota exceeded and cleanup failed. All blog posts have been cleared.');
      }
    } else {
      throw error;
    }
  }
}

// Get all blog posts (admin view)
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return getLocalStoragePosts();
}

// Get published blog posts only (public view)
export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const posts = getLocalStoragePosts();
  return posts.filter(post => post.published);
}

// Get blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = getLocalStoragePosts();
  return posts.find(post => post.slug === slug) || null;
}

// Generate unique slug
export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  let baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
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
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  if (!postData.slug) {
    postData.slug = await generateUniqueSlug(postData.title);
  }

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
  if (postData.slug && postData.title) {
    postData.slug = await generateUniqueSlug(postData.title, id);
  }

  if (postData.published && !postData.published_at) {
    postData.published_at = new Date().toISOString();
  }

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
  const posts = getLocalStoragePosts();
  const filtered = posts.filter(p => p.id !== id);
  saveLocalStoragePosts(filtered);
}

// Compressed image for localStorage
async function compressImageForLocalStorage(file: File, maxSize: number = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
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
      ctx?.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedDataUrl);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Upload image (localStorage version)
export async function uploadBlogImage(file: File): Promise<string> {
  return compressImageForLocalStorage(file);
}

// Check localStorage usage
export function checkLocalStorageUsage(): { percentage: number; message?: string } {
  if (typeof window === 'undefined') return { percentage: 0 };

  try {
    const allItems = Object.keys(localStorage);
    let totalSize = 0;

    for (const key of allItems) {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length;
      }
    }

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