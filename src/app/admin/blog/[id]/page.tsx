'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, Trash2, Eye, Calendar, Tag, User, Upload, Image } from 'lucide-react';
import { getBlogPostById, updateBlogPost, deleteBlogPost, uploadBlogImage, generateUniqueSlug } from '@/utils/blogStorageHybrid';

export default function EditBlogPost() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [post, setPost] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'Cozy Condo Team',
    category: 'general',
    tags: [] as string[],
    featured_image: '',
    published: false,
    published_at: null as string | null,
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

  useEffect(() => {
    const loadPost = async () => {
      try {
        const blogPost = await getBlogPostById(params.id as string);

        if (blogPost) {
          setPost({
            title: blogPost.title,
            slug: blogPost.slug,
            excerpt: blogPost.excerpt,
            content: blogPost.content,
            author: blogPost.author,
            category: blogPost.category,
            tags: blogPost.tags || [],
            featured_image: blogPost.featured_image,
            published: blogPost.published,
            published_at: blogPost.published_at,
          });
        } else {
          // Post not found, redirect to blog list
          router.push('/admin/blog');
        }
      } catch (error) {
        console.error('Failed to load blog post:', error);
        router.push('/admin/blog');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [params.id, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateBlogPost(params.id as string, {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        category: post.category,
        tags: post.tags,
        featured_image: post.featured_image,
        published: post.published,
        published_at: post.published_at,
      });

      alert('Blog post updated successfully!');
      router.push('/admin/blog');
    } catch (error) {
      console.error('Failed to save blog post:', error);
      alert('Failed to save blog post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlogPost(params.id as string);
        alert('Blog post deleted successfully!');
        router.push('/admin/blog');
      } catch (error) {
        console.error('Failed to delete blog post:', error);
        alert('Failed to delete blog post. Please try again.');
      }
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

  const generateSlug = async () => {
    if (!post.title.trim()) {
      alert('Please enter a title first.');
      return;
    }
    try {
      const uniqueSlug = await generateUniqueSlug(post.title, params.id as string);
      setPost({ ...post, slug: uniqueSlug });
    } catch (error) {
      console.error('Error generating slug:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#14b8a6] flex items-center justify-center animate-pulse">
            <span className="text-white font-display text-xl font-bold">CC</span>
          </div>
          <p className="text-[#7d6349]">Loading blog post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/admin/blog')}
            className="text-[#7d6349] hover:text-[#5f4a38] transition-colors mb-2"
          >
            ← Back to Blog
          </button>
          <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">Edit Blog Post</h1>
          <p className="text-[#7d6349] mt-1">Update your blog post content and settings.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
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
                  type="datetime-local"
                  value={post.published_at ? post.published_at.substring(0, 16) : ''}
                  onChange={(e) => setPost({...post, published_at: e.target.value || null})}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  value={post.published ? 'published' : 'draft'}
                  onChange={(e) => setPost({...post, published: e.target.value === 'published'})}
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

            {/* Image Upload */}
            <div className="mb-4">
              <div className="border-2 border-dashed border-[#faf3e6] rounded-xl p-6 text-center hover:border-[#14b8a6] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Check file size
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Image size must be less than 5MB');
                        return;
                      }

                      try {
                        const imageUrl = await uploadBlogImage(file);
                        setPost({...post, featured_image: imageUrl});
                      } catch (error) {
                        console.error('Error uploading image:', error);
                        alert('Failed to upload image. Please try again.');
                      }
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-3 text-[#9a7d5e]" />
                  <p className="text-[#5f4a38] font-medium mb-1">Upload Featured Image</p>
                  <p className="text-[#9a7d5e] text-sm">Click to select an image</p>
                  <p className="text-[#9a7d5e] text-xs mt-1">JPG, PNG, WebP (Max 5MB)</p>
                </label>
              </div>
            </div>

            {/* URL Input */}
            <div>
              <label className="form-label">Or enter image URL</label>
              <input
                type="url"
                value={post.featured_image}
                onChange={(e) => setPost({...post, featured_image: e.target.value})}
                className="form-input"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Image Preview */}
            {post.featured_image && (
              <div className="mt-4 relative">
                <div className="relative group">
                  <img
                    src={post.featured_image}
                    alt="Featured image preview"
                    className="w-full h-48 object-cover rounded-lg border border-[#faf3e6]"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZmFmYiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2YjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPg==';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setPost({...post, featured_image: ''})}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-[#9a7d5e] mt-2">This image will be displayed as the blog post's featured image.</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : `Update ${post.published ? '& Publish' : 'Draft'}`}
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