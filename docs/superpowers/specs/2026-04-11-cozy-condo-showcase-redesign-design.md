# Cozy Condo — Showcase Redesign

**Date:** 2026-04-11
**Status:** Approved, ready for implementation planning
**Owner:** Marck

## Summary

Pivot the Cozy Condo public website from a booking engine to a **photo-forward showcase** for the rental units. Bookings no longer happen on the site — guests message the business directly on **Facebook Messenger** or via the **Facebook Page**. The existing booking system code (PayMongo, calendar sync, booking APIs, admin booking pages) stays in the repository but is hidden from the public site so it can be re-enabled later without rework.

Visual direction: **Boutique Modern Minimal** — full-bleed photography, confident whitespace, modern sans-serif typography, a muted monochrome palette. The current teal + orange + gradient-blur aesthetic is replaced entirely.

## Goals

- Public site looks current, premium, and photo-forward.
- Every page drives guests toward one action: **Message us on Facebook**.
- Admin can self-manage testimonials, hero photo, and per-property cover photos without developer help.
- Blog is kept in navigation and restyled to match the new aesthetic.
- Booking system code is preserved untouched so it can be reactivated in a future phase.

## Non-Goals

- No redesign of the admin panel beyond the two new sections listed below.
- No changes to the booking, payment, or calendar-sync backends.
- No multi-language support, map integration, guest dashboard, or favorites — deferred.
- No owner bio / about-us section (user declined).
- No contact form — contact happens via Messenger and Facebook Page only.

## Visual Direction

**Palette**
- Base: `#fafaf8` (off-white)
- Ink: `#1c1917` (near-black)
- Muted: `#8a7a5c` (warm stone for labels)
- Border: `rgba(0,0,0,0.08)`

**Typography**
- Single family: Inter (or similar modern sans already available via `next/font`)
- Confident sizing: hero titles at ~56px, tight letter-spacing (~ -1px), weight 500
- Small labels in uppercase, letter-spaced, warm-stone color

**Layout principles**
- Full-bleed photography on hero sections
- No gradient blurs, no decorative floating cards, no stat pill badges
- Photos do the work; typography stays quiet and confident
- Generous vertical rhythm between sections (80–110px padding)

## Sitemap

Public pages (all visible in main nav):

| Route | Page | Notes |
|---|---|---|
| `/` | Home | Full-bleed hero → intro → featured grid → testimonials → CTA → footer |
| `/properties` | Gallery | 3-column card grid with sort options (Featured / Price / Newest) |
| `/properties/[slug]` | Unit Detail | Photo gallery → 2-col body with sticky contact card → per-unit testimonials |
| `/blog` | Stories | Featured story hero + 3-column post grid (renamed from "Blog") |
| `/blog/[slug]` | Story detail | Minimal editorial layout |
| `/contact` | Contact | Two cards (Messenger, Facebook Page) + hours + location |

**Nav:** `Home · Properties · Stories · Contact` + primary CTA button "Message us on Facebook".

**Pages hidden from public nav and delinked** (code stays in repo):
- `/book/[propertySlug]`
- `/book/confirmation`
- `/book/lookup`

**Admin pages** (unchanged in structure, plus additions below):
- `/admin`, `/admin/properties/*`, `/admin/blog/*`, `/admin/bookings/*`, `/admin/calendar`, `/admin/revenue`, `/admin/settings`

## Page Designs

### Homepage (`/`)

Six sections, top to bottom:

1. **Hero** — Full-bleed photo from `website_settings.hero_photo_url` with dark gradient overlay. Overlay content: tiny uppercase location label → large title (2 lines, ~56px) → subtitle (~15px, max 440px wide) → two buttons: primary "View properties" + ghost "Message us".
2. **Intro** — Centered, max 780px. Tiny uppercase label → H2 headline → one paragraph of story copy.
3. **Featured properties grid** — 5 cards in a dense hero-card layout: 1 large card (2 cols × 2 rows) on the left, 4 smaller cards on the right. Each card: cover photo, name, location/price meta. Clicking navigates to unit detail.
4. **Testimonials** — Dark section (`#1c1917` background). 3-column grid of quotes, each with 5-star row, quote text, guest first name + stay month + source tag ("via Airbnb" / "via Facebook").
5. **CTA** — Light section, centered. Large H3 ("Planning a stay in Iloilo? Send us a message."), one paragraph, single dark button "Message us on Facebook →".
6. **Footer** — Dark section. Logo, text links (Properties / Stories / Contact / Privacy), Facebook + Messenger icon buttons.

