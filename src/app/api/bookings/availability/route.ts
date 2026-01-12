import { NextRequest } from 'next/server';
import { createAdminClient, rateLimit } from '@/lib/api-auth';
import {
  successResponse,
  errorResponse,
  handleDatabaseError,
} from '@/lib/api-utils';

// =============================================
// TypeScript Interfaces
// =============================================

export interface AvailabilityResponse {
  available: boolean;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  numNights: number;
  conflictingDates?: string[];
  pricing?: {
    nightlyRate: number;
    subtotal: number;
    cleaningFee: number;
    parkingFee: number;
    adminFee: number;
    totalAmount: number;
    currency: string;
  };
  property?: {
    name: string;
    maxGuests: number;
    minNights: number;
    maxNights: number;
  };
}

// =============================================
// GET /api/bookings/availability - Check property availability
// =============================================
// Query params: propertyId, checkIn, checkOut

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting (more generous for availability checks)
    const rateLimitResult = rateLimit(request, 120, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return errorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        { resetTime: new Date(rateLimitResult.resetTime).toISOString() }
      );
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return errorResponse('Database not configured', 503);
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    // Validate required parameters
    if (!propertyId) {
      return errorResponse('Property ID is required', 400);
    }

    if (!checkIn) {
      return errorResponse('Check-in date is required', 400);
    }

    if (!checkOut) {
      return errorResponse('Check-out date is required', 400);
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(checkIn)) {
      return errorResponse('Check-in date must be in YYYY-MM-DD format', 400);
    }

    if (!dateRegex.test(checkOut)) {
      return errorResponse('Check-out date must be in YYYY-MM-DD format', 400);
    }

    // Validate date logic
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkInDate.getTime())) {
      return errorResponse('Invalid check-in date', 400);
    }

    if (isNaN(checkOutDate.getTime())) {
      return errorResponse('Invalid check-out date', 400);
    }

    if (checkInDate < today) {
      return errorResponse('Check-in date cannot be in the past', 400);
    }

    if (checkOutDate <= checkInDate) {
      return errorResponse('Check-out date must be after check-in date', 400);
    }

    const numNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    // Fetch property details
    const { data: property, error: propertyError } = await adminClient
      .from('properties')
      .select('id, name, price_per_night, cleaning_fee, parking_fee, admin_fee_percent, min_nights, max_nights, max_guests, active')
      .eq('id', propertyId)
      .single();

    if (propertyError) {
      if (propertyError.code === 'PGRST116') {
        return errorResponse('Property not found', 404);
      }
      return handleDatabaseError(propertyError);
    }

    if (!property) {
      return errorResponse('Property not found', 404);
    }

    if (!property.active) {
      return errorResponse('Property is not available for booking', 400);
    }

    // Check min/max nights constraints
    const minNights = property.min_nights || 1;
    const maxNights = property.max_nights || 365;

    if (numNights < minNights) {
      return successResponse<AvailabilityResponse>(
        {
          available: false,
          propertyId,
          checkIn,
          checkOut,
          numNights,
          conflictingDates: [],
          property: {
            name: property.name,
            maxGuests: property.max_guests || 4,
            minNights,
            maxNights,
          },
        },
        `Minimum stay is ${minNights} nights`
      );
    }

    if (numNights > maxNights) {
      return successResponse<AvailabilityResponse>(
        {
          available: false,
          propertyId,
          checkIn,
          checkOut,
          numNights,
          conflictingDates: [],
          property: {
            name: property.name,
            maxGuests: property.max_guests || 4,
            minNights,
            maxNights,
          },
        },
        `Maximum stay is ${maxNights} nights`
      );
    }

    // Check availability using database function
    const { data: isAvailable, error: availabilityError } = await adminClient
      .rpc('check_property_availability', {
        p_property_id: propertyId,
        p_check_in: checkIn,
        p_check_out: checkOut,
      });

    if (availabilityError) {
      console.error('Availability check error:', availabilityError);
      return errorResponse('Failed to check availability', 500);
    }

    // If not available, find conflicting dates
    let conflictingDates: string[] = [];

    if (!isAvailable) {
      // Get conflicting bookings
      const { data: conflictingBookings } = await adminClient
        .from('bookings')
        .select('check_in, check_out')
        .eq('property_id', propertyId)
        .not('status', 'in', '("cancelled","refunded")')
        .or(`and(check_in.lt.${checkOut},check_out.gt.${checkIn})`);

      // Get conflicting calendar events (blocked dates)
      const { data: conflictingEvents } = await adminClient
        .from('calendar_events')
        .select('start_date, end_date')
        .eq('property_id', propertyId)
        .or(`and(start_date.lt.${checkOut},end_date.gt.${checkIn})`);

      // Collect all conflicting dates
      const dates = new Set<string>();

      const addDatesInRange = (startStr: string, endStr: string) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        const current = new Date(Math.max(start.getTime(), checkInDate.getTime()));

        while (current < end && current < checkOutDate) {
          dates.add(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }
      };

      (conflictingBookings || []).forEach(b => addDatesInRange(b.check_in, b.check_out));
      (conflictingEvents || []).forEach(e => addDatesInRange(e.start_date, e.end_date));

      conflictingDates = Array.from(dates).sort();
    }

    // Calculate pricing with dynamic pricing support
    const baseNightlyRate = parseFloat(property.price_per_night) || 0;

    // Fetch price overrides for the date range
    const { data: priceOverrides } = await adminClient
      .from('price_overrides')
      .select('date, price')
      .eq('property_id', propertyId)
      .gte('date', checkIn)
      .lt('date', checkOut);

    // Build a map of date -> price
    const priceMap: Record<string, number> = {};
    (priceOverrides || []).forEach((row: { date: string; price: number }) => {
      priceMap[row.date] = parseFloat(String(row.price));
    });

    // Calculate subtotal by looping through each night
    let subtotal = 0;
    let currentDate = new Date(checkInDate);

    while (currentDate < checkOutDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayPrice = priceMap[dateStr] || baseNightlyRate;
      subtotal += dayPrice;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // For display, use average rate or base rate
    const nightlyRate = numNights > 0 ? subtotal / numNights : baseNightlyRate;

    const cleaningFee = parseFloat(property.cleaning_fee) || 0;
    const parkingFee = parseFloat(property.parking_fee) || 0;
    const adminFeePercent = parseFloat(property.admin_fee_percent) || 0;
    const adminFee = subtotal * (adminFeePercent / 100);
    const totalAmount = subtotal + cleaningFee + parkingFee + adminFee;

    const response: AvailabilityResponse = {
      available: isAvailable,
      propertyId,
      checkIn,
      checkOut,
      numNights,
      conflictingDates: isAvailable ? undefined : conflictingDates,
      pricing: {
        nightlyRate,
        subtotal,
        cleaningFee,
        parkingFee,
        adminFee,
        totalAmount,
        currency: 'PHP',
      },
      property: {
        name: property.name,
        maxGuests: property.max_guests || 4,
        minNights,
        maxNights,
      },
    };

    return successResponse<AvailabilityResponse>(
      response,
      isAvailable ? 'Property is available for the selected dates' : 'Property is not available for the selected dates'
    );

  } catch (error) {
    console.error('Availability check error:', error);
    return errorResponse('Failed to check availability', 500);
  }
}
