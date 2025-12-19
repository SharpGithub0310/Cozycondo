import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireAuth, rateLimit } from '@/lib/api-auth';
import {
  successResponse,
  errorResponse,
  handleDatabaseError
} from '@/lib/api-utils';

// PATCH /api/properties/[id]/status - Update property featured/active status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

      const { id } = await params;
      const body = await req.json();

      // Validate status update data
      const validFields = ['featured', 'active'];
      const updates: any = {};

      for (const [key, value] of Object.entries(body)) {
        if (validFields.includes(key)) {
          if (typeof value !== 'boolean') {
            return errorResponse(`Field ${key} must be a boolean`, 400);
          }
          updates[key] = value;
        }
      }

      if (Object.keys(updates).length === 0) {
        return errorResponse('No valid status fields provided. Use: featured, active', 400);
      }

      // Add updated timestamp
      updates.updated_at = new Date().toISOString();

      // First check if property exists
      const { data: existing, error: fetchError } = await adminClient
        .from('properties')
        .select('name, slug, featured, active')
        .eq('slug', id)
        .single();

      if (fetchError || !existing) {
        return errorResponse('Property not found', 404);
      }

      // Update property status
      const { error } = await adminClient
        .from('properties')
        .update(updates)
        .eq('slug', id);

      if (error) {
        console.error('Error updating property status:', error);
        return handleDatabaseError(error);
      }

      const statusChanges = Object.keys(updates).filter(key => key !== 'updated_at');
      console.log(`Property status updated: ${existing.name} (${id}) - ${statusChanges.join(', ')}`);

      return successResponse(
        {
          id,
          name: existing.name,
          previousStatus: {
            featured: existing.featured,
            active: existing.active
          },
          newStatus: updates,
          changedFields: statusChanges
        },
        'Property status updated successfully',
        { timestamp: new Date().toISOString() }
      );
    });

  } catch (error) {
    console.error('Property status update error:', error);
    return errorResponse(
      'Failed to update property status',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// GET /api/properties/[id]/status - Get property status (public)
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

    // Query property status
    const { data: property, error } = await adminClient
      .from('properties')
      .select('name, slug, featured, active, updated_at')
      .eq('slug', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Property not found', 404);
      }
      return handleDatabaseError(error);
    }

    return successResponse(
      {
        id: property.slug,
        name: property.name,
        featured: property.featured,
        active: property.active,
        updatedAt: property.updated_at
      },
      `Status for property ${id} retrieved successfully`,
      { timestamp: new Date().toISOString() }
    );

  } catch (error) {
    console.error('Property status GET error:', error);
    return errorResponse(
      'Failed to retrieve property status',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}