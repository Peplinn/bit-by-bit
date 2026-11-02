<script lang="ts">
  import { outlineColor, readableTextColor, toGrayscale } from './color'

  // `muted` shows the square in grey, for buses that have stopped reporting.
  let { code, color, muted = false }: { code: number; color: string; muted?: boolean } = $props()

  const fill = $derived.by(() => {
    const hex = `#${color.replace('#', '')}`
    return muted ? toGrayscale(hex) : hex
  })
</script>

<span
  class="inline-flex size-7 items-center justify-center rounded-sm border text-xs font-semibold"
  style:background-color={fill}
  style:border-color={outlineColor(fill)}
  style:color={readableTextColor(fill)}
>
  {code}
</span>
