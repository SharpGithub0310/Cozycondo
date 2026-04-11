import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireAuth } from '@/lib/api-auth';
import { mapTestimonialRow, TestimonialRow } from '@/lib/types';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const adminClient = createAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { data, error } = await adminClient
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ testimonial: mapTestimonialRow(data as TestimonialRow) });
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  return requireAuth(request, async (req) => {
    const { id } = await params;
    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await req.json();

    const updateRow: Record<string, unknown> = {};
    if (body.guestName !== undefined)    updateRow.guest_name    = String(body.guestName).trim();
    if (body.reviewText !== undefined)   updateRow.review_text   = String(body.reviewText).trim();
    if (body.rating !== undefined)       updateRow.rating        = Number(body.rating);
    if (body.source !== undefined)       updateRow.source        = body.source;
    if (body.stayMonth !== undefined)    updateRow.stay_month    = body.stayMonth || null;
    if (body.propertyId !== undefined)   updateRow.property_id   = body.propertyId || null;
    if (body.displayOrder !== undefined) updateRow.display_order = Number(body.displayOrder);
    if (body.published !== undefined)    updateRow.published     = Boolean(body.published);

    if (updateRow.source && !['airbnb', 'facebook', 'google', 'direct'].includes(updateRow.source as string)) {
      return NextResponse.json({ error: 'invalid source' }, { status: 400 });
    }

    const { data, error } = await adminClient
      .from('testimonials')
      .update(updateRow)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ testimonial: mapTestimonialRow(data as TestimonialRow) });
  });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  return requireAuth(request, async () => {
    const { id } = await params;
    const adminClient = createAdminClient();
    if (!adminClient) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { error } = await adminClient.from('testimonials').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  });
}
