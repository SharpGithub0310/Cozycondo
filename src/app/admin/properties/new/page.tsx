'use client';

import { useState } from 'react';
import { Save, Upload, X, Plus, MapPin, Home, Users, Bed } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewProperty() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [property, setProperty] = useState({
    name: '',
    type: 'apartment',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    size: '',
    description: '',
    location: '',
    pricePerNight: '',
    airbnbUrl: '',
    amenities: [] as string[],
    photos: [] as string[],
  });

  const [newAmenity, setNewAmenity] = useState('');

  const amenityOptions = [
    'WiFi', 'Air Conditioning', 'Kitchen', 'Washing Machine',
    'TV', 'Parking', 'Pool', 'Gym', 'Balcony', 'City View',
    'Ocean View', 'Pet Friendly', 'Non-smoking'
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // In production, save to database
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/admin/properties');
    } catch (error) {
      console.error('Failed to save property:', error);
      setIsSaving(false);
    }
  };

  const addAmenity = (amenity: string) => {
    if (amenity && !property.amenities.includes(amenity)) {
      setProperty({
        ...property,
        amenities: [...property.amenities, amenity]
      });
    }
  };

  const removeAmenity = (amenity: string) => {
    setProperty({
      ...property,
      amenities: property.amenities.filter(a => a !== amenity)
    });
  };

  const addCustomAmenity = () => {
    if (newAmenity) {
      addAmenity(newAmenity);
      setNewAmenity('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">Add New Property</h1>
          <p className="text-[#7d6349] mt-1">Create a new property listing.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-[#7d6349] hover:text-[#5f4a38] transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Property Form */}
      <div className="admin-card max-w-4xl">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Basic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="form-label flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Property Name
                </label>
                <input
                  type="text"
                  value={property.name}
                  onChange={(e) => setProperty({...property, name: e.target.value})}
                  className="form-input"
                  placeholder="e.g., Sunset Bay Apartment"
                  required
                />
              </div>

              <div>
                <label className="form-label">Property Type</label>
                <select
                  value={property.type}
                  onChange={(e) => setProperty({...property, type: e.target.value})}
                  className="form-input"
                >
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condominium</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                  <option value="loft">Loft</option>
                </select>
              </div>

              <div>
                <label className="form-label flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <input
                  type="text"
                  value={property.location}
                  onChange={(e) => setProperty({...property, location: e.target.value})}
                  className="form-input"
                  placeholder="e.g., Iloilo City, Philippines"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="form-label flex items-center gap-2">
                    <Bed className="w-4 h-4" />
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={property.bedrooms}
                    onChange={(e) => setProperty({...property, bedrooms: parseInt(e.target.value)})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Bathrooms</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={property.bathrooms}
                    onChange={(e) => setProperty({...property, bathrooms: parseFloat(e.target.value)})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Max Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={property.maxGuests}
                    onChange={(e) => setProperty({...property, maxGuests: parseInt(e.target.value)})}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Size (sq m)</label>
                <input
                  type="text"
                  value={property.size}
                  onChange={(e) => setProperty({...property, size: e.target.value})}
                  className="form-input"
                  placeholder="e.g., 45"
                />
              </div>

              <div>
                <label className="form-label">Price per Night (PHP)</label>
                <input
                  type="number"
                  value={property.pricePerNight}
                  onChange={(e) => setProperty({...property, pricePerNight: e.target.value})}
                  className="form-input"
                  placeholder="e.g., 2500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Description
            </h3>
            <textarea
              value={property.description}
              onChange={(e) => setProperty({...property, description: e.target.value})}
              className="form-input resize-none"
              rows={4}
              placeholder="Describe the property, its features, and what makes it special..."
              required
            />
          </div>

          {/* Amenities */}
          <div>
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Amenities
            </h3>

            {/* Quick Add Amenities */}
            <div className="mb-4">
              <p className="text-sm text-[#7d6349] mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => addAmenity(amenity)}
                    disabled={property.amenities.includes(amenity)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      property.amenities.includes(amenity)
                        ? 'bg-[#14b8a6] text-white border-[#14b8a6]'
                        : 'border-[#faf3e6] text-[#7d6349] hover:border-[#14b8a6] hover:text-[#14b8a6]'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amenity */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                className="form-input flex-1"
                placeholder="Add custom amenity..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
              />
              <button
                type="button"
                onClick={addCustomAmenity}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Selected Amenities */}
            {property.amenities.length > 0 && (
              <div>
                <p className="text-sm text-[#7d6349] mb-2">Selected amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-[#14b8a6] text-white text-sm rounded-full"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="hover:bg-[#0d9488] rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* External Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              External Links
            </h3>
            <div>
              <label className="form-label">Airbnb URL (Optional)</label>
              <input
                type="url"
                value={property.airbnbUrl}
                onChange={(e) => setProperty({...property, airbnbUrl: e.target.value})}
                className="form-input"
                placeholder="https://airbnb.com/rooms/..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-[#faf3e6]">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Creating Property...' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}