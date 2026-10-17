'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ReportPage() {
  const [formData, setFormData] = useState({
    locationAddress: '',
    locationLat: null as number | null,
    locationLng: null as number | null,
    peopleCount: 1,
    immediateDanger: false,
    injuryDetails: '',
    medicalNeeds: '',
    contactInfo: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      const reportData = {
        reporter_id: user?.id || null,
        location_lat: formData.locationLat,
        location_lng: formData.locationLng,
        location_address: formData.locationAddress,
        people_count: formData.peopleCount,
        immediate_danger: formData.immediateDanger,
        injury_details: formData.injuryDetails || null,
        medical_needs: formData.medicalNeeds || null,
        contact_info: formData.contactInfo || null
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit report')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            locationLat: position.coords.latitude,
            locationLng: position.coords.longitude
          })
          setError('')
        },
        (error) => {
          setError('Unable to get your location. Please enter it manually.')
        }
      )
    } else {
      setError('Geolocation is not supported by your browser.')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted</h2>
          <p className="text-gray-600 mb-6">
            Your emergency report has been submitted successfully. Responders have been notified.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Emergency Report</h1>
            <p className="text-gray-600">
              Provide details about the emergency situation. Responders will be notified immediately.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  📍 Use My Current Location
                </button>
              </div>
              <input
                type="text"
                value={formData.locationAddress}
                onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                placeholder="Enter address or location description"
              />
            </div>

            <div>
              <label htmlFor="peopleCount" className="block text-sm font-medium text-gray-700 mb-2">
                Number of People Needing Assistance
              </label>
              <input
                id="peopleCount"
                type="number"
                min="1"
                value={formData.peopleCount}
                onChange={(e) => setFormData({ ...formData, peopleCount: parseInt(e.target.value) || 1 })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div className="flex items-center">
              <input
                id="immediateDanger"
                type="checkbox"
                checked={formData.immediateDanger}
                onChange={(e) => setFormData({ ...formData, immediateDanger: e.target.checked })}
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="immediateDanger" className="ml-2 text-sm text-gray-700">
                Immediate danger to life (fire, flooding, structural collapse, etc.)
              </label>
            </div>

            <div>
              <label htmlFor="injuryDetails" className="block text-sm font-medium text-gray-700 mb-2">
                Injury Details (Optional)
              </label>
              <textarea
                id="injuryDetails"
                value={formData.injuryDetails}
                onChange={(e) => setFormData({ ...formData, injuryDetails: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                placeholder="Describe any injuries or immediate medical concerns"
              />
            </div>

            <div>
              <label htmlFor="medicalNeeds" className="block text-sm font-medium text-gray-700 mb-2">
                Medical Needs (Optional)
              </label>
              <textarea
                id="medicalNeeds"
                value={formData.medicalNeeds}
                onChange={(e) => setFormData({ ...formData, medicalNeeds: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                placeholder="Essential medications, medical equipment, or special care requirements"
              />
            </div>

            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information (Optional)
              </label>
              <input
                id="contactInfo"
                type="text"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                placeholder="Phone number or way to reach you"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Emergency Report'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
