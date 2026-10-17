'use client'

import { useState } from 'react'
import Link from 'next/link'
import TriageExplanation from './TriageExplanation'
import OverrideForm from './OverrideForm'
import { PriorityBadge, StatusBadge, VerifiedBadge } from '../common/Badges'
import { DANGERS, EVACUATION_ABILITY, INJURY_SEVERITIES, MEDICAL_NEEDS, STATUSES, VULNERABILITIES, type Status } from '@/lib/constants'
import { api, formatTime, formatWait, labelList, shortId, type ReportDetail } from '@/lib/client'

const NEXT_STATUS: Record<Status, Status[]> = {
  pending: ['investigating', 'assigned', 'cancelled'],
  investigating: ['assigned', 'resolved', 'cancelled'],
  assigned: ['resolved', 'investigating'],
  resolved: ['investigating'],
  cancelled: ['pending'],
}

const HISTORY_LABEL: Record<string, string> = {
  created: 'Report received',
  status: 'Status changed',
  verify: 'Verification changed',
  override: 'Priority overridden',
  override_cleared: 'Override removed',
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  if (children == null || children === '' || children === false) return null
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-2 py-1 text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

const Unknown = ({ children }: { children: React.ReactNode }) => <em className="text-amber-700">{children}</em>

export default function CaseDetail({ report: r, actor, onChange }: { report: ReportDetail; actor: string; onChange: (r: ReportDetail) => void }) {
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const act = async (fn: () => Promise<{ report: ReportDetail }>) => {
    setBusy(true)
    setError(null)
    try {
      onChange((await fn()).report)
      setNote('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={r.priority} />
          <StatusBadge status={r.status} />
          <VerifiedBadge verified={r.verified} />
          <span className="ml-auto text-xs text-gray-500">#{shortId(r.id)}</span>
        </div>
        <h2 className="mt-2 text-lg font-semibold">
          {r.area} {r.location_address && <span className="font-normal text-gray-600">· {r.location_address}</span>}
        </h2>
        <p className="text-sm text-gray-500">
          Received {formatTime(r.created_at)} · waiting {formatWait(r.triage.waitingMinutes)} ·{' '}
          <Link className="text-primary-700 underline" href="/map">view on map</Link>
        </p>
      </div>

      <div className="card p-4">
        <h3 className="mb-3 font-semibold">Why this priority?</h3>
        <TriageExplanation report={r} />
      </div>

      <div className="card p-4">
        <h3 className="mb-2 font-semibold">Reported details</h3>
        <dl>
          <Row label="People">{r.people_count ?? <Unknown>unknown</Unknown>}</Row>
          <Row label="Dangers">{r.dangers.length ? labelList(r.dangers, DANGERS) : <Unknown>not reported</Unknown>}</Row>
          <Row label="Description">{r.danger_details}</Row>
          <Row label="Injuries">
            {INJURY_SEVERITIES[r.injury_severity]}
            {r.injury_count ? ` · ${r.injury_count} injured` : ''}
            {r.injury_details ? ` · ${r.injury_details}` : ''}
          </Row>
          <Row label="Medical needs">{labelList(r.medical_need_types, MEDICAL_NEEDS)}</Row>
          <Row label="Medical details">{r.medical_needs}</Row>
          <Row label="Evacuation">{EVACUATION_ABILITY[r.can_evacuate]}</Row>
          <Row label="Vulnerable">{labelList(r.vulnerabilities, VULNERABILITIES)}</Row>
          <Row label="Location">
            {r.location_lat.toFixed(5)}, {r.location_lng.toFixed(5)} (
            {r.location_source === 'gps' ? `GPS${r.location_accuracy_m ? ` ±${r.location_accuracy_m} m` : ''}` : 'selected on map'})
          </Row>
          <Row label="Contact">{r.contact_info || <span className="text-gray-400">none given</span>}</Row>
        </dl>
      </div>

      <div className="card space-y-3 p-4">
        <h3 className="font-semibold">Responder actions</h3>
        <input className="input" placeholder="Note for the history (optional)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />
        <div className="flex flex-wrap gap-2">
          {NEXT_STATUS[r.status].map((s) => (
            <button key={s} className="btn-ghost" disabled={busy} onClick={() => act(() => api.updateStatus(r.id, { status: s, note, by: actor }))}>
              Mark {STATUSES[s].toLowerCase()}
            </button>
          ))}
          <button className="btn-ghost" disabled={busy} onClick={() => act(() => api.setVerified(r.id, { verified: !r.verified, by: actor }))}>
            {r.verified ? 'Mark unverified' : 'Mark verified'}
          </button>
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <div className="border-t pt-3">
          <p className="label">Change priority</p>
          <OverrideForm key={r.id + r.updated_at} report={r} actor={actor} onSaved={onChange} />
        </div>
      </div>

      <div className="card p-4">
        <h3 className="mb-2 font-semibold">History</h3>
        <ol className="space-y-2 border-l-2 border-gray-200 pl-4">
          {[...r.history].reverse().map((h) => (
            <li key={h.id} className="text-sm">
              <p>
                <strong>{HISTORY_LABEL[h.action] || h.action}</strong>
                {h.from_value != null && h.to_value != null && (
                  <span className="text-gray-600"> · {h.from_value} → {h.to_value}</span>
                )}
              </p>
              {h.note && <p className="text-gray-600">{h.note}</p>}
              <p className="text-xs text-gray-400">
                {formatTime(h.created_at)} · {h.actor}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
