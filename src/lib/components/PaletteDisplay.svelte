<script lang="ts">
  import type { ColorPalette } from '$lib/utils/colorUtils';
  import { getContrastColor, rgbToCMYK } from '$lib/utils/colorUtils';
  import ColorChip from './ColorChip.svelte';
  import { copyToClipboard } from '$lib/utils/export';

  export let palette: ColorPalette;

  $: baseCmyk = rgbToCMYK(palette.base.rgb);

  const sections: {
    key: keyof Omit<ColorPalette, 'base'>;
    label: string;
    description: string;
    icon: string;
  }[] = [
    { key: 'analogous',      label: 'Análogos',        description: '±30° en la rueda cromática',          icon: '◐' },
    { key: 'complementary',  label: 'Complementarios',  description: 'Opuesto + split complementario (180°)', icon: '◑' },
    { key: 'triadic',        label: 'Triádicos',        description: 'Tres colores equidistantes (120°)',    icon: '△' },
    { key: 'monochromatic',  label: 'Monocromáticos',   description: 'Mismo matiz, variando luminosidad',   icon: '▧' },
  ];

  let copiedHex = '';

  async function copyHex(hex: string) {
    await copyToClipboard(hex);
    copiedHex = hex;
    setTimeout(() => (copiedHex = ''), 1200);
  }
</script>

<div class="space-y-8 animate-fade-in">
  <!-- Base color hero -->
  <div>
    <p class="section-label mb-3">Color base</p>
    <div class="flex gap-4 items-center">
      <div
        class="w-20 h-20 rounded-2xl border border-white/10 shadow-chip shrink-0"
        style="background-color: {palette.base.hex};"
      />
      <div class="space-y-1.5">
        <p class="font-mono text-xl font-bold text-text tracking-wider">
          {palette.base.hex.toUpperCase()}
        </p>
        <p class="font-mono text-sm text-subtle">
          rgb({palette.base.rgb.join(', ')})
        </p>
        <p class="font-mono text-sm text-subtle">
          hsl({palette.base.hsl[0]}°, {Math.round(palette.base.hsl[1] * 100)}%, {Math.round(palette.base.hsl[2] * 100)}%)
        </p>
        <p class="font-mono text-sm text-subtle">
          cmyk({baseCmyk[0]}%, {baseCmyk[1]}%, {baseCmyk[2]}%, {baseCmyk[3]}%)
        </p>
      </div>
    </div>
  </div>

  <!-- Harmony sections -->
  {#each sections as section (section.key)}
    <div class="animate-slide-up">
      <div class="flex items-center gap-2 mb-3">
        <span class="text-subtle text-sm font-mono">{section.icon}</span>
        <p class="section-label">{section.label}</p>
        <span class="text-subtle text-xs ml-auto hidden sm:inline">{section.description}</span>
      </div>

      {#if section.key === 'monochromatic'}
        <div class="flex rounded-xl overflow-hidden border border-border" style="height:72px;">
          {#each palette.monochromatic as color}
            <button
              class="flex-1 relative group transition-all hover:flex-[1.4] focus:outline-none"
              style="background-color:{color.hex};"
              on:click={() => copyHex(color.hex)}
              title="{color.name} — {color.hex}"
            >
              <span
                class="absolute bottom-1 left-0 right-0 text-center font-mono text-[9px] font-bold
                       opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style="color:{getContrastColor(color.hex)};"
              >{color.hex.toUpperCase()}</span>
              {#if copiedHex === color.hex}
                <span
                  class="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold"
                  style="color:{getContrastColor(color.hex)};background:{color.hex}dd;"
                >✓</span>
              {/if}
            </button>
          {/each}
        </div>
        <div class="flex mt-1.5">
          {#each palette.monochromatic as color}
            <div class="flex-1 text-center">
              <p class="font-mono text-[10px] text-subtle truncate">{color.name}</p>
            </div>
          {/each}
        </div>
      {:else}
        <div class="grid gap-3" style="grid-template-columns:repeat({palette[section.key].length},1fr);">
          {#each palette[section.key] as color}
            <div class="space-y-2">
              <ColorChip {color} size="md" />
              <div class="space-y-0.5 px-0.5">
                <p class="font-mono text-xs text-text font-medium truncate">{color.hex.toUpperCase()}</p>
                <p class="font-mono text-[10px] text-subtle truncate">{color.name}</p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>
