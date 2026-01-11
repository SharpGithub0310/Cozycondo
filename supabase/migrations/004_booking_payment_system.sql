-- Booking and Payment System Migration
-- This migration adds guests, bookings, and payments tables for the booking flow

-- =============================================
-- GUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS guests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(100) DEFAULT 'Philippines',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for guest lookups
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(last_name, first_name);

-- =============================================
-- BOOKINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_number VARCHAR(20) NOT NULL UNIQUE, -- Format: CC-YYYYMMDD-XXX
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  num_guests INTEGER DEFAULT 1,
  num_nights INTEGER GENERATED ALWAYS AS (check_out - check_in) STORED,
  nightly_rate DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  cleaning_fee DECIMAL(10,2) DEFAULT 0,
  parking_fee DECIMAL(10,2) DEFAULT 0,
  admin_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, paid, checked_in, checked_out, cancelled, refunded
  source VARCHAR(20) DEFAULT 'website', -- website, airbnb, direct
  special_requests TEXT,
  internal_notes TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- Ensure check_out is after check_in
  CONSTRAINT valid_dates CHECK (check_out > check_in),
  -- Ensure num_guests is positive
  CONSTRAINT valid_num_guests CHECK (num_guests > 0),
  -- Ensure amounts are non-negative
  CONSTRAINT valid_nightly_rate CHECK (nightly_rate >= 0),
  CONSTRAINT valid_subtotal CHECK (subtotal >= 0),
  CONSTRAINT valid_cleaning_fee CHECK (cleaning_fee >= 0),
  CONSTRAINT valid_parking_fee CHECK (parking_fee >= 0),
  CONSTRAINT valid_admin_fee CHECK (admin_fee >= 0),
  CONSTRAINT valid_total_amount CHECK (total_amount >= 0)
);

-- Create indexes for booking queries
CREATE INDEX IF NOT EXISTS idx_bookings_property ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  paymongo_payment_intent_id VARCHAR(100),
  paymongo_payment_id VARCHAR(100),
  paymongo_checkout_session_id VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  payment_method VARCHAR(50), -- gcash, maya, card, bank_transfer
  gateway_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, succeeded, failed, cancelled, refunded
  reference_number VARCHAR(100),
  receipt_url TEXT,
  failure_code VARCHAR(50),
  failure_message TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- Ensure amount is positive
  CONSTRAINT valid_payment_amount CHECK (amount > 0),
  -- Ensure gateway_fee is non-negative
  CONSTRAINT valid_gateway_fee CHECK (gateway_fee >= 0)
);

