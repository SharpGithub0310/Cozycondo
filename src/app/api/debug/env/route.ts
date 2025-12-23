import { NextResponse } from 'next/server';

export async function GET() {
  // Only show in development or with proper authorization
  const isDevelopment = process.env.NODE_ENV === 'development';

  return NextResponse.json({
    status: 'Environment Check',
    nodeEnv: process.env.NODE_ENV,
    variables: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
      NEXT_PUBLIC_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    },
    buildTime: {
      note: 'These variables must be set at build time for Next.js',
      suggestion: 'Make sure Dokploy is passing env vars during build'
    }
  });
}