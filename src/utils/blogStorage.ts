// Simple storage utility for managing blog posts with images
// In production, this would be replaced with API calls to your backend/database

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  featuredImage: string;
  publishDate: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

const BLOG_STORAGE_KEY = 'cozy_condo_blog_posts';

// Get all stored blog posts
export function getStoredBlogPosts(): BlogPost[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(BLOG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading stored blog posts:', error);
    return [];
  }
}

// Save/update a blog post
export function saveBlogPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): BlogPost {
  if (typeof window === 'undefined') throw new Error('Cannot save on server side');

  try {
    const posts = getStoredBlogPosts();
    const now = new Date().toISOString();

    // Check if post with same slug exists
    const existingIndex = posts.findIndex(p => p.slug === postData.slug);

    if (existingIndex >= 0) {
      // Update existing post
      const existingPost = posts[existingIndex];
      const updatedPost: BlogPost = {
        ...existingPost,
        ...postData,
        updatedAt: now,
      };
      posts[existingIndex] = updatedPost;
      localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
      return updatedPost;
    } else {
      // Create new post
      const newPost: BlogPost = {
        id: `blog-${Date.now()}`,
        ...postData,
        createdAt: now,
        updatedAt: now,
      };
      posts.push(newPost);
      localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
      return newPost;
    }
  } catch (error) {
    console.error('Error saving blog post:', error);
    throw error;
  }
}

// Get a specific blog post by ID
export function getBlogPost(id: string): BlogPost | null {
  const posts = getStoredBlogPosts();
  return posts.find(p => p.id === id) || null;
}

// Get a specific blog post by slug
export function getBlogPostBySlug(slug: string): BlogPost | null {
  const posts = getStoredBlogPosts();
  return posts.find(p => p.slug === slug) || null;
}

// Delete a blog post
export function deleteBlogPost(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const posts = getStoredBlogPosts();
    const filteredPosts = posts.filter(p => p.id !== id);
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(filteredPosts));
  } catch (error) {
    console.error('Error deleting blog post:', error);
  }
}

// Get published blog posts only
export function getPublishedBlogPosts(): BlogPost[] {
  const posts = getStoredBlogPosts();
  return posts
    .filter(p => p.status === 'published')
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
}

// Clear all blog posts (useful for development)
export function clearBlogPosts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BLOG_STORAGE_KEY);
}

// Generate unique slug
export function generateUniqueSlug(title: string, excludeId?: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  const posts = getStoredBlogPosts();
  const existingSlugs = posts
    .filter(p => excludeId ? p.id !== excludeId : true)
    .map(p => p.slug);

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // If slug exists, add number suffix
  let counter = 1;
  while (existingSlugs.includes(`${baseSlug}-${counter}`)) {
    counter++;
  }

  return `${baseSlug}-${counter}`;
}