// Image compression utility to reduce localStorage usage

export async function compressImage(base64String: string, maxWidth: number = 1200): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64String); // Return original if canvas context fails
        return;
      }

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG with 0.8 quality for better compression
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      resolve(compressedBase64);
    };

    img.onerror = () => {
      resolve(base64String); // Return original if image loading fails
    };

    img.src = base64String;
  });
}

// Clear old or large items from localStorage
export function cleanupStorage() {
  try {
    // Get current storage size
    const storageSize = new Blob([JSON.stringify(localStorage)]).size;
    console.log('Current localStorage size:', Math.round(storageSize / 1024), 'KB');

    // If storage is over 4MB, clear old data
    if (storageSize > 4 * 1024 * 1024) {
      // Clear old blog posts with large images
      const posts = localStorage.getItem('cozy_condo_blog_posts');
      if (posts) {
        const parsedPosts = JSON.parse(posts);
        // Keep only posts without images or recent posts
        const cleanedPosts = parsedPosts.filter((post: any) => {
          // Keep posts from last 30 days or without images
          const postDate = new Date(post.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return postDate > thirtyDaysAgo || !post.featuredImage;
        });
        localStorage.setItem('cozy_condo_blog_posts', JSON.stringify(cleanedPosts));
      }
    }
  } catch (error) {
    console.error('Error cleaning up storage:', error);
  }
}

// Get storage usage info
export function getStorageInfo() {
  const storageSize = new Blob([JSON.stringify(localStorage)]).size;
  const sizeInKB = Math.round(storageSize / 1024);
  const sizeInMB = (storageSize / (1024 * 1024)).toFixed(2);

  return {
    bytes: storageSize,
    kilobytes: sizeInKB,
    megabytes: parseFloat(sizeInMB),
    percentage: Math.round((storageSize / (5 * 1024 * 1024)) * 100) // Assuming 5MB limit
  };
}