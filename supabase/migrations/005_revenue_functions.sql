-- Revenue Statistics Functions Migration
-- This migration adds SQL functions for calculating revenue statistics

-- =============================================
-- GET REVENUE STATS FUNCTION
-- =============================================
-- Returns revenue statistics for a given date range and optional property
-- Parameters:
--   p_start_date: Start date for the period
--   p_end_date: End date for the period
--   p_property_id: Optional property UUID to filter by (NULL for all properties)
-- Returns: total_revenue, booking_count, total_nights, avg_nightly_rate, occupancy_rate

CREATE OR REPLACE FUNCTION get_revenue_stats(
  p_start_date DATE,
  p_end_date DATE,
  p_property_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_revenue DECIMAL(12,2),
  booking_count BIGINT,
  total_nights BIGINT,
  avg_nightly_rate DECIMAL(10,2),
  occupancy_rate DECIMAL(5,2)
) AS $$
DECLARE
  v_total_available_nights BIGINT;
  v_property_count INTEGER;
BEGIN
  -- Calculate total available nights in the period
  -- (number of days * number of properties)
  IF p_property_id IS NOT NULL THEN
    v_property_count := 1;
  ELSE
    SELECT COUNT(*) INTO v_property_count FROM properties WHERE active = true;
  END IF;

  -- Ensure we have at least 1 property to avoid division by zero
  v_property_count := GREATEST(v_property_count, 1);

  -- Calculate total available nights (days in period * active properties)
  v_total_available_nights := (p_end_date - p_start_date) * v_property_count;

  -- Ensure at least 1 available night to avoid division by zero
  v_total_available_nights := GREATEST(v_total_available_nights, 1);

  RETURN QUERY
  SELECT
    COALESCE(SUM(b.total_amount), 0)::DECIMAL(12,2) AS total_revenue,
    COUNT(b.id) AS booking_count,
    COALESCE(SUM(b.num_nights), 0)::BIGINT AS total_nights,
    CASE
      WHEN COALESCE(SUM(b.num_nights), 0) > 0
      THEN (COALESCE(SUM(b.total_amount), 0) / SUM(b.num_nights))::DECIMAL(10,2)
      ELSE 0::DECIMAL(10,2)
    END AS avg_nightly_rate,
    CASE
      WHEN v_total_available_nights > 0
      THEN (COALESCE(SUM(b.num_nights), 0)::DECIMAL * 100 / v_total_available_nights)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END AS occupancy_rate
  FROM bookings b
  WHERE b.status IN ('paid', 'confirmed', 'checked_in', 'checked_out')
    AND b.check_in >= p_start_date
    AND b.check_out <= p_end_date
    AND (p_property_id IS NULL OR b.property_id = p_property_id);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- GET MONTHLY REVENUE TREND FUNCTION
-- =============================================
-- Returns monthly revenue data for charting
-- Parameters:
--   p_year: Year to get data for
--   p_property_id: Optional property UUID to filter by (NULL for all properties)
-- Returns: month number, month name, revenue, booking count

CREATE OR REPLACE FUNCTION get_monthly_revenue_trend(
  p_year INTEGER,
  p_property_id UUID DEFAULT NULL
)
RETURNS TABLE (
  month_number INTEGER,
  month_name TEXT,
  revenue DECIMAL(12,2),
  booking_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT
      generate_series(1, 12) AS month_num,
      TO_CHAR(TO_DATE(generate_series(1, 12)::TEXT, 'MM'), 'Mon') AS month_abbr
  )
  SELECT
    m.month_num AS month_number,
    m.month_abbr AS month_name,
    COALESCE(SUM(b.total_amount), 0)::DECIMAL(12,2) AS revenue,
    COUNT(b.id) AS booking_count
  FROM months m
  LEFT JOIN bookings b ON
    EXTRACT(MONTH FROM b.check_in) = m.month_num
    AND EXTRACT(YEAR FROM b.check_in) = p_year
    AND b.status IN ('paid', 'confirmed', 'checked_in', 'checked_out')
    AND (p_property_id IS NULL OR b.property_id = p_property_id)
  GROUP BY m.month_num, m.month_abbr
  ORDER BY m.month_num;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- GET PROPERTY REVENUE BREAKDOWN FUNCTION
-- =============================================
-- Returns revenue breakdown by property
-- Parameters:
--   p_start_date: Start date for the period
--   p_end_date: End date for the period
-- Returns: property details with revenue stats

CREATE OR REPLACE FUNCTION get_property_revenue_breakdown(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  property_id UUID,
  property_name VARCHAR(255),
  revenue DECIMAL(12,2),
  booking_count BIGINT,
  total_nights BIGINT,
  occupancy_rate DECIMAL(5,2)
) AS $$
DECLARE
  v_days_in_period INTEGER;
BEGIN
  v_days_in_period := GREATEST(p_end_date - p_start_date, 1);

  RETURN QUERY
  SELECT
    p.id AS property_id,
    p.name AS property_name,
    COALESCE(SUM(b.total_amount), 0)::DECIMAL(12,2) AS revenue,
    COUNT(b.id) AS booking_count,
    COALESCE(SUM(b.num_nights), 0)::BIGINT AS total_nights,
    (COALESCE(SUM(b.num_nights), 0)::DECIMAL * 100 / v_days_in_period)::DECIMAL(5,2) AS occupancy_rate
  FROM properties p
  LEFT JOIN bookings b ON
    b.property_id = p.id
    AND b.status IN ('paid', 'confirmed', 'checked_in', 'checked_out')
    AND b.check_in >= p_start_date
    AND b.check_out <= p_end_date
  WHERE p.active = true
  GROUP BY p.id, p.name
  ORDER BY revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================
-- Allow authenticated users to execute these functions
GRANT EXECUTE ON FUNCTION get_revenue_stats(DATE, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_stats(DATE, DATE, UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_monthly_revenue_trend(INTEGER, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_revenue_trend(INTEGER, UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_property_revenue_breakdown(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_property_revenue_breakdown(DATE, DATE) TO anon;
