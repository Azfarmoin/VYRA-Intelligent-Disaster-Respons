import { randomUUID } from 'node:crypto'
import type { DataStore } from './store'
import { StoreError } from './store'
import type { ReportEvent, ReportRow } from '../types'
import { demoReports, demoShelters, demoTeams, demoRoadBlocks } from './demoSeed'

// In-memory store for demos without Supabase (data resets when the server restarts).
export function createMemoryStore({ seed = true } = {}): DataStore {
  const reports = new Map<string, ReportRow>()
  const events: ReportEvent[] = []
  const clone = <T,>(x: T): T => structuredClone(x)

  if (seed) {
    for (const r of demoReports()) {
      reports.set(r.id, r)
      events.push({ id: randomUUID(), report_id: r.id, action: 'created', actor: 'seed', from_value: null, to_value: null, note: 'Simulated demo report', created_at: r.created_at })
    }
  }

  return {
    mode: 'demo',

    async insertReport(report) {
      if (report.client_id && [...reports.values()].some((r) => r.client_id === report.client_id)) {
        throw new StoreError('duplicate client_id', 409)
      }
      const now = new Date().toISOString()
      const row: ReportRow = { ...clone(report), id: randomUUID(), created_at: now, updated_at: now }
      reports.set(row.id, row)
      return clone(row)
    },

    async findReportByClientId(clientId) {
      const r = [...reports.values()].find((x) => x.client_id === clientId)
      return r ? clone(r) : null
    },

    async getReport(id) {
      const r = reports.get(id)
      return r ? clone(r) : null
    },

    async listReports(filter) {
      return [...reports.values()]
        .filter((r) => !filter.area || r.area === filter.area)
        .filter((r) => !filter.statuses?.length || filter.statuses.includes(r.status))
        .filter((r) => filter.verified == null || r.verified === filter.verified)
        .filter((r) => {
          if (!filter.bbox) return true
          const [minLng, minLat, maxLng, maxLat] = filter.bbox
          return r.location_lng >= minLng && r.location_lng <= maxLng && r.location_lat >= minLat && r.location_lat <= maxLat
        })
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map(clone)
    },

    async updateReport(id, patch) {
      const r = reports.get(id)
      if (!r) throw new StoreError('Report not found', 404)
      const updated = { ...r, ...clone(patch), id, updated_at: new Date().toISOString() }
      reports.set(id, updated)
      return clone(updated)
    },

    async addEvent(event) {
      events.push({ ...clone(event), id: randomUUID(), created_at: new Date().toISOString() })
    },

    async listEvents(reportId) {
      return events.filter((e) => e.report_id === reportId).map(clone)
    },

    async mapLayers(area) {
      const inArea = <T extends { area: string | null; verified: boolean }>(x: T) => x.verified && (!area || x.area === area)
      return {
        shelters: demoShelters.filter(inArea).map(clone),
        teams: demoTeams.filter(inArea).filter((t) => t.status !== 'unavailable').map(clone),
        roadBlocks: demoRoadBlocks.filter(inArea).map(clone),
      }
    },
  }
}
