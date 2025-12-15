import { NextRequest, NextResponse } from 'next/server';

// POST /api/blog/sync - Sync localStorage posts to Supabase
export async function POST(request: NextRequest) {
  try {
    // Get posts from request body (sent from client)
    const { posts } = await request.json();

    if (!posts || !Array.isArray(posts)) {
      return NextResponse.json(
        { error: 'Invalid posts data' },
        { status: 400 }
      );
    }

    // Use the existing saveBlogPost API to save each post
    const results = [];

    for (const post of posts) {
      try {
        // Call the main blog API to save the post
        const saveResponse = await fetch(`${request.nextUrl.origin}/api/blog`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(post)
        });

        if (saveResponse.ok) {
          const savedPost = await saveResponse.json();
          results.push({ success: true, slug: post.slug, id: savedPost.id });
        } else {
          const error = await saveResponse.text();
          results.push({ success: false, slug: post.slug, error });
        }
      } catch (error) {
        results.push({
          success: false,
          slug: post.slug,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Sync completed',
      results,
      synced: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

  } catch (error) {
    console.error('Sync API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}