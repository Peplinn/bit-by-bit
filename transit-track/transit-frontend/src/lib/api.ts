import { mockBusProfiles } from './mockBusProfiles'
import { mockBuses, mockNow } from './mockBuses'
import type { BusDescription, BusPosition, BusProfile } from './types'

// Everything the frontend asks the owner's API for goes through this file.
// Set VITE_API_URL (see .env.example) to use the real API. Leave it unset to keep using the
// mock data, so the app still runs before the API exists.
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

export const usingMockData = !API_URL

// Mock time starts at mockNow so the sample data looks fresh; live time is the real clock.
export const startTime = usingMockData ? mockNow : Date.now()

const TIMEOUT_MS = 8000

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  // Give up after TIMEOUT_MS so a hung server shows as an error instead of loading forever.
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new ApiError(response.status, `${init.method ?? 'GET'} ${path} failed (${response.status})`)
  }
  return response
}

// GET /buses -> BusPosition[]: the latest position of every bus.
export async function fetchBuses(): Promise<BusPosition[]> {
  if (usingMockData) return mockBuses
  const data: unknown = await (await apiFetch('/buses')).json()
  if (!Array.isArray(data)) throw new Error('GET /buses did not return a list')
  return data as BusPosition[]
}

// GET /buses/{vehicle_id}/profile -> BusProfile, or 404 when nobody has described the bus yet.
export async function fetchBusProfile(vehicleId: number): Promise<BusProfile | undefined> {
  if (usingMockData) return mockBusProfiles.find((profile) => profile.vehicle_id === vehicleId)
  try {
    return await (await apiFetch(`/buses/${vehicleId}/profile`)).json()
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
  }
}

// POST /bus-descriptions with a BusDescription body: a rider's description, held for review.
export async function submitBusDescription(description: BusDescription): Promise<void> {
  if (usingMockData) {
    console.info('Bus description (mock mode, not sent anywhere):', description)
    return
  }
  await apiFetch('/bus-descriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(description),
  })
}
