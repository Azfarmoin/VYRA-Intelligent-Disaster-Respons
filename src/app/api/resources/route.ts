import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET all resources
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*, rescue_teams(team_name)')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new resource
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.resource_type) {
      return NextResponse.json({ error: 'resource_type is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('resources')
      .insert({
        resource_type: body.resource_type,
        name: body.name || null,
        quantity: body.quantity || 1,
        notes: body.notes || null,
        team_id: body.team_id || null,
        status: 'available'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
