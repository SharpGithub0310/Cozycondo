// Test script to check dinagyang image specifically
// Paste this in browser console on cozycondo.net

(function testDinaggyngImage() {
  console.log('🖼️ Testing dinagyang image...');

  const stored = localStorage.getItem('cozy_condo_blog_posts');
  if (!stored) {
    console.log('❌ No posts in localStorage');
    return;
  }

  const posts = JSON.parse(stored);
  const dinagyang = posts.find(p => p.slug === 'dinagyang');

  if (!dinagyang) {
    console.log('❌ No dinagyang post found');
    return;
  }

  console.log('📊 Dinagyang image analysis:');
  console.log('  Has image:', !!dinagyang.featured_image);

  if (dinagyang.featured_image) {
    const isBase64 = dinagyang.featured_image.startsWith('data:');
    const sizeKB = Math.round(dinagyang.featured_image.length / 1024);

    console.log('  Is base64:', isBase64);
    console.log('  Size:', `${sizeKB}KB`);
    console.log('  Would be stripped:', sizeKB > 100);

    if (isBase64) {
      // Try to create an image to test if it's valid
      const img = new Image();
      img.onload = () => {
        console.log('  ✅ Image is valid');
        console.log('  Dimensions:', `${img.width}x${img.height}`);
      };
      img.onerror = () => {
        console.log('  ❌ Image is corrupted/invalid');
      };
      img.src = dinagyang.featured_image;

      // Show first 100 chars of base64
      console.log('  Base64 preview:', dinagyang.featured_image.substring(0, 100) + '...');
    }
  } else {
    console.log('  ❌ No featured_image field');
  }

  // Test if we can create a smaller version
  if (dinagyang.featured_image && dinagyang.featured_image.startsWith('data:')) {
    console.log('🔄 Testing compression...');

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Very small test
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);

      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.1);
      console.log('  Compressed size:', `${Math.round(compressedBase64.length / 1024)}KB`);
      console.log('  Would pass sync:', compressedBase64.length <= 100 * 1024);
    };

    img.src = dinagyang.featured_image;
  }
})();

console.log('🧪 Dinagyang image test loaded');