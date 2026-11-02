<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog'
  import { Input } from '$lib/components/ui/input'
  import BusDetails from './lib/BusDetails.svelte'
  import BusTable from './lib/BusTable.svelte'
  import DescribeBusForm from './lib/DescribeBusForm.svelte'
  import RouteDetails from './lib/RouteDetails.svelte'
  import { fetchBusProfile, fetchBuses, startTime } from './lib/api'
  import { createBusFeed } from './lib/busFeed.svelte'
  import { createClock } from './lib/clock.svelte'
  import { closeView, view } from './lib/view.svelte'

  const REFRESH_INTERVAL_MS = 10_000

  const feed = createBusFeed(fetchBuses, REFRESH_INTERVAL_MS)
  const buses = $derived(feed.buses)
  const clock = createClock(startTime)
  const now = $derived(clock.now)

  // Lives here, not in BusTable, so the future map can filter by the same search.
  let query = $state('')

  const current = $derived(view.current)
  const selectedId = $derived(current.kind === 'bus' ? current.vehicleId : undefined)
  const selectedBus = $derived(buses.find((bus) => bus.vehicle_id === selectedId))
  // A number, so this only refetches when a different bus is opened, not on every refresh.
  const profilePromise = $derived(
    selectedId === undefined ? undefined : fetchBusProfile(selectedId),
  )
  const routeBuses = $derived(
    current.kind === 'route' ? buses.filter((bus) => bus.route_code === current.routeCode) : [],
  )
</script>

<main class="min-h-screen px-4 py-10 sm:px-8">
  <div class="mx-auto max-w-5xl space-y-4">
    <Input
      type="search"
      placeholder="Search by route, direction, bus ID or stop"
      aria-label="Search buses"
      bind:value={query}
    />
    {#if feed.error}
      <p class="text-sm text-red-600" role="status">
        Can't reach the bus server ({feed.error}). Retrying every {REFRESH_INTERVAL_MS / 1000} s.
      </p>
    {/if}
    <div class="rounded-lg border">
      <BusTable {buses} {now} {query} loading={feed.status === 'loading'} />
    </div>
  </div>
</main>

<!-- One dialog for every popup. The URL hash decides whether it's open and what it shows. -->
<Dialog.Root
  open={current.kind !== 'none'}
  onOpenChange={(open) => {
    if (!open) closeView()
  }}
>
  <Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-xl">
    {#if current.kind === 'bus'}
      {#if !selectedBus}
        <Dialog.Header>
          <Dialog.Title>Bus {current.vehicleId}</Dialog.Title>
          <Dialog.Description>
            {feed.status === 'loading' ? 'Loading…' : "This bus isn't in the current data."}
          </Dialog.Description>
        </Dialog.Header>
      {:else if current.describing}
        <!-- {#key} gives each bus a fresh form, so one bus's draft never shows for another. -->
        {#key current.vehicleId}
          <DescribeBusForm vehicleId={current.vehicleId} />
        {/key}
      {:else}
        <BusDetails bus={selectedBus} profile={profilePromise} {now} />
      {/if}
    {:else if current.kind === 'route'}
      {#if routeBuses.length === 0}
        <Dialog.Header>
          <Dialog.Title>Route {current.routeCode}</Dialog.Title>
          <Dialog.Description>
            {feed.status === 'loading'
              ? 'Loading…'
              : 'No buses on this route are in the current data.'}
          </Dialog.Description>
        </Dialog.Header>
      {:else}
        <RouteDetails buses={routeBuses} {now} />
      {/if}
    {/if}
  </Dialog.Content>
</Dialog.Root>
