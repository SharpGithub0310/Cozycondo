import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireAuth, rateLimit } from '@/lib/api-auth';
import {
  successResponse,
  errorResponse,
  handleDatabaseError
} from '@/lib/api-utils';

// GET /api/settings - Get all website settings
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 100, 15 * 60 * 1000); // 100 requests per 15 minutes
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

    const adminClient = createAdminClient();

    if (!adminClient) {
      return errorResponse(
        'Database not configured. Using fallback to localStorage.',
        503,
        { fallback: 'localStorage' }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const format = searchParams.get('format') || 'camelCase';

    // Build query
    let query = adminClient
      .from('website_settings')
      .select('setting_key, setting_value, setting_type, category, description, updated_at');

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    query = query.order('setting_key');

    const { data: settings, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    if (format === 'raw') {
      // Return raw database format
      return successResponse(
        settings || [],
        `Retrieved ${(settings || []).length} settings`,
        {
          total: (settings || []).length,
          format: 'raw',
          timestamp: new Date().toISOString()
        }
      );
    }

    const settingsObj: any = {};
    (settings || []).forEach((setting) => {
      // Convert snake_case to camelCase for backward compatibility
      const camelKey = setting.setting_key
        .replace(/_([a-z])/g, (match: any, letter: any) => letter.toUpperCase());
      settingsObj[camelKey] = setting.setting_value || '';
    });

    // Ensure all required fields exist with defaults for backward compatibility
    const result = {
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
      updatedAt: new Date().toISOString()
    };

    return successResponse(
      result,
      `Retrieved ${Object.keys(result).length - 1} settings`,
      {
        total: (settings || []).length,
        format: 'camelCase',
        timestamp: new Date().toISOString()
      }
    );

  } catch (error) {
    console.error('Settings GET error:', error);
    return errorResponse(
      'Failed to retrieve settings',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// POST /api/settings - Update website settings (admin only)
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for admin operations
    const rateLimitResult = rateLimit(request, 30, 15 * 60 * 1000); // 30 requests per 15 minutes
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

      // Support both single setting and bulk update formats
      if (body.key && body.value !== undefined) {
        // Single setting update
        const { key, value, type, description, category } = body;

        // Upsert setting
        const { error } = await adminClient
          .from('website_settings')
          .upsert({
            setting_key: key,
            setting_value: String(value || ''),
            setting_type: type || detectSettingType(value),
            description: description || null,
            category: category || getCategoryForKey(key),
            updated_at: new Date().toISOString()
          }, { onConflict: 'setting_key' });

        if (error) {
          return handleDatabaseError(error);
        }

        console.log(`Setting updated: ${key}`);

        return successResponse(
          { key, value, success: true },
          'Setting updated successfully',
          { timestamp: new Date().toISOString() }
        );

      } else {
        // Bulk settings update (legacy format support)
        const settings = body;

        if (!settings || typeof settings !== 'object') {
          return errorResponse('Invalid settings object', 400);
        }

        // Convert camelCase to snake_case and prepare for batch update
        const settingsArray = Object.entries(settings).map(([key, value]) => {
          const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          return {
            setting_key: snakeKey,
            setting_value: String(value || ''),
            setting_type: 'text', // Default type for legacy format
            category: getCategoryForKey(snakeKey),
            updated_at: new Date().toISOString()
          };
        });

        if (settingsArray.length === 0) {
          return errorResponse('No settings provided', 400);
        }

        // Upsert each setting
        const { error } = await adminClient
          .from('website_settings')
          .upsert(settingsArray, { onConflict: 'setting_key' });

        if (error) {
          console.error('Error saving settings:', error);
          return handleDatabaseError(error);
        }

        console.log(`Bulk settings updated: ${settingsArray.length} settings`);

        return successResponse(
          {
            updatedCount: settingsArray.length,
            settings: settingsArray.map(s => s.setting_key),
            success: true
          },
          'Settings updated successfully',
          { timestamp: new Date().toISOString() }
        );
      }
    });

  } catch (error) {
    console.error('Settings POST error:', error);
    return errorResponse(
      'Failed to update settings',
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