/**
 * Post-Migration Database Service
 *
 * Now that migration is complete, this service prioritizes database data
 * and only falls back to production defaults when database is truly unavailable.
 */

import { enhancedDatabaseService } from './enhanced-database-service';
import { getProductionFallbackProperties, getProductionFallbackSettings } from './production-fallback-service';
import { createAdminClient } from './api-auth';

class PostMigrationService {

  async getProperties(options?: { active?: boolean }) {
    try {
      // Check if we're on the server - use direct database access
      if (typeof window === 'undefined') {
        console.log('Server-side: Using direct database access');
        const adminClient = createAdminClient();

        if (!adminClient) {
          console.log('⚠️ Server-side: Database not configured, using fallback properties');
          return getProductionFallbackProperties();
        }

        // Build query with joins for photos
        let query = adminClient
          .from('properties')
          .select(`
            id,
            name,
            slug,
            description,
            short_description,
            type,
            bedrooms,
            bathrooms,
            max_guests,
            size_sqm,
            location,
            address,
            price_per_night,
            map_url,
            airbnb_url,
            ical_url,
            amenities,
            featured,
            active,
            display_order,
            featured_photo_index,
            created_at,
            updated_at,
            property_photos (
              id,
              url,
              alt_text,
              is_primary,
              display_order
            )
          `);

        // Apply filters
        if (options?.active !== undefined) {
          query = query.eq('active', options.active);
        }

        // Apply sorting
        query = query.order('display_order', { ascending: true, nullsFirst: false });

        const { data, error } = await query;

        if (error) {
          console.error('Server-side database error:', error);
          return getProductionFallbackProperties();
        }

        // Convert to the format expected by the frontend
        const result: Record<string, any> = {};

        (data || []).forEach((prop) => {
          const slug = prop.slug || prop.id || prop.name?.toLowerCase().replace(/\s+/g, '-') || 'property-' + Date.now();

          // Sort photos properly
          const sortedPhotos = (prop.property_photos || [])
            .filter((photo: any) => photo.url)
            .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
            .map((photo: any) => photo.url);

          // Find featured photo index
          const featuredPhotoIndex = (prop.property_photos || [])
            .findIndex((photo: any) => photo.is_primary) || 0;

          result[slug] = {
            id: slug,
            uuid: prop.id,
            title: prop.name || '',
            name: prop.name || '',
            description: prop.description || prop.short_description || '',
            short_description: prop.short_description || prop.description || '',
            type: prop.type || 'apartment',
            bedrooms: prop.bedrooms || 2,
            bathrooms: prop.bathrooms || 1,
            maxGuests: prop.max_guests || 4,
            size: prop.size_sqm || '45',
            area: parseFloat(prop.size_sqm || '45'),
            areaUnit: 'sqm',
            location: prop.location || '',
            address: prop.address || '',
            price: parseFloat(prop.price_per_night || '2500'),
            priceUnit: 'PHP/night',
            pricePerNight: prop.price_per_night || '2500',
            airbnbUrl: prop.airbnb_url || '',
            airbnbIcalUrl: prop.ical_url || '',
            icalUrl: prop.ical_url || '',
            mapUrl: prop.map_url || '',
            featured: prop.featured === true,
            active: prop.active === true,
            amenities: Array.isArray(prop.amenities) ? prop.amenities : [],
            images: sortedPhotos,
            photos: sortedPhotos,
            featuredPhotoIndex: featuredPhotoIndex >= 0 ? featuredPhotoIndex : 0,
            slug: slug,
            displayOrder: prop.display_order || 0,
            createdAt: prop.created_at,
            updatedAt: prop.updated_at
          };
        });

        if (Object.keys(result).length > 0) {
          console.log(`✅ Server-side: Loaded ${Object.keys(result).length} properties from database`);
          return result;
        } else {
          console.log('⚠️ Server-side: No properties found in database, using fallback');
          return getProductionFallbackProperties();
        }
      }

      // Client-side: Use API calls
      console.log('Client-side: Using API calls');
      const dbProperties = await enhancedDatabaseService.getProperties(options);

      // Check if we have real database data (not empty fallback)
      if (dbProperties && Object.keys(dbProperties).length > 0) {
        // Check if this looks like database data vs fallback
        const firstProperty = Object.values(dbProperties)[0] as any;
        if (firstProperty && (firstProperty.id || firstProperty.name)) {
          console.log('✅ Client-side: Loading properties from database');
          return dbProperties;
        }
      }

      // If database is empty or unavailable, use production fallback
      console.log('⚠️ Client-side: Database unavailable, using fallback properties');
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
    try {
      // First, try to get from database API
      const dbProperty = await enhancedDatabaseService.getProperty(id);

      if (dbProperty) {
        console.log('✅ Loading property from database');
        return dbProperty;
      }
    } catch (error) {
      console.error('Database property error, trying fallback:', error);
    }

    // If database is unavailable, check fallback
    try {
      const fallbackProperties = getProductionFallbackProperties();
      const property = Object.values(fallbackProperties).find((p: any) =>
        (p.slug || p.id) === id
      );

      if (property) {
        console.log('⚠️ Loading property from fallback');
        return property;
      }
    } catch (error) {
      console.error('Fallback property error:', error);
    }

    return null;
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