'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Home,
  Calendar,
  Moon,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  Clock,
  DollarSign,
  ExternalLink
} from 'lucide-react';

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
function StatusBadge({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' | 'lg' }) {
  const config = statusConfig[status] || statusConfig.pending;
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.color} ${sizeClasses[size]}`}>
      {config.label}
    </span>
  );
}

// Section Card Component
function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="admin-card group hover:shadow-lg transition-all duration-300">
      <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#faf3e6] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#0d9488]" />
        </div>
        {title}
      </h3>
      {children}
    </div>
  );
}

// Info Row Component
function InfoRow({ label, value, className = '' }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-start justify-between py-2 border-b border-[#faf3e6] last:border-0 ${className}`}>
      <span className="text-sm text-[#9a7d5e]">{label}</span>
      <span className="text-sm font-medium text-[#5f4a38] text-right">{value}</span>
    </div>
  );
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [notesModified, setNotesModified] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // Load booking data
  const loadBooking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/bookings/${params.id}`, {
        headers: {
          'x-admin-session': 'authenticated',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(`Failed to load booking`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to load booking');
      }

      setBooking(result.data);
      setInternalNotes(result.data.internalNotes || '');
    } catch (err: any) {
      console.error('Error loading booking:', err);
      setError(err.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  // Update booking status
  const updateStatus = useCallback(async (newStatus: string, extraData?: any) => {
    if (updating) return;

    try {
      setUpdating(true);

      const body: any = { status: newStatus };
      if (extraData) {
        Object.assign(body, extraData);
      }

      const response = await fetch(`/api/bookings/${params.id}`, {
        method: 'PUT',
        headers: {
          'x-admin-session': 'authenticated',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update booking');
      }

      setBooking(result.data);
    } catch (err: any) {
      console.error('Error updating booking:', err);
      setError(err.message || 'Failed to update booking');
    } finally {
      setUpdating(false);
    }
  }, [params.id, updating]);

  // Handle confirm
  const handleConfirm = () => {
    updateStatus('confirmed');
  };

  // Handle cancel
  const handleCancel = () => {
    const reason = window.prompt('Please provide a reason for cancellation:');
    if (reason === null) return;

    updateStatus('cancelled', { cancellationReason: reason || 'Cancelled by admin' });
  };

  // Handle check-in
  const handleCheckIn = () => {
    updateStatus('checked_in');
  };

  // Handle check-out
  const handleCheckOut = () => {
    updateStatus('checked_out');
  };

  // Save internal notes
  const saveNotes = async () => {
    if (savingNotes) return;

    try {
      setSavingNotes(true);

      const response = await fetch(`/api/bookings/${params.id}`, {
        method: 'PUT',
        headers: {
          'x-admin-session': 'authenticated',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ internalNotes })
      });

      if (!response.ok) {
        throw new Error('Failed to save notes');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save notes');
      }

      setBooking(result.data);
      setNotesModified(false);
    } catch (err: any) {
      console.error('Error saving notes:', err);
      setError(err.message || 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  // Format helpers
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#14b8a6] flex items-center justify-center animate-pulse">
            <span className="text-white font-display text-xl font-bold">CC</span>
          </div>
          <p className="text-[#7d6349]">Loading booking...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !booking) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-[#5f4a38] mb-2">Error</h1>
        <p className="text-[#7d6349] mb-4">{error}</p>
        <button
          onClick={() => router.push('/admin/bookings')}
          className="text-[#0d9488] hover:underline"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  // Not found state
  if (!booking) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-[#5f4a38]">Booking not found</h1>
        <button
          onClick={() => router.push('/admin/bookings')}
          className="mt-4 text-[#0d9488] hover:underline"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Error Alert */}
      {error && (
        <div className="admin-card bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#faf3e6] to-[#f4ead5] p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#14b8a6]/10 rounded-full blur-3xl"></div>
        <div className="relative">
          {/* Back Button */}
          <button
            onClick={() => router.push('/admin/bookings')}
            className="inline-flex items-center gap-2 text-[#7d6349] hover:text-[#5f4a38] transition-all duration-200 hover:-translate-x-1 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bookings
          </button>

          {/* Booking Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-[#5f4a38]">
                  {booking.bookingNumber}
                </h1>
                <StatusBadge status={booking.status} size="lg" />
              </div>
              <p className="text-[#7d6349]">
                Created {formatDateTime(booking.createdAt)}
              </p>
              {booking.source && (
                <p className="text-sm text-[#9a7d5e] mt-1">
                  Source: {booking.source}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {(booking.status === 'pending' || booking.status === 'paid') && (
                <button
                  onClick={handleConfirm}
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm
                </button>
              )}
              {booking.status === 'confirmed' && (
                <button
                  onClick={handleCheckIn}
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  <LogIn className="w-4 h-4" />
                  Check In
                </button>
              )}
              {booking.status === 'checked_in' && (
                <button
                  onClick={handleCheckOut}
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  Check Out
                </button>
              )}
              {booking.status !== 'cancelled' && booking.status !== 'checked_out' && booking.status !== 'refunded' && (
                <button
                  onClick={handleCancel}
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 hover:border-red-300 rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Information */}
          <SectionCard title="Guest Information" icon={User}>
            <div className="space-y-1">
              <InfoRow label="Name" value={booking.guestName} />
              <InfoRow
                label="Email"
                value={
                  <a href={`mailto:${booking.guestEmail}`} className="text-[#0d9488] hover:underline">
                    {booking.guestEmail}
                  </a>
                }
              />
              {booking.guestPhone && (
                <InfoRow
                  label="Phone"
                  value={
                    <a href={`tel:${booking.guestPhone}`} className="text-[#0d9488] hover:underline">
                      {booking.guestPhone}
                    </a>
                  }
                />
              )}
              <InfoRow label="Guests" value={`${booking.numGuests} guest${booking.numGuests > 1 ? 's' : ''}`} />
            </div>
          </SectionCard>

          {/* Property Information */}
          <SectionCard title="Property" icon={Home}>
            <div className="space-y-1">
              <InfoRow
                label="Property"
                value={
                  <Link
                    href={`/admin/properties/${booking.propertyId}`}
                    className="text-[#0d9488] hover:underline inline-flex items-center gap-1"
                  >
                    {booking.propertyName}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                }
              />
            </div>
          </SectionCard>

          {/* Dates */}
          <SectionCard title="Dates" icon={Calendar}>
            <div className="space-y-1">
              <InfoRow label="Check-in" value={formatDate(booking.checkIn)} />
              <InfoRow label="Check-out" value={formatDate(booking.checkOut)} />
              <InfoRow
                label="Duration"
                value={
                  <span className="inline-flex items-center gap-1">
                    <Moon className="w-4 h-4 text-[#9a7d5e]" />
                    {booking.numNights} night{booking.numNights > 1 ? 's' : ''}
                  </span>
                }
              />
            </div>
          </SectionCard>

          {/* Pricing Breakdown */}
          <SectionCard title="Pricing" icon={DollarSign}>
            <div className="space-y-1">
              <InfoRow
                label={`Nightly Rate x ${booking.numNights} nights`}
                value={formatCurrency(booking.subtotal)}
              />
              {booking.cleaningFee > 0 && (
                <InfoRow label="Cleaning Fee" value={formatCurrency(booking.cleaningFee)} />
              )}
              {booking.parkingFee > 0 && (
                <InfoRow label="Parking Fee" value={formatCurrency(booking.parkingFee)} />
              )}
              {booking.adminFee > 0 && (
                <InfoRow label="Service Fee" value={formatCurrency(booking.adminFee)} />
              )}
              <div className="pt-3 mt-3 border-t-2 border-[#faf3e6]">
                <InfoRow
                  label="Total Amount"
                  value={
                    <span className="text-lg font-bold text-[#5f4a38]">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  }
                  className="border-0"
                />
              </div>
            </div>
          </SectionCard>

          {/* Special Requests */}
          {booking.specialRequests && (
            <SectionCard title="Special Requests" icon={FileText}>
              <p className="text-[#7d6349] whitespace-pre-wrap">{booking.specialRequests}</p>
            </SectionCard>
          )}

          {/* Cancellation Info */}
          {booking.status === 'cancelled' && (
            <SectionCard title="Cancellation Details" icon={XCircle}>
              <div className="space-y-1">
                {booking.cancelledAt && (
                  <InfoRow label="Cancelled At" value={formatDateTime(booking.cancelledAt)} />
                )}
                {booking.cancellationReason && (
                  <InfoRow label="Reason" value={booking.cancellationReason} />
                )}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Payment Information */}
          <SectionCard title="Payment" icon={CreditCard}>
            <div className="space-y-1">
              <InfoRow label="Amount" value={formatCurrency(booking.totalAmount)} />
              <InfoRow label="Currency" value={booking.currency} />
              <InfoRow
                label="Status"
                value={<StatusBadge status={booking.status} size="sm" />}
              />
            </div>
          </SectionCard>

          {/* Timeline */}
          <SectionCard title="Timeline" icon={Clock}>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-[#0d9488]"></div>
                <div>
                  <p className="text-sm font-medium text-[#5f4a38]">Booking Created</p>
                  <p className="text-xs text-[#9a7d5e]">{formatDateTime(booking.createdAt)}</p>
                </div>
              </div>
              {booking.confirmedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-sm font-medium text-[#5f4a38]">Confirmed</p>
                    <p className="text-xs text-[#9a7d5e]">{formatDateTime(booking.confirmedAt)}</p>
                  </div>
                </div>
              )}
              {booking.cancelledAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-red-500"></div>
                  <div>
                    <p className="text-sm font-medium text-[#5f4a38]">Cancelled</p>
                    <p className="text-xs text-[#9a7d5e]">{formatDateTime(booking.cancelledAt)}</p>
                  </div>
                </div>
              )}
              {booking.updatedAt !== booking.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-gray-400"></div>
                  <div>
                    <p className="text-sm font-medium text-[#5f4a38]">Last Updated</p>
                    <p className="text-xs text-[#9a7d5e]">{formatDateTime(booking.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Internal Notes */}
          <div className="admin-card">
            <h3 className="font-display text-lg font-semibold text-[#5f4a38] mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#faf3e6] flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#0d9488]" />
              </div>
              Internal Notes
            </h3>
            <p className="text-xs text-[#9a7d5e] mb-3">
              These notes are only visible to admins
            </p>
            <textarea
              value={internalNotes}
              onChange={(e) => {
                setInternalNotes(e.target.value);
                setNotesModified(true);
              }}
              placeholder="Add internal notes about this booking..."
              rows={4}
              className="form-input w-full resize-none"
            />
            {notesModified && (
              <button
                onClick={saveNotes}
                disabled={savingNotes}
                className="mt-3 w-full px-4 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
