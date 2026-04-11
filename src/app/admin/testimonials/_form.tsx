'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Testimonial, TestimonialSource } from '@/lib/types';

export interface TestimonialFormProps {
  initial?: Partial<Testimonial>;
  testimonialId?: string; // present if editing
}

export default function TestimonialForm({ initial, testimonialId }: TestimonialFormProps) {
  const router = useRouter();
  const [guestName, setGuestName]       = useState(initial?.guestName || '');
  const [reviewText, setReviewText]     = useState(initial?.reviewText || '');
  const [rating, setRating]             = useState<number>(initial?.rating ?? 5);
  const [source, setSource]             = useState<TestimonialSource>(initial?.source || 'airbnb');
  const [stayMonth, setStayMonth]       = useState(initial?.stayMonth || '');
  const [propertyId, setPropertyId]     = useState<string>(initial?.propertyId || '');
  const [displayOrder, setDisplayOrder] = useState<number>(initial?.displayOrder ?? 0);
  const [published, setPublished]       = useState<boolean>(initial?.published ?? true);
  const [saving, setSaving]             = useState(false);
  const [properties, setProperties]     = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/properties?format=array')
      .then(r => r.json())
      .then(data => {
        const list = data?.data || data?.properties || (Array.isArray(data) ? data : []);
        setProperties(list);
      })
      .catch(() => setProperties([]));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
    const payload = {
      guestName,
      reviewText,
      rating,
      source,
      stayMonth,
      propertyId: propertyId || null,
      displayOrder,
      published,
    };
    const url    = testimonialId ? `/api/testimonials/${testimonialId}` : '/api/testimonials';
    const method = testimonialId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) router.push('/admin/testimonials');
    else alert('Save failed');
  }

  return (
    <form onSubmit={submit} className="p-8 max-w-3xl space-y-5">
      <h1 className="text-3xl font-semibold">
        {testimonialId ? 'Edit testimonial' : 'Add testimonial'}
      </h1>

      <label className="block">
        <span className="text-sm font-medium">Guest name</span>
        <input value={guestName} onChange={e => setGuestName(e.target.value)} required
          className="mt-1 block w-full border border-stone-300 rounded px-3 py-2" />
      </label>

      <label className="block">
        <span className="text-sm font-medium">Review text</span>
        <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} required rows={5}
          className="mt-1 block w-full border border-stone-300 rounded px-3 py-2" />
      </label>

      <div className="grid grid-cols-2 gap-5">
        <label className="block">
          <span className="text-sm font-medium">Rating (1–5)</span>
          <input type="number" min={1} max={5} value={rating}
            onChange={e => setRating(Number(e.target.value))}
            className="mt-1 block w-full border border-stone-300 rounded px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Source</span>
          <select value={source} onChange={e => setSource(e.target.value as TestimonialSource)}
            className="mt-1 block w-full border border-stone-300 rounded px-3 py-2">
            <option value="airbnb">Airbnb</option>
            <option value="facebook">Facebook</option>
            <option value="google">Google</option>
            <option value="direct">Direct</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">Stay month</span>
          <input value={stayMonth || ''} onChange={e => setStayMonth(e.target.value)}
            placeholder="e.g., January 2026"
            className="mt-1 block w-full border border-stone-300 rounded px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Display order</span>
          <input type="number" value={displayOrder}
            onChange={e => setDisplayOrder(Number(e.target.value))}
            className="mt-1 block w-full border border-stone-300 rounded px-3 py-2" />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium">Property (optional — blank = general)</span>
        <select value={propertyId} onChange={e => setPropertyId(e.target.value)}
          className="mt-1 block w-full border border-stone-300 rounded px-3 py-2">
          <option value="">— General (homepage) —</option>
          {properties.map((p: any) => (
            <option key={p.uuid || p.id} value={p.uuid || p.id}>
              {p.title || p.name || p.slug || p.id}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
        <span className="text-sm">Published</span>
      </label>

      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={saving}
          className="bg-stone-900 text-stone-50 px-5 py-2 rounded-full text-sm disabled:opacity-60">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={() => router.push('/admin/testimonials')}
          className="border border-stone-300 px-5 py-2 rounded-full text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
