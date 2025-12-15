// Trace what happens when accessing a blog post with photos
// This will help us understand where the process breaks
// Paste this in browser console on cozycondo.net

(async function tracePhotoBlogAccess() {
  console.log('📸 Tracing photo blog access pipeline...');

  // Step 1: Check localStorage posts with photos
  console.log('\n📱 Step 1: Analyzing localStorage posts...');
  const stored = localStorage.getItem('cozy_condo_blog_posts');
  const localPosts = stored ? JSON.parse(stored) : [];

  console.log('  Total posts in localStorage:', localPosts.length);

  const postsWithPhotos = localPosts.filter(p => p.featured_image && p.featured_image.length > 1000);
  console.log('  Posts with photos:', postsWithPhotos.length);

  postsWithPhotos.forEach((post, index) => {
    const imageSize = Math.round(post.featured_image.length / 1024);
    const postSize = Math.round(JSON.stringify(post).length / 1024);

    console.log(`    ${index + 1}. ${post.title} (${post.slug}):`);
    console.log(`       Image: ${imageSize}KB, Total: ${postSize}KB, Published: ${post.published}`);
    console.log(`       Image type: ${post.featured_image.substring(0, 30)}...`);
  });

  // Step 2: Test the sync process step by step
  console.log('\n🔄 Step 2: Testing sync process...');

  if (postsWithPhotos.length > 0) {
    const testPost = postsWithPhotos[0]; // Test first photo post
    console.log(`  Testing with: ${testPost.title}`);

    // Test our current restrictions
    const imageSize = testPost.featured_image.length;
    const postSize = JSON.stringify(testPost).length;

    console.log('  Current restrictions check:');
    console.log(`    Image > 100KB: ${imageSize > 100 * 1024} (${Math.round(imageSize / 1024)}KB)`);
    console.log(`    Post > 2MB: ${postSize > 2 * 1024 * 1024} (${Math.round(postSize / 1024)}KB)`);
    console.log(`    Would be blocked: ${imageSize > 100 * 1024 || postSize > 2 * 1024 * 1024}`);

    // Test API limits
    console.log('\n  Testing API limits:');

    try {
      // Test 1: Direct API call (bypass our restrictions)
      console.log('    Testing direct API save...');
      const apiResponse = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPost)
      });

      console.log(`    API Response: ${apiResponse.status} ${apiResponse.statusText}`);

      if (apiResponse.ok) {
        const result = await apiResponse.json();
        console.log('    ✅ Direct API save works!');
        console.log(`    Saved with ID: ${result.id}`);

        // Now test if we can retrieve it
        console.log('    Testing retrieval...');

        try {
          const retrieveResponse = await fetch(`/api/blog/slug/${testPost.slug}`);
          console.log(`    Retrieve Response: ${retrieveResponse.status}`);

          if (retrieveResponse.ok) {
            const retrievedPost = await retrieveResponse.json();
            console.log('    ✅ Retrieval works!');
            console.log(`    Retrieved image size: ${Math.round(retrievedPost.featured_image?.length / 1024 || 0)}KB`);
          } else {
            console.log('    ❌ Retrieval failed');
          }

        } catch (retrieveError) {
          console.log('    ❌ Retrieve error:', retrieveError.message);
        }

      } else {
        const errorText = await apiResponse.text();
        console.log('    ❌ API save failed:', errorText);
      }

    } catch (apiError) {
      console.log('    ❌ API test failed:', apiError.message);
    }
  }

  // Step 3: Check server-side blog rendering
  console.log('\n🖥️ Step 3: Testing server-side rendering...');

  // Test a known working blog vs photo blog
  const workingBlogs = localPosts.filter(p => !p.featured_image && p.published);
  const photoBlogs = localPosts.filter(p => p.featured_image && p.published);

  console.log(`  Working blogs (no photo): ${workingBlogs.length}`);
  console.log(`  Photo blogs: ${photoBlogs.length}`);

  // Test access to both types
  if (workingBlogs.length > 0) {
    const workingSlug = workingBlogs[0].slug;
    console.log(`  Testing working blog: /blog/${workingSlug}`);

    try {
      const workingResponse = await fetch(`/blog/${workingSlug}`);
      console.log(`    Status: ${workingResponse.status} ${workingResponse.ok ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`    Error: ${error.message}`);
    }
  }

  if (photoBlogs.length > 0) {
    const photoSlug = photoBlogs[0].slug;
    console.log(`  Testing photo blog: /blog/${photoSlug}`);

    try {
      const photoResponse = await fetch(`/blog/${photoSlug}`);
      console.log(`    Status: ${photoResponse.status} ${photoResponse.ok ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`    Error: ${error.message}`);
    }
  }

  // Step 4: Check what's actually in Supabase
  console.log('\n🗄️ Step 4: Checking Supabase database...');

  try {
    const supabaseResponse = await fetch('/api/blog/debug');
    const supabaseData = await supabaseResponse.json();

    console.log('  Supabase posts:', supabaseData.supabase?.posts?.length || 0);
    console.log('  Post slugs in Supabase:', supabaseData.supabase?.posts?.map(p => p.slug) || []);

    const postsWithImages = supabaseData.supabase?.posts?.filter(p => p.featured_image) || [];
    console.log('  Posts with images in Supabase:', postsWithImages.length);

    postsWithImages.forEach(post => {
      const imageSize = post.featured_image ? Math.round(post.featured_image.length / 1024) : 0;
      console.log(`    ${post.slug}: ${imageSize}KB image`);
    });

  } catch (error) {
    console.log('  ❌ Supabase check failed:', error.message);
  }

  // Summary and recommendations
  console.log('\n📋 Analysis Summary:');
  console.log('================');

  const hasPhotoBlogs = postsWithPhotos.length > 0;
  const hasWorkingBlogs = localPosts.filter(p => !p.featured_image).length > 0;

  if (!hasPhotoBlogs) {
    console.log('❌ No photo blogs found in localStorage');
    console.log('   → Create a test blog with a photo to debug');
  } else {
    console.log('✅ Photo blogs exist in localStorage');

    const avgImageSize = postsWithPhotos.reduce((sum, p) => sum + p.featured_image.length, 0) / postsWithPhotos.length;
    console.log(`   → Average image size: ${Math.round(avgImageSize / 1024)}KB`);

    if (avgImageSize > 100 * 1024) {
      console.log('⚠️  Images are being blocked by our 100KB limit');
      console.log('   → This limit is too restrictive for quality photos');
      console.log('   → Recommendation: Remove or increase the limit');
    }
  }

  console.log('\n🔧 Recommended Actions:');
  console.log('1. Remove artificial 100KB image limit');
  console.log('2. Increase post size limit from 2MB to 10MB');
  console.log('3. Test with actual 1-5MB photos as intended');
  console.log('4. Fix any real technical limitations found');

})();

// Helper to remove artificial limits
window.removeArtificialLimits = function() {
  console.log('🚫 Note: Artificial limits are in the server code');
  console.log('   Need to update:');
  console.log('   - syncLocalStorageToSupabase.ts (100KB image limit)');
  console.log('   - blog/sync/route.ts (2MB post limit)');
  console.log('   - Make them more reasonable for modern photos');
};

console.log('📸 Photo blog access tracer loaded. Starting analysis...');