Data sources:
- Hero photo: `website_settings.hero_photo_url`
- Intro copy: `website_settings.intro_title`, `website_settings.intro_body`
- Featured properties: properties where `featured = true`, limited to 5
- Testimonials: `testimonials` where `published = true AND property_id IS NULL`, ordered by `display_order`, limited to 3

### Properties Gallery (`/properties`)

- Header: tiny label → "All properties" H1 → intro paragraph
- Toolbar (below header): property count on left + sort tabs on right ("Featured" / "Price" / "Newest")
- Body: 3-column grid, gap 28px. Each card = cover photo (4:3) + name + "From ₱X" + one-line meta (`LOCATION · BEDS · GUESTS`)
- Hover: slight photo scale (1.02) transition

Data:
- All properties where `active = true`, ordered by selected sort
- Card cover: uses `properties.cover_photo_id` if set, falls back to first photo

### Unit Detail (`/properties/[slug]`)

- **Header:** breadcrumb → large title (~46px) → meta row (location · type · rating if available)
- **Photo gallery:** 5-slot hero grid (1 big + 4 small). Last slot has "View all N photos →" button that opens a **scrollable grid lightbox** (not carousel)
- **Body:** 2-column layout (1.6fr / 1fr)
  - Left column:
    - Quick specs strip: Guests / Bedrooms / Bathrooms / Sqm (4 cells, bordered top + bottom)
    - "About this unit" — paragraph
    - "What's included" — 3-column amenities list
    - "Where you'll be" — paragraph + static map placeholder (real map integration deferred)
  - Right column (sticky, `top: 30px`):
    - "From" label + large price + "/ night"
    - Rating line
    - Short helper copy
    - Primary button: "Message us on Facebook" (Facebook blue)
    - Ghost button: "Visit our Facebook Page"
    - "Typically replies within 1 hour" footer
- **Per-unit testimonials:** Dark section. 2-column grid of quotes specific to this property (`testimonials.property_id = current`) if any exist; section hidden if none
- **Mobile:** Sticky bottom bar with "Message us on Facebook" replaces the side card on `md` breakpoint down

### Stories (`/blog`)

