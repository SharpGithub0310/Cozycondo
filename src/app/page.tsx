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

      {/* Enhanced Features Section */}
      <section className="section bg-gradient-to-br from-[var(--color-warm-100)] to-[var(--color-warm-50)]">
        <div className="container-xl">
          <div className="text-center mb-16">
            <h2 className="section-title">Why Choose Cozy Condo?</h2>
            <p className="section-subtitle mx-auto">
              We go beyond just providing a place to stay. We create memorable experiences with warm Filipino hospitality.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card card-flat text-center p-8 hover:card-elevated group transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="card-title text-center mb-3 group-hover:text-[var(--color-primary-600)]">
                    {feature.title}
                  </h3>
                  <p className="card-description text-center">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section className="section bg-white">
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Enhanced Image side */}
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[var(--color-warm-300)] to-[var(--color-warm-500)] ring-1 ring-white/20">
                {/* Enhanced image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />

                {aboutImage ? (
                  <Image
                    src={aboutImage}
                    alt="About Cozy Condo"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={85}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4="
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white/80">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="font-display text-3xl font-bold">CC</span>
                      </div>
                      <p className="text-2xl font-display font-bold">Cozy Condo</p>
                      <p className="text-sm opacity-80">Premium Stays • Iloilo City</p>
                    </div>
                  </div>
                )}

                {/* Subtle pattern overlay */}
                <div
                  className="absolute inset-0 opacity-10 z-20"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }}
                />
              </div>

              {/* Enhanced decorative elements */}
              <div className="absolute -top-8 -right-8 w-24 h-24 lg:w-40 lg:h-40 bg-gradient-to-br from-[var(--color-accent-orange)]/20 to-[var(--color-accent-orange-light)]/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-1/4 -left-4 w-3 h-3 bg-[var(--color-primary-400)] rounded-full animate-float opacity-70" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/4 -right-2 w-2 h-2 bg-[var(--color-accent-orange)] rounded-full animate-float opacity-60" style={{ animationDelay: '2s' }} />
            </div>

            {/* Enhanced Content side */}
            <div className="order-1 lg:order-2">
              <div className="hero-badge mb-8">
                <div className="hero-badge-dot" />
                <span>Trusted by 1000+ Guests Since 2020</span>
              </div>

              <h2 className="section-title mb-6">Welcome to Cozy Condo</h2>
              <p className="text-[var(--color-warm-700)] text-lg mb-6 leading-relaxed">
                Founded with a passion for hospitality, Cozy Condo has been providing exceptional short-term rental experiences in Iloilo City. Our carefully curated collection of condominiums combines modern comfort with warm Filipino hospitality.
              </p>
              <p className="text-[var(--color-warm-600)] mb-8 leading-relaxed">
                Whether you're a business traveler, a vacationing family, or someone relocating to the city, we have the perfect space for you. Each of our premium properties is thoughtfully designed and maintained to ensure your stay is nothing short of exceptional.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { value: '1000+', label: 'Happy Guests' },
                  { value: '10+', label: 'Properties' },
                  { value: '4.9★', label: 'Average Rating' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-[var(--color-primary-600)] mb-1">{stat.value}</div>
                    <div className="text-xs text-[var(--color-warm-600)] font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact" className="btn btn-primary btn-lg hover:scale-105">
                  <span>Get in Touch</span>
                </Link>
                <Link href="/properties" className="btn btn-secondary btn-lg hover:scale-105">
                  <span>Browse Properties</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-[#5f4a38] text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-[#14b8a6]/20 rounded-full blur-2xl sm:blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 sm:w-80 sm:h-80 bg-[#fb923c]/20 rounded-full blur-2xl sm:blur-3xl" />

        <div className="relative container-responsive text-center max-w-4xl mx-auto">
          <h2 className="font-display text-fluid-3xl font-semibold mb-fluid-lg">
            Ready to Book Your Stay?
          </h2>
          <p className="text-[#d4b896] text-fluid-lg mb-fluid-xl max-w-2xl mx-auto">
            Contact us today and let us help you find the perfect condo for your needs. We&apos;re here to make your stay in Iloilo City unforgettable.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-fluid-md mb-fluid-2xl">
            <a
              href="https://m.me/cozycondoiloilocity"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary bg-[#14b8a6] hover:bg-[#0d9488] rounded-lg transition-all duration-300 hover:shadow-lg touch-target"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Message Us on Facebook</span>
            </a>
            <a
              href="tel:+639778870724"
              className="btn-secondary bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-all duration-300 touch-target"
            >
              <Phone className="w-5 h-5" />
              <span>Call +63 977 887 0724</span>
            </a>
          </div>

          {/* Contact info */}
          <div className="flex flex-col sm:flex-row justify-center gap-fluid-md text-fluid-sm text-[#d4b896]">
            <a href="mailto:admin@cozycondo.net" className="flex items-center justify-center sm:justify-start gap-2 hover:text-white transition-colors touch-target">
              <Mail className="w-4 h-4" />
              <span>admin@cozycondo.net</span>
            </a>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <MapPin className="w-4 h-4" />
              <span>Iloilo City, Philippines</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
