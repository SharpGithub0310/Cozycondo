/**
 * iCal Parser Library
 *
 * Parses iCal feeds from Airbnb to extract blocked dates and bookings.
 * No external dependencies - uses simple string parsing.
 */

// TypeScript interfaces for calendar events
export interface CalendarEvent {
  uid: string;           // Unique ID from iCal
  start: Date;           // Start date
  end: Date;             // End date
  summary: string;       // Title (usually "Airbnb (Not available)" or guest name)
  isBlocked: boolean;    // true if it's a blocked date vs actual booking
}

export interface ICalParseResult {
  success: boolean;
  events: CalendarEvent[];
  error?: string;
}

/**
 * Fetches iCal data from a URL
 * @param url - The iCal feed URL
 * @returns Raw iCal string
 */
export async function fetchICalFeed(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'text/calendar',
        'User-Agent': 'CozyCondoCalendarSync/1.0',
      },
      // Set a reasonable timeout
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch iCal feed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();

    if (!text.includes('BEGIN:VCALENDAR')) {
      throw new Error('Invalid iCal format: missing VCALENDAR');
    }

    return text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch iCal feed: ${error.message}`);
    }
    throw new Error('Failed to fetch iCal feed: Unknown error');
  }
}

/**
 * Normalizes iCal date formats to JavaScript Date objects
 * Handles both DATE (YYYYMMDD) and DATE-TIME (YYYYMMDDTHHMMSSZ) formats
 * @param dateString - The iCal date string
 * @returns JavaScript Date object
 */
export function normalizeDate(dateString: string): Date {
  // Remove any VALUE=DATE: or VALUE=DATE-TIME: prefix
  const cleaned = dateString.replace(/^(VALUE=DATE(-TIME)?:?)/i, '').trim();

  // Handle YYYYMMDDTHHMMSSZ format (with time)
  if (cleaned.includes('T')) {
    // Format: YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS
    const match = cleaned.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      return new Date(Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1, // Month is 0-indexed
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10),
        parseInt(second, 10)
      ));
    }
  }

  // Handle YYYYMMDD format (date only)
  const dateMatch = cleaned.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    // For date-only formats, use midnight UTC
    return new Date(Date.UTC(
      parseInt(year, 10),
      parseInt(month, 10) - 1, // Month is 0-indexed
      parseInt(day, 10),
      0, 0, 0
    ));
  }

  // Fallback: try standard Date parsing
  const fallbackDate = new Date(cleaned);
  if (isNaN(fallbackDate.getTime())) {
    throw new Error(`Invalid date format: ${dateString}`);
  }
  return fallbackDate;
}

/**
 * Extracts a property value from an iCal event line
 * Handles property parameters like DTSTART;VALUE=DATE:20260115
 * @param line - The iCal line
 * @param property - The property name to extract
 * @returns The property value or null
 */
function extractPropertyValue(line: string, property: string): string | null {
  // Match property with optional parameters: PROPERTY;PARAM=VALUE:actualvalue
  const regex = new RegExp(`^${property}(;[^:]*)?:(.*)$`, 'i');
  const match = line.match(regex);
  return match ? match[2].trim() : null;
}

/**
 * Determines if an event represents a blocked date (vs an actual booking)
 * Airbnb uses specific summaries for blocked dates
 * @param summary - The event summary
 * @returns true if this is a blocked date
 */
function isBlockedDate(summary: string): boolean {
  const blockedPatterns = [
    'not available',
    'blocked',
    'unavailable',
    'owner block',
    'airbnb (not available)',
  ];

  const lowerSummary = summary.toLowerCase();
  return blockedPatterns.some(pattern => lowerSummary.includes(pattern));
}

/**
 * Parses a single VEVENT block into a CalendarEvent
 * @param eventBlock - The raw VEVENT text block
 * @returns CalendarEvent or null if parsing fails
 */
function parseEvent(eventBlock: string): CalendarEvent | null {
  const lines = eventBlock.split(/\r?\n/);

  let uid = '';
  let startStr = '';
  let endStr = '';
  let summary = '';

  // Handle line folding (lines starting with space/tab are continuations)
  const unfoldedLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      // Continuation of previous line
      if (unfoldedLines.length > 0) {
        unfoldedLines[unfoldedLines.length - 1] += line.substring(1);
      }
    } else {
      unfoldedLines.push(line);
    }
  }

  for (const line of unfoldedLines) {
    const uidValue = extractPropertyValue(line, 'UID');
    if (uidValue) {
      uid = uidValue;
      continue;
    }

    const dtstart = extractPropertyValue(line, 'DTSTART');
    if (dtstart) {
      startStr = dtstart;
      continue;
    }

    const dtend = extractPropertyValue(line, 'DTEND');
    if (dtend) {
      endStr = dtend;
      continue;
    }

    const summaryValue = extractPropertyValue(line, 'SUMMARY');
    if (summaryValue) {
      summary = summaryValue;
      continue;
    }
  }

  // Validate required fields
  if (!uid || !startStr) {
    return null;
  }

  try {
    const start = normalizeDate(startStr);
    // If no end date, assume it's the same as start (single day event)
    const end = endStr ? normalizeDate(endStr) : new Date(start);

    return {
      uid,
      start,
      end,
      summary: summary || 'Unknown',
      isBlocked: isBlockedDate(summary),
    };
  } catch {
    // Date parsing failed
    return null;
  }
}

/**
 * Parses an iCal string into an array of CalendarEvents
 * @param icalString - The raw iCal data
 * @returns Array of CalendarEvent objects
 */
export function parseICalFeed(icalString: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // Normalize line endings
  const normalized = icalString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Extract VEVENT blocks
  const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/gi;
  let match;

  while ((match = eventRegex.exec(normalized)) !== null) {
    const eventBlock = match[1];
    const event = parseEvent(eventBlock);

    if (event) {
      events.push(event);
    }
  }

  // Sort events by start date
  events.sort((a, b) => a.start.getTime() - b.start.getTime());

  return events;
}

/**
 * Main function to fetch and parse an iCal feed
 * @param url - The iCal feed URL
 * @returns ICalParseResult with success status and events
 */
export async function fetchAndParseICalFeed(url: string): Promise<ICalParseResult> {
  try {
    const icalString = await fetchICalFeed(url);
    const events = parseICalFeed(icalString);

    return {
      success: true,
      events,
    };
  } catch (error) {
    return {
      success: false,
      events: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Gets blocked date ranges from an iCal feed
 * Useful for quickly checking availability
 * @param events - Array of CalendarEvents
 * @returns Array of date ranges that are unavailable
 */
export function getBlockedDateRanges(events: CalendarEvent[]): Array<{ start: Date; end: Date; reason: string }> {
  return events.map(event => ({
    start: event.start,
    end: event.end,
    reason: event.isBlocked ? 'Blocked' : 'Booked',
  }));
}

/**
 * Checks if a specific date is available based on events
 * @param date - The date to check
 * @param events - Array of CalendarEvents
 * @returns true if the date is available
 */
export function isDateAvailable(date: Date, events: CalendarEvent[]): boolean {
  const checkTime = date.getTime();

  for (const event of events) {
    const startTime = event.start.getTime();
    const endTime = event.end.getTime();

    // Check if date falls within the event range
    // End date in iCal is exclusive (checkout day)
    if (checkTime >= startTime && checkTime < endTime) {
      return false;
    }
  }

  return true;
}

/**
 * Gets all unavailable dates within a date range
 * @param startDate - Range start
 * @param endDate - Range end
 * @param events - Array of CalendarEvents
 * @returns Array of unavailable dates
 */
export function getUnavailableDates(
  startDate: Date,
  endDate: Date,
  events: CalendarEvent[]
): Date[] {
  const unavailable: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    if (!isDateAvailable(current, events)) {
      unavailable.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return unavailable;
}
