import { NextRequest } from 'next/server';
import { createAdminClient, rateLimit } from '@/lib/api-auth';
import { successResponse, errorResponse, handleDatabaseError } from '@/lib/api-utils';

/**
 * GET /api/payments/[id]
 *
 * Get payment status by payment ID or booking ID.
 *
 * The ID can be:
 * - A payment UUID
 * - A booking UUID (returns the latest payment for that booking)
 *
 * Query params:
 * - type: 'payment' (default) or 'booking' to specify the ID type
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 100, 15 * 60 * 1000);
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

    const { id } = await params;

    if (!id) {
      return errorResponse('ID is required', 400);
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return errorResponse('Database not configured', 503);
    }

    // Check query param for ID type
    const { searchParams } = new URL(request.url);
    const idType = searchParams.get('type') || 'payment';

    let payment;

    if (idType === 'booking') {
      // Find the latest payment for this booking
      const { data, error } = await adminClient
        .from('payments')
        .select(`
          id,
          booking_id,
          paymongo_payment_id,
          paymongo_checkout_session_id,
          amount,
          currency,
          payment_method,
          gateway_fee,
          net_amount,
          status,
          reference_number,
          receipt_url,
          failure_code,
          failure_message,
          paid_at,
          created_at,
          updated_at,
          bookings (
            booking_number,
            status,
            check_in,
            check_out
          )
        `)
        .eq('booking_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return errorResponse('No payment found for this booking', 404);
        }
        return handleDatabaseError(error);
      }

      payment = data;
    } else {
      // Find payment by payment ID
      const { data, error } = await adminClient
        .from('payments')
        .select(`
          id,
          booking_id,
          paymongo_payment_id,
          paymongo_checkout_session_id,
          amount,
          currency,
          payment_method,
          gateway_fee,
          net_amount,
          status,
          reference_number,
          receipt_url,
          failure_code,
          failure_message,
          paid_at,
          created_at,
          updated_at,
          bookings (
            booking_number,
            status,
            check_in,
            check_out
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return errorResponse('Payment not found', 404);
        }
        return handleDatabaseError(error);
      }

      payment = data;
    }

    if (!payment) {
      return errorResponse('Payment not found', 404);
    }

    // Format response
    const booking = payment.bookings as any;
    const response = {
      id: payment.id,
      bookingId: payment.booking_id,
      bookingNumber: booking?.booking_number || null,
      bookingStatus: booking?.status || null,
      checkIn: booking?.check_in || null,
      checkOut: booking?.check_out || null,
      amount: parseFloat(payment.amount),
      currency: payment.currency,
      paymentMethod: payment.payment_method,
      gatewayFee: payment.gateway_fee ? parseFloat(payment.gateway_fee) : null,
      netAmount: payment.net_amount ? parseFloat(payment.net_amount) : null,
      status: payment.status,
      referenceNumber: payment.reference_number,
      receiptUrl: payment.receipt_url,
      failureCode: payment.failure_code,
      failureMessage: payment.failure_message,
      paidAt: payment.paid_at,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
      paymongoPaymentId: payment.paymongo_payment_id,
      paymongoCheckoutSessionId: payment.paymongo_checkout_session_id
    };

    return successResponse(response, 'Payment retrieved successfully');

  } catch (error) {
    console.error('Get payment error:', error);
    return errorResponse(
      'Failed to retrieve payment',
      500,
      process.env.NODE_ENV === 'development' ? String(error) : undefined
    );
  }
}
