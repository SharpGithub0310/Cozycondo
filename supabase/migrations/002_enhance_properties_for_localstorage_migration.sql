-- Enhanced database schema for localStorage migration
-- This migration extends the existing schema to fully support PropertyData and WebsiteSettings interfaces

-- =============================================
-- ENHANCE PROPERTIES TABLE FOR LOCALSTORAGE MIGRATION
-- =============================================

-- Add missing columns to properties table to match PropertyData interface
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'apartment',
ADD COLUMN IF NOT EXISTS bedrooms INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS bathrooms INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_guests INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS size_sqm VARCHAR(10) DEFAULT '45',
ADD COLUMN IF NOT EXISTS price_per_night VARCHAR(10) DEFAULT '2500',
ADD COLUMN IF NOT EXISTS featured_photo_index INTEGER DEFAULT 0;

-- Update existing columns to match localStorage data structure
-- Rename ical_url column to ical_url if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'ical_url') THEN
        ALTER TABLE properties RENAME COLUMN airbnb_ical_url TO ical_url;
    END IF;
EXCEPTION
    WHEN undefined_column THEN
        ALTER TABLE properties ADD COLUMN ical_url TEXT;
END$$;

-- Add index for property type and featured status
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_per_night);

-- =============================================
-- WEBSITE SETTINGS TABLE FOR LOCALSTORAGE MIGRATION
-- =============================================

-- Create a more flexible settings table that supports key-value pairs
CREATE TABLE IF NOT EXISTS website_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type VARCHAR(20) DEFAULT 'text', -- 'text', 'number', 'boolean', 'json', 'image'
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster setting lookups
CREATE INDEX IF NOT EXISTS idx_website_settings_key ON website_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_website_settings_category ON website_settings(category);

-- =============================================
-- CALENDAR BLOCKS TABLE (ENHANCED)
-- =============================================

