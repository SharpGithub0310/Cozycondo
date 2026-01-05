'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, User, Share2, Facebook, MessageCircle } from 'lucide-react';
import { BlogPost } from '@/utils/blogStorageSupabase';

const calculateReadTime = (content: string) => {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readTime} min read`;
};

const processContent = (content: string) => {
  if (!content) return '';

  // If content already has HTML tags, return as is
  if (content.includes('<p>') || content.includes('<div>') || content.includes('<h1>')) {
    return content;
  }

  // Convert plain text to HTML with proper paragraphs
  return content
    .split('\n\n')
    .filter(paragraph => paragraph.trim())
    .map(paragraph => {
      const trimmed = paragraph.trim();
      // Handle headings
      if (trimmed.startsWith('## ')) {
        return `<h2>${trimmed.substring(3)}</h2>`;
      } else if (trimmed.startsWith('# ')) {
        return `<h1>${trimmed.substring(2)}</h1>`;
      } else if (trimmed.startsWith('### ')) {
        return `<h3>${trimmed.substring(4)}</h3>`;
      }
      // Regular paragraphs
      return `<p>${trimmed}</p>`;
    })
    .join('');
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: PageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    const loadPost = async () => {
      try {
        const resolvedParams = await params;
        const postSlug = resolvedParams.slug;
        setSlug(postSlug);

        console.log(`Loading blog post: ${postSlug}`);

        // Fetch from the API endpoint that we know works
        const response = await fetch(`/api/blog/slug/${postSlug}`);

        if (response.ok) {
          const postData = await response.json();
          setPost(postData);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [params]);

  if (loading) {
    return (
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold text-[#5f4a38] mb-4">
              {error === 'Post not found' ? 'Blog Post Not Found' : 'Blog Post Unavailable'}
            </h1>
            <p className="text-[#7d6349] mb-8">
              {error === 'Post not found'
                ? "The blog post you're looking for doesn't exist or may have been moved."
                : 'This blog post is temporarily unavailable. Please try again later.'}
            </p>
            <Link href="/blog" className="btn-primary">
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const readTime = calculateReadTime(post.content || '');
  const publishedDate = new Date(post.published_at || post.created_at);

  return (
    <div className="pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="text-[#7d6349] hover:text-[#5f4a38] transition-colors flex items-center group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <article className="prose prose-lg max-w-none">
          <header className="mb-8">
            <h1 className="font-display text-4xl font-bold text-[#5f4a38] mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center text-sm text-[#7d6349] mb-6">
              <div className="flex items-center mr-6">
                <User className="w-4 h-4 mr-2" />
                <span>{post.author || 'Cozy Condo Team'}</span>
              </div>
              <div className="flex items-center mr-6">
                <Calendar className="w-4 h-4 mr-2" />
                <time dateTime={publishedDate.toISOString()}>
                  {publishedDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{readTime}</span>
              </div>
            </div>

            {post.excerpt && (
              <p className="text-xl text-[#7d6349] leading-relaxed mb-6">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto rounded-2xl shadow-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none text-[#4a5568] leading-relaxed [&>p]:mb-6 [&>h1]:mb-6 [&>h2]:mb-4 [&>h2]:mt-8 [&>h3]:mb-3 [&>h3]:mt-6 [&>h4]:mb-2 [&>h4]:mt-4 [&>ul]:mb-6 [&>ol]:mb-6 [&>blockquote]:mb-6 [&>blockquote]:mt-6"
            dangerouslySetInnerHTML={{ __html: processContent(post.content || '') }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-[#f0e8d8]">
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 10).map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-[#f0e8d8] text-[#7d6349] rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Sharing */}
          <div className="mt-8 pt-8 border-t border-[#f0e8d8]">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Share this post
            </h3>
            <div className="flex gap-4">
              <button className="flex items-center px-4 py-2 bg-[#1877f2] text-white rounded-lg hover:bg-[#166fe5] transition-colors">
                <Facebook className="w-4 h-4 mr-2" />
                Facebook
              </button>
              <button className="flex items-center px-4 py-2 bg-[#1da1f2] text-white rounded-lg hover:bg-[#1a91da] transition-colors">
                <MessageCircle className="w-4 h-4 mr-2" />
                Twitter
              </button>
              <button className="flex items-center px-4 py-2 bg-[#7d6349] text-white rounded-lg hover:bg-[#5f4a38] transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                Copy Link
              </button>
            </div>
          </div>
        </article>

        {/* Back to Blog */}
        <div className="mt-12 pt-8 border-t border-[#f0e8d8] text-center">
          <Link
            href="/blog"
            className="btn-primary"
          >
            Back to All Posts
          </Link>
        </div>
      </div>
    </div>
  );
}