import type { BusPosition } from './types'

// Adds newly fetched positions to the ones we already have, matched by vehicle_id. A newer
// last_update replaces the old position; an older one is ignored. Buses missing from
// `incoming` are kept, so they age into "Not reporting" instead of vanishing.
export function mergeBuses(current: BusPosition[], incoming: BusPosition[]): BusPosition[] {
  const byId = new Map(current.map((bus) => [bus.vehicle_id, bus]))
  for (const bus of incoming) {
    const existing = byId.get(bus.vehicle_id)
    if (!existing || Date.parse(bus.last_update) > Date.parse(existing.last_update)) {
      byId.set(bus.vehicle_id, bus)
    }
  }
  return [...byId.values()]
}

// Calls `load` now and then every `intervalMs`, keeping the merged result in `buses`.
export function createBusFeed(load: () => Promise<BusPosition[]>, intervalMs: number) {
  // $state.raw: the list is only ever replaced, never edited in place, so Svelte doesn't
  // need to watch inside every bus object.
  let buses: BusPosition[] = $state.raw([])
  // 'error' only when the very first fetch fails; later failures keep the last good data.
  let status: 'loading' | 'ready' | 'error' = $state('loading')
  // The last failed fetch's message, cleared by the next successful one.
  let error: string | undefined = $state()

  async function refresh() {
    try {
      buses = mergeBuses(buses, await load())
      status = 'ready'
      error = undefined
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
      if (status === 'loading') status = 'error'
    } finally {
      // Schedule the next fetch only after this one finishes, so slow responses never overlap.
      setTimeout(refresh, intervalMs)
    }
  }

  refresh()

  return {
    get buses() {
      return buses
    },
    get status() {
      return status
    },
    get error() {
      return error
    },
  }
}
