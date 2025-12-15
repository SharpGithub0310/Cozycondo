import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// GET /api/blog/test-slug/[slug] - Test what happens when we try to get a blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const result: any = {
      slug,
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceRoleKey: !!serviceRoleKey,
        nodeEnv: process.env.NODE_ENV
      },
      tests: {}
    };

    // Test 1: Check if we can create admin client
    try {
      const adminClient = createClient(supabaseUrl!, serviceRoleKey!);
      result.tests.adminClient = { success: true, message: 'Admin client created' };

      // Test 2: Try to query Supabase
      try {
        const { data, error } = await adminClient
          .from('blog_posts')
          .select('id, title, slug, published')
          .eq('slug', slug)
          .single();

        if (error) {
          result.tests.supabaseQuery = {
            success: false,
            error: error.message,
            code: error.code
          };
        } else {
          result.tests.supabaseQuery = {
            success: true,
            found: !!data,
            data: data
          };
        }
      } catch (queryError) {
        result.tests.supabaseQuery = {
          success: false,
          error: queryError instanceof Error ? queryError.message : 'Unknown query error'
        };
      }

      // Test 3: Try to get all posts to see if there are any
      try {
        const { data: allData, error: allError } = await adminClient
          .from('blog_posts')
          .select('id, title, slug, published')
          .limit(10);

        if (allError) {
          result.tests.allPosts = {
            success: false,
            error: allError.message
          };
        } else {
          result.tests.allPosts = {
            success: true,
            count: allData?.length || 0,
            slugs: allData?.map(p => p.slug) || []
          };
        }
      } catch (allError) {
        result.tests.allPosts = {
          success: false,
          error: allError instanceof Error ? allError.message : 'Unknown error'
        };
      }

    } catch (clientError) {
      result.tests.adminClient = {
        success: false,
        error: clientError instanceof Error ? clientError.message : 'Unknown client error'
      };
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}