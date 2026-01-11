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

interface BookingUpdateRequest {
  status?: 'pending' | 'confirmed' | 'paid' | 'checked_in' | 'checked_out' | 'cancelled' | 'refunded';
  numGuests?: number;
  specialRequests?: string;
  internalNotes?: string;
  cancellationReason?: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

// =============================================
// Helper Functions
// =============================================

function formatBookingResponse(booking: any, property: any, guest: any) {
  return {
    id: booking.id,
    bookingNumber: booking.booking_number,
    propertyId: booking.property_id,
    propertyName: property?.name || '',
    propertySlug: property?.slug || '',
    guestId: booking.guest_id,
    guestName: guest ? `${guest.first_name} ${guest.last_name}` : '',
    guestEmail: guest?.email || '',
    guestPhone: guest?.phone || '',
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    numGuests: booking.num_guests,
    numNights: booking.num_nights,
    nightlyRate: parseFloat(booking.nightly_rate),
    subtotal: parseFloat(booking.subtotal),
    cleaningFee: parseFloat(booking.cleaning_fee || 0),
    parkingFee: parseFloat(booking.parking_fee || 0),
    adminFee: parseFloat(booking.admin_fee || 0),
    totalAmount: parseFloat(booking.total_amount),
    currency: booking.currency,
    status: booking.status,
    source: booking.source,
    specialRequests: booking.special_requests,
    internalNotes: booking.internal_notes,
    confirmedAt: booking.confirmed_at,
    cancelledAt: booking.cancelled_at,
    cancellationReason: booking.cancellation_reason,
    createdAt: booking.created_at,
    updatedAt: booking.updated_at,
  };
}

function validateUpdateRequest(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.status !== undefined) {
    const validStatuses = ['pending', 'confirmed', 'paid', 'checked_in', 'checked_out', 'cancelled', 'refunded'];
    if (!validStatuses.includes(data.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  if (data.numGuests !== undefined) {
    if (typeof data.numGuests !== 'number' || data.numGuests < 1) {
      errors.push('Number of guests must be at least 1');
    }
  }

  return { valid: errors.length === 0, errors };
}

// =============================================
// GET /api/bookings/[id] - Get single booking
// =============================================

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
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

    const params = await context.params;
    const { id } = params;

    if (!id) {
      return errorResponse('Booking ID is required', 400);
    }

    // Fetch booking with related data
    const { data: booking, error } = await adminClient
      .from('bookings')
      .select(`
        *,
        properties:property_id (name, slug, location),
        guests:guest_id (first_name, last_name, email, phone, country)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Booking not found', 404);
      }
      return handleDatabaseError(error);
    }

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    // Check if admin authenticated - internal notes only visible to admin
    const authHeader = request.headers.get('authorization');
    const sessionToken = request.headers.get('x-admin-session');
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'cozy2024';

    const isAdmin = (authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1] === validPassword)
      || sessionToken === 'authenticated';

    const response = formatBookingResponse(booking, booking.properties, booking.guests);

    // Remove internal notes for non-admin users
    if (!isAdmin) {
      delete (response as any).internalNotes;
    }

    return successResponse(response, 'Booking retrieved successfully');

  } catch (error) {
    console.error('Booking GET error:', error);
    return errorResponse('Failed to retrieve booking', 500);
  }
}

// =============================================
// PUT /api/bookings/[id] - Update booking (admin only)
// =============================================

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 30, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return errorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        { resetTime: new Date(rateLimitResult.resetTime).toISOString() }
      );
    }

    return await requireAuth(request, async (req, adminSession) => {
      const adminClient = createAdminClient();
      if (!adminClient) {
        return errorResponse('Database not configured', 503);
      }

      const params = await context.params;
      const { id } = params;

      if (!id) {
        return errorResponse('Booking ID is required', 400);
      }

      const body = await req.json();

      // Validate update request
      const validation = validateUpdateRequest(body);
      if (!validation.valid) {
        return errorResponse(
          `Validation failed: ${validation.errors.join(', ')}`,
          400,
          { errors: validation.errors }
        );
      }

      // Check if booking exists
      const { data: existingBooking, error: fetchError } = await adminClient
        .from('bookings')
        .select('id, status, booking_number')
        .eq('id', id)
        .single();

      if (fetchError || !existingBooking) {
        return errorResponse('Booking not found', 404);
      }

      // Build update object
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (body.status !== undefined) {
        updateData.status = body.status;

        // Set confirmed_at when status changes to confirmed
        if (body.status === 'confirmed' && existingBooking.status !== 'confirmed') {
          updateData.confirmed_at = new Date().toISOString();
        }

        // Set cancelled_at when status changes to cancelled
        if (body.status === 'cancelled' && existingBooking.status !== 'cancelled') {
          updateData.cancelled_at = new Date().toISOString();
          if (body.cancellationReason) {
            updateData.cancellation_reason = body.cancellationReason.trim();
          }
        }
      }

      if (body.numGuests !== undefined) {
        updateData.num_guests = body.numGuests;
      }

      if (body.specialRequests !== undefined) {
        updateData.special_requests = body.specialRequests?.trim() || null;
      }

      if (body.internalNotes !== undefined) {
        updateData.internal_notes = body.internalNotes?.trim() || null;
      }

      // Perform update
      const { data: updatedBooking, error: updateError } = await adminClient
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          properties:property_id (name, slug),
          guests:guest_id (first_name, last_name, email, phone)
        `)
        .single();

      if (updateError) {
        console.error('Booking update error:', updateError);
        return handleDatabaseError(updateError);
      }

      console.log(`Booking updated: ${existingBooking.booking_number}`);

      return successResponse(
        formatBookingResponse(updatedBooking, updatedBooking.properties, updatedBooking.guests),
        'Booking updated successfully',
        { timestamp: new Date().toISOString() }
      );
    });

  } catch (error) {
    console.error('Booking PUT error:', error);
    return errorResponse('Failed to update booking', 500);
  }
}

