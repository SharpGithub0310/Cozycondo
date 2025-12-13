import { NextRequest, NextResponse } from 'next/server';
import ical, { ICalCalendarMethod } from 'ical-generator';
import { getDefaultPropertyData, getStoredCalendarBlocks } from '@/utils/propertyStorage';

// Get calendar blocks for a specific property
function getPropertyCalendarBlocks(propertyId: string) {
  try {
    const allBlocks = getStoredCalendarBlocks();
    return allBlocks
      .filter(block => block.propertyId === propertyId)
      .map(block => ({
        start: new Date(block.startDate),
        end: new Date(new Date(block.endDate).getTime() + 24 * 60 * 60 * 1000), // Add 1 day for end date
        title: block.reason,
        source: block.source
      }));
  } catch (error) {
    console.error('Error loading calendar blocks:', error);
    // Return sample data if storage fails
    return propertyId === '1' ? [
      { start: new Date('2024-12-20'), end: new Date('2024-12-25'), title: 'Maintenance', source: 'manual' }
    ] : [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Remove .ics extension if present (handle both /api/ical/1 and /api/ical/1.ics)
    const propertyId = id.replace(/\.ics$/, '');

    // Get property data
    const propertyData = getDefaultPropertyData(propertyId);

    // Create iCal calendar
    const calendar = ical({
      name: `${propertyData.name} - Cozy Condo`,
      prodId: { company: 'Cozy Condo', product: 'Calendar Export' },
      method: ICalCalendarMethod.PUBLISH,
      description: `Availability calendar for ${propertyData.name}`,
      timezone: 'Asia/Manila',
    });

    // Get blocked dates for this property from storage
    const dates = getPropertyCalendarBlocks(propertyId);

    // Add events for each blocked date range
    dates.forEach((dateRange, index) => {
      const event = calendar.createEvent({
        id: `${propertyId}-${index}-${Date.now()}`,
        start: dateRange.start,
        end: dateRange.end,
        summary: dateRange.title,
        description: `${propertyData.name} - ${dateRange.title} (Source: ${dateRange.source})`,
        allDay: true,
      });

      // Add custom properties using the event's x method
      try {
        event.x('X-COZY-SOURCE', dateRange.source);
        event.x('X-COZY-PROPERTY-ID', propertyId);
      } catch (error) {
        // Silently fail if x method is not available
        console.log('Custom properties not supported in this iCal version');
      }
    });

    // Return iCal file with proper headers
    return new NextResponse(calendar.toString(), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${propertyData.name.toLowerCase().replace(/\s+/g, '-')}.ics"`,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error generating iCal for property:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}