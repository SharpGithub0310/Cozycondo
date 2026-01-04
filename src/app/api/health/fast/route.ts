import { NextResponse } from 'next/server';

// Ultra-minimal health check endpoint
// Responds immediately without any processing, database calls, or heavy computation
export async function GET() {
  return new NextResponse(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    type: 'fast'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Type': 'fast'
    }
  });
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Type': 'fast'
    }
  });
}