'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { resourceTypeLabel } from '@/lib/matching'

interface Dispatch {
  id: string
  status: string
  notes: string | null
  assigned_at: string
  completed_at: string | null
  match_score: number | null
  distance_km: number | null
  match_explanation: { warnings?: string[] } | null
  emergency_reports: {
    id: string
    location_address: string
    people_count: number
    priority_score: number
    status: string
    immediate_danger: boolean
  } | null
  rescue_teams: { id: string; team_name: string; team_leader: string | null; contact_number: string | null } | null
  dispatch_resources: { id: string; quantity: number; resources: { resource_type: string; name: string | null } | null }[]
}

const STEPS = ['pending', 'en_route', 'on_scene', 'completed']
const STEP_LABELS: Record<string, string> = {
  pending: 'Assigned',
  en_route: 'En route',
  on_scene: 'On scene',
  completed: 'Completed',
  cancelled: 'Cancelled'
}

export default function DispatchesPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'active' | 'all'>('active')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchDispatches = async () => {
    try {
      const response = await fetch(`/api/dispatches${filter === 'active' ? '?active=true' : ''}`)
      if (response.ok) setDispatches(await response.json())
    } catch (error) {
      console.error('Failed to fetch dispatches:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchDispatches()
    const timer = setInterval(fetchDispatches, 15000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const updateStatus = async (id: string, status: string) => {
    if (status === 'cancelled' && !confirm('Cancel this assignment? The team and resources will be released.')) return
    setUpdating(id)
    try {
      const response = await fetch(`/api/dispatches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        alert(data.error || 'Failed to update dispatch')
      }
      await fetchDispatches()
    } finally {
      setUpdating(null)
    }
  }

  const count = (s: string) => dispatches.filter(d => d.status === s).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Team Dispatches</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                Dashboard
              </Link>
              <Link href="/resources" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Resources
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {(['pending', 'en_route', 'on_scene'] as const).map(s => (
            <div key={s} className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-gray-900">{count(s)}</div>
              <div className="text-gray-600 text-sm">{STEP_LABELS[s]}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">Show:</span>
          {(['active', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${filter === f ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {f === 'active' ? 'Active' : 'All (incl. history)'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading…</div>
        ) : dispatches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            No {filter === 'active' ? 'active ' : ''}dispatches. Assign a team from the{' '}
            <Link href="/dashboard" className="text-teal-600 font-medium">dashboard</Link>.
          </div>
        ) : (
          <div className="space-y-4">
            {dispatches.map(d => {
              const stepIndex = STEPS.indexOf(d.status)
              const next = stepIndex >= 0 && stepIndex < STEPS.length - 1 ? STEPS[stepIndex + 1] : null
              const active = ['pending', 'en_route', 'on_scene'].includes(d.status)
              return (
                <div key={d.id} className="bg-white rounded-lg shadow p-5" data-testid="dispatch-card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {d.rescue_teams?.team_name ?? 'Unknown team'} → {d.emergency_reports?.location_address ?? 'Unknown case'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Priority {d.emergency_reports?.priority_score ?? '—'} · {d.emergency_reports?.people_count ?? '?'} people
                        {d.emergency_reports?.immediate_danger ? ' · immediate danger' : ''}
                        {d.distance_km != null ? ` · ${d.distance_km} km` : ''}
                        {d.match_score != null ? ` · match ${d.match_score}/100` : ''}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Assigned {new Date(d.assigned_at).toLocaleString()}
                        {d.rescue_teams?.team_leader ? ` · Leader: ${d.rescue_teams.team_leader}` : ''}
                        {d.rescue_teams?.contact_number ? ` (${d.rescue_teams.contact_number})` : ''}
                        {d.completed_at ? ` · Closed ${new Date(d.completed_at).toLocaleString()}` : ''}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {next && (
                        <button
                          disabled={updating === d.id}
                          onClick={() => updateStatus(d.id, next)}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
                        >
                          Mark {STEP_LABELS[next].toLowerCase()}
                        </button>
                      )}
                      {active && (
                        <button
                          disabled={updating === d.id}
                          onClick={() => updateStatus(d.id, 'cancelled')}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress tracker */}
                  <div className="flex items-center mt-4">
                    {d.status === 'cancelled' ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Cancelled</span>
                    ) : (
                      STEPS.map((step, i) => (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center">
                            <div className={`w-4 h-4 rounded-full ${i <= stepIndex ? 'bg-teal-600' : 'bg-gray-200'}`} />
                            <span className={`text-xs mt-1 ${i <= stepIndex ? 'text-teal-700 font-medium' : 'text-gray-400'}`}>
                              {STEP_LABELS[step]}
                            </span>
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-2 mb-4 ${i < stepIndex ? 'bg-teal-600' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {(d.dispatch_resources.length > 0 || d.notes || d.match_explanation?.warnings?.length) && (
                    <div className="mt-3 pt-3 border-t text-sm text-gray-700 space-y-1">
                      {d.dispatch_resources.length > 0 && (
                        <div>
                          <span className="font-medium">Resources:</span>{' '}
                          {d.dispatch_resources
                            .map(r => `${resourceTypeLabel(r.resources?.resource_type ?? '')}${r.resources?.name ? ` (${r.resources.name})` : ''} ×${r.quantity}`)
                            .join(', ')}
                        </div>
                      )}
                      {d.notes && <div><span className="font-medium">Notes:</span> {d.notes}</div>}
                      {d.match_explanation?.warnings?.length ? (
                        <div className="text-orange-700">⚠ {d.match_explanation.warnings.join(' · ')}</div>
                      ) : null}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
