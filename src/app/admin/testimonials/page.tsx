'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Pencil } from 'lucide-react';
import type { Testimonial } from '@/lib/types';

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/testimonials?includeUnpublished=true');
      const json = await res.json();
      setItems(json.testimonials || []);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
    const res = await fetch(`/api/testimonials/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${password}` },
    });
    if (res.ok) load();
    else alert('Delete failed');
  }

  async function togglePublished(t: Testimonial) {
    const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
    await fetch(`/api/testimonials/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
      body: JSON.stringify({ published: !t.published }),
    });
    load();
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Testimonials</h1>
        <Link
          href="/admin/testimonials/new"
          className="inline-flex items-center gap-2 bg-stone-900 text-stone-50 px-4 py-2 rounded-full text-sm"
        >
          <Plus className="w-4 h-4" /> Add testimonial
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && items.length === 0 && (
        <p className="text-stone-500">No testimonials yet. Add your first one.</p>
      )}

      <div className="space-y-3">
        {items.map((t) => (
          <div
            key={t.id}
            className="border border-stone-200 rounded-lg p-5 bg-white flex gap-4 items-start"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 text-xs uppercase tracking-wider text-stone-500 flex-wrap">
                <span className="font-semibold text-stone-900">{t.guestName}</span>
                <span>· {t.stayMonth || '—'}</span>
                <span>· via {t.source}</span>
                <span>· order {t.displayOrder}</span>
                {!t.published && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">HIDDEN</span>
                )}
              </div>
              <p className="text-sm text-stone-700 leading-relaxed">{t.reviewText}</p>
              <div className="text-xs text-amber-500 mt-1">{'★'.repeat(t.rating)}</div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => togglePublished(t)}
                className="text-xs border border-stone-300 px-3 py-1 rounded"
              >
                {t.published ? 'Hide' : 'Show'}
              </button>
              <Link
                href={`/admin/testimonials/${t.id}`}
                className="text-xs border border-stone-300 px-3 py-1 rounded flex items-center gap-1"
              >
                <Pencil className="w-3 h-3" /> Edit
              </Link>
              <button
                onClick={() => remove(t.id)}
                className="text-xs text-red-600 border border-red-200 px-3 py-1 rounded flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
