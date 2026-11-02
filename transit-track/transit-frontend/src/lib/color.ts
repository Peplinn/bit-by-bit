// WCAG 2 contrast helpers. Colours are 6-digit hex strings, with or without a leading '#'.

type Rgb = [number, number, number]

const BLACK = '#000000'
const WHITE = '#FFFFFF'

// WCAG minimum for shapes and borders (non-text contrast). Text needs 4.5:1.
const MIN_SHAPE_CONTRAST = 3

function toRgb(hex: string): Rgb {
  const value = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)) as Rgb
}

function toHex(rgb: Rgb): string {
  return '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('').toUpperCase()
}

// How bright a colour looks to the eye, from 0 (black) to 1 (white).
function relativeLuminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const c = channel / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// The grey that is exactly as bright as `hex`, so its contrast with anything is unchanged.
export function toGrayscale(hex: string): string {
  const luminance = relativeLuminance(hex)
  const c = luminance <= 0.0031308 ? luminance * 12.92 : 1.055 * luminance ** (1 / 2.4) - 0.055
  return toHex([c * 255, c * 255, c * 255])
}

// From 1 (identical) to 21 (black on white).
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (lighter + 0.05) / (darker + 0.05)
}

// Black or white, whichever is easier to read on `background`.
// One of the two always reaches at least 4.58:1, so this always passes the 4.5:1 text minimum.
export function readableTextColor(background: string): string {
  return contrastRatio(background, BLACK) >= contrastRatio(background, WHITE) ? BLACK : WHITE
}

// A border for a `fill` shape drawn on `surface`: the fill itself if it already stands out
// enough, otherwise the fill darkened step by step until it does.
export function outlineColor(fill: string, surface = WHITE): string {
  const rgb = toRgb(fill)
  for (let darken = 0; darken <= 1; darken += 0.05) {
    const candidate = toHex(rgb.map((c) => c * (1 - darken)) as Rgb)
    if (contrastRatio(candidate, surface) >= MIN_SHAPE_CONTRAST) return candidate
  }
  return BLACK
}
