-- Fix column ambiguity in upsert_property_with_string_id function

-- Drop and recreate the function with fixed column references
DROP FUNCTION IF EXISTS upsert_property_with_string_id(
    TEXT, TEXT, TEXT, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, TEXT[], TEXT[], INTEGER
);

-- Recreate the function with explicit table qualifications to avoid ambiguity
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
    SELECT properties.id INTO existing_uuid FROM properties WHERE properties.slug = property_id;

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
        WHERE properties.id = existing_uuid;

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

    -- Update/insert photos - fixed ambiguity by explicitly referencing table columns
    DELETE FROM property_photos WHERE property_photos.property_id = result_uuid;

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