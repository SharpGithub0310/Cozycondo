import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// GET /api/blog/troubleshoot/[slug] - Complete troubleshooting for a specific blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const report: any = {
      slug,
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceRoleKey: !!serviceRoleKey,
        nodeEnv: process.env.NODE_ENV
      },
      checks: {}
    };

    // Check 1: Try to query Supabase directly
    if (supabaseUrl && serviceRoleKey) {
      try {
        const adminClient = createClient(supabaseUrl, serviceRoleKey);

        // First, get all blog posts to see what exists
        const { data: allPosts, error: allError } = await adminClient
          .from('blog_posts')
          .select('id, title, slug, published, created_at')
          .order('created_at', { ascending: false })
          .limit(20);

        report.checks.allSupabasePosts = {
          success: !allError,
          error: allError?.message,
          count: allPosts?.length || 0,
          posts: allPosts?.map(p => ({
            slug: p.slug,
            title: p.title,
            published: p.published,
            created_at: p.created_at
          })) || []
        };

        // Check if our specific slug exists
        const { data: specificPost, error: specificError } = await adminClient
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .single();

        report.checks.specificPost = {
          found: !!specificPost,
          error: specificError?.message,
          code: specificError?.code,
          data: specificPost ? {
            id: specificPost.id,
            title: specificPost.title,
            slug: specificPost.slug,
            published: specificPost.published,
            hasImage: !!specificPost.featured_image,
            imageSize: specificPost.featured_image?.length || 0,
            contentLength: specificPost.content?.length || 0
          } : null
        };

      } catch (error) {
        report.checks.supabaseConnection = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      report.checks.supabaseConnection = {
        success: false,
        error: 'Missing environment variables'
      };
    }

    // Check 2: Try the getBlogPostBySlug function
    try {
      // Import and test our function
      const { getBlogPostBySlug } = await import('@/utils/blogStorageSupabase');
      const functionResult = await getBlogPostBySlug(slug);

      report.checks.getBlogPostBySlugFunction = {
        success: !!functionResult,
        found: !!functionResult,
        data: functionResult ? {
          id: functionResult.id,
          title: functionResult.title,
          slug: functionResult.slug,
          published: functionResult.published
        } : null
      };
    } catch (error) {
      report.checks.getBlogPostBySlugFunction = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Check 3: Try the blog slug API route
    try {
      const apiResponse = await fetch(`${request.nextUrl.origin}/api/blog/slug/${slug}`);
      const apiData = apiResponse.ok ? await apiResponse.json() : null;

      report.checks.blogSlugApi = {
        status: apiResponse.status,
        success: apiResponse.ok,
        data: apiData ? {
          id: apiData.id,
          title: apiData.title,
          slug: apiData.slug,
          published: apiData.published
        } : null,
        error: !apiResponse.ok ? `HTTP ${apiResponse.status}` : null
      };
    } catch (error) {
      report.checks.blogSlugApi = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Check 4: Check published posts function
    try {
      const { getPublishedBlogPosts } = await import('@/utils/blogStorageSupabase');
      const publishedPosts = await getPublishedBlogPosts();

      const foundInPublished = publishedPosts.find(p => p.slug === slug);

      report.checks.getPublishedBlogPosts = {
        success: true,
        totalCount: publishedPosts.length,
        foundTargetPost: !!foundInPublished,
        targetPost: foundInPublished ? {
          id: foundInPublished.id,
          title: foundInPublished.title,
          slug: foundInPublished.slug,
          published: foundInPublished.published
        } : null,
        allSlugs: publishedPosts.map(p => p.slug)
      };
    } catch (error) {
      report.checks.getPublishedBlogPosts = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Summary
    report.summary = {
      postExistsInSupabase: report.checks.specificPost?.found || false,
      functionCanFindPost: report.checks.getBlogPostBySlugFunction?.found || false,
      apiCanFindPost: report.checks.blogSlugApi?.success || false,
      postIsPublished: report.checks.specificPost?.data?.published || false,
      recommendations: []
    };

    if (!report.summary.postExistsInSupabase) {
      report.summary.recommendations.push("Post not found in Supabase - check if sync is working");
    }
    if (!report.summary.functionCanFindPost) {
      report.summary.recommendations.push("getBlogPostBySlug function cannot find the post");
    }
    if (!report.summary.postIsPublished) {
      report.summary.recommendations.push("Post may not be published - check publication status");
    }

    return NextResponse.json(report, { status: 200 });

  } catch (error) {
    console.error('Troubleshoot API Error:', error);
    return NextResponse.json(
      {
        error: 'Troubleshooting failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}