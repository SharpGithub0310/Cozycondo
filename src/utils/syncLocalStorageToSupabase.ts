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

    // Send to sync API
    const response = await fetch('/api/blog/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ posts })
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