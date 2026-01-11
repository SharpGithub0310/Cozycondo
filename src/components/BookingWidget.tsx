'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Calendar, Users, DollarSign, AlertCircle, CheckCircle, Loader2, MessageCircle, Car } from 'lucide-react';
import DatePicker from './DatePicker';

interface BookingWidgetProps {
  propertySlug: string;
  pricePerNight: number;
  cleaningFee: number;
  parkingFee: number;
  adminFeePercent: number;
  minNights: number;
  maxNights: number;
  maxGuests: number;
}

export default function BookingWidget({
  propertySlug,
  pricePerNight,
  cleaningFee,
  parkingFee,
  adminFeePercent,
  minNights,
  maxNights,
  maxGuests,
}: BookingWidgetProps) {
  // State
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [guests, setGuests] = useState<number>(1);
  const [includeParking, setIncludeParking] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingEnabled, setBookingEnabled] = useState<boolean>(true);
  const [bookingDisabledMessage, setBookingDisabledMessage] = useState<string>('');
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);

  // Check if booking is enabled
  useEffect(() => {
    const checkBookingStatus = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const result = await response.json();
          const settings = result.data;
          // bookingEnabled defaults to true if not set
          setBookingEnabled(settings.bookingEnabled !== false);
          setBookingDisabledMessage(settings.bookingDisabledMessage || 'Online booking is temporarily unavailable. Please contact us directly.');
        }
      } catch (err) {
        console.error('Error checking booking status:', err);
        // Default to enabled if we can't fetch settings
        setBookingEnabled(true);
      } finally {
        setSettingsLoaded(true);
      }
    };
    checkBookingStatus();
  }, []);

  // Calculate number of nights
  const calculateNights = useCallback((): number => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [checkIn, checkOut]);

  const nights = calculateNights();

  // Calculate pricing (parking is optional, charged per night)
  const subtotal = pricePerNight * nights;
  const adminFee = Math.round((subtotal * adminFeePercent) / 100);
  const totalParkingFee = includeParking ? (parkingFee * nights) : 0;
  const total = subtotal + cleaningFee + totalParkingFee + adminFee;

  // Validation
  const isValidDateRange = nights >= minNights && nights <= maxNights;
  const isBookingEnabled = checkIn && checkOut && isValidDateRange && isAvailable === true && !isChecking;

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Get minimum checkout date (checkIn + minNights)
  const getMinCheckoutDate = (): string => {
    if (!checkIn) return today;
    const minDate = new Date(checkIn);
    minDate.setDate(minDate.getDate() + minNights);
    return minDate.toISOString().split('T')[0];
  };

  // Get maximum checkout date (checkIn + maxNights)
  const getMaxCheckoutDate = (): string => {
    if (!checkIn) return '';
    const maxDate = new Date(checkIn);
    maxDate.setDate(maxDate.getDate() + maxNights);
    return maxDate.toISOString().split('T')[0];
  };

  // Check availability when dates change
  useEffect(() => {
    const checkAvailability = async () => {
      if (!checkIn || !checkOut || !isValidDateRange) {
        setIsAvailable(null);
        return;
      }

      setIsChecking(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/bookings/availability?propertySlug=${propertySlug}&checkIn=${checkIn}&checkOut=${checkOut}`
        );

        if (!response.ok) {
          throw new Error('Failed to check availability');
        }

        const data = await response.json();
        setIsAvailable(data.available);

        if (!data.available && data.message) {
          setError(data.message);
        }
      } catch (err) {
        console.error('Error checking availability:', err);
        setError('Unable to check availability. Please try again.');
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    };

    // Debounce the availability check
    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [checkIn, checkOut, propertySlug, isValidDateRange]);

  // Handle check-in date change
  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckIn = e.target.value;
    setCheckIn(newCheckIn);

    // Reset checkout if it's before the new check-in
    if (checkOut && new Date(checkOut) <= new Date(newCheckIn)) {
      setCheckOut('');
    }

    setIsAvailable(null);
    setError(null);
  };

  // Handle check-out date change
  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckOut(e.target.value);
    setIsAvailable(null);
    setError(null);
  };

  // Build booking URL with query parameters
  const bookingUrl = `/book/${propertySlug}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&parking=${includeParking ? '1' : '0'}`;

  // Show loading state while checking booking status
  if (!settingsLoaded) {
    return (
      <div className="bg-white rounded-2xl border border-[#faf3e6] shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#14b8a6] to-[#0d9488] p-4">
          <div className="flex items-baseline gap-1 text-white">
            <span className="text-2xl font-bold">₱{pricePerNight.toLocaleString()}</span>
            <span className="text-white/80">/ night</span>
          </div>
        </div>
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#14b8a6]" />
        </div>
      </div>
    );
  }

  // Show disabled message if booking is turned off
  if (!bookingEnabled) {
    return (
      <div className="bg-white rounded-2xl border border-[#faf3e6] shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-4">
          <div className="flex items-baseline gap-1 text-white">
            <span className="text-2xl font-bold">₱{pricePerNight.toLocaleString()}</span>
            <span className="text-white/80">/ night</span>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Booking Unavailable</p>
              <p className="text-sm text-amber-700 mt-1">{bookingDisabledMessage}</p>
            </div>
          </div>
          <a
            href="https://m.me/cozycondoiloilocity"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#14b8a6] hover:bg-[#0d9488] text-white font-semibold transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Contact Us on Messenger
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#faf3e6] shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#14b8a6] to-[#0d9488] p-4">
        <div className="flex items-baseline gap-1 text-white">
          <span className="text-2xl font-bold">₱{pricePerNight.toLocaleString()}</span>
          <span className="text-white/80">/ night</span>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-4">
        {/* Date Inputs with Calendar showing blocked dates */}
        <div className="grid grid-cols-2 gap-3">
          {/* Check-in */}
          <DatePicker
            propertySlug={propertySlug}
            selectedDate={checkIn}
            onDateSelect={(date) => {
              setCheckIn(date);
              // Reset checkout if it's before the new check-in
              if (checkOut && new Date(checkOut) <= new Date(date)) {
                setCheckOut('');
              }
              setIsAvailable(null);
              setError(null);
            }}
            minDate={today}
            label="Check-in"
          />

          {/* Check-out */}
          <DatePicker
            propertySlug={propertySlug}
            selectedDate={checkOut}
            onDateSelect={(date) => {
              setCheckOut(date);
              setIsAvailable(null);
              setError(null);
            }}
            minDate={getMinCheckoutDate()}
            maxDate={getMaxCheckoutDate()}
            label="Check-out"
            isCheckOut={true}
            checkInDate={checkIn}
          />
        </div>

        {/* Guest Selector */}
        <div>
          <label className="block text-sm font-medium text-[#5f4a38] mb-1.5">
            <Users className="w-4 h-4 inline mr-1.5 text-[#14b8a6]" />
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-lg border border-[#e8d4a8] bg-[#faf3e6]/50 text-[#5f4a38] focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent transition-all text-sm"
          >
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
        </div>

        {/* Parking Option (only show if parking fee is set) */}
        {parkingFee > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-[#e8d4a8] bg-[#faf3e6]/30">
            <input
              type="checkbox"
              id="parking-option"
              checked={includeParking}
              onChange={(e) => setIncludeParking(e.target.checked)}
              className="w-5 h-5 rounded border-[#e8d4a8] text-[#14b8a6] focus:ring-[#14b8a6] cursor-pointer"
            />
            <label htmlFor="parking-option" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 text-sm font-medium text-[#5f4a38]">
                <Car className="w-4 h-4 text-[#14b8a6]" />
                Include Parking
              </div>
              <p className="text-xs text-[#7d6349] mt-0.5">₱{parkingFee.toLocaleString()}/night</p>
            </label>
          </div>
        )}

        {/* Stay Requirements */}
        <div className="text-xs text-[#7d6349] bg-[#faf3e6] rounded-lg p-3">
          <p>Min stay: {minNights} {minNights === 1 ? 'night' : 'nights'} | Max stay: {maxNights} nights</p>
        </div>

        {/* Availability Status */}
        {(isChecking || isAvailable !== null || error) && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            isChecking
              ? 'bg-[#faf3e6] text-[#5f4a38]'
              : isAvailable
                ? 'bg-[#f0fdfb] text-[#0f766e]'
                : 'bg-red-50 text-red-700'
          }`}>
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking availability...</span>
              </>
            ) : isAvailable ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Available for your dates!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>{error || 'Not available for selected dates'}</span>
              </>
            )}
          </div>
        )}

        {/* Nights validation message */}
        {checkIn && checkOut && !isValidDateRange && (
          <div className="flex items-center gap-2 p-3 rounded-lg text-sm bg-amber-50 text-amber-700">
            <AlertCircle className="w-4 h-4" />
            <span>
              {nights < minNights
                ? `Minimum stay is ${minNights} nights`
                : `Maximum stay is ${maxNights} nights`}
            </span>
          </div>
        )}

        {/* Price Breakdown */}
        {nights > 0 && isValidDateRange && (
          <div className="border-t border-[#e8d4a8] pt-4 space-y-2">
            <div className="flex items-center gap-2 mb-3 text-[#5f4a38]">
              <DollarSign className="w-4 h-4 text-[#14b8a6]" />
              <span className="font-medium">Price Breakdown</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[#7d6349]">
                <span>₱{pricePerNight.toLocaleString()} x {nights} {nights === 1 ? 'night' : 'nights'}</span>
                <span>₱{subtotal.toLocaleString()}</span>
              </div>

              {cleaningFee > 0 && (
                <div className="flex justify-between text-[#7d6349]">
                  <span>Cleaning fee</span>
                  <span>₱{cleaningFee.toLocaleString()}</span>
                </div>
              )}

              {includeParking && parkingFee > 0 && (
                <div className="flex justify-between text-[#7d6349]">
                  <span>Parking (₱{parkingFee.toLocaleString()} x {nights} {nights === 1 ? 'night' : 'nights'})</span>
                  <span>₱{totalParkingFee.toLocaleString()}</span>
                </div>
              )}

              {adminFee > 0 && (
                <div className="flex justify-between text-[#7d6349]">
                  <span>Admin fee ({adminFeePercent}%)</span>
                  <span>₱{adminFee.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-[#5f4a38] pt-2 border-t border-[#e8d4a8]">
                <span>Total</span>
                <span>₱{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Book Now Button */}
        <Link
          href={isBookingEnabled ? bookingUrl : '#'}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
            isBookingEnabled
              ? 'bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#0d9488] hover:to-[#0f766e] shadow-lg hover:shadow-xl hover:scale-[1.02]'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
          onClick={(e) => {
            if (!isBookingEnabled) {
              e.preventDefault();
            }
          }}
        >
          <Calendar className="w-5 h-5" />
          <span>Book Now</span>
        </Link>

        {/* Help text */}
        {!checkIn && (
          <p className="text-xs text-center text-[#7d6349]">
            Select dates to see availability and pricing
          </p>
        )}
      </div>
    </div>
  );
}
