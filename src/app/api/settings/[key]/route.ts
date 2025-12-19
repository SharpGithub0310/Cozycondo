import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireAuth, rateLimit } from '@/lib/api-auth';
import {
  successResponse,
  errorResponse,
  handleDatabaseError
} from '@/lib/api-utils';

// GET /api/settings/[key] - Get specific setting by key
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
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

    const { key } = await params;

    // Convert camelCase to snake_case if needed
    const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

    // Query setting
    const { data: setting, error } = await adminClient
      .from('website_settings')
      .select('*')
      .eq('setting_key', dbKey)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Setting not found', 404);
      }
      return handleDatabaseError(error);
    }

    // Parse value based on type
    let parsedValue = setting.setting_value || '';
    switch (setting.setting_type) {
      case 'number':
        parsedValue = parseFloat(parsedValue);
        break;
      case 'boolean':
        parsedValue = parsedValue === 'true' || parsedValue === '1';
        break;
      case 'object':
      case 'array':
        try {
          parsedValue = JSON.parse(parsedValue);
        } catch {
          parsedValue = setting.setting_type === 'array' ? [] : {};
        }
        break;
    }

    const result = {
      key: setting.setting_key,
      value: parsedValue,
      type: setting.setting_type,
      description: setting.description,
      category: setting.category,
      updatedAt: setting.updated_at
    };

    return successResponse(
      result,
      `Setting ${key} retrieved successfully`,
      { timestamp: new Date().toISOString() }
    );

  } catch (error) {
    console.error('Setting GET error:', error);
    return errorResponse(
      'Failed to retrieve setting',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// PUT /api/settings/[key] - Update specific setting (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    // Apply rate limiting for admin operations
    const rateLimitResult = rateLimit(request, 50, 15 * 60 * 1000); // 50 requests per 15 minutes
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

      const { key } = await params;
      const body = await req.json();

      if (body.value === undefined) {
        return errorResponse('Value is required', 400);
      }

      const { value, type, description, category } = body;

      // Convert camelCase to snake_case if needed
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

      // Detect type if not provided
      const settingType = type || detectSettingType(value);

      // Stringify value for storage
      let stringValue: string;
      switch (settingType) {
        case 'object':
        case 'array':
          stringValue = JSON.stringify(value);
          break;
        case 'boolean':
          stringValue = value ? 'true' : 'false';
          break;
        case 'number':
          stringValue = value.toString();
          break;
        default:
          stringValue = String(value || '');
      }

      // Upsert setting
      const { error } = await adminClient
        .from('website_settings')
        .upsert({
          setting_key: dbKey,
          setting_value: stringValue,
          setting_type: settingType,
          description: description || null,
          category: category || getCategoryForKey(dbKey),
          updated_at: new Date().toISOString()
        }, { onConflict: 'setting_key' });

      if (error) {
        return handleDatabaseError(error);
      }

      console.log(`Setting updated: ${key} = ${stringValue}`);

      return successResponse(
        {
          key: dbKey,
          value,
          type: settingType,
          success: true
        },
        'Setting updated successfully',
        { timestamp: new Date().toISOString() }
      );
    });

  } catch (error) {
    console.error('Setting PUT error:', error);
    return errorResponse(
      'Failed to update setting',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// DELETE /api/settings/[key] - Delete specific setting (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    // Apply rate limiting for admin operations
    const rateLimitResult = rateLimit(request, 20, 15 * 60 * 1000); // 20 requests per 15 minutes
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

      const { key } = await params;

      // Convert camelCase to snake_case if needed
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

      // First check if setting exists
      const { data: existing, error: fetchError } = await adminClient
        .from('website_settings')
        .select('setting_key, setting_value')
        .eq('setting_key', dbKey)
        .single();

      if (fetchError || !existing) {
        return errorResponse('Setting not found', 404);
      }

      // Delete setting
      const { error } = await adminClient
        .from('website_settings')
        .delete()
        .eq('setting_key', dbKey);

      if (error) {
        return handleDatabaseError(error);
      }

      console.log(`Setting deleted: ${key}`);

      return successResponse(
        {
          key: dbKey,
          previousValue: existing.setting_value
        },
        'Setting deleted successfully',
        { timestamp: new Date().toISOString() }
      );
    });

  } catch (error) {
    console.error('Setting DELETE error:', error);
    return errorResponse(
      'Failed to delete setting',
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