'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TestimonialForm from '../_form';
import type { Testimonial } from '@/lib/types';

export default function EditTestimonialPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [data, setData] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/testimonials/${id}`)
      .then(r => r.json())
      .then(j => setData(j.testimonial))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (!data)   return <div className="p-8">Not found.</div>;

  return <TestimonialForm initial={data} testimonialId={id} />;
}
