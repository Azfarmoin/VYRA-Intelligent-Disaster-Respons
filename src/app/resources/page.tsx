'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RESOURCE_TYPES, TEAM_CAPABILITIES, capabilityLabel, resourceTypeLabel } from '@/lib/matching'

interface Team {
  id: string
  team_name: string
  team_leader: string
  contact_number: string
  capabilities: string[] | null
  current_location_lat: number | null
  current_location_lng: number | null
  base_location: string | null
  team_size: number | null
  status: string
}

interface Resource {
  id: string
  resource_type: string
  name: string | null
  quantity: number
  team_id: string | null
  status: string
  rescue_teams?: { team_name: string } | null
}

interface Shelter {
  id: string
  name: string
  address: string
  capacity: number
  current_occupancy: number
  contact_number: string
  status: string
}

interface Hazard {
  id: string
  description: string
  location_lat: number
  location_lng: number
  radius_km: number
  severity: string
  active: boolean
}

type Tab = 'teams' | 'resources' | 'hazards' | 'shelters'

const TABS: { id: Tab; label: string; addLabel: string }[] = [
  { id: 'teams', label: 'Rescue Teams', addLabel: 'Register Team' },
  { id: 'resources', label: 'Resources', addLabel: 'Add Resource' },
  { id: 'hazards', label: 'Route Hazards', addLabel: 'Report Hazard' },
  { id: 'shelters', label: 'Shelters', addLabel: 'Add Shelter' }
]

const emptyForms = {
  team: {
    team_name: '',
    team_leader: '',
    contact_number: '',
    base_location: '',
    team_size: 4,
    capabilities: [] as string[],
    current_location_lat: '',
    current_location_lng: ''
  },
  resource: { resource_type: 'boat', name: '', quantity: 1, team_id: '' },
  hazard: { description: '', location_lat: '', location_lng: '', radius_km: 1, severity: 'high' },
  shelter: { name: '', address: '', capacity: 100, contact_number: '', location_lat: '', location_lng: '' }
}

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-sm text-black'
const thClass = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
const tdClass = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900'

