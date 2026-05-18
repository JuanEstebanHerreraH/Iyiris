// ────────────────────────────────────────────────────────────────────────────
// Colorblind simulation
// Based on: Brettel (1997) / Viénot (1999) / Machado (2009)
// Simplified direct RGB matrices — accurate enough for design tooling
// ────────────────────────────────────────────────────────────────────────────

export type ColorBlindType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface ColorBlindMode {
  id: ColorBlindType;
  label: string;
  description: string;
  prevalence: string;
}

export const COLOR_BLIND_MODES: ColorBlindMode[] = [
  {
    id: 'none',
    label: 'Visión normal',
    description: 'Visión tricromática completa',
    prevalence: '—',
  },
  {
    id: 'protanopia',
    label: 'Protanopía',
    description: 'Ausencia de conos L (rojos)',
    prevalence: '1% hombres',
  },
  {
    id: 'deuteranopia',
    label: 'Deuteranopía',
    description: 'Ausencia de conos M (verdes)',
    prevalence: '1% hombres',
  },
  {
    id: 'tritanopia',
    label: 'Tritanopía',
    description: 'Ausencia de conos S (azules)',
    prevalence: '0.003%',
  },
  {
    id: 'achromatopsia',
    label: 'Acromatopsia',
    description: 'Sin percepción de color (escala de grises)',
    prevalence: '0.003%',
  },
];

// Row-major 3×3 matrices: output[i] = sum(M[i][j] * input[j])
const MATRICES: Record<Exclude<ColorBlindType, 'none' | 'achromatopsia'>, readonly [number, number, number, number, number, number, number, number, number]> = {
  protanopia: [
    0.567, 0.433, 0.000,
    0.558, 0.442, 0.000,
    0.000, 0.242, 0.758,
  ],
  deuteranopia: [
    0.625, 0.375, 0.000,
    0.700, 0.300, 0.000,
    0.000, 0.300, 0.700,
  ],
  tritanopia: [
    0.950, 0.050, 0.000,
    0.000, 0.433, 0.567,
    0.000, 0.475, 0.525,
  ],
};

function clamp255(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function simulateColorBlindness(hex: string, type: ColorBlindType): string {
  if (type === 'none') return hex;

  const [r, g, b] = hexToRgb(hex);

  if (type === 'achromatopsia') {
    // ITU-R BT.601 luminance formula
    const gray = clamp255(0.299 * r + 0.587 * g + 0.114 * b);
    return rgbToHex(gray, gray, gray);
  }

  const m = MATRICES[type];
  return rgbToHex(
    clamp255(m[0] * r + m[1] * g + m[2] * b),
    clamp255(m[3] * r + m[4] * g + m[5] * b),
    clamp255(m[6] * r + m[7] * g + m[8] * b),
  );
}

export function simulatePalette(colors: string[], type: ColorBlindType): string[] {
  return colors.map(c => simulateColorBlindness(c, type));
}
