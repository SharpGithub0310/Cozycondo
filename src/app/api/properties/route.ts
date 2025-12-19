import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireAuth, rateLimit } from '@/lib/api-auth';
import {
  successResponse,
  errorResponse,
  validateData,
  validateProperty,
  parseQueryParams,
  formatProperty,
  formatForDatabase,
  handleDatabaseError,
  type Property
} from '@/lib/api-utils';

// GET /api/properties - Get all properties with optional filtering
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
    const { page, limit, active, featured, search, sort, order } = parseQueryParams(searchParams);

    // Build query with joins for photos
    let query = adminClient
      .from('properties')
      .select('*, property_photos(*)');

    // Apply filters
    if (active !== undefined) {
      query = query.eq('active', active);
    }

    if (featured !== undefined) {
      query = query.eq('featured', featured);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'updated_at', 'name', 'price_per_night', 'bedrooms', 'bathrooms', 'display_order'];
    const sortField = validSortFields.includes(sort) ? sort : 'display_order';
    query = query.order(sortField, { ascending: order === 'asc' });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      return handleDatabaseError(error);
    }

    // Get total count for pagination metadata
    const { count, error: countError } = await adminClient
      .from('properties')
      .select('*', { count: 'exact', head: true });

    const totalCount = countError ? 0 : count || 0;

    // Convert to the format expected by the frontend (keeping backward compatibility)
    const result: Record<string, any> = {};

    (data || []).forEach((prop) => {
      result[prop.slug] = {
        id: prop.slug,
        title: prop.name,
        name: prop.name || '',
        description: prop.description || '',
        type: prop.type || 'apartment',
        bedrooms: prop.bedrooms || 2,
        bathrooms: prop.bathrooms || 1,
        maxGuests: prop.max_guests || 4,
        size: prop.size_sqm || '45',
        area: parseFloat(prop.size_sqm || '45'),
        areaUnit: 'sqm',
        location: prop.location || '',
        price: parseFloat(prop.price_per_night || '2500'),
        priceUnit: 'PHP/night',
        pricePerNight: prop.price_per_night || '2500',
        airbnbUrl: prop.airbnb_url || '',
        icalUrl: prop.ical_url || '',
        featured: prop.featured || false,
        active: prop.active !== false,
        amenities: prop.amenities || [],
        images: (prop.property_photos || [])
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((photo: any) => photo.url),
        photos: (prop.property_photos || [])
          .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
          .map((photo: any) => photo.url),
        featuredPhotoIndex: prop.featured_photo_index || 0,
        slug: prop.slug,
        createdAt: prop.created_at,
        updatedAt: prop.updated_at
      };
    });

    // Check if client wants array format instead of object format
    const format = searchParams.get('format');
    if (format === 'array') {
      const arrayResult = Object.values(result);
      return successResponse(
        arrayResult,
        `Retrieved ${arrayResult.length} properties`,
        {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      );
    }

    return successResponse(
      result,
      `Retrieved ${Object.keys(result).length} properties`,
      {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    );

  } catch (error) {
    console.error('Properties GET error:', error);
    return errorResponse(
      'Failed to retrieve properties',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// POST /api/properties - Create new property (admin only)
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
      const { id, ...propertyData } = body;

      if (!id) {
        return errorResponse('Property ID (slug) is required', 400);
      }

      // Use the existing RPC function for compatibility
      const { error } = await adminClient.rpc('upsert_property_with_string_id', {
        property_id: id,
        property_name: propertyData.name || propertyData.title,
        property_type: propertyData.type || 'apartment',
        bedrooms_count: propertyData.bedrooms || 2,
        bathrooms_count: propertyData.bathrooms || 1,
        max_guests_count: propertyData.maxGuests || 4,
        size_sqm_value: propertyData.size || propertyData.area?.toString() || '45',
        description_text: propertyData.description || '',
        location_text: propertyData.location || '',
        price_per_night_value: propertyData.pricePerNight || propertyData.price?.toString() || '2500',
        airbnb_url_value: propertyData.airbnbUrl || '',
        ical_url_value: propertyData.icalUrl || '',
        featured_flag: propertyData.featured || false,
        active_flag: propertyData.active !== false,
        amenities_array: propertyData.amenities || [],
        photos_array: propertyData.photos || propertyData.images || [],
        featured_photo_index_value: propertyData.featuredPhotoIndex || 0
      });

      if (error) {
        console.error('Error saving property:', error);
        return handleDatabaseError(error);
      }

      console.log(`Property upserted: ${propertyData.name || propertyData.title} (Slug: ${id})`);

      return successResponse(
        { id, success: true },
        'Property saved successfully',
        { timestamp: new Date().toISOString() }
      );
    });

  } catch (error) {
    console.error('Properties POST error:', error);
    return errorResponse(
      'Failed to save property',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// PUT /api/properties - Bulk update properties (admin only)
export async function PUT(request: NextRequest) {
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

      const body = await req.json();
      const { id, updates } = body;

      if (!id || !updates) {
        return errorResponse('Property ID and updates are required', 400);
      }

      // Convert camelCase to database format if needed
      const dbUpdates: any = {};
      Object.entries(updates).forEach(([key, value]) => {
        switch (key) {
          case 'pricePerNight':
            dbUpdates.price_per_night = value;
            break;
          case 'maxGuests':
            dbUpdates.max_guests = value;
            break;
          case 'airbnbUrl':
            dbUpdates.airbnb_url = value;
            break;
          case 'icalUrl':
            dbUpdates.ical_url = value;
            break;
          case 'featuredPhotoIndex':
            dbUpdates.featured_photo_index = value;
            break;
          case 'size':
            dbUpdates.size_sqm = value;
            break;
          case 'name':
          case 'title':
            dbUpdates.name = value;
            break;
          default:
            dbUpdates[key] = value;
        }
      });

      // Add updated timestamp
      dbUpdates.updated_at = new Date().toISOString();

      const { error } = await adminClient
        .from('properties')
        .update(dbUpdates)
        .eq('slug', id);

      if (error) {
        console.error('Error updating property:', error);
        return handleDatabaseError(error);
      }

      console.log(`Property updated: ${id}`);

      return successResponse(
        { id, success: true, updatedFields: Object.keys(updates) },
        'Property updated successfully',
        { timestamp: new Date().toISOString() }
      );
    });

  } catch (error) {
    console.error('Properties PUT error:', error);
    return errorResponse(
      'Failed to update property',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// DELETE /api/properties - Delete property (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Apply rate limiting for admin operations
    const rateLimitResult = rateLimit(request, 10, 15 * 60 * 1000); // 10 requests per 15 minutes
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

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return errorResponse('Property ID is required', 400);
      }

      // First check if property exists
      const { data: existing, error: fetchError } = await adminClient
        .from('properties')
        .select('name, slug')
        .eq('slug', id)
        .single();

      if (fetchError || !existing) {
        return errorResponse('Property not found', 404);
      }

      // Delete property (cascade will handle related records)
      const { error } = await adminClient
        .from('properties')
        .delete()
        .eq('slug', id);

      if (error) {
        console.error('Error deleting property:', error);
        return handleDatabaseError(error);
      }

      console.log(`Property deleted: ${existing.name} (${id})`);

      return successResponse(
        { id, name: existing.name },
        'Property deleted successfully',
        { timestamp: new Date().toISOString() }
      );
    });

  } catch (error) {
    console.error('Properties DELETE error:', error);
    return errorResponse(
      'Failed to delete property',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}