const numOrNull = (v: string) => (v === '' ? null : Number(v))

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('teams')
  const [showAddModal, setShowAddModal] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [shelters, setShelters] = useState<Shelter[]>([])
  const [hazards, setHazards] = useState<Hazard[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [teamForm, setTeamForm] = useState(emptyForms.team)
  const [resourceForm, setResourceForm] = useState(emptyForms.resource)
  const [hazardForm, setHazardForm] = useState(emptyForms.hazard)
  const [shelterForm, setShelterForm] = useState(emptyForms.shelter)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'teams') {
        const response = await fetch('/api/teams')
        if (response.ok) setTeams(await response.json())
      } else if (activeTab === 'resources') {
        const [resourcesRes, teamsRes] = await Promise.all([fetch('/api/resources'), fetch('/api/teams')])
        if (resourcesRes.ok) setResources(await resourcesRes.json())
        if (teamsRes.ok) setTeams(await teamsRes.json())
      } else if (activeTab === 'hazards') {
        const response = await fetch('/api/hazards')
        if (response.ok) setHazards(await response.json())
      } else if (activeTab === 'shelters') {
        const response = await fetch('/api/shelters')
        if (response.ok) setShelters(await response.json())
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const request = async (url: string, method: string, body?: unknown) => {
    setError('')
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || `Request failed (${response.status})`)
    }
    return response.json()
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (activeTab === 'teams') {
        await request('/api/teams', 'POST', {
          ...teamForm,
          current_location_lat: numOrNull(teamForm.current_location_lat),
          current_location_lng: numOrNull(teamForm.current_location_lng)
        })
        setTeamForm(emptyForms.team)
      } else if (activeTab === 'resources') {
        await request('/api/resources', 'POST', { ...resourceForm, team_id: resourceForm.team_id || null })
        setResourceForm(emptyForms.resource)
      } else if (activeTab === 'hazards') {
        await request('/api/hazards', 'POST', {
          ...hazardForm,
          location_lat: numOrNull(hazardForm.location_lat),
          location_lng: numOrNull(hazardForm.location_lng)
        })
        setHazardForm(emptyForms.hazard)
      } else {
        await request('/api/shelters', 'POST', {
          ...shelterForm,
          location_lat: numOrNull(shelterForm.location_lat),
          location_lng: numOrNull(shelterForm.location_lng)
        })
        setShelterForm(emptyForms.shelter)
      }
      setShowAddModal(false)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const runAction = async (fn: () => Promise<unknown>) => {
    try {
      await fn()
      await fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed')
    }
  }

  const fillMyLocation = (apply: (lat: string, lng: string) => void) => {
    if (!navigator.geolocation) return setError('Geolocation is not supported by your browser.')
    navigator.geolocation.getCurrentPosition(
      pos => apply(pos.coords.latitude.toFixed(6), pos.coords.longitude.toFixed(6)),
      () => setError('Unable to get your location. Please enter it manually.')
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'in_use': return 'bg-yellow-100 text-yellow-800'
      case 'maintenance': return 'bg-red-100 text-red-800'
      case 'unavailable': return 'bg-red-100 text-red-800'
      case 'open': return 'bg-green-100 text-green-800'
      case 'full': return 'bg-red-100 text-red-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const severityColor = (severity: string) =>
    severity === 'high' ? 'bg-red-100 text-red-800' : severity === 'medium' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'

  const resourceSummary = RESOURCE_TYPES.map(type => {
    const items = resources.filter(r => r.resource_type === type.value)
    const available = items.filter(r => r.status === 'available').reduce((sum, r) => sum + (r.quantity || 0), 0)
    const total = items.reduce((sum, r) => sum + (r.quantity || 0), 0)
    return { ...type, available, total }
  })

  const activeTabMeta = TABS.find(t => t.id === activeTab)!

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                Dashboard
              </Link>
              <Link href="/dispatches" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Dispatches
              </Link>
              <Link href="/map" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Map
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'resources' && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            {resourceSummary.map(s => (
              <div key={s.value} className="bg-white rounded-lg shadow p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {s.available}
                  <span className="text-sm font-normal text-gray-500"> / {s.total}</span>
                </div>
                <div className="text-gray-600 text-sm">{s.label} available</div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{activeTabMeta.label}</h2>
              {activeTab === 'hazards' && (
                <p className="text-sm text-gray-500">
                  Flooded roads, collapsed bridges and other hazards. Team suggestions penalise routes that cross active hazards.
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setError('')
                setShowAddModal(true)
              }}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              {activeTabMeta.addLabel}
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              {/* Teams */}
              {activeTab === 'teams' && (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className={thClass}>Team</th>
                      <th className={thClass}>Leader / Contact</th>
                      <th className={thClass}>Capabilities</th>
                      <th className={thClass}>Location</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {teams.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No teams registered yet.</td></tr>
                    )}
                    {teams.map(team => (
                      <tr key={team.id} className="hover:bg-gray-50">
                        <td className={`${tdClass} font-medium`}>
                          {team.team_name}
                          <div className="text-xs text-gray-500">{team.team_size ?? '?'} members</div>
                        </td>
                        <td className={tdClass}>
                          {team.team_leader || '—'}
                          <div className="text-xs text-gray-500">{team.contact_number}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {(team.capabilities ?? []).map(cap => (
                              <span key={cap} className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded text-xs">
                                {capabilityLabel(cap)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className={tdClass}>
                          {team.base_location || '—'}
                          {team.current_location_lat != null && (
                            <div className="text-xs text-gray-500">
                              {Number(team.current_location_lat).toFixed(4)}, {Number(team.current_location_lng).toFixed(4)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                            {team.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                          {team.status !== 'assigned' && (
                            <button
                              onClick={() =>
                                runAction(() =>
                                  request(`/api/teams/${team.id}`, 'PATCH', {
                                    status: team.status === 'available' ? 'unavailable' : 'available'
                                  })
                                )
                              }
                              className="text-teal-600 hover:text-teal-900 font-medium"
                            >
                              Mark {team.status === 'available' ? 'unavailable' : 'available'}
                            </button>
                          )}
                          {team.status === 'assigned' && (
                            <Link href="/dispatches" className="text-teal-600 hover:text-teal-900 font-medium">
                              View dispatch
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Delete team ${team.team_name}?`)) {
                                runAction(() => request(`/api/teams/${team.id}`, 'DELETE'))
                              }
                            }}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Resources */}
              {activeTab === 'resources' && (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className={thClass}>Type</th>
                      <th className={thClass}>Name</th>
                      <th className={thClass}>Quantity</th>
                      <th className={thClass}>Assigned To</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {resources.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No resources tracked yet.</td></tr>
                    )}
                    {resources.map(resource => (
                      <tr key={resource.id} className="hover:bg-gray-50">
                        <td className={`${tdClass} font-medium`}>{resourceTypeLabel(resource.resource_type)}</td>
                        <td className={tdClass}>{resource.name || '—'}</td>
                        <td className={tdClass}>{resource.quantity}</td>
                        <td className={tdClass}>
                          <select
                            value={resource.team_id ?? ''}
                            disabled={resource.status === 'in_use'}
                            onChange={e =>
                              runAction(() =>
                                request(`/api/resources/${resource.id}`, 'PATCH', { team_id: e.target.value || null })
                              )
                            }
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm disabled:bg-gray-50"
                          >
                            <option value="">Shared pool</option>
                            {teams.map(t => (
                              <option key={t.id} value={t.id}>{t.team_name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                            {resource.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                          {resource.status !== 'in_use' && (
                            <button
                              onClick={() =>
                                runAction(() =>
                                  request(`/api/resources/${resource.id}`, 'PATCH', {
                                    status: resource.status === 'available' ? 'maintenance' : 'available'
                                  })
                                )
                              }
                              className="text-teal-600 hover:text-teal-900 font-medium"
                            >
                              {resource.status === 'available' ? 'Send to maintenance' : 'Mark available'}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('Delete this resource?')) {
                                runAction(() => request(`/api/resources/${resource.id}`, 'DELETE'))
                              }
                            }}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Hazards */}
              {activeTab === 'hazards' && (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className={thClass}>Description</th>
                      <th className={thClass}>Location</th>
                      <th className={thClass}>Radius</th>
                      <th className={thClass}>Severity</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {hazards.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No route hazards reported.</td></tr>
                    )}
                    {hazards.map(hazard => (
                      <tr key={hazard.id} className="hover:bg-gray-50">
                        <td className={`${tdClass} font-medium`}>{hazard.description}</td>
                        <td className={tdClass}>
                          {Number(hazard.location_lat).toFixed(4)}, {Number(hazard.location_lng).toFixed(4)}
                        </td>
                        <td className={tdClass}>{hazard.radius_km} km</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColor(hazard.severity)}`}>
                            {hazard.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${hazard.active ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                            {hazard.active ? 'active' : 'cleared'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                          <button
                            onClick={() => runAction(() => request(`/api/hazards/${hazard.id}`, 'PATCH', { active: !hazard.active }))}
                            className="text-teal-600 hover:text-teal-900 font-medium"
                          >
                            {hazard.active ? 'Mark cleared' : 'Reactivate'}
                          </button>
                          <button
                            onClick={() => runAction(() => request(`/api/hazards/${hazard.id}`, 'DELETE'))}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Shelters */}
              {activeTab === 'shelters' && (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className={thClass}>Name</th>
                      <th className={thClass}>Address</th>
                      <th className={thClass}>Capacity</th>
                      <th className={thClass}>Occupancy</th>
                      <th className={thClass}>Contact</th>
                      <th className={thClass}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {shelters.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No shelters added yet.</td></tr>
                    )}
                    {shelters.map(shelter => (
                      <tr key={shelter.id} className="hover:bg-gray-50">
                        <td className={`${tdClass} font-medium`}>{shelter.name}</td>
                        <td className={tdClass}>{shelter.address}</td>
                        <td className={tdClass}>{shelter.capacity}</td>
                        <td className={tdClass}>{shelter.current_occupancy}</td>
                        <td className={tdClass}>{shelter.contact_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shelter.status)}`}>
                            {shelter.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleAdd} className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{activeTabMeta.addLabel}</h3>
                <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>
              )}

              <div className="space-y-4">
                {activeTab === 'teams' && (
                  <>
                    <input required placeholder="Team name *" className={inputClass} value={teamForm.team_name}
                      onChange={e => setTeamForm({ ...teamForm, team_name: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="Team leader" className={inputClass} value={teamForm.team_leader}
                        onChange={e => setTeamForm({ ...teamForm, team_leader: e.target.value })} />
                      <input placeholder="Contact number" className={inputClass} value={teamForm.contact_number}
                        onChange={e => setTeamForm({ ...teamForm, contact_number: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="Base / station" className={inputClass} value={teamForm.base_location}
                        onChange={e => setTeamForm({ ...teamForm, base_location: e.target.value })} />
                      <input type="number" min={1} placeholder="Members" className={inputClass} value={teamForm.team_size}
                        onChange={e => setTeamForm({ ...teamForm, team_size: parseInt(e.target.value) || 1 })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Capabilities</label>
                      <div className="grid grid-cols-2 gap-2">
                        {TEAM_CAPABILITIES.map(cap => (
                          <label key={cap.value} className="flex items-center gap-2 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={teamForm.capabilities.includes(cap.value)}
                              onChange={e =>
                                setTeamForm({
                                  ...teamForm,
                                  capabilities: e.target.checked
                                    ? [...teamForm.capabilities, cap.value]
                                    : teamForm.capabilities.filter(c => c !== cap.value)
                                })
                              }
                            />
                            {cap.label}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Current location (for distance matching)</label>
                        <button type="button" className="text-xs text-teal-700 font-medium"
                          onClick={() => fillMyLocation((lat, lng) => setTeamForm(f => ({ ...f, current_location_lat: lat, current_location_lng: lng })))}>
                          Use my location
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="number" step="any" placeholder="Latitude" className={inputClass} value={teamForm.current_location_lat}
                          onChange={e => setTeamForm({ ...teamForm, current_location_lat: e.target.value })} />
                        <input type="number" step="any" placeholder="Longitude" className={inputClass} value={teamForm.current_location_lng}
                          onChange={e => setTeamForm({ ...teamForm, current_location_lng: e.target.value })} />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'resources' && (
                  <>
                    <select className={inputClass} value={resourceForm.resource_type}
                      onChange={e => setResourceForm({ ...resourceForm, resource_type: e.target.value })}>
                      {RESOURCE_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <input placeholder="Name / identifier (e.g. Boat #3, Ambulance A1)" className={inputClass} value={resourceForm.name}
                      onChange={e => setResourceForm({ ...resourceForm, name: e.target.value })} />
                    <input type="number" min={1} placeholder="Quantity" className={inputClass} value={resourceForm.quantity}
                      onChange={e => setResourceForm({ ...resourceForm, quantity: parseInt(e.target.value) || 1 })} />
                    <select className={inputClass} value={resourceForm.team_id}
                      onChange={e => setResourceForm({ ...resourceForm, team_id: e.target.value })}>
                      <option value="">Shared pool (any team)</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.team_name}</option>
                      ))}
                    </select>
                  </>
                )}

                {activeTab === 'hazards' && (
                  <>
                    <input required placeholder="Description (e.g. Flooded road on Main St) *" className={inputClass} value={hazardForm.description}
                      onChange={e => setHazardForm({ ...hazardForm, description: e.target.value })} />
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Location *</label>
                        <button type="button" className="text-xs text-teal-700 font-medium"
                          onClick={() => fillMyLocation((lat, lng) => setHazardForm(f => ({ ...f, location_lat: lat, location_lng: lng })))}>
                          Use my location
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input required type="number" step="any" placeholder="Latitude" className={inputClass} value={hazardForm.location_lat}
                          onChange={e => setHazardForm({ ...hazardForm, location_lat: e.target.value })} />
                        <input required type="number" step="any" placeholder="Longitude" className={inputClass} value={hazardForm.location_lng}
                          onChange={e => setHazardForm({ ...hazardForm, location_lng: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-sm text-gray-700">
                        Radius (km)
                        <input type="number" step="0.1" min={0.1} className={inputClass} value={hazardForm.radius_km}
                          onChange={e => setHazardForm({ ...hazardForm, radius_km: parseFloat(e.target.value) || 1 })} />
                      </label>
                      <label className="text-sm text-gray-700">
                        Severity
                        <select className={inputClass} value={hazardForm.severity}
                          onChange={e => setHazardForm({ ...hazardForm, severity: e.target.value })}>
                          <option value="high">High – impassable</option>
                          <option value="medium">Medium – risky</option>
                          <option value="low">Low – slow</option>
                        </select>
                      </label>
                    </div>
                  </>
                )}

                {activeTab === 'shelters' && (
                  <>
                    <input required placeholder="Shelter name *" className={inputClass} value={shelterForm.name}
                      onChange={e => setShelterForm({ ...shelterForm, name: e.target.value })} />
                    <input placeholder="Address" className={inputClass} value={shelterForm.address}
                      onChange={e => setShelterForm({ ...shelterForm, address: e.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" min={1} placeholder="Capacity" className={inputClass} value={shelterForm.capacity}
                        onChange={e => setShelterForm({ ...shelterForm, capacity: parseInt(e.target.value) || 0 })} />
                      <input placeholder="Contact number" className={inputClass} value={shelterForm.contact_number}
                        onChange={e => setShelterForm({ ...shelterForm, contact_number: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="number" step="any" placeholder="Latitude" className={inputClass} value={shelterForm.location_lat}
                        onChange={e => setShelterForm({ ...shelterForm, location_lat: e.target.value })} />
                      <input type="number" step="any" placeholder="Longitude" className={inputClass} value={shelterForm.location_lng}
                        onChange={e => setShelterForm({ ...shelterForm, location_lng: e.target.value })} />
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
