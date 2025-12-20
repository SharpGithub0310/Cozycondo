'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { enhancedDatabaseService } from '@/lib/enhanced-database-service';
import type { PropertyData } from '@/lib/types';

// export const metadata: Metadata = {
//   title: 'Properties',
//   description: 'Browse our collection of premium short-term rental condominiums in Iloilo City. Modern amenities, prime locations, and exceptional comfort.',
// };

// Sample properties (will be replaced with Supabase data)
const properties = [
  {
    id: '1',
    name: 'Artist Loft',
    slug: 'artist-loft',
    location: 'Arts District',
    short_description: 'Unique artist loft with high ceilings and natural light. Perfect for creative professionals and art lovers.',
    amenities: ['WiFi', 'Air-conditioning', 'Kitchen', 'Smart TV', 'High Ceilings', 'Natural Light', 'Workspace'],
    featured: true,
    active: true,
  },
  {
    id: '2',
    name: 'Garden View Suite',
    slug: 'garden-view-suite',
    location: 'Smallville Complex',
    short_description: 'Spacious 1-bedroom suite overlooking lush gardens. Ideal for extended stays with full kitchen and living area.',
    amenities: ['WiFi', 'Air-conditioning', 'Parking', 'Kitchen', 'Balcony'],
    featured: true,
    active: true,
  },
  {
    id: '3',
    name: 'Downtown Retreat',
    slug: 'downtown-retreat',
    location: 'City Proper',
    short_description: 'Cozy unit in the heart of downtown. Walking distance to SM City Iloilo and local attractions.',
    amenities: ['WiFi', 'Air-conditioning', 'Smart TV', 'Kitchen'],
    featured: true,
    active: true,
  },
  {
    id: '4',
    name: 'Sunset Bay Unit',
    slug: 'sunset-bay-unit',
    location: 'Mandurriao',
    short_description: 'Beautiful unit with western exposure for stunning sunset views. Modern finishes throughout.',
    amenities: ['WiFi', 'Air-conditioning', 'City View', 'Kitchen', 'Gym Access'],
    featured: false,
    active: true,
  },
  {
    id: '5',
    name: 'Executive Suite',
    slug: 'executive-suite',
    location: 'Iloilo Business Park',
    short_description: 'Premium 1-bedroom suite designed for business executives. Includes dedicated workspace and meeting area.',
    amenities: ['WiFi', 'Air-conditioning', 'Workspace', 'Smart TV', 'Parking'],
    featured: false,
    active: true,
  },
  {
    id: '6',
    name: 'Family Haven',
    slug: 'family-haven',
    location: 'Molo District',
    short_description: 'Spacious 2-bedroom unit perfect for families. Close to schools and family-friendly attractions.',
    amenities: ['WiFi', 'Air-conditioning', 'Kitchen', 'Washer', 'Parking'],
    featured: false,
    active: true,
  },
  {
    id: '7',
    name: 'Metro Central',
    slug: 'metro-central',
    location: 'City Proper',
    short_description: 'Modern unit in the heart of City Proper. Walking distance to major attractions and business centers.',
    amenities: ['WiFi', 'Air-conditioning', 'Smart TV', 'Kitchen', '24/7 Security', 'Central Location'],
    featured: false,
    active: true,
  },
  {
    id: '8',
    name: 'Riverside Studio',
    slug: 'riverside-studio',
    location: 'Jaro District',
    short_description: 'Peaceful riverside studio in historic Jaro district. Perfect for those seeking tranquility with cultural access.',
    amenities: ['WiFi', 'Air-conditioning', 'Kitchen', 'River View', 'Peaceful Setting', 'Historic Area'],
    featured: false,
    active: true,
  },
];

