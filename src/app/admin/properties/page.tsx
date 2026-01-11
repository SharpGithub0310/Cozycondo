'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { PropertyData } from '@/lib/types';

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Simplified property row component for desktop - removed memo for mobile performance
interface PropertyRowProps {
  property: any;
  onToggleFeatured: (id: string) => void;
  onToggleActive: (id: string) => void;
  isUpdating: boolean;
}

const PropertyRow = ({ property, onToggleFeatured, onToggleActive, isUpdating }: PropertyRowProps) => {
  return (
    <tr className="hover:bg-[#fefdfb] transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#d4b896] to-[#b89b7a] flex items-center justify-center flex-shrink-0">
            <span className="font-display text-white font-bold text-sm">CC</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[#5f4a38] truncate">{property.name}</p>
            {property.customReference && (
              <p className="text-xs text-[#9a7d5e] truncate">ID: {property.customReference}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1 text-[#7d6349]">
          <MapPin className="w-4 h-4 text-[#9a7d5e] flex-shrink-0" />
          <span className="text-sm truncate">{property.location}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <button
          onClick={() => onToggleFeatured(property.id)}
          disabled={isUpdating}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] ${
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
          onClick={() => onToggleActive(property.id)}
          disabled={isUpdating}
          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50 min-h-[32px] ${
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
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/properties/${property.id}`}
            className="p-2 text-[#7d6349] hover:text-[#0d9488] hover:bg-[#faf3e6] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Edit property"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <Link
            href={`/properties/${property.name.toLowerCase().replace(/\s+/g, '-')}`}
            target="_blank"
            className="p-2 text-[#7d6349] hover:text-[#0d9488] hover:bg-[#faf3e6] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="View property"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            className="p-2 text-[#7d6349] hover:text-red-500 hover:bg-[#faf3e6] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Delete property"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Simplified property card component for mobile - removed memo for better mobile performance
interface PropertyCardProps {
  property: any;
  onToggleFeatured: (id: string) => void;
  onToggleActive: (id: string) => void;
  isUpdating: boolean;
}

const PropertyCard = ({ property, onToggleFeatured, onToggleActive, isUpdating }: PropertyCardProps) => {
  return (
    <div className="admin-card hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#d4b896] to-[#b89b7a] flex items-center justify-center flex-shrink-0">
            <span className="font-display text-white font-bold text-sm">CC</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-[#5f4a38] truncate">{property.name}</h3>
            {property.customReference && (
              <p className="text-xs text-[#9a7d5e] truncate">ID: {property.customReference}</p>
            )}
          </div>
        </div>

        {/* Featured toggle */}
        <button
          onClick={() => onToggleFeatured(property.id)}
          disabled={isUpdating}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex-shrink-0 ${
            property.featured
              ? 'bg-[#fb923c] text-white'
              : 'bg-[#faf3e6] text-[#9a7d5e]'
          }`}
          title={property.featured ? 'Remove from featured' : 'Mark as featured'}
        >
          <Star className={`w-4 h-4 ${property.featured ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-[#9a7d5e] flex-shrink-0" />
        <span className="text-sm text-[#7d6349] truncate">{property.location}</span>
      </div>

      {/* Status and Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Status toggle */}
        <button
          onClick={() => onToggleActive(property.id)}
          disabled={isUpdating}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
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

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/properties/${property.id}`}
            className="p-2 text-[#7d6349] hover:text-[#0d9488] hover:bg-[#faf3e6] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Edit property"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <Link
            href={`/properties/${property.name.toLowerCase().replace(/\s+/g, '-')}`}
            target="_blank"
            className="p-2 text-[#7d6349] hover:text-[#0d9488] hover:bg-[#faf3e6] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="View property"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            className="p-2 text-[#7d6349] hover:text-red-500 hover:bg-[#faf3e6] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Delete property"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Removed displayName assignments (not needed without memo)

// Simplified loading skeleton - removed memo for mobile performance
const LoadingSkeleton = () => (
  <>
    {Array.from({ length: 5 }, (_, i) => (
      <tr key={`loading-${i}`} className="animate-pulse">
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
            <div className="min-w-0 flex-1">
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
        <td className="px-4 py-4">
          <div className="flex items-center justify-end gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

const LoadingCards = () => (
  <>
    {Array.from({ length: 5 }, (_, i) => (
      <div key={`loading-card-${i}`} className="admin-card animate-pulse">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-lg bg-gray-200"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    ))}
  </>
);

// Removed displayName assignments (not needed without memo)

// Pagination constants - mobile optimization
const PROPERTIES_PER_PAGE_DESKTOP = 10;
const PROPERTIES_PER_PAGE_MOBILE = 5;

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingProperty, setUpdatingProperty] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Mobile performance optimization - detect mobile browsers
  // Use undefined initially to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Set mobile state after component mounts to avoid hydration mismatch
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());

    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const loadProperties = useCallback(async (skipLoading = false) => {
    try {
      if (!skipLoading) {
        setLoading(true);
      }
      setError(null);

      // Call API endpoint directly with admin authentication
      const response = await fetch('/api/properties', {
        headers: {
          'x-admin-session': 'authenticated',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to load properties');
      }

      const dbProperties = result.data;
      console.log('Admin: Loaded properties from API:', dbProperties);

      // Convert to admin format - optimized for mobile
      const propertiesArray = Object.values(dbProperties).map((property: any) => ({
        id: property.id,
        name: property.name || property.title,
        location: property.location || '',
        featured: property.featured ?? false,
        active: property.active ?? true,
        airbnbUrl: property.airbnbUrl || '',
        customReference: property.customReference || '',
        // Only store essential data, not heavy image arrays
        imageCount: Array.isArray(property.images) ? property.images.length : 0
      }));

      setProperties(propertiesArray);
      setLastRefresh(Date.now());
    } catch (err) {
      console.error('Admin: Error loading properties:', err);
      setError('Failed to load properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Separate effect for visibility change handler to avoid dependency issues
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeSinceLastRefresh = Date.now() - lastRefresh;
        if (timeSinceLastRefresh > 5 * 60 * 1000) { // 5 minutes
          loadProperties(true); // Skip loading state for background refresh
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Simplified filtering for mobile performance - removed heavy useMemo
  const filteredProperties = (() => {
    if (!debouncedSearchQuery) return properties;

    const query = debouncedSearchQuery.toLowerCase();
    return properties.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query)
    );
  })();

  // Pagination calculations - mobile optimization
  // Use desktop pagination as default when mobile state is unknown to avoid hydration issues
  const propertiesPerPage = isMobile === true ? PROPERTIES_PER_PAGE_MOBILE : PROPERTIES_PER_PAGE_DESKTOP;
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  // Simplified pagination - removed useMemo for mobile performance
  const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Simplified stats calculation - removed useMemo for mobile performance
  const stats = {
    total: properties.length,
    active: properties.filter(p => p.active).length,
    featured: properties.filter(p => p.featured).length,
    inactive: properties.filter(p => !p.active).length
  };

  const toggleFeatured = useCallback(async (id: string) => {
    const property = properties.find(p => p.id === id);
    if (!property || updatingProperty === id) return;

    const newFeaturedStatus = !property.featured;

    try {
      setUpdatingProperty(id);

      // Optimistic update - update UI immediately
      setProperties(prev => prev.map(p =>
        p.id === id ? { ...p, featured: newFeaturedStatus } : p
      ));

      // Update via API
      const updateResponse = await fetch('/api/properties', {
        method: 'PUT',
        headers: {
          'x-admin-session': 'authenticated',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          updates: { featured: newFeaturedStatus }
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update property status');
      }

      console.log(`Admin: Updated property ${id} featured status to ${newFeaturedStatus}`);
    } catch (err) {
      console.error('Admin: Error updating featured status:', err);

      // Revert optimistic update on error
      setProperties(prev => prev.map(p =>
        p.id === id ? { ...p, featured: property.featured } : p
      ));

      setError('Failed to update property status. Please try again.');
    } finally {
      setUpdatingProperty(null);
    }
  }, [properties, updatingProperty]);

  const toggleActive = useCallback(async (id: string) => {
    const property = properties.find(p => p.id === id);
    if (!property || updatingProperty === id) return;

    const newActiveStatus = !property.active;

    try {
      setUpdatingProperty(id);

      // Optimistic update - update UI immediately
      setProperties(prev => prev.map(p =>
        p.id === id ? { ...p, active: newActiveStatus } : p
      ));

      // Update via API
      const updateResponse = await fetch('/api/properties', {
        method: 'PUT',
        headers: {
          'x-admin-session': 'authenticated',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          updates: { active: newActiveStatus }
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update property status');
      }

      console.log(`Admin: Updated property ${id} active status to ${newActiveStatus}`);
    } catch (err) {
      console.error('Admin: Error updating active status:', err);

      // Revert optimistic update on error
      setProperties(prev => prev.map(p =>
        p.id === id ? { ...p, active: property.active } : p
      ));

      setError('Failed to update property status. Please try again.');
    } finally {
      setUpdatingProperty(null);
    }
  }, [properties, updatingProperty]);

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
              onClick={() => loadProperties()}
              className="btn-primary text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Total Properties</p>
          <p className="font-display text-2xl font-semibold text-[#5f4a38]">
            {loading ? '...' : stats.total}
          </p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Active</p>
          <p className="font-display text-2xl font-semibold text-[#14b8a6]">
            {loading ? '...' : stats.active}
          </p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Featured</p>
          <p className="font-display text-2xl font-semibold text-[#fb923c]">
            {loading ? '...' : stats.featured}
          </p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Inactive</p>
          <p className="font-display text-2xl font-semibold text-[#9a7d5e]">
            {loading ? '...' : stats.inactive}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="admin-card">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9a7d5e]" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 w-full"
            />
          </div>
          {filteredProperties.length > 0 && (
            <div className="text-sm text-[#9a7d5e] text-center sm:text-left">
              Showing {paginatedProperties.length} of {filteredProperties.length} properties
            </div>
          )}
        </div>
      </div>

      {/* Properties List - Desktop Table */}
      <div className="hidden md:block admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#faf3e6]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7d6349]">Property</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7d6349]">Location</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[#7d6349]">Featured</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-[#7d6349]">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-[#7d6349]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#faf3e6]">
              {loading ? (
                <LoadingSkeleton />
              ) : (
                paginatedProperties.map((property) => (
                  <PropertyRow
                    key={property.id}
                    property={property}
                    onToggleFeatured={toggleFeatured}
                    onToggleActive={toggleActive}
                    isUpdating={updatingProperty === property.id}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#9a7d5e]">
              {searchQuery ? 'No properties match your search' : 'No properties found'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#0d9488] hover:underline text-sm mt-2 min-h-[44px] px-4"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Properties List - Mobile Cards */}
      <div className="block md:hidden space-y-4">
        {loading ? (
          <LoadingCards />
        ) : (
          paginatedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onToggleFeatured={toggleFeatured}
              onToggleActive={toggleActive}
              isUpdating={updatingProperty === property.id}
            />
          ))
        )}

        {!loading && filteredProperties.length === 0 && (
          <div className="admin-card text-center py-8">
            <p className="text-[#9a7d5e] mb-4">
              {searchQuery ? 'No properties match your search' : 'No properties found'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="btn-primary text-sm min-h-[44px]"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="admin-card">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[#9a7d5e] order-2 sm:order-1">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-[#faf3e6] text-[#7d6349] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#faf3e6] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers - Simplified for mobile */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors min-w-[44px] min-h-[44px] ${
                        currentPage === pageNum
                          ? 'bg-[#0d9488] text-white'
                          : 'text-[#7d6349] hover:bg-[#faf3e6]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Mobile page indicator */}
              <div className="sm:hidden px-3 py-2 text-sm text-[#7d6349] bg-[#faf3e6] rounded-lg">
                {currentPage} / {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-[#faf3e6] text-[#7d6349] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#faf3e6] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="admin-card bg-[#f0fdfb] border-[#14b8a6]/20">
        <h3 className="font-medium text-[#0f766e] mb-2">Tips</h3>
        <ul className="text-sm text-[#115e59] space-y-1">
          <li>• Click the star to feature a property on the homepage</li>
          <li>• Toggle status to show/hide properties from the website</li>
          <li>• Upload property images to showcase amenities</li>
          <li>• Set featured photo to display as the main image</li>
        </ul>
      </div>
    </div>
  );
}
