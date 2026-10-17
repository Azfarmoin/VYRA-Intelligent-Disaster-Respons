'use client'

// Stage 6 - Responder triage dashboard: ranked queue + explanation + human override.
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SiteHeader from '@/components/common/SiteHeader'
import { DemoModeBanner, UpdatedDot } from '@/components/common/Badges'
import TriageQueue from '@/components/dashboard/TriageQueue'
import CaseDetail from '@/components/dashboard/CaseDetail'
import { AREAS, PRIORITIES, PRIORITY_LABELS, STATUSES, type Priority } from '@/lib/constants'
import { api, PRIORITY_STYLES, usePolledReports, type ReportDetail } from '@/lib/client'

function readActor() {
  try {
    return localStorage.getItem('vyra.actor') || ''
  } catch {
    return ''
  }
}

function Dashboard() {
  const router = useRouter()
  const selectedId = useSearchParams().get('id')
  const [area, setArea] = useState('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [status, setStatus] = useState('open')
  const [actor, setActor] = useState('')
  const [selected, setSelected] = useState<ReportDetail | null>(null)

  const query = useMemo(() => ({ area, priority, status }), [area, priority, status])
  const { reports, summary, mode, error, loading, lastUpdated, reload } = usePolledReports(api.triageQueue, query)

  useEffect(() => setActor(readActor()), [])
  const saveActor = (v: string) => {
    setActor(v)
    try {
      localStorage.setItem('vyra.actor', v)
    } catch {
      /* storage unavailable - name just won't be remembered */
    }
  }

  // Load the selected case (with history); refresh it whenever the queue refreshes.
  const loadSelected = useCallback(() => {
    if (!selectedId) return setSelected(null)
    api
      .getReport(selectedId)
      .then((r) => setSelected(r.report))
      .catch(() => setSelected(null))
  }, [selectedId])
  useEffect(loadSelected, [loadSelected, lastUpdated])

  const select = (id: string | null) => router.push(id ? `/dashboard?id=${id}` : '/dashboard', { scroll: false })

  return (
    <div className="page">
      <SiteHeader />
      <DemoModeBanner mode={mode} />
      <main className="mx-auto max-w-7xl px-4 py-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Triage dashboard</h1>
            <p className="text-sm text-gray-600">Suggested priorities with the reasons behind them. You make the final call.</p>
          </div>
          <div className="flex items-center gap-3">
            <UpdatedDot at={lastUpdated} error={error} />
            <label className="text-sm text-gray-600">
              Acting as{' '}
              <input className="input inline-block w-40 py-1" value={actor} onChange={(e) => saveActor(e.target.value)} placeholder="Your name" />
            </label>
          </div>
        </div>

        {summary && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-6">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setPriority(priority === p ? '' : p)}
                className={`card p-3 text-left ${priority === p ? 'ring-2 ring-gray-800' : ''}`}
                style={{ borderTop: `4px solid ${PRIORITY_STYLES[p].color}` }}
              >
                <p className="text-xs uppercase text-gray-500">{PRIORITY_LABELS[p]}</p>
                <p className="text-2xl font-bold">{summary.byPriority[p]}</p>
              </button>
            ))}
            <div className="card p-3">
              <p className="text-xs uppercase text-gray-500">Unverified</p>
              <p className="text-2xl font-bold text-amber-700">{summary.unverified}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs uppercase text-gray-500">Overridden</p>
              <p className="text-2xl font-bold text-purple-700">{summary.overridden}</p>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <select className="input w-44" value={area} onChange={(e) => setArea(e.target.value)} aria-label="Area">
            <option value="">All areas</option>
            {AREAS.map((a) => (
              <option key={a.name} value={a.name}>{a.name}</option>
            ))}
            <option value="Unassigned">Unassigned</option>
          </select>
          <select className="input w-44" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            <option value="open">Open cases</option>
            <option value="">All statuses</option>
            {Object.entries(STATUSES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select className="input w-40" value={priority} onChange={(e) => setPriority(e.target.value as Priority | '')} aria-label="Priority">
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
            ))}
          </select>
        </div>

        {error && <p className="mt-3 rounded bg-red-50 p-2 text-sm text-red-700">{error.message}</p>}

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <section className={selectedId ? 'hidden lg:block' : ''}>
            <TriageQueue reports={reports} selectedId={selectedId} onSelect={select} loading={loading} />
          </section>
          <section>
            {selected ? (
              <>
                <button className="btn-ghost mb-3 lg:hidden" onClick={() => select(null)}>← Back to queue</button>
                <CaseDetail
                  report={selected}
                  actor={actor.trim() || 'responder'}
                  onChange={(updated) => {
                    setSelected(updated)
                    reload()
                  }}
                />
              </>
            ) : (
              <div className="card hidden p-8 text-center text-sm text-gray-500 lg:block">
                {selectedId ? 'Loading case...' : 'Select a case to see why it was ranked and to take action.'}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  )
}
