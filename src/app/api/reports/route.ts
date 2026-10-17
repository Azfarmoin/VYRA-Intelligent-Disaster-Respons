import { NextRequest, NextResponse } from 'next/server'
import { createReport, findTriaged, handleError, parseBody, parseQuery, publicView } from '@/lib/reportService'
import { createReportSchema, listQuerySchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

// GET /api/reports - reports with live triage (responders).
// Filters: area, status (comma list or "open"), priority, verified, bbox, sort.
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(await findTriaged(parseQuery(request, listQuerySchema)))
  } catch (err) {
    return handleError(err)
  }
}

// POST /api/reports - submit an emergency report (public). Idempotent on client_id.
export async function POST(request: NextRequest) {
  try {
    const input = await parseBody(request, createReportSchema)
    const { report, duplicate } = await createReport(input)
    return NextResponse.json({ report: publicView(report), duplicate }, { status: duplicate ? 200 : 201 })
  } catch (err) {
    return handleError(err)
  }
}
