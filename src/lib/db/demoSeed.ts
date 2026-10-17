// SIMULATED DATA ONLY - an urban flooding scenario in Karachi for demos and tests.
// Mirrors supabase/migrations/003_demo_seed.sql. Names and numbers are fictional.

import { nearestArea } from '../constants'
import { hasLifeThreat } from '../triage'
import type { BlockedRoad, NewReport, RescueTeam, Shelter } from '../types'

type SeedReport = Partial<NewReport> & { minutesAgo: number; resolvedMinutesAgo?: number; location_lat: number; location_lng: number }

const reports: SeedReport[] = [
  {
    minutesAgo: 35, location_lat: 24.8702, location_lng: 66.9912, location_source: 'gps', location_accuracy_m: 12,
    location_address: 'Behind Chakiwara market, blue gate', people_count: 6,
    dangers: ['rising_water', 'trapped'], danger_details: 'Water at chest level on the ground floor. Family is on the roof and cannot get out.',
    injury_severity: 'none', can_evacuate: 'no', vulnerabilities: ['elderly', 'infants_children'],
    contact_info: 'Simulated - A. Baloch · +92 300 0000001', verified: true, status: 'investigating',
  },
  {
    minutesAgo: 20, location_lat: 24.8335, location_lng: 67.1352, location_source: 'manual',
    location_address: 'Korangi sector 5, near the school', people_count: 1, dangers: ['stranded'],
    injury_severity: 'none', medical_need_types: ['dialysis'], medical_needs: 'Missed dialysis yesterday, roads to the hospital are flooded.',
    can_evacuate: 'no', vulnerabilities: ['elderly'], contact_info: 'Simulated - R. Khan · +92 300 0000002',
  },
  {
    minutesAgo: 8, location_lat: 24.8212, location_lng: 66.9781, location_source: 'gps', location_accuracy_m: 25,
    location_address: 'Keamari, near the fish harbour wall', people_count: 3, dangers: ['building_collapse'],
    danger_details: 'Part of the wall collapsed, one man is unconscious under debris.',
    injury_severity: 'critical', injury_count: 1, injury_details: 'Unconscious, bleeding from the head', can_evacuate: 'unknown',
  },
  {
    minutesAgo: 95, location_lat: 24.9215, location_lng: 67.0981, location_source: 'gps', location_accuracy_m: 40,
    location_address: 'Gulshan block 13, apartment block C', people_count: 40, dangers: ['no_food_water', 'no_shelter'],
    danger_details: 'Power out for two days, no clean water for the building.', injury_severity: 'none',
    medical_need_types: ['insulin', 'chronic_illness'], can_evacuate: 'yes', vulnerabilities: ['elderly', 'infants_children'],
    contact_info: 'Simulated - Building committee · +92 300 0000003', verified: true,
  },
  {
    minutesAgo: 5, location_lat: 24.9488, location_lng: 66.9875, location_source: 'manual',
    location_address: 'Orangi town, near the nullah bridge', people_count: null, dangers: [],
    danger_details: 'Please help, water everywhere', injury_severity: 'unknown', can_evacuate: 'unknown',
  },
  {
    minutesAgo: 50, location_lat: 24.8581, location_lng: 67.0205, location_source: 'gps', location_accuracy_m: 8,
    location_address: 'Saddar, Empress market side road', people_count: 2, dangers: ['electrocution'],
    danger_details: 'Electric pole fallen into flood water next to the house.', injury_severity: 'minor', injury_count: 1,
    can_evacuate: 'yes', verified: true, status: 'assigned',
  },
  {
    minutesAgo: 140, location_lat: 24.896, location_lng: 67.201, location_source: 'gps', location_accuracy_m: 15,
    location_address: 'Malir, near the river embankment', people_count: 12, dangers: ['rising_water'],
    injury_severity: 'serious', injury_count: 2, injury_details: 'Two people with fractures from a fall',
    medical_need_types: ['pregnancy_labor'], medical_needs: 'One woman is in labour.', can_evacuate: 'no',
    vulnerabilities: ['pregnant', 'infants_children'], contact_info: 'Simulated - Z. Ahmed · +92 300 0000004',
  },
  {
    minutesAgo: 70, location_lat: 24.815, location_lng: 67.0322, location_source: 'manual',
    location_address: 'Clifton block 2', people_count: 4, dangers: ['none'], injury_severity: 'none',
    medical_need_types: ['essential_medication'], medical_needs: 'Blood pressure medication will run out tomorrow.',
    can_evacuate: 'yes', vulnerabilities: ['elderly'], verified: true,
  },
  {
    minutesAgo: 15, location_lat: 24.9433, location_lng: 67.0418, location_source: 'gps', location_accuracy_m: 350,
    location_address: 'North Nazimabad block H', people_count: 8, dangers: ['stranded'],
    danger_details: 'Car stuck in underpass, people standing on the roof of the car', injury_severity: 'none',
    can_evacuate: 'unknown', vulnerabilities: ['disability'],
  },
  {
    minutesAgo: 300, resolvedMinutesAgo: 120, location_lat: 24.847, location_lng: 67.1985, location_source: 'gps',
    location_accuracy_m: 20, location_address: 'Landhi, 89 stop', people_count: 5, dangers: ['no_shelter'],
    injury_severity: 'none', can_evacuate: 'yes', verified: true, status: 'resolved',
  },
]

