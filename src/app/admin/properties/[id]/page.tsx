'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Users,
  Bed,
  Bath,
  Eye,
  Clock,
  DollarSign,
  Home,
  Calendar
} from 'lucide-react';
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';

export default function PropertyDetail() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProperty = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading property from database:', params.id);

      // Fetch property from database using enhanced database service
      const propertyData = await postMigrationDatabaseService.getProperty(params.id as string);

      if (!propertyData) {
        console.error('Property not found:', params.id);
        setProperty(null);
        return;
      }

      console.log('Loaded property data:', propertyData);

      // Transform to the format expected by the component
      const transformedProperty = {
        id: propertyData.id || params.id,
        uuid: (propertyData as any).uuid || propertyData.id,
        name: propertyData.name || (propertyData as any).title || 'Unnamed Property',
        type: propertyData.type ? propertyData.type.charAt(0).toUpperCase() + propertyData.type.slice(1) : 'Apartment',
        bedrooms: propertyData.bedrooms || 2,
        bathrooms: propertyData.bathrooms || 1,
        maxGuests: propertyData.maxGuests || (propertyData as any).max_guests || 4,
        size: (propertyData.size || (propertyData as any).size_sqm || '45') + ' sq m',
        pricePerNight: parseInt(propertyData.pricePerNight || (propertyData as any).price_per_night || (propertyData as any).price || '2500'),
        location: propertyData.location || '',
        description: propertyData.description || propertyData.short_description || '',
        amenities: propertyData.amenities || [],
        photos: propertyData.photos || (propertyData as any).images || [],
        airbnbUrl: propertyData.airbnbUrl || (propertyData as any).airbnb_url || '',
        createdAt: (propertyData as any).createdAt || (propertyData as any).created_at || '2024-01-15',
        lastBooking: '2024-12-01', // This would come from booking system
        totalBookings: Math.floor(Math.random() * 30) + 10, // Mock data
        rating: (Math.random() * 0.5 + 4.5).toFixed(1), // Mock rating
        status: propertyData.active !== false ? 'active' : 'inactive',
        featured: propertyData.featured || false,
        featuredPhotoIndex: propertyData.featuredPhotoIndex || 0,
      };

      setProperty(transformedProperty);
    } catch (error) {
      console.error('Failed to load property from database:', error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadProperty();

    // Reload data when page becomes visible
    const handleFocus = () => {
      loadProperty();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProperty();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadProperty]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        // In production, call delete API
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/admin/properties');
      } catch (error) {
        console.error('Failed to delete property:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#14b8a6] flex items-center justify-center animate-pulse">
            <span className="text-white font-display text-xl font-bold">CC</span>
          </div>
          <p className="text-[#7d6349]">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-[#5f4a38]">Property not found</h1>
        <button
          onClick={() => router.push('/admin/properties')}
          className="mt-4 text-[#14b8a6] hover:underline"
        >
          ← Back to Properties
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#faf3e6] to-[#f4ead5] p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#14b8a6]/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <button
            onClick={() => router.push('/admin/properties')}
            className="inline-flex items-center gap-2 text-[#7d6349] hover:text-[#5f4a38] transition-all duration-200 hover:-translate-x-1 mb-6"
          >
            ← Back to Properties
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-[#14b8a6] flex items-center justify-center shadow-lg">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold text-[#5f4a38] mb-2">
                    {property.name}
                  </h1>
                  <p className="text-[#7d6349] flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5" />
                    {property.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[#7d6349] mb-1">
                    <Bed className="w-4 h-4" />
                    <span className="text-sm font-medium">Bedrooms</span>
                  </div>
                  <p className="text-xl font-bold text-[#5f4a38]">{property.bedrooms}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[#7d6349] mb-1">
                    <Bath className="w-4 h-4" />
                    <span className="text-sm font-medium">Bathrooms</span>
                  </div>
                  <p className="text-xl font-bold text-[#5f4a38]">{property.bathrooms}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[#7d6349] mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Max Guests</span>
                  </div>
                  <p className="text-xl font-bold text-[#5f4a38]">{property.maxGuests}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-[#7d6349] mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">Per Night</span>
                  </div>
                  <p className="text-xl font-bold text-[#5f4a38]">₱{property.pricePerNight}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <button
                onClick={() => router.push(`/admin/properties/${params.id}/edit`)}
                className="btn-secondary flex items-center justify-center gap-2 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <Edit className="w-4 h-4" />
                Edit Property
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Property Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Enhanced Photo Gallery */}
          <PhotoGallery photos={property.photos} propertyName={property.name} />

          {/* Description */}
          <div className="admin-card group hover:shadow-lg transition-all duration-300">
            <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-[#14b8a6] rounded-full"></div>
              Description
            </h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-[#7d6349] leading-relaxed text-base">{property.description}</p>
            </div>
          </div>

          {/* Amenities */}
          <AmenitiesSection amenities={property.amenities} />
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-8">
          {/* Property Details Card */}
          <PropertyDetailsCard property={property} />

          {/* External Links */}
          <ExternalLinksSection property={property} />

          {/* Activity Timeline */}
          <ActivitySection property={property} />
        </div>
      </div>
    </div>
  );
}

// Memoized Photo Gallery Component
const PhotoGallery = memo(({ photos, propertyName }: { photos: string[]; propertyName: string }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [isLoading, setIsLoading] = useState<{ [key: number]: boolean }>({});

  const handleImageLoad = (index: number) => {
    setIsLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageLoadStart = (index: number) => {
    setIsLoading(prev => ({ ...prev, [index]: true }));
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="admin-card">
        <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-6 flex items-center gap-2">
          <div className="w-2 h-6 bg-[#14b8a6] rounded-full"></div>
          Photo Gallery
        </h3>
        <div className="text-center py-12 text-[#9a7d5e]">
          <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No photos available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card group hover:shadow-xl transition-all duration-500">
      <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-6 flex items-center gap-2">
        <div className="w-2 h-6 bg-[#14b8a6] rounded-full"></div>
        Photo Gallery
        <span className="text-sm font-normal text-[#9a7d5e] ml-2">({photos.length} {photos.length === 1 ? 'photo' : 'photos'})</span>
      </h3>

      {/* Featured Photo */}
      <div className="mb-6">
        <div className="aspect-[16/10] rounded-xl overflow-hidden bg-gray-100 relative group">
          {isLoading[selectedPhoto] && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-8 h-8 border-4 border-[#14b8a6] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <Image
            src={photos[selectedPhoto]}
            alt={`${propertyName} - Featured photo`}
            fill
            className={`object-cover transition-all duration-700 group-hover:scale-105 ${
              isLoading[selectedPhoto] ? 'opacity-0' : 'opacity-100'
            }`}
            onLoadStart={() => handleImageLoadStart(selectedPhoto)}
            onLoad={() => handleImageLoad(selectedPhoto)}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Thumbnail Grid */}
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                selectedPhoto === index
                  ? 'ring-3 ring-[#14b8a6] ring-offset-2 scale-105'
                  : 'hover:scale-105 hover:shadow-lg'
              }`}
              onClick={() => setSelectedPhoto(index)}
            >
              <div className="relative w-full h-full bg-gray-100">
                {isLoading[index] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-[#14b8a6] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <Image
                  src={photo}
                  alt={`${propertyName} - Photo ${index + 1}`}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    isLoading[index] ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoadStart={() => handleImageLoadStart(index)}
                  onLoad={() => handleImageLoad(index)}
                  loading="lazy"
                  sizes="(max-width: 768px) 25vw, (max-width: 1200px) 16vw, 12vw"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

PhotoGallery.displayName = 'PhotoGallery';

// Memoized Amenities Section
const AmenitiesSection = memo(({ amenities }: { amenities: string[] }) => {
  if (!amenities || amenities.length === 0) {
    return (
      <div className="admin-card group hover:shadow-lg transition-all duration-300">
        <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-6 flex items-center gap-2">
          <div className="w-2 h-6 bg-[#14b8a6] rounded-full"></div>
          Amenities
        </h3>
        <p className="text-[#9a7d5e] text-center py-8">No amenities listed</p>
      </div>
    );
  }

  return (
    <div className="admin-card group hover:shadow-lg transition-all duration-300">
      <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-6 flex items-center gap-2">
        <div className="w-2 h-6 bg-[#14b8a6] rounded-full"></div>
        Amenities
        <span className="text-sm font-normal text-[#9a7d5e] ml-2">({amenities.length})</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {amenities.map((amenity, index) => (
          <div
            key={amenity}
            className="flex items-center gap-3 p-3 bg-[#faf3e6] hover:bg-[#f4ead5] rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-sm"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="w-2 h-2 bg-[#14b8a6] rounded-full flex-shrink-0"></div>
            <span className="text-[#7d6349] font-medium">{amenity}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

AmenitiesSection.displayName = 'AmenitiesSection';

// Memoized Property Details Card
const PropertyDetailsCard = memo(({ property }: { property: any }) => {
  const details = [
    { label: 'Type', value: property.type, icon: Home },
    { label: 'Size', value: property.size, icon: MapPin },
    { label: 'Status', value: property.status, icon: Eye },
  ];

  return (
    <div className="admin-card group hover:shadow-xl transition-all duration-300">
      <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-6 flex items-center gap-2">
        <div className="w-2 h-6 bg-[#14b8a6] rounded-full"></div>
        Property Details
      </h3>
      <div className="space-y-4">
        {details.map((detail, index) => {
          const Icon = detail.icon;
          return (
            <div
              key={detail.label}
              className="flex items-center justify-between p-3 bg-[#faf3e6] hover:bg-[#f4ead5] rounded-lg transition-all duration-200 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#14b8a6]" />
                </div>
                <span className="text-[#9a7d5e] font-medium">{detail.label}:</span>
              </div>
              <span className="text-[#5f4a38] font-semibold">{detail.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

PropertyDetailsCard.displayName = 'PropertyDetailsCard';

// Memoized External Links Section
const ExternalLinksSection = memo(({ property }: { property: any }) => {
  return (
    <div className="admin-card group hover:shadow-xl transition-all duration-300">
      <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-6 flex items-center gap-2">
        <div className="w-2 h-6 bg-[#14b8a6] rounded-full"></div>
        External Links
      </h3>
      <div className="space-y-3">
        {property.airbnbUrl && (
          <a
            href={property.airbnbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#faf3e6] hover:border-[#14b8a6]/30 hover:shadow-lg transition-all duration-300 group/link transform hover:scale-[1.02]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF5A5F] flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">Ab</span>
            </div>
            <div className="flex-1">
              <span className="text-[#5f4a38] font-semibold block group-hover/link:text-[#14b8a6] transition-colors">View on Airbnb</span>
              <span className="text-xs text-[#9a7d5e]">External listing platform</span>
            </div>
            <ExternalLink className="w-5 h-5 text-[#9a7d5e] group-hover/link:text-[#14b8a6] transition-colors" />
          </a>
        )}

        <a
          href={`/properties/${property.name.toLowerCase().replace(/\s+/g, '-')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#faf3e6] hover:border-[#14b8a6]/30 hover:shadow-lg transition-all duration-300 group/link transform hover:scale-[1.02]"
        >
          <div className="w-10 h-10 rounded-xl bg-[#14b8a6] flex items-center justify-center shadow-sm">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <span className="text-[#5f4a38] font-semibold block group-hover/link:text-[#14b8a6] transition-colors">View on Website</span>
            <span className="text-xs text-[#9a7d5e]">Public property page</span>
          </div>
          <ExternalLink className="w-5 h-5 text-[#9a7d5e] group-hover/link:text-[#14b8a6] transition-colors" />
        </a>
      </div>
    </div>
  );
});

ExternalLinksSection.displayName = 'ExternalLinksSection';

// Memoized Activity Section
const ActivitySection = memo(({ property }: { property: any }) => {
  const activities = [
    { label: 'Created', value: property.createdAt, icon: Clock },
    { label: 'Last Booking', value: property.lastBooking, icon: Calendar },
  ];

  return (
    <div className="admin-card group hover:shadow-xl transition-all duration-300">
      <h3 className="font-display text-xl font-semibold text-[#5f4a38] mb-6 flex items-center gap-2">
        <div className="w-2 h-6 bg-[#14b8a6] rounded-full"></div>
        Activity Timeline
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div
              key={activity.label}
              className="flex items-center gap-3 p-3 bg-[#faf3e6] hover:bg-[#f4ead5] rounded-lg transition-all duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#14b8a6]" />
              </div>
              <div className="flex-1">
                <span className="text-[#9a7d5e] text-sm">{activity.label}</span>
                <p className="text-[#5f4a38] font-semibold">{activity.value}</p>
              </div>
            </div>
          );
        })}

        <div className="border-t border-[#f4ead5] pt-4 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-[#9a7d5e] text-sm font-medium">Estimated Revenue</span>
            <span className="text-[#5f4a38] font-bold text-lg">₱{(property.totalBookings * property.pricePerNight).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

ActivitySection.displayName = 'ActivitySection';