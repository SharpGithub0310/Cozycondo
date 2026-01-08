'use client';

import Link from 'next/link';
import { Calendar, Clock, ArrowRight, User, Home, ChevronRight, Search, Filter, Grid3x3, List, Star, Eye, TrendingUp, MapPin, Tag, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPublishedBlogPosts } from '@/utils/blogStorageSupabase';
import type { BlogPost } from '@/utils/blogStorageSupabase';

const categories = ['All', 'Travel Tips', 'Local Guide', 'Property Updates', 'Guest Stories', 'General', 'News'];

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await getPublishedBlogPosts();
        setBlogPosts(posts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };
  const featuredPosts = filteredPosts.slice(0, 2);
  const regularPosts = filteredPosts.slice(2);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--color-warm-50)] to-white">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-warm-50)] via-[var(--color-warm-100)] to-[var(--color-warm-200)]">
        {/* Sophisticated Background Elements */}
        <div className="absolute inset-0">
          {/* Main gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-warm-50)] via-[var(--color-warm-100)] to-[var(--color-warm-200)]" />
          {/* Radial overlays */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                radial-gradient(ellipse 800px 400px at 50% 0%, var(--color-primary-100) 0%, transparent 60%),
                radial-gradient(ellipse 600px 300px at 80% 100%, var(--color-accent-orange-light) 0%, transparent 60%),
                radial-gradient(ellipse 400px 200px at 20% 50%, var(--color-primary-50) 0%, transparent 50%)
              `
            }}
          />
          {/* Floating decorative elements */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[var(--color-primary-400)] rounded-full animate-float opacity-60" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-[var(--color-accent-orange)] rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-[var(--color-primary-500)] rounded-full animate-float opacity-70" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative container-xl py-20 lg:py-32">
          <div className="max-w-5xl">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 mb-8 text-sm" aria-label="Breadcrumb">
              <Link
                href="/"
                className="flex items-center gap-1 text-[var(--color-warm-600)] hover:text-[var(--color-primary-600)] transition-colors duration-200"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-[var(--color-warm-400)]" />
              <span className="text-[var(--color-warm-800)] font-medium">Blog</span>
            </nav>

            {/* Enhanced Hero Badge */}
            <div className="hero-badge mb-10 bg-white/90 backdrop-blur-lg border-white/50 shadow-lg">
              <div className="hero-badge-dot" />
              <span className="font-semibold">{filteredPosts.length} Articles • Travel Insights</span>
            </div>

            {/* Hero Title */}
            <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold text-[var(--color-warm-900)] mb-8 leading-tight tracking-tight">
              Travel Stories &
              <span className="block text-transparent bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-accent-orange)] bg-clip-text">
                Local Insights
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-[var(--color-warm-700)] mb-16 leading-relaxed max-w-3xl">
              Discover the best of Iloilo City through our curated collection of travel tips, local guides, and authentic Filipino experiences from our community of guests and locals.
            </p>

            {/* Enhanced Search and Filter Section */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50 mb-12" role="search">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Search Bar */}
                <div className="lg:col-span-8 relative">
                  <label htmlFor="blog-search" className="sr-only">
                    Search blog posts by title, content, or category
                  </label>
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-warm-500)] pointer-events-none" aria-hidden="true" />
                  <input
                    id="blog-search"
                    type="search"
                    placeholder="Search articles by title, content, or category..."
                    className="w-full pl-14 pr-6 py-5 text-lg rounded-2xl border border-[var(--color-warm-200)] bg-white focus:bg-white focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--color-primary-100)] focus:outline-none transition-all duration-300 placeholder-[var(--color-warm-500)]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-describedby="search-help"
                    autoComplete="off"
                  />
                  <div id="search-help" className="sr-only">
                    Search through {blogPosts.length} available blog posts
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="lg:col-span-4 flex gap-3">
                  <div className="flex border border-[var(--color-warm-200)] rounded-2xl bg-white p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                        viewMode === 'grid'
                          ? 'bg-[var(--color-primary-500)] text-white shadow-md'
                          : 'text-[var(--color-warm-700)] hover:bg-[var(--color-warm-50)]'
                      }`}
                      aria-label="Grid view"
                    >
                      <Grid3x3 className="w-5 h-5" />
                      <span className="hidden sm:inline">Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                        viewMode === 'list'
                          ? 'bg-[var(--color-primary-500)] text-white shadow-md'
                          : 'text-[var(--color-warm-700)] hover:bg-[var(--color-warm-50)]'
                      }`}
                      aria-label="List view"
                    >
                      <List className="w-5 h-5" />
                      <span className="hidden sm:inline">List</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Category Filter */}
      <section className="bg-white/95 backdrop-blur-lg border-b border-[var(--color-warm-200)] sticky top-0 z-40 shadow-sm">
        <div className="container-xl">
          <div className="flex items-center justify-between py-6">
            <div className="flex gap-2 overflow-x-auto flex-1">
              {categories.map((category) => {
                const postCount = category === 'All'
                  ? blogPosts.length
                  : blogPosts.filter(p => p.category === category).length;

                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                      category === selectedCategory
                        ? 'bg-[var(--color-primary-500)] text-white shadow-lg transform -translate-y-0.5'
                        : 'bg-[var(--color-warm-100)] text-[var(--color-warm-700)] hover:bg-[var(--color-warm-200)] hover:text-[var(--color-warm-800)]'
                    }`}
                  >
                    <span>{category}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      category === selectedCategory
                        ? 'bg-white/20 text-white'
                        : 'bg-[var(--color-warm-200)] text-[var(--color-warm-600)]'
                    }`}>
                      {postCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="section bg-white">
        <div className="container-xl">
          {/* Enhanced Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] flex items-center justify-center shadow-lg">
                  <BookOpen className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-accent-orange)] rounded-full animate-ping" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-[var(--color-warm-800)] mb-3">
                Loading Stories
              </h3>
              <p className="text-[var(--color-warm-600)] text-lg">
                Discovering the best travel insights for you...
              </p>

              {/* Loading Skeleton */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="card animate-pulse">
                    <div className="aspect-[16/10] bg-[var(--color-warm-200)] rounded-t-2xl" />
                    <div className="p-6">
                      <div className="w-20 h-6 bg-[var(--color-warm-200)] rounded-full mb-4" />
                      <div className="w-full h-6 bg-[var(--color-warm-200)] rounded mb-3" />
                      <div className="w-3/4 h-6 bg-[var(--color-warm-200)] rounded mb-4" />
                      <div className="space-y-2">
                        <div className="w-full h-4 bg-[var(--color-warm-150)] rounded" />
                        <div className="w-2/3 h-4 bg-[var(--color-warm-150)] rounded" />
                      </div>
                      <div className="flex gap-4 mt-6">
                        <div className="w-16 h-4 bg-[var(--color-warm-150)] rounded" />
                        <div className="w-20 h-4 bg-[var(--color-warm-150)] rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Posts Section */}
          {!loading && featuredPosts.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-[var(--color-accent-orange)]" />
                  <h2 className="font-display text-3xl font-bold text-[var(--color-warm-900)]">Featured Stories</h2>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-[var(--color-warm-300)] to-transparent" />
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {featuredPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block"
                  >
                    <article className="card card-elevated overflow-hidden">
                      {/* Featured Badge */}
                      <div className="featured-badge">
                        Featured
                      </div>

                      {/* Featured Image */}
                      <div className="aspect-[16/10] relative overflow-hidden">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] w-full h-full flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
                                <BookOpen className="w-8 h-8" />
                              </div>
                              <p className="text-sm opacity-90 font-medium">Featured Story</p>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Content */}
                      <div className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-primary-500)] text-white text-xs font-semibold rounded-full">
                            <Tag className="w-3 h-3" />
                            {post.category}
                          </span>
                          <span className="text-xs text-[var(--color-warm-500)]">
                            {index === 0 ? 'Latest' : 'Popular'}
                          </span>
                        </div>

                        <h3 className="font-display text-2xl font-bold text-[var(--color-warm-900)] mb-3 group-hover:text-[var(--color-primary-600)] transition-colors duration-300 line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-[var(--color-warm-700)] mb-6 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-[var(--color-warm-600)]">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {calculateReadTime(post.content)}
                            </span>
                          </div>

                          <ArrowRight className="w-5 h-5 text-[var(--color-primary-500)] group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All Posts Section */}
          {!loading && regularPosts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-3xl font-bold text-[var(--color-warm-900)]">All Stories</h2>
                  <span className="px-3 py-1 bg-[var(--color-primary-100)] text-[var(--color-primary-700)] text-sm font-semibold rounded-full">
                    {regularPosts.length} {regularPosts.length === 1 ? 'Article' : 'Articles'}
                  </span>
                </div>

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-warm-600)] hover:text-[var(--color-primary-600)] transition-colors"
                  >
                    <span>Clear search</span>
                    <ArrowRight className="w-4 h-4 rotate-45" />
                  </button>
                )}
              </div>

              <div className={`${
                viewMode === 'grid'
                  ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-8'
                  : 'space-y-6'
              }`}>
                {regularPosts.map((post) => (
                  viewMode === 'grid' ? (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group block"
                    >
                      <article className="card">
                        {/* Image */}
                        <div className="aspect-[16/10] relative overflow-hidden">
                          {post.featured_image ? (
                            <img
                              src={post.featured_image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="bg-gradient-to-br from-[var(--color-warm-400)] to-[var(--color-warm-500)] w-full h-full flex items-center justify-center">
                              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white/80" />
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-warm-100)] text-[var(--color-warm-700)] text-xs font-medium rounded-full">
                              <Tag className="w-3 h-3" />
                              {post.category}
                            </span>
                          </div>

                          <h3 className="font-display text-xl font-semibold text-[var(--color-warm-900)] mb-3 group-hover:text-[var(--color-primary-600)] transition-colors line-clamp-2">
                            {post.title}
                          </h3>

                          <p className="text-[var(--color-warm-700)] text-sm mb-4 line-clamp-3 leading-relaxed">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-[var(--color-warm-600)]">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {calculateReadTime(post.content)}
                              </span>
                            </div>

                            <ArrowRight className="w-4 h-4 text-[var(--color-primary-400)] group-hover:translate-x-1 transition-transform duration-200" />
                          </div>
                        </div>
                      </article>
                    </Link>
                  ) : (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group block"
                    >
                      <article className="card">
                        <div className="grid md:grid-cols-4 gap-6 p-6">
                          {/* Image */}
                          <div className="aspect-[16/10] md:aspect-square relative overflow-hidden rounded-xl">
                            {post.featured_image ? (
                              <img
                                src={post.featured_image}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="bg-gradient-to-br from-[var(--color-warm-400)] to-[var(--color-warm-500)] w-full h-full flex items-center justify-center">
                                <BookOpen className="w-8 h-8 text-white/80" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="md:col-span-3 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-warm-100)] text-[var(--color-warm-700)] text-xs font-medium rounded-full">
                                  <Tag className="w-3 h-3" />
                                  {post.category}
                                </span>
                              </div>

                              <h3 className="font-display text-2xl font-semibold text-[var(--color-warm-900)] mb-3 group-hover:text-[var(--color-primary-600)] transition-colors">
                                {post.title}
                              </h3>

                              <p className="text-[var(--color-warm-700)] mb-4 line-clamp-2 leading-relaxed">
                                {post.excerpt}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-[var(--color-warm-600)]">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {calculateReadTime(post.content)}
                                </span>
                              </div>

                              <ArrowRight className="w-5 h-5 text-[var(--color-primary-400)] group-hover:translate-x-1 transition-transform duration-200" />
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Empty State */}
          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[var(--color-warm-200)] to-[var(--color-warm-300)] flex items-center justify-center">
                  <Search className="w-10 h-10 text-[var(--color-warm-600)]" />
                </div>
                <h3 className="font-display text-3xl font-bold text-[var(--color-warm-800)] mb-4">
                  {searchQuery ? 'No Stories Found' : 'No Stories Yet'}
                </h3>
                <p className="text-[var(--color-warm-600)] text-lg max-w-md mx-auto mb-8">
                  {searchQuery
                    ? `We couldn't find any stories matching "${searchQuery}". Try adjusting your search terms or browse by category.`
                    : 'Our storytellers are working on some amazing content. Check back soon for inspiring travel stories and local insights!'
                  }
                </p>

                {searchQuery && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setSearchQuery('')}
                      className="btn btn-primary"
                    >
                      <Search className="w-4 h-4" />
                      Clear Search
                    </button>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="btn btn-secondary"
                    >
                      <Eye className="w-4 h-4" />
                      View All Stories
                    </button>
                  </div>
                )}
              </div>

              {!searchQuery && (
                <div className="bg-[var(--color-warm-50)] rounded-3xl p-8 max-w-2xl mx-auto">
                  <h4 className="font-display text-xl font-semibold text-[var(--color-warm-800)] mb-3">
                    Stay Updated
                  </h4>
                  <p className="text-[var(--color-warm-600)] mb-6">
                    Be the first to discover new travel stories, local insights, and exclusive guides when they're published.
                  </p>
                  <a
                    href="https://www.facebook.com/cozycondoiloilocity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <span>Follow on Facebook</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Newsletter Section */}
      <section className="relative section bg-gradient-to-br from-[var(--color-warm-900)] to-[var(--color-warm-800)] text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[var(--color-primary-400)] rounded-full blur-2xl" />
            <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-[var(--color-accent-orange)] rounded-full blur-3xl" />
          </div>
        </div>

        <div className="relative container-xl text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-500)] flex items-center justify-center">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Never Miss a Story
              </h2>
              <p className="text-[var(--color-warm-300)] text-xl leading-relaxed max-w-2xl mx-auto">
                Join our community of travelers and locals. Get the latest stories, hidden gems, and exclusive insights delivered directly to your feed.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Local Insights</h3>
                <p className="text-[var(--color-warm-300)] text-sm">Discover hidden gems and authentic experiences</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Guest Stories</h3>
                <p className="text-[var(--color-warm-300)] text-sm">Real experiences from fellow travelers</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Travel Tips</h3>
                <p className="text-[var(--color-warm-300)] text-sm">Expert advice for your Iloilo adventure</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.facebook.com/cozycondoiloilocity"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-400)] text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl"
              >
                <span>Follow on Facebook</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                href="/properties"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 transition-all duration-300 hover:scale-105"
              >
                <span>Explore Properties</span>
                <Home className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
