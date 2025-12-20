-- Fix missing website settings for admin interface
-- Add the booking and website settings that are missing from the admin interface

INSERT INTO website_settings (setting_key, setting_value, setting_type, category, description) VALUES
-- Website/General Settings
('website', '', 'text', 'general', 'Website URL'),

-- Booking Settings
('checkin_time', '', 'text', 'booking', 'Check-in time'),
('checkout_time', '', 'text', 'booking', 'Check-out time'),
('timezone', 'Asia/Manila', 'text', 'booking', 'Property timezone'),
('currency', 'PHP', 'text', 'booking', 'Default currency for pricing')

ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = CASE
        WHEN website_settings.setting_value = '' OR website_settings.setting_value IS NULL
        THEN EXCLUDED.setting_value
        ELSE website_settings.setting_value
    END,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = TIMEZONE('utc', NOW());