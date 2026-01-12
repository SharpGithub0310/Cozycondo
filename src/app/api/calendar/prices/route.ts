import { NextRequest } from 'next/server';
import { createAdminClient, requireAuth, rateLimit } from '@/lib/api-auth';
import {
  successResponse,
  errorResponse,
  handleDatabaseError,
} from '@/lib/api-utils';

// =============================================
// GET /api/calendar/prices
// Fetch price overrides for a property and date range
// =============================================
export async function GET(request: NextRequest) {
  try {
    const rateLimitResult = rateLimit(request, 100, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return errorResponse('Rate limit exceeded', 429);
    }

    const adminClient = createAdminClient();
    if (!adminClient) {
      return errorResponse('Database not configured', 503);
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!propertyId) {
      return errorResponse('Property ID is required', 400);
    }

    // Get property UUID from slug
    const { data: property, error: propertyError } = await adminClient
      .from('properties')
      .select('id, price_per_night')
      .eq('slug', propertyId)
      .single();

    if (propertyError) {
      // Try by UUID
      const { data: propertyById, error: idError } = await adminClient
        .from('properties')
        .select('id, price_per_night')
        .eq('id', propertyId)
        .single();

      if (idError) {
        return errorResponse('Property not found', 404);
      }

      return await fetchPriceOverrides(adminClient, propertyById.id, propertyById.price_per_night, startDate, endDate);
    }

    return await fetchPriceOverrides(adminClient, property.id, property.price_per_night, startDate, endDate);
  } catch (error) {
    console.error('Calendar prices GET error:', error);
    return errorResponse('Failed to fetch price overrides', 500);
  }
}

async function fetchPriceOverrides(
  client: ReturnType<typeof createAdminClient>,
  propertyId: string,
  basePrice: string,
  startDate: string | null,
  endDate: string | null
) {
  let query = client!
    .from('price_overrides')
    .select('date, price')
    .eq('property_id', propertyId)
    .order('date', { ascending: true });

  if (startDate) {
    query = query.gte('date', startDate);
  }

  if (endDate) {
    query = query.lte('date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    return handleDatabaseError(error);
  }

  // Convert to object format { "2026-01-15": 3000, ... }
  const priceMap: Record<string, number> = {};
  (data || []).forEach((row: { date: string; price: number }) => {
    priceMap[row.date] = parseFloat(String(row.price));
  });

  return successResponse(
    {
      overrides: priceMap,
      basePrice: parseFloat(basePrice || '0'),
    },
    `Retrieved ${Object.keys(priceMap).length} price overrides`
  );
}

// =============================================
// POST /api/calendar/prices
// Set price for specific date(s) - admin only
// =============================================
export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = rateLimit(request, 30, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return errorResponse('Rate limit exceeded', 429);
    }

    return await requireAuth(request, async (req) => {
      const adminClient = createAdminClient();
      if (!adminClient) {
        return errorResponse('Database not configured', 503);
      }

      const body = await req.json();
      const { propertyId, date, dates, price } = body;

      if (!propertyId) {
        return errorResponse('Property ID is required', 400);
      }

      if (!date && (!dates || !Array.isArray(dates) || dates.length === 0)) {
        return errorResponse('Date or dates array is required', 400);
      }

      if (price === undefined || price === null || isNaN(parseFloat(price))) {
        return errorResponse('Valid price is required', 400);
      }

      const priceValue = parseFloat(price);

      // Get property to validate price and get UUID
      const { data: property, error: propertyError } = await adminClient
        .from('properties')
        .select('id, price_per_night')
        .eq('slug', propertyId)
        .single();

      let dbPropertyId: string;
      let basePrice: number;

      if (propertyError) {
        // Try by UUID
        const { data: propertyById, error: idError } = await adminClient
          .from('properties')
          .select('id, price_per_night')
          .eq('id', propertyId)
          .single();

        if (idError) {
          return errorResponse('Property not found', 404);
        }

        dbPropertyId = propertyById.id;
        basePrice = parseFloat(propertyById.price_per_night || '0');
      } else {
        dbPropertyId = property.id;
        basePrice = parseFloat(property.price_per_night || '0');
      }

      // Validate price is not below base price
      if (priceValue < basePrice) {
        return errorResponse(
          `Price cannot be lower than base price (₱${basePrice.toLocaleString()})`,
          400,
          { basePrice, providedPrice: priceValue }
        );
      }

      // Prepare dates to upsert
      const datesToUpsert = date ? [date] : dates;

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      for (const d of datesToUpsert) {
        if (!dateRegex.test(d)) {
          return errorResponse(`Invalid date format: ${d}. Use YYYY-MM-DD`, 400);
        }
      }

      // Upsert price overrides
      const upsertData = datesToUpsert.map((d: string) => ({
        property_id: dbPropertyId,
        date: d,
        price: priceValue,
        updated_at: new Date().toISOString(),
      }));

      const { error: upsertError } = await adminClient
        .from('price_overrides')
        .upsert(upsertData, { onConflict: 'property_id,date' });

      if (upsertError) {
        return handleDatabaseError(upsertError);
      }

      return successResponse(
        {
          dates: datesToUpsert,
          price: priceValue,
          count: datesToUpsert.length,
        },
        `Price set for ${datesToUpsert.length} date(s)`
      );
    });
  } catch (error) {
    console.error('Calendar prices POST error:', error);
    return errorResponse('Failed to set price override', 500);
  }
}

// =============================================
// DELETE /api/calendar/prices
// Remove price override (revert to base price)
// =============================================
export async function DELETE(request: NextRequest) {
  try {
    const rateLimitResult = rateLimit(request, 30, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return errorResponse('Rate limit exceeded', 429);
    }

    return await requireAuth(request, async (req) => {
      const adminClient = createAdminClient();
      if (!adminClient) {
        return errorResponse('Database not configured', 503);
      }

      const { searchParams } = new URL(req.url);
      const propertyId = searchParams.get('propertyId');
      const date = searchParams.get('date');

      if (!propertyId) {
        return errorResponse('Property ID is required', 400);
      }

      if (!date) {
        return errorResponse('Date is required', 400);
      }

      // Get property UUID from slug
      const { data: property, error: propertyError } = await adminClient
        .from('properties')
        .select('id')
        .eq('slug', propertyId)
        .single();

      let dbPropertyId: string;

      if (propertyError) {
        // Try by UUID
        const { data: propertyById, error: idError } = await adminClient
          .from('properties')
          .select('id')
          .eq('id', propertyId)
          .single();

        if (idError) {
          return errorResponse('Property not found', 404);
        }

        dbPropertyId = propertyById.id;
      } else {
        dbPropertyId = property.id;
      }

      // Delete the price override
      const { error: deleteError } = await adminClient
        .from('price_overrides')
        .delete()
        .eq('property_id', dbPropertyId)
        .eq('date', date);

      if (deleteError) {
        return handleDatabaseError(deleteError);
      }

      return successResponse(
        { date, reverted: true },
        'Price override removed, reverted to base price'
      );
    });
  } catch (error) {
    console.error('Calendar prices DELETE error:', error);
    return errorResponse('Failed to delete price override', 500);
  }
}
