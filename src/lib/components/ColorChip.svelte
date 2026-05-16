<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { PaletteColor } from '$lib/utils/colorUtils';
  import { getContrastColor, formatHSL, formatRGB, rgbToCMYK } from '$lib/utils/colorUtils';
  import { copyToClipboard } from '$lib/utils/export';

  export let color: PaletteColor;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let showLabel = true;

  const dispatch = createEventDispatcher<{ select: PaletteColor }>();

  // Which format was last copied — persists until a new one is copied
  let lastCopied: 'HEX' | 'RGB' | 'HSL' | 'CMYK' | null = null;
  let showCopiedToast = false;

  const heights: Record<typeof size, string> = {
    sm: 'h-16',
    md: 'h-24',
    lg: 'h-32',
  };

  $: textColor = getContrastColor(color.hex);
  $: cmyk      = rgbToCMYK(color.rgb);

  const formats: { key: 'HEX' | 'RGB' | 'HSL' | 'CMYK'; getValue: () => string }[] = [
    { key: 'HEX',  getValue: () => color.hex.toUpperCase()           },
    { key: 'RGB',  getValue: () => formatRGB(color.rgb)              },
    { key: 'HSL',  getValue: () => formatHSL(color.hsl)              },
    { key: 'CMYK', getValue: () => {
        const c = rgbToCMYK(color.rgb);
        return `cmyk(${c[0]}%, ${c[1]}%, ${c[2]}%, ${c[3]}%)`;
      }
    },
  ];

  async function handleCopy(e: MouseEvent, fmt: typeof formats[0]) {
    e.stopPropagation();
    const ok = await copyToClipboard(fmt.getValue());
    if (ok) {
      lastCopied = fmt.key;
      showCopiedToast = true;
      setTimeout(() => (showCopiedToast = false), 900);
    }
  }
</script>

<div
  class="color-chip group relative rounded-xl overflow-hidden {heights[size]} select-none"
  style="background-color: {color.hex};"
  on:click={() => dispatch('select', color)}
  on:keypress={(e) => e.key === 'Enter' && dispatch('select', color)}
  role="button"
  tabindex="0"
  aria-label="Color {color.name} ({color.hex})"
>
  <!-- Name label (top-left) -->
  {#if showLabel}
    <div
      class="absolute top-2 left-3 text-[10px] font-mono font-semibold opacity-60 pointer-events-none"
      style="color:{textColor};"
    >
      {color.name}
    </div>
  {/if}

  <!-- Hex always visible (center-bottom), hides on hover -->
  <div
    class="absolute bottom-2 left-0 right-0 flex justify-center
           opacity-50 group-hover:opacity-0 transition-opacity pointer-events-none"
  >
    <span class="font-mono text-[10px] font-bold tracking-wider" style="color:{textColor};">
      {color.hex.toUpperCase()}
    </span>
  </div>

  <!-- Copied toast overlay -->
  {#if showCopiedToast && lastCopied}
    <div
      class="copied-toast absolute inset-0 flex items-center justify-center pointer-events-none"
      style="background:{color.hex}cc;"
    >
      <span class="font-mono text-xs font-bold" style="color:{textColor};">
        ✓ {lastCopied} copiado
      </span>
    </div>
  {/if}

  <!-- Format buttons — slide up on hover -->
  <div
    class="absolute bottom-0 left-0 right-0
           translate-y-full group-hover:translate-y-0
           transition-transform duration-200 ease-out"
  >
    <!-- Gradient backdrop -->
    <div
      class="px-1.5 pb-1.5 pt-5 grid grid-cols-4 gap-1"
      style="background: linear-gradient(to top, {color.hex}f0 60%, transparent);"
    >
      {#each formats as fmt}
        {@const isActive = lastCopied === fmt.key}
        <button
          class="relative py-1 rounded text-[9px] font-mono font-bold transition-all
                 {isActive
                   ? 'ring-2 ring-white/60 scale-105'
                   : 'hover:brightness-125'}"
          style="background: {isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'};
                 color: {textColor};"
          on:click={(e) => handleCopy(e, fmt)}
          title="Copiar como {fmt.key}: {fmt.getValue()}"
        >
          {fmt.key}
          <!-- Small dot indicator if this was last copied -->
          {#if isActive}
            <span
              class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
              style="background: {textColor};"
            />
          {/if}
        </button>
      {/each}
    </div>
  </div>
</div>
