/**
 * Clean Database Service for Cozy Condo
 *
 * This service provides a clean, database-only interface to Supabase.
 * No fallbacks, no localStorage, no hybrid mechanisms.
 * Proper error handling without bypassing the database.
 */

import { supabase, createAdminClient } from './supabase';
import { PropertyData, WebsiteSettings } from './types';

// =============================================
// TYPES
// =============================================


// =============================================
// CLEAN DATABASE SERVICE
// =============================================

class CleanDatabaseService {

  // =============================================
  // UTILITY METHODS
  // =============================================

  private ensureSupabaseClient() {
    if (!supabase) {
      throw new Error('Supabase client not configured. Please check environment variables.');
    }
    return supabase;
  }

  private ensureAdminClient() {
    const adminClient = createAdminClient();
    if (!adminClient) {
      throw new Error('Supabase admin client not available. Server-side only operation.');
    }
    return adminClient;
  }

  private isServerSide(): boolean {
    return typeof window === 'undefined';
  }

  // =============================================
  // PROPERTY MANAGEMENT
  // =============================================

  async getProperties(options: { active?: boolean } = {}): Promise<Record<string, PropertyData>> {
    let client;

    if (this.isServerSide()) {
      // Server-side: Use admin client for direct database access
      client = this.ensureAdminClient();
    } else {
      // Client-side: Use regular client
      client = this.ensureSupabaseClient();
    }

    // Build query with joins for photos
    let query = client
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
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }

    // Convert to the format expected by the frontend
    const result: Record<string, PropertyData> = {};

