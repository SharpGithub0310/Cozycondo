import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { icalUrl, propertyId } = await request.json();

    if (!icalUrl || !propertyId) {
      return NextResponse.json(
        { error: 'Missing icalUrl or propertyId' },
        { status: 400 }
      );
    }

    // Fetch the iCal feed from Airbnb
    const response = await fetch(icalUrl, {
      headers: {
        'User-Agent': 'Cozy Condo Calendar Sync/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch iCal feed' },
        { status: 400 }
      );
    }

    const icalData = await response.text();

    // Parse iCal data (simple parsing for demonstration)
    const events = parseICalEvents(icalData);

    // In production, you would save these events to Supabase
    // For now, just return the parsed events
    return NextResponse.json({
      success: true,
      message: `Synced ${events.length} events from Airbnb`,
      events,
    });
  } catch (error) {
    console.error('Error syncing iCal:', error);
    return NextResponse.json(
      { error: 'Failed to sync calendar' },
      { status: 500 }
    );
  }
}

// Simple iCal parser
function parseICalEvents(icalData: string): Array<{
  uid: string;
  summary: string;
  start: string;
  end: string;
}> {
  const events: Array<{
    uid: string;
    summary: string;
    start: string;
    end: string;
  }> = [];

  // Split by VEVENT
  const eventBlocks = icalData.split('BEGIN:VEVENT');

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i];
    const endIndex = block.indexOf('END:VEVENT');
    if (endIndex === -1) continue;

    const eventData = block.substring(0, endIndex);

    const uid = extractValue(eventData, 'UID');
    const summary = extractValue(eventData, 'SUMMARY') || 'Reserved';
    const dtstart = extractValue(eventData, 'DTSTART');
    const dtend = extractValue(eventData, 'DTEND');

    if (uid && dtstart && dtend) {
      events.push({
        uid,
        summary,
        start: parseICalDate(dtstart),
        end: parseICalDate(dtend),
      });
    }
  }

  return events;
}

function extractValue(data: string, key: string): string {
  // Handle both simple values and values with parameters (e.g., DTSTART;VALUE=DATE:20241220)
  const patterns = [
    new RegExp(`${key}[;:][^\\r\\n]*`, 'i'),
    new RegExp(`${key}:([^\\r\\n]*)`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = data.match(pattern);
    if (match) {
      // Extract the actual value after the last colon
      const fullMatch = match[0];
      const colonIndex = fullMatch.lastIndexOf(':');
      if (colonIndex !== -1) {
        return fullMatch.substring(colonIndex + 1).trim();
      }
    }
  }

  return '';
}

function parseICalDate(dateStr: string): string {
  // Handle format: 20241220 or 20241220T120000Z
  if (dateStr.length >= 8) {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}
