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
  
  const primaryPhoto = photos.find(p => p.is_primary) || photos[0];
  const displayAmenities = property.amenities?.slice(0, 3) || [];

  return (
    <div className="card group">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#faf3e6]">
        {primaryPhoto && !imageError ? (
          <Image
            src={primaryPhoto.url}
            alt={primaryPhoto.alt_text || property.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-[#b89b7a]">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-[#f5e6cc] flex items-center justify-center">
                <span className="font-display text-2xl">CC</span>
              </div>
              <span className="text-sm">Photo coming soon</span>
            </div>
          </div>
        )}
        
        {/* Featured badge */}
        {property.featured && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-[#14b8a6] text-white text-xs font-medium rounded-full">
            Featured
          </div>
        )}

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            {property.airbnb_url && (
              <a
                href={property.airbnb_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-[#5f4a38] text-sm font-medium rounded-lg hover:bg-[#faf3e6] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Airbnb</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-2 group-hover:text-[#0d9488] transition-colors">
          {property.name}
        </h3>
        
        <div className="flex items-center gap-2 text-[#9a7d5e] text-sm mb-3">
          <MapPin className="w-4 h-4" />
          <span>{property.location}</span>
        </div>

        <p className="text-[#7d6349] text-sm mb-4 line-clamp-2">
          {property.short_description}
        </p>

        {/* Amenities */}
        {displayAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {displayAmenities.map((amenity, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#faf3e6] text-[#7d6349] text-xs rounded-full"
              >
                {amenityIconMap[amenity.toLowerCase()] || null}
                <span className="capitalize">{amenity.replace('-', ' ')}</span>
              </span>
            ))}
            {property.amenities && property.amenities.length > 3 && (
              <span className="inline-flex items-center px-3 py-1 bg-[#faf3e6] text-[#9a7d5e] text-xs rounded-full">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* View details link */}
        <Link
          href={`/properties/${property.slug}`}
          className="inline-flex items-center gap-1 text-[#0d9488] font-medium text-sm hover:gap-2 transition-all"
        >
          <span>View Details</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
