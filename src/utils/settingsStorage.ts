// Simple storage utility for managing website settings with images
// In production, this would be replaced with API calls to your backend/Supabase

interface WebsiteSettings {
  logo: string;
  footerLogo: string;
  heroBackground: string;
  aboutImage: string;
  contactImage: string;
  favicon: string;
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
  };
}

// Clear all stored settings
export function clearStoredSettings(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SETTINGS_KEY);
}