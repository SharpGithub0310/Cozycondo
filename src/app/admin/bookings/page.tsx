'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  DollarSign
} from 'lucide-react';

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

// Booking status configuration
const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  pending: { color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: 'Pending' },
  paid: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Paid' },
  confirmed: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Confirmed' },
  checked_in: { color: 'text-teal-700', bgColor: 'bg-teal-100', label: 'Checked In' },
  checked_out: { color: 'text-gray-700', bgColor: 'bg-gray-100', label: 'Checked Out' },
  cancelled: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'Cancelled' },
  refunded: { color: 'text-purple-700', bgColor: 'bg-purple-100', label: 'Refunded' },
};

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
      {config.label}
    </span>
  );
}

// Booking Row Component for Desktop Table
interface BookingRowProps {
  booking: any;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  isUpdating: boolean;
}

const BookingRow = ({ booking, onConfirm, onCancel, isUpdating }: BookingRowProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <tr className="hover:bg-[#fefdfb] transition-colors">
      <td className="px-4 py-4">
        <Link
          href={`/admin/bookings/${booking.id}`}
          className="font-medium text-[#5f4a38] hover:text-[#0d9488] transition-colors"
        >
          {booking.bookingNumber}
        </Link>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-[#9a7d5e] flex-shrink-0" />
          <span className="text-sm text-[#7d6349] truncate max-w-[150px]">{booking.propertyName}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#9a7d5e] flex-shrink-0" />
          <span className="text-sm text-[#7d6349] truncate max-w-[120px]">{booking.guestName}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-[#7d6349]">{formatDate(booking.checkIn)}</span>
      </td>
      <td className="px-4 py-4">
        <span className="text-sm text-[#7d6349]">{formatDate(booking.checkOut)}</span>
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={booking.status} />
      </td>
      <td className="px-4 py-4">
        <span className="text-sm font-medium text-[#5f4a38]">{formatCurrency(booking.totalAmount)}</span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/bookings/${booking.id}`}
            className="p-2 text-[#7d6349] hover:text-[#0d9488] hover:bg-[#faf3e6] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="View booking"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {(booking.status === 'pending' || booking.status === 'paid') && (
            <button
              onClick={() => onConfirm(booking.id)}
              disabled={isUpdating}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50"
              title="Confirm booking"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {booking.status !== 'cancelled' && booking.status !== 'checked_out' && (
            <button
              onClick={() => onCancel(booking.id)}
              disabled={isUpdating}
              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50"
              title="Cancel booking"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

// Booking Card Component for Mobile
interface BookingCardProps {
  booking: any;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  isUpdating: boolean;
}

const BookingCard = ({ booking, onConfirm, onCancel, isUpdating }: BookingCardProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="admin-card hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <Link
            href={`/admin/bookings/${booking.id}`}
            className="font-medium text-[#5f4a38] hover:text-[#0d9488] transition-colors"
          >
            {booking.bookingNumber}
          </Link>
          <p className="text-xs text-[#9a7d5e] mt-0.5">{booking.source || 'website'}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Property & Guest */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-[#9a7d5e] flex-shrink-0" />
          <span className="text-sm text-[#7d6349] truncate">{booking.propertyName}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#9a7d5e] flex-shrink-0" />
          <span className="text-sm text-[#7d6349] truncate">{booking.guestName}</span>
        </div>
      </div>

      {/* Dates & Amount */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#9a7d5e] flex-shrink-0" />
          <span className="text-sm text-[#7d6349]">
            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-[#9a7d5e]" />
          <span className="text-sm font-medium text-[#5f4a38]">{formatCurrency(booking.totalAmount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#faf3e6]">
        <Link
          href={`/admin/bookings/${booking.id}`}
          className="p-2 text-[#7d6349] hover:text-[#0d9488] hover:bg-[#faf3e6] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          title="View booking"
        >
          <Eye className="w-4 h-4" />
        </Link>
        {(booking.status === 'pending' || booking.status === 'paid') && (
          <button
            onClick={() => onConfirm(booking.id)}
            disabled={isUpdating}
            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50"
            title="Confirm booking"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        )}
        {booking.status !== 'cancelled' && booking.status !== 'checked_out' && (
          <button
            onClick={() => onCancel(booking.id)}
            disabled={isUpdating}
            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-50"
            title="Cancel booking"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Loading Skeleton for Desktop Table
const LoadingSkeleton = () => (
  <>
    {Array.from({ length: 5 }, (_, i) => (
      <tr key={`loading-${i}`} className="animate-pulse">
        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
        <td className="px-4 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
        <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
        <td className="px-4 py-4">
          <div className="flex items-center justify-end gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

// Loading Cards for Mobile
const LoadingCards = () => (
  <>
    {Array.from({ length: 5 }, (_, i) => (
      <div key={`loading-card-${i}`} className="admin-card animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-28"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    ))}
  </>
);

// Pagination constants
const BOOKINGS_PER_PAGE_DESKTOP = 10;
const BOOKINGS_PER_PAGE_MOBILE = 5;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Mobile detection
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());

    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load properties for filter dropdown
  const loadProperties = useCallback(async () => {
    try {
      const response = await fetch('/api/properties', {
        headers: {
          'x-admin-session': 'authenticated',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const propertiesData = Object.values(result.data).map((p: any) => ({
            id: p.id,
            name: p.name || p.title,
          }));
          setProperties(propertiesData);
        }
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
    }
  }, []);

  // Load bookings
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const limit = isMobile === true ? BOOKINGS_PER_PAGE_MOBILE : BOOKINGS_PER_PAGE_DESKTOP;

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (debouncedSearchQuery) {
        params.append('booking_number', debouncedSearchQuery);
      }
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      if (propertyFilter) {
        params.append('property_id', propertyFilter);
      }
      if (startDate) {
        params.append('start_date', startDate);
      }
      if (endDate) {
        params.append('end_date', endDate);
      }

      const response = await fetch(`/api/bookings?${params.toString()}`, {
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
        throw new Error(result.message || 'Failed to load bookings');
      }

      setBookings(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalCount(result.pagination?.total || 0);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchQuery, statusFilter, propertyFilter, startDate, endDate, isMobile]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    if (isMobile !== undefined) {
      loadBookings();
    }
  }, [loadBookings, isMobile]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter, propertyFilter, startDate, endDate]);

  // Handle confirm booking
  const handleConfirm = useCallback(async (id: string) => {
    if (updatingBooking) return;

    try {
      setUpdatingBooking(id);

      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'x-admin-session': 'authenticated',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'confirmed' })
      });

      if (!response.ok) {
        throw new Error('Failed to confirm booking');
      }

      // Optimistic update
      setBookings(prev => prev.map(b =>
        b.id === id ? { ...b, status: 'confirmed' } : b
      ));
    } catch (err) {
      console.error('Error confirming booking:', err);
      setError('Failed to confirm booking. Please try again.');
    } finally {
      setUpdatingBooking(null);
    }
  }, [updatingBooking]);

  // Handle cancel booking
  const handleCancel = useCallback(async (id: string) => {
    if (updatingBooking) return;

    const reason = window.prompt('Please provide a reason for cancellation:');
    if (reason === null) return; // User cancelled the prompt

    try {
      setUpdatingBooking(id);

      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'x-admin-session': 'authenticated',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'cancelled',
          cancellationReason: reason || 'Cancelled by admin'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Optimistic update
      setBookings(prev => prev.map(b =>
        b.id === id ? { ...b, status: 'cancelled' } : b
      ));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setUpdatingBooking(null);
    }
  }, [updatingBooking]);

  // Calculate stats
  const stats = {
    total: totalCount,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed' || b.status === 'paid').length,
    checkedIn: bookings.filter(b => b.status === 'checked_in').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">Bookings</h1>
          <p className="text-[#7d6349] mt-1">Manage guest reservations</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="admin-card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => loadBookings()}
              className="btn-primary text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Total Bookings</p>
          <p className="font-display text-2xl font-semibold text-[#5f4a38]">
            {loading ? '...' : stats.total}
          </p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Pending</p>
          <p className="font-display text-2xl font-semibold text-yellow-600">
            {loading ? '...' : stats.pending}
          </p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Confirmed</p>
          <p className="font-display text-2xl font-semibold text-green-600">
            {loading ? '...' : stats.confirmed}
          </p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-[#9a7d5e]">Checked In</p>
          <p className="font-display text-2xl font-semibold text-teal-600">
            {loading ? '...' : stats.checkedIn}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="admin-card">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9a7d5e]" />
              <input
                type="text"
                placeholder="Search by booking number or guest name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-10 w-full"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors min-h-[44px] ${
                showFilters
                  ? 'bg-[#0d9488] text-white border-[#0d9488]'
                  : 'border-[#faf3e6] text-[#7d6349] hover:bg-[#faf3e6]'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#faf3e6]">
              {/* Status Filter */}
              <div>
                <label className="form-label">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Property Filter */}
              <div>
                <label className="form-label">Property</label>
                <select
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value)}
                  className="form-input"
                >
                  <option value="">All Properties</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* Results Count */}
          {!loading && (
            <div className="text-sm text-[#9a7d5e] text-center sm:text-left">
              Showing {bookings.length} of {totalCount} bookings
            </div>
          )}
        </div>
      </div>

      {/* Bookings List - Desktop Table */}
      <div className="hidden md:block admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#faf3e6]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7d6349]">Booking #</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7d6349]">Property</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7d6349]">Guest</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7d6349]">Check-in</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7d6349]">Check-out</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7d6349]">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[#7d6349]">Amount</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-[#7d6349]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#faf3e6]">
              {loading ? (
                <LoadingSkeleton />
              ) : (
                bookings.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    isUpdating={updatingBooking === booking.id}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#9a7d5e]">
              {searchQuery || statusFilter || propertyFilter || startDate || endDate
                ? 'No bookings match your filters'
                : 'No bookings found'}
            </p>
            {(searchQuery || statusFilter || propertyFilter || startDate || endDate) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setPropertyFilter('');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-[#0d9488] hover:underline text-sm mt-2 min-h-[44px] px-4"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bookings List - Mobile Cards */}
      <div className="block md:hidden space-y-4">
        {loading ? (
          <LoadingCards />
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              isUpdating={updatingBooking === booking.id}
            />
          ))
        )}

        {!loading && bookings.length === 0 && (
          <div className="admin-card text-center py-8">
            <p className="text-[#9a7d5e] mb-4">
              {searchQuery || statusFilter || propertyFilter || startDate || endDate
                ? 'No bookings match your filters'
                : 'No bookings found'}
            </p>
            {(searchQuery || statusFilter || propertyFilter || startDate || endDate) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setPropertyFilter('');
                  setStartDate('');
                  setEndDate('');
                }}
                className="btn-primary text-sm min-h-[44px]"
              >
                Clear filters
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

              {/* Page numbers - Desktop only */}
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
    </div>
  );
}
