import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are available
if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!serviceRoleKey
  });
}

const adminClient = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!adminClient) {
      return NextResponse.json({
        error: 'Supabase not configured. Please add environment variables.'
      }, { status: 500 });
    }

    const blogPost = await request.json();

    // Remove id, created_at, updated_at, tags - let Supabase handle these
    const { id, created_at, updated_at, tags, ...insertData } = blogPost;

    const { data, error } = await adminClient
      .from('blog_posts')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;

    // Convert UUID to string for compatibility
    const result = {
      ...data,
      id: data.id.toString(),
      tags: tags || [],
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to save blog post' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!adminClient) {
      return NextResponse.json({
        error: 'Supabase not configured. Please add environment variables.'
      }, { status: 500 });
    }

    const { data, error } = await adminClient
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Convert UUIDs to strings for compatibility
    const results = (data || []).map(post => ({
      ...post,
      id: post.id.toString(),
      tags: [] // Schema doesn't have tags column yet
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}