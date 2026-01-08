'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  MoreVertical
} from 'lucide-react';
// Blog posts are now fetched via API endpoints

const categories = ['All', 'General', 'Travel Tips', 'Local Guide', 'Property Updates', 'Guest Stories', 'News'];

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Use API endpoint instead of direct Supabase call
        const response = await fetch('/api/blog');
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        const blogPosts = await response.json();
        setPosts(blogPosts);
        console.log('Loaded blog posts in admin:', blogPosts.length);
      } catch (error) {
        console.error('Error loading blog posts:', error);
        setPosts([]);
      }
    };

    loadPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const togglePublished = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      try {
        // Use API endpoint instead of direct Supabase call
        const response = await fetch(`/api/blog/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...post, published: !post.published }),
        });

        if (!response.ok) {
          throw new Error('Failed to update post');
        }

        // Refresh the posts list
        const refreshResponse = await fetch('/api/blog');
        if (refreshResponse.ok) {
          const updatedPosts = await refreshResponse.json();
          setPosts(updatedPosts);
        }
      } catch (error) {
        console.error('Error toggling publish status:', error);
        alert('Failed to update post. Please try again.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        // Use API endpoint instead of direct Supabase call
        const response = await fetch(`/api/blog/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete post');
        }

        // Refresh the posts list
        const refreshResponse = await fetch('/api/blog');
        if (refreshResponse.ok) {
          const updatedPosts = await refreshResponse.json();
          setPosts(updatedPosts);
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">Blog Posts</h1>
          <p className="text-[#7d6349] mt-1">Create and manage blog content</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/blog/new" className="btn-primary text-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Total Posts</p>
          <p className="font-display text-2xl font-semibold text-[#5f4a38]">{posts.length}</p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Published</p>
          <p className="font-display text-2xl font-semibold text-[#14b8a6]">
            {posts.filter(p => p.published).length}
          </p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Drafts</p>
          <p className="font-display text-2xl font-semibold text-[#fb923c]">
            {posts.filter(p => !p.published).length}
          </p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Categories</p>
          <p className="font-display text-2xl font-semibold text-[#9a7d5e]">
            {categories.length - 1}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="admin-card">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9a7d5e]" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input w-auto"
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div key={post.id} className="admin-card hover:shadow-xl transition-all duration-300 group">
            {/* Featured Image */}
            <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-[#faf3e6] to-[#f0e6d6]">
              {post.featured_image ? (
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#5f4a38]/10 flex items-center justify-center">
                      <Edit2 className="w-8 h-8 text-[#5f4a38]/40" />
                    </div>
                    <p className="text-[#9a7d5e] text-sm font-medium">No featured image</p>
                  </div>
                </div>
              )}

              {/* Status Badge Overlay */}
              <div className="absolute top-3 left-3">
                {post.published ? (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#14b8a6] text-white shadow-lg">
                    Published
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#fb923c] text-white shadow-lg">
                    Draft
                  </span>
                )}
              </div>

              {/* Category Badge */}
              {post.category && (
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/90 backdrop-blur-sm text-[#5f4a38] shadow-md">
                    {post.category}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-3 line-clamp-2 leading-tight">
                {post.title}
              </h3>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-[#7d6349] text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#9a7d5e] mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Edit2 className="w-3.5 h-3.5" />
                  {post.author}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublished(post.id)}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    post.published
                      ? 'text-[#14b8a6] hover:bg-[#14b8a6]/10 hover:scale-110'
                      : 'text-[#9a7d5e] hover:bg-[#faf3e6] hover:text-[#fb923c] hover:scale-110'
                  }`}
                  title={post.published ? 'Unpublish' : 'Publish'}
                >
                  {post.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="p-2 text-[#7d6349] hover:text-[#0d9488] hover:bg-[#faf3e6] hover:scale-110 rounded-lg transition-all duration-200"
                  title="Edit post"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="p-2 text-[#7d6349] hover:text-[#3b82f6] hover:bg-[#faf3e6] hover:scale-110 rounded-lg transition-all duration-200"
                  title="View post"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>

              <button
                onClick={() => handleDelete(post.id)}
                className="p-2 text-[#9a7d5e] hover:text-red-500 hover:bg-red-50 hover:scale-110 rounded-lg transition-all duration-200"
                title="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="col-span-full admin-card text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#faf3e6] flex items-center justify-center">
                <Search className="w-10 h-10 text-[#9a7d5e]" />
              </div>
              <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-2">No posts found</h3>
              <p className="text-[#9a7d5e] mb-6">
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first blog post'}
              </p>
              {!searchQuery && selectedCategory === 'All' && (
                <Link href="/admin/blog/new" className="btn-primary inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create First Post
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="admin-card bg-[#f0fdfb] border-[#14b8a6]/20">
        <h3 className="font-medium text-[#0f766e] mb-2">Content Ideas</h3>
        <ul className="text-sm text-[#115e59] space-y-1">
          <li>• Local area guides and recommendations</li>
          <li>• Travel tips for visitors to Iloilo</li>
          <li>• Seasonal events and festivals</li>
          <li>• Property features and updates</li>
          <li>• Guest stories and testimonials</li>
        </ul>
      </div>
    </div>
  );
}
