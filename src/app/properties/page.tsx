'use client';

import { useEffect, useMemo, useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import { normalizePropertyData } from '@/utils/slugify';

type SortKey = 'featured' | 'price' | 'newest';

export default function PropertiesPage() {
  const [all, setAll]   = useState<any[]>([]);
  const [sort, setSort] = useState<SortKey>('featured');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/properties?cover=1')
      .then((r) => r.json())
      .then((data) => {
        // API shape: { success, data: { [slug]: property }, meta }
        const payload = data?.data ?? data;
        const list = Array.isArray(payload) ? payload : Object.values(payload || {});
        setAll(list.map((p: any) => normalizePropertyData(p)).filter((p: any) => p.active !== false));
      })
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    const arr = [...all];
    if (sort === 'price') {
      arr.sort((a, b) => (Number(a.pricePerNight) || 0) - (Number(b.pricePerNight) || 0));
    } else if (sort === 'newest') {
      arr.sort((a, b) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime());
    } else {
      arr.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }
    return arr;
  }, [all, sort]);

  return (
    <main className="pt-24">
      {/* Header */}
      <section className="container-xl pb-10">
        <div className="label-tiny mb-4">— OUR COLLECTION</div>
        <h1 className="text-[40px] md:text-[48px] font-medium tracking-[-1.2px] leading-[1.05] mb-4">
          All properties
        </h1>
        <p className="max-w-xl text-[15px] leading-[1.7] text-stone-600">
          Every unit in Cozy Condo is personally selected and furnished by us. Browse below and message us on Facebook when you find one you like.
        </p>
      </section>

      {/* Toolbar */}
      <section className="container-xl border-t border-stone-200 pt-5 mb-8 flex items-center justify-between">
        <div className="text-[12px] text-stone-600">{sorted.length} properties</div>
        <div className="flex gap-5 text-[12px]">
          {(['featured', 'price', 'newest'] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              className={sort === k
                ? 'border-b border-stone-900 pb-0.5 text-stone-900'
                : 'text-stone-500 hover:text-stone-900'}
            >
              {k === 'featured' ? 'Featured' : k === 'price' ? 'Price ↓' : 'Newest'}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="container-xl pb-24">
        {loading && <p className="text-stone-500">Loading…</p>}
        {!loading && sorted.length === 0 && <p className="text-stone-500">No properties yet.</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {sorted.map((p) => <PropertyCard key={p.id || p.slug} property={p} />)}
        </div>
      </section>
    </main>
  );
}
