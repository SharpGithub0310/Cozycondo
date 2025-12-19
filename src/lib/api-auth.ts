import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client for server-side operations
export const createAdminClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client should not be used on client-side. Use API routes instead.');
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase configuration:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey
    });
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey);
};

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && serviceRoleKey);
};

// Authentication middleware for admin routes
export const authenticateAdmin = async (request: NextRequest): Promise<{
  isAuthenticated: boolean;
  error?: string;
  adminSession?: any;
}> => {
  try {
    // Check for admin session token in headers
    const authHeader = request.headers.get('authorization');
    const sessionToken = request.headers.get('x-admin-session');

    // For development/simple auth, check against admin password
    // In production, implement proper JWT or session validation
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'cozy2024';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      // Simple password-based auth for now
      // In production, validate JWT or session token
      if (token === validPassword) {
        return {
          isAuthenticated: true,
          adminSession: { id: 'admin', role: 'admin' }
        };
      }
    }

    // Alternative: check session token header
    if (sessionToken === 'authenticated') {
      return {
        isAuthenticated: true,
        adminSession: { id: 'admin', role: 'admin' }
      };
    }

    return {
      isAuthenticated: false,
      error: 'Authentication required'
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      isAuthenticated: false,
      error: 'Authentication failed'
    };
  }
};

// Utility to create authenticated response
export const requireAuth = async (
  request: NextRequest,
  handler: (request: NextRequest, adminSession: any) => Promise<NextResponse>
): Promise<NextResponse> => {
  const auth = await authenticateAdmin(request);

  if (!auth.isAuthenticated) {
    return NextResponse.json(
      {
        error: auth.error || 'Unauthorized',
        message: 'Admin authentication required'
      },
      { status: 401 }
    );
  }

  return handler(request, auth.adminSession);
};

// Rate limiting utility (simple in-memory store for demo)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (
  request: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetTime: number } => {
  const clientId = request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown';

  const now = Date.now();
  const windowStart = now - windowMs;

  const existing = rateLimitStore.get(clientId);

  if (!existing || existing.resetTime < windowStart) {
    // Reset window
    const resetTime = now + windowMs;
    rateLimitStore.set(clientId, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (existing.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: existing.resetTime };
  }

  existing.count++;
  rateLimitStore.set(clientId, existing);

  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetTime: existing.resetTime
  };
};

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes