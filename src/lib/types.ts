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
  amenities: string[];
  featured: boolean;
  active: boolean;
  display_order: number;
  featuredPhotoIndex?: number;
  cover_photo_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Legacy PropertyData interface for backwards compatibility
export interface PropertyData {
  id: string;
  name: string;
  slug?: string; // Added for compatibility
  title?: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  size: string;
  description: string;
  short_description?: string;
  location: string;
  pricePerNight: string;
  airbnbUrl: string;
  featured: boolean;
  active: boolean;
  amenities: string[];
  photos: string[];
  images?: string[]; // Alternative image field for compatibility
  featuredPhotoIndex: number;
  coverPhotoId?: string | null;
  updatedAt?: string;
  customReference?: string; // User-defined property ID
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


// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category?: string;
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

// Navigation item interface
export interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  description?: string;
}

// Website Settings interface
export interface WebsiteSettings {
  logo: string;
  footerLogo: string;
  aboutImage: string;
  contactImage: string;
  favicon: string;
  heroBadgeText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroScrollText?: string;
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
  // Contact Information
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
  // Booking System
  bookingEnabled?: boolean;
  bookingDisabledMessage?: string;
  // Company/Site Information
  siteName?: string;
  siteTagline?: string;
  companyName?: string;
  companyDescription?: string;
  // Navigation
  navigationItems?: NavigationItem[];
  // Footer Content
  footerDescription?: string;
  footerCopyrightText?: string;
  // Contact Quick Links
  contactPhone?: string;
  contactPhoneDisplay?: string;
  contactEmail?: string;
  contactEmailDisplay?: string;
  // Social Links
  socialFacebook?: string;
  socialMessenger?: string;
  // Availability Status
  availabilityStatus?: string;
  responseTimeStatus?: string;
  // System Status
  systemStatus?: string;
  // Legal Pages
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
  sitemapUrl?: string;
  // Meta
  updatedAt?: string;
  faqs?: FAQ[];
}

// FAQ Types
export interface FAQ {
  id?: string;
  question: string;
  answer: string;
  order?: number;
}

// ===== Testimonials (Showcase Redesign 2026-04-11) =====

export type TestimonialSource = 'airbnb' | 'facebook' | 'google' | 'direct';

export interface Testimonial {
  id: string;
  guestName: string;
  reviewText: string;
  rating: number; // 1-5
  source: TestimonialSource;
  stayMonth: string | null;
  propertyId: string | null;
  displayOrder: number;
  published: boolean;
  createdAt: string;
}

// Shape returned directly from Supabase (snake_case)
export interface TestimonialRow {
  id: string;
  guest_name: string;
  review_text: string;
  rating: number;
  source: TestimonialSource;
  stay_month: string | null;
  property_id: string | null;
  display_order: number;
  published: boolean;
  created_at: string;
}

export function mapTestimonialRow(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    guestName: row.guest_name,
    reviewText: row.review_text,
    rating: row.rating,
    source: row.source,
    stayMonth: row.stay_month,
    propertyId: row.property_id,
    displayOrder: row.display_order,
    published: row.published,
    createdAt: row.created_at,
  };
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
