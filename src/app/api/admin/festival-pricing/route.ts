import { NextRequest } from 'next/server';
import { createAdminClient, requireAuth, rateLimit } from '@/lib/api-auth';
import {
  successResponse,
  errorResponse,
  handleDatabaseError,
} from '@/lib/api-utils';

/**
 * POST /api/admin/festival-pricing
 * Batch set festival pricing for all properties
 *
 * Body:
 * - startDate: YYYY-MM-DD
 * - endDate: YYYY-MM-DD
 * - multiplier: number (e.g., 2 for double price)
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = rateLimit(request, 10, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return errorResponse('Rate limit exceeded', 429);
    }

    return await requireAuth(request, async (req) => {
      const adminClient = createAdminClient();
      if (!adminClient) {
        return errorResponse('Database not configured', 503);
      }

      const body = await req.json();
      const { startDate, endDate, multiplier } = body;

      // Validate inputs
      if (!startDate || !endDate) {
        return errorResponse('Start date and end date are required', 400);
      }

      const mult = parseFloat(multiplier);
      if (!mult || mult <= 0) {
        return errorResponse('Valid multiplier is required (e.g., 2 for double)', 400);
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return errorResponse('Dates must be in YYYY-MM-DD format', 400);
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        return errorResponse('End date must be after start date', 400);
      }

      // Generate all dates in range
      const dates: string[] = [];
      const current = new Date(start);
      while (current <= end) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);
        current.setDate(current.getDate() + 1);
      }

      // Get all active properties
      const { data: properties, error: propError } = await adminClient
        .from('properties')
        .select('id, name, price_per_night, slug')
        .eq('active', true);

      if (propError) {
        return handleDatabaseError(propError);
      }

      if (!properties || properties.length === 0) {
        return errorResponse('No active properties found', 404);
      }

      // Prepare price overrides for all properties
      const upsertData: Array<{
        property_id: string;
        date: string;
        price: number;
        updated_at: string;
      }> = [];

      const results: Array<{
        propertyName: string;
        basePrice: number;
        festivalPrice: number;
        datesSet: number;
      }> = [];

      for (const property of properties) {
        const basePrice = parseFloat(property.price_per_night || '0');
        const festivalPrice = Math.round(basePrice * mult);

        for (const date of dates) {
          upsertData.push({
            property_id: property.id,
            date,
            price: festivalPrice,
            updated_at: new Date().toISOString(),
          });
        }

        results.push({
          propertyName: property.name,
          basePrice,
          festivalPrice,
          datesSet: dates.length,
        });
      }

      // Batch upsert all price overrides
      const { error: upsertError } = await adminClient
        .from('price_overrides')
        .upsert(upsertData, { onConflict: 'property_id,date' });

      if (upsertError) {
        return handleDatabaseError(upsertError);
      }

      return successResponse(
        {
          dateRange: { startDate, endDate },
          multiplier: mult,
          totalDates: dates.length,
          propertiesUpdated: properties.length,
          totalRecords: upsertData.length,
          details: results,
        },
        `Festival pricing set for ${properties.length} properties across ${dates.length} days`
      );
    });
  } catch (error) {
    console.error('Festival pricing error:', error);
    return errorResponse('Failed to set festival pricing', 500);
  }
}

/**
 * DELETE /api/admin/festival-pricing
 * Remove festival pricing for a date range (revert to base prices)
 *
 * Query params:
 * - startDate: YYYY-MM-DD
 * - endDate: YYYY-MM-DD
 */
export async function DELETE(request: NextRequest) {
  try {
    const rateLimitResult = rateLimit(request, 10, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return errorResponse('Rate limit exceeded', 429);
    }

    return await requireAuth(request, async (req) => {
      const adminClient = createAdminClient();
      if (!adminClient) {
        return errorResponse('Database not configured', 503);
      }

      const { searchParams } = new URL(req.url);
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      if (!startDate || !endDate) {
        return errorResponse('Start date and end date are required', 400);
      }

      // Delete all price overrides in the range for all properties
      const { error: deleteError, count } = await adminClient
        .from('price_overrides')
        .delete()
        .gte('date', startDate)
        .lte('date', endDate);

      if (deleteError) {
        return handleDatabaseError(deleteError);
      }

      return successResponse(
        {
          dateRange: { startDate, endDate },
          removedCount: count || 0,
        },
        `Removed festival pricing for dates ${startDate} to ${endDate}`
      );
    });
  } catch (error) {
    console.error('Festival pricing DELETE error:', error);
    return errorResponse('Failed to remove festival pricing', 500);
  }
}
