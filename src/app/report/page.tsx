'use client'

import { useRouter } from 'next/navigation'
import SiteHeader from '@/components/common/SiteHeader'
import ReportForm from '@/components/reports/ReportForm'

// Stage 4 - Emergency Reporting System
export default function ReportPage() {
  const router = useRouter()
  return (
    <div className="page">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="text-2xl font-bold">Request help</h1>
        <p className="mt-1 text-sm text-gray-600">
          Only the location is required. Answer what you can - it helps responders reach the most urgent cases first.
        </p>
        <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          If a life is in danger and phone lines work, also call your local emergency number (Rescue 1122).
        </div>
        <div className="mt-4">
          <ReportForm onSubmitted={(report) => router.push(`/report/${report.id}?sent=1`)} />
        </div>
      </main>
    </div>
  )
}
