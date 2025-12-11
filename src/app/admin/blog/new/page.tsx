'use client';

import { useState } from 'react';
import { Save, Upload, Eye, Calendar, Tag, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewBlogPost() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [post, setPost] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'Cozy Condo Team',
    category: 'general',
    tags: [] as string[],
    featuredImage: '',
    publishDate: new Date().toISOString().split('T')[0],
    status: 'draft' as 'draft' | 'published',
  });

  const [newTag, setNewTag] = useState('');

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'travel-tips', label: 'Travel Tips' },
    { value: 'local-guide', label: 'Local Guide' },
    { value: 'property-updates', label: 'Property Updates' },
    { value: 'guest-stories', label: 'Guest Stories' },
    { value: 'news', label: 'News' },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Auto-generate slug if empty
      if (!post.slug) {
        const slug = post.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        setPost(prev => ({ ...prev, slug }));
      }

      // In production, save to database
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/admin/blog');
    } catch (error) {
      console.error('Failed to save blog post:', error);
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (newTag && !post.tags.includes(newTag)) {
      setPost({
        ...post,
        tags: [...post.tags, newTag]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setPost({
      ...post,
      tags: post.tags.filter(t => t !== tag)
    });
  };

  const generateSlug = () => {
    const slug = post.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setPost({ ...post, slug });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">New Blog Post</h1>
          <p className="text-[#7d6349] mt-1">Create a new blog post.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-[#7d6349] hover:text-[#5f4a38] transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Blog Post Form */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Title */}
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) => setPost({...post, title: e.target.value})}
                  className="form-input"
                  placeholder="Enter blog post title..."
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="form-label">URL Slug</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={post.slug}
                    onChange={(e) => setPost({...post, slug: e.target.value})}
                    className="form-input flex-1"
                    placeholder="url-friendly-slug"
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="btn-secondary"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-xs text-[#9a7d5e] mt-1">
                  URL: cozycondo.net/blog/{post.slug || 'your-post-slug'}
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label className="form-label">Excerpt</label>
                <textarea
                  value={post.excerpt}
                  onChange={(e) => setPost({...post, excerpt: e.target.value})}
                  className="form-input resize-none"
                  rows={3}
                  placeholder="Brief description of the blog post..."
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="form-label">Content</label>
                <textarea
                  value={post.content}
                  onChange={(e) => setPost({...post, content: e.target.value})}
                  className="form-input resize-none"
                  rows={15}
                  placeholder="Write your blog post content here..."
                  required
                />
                <p className="text-xs text-[#9a7d5e] mt-1">
                  Tip: Use Markdown formatting for rich text.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing */}
          <div className="admin-card">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Publishing
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Publish Date
                </label>
                <input
                  type="date"
                  value={post.publishDate}
                  onChange={(e) => setPost({...post, publishDate: e.target.value})}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  value={post.status}
                  onChange={(e) => setPost({...post, status: e.target.value as 'draft' | 'published'})}
                  className="form-input"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Author
                </label>
                <input
                  type="text"
                  value={post.author}
                  onChange={(e) => setPost({...post, author: e.target.value})}
                  className="form-input"
                  placeholder="Author name"
                />
              </div>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="admin-card">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Categories & Tags
            </h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Category</label>
                <select
                  value={post.category}
                  onChange={(e) => setPost({...post, category: e.target.value})}
                  className="form-input"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="form-input flex-1"
                    placeholder="Add tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#faf3e6] text-[#7d6349] text-xs rounded"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-[#9a7d5e] hover:text-red-500 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="admin-card">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Featured Image
            </h3>
            <div>
              <label className="form-label">Image URL</label>
              <input
                type="url"
                value={post.featuredImage}
                onChange={(e) => setPost({...post, featuredImage: e.target.value})}
                className="form-input"
                placeholder="https://example.com/image.jpg"
              />
              {post.featuredImage && (
                <div className="mt-3">
                  <img
                    src={post.featuredImage}
                    alt="Featured image preview"
                    className="w-full h-32 object-cover rounded-lg border border-[#faf3e6]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : `Save ${post.status === 'published' ? '& Publish' : 'Draft'}`}
            </button>

            <button
              type="button"
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}