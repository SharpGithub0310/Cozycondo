import Hero from '@/components/Hero';
import { Building2, Shield, Clock, Heart, MapPin, Phone, Mail, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { databaseService } from '@/lib/database-service';
import type { PropertyData } from '@/lib/types';
import type { WebsiteSettings } from '@/lib/types';
import { normalizePropertyData } from '@/utils/slugify';
import type { Metadata } from 'next';

// Force dynamic rendering for server-side database access
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cozy Condo - Premium Short-Term Rentals in Iloilo City',
  description: 'Discover comfortable and convenient short-term rental condominiums in Iloilo City, Philippines. Modern amenities, prime locations, and exceptional hospitality.',
  openGraph: {
    title: 'Cozy Condo - Premium Short-Term Rentals in Iloilo City',
    description: 'Discover comfortable and convenient short-term rental condominiums in Iloilo City, Philippines.',
  },
};

// Features section data
const features = [
  {
    icon: Building2,
    title: 'Prime Locations',
    description: 'All our properties are strategically located in Iloilo City, close to malls, restaurants, and business districts.',
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: '24/7 security, CCTV monitoring, and secure building access for your peace of mind.',
  },
  {
    icon: Clock,
    title: 'Flexible Stays',
    description: 'Whether you need a night or a month, we offer flexible booking options to suit your needs.',
  },
  {
    icon: Heart,
    title: 'Personal Touch',
    description: 'Experience warm Filipino hospitality with personalized service and local recommendations.',
  },
];

// Legacy property IDs - no longer used
// Properties are now loaded dynamically from database

