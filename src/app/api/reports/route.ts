import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculateTriage } from '@/lib/triage'

// GET all reports
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('emergency_reports')
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

// POST create new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Calculate triage score
    const triageResult = calculateTriage({
      people_count: body.people_count || 1,
      immediate_danger: body.immediate_danger || false,
      injury_details: body.injury_details || null,
      medical_needs: body.medical_needs || null
    })

    const { data, error } = await supabase
      .from('emergency_reports')
      .insert({
        reporter_id: body.reporter_id || null,
        location_lat: body.location_lat || null,
        location_lng: body.location_lng || null,
        location_address: body.location_address,
        people_count: body.people_count || 1,
        immediate_danger: body.immediate_danger || false,
        injury_details: body.injury_details || null,
        medical_needs: body.medical_needs || null,
        contact_info: body.contact_info || null,
        status: 'pending',
        priority_score: triageResult.priority_score,
        priority_explanation: triageResult.priority_explanation
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
