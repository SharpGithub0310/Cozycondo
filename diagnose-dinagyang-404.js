// Comprehensive diagnosis for dinagyang 404 issue
// Paste this in browser console on cozycondo.net

(async function diagnoseDinagyang() {
  console.log('🔍 Diagnosing dinagyang 404 issue...');

  // Step 1: Check localStorage
  console.log('\n📱 Step 1: Checking localStorage...');
  const stored = localStorage.getItem('cozy_condo_blog_posts');
  const localPosts = stored ? JSON.parse(stored) : [];
  const dinagyang = localPosts.find(p => p.slug === 'dinagyang');

  console.log('  Total posts in localStorage:', localPosts.length);
  console.log('  Dinagyang found:', !!dinagyang);

  if (dinagyang) {
    const postSize = JSON.stringify(dinagyang).length;
    const imageSize = dinagyang.featured_image ? dinagyang.featured_image.length : 0;

    console.log('  Dinagyang details:', {
      id: dinagyang.id,
      title: dinagyang.title,
      slug: dinagyang.slug,
      published: dinagyang.published,
      postSize: `${Math.round(postSize / 1024)}KB`,
      imageSize: imageSize > 0 ? `${Math.round(imageSize / 1024)}KB` : 'None',
      tooLarge: postSize > 2 * 1024 * 1024, // 2MB limit from sync
      imageTooLarge: imageSize > 100 * 1024 // 100KB image limit
    });

    // Step 2: Test if it can sync
    console.log('\n🔄 Step 2: Testing sync capability...');

    // Create a test version without large image
    const testPost = { ...dinagyang };
    if (testPost.featured_image && testPost.featured_image.length > 100 * 1024) {
      console.log('  Removing large image for sync test...');
      testPost.featured_image = '';
    }

    const testPostSize = JSON.stringify(testPost).length;
    console.log('  Test post size:', `${Math.round(testPostSize / 1024)}KB`);
    console.log('  Can sync:', testPostSize <= 2 * 1024 * 1024);

    if (testPostSize <= 2 * 1024 * 1024) {
      console.log('  🧪 Attempting test sync...');

      try {
        const syncResponse = await fetch('/api/blog/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ posts: [testPost] })
        });

        const syncResult = await syncResponse.json();
        console.log('  Sync response:', syncResult);

        if (syncResult.results && syncResult.results.length > 0) {
          const result = syncResult.results[0];
          console.log('  Sync result:', result.success ? '✅ Success' : '❌ Failed');
          if (!result.success) {
            console.log('  Error:', result.error);
          }
        }
      } catch (error) {
        console.log('  ❌ Sync failed:', error.message);
      }
    }
  }

  // Step 3: Check what's in Supabase
  console.log('\n🗄️ Step 3: Checking Supabase...');

  try {
    const debugResponse = await fetch('/api/blog/debug?slug=dinagyang');
    const debugData = await debugResponse.json();

    console.log('  Supabase posts count:', debugData.supabase?.posts?.length || 0);
    console.log('  Dinagyang in Supabase:', debugData.slugCheck?.found || false);

    if (debugData.slugCheck && !debugData.slugCheck.found) {
      console.log('  ❌ Dinagyang NOT found in Supabase');
      console.log('  This explains the 404 error!');
    }

    if (debugData.supabase?.posts) {
      console.log('  All Supabase post slugs:', debugData.supabase.posts.map(p => p.slug));
    }

  } catch (error) {
    console.log('  ❌ Failed to check Supabase:', error.message);
  }

  // Step 4: Check the actual blog page
  console.log('\n🌐 Step 4: Testing blog page access...');

  try {
    const pageResponse = await fetch('/blog/dinagyang');
    console.log('  Page status:', pageResponse.status);
    console.log('  Page accessible:', pageResponse.ok);

    if (!pageResponse.ok) {
      console.log('  ❌ Confirmed 404 error');
    }
  } catch (error) {
    console.log('  ❌ Page test failed:', error.message);
  }

  // Summary and recommendations
  console.log('\n📋 Summary & Recommendations:');

  if (dinagyang) {
    console.log('✅ Post exists in localStorage');

    const postSize = JSON.stringify(dinagyang).length;
    const imageSize = dinagyang.featured_image ? dinagyang.featured_image.length : 0;

    if (postSize > 2 * 1024 * 1024) {
      console.log('❌ Post is too large to sync (>2MB)');
      console.log('   → Solution: Remove or compress the image');
    } else if (imageSize > 100 * 1024) {
      console.log('⚠️  Image is large and will be stripped during sync');
      console.log('   → Solution: Compress image or recreate post');
    } else {
      console.log('✅ Post should be able to sync');
      console.log('   → Try manual sync or check for other issues');
    }
  } else {
    console.log('❌ Post not found in localStorage');
    console.log('   → Solution: Recreate the dinagyang blog post');
  }

  console.log('\n🔧 Quick fixes to try:');
  console.log('1. Visit /admin/blog/sync for manual sync tools');
  console.log('2. Run forceSyncWithoutImage() below');
  console.log('3. Or recreate the post with a smaller image');

})();

// Helper function to force sync without image
window.forceSyncWithoutImage = async function() {
  const stored = localStorage.getItem('cozy_condo_blog_posts');
  const posts = JSON.parse(stored || '[]');
  const dinagyang = posts.find(p => p.slug === 'dinagyang');

  if (!dinagyang) {
    console.log('❌ No dinagyang post to sync');
    return;
  }

  const postToSync = { ...dinagyang, featured_image: '' }; // Remove image

  console.log('🚀 Force syncing dinagyang without image...');

  try {
    const response = await fetch('/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postToSync)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Sync successful! Try visiting /blog/dinagyang now');
      console.log('   Note: Image will be missing, but blog should load');
    } else {
      const error = await response.text();
      console.log('❌ Sync failed:', error);
    }
  } catch (error) {
    console.log('❌ Sync error:', error.message);
  }
};

console.log('🛠️ Dinagyang 404 diagnosis loaded. Starting analysis...');