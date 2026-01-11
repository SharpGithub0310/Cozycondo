/**
 * Calendar Sync Service
 *
 * Syncs Airbnb calendars with the local database.
 * Uses the iCal parser to fetch and parse Airbnb calendar feeds.
 */

import { createAdminClient } from './supabase';
import { fetchAndParseICalFeed, CalendarEvent as ICalEvent } from './ical-parser';

// =============================================
// TYPES
// =============================================

export interface SyncResult {
  propertyId: string;
  propertyName: string;
  success: boolean;
  eventsImported: number;
  error?: string;
  syncedAt: Date;
}

export interface CalendarEvent {
  id: string;
  property_id: string;
  title: string;
  start_date: string;  // ISO date string (YYYY-MM-DD)
  end_date: string;    // ISO date string (YYYY-MM-DD)
  source: 'airbnb' | 'manual';
  external_id?: string;
  booking_id?: string;
  synced_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface PropertyWithIcal {
  id: string;
  name: string;
  slug: string;
  ical_url: string | null;
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Ensures we have an admin client (server-side only)
 */
function ensureAdminClient() {
  const adminClient = createAdminClient();
  if (!adminClient) {
    throw new Error('Calendar sync requires server-side execution with admin privileges.');
  }
  return adminClient;
}

/**
 * Formats a Date object to YYYY-MM-DD string for database storage
 */
function formatDateForDB(date: Date): string {
  return date.toISOString().split('T')[0];
}

// =============================================
// SYNC FUNCTIONS
// =============================================

/**
 * Syncs a single property's Airbnb calendar with the database
 *
 * @param propertyId - The property slug or ID to sync
 * @returns SyncResult with status and count of imported events
 */
export async function syncPropertyCalendar(propertyId: string): Promise<SyncResult> {
  const syncedAt = new Date();
  const client = ensureAdminClient();

  try {
    // Get property from database
    const { data: property, error: propertyError } = await client
      .from('properties')
      .select('id, name, slug, ical_url')
      .eq('slug', propertyId)
      .single();

    if (propertyError) {
      // Try by UUID if slug lookup fails
      const { data: propertyById, error: idError } = await client
        .from('properties')
        .select('id, name, slug, ical_url')
        .eq('id', propertyId)
        .single();

      if (idError) {
        return {
          propertyId,
          propertyName: 'Unknown',
          success: false,
          eventsImported: 0,
          error: `Property not found: ${propertyError.message}`,
          syncedAt,
        };
      }

      // Use the property found by ID
      return syncPropertyWithData(propertyById as PropertyWithIcal, syncedAt, client);
    }

    return syncPropertyWithData(property as PropertyWithIcal, syncedAt, client);
  } catch (error) {
    return {
      propertyId,
      propertyName: 'Unknown',
      success: false,
      eventsImported: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      syncedAt,
    };
  }
}

/**
 * Internal function to sync a property with its data already fetched
 */
async function syncPropertyWithData(
  property: PropertyWithIcal,
  syncedAt: Date,
  client: ReturnType<typeof createAdminClient>
): Promise<SyncResult> {
  const { id: dbId, name, slug, ical_url } = property;

  // If no iCal URL, return early
  if (!ical_url) {
    return {
      propertyId: slug || dbId,
      propertyName: name,
      success: true,
      eventsImported: 0,
      error: 'No Airbnb iCal URL configured',
      syncedAt,
    };
  }

  // Fetch and parse iCal feed
  const parseResult = await fetchAndParseICalFeed(ical_url);

  if (!parseResult.success) {
    return {
      propertyId: slug || dbId,
      propertyName: name,
      success: false,
      eventsImported: 0,
      error: parseResult.error || 'Failed to parse iCal feed',
      syncedAt,
    };
  }

  // Delete existing calendar_events with source='airbnb' for this property
  const { error: deleteError } = await client!
    .from('calendar_events')
    .delete()
    .eq('property_id', dbId)
    .eq('source', 'airbnb');

  if (deleteError) {
    return {
      propertyId: slug || dbId,
      propertyName: name,
      success: false,
      eventsImported: 0,
      error: `Failed to clear existing events: ${deleteError.message}`,
      syncedAt,
    };
  }

  // Prepare new events for insertion
  const newEvents = parseResult.events.map((event: ICalEvent) => ({
    property_id: dbId,
    title: event.summary || 'Blocked',
    start_date: formatDateForDB(event.start),
    end_date: formatDateForDB(event.end),
    source: 'airbnb',
    external_id: event.uid,
    synced_at: syncedAt.toISOString(),
  }));

  // Insert new events (if any)
  let eventsImported = 0;
  if (newEvents.length > 0) {
    const { error: insertError } = await client!
      .from('calendar_events')
      .insert(newEvents);

    if (insertError) {
      return {
        propertyId: slug || dbId,
        propertyName: name,
        success: false,
        eventsImported: 0,
        error: `Failed to insert events: ${insertError.message}`,
        syncedAt,
      };
    }

    eventsImported = newEvents.length;
  }

  // Update property.ical_last_sync timestamp
  const { error: updateError } = await client!
    .from('properties')
    .update({ ical_last_sync: syncedAt.toISOString() })
    .eq('id', dbId);

  if (updateError) {
    // Log but don't fail - events were imported successfully
    console.warn(`Failed to update ical_last_sync: ${updateError.message}`);
  }

  return {
    propertyId: slug || dbId,
    propertyName: name,
    success: true,
    eventsImported,
    syncedAt,
  };
}

/**
 * Syncs all properties that have an Airbnb iCal URL configured
 *
 * @returns Array of SyncResult for each property
 */
export async function syncAllProperties(): Promise<SyncResult[]> {
  const client = ensureAdminClient();
  const syncedAt = new Date();

  try {
    // Get all properties with ical_url set
    const { data: properties, error } = await client
      .from('properties')
      .select('id, name, slug, ical_url')
      .not('ical_url', 'is', null)
      .neq('ical_url', '');

    if (error) {
      return [{
        propertyId: 'all',
        propertyName: 'All Properties',
        success: false,
        eventsImported: 0,
        error: `Failed to fetch properties: ${error.message}`,
        syncedAt,
      }];
    }

    if (!properties || properties.length === 0) {
      return [{
        propertyId: 'all',
        propertyName: 'All Properties',
        success: true,
        eventsImported: 0,
        error: 'No properties with iCal URLs configured',
        syncedAt,
      }];
    }

    // Sync each property
    const results: SyncResult[] = [];
    for (const property of properties as PropertyWithIcal[]) {
      const result = await syncPropertyWithData(property, syncedAt, client);
      results.push(result);
    }

    return results;
  } catch (error) {
    return [{
      propertyId: 'all',
      propertyName: 'All Properties',
      success: false,
      eventsImported: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      syncedAt,
    }];
  }
}

/**
 * Gets all calendar events for a property, optionally filtered by date range
 *
 * @param propertyId - The property slug or UUID
 * @param startDate - Optional start date filter (inclusive)
 * @param endDate - Optional end date filter (inclusive)
 * @returns Array of CalendarEvent objects
 */
export async function getPropertyCalendarEvents(
  propertyId: string,
  startDate?: Date,
  endDate?: Date
): Promise<CalendarEvent[]> {
  const client = ensureAdminClient();

  try {
    // First try to get property by slug
    let dbId = propertyId;
    const { data: property } = await client
      .from('properties')
      .select('id')
      .eq('slug', propertyId)
      .single();

    if (property) {
      dbId = property.id;
    }

    // Build query
    let query = client
      .from('calendar_events')
      .select('*')
      .eq('property_id', dbId)
      .order('start_date', { ascending: true });

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('start_date', formatDateForDB(startDate));
    }

    if (endDate) {
      query = query.lte('end_date', formatDateForDB(endDate));
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Failed to fetch calendar events: ${error.message}`);
      return [];
    }

    return (data || []) as CalendarEvent[];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}

/**
 * Gets the last sync timestamp for a property
 *
 * @param propertyId - The property slug or UUID
 * @returns Date of last sync or null if never synced
 */
export async function getPropertyLastSync(propertyId: string): Promise<Date | null> {
  const client = ensureAdminClient();

  try {
    // Try by slug first
    let query = client
      .from('properties')
      .select('ical_last_sync')
      .eq('slug', propertyId)
      .single();

    const { data, error } = await query;

    if (error) {
      // Try by UUID
      const { data: dataById, error: errorById } = await client
        .from('properties')
        .select('ical_last_sync')
        .eq('id', propertyId)
        .single();

      if (errorById || !dataById?.ical_last_sync) {
        return null;
      }

      return new Date(dataById.ical_last_sync);
    }

    if (!data?.ical_last_sync) {
      return null;
    }

    return new Date(data.ical_last_sync);
  } catch {
    return null;
  }
}

/**
 * Checks if a date range is available for a property
 *
 * @param propertyId - The property slug or UUID
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date (exclusive, as in hotel industry)
 * @returns true if the date range is available
 */
export async function isDateRangeAvailable(
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> {
  const events = await getPropertyCalendarEvents(propertyId);

  const checkInTime = checkIn.getTime();
  const checkOutTime = checkOut.getTime();

  for (const event of events) {
    const eventStart = new Date(event.start_date).getTime();
    const eventEnd = new Date(event.end_date).getTime();

    // Check for overlap
    // Event overlaps if: eventStart < checkOut AND eventEnd > checkIn
    if (eventStart < checkOutTime && eventEnd > checkInTime) {
      return false;
    }
  }

  return true;
}
