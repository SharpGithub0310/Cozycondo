import { NextRequest } from 'next/server';
import { createAdminClient, requireAuth, rateLimit } from '@/lib/api-auth';
import {
  successResponse,
  errorResponse,
  handleDatabaseError,
} from '@/lib/api-utils';

// =============================================
// TypeScript Interfaces
// =============================================

export interface BookingCreateRequest {
  propertyId: string; // UUID of property
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  numGuests: number;
  guest: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    country?: string;
  };
  specialRequests?: string;
  source?: 'website' | 'airbnb' | 'direct';
}

export interface BookingResponse {
  id: string;
  bookingNumber: string;
  propertyId: string;
  propertyName: string;
  guestId: string;
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
  extraPersonFee: number;
  adminFee: number;
  totalAmount: number;
  currency: string;
  status: string;
  source: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================
// Validation Functions
// =============================================

function validateBookingRequest(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.propertyId || typeof data.propertyId !== 'string') {
    errors.push('Property ID is required');
  }

  if (!data.checkIn || typeof data.checkIn !== 'string') {
    errors.push('Check-in date is required');
  }

  if (!data.checkOut || typeof data.checkOut !== 'string') {
    errors.push('Check-out date is required');
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (data.checkIn && !dateRegex.test(data.checkIn)) {
    errors.push('Check-in date must be in YYYY-MM-DD format');
  }

  if (data.checkOut && !dateRegex.test(data.checkOut)) {
    errors.push('Check-out date must be in YYYY-MM-DD format');
  }

  // Validate date logic
  if (data.checkIn && data.checkOut) {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      errors.push('Check-in date cannot be in the past');
    }

    if (checkOut <= checkIn) {
      errors.push('Check-out date must be after check-in date');
    }
  }

  // Validate numGuests
  if (!data.numGuests || typeof data.numGuests !== 'number' || data.numGuests < 1) {
    errors.push('Number of guests must be at least 1');
  }

  // Validate guest info
  if (!data.guest || typeof data.guest !== 'object') {
    errors.push('Guest information is required');
  } else {
    if (!data.guest.email || typeof data.guest.email !== 'string') {
      errors.push('Guest email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.guest.email)) {
        errors.push('Invalid email format');
      }
    }

    if (!data.guest.firstName || typeof data.guest.firstName !== 'string') {
      errors.push('Guest first name is required');
    }

    if (!data.guest.lastName || typeof data.guest.lastName !== 'string') {
      errors.push('Guest last name is required');
    }
  }

  return { valid: errors.length === 0, errors };
}

// =============================================
// Helper Functions
// =============================================

function formatBookingResponse(booking: any, property: any, guest: any): BookingResponse {
  return {
    id: booking.id,
    bookingNumber: booking.booking_number,
    propertyId: booking.property_id,
    propertyName: property?.name || '',
    guestId: booking.guest_id,
    guestName: guest ? `${guest.first_name} ${guest.last_name}` : '',
    guestEmail: guest?.email || '',
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    numGuests: booking.num_guests,
    numNights: booking.num_nights,
    nightlyRate: parseFloat(booking.nightly_rate),
    subtotal: parseFloat(booking.subtotal),
    cleaningFee: parseFloat(booking.cleaning_fee || 0),
    parkingFee: parseFloat(booking.parking_fee || 0),
    extraPersonFee: parseFloat(booking.extra_person_fee || 0),
    adminFee: parseFloat(booking.admin_fee || 0),
    totalAmount: parseFloat(booking.total_amount),
    currency: booking.currency,
    status: booking.status,
    source: booking.source,
    specialRequests: booking.special_requests,
    createdAt: booking.created_at,
    updatedAt: booking.updated_at,
  };
}

