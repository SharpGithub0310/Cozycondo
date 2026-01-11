/**
 * PayMongo Payment Gateway Integration
 *
 * Handles payment processing for bookings via PayMongo API.
 * Supports GCash, Maya (PayMaya), Grab Pay, Cards, and Direct Online Banking.
 */

// =============================================================================
// Types & Interfaces
// =============================================================================

export type PaymentMethod = 'gcash' | 'grab_pay' | 'paymaya' | 'card' | 'dob';

export type CheckoutSessionStatus = 'active' | 'expired' | 'paid' | 'payment_failed';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';

export interface PayMongoError {
  code: string;
  detail: string;
  source?: {
    pointer?: string;
    attribute?: string;
  };
}

export interface PayMongoErrorResponse {
  errors: PayMongoError[];
}

export interface CheckoutSessionOptions {
  amount: number; // Amount in PHP (will be converted to centavos)
  description: string;
  bookingReference: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSessionPaymentIntent {
  id: string;
  type: 'payment_intent';
  attributes: {
    amount: number;
    currency: string;
    description: string;
    statement_descriptor: string;
    status: string;
    payments: PaymentResource[];
  };
}

export interface CheckoutSessionAttributes {
  billing?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  checkout_url: string;
  client_key: string;
  description: string;
  line_items: Array<{
    amount: number;
    currency: string;
    description: string;
    name: string;
    quantity: number;
  }>;
  livemode: boolean;
  merchant: string;
  payment_intent: CheckoutSessionPaymentIntent | null;
  payment_method_types: PaymentMethod[];
  payments: PaymentResource[];
  reference_number: string;
  send_email_receipt: boolean;
  show_description: boolean;
  show_line_items: boolean;
  status: CheckoutSessionStatus;
  success_url: string;
  cancel_url: string;
  created_at: number;
  updated_at: number;
  paid_at: number | null;
  expired_at: number | null;
  metadata: Record<string, string> | null;
}

export interface CheckoutSessionResource {
  id: string;
  type: 'checkout_session';
  attributes: CheckoutSessionAttributes;
}

export interface CheckoutSessionResponse {
  data: CheckoutSessionResource;
}

export interface PaymentAttributes {
  access_url: string | null;
  amount: number;
  balance_transaction_id: string | null;
  billing: {
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
    email?: string;
    name?: string;
    phone?: string;
  } | null;
  currency: string;
  description: string;
  disputed: boolean;
  external_reference_number: string | null;
  fee: number;
  livemode: boolean;
  net_amount: number;
  origin: string;
  payment_intent_id: string | null;
  payout: string | null;
  source: {
    id: string;
    type: string;
  };
  statement_descriptor: string;
  status: PaymentStatus;
  tax_amount: number | null;
  refunds: any[];
  taxes: any[];
  available_at: number;
  created_at: number;
  paid_at: number;
  updated_at: number;
  metadata: Record<string, string> | null;
}

export interface PaymentResource {
  id: string;
  type: 'payment';
  attributes: PaymentAttributes;
}

export interface PaymentResponse {
  data: PaymentResource;
}

export interface WebhookEvent {
  id: string;
  type: string;
  attributes: {
    type: string;
    livemode: boolean;
    data: {
      id: string;
      type: string;
      attributes: any;
    };
    previous_data: any;
    created_at: number;
    updated_at: number;
  };
}

export interface GatewayFeeResult {
  gatewayFee: number;
  netAmount: number;
}

// =============================================================================
// Configuration
// =============================================================================

const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';

const ENABLED_PAYMENT_METHODS: PaymentMethod[] = [
  'gcash',
  'grab_pay',
  'paymaya',
  'card',
  'dob'
];

// Fee rates per payment method
const FEE_RATES: Record<PaymentMethod, { percentage: number; fixed: number }> = {
  gcash: { percentage: 0.025, fixed: 0 },      // 2.5%
  grab_pay: { percentage: 0.025, fixed: 0 },   // 2.5%
  paymaya: { percentage: 0.025, fixed: 0 },    // 2.5%
  card: { percentage: 0.035, fixed: 15 },      // 3.5% + PHP 15
  dob: { percentage: 0.025, fixed: 0 }         // 2.5% (direct online banking)
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the PayMongo secret key from environment
 */
function getSecretKey(): string {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key) {
    throw new PayMongoConfigError('PAYMONGO_SECRET_KEY is not configured');
  }
  return key;
}

/**
 * Get the PayMongo webhook secret from environment
 */
function getWebhookSecret(): string {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret) {
    throw new PayMongoConfigError('PAYMONGO_WEBHOOK_SECRET is not configured');
  }
  return secret;
}

