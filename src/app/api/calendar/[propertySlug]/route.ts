import { NextRequest, NextResponse } from 'next/server';
import ical, { ICalCalendarMethod } from 'ical-generator';

// Sample blocked dates for demo (will be replaced with Supabase data)
const blockedDates: Record<string, Array<{ start: Date; end: Date; title: string }>> = {
  'cityscape-studio': [
    { start: new Date('2024-12-20'), end: new Date('2024-12-25'), title: 'Blocked' },
    { start: new Date('2024-12-31'), end: new Date('2025-01-02'), title: 'Reserved' },
  ],
  'garden-view-suite': [
    { start: new Date('2024-12-24'), end: new Date('2024-12-28'), title: 'Blocked' },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertySlug: string }> }
) {
  try {
    const { propertySlug } = await params;

    // Create iCal calendar
    const calendar = ical({
      name: `Cozy Condo - ${propertySlug}`,
      prodId: { company: 'Cozy Condo', product: 'Calendar' },
      method: ICalCalendarMethod.PUBLISH,
    });

    // Get blocked dates for this property
    const dates = blockedDates[propertySlug] || [];

    // Add events for each blocked date range
    dates.forEach((dateRange, index) => {
      calendar.createEvent({
        id: `${propertySlug}-${index}`,
        start: dateRange.start,
        end: dateRange.end,
        summary: dateRange.title,
        description: 'Property not available',
        allDay: true,
      });
    });

    // Return iCal file
    return new NextResponse(calendar.toString(), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${propertySlug}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating iCal:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar' },
      { status: 500 }
    );
  }
}
