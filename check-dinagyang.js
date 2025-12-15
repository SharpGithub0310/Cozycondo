// Quick debug script - paste this in browser console on cozycondo.net
(async function debugDinaggyang() {
  console.log('🔍 Debugging dinagyang blog post...');

  // Check localStorage
  const stored = localStorage.getItem('cozy_condo_blog_posts');
  const localPosts = stored ? JSON.parse(stored) : [];
  const dinaggyang = localPosts.find(p => p.slug === 'dinagyang');

  console.log('📱 localStorage check:');
  console.log('  Total posts:', localPosts.length);
  console.log('  Dinagyang found:', !!dinaggyang);

  if (dinaggyang) {
    console.log('  Dinagyang details:', {
      id: dinaggyang.id,
      title: dinaggyang.title,
      slug: dinaggyang.slug,
      published: dinaggyang.published,
      hasImage: !!dinaggyang.featured_image,
      imageSize: dinaggyang.featured_image ? `${Math.round(dinaggyang.featured_image.length / 1024)}KB` : 'None',
      contentLength: `${Math.round(dinaggyang.content.length / 1024)}KB`,
      totalSize: `${Math.round(JSON.stringify(dinaggyang).length / 1024)}KB`
    });

    // Try to force sync this specific post
    console.log('🔄 Attempting to sync dinagyang to Supabase...');

    try {
      const syncResponse = await fetch('/api/blog/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts: [dinaggyang] })
      });

      const syncResult = await syncResponse.json();
      console.log('  Sync result:', syncResult);

      if (syncResult.results && syncResult.results.length > 0) {
        const dinaggangResult = syncResult.results[0];
        console.log('  Dinagyang sync:', dinaggangResult.success ? '✅ Success' : '❌ Failed');
        if (!dinaggangResult.success) {
          console.log('  Error:', dinaggangResult.error);
        }
      }

    } catch (syncError) {
      console.error('❌ Sync failed:', syncError);
    }
  }

  // Check if it exists in Supabase via API
  console.log('🗄️ Checking Supabase...');
  try {
    const supabaseCheck = await fetch('/api/blog/debug?slug=dinagyang');
    const supabaseResult = await supabaseCheck.json();
    console.log('  Supabase result:', supabaseResult);

    if (supabaseResult.slugCheck) {
      console.log('  Found in Supabase:', supabaseResult.slugCheck.found);
      if (!supabaseResult.slugCheck.found) {
        console.log('  Error:', supabaseResult.slugCheck.error);
      }
    }
  } catch (error) {
    console.error('❌ Supabase check failed:', error);
  }

  // Test the troubleshoot endpoint
  console.log('🛠️ Running full troubleshoot...');
  try {
    const troubleResponse = await fetch('/api/blog/troubleshoot/dinagyang');
    const troubleResult = await troubleResponse.json();
    console.log('  Troubleshoot result:', troubleResult);
  } catch (error) {
    console.error('❌ Troubleshoot failed:', error);
  }

  console.log('🏁 Debug complete! Check the results above.');
})();

// Also provide manual functions
window.checkDinagyang = () => {
  const stored = localStorage.getItem('cozy_condo_blog_posts');
  const localPosts = stored ? JSON.parse(stored) : [];
  const dinagyang = localPosts.find(p => p.slug === 'dinagyang');
  console.log('Dinagyang in localStorage:', dinagyang);
  return dinagyang;
};

window.forceSyncDinagyang = async () => {
  const stored = localStorage.getItem('cozy_condo_blog_posts');
  const localPosts = stored ? JSON.parse(stored) : [];
  const dinagyang = localPosts.find(p => p.slug === 'dinagyang');

  if (!dinagyang) {
    console.log('❌ No dinagyang post found in localStorage');
    return;
  }

  console.log('🔄 Force syncing dinagyang...');

  try {
    // Remove the large image if it exists
    const postToSync = { ...dinagyang };
    if (postToSync.featured_image && postToSync.featured_image.startsWith('data:') && postToSync.featured_image.length > 100 * 1024) {
      console.log(`⚠️ Removing large image (${Math.round(postToSync.featured_image.length / 1024)}KB)`);
      postToSync.featured_image = '';
    }

    const response = await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postToSync)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Dinagyang synced successfully:', result);
    } else {
      const error = await response.text();
      console.log('❌ Sync failed:', error);
    }
  } catch (error) {
    console.error('❌ Sync error:', error);
  }
};

console.log('🛠️ Debug tools loaded:');
console.log('  - checkDinagyang() - Check localStorage');
console.log('  - forceSyncDinagyang() - Force sync to Supabase');
console.log('  - Auto-debug starting...');