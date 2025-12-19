import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireAuth, rateLimit } from '@/lib/api-auth';
import {
  successResponse,
  errorResponse,
  handleDatabaseError
} from '@/lib/api-utils';

// POST /api/migrate/from-localstorage - Migrate localStorage data to database (admin only)
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for admin operations (stricter for migration)
    const rateLimitResult = rateLimit(request, 5, 15 * 60 * 1000); // 5 requests per 15 minutes
    if (!rateLimitResult.allowed) {
      return errorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        {
          resetTime: new Date(rateLimitResult.resetTime).toISOString(),
          remaining: rateLimitResult.remaining
        }
      );
    }

    return await requireAuth(request, async (req, adminSession) => {
      const adminClient = createAdminClient();

      if (!adminClient) {
        return errorResponse('Database not configured', 503);
      }

      const body = await req.json();

      if (!body.properties && !body.settings) {
        return errorResponse('No data provided. Send properties and/or settings objects.', 400);
      }

      const migrationResults = {
        properties: {
          migrated: 0,
          failed: 0,
          errors: [] as string[]
        },
        settings: {
          migrated: 0,
          failed: 0,
          errors: [] as string[]
        },
        calendar: {
          migrated: 0,
          failed: 0,
          errors: [] as string[]
        }
      };

      // Migrate Properties
      if (body.properties) {
        console.log('Migrating properties from localStorage...');

        for (const [propertyId, propertyData] of Object.entries(body.properties)) {
          try {
            const data = propertyData as any;

            // Use the existing RPC function for property migration
            const { error } = await adminClient.rpc('upsert_property_with_string_id', {
              property_id: propertyId,
              property_name: data.name || data.title,
              property_type: data.type || 'apartment',
              bedrooms_count: data.bedrooms || 2,
              bathrooms_count: data.bathrooms || 1,
              max_guests_count: data.maxGuests || 4,
              size_sqm_value: data.size?.toString() || data.area?.toString() || '45',
              description_text: data.description || '',
              location_text: data.location || '',
              price_per_night_value: data.pricePerNight || data.price?.toString() || '2500',
              airbnb_url_value: data.airbnbUrl || '',
              ical_url_value: data.icalUrl || '',
              featured_flag: data.featured || false,
              active_flag: data.active !== false,
              amenities_array: data.amenities || [],
              photos_array: data.photos || data.images || [],
              featured_photo_index_value: data.featuredPhotoIndex || 0
            });

            if (error) {
              migrationResults.properties.failed++;
              migrationResults.properties.errors.push(`${propertyId}: ${error.message}`);
              console.error(`Failed to migrate property ${propertyId}:`, error);
            } else {
              migrationResults.properties.migrated++;
              console.log(`Migrated property: ${propertyId}`);
            }

          } catch (error) {
            migrationResults.properties.failed++;
            migrationResults.properties.errors.push(`${propertyId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error(`Error migrating property ${propertyId}:`, error);
          }
        }
      }

      // Migrate Settings
      if (body.settings) {
        console.log('Migrating settings from localStorage...');

        // Convert settings to database format
        const settingsArray = Object.entries(body.settings).map(([key, value]) => {
          const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          return {
            setting_key: snakeKey,
            setting_value: String(value || ''),
            setting_type: detectSettingType(value),
            category: getCategoryForKey(snakeKey),
            updated_at: new Date().toISOString()
          };
        });

        try {
          const { error } = await adminClient
            .from('website_settings')
            .upsert(settingsArray, { onConflict: 'setting_key' });

          if (error) {
            migrationResults.settings.failed = settingsArray.length;
            migrationResults.settings.errors.push(`Bulk settings migration failed: ${error.message}`);
            console.error('Failed to migrate settings:', error);
          } else {
            migrationResults.settings.migrated = settingsArray.length;
            console.log(`Migrated ${settingsArray.length} settings`);
          }

        } catch (error) {
          migrationResults.settings.failed = settingsArray.length;
          migrationResults.settings.errors.push(`Settings migration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.error('Error migrating settings:', error);
        }
      }

      // Migrate Calendar Events (if provided)
      if (body.calendarEvents) {
        console.log('Migrating calendar events from localStorage...');

        for (const [eventId, eventData] of Object.entries(body.calendarEvents)) {
          try {
            const data = eventData as any;

            const { error } = await adminClient
              .from('calendar_blocks')
              .upsert({
                id: eventId,
                property_id: data.propertyId || data.property_id,
                start_date: data.startDate || data.start_date,
                end_date: data.endDate || data.end_date,
                reason: data.reason || 'Blocked',
                source: data.source || 'manual',
                created_at: data.createdAt || new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' });

            if (error) {
              migrationResults.calendar.failed++;
              migrationResults.calendar.errors.push(`${eventId}: ${error.message}`);
              console.error(`Failed to migrate calendar event ${eventId}:`, error);
            } else {
              migrationResults.calendar.migrated++;
              console.log(`Migrated calendar event: ${eventId}`);
            }

          } catch (error) {
            migrationResults.calendar.failed++;
            migrationResults.calendar.errors.push(`${eventId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error(`Error migrating calendar event ${eventId}:`, error);
          }
        }
      }

      // Calculate totals
      const totalMigrated = migrationResults.properties.migrated + migrationResults.settings.migrated + migrationResults.calendar.migrated;
      const totalFailed = migrationResults.properties.failed + migrationResults.settings.failed + migrationResults.calendar.failed;

      console.log(`Migration completed: ${totalMigrated} items migrated, ${totalFailed} failed`);

      return successResponse(
        {
          migration: migrationResults,
          summary: {
            totalMigrated,
            totalFailed,
            success: totalFailed === 0
          }
        },
        `Migration completed: ${totalMigrated} items migrated${totalFailed > 0 ? `, ${totalFailed} failed` : ''}`,
        {
          timestamp: new Date().toISOString(),
          migrationId: `migration_${Date.now()}`
        }
      );
    });

  } catch (error) {
    console.error('Migration error:', error);
    return errorResponse(
      'Failed to migrate data',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// GET /api/migrate/from-localstorage - Get migration status and instructions (admin only)
export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = rateLimit(request, 20, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return errorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        {
          resetTime: new Date(rateLimitResult.resetTime).toISOString(),
          remaining: rateLimitResult.remaining
        }
      );
    }

    return await requireAuth(request, async (req, adminSession) => {
      const adminClient = createAdminClient();

      if (!adminClient) {
        return errorResponse('Database not configured', 503);
      }

      // Get current database counts for comparison
      const [propertiesResult, settingsResult] = await Promise.all([
        adminClient.from('properties').select('*', { count: 'exact', head: true }),
        adminClient.from('website_settings').select('*', { count: 'exact', head: true })
      ]);

      const dbStats = {
        properties: propertiesResult.count || 0,
        settings: settingsResult.count || 0
      };

      const instructions = {
        title: 'localStorage to Database Migration',
        description: 'Migrate your localStorage data to the Supabase database for sync across devices.',
        endpoint: '/api/migrate/from-localstorage',
        method: 'POST',
        requiredFormat: {
          properties: {
            'property-slug': {
              name: 'Property Name',
              type: 'apartment',
              bedrooms: 2,
              bathrooms: 1,
              maxGuests: 4,
              size: '45',
              description: 'Property description',
              location: 'Iloilo City',
              pricePerNight: '2500',
              airbnbUrl: 'https://airbnb.com/...',
              icalUrl: 'https://calendar.../export.ics',
              featured: false,
              active: true,
              amenities: ['WiFi', 'Air-conditioning'],
              photos: ['image1.jpg', 'image2.jpg'],
              featuredPhotoIndex: 0
            }
          },
          settings: {
            heroTitle: 'Your Cozy Escape in Iloilo City',
            heroDescription: 'Description text...',
            logo: 'logo.png',
            statsUnits: '9+',
            // ... other settings
          },
          calendarEvents: {
            'event-id': {
              propertyId: 'property-slug',
              startDate: '2024-01-01',
              endDate: '2024-01-07',
              reason: 'Blocked',
              source: 'manual'
            }
          }
        },
        currentDatabaseState: dbStats
      };

      return successResponse(
        instructions,
        'Migration instructions retrieved successfully',
        { timestamp: new Date().toISOString() }
      );
    });

  } catch (error) {
    console.error('Migration info error:', error);
    return errorResponse(
      'Failed to retrieve migration information',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// Helper function to detect setting type from value
function detectSettingType(value: any): string {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'string' && (value.includes('.jpg') || value.includes('.png') || value.includes('.webp') || value.includes('.svg'))) {
    return 'image';
  }
  return 'text';
}

// Helper function to categorize settings by key
function getCategoryForKey(key: string): string {
  if (key.includes('hero_')) return 'hero';
  if (key.includes('logo') || key.includes('favicon') || key.includes('image') || key.includes('background')) return 'images';
  if (key.includes('stats_')) return 'stats';
  if (key.includes('phone') || key.includes('email') || key.includes('address')) return 'contact';
  if (key.includes('facebook') || key.includes('messenger') || key.includes('social')) return 'social';
  if (key.includes('featured_') || key.includes('highly_rated_')) return 'sections';
  return 'general';
}