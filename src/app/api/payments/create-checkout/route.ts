import { NextRequest } from 'next/server';
import { createAdminClient, rateLimit } from '@/lib/api-auth';
import { successResponse, errorResponse, handleDatabaseError } from '@/lib/api-utils';
import { createCheckoutSession, PayMongoAPIError, PayMongoConfigError } from '@/lib/paymongo';

/**
 * POST /api/payments/create-checkout
 *
 * Creates a PayMongo checkout session for a booking.
 *
 * Request body:
 * - bookingId: UUID of the booking to pay for
 *
 * Response:
 * - checkoutUrl: URL to redirect user to PayMongo checkout
 * - sessionId: PayMongo checkout session ID
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 30, 15 * 60 * 1000); // 30 requests per 15 minutes
    if (!rateLimitResult.allowed) {
      return errorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        {
          resetTime: new Date(rateLimitResult.resetTime).toISOString(),
          remaining: rateLimitResult.remaining
        }
      );
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return errorResponse('Database not configured', 503);
    }

    // Parse request body
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return errorResponse('bookingId is required', 400);
    }

    // 1. Load booking from database with guest info
    const { data: booking, error: bookingError } = await adminClient
      .from('bookings')
      .select(`
        id,
        booking_number,
        property_id,
        guest_id,
        check_in,
        check_out,
        total_amount,
        currency,
        status,
        guests (
          email,
          first_name,
          last_name
        ),
        properties (
          name
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError) {
      console.error('Error fetching booking:', bookingError);
      if (bookingError.code === 'PGRST116') {
        return errorResponse('Booking not found', 404);
      }
      return handleDatabaseError(bookingError);
    }

    if (!booking) {
      return errorResponse('Booking not found', 404);
    }

    // 2. Verify booking status is 'pending'
    if (booking.status !== 'pending') {
      return errorResponse(
        `Cannot create checkout for booking with status '${booking.status}'. Only pending bookings can be paid.`,
        400
      );
    }

    // Check for existing pending payment
    const { data: existingPayment } = await adminClient
      .from('payments')
      .select('id, paymongo_checkout_session_id, status')
      .eq('booking_id', bookingId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // If there's an existing pending payment with a checkout session, return that
    if (existingPayment?.paymongo_checkout_session_id) {
      // Could optionally verify the session is still active with PayMongo
      // For simplicity, we'll create a new one since sessions expire
    }

    // 3. Create payment record with status 'pending'
    const { data: payment, error: paymentError } = await adminClient
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount: booking.total_amount,
        currency: booking.currency || 'PHP',
        status: 'pending'
      })
      .select('id')
      .single();

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return handleDatabaseError(paymentError);
    }

    // 4. Build checkout URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                    process.env.NEXT_PUBLIC_APP_URL ||
                    'http://localhost:3000';

    const successUrl = `${baseUrl}/book/confirmation?booking=${booking.booking_number}&status=success`;
    const cancelUrl = `${baseUrl}/book/confirmation?booking=${booking.booking_number}&status=cancelled`;

    // Build description
    const propertyName = (booking.properties as any)?.name || 'Property';
    const guestName = (booking.guests as any)?.first_name || 'Guest';
    const description = `${propertyName} - ${booking.check_in} to ${booking.check_out} - ${guestName}`;

    // 5. Call createCheckoutSession() from paymongo.ts
    const checkoutSession = await createCheckoutSession({
      amount: parseFloat(booking.total_amount),
      description: description,
      bookingReference: booking.booking_number,
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      metadata: {
        booking_id: bookingId,
        payment_id: payment.id,
        property_id: booking.property_id
      }
    });

    // 6. Update payment with PayMongo IDs
    const { error: updateError } = await adminClient
      .from('payments')
      .update({
        paymongo_checkout_session_id: checkoutSession.id,
        reference_number: booking.booking_number
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Error updating payment with PayMongo session:', updateError);
      // Don't fail the request - the payment was created
    }

    console.log(`Checkout session created for booking ${booking.booking_number}: ${checkoutSession.id}`);

    // 7. Return checkout URL
    return successResponse(
      {
        checkoutUrl: checkoutSession.attributes.checkout_url,
        sessionId: checkoutSession.id,
        bookingNumber: booking.booking_number,
        amount: booking.total_amount,
        currency: booking.currency || 'PHP'
      },
      'Checkout session created successfully'
    );

  } catch (error) {
    console.error('Create checkout error:', error);

    if (error instanceof PayMongoConfigError) {
      return errorResponse(
        'Payment gateway not configured. Please contact support.',
        503
      );
    }

    if (error instanceof PayMongoAPIError) {
      return errorResponse(
        error.message,
        error.statusCode >= 400 && error.statusCode < 500 ? error.statusCode : 502,
        { code: error.code }
      );
    }

    return errorResponse(
      'Failed to create checkout session',
      500,
      process.env.NODE_ENV === 'development' ? String(error) : undefined
    );
  }
}
