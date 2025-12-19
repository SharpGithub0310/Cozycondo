# localStorage to Supabase Migration Guide

## Overview

This migration system transitions the Cozy Condo website from localStorage-based data storage to a full Supabase database integration. The system maintains backward compatibility and provides seamless fallbacks for offline functionality.

## What Was Created

### 1. Enhanced Database Schema
- **File**: `/mnt/m/AI/cozy-condo/supabase/migrations/002_enhance_properties_for_localstorage_migration.sql`
- **Purpose**: Extends the existing Supabase schema to fully support localStorage data structures
- **Key Features**:
  - Enhanced `properties` table with all PropertyData interface fields
  - Flexible `website_settings` table supporting key-value configuration
  - `calendar_blocks` table for property availability management
  - Helper functions for data migration and upserts
  - Proper indexes and Row Level Security (RLS) policies

### 2. Database Service Layer
- **File**: `/mnt/m/AI/cozy-condo/src/lib/enhanced-database-service.ts`
- **Purpose**: Client-side service that handles API calls with localStorage fallbacks
- **Key Features**:
  - API-based data operations
  - Automatic fallback to localStorage when offline
  - Migration utilities
  - Data validation and synchronization

### 3. API Endpoints
- **Files**:
  - `/mnt/m/AI/cozy-condo/src/app/api/properties/route.ts`
  - `/mnt/m/AI/cozy-condo/src/app/api/settings/route.ts`
  - `/mnt/m/AI/cozy-condo/src/app/api/calendar/route.ts`
  - `/mnt/m/AI/cozy-condo/src/app/api/migrate/route.ts`
- **Purpose**: Server-side API endpoints for database operations
- **Key Features**:
  - CRUD operations for all data types
  - Migration endpoints
  - Data validation endpoints
  - Proper error handling and status codes

### 4. Migration Admin Interface
- **File**: `/mnt/m/AI/cozy-condo/src/app/admin/migration/page.tsx`
- **Purpose**: Web interface for managing data migration and synchronization
- **Key Features**:
  - Data summary and comparison
  - One-click migration tools
  - Validation utilities
  - Sync status monitoring

## Migration Process

### Phase 1: Database Setup
1. Run the migration SQL file in your Supabase dashboard:
   ```sql
   -- Run the contents of 002_enhance_properties_for_localstorage_migration.sql
   ```

2. Verify the following tables exist:
   - `properties` (enhanced with new columns)
   - `website_settings` (key-value pairs)
   - `calendar_blocks` (property availability)

### Phase 2: Data Migration
1. Access the migration interface: `/admin/migration`
2. Review the data summary to understand current state
3. Run validation to check for data inconsistencies
4. Execute migration from localStorage to database

### Phase 3: Component Updates (Recommended)
Update components to use the enhanced database service instead of direct localStorage calls:

```typescript
// Before
import { getStoredProperties } from '@/utils/propertyStorage';

// After
import { getProperties } from '@/lib/enhanced-database-service';

// Usage
const properties = await getProperties(); // Auto-fallback to localStorage
```

## Data Structure Mapping

### Properties
```typescript
// localStorage PropertyData → Database properties table
{
  id: string              → slug (VARCHAR)
  name: string           → name (VARCHAR)
  type: string           → type (VARCHAR)
  bedrooms: number       → bedrooms (INTEGER)
  bathrooms: number      → bathrooms (INTEGER)
  maxGuests: number      → max_guests (INTEGER)
  size: string          → size_sqm (VARCHAR)
  description: string    → description (TEXT)
  location: string       → location (VARCHAR)
  pricePerNight: string → price_per_night (VARCHAR)
  airbnbUrl: string     → airbnb_url (TEXT)
  icalUrl: string       → ical_url (TEXT)
  featured: boolean      → featured (BOOLEAN)
  active: boolean        → active (BOOLEAN)
  amenities: string[]    → amenities (TEXT[])
  photos: string[]       → property_photos table
  featuredPhotoIndex: number → featured_photo_index (INTEGER)
}
```

