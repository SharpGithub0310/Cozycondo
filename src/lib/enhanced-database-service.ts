/**
 * Enhanced Database Service for Cozy Condo
 *
 * This service provides client-side API calls to the database endpoints,
 * handles migration from localStorage to Supabase via API routes,
 * and provides fallbacks for offline functionality.
 */

import { PropertyData, WebsiteSettings } from './types';
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
import { performanceMonitor } from '../utils/performance';

// =============================================
// TYPESCRIPT INTERFACES
// =============================================



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
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly DEFAULT_CACHE_TTL = 60000; // 60 seconds for better performance
  private pendingRequests: Map<string, Promise<any>> = new Map();

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

  private getCacheKey(endpoint: string, options: any = {}): string {
    return `${endpoint}_${JSON.stringify(options)}`;
  }

  private isCacheValid(cacheEntry: { timestamp: number; ttl: number }): boolean {
    return Date.now() - cacheEntry.timestamp < cacheEntry.ttl;
  }

  private getFromCache<T>(cacheKey: string): T | null {
    const entry = this.cache.get(cacheKey);
    if (entry && this.isCacheValid(entry)) {
      console.log(`Cache hit for: ${cacheKey}`);
      return entry.data;
    }
    if (entry) {
      // Remove expired entry
      this.cache.delete(cacheKey);
    }
    return null;
  }

  private setCache<T>(cacheKey: string, data: T, ttl: number = this.DEFAULT_CACHE_TTL): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private invalidateCache(pattern: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
  }

  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
    fallbackOperation?: () => T
  ): Promise<T> {
    // Create a unique key for this request to prevent duplicates
    const requestKey = `${options.method || 'GET'}_${endpoint}_${JSON.stringify(options.body || {})}`;

    // Check if there's already a pending request for the same data
    const pendingRequest = this.pendingRequests.get(requestKey);
    if (pendingRequest) {
      console.log(`Duplicate API call prevented for: ${endpoint}`);
      return await pendingRequest;
    }

    // Create the request promise
    const requestPromise = this.executeApiCall(endpoint, options, fallbackOperation);

    // Store the promise to prevent duplicate requests
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up the pending request
      this.pendingRequests.delete(requestKey);
    }
  }

  private async executeApiCall<T>(
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

      // Get authentication headers if we're in the browser
      const authHeaders: Record<string, string> = {};
      if (typeof window !== 'undefined') {
        const adminSession = localStorage.getItem('cozy_admin_session');
        if (adminSession) {
          authHeaders['x-admin-session'] = 'authenticated';
        }
      }

      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      // Handle wrapped API responses (e.g., {success: true, data: {...}})
      if (responseData && typeof responseData === 'object' && 'success' in responseData && 'data' in responseData) {
        return responseData.data;
      }

      // Return direct response if not wrapped
      return responseData;
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

  async getProperties(options: { active?: boolean } = {}): Promise<Record<string, PropertyData>> {
    return performanceMonitor.measureAsyncFunction('getProperties', async () => {
      // Check cache first
      const cacheKey = this.getCacheKey('/api/properties', options);
      const cachedResult = this.getFromCache<Record<string, PropertyData>>(cacheKey);

      if (cachedResult) {
        performanceMonitor.recordMetric('Properties_CacheHit', 1);
        return cachedResult;
      }

      console.log('Enhanced Database Service: Fetching properties via API...');

      try {
        // Build query parameters for filtering - ensure we get ALL properties by setting high limit
        const queryParams = new URLSearchParams();
        if (options.active !== undefined) {
          queryParams.set('active', options.active.toString());
        }
        // Set high limit to ensure we get all properties, not just 20
        queryParams.set('limit', '100');
        queryParams.set('page', '1');

        const endpoint = `/api/properties${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

        const result = await performanceMonitor.trackApiCall(
          'properties',
          () => this.apiCall(
            endpoint,
            { method: 'GET' },
            () => {
              console.log('API call failed, trying localStorage fallback...');
              performanceMonitor.recordMetric('Properties_FallbackUsed', 1);

              // Try localStorage first
              const stored = getStoredProperties();
              if (Object.keys(stored).length > 0) {
                console.log(`Found ${Object.keys(stored).length} properties in localStorage`);

                // Filter by active status if requested
                if (options.active !== undefined) {
                  const filtered: Record<string, PropertyData> = {};
                  Object.entries(stored).forEach(([key, property]) => {
                    if (property.active === options.active) {
                      filtered[key] = property;
                    }
                  });
                  return filtered;
                }

                return stored;
              }
              // Fall back to production defaults if localStorage is empty
              console.log('Using production fallback properties');
              const fallback = getProductionFallbackProperties() as Record<string, PropertyData>;

              // Filter by active status if requested
              if (options.active !== undefined) {
                const filtered: Record<string, PropertyData> = {};
                Object.entries(fallback).forEach(([key, property]) => {
                  if (property.active === options.active) {
                    filtered[key] = property;
                  }
                });
                return filtered;
              }

              return fallback;
            }
          )
        );

        // Cache the result for future use
        this.setCache(cacheKey, result);
        performanceMonitor.recordMetric('Properties_CacheSet', Object.keys(result).length);

        console.log(`Successfully fetched ${Object.keys(result).length} properties from API and cached result`);
        return result;
      } catch (error) {
        console.error('Enhanced Database Service: Error fetching properties:', error);
        performanceMonitor.recordMetric('Properties_Error', 1);
        throw error;
      }
    });
  }

  async getProperty(id: string): Promise<PropertyData | null> {
    return this.apiCall(
      `/api/properties/${id}`,
      { method: 'GET' },
      () => getStoredProperty(id)
    );
  }

  async saveProperty(id: string, propertyData: PropertyData): Promise<void> {
    const result = await this.apiCall(
      '/api/properties',
      {
        method: 'POST',
        body: JSON.stringify({ ...propertyData, id }),
      },
      () => saveStoredProperty(id, propertyData)
    );

    // Invalidate properties cache after modification
    this.invalidateCache('/api/properties');

    return result;
  }

  async updatePropertyStatus(id: string, updates: { featured?: boolean; active?: boolean }): Promise<void> {
    const result = await this.apiCall(
      '/api/properties',
      {
        method: 'PUT',
        body: JSON.stringify({ id, updates }),
      },
      () => updateStoredPropertyStatus(id, updates)
    );

    // Invalidate properties cache after modification
    this.invalidateCache('/api/properties');

    return result;
  }

  // =============================================
  // WEBSITE SETTINGS MANAGEMENT
  // =============================================

  async getWebsiteSettings(): Promise<WebsiteSettings> {
    return performanceMonitor.measureAsyncFunction('getWebsiteSettings', async () => {
      // Check cache first
      const cacheKey = this.getCacheKey('/api/settings');
      const cachedResult = this.getFromCache<WebsiteSettings>(cacheKey);

      if (cachedResult) {
        performanceMonitor.recordMetric('Settings_CacheHit', 1);
        return cachedResult;
      }

      const result = await performanceMonitor.trackApiCall(
        'settings',
        () => this.apiCall(
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
            performanceMonitor.recordMetric('Settings_FallbackUsed', 1);
            return getProductionFallbackSettings() as WebsiteSettings;
          }
        )
      );

      // Cache the result
      this.setCache(cacheKey, result);
      performanceMonitor.recordMetric('Settings_CacheSet', 1);

      return result;
    });
  }

  async saveWebsiteSettings(settings: Partial<WebsiteSettings>): Promise<void> {
    const result = await this.apiCall(
      '/api/settings',
      {
        method: 'POST',
        body: JSON.stringify(settings),
      },
      () => saveSettings(settings)
    );

    // Invalidate settings cache after modification
    this.invalidateCache('/api/settings');

    return result;
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