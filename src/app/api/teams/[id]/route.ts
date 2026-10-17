import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const EDITABLE_FIELDS = [
  'team_name',
  'team_leader',
  'contact_number',
  'capabilities',
  'current_location_lat',
  'current_location_lng',
  'base_location',
  'team_size',
  'status'
]

// PATCH update team (status, location, capabilities...)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const update: Record<string, unknown> = {}
    for (const field of EDITABLE_FIELDS) {
      if (field in body) update[field] = body[field]
    }

    const { data, error } = await supabase
      .from('rescue_teams')
      .update(update)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE remove team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase.from('rescue_teams').delete().eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
