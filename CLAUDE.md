# CLAUDE.md

## 2nd Brain — Read First

This project is part of Marck's IQ Platform ecosystem. For full context:
1. **Master context:** `M:\2nd-brain\CLAUDE.md` — who Marck is, all projects, priorities
2. **Cozy Condo raw notes:** `M:\2nd-brain\raw\cozy-condo\` — business context, operations
3. **HostIQ context:** `M:\2nd-brain\raw\hostiq\` — the AI assistant being built for this business
4. **IQ Platform vision:** `M:\2nd-brain\wiki\iq-platform\index.md`

---

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working Guidelines

1. First think through the problem, read the codebase for relevant files.
2. Before you make any major changes, check in with me and I will verify the plan.
3. Please every step of the way just give me a high level explanation of what changes you made.
4. Make every task and code change you do as simple as possible. Every change should impact as little code as possible. Everything is about simplicity.
5. Never speculate about code you have not opened. Always read relevant files BEFORE answering questions about the codebase.
6. Use agents specialized for the job whenever needed or required. 

## Commands

```bash
# Development
npm run dev              # Start development server (Next.js with Turbopack)
npm run build            # Production build
npm run start            # Start production server

# Type checking
npm run type-check       # TypeScript check
npm run type-check:watch # Continuous checking

# Pre-deployment
npm run pre-deploy       # Full validation (TypeScript + build + lint)
npm run lint             # ESLint
```

## Architecture Overview

**Next.js 16 App Router** marketing website for short-term rentals in Iloilo City, Philippines, with integrated booking and payment system.

### Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Payments**: PayMongo (GCash, Maya, cards)
- **Icons**: Lucide React

### Core Libraries (`src/lib/`)

| File | Purpose |
|------|---------|
| `api-auth.ts` | Admin auth, `createAdminClient()`, `requireAuth()` wrapper, `rateLimit()` |
| `api-utils.ts` | `successResponse()`, `errorResponse()`, validation helpers |
| `supabase.ts` | Client factory (anon for client-side, admin for server-side) |
| `database-service.ts` | `CleanDatabaseService` singleton for Supabase operations |
| `types.ts` | All shared TypeScript interfaces |
| `paymongo.ts` | PayMongo checkout session creation, webhook verification |
| `calendar-sync.ts` | iCal parsing and Airbnb calendar sync |
| `ical-parser.ts` | Parse iCal feeds from Airbnb |

### API Route Patterns

All API routes follow consistent patterns in `src/app/api/`:

```typescript
// Protected admin route
export async function POST(request: NextRequest) {
  return await requireAuth(request, async (req, session) => {
    const adminClient = createAdminClient();
    // ... logic
    return successResponse(data, 'Message');
  });
}

// Public route with rate limiting
export async function GET(request: NextRequest) {
  const rateLimitResult = rateLimit(request, 60, 15 * 60 * 1000);
  if (!rateLimitResult.allowed) {
    return errorResponse('Rate limit exceeded', 429);
  }
  // ... logic
}
```

### Key API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/properties` | Property CRUD |
| `/api/bookings` | Booking creation and management |
| `/api/bookings/availability` | Check date availability |
| `/api/payments/create-checkout` | Create PayMongo checkout session |
| `/api/payments/webhook` | Handle PayMongo payment events |
| `/api/calendar/sync` | Sync Airbnb iCal to database |
| `/api/calendar/events` | Get blocked dates for property |
| `/api/cron/sync-calendars` | Hourly auto-sync (Vercel cron) |

### Database Schema

Main tables in Supabase:
- `properties` - Listings with `property_photos` joined
- `bookings` - Reservations with status workflow
- `payments` - PayMongo payment records
- `guests` - Guest information
- `calendar_events` - Blocked dates (from Airbnb sync, manual blocks, bookings)
- `blog_posts` - Blog articles
- `website_settings` - Key-value site configuration

**Booking Status Flow**: `pending` → `paid` → `confirmed` → `checked_in` → `checked_out` (or `cancelled`)

### Data Conventions

- **TypeScript**: camelCase (`pricePerNight`, `checkIn`)
- **Database**: snake_case (`price_per_night`, `check_in`)
- Conversion happens in API routes and service layer
- Always use Philippine timezone (`Asia/Manila`) for date display

### Date Handling

