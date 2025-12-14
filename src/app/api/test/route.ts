import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    deploy_version: '2025-12-14-v2', // Force cache bust
    env_check: {
      has_supabase_url: !!supabaseUrl,
      has_service_key: !!serviceRoleKey,
      supabase_url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT_SET',
    },
    message: 'Test endpoint to verify deployment and environment variables - Cache bust version'
  });
}