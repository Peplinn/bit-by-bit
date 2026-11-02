<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog'
  import NextStop from './NextStop.svelte'
  import RouteNumber from './RouteNumber.svelte'
  import type { BusPosition, BusProfile } from './types'
  import {
    PUNCTUALITY_COLOR,
    formatLastUpdated,
    formatPunctuality,
    formatRoute,
    isReporting,
    profileRows,
    punctualityStatus,
  } from './format'
  import { describeBusHref, routeHref } from './view.svelte'

  let { bus, profile, now }: { bus: BusPosition; profile?: BusProfile; now: number } = $props()

  const reporting = $derived(isReporting(bus, now))
</script>

<Dialog.Header>
  <Dialog.Title>Bus {bus.vehicle_id}</Dialog.Title>
  <Dialog.Description>
    {reporting ? 'Running now on' : 'Last seen on'} route {bus.route_code}, {formatRoute(bus)}
  </Dialog.Description>
</Dialog.Header>

<section class="space-y-2">
  <h3 class="text-sm font-medium">Right now</h3>
  <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
    <dt class="text-muted-foreground">Route</dt>
    <dd>
      <a href={routeHref(bus.route_code)} class="inline-flex items-center gap-2 hover:underline">
        <RouteNumber code={bus.route_code} color={bus.route_color} muted={!reporting} />
        {formatRoute(bus)}
      </a>
    </dd>
    <dt class="text-muted-foreground">Next stop</dt>
    <dd><NextStop {bus} {now} /></dd>
    <dt class="text-muted-foreground">Punctuality</dt>
    {#if reporting}
      <dd class={PUNCTUALITY_COLOR[punctualityStatus(bus.delay_seconds)]}>
        {formatPunctuality(bus.delay_seconds)}
      </dd>
    {:else}
      <dd class="text-muted-foreground">{formatLastUpdated(bus, now)}</dd>
    {/if}
  </dl>
</section>

<section class="space-y-2">
  <h3 class="text-sm font-medium">About this bus</h3>
  <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
    {#each profileRows(profile) as row (row.label)}
      <dt class="text-muted-foreground">{row.label}</dt>
      <dd class={row.value ? '' : 'text-muted-foreground'}>{row.value ?? 'Unknown'}</dd>
    {/each}
  </dl>
  {#if profile?.last_reviewed}
    <p class="text-xs text-muted-foreground">Last reviewed {profile.last_reviewed}</p>
  {/if}
</section>

<a href={describeBusHref(bus.vehicle_id)} class="text-sm font-medium underline underline-offset-4">
  Help describe this bus
</a>
