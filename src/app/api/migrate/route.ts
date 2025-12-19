import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { PropertyData } from '@/lib/types';

interface WebsiteSettings {
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

interface CalendarBlock {
  id: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  reason: string;
  source: 'manual' | 'airbnb';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { action, properties, settings, calendarBlocks } = body;

    const errors: string[] = [];
    let migratedCount = 0;

    if (action === 'migrate') {
      // Migrate properties
      if (properties) {
        for (const [id, property] of Object.entries(properties as Record<string, PropertyData>)) {
          try {
            const { error } = await supabase.rpc('upsert_property_with_string_id', {
              property_id: id,
              property_name: property.name,
              property_type: property.type,
              bedrooms_count: property.bedrooms,
              bathrooms_count: property.bathrooms,
              max_guests_count: property.maxGuests,
              size_sqm_value: property.size,
              description_text: property.description,
              location_text: property.location,
              price_per_night_value: property.pricePerNight,
              airbnb_url_value: property.airbnbUrl,
              ical_url_value: property.icalUrl || '',
              featured_flag: property.featured || false,
              active_flag: property.active !== false,
              amenities_array: property.amenities,
              photos_array: property.photos,
              featured_photo_index_value: property.featuredPhotoIndex || 0
            });

            if (error) {
              errors.push(`Failed to migrate property ${id}: ${error.message}`);
            } else {
              migratedCount++;
            }
          } catch (error) {
            errors.push(`Error migrating property ${id}: ${error}`);
          }
        }
      }

      // Migrate settings
      if (settings) {
        try {
          const settingsArray = Object.entries(settings as WebsiteSettings).map(([key, value]) => {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            return {
              setting_key: snakeKey,
              setting_value: value as string,
              updated_at: new Date().toISOString()
            };
          });

          for (const setting of settingsArray) {
            const { error } = await supabase
              .from('website_settings')
              .upsert(setting, { onConflict: 'setting_key' });

            if (error) {
              errors.push(`Failed to migrate setting ${setting.setting_key}: ${error.message}`);
            }
          }
        } catch (error) {
          errors.push(`Error migrating settings: ${error}`);
        }
      }

      // Migrate calendar blocks
      if (calendarBlocks && Array.isArray(calendarBlocks)) {
        try {
          // Clear existing blocks first
          await supabase
            .from('calendar_blocks')
            .delete()
            .neq('id', 'never-matches');

          if (calendarBlocks.length > 0) {
            const { error } = await supabase
              .from('calendar_blocks')
              .insert(
                (calendarBlocks as CalendarBlock[]).map((block) => ({
                  id: block.id,
                  property_id: block.propertyId,
                  start_date: block.startDate,
                  end_date: block.endDate,
                  reason: block.reason,
                  source: block.source
                }))
              );

            if (error) {
              errors.push(`Failed to migrate calendar blocks: ${error.message}`);
            }
          }
        } catch (error) {
          errors.push(`Error migrating calendar blocks: ${error}`);
        }
      }

      return NextResponse.json({
        success: errors.length === 0,
        migratedCount,
        errors
      });

    } else if (action === 'validate') {
      // Validation logic
      const validation = {
        propertiesMatch: true,
        settingsMatch: true,
        calendarMatch: true,
        details: [] as string[]
      };

      try {
        // Check properties
        if (properties) {
          const { data: dbProperties } = await supabase
            .from('properties')
            .select('slug')
            .in('slug', Object.keys(properties));

          const dbCount = dbProperties?.length || 0;
          const localCount = Object.keys(properties).length;

          if (dbCount !== localCount) {
            validation.propertiesMatch = false;
            validation.details.push(`Properties count mismatch: DB has ${dbCount}, localStorage has ${localCount}`);
          }
        }

        // Check settings
        if (settings) {
          const { data: dbSettings } = await supabase
            .from('website_settings')
            .select('setting_key, setting_value');

          const dbSettingsObj: Record<string, string> = {};
          dbSettings?.forEach(s => {
            const camelKey = s.setting_key.replace(/_([a-z])/g, (_: string, letter: string) => letter.toUpperCase());
            dbSettingsObj[camelKey] = s.setting_value || '';
          });

          const localSettings = settings as WebsiteSettings;
          for (const [key, value] of Object.entries(localSettings)) {
            if (key !== 'updatedAt' && dbSettingsObj[key] !== value) {
              validation.settingsMatch = false;
              validation.details.push(`Setting ${key} differs: DB="${dbSettingsObj[key]}", local="${value}"`);
              break;
            }
          }
        }

        // Check calendar blocks
        if (calendarBlocks) {
          const { data: dbBlocks } = await supabase
            .from('calendar_blocks')
            .select('id');

          const dbCount = dbBlocks?.length || 0;
          const localCount = (calendarBlocks as CalendarBlock[]).length;

          if (dbCount !== localCount) {
            validation.calendarMatch = false;
            validation.details.push(`Calendar blocks count mismatch: DB has ${dbCount}, localStorage has ${localCount}`);
          }
        }

      } catch (error) {
        validation.details.push(`Validation error: ${error}`);
        validation.propertiesMatch = false;
        validation.settingsMatch = false;
        validation.calendarMatch = false;
      }

      return NextResponse.json(validation);

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Migration API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}