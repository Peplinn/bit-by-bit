// Which popup is open, kept in the URL hash so a bus or route can be linked to and bookmarked:
//   #/bus/113           bus 113's info
//   #/bus/113/describe  the "Help describe this bus" form for bus 113
//   #/route/6           route 6's info
// The file ends in .svelte.ts so it can use runes ($state) outside a component.

export type View =
  | { kind: 'none' }
  | { kind: 'bus'; vehicleId: number; describing: boolean }
  | { kind: 'route'; routeCode: number }

function parseHash(hash: string): View {
  const bus = hash.match(/^#\/bus\/(\d+)(\/describe)?$/)
  if (bus) return { kind: 'bus', vehicleId: Number(bus[1]), describing: bus[2] !== undefined }
  const route = hash.match(/^#\/route\/(\d+)$/)
  if (route) return { kind: 'route', routeCode: Number(route[1]) }
  return { kind: 'none' }
}

let current: View = $state(parseHash(window.location.hash))

// Clicking a link that changes the hash (or pressing Back/Forward) fires 'hashchange'.
window.addEventListener('hashchange', () => {
  current = parseHash(window.location.hash)
})

// A getter, because a module can't export a $state variable that it reassigns.
export const view = {
  get current() {
    return current
  },
}

// Removes the hash without leaving a trailing '#'. pushState adds a history entry, so
// Back reopens the popup, and it doesn't fire 'hashchange', so update `current` directly.
export function closeView() {
  history.pushState(null, '', window.location.pathname + window.location.search)
  current = { kind: 'none' }
}

export const busHref = (vehicleId: number) => `#/bus/${vehicleId}`
export const describeBusHref = (vehicleId: number) => `#/bus/${vehicleId}/describe`
export const routeHref = (routeCode: number) => `#/route/${routeCode}`
