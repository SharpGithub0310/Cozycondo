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

// Legacy PropertyData interface for backwards compatibility
export interface PropertyData {
  id: string;
  name: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  size: string;
  description: string;
  location: string;
  pricePerNight: string;
  airbnbUrl: string;
  icalUrl: string;
  featured: boolean;
  active: boolean;
  amenities: string[];
  photos: string[];
  featuredPhotoIndex: number;
  updatedAt?: string;
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

// Website Settings interface
export interface WebsiteSettings {
  logo: string;
  footerLogo: string;
  heroBackground: string;
  aboutImage: string;
  contactImage: string;
  favicon: string;
  heroBadgeText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  statsUnits: string;
  statsUnitsLabel: string;
  statsRating: string;
  statsRatingLabel: string;
  statsLocation: string;
  statsLocationLabel: string;
  highlyRatedTitle: string;
  highlyRatedSubtitle: string;
  highlyRatedImage: string;
  featuredTitle: string;
  featuredSubtitle: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  facebookUrl?: string;
  messengerUrl?: string;
  checkinTime?: string;
  checkoutTime?: string;
  timezone?: string;
  currency?: string;
  updatedAt?: string;
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
