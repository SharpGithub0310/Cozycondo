import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, User, Share2, Facebook, MessageCircle } from 'lucide-react';
import { notFound } from 'next/navigation';

// Sample blog posts (will be replaced with Supabase data)
const blogPosts = [
  {
    id: '1',
    title: 'Top 10 Things to Do in Iloilo City',
    slug: 'top-10-things-to-do-in-iloilo-city',
    excerpt: 'Discover the best attractions, hidden gems, and must-visit spots in the City of Love.',
    content: `
Iloilo City, known as the "City of Love," is a treasure trove of culture, history, and modern conveniences. Whether you're staying for a few days or an extended period, here are the top things you shouldn't miss.

## 1. Visit the Historic Churches

Iloilo is home to some of the Philippines' most beautiful Spanish colonial churches. Don't miss the Jaro Cathedral, the only basilica in Western Visayas, and the stunning Molo Church, known as the "feminist church" for its all-female saints.

## 2. Explore Calle Real

Take a walk down Calle Real (J.M. Basa Street) and admire the beautifully preserved heritage buildings. This historic street showcases Iloilo's rich past as a major trading hub.

## 3. Dine at the Iloilo River Esplanade

The Esplanade offers a scenic riverside walk with numerous restaurants and cafes. It's perfect for evening strolls and enjoying fresh seafood while watching the sunset.

## 4. Shop at SM City Iloilo and Festive Walk

For modern shopping experiences, head to these malls. Festive Walk in Iloilo Business Park is particularly impressive with its open-air design and diverse dining options.

## 5. Try Authentic Ilonggo Cuisine

No visit is complete without tasting local favorites like La Paz Batchoy, pancit molo, and fresh seafood. The city is a food lover's paradise!

## 6. Visit Museo Iloilo

Learn about the region's history, from pre-colonial times to the present, at this well-curated museum featuring archaeological artifacts and historical exhibits.

## 7. Day Trip to Guimaras Island

Just a 15-minute boat ride away, Guimaras is famous for its sweet mangoes, pristine beaches, and the Trappist Monastery. Perfect for a day trip!

## 8. Experience the Dinagyang Festival

If you're visiting in January, don't miss the Dinagyang Festival - one of the Philippines' most vibrant celebrations honoring the Santo Niño.

## 9. Relax at Smallville Complex

This entertainment hub comes alive at night with bars, restaurants, and live music venues. It's the go-to spot for nightlife in Iloilo.

## 10. Explore Iloilo Business Park

The newest development in the city features beautiful parks, modern architecture, and the impressive Iloilo Convention Center.

---

*Ready to explore Iloilo City? Book your stay at Cozy Condo and experience comfortable living in prime locations across the city.*
    `,
    author: 'Cozy Condo Team',
    published_at: '2024-12-01',
    read_time: '5 min read',
    category: 'Travel Guide',
  },
  {
    id: '2',
    title: 'Best Restaurants Near Our Properties',
    slug: 'best-restaurants-near-our-properties',
    excerpt: 'A curated list of the best dining spots within walking distance of our condo units.',
    content: `
One of the best things about staying at Cozy Condo is the amazing food scene right at your doorstep. Here's our curated guide to the best restaurants near our properties.

## Near Iloilo Business Park

### Breakthrough Restaurant
Famous for their unlimited samgyupsal and Korean BBQ. Great for groups and meat lovers.

### Farm to Table
Fresh, locally-sourced ingredients in a cozy setting. Perfect for health-conscious diners.

### Afritada
Modern Filipino cuisine with a twist. Their crispy pata is legendary!

## Near Smallville Complex

### Tatoy's Manokan
An Iloilo institution! Their chicken inasal is considered among the best in the city.

### Deco's
Another inasal favorite with generous servings and affordable prices.

### Bourbon Street
For those craving international flavors - great steaks and cocktails.

## Near City Proper

### Ted's Oldtimer La Paz Batchoy
The original La Paz Batchoy experience. A must-try for every visitor!

### Netong's Original Special La Paz Batchoy
Another excellent batchoy option with its own loyal following.

### Roberto's Siopao
Famous for their jumbo siopao - perfect for a quick, filling meal.

---

*Ask us for personalized restaurant recommendations based on your preferences and location!*
    `,
    author: 'Cozy Condo Team',
    published_at: '2024-11-15',
    read_time: '4 min read',
    category: 'Food & Dining',
  },
  {
    id: '3',
    title: 'Why Iloilo City is Perfect for Remote Work',
    slug: 'why-iloilo-city-is-perfect-for-remote-work',
    excerpt: 'Discover why Iloilo City has become a top destination for remote workers and digital nomads in the Philippines.',
    content: `
Iloilo City has become an increasingly popular destination for remote workers and digital nomads. Here's why this charming Philippine city should be your next remote work destination.

## Excellent Infrastructure

Iloilo City boasts reliable internet connectivity with fiber optic networks throughout the metro area. Most cafes, coworking spaces, and accommodations offer high-speed WiFi perfect for video calls and collaborative work.

## Affordable Cost of Living

Your money goes much further in Iloilo compared to Metro Manila or Cebu. From accommodation to food to transportation, you can maintain a comfortable lifestyle at a fraction of the cost.

## Rich Culture and History

When you're not working, explore the city's rich heritage through its historic churches, museums, and colonial architecture. The city perfectly blends modern amenities with traditional Filipino culture.

## Great Food Scene

Iloilo is famous for its delicious local cuisine including La Paz Batchoy, Pancit Molo, and fresh seafood. The city offers everything from street food to fine dining.

## Friendly Community

Ilonggos are known for their warm hospitality. The local community is very welcoming to foreigners, making it easy to settle in and feel at home.

## Perfect Location

Iloilo serves as a gateway to beautiful destinations in the Visayas region. Weekend trips to Boracay, Guimaras, or Antique are just a few hours away.

---

*Ready to experience remote work in Iloilo? Book your stay with us and discover why so many remote workers are choosing this beautiful city as their base.*
    `,
    author: 'Cozy Condo Team',
    published_at: '2024-12-08',
    read_time: '6 min read',
    category: 'Remote Work',
  },
];

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug);
  
  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Get related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 2);

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
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.read_time}
              </span>
            </div>
          </div>
        </header>

        {/* Featured Image Placeholder */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
          <div className="aspect-[2/1] rounded-2xl overflow-hidden bg-gradient-to-br from-[#0d9488] to-[#14b8a6] shadow-xl">
            <div className="w-full h-full flex items-center justify-center">
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
            {post.content.split('\n').map((paragraph, i) => {
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
            })}
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
                    {relatedPost.featuredImage ? (
                      <img
                        src={relatedPost.featuredImage}
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
}
