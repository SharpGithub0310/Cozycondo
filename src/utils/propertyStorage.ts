// Simple storage utility for managing property data with photos
// In production, this would be replaced with API calls to your backend/Supabase

interface PropertyData {
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
  icalUrl?: string;
  featured?: boolean;
  active?: boolean;
  amenities: string[];
  photos: string[];
  featuredPhotoIndex?: number;
  updatedAt?: string;
}

const STORAGE_KEY = 'cozy_condo_properties';

// Get all stored properties
export function getStoredProperties(): Record<string, PropertyData> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading stored properties:', error);
    return {};
  }
}

// Save property data
export function saveProperty(id: string, propertyData: PropertyData): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = getStoredProperties();
    stored[id] = {
      ...propertyData,
      id,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Error saving property:', error);
  }
}

// Get specific property data
export function getStoredProperty(id: string): PropertyData | null {
  const stored = getStoredProperties();
  return stored[id] || null;
}

// Update property status (featured/active) without full property data
export function updatePropertyStatus(id: string, updates: { featured?: boolean; active?: boolean }): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = getStoredProperties();
    const existing = stored[id];

    if (existing) {
      // Update existing property
      stored[id] = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Create minimal property record with default data and status
      const defaultData = getDefaultPropertyData(id);
      stored[id] = {
        ...defaultData,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Error updating property status:', error);
  }
}

// Clear all stored properties (useful for development)
export function clearStoredProperties(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Calendar data storage
const CALENDAR_STORAGE_KEY = 'cozy_condo_calendar';

interface CalendarBlock {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  reason: string;
  source: 'manual' | 'airbnb';
}

// Get all stored calendar blocks
export function getStoredCalendarBlocks(): CalendarBlock[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(CALENDAR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading stored calendar blocks:', error);
    return [];
  }
}

// Save calendar blocks
export function saveCalendarBlocks(blocks: CalendarBlock[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(blocks));
  } catch (error) {
    console.error('Error saving calendar blocks:', error);
  }
}

// Add a new calendar block
export function addCalendarBlock(block: CalendarBlock): void {
  const blocks = getStoredCalendarBlocks();
  const updatedBlocks = [...blocks, { ...block, id: block.id || `${block.source}-${Date.now()}` }];
  saveCalendarBlocks(updatedBlocks);
}

// Remove a calendar block
export function removeCalendarBlock(blockId: string): void {
  const blocks = getStoredCalendarBlocks();
  const updatedBlocks = blocks.filter(block => block.id !== blockId);
  saveCalendarBlocks(updatedBlocks);
}

// Update calendar blocks for a property (replaces all Airbnb blocks for that property)
export function updatePropertyCalendarBlocks(propertyId: string, newBlocks: CalendarBlock[]): void {
  const allBlocks = getStoredCalendarBlocks();
  // Keep manual blocks, replace Airbnb blocks
  const manualBlocks = allBlocks.filter(block =>
    !(block.propertyId === propertyId && block.source === 'airbnb')
  );
  const updatedBlocks = [...manualBlocks, ...newBlocks];
  saveCalendarBlocks(updatedBlocks);
}

// Default property data
export const getDefaultPropertyData = (id: string): PropertyData => {
  const defaults: Record<string, PropertyData> = {
    '1': {
      id: '1',
      name: 'Artist Loft',
      type: 'loft',
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      size: '60',
      description: 'Step into creative inspiration at this unique artist loft in Iloilo\'s vibrant Arts District. This spacious, light-filled space combines industrial charm with artistic flair.',
      location: 'Arts District, Iloilo City',
      pricePerNight: '3000',
      airbnbUrl: 'https://airbnb.com/rooms/artist-loft',
      icalUrl: '',
      featured: false,
      active: true,
      amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'Smart TV', 'High Ceilings', 'Natural Light', 'Workspace'],
      photos: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop',
      ],
    },
    '2': {
      id: '2',
      name: 'Garden View Suite',
      type: 'apartment',
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 4,
      size: '50',
      description: 'Escape to this serene garden-view suite nestled in the popular Smallville Complex.',
      location: 'Smallville Complex, Iloilo City',
      pricePerNight: '2800',
      airbnbUrl: 'https://airbnb.com/rooms/garden-suite',
      icalUrl: '',
      featured: false,
      active: true,
      amenities: ['WiFi', 'Air Conditioning', 'Parking', 'Kitchen', 'Balcony', 'Smart TV', 'Washer'],
      photos: [
        'https://images.unsplash.com/photo-1502005229762-cf1b2da02f3f?w=500&h=300&fit=crop',
      ],
    },
    '7': {
      id: '7',
      name: 'Metro Central',
      type: 'apartment',
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      size: '40',
      description: 'Experience the heart of Iloilo City at Metro Central, a modern accommodation situated in the bustling City Proper district.',
      location: 'City Proper, Iloilo City',
      pricePerNight: '2200',
      airbnbUrl: 'https://airbnb.com/rooms/metro-central',
      icalUrl: '',
      featured: false,
      active: true,
      amenities: ['WiFi', 'Air Conditioning', 'Smart TV', 'Kitchen', '24/7 Security', 'Central Location'],
      photos: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop',
      ],
    },
    '8': {
      id: '8',
      name: 'Riverside Studio',
      type: 'studio',
      bedrooms: 0,
      bathrooms: 1,
      maxGuests: 2,
      size: '35',
      description: 'Discover tranquility at Riverside Studio, a peaceful retreat nestled along the scenic Jaro River.',
      location: 'Jaro District, Iloilo City',
      pricePerNight: '2000',
      airbnbUrl: 'https://airbnb.com/rooms/riverside-studio',
      icalUrl: '',
      featured: false,
      active: true,
      amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'River View', 'Peaceful Setting', 'Historic Area'],
      photos: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop',
      ],
    },
  };

  return defaults[id] || {
    id,
    name: `Property ${id}`,
    type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    size: '45',
    description: 'A beautiful and cozy apartment perfect for travelers looking for comfort and convenience.',
    location: 'Iloilo City, Philippines',
    pricePerNight: '2500',
    airbnbUrl: 'https://airbnb.com/rooms/123456',
    icalUrl: '',
    featured: false,
    active: true,
    amenities: ['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Balcony'],
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop',
    ],
  };
};