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

export type SeatingDirection = 'forward' | 'sideways'
export type BikeRack = 'front' | 'rear'
// How well a piece of equipment works.
export type EquipmentStatus = 'working' | 'sub-optimal' | 'faulty'

// Next-stop information on the bus's display and over its speakers.
export interface NextStopInfo {
  display?: EquipmentStatus
  audio?: EquipmentStatus
}

// A piece of rider-supplied info and the date (ISO, YYYY-MM-DD) it was supplied.
export interface Dated<T> {
  value: T
  date: string
}

// What we know about one physical bus, independent of where it is right now.
// Every field is optional: most buses won't be fully described at first.
export interface BusProfile {
  vehicle_id: number
  make_model?: Dated<string> // e.g. "New Flyer XD40"
  seating?: Dated<SeatingDirection[]>
  seated_capacity?: Dated<number>
  standing_capacity?: Dated<number>
  bike_racks?: Dated<BikeRack[]> // an empty list means the bus has no rack
  next_stop_info?: Dated<NextStopInfo>
  appearance?: Dated<string> // livery, wraps, anything that helps recognise it
}

// A rider's suggested description of a bus, sent for review before it updates a BusProfile.
// Empty strings and lists mean "not sure".
export interface BusDescription {
  vehicle_id: number
  submitted_at: string // ISO timestamp
  make_model: string
  seating: SeatingDirection[]
  seated_capacity: string // text, so riders can write "about 40"
  bike_racks: (BikeRack | 'none')[]
  next_stop_display: EquipmentStatus | ''
  next_stop_audio: EquipmentStatus | ''
  appearance: string
}
