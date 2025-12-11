'use client';

import { useState } from 'react';
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

// Sample blog posts
const initialPosts = [
  { 
    id: '1', 
    title: 'Top 10 Things to Do in Iloilo City', 
    slug: 'top-10-things-to-do-in-iloilo-city',
    category: 'Travel Guide',
    published: true,
    publishedAt: '2024-12-01',
    author: 'Cozy Condo Team'
  },
  { 
    id: '2', 
    title: 'Best Restaurants Near Our Properties', 
    slug: 'best-restaurants-near-our-properties',
    category: 'Food & Dining',
    published: true,
    publishedAt: '2024-11-15',
    author: 'Cozy Condo Team'
  },
  { 
    id: '3', 
    title: 'Why Iloilo City is Perfect for Remote Work', 
    slug: 'why-iloilo-city-is-perfect-for-remote-work',
    category: 'Lifestyle',
    published: true,
    publishedAt: '2024-11-01',
    author: 'Cozy Condo Team'
  },
  { 
    id: '4', 
    title: 'Getting Around Iloilo: Transportation Guide', 
    slug: 'getting-around-iloilo-transportation-guide',
    category: 'Travel Tips',
    published: true,
    publishedAt: '2024-10-20',
    author: 'Cozy Condo Team'
  },
  { 
    id: '5', 
    title: 'Weekend Getaways from Iloilo City', 
    slug: 'weekend-getaways-from-iloilo-city',
    category: 'Travel Guide',
    published: true,
    publishedAt: '2024-10-05',
    author: 'Cozy Condo Team'
  },
];

const categories = ['All', 'Travel Guide', 'Food & Dining', 'Lifestyle', 'Travel Tips'];

export default function BlogAdminPage() {
  const [posts, setPosts] = useState(initialPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const togglePublished = (id: string) => {
    setPosts(posts.map(p =>
      p.id === id ? { ...p, published: !p.published } : p
    ));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">Blog Posts</h1>
          <p className="text-[#7d6349] mt-1">Create and manage blog content</p>
        </div>
        <Link href="/admin/blog/new" className="btn-primary text-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Link>
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

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="admin-card hover:shadow-lg transition-shadow">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#faf3e6] text-[#7d6349]">
                    {post.category}
                  </span>
                  {post.published ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#14b8a6]/10 text-[#0f766e]">
                      Published
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#fb923c]/10 text-[#c2410c]">
                      Draft
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-1">
                  {post.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#9a7d5e]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span>By {post.author}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublished(post.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    post.published 
                      ? 'text-[#14b8a6] hover:bg-[#14b8a6]/10' 
                      : 'text-[#9a7d5e] hover:bg-[#faf3e6]'
                  }`}
                  title={post.published ? 'Unpublish' : 'Publish'}
                >
                  {post.published ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="p-2 text-[#7d6349] hover:text-[#0d9488] hover:bg-[#faf3e6] rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </Link>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="p-2 text-[#7d6349] hover:text-[#0d9488] hover:bg-[#faf3e6] rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </Link>
                <button className="p-2 text-[#7d6349] hover:text-red-500 hover:bg-[#faf3e6] rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="admin-card text-center py-12">
            <p className="text-[#9a7d5e]">No posts found</p>
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