### Settings
```typescript
// localStorage WebsiteSettings → Database website_settings table
{
  logo: string              → setting_key: 'logo'
  heroTitle: string         → setting_key: 'hero_title'
  statsUnits: string        → setting_key: 'stats_units'
  // etc. (camelCase → snake_case conversion)
}
```

### Calendar
```typescript
// localStorage CalendarBlock → Database calendar_blocks table
{
  id: string              → id (VARCHAR)
  propertyId: string      → property_id (VARCHAR)
  startDate: string       → start_date (DATE)
  endDate: string         → end_date (DATE)
  reason: string          → reason (TEXT)
  source: 'manual'|'airbnb' → source (VARCHAR)
}
```

## API Endpoints

### Properties
- `GET /api/properties` - Fetch all properties
- `POST /api/properties` - Create/update property
- `PUT /api/properties` - Update property status

### Settings
- `GET /api/settings` - Fetch website settings
- `POST /api/settings` - Update settings

### Calendar
- `GET /api/calendar` - Fetch calendar blocks
- `POST /api/calendar` - Replace all calendar blocks
- `PUT /api/calendar` - Add/remove/update blocks

### Migration
- `POST /api/migrate` - Migration and validation operations

## Service API

### Enhanced Database Service
```typescript
import { enhancedDatabaseService } from '@/lib/enhanced-database-service';

// Basic operations (with localStorage fallback)
const properties = await enhancedDatabaseService.getProperties();
await enhancedDatabaseService.saveProperty(id, propertyData);

// Settings
const settings = await enhancedDatabaseService.getWebsiteSettings();
await enhancedDatabaseService.saveWebsiteSettings(updates);

// Migration utilities
const result = await enhancedDatabaseService.migrateFromLocalStorage();
const validation = await enhancedDatabaseService.validateDataSync();
```

## Key Benefits

### 1. Data Consistency
- Properties and settings sync between desktop and mobile views
- Admin changes are immediately available across all devices
- Real-time updates without localStorage limitations

### 2. Reliability
- Proper data persistence beyond browser storage limits
- Backup and recovery capabilities through Supabase
- Row Level Security (RLS) for data protection

### 3. Scalability
- Support for multiple admin users
- Audit trails and change tracking
- Performance optimizations with database indexing

### 4. Backward Compatibility
- Automatic fallback to localStorage when offline
- Gradual migration without breaking existing functionality
- No immediate changes required to existing components

## Troubleshooting

### Migration Issues
1. **Database Connection Errors**:
   - Verify Supabase environment variables are set
   - Check service role key permissions
   - Ensure Supabase project is active

2. **Data Validation Failures**:
   - Use the validation tool in `/admin/migration`
   - Check for data type mismatches
   - Verify required fields are not empty

3. **API Endpoint Errors**:
   - Check browser network tab for error details
   - Verify API routes are accessible
   - Check server logs for detailed error messages

### Performance Considerations
- Database queries are optimized with indexes
- API responses include pagination for large datasets
- Client-side caching minimizes redundant requests

## Security Features

### Row Level Security (RLS)
- Public read access to active content
- Service role full access for admin operations
- Secure API endpoints with proper validation

### Data Validation
- Input sanitization on all API endpoints
- Type checking and constraint validation
- Error handling prevents data corruption

## Next Steps

### Immediate Actions
1. Run the database migration SQL
2. Test the migration interface
3. Validate data consistency
4. Monitor for any issues

### Future Enhancements
1. Real-time subscriptions for live updates
2. Batch operations for bulk changes
3. Advanced caching strategies
4. Automated backup schedules

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Use the validation tools in the migration interface
3. Review the API endpoint responses
4. Check Supabase dashboard for database issues

The migration system is designed to be robust and user-friendly, with comprehensive fallbacks and error handling to ensure a smooth transition.