import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, User, Share2, Facebook, MessageCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getPublishedBlogPosts } from '@/utils/blogStorageHybrid';

const calculateReadTime = (content: string) => {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readTime} min read`;
};

export async function generateStaticParams() {
  // Return empty array for dynamic generation
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  
  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    console.log(`[BlogPostPage] Loading post: ${slug}`);

    const post = await getBlogPostBySlug(slug);
    console.log(`[BlogPostPage] Post loaded: ${post ? 'success' : 'not found'}`);

    if (!post || !post.published) {
      console.log(`[BlogPostPage] Post not found or unpublished: ${slug}`);
      notFound();
    }

    // Log post details for debugging
    console.log(`[BlogPostPage] Post details:`, {
      id: post.id,
      title: post.title,
      hasImage: !!post.featured_image,
      imageSize: post.featured_image ? Math.round(post.featured_image.length / 1024) : 0,
      contentLength: post.content ? post.content.length : 0
    });

    // Sanitize post data for SSR safety
    const safePost = {
      ...post,
      // Remove or truncate extremely large images that could crash SSR
      featured_image: post.featured_image && post.featured_image.length > 3 * 1024 * 1024
        ? '' // Clear image if > 3MB to prevent SSR issues
        : post.featured_image,
      // Ensure content is safe
      content: post.content || 'No content available.',
      title: post.title || 'Untitled Post',
      excerpt: post.excerpt || '',
      author: post.author || 'Unknown',
      category: post.category || 'General'
    };

    console.log(`[BlogPostPage] Sanitized post for SSR, image size: ${safePost.featured_image ? Math.round(safePost.featured_image.length / 1024) : 0}KB`);

    return await renderBlogPost(safePost, slug);

  } catch (error) {
    console.error(`[BlogPostPage] Critical error:`, error);
    // Return a safe error page instead of crashing
    return (
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold text-[#5f4a38] mb-4">
              Blog Post Unavailable
            </h1>
            <p className="text-[#7d6349] mb-8">
              This blog post is temporarily unavailable. Please try again later.
            </p>
            <a
              href="/blog"
              className="btn-primary"
            >
              Back to Blog
            </a>
          </div>
        </div>
      </div>
    );
  }
}

async function renderBlogPost(post: any, slug: string) {
  try {
    // Get related posts (same category, excluding current)
    let relatedPosts = [];
    try {
      console.log(`[BlogPostPage] Loading related posts...`);
      const allPosts = await getPublishedBlogPosts();
      relatedPosts = allPosts
        .filter(p => p.category === post.category && p.id !== post.id)
        .slice(0, 2);
      console.log(`[BlogPostPage] Found ${relatedPosts.length} related posts`);
    } catch (error) {
      console.error(`[BlogPostPage] Error loading related posts:`, error);
      // Continue without related posts
    }

  return (
    <div className="pt-20">
      {/* Back navigation */}
      <div className="bg-[#faf3e6] py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#7d6349] hover:text-[#0d9488] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <article className="bg-white">
        <header className="py-12 bg-gradient-to-br from-[#fefdfb] to-[#fdf9f3]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-block px-3 py-1 bg-[#14b8a6] text-white text-sm font-medium rounded-full mb-4">
              {post.category}
            </span>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-[#5f4a38] mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[#7d6349]">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {calculateReadTime(post.content)}
              </span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
          <div className="aspect-[2/1] rounded-2xl overflow-hidden shadow-xl">
            {(() => {
              // Safely check image conditions
              try {
                const hasImage = post.featured_image && typeof post.featured_image === 'string';
                const imageSize = hasImage ? post.featured_image.length : 0;
                const isReasonableSize = imageSize > 0 && imageSize < 5 * 1024 * 1024; // 5MB limit for SSR safety

                console.log(`[BlogPostPage] Image check: hasImage=${hasImage}, size=${Math.round(imageSize/1024)}KB, reasonable=${isReasonableSize}`);

                if (hasImage && isReasonableSize) {
                  return (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('[BlogPostPage] Image load error, showing fallback');
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  );
                } else {
                  if (hasImage && !isReasonableSize) {
                    console.log(`[BlogPostPage] Image too large for SSR: ${Math.round(imageSize/1024)}KB`);
                  }
                  return null;
                }
              } catch (error) {
                console.error('[BlogPostPage] Error checking image:', error);
                return null;
              }
            })()}
            <div className="w-full h-full bg-gradient-to-br from-[#0d9488] to-[#14b8a6] flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-white/20 flex items-center justify-center">
                  <span className="font-display text-3xl font-bold">CC</span>
                </div>
                <p className="text-lg font-medium">Cozy Condo Blog</p>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-lg max-w-none">
            {(() => {
              try {
                if (!post.content || typeof post.content !== 'string') {
                  console.log('[BlogPostPage] No valid content found');
                  return <p className="text-[#7d6349]">Content not available.</p>;
                }

                console.log(`[BlogPostPage] Rendering content: ${post.content.length} characters`);
                return post.content.split('\n').map((paragraph, i) => {
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={i} className="font-display text-2xl font-semibold text-[#5f4a38] mt-8 mb-4">
                        {paragraph.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3 key={i} className="font-display text-xl font-semibold text-[#5f4a38] mt-6 mb-3">
                        {paragraph.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('---')) {
                    return <hr key={i} className="my-8 border-[#faf3e6]" />;
                  }
                  if (paragraph.trim() === '') {
                    return null;
                  }
                  if (paragraph.startsWith('*') && paragraph.endsWith('*')) {
                    return (
                      <p key={i} className="text-[#7d6349] italic my-4">
                        {paragraph.slice(1, -1)}
                      </p>
                    );
                  }
                  return (
                    <p key={i} className="text-[#7d6349] my-4 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                });
              } catch (error) {
                console.error('[BlogPostPage] Error rendering content:', error);
                return <p className="text-[#7d6349]">Error displaying content.</p>;
              }
            })()}
          </div>

          {/* Share & CTA */}
          <div className="mt-12 pt-8 border-t border-[#faf3e6]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[#7d6349]">Share:</span>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://cozycondo.net/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
              <a
                href="https://m.me/cozycondoiloilocity"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Book Your Stay</span>
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="section bg-[#faf3e6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold text-[#5f4a38] mb-8">
              Related Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group card bg-white"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    {relatedPost.featured_image && relatedPost.featured_image.length < 10 * 1024 * 1024 ? (
                      <img
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-[#d4b896] to-[#b89b7a] w-full h-full flex items-center justify-center">
                        <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                          <span className="font-display text-xl font-bold text-white/80">CC</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl font-semibold text-[#5f4a38] group-hover:text-[#0d9488] transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-[#7d6349] text-sm mt-2 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
  } catch (error) {
    console.error(`[BlogPostPage] Error rendering blog post:`, error);
    // Return simplified safe version if rendering fails
    return (
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold text-[#5f4a38] mb-4">
              {post.title || 'Blog Post'}
            </h1>
            <p className="text-[#7d6349] mb-8">
              This blog post content could not be displayed properly.
            </p>
            <div className="w-full max-w-md mx-auto mb-8">
              <div className="aspect-[2/1] rounded-2xl bg-gradient-to-br from-[#0d9488] to-[#14b8a6] flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-white/20 flex items-center justify-center">
                    <span className="font-display text-3xl font-bold">CC</span>
                  </div>
                  <p className="text-lg font-medium">Cozy Condo Blog</p>
                </div>
              </div>
            </div>
            <a
              href="/blog"
              className="btn-primary"
            >
              Back to Blog
            </a>
          </div>
        </div>
      </div>
    );
  }
}
