<script lang="ts">
  import {
    PUNCTUALITY_COLOR,
    formatPunctuality,
    isPunctualityExpired,
    isReporting,
    punctualityStatus,
  } from './format'
  import type { BusPosition } from './types'

  let { bus, now }: { bus: BusPosition; now: number } = $props()

  // Grey once the bus stops reporting; colour only means something for live data.
  const colorClass = $derived(
    isReporting(bus, now)
      ? PUNCTUALITY_COLOR[punctualityStatus(bus.delay_seconds)]
      : 'text-muted-foreground',
  )
</script>

{#if isPunctualityExpired(bus, now)}
  <span class="text-muted-foreground" aria-hidden="true">—</span>
  <span class="sr-only">No recent punctuality</span>
{:else}
  <span class={colorClass}>{formatPunctuality(bus.delay_seconds)}</span>
{/if}
