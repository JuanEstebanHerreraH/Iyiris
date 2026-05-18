import chroma from 'chroma-js';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface ContrastResult {
  ratio: number;
  ratioLabel: string;
  // Normal text (< 18pt / < 14pt bold)
  normalAA:  boolean;   // 4.5:1
  normalAAA: boolean;   // 7.0:1
  // Large text (≥ 18pt / ≥ 14pt bold)
  largeAA:   boolean;   // 3.0:1
  largeAAA:  boolean;   // 4.5:1
  // UI components & graphical objects
  uiAA:      boolean;   // 3.0:1
  level: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  color1Hex: string;
  color2Hex: string;
}

// ────────────────────────────────────────────────────────────────────────────
// WCAG 2.1 contrast check
// ────────────────────────────────────────────────────────────────────────────

export function checkContrast(color1: string, color2: string): ContrastResult {
  let ratio = 1;
  try {
    ratio = chroma.contrast(color1, color2);
  } catch {
    ratio = 1;
  }

  const r = parseFloat(ratio.toFixed(2));

  return {
    ratio: r,
    ratioLabel: `${r.toFixed(2)}:1`,
    normalAA:  r >= 4.5,
    normalAAA: r >= 7.0,
    largeAA:   r >= 3.0,
    largeAAA:  r >= 4.5,
    uiAA:      r >= 3.0,
    level: r >= 7.0 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3.0 ? 'AA Large' : 'Fail',
    color1Hex: color1,
    color2Hex: color2,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Check all palette combos against a background
// ────────────────────────────────────────────────────────────────────────────

export function checkAllContrasts(
  foregrounds: string[],
  background: string,
): ContrastResult[] {
  return foregrounds.map(fg => checkContrast(fg, background));
}

/** Human-readable description of the WCAG level */
export function levelDescription(level: ContrastResult['level']): string {
  switch (level) {
    case 'AAA':      return 'Excelente accesibilidad';
    case 'AA':       return 'Accesible (texto normal)';
    case 'AA Large': return 'Accesible solo texto grande';
    case 'Fail':     return 'No accesible';
  }
}
