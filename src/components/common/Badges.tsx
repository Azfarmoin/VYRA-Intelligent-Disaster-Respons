import { PRIORITY_LABELS, STATUSES, type Priority, type Status } from '@/lib/constants'
import { PRIORITY_STYLES, STATUS_STYLES } from '@/lib/client'

export function PriorityBadge({ priority, small = false }: { priority: Priority; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md font-bold uppercase tracking-wide ${PRIORITY_STYLES[priority].badge} ${
        small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs'
      }`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>{STATUSES[status]}</span>
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-200">Verified</span>
  ) : (
    <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">Unverified</span>
  )
}

export function UpdatedDot({ at, error }: { at: Date | null; error?: Error | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500" title="Refreshes every 15 seconds">
      <span className={`h-2 w-2 rounded-full ${error ? 'bg-red-500' : 'animate-pulse bg-green-500'}`} />
      {error ? 'Connection problem' : at ? `Updated ${at.toLocaleTimeString([], { timeStyle: 'short' })}` : 'Loading...'}
    </span>
  )
}

export function DemoModeBanner({ mode }: { mode?: string }) {
  if (mode !== 'demo') return null
  return (
    <div className="bg-amber-100 px-4 py-1.5 text-center text-xs text-amber-900">
      Demo mode: simulated data held in memory (VYRA_DATA_MODE=demo). Nothing is saved to Supabase.
    </div>
  )
}
