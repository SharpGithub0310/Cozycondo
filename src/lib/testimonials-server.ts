import { createAdminClient } from '@/lib/api-auth';
import { mapTestimonialRow, TestimonialRow, Testimonial } from '@/lib/types';

interface Opts {
  propertyId?: string | null; // undefined = any, null = general only, string = specific property
  limit?: number;
  includeUnpublished?: boolean;
}

export async function getTestimonialsServer(opts: Opts = {}): Promise<Testimonial[]> {
  const adminClient = createAdminClient();
  if (!adminClient) return [];

  let query = adminClient
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (!opts.includeUnpublished) {
    query = query.eq('published', true);
  }

  if (opts.propertyId === null) {
    query = query.is('property_id', null);
  } else if (typeof opts.propertyId === 'string') {
    query = query.eq('property_id', opts.propertyId);
  }

  if (opts.limit) {
    query = query.limit(opts.limit);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error('getTestimonialsServer error:', error);
    return [];
  }

  return (data as TestimonialRow[]).map(mapTestimonialRow);
}