-- Create indexes for payment queries
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_paymongo_intent ON payments(paymongo_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_paymongo_session ON payments(paymongo_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- =============================================
-- ENHANCE PROPERTIES TABLE
-- =============================================
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS property_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS custom_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS cleaning_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS parking_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS admin_fee_percent DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_nights INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_nights INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS instant_book BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ical_last_sync TIMESTAMP WITH TIME ZONE;

-- Create index for property_code
CREATE INDEX IF NOT EXISTS idx_properties_property_code ON properties(property_code);

-- =============================================
-- ENHANCE CALENDAR_EVENTS TABLE
-- =============================================
ALTER TABLE calendar_events
ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS synced_at TIMESTAMP WITH TIME ZONE;

-- Create index for booking_id lookup
CREATE INDEX IF NOT EXISTS idx_calendar_events_booking ON calendar_events(booking_id);

-- =============================================
-- UPDATE TRIGGERS FOR NEW TABLES
-- =============================================

-- Trigger for guests updated_at
DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;
CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for bookings updated_at
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for payments updated_at
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- =============================================

-- Enable RLS on new tables
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- GUESTS TABLE POLICIES

-- Public can create guests (for booking flow)
CREATE POLICY "Public can create guests" ON guests
  FOR INSERT WITH CHECK (true);

-- Public can view their own guest record by email (for booking lookup)
CREATE POLICY "Public can view own guest record" ON guests
  FOR SELECT USING (true);

-- Service role has full access
CREATE POLICY "Service role full access to guests" ON guests
  FOR ALL USING (auth.role() = 'service_role');

-- BOOKINGS TABLE POLICIES

-- Public can create bookings (for booking flow)
CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Public can view bookings (for booking confirmation/status)
CREATE POLICY "Public can view bookings" ON bookings
  FOR SELECT USING (true);

-- Public can update bookings (for status updates via webhooks)
CREATE POLICY "Public can update bookings" ON bookings
  FOR UPDATE USING (true);

-- Service role has full access
CREATE POLICY "Service role full access to bookings" ON bookings
  FOR ALL USING (auth.role() = 'service_role');

-- PAYMENTS TABLE POLICIES

-- Public can create payments (for payment flow)
CREATE POLICY "Public can create payments" ON payments
  FOR INSERT WITH CHECK (true);

-- Public can view payments (for payment status)
CREATE POLICY "Public can view payments" ON payments
  FOR SELECT USING (true);

-- Public can update payments (for webhook updates)
CREATE POLICY "Public can update payments" ON payments
  FOR UPDATE USING (true);

-- Service role has full access
CREATE POLICY "Service role full access to payments" ON payments
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to generate next property code (PROP-001, PROP-002, etc.)
CREATE OR REPLACE FUNCTION generate_next_property_code()
RETURNS VARCHAR(20) AS $$
DECLARE
  next_num INTEGER;
  new_code VARCHAR(20);
BEGIN
  -- Get the highest existing property code number
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(property_code FROM 'PROP-([0-9]+)') AS INTEGER
      )
    ),
    0
  ) + 1 INTO next_num
  FROM properties
  WHERE property_code ~ '^PROP-[0-9]+$';

  -- Format the new code
  new_code := 'PROP-' || LPAD(next_num::TEXT, 3, '0');

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to generate booking number (CC-YYYYMMDD-XXX)
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS VARCHAR(20) AS $$
DECLARE
  today_str VARCHAR(8);
  next_num INTEGER;
  new_booking_number VARCHAR(20);
BEGIN
  -- Get today's date in YYYYMMDD format
  today_str := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

  -- Get the highest booking number for today
  SELECT COALESCE(
    MAX(
      CAST(
        SUBSTRING(booking_number FROM 'CC-' || today_str || '-([0-9]+)') AS INTEGER
      )
    ),
    0
  ) + 1 INTO next_num
  FROM bookings
  WHERE booking_number LIKE 'CC-' || today_str || '-%';

  -- Format the new booking number
  new_booking_number := 'CC-' || today_str || '-' || LPAD(next_num::TEXT, 3, '0');

  RETURN new_booking_number;
END;
$$ LANGUAGE plpgsql;

-- Function to check date availability for a property
CREATE OR REPLACE FUNCTION check_property_availability(
  p_property_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  is_available BOOLEAN;
BEGIN
  -- Check for overlapping bookings (excluding cancelled/refunded)
  SELECT NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE property_id = p_property_id
      AND status NOT IN ('cancelled', 'refunded')
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
      AND check_in < p_check_out
      AND check_out > p_check_in
  ) AND NOT EXISTS (
    -- Also check calendar_events for blocked dates
    SELECT 1 FROM calendar_events
    WHERE property_id = p_property_id
      AND (p_exclude_booking_id IS NULL OR booking_id IS NULL OR booking_id != p_exclude_booking_id)
      AND start_date < p_check_out
      AND end_date > p_check_in
  ) INTO is_available;

  RETURN is_available;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ASSIGN PROPERTY CODES TO EXISTING PROPERTIES
-- =============================================
DO $$
DECLARE
  prop RECORD;
  new_code VARCHAR(20);
BEGIN
  FOR prop IN SELECT id FROM properties WHERE property_code IS NULL ORDER BY created_at LOOP
    new_code := generate_next_property_code();
    UPDATE properties SET property_code = new_code WHERE id = prop.id;
  END LOOP;
END$$;
