import type { BusPosition, BusProfile, NextStopDisplay } from './types'

// Delays smaller than this (either direction) count as "On time".
export const ON_TIME_WINDOW_SECONDS = 60

// A bus whose last report is older than this counts as not reporting.
export const STALE_AFTER_SECONDS = 180

export type PunctualityStatus = 'early' | 'late' | 'on-time' | 'unknown'

// Tailwind text colour for each punctuality status.
export const PUNCTUALITY_COLOR: Record<PunctualityStatus, string> = {
  early: 'text-blue-600',
  late: 'text-red-600',
  'on-time': '',
  unknown: 'text-muted-foreground',
}

export const NEXT_STOP_DISPLAY_LABEL: Record<NextStopDisplay, string> = {
  working: 'Working',
  faulty: 'Not working reliably',
  none: 'None fitted',
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

export function formatLastUpdated(bus: BusPosition, now: number): string {
  const minutes = Math.round(secondsSinceUpdate(bus, now) / 60)
  return `Last updated ${minutes} min ago`
}

// Every profile field as a label/value pair. Missing values stay undefined so the popup can
// show which details are still unknown.
export function profileRows(profile: BusProfile | undefined): { label: string; value?: string }[] {
  const text = (value: string | number | undefined) => (value === undefined ? undefined : String(value))
  return [
    { label: 'Make and model', value: profile?.make_model },
    { label: 'Seating', value: profile?.seating_layout },
    { label: 'Seats', value: text(profile?.seated_capacity) },
    { label: 'Standing room', value: text(profile?.standing_capacity) },
    { label: 'Bike rack', value: profile?.bike_rack },
    {
      label: 'Next-stop display',
      value: profile?.next_stop_display && NEXT_STOP_DISPLAY_LABEL[profile.next_stop_display],
    },
    { label: 'Appearance', value: profile?.appearance },
  ]
}

// True when the search text appears in any of the visible columns.
export function matchesSearch(bus: BusPosition, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (needle === '') return true
  const haystack = [bus.route_code, formatRoute(bus), bus.vehicle_id, bus.next_stop ?? '']
  return haystack.some((value) => String(value).toLowerCase().includes(needle))
}
