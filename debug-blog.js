// Simple debug script to check blog posts
// Run this in browser console on cozycondo.net

async function debugBlogPost(slug) {
  console.log(`🔍 Debugging blog post: ${slug}`);

  // Check localStorage
  const stored = localStorage.getItem('cozy_condo_blog_posts');
  const localPosts = stored ? JSON.parse(stored) : [];
  const localPost = localPosts.find(p => p.slug === slug);

  console.log('📱 localStorage:', localPost ? 'Found' : 'Not found');
  if (localPost) {
    console.log('📱 Local post data:', {
      id: localPost.id,
      title: localPost.title,
      slug: localPost.slug,
      published: localPost.published,
      hasContent: !!localPost.content,
      contentLength: localPost.content?.length,
      hasExcerpt: !!localPost.excerpt,
      category: localPost.category,
      tags: localPost.tags
    });
  }

  // Check Supabase via API
  try {
    const response = await fetch(`/api/blog/debug?slug=${slug}`);
    const debugData = await response.json();
    console.log('🗄️ Supabase debug:', debugData);
  } catch (error) {
    console.error('❌ Supabase debug error:', error);
  }

  // Try to fetch via the actual blog route
  try {
    const response = await fetch(`/blog/${slug}`);
    console.log(`🌐 Blog page status: ${response.status}`);
    if (!response.ok) {
      console.log(`❌ Blog page error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Blog page fetch error:', error);
  }

  // Try the API route directly
  try {
    const response = await fetch(`/api/blog/slug/${slug}`);
    if (response.ok) {
      const apiPost = await response.json();
      console.log('✅ API route works:', {
        id: apiPost.id,
        title: apiPost.title,
        slug: apiPost.slug,
        published: apiPost.published
      });
    } else {
      console.log(`❌ API route error: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ API route error:', error);
  }
}

// Usage:
// debugBlogPost('dinagyang')
// debugBlogPost('food-trip')

console.log('🛠️ Blog debug tool loaded. Usage: debugBlogPost("slug-name")');