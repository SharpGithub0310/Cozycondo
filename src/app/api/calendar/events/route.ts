import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, createAdminClient, requireAuth } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-utils';

/**
 * GET /api/calendar/events
 * Get calendar events for a property
 */
export async function GET(request: NextRequest) {
  // Rate limit: 100 requests per 15 minutes
  const rateLimitResult = rateLimit(request, 100, 15 * 60 * 1000);
  if (!rateLimitResult.allowed) {
    return errorResponse('Rate limit exceeded', 429, {
      resetTime: rateLimitResult.resetTime,
      remaining: rateLimitResult.remaining,
    });
  }

  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!propertyId) {
    return errorResponse('propertyId is required', 400);
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return errorResponse('Database not configured', 503);
  }

  try {
    // First, get the property UUID from slug if needed
    let propertyUuid = propertyId;

    // Check if it's a slug (not a UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(propertyId)) {
      const { data: property, error: propError } = await adminClient
        .from('properties')
        .select('id')
        .eq('slug', propertyId)
        .single();

      if (propError || !property) {
        return errorResponse('Property not found', 404);
      }
      propertyUuid = property.id;
    }

    // Build query
    let query = adminClient
      .from('calendar_events')
      .select('*')
      .eq('property_id', propertyUuid)
      .order('start_date', { ascending: true });

    // Apply date filters
    if (startDate) {
      query = query.gte('start_date', startDate);
    }
    if (endDate) {
      query = query.lte('end_date', endDate);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching calendar events:', error);
      return errorResponse('Failed to fetch calendar events', 500);
    }

    return successResponse(events || [], 'Calendar events fetched successfully');
  } catch (error) {
    console.error('Calendar events error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to fetch calendar events',
      500
    );
  }
}

/**
 * POST /api/calendar/events
 * Create a manual calendar block (admin only)
 */
export async function POST(request: NextRequest) {
  return await requireAuth(request, async () => {
    const rateLimitResult = rateLimit(request, 30, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return errorResponse('Rate limit exceeded', 429);
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return errorResponse('Database not configured', 503);
    }

    try {
      const body = await request.json();
      const { propertyId, startDate, endDate, title } = body;

      if (!propertyId || !startDate || !endDate) {
        return errorResponse('propertyId, startDate, and endDate are required', 400);
      }

      // Get property UUID from slug if needed
      let propertyUuid = propertyId;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(propertyId)) {
        const { data: property } = await adminClient
          .from('properties')
          .select('id')
          .eq('slug', propertyId)
          .single();

        if (!property) {
          return errorResponse('Property not found', 404);
        }
        propertyUuid = property.id;
      }

      const { data: event, error } = await adminClient
        .from('calendar_events')
        .insert({
          property_id: propertyUuid,
          start_date: startDate,
          end_date: endDate,
          title: title || 'Blocked',
          source: 'manual',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating calendar event:', error);
        return errorResponse('Failed to create calendar event', 500);
      }

      return successResponse(event, 'Calendar event created successfully');
    } catch (error) {
      console.error('Create calendar event error:', error);
      return errorResponse(
        error instanceof Error ? error.message : 'Failed to create calendar event',
        500
      );
    }
  });
}

/**
 * DELETE /api/calendar/events
 * Delete a calendar event (admin only)
 */
export async function DELETE(request: NextRequest) {
  return await requireAuth(request, async () => {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return errorResponse('Event ID is required', 400);
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return errorResponse('Database not configured', 503);
    }

    try {
      const { error } = await adminClient
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('source', 'manual'); // Only allow deleting manual blocks

      if (error) {
        console.error('Error deleting calendar event:', error);
        return errorResponse('Failed to delete calendar event', 500);
      }

      return successResponse({ deleted: true }, 'Calendar event deleted successfully');
    } catch (error) {
      console.error('Delete calendar event error:', error);
      return errorResponse(
        error instanceof Error ? error.message : 'Failed to delete calendar event',
        500
      );
    }
  });
}