// =============================================
// GET /api/bookings - List bookings
// =============================================
// Admin: all bookings with filtering
// Public: filter by booking_number query param only

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 60, 15 * 60 * 1000);
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
    const bookingNumber = searchParams.get('booking_number');

    // Check if admin authenticated
    const authHeader = request.headers.get('authorization');
    const sessionToken = request.headers.get('x-admin-session');
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'cozy2024';

    const isAdmin = (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] === validPassword)
      || sessionToken === 'authenticated';

    // Public access: only allow lookup by booking_number
    if (!isAdmin) {
      if (!bookingNumber) {
        return errorResponse('Booking number is required for public access', 400);
      }

      const { data: booking, error } = await adminClient
        .from('bookings')
        .select(`
          *,
          properties:property_id (name, slug),
          guests:guest_id (first_name, last_name, email)
        `)
        .eq('booking_number', bookingNumber)
        .single();

      if (error || !booking) {
        return errorResponse('Booking not found', 404);
      }

      return successResponse(
        formatBookingResponse(booking, booking.properties, booking.guests),
        'Booking retrieved successfully'
      );
    }

    // Admin access: full list with filtering
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = (page - 1) * limit;
    const status = searchParams.get('status');
    const propertyId = searchParams.get('property_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') === 'asc' ? true : false;

    let query = adminClient
      .from('bookings')
      .select(`
        *,
        properties:property_id (name, slug),
        guests:guest_id (first_name, last_name, email, phone)
      `, { count: 'exact' });

    // Apply filters
    if (bookingNumber) {
      query = query.ilike('booking_number', `%${bookingNumber}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    if (startDate) {
      query = query.gte('check_in', startDate);
    }

    if (endDate) {
      query = query.lte('check_out', endDate);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'check_in', 'check_out', 'total_amount', 'status'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    query = query.order(sortField, { ascending: order });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: bookings, error, count } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    const formattedBookings = (bookings || []).map(b =>
      formatBookingResponse(b, b.properties, b.guests)
    );

    return successResponse(
      formattedBookings,
      `Retrieved ${formattedBookings.length} bookings`,
      {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      }
    );

  } catch (error) {
    console.error('Bookings GET error:', error);
    return errorResponse('Failed to retrieve bookings', 500);
  }
}

// =============================================
// POST /api/bookings - Create new booking
// =============================================
// Public endpoint for booking flow

export async function POST(request: NextRequest) {
  try {
    // Stricter rate limiting for bookings
    const rateLimitResult = rateLimit(request, 10, 15 * 60 * 1000);
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

    // Check if booking is enabled (defense in depth)
    const { data: bookingEnabledSetting } = await adminClient
      .from('website_settings')
      .select('setting_value')
      .eq('setting_key', 'booking_enabled')
      .single();

    const { data: bookingDisabledMsgSetting } = await adminClient
      .from('website_settings')
      .select('setting_value')
      .eq('setting_key', 'booking_disabled_message')
      .single();

    // Check if booking is disabled (setting_value is stored as string)
    if (bookingEnabledSetting?.setting_value === 'false') {
      return errorResponse(
        bookingDisabledMsgSetting?.setting_value || 'Online booking is temporarily unavailable. Please contact us directly.',
        503
      );
    }

    const body = await request.json();

    // Validate request
    const validation = validateBookingRequest(body);
    if (!validation.valid) {
      return errorResponse(
        `Validation failed: ${validation.errors.join(', ')}`,
        400,
        { errors: validation.errors }
      );
    }

    const { propertyId, checkIn, checkOut, numGuests, guest, specialRequests, source, parkingDays } = body as BookingCreateRequest & { parkingDays?: number };

    // Step 1: Fetch property and validate
    const { data: property, error: propertyError } = await adminClient
      .from('properties')
      .select('id, name, price_per_night, cleaning_fee, parking_fee, admin_fee_percent, min_nights, max_nights, max_guests, base_occupancy, extra_person_fee, active')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return errorResponse('Property not found', 404);
    }

    if (!property.active) {
      return errorResponse('Property is not available for booking', 400);
    }

    // Step 2: Validate date constraints
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const numNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    if (property.min_nights && numNights < property.min_nights) {
      return errorResponse(`Minimum stay is ${property.min_nights} nights`, 400);
    }

    if (property.max_nights && numNights > property.max_nights) {
      return errorResponse(`Maximum stay is ${property.max_nights} nights`, 400);
    }

    if (property.max_guests && numGuests > property.max_guests) {
      return errorResponse(`Maximum ${property.max_guests} guests allowed`, 400);
    }

    // Step 3: Check availability using database function
    const { data: availabilityResult, error: availabilityError } = await adminClient
      .rpc('check_property_availability', {
        p_property_id: propertyId,
        p_check_in: checkIn,
        p_check_out: checkOut,
      });

    if (availabilityError) {
      console.error('Availability check error:', availabilityError);
      return errorResponse('Failed to check availability', 500);
    }

    if (!availabilityResult) {
      return errorResponse('Property is not available for the selected dates', 409);
    }

    // Step 4: Create or find guest
    const normalizedEmail = guest.email.toLowerCase().trim();

    // Try to find existing guest
    let { data: existingGuest } = await adminClient
      .from('guests')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    let guestId: string;

    if (existingGuest) {
      guestId = existingGuest.id;
      // Update guest info if it changed
      await adminClient
        .from('guests')
        .update({
          first_name: guest.firstName.trim(),
          last_name: guest.lastName.trim(),
          phone: guest.phone?.trim() || null,
          country: guest.country?.trim() || 'Philippines',
          updated_at: new Date().toISOString(),
        })
        .eq('id', guestId);
    } else {
      // Create new guest
      const { data: newGuest, error: guestError } = await adminClient
        .from('guests')
        .insert({
          email: normalizedEmail,
          first_name: guest.firstName.trim(),
          last_name: guest.lastName.trim(),
          phone: guest.phone?.trim() || null,
          country: guest.country?.trim() || 'Philippines',
        })
        .select('id')
        .single();

      if (guestError || !newGuest) {
        console.error('Guest creation error:', guestError);
        return errorResponse('Failed to create guest record', 500);
      }

      guestId = newGuest.id;
    }

    // Step 5: Generate booking number
    const { data: bookingNumber, error: bookingNumberError } = await adminClient
      .rpc('generate_booking_number');

    if (bookingNumberError || !bookingNumber) {
      console.error('Booking number generation error:', bookingNumberError);
      return errorResponse('Failed to generate booking number', 500);
    }

    // Step 6: Calculate pricing with dynamic pricing support
    const baseNightlyRate = parseFloat(property.price_per_night) || 0;

    // Fetch price overrides for the booking date range
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
    const startDateForPricing = new Date(checkIn + 'T00:00:00');
    const endDateForPricing = new Date(checkOut + 'T00:00:00');
    let currentPricingDate = new Date(startDateForPricing);

    // Helper to format date in local timezone (avoids UTC conversion bug)
    const formatDateLocal = (d: Date): string => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    while (currentPricingDate < endDateForPricing) {
      const dateStr = formatDateLocal(currentPricingDate);
      const dayPrice = priceMap[dateStr] || baseNightlyRate;
      subtotal += dayPrice;
      currentPricingDate.setDate(currentPricingDate.getDate() + 1);
    }

    // For nightly_rate field, use average rate or base rate
    const nightlyRate = numNights > 0 ? subtotal / numNights : baseNightlyRate;

    const cleaningFee = parseFloat(property.cleaning_fee) || 0;
    const parkingFeePerDay = parseFloat(property.parking_fee) || 0;
    // Ensure parkingDays doesn't exceed numNights
    const validParkingDays = Math.min(Math.max(parkingDays || 0, 0), numNights);
    const totalParkingFee = parkingFeePerDay * validParkingDays;

    // Calculate extra person fee
    const baseOccupancy = property.base_occupancy || 2;
    const extraPersonFeePerNight = parseFloat(property.extra_person_fee) || 0;
    const extraGuests = Math.max(0, numGuests - baseOccupancy);
    const totalExtraPersonFee = extraGuests * extraPersonFeePerNight * numNights;

    const adminFeePercent = parseFloat(property.admin_fee_percent) || 0;
    const adminFee = subtotal * (adminFeePercent / 100);
    const totalAmount = subtotal + cleaningFee + totalParkingFee + totalExtraPersonFee + adminFee;

    // Step 7: Create booking
    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .insert({
        booking_number: bookingNumber,
        property_id: propertyId,
        guest_id: guestId,
        check_in: checkIn,
        check_out: checkOut,
        num_guests: numGuests,
        num_nights: numNights,
        nightly_rate: nightlyRate,
        subtotal: subtotal,
        cleaning_fee: cleaningFee,
        parking_fee: totalParkingFee,
        extra_person_fee: totalExtraPersonFee,
        admin_fee: adminFee,
        total_amount: totalAmount,
        currency: 'PHP',
        status: 'pending',
        source: source || 'website',
        special_requests: specialRequests?.trim() || null,
      })
      .select('*')
      .single();

    if (bookingError || !booking) {
      console.error('Booking creation error:', bookingError);
      return errorResponse('Failed to create booking', 500);
    }

    console.log(`Booking created: ${bookingNumber} for ${property.name}`);

    // Return booking with payment info needed
    return successResponse(
      {
        ...formatBookingResponse(booking, property, {
          first_name: guest.firstName,
          last_name: guest.lastName,
          email: normalizedEmail,
        }),
        paymentInfo: {
          amount: totalAmount,
          currency: 'PHP',
          description: `Booking ${bookingNumber} - ${property.name}`,
          bookingId: booking.id,
        },
      },
      'Booking created successfully',
      { timestamp: new Date().toISOString() }
    );

  } catch (error) {
    console.error('Bookings POST error:', error);
    return errorResponse('Failed to create booking', 500);
  }
}
