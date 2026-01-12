# CLAUDE.md

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
