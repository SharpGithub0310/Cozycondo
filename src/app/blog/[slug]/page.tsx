'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/utils/blogStorageSupabase';

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
      if (trimmed.startsWith('## ')) return `<h2>${trimmed.substring(3)}</h2>`;
      if (trimmed.startsWith('# ')) return `<h1>${trimmed.substring(2)}</h1>`;
      if (trimmed.startsWith('### ')) return `<h3>${trimmed.substring(4)}</h3>`;
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

  useEffect(() => {
    const loadPost = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/blog/slug/${resolvedParams.slug}`);

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
      <main className="pt-24 pb-24">
        <div className="container-xl max-w-2xl">
          <p className="text-stone-500">Loading…</p>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="pt-24 pb-24">
        <div className="container-xl max-w-2xl text-center">
          <h1 className="text-[28px] font-medium mb-4">
            {error === 'Post not found' ? 'Story not found' : 'Story unavailable'}
          </h1>
          <p className="text-stone-600 mb-8">
            {error === 'Post not found'
              ? "The story you're looking for doesn't exist or may have been moved."
              : 'This story is temporarily unavailable. Please try again later.'}
          </p>
          <Link href="/blog" className="btn btn-ghost">
            ← Back to Stories
          </Link>
        </div>
      </main>
    );
  }

  const publishedDate = new Date(post.published_at || post.created_at);

  return (
    <main className="pt-24 pb-24">
      <article className="container-xl max-w-2xl">
        <div className="label-tiny mb-4">
          {publishedDate.toLocaleString('en-PH', { month: 'long', year: 'numeric' }).toUpperCase()}
          {post.category ? ` · ${post.category.toUpperCase()}` : ''}
        </div>
        <h1 className="text-[36px] md:text-[44px] font-medium tracking-[-1px] leading-[1.1] mb-4">{post.title}</h1>
        {post.excerpt && <p className="text-[17px] text-stone-600 leading-[1.6] mb-10">{post.excerpt}</p>}

        {post.featured_image && (
          <div
            className="aspect-[16/9] rounded-lg bg-cover bg-center mb-12 bg-stone-100"
            style={{ backgroundImage: `url('${post.featured_image}')` }}
          />
        )}

        <div
          className="prose prose-stone max-w-none text-[16px] leading-[1.8] [&>p]:mb-6 [&>h1]:mt-10 [&>h1]:mb-4 [&>h2]:mt-8 [&>h2]:mb-3 [&>h3]:mt-6 [&>h3]:mb-2"
          dangerouslySetInnerHTML={{ __html: processContent(post.content || '') }}
        />

        <div className="mt-16 pt-8 border-t border-stone-200 text-center">
          <Link href="/blog" className="text-[12px] border-b border-stone-900 pb-0.5">
            ← Back to all stories
          </Link>
        </div>
      </article>
    </main>
  );
}
