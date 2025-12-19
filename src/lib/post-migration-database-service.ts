/**
 * Post-Migration Database Service
 *
 * Now that migration is complete, this service prioritizes database data
 * and only falls back to production defaults when database is truly unavailable.
 */

import { enhancedDatabaseService } from './enhanced-database-service';
import { getProductionFallbackProperties, getProductionFallbackSettings } from './production-fallback-service';

class PostMigrationService {

  async getProperties() {
    try {
      // First, try to get from database API
      const dbProperties = await enhancedDatabaseService.getProperties();

      // Check if we have real database data (not empty fallback)
      if (dbProperties && Object.keys(dbProperties).length > 0) {
        // Check if this looks like database data vs fallback
        const firstProperty = Object.values(dbProperties)[0] as any;
        if (firstProperty && (firstProperty.id || firstProperty.name)) {
          console.log('✅ Loading properties from database');
          return dbProperties;
        }
      }

      // If database is empty or unavailable, use production fallback
      console.log('⚠️ Database unavailable, using fallback properties');
      return getProductionFallbackProperties();
    } catch (error) {
      console.error('Database error, using fallback:', error);
      return getProductionFallbackProperties();
    }
  }

  async getWebsiteSettings() {
    try {
      // First, try to get from database API
      const dbSettings = await enhancedDatabaseService.getWebsiteSettings();

      // Check if we have real database settings
      if (dbSettings) {
        console.log('✅ Loading settings from database');
        return dbSettings;
      }

      // If database is unavailable, use production fallback
      console.log('⚠️ Database unavailable, using fallback settings');
      return getProductionFallbackSettings();
    } catch (error) {
      console.error('Database settings error, using fallback:', error);
      return getProductionFallbackSettings();
    }
  }

  // Pass through other methods to the enhanced service
  async saveProperty(id: string, propertyData: any) {
    return enhancedDatabaseService.saveProperty(id, propertyData);
  }

  async updatePropertyStatus(id: string, updates: any) {
    return enhancedDatabaseService.updatePropertyStatus(id, updates);
  }

  async saveWebsiteSettings(settings: any) {
    return enhancedDatabaseService.saveWebsiteSettings(settings);
  }

  async getProperty(id: string) {
    return enhancedDatabaseService.getProperty(id);
  }

  async getCalendarBlocks() {
    return enhancedDatabaseService.getCalendarBlocks();
  }

  async saveCalendarBlocks(blocks: any) {
    return enhancedDatabaseService.saveCalendarBlocks(blocks);
  }

  async addCalendarBlock(block: any) {
    return enhancedDatabaseService.addCalendarBlock(block);
  }
}

export const postMigrationDatabaseService = new PostMigrationService();