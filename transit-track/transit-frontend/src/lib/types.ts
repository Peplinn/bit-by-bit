// One bus's latest reported position.
// Field names mirror the backend (positions table / poller output) so API data
// can be used as-is without renaming.
export interface BusPosition {
  vehicle_id: number
  pattern_id: number
  headsign_text: string // "<route variant> - <destination>", e.g. "11A - Traill College"
  velocity: number // km/h
  bearing: number // degrees, 0 = north
  lat: number
  lng: number
  last_update: string // ISO 8601 with offset, e.g. "2026-10-21T19:53:00-04:00"
  time_polled: string // ISO 8601, server local time (no offset)

  // From the Patterns table (pt.mytransitride.com/api/Route). The API is expected to join
  // them onto each position.
  route_code: number
  route_name: string
  route_color: string // 6-digit hex without '#', e.g. "066A40"
  direction_name: string // "North", "South", "East", "West" or "Inbound"

  // Not produced by the backend yet. Optional so the UI handles "unknown" from day one.
  next_stop?: string
  delay_seconds?: number // positive = behind schedule, negative = ahead
  on_time_probability?: number // 0..1
}

export type NextStopDisplay = 'working' | 'faulty' | 'none'

// What we know about one physical bus, independent of where it is right now.
// Every field is optional: most buses won't be fully described at first.
export interface BusProfile {
  vehicle_id: number
  make_model?: string // e.g. "New Flyer XD40"
  seating_layout?: string // e.g. "Forward-facing, with side-facing priority seats at the front"
  seated_capacity?: number
  standing_capacity?: number
  bike_rack?: string // e.g. "Front rack, 2 bikes"
  next_stop_display?: NextStopDisplay
  appearance?: string // livery, wraps, anything that helps recognise it
  last_reviewed?: string // ISO date the profile was last checked
}

// A rider's suggested description of a bus, sent for review before it updates a BusProfile.
// Kept as plain text so riders can say "about 40" or "not sure".
export interface BusDescription {
  vehicle_id: number
  make_model: string
  seating_layout: string
  seated_capacity: string
  bike_rack: string
  next_stop_display: NextStopDisplay | ''
  appearance: string
  notes: string
}
