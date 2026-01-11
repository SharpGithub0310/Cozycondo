'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Users,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Home,
  CreditCard,
  MessageSquare,
  User,
  Car,
} from 'lucide-react';
import DatePicker from '@/components/DatePicker';

interface PropertyData {
  id: string;
  uuid?: string;
  name: string;
  slug: string;
  location: string;
  images?: string[];
  photos?: string[];
  pricePerNight: string | number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  cleaningFee?: number;
  parkingFee?: number;
  adminFeePercent?: number;
  minNights?: number;
  maxNights?: number;
}

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

type BookingStep = 'confirm' | 'guest' | 'requests' | 'payment';

// Loading fallback for Suspense
function BookingLoading() {
  return (
    <div className="min-h-screen bg-[#fefdfb] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#14b8a6] animate-spin mx-auto mb-4" />
        <p className="text-[#7d6349]">Loading booking...</p>
      </div>
    </div>
  );
}

// Main page wrapper with Suspense
export default function BookingPage({ params }: { params: Promise<{ propertySlug: string }> }) {
  return (
    <Suspense fallback={<BookingLoading />}>
      <BookingContent params={params} />
    </Suspense>
  );
}

// Inner component that uses useSearchParams
function BookingContent({ params }: { params: Promise<{ propertySlug: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL parameters
  const checkInParam = searchParams.get('checkIn') || '';
  const checkOutParam = searchParams.get('checkOut') || '';
  const guestsParam = parseInt(searchParams.get('guests') || '1', 10);
  const parkingParam = searchParams.get('parking') === '1';

  // State
  const [propertySlug, setPropertySlug] = useState<string>('');
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<BookingStep>('confirm');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [checkIn, setCheckIn] = useState(checkInParam);
  const [checkOut, setCheckOut] = useState(checkOutParam);
  const [guests, setGuests] = useState(guestsParam);
  const [includeParking, setIncludeParking] = useState(parkingParam);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [specialRequests, setSpecialRequests] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Resolve params
  useEffect(() => {
    params.then((p) => setPropertySlug(p.propertySlug));
  }, [params]);

  // Fetch property data
  useEffect(() => {
    if (!propertySlug) return;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/properties/${propertySlug}`);
        if (!response.ok) {
          throw new Error('Property not found');
        }
        const result = await response.json();
        if (result.success && result.data) {
          setProperty(result.data);
        } else {
          throw new Error(result.error || 'Failed to load property');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertySlug]);

  // Calculate nights and pricing
  const calculateNights = useCallback((): number => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [checkIn, checkOut]);

  const nights = calculateNights();
  const pricePerNight = property ? parseFloat(String(property.pricePerNight)) : 0;
  const cleaningFee = property?.cleaningFee || 0;
  const parkingFee = property?.parkingFee || 0;
  const adminFeePercent = property?.adminFeePercent || 0;
  const subtotal = pricePerNight * nights;
  const adminFee = Math.round((subtotal * adminFeePercent) / 100);
  const totalParkingFee = includeParking ? (parkingFee * nights) : 0;
  const total = subtotal + cleaningFee + totalParkingFee + adminFee;

  // Validation
  const validateGuestInfo = (): boolean => {
    const errors: Record<string, string> = {};

    if (!guestInfo.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!guestInfo.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!guestInfo.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!guestInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step navigation
  const steps: { key: BookingStep; label: string; icon: React.ReactNode }[] = [
    { key: 'confirm', label: 'Confirm Dates', icon: <Calendar className="w-5 h-5" /> },
    { key: 'guest', label: 'Guest Info', icon: <User className="w-5 h-5" /> },
    { key: 'requests', label: 'Requests', icon: <MessageSquare className="w-5 h-5" /> },
    { key: 'payment', label: 'Payment', icon: <CreditCard className="w-5 h-5" /> },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const goToNextStep = () => {
    if (currentStep === 'guest' && !validateGuestInfo()) {
      return;
    }
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  // Submit booking
  const handleSubmit = async () => {
    if (!property) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.uuid || property.id,
          checkIn,
          checkOut,
          numGuests: guests,
          includeParking,
          guest: {
            firstName: guestInfo.firstName.trim(),
            lastName: guestInfo.lastName.trim(),
            email: guestInfo.email.trim().toLowerCase(),
            phone: guestInfo.phone.trim(),
          },
          specialRequests: specialRequests.trim() || undefined,
          source: 'website',
        }),
      });

      const bookingResult = await bookingResponse.json();

      if (!bookingResponse.ok || !bookingResult.success) {
        throw new Error(bookingResult.error || 'Failed to create booking');
      }

      const bookingId = bookingResult.data.id;

      // Step 2: Create payment checkout session
      const paymentResponse = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentResult.success) {
        throw new Error(paymentResult.error || 'Failed to create payment session');
      }

      // Step 3: Redirect to PayMongo checkout
      const checkoutUrl = paymentResult.data.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
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

  // Get property image
  const propertyImage = property?.photos?.[0] || property?.images?.[0] || '/placeholder-property.jpg';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fefdfb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#14b8a6] animate-spin mx-auto mb-4" />
          <p className="text-[#7d6349]">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="min-h-screen bg-[#fefdfb] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="font-heading text-2xl text-[#5f4a38] mb-2">Unable to Load Booking</h1>
          <p className="text-[#7d6349] mb-6">{error}</p>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#14b8a6] text-white rounded-xl hover:bg-[#0d9488] transition-colors"
          >
            <Home className="w-5 h-5" />
            Browse Properties
          </Link>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fefdfb]">
      {/* Header */}
      <header className="bg-white border-b border-[#e8d4a8] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-heading text-2xl text-[#5f4a38]">
              Cozy Condo
            </Link>
            <Link
              href={`/properties/${propertySlug}`}
              className="text-[#14b8a6] hover:text-[#0d9488] transition-colors text-sm font-medium"
            >
              Back to Property
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-4 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    currentStep === step.key
                      ? 'bg-[#14b8a6] text-white'
                      : index < currentStepIndex
                      ? 'bg-[#f0fdfb] text-[#0f766e]'
                      : 'bg-[#faf3e6] text-[#7d6349]'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-[#d4c4a8] mx-1 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#e8d4a8] shadow-sm overflow-hidden">
              {/* Step 1: Confirm Dates */}
              {currentStep === 'confirm' && (
                <div className="p-6 md:p-8">
                  <h2 className="font-heading text-2xl text-[#5f4a38] mb-6">Confirm Your Dates</h2>

                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <DatePicker
                      propertySlug={propertySlug}
                      selectedDate={checkIn}
                      onDateSelect={(date) => {
                        setCheckIn(date);
                        // Reset checkout if it's before the new check-in
                        if (checkOut && new Date(checkOut) <= new Date(date)) {
                          setCheckOut('');
                        }
                      }}
                      minDate={new Date().toISOString().split('T')[0]}
                      label="Check-in"
                    />
                    <DatePicker
                      propertySlug={propertySlug}
                      selectedDate={checkOut}
                      onDateSelect={(date) => setCheckOut(date)}
                      minDate={checkIn || new Date().toISOString().split('T')[0]}
                      label="Check-out"
                      isCheckOut={true}
                      checkInDate={checkIn}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#5f4a38] mb-2">
                      <Users className="w-4 h-4 inline mr-2 text-[#14b8a6]" />
                      Number of Guests
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-[#e8d4a8] bg-[#faf3e6]/50 text-[#5f4a38] focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent transition-all"
                    >
                      {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Parking Option (only show if parking fee is set) */}
                  {parkingFee > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-3 p-4 rounded-xl border border-[#e8d4a8] bg-[#faf3e6]/30">
                        <input
                          type="checkbox"
                          id="parking-option-form"
                          checked={includeParking}
                          onChange={(e) => setIncludeParking(e.target.checked)}
                          className="w-5 h-5 rounded border-[#e8d4a8] text-[#14b8a6] focus:ring-[#14b8a6] cursor-pointer"
                        />
                        <label htmlFor="parking-option-form" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 text-sm font-medium text-[#5f4a38]">
                            <Car className="w-4 h-4 text-[#14b8a6]" />
                            Include Parking
                          </div>
                          <p className="text-xs text-[#7d6349] mt-0.5">₱{parkingFee.toLocaleString()}/night {nights > 0 && `(₱${(parkingFee * nights).toLocaleString()} total)`}</p>
                        </label>
                      </div>
                    </div>
                  )}

                  {nights > 0 && (
                    <div className="bg-[#f0fdfb] rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#0f766e]" />
                      <span className="text-[#0f766e]">
                        {nights} {nights === 1 ? 'night' : 'nights'} selected
                      </span>
                    </div>
                  )}

                  {(!checkIn || !checkOut || nights === 0) && (
                    <div className="bg-amber-50 rounded-xl p-4 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span className="text-amber-700">Please select valid check-in and check-out dates</span>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Guest Information */}
              {currentStep === 'guest' && (
                <div className="p-6 md:p-8">
                  <h2 className="font-heading text-2xl text-[#5f4a38] mb-6">Guest Information</h2>

                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#5f4a38] mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={guestInfo.firstName}
                          onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            formErrors.firstName ? 'border-red-400' : 'border-[#e8d4a8]'
                          } bg-[#faf3e6]/50 text-[#5f4a38] focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent transition-all`}
                          placeholder="John"
                        />
                        {formErrors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#5f4a38] mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={guestInfo.lastName}
                          onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            formErrors.lastName ? 'border-red-400' : 'border-[#e8d4a8]'
                          } bg-[#faf3e6]/50 text-[#5f4a38] focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent transition-all`}
                          placeholder="Doe"
                        />
                        {formErrors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#5f4a38] mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          formErrors.email ? 'border-red-400' : 'border-[#e8d4a8]'
                        } bg-[#faf3e6]/50 text-[#5f4a38] focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent transition-all`}
                        placeholder="john.doe@example.com"
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#5f4a38] mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={guestInfo.phone}
                        onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border ${
                          formErrors.phone ? 'border-red-400' : 'border-[#e8d4a8]'
                        } bg-[#faf3e6]/50 text-[#5f4a38] focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent transition-all`}
                        placeholder="+63 912 345 6789"
                      />
                      {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Special Requests */}
              {currentStep === 'requests' && (
                <div className="p-6 md:p-8">
                  <h2 className="font-heading text-2xl text-[#5f4a38] mb-6">Special Requests</h2>
                  <p className="text-[#7d6349] mb-4">
                    Let us know if you have any special requests or requirements. We will do our best to accommodate them.
                  </p>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-[#e8d4a8] bg-[#faf3e6]/50 text-[#5f4a38] focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent transition-all resize-none"
                    placeholder="e.g., Early check-in, late check-out, extra pillows, etc."
                  />
                  <p className="text-sm text-[#7d6349] mt-2">This field is optional.</p>
                </div>
              )}

              {/* Step 4: Payment */}
              {currentStep === 'payment' && (
                <div className="p-6 md:p-8">
                  <h2 className="font-heading text-2xl text-[#5f4a38] mb-6">Review & Pay</h2>

                  {/* Booking Summary */}
                  <div className="bg-[#faf3e6] rounded-xl p-4 mb-6">
                    <h3 className="font-medium text-[#5f4a38] mb-3">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#7d6349]">Property</span>
                        <span className="text-[#5f4a38] font-medium">{property.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7d6349]">Check-in</span>
                        <span className="text-[#5f4a38]">{formatDate(checkIn)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7d6349]">Check-out</span>
                        <span className="text-[#5f4a38]">{formatDate(checkOut)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7d6349]">Guests</span>
                        <span className="text-[#5f4a38]">{guests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7d6349]">Guest Name</span>
                        <span className="text-[#5f4a38]">{guestInfo.firstName} {guestInfo.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#7d6349]">Email</span>
                        <span className="text-[#5f4a38]">{guestInfo.email}</span>
                      </div>
                      {includeParking && parkingFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#7d6349]">Parking</span>
                          <span className="text-[#5f4a38]">₱{parkingFee.toLocaleString()}/night x {nights} = ₱{totalParkingFee.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-[#f0fdfb] rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-[#0f766e]" />
                      <span className="font-medium text-[#0f766e]">Secure Payment via PayMongo</span>
                    </div>
                    <p className="text-sm text-[#0f766e]">
                      You will be redirected to PayMongo to complete your payment securely.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 rounded-xl p-4 mb-6 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="border-t border-[#e8d4a8] p-6 flex justify-between">
                {currentStepIndex > 0 ? (
                  <button
                    onClick={goToPreviousStep}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 text-[#5f4a38] hover:text-[#14b8a6] transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep === 'payment' ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !checkIn || !checkOut || nights === 0}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white rounded-xl font-semibold hover:from-[#0d9488] hover:to-[#0f766e] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay PHP {total.toLocaleString()}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={goToNextStep}
                    disabled={
                      (currentStep === 'confirm' && (!checkIn || !checkOut || nights === 0))
                    }
                    className="flex items-center gap-2 px-8 py-3 bg-[#14b8a6] text-white rounded-xl font-semibold hover:bg-[#0d9488] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Property Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#e8d4a8] shadow-sm overflow-hidden sticky top-24">
              {/* Property Image */}
              <div className="relative h-48 bg-[#faf3e6]">
                <Image
                  src={propertyImage}
                  alt={property.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>

              {/* Property Details */}
              <div className="p-5">
                <h3 className="font-heading text-lg text-[#5f4a38] mb-2">{property.name}</h3>
                <div className="flex items-center gap-1 text-[#7d6349] text-sm mb-4">
                  <MapPin className="w-4 h-4 text-[#14b8a6]" />
                  {property.location}
                </div>

                <div className="flex gap-4 text-sm text-[#7d6349] mb-4">
                  <span>{property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                  <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                  <span>Max {property.maxGuests}</span>
                </div>

                {/* Price Breakdown */}
                {nights > 0 && (
                  <div className="border-t border-[#e8d4a8] pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7d6349]">
                        ₱{pricePerNight.toLocaleString()} x {nights} {nights === 1 ? 'night' : 'nights'}
                      </span>
                      <span className="text-[#5f4a38]">₱{subtotal.toLocaleString()}</span>
                    </div>
                    {cleaningFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7d6349]">Cleaning fee</span>
                        <span className="text-[#5f4a38]">₱{cleaningFee.toLocaleString()}</span>
                      </div>
                    )}
                    {includeParking && parkingFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7d6349]">Parking (₱{parkingFee.toLocaleString()} x {nights})</span>
                        <span className="text-[#5f4a38]">₱{totalParkingFee.toLocaleString()}</span>
                      </div>
                    )}
                    {adminFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7d6349]">Admin fee ({adminFeePercent}%)</span>
                        <span className="text-[#5f4a38]">₱{adminFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-[#5f4a38] pt-2 border-t border-[#e8d4a8]">
                      <span>Total</span>
                      <span>₱{total.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Date Summary */}
                {checkIn && checkOut && (
                  <div className="mt-4 p-3 bg-[#faf3e6] rounded-lg text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-[#7d6349]">Check-in</span>
                      <span className="text-[#5f4a38]">{formatDate(checkIn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7d6349]">Check-out</span>
                      <span className="text-[#5f4a38]">{formatDate(checkOut)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
