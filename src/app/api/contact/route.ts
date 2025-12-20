import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireAuth, rateLimit } from '@/lib/api-auth';
import {
  successResponse,
  errorResponse,
  handleDatabaseError
} from '@/lib/api-utils';

// POST /api/contact - Submit contact form
// This endpoint handles contact form submissions with proper validation and database storage
export async function POST(request: NextRequest) {
  try {
    // Apply stricter rate limiting for contact forms to prevent spam
    const rateLimitResult = rateLimit(request, 10, 15 * 60 * 1000); // 10 requests per 15 minutes
    if (!rateLimitResult.allowed) {
      return errorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        {
          resetTime: new Date(rateLimitResult.resetTime).toISOString(),
          remaining: rateLimitResult.remaining
        }
      );
    }

    const adminClient = createAdminClient();

    if (!adminClient) {
      return errorResponse(
        'Database not configured. Contact form submission failed.',
        503,
        { fallback: 'Please try again later or contact us directly.' }
      );
    }

    const body = await request.json();
    const { name, email, phone, subject, message, propertyId, checkIn, checkOut } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return errorResponse(
        'Missing required fields. Name, email, and message are required.',
        400
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format', 400);
    }

    // Prepare contact submission data
    const contactData = {
      name: String(name).substring(0, 100), // Limit name length
      email: String(email).substring(0, 100),
      phone: phone ? String(phone).substring(0, 20) : null,
      subject: subject ? String(subject).substring(0, 200) : 'Contact Form Submission',
      message: String(message).substring(0, 2000), // Limit message length
      property_id: propertyId || null,
      check_in: checkIn || null,
      check_out: checkOut || null,
      submitted_at: new Date().toISOString(),
      status: 'new',
      source: 'website_contact_form'
    };

    // Insert contact submission into database
    const { data, error } = await adminClient
      .from('contact_submissions')
      .insert([contactData])
      .select()
      .single();

    if (error) {
      console.error('Error saving contact submission:', error);
      return handleDatabaseError(error);
    }

    console.log(`Contact form submitted by: ${name} (${email})`);

    // Return success response (don't expose internal IDs)
    return successResponse(
      {
        success: true,
        submittedAt: data.submitted_at,
        reference: `CON-${data.id.substring(0, 8)}`
      },
      'Thank you for contacting us! We will get back to you soon.',
      {
        timestamp: new Date().toISOString()
      }
    );

  } catch (error) {
    console.error('Contact POST error:', error);
    return errorResponse(
      'Failed to submit contact form',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// GET /api/contact - Get contact submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(request, 50, 15 * 60 * 1000); // 50 requests per 15 minutes
    if (!rateLimitResult.allowed) {
      return errorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        {
          resetTime: new Date(rateLimitResult.resetTime).toISOString(),
          remaining: rateLimitResult.remaining
        }
      );
    }

    return await requireAuth(request, async (req, adminSession) => {
      const adminClient = createAdminClient();

      if (!adminClient) {
        return errorResponse('Database not configured', 503);
      }

      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const limit = parseInt(searchParams.get('limit') || '50');
      const offset = parseInt(searchParams.get('offset') || '0');

      // Build query
      let query = adminClient
        .from('contact_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      // Apply status filter if specified
      if (status) {
        query = query.eq('status', status);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data: submissions, error } = await query;

      if (error) {
        return handleDatabaseError(error);
      }

      // Get total count
      const { count, error: countError } = await adminClient
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true });

      const totalCount = countError ? 0 : count || 0;

      return successResponse(
        submissions || [],
        `Retrieved ${(submissions || []).length} contact submissions`,
        {
          total: totalCount,
          limit,
          offset,
          hasMore: totalCount > (offset + limit)
        }
      );
    });

  } catch (error) {
    console.error('Contact GET error:', error);
    return errorResponse(
      'Failed to retrieve contact submissions',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// PUT /api/contact - Update contact submission status (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Apply rate limiting for admin operations
    const rateLimitResult = rateLimit(request, 30, 15 * 60 * 1000); // 30 requests per 15 minutes
    if (!rateLimitResult.allowed) {
      return errorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        {
          resetTime: new Date(rateLimitResult.resetTime).toISOString(),
          remaining: rateLimitResult.remaining
        }
      );
    }

    return await requireAuth(request, async (req, adminSession) => {
      const adminClient = createAdminClient();

      if (!adminClient) {
        return errorResponse('Database not configured', 503);
      }

      const body = await req.json();
      const { id, status, notes } = body;

      if (!id) {
        return errorResponse('Contact submission ID is required', 400);
      }

      const validStatuses = ['new', 'in_progress', 'responded', 'closed'];
      if (status && !validStatuses.includes(status)) {
        return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (status) {
        updateData.status = status;
      }

      if (notes !== undefined) {
        updateData.admin_notes = String(notes || '').substring(0, 1000);
      }

      // Update contact submission
      const { data, error } = await adminClient
        .from('contact_submissions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return errorResponse('Contact submission not found', 404);
        }
        return handleDatabaseError(error);
      }

      console.log(`Contact submission updated: ${id} -> status: ${status || 'unchanged'}`);

      return successResponse(
        {
          id: data.id,
          status: data.status,
          updatedAt: data.updated_at,
          success: true
        },
        'Contact submission updated successfully',
        { timestamp: new Date().toISOString() }
      );
    });

  } catch (error) {
    console.error('Contact PUT error:', error);
    return errorResponse(
      'Failed to update contact submission',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// DELETE /api/contact - Delete contact submission (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Apply rate limiting for admin operations
    const rateLimitResult = rateLimit(request, 20, 15 * 60 * 1000); // 20 requests per 15 minutes
    if (!rateLimitResult.allowed) {
      return errorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        {
          resetTime: new Date(rateLimitResult.resetTime).toISOString(),
          remaining: rateLimitResult.remaining
        }
      );
    }

    return await requireAuth(request, async (req, adminSession) => {
      const adminClient = createAdminClient();

      if (!adminClient) {
        return errorResponse('Database not configured', 503);
      }

      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (!id) {
        return errorResponse('Contact submission ID is required', 400);
      }

      // First check if submission exists
      const { data: existing, error: fetchError } = await adminClient
        .from('contact_submissions')
        .select('id, name, email')
        .eq('id', id)
        .single();

      if (fetchError || !existing) {
        return errorResponse('Contact submission not found', 404);
      }

      // Delete contact submission
      const { error } = await adminClient
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting contact submission:', error);
        return handleDatabaseError(error);
      }

      console.log(`Contact submission deleted: ${existing.name} (${existing.email})`);

      return successResponse(
        {
          id,
          name: existing.name,
          email: existing.email
        },
        'Contact submission deleted successfully',
        { timestamp: new Date().toISOString() }
      );
    });

  } catch (error) {
    console.error('Contact DELETE error:', error);
    return errorResponse(
      'Failed to delete contact submission',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}