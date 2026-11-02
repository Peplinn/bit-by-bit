import type {
  BikeRack,
  BusPosition,
  BusProfile,
  Dated,
  EquipmentStatus,
  SeatingDirection,
} from './types'

// Delays smaller than this (either direction) count as "On time".
export const ON_TIME_WINDOW_SECONDS = 60

// A bus whose last report is older than this counts as not reporting.
export const STALE_AFTER_SECONDS = 180

// After this long without a report, a bus's punctuality is too old to show and becomes "—".
export const PUNCTUALITY_EXPIRES_AFTER_SECONDS = 600

export type PunctualityStatus = 'early' | 'late' | 'on-time' | 'unknown'

// Tailwind text colour for each punctuality status.
export const PUNCTUALITY_COLOR: Record<PunctualityStatus, string> = {
  early: 'text-blue-600',
  late: 'text-red-600',
  'on-time': '',
  unknown: 'text-muted-foreground',
}

export const SEATING_LABEL: Record<SeatingDirection, string> = {
  forward: 'Forward',
  sideways: 'Sideways',
}

export const BIKE_RACK_LABEL: Record<BikeRack, string> = {
  front: 'Front-Rack',
  rear: 'Rear-Rack',
}

export const EQUIPMENT_STATUS_LABEL: Record<EquipmentStatus, string> = {
  working: 'Working',
  'sub-optimal': 'Sub-Optimal',
  faulty: 'Faulty',
}

export function secondsSinceUpdate(bus: BusPosition, now: number): number {
  return (now - Date.parse(bus.last_update)) / 1000
}

export function isReporting(bus: BusPosition, now: number): boolean {
  return secondsSinceUpdate(bus, now) <= STALE_AFTER_SECONDS
}

// "Sherbrooke - East"
export function formatRoute(bus: BusPosition): string {
  return `${bus.route_name} - ${bus.direction_name}`
}

// How long ago a position was reported, in coarser steps as it gets older:
// 1 s steps under 10 s, 10 s steps under 1 min, 2 min steps (1m, 3m) under 4 min, then "4m+".
// The clock ticks every second, but the text only changes at those steps.
export function formatAge(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  if (s < 10) return `${s}s`
  if (s < 60) return `${Math.floor(s / 10) * 10}s`
  if (s < 240) return `${1 + Math.floor((s - 60) / 120) * 2}m`
  return '4m+'
}

export function formatNextStop(bus: BusPosition): string {
  return bus.next_stop ?? 'Unknown'
}

export function punctualityStatus(delaySeconds: number | undefined): PunctualityStatus {
  if (delaySeconds === undefined) return 'unknown'
  if (Math.abs(delaySeconds) < ON_TIME_WINDOW_SECONDS) return 'on-time'
  return delaySeconds > 0 ? 'late' : 'early'
}

export function formatPunctuality(delaySeconds: number | undefined): string {
  if (delaySeconds === undefined) return 'Unknown'
  if (Math.abs(delaySeconds) < ON_TIME_WINDOW_SECONDS) return 'On time'
  const minutes = Math.round(Math.abs(delaySeconds) / 60)
  return `${minutes} min ${delaySeconds > 0 ? 'late' : 'early'}`
}

export function isPunctualityExpired(bus: BusPosition, now: number): boolean {
  return secondsSinceUpdate(bus, now) >= PUNCTUALITY_EXPIRES_AFTER_SECONDS
}

const DAY_MS = 24 * 60 * 60 * 1000

// How long ago a date was: "today", "12d ago", or "2m ago" (months, counted as 30 days).
export function formatDaysAgo(isoDate: string, now: number): string {
  const days = Math.floor((now - Date.parse(isoDate)) / DAY_MS)
  if (days < 1) return 'today'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}m ago`
}

// One line of the bus popup's "About this bus" list. A list `value` is shown as tags.
// No `value` means nobody has supplied it yet.
export interface ProfileRow {
  label: string
  value?: string | string[]
  date?: string
}

function profileRow<T>(
  label: string,
  field: Dated<T> | undefined,
  show: (value: T) => string | string[],
): ProfileRow {
  return field ? { label, value: show(field.value), date: field.date } : { label }
}

export function profileRows(profile: BusProfile | undefined): ProfileRow[] {
  return [
    profileRow('Make and model', profile?.make_model, (v) => v),
    profileRow('Seating', profile?.seating, (v) => v.map((d) => SEATING_LABEL[d])),
    profileRow('Seats', profile?.seated_capacity, String),
    profileRow('Standing room', profile?.standing_capacity, String),
    profileRow('Bike rack', profile?.bike_racks, (v) =>
      v.length === 0 ? ['None'] : v.map((r) => BIKE_RACK_LABEL[r]),
    ),
    profileRow('Next-stop info', profile?.next_stop_info, (v) => [
      `Display: ${v.display ? EQUIPMENT_STATUS_LABEL[v.display] : 'Unknown'}`,
      `Audio: ${v.audio ? EQUIPMENT_STATUS_LABEL[v.audio] : 'Unknown'}`,
    ]),
    profileRow('Appearance', profile?.appearance, (v) => v),
  ]
}

// True when the search text appears in any of the visible columns.
export function matchesSearch(bus: BusPosition, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (needle === '') return true
  const haystack = [bus.route_code, formatRoute(bus), bus.vehicle_id, bus.next_stop ?? '']
  return haystack.some((value) => String(value).toLowerCase().includes(needle))
}