-- Rename calendar_events to calendar_blocks for consistency with localStorage
CREATE TABLE IF NOT EXISTS calendar_blocks (
  id VARCHAR(255) PRIMARY KEY, -- Use string ID to match localStorage format
  property_id VARCHAR(50) NOT NULL, -- Use string to match localStorage property IDs
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT DEFAULT 'Blocked',
  source VARCHAR(20) DEFAULT 'manual', -- 'manual' or 'airbnb'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for calendar queries
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_property ON calendar_blocks(property_id);
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_dates ON calendar_blocks(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_source ON calendar_blocks(source);

-- =============================================
-- UPDATE TRIGGERS FOR NEW TABLES
-- =============================================

-- Create trigger for website_settings updated_at
DROP TRIGGER IF EXISTS update_website_settings_updated_at ON website_settings;
CREATE TRIGGER update_website_settings_updated_at
  BEFORE UPDATE ON website_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for calendar_blocks updated_at
DROP TRIGGER IF EXISTS update_calendar_blocks_updated_at ON calendar_blocks;
CREATE TRIGGER update_calendar_blocks_updated_at
  BEFORE UPDATE ON calendar_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- =============================================

-- Enable RLS on new tables
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_blocks ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view website settings" ON website_settings
  FOR SELECT USING (true);

CREATE POLICY "Public can view calendar blocks" ON calendar_blocks
  FOR SELECT USING (true);

-- Create policies for service role (admin) full access
CREATE POLICY "Service role full access to website settings" ON website_settings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to calendar blocks" ON calendar_blocks
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- INSERT DEFAULT WEBSITE SETTINGS
-- =============================================

-- Insert default website settings that match WebsiteSettings interface
INSERT INTO website_settings (setting_key, setting_value, setting_type, category, description) VALUES
-- Image Settings
('logo', '', 'image', 'images', 'Main site logo'),
('footer_logo', '', 'image', 'images', 'Footer logo'),
('hero_background', '', 'image', 'images', 'Hero section background image'),
('about_image', '', 'image', 'images', 'About section image'),
('contact_image', '', 'image', 'images', 'Contact section image'),
('favicon', '', 'image', 'images', 'Site favicon'),

-- Hero Section Content
('hero_badge_text', '', 'text', 'hero', 'Hero badge text'),
('hero_title', 'Your Cozy Escape in Iloilo City', 'text', 'hero', 'Main hero title'),
('hero_subtitle', '', 'text', 'hero', 'Hero subtitle'),
('hero_description', 'Experience the perfect blend of comfort and convenience. Our handpicked condominiums offer modern amenities, stunning views, and prime locations across Iloilo City.', 'text', 'hero', 'Hero description'),

-- Statistics
('stats_units', '9+', 'text', 'stats', 'Number of units statistic'),
('stats_units_label', 'Premium Units', 'text', 'stats', 'Units statistic label'),
('stats_rating', '4.9', 'text', 'stats', 'Rating statistic'),
('stats_rating_label', 'Guest Rating', 'text', 'stats', 'Rating statistic label'),
('stats_location', 'Iloilo', 'text', 'stats', 'Location statistic'),
('stats_location_label', 'City Center', 'text', 'stats', 'Location statistic label'),

-- Highly Rated Section
('highly_rated_title', 'Highly Rated', 'text', 'sections', 'Highly rated section title'),
('highly_rated_subtitle', 'by our guests', 'text', 'sections', 'Highly rated section subtitle'),
('highly_rated_image', '', 'image', 'sections', 'Highly rated section image'),

-- Featured Properties Section
('featured_title', 'Featured Properties', 'text', 'sections', 'Featured properties section title'),
('featured_subtitle', 'Handpicked condominiums offering the perfect balance of comfort, convenience, and style.', 'text', 'sections', 'Featured properties section subtitle')

ON CONFLICT (setting_key) DO NOTHING;

-- =============================================
-- MIGRATE DATA FROM EXISTING TABLES (IF ANY)
-- =============================================

-- Migrate from site_settings to website_settings if data exists
DO $$
DECLARE
    settings_record RECORD;
BEGIN
    -- Check if site_settings table has data
    IF EXISTS (SELECT 1 FROM site_settings LIMIT 1) THEN
        -- Migrate data from site_settings to website_settings
        FOR settings_record IN SELECT * FROM site_settings LOOP
            -- Map site_settings fields to website_settings
            INSERT INTO website_settings (setting_key, setting_value, setting_type, category) VALUES
            ('site_name', settings_record.site_name, 'text', 'general'),
            ('tagline', settings_record.tagline, 'text', 'general'),
            ('description', settings_record.description, 'text', 'general'),
            ('phone', settings_record.phone, 'text', 'contact'),
            ('email', settings_record.email, 'text', 'contact'),
            ('facebook_url', settings_record.facebook_url, 'text', 'social'),
            ('messenger_url', settings_record.messenger_url, 'text', 'social'),
            ('address', settings_record.address, 'text', 'contact'),
            ('logo_url', settings_record.logo_url, 'image', 'images'),
            ('hero_title', settings_record.hero_title, 'text', 'hero'),
            ('hero_subtitle', settings_record.hero_subtitle, 'text', 'hero'),
            ('about_title', settings_record.about_title, 'text', 'sections'),
            ('about_content', settings_record.about_content, 'text', 'sections')
            ON CONFLICT (setting_key) DO UPDATE SET
                setting_value = EXCLUDED.setting_value,
                updated_at = TIMEZONE('utc', NOW());
        END LOOP;
    END IF;
END$$;

-- =============================================
-- HELPER FUNCTIONS FOR LOCALSTORAGE MIGRATION
-- =============================================

-- Function to get all website settings as JSON (for easy frontend consumption)
CREATE OR REPLACE FUNCTION get_website_settings_json()
RETURNS JSON AS $$
DECLARE
    settings JSON;
BEGIN
    SELECT json_object_agg(setting_key, setting_value) INTO settings
    FROM website_settings;

    RETURN settings;
END;
$$ LANGUAGE plpgsql;

-- Function to update multiple settings at once
CREATE OR REPLACE FUNCTION update_website_settings(settings_json JSON)
RETURNS VOID AS $$
DECLARE
    setting_record RECORD;
    key TEXT;
    value TEXT;
BEGIN
    -- Loop through JSON object
    FOR key, value IN SELECT * FROM json_each_text(settings_json) LOOP
        INSERT INTO website_settings (setting_key, setting_value, updated_at)
        VALUES (key, value, TIMEZONE('utc', NOW()))
        ON CONFLICT (setting_key)
        DO UPDATE SET
            setting_value = EXCLUDED.setting_value,
            updated_at = TIMEZONE('utc', NOW());
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to migrate property data with string IDs
CREATE OR REPLACE FUNCTION upsert_property_with_string_id(
    property_id TEXT,
    property_name TEXT,
    property_type TEXT DEFAULT 'apartment',
    bedrooms_count INTEGER DEFAULT 2,
    bathrooms_count INTEGER DEFAULT 1,
    max_guests_count INTEGER DEFAULT 4,
    size_sqm_value TEXT DEFAULT '45',
    description_text TEXT DEFAULT '',
    location_text TEXT DEFAULT '',
    price_per_night_value TEXT DEFAULT '2500',
    airbnb_url_value TEXT DEFAULT '',
    ical_url_value TEXT DEFAULT '',
    featured_flag BOOLEAN DEFAULT false,
    active_flag BOOLEAN DEFAULT true,
    amenities_array TEXT[] DEFAULT '{}',
    photos_array TEXT[] DEFAULT '{}',
    featured_photo_index_value INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    result_uuid UUID;
    existing_uuid UUID;
BEGIN
    -- Check if property with this string ID exists
    SELECT id INTO existing_uuid FROM properties WHERE slug = property_id;

    IF existing_uuid IS NOT NULL THEN
        -- Update existing property
        UPDATE properties SET
            name = property_name,
            type = property_type,
            bedrooms = bedrooms_count,
            bathrooms = bathrooms_count,
            max_guests = max_guests_count,
            size_sqm = size_sqm_value,
            description = description_text,
            location = location_text,
            price_per_night = price_per_night_value,
            airbnb_url = airbnb_url_value,
            ical_url = ical_url_value,
            featured = featured_flag,
            active = active_flag,
            amenities = amenities_array,
            featured_photo_index = featured_photo_index_value,
            updated_at = TIMEZONE('utc', NOW())
        WHERE id = existing_uuid;

        result_uuid := existing_uuid;
    ELSE
        -- Insert new property
        INSERT INTO properties (
            name, slug, type, bedrooms, bathrooms, max_guests, size_sqm,
            description, location, price_per_night, airbnb_url, ical_url,
            featured, active, amenities, featured_photo_index
        ) VALUES (
            property_name, property_id, property_type, bedrooms_count,
            bathrooms_count, max_guests_count, size_sqm_value, description_text,
            location_text, price_per_night_value, airbnb_url_value, ical_url_value,
            featured_flag, active_flag, amenities_array, featured_photo_index_value
        ) RETURNING id INTO result_uuid;
    END IF;

    -- Update/insert photos
    DELETE FROM property_photos WHERE property_id = result_uuid;

    IF array_length(photos_array, 1) > 0 THEN
        INSERT INTO property_photos (property_id, url, is_primary, display_order)
        SELECT
            result_uuid,
            photo_url,
            (array_position(photos_array, photo_url) - 1) = featured_photo_index_value,
            array_position(photos_array, photo_url) - 1
        FROM unnest(photos_array) AS photo_url;
    END IF;

    RETURN result_uuid;
END;
$$ LANGUAGE plpgsql;