/**
 * Create Basic Auth header from secret key
 */
function createAuthHeader(secretKey: string): string {
  const encoded = Buffer.from(`${secretKey}:`).toString('base64');
  return `Basic ${encoded}`;
}

/**
 * Convert PHP to centavos (PayMongo uses centavos)
 */
export function phpToCentavos(php: number): number {
  return Math.round(php * 100);
}

/**
 * Convert centavos to PHP
 */
export function centavosToPhp(centavos: number): number {
  return centavos / 100;
}

/**
 * Make a request to the PayMongo API
 */
async function paymongoRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const secretKey = getSecretKey();

  const response = await fetch(`${PAYMONGO_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': createAuthHeader(secretKey),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    const errorResponse = data as PayMongoErrorResponse;
    const firstError = errorResponse.errors?.[0];
    throw new PayMongoAPIError(
      firstError?.detail || 'PayMongo API request failed',
      firstError?.code || 'unknown_error',
      response.status,
      errorResponse.errors
    );
  }

  return data as T;
}

// =============================================================================
// Custom Error Classes
// =============================================================================

export class PayMongoConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PayMongoConfigError';
  }
}

export class PayMongoAPIError extends Error {
  code: string;
  statusCode: number;
  errors: PayMongoError[];

  constructor(
    message: string,
    code: string,
    statusCode: number,
    errors: PayMongoError[] = []
  ) {
    super(message);
    this.name = 'PayMongoAPIError';
    this.code = code;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class PayMongoWebhookError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PayMongoWebhookError';
  }
}

// =============================================================================
// Main API Functions
// =============================================================================

/**
 * Create a PayMongo checkout session
 *
 * @param options - Checkout session configuration
 * @returns Checkout session with checkout_url for redirecting the customer
 */
export async function createCheckoutSession(
  options: CheckoutSessionOptions
): Promise<CheckoutSessionResource> {
  const { amount, description, bookingReference, successUrl, cancelUrl, metadata } = options;

  // Convert PHP to centavos
  const amountInCentavos = phpToCentavos(amount);

  // Minimum amount is PHP 100 (10000 centavos)
  if (amountInCentavos < 10000) {
    throw new PayMongoAPIError(
      'Minimum payment amount is PHP 100',
      'amount_too_small',
      400
    );
  }

  const payload = {
    data: {
      attributes: {
        billing: null,
        send_email_receipt: true,
        show_description: true,
        show_line_items: true,
        description: description,
        line_items: [
          {
            currency: 'PHP',
            amount: amountInCentavos,
            description: description,
            name: `Booking: ${bookingReference}`,
            quantity: 1
          }
        ],
        payment_method_types: ENABLED_PAYMENT_METHODS,
        reference_number: bookingReference,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          booking_reference: bookingReference,
          ...metadata
        }
      }
    }
  };

  const response = await paymongoRequest<CheckoutSessionResponse>(
    '/checkout_sessions',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );

  return response.data;
}

/**
 * Retrieve a checkout session by ID
 *
 * @param sessionId - The checkout session ID (starts with 'cs_')
 * @returns Checkout session details including payment status
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<CheckoutSessionResource> {
  if (!sessionId || !sessionId.startsWith('cs_')) {
    throw new PayMongoAPIError(
      'Invalid checkout session ID format',
      'invalid_session_id',
      400
    );
  }

  const response = await paymongoRequest<CheckoutSessionResponse>(
    `/checkout_sessions/${sessionId}`
  );

  return response.data;
}

/**
 * Retrieve a payment by ID
 *
 * @param paymentId - The payment ID (starts with 'pay_')
 * @returns Payment details including amount, status, and payment method
 */
export async function getPayment(paymentId: string): Promise<PaymentResource> {
  if (!paymentId || !paymentId.startsWith('pay_')) {
    throw new PayMongoAPIError(
      'Invalid payment ID format',
      'invalid_payment_id',
      400
    );
  }

  const response = await paymongoRequest<PaymentResponse>(
    `/payments/${paymentId}`
  );

  return response.data;
}

/**
 * Verify PayMongo webhook signature
 *
 * PayMongo webhooks use HMAC-SHA256 for signature verification.
 * The signature header format is: t=<timestamp>,te=<test_signature>,li=<live_signature>
 *
 * @param payload - The raw request body as a string
 * @param signatureHeader - The 'Paymongo-Signature' header value
 * @param webhookSecret - Optional webhook secret (defaults to env variable)
 * @returns true if signature is valid, false otherwise
 */
export async function verifyWebhookSignature(
  payload: string,
  signatureHeader: string,
  webhookSecret?: string
): Promise<boolean> {
  const secret = webhookSecret || getWebhookSecret();

  try {
    // Parse the signature header
    const parts = signatureHeader.split(',');
    const signatureParts: Record<string, string> = {};

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key && value) {
        signatureParts[key] = value;
      }
    }

    const timestamp = signatureParts['t'];
    // Use test signature (te) in test mode, live signature (li) in production
    const signature = signatureParts['te'] || signatureParts['li'];

    if (!timestamp || !signature) {
      console.error('Missing timestamp or signature in webhook header');
      return false;
    }

    // Create the signed payload: timestamp + '.' + payload
    const signedPayload = `${timestamp}.${payload}`;

    // Compute HMAC-SHA256
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // Compare signatures (timing-safe comparison)
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Calculate PayMongo gateway fees based on payment method
 *
 * Fee structure:
 * - GCash/Maya/GrabPay/DOB: 2.5%
 * - Cards: 3.5% + PHP 15
 *
 * @param amount - Amount in PHP
 * @param paymentMethod - The payment method used
 * @returns Object containing gateway fee and net amount (both in PHP)
 */
export function calculateGatewayFee(
  amount: number,
  paymentMethod: PaymentMethod
): GatewayFeeResult {
  const rates = FEE_RATES[paymentMethod];

  if (!rates) {
    // Default to card rates if unknown payment method
    const gatewayFee = amount * 0.035 + 15;
    return {
      gatewayFee: Math.round(gatewayFee * 100) / 100,
      netAmount: Math.round((amount - gatewayFee) * 100) / 100
    };
  }

  const gatewayFee = amount * rates.percentage + rates.fixed;
  const netAmount = amount - gatewayFee;

  return {
    gatewayFee: Math.round(gatewayFee * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if PayMongo is properly configured
 */
export function isPayMongoConfigured(): boolean {
  return !!(
    process.env.PAYMONGO_SECRET_KEY &&
    process.env.PAYMONGO_PUBLIC_KEY
  );
}

/**
 * Check if we're in test mode (using test keys)
 */
export function isTestMode(): boolean {
  const secretKey = process.env.PAYMONGO_SECRET_KEY || '';
  return secretKey.startsWith('sk_test_');
}

/**
 * Get the public key for client-side usage
 */
export function getPublicKey(): string {
  const key = process.env.PAYMONGO_PUBLIC_KEY;
  if (!key) {
    throw new PayMongoConfigError('PAYMONGO_PUBLIC_KEY is not configured');
  }
  return key;
}

/**
 * Parse webhook event from request body
 */
export function parseWebhookEvent(body: any): WebhookEvent {
  if (!body || !body.data) {
    throw new PayMongoWebhookError('Invalid webhook payload structure');
  }
  return body.data as WebhookEvent;
}

/**
 * Get payment method display name
 */
export function getPaymentMethodDisplayName(method: PaymentMethod): string {
  const displayNames: Record<PaymentMethod, string> = {
    gcash: 'GCash',
    grab_pay: 'GrabPay',
    paymaya: 'Maya',
    card: 'Credit/Debit Card',
    dob: 'Online Banking'
  };
  return displayNames[method] || method;
}

/**
 * Format amount for display (PHP currency)
 */
export function formatPhpAmount(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount);
}
