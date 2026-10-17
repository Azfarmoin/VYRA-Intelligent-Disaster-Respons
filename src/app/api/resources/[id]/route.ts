import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const EDITABLE_FIELDS = ['resource_type', 'name', 'quantity', 'team_id', 'status', 'notes']

// PATCH update resource (status, quantity, owning team...)
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
      .from('resources')
      .update(update)
      .eq('id', params.id)
      .select('*, rescue_teams(team_name)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE remove resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase.from('resources').delete().eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
