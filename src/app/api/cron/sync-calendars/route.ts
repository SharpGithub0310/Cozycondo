import { NextRequest, NextResponse } from 'next/server';
import { syncAllProperties } from '@/lib/calendar-sync';

/**
 * GET /api/cron/sync-calendars
 * Cron endpoint to automatically sync all property calendars
 * Called by Vercel Cron every hour
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sets this automatically for cron jobs)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, verify the secret
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        console.log('Cron: Unauthorized request');
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
