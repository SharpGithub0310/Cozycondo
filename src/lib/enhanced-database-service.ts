/**
 * Enhanced Database Service for Cozy Condo
 *
 * This service provides client-side API calls to the database endpoints,
 * handles migration from localStorage to Supabase via API routes,
 * and provides fallbacks for offline functionality.
 */

import {
  getStoredProperties,
  getStoredProperty,
  saveProperty as saveStoredProperty,
  updatePropertyStatus as updateStoredPropertyStatus,
  clearStoredProperties,
  getStoredCalendarBlocks,
  saveCalendarBlocks as saveStoredCalendarBlocks,
  addCalendarBlock as addStoredCalendarBlock,
  removeCalendarBlock as removeStoredCalendarBlock,
  updatePropertyCalendarBlocks as updateStoredPropertyCalendarBlocks
} from '../utils/propertyStorage';
import {
  getStoredSettings,
  saveSettings,
  clearStoredSettings
} from '../utils/settingsStorage';
import {
  getProductionFallbackProperties,
  getProductionFallbackSettings
} from './production-fallback-service';

// =============================================
// TYPESCRIPT INTERFACES
// =============================================

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
  icalUrl?: string;
  featured?: boolean;
  active?: boolean;
  amenities: string[];
  photos: string[];
  featuredPhotoIndex?: number;
  updatedAt?: string;
}

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
  updatedAt?: string;
}

export interface CalendarBlock {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  reason: string;
  source: 'manual' | 'airbnb';
}

export interface DatabaseServiceOptions {
  fallbackToLocalStorage?: boolean;
  useApiRoutes?: boolean;
}

// =============================================
// ENHANCED DATABASE SERVICE CLASS
// =============================================

class EnhancedDatabaseService {
  private options: DatabaseServiceOptions;
  private migrationInProgress: boolean = false;

