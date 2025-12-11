'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  Phone,
  Wifi,
  Wind,
  Car,
  Tv,
  UtensilsCrossed,
  Building2,
  Shield,
  Dumbbell,
  Coffee,
  WashingMachine,
  Calendar
} from 'lucide-react';
import { getStoredProperty } from '@/utils/propertyStorage';

// Amenity icons mapping
const amenityIcons: Record<string, React.ReactNode> = {
  'wifi': <Wifi className="w-5 h-5" />,
  'air conditioning': <Wind className="w-5 h-5" />,
  'parking': <Car className="w-5 h-5" />,
  'smart tv': <Tv className="w-5 h-5" />,
  'kitchen': <UtensilsCrossed className="w-5 h-5" />,
  'city view': <Building2 className="w-5 h-5" />,
  '24/7 security': <Shield className="w-5 h-5" />,
  'gym access': <Dumbbell className="w-5 h-5" />,
  'workspace': <Coffee className="w-5 h-5" />,
  'washer': <WashingMachine className="w-5 h-5" />,
};

interface PropertyDetailProps {
  slug: string;
  defaultProperty: any;
}

export default function PropertyDetail({ slug, defaultProperty }: PropertyDetailProps) {
  const [property, setProperty] = useState(defaultProperty);
  const [displayPhotos, setDisplayPhotos] = useState<string[]>([]);

  useEffect(() => {
    // Check if we have stored property data with photos
    const propertyId = property.id;
    const storedProperty = getStoredProperty(propertyId);

    if (storedProperty && storedProperty.photos && storedProperty.photos.length > 0) {
      // Use stored data if available and has photos
      setProperty({
        ...property,
        ...storedProperty,
        // Keep the original structure but update with stored data
        name: storedProperty.name,
        description: storedProperty.description,
        location: storedProperty.location,
        amenities: storedProperty.amenities,
      });
      setDisplayPhotos(storedProperty.photos);
    } else {
      // Use default photos if no stored photos
      setDisplayPhotos([
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop',
        'https://images.unsplash.com/photo-1502005229762-cf1b2da02f3f?w=500&h=300&fit=crop',
      ]);
    }
  }, [property.id, slug]);

  return (
    <div className="pt-20">
      {/* Back navigation */}
      <div className="bg-[#faf3e6] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-[#7d6349] hover:text-[#0d9488] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Properties</span>
          </Link>
        </div>
      </div>

      {/* Property Header */}
      <section className="bg-gradient-to-br from-[#fefdfb] to-[#fdf9f3] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {property.featured && (
                <span className="inline-block px-3 py-1 bg-[#14b8a6] text-white text-xs font-medium rounded-full mb-3">
                  Featured
                </span>
              )}
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#5f4a38] mb-2">
                {property.name}
              </h1>
              <div className="flex items-center gap-2 text-[#7d6349]">
                <MapPin className="w-5 h-5 text-[#14b8a6]" />
                <span>{property.location}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {property.airbnb_url && (
                <a
                  href={property.airbnb_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Airbnb</span>
                </a>
              )}
              <a
                href="https://m.me/cozycondoiloilocity"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Book Now</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main photo */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden">
              {displayPhotos.length > 0 ? (
                <img
                  src={displayPhotos[0]}
                  alt={`${property.name} main photo`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#d4b896] to-[#b89b7a] flex items-center justify-center">
                  <div className="text-center text-white/80">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <span className="font-display text-3xl font-bold">CC</span>
                    </div>
                    <p className="text-lg font-medium">Photos Coming Soon</p>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail grid */}
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-xl overflow-hidden"
                >
                  {displayPhotos[i] ? (
                    <img
                      src={displayPhotos[i]}
                      alt={`${property.name} photo ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.currentTarget.src = `https://images.unsplash.com/photo-152270832359${i}?w=300&h=200&fit=crop`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#e8d4a8] to-[#d4b896] flex items-center justify-center">
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <span className="font-display text-lg font-bold text-white/60">CC</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {displayPhotos.length > 5 && (
            <p className="text-sm text-[#9a7d5e] mt-4 text-center">
              Showing {Math.min(5, displayPhotos.length)} of {displayPhotos.length} photos
            </p>
          )}
        </div>
      </section>

      {/* Property Details */}
      <section className="section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-semibold text-[#5f4a38] mb-6">
                About This Property
              </h2>
              <div className="prose prose-lg text-[#7d6349] max-w-none">
                {property.description.split('\n\n').map((paragraph: string, i: number) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>

              {/* Amenities */}
              <div className="mt-12">
                <h2 className="font-display text-2xl font-semibold text-[#5f4a38] mb-6">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {property.amenities.map((amenity: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 rounded-xl bg-[#faf3e6]"
                    >
                      <div className="text-[#14b8a6]">
                        {amenityIcons[amenity.toLowerCase()] || <Building2 className="w-5 h-5" />}
                      </div>
                      <span className="text-[#5f4a38] font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mt-12">
                <h2 className="font-display text-2xl font-semibold text-[#5f4a38] mb-6">
                  Location
                </h2>
                <div className="p-6 rounded-2xl bg-[#faf3e6]">
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-[#5f4a38] font-medium">{property.location}</p>
                      <p className="text-[#7d6349] text-sm">{property.address}</p>
                    </div>
                  </div>
                  {property.map_url && (
                    <a
                      href={property.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#0d9488] font-medium text-sm hover:underline"
                    >
                      <span>View on Google Maps</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Booking Card */}
                <div className="p-6 rounded-2xl bg-white border border-[#faf3e6] shadow-lg">
                  <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-4">
                    Ready to Book?
                  </h3>
                  <p className="text-[#7d6349] text-sm mb-6">
                    Contact us to check availability and make your reservation.
                  </p>

                  <div className="space-y-3">
                    {property.airbnb_url && (
                      <a
                        href={property.airbnb_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full btn-secondary justify-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Book on Airbnb
                      </a>
                    )}
                    <a
                      href="https://m.me/cozycondoiloilocity"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full btn-primary justify-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message Us
                    </a>
                  </div>
                </div>

                {/* Contact Card */}
                <div className="p-6 rounded-2xl bg-[#faf3e6]">
                  <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
                    Questions?
                  </h3>
                  <div className="space-y-3">
                    <a
                      href="tel:+639778870724"
                      className="flex items-center gap-3 text-[#7d6349] hover:text-[#0d9488] transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span>+63 977 887 0724</span>
                    </a>
                    <a
                      href="mailto:admin@cozycondo.net"
                      className="flex items-center gap-3 text-[#7d6349] hover:text-[#0d9488] transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>admin@cozycondo.net</span>
                    </a>
                  </div>
                </div>

                {/* Availability Note */}
                <div className="p-6 rounded-2xl border border-[#14b8a6]/20 bg-[#f0fdfb]">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-[#0f766e] mb-1">Check Availability</h4>
                      <p className="text-sm text-[#115e59]">
                        Message us to get real-time availability and special rates for extended stays.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}