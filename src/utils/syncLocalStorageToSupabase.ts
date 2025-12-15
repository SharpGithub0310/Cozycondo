// Utility to sync localStorage blog posts to Supabase
export async function syncLocalStorageToSupabase(): Promise<{ success: boolean; message: string; results?: any }> {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Can only run on client-side' };
  }

  try {
    // Get posts from localStorage
    const stored = localStorage.getItem('cozy_condo_blog_posts');
    if (!stored) {
      return { success: true, message: 'No posts in localStorage to sync' };
    }

    const posts = JSON.parse(stored);
    if (!Array.isArray(posts) || posts.length === 0) {
      return { success: true, message: 'No posts in localStorage to sync' };
    }

    console.log(`Found ${posts.length} posts in localStorage, syncing to Supabase...`);

    // Process posts and handle large images
    const processedPosts = posts.map(post => {
      const processedPost = { ...post };

      // Check if featured_image is a large base64 string
      if (processedPost.featured_image && processedPost.featured_image.startsWith('data:')) {
        const imageSize = processedPost.featured_image.length;
        console.log(`Post "${post.slug}" has base64 image of ${Math.round(imageSize / 1024)}KB`);

        // Only skip extremely large images (>5MB base64, which is ~3.75MB actual image)
        if (imageSize > 5 * 1024 * 1024) {
          console.warn(`Skipping extremely large image for "${post.slug}" (${Math.round(imageSize / 1024)}KB)`);
          processedPost.featured_image = ''; // Remove only truly massive images
        }
      }

      return processedPost;
    });

    // Send to sync API
    const response = await fetch('/api/blog/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ posts: processedPosts })
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Sync result:', result);

    return {
      success: true,
      message: `Sync completed: ${result.synced} synced, ${result.failed} failed`,
      results: result
    };

  } catch (error) {
    console.error('Sync error:', error);
    return {
      success: false,
      message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Auto-sync localStorage posts to Supabase on page load
export function initAutoSync() {
  if (typeof window === 'undefined') return;

  // Check if we should sync (do it once per session)
  const sessionKey = 'blog_sync_attempted';
  if (sessionStorage.getItem(sessionKey)) {
    return; // Already attempted this session
  }

  // Mark as attempted
  sessionStorage.setItem(sessionKey, 'true');

  // Sync in background after a short delay
  setTimeout(async () => {
    const result = await syncLocalStorageToSupabase();
    if (result.success && result.results) {
      if (result.results.synced > 0) {
        console.log(`✅ Auto-synced ${result.results.synced} blog posts to Supabase`);
      }
    }
  }, 1000);
}