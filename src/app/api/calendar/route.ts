import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { data: blocks, error } = await supabase
      .from('calendar_blocks')
      .select('*')
      .order('start_date');

    if (error) {
      console.error('Error fetching calendar blocks:', error);
      return NextResponse.json({ error: 'Failed to fetch calendar blocks' }, { status: 500 });
    }

    const result = (blocks || []).map((block) => ({
      id: block.id,
      propertyId: block.property_id,
      startDate: block.start_date,
      endDate: block.end_date,
      reason: block.reason || 'Blocked',
      source: (block.source || 'manual') as 'manual' | 'airbnb'
    }));

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const blocks = await request.json();

    if (!Array.isArray(blocks)) {
      return NextResponse.json({ error: 'Expected array of calendar blocks' }, { status: 400 });
    }

    // Delete all existing blocks and insert new ones
    const { error: deleteError } = await supabase
      .from('calendar_blocks')
      .delete()
      .neq('id', 'never-matches'); // This deletes all

    if (deleteError) {
      console.error('Error deleting calendar blocks:', deleteError);
      return NextResponse.json({ error: 'Failed to clear calendar blocks' }, { status: 500 });
    }

    if (blocks.length > 0) {
      const { error: insertError } = await supabase
        .from('calendar_blocks')
        .insert(
          blocks.map((block) => ({
            id: block.id,
            property_id: block.propertyId,
            start_date: block.startDate,
            end_date: block.endDate,
            reason: block.reason,
            source: block.source
          }))
        );

      if (insertError) {
        console.error('Error inserting calendar blocks:', insertError);
        return NextResponse.json({ error: 'Failed to save calendar blocks' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { action, propertyId, blocks, blockId } = body;

    if (action === 'add' && blocks) {
      const block = blocks;
      const { error } = await supabase
        .from('calendar_blocks')
        .insert({
          id: block.id,
          property_id: block.propertyId,
          start_date: block.startDate,
          end_date: block.endDate,
          reason: block.reason,
          source: block.source
        });

      if (error) {
        console.error('Error adding calendar block:', error);
        return NextResponse.json({ error: 'Failed to add calendar block' }, { status: 500 });
      }

    } else if (action === 'remove' && blockId) {
      const { error } = await supabase
        .from('calendar_blocks')
        .delete()
        .eq('id', blockId);

      if (error) {
        console.error('Error removing calendar block:', error);
        return NextResponse.json({ error: 'Failed to remove calendar block' }, { status: 500 });
      }

    } else if (action === 'updateProperty' && propertyId && blocks) {
      // Delete existing Airbnb blocks for this property
      const { error: deleteError } = await supabase
        .from('calendar_blocks')
        .delete()
        .eq('property_id', propertyId)
        .eq('source', 'airbnb');

      if (deleteError) {
        console.error('Error deleting property calendar blocks:', deleteError);
        return NextResponse.json({ error: 'Failed to clear property calendar blocks' }, { status: 500 });
      }

      // Insert new blocks
      if (blocks.length > 0) {
        const { error: insertError } = await supabase
          .from('calendar_blocks')
          .insert(
            blocks.map((block: any) => ({
              id: block.id,
              property_id: block.propertyId,
              start_date: block.startDate,
              end_date: block.endDate,
              reason: block.reason,
              source: block.source
            }))
          );

        if (insertError) {
          console.error('Error inserting property calendar blocks:', insertError);
          return NextResponse.json({ error: 'Failed to save property calendar blocks' }, { status: 500 });
        }
      }
    } else {
      return NextResponse.json({ error: 'Invalid action or missing parameters' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}