<script lang="ts">
  import { cn } from '$lib/utils'
  import { outlineColor, readableTextColor, toGrayscale } from './color'

  // `muted` shows the square in grey, for buses that have stopped reporting.
  // `class` adds classes, e.g. an underline when the square is a link.
  let {
    code,
    color,
    muted = false,
    class: className,
  }: { code: number; color: string; muted?: boolean; class?: string } = $props()

  const fill = $derived.by(() => {
    const hex = `#${color.replace('#', '')}`
    return muted ? toGrayscale(hex) : hex
  })
</script>

<span
  class={cn(
    'inline-flex size-7 items-center justify-center rounded-sm border text-xs font-semibold',
    className,
  )}
  style:background-color={fill}
  style:border-color={outlineColor(fill)}
  style:color={readableTextColor(fill)}
>
  {code}
</span>
