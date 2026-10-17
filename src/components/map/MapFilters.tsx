'use client'

import { AREAS, PRIORITIES, PRIORITY_LABELS, STATUSES, type Priority } from '@/lib/constants'
import { PRIORITY_STYLES } from '@/lib/client'
import type { ReportSummary } from '@/lib/types'
import type { LayerToggles } from './DisasterMap'

export type MapFilterState = { area: string; status: string; priority: Priority[]; verified: '' | 'true' }

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
      <input type="checkbox" className="h-4 w-4 accent-teal-600" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  )
}

export default function MapFilters({
  filters,
  setFilters,
  show,
  setShow,
  summary,
  layerCounts,
}: {
  filters: MapFilterState
  setFilters: React.Dispatch<React.SetStateAction<MapFilterState>>
  show: LayerToggles
  setShow: React.Dispatch<React.SetStateAction<LayerToggles>>
  summary: ReportSummary | null
  layerCounts: { shelters: number; teams: number; roadBlocks: number }
}) {
  const update = (patch: Partial<MapFilterState>) => setFilters((f) => ({ ...f, ...patch }))
  const togglePriority = (p: Priority) =>
    update({ priority: filters.priority.includes(p) ? filters.priority.filter((x) => x !== p) : [...filters.priority, p] })
  const layer = (k: keyof LayerToggles) => (v: boolean) => setShow((s) => ({ ...s, [k]: v }))

  return (
    <div className="space-y-5 text-sm">
      <div>
        <label className="label" htmlFor="map-area">Area</label>
        <select id="map-area" className="input" value={filters.area} onChange={(e) => update({ area: e.target.value })}>
          <option value="">All areas</option>
          {AREAS.map((a) => (
            <option key={a.name} value={a.name}>{a.name}</option>
          ))}
          <option value="Unassigned">Unassigned</option>
        </select>
      </div>

      <div>
        <label className="label" htmlFor="map-status">Status</label>
        <select id="map-status" className="input" value={filters.status} onChange={(e) => update({ status: e.target.value })}>
          <option value="open">Open cases (new, investigating, assigned)</option>
          <option value="">All statuses</option>
          {Object.entries(STATUSES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="label">Urgency</p>
        {PRIORITIES.map((p) => (
          <Toggle key={p} checked={filters.priority.includes(p)} onChange={() => togglePriority(p)}>
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: PRIORITY_STYLES[p].color }} />
            {PRIORITY_LABELS[p]}
            <span className="ml-auto text-xs text-gray-500">{summary?.byPriority[p] ?? ''}</span>
          </Toggle>
        ))}
        <Toggle checked={filters.verified === 'true'} onChange={(v) => update({ verified: v ? 'true' : '' })}>
          Verified reports only
        </Toggle>
      </div>

      <div>
        <p className="label">Layers</p>
        <Toggle checked={show.reports} onChange={layer('reports')}>Emergency reports</Toggle>
        <Toggle checked={show.shelters} onChange={layer('shelters')}>
          🏠 Shelters <span className="ml-auto text-xs text-gray-500">{layerCounts.shelters}</span>
        </Toggle>
        <Toggle checked={show.teams} onChange={layer('teams')}>
          🚤 Rescue teams <span className="ml-auto text-xs text-gray-500">{layerCounts.teams}</span>
        </Toggle>
        <Toggle checked={show.roadBlocks} onChange={layer('roadBlocks')}>
          <span className="inline-block w-5 border-t-4 border-dashed border-gray-900" /> Blocked roads
          <span className="ml-auto text-xs text-gray-500">{layerCounts.roadBlocks}</span>
        </Toggle>
        <p className="mt-1 text-xs text-gray-500">Only verified shelters, teams and road blocks are shown.</p>
      </div>

      <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
        <p className="mb-1 font-semibold text-gray-700">Legend</p>
        <p>Bigger, redder markers = more urgent. Pulsing <strong>!</strong> = critical.</p>
        <p>Dashed border = report not yet verified. <strong>*</strong> = priority set by a responder.</p>
      </div>
    </div>
  )
}
