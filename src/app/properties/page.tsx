import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, Bed, Bath, Square, Wifi, Car, Wind, Filter, Grid3x3, List, Search, Home, Star, ChevronRight, SlidersHorizontal, Calendar, Users, Heart, Eye, TrendingUp } from 'lucide-react';
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';
import type { PropertyData } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Properties | Cozy Condo',
  description: 'Browse our collection of premium short-term rental condominiums in Iloilo City. Modern amenities, prime locations, and exceptional comfort.',
  openGraph: {
    title: 'Premium Properties in Iloilo City',
    description: 'Discover comfortable and modern condominiums for short-term rental',
  },
};

// Use ISR with 5-minute revalidation for better performance
// This caches the page and revalidates every 5 minutes
export const revalidate = 300;

// Server Component - runs on the server, faster initial page load
export default async function PropertiesPage() {
  // Fetch properties on the server
  let properties: PropertyData[] = [];

  try {
    // Try database first
    const dbProperties = await postMigrationDatabaseService.getProperties();
    properties = Object.values(dbProperties);
    console.log(`Loaded ${properties.length} properties from database`);
  } catch (error) {
    console.error('Error loading properties from database:', error);
    // No fallback - return empty array if database fails
    properties = [];
    console.log('Database error - no properties available');
  }

  // Filter active properties and sort featured first
  const activeProperties = properties
    .filter(p => p.active !== false)
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

  const featuredProperties = activeProperties.filter(p => p.featured);
  const regularProperties = activeProperties.filter(p => !p.featured);

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
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(90deg, var(--color-warm-600) 1px, transparent 1px),
                linear-gradient(180deg, var(--color-warm-600) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
          {/* Floating decorative elements */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[var(--color-primary-400)] rounded-full animate-float opacity-60" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-[var(--color-accent-orange)] rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-[var(--color-primary-500)] rounded-full animate-float opacity-70" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative container-xl py-24 lg:py-36">
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
              <span className="text-[var(--color-warm-800)] font-medium">Properties</span>
            </nav>

            {/* Enhanced Hero Badge */}
            <div className="hero-badge mb-10 bg-white/90 backdrop-blur-lg border-white/50 shadow-lg">
              <div className="hero-badge-dot" />
              <span className="font-semibold">{activeProperties.length} Premium Properties • Iloilo City</span>
            </div>

            {/* Hero Title */}
            <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold text-[var(--color-warm-900)] mb-8 leading-tight tracking-tight">
              Find Your Perfect
              <span className="block text-transparent bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-accent-orange)] bg-clip-text">
                Stay in Iloilo
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-[var(--color-warm-700)] mb-16 leading-relaxed max-w-3xl">
              Discover our carefully curated collection of premium condominiums, each offering modern comfort, prime locations, and authentic Filipino hospitality in the heart of Iloilo City.
            </p>

            {/* Enhanced Search and Filter Section */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/50 mb-12" role="search">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Search Bar */}
                <div className="lg:col-span-7 relative">
                  <label htmlFor="property-search" className="sr-only">
                    Search properties by name, location, or amenities
                  </label>
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-warm-500)] pointer-events-none" aria-hidden="true" />
                  <input
                    id="property-search"
                    type="search"
                    placeholder="Search properties by name, location, or amenities..."
                    className="w-full pl-14 pr-6 py-5 text-lg rounded-2xl border border-[var(--color-warm-200)] bg-white focus:bg-white focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--color-primary-100)] focus:outline-none transition-all duration-300 placeholder-[var(--color-warm-500)]"
                    aria-describedby="search-help"
                    autoComplete="off"
                  />
                  <div id="search-help" className="sr-only">
                    Search through {activeProperties.length} available properties in Iloilo City
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="lg:col-span-3 flex gap-3">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-5 bg-[var(--color-warm-100)] hover:bg-[var(--color-primary-50)] text-[var(--color-warm-700)] hover:text-[var(--color-primary-700)] rounded-2xl border border-[var(--color-warm-200)] hover:border-[var(--color-primary-200)] transition-all duration-300 font-medium"
                    aria-label="Open filters"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    <span className="hidden sm:inline">Filters</span>
                  </button>

                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-5 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 font-medium"
                    aria-label="Search properties"
                  >
                    <span className="hidden sm:inline">Search</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Quick Filter Tags */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-[var(--color-warm-200)]">
                <span className="text-sm font-medium text-[var(--color-warm-600)] mr-2">Quick filters:</span>
                {[
                  { label: 'Featured', icon: Star },
                  { label: 'Family-friendly', icon: Users },
                  { label: 'Long-term stays', icon: Calendar },
                  { label: 'Most popular', icon: TrendingUp }
                ].map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[var(--color-primary-50)] text-[var(--color-warm-700)] hover:text-[var(--color-primary-700)] border border-[var(--color-warm-200)] hover:border-[var(--color-primary-200)] rounded-full text-sm font-medium transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="section bg-white">
          <div className="container-xl">
            {/* Section header with stats */}
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="section-title flex items-center gap-3">
                  <Star className="w-8 h-8 text-[var(--color-primary-500)]" />
                  Featured Properties
                </h2>
                <p className="section-subtitle text-[var(--color-warm-600)]">
                  Hand-picked selections for an exceptional stay
                </p>
              </div>

              {/* View options */}
              <div className="hidden lg:flex items-center gap-2 p-1 bg-[var(--color-warm-100)] rounded-xl">
                <button className="p-2 rounded-lg bg-white shadow-sm">
                  <Grid3x3 className="w-5 h-5 text-[var(--color-warm-700)]" />
                </button>
                <button className="p-2 rounded-lg">
                  <List className="w-5 h-5 text-[var(--color-warm-500)]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
              {featuredProperties.map((property, index) => (
                <PremiumPropertyCard
                  key={property.id}
                  property={property}
                  priority={index < 3}
                  animationDelay={index * 150}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enhanced All Properties */}
      <section className="section bg-gradient-to-b from-[var(--color-warm-50)] to-white">
        <div className="container-xl">
          {/* Enhanced section header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="section-title flex items-center gap-3">
                <Home className="w-8 h-8 text-[var(--color-primary-500)]" />
                All Properties
              </h2>
              <p className="section-subtitle text-[var(--color-warm-600)]">
                {activeProperties.length} premium properties available • Browse our full collection
              </p>
            </div>

            {/* Sort and filter controls */}
            <div className="flex items-center gap-4">
              <select className="px-4 py-3 rounded-xl border border-[var(--color-warm-200)] bg-white text-[var(--color-warm-700)] font-medium focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all">
                <option>Sort by: Featured</option>
                <option>Newest First</option>
                <option>Most Popular</option>
              </select>

              <div className="hidden lg:flex items-center gap-2 p-1 bg-[var(--color-warm-100)] rounded-xl">
                <button className="p-2 rounded-lg bg-white shadow-sm">
                  <Grid3x3 className="w-5 h-5 text-[var(--color-warm-700)]" />
                </button>
                <button className="p-2 rounded-lg">
                  <List className="w-5 h-5 text-[var(--color-warm-500)]" />
                </button>
              </div>
            </div>
          </div>

          {activeProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
              {regularProperties.map((property, index) => (
                <PremiumPropertyCard
                  key={property.id}
                  property={property}
                  priority={index < 6}
                  animationDelay={(index + featuredProperties.length) * 100}
                />
              ))}
            </div>
          ) : (
            /* Enhanced empty state */
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-[var(--color-warm-100)] flex items-center justify-center">
                <Home className="w-12 h-12 text-[var(--color-warm-500)]" />
              </div>
              <h3 className="section-title text-[var(--color-warm-800)] mb-4">
                No Properties Available
              </h3>
              <p className="text-[var(--color-warm-600)] text-lg mb-8 max-w-md mx-auto">
                We're currently updating our property listings. Please check back soon for new premium accommodations!
              </p>
              <Link href="/contact" className="btn btn-primary btn-lg">
                <span>Contact Us</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="section bg-gradient-to-br from-[var(--color-warm-900)] via-[var(--color-warm-800)] to-[var(--color-warm-950)] text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-primary-400)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[var(--color-accent-orange)]/10 rounded-full blur-3xl" />

        <div className="relative container-xl text-center">
          <h2 className="section-title-lg text-white mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Contact us for personalized assistance with your accommodation needs. We're here to help you find the perfect property for your stay.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            <Link
              href="/contact"
              className="btn btn-lg bg-white text-[var(--color-warm-900)] hover:bg-[var(--color-warm-50)] hover:scale-105 transition-all duration-300 shadow-xl"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-5 h-5 icon-arrow" />
            </Link>
            <a
              href="https://m.me/cozycondoiloilocity"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-lg btn-outline border-white/30 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300"
            >
              <span>Message Us</span>
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex items-center justify-center gap-8 text-white/70">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{activeProperties.length}+</div>
              <div className="text-sm">Properties</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm">Support</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-sm">Verified</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Premium Property Card Component - Matching Homepage Design
function PremiumPropertyCard({ property, priority = false, animationDelay = 0 }: {
  property: PropertyData;
  priority?: boolean;
  animationDelay?: number;
}) {
  // Get the featured photo based on featuredPhotoIndex, fallback to first photo
  const getFeaturedPhoto = () => {
    const photos = property.photos || (property as any).images || [];
    if (photos.length === 0) return '/property-placeholder.jpg';

    const featuredIndex = property.featuredPhotoIndex || 0;
    return photos[featuredIndex] || photos[0] || '/property-placeholder.jpg';
  };

  const imageUrl = getFeaturedPhoto();
  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'Parking': Car,
    'Air-conditioning': Wind,
  };

  return (
    <article
      className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-fade-in border border-[var(--color-warm-100)] hover:border-[var(--color-primary-200)]"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Premium Image Container with Perfect Aspect Ratio */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[var(--color-warm-200)] to-[var(--color-warm-300)]">
        {/* Image Content */}
        <Image
          src={imageUrl}
          alt={property.name || 'Property'}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          quality={priority ? 95 : 85}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4="
        />

        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Featured Badge with Premium Styling */}
        {property.featured && (
          <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm">
              <Star className="w-3 h-3" fill="currentColor" />
              Featured
            </div>
          </div>
        )}


        {/* Interactive Overlay with CTA */}
        <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-400 transform translate-y-2 group-hover:translate-y-0">
          <Link
            href={`/properties/${property.slug || property.id}`}
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
        {/* Property Title and Location */}
        <div className="space-y-2">
          <h3 className="font-display text-xl font-semibold text-[var(--color-warm-900)] group-hover:text-[var(--color-primary-600)] transition-colors duration-300 line-clamp-1">
            {property.name}
          </h3>

          <div className="flex items-center gap-2 text-[var(--color-warm-600)]">
            <MapPin className="w-4 h-4 text-[var(--color-primary-500)] flex-shrink-0" />
            <span className="text-sm font-medium">{property.location}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[var(--color-warm-700)] text-sm leading-relaxed line-clamp-2">
          {property.short_description || property.description}
        </p>

        {/* Property Details */}
        {(property.bedrooms || property.bathrooms || property.size) && (
          <div className="flex items-center gap-4 text-sm text-[var(--color-warm-700)] pt-2">
            {property.bedrooms && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-[var(--color-warm-500)]" />
                <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-[var(--color-warm-500)]" />
                <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
              </div>
            )}
            {property.size && (
              <div className="flex items-center gap-1.5">
                <Square className="w-4 h-4 text-[var(--color-warm-500)]" />
                <span>{property.size}</span>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Amenities Pills */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {property.amenities.slice(0, 3).map((amenity: string, i: number) => {
              const Icon = amenityIcons[amenity];
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--color-warm-100)] text-[var(--color-warm-800)] rounded-full hover:bg-[var(--color-primary-100)] hover:text-[var(--color-primary-800)] transition-colors duration-200 capitalize"
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {amenity.replace('-', ' ')}
                </span>
              );
            })}
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
          href={`/properties/${property.slug || property.id}`}
          className="group/link flex items-center justify-between text-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] transition-colors duration-300"
        >
          <span className="text-sm font-semibold">Learn More</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}