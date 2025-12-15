import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// GET /api/blog/[id] - Get a single blog post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params (required in Next.js 15+)
    const { id } = await params;

    // Check environment variables
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Create admin client for server-side operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Fetch the blog post by ID
    const { data, error } = await adminClient
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return NextResponse.json(
          { error: 'Blog post not found' },
          { status: 404 }
        );
      }
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blog post' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/blog/[id] - Update a blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params (required in Next.js 15+)
    const { id: paramId } = await params;

    // Check environment variables
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Parse request body
    const blogPost = await request.json();

    // Remove read-only fields
    const { id, created_at, ...updateData } = blogPost;

    // Create admin client for server-side operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Update the blog post
    const { data, error } = await adminClient
      .from('blog_posts')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', paramId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update blog post' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/[id] - Delete a blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params (required in Next.js 15+)
    const { id } = await params;

    // Check environment variables
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    // Create admin client for server-side operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Delete the blog post
    const { error } = await adminClient
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to delete blog post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}