    (data || []).forEach((prop: any) => {
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
        title: prop.name || '',
        name: prop.name || '',
        description: prop.description || prop.short_description || '',
        short_description: prop.short_description || prop.description || '',
        type: prop.type || 'apartment',
        bedrooms: prop.bedrooms || 2,
        bathrooms: prop.bathrooms || 1,
        maxGuests: prop.max_guests || 4,
        size: prop.size_sqm || '45',
        location: prop.location || '',
        pricePerNight: prop.price_per_night || '2500',
        airbnbUrl: prop.airbnb_url || '',
        featured: prop.featured === true,
        active: prop.active === true,
        amenities: Array.isArray(prop.amenities) ? prop.amenities : [],
        images: sortedPhotos,
        photos: sortedPhotos,
        featuredPhotoIndex: featuredPhotoIndex >= 0 ? featuredPhotoIndex : 0,
        slug: slug,
        updatedAt: prop.updated_at
      };
    });

    return result;
  }

  async getProperty(id: string): Promise<PropertyData | null> {
    const client = this.isServerSide() ? this.ensureAdminClient() : this.ensureSupabaseClient();

    const { data: property, error } = await client
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
        amenities,
        featured,
        active,
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
      `)
      .eq('slug', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch property: ${error.message}`);
    }

    if (!property) {
      return null;
    }

    // Sort photos properly
    const sortedPhotos = (property.property_photos || [])
      .filter((photo: any) => photo.url)
      .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
      .map((photo: any) => photo.url);

    // Find featured photo index
    const featuredPhotoIndex = (property.property_photos || [])
      .findIndex((photo: any) => photo.is_primary) || 0;

    const slug = property.slug || property.id || property.name?.toLowerCase().replace(/\s+/g, '-') || 'property-' + Date.now();

    return {
      id: slug,
      title: property.name || '',
      name: property.name || '',
      description: property.description || property.short_description || '',
      short_description: property.short_description || property.description || '',
      type: property.type || 'apartment',
      bedrooms: property.bedrooms || 2,
      bathrooms: property.bathrooms || 1,
      maxGuests: property.max_guests || 4,
      size: property.size_sqm || '45',
      location: property.location || '',
      pricePerNight: property.price_per_night || '2500',
      airbnbUrl: property.airbnb_url || '',
      featured: property.featured === true,
      active: property.active === true,
      amenities: Array.isArray(property.amenities) ? property.amenities : [],
      photos: sortedPhotos,
      featuredPhotoIndex: featuredPhotoIndex >= 0 ? featuredPhotoIndex : 0,
      slug: slug,
      updatedAt: property.updated_at
    };
  }

  async saveProperty(id: string, propertyData: PropertyData): Promise<void> {
    const client = this.isServerSide() ? this.ensureAdminClient() : this.ensureSupabaseClient();

    const { error } = await client.rpc('upsert_property_with_string_id', {
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
      featured_flag: propertyData.featured || false,
      active_flag: propertyData.active !== false,
      amenities_array: propertyData.amenities,
      photos_array: propertyData.photos,
      featured_photo_index_value: propertyData.featuredPhotoIndex || 0
    });

    if (error) {
      throw new Error(`Failed to save property: ${error.message}`);
    }
  }

  async updatePropertyStatus(id: string, updates: { featured?: boolean; active?: boolean }): Promise<void> {
    const client = this.isServerSide() ? this.ensureAdminClient() : this.ensureSupabaseClient();

    const { error } = await client
      .from('properties')
      .update(updates)
      .eq('slug', id);

    if (error) {
      throw new Error(`Failed to update property status: ${error.message}`);
    }
  }

  // =============================================
  // WEBSITE SETTINGS MANAGEMENT
  // =============================================

  async getWebsiteSettings(): Promise<WebsiteSettings> {
    const client = this.isServerSide() ? this.ensureAdminClient() : this.ensureSupabaseClient();

    const { data: settings, error } = await client
      .from('website_settings')
      .select('setting_key, setting_value');

    if (error) {
      throw new Error(`Failed to fetch website settings: ${error.message}`);
    }

    const settingsObj: any = {};
    settings?.forEach((setting: any) => {
      // Convert snake_case to camelCase
      const camelKey = setting.setting_key
        .replace(/_([a-z])/g, (match: string, letter: string) => letter.toUpperCase());
      settingsObj[camelKey] = setting.setting_value || '';
    });

    // Parse FAQs if it exists
    let faqs = [];
    if (settingsObj.faqs) {
      try {
        faqs = typeof settingsObj.faqs === 'string'
          ? JSON.parse(settingsObj.faqs)
          : settingsObj.faqs;
        if (!Array.isArray(faqs)) {
          faqs = [];
        }
      } catch (e) {
        console.error('Error parsing FAQs:', e);
        faqs = [];
      }
    }

    // Ensure all required fields exist with defaults
    return {
      logo: settingsObj.logo || '',
      footerLogo: settingsObj.footerLogo || '',
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
      phone: settingsObj.phone || '',
      email: settingsObj.email || '',
      address: settingsObj.address || '',
      website: settingsObj.website || '',
      facebookUrl: settingsObj.facebookUrl || '',
      messengerUrl: settingsObj.messengerUrl || '',
      checkinTime: settingsObj.checkinTime || '',
      checkoutTime: settingsObj.checkoutTime || '',
      timezone: settingsObj.timezone || '',
      currency: settingsObj.currency || '',
      faqs: faqs,
      companyName: settingsObj.companyName || '',
      updatedAt: new Date().toISOString()
    };
  }

  async saveWebsiteSettings(settings: Partial<WebsiteSettings>): Promise<void> {
    const client = this.isServerSide() ? this.ensureAdminClient() : this.ensureSupabaseClient();

    // Convert camelCase to snake_case and prepare for batch update
    const settingsArray = Object.entries(settings).map(([key, value]) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      return { setting_key: snakeKey, setting_value: value as string };
    });

    // Use upsert to update multiple settings
    for (const setting of settingsArray) {
      const { error } = await client
        .from('website_settings')
        .upsert(setting, { onConflict: 'setting_key' });

      if (error) {
        throw new Error(`Failed to save website setting ${setting.setting_key}: ${error.message}`);
      }
    }
  }

}

// =============================================
// SINGLETON INSTANCE
// =============================================

export const databaseService = new CleanDatabaseService();

// =============================================
// CONVENIENCE EXPORTS
// =============================================

export const {
  getProperties,
  getProperty,
  saveProperty,
  updatePropertyStatus,
  getWebsiteSettings,
  saveWebsiteSettings
} = databaseService;

export default databaseService;