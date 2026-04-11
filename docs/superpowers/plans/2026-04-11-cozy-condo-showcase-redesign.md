# Cozy Condo Showcase Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-04-11-cozy-condo-showcase-redesign-design.md`

**Goal:** Pivot the public site from a booking engine to a photo-forward showcase with Messenger + Facebook Page as the only contact channels.

**Architecture:** Two-track approach — (1) data foundation (new `testimonials` table, `properties.cover_photo_id` column, new `website_settings` keys, API routes, admin UI) then (2) visual rewrite of every public page in a new minimal monochrome theme. Existing booking/payment/calendar-sync code stays untouched — we only delink it from the public site.

**Tech Stack:** Next.js 16 App Router, React 18, TypeScript (strict), Tailwind CSS v4, Supabase, lucide-react icons. **No test framework exists in this repo** — verification uses `npm run type-check`, `npm run build`, `npm run lint`, and manual browser smoke tests. Do not introduce a test framework (violates the project's simplicity principle).

**Conventions:**
- DB columns: `snake_case` — TypeScript fields: `camelCase` — conversion happens in API/service layer
- Always use Philippine timezone (`Asia/Manila`) and local date formatting (`formatDateLocal()`), never `toISOString().split('T')[0]`
- Follow existing patterns in `src/lib/api-auth.ts` (`createAdminClient`, `requireAuth`, `rateLimit`) and `src/lib/database-service.ts`
- Prefer editing existing files over creating parallel new ones
- One commit per task (unless a task is purely structural/docs)

---

## Phase 1 — Foundation (data + admin backend)

This phase adds the data layer and admin UI for managing testimonials, hero photo, and card covers. Once Phase 1 is merged, the admin can start filling in testimonials and selecting photos while Phase 2 (visual rewrite) is built.

---

### Task 1: Add new environment variables

**Files:**
- Modify: `.env.example`
- Modify (locally only, do not commit): `.env.local`

- [ ] **Step 1: Add keys to `.env.example`**

Open `.env.example` and append the two new keys at the bottom:

```bash
# Facebook / Messenger contact links (public, used by site CTAs)
NEXT_PUBLIC_FACEBOOK_PAGE_URL=https://www.facebook.com/your-page
NEXT_PUBLIC_MESSENGER_URL=https://m.me/your-page-id
```

- [ ] **Step 2: Update `.env.local`**

Ask the user for their actual Facebook Page URL and Messenger deep link, then add both keys to `.env.local` with real values. Do not commit `.env.local`.

- [ ] **Step 3: Commit the example**

```bash
git add .env.example
git commit -m "chore: document Facebook + Messenger env vars"
```

---

### Task 2: Supabase migration — testimonials table, cover_photo_id, settings keys

**Files:**
- Create: `scripts/migrations/2026-04-11-testimonials-and-covers.sql`

- [ ] **Step 1: Write the migration SQL**

Create `scripts/migrations/2026-04-11-testimonials-and-covers.sql`:

```sql
-- Migration: 2026-04-11 — showcase redesign foundation
-- Adds testimonials table, properties.cover_photo_id, and new website_settings keys.

-- 1. testimonials table
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  review_text text not null,
  rating int not null default 5 check (rating between 1 and 5),
  source text not null check (source in ('airbnb','facebook','google','direct')),
  stay_month text,
  property_id uuid references properties(id) on delete set null,
  display_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists testimonials_published_order_idx
  on testimonials (published, display_order);

create index if not exists testimonials_property_id_idx
  on testimonials (property_id);

-- 2. properties.cover_photo_id column
alter table properties
  add column if not exists cover_photo_id uuid
  references property_photos(id) on delete set null;

-- 3. website_settings: insert placeholder rows for new keys (upsert pattern)
insert into website_settings (setting_key, setting_value)
values
  ('hero_photo_url', ''),
  ('intro_title',    'Cozy Condo is a small family-run collection of rentals across Iloilo City.'),
  ('intro_body',     'We handpick every unit, furnish it ourselves, and respond to every guest message personally — because hospitality, to us, means being reachable.')
on conflict (setting_key) do nothing;
```

- [ ] **Step 2: Run the migration against Supabase**

Ask the user to open their Supabase SQL editor, paste the migration contents, and run it. Verify by running this query in the same editor:

```sql
select
  (select count(*) from testimonials) as testimonials_rows,
  (select count(*) from information_schema.columns
     where table_name='properties' and column_name='cover_photo_id') as has_cover_col,
  (select count(*) from website_settings where setting_key in ('hero_photo_url','intro_title','intro_body')) as new_settings;
```

Expected: `testimonials_rows=0`, `has_cover_col=1`, `new_settings=3`.

- [ ] **Step 3: Commit the migration file**

```bash
git add scripts/migrations/2026-04-11-testimonials-and-covers.sql
git commit -m "feat(db): add testimonials, cover_photo_id, new settings keys"
```

---

### Task 3: Add Testimonial types to `src/lib/types.ts`

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Append the new interfaces**

Open `src/lib/types.ts` and add at the end of the file, before any trailing exports:

```typescript
// ===== Testimonials (Showcase Redesign 2026-04-11) =====

export type TestimonialSource = 'airbnb' | 'facebook' | 'google' | 'direct';

export interface Testimonial {
  id: string;
  guestName: string;
  reviewText: string;
  rating: number; // 1-5
  source: TestimonialSource;
  stayMonth: string | null;
  propertyId: string | null;
  displayOrder: number;
  published: boolean;
  createdAt: string;
}

// Shape returned directly from Supabase (snake_case)
export interface TestimonialRow {
  id: string;
  guest_name: string;
  review_text: string;
  rating: number;
  source: TestimonialSource;
  stay_month: string | null;
  property_id: string | null;
  display_order: number;
  published: boolean;
  created_at: string;
}

export function mapTestimonialRow(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    guestName: row.guest_name,
    reviewText: row.review_text,
    rating: row.rating,
    source: row.source,
    stayMonth: row.stay_month,
    propertyId: row.property_id,
    displayOrder: row.display_order,
    published: row.published,
    createdAt: row.created_at,
  };
}
```

- [ ] **Step 2: Type-check**

```bash
cd /mnt/m/ai/cozy-condo && npm run type-check
```

Expected: clean pass (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat(types): add Testimonial interface and row mapper"
```

---

### Task 4: Create `/api/testimonials/route.ts` (GET list + POST create)

**Files:**
- Create: `src/app/api/testimonials/route.ts`

- [ ] **Step 1: Create the route file**

```typescript
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
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: clean pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/testimonials/route.ts
git commit -m "feat(api): add testimonials list + create endpoints"
```

---

### Task 5: Create `/api/testimonials/[id]/route.ts` (GET / PUT / DELETE)

**Files:**
- Create: `src/app/api/testimonials/[id]/route.ts`

- [ ] **Step 1: Create the route**

```typescript
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
    if (body.guestName !== undefined)   updateRow.guest_name    = String(body.guestName).trim();
    if (body.reviewText !== undefined)  updateRow.review_text   = String(body.reviewText).trim();
    if (body.rating !== undefined)      updateRow.rating        = Number(body.rating);
    if (body.source !== undefined)      updateRow.source        = body.source;
    if (body.stayMonth !== undefined)   updateRow.stay_month    = body.stayMonth || null;
    if (body.propertyId !== undefined)  updateRow.property_id   = body.propertyId || null;
    if (body.displayOrder !== undefined)updateRow.display_order = Number(body.displayOrder);
    if (body.published !== undefined)   updateRow.published     = Boolean(body.published);

    if (updateRow.source && !['airbnb','facebook','google','direct'].includes(updateRow.source as string)) {
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
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: clean pass.

- [ ] **Step 3: Manual smoke-test the endpoints**

Start the dev server (`npm run dev`), then in a second terminal:

```bash
# Create (needs admin bearer token = NEXT_PUBLIC_ADMIN_PASSWORD from .env.local)
curl -X POST http://localhost:3000/api/testimonials \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ADMIN_PASSWORD>' \
  -d '{"guestName":"Maria L.","reviewText":"Lovely stay","rating":5,"source":"airbnb","stayMonth":"January 2026","published":true}'

# Read back
curl http://localhost:3000/api/testimonials
```

Expected: first returns `{"testimonial":{...}}`, second returns `{"testimonials":[{...}]}`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/testimonials/[id]/route.ts
git commit -m "feat(api): add testimonial detail / update / delete endpoints"
```

---

### Task 6: Add `cover_photo_id` support to the property update flow

**Files:**
- Modify: `src/app/api/properties/[id]/route.ts`
- Modify: `src/lib/types.ts`
- Modify: `src/utils/slugify.ts`

- [ ] **Step 1: Locate the property update logic**

Open `src/app/api/properties/[id]/route.ts` and find the `PUT` handler. In the update payload construction, add `cover_photo_id` to the list of fields forwarded from the request body to the Supabase update:

```typescript
// Inside the PUT handler where updateData is built for Supabase, add:
if (body.coverPhotoId !== undefined) {
  updateData.cover_photo_id = body.coverPhotoId || null;
}
```

(Locate the existing `updateData` block — follow the same pattern as the other fields, e.g. `price_per_night`, `active`. If `updateData` doesn't exist, the route may use a different name — find the object passed to `.update()` on the `properties` table.)

- [ ] **Step 2: Update `Property` / `PropertyData` types in `src/lib/types.ts`**

Find the existing `Property` interface and add the field:

```typescript
// Inside Property interface (DB-shape, snake_case)
cover_photo_id?: string | null;

// Inside PropertyData interface (code-shape, camelCase)
coverPhotoId?: string | null;
```

Also update the `normalizePropertyData` function (found in `src/utils/slugify.ts` based on the homepage import) to pass through `coverPhotoId` — open that file and add the field in the returned object:

```typescript
coverPhotoId: raw.cover_photo_id ?? raw.coverPhotoId ?? null,
```

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

Expected: clean pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/properties/[id]/route.ts src/lib/types.ts src/utils/slugify.ts
git commit -m "feat(properties): add cover_photo_id field plumbing"
```

---

### Task 6b: Create server-side testimonials helper

**Files:**
- Create: `src/lib/testimonials-server.ts`

Server components should query Supabase directly via `createAdminClient()` instead of HTTP-fetching their own API routes. This helper keeps that concern tidy.

- [ ] **Step 1: Create the helper**

```typescript
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
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/testimonials-server.ts
git commit -m "feat(lib): server-side testimonials helper"
```

---

### Task 7: Create admin testimonials list page

**Files:**
- Create: `src/app/admin/testimonials/page.tsx`

- [ ] **Step 1: Create the list page**

```tsx
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
              <div className="flex items-center gap-3 mb-2 text-xs uppercase tracking-wider text-stone-500">
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
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

Expected: clean pass.

- [ ] **Step 3: Smoke-test in the browser**

Run `npm run dev`, log into `/admin`, visit `/admin/testimonials`. Expected: empty list with "Add testimonial" button. Confirm no console errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/testimonials/page.tsx
git commit -m "feat(admin): add testimonials list page"
```

---

### Task 8: Create admin testimonials create/edit form (shared component)

**Files:**
- Create: `src/app/admin/testimonials/_form.tsx` (shared client form)
- Create: `src/app/admin/testimonials/new/page.tsx`
- Create: `src/app/admin/testimonials/[id]/page.tsx`

- [ ] **Step 1: Create the shared form component**

Create `src/app/admin/testimonials/_form.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Testimonial, TestimonialSource, PropertyData } from '@/lib/types';

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
  const [properties, setProperties]     = useState<PropertyData[]>([]);

  useEffect(() => {
    fetch('/api/properties')
      .then(r => r.json())
      .then(data => setProperties(Array.isArray(data) ? data : data.properties || []))
      .catch(() => setProperties([]));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';
    const payload = { guestName, reviewText, rating, source, stayMonth, propertyId: propertyId || null, displayOrder, published };
    const url  = testimonialId ? `/api/testimonials/${testimonialId}` : '/api/testimonials';
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
          <input value={stayMonth} onChange={e => setStayMonth(e.target.value)}
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
            <option key={p.id} value={p.id}>{p.title || p.name || p.id}</option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
        <span className="text-sm">Published</span>
      </label>

      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={saving}
          className="bg-stone-900 text-stone-50 px-5 py-2 rounded-full text-sm">
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
```

- [ ] **Step 2: Create the `/new` page**

`src/app/admin/testimonials/new/page.tsx`:

```tsx
import TestimonialForm from '../_form';

export default function NewTestimonialPage() {
  return <TestimonialForm />;
}
```

- [ ] **Step 3: Create the edit page (loads existing)**

`src/app/admin/testimonials/[id]/page.tsx`:

```tsx
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
```

- [ ] **Step 4: Type-check**

```bash
npm run type-check
```

Expected: clean pass.

- [ ] **Step 5: Smoke-test**

Run dev, go to `/admin/testimonials/new`, fill the form, save. Confirm the testimonial appears on the list page. Click edit, change a field, save. Confirm update.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/testimonials
git commit -m "feat(admin): testimonials create + edit form"
```

---

### Task 9: Add hero photo + intro fields to admin settings page

**Files:**
- Modify: `src/app/admin/settings/page.tsx`
- Modify: `src/lib/types.ts` (extend `WebsiteSettings` shape)
- Modify: settings API (if needed) — inspect `src/app/api/settings/route.ts` first

- [ ] **Step 1: Extend the `WebsiteSettings` type**

Open `src/lib/types.ts`, locate the `WebsiteSettings` interface, and add:

```typescript
// Inside WebsiteSettings interface
heroPhotoUrl?: string;
introTitle?: string;
introBody?: string;
```

- [ ] **Step 2: Inspect the existing settings page and API**

Read `src/app/admin/settings/page.tsx` to understand how it currently renders + saves fields. Read `src/app/api/settings/route.ts` to understand the row-based `setting_key` / `setting_value` schema.

The existing page almost certainly reads/writes keys as individual rows. Follow the same pattern to add three more inputs.

- [ ] **Step 3: Add the new fields to the settings page**

In `src/app/admin/settings/page.tsx`, find the state hooks for existing settings (e.g., `const [heroTitle, setHeroTitle] = useState(...)`). Add parallel hooks:

```typescript
const [heroPhotoUrl, setHeroPhotoUrl] = useState(settings?.heroPhotoUrl || '');
const [introTitle,   setIntroTitle]   = useState(settings?.introTitle   || '');
const [introBody,    setIntroBody]    = useState(settings?.introBody    || '');
```

Then add matching inputs inside the form JSX. Find an existing section that renders similar text inputs and follow the same pattern. A minimal section to add:

```tsx
<section className="space-y-4 py-6 border-t border-stone-200">
  <h2 className="text-lg font-semibold">Homepage hero &amp; intro</h2>

  <label className="block">
    <span className="text-sm font-medium">Hero photo URL</span>
    <input value={heroPhotoUrl} onChange={e => setHeroPhotoUrl(e.target.value)}
      placeholder="https://… (can be a URL from any property photo)"
      className="mt-1 block w-full border border-stone-300 rounded px-3 py-2" />
    {heroPhotoUrl && (
      <img src={heroPhotoUrl} alt="Hero preview"
        className="mt-2 h-32 w-full object-cover rounded border border-stone-200" />
    )}
  </label>

  <label className="block">
    <span className="text-sm font-medium">Intro title</span>
    <input value={introTitle} onChange={e => setIntroTitle(e.target.value)}
      className="mt-1 block w-full border border-stone-300 rounded px-3 py-2" />
  </label>

  <label className="block">
    <span className="text-sm font-medium">Intro body</span>
    <textarea value={introBody} onChange={e => setIntroBody(e.target.value)} rows={4}
      className="mt-1 block w-full border border-stone-300 rounded px-3 py-2" />
  </label>
</section>
```

In the existing save handler, include the new fields in the payload sent to `/api/settings` — follow whatever shape the existing handler uses (probably an object keyed by setting name, sent as POST).

- [ ] **Step 4: Ensure the settings API handles the new keys**

Open `src/app/api/settings/route.ts`. The existing handler should already accept arbitrary `setting_key` / `setting_value` pairs since other settings work. Verify it doesn't filter keys to a hardcoded whitelist. If it does, add `hero_photo_url`, `intro_title`, `intro_body` to the whitelist.

- [ ] **Step 5: Type-check + smoke-test**

```bash
npm run type-check
```

Run dev, log in, go to `/admin/settings`. Fill the hero photo URL with an existing property photo URL (use browser dev tools to copy one from a property card image). Save. Refresh — values should persist.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/settings/page.tsx src/lib/types.ts src/app/api/settings/route.ts
git commit -m "feat(admin): hero photo + intro text settings"
```

---

### Task 10: Add card cover photo selector to admin property edit page

**Files:**
- Modify: `src/app/admin/properties/[id]/edit/page.tsx`

- [ ] **Step 1: Locate the photo-related state in the edit page**

Open `src/app/admin/properties/[id]/edit/page.tsx`. Find where property photos are loaded into state (likely `photos` or `propertyPhotos`). Find where `cover_photo_id` would be set — add new state:

```typescript
const [coverPhotoId, setCoverPhotoId] = useState<string | null>(
  property?.coverPhotoId || property?.cover_photo_id || null
);
```

- [ ] **Step 2: Add the cover photo selector UI**

Find where the photos are rendered in the form (there's probably a photo gallery/list). Below or inside that section, add a cover selector:

```tsx
<section className="py-6 border-t border-stone-200">
  <h3 className="text-lg font-semibold mb-2">Card cover photo</h3>
  <p className="text-sm text-stone-500 mb-4">
    Pick which photo appears on the homepage grid and the properties listing. Falls back to the first photo if unset.
  </p>

  <div className="grid grid-cols-4 gap-3">
    {photos.map((p: any) => {
      const selected = coverPhotoId === p.id;
      return (
        <button
          type="button"
          key={p.id}
          onClick={() => setCoverPhotoId(p.id)}
          className={`aspect-[4/3] rounded overflow-hidden border-2 ${
            selected ? 'border-stone-900' : 'border-transparent'
          }`}
        >
          <img src={p.url} alt={p.alt_text || ''} className="w-full h-full object-cover" />
        </button>
      );
    })}
  </div>

  {coverPhotoId && (
    <button
      type="button"
      onClick={() => setCoverPhotoId(null)}
      className="mt-3 text-xs underline text-stone-500"
    >
      Clear selection (use first photo)
    </button>
  )}
</section>
```

Adapt `photos` to match whatever the existing state variable is.

- [ ] **Step 3: Include `coverPhotoId` in the save payload**

Find the save / submit handler that PUTs to `/api/properties/[id]`. Add `coverPhotoId` to the body object:

```typescript
const body = {
  // ... existing fields
  coverPhotoId,
};
```

- [ ] **Step 4: Type-check + smoke-test**

```bash
npm run type-check
```

Run dev, edit an existing property, click one of the photos to select it as the cover, save. Reload the edit page — the selection should persist.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/properties/[id]/edit/page.tsx
git commit -m "feat(admin): card cover photo selector on property edit"
```

---

## Phase 2 — Theme + shared primitives

Once Phase 1 is deployed, the admin can start adding testimonials and choosing photos. This phase replaces the global theme and builds the reusable components the public pages will consume.

---

### Task 11: Rewrite `globals.css` with minimal monochrome theme

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Back up the existing file mentally**

Read the current `src/app/globals.css` fully. Note any selectors that are used broadly (`.section`, `.container-xl`, `.btn`, `.hero-badge`, `.section-title`, `.section-subtitle`, `hero-badge-dot`, `animate-float`, etc.). These class names are referenced in existing components — we must preserve class names that we want to keep, and we'll remove the ones that belong to the old aesthetic (teal gradients, floating decorations, hero badges).

- [ ] **Step 2: Replace the palette + base styles**

Overwrite `src/app/globals.css` with the following (keeping the `@import "tailwindcss"` at the top):

```css
@import "tailwindcss";

:root {
  /* ===== Minimal monochrome theme (2026-04-11 redesign) ===== */
  --color-base: #fafaf8;      /* off-white background */
  --color-ink:  #1c1917;      /* near-black text */
  --color-muted:#57534e;      /* body text muted */
  --color-stone:#8a7a5c;      /* warm stone for labels */
  --color-line: rgba(0,0,0,0.08);

  /* Spacing & type scale (kept minimal — Tailwind handles most) */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-pill: 9999px;

  --shadow-card: 0 20px 40px -15px rgba(0,0,0,0.12);
  --transition-base: 200ms ease;

  /* Legacy variables — kept so existing pages don't explode mid-migration.
     Safe to delete after all components are migrated. */
  --color-primary-500: #1c1917;
  --color-primary-600: #1c1917;
  --color-warm-50: #fafaf8;
  --color-warm-100: #f4f1ea;
  --color-warm-700: #57534e;
  --color-warm-900: #1c1917;
  --color-accent-orange: #1c1917;
  --color-accent-orange-light: #f4f1ea;
}

html, body {
  background: var(--color-base);
  color: var(--color-ink);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ===== Base utility classes (used by rewritten components) ===== */

.container-xl {
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 24px;
  padding-right: 24px;
}

.section {
  padding-top: clamp(60px, 8vw, 110px);
  padding-bottom: clamp(60px, 8vw, 110px);
}

.section-title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 500;
  letter-spacing: -0.8px;
  line-height: 1.1;
  color: var(--color-ink);
}

.section-subtitle {
  font-size: 15px;
  color: var(--color-muted);
  line-height: 1.7;
}

.label-tiny {
  font-size: 10px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--color-stone);
  font-weight: 500;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 24px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 500;
  transition: all var(--transition-base);
  cursor: pointer;
  text-decoration: none;
  border: none;
}
.btn-primary {
  background: var(--color-ink);
  color: var(--color-base);
}
.btn-primary:hover { opacity: 0.88; }
.btn-ghost {
  background: transparent;
  color: var(--color-ink);
  border: 1px solid rgba(0,0,0,0.2);
}
.btn-ghost:hover { background: rgba(0,0,0,0.04); }
.btn-on-dark {
  background: var(--color-base);
  color: var(--color-ink);
}
.btn-ghost-on-dark {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.5);
}

/* Dark section (used by testimonials, CTA, footer) */
.section-dark {
  background: var(--color-ink);
  color: var(--color-base);
}
.section-dark .section-subtitle { color: rgba(255,255,255,0.7); }

/* Legacy stubs — do NOT use in new components. Kept only so legacy files
   that still render don't throw missing-class errors during migration. */
.hero-badge, .hero-badge-dot { display: none; }
.animate-float { animation: none; }
```

- [ ] **Step 3: Build + type-check**

```bash
npm run type-check && npm run build
```

Expected: build passes. Existing pages may look broken (that's fine — they will be rewritten in later tasks). We just need the build to succeed so CI/deploy isn't blocked.

- [ ] **Step 4: Visual smoke test**

Run `npm run dev`, open `/`. The page will look bad (classes are gone) but it should not error. Mid-migration state is expected.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(theme): replace teal/orange theme with minimal monochrome"
```

---

### Task 12: Create `Testimonials` component

**Files:**
- Create: `src/components/Testimonials.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { Testimonial } from '@/lib/types';

interface Props {
  testimonials: Testimonial[];
  title?: string;
  label?: string;
  variant?: 'dark' | 'light';
}

export default function Testimonials({ testimonials, title, label, variant = 'dark' }: Props) {
  if (!testimonials.length) return null;

  const dark = variant === 'dark';
  return (
    <section className={`section ${dark ? 'section-dark' : ''}`}>
      <div className="container-xl text-center">
        {label && <div className="label-tiny mb-4">— {label}</div>}
        {title && (
          <h2 className={`section-title mb-12 ${dark ? 'text-stone-50' : ''}`}>{title}</h2>
        )}
        <div className="grid md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <article key={t.id} className={dark ? 'px-2' : ''}>
              <div className="text-amber-400 mb-3 text-sm tracking-widest">
                {'★'.repeat(t.rating)}
              </div>
              <p className={`text-[14px] leading-relaxed mb-4 ${dark ? 'text-stone-200' : 'text-stone-700'}`}>
                &ldquo;{t.reviewText}&rdquo;
              </p>
              <div className="text-[11px] tracking-wide">
                <span className={`font-medium ${dark ? 'text-stone-50' : 'text-stone-900'}`}>
                  {t.guestName}
                </span>
                <span className={dark ? 'text-stone-400' : 'text-stone-500'}>
                  {t.stayMonth ? ` · ${t.stayMonth}` : ''} · via {t.source}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Testimonials.tsx
git commit -m "feat(components): Testimonials display component"
```

---

### Task 13: Create `PhotoLightbox` component

**Files:**
- Create: `src/components/PhotoLightbox.tsx`

- [ ] **Step 1: Create the component**

Scrollable grid lightbox per spec (not a carousel).

```tsx
'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  alt_text?: string | null;
}

interface Props {
  photos: Photo[];
  open: boolean;
  onClose: () => void;
}

export default function PhotoLightbox({ photos, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-stone-950/95 overflow-y-auto">
      <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-stone-950/80 backdrop-blur z-10 border-b border-stone-800">
        <span className="text-stone-50 text-sm font-medium">{photos.length} photos</span>
        <button
          onClick={onClose}
          className="text-stone-50 flex items-center gap-2 text-sm hover:opacity-80"
        >
          <X className="w-5 h-5" /> Close
        </button>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {photos.map((p) => (
          <img
            key={p.id}
            src={p.url}
            alt={p.alt_text || ''}
            className="w-full rounded-lg"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PhotoLightbox.tsx
git commit -m "feat(components): PhotoLightbox scrollable grid viewer"
```

---

### Task 14: Create `MobileContactBar` component

**Files:**
- Create: `src/components/MobileContactBar.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { MessageCircle } from 'lucide-react';

export default function MobileContactBar() {
  const messenger = process.env.NEXT_PUBLIC_MESSENGER_URL || '#';

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-stone-200 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <a
        href={messenger}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-[#1877f2] text-white py-3 rounded-lg text-sm font-medium"
      >
        <MessageCircle className="w-4 h-4" /> Message us on Facebook
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npm run type-check
git add src/components/MobileContactBar.tsx
git commit -m "feat(components): MobileContactBar sticky CTA"
```

---

### Task 15: Rewrite `Navbar.tsx`

**Files:**
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/',           label: 'Home' },
  { href: '/properties', label: 'Properties' },
  { href: '/blog',       label: 'Stories' },
  { href: '/contact',    label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const messengerUrl = process.env.NEXT_PUBLIC_MESSENGER_URL || '#';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = pathname === '/';
  const transparentOnHome = isHome && !scrolled;

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        transparentOnHome
          ? 'bg-transparent text-white'
          : 'bg-white/95 backdrop-blur border-b border-stone-200 text-stone-900'
      }`}
    >
      <div className="container-xl flex items-center h-16">
        <Link href="/" className="font-semibold text-[17px] tracking-tight">
          Cozy Condo
        </Link>

        <ul className="hidden md:flex gap-8 mx-auto text-[13px]">
          {NAV_ITEMS.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                className={`transition-opacity hover:opacity-70 ${
                  pathname === n.href ? 'font-medium' : 'opacity-80'
                }`}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>

        <a
          href={messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium transition ${
            transparentOnHome
              ? 'bg-white text-stone-900'
              : 'bg-stone-900 text-stone-50'
          }`}
        >
          <MessageCircle className="w-3.5 h-3.5" /> Message us on Facebook
        </a>

        <button
          className="md:hidden ml-auto"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-stone-200 text-stone-900">
          <ul className="flex flex-col px-6 py-4 gap-4 text-[14px]">
            {NAV_ITEMS.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setOpen(false)}>{n.label}</Link>
              </li>
            ))}
            <li>
              <a href={messengerUrl} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 bg-stone-900 text-stone-50 px-4 py-2 rounded-full text-[12px] font-medium">
                <MessageCircle className="w-3.5 h-3.5" /> Message us on Facebook
              </a>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Type-check + smoke**

