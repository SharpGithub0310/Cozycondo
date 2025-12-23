import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight, Bed, Bath, Square, Wifi, Car, Wind } from 'lucide-react';
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
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#0d9488] to-[#0a7e74] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Stay in Iloilo
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              Discover our collection of premium condominiums, each offering modern comfort and prime locations.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Properties</h2>
              <p className="text-gray-600">Hand-picked selections for an exceptional stay</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} priority={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Properties */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">All Properties</h2>
            <p className="text-gray-600">{activeProperties.length} properties available</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {regularProperties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                priority={index < 3} // Prioritize first 3 images for LCP
              />
            ))}
          </div>

          {activeProperties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No properties available at the moment.</p>
              <p className="text-gray-500 mt-2">Please check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#0d9488] to-[#0a7e74] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Can't Find What You're Looking For?</h2>
          <p className="text-lg mb-8 opacity-90">
            Contact us for personalized assistance with your accommodation needs
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-[#0d9488] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get in Touch
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}

// Optimized Property Card Component
function PropertyCard({ property, priority = false }: { property: PropertyData; priority?: boolean }) {
  const imageUrl = property.photos?.[0] || (property as any).images?.[0] || (property as any).image_url || '/property-placeholder.jpg';
  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'Parking': Car,
    'Air-conditioning': Wind,
  };

  return (
    <Link
      href={`/properties/${property.slug || property.id}`}
      className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative h-64 overflow-hidden">
        <Image
          src={imageUrl}
          alt={property.name || 'Property'}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          quality={priority ? 90 : 75}
        />
        {property.featured && (
          <div className="absolute top-4 left-4 bg-[#0d9488] text-white px-3 py-1 rounded-full text-sm font-semibold">
            Featured
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#0d9488] transition-colors">
          {property.name}
        </h3>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.short_description || property.description}
        </p>

        {/* Property Details */}
        {(property.bedrooms || property.bathrooms || property.size) && (
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.size && (
              <div className="flex items-center gap-1">
                <Square className="w-4 h-4" />
                <span>{property.size}</span>
              </div>
            )}
          </div>
        )}

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {property.amenities.slice(0, 3).map((amenity) => {
              const Icon = amenityIcons[amenity];
              return (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {amenity}
                </span>
              );
            })}
            {property.amenities.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {property.pricePerNight && (
              <div className="text-2xl font-bold text-[#0d9488]">
                {property.pricePerNight}
                <span className="text-sm text-gray-600 font-normal">/night</span>
              </div>
            )}
          </div>
          <span className="text-[#0d9488] font-semibold group-hover:gap-2 inline-flex items-center gap-1 transition-all">
            View Details
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}