import { NextResponse } from 'next/server';
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';

export async function GET() {
  try {
    console.log('Testing server-side property loading...');

    // This should use the server-side direct database access
    const properties = await postMigrationDatabaseService.getProperties();

    console.log('Properties loaded:', Object.keys(properties).length);

    return NextResponse.json({
      status: 'success',
      message: 'Server-side property test',
      propertiesCount: Object.keys(properties).length,
      propertyNames: Object.values(properties).map((p: any) => p.name),
      firstProperty: Object.values(properties)[0] || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Server-side test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}