<script lang="ts">
  import { formatAge, formatNextStop, secondsSinceUpdate } from './format'
  import type { BusPosition } from './types'

  let { bus, now }: { bus: BusPosition; now: number } = $props()
</script>

<!-- "Reid at Hunter · 5s", with the position's age in grey. -->
{formatNextStop(bus)}
<span class="text-muted-foreground">· {formatAge(secondsSinceUpdate(bus, now))}</span>
