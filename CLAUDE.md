# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands for Development

### Core Development Commands
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build for production (Next.js 16 with Turbopack)
- `npm start` - Start production server
- `npm run type-check` - TypeScript compilation check
- `npm run type-check:watch` - Continuous TypeScript checking
- `npm run type-check:dev` - Quick dev type check with warnings
- `npm run pre-deploy` - Full pre-deployment validation (TypeScript + build + lint)
- `npm run lint` - ESLint checks

### Testing Individual Components
- For API testing, use the comprehensive endpoints in `/api/` routes
- Test properties API: `curl "http://localhost:3000/api/properties"`
- Test blog API: `curl "http://localhost:3000/api/blog"`
- Test settings API: `curl "http://localhost:3000/api/settings"`
- Test database health: `curl "http://localhost:3000/api/health/database"`

## Current Project State (January 2026)

### Active Features
- ✅ Full database integration with Supabase
- ✅ Admin panel with authentication
- ✅ Property management system
- ✅ Blog/content management
- ✅ Settings management for site configuration
- ✅ API endpoints for core data operations
- ✅ Rate limiting and security measures
- ✅ Optimized bundle size (~25% reduction)
- ✅ Clean, streamlined codebase

### Removed/Deprecated Features
- ❌ Calendar functionality (removed - not needed)
- ❌ Storage settings section (removed - not needed)
- ❌ Performance monitoring/notifications (removed)
- ❌ Debug endpoints (removed for production)
- ❌ Calendar dependencies (date-fns, ical-generator, node-ical)
- ❌ localStorage fallback (migrated to database-only)
- ❌ Hardcoded fallback data (database-only approach)

## Architecture Overview

### Database Architecture
This project migrated from localStorage to Supabase with a sophisticated fallback system:

- **Primary**: Supabase PostgreSQL database with RLS policies
- **Fallback**: Production fallback service for offline/connection issues
- **Migration**: Complete localStorage-to-database migration system with validation

### Data Service Layer Architecture
Two-tier database service architecture:

1. **`postMigrationDatabaseService`** - Primary interface
   - Server-side: Direct Supabase client calls (faster, more reliable)
   - Client-side: API route calls via enhancedDatabaseService
   - Handles environment detection automatically
   - Database-only, no fallback data

2. **`enhancedDatabaseService`** - Client-side API interface
   - HTTP requests to `/api/` endpoints
   - Caching and request deduplication
   - Database-only, no fallback functionality

**IMPORTANT**: The database service architecture is now database-only. No fallback services, no hardcoded data. All services will throw errors if the database is unavailable, ensuring proper error handling and preventing stale data issues.

### Rendering Strategy
- **Properties page**: `force-dynamic` to ensure server-side database access
- **Individual property pages**: SSG with `generateStaticParams`
- **Admin pages**: Client-side rendering with authentication

### Authentication System
- **Public endpoints**: Rate-limited, no auth required
- **Admin endpoints**: Bearer token or `x-admin-session: authenticated`
- **Rate limiting**: 100 requests/15min public, 20-50 requests/15min admin

## Project Structure Insights

### Key Directories
- `src/app/admin/` - Admin panel with the following sections:
  - Dashboard - Overview and quick actions (properties count, blog posts, visitor stats)
  - Properties - Manage property listings, amenities, and photos
  - Blog - Content management with rich text and images
  - Settings - Site configuration (contact info, images, content, FAQs)
- `src/app/api/` - REST API endpoints for database operations
- `src/lib/` - Core services and utilities
- `src/components/` - Reusable UI components

### Critical Files
- `src/lib/types.ts` - Centralized TypeScript interfaces (always import from here)
- `src/lib/post-migration-database-service.ts` - Main data access layer
- `API_ENDPOINTS.md` - Complete API documentation
- `TYPESCRIPT_DEVELOPMENT_GUIDE.md` - Type safety best practices

### Core Dependencies (Optimized)
- **Next.js 16.0.8** - React framework with App Router and Turbopack
- **React 18.3.1** - UI library
- **Tailwind CSS v4** - Utility-first CSS framework
- **Supabase JS 2.89.0** - Database client
- **Lucide React** - Icon library
- **dotenv** - Environment variable management

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_ADMIN_PASSWORD=
```

## Deployment Configuration

### Dokploy Deployment
- Uses Nixpacks build system (see `nixpacks.toml`)
- Build script at `.nixpacks/build.sh` exports environment variables
- **Important**: Environment variables must be available during build for SSG
- Output: standalone mode for better deployment compatibility

### Build Considerations
- Next.js 16 uses Turbopack by default (faster builds)
- Image optimization disabled (`unoptimized: true`) for deployment constraints
- Console removal in production (except error/warn)
- Security headers and caching configured

## Development Workflow Best Practices

### TypeScript Safety
- **Always** import types from `@/lib/types` to avoid duplicate interface errors
- Run `npm run type-check:dev` during development
- Use `npm run pre-deploy` before committing
- Never define duplicate interfaces across files

### Database Service Usage
```typescript
// Correct: Use the post-migration service
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';

// Server components (pages): Direct database access
const properties = await postMigrationDatabaseService.getProperties();

// Client components: API calls with fallbacks
useEffect(() => {
  postMigrationDatabaseService.getProperties().then(setProperties);
}, []);
```

### API Route Patterns
- Follow the standardized response format in `src/lib/api-utils.ts`
- Use rate limiting for all endpoints
- Admin endpoints require authentication
- Return consistent error structures

## Troubleshooting Common Issues

### Database Connection
- Check `/api/health/database` endpoint
- Verify environment variables are set during build
- Server-side rendering requires direct Supabase client access

### TypeScript Errors
- Run `npm run type-check:dev` for detailed analysis
- Import all types from `@/lib/types.ts`
- Clear node_modules and reinstall if persistent

### Build Failures
- Check environment variables are available during build
- Ensure all dependencies are installed
- Verify Turbopack compatibility (Next.js 16)

### Deployment Issues
- Properties page requires `force-dynamic` for database access
- Build-time environment variables needed for SSG
- Check Dokploy logs for deployment errors

## Security Considerations

- RLS policies on all Supabase tables
- Rate limiting on all API endpoints
- Input validation and sanitization
- Secure error messages that don't leak sensitive data
- CORS configuration for API routes