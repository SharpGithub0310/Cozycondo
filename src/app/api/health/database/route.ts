import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/api-auth';

export async function GET() {
  try {
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!hasUrl || !hasKey) {
      return NextResponse.json({
        status: 'error',
        database: 'not configured',
        message: 'Missing environment variables',
        config: {
          NEXT_PUBLIC_SUPABASE_URL: hasUrl ? 'set' : 'missing',
          SUPABASE_SERVICE_ROLE_KEY: hasKey ? 'set' : 'missing'
        }
      }, { status: 503 });
    }

    const adminClient = createAdminClient();

    if (!adminClient) {
      return NextResponse.json({
        status: 'error',
        database: 'connection failed',
        message: 'Could not create database client',
        config: {
          NEXT_PUBLIC_SUPABASE_URL: hasUrl ? 'set' : 'missing',
          SUPABASE_SERVICE_ROLE_KEY: hasKey ? 'set' : 'missing'
        }
      }, { status: 503 });
    }

    // Try to query properties to test the connection
    const { data, error } = await adminClient
      .from('properties')
      .select('count', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({
        status: 'error',
        database: 'query failed',
        message: error.message,
        config: {
          NEXT_PUBLIC_SUPABASE_URL: 'set',
          SUPABASE_SERVICE_ROLE_KEY: 'set'
        }
      }, { status: 503 });
    }

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      propertyCount: data,
      config: {
        NEXT_PUBLIC_SUPABASE_URL: 'set',
        SUPABASE_SERVICE_ROLE_KEY: 'set'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'exception',
      message: error instanceof Error ? error.message : 'Unknown error',
      config: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing'
      }
    }, { status: 500 });
  }
}