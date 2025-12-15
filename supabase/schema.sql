-- Cozy Condo Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROPERTIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  location VARCHAR(255),
  address TEXT,
  map_url TEXT,
  airbnb_url TEXT,
  airbnb_ical_url TEXT,
  amenities TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(active);

-- =============================================
-- PROPERTY PHOTOS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS property_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for property photos
CREATE INDEX IF NOT EXISTS idx_property_photos_property ON property_photos(property_id);

-- =============================================
-- CALENDAR EVENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title VARCHAR(255) DEFAULT 'Blocked',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  source VARCHAR(50) DEFAULT 'manual', -- 'manual' or 'airbnb'
  external_id VARCHAR(255), -- For Airbnb sync
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for calendar queries
CREATE INDEX IF NOT EXISTS idx_calendar_property ON calendar_events(property_id);
CREATE INDEX IF NOT EXISTS idx_calendar_dates ON calendar_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_calendar_source ON calendar_events(source);

-- =============================================
-- BLOG POSTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  author VARCHAR(255) DEFAULT 'Cozy Condo Team',
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for blog
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);

-- =============================================
-- SITE SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_name VARCHAR(255) DEFAULT 'Cozy Condo',
  tagline VARCHAR(255) DEFAULT 'Premium Short-Term Rentals in Iloilo City',
  description TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  facebook_url TEXT,
  messenger_url TEXT,
  address TEXT,
  logo_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  about_title TEXT,
  about_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- INSERT DEFAULT SITE SETTINGS
-- =============================================
INSERT INTO site_settings (
  site_name,
  tagline,
  description,
  phone,
  email,
  facebook_url,
  messenger_url,
  address,
  hero_title,
  hero_subtitle,
  about_title,
  about_content
) VALUES (
  'Cozy Condo',
  'Premium Short-Term Rentals in Iloilo City',
  'Discover comfortable and convenient short-term rental condominiums in Iloilo City, Philippines.',
  '+639778870724',
  'admin@cozycondo.net',
  'https://www.facebook.com/cozycondoiloilocity',
  'https://m.me/cozycondoiloilocity',
  'Iloilo City, Philippines',
  'Your Cozy Escape in Iloilo City',
  'Experience the perfect blend of comfort and convenience in our handpicked condominiums.',
  'Welcome to Cozy Condo',
  'Founded with a passion for hospitality, Cozy Condo has been providing exceptional short-term rental experiences in Iloilo City. Our carefully curated collection of condominiums combines modern comfort with warm Filipino hospitality.'
) ON CONFLICT DO NOTHING;

-- =============================================
-- UPDATE TIMESTAMP FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view active properties" ON properties
  FOR SELECT USING (active = true);

CREATE POLICY "Public can view property photos" ON property_photos
  FOR SELECT USING (true);

CREATE POLICY "Public can view calendar events" ON calendar_events
  FOR SELECT USING (true);

CREATE POLICY "Public can view published blog posts" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Public can view site settings" ON site_settings
  FOR SELECT USING (true);

-- Create policies for service role (admin) full access
CREATE POLICY "Service role full access to properties" ON properties
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to photos" ON property_photos
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to calendar" ON calendar_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to blog" ON blog_posts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to settings" ON site_settings
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- SAMPLE DATA (Optional - Remove for production)
-- =============================================
-- Insert sample properties
INSERT INTO properties (name, slug, short_description, description, location, address, amenities, featured, display_order) VALUES
(
  'Cityscape Studio',
  'cityscape-studio',
  'Modern studio with stunning city views. Perfect for business travelers and couples.',
  'Experience modern city living at its finest in this beautifully designed studio unit located in the heart of Iloilo Business Park.',
  'Iloilo Business Park',
  'Megaworld Boulevard, Iloilo Business Park, Mandurriao, Iloilo City',
  ARRAY['WiFi', 'Air-conditioning', 'Kitchen', 'Smart TV', 'Workspace', 'City View', '24/7 Security', 'Gym Access'],
  true,
  1
),
(
  'Garden View Suite',
  'garden-view-suite',
  'Spacious 1-bedroom suite overlooking lush gardens. Ideal for extended stays.',
  'Escape to this serene garden-view suite nestled in the popular Smallville Complex.',
  'Smallville Complex',
  'Smallville Complex, Diversion Road, Mandurriao, Iloilo City',
  ARRAY['WiFi', 'Air-conditioning', 'Parking', 'Kitchen', 'Balcony', 'Smart TV', 'Washer'],
  true,
  2
),
(
  'Downtown Retreat',
  'downtown-retreat',
  'Cozy unit in the heart of downtown. Walking distance to SM City Iloilo.',
  'Discover the charm of old Iloilo in this cozy downtown retreat.',
  'City Proper',
  'J.M. Basa Street, City Proper, Iloilo City',
  ARRAY['WiFi', 'Air-conditioning', 'Smart TV', 'Kitchen', '24/7 Security'],
  true,
  3
)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- STORAGE BUCKETS (Run in Supabase Dashboard)
-- =============================================
-- Note: Storage buckets need to be created via Supabase Dashboard
-- Create a bucket called 'property-photos' with public access
-- Create a bucket called 'blog-images' with public access
