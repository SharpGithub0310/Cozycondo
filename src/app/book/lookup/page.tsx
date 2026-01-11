'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Home,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  CreditCard,
  MapPin,
} from 'lucide-react';

interface BookingData {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  numGuests: number;
  numNights: number;
  nightlyRate: number;
  subtotal: number;
  cleaningFee: number;
  parkingFee: number;
  adminFee: number;
  totalAmount: number;
  currency: string;
  status: string;
  source: string;
  specialRequests?: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending Payment',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    icon: <Clock className="w-5 h-5 text-amber-500" />,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-[#0f766e]',
    bgColor: 'bg-[#f0fdfb]',
    icon: <CheckCircle className="w-5 h-5 text-[#14b8a6]" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: <XCircle className="w-5 h-5 text-red-500" />,
  },
  completed: {
    label: 'Completed',
    color: 'text-[#0f766e]',
    bgColor: 'bg-[#f0fdfb]',
    icon: <CheckCircle className="w-5 h-5 text-[#14b8a6]" />,
  },
};

export default function BookingLookupPage() {
  const [bookingNumber, setBookingNumber] = useState('');
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingNumber.trim()) {
      setError('Please enter a booking number');
      return;
    }

    setLoading(true);
    setError(null);
    setBooking(null);
    setSearched(true);

    try {
      const response = await fetch(`/api/bookings?booking_number=${encodeURIComponent(bookingNumber.trim())}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Booking not found');
      }

      setBooking(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find booking');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const status = booking ? statusConfig[booking.status] || statusConfig.pending : null;

  return (
    <div className="min-h-screen bg-[#fefdfb]">
      {/* Header */}
      <header className="bg-white border-b border-[#e8d4a8]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-heading text-2xl text-[#5f4a38]">
              Cozy Condo
            </Link>
            <Link
              href="/"
              className="text-[#14b8a6] hover:text-[#0d9488] transition-colors text-sm font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl text-[#5f4a38] mb-2">Look Up Your Booking</h1>
          <p className="text-[#7d6349]">
            Enter your booking number to view your reservation details.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl border border-[#e8d4a8] shadow-sm p-6 md:p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#5f4a38] mb-2">
                Booking Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={bookingNumber}
                  onChange={(e) => setBookingNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., CC-20240115-ABC"
                  className="w-full px-4 py-3 pl-11 rounded-xl border border-[#e8d4a8] bg-[#faf3e6]/50 text-[#5f4a38] focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent transition-all uppercase"
                />
                <Search className="w-5 h-5 text-[#7d6349] absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm text-[#7d6349] mt-2">
                You can find your booking number in your confirmation email.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white rounded-xl font-semibold hover:from-[#0d9488] hover:to-[#0f766e] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Find Booking
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && searched && (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-6 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">Booking Not Found</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Result */}
        {booking && (
          <div className="bg-white rounded-2xl border border-[#e8d4a8] shadow-sm overflow-hidden">
            {/* Status Header */}
            <div className={`p-4 ${status?.bgColor}`}>
              <div className="flex items-center gap-3">
                {status?.icon}
                <div>
                  <p className={`font-medium ${status?.color}`}>{status?.label}</p>
                  <p className="text-sm text-[#7d6349]">Booking #{booking.bookingNumber}</p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="p-6 md:p-8">
              {/* Property */}
              <div className="mb-6 pb-6 border-b border-[#e8d4a8]">
                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#7d6349]">Property</p>
                    <p className="font-medium text-[#5f4a38]">{booking.propertyName}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-[#e8d4a8]">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#7d6349]">Check-in</p>
                    <p className="font-medium text-[#5f4a38]">{formatDate(booking.checkIn)}</p>
                    <p className="text-xs text-[#7d6349]">From 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#7d6349]">Check-out</p>
                    <p className="font-medium text-[#5f4a38]">{formatDate(booking.checkOut)}</p>
                    <p className="text-xs text-[#7d6349]">By 12:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Guest Info */}
              <div className="grid sm:grid-cols-2 gap-6 mb-6 pb-6 border-b border-[#e8d4a8]">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#7d6349]">Guest</p>
                    <p className="font-medium text-[#5f4a38]">{booking.guestName}</p>
                    <p className="text-xs text-[#7d6349]">{booking.guestEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-[#7d6349]">Number of Guests</p>
                    <p className="font-medium text-[#5f4a38]">{booking.numGuests}</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-[#7d6349] uppercase tracking-wide mb-4">
                  Price Breakdown
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#7d6349]">
                      {booking.currency} {booking.nightlyRate?.toLocaleString()} x {booking.numNights} {booking.numNights === 1 ? 'night' : 'nights'}
                    </span>
                    <span className="text-[#5f4a38]">{booking.currency} {booking.subtotal?.toLocaleString()}</span>
                  </div>
                  {booking.cleaningFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#7d6349]">Cleaning fee</span>
                      <span className="text-[#5f4a38]">{booking.currency} {booking.cleaningFee?.toLocaleString()}</span>
                    </div>
                  )}
                  {booking.parkingFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#7d6349]">Parking fee</span>
                      <span className="text-[#5f4a38]">{booking.currency} {booking.parkingFee?.toLocaleString()}</span>
                    </div>
                  )}
                  {booking.adminFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#7d6349]">Admin fee</span>
                      <span className="text-[#5f4a38]">{booking.currency} {booking.adminFee?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-[#5f4a38] pt-2 border-t border-[#e8d4a8]">
                    <span>Total</span>
                    <span>{booking.currency} {booking.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {booking.specialRequests && (
                <div className="bg-[#faf3e6] rounded-xl p-4">
                  <p className="text-sm text-[#7d6349] mb-1">Special Requests</p>
                  <p className="text-[#5f4a38]">{booking.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {booking.status === 'pending' && (
              <div className="border-t border-[#e8d4a8] p-6 bg-amber-50">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  <p className="text-amber-700 font-medium">Payment Required</p>
                </div>
                <p className="text-sm text-amber-600 mb-4">
                  Your booking is pending payment. Please complete the payment to confirm your reservation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-[#7d6349] mb-4">Can&apos;t find your booking?</p>
          <p className="text-sm text-[#7d6349]">
            Make sure you are entering the correct booking number from your confirmation email.
            If you are still having trouble, please{' '}
            <Link href="/contact" className="text-[#14b8a6] hover:text-[#0d9488] underline">
              contact us
            </Link>{' '}
            for assistance.
          </p>
        </div>
      </main>
    </div>
  );
}
