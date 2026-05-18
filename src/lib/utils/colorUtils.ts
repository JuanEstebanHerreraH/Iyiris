import chroma from 'chroma-js';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface PaletteColor {
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
  name: string;
}

export interface ColorPalette {
  base: PaletteColor;
  analogous: PaletteColor[];
  complementary: PaletteColor[];
  triadic: PaletteColor[];
  monochromatic: PaletteColor[];
}

export interface SavedPalette {
  id: string;
  name: string;
  baseColor: string;
  palette: ColorPalette;
  createdAt: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function toColorInfo(color: chroma.Color, name: string): PaletteColor {
  const rgb = color.rgb();
  const hsl = color.hsl();
  return {
    hex: color.hex(),
    rgb: [Math.round(rgb[0]), Math.round(rgb[1]), Math.round(rgb[2])],
    hsl: [
      isNaN(hsl[0]) ? 0 : Math.round(hsl[0]),
      isNaN(hsl[1]) ? 0 : hsl[1],
      isNaN(hsl[2]) ? 0 : hsl[2],
    ],
    name,
  };
}

/** Safe chroma.hsl() — clamps values to valid ranges */
function safeHSL(h: number, s: number, l: number): chroma.Color {
  return chroma.hsl(
    ((h % 360) + 360) % 360,
    Math.max(0, Math.min(1, s)),
    Math.max(0.04, Math.min(0.96, l)),
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Palette generation
// ────────────────────────────────────────────────────────────────────────────

export function generatePalette(baseHex: string): ColorPalette {
  const base = chroma(baseHex);
  const hsl  = base.hsl();
  const h    = isNaN(hsl[0]) ? 0   : hsl[0];
  const s    = isNaN(hsl[1]) ? 0   : hsl[1];
  const l    = isNaN(hsl[2]) ? 0.5 : hsl[2];

  // ── Analogous (±30°) ──────────────────────────────────────────────────────
  const analogous: PaletteColor[] = [
    toColorInfo(safeHSL(h - 30, s, l), 'Análogo −30°'),
    toColorInfo(safeHSL(h + 30, s, l), 'Análogo +30°'),
  ];

  // ── Complementary + split-complementary ──────────────────────────────────
  const complementary: PaletteColor[] = [
    toColorInfo(safeHSL(h + 180, s,       l),       'Complementario'),
    toColorInfo(safeHSL(h + 150, s * 0.9, l * 1.0), 'Split −30°'),
    toColorInfo(safeHSL(h + 210, s * 0.9, l * 1.0), 'Split +30°'),
  ];

  // ── Triadic (120° apart) ──────────────────────────────────────────────────
  const triadic: PaletteColor[] = [
    toColorInfo(safeHSL(h + 120, s, l), 'Triádico 1'),
    toColorInfo(safeHSL(h + 240, s, l), 'Triádico 2'),
  ];

  // ── Monochromatic (same hue, varying L + S) ───────────────────────────────
  const monochromatic: PaletteColor[] = [
    toColorInfo(safeHSL(h, s * 0.25, Math.min(l + 0.38, 0.92)), 'Tint 4'),
    toColorInfo(safeHSL(h, s * 0.50, Math.min(l + 0.25, 0.85)), 'Tint 3'),
    toColorInfo(safeHSL(h, s * 0.75, Math.min(l + 0.13, 0.80)), 'Tint 2'),
    toColorInfo(safeHSL(h, s,        Math.min(l + 0.06, 0.75)), 'Tint 1'),
    toColorInfo(base, 'Base'),
    toColorInfo(safeHSL(h, Math.min(s * 1.1, 1), Math.max(l - 0.08, 0.04)), 'Shade 1'),
    toColorInfo(safeHSL(h, Math.min(s * 1.2, 1), Math.max(l - 0.18, 0.04)), 'Shade 2'),
    toColorInfo(safeHSL(h, Math.min(s * 1.3, 1), Math.max(l - 0.28, 0.04)), 'Shade 3'),
    toColorInfo(safeHSL(h, Math.min(s * 1.4, 1), Math.max(l - 0.38, 0.04)), 'Shade 4'),
  ];

  return { base: toColorInfo(base, 'Base'), analogous, complementary, triadic, monochromatic };
}

// ────────────────────────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────────────────────────

export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

/** Returns black or white for maximum contrast on the given background */
export function getContrastColor(hex: string): '#000000' | '#ffffff' {
  try {
    return chroma(hex).luminance() > 0.35 ? '#000000' : '#ffffff';
  } catch {
    return '#ffffff';
  }
}

/** All palette colors as a flat array [{ color, cssKey }] */
export function flattenPalette(palette: ColorPalette): { color: PaletteColor; cssKey: string }[] {
  return [
    { color: palette.base,                    cssKey: 'base'            },
    ...palette.analogous.map((c, i)      => ({ color: c, cssKey: `analogous-${i + 1}`     })),
    ...palette.complementary.map((c, i)  => ({ color: c, cssKey: `comp-${i + 1}`          })),
    ...palette.triadic.map((c, i)        => ({ color: c, cssKey: `triadic-${i + 1}`       })),
    ...palette.monochromatic.map((c, i)  => ({ color: c, cssKey: `mono-${i + 1}`          })),
  ];
}

export function randomHex(): string {
  const h = Math.random() * 360;
  const s = 0.45 + Math.random() * 0.45;
  const l = 0.30 + Math.random() * 0.35;
  return chroma.hsl(h, s, l).hex();
}

/** Format HSL for display */
export function formatHSL(hsl: [number, number, number]): string {
  const [h, s, l] = hsl;
  return `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/** Format RGB for display */
export function formatRGB(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

/** Convert RGB [0-255] to CMYK [0-100] */
export function rgbToCMYK(rgb: [number, number, number]): [number, number, number, number] {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const k = 1 - Math.max(r, g, b);
  if (k >= 1) return [0, 0, 0, 100];
  const d = 1 - k;
  return [
    Math.round(((1 - r - k) / d) * 100),
    Math.round(((1 - g - k) / d) * 100),
    Math.round(((1 - b - k) / d) * 100),
    Math.round(k * 100),
  ];
}

/** Format CMYK for display */
export function formatCMYK(cmyk: [number, number, number, number]): string {
  return `cmyk(${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%)`;
}
