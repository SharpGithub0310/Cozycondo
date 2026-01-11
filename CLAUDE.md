# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working Guidelines

1. First think through the problem, read the codebase for relevant files.
2. Before you make any major changes, check in with me and I will verify the plan.
3. Please every step of the way just give me a high level explanation of what changes you made.
4. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
5. Maintain a documentation file that describes how the architecture of the app works inside and out.
6. Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer - give grounded and hallucination-free answers.

## Commands

```bash
# Development
npm run dev              # Start development server (Next.js with Turbopack)
npm run build            # Production build
npm run start            # Start production server

# Type checking (run before commits)
npm run type-check       # Basic TypeScript check
npm run type-check:dev   # Quick dev check with warnings
npm run type-check:watch # Continuous checking

# Pre-deployment validation (run before push)
npm run pre-deploy       # Full validation (TypeScript + build + lint)

# Linting
npm run lint             # ESLint
```

## Architecture Overview

This is a **Next.js 16 App Router** marketing website for short-term rental properties in Iloilo City, Philippines.

### Tech Stack
- **Framework**: Next.js 16 (App Router with Turbopack)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

### Key Architectural Patterns

**Database Layer** (`src/lib/`):
- `database-service.ts` - Singleton `CleanDatabaseService` class handling all Supabase operations
- `supabase.ts` - Client factory with separate anon (client-side) and admin (server-side) clients
- Uses admin client (`SUPABASE_SERVICE_ROLE_KEY`) server-side for RLS bypass
- Uses anon client (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) client-side

**Type System** (`src/lib/types.ts`):
- All shared types defined here: `Property`, `PropertyData`, `BlogPost`, `WebsiteSettings`, `FAQ`
- `PropertyData` is the main interface used throughout the app
- Always import types from `@/lib/types` - never define duplicate interfaces

**Data Flow**:
- Properties stored with photos in separate `property_photos` table (joined on fetch)
- Website settings stored as key-value pairs in `website_settings` table
- camelCase in TypeScript ↔ snake_case in database (converted in service layer)

### Directory Structure

```
src/
├── app/
│   ├── admin/              # Admin panel (dashboard, properties, blog, settings)
│   ├── api/                # API routes (REST endpoints)
│   ├── blog/               # Public blog pages
│   ├── properties/         # Public property pages
│   └── page.tsx            # Homepage
├── components/             # Reusable React components
├── lib/                    # Core utilities, types, database service
└── utils/                  # Helper utilities (slugify, blog storage)
```

### Database Schema (Supabase)

Main tables:
- `properties` - Property listings (with `property_photos` joined)
- `blog_posts` - Blog articles
- `website_settings` - Key-value site configuration
- `site_settings` - Legacy site configuration

RLS enabled on all tables:
- Public can read active properties, published posts, and settings
- Service role has full CRUD access

### Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Public anon key (client-side)
SUPABASE_SERVICE_ROLE_KEY=     # Service role key (server-side only)
ADMIN_PASSWORD=                # Admin panel password
```

### Mobile Optimization

The admin panel includes mobile-specific optimizations:
- Conditional layout rendering based on device type
- Touch-friendly interfaces
- Deferred hydration for heavy components
