'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  Calendar,
  Home,
  Phone,
  Mail,
  Clock,
  AlertCircle,
  Loader2,
  Search,
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
  totalAmount: number;
  currency: string;
  status: string;
}

// Loading fallback for Suspense
function ConfirmationLoading() {
  return (
    <div className="min-h-screen bg-[#fefdfb] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#14b8a6] animate-spin mx-auto mb-4" />
        <p className="text-[#7d6349]">Loading your booking...</p>
      </div>
    </div>
  );
}

// Main page wrapper with Suspense
export default function ConfirmationPage() {
  return (
    <Suspense fallback={<ConfirmationLoading />}>
      <ConfirmationContent />
    </Suspense>
  );
}

// Inner component that uses useSearchParams
function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingNumber = searchParams.get('booking');
  const paymentStatus = searchParams.get('status');

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingNumber) {
      setLoading(false);
      setError('No booking number provided');
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings?booking_number=${encodeURIComponent(bookingNumber)}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Booking not found');
        }

        setBooking(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingNumber]);

  // Format date for display
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isPaymentCancelled = paymentStatus === 'cancelled';
  const isPaymentSuccess = paymentStatus === 'success' || (!paymentStatus && booking?.status === 'confirmed');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fefdfb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#14b8a6] animate-spin mx-auto mb-4" />
          <p className="text-[#7d6349]">Loading your booking...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#fefdfb] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="font-heading text-2xl text-[#5f4a38] mb-2">Booking Not Found</h1>
          <p className="text-[#7d6349] mb-6">
            {error || 'We could not find the booking you are looking for.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/book/lookup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#14b8a6] text-white rounded-xl hover:bg-[#0d9488] transition-colors"
            >
              <Search className="w-5 h-5" />
              Look Up Booking
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#e8d4a8] text-[#5f4a38] rounded-xl hover:bg-[#faf3e6] transition-colors"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fefdfb]">
      {/* Header */}
      <header className="bg-white border-b border-[#e8d4a8]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-heading text-2xl text-[#5f4a38]">
              Cozy Condo
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Status Banner */}
        <div className={`rounded-2xl p-8 mb-8 text-center ${
          isPaymentCancelled
            ? 'bg-amber-50 border border-amber-200'
            : isPaymentSuccess
            ? 'bg-[#f0fdfb] border border-[#14b8a6]/30'
            : 'bg-[#faf3e6] border border-[#e8d4a8]'
        }`}>
          {isPaymentCancelled ? (
            <>
              <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h1 className="font-heading text-3xl text-[#5f4a38] mb-2">Payment Cancelled</h1>
              <p className="text-[#7d6349] mb-4">
                Your payment was not completed. Your booking is still pending.
              </p>
              <p className="text-sm text-amber-600">
                Booking #{booking.bookingNumber}
              </p>
            </>
          ) : isPaymentSuccess ? (
            <>
              <CheckCircle className="w-16 h-16 text-[#14b8a6] mx-auto mb-4" />
              <h1 className="font-heading text-3xl text-[#5f4a38] mb-2">Booking Confirmed!</h1>
              <p className="text-[#7d6349] mb-4">
                Thank you for your booking. We have sent a confirmation email to {booking.guestEmail}.
              </p>
              <p className="text-sm text-[#14b8a6] font-medium">
                Booking #{booking.bookingNumber}
              </p>
            </>
          ) : (
            <>
              <Clock className="w-16 h-16 text-[#7d6349] mx-auto mb-4" />
              <h1 className="font-heading text-3xl text-[#5f4a38] mb-2">Booking Pending</h1>
              <p className="text-[#7d6349] mb-4">
                Your booking is pending payment confirmation.
              </p>
              <p className="text-sm text-[#7d6349]">
                Booking #{booking.bookingNumber}
              </p>
            </>
          )}
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl border border-[#e8d4a8] shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#14b8a6] to-[#0d9488] p-6">
            <h2 className="text-xl font-semibold text-white">Booking Details</h2>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Property Info */}
              <div>
                <h3 className="text-sm font-medium text-[#7d6349] uppercase tracking-wide mb-3">Property</h3>
                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#5f4a38]">{booking.propertyName}</p>
                  </div>
                </div>
              </div>

              {/* Guest Info */}
              <div>
                <h3 className="text-sm font-medium text-[#7d6349] uppercase tracking-wide mb-3">Guest</h3>
                <p className="font-medium text-[#5f4a38]">{booking.guestName}</p>
                <p className="text-sm text-[#7d6349]">{booking.guestEmail}</p>
              </div>

              {/* Check-in */}
              <div>
                <h3 className="text-sm font-medium text-[#7d6349] uppercase tracking-wide mb-3">Check-in</h3>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#5f4a38]">{formatDate(booking.checkIn)}</p>
                    <p className="text-sm text-[#7d6349]">From 2:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Check-out */}
              <div>
                <h3 className="text-sm font-medium text-[#7d6349] uppercase tracking-wide mb-3">Check-out</h3>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#5f4a38]">{formatDate(booking.checkOut)}</p>
                    <p className="text-sm text-[#7d6349]">By 12:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Guests */}
              <div>
                <h3 className="text-sm font-medium text-[#7d6349] uppercase tracking-wide mb-3">Guests</h3>
                <p className="font-medium text-[#5f4a38]">{booking.numGuests} {booking.numGuests === 1 ? 'Guest' : 'Guests'}</p>
              </div>

              {/* Amount */}
              <div>
                <h3 className="text-sm font-medium text-[#7d6349] uppercase tracking-wide mb-3">Total Amount</h3>
                <p className="font-bold text-[#5f4a38] text-lg">
                  {booking.currency} {booking.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        {isPaymentSuccess && (
          <div className="bg-white rounded-2xl border border-[#e8d4a8] shadow-sm overflow-hidden mb-8">
            <div className="p-6 md:p-8">
              <h2 className="font-heading text-xl text-[#5f4a38] mb-6">What&apos;s Next?</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-[#faf3e6] rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#14b8a6] text-white flex items-center justify-center flex-shrink-0 font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-[#5f4a38] mb-1">Check Your Email</h3>
                    <p className="text-sm text-[#7d6349]">
                      We have sent a confirmation email to {booking.guestEmail} with all the details of your booking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-[#faf3e6] rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#14b8a6] text-white flex items-center justify-center flex-shrink-0 font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-[#5f4a38] mb-1">Save Your Booking Number</h3>
                    <p className="text-sm text-[#7d6349]">
                      Keep your booking number <span className="font-mono bg-white px-2 py-0.5 rounded">{booking.bookingNumber}</span> handy for easy reference.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-[#faf3e6] rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#14b8a6] text-white flex items-center justify-center flex-shrink-0 font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-[#5f4a38] mb-1">Prepare for Your Stay</h3>
                    <p className="text-sm text-[#7d6349]">
                      We will send you check-in instructions and property access details closer to your arrival date.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-[#faf3e6] rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#14b8a6] text-white flex items-center justify-center flex-shrink-0 font-semibold">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium text-[#5f4a38] mb-1">Contact Us If Needed</h3>
                    <p className="text-sm text-[#7d6349]">
                      Have questions? Feel free to reach out to us anytime before or during your stay.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Cancelled - Retry */}
        {isPaymentCancelled && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 md:p-8 mb-8">
            <h2 className="font-heading text-xl text-[#5f4a38] mb-4">Complete Your Payment</h2>
            <p className="text-[#7d6349] mb-6">
              Your booking is still saved. You can complete the payment to confirm your reservation.
            </p>
            <p className="text-sm text-amber-600 mb-4">
              Note: This booking will expire if payment is not completed within 24 hours.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/book/lookup"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#e8d4a8] text-[#5f4a38] rounded-xl hover:bg-[#faf3e6] transition-colors"
          >
            <Search className="w-5 h-5" />
            Look Up Another Booking
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#14b8a6] text-white rounded-xl hover:bg-[#0d9488] transition-colors"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-12 text-center">
          <p className="text-[#7d6349] mb-4">Need help with your booking?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+639123456789"
              className="inline-flex items-center justify-center gap-2 text-[#14b8a6] hover:text-[#0d9488] transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call Us
            </a>
            <a
              href="mailto:support@cozycondo.ph"
              className="inline-flex items-center justify-center gap-2 text-[#14b8a6] hover:text-[#0d9488] transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Us
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
