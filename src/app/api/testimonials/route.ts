import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireAuth, rateLimit } from '@/lib/api-auth';
import { mapTestimonialRow, TestimonialRow } from '@/lib/types';

// GET — public, lists published testimonials (optionally filtered by property_id)
export async function GET(request: NextRequest) {
  const rl = rateLimit(request, 120, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');
  const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

  let query = adminClient
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (!includeUnpublished) {
    query = query.eq('published', true);
  }

  if (propertyId === 'null') {
    query = query.is('property_id', null);
  } else if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Testimonials GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const testimonials = (data as TestimonialRow[]).map(mapTestimonialRow);
  return NextResponse.json({ testimonials });
}

// POST — admin-only, create a new testimonial
export async function POST(request: NextRequest) {
  return requireAuth(request, async (req) => {
    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await req.json();

    const insertRow = {
      guest_name: String(body.guestName || '').trim(),
      review_text: String(body.reviewText || '').trim(),
      rating: Number(body.rating ?? 5),
      source: body.source,
      stay_month: body.stayMonth ? String(body.stayMonth).trim() : null,
      property_id: body.propertyId || null,
      display_order: Number(body.displayOrder ?? 0),
      published: Boolean(body.published ?? true),
    };

    if (!insertRow.guest_name || !insertRow.review_text) {
      return NextResponse.json({ error: 'guestName and reviewText are required' }, { status: 400 });
    }
    if (!['airbnb', 'facebook', 'google', 'direct'].includes(insertRow.source)) {
      return NextResponse.json({ error: 'invalid source' }, { status: 400 });
    }
    if (insertRow.rating < 1 || insertRow.rating > 5) {
      return NextResponse.json({ error: 'rating must be 1-5' }, { status: 400 });
    }

    const { data, error } = await adminClient
      .from('testimonials')
      .insert([insertRow])
      .select()
      .single();

    if (error) {
      console.error('Testimonials POST error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ testimonial: mapTestimonialRow(data as TestimonialRow) });
  });
}
