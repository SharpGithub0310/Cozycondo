import { NextRequest, NextResponse } from 'next/server';
import { syncAllProperties } from '@/lib/calendar-sync';

/**
 * GET /api/cron/sync-calendars
 * Cron endpoint to automatically sync all property calendars
 * Called by Vercel Cron every hour
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    // Vercel automatically sends 'x-vercel-cron' header for cron invocations
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, verify the request is from Vercel Cron or has valid secret
    if (process.env.NODE_ENV === 'production') {
      const hasValidSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;

      if (!isVercelCron && !hasValidSecret) {
        console.log('Cron: Unauthorized request - not from Vercel Cron and no valid secret');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    console.log('Cron: Starting automatic calendar sync...');

    const results = await syncAllProperties();

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Cron: Synced ${successful} of ${results.length} properties (${failed} failed)`);

    // Log failures for debugging
    results.filter(r => !r.success).forEach(r => {
      console.log(`Cron: Failed to sync ${r.propertyId}: ${r.error}`);
    });

    return NextResponse.json({
      success: true,
      message: `Synced ${successful} of ${results.length} properties`,
      summary: {
        total: results.length,
        successful,
        failed,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
