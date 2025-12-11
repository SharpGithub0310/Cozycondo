import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Discover travel tips, Iloilo City guides, and insights about staying in our properties. Your guide to the best of Iloilo.',
};

// Sample blog posts (will be replaced with Supabase data)
const blogPosts = [
  {
    id: '1',
    title: 'Top 10 Things to Do in Iloilo City',
    slug: 'top-10-things-to-do-in-iloilo-city',
    excerpt: 'Discover the best attractions, hidden gems, and must-visit spots in the City of Love. From historic churches to modern malls, Iloilo has something for everyone.',
    author: 'Cozy Condo Team',
    published_at: '2024-12-01',
    read_time: '5 min read',
    category: 'Travel Guide',
  },
  {
    id: '2',
    title: 'Best Restaurants Near Our Properties',
    slug: 'best-restaurants-near-our-properties',
    excerpt: 'A curated list of the best dining spots within walking distance of our condo units. From authentic Ilonggo cuisine to international flavors.',
    author: 'Cozy Condo Team',
    published_at: '2024-11-15',
    read_time: '4 min read',
    category: 'Food & Dining',
  },
  {
    id: '3',
    title: 'Why Iloilo City is Perfect for Remote Work',
    slug: 'why-iloilo-city-is-perfect-for-remote-work',
    excerpt: 'With fast internet, affordable living, and great cafes, Iloilo City is becoming a hotspot for digital nomads. Here\'s why you should consider it.',
    author: 'Cozy Condo Team',
    published_at: '2024-11-01',
    read_time: '6 min read',
    category: 'Lifestyle',
  },
  {
    id: '4',
    title: 'Getting Around Iloilo: Transportation Guide',
    slug: 'getting-around-iloilo-transportation-guide',
    excerpt: 'Everything you need to know about transportation in Iloilo City - from jeepneys and taxis to ride-hailing apps and bike rentals.',
    author: 'Cozy Condo Team',
    published_at: '2024-10-20',
    read_time: '4 min read',
    category: 'Travel Tips',
  },
  {
    id: '5',
    title: 'Weekend Getaways from Iloilo City',
    slug: 'weekend-getaways-from-iloilo-city',
    excerpt: 'Use Iloilo as your base to explore nearby islands and provinces. Discover Guimaras, Gigantes Islands, and more beautiful destinations.',
    author: 'Cozy Condo Team',
    published_at: '2024-10-05',
    read_time: '7 min read',
    category: 'Travel Guide',
  },
];

const categories = ['All', 'Travel Guide', 'Food & Dining', 'Lifestyle', 'Travel Tips'];

export default function BlogPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-[#fefdfb] via-[#fdf9f3] to-[#f5e6cc]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#14b8a6]/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-[#5f4a38] mb-4">
              Our Blog
            </h1>
            <p className="text-lg text-[#7d6349]">
              Travel tips, local insights, and guides to help you make the most of your stay in Iloilo City.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-[#faf3e6] sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-4 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  category === 'All'
                    ? 'bg-[#14b8a6] text-white'
                    : 'bg-[#faf3e6] text-[#7d6349] hover:bg-[#f5e6cc]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Post */}
          {blogPosts[0] && (
            <div className="mb-12">
              <Link
                href={`/blog/${blogPosts[0].slug}`}
                className="group block"
              >
                <div className="grid md:grid-cols-2 gap-8 p-6 rounded-3xl bg-[#faf3e6] hover:bg-[#f5e6cc] transition-colors">
                  {/* Image placeholder */}
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0d9488] to-[#14b8a6]">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-white/20 flex items-center justify-center">
                          <span className="font-display text-2xl font-bold">CC</span>
                        </div>
                        <p className="text-sm opacity-80">Featured Post</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-col justify-center">
                    <span className="inline-block px-3 py-1 bg-[#14b8a6] text-white text-xs font-medium rounded-full w-fit mb-4">
                      {blogPosts[0].category}
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#5f4a38] mb-4 group-hover:text-[#0d9488] transition-colors">
                      {blogPosts[0].title}
                    </h2>
                    <p className="text-[#7d6349] mb-4">
                      {blogPosts[0].excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[#9a7d5e]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(blogPosts[0].published_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {blogPosts[0].read_time}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Other Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group card"
              >
                {/* Image placeholder */}
                <div className="aspect-[16/10] bg-gradient-to-br from-[#d4b896] to-[#b89b7a]">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                      <span className="font-display text-xl font-bold text-white/80">CC</span>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <span className="inline-block px-3 py-1 bg-[#faf3e6] text-[#7d6349] text-xs font-medium rounded-full mb-3">
                    {post.category}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-2 group-hover:text-[#0d9488] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-[#7d6349] text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#9a7d5e]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.published_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.read_time}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <p className="text-[#9a7d5e] mb-4">More articles coming soon!</p>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section bg-[#5f4a38] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            Stay Updated
          </h2>
          <p className="text-[#d4b896] text-lg mb-8">
            Follow us on Facebook for the latest updates, travel tips, and special offers.
          </p>
          <a
            href="https://www.facebook.com/cozycondoiloilocity"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-medium rounded-lg transition-colors"
          >
            <span>Follow Us on Facebook</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
