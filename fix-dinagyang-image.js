// Fix dinagyang image - paste in browser console on cozycondo.net
(function fixDinaggyngImage() {
  console.log('🔧 Attempting to fix dinagyang image...');

  const stored = localStorage.getItem('cozy_condo_blog_posts');
  if (!stored) {
    console.log('❌ No posts found');
    return;
  }

  const posts = JSON.parse(stored);
  const dinaggangIndex = posts.findIndex(p => p.slug === 'dinagyang');

  if (dinaggangIndex === -1) {
    console.log('❌ Dinagyang post not found');
    return;
  }

  const dinaggang = posts[dinaggangIndex];

  if (!dinaggang.featured_image) {
    console.log('❌ No image to fix');
    return;
  }

  if (!dinaggang.featured_image.startsWith('data:')) {
    console.log('✅ Image is already URL-based, should work');
    return;
  }

  console.log(`📊 Current image: ${Math.round(dinaggang.featured_image.length / 1024)}KB`);

  // Create a super compressed version
  const img = new Image();
  img.onload = function() {
    console.log('🎨 Creating super compressed version...');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Very small size to ensure it works
    const maxSize = 150;
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
    ctx.drawImage(img, 0, 0, width, height);

    // Very low quality to ensure small size
    const compressedImage = canvas.toDataURL('image/jpeg', 0.1);
    const newSizeKB = Math.round(compressedImage.length / 1024);

    console.log(`✨ New image: ${newSizeKB}KB (${width}x${height})`);

    if (newSizeKB <= 50) { // Very safe limit
      // Update the post
      posts[dinaggangIndex].featured_image = compressedImage;

      // Save back to localStorage
      localStorage.setItem('cozy_condo_blog_posts', JSON.stringify(posts));

      console.log('✅ Image fixed and saved to localStorage');
      console.log('🔄 Now syncing to Supabase...');

      // Force sync
      fetch('/api/blog/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts: [posts[dinaggangIndex]] })
      })
      .then(response => response.json())
      .then(result => {
        console.log('📤 Sync result:', result);
        console.log('🎉 Try viewing the blog now!');
      })
      .catch(error => {
        console.error('❌ Sync failed:', error);
      });

    } else {
      console.log('❌ Image still too large after compression');
    }
  };

  img.onerror = function() {
    console.log('❌ Original image is corrupted');
  };

  img.src = dinaggang.featured_image;

})();

console.log('🛠️ Image fix tool loaded');