- Centered header: tiny label → "Notes & guides" H1 → one intro paragraph
- **Featured post** row: 2-column (photo left 1.2fr, text right 1fr) showing the most recent or manually-featured post
- **Post grid** below a thin rule divider: 3 columns, each with 4:3 image + uppercase meta (date · category) + H3 title + excerpt
- Post detail page (`/blog/[slug]`): restyled to single-column editorial layout with minimal typography (implementation follows the homepage's minimal theme — detailed layout can be finalized during implementation since no new functionality required)

### Contact (`/contact`)

- Centered hero: tiny label → "Let's chat." H1 → one intro paragraph
- **Two cards only**, side-by-side:
  - **Messenger** card: icon + title + one-line description + dark button "Open Messenger →"
  - **Facebook Page** card: icon + title + one-line description + dark button "Visit Page →"
- **Info footer** (below thin rule): "Response hours" / hours line / "Based in" / location

## Data Changes

### New table: `testimonials`

```sql
create table testimonials (
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
create index on testimonials (published, display_order);
create index on testimonials (property_id);
```

### New column: `properties.cover_photo_id`

```sql
alter table properties
  add column cover_photo_id uuid references property_photos(id) on delete set null;
```

Fallback: if `cover_photo_id` is null, the UI uses the first photo in `property_photos` ordered by `display_order`. No data migration required.

### New key in `website_settings`

- `hero_photo_url` — full URL of the homepage hero photo. May be an upload to the existing `property-photos` Supabase bucket or a URL picked from an existing property photo.

Also used for the intro section on the homepage (add as website_settings keys during implementation):

- `intro_title` — H2 text on the homepage intro section
- `intro_body` — paragraph text on the homepage intro section

## Admin Additions

### `/admin/testimonials` (new section)

- List view: all testimonials with inline edit/delete and published toggle
- "Add testimonial" button → form with fields matching the schema:
  - Guest name (text)
  - Review text (textarea)
  - Rating (1–5 stars, default 5)
  - Source (select: Airbnb / Facebook / Google / Direct)
  - Stay month (text, e.g., "January 2026")
  - Property (optional select from properties; blank = general/homepage)
  - Display order (number)
  - Published (toggle)
- Sortable by display_order (drag or number field; simplest is number field)

### Settings additions (`/admin/settings`)

- **Homepage Hero Photo** field — upload new image OR paste URL from an existing property photo. Stores to `website_settings.hero_photo_url`.
- **Intro Title** and **Intro Body** text fields for the homepage intro section.

### Property edit page additions

- **Card Cover Photo** dropdown — select which of the property's existing photos is the card cover. Stores to `properties.cover_photo_id`.

## Technical Scope

### Files to rewrite / modify

| File | Change |
|---|---|
| `src/app/globals.css` | Replace teal/orange palette with minimal monochrome theme |
| `src/components/Hero.tsx` | Full rewrite — full-bleed photo, no gradient blurs, new layout |
| `src/components/PropertyCard.tsx` | Rewrite — cover photo + "From ₱X" price, new typography |
| `src/components/PropertyDetail.tsx` | Rewrite — gallery grid + 2-col body + sticky contact card + testimonials |
| `src/components/BookingWidget.tsx` | Stop rendering on unit detail; file stays in repo |
| `src/components/Navbar.tsx` | New labels (`Home · Properties · Stories · Contact`), "Message us on Facebook" CTA |
| `src/components/Footer.tsx` | Minimal dark restyle |
| `src/app/page.tsx` | Rewrite homepage to use new section components |
| `src/app/properties/page.tsx` | New gallery layout with sort toolbar |
| `src/app/properties/[slug]/page.tsx` | Use new PropertyDetail layout |
| `src/app/blog/page.tsx` | Restyle to Stories aesthetic |
| `src/app/blog/[slug]/page.tsx` | Restyle story detail |
| `src/app/contact/page.tsx` | Rewrite to two-card layout |

### New files

| File | Purpose |
|---|---|
| `src/components/Testimonials.tsx` | Reusable testimonials grid/carousel |
| `src/components/PhotoLightbox.tsx` | Scrollable grid lightbox for unit photos |
| `src/components/MobileContactBar.tsx` | Sticky bottom CTA bar for mobile on unit detail |
| `src/app/admin/testimonials/page.tsx` | Testimonials list view |
| `src/app/admin/testimonials/new/page.tsx` | Create form |
| `src/app/admin/testimonials/[id]/page.tsx` | Edit form |
| `src/app/api/testimonials/route.ts` | GET (list) + POST (create) |
| `src/app/api/testimonials/[id]/route.ts` | GET / PUT / DELETE |
| Supabase migration | `testimonials` table + `properties.cover_photo_id` column |

### Hiding booking UI (no code deletion)

- Remove nav link references to `/book/*`
- Remove "Book Now" buttons across PropertyCard, PropertyDetail, Navbar — replace with "Message us on Facebook" link
- `/book/*` pages remain technically accessible if someone types the URL, but nothing on the public site links to them (no route guards, no redirects — the simplest "hide, don't delete" approach)
- Files in `/src/app/book/`, `BookingWidget.tsx`, `/api/bookings/*`, `/api/payments/*`, `paymongo.ts`, `calendar-sync.ts`, `ical-parser.ts` — **untouched**
- Admin bookings, revenue, calendar pages — **untouched**; still accessible to logged-in admin
- Cron job (`/api/cron/sync-calendars`) — **untouched**; continues to run

### Environment variables (new)

- `NEXT_PUBLIC_FACEBOOK_PAGE_URL` — URL to the Cozy Condo Facebook page
- `NEXT_PUBLIC_MESSENGER_URL` — deep link to Messenger (e.g., `https://m.me/<page-id>`)

Both are used by Navbar CTA, homepage CTA, unit detail contact card, contact page cards, footer, and mobile sticky bar.

## What Stays Untouched

- PayMongo integration (`src/lib/paymongo.ts`)
- Calendar sync (`src/lib/calendar-sync.ts`, `ical-parser.ts`, `/api/calendar/*`, `/api/cron/sync-calendars`)
- Bookings backend (`/api/bookings/*`)
- Festival pricing endpoint (`/api/admin/festival-pricing`)
- Admin bookings, revenue, and calendar pages
- Vercel cron configuration (`vercel.json`)
- Database tables: `bookings`, `payments`, `guests`, `calendar_events`

## Open Questions / Deferred

- Real map integration on unit detail page (Google Maps / OpenStreetMap) — shipping with static placeholder
- Photoshoot / photo quality audit — the boutique minimal direction depends heavily on photo quality; a production pre-flight to verify every property has strong cover shots is recommended before go-live but is out of scope for this spec
- Blog post detail layout detail — final typography decisions made during implementation, not this spec
- Future phase: re-enable booking engine if business pivots back to on-site bookings
