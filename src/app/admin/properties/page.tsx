'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  MapPin,
  MoreVertical,
  ExternalLink,
  GripVertical
} from 'lucide-react';
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';
import type { PropertyData } from '@/lib/types';

// Default properties list with IDs
const propertyIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load properties from database
      const dbProperties = await postMigrationDatabaseService.getProperties();
      console.log('Admin: Loaded properties from database:', dbProperties);

      // Convert to admin format
      const propertiesArray = Object.values(dbProperties).map((property: any) => ({
        id: property.id,
        name: property.name || property.title,
        location: property.location || '',
        featured: property.featured ?? false,
        active: property.active ?? true,
        airbnbUrl: property.airbnbUrl || ''
      }));

      setProperties(propertiesArray);
    } catch (err) {
      console.error('Admin: Error loading properties:', err);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();

    // Reload data when page becomes visible (e.g., after editing)
    const handleFocus = () => {
      loadProperties();
    };

    // Reload on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProperties();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const filteredProperties = properties.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFeatured = async (id: string) => {
    const property = properties.find(p => p.id === id);
    if (!property) return;

    const newFeaturedStatus = !property.featured;

    try {
      // Update in database first
      await postMigrationDatabaseService.updatePropertyStatus(id, { featured: newFeaturedStatus });

      // Update local state on success
      setProperties(prev => prev.map(p =>
        p.id === id ? { ...p, featured: newFeaturedStatus } : p
      ));

      console.log(`Admin: Updated property ${id} featured status to ${newFeaturedStatus}`);
    } catch (err) {
      console.error('Admin: Error updating featured status:', err);
      setError('Failed to update property status. Please try again.');
    }
  };

  const toggleActive = async (id: string) => {
    const property = properties.find(p => p.id === id);
    if (!property) return;

    const newActiveStatus = !property.active;

    try {
      // Update in database first
      await postMigrationDatabaseService.updatePropertyStatus(id, { active: newActiveStatus });

      // Update local state on success
      setProperties(prev => prev.map(p =>
        p.id === id ? { ...p, active: newActiveStatus } : p
      ));

      console.log(`Admin: Updated property ${id} active status to ${newActiveStatus}`);
    } catch (err) {
      console.error('Admin: Error updating active status:', err);
      setError('Failed to update property status. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">Properties</h1>
          <p className="text-[#7d6349] mt-1">Manage your rental property listings</p>
        </div>
        <Link href="/admin/properties/new" className="btn-primary text-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <div className="admin-card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadProperties}
              className="btn-primary text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Total Properties</p>
          <p className="font-display text-2xl font-semibold text-[#5f4a38]">
            {loading ? '...' : properties.length}
          </p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Active</p>
          <p className="font-display text-2xl font-semibold text-[#14b8a6]">
            {loading ? '...' : properties.filter(p => p.active).length}
          </p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Featured</p>
          <p className="font-display text-2xl font-semibold text-[#fb923c]">
            {loading ? '...' : properties.filter(p => p.featured).length}
          </p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">With Airbnb Link</p>
          <p className="font-display text-2xl font-semibold text-[#FF5A5F]">
            {loading ? '...' : properties.filter(p => p.airbnbUrl).length}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="admin-card">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9a7d5e]" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#faf3e6]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7d6349]">Property</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7d6349]">Location</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[#7d6349]">Featured</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[#7d6349]">Status</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[#7d6349]">Airbnb</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-[#7d6349]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#faf3e6]">
              {loading ? (
                // Loading skeleton rows
                Array.from({ length: 3 }, (_, i) => (
                  <tr key={`loading-${i}`} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg mx-auto"></div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="h-6 bg-gray-200 rounded-full w-16 mx-auto"></div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="h-6 bg-gray-200 rounded-full w-16 mx-auto"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-[#fefdfb] transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#d4b896] to-[#b89b7a] flex items-center justify-center flex-shrink-0">
                        <span className="font-display text-white font-bold text-sm">CC</span>
                      </div>
                      <div>
                        <p className="font-medium text-[#5f4a38]">{property.name}</p>
                        <p className="text-xs text-[#9a7d5e]">ID: {property.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-[#7d6349]">
                      <MapPin className="w-4 h-4 text-[#9a7d5e]" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => toggleFeatured(property.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        property.featured 
                          ? 'bg-[#fb923c] text-white' 
                          : 'bg-[#faf3e6] text-[#9a7d5e] hover:bg-[#f5e6cc]'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${property.featured ? 'fill-current' : ''}`} />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => toggleActive(property.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        property.active 
                          ? 'bg-[#14b8a6]/10 text-[#0f766e]' 
                          : 'bg-[#9a7d5e]/10 text-[#7d6349]'
                      }`}
                    >
                      {property.active ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Hidden
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {property.airbnbUrl ? (
                      <a
                        href={property.airbnbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#FF5A5F]/10 text-[#FF5A5F] hover:bg-[#FF5A5F]/20 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </a>
                    ) : (
                      <span className="text-xs text-[#9a7d5e]">Not linked</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/properties/${property.id}`}
                        className="p-2 text-[#7d6349] hover:text-[#0d9488] hover:bg-[#faf3e6] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/properties/${property.name.toLowerCase().replace(/\s+/g, '-')}`}
                        target="_blank"
                        className="p-2 text-[#7d6349] hover:text-[#0d9488] hover:bg-[#faf3e6] rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-[#7d6349] hover:text-red-500 hover:bg-[#faf3e6] rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#9a7d5e]">No properties found</p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="admin-card bg-[#f0fdfb] border-[#14b8a6]/20">
        <h3 className="font-medium text-[#0f766e] mb-2">Tips</h3>
        <ul className="text-sm text-[#115e59] space-y-1">
          <li>• Click the star to feature a property on the homepage</li>
          <li>• Toggle status to show/hide properties from the website</li>
          <li>• Link Airbnb URLs to enable direct booking buttons</li>
          <li>• Set up iCal sync in the Calendar section</li>
        </ul>
      </div>
    </div>
  );
}