Use local date formatting to avoid timezone bugs:
```typescript
// CORRECT - local timezone
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// WRONG - converts to UTC, causes off-by-one day errors
date.toISOString().split('T')[0]
```

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_ADMIN_PASSWORD=
PAYMONGO_SECRET_KEY=
PAYMONGO_PUBLIC_KEY=
PAYMONGO_WEBHOOK_SECRET=
```

### Booking Flow

1. Guest selects dates in `BookingWidget` → checks availability via API
2. Guest fills form in `/book/[propertySlug]` → creates booking (status: pending)
3. API creates PayMongo checkout session → guest redirected to payment
4. PayMongo webhook updates payment status → booking becomes `paid`
5. Calendar event created to block dates

### Calendar Sync

- Properties with `ical_url` field sync from Airbnb
- Manual sync via admin panel or automatic hourly via Vercel cron
- `calendar_events` table stores blocked dates with `source` field (airbnb/manual/booking)
- Checkout day is available for new check-in (noon-to-noon model)

### Vercel Cron

Configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-calendars",
      "schedule": "0 * * * *"
    }
  ]
}
```

---

## Session Log: April 11, 2026 (PM) — Phase 2 shipped

### Accomplished Today

**Phase 2 shipped (15 commits).** Public visual rewrite complete. The site is now a photo-forward showcase using the new monochrome theme. Booking flow preserved in the backend but fully delinked from the public pages.

1. **globals.css rewrite** — replaced teal/orange theme (~2100 lines) with minimal monochrome (~140 lines). Kept legacy CSS vars mapped to the new ink color so untouched pages (admin, terms, privacy, sitemap) don't explode during mid-migration.
2. **New components** — `Testimonials`, `PhotoLightbox` (scrollable grid, not carousel), `MobileContactBar` (sticky Messenger CTA on mobile).
3. **Navbar rewrite** — transparent over home hero, solid-white elsewhere, FB Messenger CTA. Kept optional `settings` prop (unused) so `ConditionalLayout` still compiles without code churn.
4. **Footer rewrite** — minimal dark footer with FB + Messenger icons. Same `settings` compat shim as Navbar.
5. **Hero rewrite** — full-bleed photo with dark-gradient overlay, label-tiny + 2 CTAs (View properties / Message us). `heroPhotoUrl` is optional with fallback.
6. **Homepage rewrite** — hero → intro (settings-driven) → featured-5 grid (first card big) → testimonials (general pool) → CTA → footer.
7. **PropertyCard rewrite** — minimal card with From ₱ price + METADATA line. Handles photos as either `string[]` or `{id,url}[]`.
8. **Properties gallery rewrite** — sort toolbar (Featured / Price ↓ / Newest), 3-col grid, uses new PropertyCard.
9. **PropertyDetail rewrite** — 5-photo grid + "view all" lightbox, 2-column body with sticky contact card (Messenger + FB page), per-unit testimonials section, mobile contact bar. Normalizes photos internally to handle the current `string[]` shape from `databaseService`.
10. **Detail route** (`/properties/[slug]/page.tsx`) — now fetches per-property testimonials server-side via `getTestimonialsServer({ propertyId })` and passes them to `PropertyDetail`.
11. **Blog (Stories) rewrite** — list page has featured-post + 3-col grid; detail page is editorial-column layout with `prose prose-stone`. Data-loading logic preserved (`getPublishedBlogPosts()` / `fetch('/api/blog/slug/...')`).
12. **Contact rewrite** — two minimal cards (Messenger / FB Page) + response hours footer. No more phone/email/forms.
13. **Delink booking UI** — grep confirmed no remaining `/book` or `Book Now` references in public pages/components. All booking flow code (`src/app/book/*`, `BookingWidget`, `/api/bookings`, PayMongo) preserved untouched.

### Current Status

- **Type-check clean** ✅
- **Build clean** ✅ (all 30+ routes compile, including preserved `/book/*` routes)
- **Lint: 192 pre-existing errors** ⚠️ — almost entirely `@typescript-eslint/no-explicit-any` across API routes, admin pages, BookingWidget, PayMongo, database-service, etc. These pre-date Phase 2. A handful also exist in the Phase 2 files (PropertyCard, PropertyDetail, homepage) because the plan's own code specifies `any` for the property shape. Not fixed: doing so would require typing the full `PropertyData` shape plus touching preserved PayMongo/booking code.
- All 15 Phase 2 commits on `main`
- DB migration already applied in Phase 1; no new DB work this session

