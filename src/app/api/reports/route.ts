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

// POST create new report.
// Offline-queued reports send a `client_id` idempotency key; resubmitting the same
// key returns the already-stored report instead of creating a duplicate.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clientId: string | null = typeof body.client_id === 'string' && body.client_id ? body.client_id : null

    if (!body.location_address && (body.location_lat == null || body.location_lng == null)) {
      return NextResponse.json({ error: 'A location address or GPS coordinates are required' }, { status: 400 })
    }

    if (clientId) {
      const existing = await findByClientId(clientId)
      if (existing) {
        return NextResponse.json({ ...existing, duplicate: true }, { status: 200 })
      }
    }

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
        location_lat: body.location_lat ?? null,
        location_lng: body.location_lng ?? null,
        location_address: body.location_address,
        people_count: body.people_count || 1,
        immediate_danger: body.immediate_danger || false,
        injury_details: body.injury_details || null,
        medical_needs: body.medical_needs || null,
        contact_info: body.contact_info || null,
        status: 'pending',
        priority_score: triageResult.priority_score,
        priority_explanation: triageResult.priority_explanation,
        client_id: clientId,
        submitted_offline: Boolean(body.submitted_offline),
        client_created_at: body.client_created_at || null
      })
      .select()
      .single()

    if (error) {
      // Unique violation on client_id: a concurrent sync already stored this report
      if (clientId && error.code === '23505') {
        const existing = await findByClientId(clientId)
        if (existing) {
          return NextResponse.json({ ...existing, duplicate: true }, { status: 200 })
        }
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ...data, duplicate: false }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function findByClientId(clientId: string) {
  const { data } = await supabase
    .from('emergency_reports')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle()
  return data
}
