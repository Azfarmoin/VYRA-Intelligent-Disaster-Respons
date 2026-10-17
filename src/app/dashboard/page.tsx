'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AssignTeamModal from '@/components/AssignTeamModal'

interface Report {
  id: string
  location_address: string
  people_count: number
  immediate_danger: boolean
  injury_details: string | null
  medical_needs: string | null
  status: string
  priority_score: number
  created_at: string
}

interface ReportDispatch {
  id: string
  status: string
  assigned_at: string
  rescue_teams: { team_name: string } | null
}

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [assigningReport, setAssigningReport] = useState<Report | null>(null)
  const [reportDispatches, setReportDispatches] = useState<ReportDispatch[]>([])

  useEffect(() => {
    if (!selectedReport) return setReportDispatches([])
    fetch(`/api/dispatches?report_id=${selectedReport.id}`)
      .then(res => (res.ok ? res.json() : []))
      .then(setReportDispatches)
      .catch(() => setReportDispatches([]))
  }, [selectedReport])

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchReports()
        setSelectedReport(null)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const filteredReports = reports.filter((report: Report) => 
    filterStatus === 'all' || report.status === filterStatus
  )

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800 border-red-200'
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'investigating': return 'bg-blue-100 text-blue-800'
      case 'assigned': return 'bg-purple-100 text-purple-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
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
              <h1 className="text-2xl font-bold text-gray-900">Responder Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/map" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                View Map
              </Link>
              <Link href="/dispatches" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Dispatches
              </Link>
              <Link href="/resources" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Resources
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-900">{reports.length}</div>
            <div className="text-gray-600 text-sm">Total Reports</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-red-600">
              {reports.filter((r: Report) => r.status === 'pending').length}
            </div>
            <div className="text-gray-600 text-sm">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">
              {reports.filter((r: Report) => r.status === 'investigating').length}
            </div>
            <div className="text-gray-600 text-sm">Investigating</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-purple-600">
              {reports.filter((r: Report) => r.status === 'assigned').length}
            </div>
            <div className="text-gray-600 text-sm">Assigned</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <div className="flex gap-2">
              {['all', 'pending', 'investigating', 'assigned', 'resolved'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    People
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.map((report: Report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(report.priority_score)}`}>
                        {report.priority_score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.location_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.people_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-teal-600 hover:text-teal-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900">{selectedReport.location_address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">People Affected</label>
                    <p className="text-gray-900">{selectedReport.people_count}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority Score</label>
                    <p className="text-gray-900">{selectedReport.priority_score}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Immediate Danger</label>
                  <p className="text-gray-900">
                    {selectedReport.immediate_danger ? 'Yes' : 'No'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Injury Details</label>
                  <p className="text-gray-900">{selectedReport.injury_details || 'None reported'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Medical Needs</label>
                  <p className="text-gray-900">{selectedReport.medical_needs || 'None reported'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-gray-900">
                    {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Update Status</label>
                  <div className="flex gap-2">
                    {['pending', 'investigating', 'assigned', 'resolved'].map(status => (
                      <button
                        key={status}
                        onClick={() => updateReportStatus(selectedReport.id, status)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedReport.status === status
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-500 mb-2 block">Team Assignments</label>
                  {reportDispatches.length === 0 ? (
                    <p className="text-sm text-gray-500 mb-3">No team assigned yet.</p>
                  ) : (
                    <ul className="space-y-1 mb-3">
                      {reportDispatches.map(d => (
                        <li key={d.id} className="text-sm text-gray-800 flex justify-between">
                          <span>{d.rescue_teams?.team_name ?? 'Team'} · {new Date(d.assigned_at).toLocaleTimeString()}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {d.status.replace('_', ' ')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAssigningReport(selectedReport)}
                      disabled={selectedReport.status === 'resolved'}
                      className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
                    >
                      Assign Rescue Team
                    </button>
                    {reportDispatches.length > 0 && (
                      <Link
                        href="/dispatches"
                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Track
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {assigningReport && (
        <AssignTeamModal
          reportId={assigningReport.id}
          reportLabel={`${assigningReport.location_address} · ${assigningReport.people_count} people · priority ${assigningReport.priority_score}`}
          onClose={() => setAssigningReport(null)}
          onAssigned={async () => {
            setAssigningReport(null)
            setSelectedReport(null)
            await fetchReports()
          }}
        />
      )}
    </div>
  )
}
