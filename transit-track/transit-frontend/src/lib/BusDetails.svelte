<script lang="ts">
  import Radio from '@lucide/svelte/icons/radio'
  import { Badge } from '$lib/components/ui/badge'
  import * as Dialog from '$lib/components/ui/dialog'
  import NextStop from './NextStop.svelte'
  import Punctuality from './Punctuality.svelte'
  import RouteNumber from './RouteNumber.svelte'
  import type { BusPosition, BusProfile } from './types'
  import { formatDaysAgo, formatRoute, isReporting, profileRows } from './format'
  import { describeBusHref, routeHref } from './view.svelte'

  let {
    bus,
    profile,
    now,
  }: { bus: BusPosition; profile?: Promise<BusProfile | undefined>; now: number } = $props()

  const reporting = $derived(isReporting(bus, now))
</script>

<!-- The dialog spaces its direct children far apart. Grouping the header with the route
     info keeps those two closer together. -->
<div class="space-y-3">
  <Dialog.Header>
    <!-- "Bus 113 · Active (icon)", all one size. -->
    <Dialog.Title class="flex items-center gap-2 text-base font-semibold">
      Bus {bus.vehicle_id}
      <span class="text-muted-foreground" aria-hidden="true">·</span>
      {#if reporting}
        Active
        <!-- motion-safe: only animates if the viewer hasn't asked their OS to reduce motion. -->
        <Radio class="size-4 text-green-600 motion-safe:animate-pulse" aria-hidden="true" />
      {:else}
        <span class="text-muted-foreground">Inactive</span>
      {/if}
    </Dialog.Title>
  </Dialog.Header>

  <!-- Active: what it's doing now. Inactive (grey): where its last update came from, and when. -->
  <dl
    class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm {reporting ? '' : 'text-muted-foreground'}"
  >
    <dt class="text-muted-foreground">Route</dt>
    <dd>
      <!-- The underlines sit on the square and the text separately. An underline on the link
           itself was also drawn under the square, so the number looked underlined twice. -->
      <a href={routeHref(bus.route_code)} class="inline-flex items-center gap-2">
        <RouteNumber
          code={bus.route_code}
          color={bus.route_color}
          muted={!reporting}
          class="underline underline-offset-2"
        />
        <span class="underline underline-offset-4">{formatRoute(bus)}</span>
      </a>
    </dd>
    {#if reporting}
      <dt class="text-muted-foreground">Next stop</dt>
      <dd><NextStop {bus} {now} /></dd>
      <dt class="text-muted-foreground">Punctuality</dt>
      <dd><Punctuality {bus} {now} /></dd>
    {:else}
      <dt class="text-muted-foreground">Last update</dt>
      <dd><NextStop {bus} {now} /></dd>
    {/if}
  </dl>
</div>

<section class="space-y-2">
  <h3 class="text-sm font-medium">About this bus</h3>
  <!-- {#await} shows one block while the profile loads, another when it arrives, and a third
       if loading fails. -->
  {#await profile}
    <p class="text-sm text-muted-foreground">Loading…</p>
  {:then loaded}
    <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
      {#each profileRows(loaded) as row (row.label)}
        <dt class="text-muted-foreground">{row.label}</dt>
        <dd class="flex flex-wrap items-center gap-x-2 gap-y-1">
          {#if row.value === undefined}
            <span class="text-muted-foreground">Unknown</span>
          {:else if Array.isArray(row.value)}
            {#each row.value as tag (tag)}
              <Badge variant="outline">{tag}</Badge>
            {/each}
          {:else}
            <span>{row.value}</span>
          {/if}
          {#if row.date}
            <span class="text-xs text-muted-foreground">· {formatDaysAgo(row.date, now)}</span>
          {/if}
        </dd>
      {/each}
    </dl>
  {:catch}
    <p class="text-sm text-red-600">Couldn't load this bus's details.</p>
  {/await}
</section>

<a href={describeBusHref(bus.vehicle_id)} class="text-sm font-medium underline underline-offset-4">
  Help describe this bus
</a>
