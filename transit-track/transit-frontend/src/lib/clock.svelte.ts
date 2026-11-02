// A clock that starts at `start` (ms) and moves forward in real time, ticking once a second.
// With mock data, `start` is mockNow so the frozen sample ages as if it were live.
// With live data, `start` is Date.now().
export function createClock(start: number) {
  const offset = start - Date.now()
  let now = $state(start)

  setInterval(() => {
    now = Date.now() + offset
  }, 1000)

  return {
    get now() {
      return now
    },
  }
}
