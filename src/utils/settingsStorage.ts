// Simple storage utility for managing website settings with images
// In production, this would be replaced with API calls to your backend/Supabase

interface WebsiteSettings {
  logo: string;
  footerLogo: string;
  heroBackground: string;
  aboutImage: string;
  contactImage: string;
  favicon: string;

  // Hero Section Content
  heroBadgeText: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;

  // Statistics
  statsUnits: string;
  statsUnitsLabel: string;
  statsRating: string;
  statsRatingLabel: string;
  statsLocation: string;
  statsLocationLabel: string;

  // Highly Rated Section
  highlyRatedTitle: string;
  highlyRatedSubtitle: string;
  highlyRatedImage: string;

  // Featured Properties Section
  featuredTitle: string;
  featuredSubtitle: string;

  updatedAt?: string;
}

const SETTINGS_KEY = 'cozy_condo_settings';

// Get all stored settings
export function getStoredSettings(): WebsiteSettings {
  if (typeof window === 'undefined') return getDefaultSettings();

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...getDefaultSettings(), ...JSON.parse(stored) } : getDefaultSettings();
  } catch (error) {
    console.error('Error reading stored settings:', error);
    return getDefaultSettings();
  }
}

// Save settings
export function saveSettings(settings: Partial<WebsiteSettings>): void {
  if (typeof window === 'undefined') return;

  try {
    const currentSettings = getStoredSettings();
    const updatedSettings = {
      ...currentSettings,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Get default settings
function getDefaultSettings(): WebsiteSettings {
  return {
    logo: '',
    footerLogo: '',
    heroBackground: '',
    aboutImage: '',
    contactImage: '',
    favicon: '',

    // Hero Section Content
    heroBadgeText: '',  // Remove "Premium Short-Term Rentals"
    heroTitle: 'Your Cozy Escape in Iloilo City',
    heroSubtitle: '',
    heroDescription: 'Experience the perfect blend of comfort and convenience. Our handpicked condominiums offer modern amenities, stunning views, and prime locations across Iloilo City.',

    // Statistics
    statsUnits: '9+',
    statsUnitsLabel: 'Premium Units',
    statsRating: '4.9',
    statsRatingLabel: 'Guest Rating',
    statsLocation: 'Iloilo',
    statsLocationLabel: 'City Center',

    // Highly Rated Section
    highlyRatedTitle: 'Highly Rated',
    highlyRatedSubtitle: 'by our guests',
    highlyRatedImage: '',

    // Featured Properties Section
    featuredTitle: 'Featured Properties',
    featuredSubtitle: 'Handpicked condominiums offering the perfect balance of comfort, convenience, and style.',
  };
}

// Clear all stored settings
export function clearStoredSettings(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SETTINGS_KEY);
}