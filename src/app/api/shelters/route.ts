import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET all shelters
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new shelter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('shelters')
      .insert({
        name: body.name,
        location_lat: body.location_lat || null,
        location_lng: body.location_lng || null,
        address: body.address,
        capacity: body.capacity,
        current_occupancy: body.current_occupancy || 0,
        contact_number: body.contact_number,
        status: 'open'
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
