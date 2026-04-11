'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getPublishedBlogPosts } from '@/utils/blogStorageSupabase';
import type { BlogPost } from '@/utils/blogStorageSupabase';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPublishedBlogPosts();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <main className="pt-24 pb-24">
      <header className="container-xl max-w-3xl text-center mb-14">
        <div className="label-tiny mb-4">— STORIES FROM ILOILO</div>
        <h1 className="text-[40px] md:text-[48px] font-medium tracking-[-1.2px] leading-[1.05] mb-3">
          Notes &amp; guides
        </h1>
        <p className="text-[15px] text-stone-600 leading-[1.7]">
          Guides for visiting Iloilo, guest stories, neighborhood notes, and the occasional update from us.
        </p>
      </header>

      {loading && <p className="container-xl text-center text-stone-500">Loading…</p>}

      {!loading && posts.length === 0 && (
        <p className="container-xl text-center text-stone-500">No stories yet.</p>
      )}

      {/* Featured post (first post) */}
      {!loading && posts[0] && (
        <section className="container-xl max-w-5xl mb-12">
          <Link href={`/blog/${posts[0].slug}`} className="grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
            <div
              className="aspect-[16/10] rounded-lg bg-cover bg-center bg-stone-100"
              style={{ backgroundImage: `url('${posts[0].featured_image || ''}')` }}
            />
            <div>
              <div className="label-tiny mb-3">
                {new Date(posts[0].published_at || posts[0].created_at).toLocaleString('en-PH', { month: 'short', year: 'numeric' }).toUpperCase()}
                {posts[0].category ? ` · ${posts[0].category.toUpperCase()}` : ''}
              </div>
              <h2 className="text-[28px] font-medium tracking-[-0.5px] leading-[1.15] mb-3">{posts[0].title}</h2>
              <p className="text-[14px] text-stone-600 leading-[1.7] mb-4">{posts[0].excerpt}</p>
              <span className="text-[12px] border-b border-stone-900 pb-0.5">Read the story →</span>
            </div>
          </Link>
        </section>
      )}

      {/* Grid of other posts */}
      {!loading && posts.length > 1 && (
        <section className="container-xl max-w-5xl border-t border-stone-200 pt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          {posts.slice(1).map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <div
                className="aspect-[4/3] rounded-lg bg-cover bg-center mb-4 bg-stone-100"
                style={{ backgroundImage: `url('${post.featured_image || ''}')` }}
              />
              <div className="label-tiny mb-2">
                {new Date(post.published_at || post.created_at).toLocaleString('en-PH', { month: 'short', year: 'numeric' }).toUpperCase()}
                {post.category ? ` · ${post.category.toUpperCase()}` : ''}
              </div>
              <h3 className="text-[17px] font-medium leading-[1.25] mb-1">{post.title}</h3>
              <p className="text-[12px] text-stone-600 leading-[1.6]">{post.excerpt}</p>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