const ago = (min: number, now: number) => new Date(now - min * 60_000).toISOString()

export function demoReports(now = Date.now()) {
  return reports.map(({ minutesAgo, resolvedMinutesAgo, ...r }, i) => {
    const created = ago(minutesAgo, now)
    const row = {
      reporter_id: null,
      client_id: `demo-seed-${i + 1}`,
      location_source: 'manual' as const,
      location_accuracy_m: null,
      location_address: null,
      people_count: null,
      dangers: [],
      danger_details: null,
      injury_severity: 'unknown' as const,
      injury_count: null,
      injury_details: null,
      medical_need_types: [],
      medical_needs: null,
      can_evacuate: 'unknown' as const,
      vulnerabilities: [],
      contact_info: null,
      status: 'pending' as const,
      verified: false,
      triage_override: null,
      priority_score: 0,
      priority_explanation: null,
      ...r,
      area: nearestArea(r.location_lat, r.location_lng),
      immediate_danger: hasLifeThreat(r.dangers),
      resolved_at: resolvedMinutesAgo != null ? ago(resolvedMinutesAgo, now) : null,
    }
    return { ...row, id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`, created_at: created, updated_at: created }
  })
}

let n = 0
const id = () => `10000000-0000-4000-8000-${String(++n).padStart(12, '0')}`

export const demoShelters: Shelter[] = [
  { id: id(), name: 'Govt. Boys School Shelter (Lyari)', location_lat: 24.874, location_lng: 66.999, address: null, area: 'Lyari', capacity: 300, current_occupancy: 210, services: ['food', 'water', 'medical'], status: 'open', verified: true },
  { id: id(), name: 'Community Hall Gulshan', location_lat: 24.918, location_lng: 67.089, address: null, area: 'Gulshan-e-Iqbal', capacity: 150, current_occupancy: 150, services: ['food', 'water'], status: 'full', verified: true },
  { id: id(), name: 'Malir Relief Camp', location_lat: 24.901, location_lng: 67.19, address: null, area: 'Malir', capacity: 500, current_occupancy: 180, services: ['food', 'water', 'medical', 'power'], status: 'open', verified: true },
  { id: id(), name: 'Korangi Sports Complex', location_lat: 24.827, location_lng: 67.122, address: null, area: 'Korangi', capacity: 400, current_occupancy: 90, services: ['water', 'power'], status: 'open', verified: true },
  // Unverified - must NOT appear on the responder map.
  { id: id(), name: 'Rumoured shelter at mosque', location_lat: 24.945, location_lng: 66.995, address: null, area: 'Orangi', capacity: null, current_occupancy: 0, services: [], status: 'open', verified: false },
]

export const demoTeams: RescueTeam[] = [
  { id: id(), team_name: 'Boat Team Alpha', team_type: 'boat', capabilities: ['water rescue'], current_location_lat: 24.865, current_location_lng: 66.998, area: 'Lyari', status: 'assigned', verified: true },
  { id: id(), team_name: 'Medical Unit 3', team_type: 'medical', capabilities: ['first aid', 'ambulance'], current_location_lat: 24.86, current_location_lng: 67.025, area: 'Saddar', status: 'available', verified: true },
  { id: id(), team_name: 'Search & Rescue Bravo', team_type: 'search_rescue', capabilities: ['collapse rescue'], current_location_lat: 24.83, current_location_lng: 67.125, area: 'Korangi', status: 'available', verified: true },
  { id: id(), team_name: 'Boat Team Charlie', team_type: 'boat', capabilities: ['water rescue'], current_location_lat: 24.892, current_location_lng: 67.195, area: 'Malir', status: 'available', verified: true },
  { id: id(), team_name: 'Logistics Truck 7', team_type: 'logistics', capabilities: ['supplies'], current_location_lat: 24.923, current_location_lng: 67.09, area: 'Gulshan-e-Iqbal', status: 'unavailable', verified: true },
]

export const demoRoadBlocks: BlockedRoad[] = [
  { id: id(), description: 'Lyari Expressway underpass flooded', reason: 'flooding', area: 'Lyari', path: [[24.862, 66.988], [24.866, 66.995], [24.87, 67.001]], verified: true },
  { id: id(), description: 'Korangi Road submerged near Qayyumabad', reason: 'flooding', area: 'Korangi', path: [[24.836, 67.088], [24.834, 67.1], [24.832, 67.11]], verified: true },
  { id: id(), description: 'Debris on Malir River bridge approach', reason: 'debris', area: 'Malir', path: [[24.885, 67.18], [24.888, 67.186]], verified: true },
  // Unverified - hidden from the map.
  { id: id(), description: 'Possible block on University Road', reason: 'other', area: 'Gulshan-e-Iqbal', path: [[24.93, 67.1], [24.935, 67.11]], verified: false },
]
