import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'iCal URL is required' },
        { status: 400 }
      );
    }

    // Validate that it's a reasonable iCal URL
    if (!url.includes('.ics') && !url.includes('ical')) {
      return NextResponse.json(
        { error: 'Invalid iCal URL format' },
        { status: 400 }
      );
    }

    // Fetch the iCal data from the external source
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CozyCondoCalendar/1.0 (https://cozycondo.net)',
        'Accept': 'text/calendar, text/plain, */*',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch iCal data: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const icalData = await response.text();

    // Basic validation that it's iCal data
    if (!icalData.includes('BEGIN:VCALENDAR')) {
      return NextResponse.json(
        { error: 'Response does not appear to be valid iCal data' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: icalData,
      size: icalData.length,
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching iCal data:', error);

    // Handle different types of errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Failed to connect to the iCal URL. Please check the URL is accessible.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch iCal data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}