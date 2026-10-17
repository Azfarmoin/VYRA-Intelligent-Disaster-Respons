'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Team {
  id: string
  team_name: string
  team_leader: string
  contact_number: string
  capabilities: string[]
  status: string
}

interface Resource {
  id: string
  resource_type: string
  quantity: number
  team_id: string | null
  status: string
  rescue_teams?: { team_name: string }
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

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState('teams')
  const [showAddModal, setShowAddModal] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [shelters, setShelters] = useState<Shelter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'teams') {
        const response = await fetch('/api/teams')
        if (response.ok) setTeams(await response.json())
      } else if (activeTab === 'resources') {
        const response = await fetch('/api/resources')
        if (response.ok) setResources(await response.json())
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'in_use': return 'bg-yellow-100 text-yellow-800'
      case 'maintenance': return 'bg-red-100 text-red-800'
      case 'open': return 'bg-green-100 text-green-800'
      case 'full': return 'bg-red-100 text-red-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'vehicle': return 'Vehicle'
      case 'boat': return 'Boat'
      case 'first_aid': return 'First Aid Kit'
      case 'medical_supplies': return 'Medical Supplies'
      case 'food': return 'Food'
      case 'water': return 'Water'
      default: return type
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                Dashboard
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
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'teams'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Rescue Teams
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'resources'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Resources
            </button>
            <button
              onClick={() => setActiveTab('shelters')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'shelters'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Shelters
            </button>
          </div>
        </div>

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Rescue Teams</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Add Team
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Leader
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capabilities
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teams.map((team: Team) => (
                    <tr key={team.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {team.team_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {team.team_leader}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {team.contact_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {team.capabilities.map((cap: string) => (
                            <span key={cap} className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}>
                          {team.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-teal-600 hover:text-teal-900 font-medium">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Resources</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Add Resource
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {resources.map((resource: Resource) => (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getResourceTypeLabel(resource.resource_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {resource.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {resource.rescue_teams?.team_name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                          {resource.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-teal-600 hover:text-teal-900 font-medium">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Shelters Tab */}
        {activeTab === 'shelters' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Shelters</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Add Shelter
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Occupancy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {shelters.map((shelter: Shelter) => (
                    <tr key={shelter.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {shelter.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shelter.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shelter.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shelter.current_occupancy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shelter.contact_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shelter.status)}`}>
                          {shelter.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-teal-600 hover:text-teal-900 font-medium">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Modal (placeholder) */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add {activeTab === 'teams' ? 'Team' : activeTab === 'resources' ? 'Resource' : 'Shelter'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Form to add {activeTab} will be implemented here with API integration.
              </p>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
