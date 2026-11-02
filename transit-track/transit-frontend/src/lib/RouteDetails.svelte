<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog'
  import * as Table from '$lib/components/ui/table'
  import NextStop from './NextStop.svelte'
  import RouteNumber from './RouteNumber.svelte'
  import type { BusPosition } from './types'
  import {
    PUNCTUALITY_COLOR,
    formatLastUpdated,
    formatPunctuality,
    isReporting,
    punctualityStatus,
  } from './format'
  import { busHref } from './view.svelte'

  // `buses` holds every bus on this route (at least one), reporting or not.
  let { buses, now }: { buses: BusPosition[]; now: number } = $props()

  const route = $derived(buses[0])
  // Reporting buses first, then by direction and bus ID.
  const sorted = $derived(
    buses.toSorted(
      (a, b) =>
        Number(isReporting(b, now)) - Number(isReporting(a, now)) ||
        a.direction_name.localeCompare(b.direction_name) ||
        a.vehicle_id - b.vehicle_id,
    ),
  )
  const reportingCount = $derived(buses.filter((bus) => isReporting(bus, now)).length)
  const directions = $derived([...new Set(buses.map((bus) => bus.direction_name))].sort())
</script>

<Dialog.Header>
  <Dialog.Title class="flex items-center gap-2">
    <RouteNumber code={route.route_code} color={route.route_color} />
    {route.route_name}
  </Dialog.Title>
  <Dialog.Description>
    {reportingCount} of {buses.length}
    {buses.length === 1 ? 'bus' : 'buses'} reporting · {directions.join(', ')}
  </Dialog.Description>
</Dialog.Header>

<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.Head>Bus ID</Table.Head>
      <Table.Head>Direction</Table.Head>
      <Table.Head>Next Stop</Table.Head>
      <Table.Head>Punctuality</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each sorted as bus (bus.vehicle_id)}
      {@const reporting = isReporting(bus, now)}
      <Table.Row class={reporting ? '' : 'text-muted-foreground'}>
        <Table.Cell>
          <a href={busHref(bus.vehicle_id)} class="underline-offset-4 hover:underline">
            {bus.vehicle_id}
          </a>
        </Table.Cell>
        <Table.Cell>{bus.direction_name}</Table.Cell>
        <Table.Cell><NextStop {bus} {now} /></Table.Cell>
        {#if reporting}
          <Table.Cell class={PUNCTUALITY_COLOR[punctualityStatus(bus.delay_seconds)]}>
            {formatPunctuality(bus.delay_seconds)}
          </Table.Cell>
        {:else}
          <Table.Cell>{formatLastUpdated(bus, now)}</Table.Cell>
        {/if}
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>
