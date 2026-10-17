'use client'

import { useEffect, useState } from 'react'
import { TeamMatch, CaseNeeds, capabilityLabel, resourceTypeLabel } from '@/lib/matching'

interface Resource {
  id: string
  resource_type: string
  name: string | null
  quantity: number
  team_id: string | null
  status: string
  rescue_teams?: { team_name: string } | null
}

interface Props {
  reportId: string
  reportLabel: string
  onClose: () => void
  onAssigned: () => void
}

const scoreColor = (score: number) =>
  score >= 75 ? 'bg-green-100 text-green-800' : score >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'

export default function AssignTeamModal({ reportId, reportLabel, onClose, onAssigned }: Props) {
  const [needs, setNeeds] = useState<CaseNeeds | null>(null)
  const [matches, setMatches] = useState<TeamMatch[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedResources, setSelectedResources] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [matchRes, resourceRes] = await Promise.all([
          fetch(`/api/reports/${reportId}/matches`),
          fetch('/api/resources')
        ])
        const matchData = await matchRes.json()
        if (!matchRes.ok) throw new Error(matchData.error || 'Failed to load team suggestions')
        setNeeds(matchData.needs)
        setMatches(matchData.matches)
        if (resourceRes.ok) setResources(await resourceRes.json())
        const best = (matchData.matches as TeamMatch[]).find(m => m.eligible)
        if (best) {
          setSelectedTeam(best.team_id)
          setSelectedResources(best.suggested_resource_ids)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team suggestions')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [reportId])

  const selectTeam = (match: TeamMatch) => {
    if (!match.eligible) return
    setSelectedTeam(match.team_id)
    setSelectedResources(match.suggested_resource_ids)
  }

  const assign = async () => {
    if (!selectedTeam) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/dispatches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, team_id: selectedTeam, resource_ids: selectedResources, notes })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to assign team')
      onAssigned()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign team')
    } finally {
      setSaving(false)
    }
  }

  const availableResources = resources.filter(r => r.status === 'available')
  const visibleResources = availableResources.filter(r => !r.team_id || r.team_id === selectedTeam)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-bold text-gray-900">Assign Rescue Team</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-gray-600 mb-4">{reportLabel}</p>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>}

        {loading ? (
          <div className="py-12 text-center text-gray-500">Finding the best teams…</div>
        ) : (
          <>
            {needs && (
              <div className="mb-4 p-4 bg-teal-50 border border-teal-100 rounded-lg text-sm">
                <div className="font-medium text-teal-900 mb-1">What this case needs</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {needs.capabilities.map(c => (
                    <span key={c} className="px-2 py-0.5 bg-white border border-teal-200 rounded text-xs text-teal-800">
                      {capabilityLabel(c)}
                    </span>
                  ))}
                  {needs.resourceTypes.map(r => (
                    <span key={r} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-700">
                      {resourceTypeLabel(r)}
                    </span>
                  ))}
                </div>
                <ul className="list-disc list-inside text-teal-800 text-xs space-y-0.5">
                  {needs.reasons.map(r => <li key={r}>{r}</li>)}
                </ul>
              </div>
            )}

            <h3 className="text-sm font-semibold text-gray-700 mb-2">Suggested teams (best match first)</h3>
            {matches.length === 0 ? (
              <p className="text-gray-500 text-sm mb-4">No teams registered. Add teams on the Resources page.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {matches.map((m, index) => (
                  <button
                    key={m.team_id}
                    type="button"
                    onClick={() => selectTeam(m)}
                    disabled={!m.eligible}
                    className={`w-full text-left border rounded-lg p-3 transition-colors ${
                      selectedTeam === m.team_id
                        ? 'border-teal-600 ring-2 ring-teal-200 bg-teal-50'
                        : m.eligible
                          ? 'border-gray-200 hover:border-teal-300'
                          : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-gray-900">
                        {index === 0 && m.eligible && <span className="text-xs text-teal-700 mr-2">★ Recommended</span>}
                        {m.team_name}
                        {!m.eligible && <span className="ml-2 text-xs text-gray-500">({m.team_status})</span>}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {m.distance_km !== null && <span className="text-gray-600">{m.distance_km} km</span>}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${m.route.safe ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {m.route.safe ? 'Route clear' : 'Route hazard'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${scoreColor(m.score)}`}>{m.score}/100</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {m.breakdown.map(b => (
                        <div key={b.factor} className="text-xs text-gray-600" title={b.detail}>
                          <span className="font-medium text-gray-800">{b.factor}</span> {b.points}/{b.max}
                          <div className="text-gray-500 truncate">{b.detail}</div>
                        </div>
                      ))}
                    </div>
                    {m.warnings.length > 0 && (
                      <div className="mt-2 text-xs text-orange-700">⚠ {m.warnings.join(' · ')}</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {selectedTeam && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Resources to send</h3>
                {visibleResources.length === 0 ? (
                  <p className="text-gray-500 text-sm mb-4">No available resources for this team.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {visibleResources.map(r => (
                      <label key={r.id} className="flex items-center gap-2 text-sm border rounded-md p-2">
                        <input
                          type="checkbox"
                          checked={selectedResources.includes(r.id)}
                          onChange={e =>
                            setSelectedResources(prev =>
                              e.target.checked ? [...prev, r.id] : prev.filter(id => id !== r.id)
                            )
                          }
                        />
                        <span>
                          {resourceTypeLabel(r.resource_type)}
                          {r.name ? ` – ${r.name}` : ''} ×{r.quantity}
                          <span className="text-xs text-gray-500"> ({r.team_id ? 'team-owned' : 'shared pool'})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notes for the team (route, access, contact…)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </>
            )}

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200">
                Cancel
              </button>
              <button
                onClick={assign}
                disabled={!selectedTeam || saving}
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? 'Assigning…' : 'Confirm Assignment'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
