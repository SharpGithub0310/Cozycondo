# Cozy Condo API Endpoints

This document describes the comprehensive API endpoints created for the Cozy Condo website to replace localStorage with Supabase database storage.

## Authentication

All admin-only endpoints require authentication. Include one of these headers:

```
Authorization: Bearer <admin-password>
# OR
x-admin-session: authenticated
```

## Properties API

### GET /api/properties
Get all properties with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `active` (boolean): Filter by active status
- `featured` (boolean): Filter by featured status
- `search` (string): Search in title, description, location
- `sort` (string): Sort field (created_at, updated_at, name, price_per_night, bedrooms, bathrooms, display_order)
- `order` (string): Sort order (asc, desc)
- `format` (string): Response format (object, array)

**Example:**
```bash
curl "https://your-domain.com/api/properties?featured=true&format=array"
```

### POST /api/properties (Admin Only)
Create or update a property.

**Body:**
```json
{
  "id": "property-slug",
  "name": "Property Name",
  "type": "apartment",
  "bedrooms": 2,
  "bathrooms": 1,
  "maxGuests": 4,
  "size": "45",
  "description": "Property description",
  "location": "Iloilo City",
  "pricePerNight": "2500",
  "airbnbUrl": "https://airbnb.com/...",
  "featured": false,
  "active": true,
  "amenities": ["WiFi", "Air-conditioning"],
  "photos": ["image1.jpg", "image2.jpg"],
  "featuredPhotoIndex": 0
}
```

### GET /api/properties/[id]
Get specific property by ID/slug.

### PUT /api/properties/[id] (Admin Only)
Update specific property.

### DELETE /api/properties/[id] (Admin Only)
Delete specific property.

### PATCH /api/properties/[id]/status (Admin Only)
Update property status (featured/active).

**Body:**
```json
{
  "featured": true,
  "active": true
}
```

### GET /api/properties/[id]/status
Get property status (public endpoint).

## Settings API

### GET /api/settings
Get all website settings.

**Query Parameters:**
- `category` (string): Filter by category (hero, images, stats, contact, social, sections, general)
- `format` (string): Response format (camelCase, raw)

**Example:**
```bash
curl "https://your-domain.com/api/settings?category=hero"
```

### POST /api/settings (Admin Only)
Update website settings (bulk or single).

**Bulk Update:**
```json
{
  "heroTitle": "Your Cozy Escape in Iloilo City",
  "heroDescription": "Experience comfort...",
  "logo": "logo.png",
  "statsUnits": "9+"
}
```

**Single Update:**
```json
{
  "key": "hero_title",
  "value": "New Hero Title",
  "type": "text",
  "description": "Main hero section title",
  "category": "hero"
}
```

### GET /api/settings/[key]
Get specific setting by key.

### PUT /api/settings/[key] (Admin Only)
Update specific setting.

**Body:**
```json
{
  "value": "New Value",
  "type": "text",
  "description": "Setting description",
  "category": "general"
}
```

### DELETE /api/settings/[key] (Admin Only)
Delete specific setting.

## Migration API

### GET /api/migrate/from-localstorage (Admin Only)
Get migration instructions and current database state.

### POST /api/migrate/from-localstorage (Admin Only)
Migrate data from localStorage to database.

**Body:**
```json
{
  "properties": {
    "property-slug": {
      "name": "Property Name",
      "type": "apartment",
      "bedrooms": 2,
      "bathrooms": 1,
      "maxGuests": 4,
      "size": "45",
      "description": "Property description",
      "location": "Iloilo City",
      "pricePerNight": "2500",
      "airbnbUrl": "https://airbnb.com/...",
      "featured": false,
      "active": true,
      "amenities": ["WiFi", "Air-conditioning"],
      "photos": ["image1.jpg", "image2.jpg"],
      "featuredPhotoIndex": 0
    }
  },
  "settings": {
    "heroTitle": "Your Cozy Escape in Iloilo City",
    "heroDescription": "Experience comfort...",
    "logo": "logo.png"
  }
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (development only)",
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Success Responses

All endpoints return standardized success responses:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

## Rate Limits

- **Public endpoints:** 100 requests per 15 minutes
- **Admin endpoints:** 20-50 requests per 15 minutes
- **Migration endpoints:** 5 requests per 15 minutes

## Security Features

1. **Authentication:** All admin endpoints require valid authentication
2. **Rate Limiting:** Prevents abuse and DoS attacks
3. **Input Validation:** All input data is validated and sanitized
4. **Error Handling:** Secure error messages that don't leak sensitive information
5. **SQL Injection Protection:** Uses Supabase parameterized queries
6. **CORS:** Configurable CORS policies

## Testing Examples

### Test Properties API
```bash
# Get all properties
curl "https://your-domain.com/api/properties"

# Get featured properties
curl "https://your-domain.com/api/properties?featured=true&format=array"

# Create property (admin)
curl -X POST "https://your-domain.com/api/properties" \
  -H "Authorization: Bearer your-admin-password" \
  -H "Content-Type: application/json" \
  -d '{"id":"test-property","name":"Test Property","bedrooms":1}'
```

### Test Settings API
```bash
# Get all settings
curl "https://your-domain.com/api/settings"

# Update settings (admin)
curl -X POST "https://your-domain.com/api/settings" \
  -H "Authorization: Bearer your-admin-password" \
  -H "Content-Type: application/json" \
  -d '{"heroTitle":"New Title"}'
```

### Test Migration API
```bash
# Get migration instructions (admin)
curl "https://your-domain.com/api/migrate/from-localstorage" \
  -H "Authorization: Bearer your-admin-password"

# Migrate data (admin)
curl -X POST "https://your-domain.com/api/migrate/from-localstorage" \
  -H "Authorization: Bearer your-admin-password" \
  -H "Content-Type: application/json" \
  -d '{"properties":{},"settings":{}}'
```

## Database Schema Compatibility

The API endpoints are fully compatible with the existing Supabase database schema:
- `properties` table with `property_photos` relationship
- `website_settings` table for flexible key-value settings
- `blog_posts` table for blog content management
- RLS policies for security
- Database functions for complex operations

## Integration Notes

1. **Backward Compatibility:** All endpoints maintain backward compatibility with existing localStorage structure
2. **Gradual Migration:** Can be used alongside localStorage during transition
3. **Sync Support:** Enables data synchronization between desktop and mobile
4. **Admin Authentication:** Uses existing admin authentication from localStorage
5. **Error Fallbacks:** Gracefully handles database unavailability

This API replaces localStorage with a robust, scalable database solution while maintaining all existing functionality.