  constructor(options: DatabaseServiceOptions = {}) {
    this.options = {
      fallbackToLocalStorage: true,
      useApiRoutes: true,
      ...options
    };
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  private isOnline(): boolean {
    return typeof window !== 'undefined' && navigator.onLine;
  }

  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
    fallbackOperation?: () => T
  ): Promise<T> {
    try {
      if (!this.isOnline() || !this.options.useApiRoutes) {
        if (fallbackOperation && this.options.fallbackToLocalStorage) {
          console.warn(`API call to ${endpoint} - Falling back to localStorage`);
          return fallbackOperation();
        }
        throw new Error('API not available and no fallback provided');
      }

      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error);
      if (fallbackOperation && this.options.fallbackToLocalStorage) {
        console.warn(`API call to ${endpoint} - Falling back to localStorage due to error`);
        return fallbackOperation();
      }
      throw error;
    }
  }

  // =============================================
  // PROPERTY MANAGEMENT
  // =============================================

  async getProperties(): Promise<Record<string, PropertyData>> {
    return this.apiCall(
      '/api/properties',
      { method: 'GET' },
      () => {
        // Try localStorage first
        const stored = getStoredProperties();
        if (Object.keys(stored).length > 0) {
          return stored;
        }
        // Fall back to production defaults if localStorage is empty
        console.log('Using production fallback properties');
        return getProductionFallbackProperties() as Record<string, PropertyData>;
      }
    );
  }

  async getProperty(id: string): Promise<PropertyData | null> {
    return this.apiCall(
      `/api/properties/${id}`,
      { method: 'GET' },
      () => getStoredProperty(id)
    );
  }

  async saveProperty(id: string, propertyData: PropertyData): Promise<void> {
    return this.apiCall(
      '/api/properties',
      {
        method: 'POST',
        body: JSON.stringify({ id, ...propertyData }),
      },
      () => saveStoredProperty(id, propertyData)
    );
  }

  async updatePropertyStatus(id: string, updates: { featured?: boolean; active?: boolean }): Promise<void> {
    return this.apiCall(
      '/api/properties',
      {
        method: 'PUT',
        body: JSON.stringify({ id, updates }),
      },
      () => updateStoredPropertyStatus(id, updates)
    );
  }

  // =============================================
  // WEBSITE SETTINGS MANAGEMENT
  // =============================================

  async getWebsiteSettings(): Promise<WebsiteSettings> {
    return this.apiCall(
      '/api/settings',
      { method: 'GET' },
      () => {
        // Try localStorage first
        const stored = getStoredSettings();
        // Check if we have actual settings (not just defaults)
        if (stored.logo || stored.heroBackground) {
          return stored;
        }
        // Fall back to production defaults if localStorage is empty
        console.log('Using production fallback settings');
        return getProductionFallbackSettings() as WebsiteSettings;
      }
    );
  }

  async saveWebsiteSettings(settings: Partial<WebsiteSettings>): Promise<void> {
    return this.apiCall(
      '/api/settings',
      {
        method: 'POST',
        body: JSON.stringify(settings),
      },
      () => saveSettings(settings)
    );
  }

  // =============================================
  // CALENDAR MANAGEMENT
  // =============================================

  async getCalendarBlocks(): Promise<CalendarBlock[]> {
    return this.apiCall(
      '/api/calendar',
      { method: 'GET' },
      () => getStoredCalendarBlocks()
    );
  }

  async saveCalendarBlocks(blocks: CalendarBlock[]): Promise<void> {
    return this.apiCall(
      '/api/calendar',
      {
        method: 'POST',
        body: JSON.stringify(blocks),
      },
      () => saveStoredCalendarBlocks(blocks)
    );
  }

  async addCalendarBlock(block: CalendarBlock): Promise<void> {
    return this.apiCall(
      '/api/calendar',
      {
        method: 'PUT',
        body: JSON.stringify({ action: 'add', blocks: block }),
      },
      () => addStoredCalendarBlock(block)
    );
  }

  async removeCalendarBlock(blockId: string): Promise<void> {
    return this.apiCall(
      '/api/calendar',
      {
        method: 'PUT',
        body: JSON.stringify({ action: 'remove', blockId }),
      },
      () => removeStoredCalendarBlock(blockId)
    );
  }

  async updatePropertyCalendarBlocks(propertyId: string, newBlocks: CalendarBlock[]): Promise<void> {
    return this.apiCall(
      '/api/calendar',
      {
        method: 'PUT',
        body: JSON.stringify({ action: 'updateProperty', propertyId, blocks: newBlocks }),
      },
      () => updateStoredPropertyCalendarBlocks(propertyId, newBlocks)
    );
  }

  // =============================================
  // MIGRATION FUNCTIONS
  // =============================================

  async migrateFromLocalStorage(): Promise<{ success: boolean; errors: string[]; migratedCount: number }> {
    if (this.migrationInProgress) {
      return { success: false, errors: ['Migration already in progress'], migratedCount: 0 };
    }

    this.migrationInProgress = true;

    try {
      console.log('Starting localStorage to Supabase migration via API...');

      // Get all localStorage data
      const properties = getStoredProperties();
      const settings = getStoredSettings();
      const calendarBlocks = getStoredCalendarBlocks();

      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'migrate',
          properties,
          settings,
          calendarBlocks
        }),
      });

      if (!response.ok) {
        throw new Error(`Migration API failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Migration completed:', result);

      return result;

    } catch (error) {
      const errorMsg = `Migration failed: ${error}`;
      console.error(errorMsg);
      return { success: false, errors: [errorMsg], migratedCount: 0 };
    } finally {
      this.migrationInProgress = false;
    }
  }

  async clearLocalStorageData(): Promise<void> {
    if (typeof window === 'undefined') return;

    clearStoredProperties();
    clearStoredSettings();
    saveStoredCalendarBlocks([]);
    console.log('Cleared all localStorage data');
  }

  async validateDataSync(): Promise<{
    propertiesMatch: boolean;
    settingsMatch: boolean;
    calendarMatch: boolean;
    details: string[]
  }> {
    try {
      const properties = getStoredProperties();
      const settings = getStoredSettings();
      const calendarBlocks = getStoredCalendarBlocks();

      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate',
          properties,
          settings,
          calendarBlocks
        }),
      });

      if (!response.ok) {
        throw new Error(`Validation API failed: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Validation failed:', error);
      return {
        propertiesMatch: false,
        settingsMatch: false,
        calendarMatch: false,
        details: [`Validation failed: ${error}`]
      };
    }
  }

  // =============================================
  // SYNCHRONIZATION METHODS
  // =============================================

  async syncFromDatabase(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      console.log('Syncing data from database to localStorage...');

      // Sync properties
      try {
        const dbProperties = await this.apiCall<Record<string, PropertyData>>(
          '/api/properties',
          { method: 'GET' }
        );

        // Save to localStorage
        for (const [id, property] of Object.entries(dbProperties)) {
          saveStoredProperty(id, property);
        }

        console.log(`Synced ${Object.keys(dbProperties).length} properties from database`);
      } catch (error) {
        const errorMsg = `Failed to sync properties: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Sync settings
      try {
        const dbSettings = await this.apiCall<WebsiteSettings>(
          '/api/settings',
          { method: 'GET' }
        );

        saveSettings(dbSettings);
        console.log('Synced settings from database');
      } catch (error) {
        const errorMsg = `Failed to sync settings: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Sync calendar blocks
      try {
        const dbBlocks = await this.apiCall<CalendarBlock[]>(
          '/api/calendar',
          { method: 'GET' }
        );

        saveStoredCalendarBlocks(dbBlocks);
        console.log(`Synced ${dbBlocks.length} calendar blocks from database`);
      } catch (error) {
        const errorMsg = `Failed to sync calendar blocks: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }

      return { success: errors.length === 0, errors };

    } catch (error) {
      const errorMsg = `Sync failed: ${error}`;
      errors.push(errorMsg);
      console.error(errorMsg);
      return { success: false, errors };
    }
  }

  // =============================================
  // INITIALIZATION
  // =============================================

  async initialize(): Promise<void> {
    if (this.isOnline() && this.options.useApiRoutes) {
      try {
        // Check if we need to perform initial sync from database
        const localProperties = getStoredProperties();
        const hasLocalData = Object.keys(localProperties).length > 0;

        if (!hasLocalData) {
          console.log('No local data found, syncing from database...');
          await this.syncFromDatabase();
        } else {
          // Check if local data is newer than database
          const validation = await this.validateDataSync();
          if (!validation.propertiesMatch || !validation.settingsMatch || !validation.calendarMatch) {
            console.log('Data mismatch detected, checking if migration is needed...');
            // You could implement logic here to determine direction of sync
            // For now, we'll assume localStorage takes precedence and migrate to DB
          }
        }
      } catch (error) {
        console.error('Failed to initialize database service:', error);
      }
    }
  }

  // =============================================
  // ADMIN UTILITIES
  // =============================================

  async getDataSummary(): Promise<{
    database: {
      properties: number;
      settings: number;
      calendarBlocks: number;
    };
    localStorage: {
      properties: number;
      settings: number;
      calendarBlocks: number;
    };
    lastSync?: string;
  }> {
    try {
      const [dbProperties, dbSettings, dbBlocks] = await Promise.all([
        this.apiCall<Record<string, PropertyData>>('/api/properties', { method: 'GET' }, () => ({})),
        this.apiCall<WebsiteSettings>('/api/settings', { method: 'GET' }, () => getStoredSettings()),
        this.apiCall<CalendarBlock[]>('/api/calendar', { method: 'GET' }, () => [])
      ]);

      const localProperties = getStoredProperties();
      const localSettings = getStoredSettings();
      const localBlocks = getStoredCalendarBlocks();

      return {
        database: {
          properties: Object.keys(dbProperties).length,
          settings: Object.keys(dbSettings).length,
          calendarBlocks: dbBlocks.length
        },
        localStorage: {
          properties: Object.keys(localProperties).length,
          settings: Object.keys(localSettings).length,
          calendarBlocks: localBlocks.length
        },
        lastSync: localStorage.getItem('cozy_condo_last_sync') || undefined
      };
    } catch (error) {
      console.error('Failed to get data summary:', error);
      throw error;
    }
  }

  markSyncTime(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cozy_condo_last_sync', new Date().toISOString());
    }
  }
}

// =============================================
// SINGLETON INSTANCE
// =============================================

export const enhancedDatabaseService = new EnhancedDatabaseService({
  fallbackToLocalStorage: true,
  useApiRoutes: true
});

// Initialize service when imported (client-side only)
if (typeof window !== 'undefined') {
  enhancedDatabaseService.initialize().catch(console.error);
}

// =============================================
// CONVENIENCE EXPORTS
// =============================================

export const {
  getProperties,
  getProperty,
  saveProperty,
  updatePropertyStatus,
  getWebsiteSettings,
  saveWebsiteSettings,
  getCalendarBlocks,
  saveCalendarBlocks,
  addCalendarBlock,
  removeCalendarBlock,
  updatePropertyCalendarBlocks,
  migrateFromLocalStorage,
  clearLocalStorageData,
  validateDataSync,
  syncFromDatabase,
  getDataSummary,
  markSyncTime
} = enhancedDatabaseService;

export default enhancedDatabaseService;