// =============================================
// DELETE /api/bookings/[id] - Cancel booking (admin only)
// =============================================

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 10, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return errorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        { resetTime: new Date(rateLimitResult.resetTime).toISOString() }
      );
    }

    return await requireAuth(request, async (req, adminSession) => {
      const adminClient = createAdminClient();
      if (!adminClient) {
        return errorResponse('Database not configured', 503);
      }

      const params = await context.params;
      const { id } = params;

      if (!id) {
        return errorResponse('Booking ID is required', 400);
      }

      // Check if booking exists
      const { data: existingBooking, error: fetchError } = await adminClient
        .from('bookings')
        .select('id, booking_number, status')
        .eq('id', id)
        .single();

      if (fetchError || !existingBooking) {
        return errorResponse('Booking not found', 404);
      }

      // Don't allow cancelling already cancelled or refunded bookings
      if (['cancelled', 'refunded'].includes(existingBooking.status)) {
        return errorResponse(`Booking is already ${existingBooking.status}`, 400);
      }

      // Get cancellation reason from query params or body
      const { searchParams } = new URL(req.url);
      let reason = searchParams.get('reason');

      // Try to get reason from body if not in query params
      try {
        const body = await req.json();
        reason = reason || body.reason;
      } catch {
        // No body or invalid JSON, use query param
      }

      // Cancel the booking (soft delete - update status)
      const { error: updateError } = await adminClient
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason?.trim() || 'Cancelled by admin',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        console.error('Booking cancellation error:', updateError);
        return handleDatabaseError(updateError);
      }

      console.log(`Booking cancelled: ${existingBooking.booking_number}`);

      return successResponse(
        {
          id,
          bookingNumber: existingBooking.booking_number,
          status: 'cancelled',
        },
        'Booking cancelled successfully',
        { timestamp: new Date().toISOString() }
      );
    });

  } catch (error) {
    console.error('Booking DELETE error:', error);
    return errorResponse('Failed to cancel booking', 500);
  }
}
