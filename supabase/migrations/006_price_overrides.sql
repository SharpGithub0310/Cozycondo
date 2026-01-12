-- =============================================
-- PRICE OVERRIDES TABLE
-- Stores date-specific pricing for properties
-- =============================================

-- Create the price_overrides table
CREATE TABLE IF NOT EXISTS price_overrides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(property_id, date)  -- One price per property per date
);

-- Create index for efficient lookups by property and date range
CREATE INDEX IF NOT EXISTS idx_price_overrides_property_date
  ON price_overrides(property_id, date);

-- Create trigger for updated_at
CREATE TRIGGER update_price_overrides_updated_at
  BEFORE UPDATE ON price_overrides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE price_overrides ENABLE ROW LEVEL SECURITY;

-- Public can view price overrides (needed for booking calculations)
CREATE POLICY "Public can view price overrides" ON price_overrides
  FOR SELECT USING (true);

-- Service role has full access
CREATE POLICY "Service role full access to price overrides" ON price_overrides
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- HELPER FUNCTION: Get price for a specific date
-- Returns override price if exists, otherwise NULL
-- =============================================
CREATE OR REPLACE FUNCTION get_price_override(
  p_property_id UUID,
  p_date DATE
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_price DECIMAL(10,2);
BEGIN
  SELECT price INTO v_price
  FROM price_overrides
  WHERE property_id = p_property_id
    AND date = p_date;

  RETURN v_price;  -- Returns NULL if no override exists
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- HELPER FUNCTION: Get prices for a date range
-- Returns a table of dates and prices (only overrides)
-- =============================================
CREATE OR REPLACE FUNCTION get_price_overrides_range(
  p_property_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  override_date DATE,
  override_price DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT date, price
  FROM price_overrides
  WHERE property_id = p_property_id
    AND date >= p_start_date
    AND date <= p_end_date
  ORDER BY date;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- HELPER FUNCTION: Calculate subtotal with dynamic pricing
-- Loops through each night and uses override or base price
-- =============================================
CREATE OR REPLACE FUNCTION calculate_dynamic_subtotal(
  p_property_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_base_price DECIMAL(10,2)
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_subtotal DECIMAL(10,2) := 0;
  v_current_date DATE := p_check_in;
  v_day_price DECIMAL(10,2);
BEGIN
  -- Loop through each night (check-out day is not charged)
  WHILE v_current_date < p_check_out LOOP
    -- Get override price or use base price
    SELECT COALESCE(price, p_base_price) INTO v_day_price
    FROM (SELECT 1) AS dummy
    LEFT JOIN price_overrides po
      ON po.property_id = p_property_id
      AND po.date = v_current_date;

    -- If no join result, use base price
    IF v_day_price IS NULL THEN
      v_day_price := p_base_price;
    END IF;

    v_subtotal := v_subtotal + v_day_price;
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  RETURN v_subtotal;
END;
$$ LANGUAGE plpgsql;
