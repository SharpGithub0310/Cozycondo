import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const response: any = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isSupabaseConfigured: isSupabaseConfigured(),
    },
    supabase: {
      configured: !!(supabaseUrl && serviceRoleKey),
      posts: [],
      connectionTest: null,
      queryTimes: {},
    },
    performance: {
      startTime,
      totalTime: 0,
    },
    errors: [],
    logs: [],
  };

  const addLog = (message: string, data?: any) => {
    const log = {
      timestamp: new Date().toISOString(),
      message,
      data,
    };
    response.logs.push(log);
    console.log(`[DEBUG API] ${message}`, data || '');
  };

  try {
    addLog('Starting comprehensive blog debugging...');

    // Test Supabase connection and get posts
    if (supabaseUrl && serviceRoleKey) {
      addLog('Testing Supabase connection...');

      try {
        const adminClient = createClient(supabaseUrl, serviceRoleKey);
        const queryStart = Date.now();

        // Test basic connection with a simple query
        const { data: testData, error: testError } = await adminClient
          .from('blog_posts')
          .select('count(*)')
          .single();

        response.performance.connectionTestTime = Date.now() - queryStart;

        if (testError) {
          addLog('Supabase connection test failed', { error: testError.message, code: testError.code });
          response.supabase.connectionTest = 'failed';
          response.supabase.connectionError = testError.message;
          response.errors.push(`Connection test failed: ${testError.message}`);
        } else {
          addLog('Supabase connection test successful');
          response.supabase.connectionTest = 'success';
        }

        // Get all posts
        const postsQueryStart = Date.now();
        const { data, error } = await adminClient
          .from('blog_posts')
          .select('id, title, slug, published, created_at, featured_image')
          .order('created_at', { ascending: false });

        response.performance.postsQueryTime = Date.now() - postsQueryStart;

        if (!error && data) {
          response.supabase.posts = data.map(post => ({
            ...post,
            hasImage: !!post.featured_image,
            imageSize: post.featured_image ? post.featured_image.length : 0,
          }));
          addLog(`Found ${data.length} posts in Supabase`);
        } else if (error) {
          response.supabase.error = error.message;
          response.errors.push(`Posts query failed: ${error.message}`);
          addLog('Failed to fetch posts from Supabase', { error: error.message });
        }

      } catch (supabaseError: any) {
        addLog('Supabase connection error', { error: supabaseError.message });
        response.supabase.connectionTest = 'error';
        response.supabase.connectionError = supabaseError.message;
        response.errors.push(`Supabase error: ${supabaseError.message}`);
      }
    } else {
      addLog('Supabase not configured - missing environment variables');
      response.errors.push('Supabase not configured');
    }

    // Check for specific slug
    const searchParams = request.nextUrl.searchParams;
    const checkSlug = searchParams.get('slug');

    if (checkSlug) {
      addLog(`Testing specific slug: ${checkSlug}`);

      // Test 1: Direct Supabase query for the slug
      if (supabaseUrl && serviceRoleKey) {
        try {
          const adminClient = createClient(supabaseUrl, serviceRoleKey);
          const slugQueryStart = Date.now();

          const { data, error } = await adminClient
            .from('blog_posts')
            .select('*')
            .eq('slug', checkSlug)
            .single();

          response.performance.slugQueryTime = Date.now() - slugQueryStart;

          response.slugCheck = {
            slug: checkSlug,
            found: !!data,
            data: data ? {
              id: data.id,
              title: data.title,
              published: data.published,
              hasImage: !!data.featured_image,
              imageSize: data.featured_image ? data.featured_image.length : 0,
              contentLength: data.content ? data.content.length : 0,
            } : null,
            error: error?.message
          };

          if (data) {
            addLog(`Slug found in Supabase`, { title: data.title, published: data.published });
          } else {
            addLog(`Slug not found in Supabase`, { error: error?.message });
          }

        } catch (slugError: any) {
          addLog(`Slug query error`, { error: slugError.message });
          response.slugCheck = {
            slug: checkSlug,
            found: false,
            error: slugError.message
          };
        }
      }

      // Test 2: Test the blogStorageHybrid function
      try {
        addLog('Testing getBlogPostBySlug function...');
        const functionTestStart = Date.now();

        const { getBlogPostBySlug } = await import('@/utils/blogStorageHybrid');
        const result = await getBlogPostBySlug(checkSlug);

        response.performance.functionTestTime = Date.now() - functionTestStart;

        response.functionTest = {
          success: true,
          found: !!result,
          data: result ? {
            id: result.id,
            title: result.title,
            published: result.published,
            hasImage: !!result.featured_image,
          } : null
        };

        if (result) {
          addLog('Function test: Post found', { title: result.title });
        } else {
          addLog('Function test: Post not found');
        }

      } catch (functionError: any) {
        addLog('Function test failed', { error: functionError.message });
        response.functionTest = {
          success: false,
          error: functionError.message,
          stack: functionError.stack
        };
        response.errors.push(`Function test failed: ${functionError.message}`);
      }

      // Test 3: Test blog page access
      try {
        addLog('Testing blog page access...');
        const pageTestStart = Date.now();

        const pageResponse = await fetch(`${request.nextUrl.origin}/blog/${checkSlug}`, {
          method: 'HEAD', // Use HEAD to avoid loading full content
          headers: {
            'User-Agent': 'Debug-API-Test'
          }
        });

        response.performance.pageTestTime = Date.now() - pageTestStart;

        response.pageTest = {
          status: pageResponse.status,
          ok: pageResponse.ok,
          statusText: pageResponse.statusText,
          headers: {
            contentType: pageResponse.headers.get('content-type'),
            cacheControl: pageResponse.headers.get('cache-control'),
          }
        };

        addLog(`Page test: ${pageResponse.status} ${pageResponse.statusText}`);

      } catch (pageError: any) {
        addLog('Page test failed', { error: pageError.message });
        response.pageTest = {
          error: pageError.message
        };
        response.errors.push(`Page test failed: ${pageError.message}`);
      }
    }

    response.performance.totalTime = Date.now() - startTime;
    addLog(`Debugging completed in ${response.performance.totalTime}ms`);

    // Add summary
    response.summary = {
      supabaseWorking: response.supabase.connectionTest === 'success',
      postsInSupabase: response.supabase.posts?.length || 0,
      slugFound: response.slugCheck?.found || false,
      functionWorking: response.functionTest?.success || false,
      pageAccessible: response.pageTest?.ok || false,
      totalErrors: response.errors.length,
      recommendation: response.errors.length > 0
        ? 'Check errors array for specific issues'
        : response.slugCheck?.found
          ? 'Everything appears to be working correctly'
          : 'Post not found in database - may be localStorage only'
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    addLog('Critical error in debug API', { error: error.message, stack: error.stack });
    response.performance.totalTime = Date.now() - startTime;
    response.errors.push(`Critical error: ${error.message}`);

    console.error('Debug API Critical Error:', error);
    return NextResponse.json(
      {
        ...response,
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}