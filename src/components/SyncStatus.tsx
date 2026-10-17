'use client'

import { useEffect, useState } from 'react'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { clearSyncedReports, QueuedReport } from '@/lib/offlineQueue'

const STATUS_STYLES: Record<QueuedReport['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  syncing: 'bg-blue-100 text-blue-800',
  synced: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
}

const STATUS_LABELS: Record<QueuedReport['status'], string> = {
  pending: 'Waiting to upload',
  syncing: 'Uploading…',
  synced: 'Uploaded',
  failed: 'Failed'
}

export default function SyncStatus() {
  const { supported, online, entries, pendingCount, failedCount, syncing, lastSync, syncNow, retry, discard } =
    useOfflineSync()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined)
    }
    navigator.storage?.persist?.().catch(() => undefined)
  }, [])

  if (!supported) return null

  const dotColor = !online ? 'bg-red-500' : syncing ? 'bg-blue-500 animate-pulse' : pendingCount || failedCount ? 'bg-yellow-500' : 'bg-green-500'
  const summary = !online
    ? `Offline${pendingCount ? ` · ${pendingCount} queued` : ''}`
    : syncing
      ? 'Syncing reports…'
      : failedCount
        ? `${failedCount} report${failedCount > 1 ? 's' : ''} need attention`
        : pendingCount
          ? `${pendingCount} waiting to sync`
          : 'Online · All synced'

  return (
    <div className="fixed bottom-4 right-4 z-[1000] flex flex-col items-end gap-2" data-testid="sync-status">
      {open && (
        <div className="w-80 max-h-[60vh] overflow-y-auto bg-white rounded-lg shadow-xl border p-4 text-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Offline report queue</h3>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
              ✕
            </button>
          </div>
          <p className="text-gray-600 mb-3">
            {online
              ? 'Connected. Queued reports upload automatically.'
              : 'No connection. Reports are saved on this device and will upload when the connection returns.'}
          </p>
          {lastSync && (
            <p className="text-xs text-gray-500 mb-3">
              Last sync {lastSync.at.toLocaleTimeString()}: {lastSync.result.synced} uploaded
              {lastSync.result.duplicates ? `, ${lastSync.result.duplicates} already on server` : ''}
              {lastSync.result.failed ? `, ${lastSync.result.failed} failed` : ''}
            </p>
          )}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => void syncNow()}
              disabled={!online || syncing || !pendingCount}
              className="flex-1 px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {syncing ? 'Syncing…' : 'Sync now'}
            </button>
            <button
              onClick={() => void clearSyncedReports()}
              disabled={!entries.some(e => e.status === 'synced')}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Clear uploaded
            </button>
          </div>
          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-2">No reports stored on this device.</p>
          ) : (
            <ul className="space-y-2">
              {entries.map(entry => (
                <li key={entry.client_id} className="border rounded-md p-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-gray-900 truncate">
                      {entry.payload.location_address || 'GPS location'}
                    </span>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[entry.status]}`}>
                      {STATUS_LABELS[entry.status]}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {entry.payload.people_count} people · saved {new Date(entry.created_at).toLocaleString()}
                    {entry.attempts > 0 && entry.status !== 'synced' ? ` · ${entry.attempts} attempt(s)` : ''}
                  </div>
                  {entry.duplicate && (
                    <div className="text-xs text-gray-600 mt-1">Server already had this report – not duplicated.</div>
                  )}
                  {entry.last_error && entry.status !== 'synced' && (
                    <div className="text-xs text-red-600 mt-1">{entry.last_error}</div>
                  )}
                  {entry.status === 'failed' && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => void retry(entry.client_id)} className="text-xs text-teal-700 font-medium">
                        Retry
                      </button>
                      <button onClick={() => void discard(entry.client_id)} className="text-xs text-red-600 font-medium">
                        Discard
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border text-sm font-medium text-gray-800 hover:bg-gray-50"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
        {summary}
      </button>
    </div>
  )
}
