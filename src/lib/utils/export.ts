import type { ColorPalette, PaletteColor } from './colorUtils';
import { flattenPalette, formatHSL, formatRGB, rgbToCMYK, formatCMYK } from './colorUtils';

// ────────────────────────────────────────────────────────────────────────────
// CSS Custom Properties
// ────────────────────────────────────────────────────────────────────────────

export function exportToCSS(palette: ColorPalette, paletteName = 'palette'): string {
  const entries = flattenPalette(palette);
  const lines: string[] = [
    `/* iyiris — ${paletteName} */`,
    `/* Generated: ${new Date().toLocaleDateString('es-CO')} */`,
    '',
    ':root {',
  ];

  for (const { color, cssKey } of entries) {
    const [h, s, l] = color.hsl;
    const cmyk = rgbToCMYK(color.rgb);
    lines.push(`  /* ${color.name} */`);
    lines.push(`  --${cssKey}: ${color.hex};`);
    lines.push(`  --${cssKey}-rgb: ${color.rgb.join(', ')};`);
    lines.push(`  --${cssKey}-hsl: ${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%;`);
    lines.push(`  --${cssKey}-cmyk: ${cmyk.join('%, ')}%;`);
  }

  lines.push('}');
  return lines.join('\n');
}

// ────────────────────────────────────────────────────────────────────────────
// Tailwind Config
// ────────────────────────────────────────────────────────────────────────────

export function exportToTailwind(palette: ColorPalette, paletteName = 'brand'): string {
  const entries = flattenPalette(palette);
  const colorLines = entries.map(({ color, cssKey }) =>
    `      '${paletteName}-${cssKey}': '${color.hex}',`
  );

  return [
    `/** @type {import('tailwindcss').Config} */`,
    `// iyiris — Generated ${new Date().toLocaleDateString('es-CO')}`,
    `module.exports = {`,
    `  theme: {`,
    `    extend: {`,
    `      colors: {`,
    ...colorLines,
    `      },`,
    `    },`,
    `  },`,
    `};`,
  ].join('\n');
}

// ────────────────────────────────────────────────────────────────────────────
// Color table — all formats (HEX / RGB / HSL / CMYK)
// ────────────────────────────────────────────────────────────────────────────

export function exportToFormats(palette: ColorPalette): string {
  const entries = flattenPalette(palette);
  const header = ['Grupo', 'Nombre', 'HEX', 'RGB', 'HSL', 'CMYK'].join('\t');
  const rows = entries.map(({ color, cssKey }) => {
    const cmyk = rgbToCMYK(color.rgb);
    return [
      cssKey.split('-')[0],
      color.name,
      color.hex,
      formatRGB(color.rgb),
      formatHSL(color.hsl),
      formatCMYK(cmyk),
    ].join('\t');
  });
  return [header, ...rows].join('\n');
}

/** Returns a clean JSON object representation */
export function exportToJSON(palette: ColorPalette, name = 'Mi Paleta'): string {
  const entries = flattenPalette(palette);
  const obj: Record<string, { hex: string; rgb: string; hsl: string; cmyk: string }> = {};

  for (const { cssKey, color } of entries) {
    const cmyk = rgbToCMYK(color.rgb);
    obj[cssKey] = {
      hex: color.hex,
      rgb: formatRGB(color.rgb),
      hsl: formatHSL(color.hsl),
      cmyk: formatCMYK(cmyk),
    };
  }

  return JSON.stringify({ name, colors: obj }, null, 2);
}

// ────────────────────────────────────────────────────────────────────────────
// Clipboard helper
// ────────────────────────────────────────────────────────────────────────────

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  }
}