export default function PropertiesPage() {
  const [updatedProperties, setUpdatedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mobile debugging: Log user agent and viewport
        console.log('Properties Page: Loading properties on', {
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
          viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'server',
          isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false
        });

        // Load only active properties from database for public view
        const dbProperties = await enhancedDatabaseService.getProperties({ active: true });
        console.log('Properties Page: Loaded properties from database:', {
          totalCount: Object.keys(dbProperties).length,
          propertyIds: Object.keys(dbProperties),
          firstProperty: Object.values(dbProperties)[0]
        });

        // Convert database properties to display format
        // Properties are already filtered to active only, no need to filter again
        const propertiesArray = Object.values(dbProperties)
          .map((property: any) => ({
            id: property.id,
            name: property.name || property.title,
            slug: property.slug || property.name?.toLowerCase().replace(/\s+/g, '-') || property.id,
            location: property.location || '',
            short_description: property.description || property.short_description || '',
            amenities: property.amenities || [],
            featured: property.featured ?? false,
            active: property.active ?? true,
            photos: property.photos || property.images || []
          }));

        console.log('Properties Page: Converted properties array:', {
          totalCount: propertiesArray.length,
          featuredCount: propertiesArray.filter(p => p.featured).length,
          sampleProperties: propertiesArray.slice(0, 2)
        });

        setUpdatedProperties(propertiesArray);
      } catch (err) {
        console.error('Properties Page: Error loading properties:', err);
        setError('Failed to load properties. Please try again later.');
        // Fallback to default properties on error
        console.log('Properties Page: Using fallback properties');
        setUpdatedProperties(properties.filter(p => p.active));
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  // Properties are already active, no need to filter by active again
  const featuredProperties = updatedProperties.filter(p => p.featured);
  const otherProperties = updatedProperties.filter(p => !p.featured);

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-[#fefdfb] via-[#fdf9f3] to-[#f5e6cc]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#14b8a6]/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-[#5f4a38] mb-4">
              Our Properties
            </h1>
            <p className="text-lg text-[#7d6349]">
              Discover our curated collection of premium condominiums across Iloilo City. Each property is handpicked for comfort, convenience, and style.
            </p>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-between">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="space-y-16">
              <div>
                <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="card animate-pulse">
                      <div className="aspect-[4/3] bg-gray-200 rounded-t-lg"></div>
                      <div className="p-4 sm:p-5 space-y-3">
                        <div className="h-5 sm:h-6 bg-gray-200 rounded"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-12 sm:h-16 bg-gray-200 rounded"></div>
                        <div className="flex gap-2">
                          <div className="h-5 sm:h-6 w-12 sm:w-16 bg-gray-200 rounded-full"></div>
                          <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded-full"></div>
                          <div className="h-5 sm:h-6 w-10 sm:w-14 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
          {/* No Properties Available */}
          {updatedProperties.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#faf3e6] flex items-center justify-center">
                  <span className="font-display text-4xl text-[#d4b896]">CC</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-3">
                  No Properties Available
                </h3>
                <p className="text-[#7d6349] mb-6">
                  We're currently updating our property listings. Please check back soon or contact us directly.
                </p>
                <a
                  href="https://m.me/cozycondoiloilocity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <span>Contact Us</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Featured Properties */}
              {featuredProperties.length > 0 && (
                <div className="mb-16">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-8 bg-[#14b8a6] rounded-full" />
                    <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#5f4a38]">
                      Featured Properties
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {featuredProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Properties */}
              {otherProperties.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-8 bg-[#d4b896] rounded-full" />
                    <h2 className="font-display text-xl sm:text-2xl font-semibold text-[#5f4a38]">
                      All Properties
                    </h2>
                    <span className="text-xs sm:text-sm text-[#9a7d5e] bg-[#faf3e6] px-2 sm:px-3 py-1 rounded-full">
                      {updatedProperties.length} units
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {otherProperties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-[#faf3e6]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#5f4a38] mb-4">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="text-[#7d6349] mb-8">
            Contact us directly and we&apos;ll help you find the perfect property for your needs.
          </p>
          <a
            href="https://m.me/cozycondoiloilocity"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            <span>Message Us</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}

// Property Card Component
function PropertyCard({ property }: { property: any }) {
  const [displayPhoto, setDisplayPhoto] = useState<string>('');
  const [propertyData, setPropertyData] = useState(property);

  useEffect(() => {
    // Property data already comes from database, just set up the display photo
    setPropertyData(property);

    if (property.photos && property.photos.length > 0) {
      // Use featured photo if available, otherwise first photo
      const featuredIndex = property.featuredPhotoIndex || 0;
      setDisplayPhoto(property.photos[featuredIndex] || property.photos[0]);
    }
  }, [property]);

  return (
    <div className="card group">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#d4b896] to-[#b89b7a] overflow-hidden">
        {displayPhoto ? (
          <img
            src={displayPhoto}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              setDisplayPhoto('');
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/80">
              <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="font-display text-2xl font-bold">CC</span>
              </div>
              <p className="text-sm">Photo coming soon</p>
            </div>
          </div>
        )}
        {property.featured && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-[#14b8a6] text-white text-xs font-medium rounded-full">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-display text-lg sm:text-xl font-semibold text-[#5f4a38] mb-2 group-hover:text-[#0d9488] transition-colors">
          {propertyData.name}
        </h3>

        <div className="flex items-center gap-2 text-[#9a7d5e] text-sm mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{propertyData.location}</span>
        </div>

        <p className="text-[#7d6349] text-sm mb-4 line-clamp-2 leading-relaxed">
          {property.short_description}
        </p>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
          {propertyData.amenities.slice(0, 3).map((amenity: string, i: number) => (
            <span
              key={i}
              className="px-2 sm:px-3 py-1 bg-[#faf3e6] text-[#7d6349] text-xs rounded-full whitespace-nowrap"
            >
              {amenity}
            </span>
          ))}
          {propertyData.amenities.length > 3 && (
            <span className="px-2 sm:px-3 py-1 bg-[#faf3e6] text-[#9a7d5e] text-xs rounded-full whitespace-nowrap">
              +{propertyData.amenities.length - 3} more
            </span>
          )}
        </div>

        <Link
          href={`/properties/${property.slug}`}
          className="inline-flex items-center gap-1 text-[#0d9488] font-medium text-sm hover:gap-2 transition-all"
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
