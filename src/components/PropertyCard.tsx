'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Wifi, Wind, Car, ChevronRight, ExternalLink } from 'lucide-react';
import type { Property, PropertyPhoto } from '@/lib/types';

// Amenity icons mapping
const amenityIconMap: Record<string, React.ReactNode> = {
  'wifi': <Wifi className="w-4 h-4" />,
  'air-conditioning': <Wind className="w-4 h-4" />,
  'parking': <Car className="w-4 h-4" />,
};

interface PropertyCardProps {
  property: Property;
  photos?: PropertyPhoto[];
}

export default function PropertyCard({ property, photos = [] }: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);

  // Get the featured photo based on featuredPhotoIndex or find the primary photo
  const getFeaturedPhoto = () => {
    if (photos.length === 0) return null;

    // If property has featuredPhotoIndex, use that
    if (property.featuredPhotoIndex !== undefined && property.featuredPhotoIndex < photos.length) {
      return photos[property.featuredPhotoIndex];
    }

    // Fallback to finding primary photo or first photo
    return photos.find(p => p.is_primary) || photos[0];
  };

  const primaryPhoto = getFeaturedPhoto();
  const displayAmenities = property.amenities?.slice(0, 3) || [];

  return (
    <article className="card card-elevated group">
      {/* Enhanced Image */}
      <div className="card-image">
        <div className="card-image-overlay" />

        {primaryPhoto && !imageError ? (
          <Image
            src={primaryPhoto.url}
            alt={primaryPhoto.alt_text || property.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={85}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-[var(--color-warm-600)]">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--color-warm-200)] to-[var(--color-warm-300)] flex items-center justify-center shadow-lg">
                <span className="font-display text-2xl font-bold text-[var(--color-warm-800)]">CC</span>
              </div>
              <span className="text-sm font-medium">Photo coming soon</span>
            </div>
          </div>
        )}

        {/* Enhanced featured badge */}
        {property.featured && (
          <div className="featured-badge">
            Featured
          </div>
        )}

        {/* Enhanced quick actions overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-4">
          <div className="flex gap-2 w-full">
            {property.airbnb_url && (
              <a
                href={property.airbnb_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn btn-secondary btn-sm bg-white/95 backdrop-blur-sm text-[var(--color-warm-800)] border-white/20 hover:bg-white hover:scale-105"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Airbnb</span>
              </a>
            )}
            <Link
              href={`/properties/${property.slug}`}
              className="btn btn-primary btn-sm hover:scale-105"
            >
              <span>View Details</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="card-content">
        <div className="flex items-start justify-between mb-3">
          <h3 className="card-title group-hover:text-[var(--color-primary-600)]">
            {property.name}
          </h3>
          {(property as any).pricePerNight && (
            <div className="text-right">
              <div className="font-bold text-[var(--color-primary-600)] text-lg">
                {(property as any).pricePerNight}
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
          {property.short_description}
        </p>

        {/* Property details */}
        {((property as any).bedrooms || (property as any).bathrooms || (property as any).size) && (
          <div className="flex items-center gap-4 mb-4 text-sm text-[var(--color-warm-700)]">
            {(property as any).bedrooms && (
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-[var(--color-warm-200)] flex items-center justify-center">
                  <span className="text-xs font-bold">{(property as any).bedrooms}</span>
                </div>
                <span>Beds</span>
              </div>
            )}
            {(property as any).bathrooms && (
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-[var(--color-warm-200)] flex items-center justify-center">
                  <span className="text-xs font-bold">{(property as any).bathrooms}</span>
                </div>
                <span>Baths</span>
              </div>
            )}
            {(property as any).size && (
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{(property as any).size}</span>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Amenities */}
        {displayAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {displayAmenities.map((amenity, index) => (
              <span key={index} className="amenity-tag">
                <span className="amenity-tag-icon">
                  {amenityIconMap[amenity.toLowerCase()] || null}
                </span>
                <span className="capitalize">{amenity.replace('-', ' ')}</span>
              </span>
            ))}
            {property.amenities && property.amenities.length > 3 && (
              <span className="amenity-tag bg-[var(--color-primary-50)] border-[var(--color-primary-200)] text-[var(--color-primary-800)]">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card footer with enhanced CTA */}
      <div className="card-footer">
        <Link
          href={`/properties/${property.slug}`}
          className="btn btn-outline w-full group-hover:btn-primary transition-all duration-300"
        >
          <span>View Details</span>
          <ChevronRight className="w-4 h-4 icon-arrow" />
        </Link>
      </div>
    </article>
  );
}
