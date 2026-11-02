<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog'
  import { Input } from '$lib/components/ui/input'
  import BusDetails from './lib/BusDetails.svelte'
  import BusTable from './lib/BusTable.svelte'
  import DescribeBusForm from './lib/DescribeBusForm.svelte'
  import RouteDetails from './lib/RouteDetails.svelte'
  import { createClock } from './lib/clock.svelte'
  import { mockBusProfiles } from './lib/mockBusProfiles'
  import { mockBuses, mockNow } from './lib/mockBuses'
  import { closeView, view } from './lib/view.svelte'

  const buses = mockBuses
  const clock = createClock(mockNow)
  const now = $derived(clock.now)

  // Lives here, not in BusTable, so the future map can filter by the same search.
  let query = $state('')

  const current = $derived(view.current)
  const selectedBus = $derived(
    current.kind === 'bus' ? buses.find((bus) => bus.vehicle_id === current.vehicleId) : undefined,
  )
  const selectedProfile = $derived(
    selectedBus && mockBusProfiles.find((profile) => profile.vehicle_id === selectedBus.vehicle_id),
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
    <div class="rounded-lg border">
      <BusTable {buses} {now} {query} />
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
          <Dialog.Description>This bus isn't in the current data.</Dialog.Description>
        </Dialog.Header>
      {:else if current.describing}
        <!-- {#key} gives each bus a fresh form, so one bus's draft never shows for another. -->
        {#key current.vehicleId}
          <DescribeBusForm vehicleId={current.vehicleId} />
        {/key}
      {:else}
        <BusDetails bus={selectedBus} profile={selectedProfile} {now} />
      {/if}
    {:else if current.kind === 'route'}
      {#if routeBuses.length === 0}
        <Dialog.Header>
          <Dialog.Title>Route {current.routeCode}</Dialog.Title>
          <Dialog.Description>No buses on this route are in the current data.</Dialog.Description>
        </Dialog.Header>
      {:else}
        <RouteDetails buses={routeBuses} {now} />
      {/if}
    {/if}
  </Dialog.Content>
</Dialog.Root>
