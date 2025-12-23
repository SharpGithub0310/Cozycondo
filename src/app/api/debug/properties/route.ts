import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/api-auth';

export async function GET() {
  try {
    const adminClient = createAdminClient();

    if (!adminClient) {
      return NextResponse.json({
        status: 'error',
        message: 'Could not create database client'
      }, { status: 503 });
    }

    // Get all properties from database
    const { data: properties, error } = await adminClient
      .from('properties')
      .select('*')
      .limit(10);

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database query failed',
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: 500 });
    }

    // Get table schema info
    const { data: tableInfo, error: schemaError } = await adminClient
      .from('properties')
      .select('*')
      .limit(1);

    return NextResponse.json({
      status: 'success',
      propertiesCount: properties?.length || 0,
      properties: properties || [],
      sampleProperty: properties?.[0] || null,
      schemaCheck: schemaError ? { error: schemaError.message } : 'ok',
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Exception occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}