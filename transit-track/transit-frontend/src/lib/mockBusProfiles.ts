import type { BusProfile } from './types'

// Invented profiles for a few of the buses in mockBuses. The rest have no profile yet,
// which is the normal case the UI has to handle.
export const mockBusProfiles: BusProfile[] = [
  { vehicle_id: 113, make_model: 'New Flyer XD40', seating_layout: 'Forward-facing, with side-facing priority seats at the front', seated_capacity: 38, standing_capacity: 37, bike_rack: 'Front rack, 3 bikes', next_stop_display: 'working', appearance: 'Standard white and blue livery', last_reviewed: '2026-09-14' },
  { vehicle_id: 69, make_model: 'Nova Bus LFS', seating_layout: 'Mixed forward- and rear-facing seats over the rear wheels', seated_capacity: 36, bike_rack: 'Front rack, 2 bikes', next_stop_display: 'faulty', appearance: 'Full advertising wrap', last_reviewed: '2026-10-02' },
  { vehicle_id: 8, make_model: 'Nova Bus LFS', seated_capacity: 36, next_stop_display: 'working' },
  { vehicle_id: 77, seating_layout: 'Mostly side-facing', bike_rack: 'None', next_stop_display: 'none', appearance: 'Older livery, green stripe' },
]
