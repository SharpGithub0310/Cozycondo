import { NextResponse } from 'next/server';

// TypeScript interfaces for API responses
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp?: string;
    migrationId?: string;
  };
}

// Property interface based on existing localStorage structure
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  amenities: string[];
  images: string[];
  featured: boolean;
  active: boolean;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Settings interface
export interface SiteSetting {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  updatedAt?: string;
}

// Validation functions
export function validateProperty(data: any, isUpdate = false): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isUpdate) {
    if (!data.title || typeof data.title !== 'string') {
      errors.push('Title is required and must be a string');
    } else if (data.title.length > 200) {
      errors.push('Title must be 200 characters or less');
    }

    if (!data.description || typeof data.description !== 'string') {
      errors.push('Description is required and must be a string');
    }

    if (typeof data.price !== 'number' || data.price <= 0) {
      errors.push('Price must be a positive number');
    }

    if (!data.priceUnit || typeof data.priceUnit !== 'string') {
      errors.push('Price unit is required');
    }

    if (!data.location || typeof data.location !== 'string') {
      errors.push('Location is required');
    }
  } else {
    // For updates, only validate provided fields
    if (data.title !== undefined) {
      if (typeof data.title !== 'string' || data.title.length === 0) {
        errors.push('Title must be a non-empty string');
      } else if (data.title.length > 200) {
        errors.push('Title must be 200 characters or less');
      }
    }

    if (data.price !== undefined && (typeof data.price !== 'number' || data.price <= 0)) {
      errors.push('Price must be a positive number');
    }
  }

  if (data.bedrooms !== undefined && (typeof data.bedrooms !== 'number' || data.bedrooms < 0)) {
    errors.push('Bedrooms must be a non-negative number');
  }

  if (data.bathrooms !== undefined && (typeof data.bathrooms !== 'number' || data.bathrooms < 0)) {
    errors.push('Bathrooms must be a non-negative number');
  }

  if (data.area !== undefined && (typeof data.area !== 'number' || data.area <= 0)) {
    errors.push('Area must be a positive number');
  }

  if (data.amenities !== undefined && !Array.isArray(data.amenities)) {
    errors.push('Amenities must be an array');
  }

  if (data.images !== undefined && !Array.isArray(data.images)) {
    errors.push('Images must be an array');
  }

  if (data.featured !== undefined && typeof data.featured !== 'boolean') {
    errors.push('Featured must be a boolean');
  }

  if (data.active !== undefined && typeof data.active !== 'boolean') {
    errors.push('Active must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}

export function validateSetting(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.key || typeof data.key !== 'string') {
    errors.push('Key is required and must be a string');
  }

  if (data.value === undefined) {
    errors.push('Value is required');
  }

  if (!data.type || !['string', 'number', 'boolean', 'object', 'array'].includes(data.type)) {
    errors.push('Type must be one of: string, number, boolean, object, array');
  }

  return { valid: errors.length === 0, errors };
}

// Success response helper
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: APIResponse['meta']
): NextResponse {
  const response: APIResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && { meta: { ...meta, timestamp: new Date().toISOString() } })
  };

  return NextResponse.json(response);
}

// Error response helper
export function errorResponse(
  error: string,
  status: number = 400,
  details?: any
): NextResponse {
  const response: APIResponse = {
    success: false,
    error,
    ...(details && { details }),
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  return NextResponse.json(response, { status });
}

// Generic validation helper
export function validateData<T>(
  validator: (data: any) => { valid: boolean; errors: string[] },
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = validator(data);
    if (result.valid) {
      return { success: true, data: data as T };
    } else {
      return { success: false, error: `Validation failed: ${result.errors.join(', ')}` };
    }
  } catch (error) {
    return { success: false, error: 'Validation failed' };
  }
}

// Sanitize data for database insertion
export function sanitizeData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Remove undefined values and system fields
      if (value !== undefined && !['id', 'created_at', 'updated_at'].includes(key)) {
        sanitized[key] = sanitizeData(value);
      }
    }
    return sanitized;
  }

  // For strings, trim whitespace and remove potentially harmful content
  if (typeof data === 'string') {
    return data.trim();
  }

  return data;
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Parse query parameters for pagination and filtering
export function parseQueryParams(searchParams: URLSearchParams) {
  return {
    page: Math.max(1, parseInt(searchParams.get('page') || '1')),
    limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20'))),
    active: searchParams.get('active') === 'true' ? true :
            searchParams.get('active') === 'false' ? false : undefined,
    featured: searchParams.get('featured') === 'true' ? true :
              searchParams.get('featured') === 'false' ? false : undefined,
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') || 'created_at',
    order: (searchParams.get('order') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc'
  };
}

// Convert database row to API response format
export function formatProperty(row: any): Property {
  return {
    id: row.id?.toString() || row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    priceUnit: row.price_unit || row.priceUnit,
    location: row.location,
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    area: Number(row.area),
    areaUnit: row.area_unit || row.areaUnit,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    images: Array.isArray(row.images) ? row.images : [],
    featured: Boolean(row.featured),
    active: Boolean(row.active),
    slug: row.slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Convert API data to database format
export function formatForDatabase(property: Partial<Property>): any {
  const dbData: any = { ...property };

  // Convert camelCase to snake_case for database columns
  if (dbData.priceUnit) {
    dbData.price_unit = dbData.priceUnit;
    delete dbData.priceUnit;
  }

  if (dbData.areaUnit) {
    dbData.area_unit = dbData.areaUnit;
    delete dbData.areaUnit;
  }

  if (dbData.createdAt) {
    dbData.created_at = dbData.createdAt;
    delete dbData.createdAt;
  }

  if (dbData.updatedAt) {
    dbData.updated_at = dbData.updatedAt;
    delete dbData.updatedAt;
  }

  // Generate slug if title is provided but slug isn't
  if (dbData.title && !dbData.slug) {
    dbData.slug = generateSlug(dbData.title);
  }

  return sanitizeData(dbData);
}

// Handle database errors
export function handleDatabaseError(error: any): NextResponse {
  console.error('Database error:', error);

  if (error.code === 'PGRST116') {
    return errorResponse('Resource not found', 404);
  }

  if (error.code === '23505') {
    return errorResponse('Duplicate entry', 409);
  }

  if (error.code === '23503') {
    return errorResponse('Referenced record not found', 400);
  }

  return errorResponse(
    'Database operation failed',
    500,
    process.env.NODE_ENV === 'development' ? error.message : undefined
  );
}