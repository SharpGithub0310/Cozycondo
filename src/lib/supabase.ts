import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a dummy client if keys are not available (fallback to localStorage)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

// Admin client with service role (server-side only)
export const createAdminClient = () => {
  // Only works in server-side environment (API routes, server components)
  if (typeof window !== 'undefined') {
    console.warn('Admin client should not be used on client-side. Use API routes instead.');
    return null;
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase configuration:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey
    });
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey);
};

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};
