import L from 'leaflet'
import type { Priority } from '@/lib/constants'
import { PRIORITY_STYLES } from '@/lib/client'

const cache = new Map<string, L.DivIcon>()

// Size and colour encode urgency; critical markers pulse; unverified reports get a dashed border;
// * marks a priority set by a responder.
export function reportIcon(priority: Priority, { verified = true, overridden = false } = {}) {
  const key = `${priority}-${verified}-${overridden}`
  const cached = cache.get(key)
  if (cached) return cached
  const { color, size } = PRIORITY_STYLES[priority]
  const letter = { critical: '!', high: 'H', medium: 'M', low: 'L' }[priority]
  const icon = L.divIcon({
    className: '',
    html: `<div class="vyra-marker ${verified ? '' : 'unverified'} ${priority === 'critical' ? 'pulse' : ''}"
             style="width:${size}px;height:${size}px;background:${color};--pulse:${color}">${letter}${overridden ? '*' : ''}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
  cache.set(key, icon)
  return icon
}

const squareIcon = (emoji: string, bg: string) =>
  L.divIcon({
    className: '',
    html: `<div class="vyra-square" style="width:28px;height:28px;background:${bg}">${emoji}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })

export const shelterIcon = (status: string) => squareIcon('🏠', status === 'open' ? '#16A34A' : '#94A3B8')

const TEAM_EMOJI: Record<string, string> = { boat: '🚤', medical: '⚕️', search_rescue: '🦺', fire: '🚒', logistics: '🚚' }
export const teamIcon = (type: string | null, status: string) =>
  squareIcon(TEAM_EMOJI[type || ''] || '👥', status === 'available' ? '#4F46E5' : '#A5B4FC')

export const pickerIcon = L.divIcon({
  className: '',
  html: '<div class="vyra-marker" style="width:22px;height:22px;background:#DC2626"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})
