import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/api-auth';
import {
  verifyWebhookSignature,
  parseWebhookEvent,
  centavosToPhp,
  PayMongoWebhookError
} from '@/lib/paymongo';

/**
 * POST /api/payments/webhook
 *
 * Handles PayMongo webhook events.
 * NO authentication - PayMongo calls this endpoint directly.
 *
 * Handles events:
 * - checkout_session.payment.paid: Update payment & booking status to paid
 * - payment.failed: Mark payment as failed
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();

    // Get the signature header
    const signatureHeader = request.headers.get('paymongo-signature');
    if (!signatureHeader) {
      console.error('Webhook missing signature header');
      return NextResponse.json(
        { error: 'Missing signature header' },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(rawBody, signatureHeader);
    if (!isValid) {
      console.error('Webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    const body = JSON.parse(rawBody);
    const event = parseWebhookEvent(body);

    const eventType = event.attributes.type;
    console.log(`Received PayMongo webhook: ${eventType}`);

    const adminClient = createAdminClient();
    if (!adminClient) {
      console.error('Database not configured for webhook processing');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Handle different event types
    switch (eventType) {
      case 'checkout_session.payment.paid':
        await handleCheckoutSessionPaid(adminClient, event);
        break;

      case 'payment.failed':
        await handlePaymentFailed(adminClient, event);
        break;

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);

    if (error instanceof PayMongoWebhookError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Return 200 even on processing errors to prevent retries for invalid payloads
    // Log the error for investigation
    return NextResponse.json({ received: true, error: 'Processing error logged' });
  }
}

/**
 * Handle checkout_session.payment.paid event
 *
 * Flow:
 * 1. Find payment by paymongo_checkout_session_id
 * 2. Update payment status, gateway_fee, net_amount
 * 3. Update booking status to 'paid'
 * 4. Create calendar_event for blocked dates
 */
async function handleCheckoutSessionPaid(adminClient: any, event: any) {
  const checkoutSessionData = event.attributes.data;
  const sessionId = checkoutSessionData.id;
  const sessionAttributes = checkoutSessionData.attributes;

  console.log(`Processing paid checkout session: ${sessionId}`);

  // 1. Find payment by paymongo_checkout_session_id
  const { data: payment, error: paymentError } = await adminClient
    .from('payments')
    .select('id, booking_id, amount')
    .eq('paymongo_checkout_session_id', sessionId)
    .single();

  if (paymentError || !payment) {
    console.error(`Payment not found for checkout session: ${sessionId}`, paymentError);
    throw new Error(`Payment not found for session ${sessionId}`);
  }

  // Extract payment details from the checkout session
  const payments = sessionAttributes.payments || [];
  const firstPayment = payments[0];

  let gatewayFee = 0;
  let netAmount = payment.amount;
  let paymentMethod = null;
  let paymongoPaymentId = null;
  let receiptUrl = null;

  if (firstPayment) {
    const paymentAttrs = firstPayment.attributes;
    // Convert from centavos to PHP
    gatewayFee = paymentAttrs.fee ? centavosToPhp(paymentAttrs.fee) : 0;
    netAmount = paymentAttrs.net_amount ? centavosToPhp(paymentAttrs.net_amount) : payment.amount - gatewayFee;
    paymentMethod = paymentAttrs.source?.type || null;
    paymongoPaymentId = firstPayment.id;
    receiptUrl = paymentAttrs.access_url || null;
  }

  // Get payment intent ID if available
  const paymentIntentId = sessionAttributes.payment_intent?.id || null;

  // 2. Update payment status, gateway_fee, net_amount
  const { error: updatePaymentError } = await adminClient
    .from('payments')
    .update({
      status: 'succeeded',
      paymongo_payment_id: paymongoPaymentId,
      paymongo_payment_intent_id: paymentIntentId,
      payment_method: paymentMethod,
      gateway_fee: gatewayFee,
      net_amount: netAmount,
      receipt_url: receiptUrl,
      paid_at: new Date().toISOString()
    })
    .eq('id', payment.id);

  if (updatePaymentError) {
    console.error('Error updating payment:', updatePaymentError);
    throw updatePaymentError;
  }

  console.log(`Payment ${payment.id} updated to succeeded`);

  // 3. Update booking status to 'paid'
  const { data: booking, error: bookingFetchError } = await adminClient
    .from('bookings')
    .select('id, property_id, check_in, check_out, booking_number')
    .eq('id', payment.booking_id)
    .single();

  if (bookingFetchError || !booking) {
    console.error('Error fetching booking:', bookingFetchError);
    throw new Error(`Booking not found: ${payment.booking_id}`);
  }

  const { error: updateBookingError } = await adminClient
    .from('bookings')
    .update({
      status: 'paid',
      confirmed_at: new Date().toISOString()
    })
    .eq('id', payment.booking_id);

  if (updateBookingError) {
    console.error('Error updating booking:', updateBookingError);
    throw updateBookingError;
  }

  console.log(`Booking ${booking.booking_number} updated to paid`);

  // 4. Create calendar_event to block dates
  const { error: calendarError } = await adminClient
    .from('calendar_events')
    .insert({
      property_id: booking.property_id,
      booking_id: booking.id,
      start_date: booking.check_in,
      end_date: booking.check_out,
      title: `Booking ${booking.booking_number}`,
      event_type: 'booking',
      source: 'website'
    });

  if (calendarError) {
    // Log but don't throw - the payment was successful
    console.error('Error creating calendar event:', calendarError);
  } else {
    console.log(`Calendar event created for booking ${booking.booking_number}`);
  }
}

/**
 * Handle payment.failed event
 *
 * Flow:
 * 1. Find payment by paymongo_payment_id or from metadata
 * 2. Update payment status to 'failed' with failure details
 */
async function handlePaymentFailed(adminClient: any, event: any) {
  const paymentData = event.attributes.data;
  const paymentId = paymentData.id;
  const paymentAttributes = paymentData.attributes;

  console.log(`Processing failed payment: ${paymentId}`);

  // Try to find the payment - first by payment intent ID if available
  let payment = null;
  const paymentIntentId = paymentAttributes.payment_intent_id;

  if (paymentIntentId) {
    const { data } = await adminClient
      .from('payments')
      .select('id, booking_id')
      .eq('paymongo_payment_intent_id', paymentIntentId)
      .single();
    payment = data;
  }

  // If not found, try by checkout session from metadata
  if (!payment && paymentAttributes.metadata?.booking_id) {
    const { data } = await adminClient
      .from('payments')
      .select('id, booking_id')
      .eq('booking_id', paymentAttributes.metadata.booking_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    payment = data;
  }

  if (!payment) {
    console.warn(`Could not find payment record for failed payment: ${paymentId}`);
    return;
  }

  // Update payment with failure details
  const { error: updateError } = await adminClient
    .from('payments')
    .update({
      status: 'failed',
      paymongo_payment_id: paymentId,
      failure_code: paymentAttributes.last_payment_error?.code || 'unknown',
      failure_message: paymentAttributes.last_payment_error?.message || 'Payment failed'
    })
    .eq('id', payment.id);

  if (updateError) {
    console.error('Error updating failed payment:', updateError);
    throw updateError;
  }

  console.log(`Payment ${payment.id} marked as failed`);
}

// Disable body parsing - we need raw body for signature verification
export const config = {
  api: {
    bodyParser: false
  }
};
