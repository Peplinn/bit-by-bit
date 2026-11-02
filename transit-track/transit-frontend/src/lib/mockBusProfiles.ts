import type { BusProfile } from './types'

// Invented profiles for a few of the buses in mockBuses. The rest have no profile yet,
// which is the normal case the UI has to handle. Dates differ per field on purpose.
export const mockBusProfiles: BusProfile[] = [
  {
    vehicle_id: 113,
    make_model: { value: 'New Flyer XD40', date: '2026-09-14' },
    seating: { value: ['forward', 'sideways'], date: '2026-09-14' },
    seated_capacity: { value: 38, date: '2026-09-14' },
    standing_capacity: { value: 37, date: '2026-09-14' },
    bike_racks: { value: ['front'], date: '2026-08-30' },
    next_stop_info: { value: { display: 'working', audio: 'faulty' }, date: '2026-10-19' },
    appearance: { value: 'Standard white and blue livery', date: '2026-09-14' },
  },
  {
    vehicle_id: 69,
    make_model: { value: 'Nova Bus LFS', date: '2026-10-02' },
    seating: { value: ['forward'], date: '2026-10-02' },
    seated_capacity: { value: 36, date: '2026-10-02' },
    bike_racks: { value: ['front', 'rear'], date: '2026-10-02' },
    next_stop_info: { value: { display: 'sub-optimal' }, date: '2026-10-20' },
    appearance: { value: 'Full advertising wrap', date: '2026-10-02' },
  },
  {
    vehicle_id: 8,
    make_model: { value: 'Nova Bus LFS', date: '2026-07-11' },
    seated_capacity: { value: 36, date: '2026-07-11' },
    next_stop_info: { value: { display: 'working', audio: 'working' }, date: '2026-10-05' },
  },
  {
    vehicle_id: 77,
    seating: { value: ['sideways'], date: '2026-06-03' },
    bike_racks: { value: [], date: '2026-06-03' },
    next_stop_info: { value: { display: 'faulty', audio: 'faulty' }, date: '2026-06-03' },
    appearance: { value: 'Older livery, green stripe', date: '2026-06-03' },
  },
]
