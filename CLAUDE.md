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
- Test database health: `curl "http://localhost:3000/api/health/database"`
- Debug endpoints available at `/api/debug/` for troubleshooting

## Architecture Overview

### Database Architecture
This project migrated from localStorage to Supabase with a sophisticated fallback system:

- **Primary**: Supabase PostgreSQL database with RLS policies
- **Fallback**: Production fallback service for offline/connection issues
- **Migration**: Complete localStorage-to-database migration system with validation

### Data Service Layer Architecture
Three-tier database service architecture:

1. **`postMigrationDatabaseService`** - Primary interface
   - Server-side: Direct Supabase client calls (faster, more reliable)
   - Client-side: API route calls via enhancedDatabaseService
   - Handles environment detection automatically

2. **`enhancedDatabaseService`** - Client-side API interface
   - HTTP requests to `/api/` endpoints
   - Caching and request deduplication
   - localStorage fallback for offline functionality

3. **`productionFallbackService`** - Fallback data
   - Hardcoded property data for emergencies
   - Used when database is unavailable

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
- `src/app/admin/` - Complete admin panel (properties, blog, calendar, settings)
- `src/app/api/` - REST API replacing localStorage functionality
- `src/lib/` - Core services and utilities
- `src/components/` - Reusable UI components

### Critical Files
- `src/lib/types.ts` - Centralized TypeScript interfaces (always import from here)
- `src/lib/post-migration-database-service.ts` - Main data access layer
- `API_ENDPOINTS.md` - Complete API documentation
- `TYPESCRIPT_DEVELOPMENT_GUIDE.md` - Type safety best practices

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