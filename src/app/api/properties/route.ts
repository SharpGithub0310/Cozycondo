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

    // Build query with joins for photos, ensuring we get all necessary fields
    let query = adminClient
      .from('properties')
      .select(`
        id,
        name,
        slug,
        description,
        short_description,
        location,
        address,
        map_url,
        airbnb_url,
        ical_url,
        amenities,
        featured,
        active,
        display_order,
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
    if (active !== undefined) {
      query = query.eq('active', active);
    }

    if (featured !== undefined) {
      query = query.eq('featured', featured);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    // Apply sorting with null handling
    const validSortFields = ['created_at', 'updated_at', 'name', 'display_order'];
    const sortField = validSortFields.includes(sort) ? sort : 'display_order';
    query = query.order(sortField, { ascending: order === 'asc', nullsFirst: false });

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
      // Ensure slug exists, fallback to UUID if needed
      const slug = prop.slug || prop.id || prop.name?.toLowerCase().replace(/\s+/g, '-') || 'property-' + Date.now();

      // Sort photos properly
      const sortedPhotos = (prop.property_photos || [])
        .filter((photo: any) => photo.url) // Only include photos with URLs
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((photo: any) => photo.url);

      // Find featured photo index
      const featuredPhotoIndex = (prop.property_photos || [])
        .findIndex((photo: any) => photo.is_primary) || 0;

      result[slug] = {
        id: slug, // Use slug as ID for frontend compatibility
        uuid: prop.id, // Store actual UUID for database operations
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
        icalUrl: prop.ical_url || '', // Legacy compatibility
        mapUrl: prop.map_url || '',
        featured: prop.featured === true,
        active: prop.active === true,
        amenities: Array.isArray(prop.amenities) ? prop.amenities : [],
        images: sortedPhotos, // Legacy compatibility
        photos: sortedPhotos,
        featuredPhotoIndex: featuredPhotoIndex >= 0 ? featuredPhotoIndex : 0,
        slug: slug,
        displayOrder: prop.display_order || 0,
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

      // Direct table operations to avoid RPC function ambiguity issue

      // First, check if property exists
      const { data: existingProperty, error: fetchError } = await adminClient
        .from('properties')
        .select('id')
        .eq('slug', id)
        .single();

      let propertyId;

      if (existingProperty) {
        // Update existing property
        const { data: updateData, error: updateError } = await adminClient
          .from('properties')
          .update({
            name: propertyData.name || propertyData.title,
            type: propertyData.type || 'apartment',
            bedrooms: propertyData.bedrooms || 2,
            bathrooms: propertyData.bathrooms || 1,
            max_guests: propertyData.maxGuests || 4,
            size_sqm: propertyData.size || propertyData.area?.toString() || '45',
            description: propertyData.description || '',
            location: propertyData.location || '',
            price_per_night: propertyData.pricePerNight || propertyData.price?.toString() || '2500',
            airbnb_url: propertyData.airbnbUrl || '',
            ical_url: propertyData.icalUrl || '',
            featured: propertyData.featured || false,
            active: propertyData.active !== false,
            amenities: propertyData.amenities || [],
            featured_photo_index: propertyData.featuredPhotoIndex || 0,
            updated_at: new Date().toISOString()
          })
          .eq('slug', id)
          .select('id')
          .single();

        if (updateError) {
          console.error('Error updating property:', updateError);
          return handleDatabaseError(updateError);
        }

        propertyId = updateData.id;
      } else {
        // Insert new property
        const { data: insertData, error: insertError } = await adminClient
          .from('properties')
          .insert({
            name: propertyData.name || propertyData.title,
            slug: id,
            type: propertyData.type || 'apartment',
            bedrooms: propertyData.bedrooms || 2,
            bathrooms: propertyData.bathrooms || 1,
            max_guests: propertyData.maxGuests || 4,
            size_sqm: propertyData.size || propertyData.area?.toString() || '45',
            description: propertyData.description || '',
            location: propertyData.location || '',
            price_per_night: propertyData.pricePerNight || propertyData.price?.toString() || '2500',
            airbnb_url: propertyData.airbnbUrl || '',
            ical_url: propertyData.icalUrl || '',
            featured: propertyData.featured || false,
            active: propertyData.active !== false,
            amenities: propertyData.amenities || [],
            featured_photo_index: propertyData.featuredPhotoIndex || 0
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Error inserting property:', insertError);
          return handleDatabaseError(insertError);
        }

        propertyId = insertData.id;
      }

      // Handle photos separately
      const photos = propertyData.photos || propertyData.images || [];
      if (photos.length > 0) {
        // Delete existing photos
        const { error: deletePhotosError } = await adminClient
          .from('property_photos')
          .delete()
          .eq('property_id', propertyId);

        if (deletePhotosError) {
          console.error('Error deleting existing photos:', deletePhotosError);
          // Don't return error, continue with the operation
        }

        // Insert new photos
        const photoInserts = photos.map((photoUrl: string, index: number) => ({
          property_id: propertyId,
          url: photoUrl,
          is_primary: index === (propertyData.featuredPhotoIndex || 0),
          display_order: index
        }));

        if (photoInserts.length > 0) {
          const { error: insertPhotosError } = await adminClient
            .from('property_photos')
            .insert(photoInserts);

          if (insertPhotosError) {
            console.error('Error inserting photos:', insertPhotosError);
            // Don't return error, property was saved successfully
          }
        }
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