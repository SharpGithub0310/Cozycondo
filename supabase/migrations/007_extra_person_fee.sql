-- =============================================
-- EXTRA PERSON FEE FEATURE
-- Add fields to support charging extra fees for guests beyond base occupancy
-- =============================================

-- Add base_occupancy column (number of guests included in base price)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS base_occupancy INTEGER DEFAULT 2;

-- Add extra_person_fee column (fee per additional person per night)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS extra_person_fee DECIMAL(10,2) DEFAULT 0;

-- Add extra_person_fee column to bookings to store the calculated fee
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS extra_person_fee DECIMAL(10,2) DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN properties.base_occupancy IS 'Number of guests included in base price';
COMMENT ON COLUMN properties.extra_person_fee IS 'Fee per additional guest per night (PHP)';
COMMENT ON COLUMN bookings.extra_person_fee IS 'Total extra person fee charged for this booking';