### Next Steps / Pending

- **Manual data entry** (between sessions):
  - Fill in real testimonials via `/admin/testimonials`
  - Set the homepage Hero Photo URL via `/admin/settings` → Hero photo URL
  - Pick a Card cover photo for each featured property via `/admin/properties/[id]/edit`
- **Deploy to Dokploy** — `NEXT_PUBLIC_FACEBOOK_PAGE_URL` and `NEXT_PUBLIC_MESSENGER_URL` are already set in the Dokploy env. Just trigger a redeploy to pick up Phase 2.
- **Optional cleanup** (future session):
  - Codebase-wide lint sweep (192 pre-existing errors, mostly `any` usage)
  - Remove legacy `--color-warm-*` / `--color-primary-*` CSS vars once terms/privacy/sitemap/admin pages are visually migrated
  - Consider deleting `src/app/book/*` and `BookingWidget.tsx` if the pivot is permanent

### What Stays Untouched (still preserved)

PayMongo, calendar sync, bookings API, admin bookings/revenue, Vercel cron, `/book/*` pages — all still functional, just invisible from the public site.

---

## Session Log: April 11, 2026

### Accomplished Today

**Showcase redesign brainstorm + spec + Phase 1 implementation.** Pivoted the public site from a booking engine to a photo-forward showcase. All bookings will happen via Facebook Messenger + Facebook Page (no more on-site booking flow). Visual direction: **Boutique Modern Minimal** (stone/off-white palette, full-bleed photography, confident whitespace).

**Design artifacts:**
- Spec: `docs/superpowers/specs/2026-04-11-cozy-condo-showcase-redesign-design.md`
- Plan: `docs/superpowers/plans/2026-04-11-cozy-condo-showcase-redesign.md` (26 tasks across 5 phases)

**Phase 1 shipped (11 commits):** Data foundation + admin backend. Nothing visible on public site yet — that's Phase 2.

1. **Env vars** — `NEXT_PUBLIC_FACEBOOK_PAGE_URL` + `NEXT_PUBLIC_MESSENGER_URL` documented in `.env.example`, local values set in `.env.local`
2. **Supabase migration** — new `testimonials` table, `properties.cover_photo_id` column, new `website_settings` keys (`hero_photo_url`, `intro_title`, `intro_body`). Migration file: `scripts/migrations/2026-04-11-testimonials-and-covers.sql` — applied to prod DB.
3. **TypeScript types** — `Testimonial`, `TestimonialSource`, `TestimonialRow`, `mapTestimonialRow` in `src/lib/types.ts`
4. **Testimonials API** — `GET /api/testimonials` (public list with optional `propertyId` / `includeUnpublished` filters, rate-limited) + `POST` (admin auth required)
5. **Testimonials detail API** — `GET/PUT/DELETE /api/testimonials/[id]`
6. **cover_photo_id plumbing** — property API GET now returns `photoRecords[]` (full photo objects with IDs) alongside existing `photos[]` (URLs only, for back-compat); PUT supports `coverPhotoId` field
6b. **Server-side testimonials helper** — `src/lib/testimonials-server.ts` for Next server components to query testimonials without HTTP overhead
7. **Admin testimonials list page** — `/admin/testimonials` with add/edit/delete/publish toggle
8. **Admin testimonials create/edit form** — `/admin/testimonials/new` + `/admin/testimonials/[id]`, shared `_form.tsx` with property tagging dropdown
9. **Admin settings additions** — Hero Photo URL field (with live preview), Intro Title + Intro Body text fields, persisted via existing settings API
10. **Card cover photo selector** — on property edit page, dedicated picker below the main photo gallery; falls back to featured photo if unset

### Current Status

- Phase 1 complete, build passing (`npm run build` clean), type-check clean
- DB migration applied to prod Supabase
- All 11 Phase 1 commits on `main`
- Phase 2 (public visual rewrite — Tasks 11–26) deferred to a future session

### Next Steps / Pending

- **Between sessions (manual data entry):**
  - Fill in real testimonials from Airbnb + Facebook via `/admin/testimonials`
  - Set homepage Hero Photo URL via `/admin/settings` (Hero Section)
  - Pick a Card cover photo for each property via `/admin/properties/[id]/edit`