```bash
npm run type-check
```

Start `npm run dev`, load `/`. Navbar should be transparent over hero, become white on scroll. Click around — each link navigates, each uses the new labels.

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat(navbar): minimal redesign with FB Messenger CTA"
```

---

### Task 16: Rewrite `Footer.tsx`

**Files:**
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
import Link from 'next/link';
import { Facebook, MessageCircle } from 'lucide-react';

export default function Footer() {
  const fb = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL || '#';
  const messenger = process.env.NEXT_PUBLIC_MESSENGER_URL || '#';

  return (
    <footer className="section-dark">
      <div className="container-xl py-14">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="text-stone-50 font-semibold text-[17px]">Cozy Condo</div>

          <ul className="flex gap-6 text-[13px] text-stone-400">
            <li><Link href="/properties" className="hover:text-stone-100">Properties</Link></li>
            <li><Link href="/blog"       className="hover:text-stone-100">Stories</Link></li>
            <li><Link href="/contact"    className="hover:text-stone-100">Contact</Link></li>
            <li><Link href="/privacy"    className="hover:text-stone-100">Privacy</Link></li>
          </ul>

          <div className="md:ml-auto flex gap-3">
            <a href={fb} target="_blank" rel="noopener noreferrer"
               aria-label="Facebook page"
               className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-stone-50 hover:bg-stone-800">
              <Facebook className="w-4 h-4" />
            </a>
            <a href={messenger} target="_blank" rel="noopener noreferrer"
               aria-label="Messenger"
               className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center text-stone-50 hover:bg-stone-800">
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-stone-800 text-[11px] text-stone-500">
          © {new Date().getFullYear()} Cozy Condo · Iloilo City, Philippines
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Type-check + commit**

```bash
npm run type-check
git add src/components/Footer.tsx
git commit -m "feat(footer): minimal dark footer with Messenger + FB icons"
```

---

## Phase 3 — Public pages rewrite

---

### Task 17: Rewrite `Hero.tsx` (full-bleed photo, no gradient blurs)

**Files:**
- Modify: `src/components/Hero.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
import Link from 'next/link';
import { MessageCircle, ArrowRight } from 'lucide-react';
import type { WebsiteSettings } from '@/lib/types';

