import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        error: 'Missing Supabase configuration',
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey
      }, { status: 500 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Test simple insert without tags
    const { data, error } = await adminClient
      .from('blog_posts')
      .insert([{
        title: 'Test API Connection',
        slug: 'test-api-connection',
        excerpt: 'Testing API connection',
        content: 'This is a test post.',
        author: 'API Test',
        category: 'test',
        published: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        error: 'Database error',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    // Clean up test post
    await adminClient
      .from('blog_posts')
      .delete()
      .eq('slug', 'test-api-connection');

    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      testId: data.id
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      error: 'API Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}