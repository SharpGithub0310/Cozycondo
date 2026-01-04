import { NextResponse } from 'next/server';

// Ultra-minimal ping endpoint for health checking
// Responds immediately without any processing, database calls, or heavy computation
export async function GET() {
  return new NextResponse('pong', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Type': 'ping'
    }
  });
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Type': 'ping'
    }
  });
}