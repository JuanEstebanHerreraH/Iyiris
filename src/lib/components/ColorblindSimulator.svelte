<script lang="ts">
  import type { ColorPalette } from '$lib/utils/colorUtils';
  import { flattenPalette, getContrastColor } from '$lib/utils/colorUtils';
  import { simulateColorBlindness, COLOR_BLIND_MODES } from '$lib/utils/colorblind';
  import type { ColorBlindType } from '$lib/utils/colorblind';

  export let palette: ColorPalette;

  let activeMode: ColorBlindType = 'protanopia';

  // All unique colors from the palette for comparison
  $: allColors = [
    palette.base,
    ...palette.analogous,
    ...palette.complementary,
    ...palette.triadic,
    // show only the 5 mid monochromatic entries to keep it clean
    ...palette.monochromatic.slice(2, 7),
  ].filter((c, i, arr) => arr.findIndex(x => x.hex === c.hex) === i);

  $: simulatedColors = allColors.map(c => ({
    original: c.hex,
    simulated: simulateColorBlindness(c.hex, activeMode),
    name: c.name,
  }));
</script>

<div class="space-y-6 animate-fade-in">
  <!-- Mode selector -->
  <div>
    <p class="section-label mb-3">Tipo de daltonismo</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {#each COLOR_BLIND_MODES as mode}
        <button
          class="flex items-start gap-3 p-3 rounded-xl border text-left transition-all
                 {activeMode === mode.id ? 'bg-white/5 border-white/15' : 'bg-surface border-border'}"
          on:click={() => (activeMode = mode.id)}
        >
          <div class="w-2 h-2 rounded-full mt-1.5 shrink-0 transition-colors"
               class:bg-text={activeMode === mode.id}
               class:bg-border={activeMode !== mode.id} />
          <div>
            <p class="text-sm font-semibold" class:text-text={activeMode === mode.id}
               class:text-muted={activeMode !== mode.id}>{mode.label}</p>
            <p class="text-xs text-muted mt-0.5">{mode.description}</p>
            {#if mode.prevalence !== '—'}
              <p class="font-mono text-[10px] text-muted/60 mt-0.5">
                Prevalencia: {mode.prevalence}
              </p>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Side-by-side comparison -->
  {#if activeMode !== 'none'}
    <div>
      <div class="flex gap-4 mb-3">
        <div class="flex-1 text-center section-label">Visión normal</div>
        <div class="flex-1 text-center section-label">
          {COLOR_BLIND_MODES.find(m => m.id === activeMode)?.label ?? ''}
        </div>
      </div>

      <div class="space-y-2">
        {#each simulatedColors as pair}
          <div class="flex gap-2 items-center">
            <!-- Original -->
            <div
              class="flex-1 h-12 rounded-xl flex items-center justify-center font-mono text-xs font-bold
                     border border-white/5 transition-all"
              style="background-color: {pair.original}; color: {getContrastColor(pair.original)};"
            >
              {pair.original.toUpperCase()}
            </div>

            <!-- Arrow -->
            <svg class="w-4 h-4 text-muted shrink-0" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2">
              <path d="M5 12h14m-7-7 7 7-7 7"/>
            </svg>

            <!-- Simulated -->
            <div
              class="flex-1 h-12 rounded-xl flex items-center justify-center font-mono text-xs font-bold
                     border border-white/5 transition-all"
              style="background-color: {pair.simulated}; color: {getContrastColor(pair.simulated)};"
            >
              {pair.simulated.toUpperCase()}
            </div>

            <!-- Delta indicator -->
            <div class="w-16 text-right shrink-0">
              {#if pair.original === pair.simulated}
                <span class="text-[10px] font-mono text-emerald-500">= igual</span>
              {:else}
                <span class="text-[10px] font-mono text-amber-400">≠ cambia</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Tip -->
    <div class="bg-surface border border-border rounded-xl p-4">
      <p class="text-xs text-muted leading-relaxed">
        <span class="text-text font-semibold">💡 Consejo:</span>
        Cuando muchos colores se vuelven indistinguibles en la simulación, considera añadir
        variaciones de <em>luminosidad</em> además de tono para mejorar la accesibilidad.
        Usa formas, iconos o etiquetas como apoyo secundario.
      </p>
    </div>
  {:else}
    <div class="bg-surface border border-border rounded-xl p-8 text-center">
      <p class="text-muted text-sm">Selecciona un tipo de daltonismo para ver la simulación.</p>
    </div>
  {/if}
</div>