interface Props {
  settings: WebsiteSettings | null;
  heroPhotoUrl: string;
}

export default function Hero({ settings, heroPhotoUrl }: Props) {
  const messenger = process.env.NEXT_PUBLIC_MESSENGER_URL || '#';
  const title = settings?.heroTitle || 'Stay well in the heart of Iloilo.';
  const description = settings?.heroDescription ||
    'Thoughtfully furnished condominiums for travelers who want more than a hotel room. Each unit is lived-in, cared for, and ready for your stay.';

  return (
    <section className="relative h-[620px] md:h-[720px] overflow-hidden">
      {/* Background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${heroPhotoUrl}')` }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/70" />

      {/* Text */}
      <div className="relative h-full container-xl flex flex-col justify-end pb-16 md:pb-24">
        <div className="max-w-xl text-white">
          <div className="label-tiny text-white/85 mb-4">— ILOILO CITY · PHILIPPINES</div>
          <h1 className="text-[40px] md:text-[56px] font-medium leading-[1.05] tracking-[-1.2px] mb-4">
            {title}
          </h1>
          <p className="text-[15px] leading-[1.6] max-w-md opacity-90 mb-8">
            {description}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/properties" className="btn btn-on-dark">
              View properties <ArrowRight className="w-4 h-4" />
            </Link>
            <a href={messenger} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-on-dark">
              <MessageCircle className="w-4 h-4" /> Message us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "feat(hero): full-bleed photo hero, drop gradient blurs"
```

---

### Task 18: Rewrite homepage `src/app/page.tsx`

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
import Hero from '@/components/Hero';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { databaseService } from '@/lib/database-service';
import { normalizePropertyData } from '@/utils/slugify';
import Testimonials from '@/components/Testimonials';
import { getTestimonialsServer } from '@/lib/testimonials-server';
import type { Metadata } from 'next';
import type { PropertyData, WebsiteSettings, Testimonial } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cozy Condo — Short-term rentals in Iloilo City',
  description: 'A small collection of thoughtfully furnished condominium rentals in Iloilo City, Philippines.',
};

function coverPhotoUrl(p: any): string {
  if (p?.coverPhotoUrl) return p.coverPhotoUrl;
  if (p?.photos && p.photos.length) {
    const byId = p.coverPhotoId
      ? p.photos.find((ph: any) => ph.id === p.coverPhotoId)
      : null;
    return (byId?.url) || p.photos[0].url;
  }
  return '';
}

export default async function HomePage() {
  let settings: WebsiteSettings | null = null;
  let featured: PropertyData[] = [];
  let testimonials: Testimonial[] = [];

  try {
    const [loadedSettings, propertiesData] = await Promise.all([
      databaseService.getWebsiteSettings(),
      databaseService.getProperties({ active: true }),
    ]);
    settings = loadedSettings;

    const all = Object.values(propertiesData).map((p: any) => normalizePropertyData(p));
    featured = all.filter((p: any) => p.featured).slice(0, 5);
    if (featured.length === 0) featured = all.slice(0, 5);

    // Fetch general testimonials (property_id IS NULL)
    testimonials = await getTestimonialsServer({ propertyId: null, limit: 3 });
  } catch (err) {
    console.error('HomePage load error:', err);
  }

  const heroPhoto = settings?.heroPhotoUrl || (featured[0] ? coverPhotoUrl(featured[0]) : '');
  const messenger = process.env.NEXT_PUBLIC_MESSENGER_URL || '#';
  const introTitle = settings?.introTitle ||
    'Cozy Condo is a small family-run collection of rentals across Iloilo City.';
  const introBody = settings?.introBody ||
    'We handpick every unit, furnish it ourselves, and respond to every guest message personally — because hospitality, to us, means being reachable.';

  return (
    <>
      <Hero settings={settings} heroPhotoUrl={heroPhoto} />

      {/* Intro */}
      <section className="section">
        <div className="container-xl max-w-3xl text-center">
          <div className="label-tiny mb-4">— OUR STORY IN ONE PARAGRAPH</div>
          <h2 className="section-title mb-5">{introTitle}</h2>
          <p className="section-subtitle">{introBody}</p>
        </div>
      </section>

      {/* Featured properties grid */}
      <section className="pb-24">
        <div className="container-xl">
          <div className="flex items-end justify-between mb-8">
            <h3 className="text-[24px] font-medium tracking-tight">Featured properties</h3>
            <Link href="/properties" className="text-[12px] text-stone-700 border-b border-stone-700 pb-0.5">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-3 md:h-[540px]">
            {featured.map((p: any, i: number) => {
              const isBig = i === 0;
              return (
                <Link
                  key={p.id || p.slug}
                  href={`/properties/${p.slug}`}
                  className={`relative rounded-lg overflow-hidden group ${
                    isBig ? 'md:row-span-2 h-64 md:h-auto' : 'h-48 md:h-auto'
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ backgroundImage: `url('${coverPhotoUrl(p)}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className={`font-semibold ${isBig ? 'text-[22px]' : 'text-[16px]'}`}>
                      {p.title || p.name}
                    </div>
                    <div className="text-[11px] opacity-85 mt-0.5">
                      {p.location || ''}{p.pricePerNight ? ` · From ₱${p.pricePerNight.toLocaleString()}/night` : ''}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials
        testimonials={testimonials}
        title="What our guests are saying"
        label="REAL GUESTS · REAL STAYS"
        variant="dark"
      />

      {/* CTA */}
      <section className="section text-center">
        <div className="container-xl max-w-2xl">
          <h3 className="text-[32px] md:text-[40px] font-medium tracking-tight leading-[1.1] mb-4">
            Planning a stay in Iloilo? Send us a message.
          </h3>
          <p className="text-[15px] text-stone-600 mb-8">
            We reply within the hour during the day. No booking engine, no forms — just a real person on Messenger.
          </p>
          <a href={messenger} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <MessageCircle className="w-4 h-4" /> Message us on Facebook <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Type-check + smoke**

```bash
npm run type-check
```

Run dev, open `/`. The homepage should now show: hero (full-bleed photo if `heroPhotoUrl` is set in settings, else falls back to featured[0]'s cover) → intro → featured grid → testimonials → CTA → footer. Any missing photos will just be blank — go set them in admin.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): rewrite homepage to showcase layout"
```

---

### Task 19: Rewrite `PropertyCard.tsx`

**Files:**
- Modify: `src/components/PropertyCard.tsx`

- [ ] **Step 1: Inspect the existing usages**

```bash
grep -rn 'PropertyCard' src/app src/components --include='*.tsx'
```

Note which props the consumers pass. The new card accepts a single `property` prop.

- [ ] **Step 2: Replace the file contents**

```tsx
import Link from 'next/link';

interface Photo {
  id: string;
  url: string;
  alt_text?: string | null;
}

interface Props {
  property: any; // PropertyData / Property — use existing shape
}

function coverUrl(p: any): string {
  if (!p?.photos?.length) return '';
  if (p.coverPhotoId) {
    const found = p.photos.find((ph: Photo) => ph.id === p.coverPhotoId);
    if (found) return found.url;
  }
  return p.photos[0].url;
}

function metaLine(p: any): string {
  const parts: string[] = [];
  if (p.location)   parts.push(String(p.location).toUpperCase());
  if (p.bedrooms)   parts.push(`${p.bedrooms}BR`);
  if (p.maxGuests)  parts.push(`${p.maxGuests} GUESTS`);
  return parts.join(' · ');
}

export default function PropertyCard({ property }: Props) {
  const url   = `/properties/${property.slug}`;
  const photo = coverUrl(property);
  const price = property.pricePerNight;

  return (
    <Link href={url} className="block group">
      <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4 bg-stone-100">
        {photo && (
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.02]"
            style={{ backgroundImage: `url('${photo}')` }}
          />
        )}
      </div>
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-[16px] font-medium">{property.title || property.name}</div>
        {price && (
          <div className="text-[13px] text-stone-600">From ₱{Number(price).toLocaleString()}</div>
        )}
      </div>
      <div className="text-[11px] tracking-wide text-stone-500">
        {metaLine(property)}
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npm run type-check
```

- [ ] **Step 4: Commit**

```bash
git add src/components/PropertyCard.tsx
git commit -m "feat(card): minimal property card with From ₱ price"
```

---

### Task 20: Rewrite Properties gallery page

**Files:**
- Modify: `src/app/properties/page.tsx`

- [ ] **Step 1: Replace the file contents**

```tsx
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
    fetch('/api/properties')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.properties || []);
        setAll(list.map((p: any) => normalizePropertyData(p)).filter((p: any) => p.active !== false));
      })
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    const arr = [...all];
    if (sort === 'price') {
      arr.sort((a, b) => (a.pricePerNight || 0) - (b.pricePerNight || 0));
    } else if (sort === 'newest') {
      arr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
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
```

- [ ] **Step 2: Type-check**

```bash
npm run type-check
```

- [ ] **Step 3: Smoke-test**

Run dev, go to `/properties`. Should show all active properties in a 3-col grid with sort buttons. Click each sort tab and confirm order changes.

- [ ] **Step 4: Commit**

```bash
git add src/app/properties/page.tsx
git commit -m "feat(gallery): minimal properties page with sort toolbar"
```

---

### Task 21: Rewrite `PropertyDetail.tsx`

**Files:**
- Modify: `src/components/PropertyDetail.tsx`
- Review: `src/app/properties/[slug]/page.tsx` (may need to adjust what it passes in)

- [ ] **Step 1: Inspect the current detail route**

```bash
cat src/app/properties/[slug]/page.tsx | head -80
```

Note what it passes to `PropertyDetail`. The new component expects a `property` object (with `photos`) and optionally `testimonials` (filtered for this property).

- [ ] **Step 2: Replace the component contents**

```tsx
'use client';

import { useState } from 'react';
import { MessageCircle, Star } from 'lucide-react';
import PhotoLightbox from './PhotoLightbox';
import Testimonials from './Testimonials';
import MobileContactBar from './MobileContactBar';
import type { Testimonial } from '@/lib/types';

interface Props {
  property: any;
  testimonials?: Testimonial[];
}

export default function PropertyDetail({ property, testimonials = [] }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const photos = property.photos || [];
  const firstFive = photos.slice(0, 5);

  const messenger = process.env.NEXT_PUBLIC_MESSENGER_URL || '#';
  const fbPage    = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL || '#';
  const price     = property.pricePerNight;

  return (
    <main className="pt-24 pb-24">
      {/* Header */}
      <header className="container-xl mb-10">
        <div className="label-tiny mb-3">
          PROPERTIES <span className="text-stone-300 mx-1">/</span> {(property.title || '').toUpperCase()}
        </div>
        <h1 className="text-[36px] md:text-[46px] font-medium tracking-[-1.2px] leading-[1.05] mb-3">
          {property.title || property.name}
        </h1>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-stone-600">
          {property.location && <span>{property.location}</span>}
          {property.propertyType && <><span className="text-stone-300">·</span><span>{property.propertyType}</span></>}
        </div>
      </header>

      {/* Gallery grid */}
      <section className="container-xl mb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-2.5 md:h-[520px]">
          {firstFive.map((p: any, i: number) => (
            <button
              key={p.id}
              onClick={() => setLightboxOpen(true)}
              className={`relative rounded-lg overflow-hidden ${
                i === 0 ? 'md:row-span-2 h-64 md:h-auto' : 'h-32 md:h-auto'
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center hover:opacity-90 transition-opacity"
                style={{ backgroundImage: `url('${p.url}')` }}
              />
              {i === 4 && photos.length > 5 && (
                <span className="absolute bottom-3 right-3 bg-white/90 text-stone-900 text-[11px] font-medium px-3 py-1.5 rounded-full">
                  View all {photos.length} photos →
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Body: 2 columns */}
      <section className="container-xl grid md:grid-cols-[1.6fr_1fr] gap-16">
        {/* Left column */}
        <div>
          {/* Specs */}
          <div className="grid grid-cols-4 gap-5 py-6 border-y border-stone-200 mb-10">
            <div><div className="text-[22px] font-medium">{property.maxGuests || '—'}</div><div className="text-[11px] text-stone-500 tracking-wider uppercase">Guests</div></div>
            <div><div className="text-[22px] font-medium">{property.bedrooms || '—'}</div><div className="text-[11px] text-stone-500 tracking-wider uppercase">Bedroom{property.bedrooms === 1 ? '' : 's'}</div></div>
            <div><div className="text-[22px] font-medium">{property.bathrooms || '—'}</div><div className="text-[11px] text-stone-500 tracking-wider uppercase">Bathroom{property.bathrooms === 1 ? '' : 's'}</div></div>
            <div><div className="text-[22px] font-medium">{property.size || '—'}</div><div className="text-[11px] text-stone-500 tracking-wider uppercase">Sqm</div></div>
          </div>

          {/* About */}
          <section className="mb-12">
            <h3 className="text-[22px] font-medium mb-3">About this unit</h3>
            <p className="text-[15px] leading-[1.75] text-stone-700 whitespace-pre-line">
              {property.description || ''}
            </p>
          </section>

          {/* Amenities */}
          {Array.isArray(property.amenities) && property.amenities.length > 0 && (
            <section className="mb-12 pt-10 border-t border-stone-200">
              <h3 className="text-[22px] font-medium mb-4">What&apos;s included</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-7 text-[14px] text-stone-700">
                {property.amenities.map((a: string) => (
                  <div key={a} className="flex items-start gap-2">
                    <span className="text-stone-400">·</span> {a}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right column: sticky contact card */}
        <aside>
          <div className="sticky top-28 bg-white border border-stone-200 rounded-xl p-7">
            {price && (
              <>
                <div className="text-[11px] text-stone-500 uppercase tracking-wider">From</div>
                <div>
                  <span className="text-[30px] font-medium tracking-tight">
                    ₱{Number(price).toLocaleString()}
                  </span>
                  <span className="text-[13px] text-stone-500"> / night</span>
                </div>
              </>
            )}
            <div className="text-[12px] text-stone-500 mt-1">
              <Star className="inline w-3.5 h-3.5 text-amber-400 mr-0.5" /> Ask us about current availability
            </div>

            <hr className="border-stone-200 my-5" />

            <h4 className="text-[14px] font-medium mb-2">Interested in this unit?</h4>
            <p className="text-[12px] text-stone-600 leading-[1.6] mb-5">
              Send us a message on Facebook and we&apos;ll get back to you within the hour during the day. No forms, no booking fees — just a quick chat.
            </p>

            <a href={messenger} target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 bg-[#1877f2] text-white rounded-lg py-3.5 text-[14px] font-medium mb-2.5">
              <MessageCircle className="w-4 h-4" /> Message us on Facebook
            </a>
            <a href={fbPage} target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center bg-white text-stone-900 border border-stone-300 rounded-lg py-3.5 text-[14px] font-medium">
              Visit our Facebook Page
            </a>
            <div className="text-[11px] text-stone-500 text-center mt-4 tracking-wide">
              — Typically replies within 1 hour —
            </div>
          </div>
        </aside>
      </section>

      {/* Per-unit testimonials */}
      {testimonials.length > 0 && (
        <div className="mt-24">
          <Testimonials
            testimonials={testimonials}
            label={`STAYS AT ${(property.title || '').toUpperCase()}`}
            title="What guests said about this unit"
            variant="dark"
          />
        </div>
      )}

      <PhotoLightbox photos={photos} open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
      <MobileContactBar />
    </main>
  );
}
```

- [ ] **Step 3: Update the detail route to fetch testimonials for this property**

Open `src/app/properties/[slug]/page.tsx` and find where `<PropertyDetail>` is rendered. Fetch testimonials tagged to this property and pass them in using the server helper from Task 6b:

```typescript
// At the top of the file, add imports:
import { getTestimonialsServer } from '@/lib/testimonials-server';
import type { Testimonial } from '@/lib/types';

// After loading the property object (it has a stable `id`):
const testimonials: Testimonial[] = await getTestimonialsServer({
  propertyId: property.id,
});
```

Then pass `testimonials={testimonials}` to `<PropertyDetail>`.

- [ ] **Step 4: Type-check + smoke**

```bash
npm run type-check
```

Run dev, navigate to a property detail page. Should show header → gallery grid → specs → about → amenities → sticky contact card (right on desktop) → testimonials (if any exist for this property) → mobile contact bar (only on mobile viewport).

- [ ] **Step 5: Commit**

```bash
git add src/components/PropertyDetail.tsx src/app/properties/[slug]/page.tsx
git commit -m "feat(unit): minimal unit detail layout with sticky contact card"
```

---

### Task 22: Restyle blog (Stories) list + detail

**Files:**
- Modify: `src/app/blog/page.tsx`
- Modify: `src/app/blog/[slug]/page.tsx`

- [ ] **Step 1: Inspect current files**

```bash
wc -l src/app/blog/page.tsx src/app/blog/[slug]/page.tsx
```

Note the existing data-loading pattern — we reuse it, only the JSX changes.

- [ ] **Step 2: Rewrite the list page JSX**

In `src/app/blog/page.tsx`, keep the existing data loading logic (fetch from `databaseService.getBlogPosts()` or the existing API call) but replace the rendered markup with:

```tsx
// Replace the existing return ( ... ) with:
return (
  <main className="pt-24 pb-24">
    <header className="container-xl max-w-3xl text-center mb-14">
      <div className="label-tiny mb-4">— STORIES FROM ILOILO</div>
      <h1 className="text-[40px] md:text-[48px] font-medium tracking-[-1.2px] leading-[1.05] mb-3">
        Notes &amp; guides
      </h1>
      <p className="text-[15px] text-stone-600 leading-[1.7]">
        Guides for visiting Iloilo, guest stories, neighborhood notes, and the occasional update from us.
      </p>
    </header>

    {posts.length === 0 && (
      <p className="container-xl text-center text-stone-500">No stories yet.</p>
    )}

    {/* Featured post (first post) */}
    {posts[0] && (
      <section className="container-xl max-w-5xl mb-12">
        <Link href={`/blog/${posts[0].slug}`} className="grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div
            className="aspect-[16/10] rounded-lg bg-cover bg-center bg-stone-100"
            style={{ backgroundImage: `url('${posts[0].featured_image || ''}')` }}
          />
          <div>
            <div className="label-tiny mb-3">{new Date(posts[0].published_at || posts[0].created_at).toLocaleString('en-PH', { month: 'short', year: 'numeric' }).toUpperCase()} · {posts[0].category || 'GUIDES'}</div>
            <h2 className="text-[28px] font-medium tracking-[-0.5px] leading-[1.15] mb-3">{posts[0].title}</h2>
            <p className="text-[14px] text-stone-600 leading-[1.7] mb-4">{posts[0].excerpt}</p>
            <span className="text-[12px] border-b border-stone-900 pb-0.5">Read the story →</span>
          </div>
        </Link>
      </section>
    )}

    {/* Grid of other posts */}
    {posts.length > 1 && (
      <section className="container-xl max-w-5xl border-t border-stone-200 pt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {posts.slice(1).map((post: any) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group">
            <div
              className="aspect-[4/3] rounded-lg bg-cover bg-center mb-4 bg-stone-100"
              style={{ backgroundImage: `url('${post.featured_image || ''}')` }}
            />
            <div className="label-tiny mb-2">
              {new Date(post.published_at || post.created_at).toLocaleString('en-PH', { month: 'short', year: 'numeric' }).toUpperCase()}
              {post.category ? ` · ${post.category.toUpperCase()}` : ''}
            </div>
            <h3 className="text-[17px] font-medium leading-[1.25] mb-1">{post.title}</h3>
            <p className="text-[12px] text-stone-600 leading-[1.6]">{post.excerpt}</p>
          </Link>
        ))}
      </section>
    )}
  </main>
);
```

Ensure `Link` is imported from `next/link` at the top. Keep the existing `'use client'` directive or `async function` as it currently is — don't change data-loading semantics.

- [ ] **Step 3: Rewrite the blog detail page**

In `src/app/blog/[slug]/page.tsx`, keep data loading, replace markup. Wrap the rendered markdown/HTML content in a narrow editorial layout:

```tsx
return (
  <main className="pt-24 pb-24">
    <article className="container-xl max-w-2xl">
      <div className="label-tiny mb-4">
        {new Date(post.published_at || post.created_at).toLocaleString('en-PH', { month: 'long', year: 'numeric' }).toUpperCase()}
        {post.category ? ` · ${post.category.toUpperCase()}` : ''}
      </div>
      <h1 className="text-[36px] md:text-[44px] font-medium tracking-[-1px] leading-[1.1] mb-4">{post.title}</h1>
      {post.excerpt && <p className="text-[17px] text-stone-600 leading-[1.6] mb-10">{post.excerpt}</p>}

      {post.featured_image && (
        <div
          className="aspect-[16/9] rounded-lg bg-cover bg-center mb-12 bg-stone-100"
          style={{ backgroundImage: `url('${post.featured_image}')` }}
        />
      )}

      <div
        className="prose prose-stone max-w-none text-[16px] leading-[1.8]"
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />
    </article>
  </main>
);
```

- [ ] **Step 4: Type-check + smoke**

```bash
npm run type-check
```

Visit `/blog`, confirm layout. Visit `/blog/<slug>`, confirm editorial layout.

- [ ] **Step 5: Commit**

```bash
git add src/app/blog/page.tsx src/app/blog/[slug]/page.tsx
git commit -m "feat(stories): restyle blog list + detail to minimal aesthetic"
```

---

### Task 23: Rewrite contact page

**Files:**
- Modify: `src/app/contact/page.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import { MessageCircle, Facebook } from 'lucide-react';

export const metadata = {
  title: 'Contact — Cozy Condo',
  description: 'Reach out to us on Messenger or Facebook.',
};

export default function ContactPage() {
  const fb = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL || '#';
  const messenger = process.env.NEXT_PUBLIC_MESSENGER_URL || '#';

  return (
    <main className="pt-32 pb-24">
      <section className="container-xl max-w-2xl text-center mb-12">
        <div className="label-tiny mb-4">— GET IN TOUCH</div>
        <h1 className="text-[40px] md:text-[48px] font-medium tracking-[-1.2px] leading-[1.05] mb-4">
          Let&apos;s chat.
        </h1>
        <p className="text-[15px] text-stone-600 leading-[1.7]">
          We&apos;re a small team that responds personally to every message. Tap one of the options below and we&apos;ll get back to you within the hour during the day.
        </p>
      </section>

      <section className="container-xl max-w-3xl grid md:grid-cols-2 gap-4 mb-16">
        <a href={messenger} target="_blank" rel="noopener noreferrer"
           className="bg-white border border-stone-200 rounded-xl p-8 text-center hover:shadow-md transition">
          <div className="w-14 h-14 rounded-full bg-[#e7f0ff] flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-[#1877f2]" />
          </div>
          <h3 className="text-[17px] font-medium mb-1.5">Messenger</h3>
          <p className="text-[13px] text-stone-600 leading-[1.55] mb-5">
            Chat with us directly — fastest way to reach us.
          </p>
          <span className="inline-block bg-stone-900 text-stone-50 text-[12px] font-medium px-5 py-2.5 rounded-full">
            Open Messenger →
          </span>
        </a>

        <a href={fb} target="_blank" rel="noopener noreferrer"
           className="bg-white border border-stone-200 rounded-xl p-8 text-center hover:shadow-md transition">
          <div className="w-14 h-14 rounded-full bg-[#e7f0ff] flex items-center justify-center mx-auto mb-4">
            <Facebook className="w-6 h-6 text-[#1877f2]" />
          </div>
          <h3 className="text-[17px] font-medium mb-1.5">Facebook Page</h3>
          <p className="text-[13px] text-stone-600 leading-[1.55] mb-5">
            See our latest updates, photos, and guest stories.
          </p>
          <span className="inline-block bg-stone-900 text-stone-50 text-[12px] font-medium px-5 py-2.5 rounded-full">
            Visit Page →
          </span>
        </a>
      </section>

      <section className="container-xl max-w-2xl border-t border-stone-200 pt-10 text-center text-[13px] text-stone-600 leading-[1.8]">
        <div className="font-medium text-stone-900">Response hours</div>
        <div>Monday – Sunday · 8:00 AM – 9:00 PM (PHT)</div>
        <br />
        <div className="font-medium text-stone-900">Based in</div>
        <div>Iloilo City, Philippines</div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Type-check + smoke + commit**

```bash
npm run type-check
```

Visit `/contact`. Confirm the two cards render and the links open Messenger / FB Page.

```bash
git add src/app/contact/page.tsx
git commit -m "feat(contact): minimal two-card Messenger + FB page layout"
```

---

## Phase 4 — Hide booking UI

---

### Task 24: Delink booking UI (no code deletion)

**Files:**
- Review + potentially modify: `src/components/Navbar.tsx` (already redone in Task 15 — no Book Now button)
- Review + modify as needed: any remaining components that link to `/book/*`

- [ ] **Step 1: Find remaining Book Now references**

```bash
grep -rn '"/book' src/app src/components --include='*.tsx' --include='*.ts'
grep -rn 'Book Now' src/app src/components --include='*.tsx'
```

Any match = a place that still links to the booking flow. Note them all.

- [ ] **Step 2: Replace each match**

For each match found in Step 1:

- If it's a navigation link / button pointing to `/book/...`, replace the `href` with the Messenger URL:
  ```tsx
  // Before:
  <Link href={`/book/${property.slug}`}>Book Now</Link>

  // After:
  <a href={process.env.NEXT_PUBLIC_MESSENGER_URL || '#'} target="_blank" rel="noopener noreferrer">
    Message us on Facebook
  </a>
  ```

- If it's a `<BookingWidget />` being rendered, remove the JSX element (keep the import commented out or delete the import — the file itself stays).

- If a match is inside `src/app/book/*`, `src/components/BookingWidget.tsx`, or `src/app/admin/bookings/*` — **leave it alone.** Those files stay as-is per the spec.

- [ ] **Step 3: Rerun the grep — should be clean**

```bash
grep -rn '"/book' src/app src/components --include='*.tsx' --include='*.ts' \
  | grep -v 'src/app/book/' \
  | grep -v 'src/app/admin/bookings/' \
  | grep -v 'BookingWidget' \
  | grep -v '/api/bookings'
```

Expected: no output. If there are matches, fix them.

- [ ] **Step 4: Type-check + build**

```bash
npm run type-check && npm run build
```

Expected: clean pass.

- [ ] **Step 5: Commit**

```bash
git add src/app src/components
git commit -m "refactor: delink public booking UI; replace with Messenger CTA"
```

---

## Phase 5 — Ship

---

### Task 25: Pre-deploy verification + update CLAUDE.md session log

**Files:**
- Modify: `CLAUDE.md` (append to the session log at the top)

- [ ] **Step 1: Run full pre-deploy check**

```bash
npm run pre-deploy
```

Expected: TypeScript passes, build succeeds, lint is clean. If anything fails, fix before continuing.

- [ ] **Step 2: Manual browser walkthrough**

Start `npm run dev` and click through every public page:

- `/` — hero shows selected photo, intro reads from settings, featured grid renders, testimonials show if any exist, CTA works, footer links work
- `/properties` — grid shows all active properties, sort tabs work
- `/properties/[slug]` — header, gallery, specs, about, amenities, sticky contact card on desktop, per-unit testimonials section (empty if none tagged), mobile contact bar visible on mobile viewport
- `/blog` — featured post + grid
- `/blog/[slug]` — editorial layout
- `/contact` — two cards, both links work
- Navbar — sticky, transparent over home hero, solid elsewhere, mobile menu toggles

Confirm no console errors on any page.

- [ ] **Step 3: Admin walkthrough**

- `/admin/testimonials` — create, edit, delete, toggle published
- `/admin/settings` — set hero photo URL, intro title, intro body; save; refresh `/` and confirm changes apply
- `/admin/properties/[id]/edit` — select a card cover photo; save; check the card on `/properties` uses it

- [ ] **Step 4: Update CLAUDE.md session log**

Open `CLAUDE.md` and add a new session log block at the top of the session-log section (after the most recent date, before the January 13 section):

```markdown
## Session Log: April 11, 2026

### Accomplished Today

1. **Showcase redesign shipped** — pivoted public site from booking engine to photo-forward showcase
   - New minimal monochrome theme (replaced teal/orange with stone/off-white)
   - Rewrote Hero, PropertyCard, PropertyDetail, Navbar, Footer, homepage, properties gallery, contact, blog/stories
   - New components: Testimonials, PhotoLightbox, MobileContactBar

2. **Testimonials system** — new `testimonials` table + API + admin CRUD at `/admin/testimonials`

3. **Hero photo + card covers** — new settings field `hero_photo_url` + per-property `cover_photo_id` selector

4. **Booking flow hidden** — all "Book Now" CTAs replaced with "Message us on Facebook" (Messenger deep link). PayMongo, calendar sync, cron, admin bookings all untouched and still functional.

### Next Steps / Pending

- Fill in all testimonials from Airbnb + Facebook sources via `/admin/testimonials`
- Set the homepage hero photo via `/admin/settings` → Hero photo URL
- Pick a card cover photo for each property via `/admin/properties/[id]/edit`
```

- [ ] **Step 5: Final commit**

```bash
git add CLAUDE.md
git commit -m "docs: session log for showcase redesign ship"
```

---

## Completion checklist

- [ ] All 26 tasks (1 through 25, plus 6b) above committed
- [ ] `npm run pre-deploy` passes
- [ ] Admin has filled in at least 3 testimonials
- [ ] Admin has set a homepage hero photo
- [ ] Admin has picked card covers for all featured properties
- [ ] `NEXT_PUBLIC_FACEBOOK_PAGE_URL` and `NEXT_PUBLIC_MESSENGER_URL` are set in Vercel env
- [ ] Manual smoke test on mobile viewport confirms sticky contact bar works

---

## Notes for the implementing agent

- The spec (`docs/superpowers/specs/2026-04-11-cozy-condo-showcase-redesign-design.md`) is the source of truth for any ambiguity. Re-read the relevant section if a task feels underspecified.
- **Never delete** files in `src/app/book/`, `src/components/BookingWidget.tsx`, `src/lib/paymongo.ts`, `src/lib/calendar-sync.ts`, `src/lib/ical-parser.ts`, or any `/api/bookings/*` / `/api/payments/*` / `/api/cron/*` routes. Those stay untouched.
- If a pre-deploy check fails mid-plan, **stop and fix the root cause** — do not `--no-verify` around it.
- Commit after each task; if a task has multiple logical chunks and one commit feels too big, split it, but never batch unrelated tasks into one commit.
- Before claiming a task is done, run the verification step listed in that task (type-check, build, or manual smoke test).
