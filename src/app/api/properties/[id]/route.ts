import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireAuth, rateLimit } from '@/lib/api-auth';
import {
  successResponse,
  errorResponse,
  validateData,
  validateProperty,
  handleDatabaseError,
  type Property
} from '@/lib/api-utils';

// GET /api/properties/[id] - Get specific property
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // Query property with photos
    const { data: property, error } = await adminClient
      .from('properties')
      .select('*, property_photos(*)')
      .eq('slug', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Property not found', 404);
      }
      return handleDatabaseError(error);
    }

    // Convert to the format expected by the frontend (keeping backward compatibility)
    const result = {
      id: property.slug,
      title: property.name,
      name: property.name || '',
      description: property.description || '',
      type: property.type || 'apartment',
      bedrooms: property.bedrooms || 2,
      bathrooms: property.bathrooms || 1,
      maxGuests: property.max_guests || 4,
      size: property.size_sqm || '45',
      area: parseFloat(property.size_sqm || '45'),
      areaUnit: 'sqm',
      location: property.location || '',
      price: parseFloat(property.price_per_night || '2500'),
      priceUnit: 'PHP/night',
      pricePerNight: property.price_per_night || '2500',
      airbnbUrl: property.airbnb_url || '',
      icalUrl: property.ical_url || '',
      featured: property.featured || false,
      active: property.active !== false,
      amenities: property.amenities || [],
      images: (property.property_photos || [])
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((photo: any) => photo.url),
      photos: (property.property_photos || [])
        .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
        .map((photo: any) => photo.url),
      featuredPhotoIndex: property.featured_photo_index || 0,
      slug: property.slug,
      createdAt: property.created_at,
      updatedAt: property.updated_at
    };

    return successResponse(
      result,
      `Property ${id} retrieved successfully`,
      { timestamp: new Date().toISOString() }
    );

  } catch (error) {
    console.error('Property GET error:', error);
    return errorResponse(
      'Failed to retrieve property',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// PUT /api/properties/[id] - Update specific property (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

      const { id } = await params;
      const body = await req.json();

      // Validate property data for updates
      const validation = validateData<Partial<Property>>(
        (data) => validateProperty(data, true),
        body
      );

      if (!validation.success) {
        return errorResponse(validation.error, 400);
      }

      // Convert camelCase to database format if needed
      const dbUpdates: any = {};
      Object.entries(body).forEach(([key, value]) => {
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
          case 'images':
          case 'photos':
            // Handle photo updates separately
            break;
          default:
            dbUpdates[key] = value;
        }
      });

      // Add updated timestamp
      dbUpdates.updated_at = new Date().toISOString();

      // Update property
      const { error: updateError } = await adminClient
        .from('properties')
        .update(dbUpdates)
        .eq('slug', id);

      if (updateError) {
        console.error('Error updating property:', updateError);
        return handleDatabaseError(updateError);
      }

      // Handle photo updates if provided
      if (body.images || body.photos) {
        const photos = body.images || body.photos;

        // Get property UUID for photo updates
        const { data: propData, error: propError } = await adminClient
          .from('properties')
          .select('id')
          .eq('slug', id)
          .single();

        if (!propError && propData) {
          // Delete existing photos
          await adminClient
            .from('property_photos')
            .delete()
            .eq('property_id', propData.id);

          // Insert new photos
          if (photos && photos.length > 0) {
            const photoInserts = photos.map((url: string, index: number) => ({
              property_id: propData.id,
              url,
              display_order: index,
              is_primary: index === (body.featuredPhotoIndex || 0)
            }));

            await adminClient
              .from('property_photos')
              .insert(photoInserts);
          }
        }
      }

      console.log(`Property updated: ${id}`);

      return successResponse(
        { id, success: true, updatedFields: Object.keys(body) },
        'Property updated successfully',
        { timestamp: new Date().toISOString() }
      );
    });

  } catch (error) {
    console.error('Property PUT error:', error);
    return errorResponse(
      'Failed to update property',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// DELETE /api/properties/[id] - Delete specific property (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

      const { id } = await params;

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
    console.error('Property DELETE error:', error);
    return errorResponse(
      'Failed to delete property',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}