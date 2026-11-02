<script lang="ts">
  import ArrowDown from '@lucide/svelte/icons/arrow-down'
  import ArrowUp from '@lucide/svelte/icons/arrow-up'
  import ArrowUpDown from '@lucide/svelte/icons/arrow-up-down'
  import ChevronRight from '@lucide/svelte/icons/chevron-right'
  import ListFilter from '@lucide/svelte/icons/list-filter'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import * as Table from '$lib/components/ui/table'
  import NextStop from './NextStop.svelte'
  import Punctuality from './Punctuality.svelte'
  import RouteNumber from './RouteNumber.svelte'
  import type { BusPosition } from './types'
  import { formatRoute, isReporting, matchesSearch } from './format'
  import { busHref, routeHref } from './view.svelte'

  let {
    buses,
    now,
    query,
    loading = false,
  }: { buses: BusPosition[]; now: number; query: string; loading?: boolean } = $props()

  const COLUMN_COUNT = 5

  type SortKey = 'route_code' | 'vehicle_id'

  let sortKey: SortKey = $state('route_code')
  let sortDirection: 'asc' | 'desc' = $state('asc')
  // Directions ticked in the Route column's checklist. Empty means show every direction.
  let selectedDirections: string[] = $state([])
  let showInactive = $state(false)

  // Clicking the sorted column flips its direction; clicking another column sorts by it.
  function sortBy(key: SortKey) {
    if (sortKey === key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey = key
      sortDirection = 'asc'
    }
  }

  function setDirection(direction: string, checked: boolean) {
    selectedDirections = checked
      ? [...selectedDirections, direction]
      : selectedDirections.filter((d) => d !== direction)
  }

  const directionOptions = $derived([...new Set(buses.map((bus) => bus.direction_name))].sort())

  const visible = $derived(
    buses.filter(
      (bus) =>
        matchesSearch(bus, query) &&
        (selectedDirections.length === 0 || selectedDirections.includes(bus.direction_name)),
    ),
  )
  // Ties (same route) fall back to vehicle so rows keep a stable order.
  const sorted = $derived(
    visible.toSorted((a, b) => {
      const diff = a[sortKey] - b[sortKey] || a.vehicle_id - b.vehicle_id
      return sortDirection === 'asc' ? diff : -diff
    }),
  )
  const active = $derived(sorted.filter((bus) => isReporting(bus, now)))
  const inactive = $derived(sorted.filter((bus) => !isReporting(bus, now)))
</script>

{#snippet sortableHead(label: string, key: SortKey)}
  <Table.Head
    aria-sort={sortKey !== key ? 'none' : sortDirection === 'asc' ? 'ascending' : 'descending'}
  >
    <button type="button" class="inline-flex items-center gap-1" onclick={() => sortBy(key)}>
      {label}
      {#if sortKey !== key}
        <ArrowUpDown class="size-4 text-muted-foreground" />
      {:else if sortDirection === 'asc'}
        <ArrowUp class="size-4" />
      {:else}
        <ArrowDown class="size-4" />
      {/if}
    </button>
  </Table.Head>
{/snippet}

{#snippet busRow(bus: BusPosition, reporting: boolean)}
  <Table.Row class={reporting ? '' : 'text-muted-foreground'}>
    <Table.Cell>
      <a href={routeHref(bus.route_code)} aria-label="Route {bus.route_code} details">
        <RouteNumber
          code={bus.route_code}
          color={bus.route_color}
          muted={!reporting}
          class="underline underline-offset-2"
        />
      </a>
    </Table.Cell>
    <Table.Cell>{formatRoute(bus)}</Table.Cell>
    <Table.Cell>
      <a href={busHref(bus.vehicle_id)} class="underline underline-offset-4">
        {bus.vehicle_id}
      </a>
    </Table.Cell>
    <Table.Cell><NextStop {bus} {now} /></Table.Cell>
    <Table.Cell><Punctuality {bus} {now} /></Table.Cell>
  </Table.Row>
{/snippet}

<Table.Root>
  <Table.Header>
    <Table.Row>
      {@render sortableHead('Route No.', 'route_code')}
      <Table.Head>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger class="inline-flex items-center gap-1">
            Route
            <ListFilter
              class="size-4 {selectedDirections.length > 0 ? '' : 'text-muted-foreground'}"
            />
            {#if selectedDirections.length > 0}
              <span class="sr-only">(filtered to {selectedDirections.join(', ')})</span>
            {/if}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start">
            {#each directionOptions as direction (direction)}
              <DropdownMenu.CheckboxItem
                checked={selectedDirections.includes(direction)}
                onCheckedChange={(checked) => setDirection(direction, checked)}
              >
                {direction}
              </DropdownMenu.CheckboxItem>
            {/each}
            {#if selectedDirections.length > 0}
              <DropdownMenu.Separator />
              <DropdownMenu.Item onSelect={() => (selectedDirections = [])}>Show all</DropdownMenu.Item>
            {/if}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Table.Head>
      {@render sortableHead('Bus ID', 'vehicle_id')}
      <Table.Head>Next Stop</Table.Head>
      <Table.Head>Punctuality</Table.Head>
    </Table.Row>
  </Table.Header>

  <Table.Body>
    {#each active as bus (bus.vehicle_id)}
      {@render busRow(bus, true)}
    {:else}
      <Table.Row>
        <Table.Cell colspan={COLUMN_COUNT}>
          {#if loading}
            Loading buses…
          {:else if buses.length > 0 && visible.length === 0}
            No buses match your search or filters.
          {:else}
            No buses reporting.
          {/if}
        </Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>

  {#if inactive.length > 0}
    <Table.Body class="border-t">
      <Table.Row>
        <Table.Cell colspan={COLUMN_COUNT}>
          <button
            type="button"
            class="inline-flex items-center gap-1 text-muted-foreground"
            aria-expanded={showInactive}
            aria-controls="inactive-buses"
            onclick={() => (showInactive = !showInactive)}
          >
            <ChevronRight class="size-4 transition-transform {showInactive ? 'rotate-90' : ''}" />
            Not reporting ({inactive.length})
          </button>
        </Table.Cell>
      </Table.Row>
    </Table.Body>

    <Table.Body id="inactive-buses" hidden={!showInactive}>
      {#each inactive as bus (bus.vehicle_id)}
        {@render busRow(bus, false)}
      {/each}
    </Table.Body>
  {/if}
</Table.Root>
