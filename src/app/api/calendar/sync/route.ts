import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, rateLimit, createAdminClient } from '@/lib/api-auth';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { syncPropertyCalendar, syncAllProperties } from '@/lib/calendar-sync';

/**
 * POST /api/calendar/sync
 * Trigger calendar sync for one or all properties (admin only)
 */
export async function POST(request: NextRequest) {
  return await requireAuth(request, async () => {
    // Rate limit: 30 requests per 15 minutes (more generous for manual syncs)
    const rateLimitResult = rateLimit(request, 30, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return errorResponse('Rate limit exceeded', 429, {
        resetTime: rateLimitResult.resetTime,
        remaining: rateLimitResult.remaining,
      });
    }

    try {
      const body = await request.json().catch(() => ({}));
      const { propertyId } = body;

      if (propertyId) {
        // Sync single property
        const result = await syncPropertyCalendar(propertyId);

        if (!result.success) {
          return errorResponse(result.error || 'Sync failed', 400);
        }

        return successResponse(result, 'Calendar synced successfully');
      } else {
        // Sync all properties
        const results = await syncAllProperties();

        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        return successResponse({
          results,
          summary: {
            total: results.length,
            successful,
            failed,
          }
        }, `Synced ${successful} of ${results.length} properties`);
      }
    } catch (error) {
      console.error('Calendar sync error:', error);
      return errorResponse(
        error instanceof Error ? error.message : 'Failed to sync calendar',
        500
      );
    }
  });
}
