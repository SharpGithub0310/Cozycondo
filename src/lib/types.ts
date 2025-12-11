// Property Types
export interface Property {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  location: string;
  address: string;
  map_url?: string;
  airbnb_url?: string;
  airbnb_ical_url?: string;
  amenities: string[];
  featured: boolean;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyPhoto {
  id: string;
  property_id: string;
  url: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  property_id: string;
  title: string;
  start_date: string;
  end_date: string;
  source: 'airbnb' | 'manual';
  external_id?: string;
  created_at: string;
  updated_at: string;
}

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  published: boolean;
  published_at?: string;
  author: string;
  created_at: string;
  updated_at: string;
}

// Site Settings
export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  facebook_url: string;
  messenger_url: string;
  address: string;
  logo_url?: string;
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_content: string;
  created_at: string;
  updated_at: string;
}

// Amenity icon mapping
export const amenityIcons: Record<string, string> = {
  'wifi': 'Wifi',
  'air-conditioning': 'Wind',
  'kitchen': 'UtensilsCrossed',
  'parking': 'Car',
  'pool': 'Waves',
  'gym': 'Dumbbell',
  'balcony': 'Building',
  'city-view': 'Building2',
  'smart-tv': 'Tv',
  'washer': 'WashingMachine',
  'elevator': 'ArrowUpDown',
  'security': 'Shield',
  'workspace': 'Monitor',
  'coffee-maker': 'Coffee',
  'microwave': 'Microwave',
  'refrigerator': 'Refrigerator',
};
