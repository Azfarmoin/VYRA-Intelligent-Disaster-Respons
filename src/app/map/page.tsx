'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface Report {
  id: string
  location_address: string
  location_lat: number | null
  location_lng: number | null
  people_count: number
  immediate_danger: boolean
  status: string
  priority_score: number
}

interface Shelter {
  id: string
  name: string
  location_lat: number | null
  location_lng: number | null
  capacity: number
  current_occupancy: number
  status: string
}

interface Team {
  id: string
  team_name: string
  current_location_lat: number | null
  current_location_lng: number | null
  status: string
}

export default function MapPage() {
  const [filter, setFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [shelters, setShelters] = useState<Shelter[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [reportsRes, sheltersRes, teamsRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/shelters'),
        fetch('/api/teams')
      ])

      if (reportsRes.ok) setReports(await reportsRes.json())
      if (sheltersRes.ok) setShelters(await sheltersRes.json())
      if (teamsRes.ok) setTeams(await teamsRes.json())
    } catch (error) {
      console.error('Failed to fetch map data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMarkerColor = (type: string, status: string) => {
    if (type === 'report') {
      if (status === 'pending') return 'bg-red-500'
      if (status === 'investigating') return 'bg-yellow-500'
      if (status === 'assigned') return 'bg-blue-500'
      return 'bg-green-500'
    }
    if (type === 'shelter') {
      return 'bg-purple-500'
    }
    if (type === 'team') {
      if (status === 'available') return 'bg-teal-500'
      return 'bg-orange-500'
    }
    return 'bg-gray-500'
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Disaster Map</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Filter */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Filter Map</h3>
              <div className="space-y-2">
                {['all', 'reports', 'shelters', 'teams'].map(option => (
                  <button
                    key={option}
                    onClick={() => setFilter(option)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === option
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Pending Report</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700">Investigating</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Assigned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Shelter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
                  <span className="text-gray-700">Available Team</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">Assigned Team</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Reports</span>
                  <span className="font-medium">{reports.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Shelters</span>
                  <span className="font-medium">{shelters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rescue Teams</span>
                  <span className="font-medium">{teams.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative h-[600px]">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-gray-600">Loading map data...</div>
                  </div>
                ) : (
                  <MapContainer
                    center={[40.7128, -74.0060]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {(filter === 'all' || filter === 'reports') && reports
                      .filter((r: Report) => r.location_lat && r.location_lng)
                      .map((report: Report) => (
                        <Marker
                          key={report.id}
                          position={[report.location_lat!, report.location_lng!]}
                          eventHandlers={{
                            click: () => setSelectedItem({ ...report, type: 'report' })
                          }}
                        >
                          <Popup>
                            <div>
                              <strong>Emergency Report</strong><br />
                              Location: {report.location_address}<br />
                              People: {report.people_count}<br />
                              Status: {report.status}
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    {(filter === 'all' || filter === 'shelters') && shelters
                      .filter((s: Shelter) => s.location_lat && s.location_lng)
                      .map((shelter: Shelter) => (
                        <Marker
                          key={shelter.id}
                          position={[shelter.location_lat!, shelter.location_lng!]}
                          eventHandlers={{
                            click: () => setSelectedItem({ ...shelter, type: 'shelter' })
                          }}
                        >
                          <Popup>
                            <div>
                              <strong>Shelter</strong><br />
                              Name: {shelter.name}<br />
                              Capacity: {shelter.capacity}<br />
                              Occupancy: {shelter.current_occupancy}
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    {(filter === 'all' || filter === 'teams') && teams
                      .filter((t: Team) => t.current_location_lat && t.current_location_lng)
                      .map((team: Team) => (
                        <Marker
                          key={team.id}
                          position={[team.current_location_lat!, team.current_location_lng!]}
                          eventHandlers={{
                            click: () => setSelectedItem({ ...team, type: 'team' })
                          }}
                        >
                          <Popup>
                            <div>
                              <strong>Rescue Team</strong><br />
                              Name: {team.team_name}<br />
                              Status: {team.status}
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                  </MapContainer>
                )}
              </div>
            </div>

            {/* Selected Item Details */}
            {selectedItem && (
              <div className="mt-4 bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedItem.type === 'report' ? 'Report Details' : 
                     selectedItem.type === 'shelter' ? 'Shelter Details' : 'Team Details'}
                  </h3>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {selectedItem.type === 'report' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-gray-900">{selectedItem.location_address}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">People Affected</label>
                        <p className="text-gray-900">{selectedItem.people_count}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Priority Score</label>
                        <p className="text-gray-900">{selectedItem.priority_score}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Immediate Danger</label>
                      <p className="text-gray-900">{selectedItem.immediate_danger ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="text-gray-900">{selectedItem.status}</p>
                    </div>
                  </div>
                )}

                {selectedItem.type === 'shelter' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{selectedItem.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Capacity</label>
                        <p className="text-gray-900">{selectedItem.capacity}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Occupancy</label>
                        <p className="text-gray-900">{selectedItem.current_occupancy}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="text-gray-900">{selectedItem.status}</p>
                    </div>
                  </div>
                )}

                {selectedItem.type === 'team' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Team Name</label>
                      <p className="text-gray-900">{selectedItem.team_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="text-gray-900">{selectedItem.status}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
