/**
 * Comprehensive Database Service for Cozy Condo
 *
 * This service provides a clean API layer for all database operations,
 * handles migration from localStorage to Supabase, and provides fallbacks
 * for offline functionality.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  getStoredProperties,
  getStoredProperty,
  saveProperty as saveStoredProperty,
  updatePropertyStatus as updateStoredPropertyStatus,
  clearStoredProperties,
  getStoredCalendarBlocks,
  saveCalendarBlocks as saveStoredCalendarBlocks,
  addCalendarBlock as addStoredCalendarBlock,
  removeCalendarBlock,
  updatePropertyCalendarBlocks,
  getDefaultPropertyData
} from '../utils/propertyStorage';
import {
  getStoredSettings,
  saveSettings,
  clearStoredSettings
} from '../utils/settingsStorage';

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
  autoMigrate?: boolean;
}

// =============================================
// DATABASE SERVICE CLASS
// =============================================

class DatabaseService {
  private options: DatabaseServiceOptions;
  private migrationInProgress: boolean = false;

  constructor(options: DatabaseServiceOptions = {}) {
    this.options = {
      fallbackToLocalStorage: true,
      autoMigrate: true,
      ...options
    };
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  private isOnline(): boolean {
    return typeof window !== 'undefined' && navigator.onLine && isSupabaseConfigured();
  }

  private async handleError<T>(
    operation: () => Promise<T>,
    fallbackOperation?: () => T,
    errorContext: string = 'Database operation'
  ): Promise<T> {
    try {
      if (!this.isOnline() || !supabase) {
        if (fallbackOperation && this.options.fallbackToLocalStorage) {
          console.warn(`${errorContext} - Falling back to localStorage`);
          return fallbackOperation();
        }
        throw new Error('Database not available and no fallback provided');
      }
      return await operation();
    } catch (error) {
      console.error(`${errorContext} failed:`, error);
      if (fallbackOperation && this.options.fallbackToLocalStorage) {
        console.warn(`${errorContext} - Falling back to localStorage due to error`);
        return fallbackOperation();
      }
      throw error;
    }
  }

  // =============================================
  // PROPERTY MANAGEMENT
  // =============================================

  async getProperties(): Promise<Record<string, PropertyData>> {
    return this.handleError(
      async () => {
        const { data: properties, error: propsError } = await supabase!
          .from('properties')
          .select('*, property_photos(*)');

        if (propsError) throw propsError;

        const result: Record<string, PropertyData> = {};

        properties?.forEach((prop) => {
          result[prop.slug] = {
            id: prop.slug,
            name: prop.name || '',
            type: prop.type || 'apartment',
            bedrooms: prop.bedrooms || 2,
            bathrooms: prop.bathrooms || 1,
            maxGuests: prop.max_guests || 4,
            size: prop.size_sqm || '45',
            description: prop.description || '',
            location: prop.location || '',
            pricePerNight: prop.price_per_night || '2500',
            airbnbUrl: prop.airbnb_url || '',
            icalUrl: prop.ical_url || '',
            featured: prop.featured || false,
            active: prop.active !== false,
            amenities: prop.amenities || [],
            photos: (prop.property_photos || [])
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((photo: any) => photo.url),
            featuredPhotoIndex: prop.featured_photo_index || 0,
            updatedAt: prop.updated_at
          };
        });

        return result;
      },
      () => getStoredProperties(),
      'Get properties'
    );
  }

  async getProperty(id: string): Promise<PropertyData | null> {
    return this.handleError(
      async () => {
        const { data: property, error } = await supabase!
          .from('properties')
          .select('*, property_photos(*)')
          .eq('slug', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null; // Not found
          throw error;
        }

        return {
          id: property.slug,
          name: property.name || '',
          type: property.type || 'apartment',
          bedrooms: property.bedrooms || 2,
          bathrooms: property.bathrooms || 1,
          maxGuests: property.max_guests || 4,
          size: property.size_sqm || '45',
          description: property.description || '',
          location: property.location || '',
          pricePerNight: property.price_per_night || '2500',
          airbnbUrl: property.airbnb_url || '',
          icalUrl: property.ical_url || '',
          featured: property.featured || false,
          active: property.active !== false,
          amenities: property.amenities || [],
          photos: (property.property_photos || [])
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .map((photo: any) => photo.url),
          featuredPhotoIndex: property.featured_photo_index || 0,
          updatedAt: property.updated_at
        };
      },
      () => getStoredProperty(id),
      'Get property'
    );
  }

  async saveProperty(id: string, propertyData: PropertyData): Promise<void> {
    return this.handleError(
      async () => {
        const { error } = await supabase!.rpc('upsert_property_with_string_id', {
          property_id: id,
          property_name: propertyData.name,
          property_type: propertyData.type,
          bedrooms_count: propertyData.bedrooms,
          bathrooms_count: propertyData.bathrooms,
          max_guests_count: propertyData.maxGuests,
          size_sqm_value: propertyData.size,
          description_text: propertyData.description,
          location_text: propertyData.location,
          price_per_night_value: propertyData.pricePerNight,
          airbnb_url_value: propertyData.airbnbUrl,
          ical_url_value: propertyData.icalUrl || '',
          featured_flag: propertyData.featured || false,
          active_flag: propertyData.active !== false,
          amenities_array: propertyData.amenities,
          photos_array: propertyData.photos,
          featured_photo_index_value: propertyData.featuredPhotoIndex || 0
        });

        if (error) throw error;
      },
      () => saveStoredProperty(id, propertyData),
      'Save property'
    );
  }

  async updatePropertyStatus(id: string, updates: { featured?: boolean; active?: boolean }): Promise<void> {
    return this.handleError(
      async () => {
        const { error } = await supabase!
          .from('properties')
          .update(updates)
          .eq('slug', id);

        if (error) throw error;
      },
      () => updateStoredPropertyStatus(id, updates),
      'Update property status'
    );
  }

  // =============================================
  // WEBSITE SETTINGS MANAGEMENT
  // =============================================

  async getWebsiteSettings(): Promise<WebsiteSettings> {
    return this.handleError(
      async () => {
        const { data: settings, error } = await supabase!
          .from('website_settings')
          .select('setting_key, setting_value');

        if (error) throw error;

        const settingsObj: any = {};
        settings?.forEach((setting) => {
          // Convert snake_case to camelCase
          const camelKey = setting.setting_key
            .replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
          settingsObj[camelKey] = setting.setting_value || '';
        });

        // Ensure all required fields exist with defaults
        return {
          logo: settingsObj.logo || '',
          footerLogo: settingsObj.footerLogo || '',
          heroBackground: settingsObj.heroBackground || '',
          aboutImage: settingsObj.aboutImage || '',
          contactImage: settingsObj.contactImage || '',
          favicon: settingsObj.favicon || '',
          heroBadgeText: settingsObj.heroBadgeText || '',
          heroTitle: settingsObj.heroTitle || 'Your Cozy Escape in Iloilo City',
          heroSubtitle: settingsObj.heroSubtitle || '',
          heroDescription: settingsObj.heroDescription || 'Experience the perfect blend of comfort and convenience. Our handpicked condominiums offer modern amenities, stunning views, and prime locations across Iloilo City.',
          statsUnits: settingsObj.statsUnits || '9+',
          statsUnitsLabel: settingsObj.statsUnitsLabel || 'Premium Units',
          statsRating: settingsObj.statsRating || '4.9',
          statsRatingLabel: settingsObj.statsRatingLabel || 'Guest Rating',
          statsLocation: settingsObj.statsLocation || 'Iloilo',
          statsLocationLabel: settingsObj.statsLocationLabel || 'City Center',
          highlyRatedTitle: settingsObj.highlyRatedTitle || 'Highly Rated',
          highlyRatedSubtitle: settingsObj.highlyRatedSubtitle || 'by our guests',
          highlyRatedImage: settingsObj.highlyRatedImage || '',
          featuredTitle: settingsObj.featuredTitle || 'Featured Properties',
          featuredSubtitle: settingsObj.featuredSubtitle || 'Handpicked condominiums offering the perfect balance of comfort, convenience, and style.',
          updatedAt: new Date().toISOString()
        };
      },
      () => getStoredSettings(),
      'Get website settings'
    );
  }

  async saveWebsiteSettings(settings: Partial<WebsiteSettings>): Promise<void> {
    return this.handleError(
      async () => {
        // Convert camelCase to snake_case and prepare for batch update
        const settingsArray = Object.entries(settings).map(([key, value]) => {
          const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          return { setting_key: snakeKey, setting_value: value as string };
        });

        // Use the helper function to update multiple settings
        for (const setting of settingsArray) {
          const { error } = await supabase!
            .from('website_settings')
            .upsert(setting, { onConflict: 'setting_key' });

          if (error) throw error;
        }
      },
      () => saveSettings(settings),
      'Save website settings'
    );
  }

  // =============================================
  // CALENDAR MANAGEMENT
  // =============================================

  async getCalendarBlocks(): Promise<CalendarBlock[]> {
    return this.handleError(
      async () => {
        const { data: blocks, error } = await supabase!
          .from('calendar_blocks')
          .select('*')
          .order('start_date');

        if (error) throw error;

        return (blocks || []).map((block) => ({
          id: block.id,
          propertyId: block.property_id,
          startDate: block.start_date,
          endDate: block.end_date,
          reason: block.reason || 'Blocked',
          source: (block.source || 'manual') as 'manual' | 'airbnb'
        }));
      },
      () => getStoredCalendarBlocks(),
      'Get calendar blocks'
    );
  }

  async saveCalendarBlocks(blocks: CalendarBlock[]): Promise<void> {
    return this.handleError(
      async () => {
        // Delete existing blocks and insert new ones
        const { error: deleteError } = await supabase!
          .from('calendar_blocks')
          .delete()
          .neq('id', 'never-matches'); // This deletes all

        if (deleteError) throw deleteError;

        if (blocks.length > 0) {
          const { error: insertError } = await supabase!
            .from('calendar_blocks')
            .insert(
              blocks.map((block) => ({
                id: block.id,
                property_id: block.propertyId,
                start_date: block.startDate,
                end_date: block.endDate,
                reason: block.reason,
                source: block.source
              }))
            );

          if (insertError) throw insertError;
        }
      },
      () => saveStoredCalendarBlocks(blocks),
      'Save calendar blocks'
    );
  }

  async addCalendarBlock(block: CalendarBlock): Promise<void> {
    return this.handleError(
      async () => {
        const { error } = await supabase!
          .from('calendar_blocks')
          .insert({
            id: block.id,
            property_id: block.propertyId,
            start_date: block.startDate,
            end_date: block.endDate,
            reason: block.reason,
            source: block.source
          });

        if (error) throw error;
      },
      () => addStoredCalendarBlock(block),
      'Add calendar block'
    );
  }

  async removeCalendarBlock(blockId: string): Promise<void> {
    return this.handleError(
      async () => {
        const { error } = await supabase!
          .from('calendar_blocks')
          .delete()
          .eq('id', blockId);

        if (error) throw error;
      },
      () => removeCalendarBlock(blockId),
      'Remove calendar block'
    );
  }

  async updatePropertyCalendarBlocks(propertyId: string, newBlocks: CalendarBlock[]): Promise<void> {
    return this.handleError(
      async () => {
        // Delete existing Airbnb blocks for this property
        const { error: deleteError } = await supabase!
          .from('calendar_blocks')
          .delete()
          .eq('property_id', propertyId)
          .eq('source', 'airbnb');

        if (deleteError) throw deleteError;

        // Insert new blocks
        if (newBlocks.length > 0) {
          const { error: insertError } = await supabase!
            .from('calendar_blocks')
            .insert(
              newBlocks.map((block) => ({
                id: block.id,
                property_id: block.propertyId,
                start_date: block.startDate,
                end_date: block.endDate,
                reason: block.reason,
                source: block.source
              }))
            );

          if (insertError) throw insertError;
        }
      },
      () => updatePropertyCalendarBlocks(propertyId, newBlocks),
      'Update property calendar blocks'
    );
  }

  // =============================================
  // MIGRATION FUNCTIONS
  // =============================================

  async migrateFromLocalStorage(): Promise<{ success: boolean; errors: string[] }> {
    if (this.migrationInProgress) {
      return { success: false, errors: ['Migration already in progress'] };
    }

    this.migrationInProgress = true;
    const errors: string[] = [];

    try {
      console.log('Starting localStorage to Supabase migration...');

      // Migrate properties
      try {
        const localProperties = getStoredProperties();
        for (const [id, property] of Object.entries(localProperties)) {
          await this.saveProperty(id, property);
        }
        console.log(`Migrated ${Object.keys(localProperties).length} properties`);
      } catch (error) {
        const errorMsg = `Failed to migrate properties: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Migrate settings
      try {
        const localSettings = getStoredSettings();
        await this.saveWebsiteSettings(localSettings);
        console.log('Migrated website settings');
      } catch (error) {
        const errorMsg = `Failed to migrate settings: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Migrate calendar blocks
      try {
        const localBlocks = getStoredCalendarBlocks();
        await this.saveCalendarBlocks(localBlocks);
        console.log(`Migrated ${localBlocks.length} calendar blocks`);
      } catch (error) {
        const errorMsg = `Failed to migrate calendar blocks: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }

      console.log('Migration completed with', errors.length, 'errors');
      return { success: errors.length === 0, errors };

    } finally {
      this.migrationInProgress = false;
    }
  }

  async clearLocalStorageData(): Promise<void> {
    if (typeof window === 'undefined') return;

    clearStoredProperties();
    clearStoredSettings();
    // Clear calendar blocks by saving empty array
    saveCalendarBlocks([]);
    console.log('Cleared all localStorage data');
  }

  async validateDataSync(): Promise<{
    propertiesMatch: boolean;
    settingsMatch: boolean;
    calendarMatch: boolean;
    details: string[]
  }> {
    const details: string[] = [];

    try {
      // Compare properties
      const dbProperties = await this.getProperties();
      const localProperties = getStoredProperties();
      const propertiesMatch = JSON.stringify(dbProperties) === JSON.stringify(localProperties);

      if (!propertiesMatch) {
        details.push(`Properties mismatch: DB has ${Object.keys(dbProperties).length}, localStorage has ${Object.keys(localProperties).length}`);
      }

      // Compare settings
      const dbSettings = await this.getWebsiteSettings();
      const localSettings = getStoredSettings();
      const settingsMatch = JSON.stringify(dbSettings) === JSON.stringify(localSettings);

      if (!settingsMatch) {
        details.push('Settings data differs between database and localStorage');
      }

      // Compare calendar blocks
      const dbBlocks = await this.getCalendarBlocks();
      const localBlocks = getStoredCalendarBlocks();
      const calendarMatch = JSON.stringify(dbBlocks) === JSON.stringify(localBlocks);

      if (!calendarMatch) {
        details.push(`Calendar blocks mismatch: DB has ${dbBlocks.length}, localStorage has ${localBlocks.length}`);
      }

      return { propertiesMatch, settingsMatch, calendarMatch, details };
    } catch (error) {
      details.push(`Validation failed: ${error}`);
      return { propertiesMatch: false, settingsMatch: false, calendarMatch: false, details };
    }
  }

  // =============================================
  // INITIALIZATION
  // =============================================

  async initialize(): Promise<void> {
    if (this.isOnline() && this.options.autoMigrate) {
      try {
        // Check if we have any data in localStorage that's not in the database
        const localProperties = getStoredProperties();
        const dbProperties = await this.getProperties();

        // If localStorage has more recent data, migrate it
        const hasLocalUpdates = Object.keys(localProperties).some(id => {
          const local = localProperties[id];
          const db = dbProperties[id];
          return !db || (local.updatedAt && db.updatedAt && local.updatedAt > db.updatedAt);
        });

        if (hasLocalUpdates) {
          console.log('Detected localStorage updates, initiating migration...');
          await this.migrateFromLocalStorage();
        }
      } catch (error) {
        console.error('Failed to auto-migrate:', error);
      }
    }
  }
}

// =============================================
// SINGLETON INSTANCE
// =============================================

export const databaseService = new DatabaseService({
  fallbackToLocalStorage: true,
  autoMigrate: true
});

// Initialize service when imported (client-side only)
if (typeof window !== 'undefined') {
  databaseService.initialize().catch(console.error);
}

// =============================================
// CONVENIENCE EXPORTS
// =============================================

export const {
  getProperties,
  getProperty,
  saveProperty,
  updatePropertyStatus: databaseService.updatePropertyStatus,
  getWebsiteSettings,
  saveWebsiteSettings,
  getCalendarBlocks,
  saveCalendarBlocks: databaseService.saveCalendarBlocks,
  addCalendarBlock: databaseService.addCalendarBlock,
  removeCalendarBlock,
  updatePropertyCalendarBlocks,
  migrateFromLocalStorage,
  clearLocalStorageData,
  validateDataSync
} = databaseService;

export default databaseService;