import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, Bed, Bath, Square, Wifi, Car, Wind, Filter, Grid3x3, List, Search, Home, Star } from 'lucide-react';
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';
import { getProductionFallbackProperties } from '@/lib/production-fallback-service';
import type { PropertyData } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Properties | Cozy Condo',
  description: 'Browse our collection of premium short-term rental condominiums in Iloilo City. Modern amenities, prime locations, and exceptional comfort.',
  openGraph: {
    title: 'Premium Properties in Iloilo City',
    description: 'Discover comfortable and modern condominiums for short-term rental',
  },
};

// Force dynamic rendering to ensure database access works
export const dynamic = 'force-dynamic';

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
    // Use fallback if database fails
    const fallbackProps = getProductionFallbackProperties();
    properties = Object.values(fallbackProps);
    console.log(`Using ${properties.length} fallback properties`);
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
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background with mesh gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-warm-50)] via-[var(--color-warm-100)] to-[var(--color-warm-200)]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(ellipse 200% 100% at 50% 0%, var(--color-primary-100) 0%, transparent 50%),
              radial-gradient(ellipse 200% 100% at 80% 100%, var(--color-accent-orange-light) 0%, transparent 50%)
            `
          }}
        />

        <div className="relative container-xl py-20 lg:py-32">
          <div className="max-w-4xl">
            <div className="hero-badge mb-8">
              <div className="hero-badge-dot" />
              <span>{activeProperties.length} Premium Properties Available</span>
            </div>

            <h1 className="hero-title text-[var(--color-warm-900)] mb-6">
              Find Your Perfect Stay in Iloilo
            </h1>
            <p className="hero-subtitle text-[var(--color-warm-700)] mb-12">
              Discover our collection of premium condominiums, each offering modern comfort, prime locations, and exceptional Filipino hospitality.
            </p>

            {/* Search and filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-warm-600)]" />
                <input
                  type="text"
                  placeholder="Search properties by name or location..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[var(--color-warm-200)] bg-white/80 backdrop-blur-sm focus:bg-white focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all"
                />
              </div>
              <button className="btn btn-secondary btn-lg lg:w-auto">
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
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

            <div className="grid-auto-fit grid-gap-lg">
              {featuredProperties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  priority={index < 3}
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
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
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
            <div className="grid-auto-fit grid-gap-lg">
              {regularProperties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  priority={index < 6} // Prioritize first 6 images for better UX
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

// Enhanced Property Card Component
function PropertyCard({ property, priority = false }: { property: PropertyData; priority?: boolean }) {
  const imageUrl = property.photos?.[0] || (property as any).images?.[0] || (property as any).image_url || '/property-placeholder.jpg';
  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'Parking': Car,
    'Air-conditioning': Wind,
  };

  return (
    <article className="card card-elevated group">
      <div className="card-image">
        <div className="card-image-overlay" />

        <Image
          src={imageUrl}
          alt={property.name || 'Property'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          quality={priority ? 90 : 80}
        />

        {property.featured && (
          <div className="featured-badge">
            Featured
          </div>
        )}

        {/* Enhanced quick actions overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
          <Link
            href={`/properties/${property.slug || property.id}`}
            className="btn btn-primary btn-sm w-full hover:scale-105"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="card-content">
        <div className="flex items-start justify-between mb-3">
          <h3 className="card-title group-hover:text-[var(--color-primary-600)]">
            {property.name}
          </h3>
          {property.pricePerNight && (
            <div className="text-right">
              <div className="font-bold text-[var(--color-primary-600)] text-lg">
                {property.pricePerNight}
              </div>
              <div className="text-xs text-[var(--color-warm-600)]">per night</div>
            </div>
          )}
        </div>

        <div className="card-meta flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-[var(--color-primary-500)]" />
          <span className="font-medium">{property.location}</span>
        </div>

        <p className="card-description line-clamp-2">
          {property.short_description || property.description}
        </p>

        {/* Property Details */}
        {(property.bedrooms || property.bathrooms || property.size) && (
          <div className="flex items-center gap-4 mb-4 text-sm text-[var(--color-warm-700)]">
            {property.bedrooms && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms} Beds</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms} Baths</span>
              </div>
            )}
            {property.size && (
              <div className="flex items-center gap-1.5">
                <Square className="w-4 h-4" />
                <span>{property.size}</span>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {property.amenities.slice(0, 3).map((amenity) => {
              const Icon = amenityIcons[amenity];
              return (
                <span key={amenity} className="amenity-tag">
                  {Icon && <Icon className="amenity-tag-icon" />}
                  <span className="capitalize">{amenity.replace('-', ' ')}</span>
                </span>
              );
            })}
            {property.amenities.length > 3 && (
              <span className="amenity-tag bg-[var(--color-primary-50)] border-[var(--color-primary-200)] text-[var(--color-primary-800)]">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}