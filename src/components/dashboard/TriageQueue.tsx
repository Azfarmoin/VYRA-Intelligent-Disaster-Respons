import { PriorityBadge, StatusBadge } from '../common/Badges'
import { PRIORITY_STYLES, formatWait, shortId } from '@/lib/client'
import type { TriagedReport } from '@/lib/types'

export default function TriageQueue({
  reports,
  selectedId,
  onSelect,
  loading = false,
}: {
  reports: TriagedReport[]
  selectedId: string | null
  onSelect: (id: string) => void
  loading?: boolean
}) {
  if (loading && !reports.length) return <p className="card p-6 text-center text-sm text-gray-500">Loading cases...</p>
  if (!reports.length) return <p className="card p-6 text-center text-sm text-gray-500">No cases match these filters.</p>

  return (
    <ol className="space-y-2">
      {reports.map((r, i) => (
        <li key={r.id}>
          <button
            onClick={() => onSelect(r.id)}
            className={`w-full rounded-xl border bg-white p-3 text-left text-gray-900 shadow-sm transition hover:shadow ${
              selectedId === r.id ? `ring-2 ${PRIORITY_STYLES[r.priority].ring}` : 'border-gray-200'
            }`}
            style={{ borderLeft: `6px solid ${PRIORITY_STYLES[r.priority].color}` }}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 text-xs font-semibold text-gray-400">{i + 1}</span>
              <PriorityBadge priority={r.priority} small />
              {r.overridden && <span className="text-[10px] font-semibold uppercase text-purple-700">override</span>}
              <StatusBadge status={r.status} />
              <span className="ml-auto font-mono text-xs text-gray-500">score {r.triage.score}</span>
            </div>
            <p className="mt-1.5 text-sm font-medium">
              {r.area} <span className="font-normal text-gray-500">#{shortId(r.id)}</span>
              {!r.verified && <span className="ml-1 text-xs font-normal text-amber-700">· unverified</span>}
            </p>
            <p className="text-xs text-gray-500">
              {r.people_count ? `${r.people_count} ${r.people_count === 1 ? 'person' : 'people'}` : 'people unknown'} · waiting {formatWait(r.triage.waitingMinutes)}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-gray-600">
              {r.triage.factors
                .slice(0, 3)
                .map((f) => `${f.category} (+${f.points})`)
                .join(' · ') || 'No risk factors reported'}
            </p>
          </button>
        </li>
      ))}
    </ol>
  )
}
