'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SiteHeader from '@/components/common/SiteHeader'
import { StatusBadge } from '@/components/common/Badges'
import { api, formatTime, shortId, type PublicReport } from '@/lib/client'

// What a reporter sees after sending: reference number and current status only.
export default function ReportStatusPage({ params }: { params: { id: string } }) {
  const justSent = useSearchParams().get('sent') === '1'
  const [report, setReport] = useState<PublicReport | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const load = () =>
      api
        .publicStatus(params.id)
        .then((r) => setReport(r.report))
        .catch(() => setNotFound(true))
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [params.id])

  return (
    <div className="page">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-10">
        {!report ? (
          <p className="text-center text-gray-500">{notFound ? 'Report not found.' : 'Loading...'}</p>
        ) : (
          <div className="card p-6 text-center">
            {justSent && <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">✓</div>}
            <h1 className="text-xl font-bold">{justSent ? 'Your report was received' : 'Report status'}</h1>
            <p className="mt-2 text-sm text-gray-600">Reference number</p>
            <p className="font-mono text-2xl font-bold tracking-widest">{shortId(report.id)}</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <StatusBadge status={report.status} />
              {report.area && <span className="text-sm text-gray-500">{report.area}</span>}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Sent {formatTime(report.created_at)} · updated {formatTime(report.updated_at)}
            </p>
            <div className="mt-6 space-y-2 text-left text-sm text-gray-700">
              <p>
                <strong>What happens next:</strong> responders review every report and send help to the most urgent cases first.
              </p>
              <p>Stay somewhere as safe and high as possible. Keep your phone charged and nearby in case responders call back.</p>
              <p>If your situation gets worse, send a new report with the new details.</p>
            </div>
            <Link href="/report" className="btn-ghost mt-6">Send another report</Link>
            <p className="mt-4 text-xs text-gray-400">Bookmark this page to check your status later.</p>
          </div>
        )}
      </main>
    </div>
  )
}
