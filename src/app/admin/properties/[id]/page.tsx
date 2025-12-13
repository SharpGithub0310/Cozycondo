'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Users,
  Bed,
  Bath,
  Calendar,
  Star,
  Eye
} from 'lucide-react';
import { getStoredProperty, getDefaultPropertyData } from '@/utils/propertyStorage';

export default function PropertyDetail() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadProperty = async () => {
    try {
      setLoading(true);
      // Get stored property data or fall back to defaults
      const storedProperty = getStoredProperty(params.id as string);
      const defaultProperty = getDefaultPropertyData(params.id as string);
      const propertyData = storedProperty || defaultProperty;

      // Transform to the format expected by the component
      const mockProperty = {
        id: params.id,
        name: propertyData.name,
        type: propertyData.type.charAt(0).toUpperCase() + propertyData.type.slice(1),
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        maxGuests: propertyData.maxGuests,
        size: propertyData.size + ' sq m',
        pricePerNight: parseInt(propertyData.pricePerNight),
        location: propertyData.location,
        description: propertyData.description,
        amenities: propertyData.amenities,
        photos: propertyData.photos,
        airbnbUrl: propertyData.airbnbUrl,
        createdAt: '2024-01-15',
        lastBooking: '2024-12-01',
        totalBookings: params.id === '1' ? 18 : 24,
        rating: params.id === '1' ? 4.9 : 4.8,
        status: 'active',
      };

      setProperty(mockProperty);
    } catch (error) {
      console.error('Failed to load property:', error);
    } finally {
      setLoading(false);
    }
  };

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
  }, [params.id]);

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/admin/properties')}
            className="text-[#7d6349] hover:text-[#5f4a38] transition-colors mb-2"
          >
            ← Back to Properties
          </button>
          <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">
            {property.name}
          </h1>
          <p className="text-[#7d6349] flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" />
            {property.location}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/admin/properties/${params.id}/edit`)}
            className="btn-secondary flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-card text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-[#14b8a6]/10 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#14b8a6]" />
          </div>
          <p className="text-2xl font-bold text-[#5f4a38]">{property.totalBookings}</p>
          <p className="text-sm text-[#9a7d5e]">Total Bookings</p>
        </div>

        <div className="admin-card text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-[#fb923c]/10 flex items-center justify-center">
            <Star className="w-6 h-6 text-[#fb923c]" />
          </div>
          <p className="text-2xl font-bold text-[#5f4a38]">{property.rating}</p>
          <p className="text-sm text-[#9a7d5e]">Average Rating</p>
        </div>

        <div className="admin-card text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-[#1877F2]/10 flex items-center justify-center">
            <span className="text-[#1877F2] font-bold">₱</span>
          </div>
          <p className="text-2xl font-bold text-[#5f4a38]">₱{property.pricePerNight}</p>
          <p className="text-sm text-[#9a7d5e]">Per Night</p>
        </div>

        <div className="admin-card text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-[#9a7d5e]/10 flex items-center justify-center">
            <Eye className="w-6 h-6 text-[#9a7d5e]" />
          </div>
          <p className="text-2xl font-bold text-[#5f4a38]">{property.status}</p>
          <p className="text-sm text-[#9a7d5e]">Status</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Property Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          <div className="admin-card">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">Photos</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {property.photos.map((photo: string, index: number) => (
                <div key={index} className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`Property photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="admin-card">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">Description</h3>
            <p className="text-[#7d6349] leading-relaxed">{property.description}</p>
          </div>

          {/* Amenities */}
          <div className="admin-card">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity: string) => (
                <span
                  key={amenity}
                  className="px-3 py-1 bg-[#faf3e6] text-[#7d6349] text-sm rounded-full"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Info */}
          <div className="admin-card">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">Property Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#9a7d5e]">Type:</span>
                <span className="text-[#5f4a38] font-medium">{property.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9a7d5e] flex items-center gap-1">
                  <Bed className="w-4 h-4" /> Bedrooms:
                </span>
                <span className="text-[#5f4a38] font-medium">{property.bedrooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9a7d5e] flex items-center gap-1">
                  <Bath className="w-4 h-4" /> Bathrooms:
                </span>
                <span className="text-[#5f4a38] font-medium">{property.bathrooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9a7d5e] flex items-center gap-1">
                  <Users className="w-4 h-4" /> Max Guests:
                </span>
                <span className="text-[#5f4a38] font-medium">{property.maxGuests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9a7d5e]">Size:</span>
                <span className="text-[#5f4a38] font-medium">{property.size}</span>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="admin-card">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">External Links</h3>
            <div className="space-y-2">
              {property.airbnbUrl && (
                <a
                  href={property.airbnbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-lg border border-[#faf3e6] hover:border-[#14b8a6]/30 hover:shadow-md transition-all"
                >
                  <div className="w-8 h-8 rounded bg-[#FF5A5F] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Ab</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-[#5f4a38] font-medium block">View on Airbnb</span>
                    <span className="text-xs text-[#9a7d5e]">External listing</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#9a7d5e]" />
                </a>
              )}

              <a
                href={`/properties/${property.name.toLowerCase().replace(/\s+/g, '-')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border border-[#faf3e6] hover:border-[#14b8a6]/30 hover:shadow-md transition-all"
              >
                <div className="w-8 h-8 rounded bg-[#14b8a6] flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-[#5f4a38] font-medium block">View on Website</span>
                  <span className="text-xs text-[#9a7d5e]">Public listing</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#9a7d5e]" />
              </a>
            </div>
          </div>

          {/* Activity Log */}
          <div className="admin-card">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9a7d5e]">Created:</span>
                <span className="text-[#5f4a38]">{property.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9a7d5e]">Last Booking:</span>
                <span className="text-[#5f4a38]">{property.lastBooking}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9a7d5e]">Total Revenue:</span>
                <span className="text-[#5f4a38] font-medium">₱{property.totalBookings * property.pricePerNight}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}