- **Phase 2 — Public visual rewrite** (Tasks 11–26 in the plan):
  - Rewrite `globals.css` with monochrome theme
  - New components: `Testimonials`, `PhotoLightbox`, `MobileContactBar`
  - Rewrite Hero, Navbar, Footer, PropertyCard, PropertyDetail
  - Rewrite homepage, properties gallery, unit detail, blog/stories, contact pages
  - Delink booking UI (replace all "Book Now" with "Message us on Facebook")

### What Stays Untouched

PayMongo, calendar sync, bookings API, admin bookings/revenue, Vercel cron, `/book/*` pages — all preserved and functional. The pivot hides them from the public site without deleting any backend plumbing.

---

## Session Log: January 13, 2026

### Accomplished Today

1. **Fixed Vercel Cron Authorization** - Cron wasn't triggering because authorization check was wrong
   - Updated `/api/cron/sync-calendars` to check for Vercel's `x-vercel-cron` header
   - Now accepts both Vercel cron header OR CRON_SECRET for manual testing

2. **Festival Pricing Endpoint** - Created `/api/admin/festival-pricing` for batch price updates
   - POST: Set multiplied prices for date range across all properties
   - DELETE: Remove price overrides for date range
   - Ready for Dinagyang festival (Jan 16-25, x2 prices)

3. **Claude Code Commands & Skills** - Added 23 slash commands and 11 skills to `.claude/`
   - Commands: `/commit`, `/code-review`, `/review-pr`, `/feature-dev`, etc.
   - Skills: `frontend-design`, `stripe-best-practices`, `writing-rules`, etc.

### Current Status

- All changes committed and pushed to GitHub
- Cron should now work after next Vercel deployment
- Festival pricing endpoint ready to use

### Next Steps / Pending

- Deploy to Vercel and verify cron triggers hourly
- Set Dinagyang x2 pricing via festival-pricing endpoint:
  ```javascript
  fetch('/api/admin/festival-pricing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': 'PASSWORD' },
    body: JSON.stringify({ startDate: '2026-01-16', endDate: '2026-01-25', multiplier: 2 })
  })
  ```
- Test PayMongo payment flow in production

### Issues Encountered

- Contact page redirect to government site (bmd.cicc.gov.ph) - NOT a code issue, likely device malware or ISP redirect on desktop. Works fine on mobile.

---

## Session Log: January 12, 2026

### Accomplished Today

1. **Parking Days Selector** - Changed parking from all-or-nothing checkbox to dropdown selector allowing guests to choose specific number of parking days (0 to N days where N = stay nights)
   - Updated `BookingWidget.tsx`, booking page, and booking API
   - Pricing shows "Parking (₱X/day x 3 days)" format

2. **Timezone Bug Fix** - Fixed DatePicker showing dates one day earlier
   - Root cause: `toISOString()` converts to UTC, causing off-by-one in Philippines (UTC+8)
   - Solution: Created `formatDateLocal()` helper using local date methods

3. **Calendar Open Dates Display** - Booking calendar now shows checkout dates as available (green) for new check-ins
   - Added `isCheckoutDay()` and `isCheckinDay()` helper functions
   - Red = Booked, Green = Open (checkout day), Teal = Selected
   - Uses string comparison (YYYY-MM-DD) for accurate date matching

4. **Automatic Hourly Calendar Sync** - Properties with Airbnb iCal URLs now sync automatically
   - Created `/api/cron/sync-calendars` endpoint
   - Added `vercel.json` with hourly cron schedule
   - Improved admin calendar page with prominent "Last synced" display

5. **CLAUDE.md Overhaul** - Comprehensive documentation update with booking system, payment flow, calendar sync, and date handling guidance

### Current Status

- All features implemented and tested
- All changes committed and pushed to GitHub
- Build passing

### Next Steps / Pending

- Test PayMongo payment flow in production
- Monitor hourly cron sync in Vercel dashboard
- Consider adding `CRON_SECRET` environment variable for production security (optional)

### Issues Encountered

- Build lock file conflict (resolved by removing `.next/lock`)

### Bugs Fixed This Session

**Booking toggle now properly blocks bookings** (Fixed Jan 12, 2026)
- Settings API now returns `bookingEnabled` and `bookingDisabledMessage`
- Bookings API query fixed to use row-based `setting_key`/`setting_value` structure
- Booking page now checks setting and shows disabled message when off
