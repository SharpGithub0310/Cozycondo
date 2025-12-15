import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request: NextRequest) {
  try {
    const response: any = {
      supabase: {
        configured: !!(supabaseUrl && serviceRoleKey),
        posts: []
      }
    };

    // Get all posts from Supabase
    if (supabaseUrl && serviceRoleKey) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey);

      const { data, error } = await adminClient
        .from('blog_posts')
        .select('id, title, slug, published, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        response.supabase.posts = data;
      } else if (error) {
        response.supabase.error = error.message;
      }
    }

    // Check for specific slug
    const searchParams = request.nextUrl.searchParams;
    const checkSlug = searchParams.get('slug');

    if (checkSlug && supabaseUrl && serviceRoleKey) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey);

      const { data, error } = await adminClient
        .from('blog_posts')
        .select('*')
        .eq('slug', checkSlug)
        .single();

      response.slugCheck = {
        slug: checkSlug,
        found: !!data,
        data: data,
        error: error?.message
      };
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}