export default async function HomePage() {
  // Server-side data loading for faster initial page load
  let settings: WebsiteSettings | null = null;
  let featuredProperties: PropertyData[] = [];
  let aboutImage = '';

  try {
    // Load settings and properties server-side
    console.log('Loading home page data server-side...');
    const startTime = Date.now();

    const [loadedSettings, propertiesData] = await Promise.all([
      databaseService.getWebsiteSettings(),
      databaseService.getProperties({ active: true })
    ]);

    const loadDuration = Date.now() - startTime;
    console.log(`Home page data loaded in ${loadDuration}ms`);

    settings = loadedSettings;

    if (loadedSettings?.aboutImage) {
      aboutImage = loadedSettings.aboutImage;
    }

    // Convert properties object to array format for processing
    const propertiesArray = Object.values(propertiesData).map((property: any) =>
      normalizePropertyData(property)
    );

    // Filter to show featured properties (all are already active)
    featuredProperties = propertiesArray.filter(p => p.featured);

    // If no featured properties, show first 3 properties
    if (featuredProperties.length === 0) {
      featuredProperties = propertiesArray.slice(0, 3);
      console.log('No featured properties found, using first 3');
    }

  } catch (err: any) {
    console.error('Error loading home page data server-side:', err);

    // No fallback - return empty array if database fails
    featuredProperties = [];
  }

  return (
    <>
      {/* Hero Section with server-side props */}
      <Hero settings={settings} />

      {/* Redesigned Featured Properties Section */}
      <section id="properties" className="section bg-gradient-to-br from-[var(--color-warm-50)] to-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[var(--color-primary-100)]/30 to-transparent rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[var(--color-accent-orange)]/20 to-transparent rounded-full blur-3xl opacity-40" />

        <div className="container-xl relative z-10">
          <div className="text-center mb-20">
            <div className="hero-badge mb-6 mx-auto">
              <div className="hero-badge-dot" />
              <span>Handpicked Collection</span>
            </div>
            <h2 className="section-title mb-6">{settings?.featuredTitle || 'Featured Properties'}</h2>
            <p className="section-subtitle mx-auto max-w-3xl">
              {settings?.featuredSubtitle || 'Discover our carefully curated selection of premium condominiums, each offering the perfect harmony of modern comfort, prime location, and exceptional style in the heart of Iloilo City.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
            {featuredProperties.map((property, index) => (
              <article
                key={property.id}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-fade-in border border-[var(--color-warm-100)] hover:border-[var(--color-primary-200)]"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Redesigned Image Container with Perfect Aspect Ratio */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[var(--color-warm-200)] to-[var(--color-warm-300)]">
                  {/* Image Content */}
                  {property.photos && property.photos.length > 0 ? (
                    <Image
                      src={property.photos[property.featuredPhotoIndex || 0]}
                      alt={property.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index === 0}
                      quality={index === 0 ? 95 : 85}
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4="
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-[var(--color-warm-700)]">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <span className="font-display text-3xl font-bold text-[var(--color-warm-800)]">CC</span>
                        </div>
                        <p className="text-sm font-medium opacity-80">Photo coming soon</p>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                  {/* Featured Badge with Premium Styling */}
                  {property.featured && (
                    <div className="absolute top-4 left-4 z-20">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Featured
                      </div>
                    </div>
                  )}

                  {/* Interactive Overlay with CTA */}
                  <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-400 transform translate-y-2 group-hover:translate-y-0">
                    <Link
                      href={`/properties/${property.slug}`}
                      className="w-full bg-white/95 backdrop-blur-sm text-[var(--color-warm-900)] py-3 px-4 rounded-xl font-semibold text-center hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group/button"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/button:translate-x-1" />
                    </Link>
                  </div>

                  {/* Subtle corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[var(--color-accent-orange)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                </div>

                {/* Enhanced Content Section */}
                <div className="p-6 space-y-4">
                  {/* Property Title */}
                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-semibold text-[var(--color-warm-900)] group-hover:text-[var(--color-primary-600)] transition-colors duration-300 line-clamp-1">
                      {property.name}
                    </h3>

                    {/* Location with Icon */}
                    <div className="flex items-center gap-2 text-[var(--color-warm-600)]">
                      <MapPin className="w-4 h-4 text-[var(--color-primary-500)] flex-shrink-0" />
                      <span className="text-sm font-medium">{property.location}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[var(--color-warm-700)] text-sm leading-relaxed line-clamp-2">
                    {property.short_description}
                  </p>

                  {/* Enhanced Amenities Pills */}
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {property.amenities.slice(0, 3).map((amenity: string, i: number) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-[var(--color-warm-100)] text-[var(--color-warm-800)] rounded-full hover:bg-[var(--color-primary-100)] hover:text-[var(--color-primary-800)] transition-colors duration-200 capitalize"
                        >
                          {amenity}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-[var(--color-primary-100)] to-[var(--color-primary-50)] text-[var(--color-primary-800)] rounded-full border border-[var(--color-primary-200)]">
                          +{property.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Property Card Footer */}
                <div className="px-6 pb-6 pt-2">
                  <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-warm-200)] to-transparent mb-4" />
                  <Link
                    href={`/properties/${property.slug}`}
                    className="group/link flex items-center justify-between text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors duration-300"
                  >
                    <span className="text-sm font-semibold">Learn More</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              href="/properties"
              className="btn btn-primary btn-xl hover:scale-105 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <span>View All Properties</span>
              <ArrowRight className="w-6 h-6 icon-arrow" />
            </Link>
            <p className="text-[var(--color-warm-600)] text-sm mt-4">
              Discover all our premium accommodations in Iloilo City
            </p>
          </div>
        </div>
      </section>

      {/* Redesigned Premium Features Section */}
      <section className="section relative overflow-hidden bg-gradient-to-br from-[var(--color-warm-50)] via-white to-[var(--color-primary-50)]">
        {/* Enhanced background decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[var(--color-primary-200)]/30 to-transparent rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-[var(--color-accent-orange)]/20 to-transparent rounded-full blur-3xl opacity-40" />
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-[var(--color-primary-400)] rounded-full animate-float opacity-60" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-[var(--color-accent-orange)] rounded-full animate-float opacity-70" style={{ animationDelay: '1.5s' }} />

        <div className="container-xl relative z-10">
          <div className="text-center mb-20">
            <div className="hero-badge mb-6 mx-auto">
              <div className="hero-badge-dot" />
              <span>Premium Experience</span>
            </div>
            <h2 className="section-title mb-6">Why Choose Cozy Condo?</h2>
            <p className="section-subtitle mx-auto max-w-3xl">
              We go beyond just providing a place to stay. We create memorable experiences with warm Filipino hospitality, modern amenities, and personalized service that makes every guest feel at home.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <article
                  key={index}
                  className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-[var(--color-warm-100)] hover:border-[var(--color-primary-200)] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-6 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Card background gradient */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white via-white to-[var(--color-warm-50)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Premium icon container with enhanced styling */}
                  <div className="relative z-10 mb-6">
                    <div className="relative mx-auto">
                      <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[var(--color-primary-500)] via-[var(--color-primary-600)] to-[var(--color-primary-700)] flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 ring-4 ring-white/50 group-hover:ring-[var(--color-primary-100)]">
                        <Icon className="w-9 h-9 text-white" />
                      </div>
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500" />
                    </div>
                  </div>

                  {/* Enhanced content */}
                  <div className="relative z-10 space-y-4">
                    <h3 className="font-display text-xl font-semibold text-[var(--color-warm-900)] group-hover:text-[var(--color-primary-600)] transition-colors duration-300 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-[var(--color-warm-700)] text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Subtle corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[var(--color-primary-100)]/50 to-transparent rounded-br-3xl rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                  {/* Interactive shine effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </article>
              );
            })}
          </div>

          {/* Enhanced call-to-action section */}
          <div className="text-center mt-20">
            <div className="inline-flex flex-col sm:flex-row items-center gap-6 p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-[var(--color-warm-200)] shadow-lg">
              <div className="text-center sm:text-left">
                <h3 className="font-display text-xl font-semibold text-[var(--color-warm-900)] mb-2">
                  Ready to Experience the Difference?
                </h3>
                <p className="text-[var(--color-warm-600)] text-sm">
                  Discover why guests choose us for their stays in Iloilo City
                </p>
              </div>
              <Link
                href="/properties"
                className="btn btn-primary btn-lg hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span>Explore Properties</span>
                <ArrowRight className="w-5 h-5 icon-arrow" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Premium About Section */}
      <section className="section relative overflow-hidden bg-gradient-to-b from-white via-[var(--color-warm-50)]/30 to-white">
        {/* Sophisticated background elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[var(--color-primary-100)]/20 via-[var(--color-primary-50)]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[var(--color-accent-orange)]/15 to-transparent rounded-full blur-2xl" />

        <div className="container-xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center">
            {/* Enhanced Image Section */}
            <div className="relative order-2 lg:order-1">
              {/* Main image container with layered effects */}
              <div className="relative">
                {/* Background decorative frame */}
                <div className="absolute -inset-4 bg-gradient-to-br from-[var(--color-primary-200)]/40 via-[var(--color-primary-100)]/20 to-[var(--color-accent-orange)]/20 rounded-[2rem] blur-xl opacity-60" />

                <div className="relative aspect-[5/4] rounded-[1.75rem] overflow-hidden shadow-2xl bg-gradient-to-br from-[var(--color-warm-300)] to-[var(--color-warm-500)] ring-1 ring-white/30 group">
                  {/* Enhanced image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent z-10" />

                  {aboutImage ? (
                    <Image
                      src={aboutImage}
                      alt="About Cozy Condo"
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={90}
                      placeholder="blur"
                      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4="
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center relative">
                      <div className="text-center text-white/90 relative z-20">
                        <div className="w-28 h-28 mx-auto mb-6 rounded-2xl bg-white/25 backdrop-blur-lg flex items-center justify-center ring-2 ring-white/30">
                          <span className="font-display text-4xl font-bold">CC</span>
                        </div>
                        <p className="text-2xl font-display font-bold mb-2">Cozy Condo</p>
                        <p className="text-sm opacity-85 font-medium">Premium Stays • Iloilo City</p>
                      </div>
                    </div>
                  )}

                  {/* Elegant pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.03] z-20 mix-blend-overlay"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.8) 1px, transparent 0)',
                      backgroundSize: '24px 24px'
                    }}
                  />

                  {/* Premium shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-30" />
                </div>

                {/* Enhanced floating decorative elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-[var(--color-accent-orange)]/30 to-[var(--color-accent-orange)]/10 rounded-full blur-xl animate-pulse opacity-70" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-[var(--color-primary-300)]/40 to-transparent rounded-full blur-lg animate-float opacity-80" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-1/4 -right-2 w-3 h-3 bg-[var(--color-accent-orange)] rounded-full animate-float opacity-80" style={{ animationDelay: '2s' }} />
                <div className="absolute bottom-1/3 -left-3 w-4 h-4 bg-[var(--color-primary-400)] rounded-full animate-float opacity-70" style={{ animationDelay: '1s' }} />
              </div>
            </div>

            {/* Enhanced Content Section */}
            <div className="order-1 lg:order-2 space-y-8">
              <div className="space-y-6">
                <div className="hero-badge">
                  <div className="hero-badge-dot" />
                  <span>Trusted by 1000+ Guests Since 2020</span>
                </div>

                <div className="space-y-4">
                  <h2 className="section-title mb-4">Welcome to Cozy Condo</h2>
                  <p className="text-[var(--color-warm-700)] text-lg leading-relaxed">
                    Founded with a passion for hospitality, Cozy Condo has been providing exceptional short-term rental experiences in Iloilo City. Our carefully curated collection of condominiums combines modern comfort with warm Filipino hospitality.
                  </p>
                  <p className="text-[var(--color-warm-600)] leading-relaxed">
                    Whether you're a business traveler, a vacationing family, or someone relocating to the city, we have the perfect space for you. Each of our premium properties is thoughtfully designed and maintained to ensure your stay is nothing short of exceptional.
                  </p>
                </div>
              </div>

              {/* Enhanced Statistics Display */}
              <div className="bg-gradient-to-br from-white via-[var(--color-warm-50)] to-white rounded-2xl p-6 shadow-lg border border-[var(--color-warm-100)]">
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { value: '1000+', label: 'Happy Guests', icon: '👥' },
                    { value: '10+', label: 'Properties', icon: '🏢' },
                    { value: '4.9★', label: 'Average Rating', icon: '⭐' }
                  ].map((stat, index) => (
                    <div key={index} className="text-center group">
                      <div className="text-2xl mb-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300">{stat.icon}</div>
                      <div className="text-2xl lg:text-3xl font-bold text-[var(--color-primary-600)] mb-1 group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                      <div className="text-xs text-[var(--color-warm-600)] font-medium leading-tight">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/contact"
                  className="btn btn-primary btn-lg hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <span>Get in Touch</span>
                  <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </Link>
                <Link
                  href="/properties"
                  className="btn btn-secondary btn-lg hover:scale-105 shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                  <span>Browse Properties</span>
                  <ArrowRight className="w-5 h-5 icon-arrow" />
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap gap-4 pt-4 opacity-70">
                <div className="flex items-center gap-2 text-sm text-[var(--color-warm-600)]">
                  <Shield className="w-4 h-4 text-[var(--color-primary-500)]" />
                  <span>Verified Properties</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-warm-600)]">
                  <Clock className="w-4 h-4 text-[var(--color-primary-500)]" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--color-warm-600)]">
                  <Heart className="w-4 h-4 text-[var(--color-primary-500)]" />
                  <span>Local Expertise</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Premium CTA Section */}
      <section className="section relative overflow-hidden bg-gradient-to-br from-[var(--color-warm-900)] via-[#5f4a38] to-[var(--color-warm-950)]">
        {/* Enhanced background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-600)]/20 via-transparent to-[var(--color-accent-orange)]/15 opacity-60" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[var(--color-primary-500)]/25 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-[var(--color-accent-orange)]/20 to-transparent rounded-full blur-3xl" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gradient-to-br from-[var(--color-primary-400)]/15 to-transparent rounded-full blur-2xl animate-float opacity-70" style={{ animationDelay: '2s' }} />

        {/* Sophisticated grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(180deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        <div className="relative container-xl">
          <div className="text-center max-w-5xl mx-auto">
            {/* Hero badge */}
            <div className="hero-badge mb-8 mx-auto bg-white/15 backdrop-blur-md border-white/20 text-white/90">
              <div className="w-2 h-2 bg-[var(--color-primary-400)] rounded-full animate-pulse" />
              <span>Start Your Iloilo Experience Today</span>
            </div>

            {/* Main heading */}
            <h2 className="font-display text-4xl lg:text-5xl xl:text-6xl font-semibold text-white mb-6 leading-tight">
              Ready to Book Your
              <span className="block text-transparent bg-gradient-to-r from-[var(--color-primary-300)] to-[var(--color-accent-orange-light)] bg-clip-text">
                Perfect Stay?
              </span>
            </h2>

            {/* Enhanced description */}
            <p className="text-[var(--color-warm-300)] text-lg lg:text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
              Contact us today and let us help you find the perfect condo for your needs.
              We're here to make your stay in Iloilo City unforgettable with personalized service and exceptional accommodations.
            </p>

            {/* Enhanced action buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 lg:gap-6 mb-16">
              <a
                href="https://m.me/cozycondoiloilocity"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 lg:px-10 lg:py-5 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <MessageCircle className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10 text-lg">Message Us on Facebook</span>
                <ArrowRight className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              <a
                href="tel:+639778870724"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 lg:px-10 lg:py-5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 shadow-lg hover:shadow-xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-lg">Call +63 977 887 0724</span>
              </a>
            </div>

            {/* Enhanced contact information grid */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 lg:p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Email contact */}
                <a
                  href="mailto:admin@cozycondo.net"
                  className="group flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-white font-medium">Email Us</div>
                    <div className="text-[var(--color-warm-300)] text-sm">admin@cozycondo.net</div>
                  </div>
                </a>

                {/* Location */}
                <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[var(--color-accent-orange)] to-[var(--color-accent-orange-dark)] rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-white font-medium">Location</div>
                    <div className="text-[var(--color-warm-300)] text-sm">Iloilo City, Philippines</div>
                  </div>
                </div>

                {/* Response time */}
                <div className="flex flex-col sm:flex-row items-center gap-3 p-4 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-700)] rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-white font-medium">Quick Response</div>
                    <div className="text-[var(--color-warm-300)] text-sm">Within 1 hour</div>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center items-center gap-6 mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-[var(--color-warm-300)] text-sm">
                  <Shield className="w-4 h-4 text-[var(--color-primary-400)]" />
                  <span>Trusted by 1000+ Guests</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-warm-300)] text-sm">
                  <Heart className="w-4 h-4 text-[var(--color-primary-400)]" />
                  <span>4.9★ Average Rating</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--color-warm-300)] text-sm">
                  <Building2 className="w-4 h-4 text-[var(--color-primary-400)]" />
                  <span>Premium Properties</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
