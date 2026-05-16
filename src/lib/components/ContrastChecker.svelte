<script lang="ts">
  import { checkContrast, levelDescription } from '$lib/utils/contrast';
  import type { ColorPalette } from '$lib/utils/colorUtils';
  import { isValidHex, rgbToCMYK } from '$lib/utils/colorUtils';
  import chroma from 'chroma-js';

  export let palette: ColorPalette;

  let foreground = palette.base.hex;
  let background = '#ffffff';
  let activeField: 'fg' | 'bg' = 'fg';

  $: allColors = [
    palette.base,
    ...palette.monochromatic,
    ...palette.complementary,
    ...palette.analogous,
    ...palette.triadic,
  ].filter((c, i, arr) => arr.findIndex(x => x.hex === c.hex) === i).slice(0, 20);

  $: result = (isValidHex(foreground) && isValidHex(background))
    ? checkContrast(foreground, background)
    : null;

  function swap() {
    const tmp = foreground;
    foreground = background;
    background = tmp;
  }

  function normaliseHex(raw: string): string {
    let v = raw.trim().replace(/^#+/, '');
    if (v.length === 3) v = v.split('').map((c: string) => c + c).join('');
    return '#' + v;
  }

  function handleFGInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    const norm = normaliseHex(raw);
    if (isValidHex(norm)) foreground = norm;
  }

  function handleBGInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    const norm = normaliseHex(raw);
    if (isValidHex(norm)) background = norm;
  }

  function handlePickerFG(e: Event) {
    foreground = (e.target as HTMLInputElement).value;
    activeField = 'fg';
  }

  function handlePickerBG(e: Event) {
    background = (e.target as HTMLInputElement).value;
    activeField = 'bg';
  }

  function applyToActive(hex: string) {
    if (activeField === 'fg') foreground = hex;
    else background = hex;
  }

  function ratioBarWidth(ratio: number): string {
    return Math.min((ratio / 21) * 100, 100) + '%';
  }

  function ratioColor(ratio: number): string {
    if (ratio >= 7) return '#10b981';
    if (ratio >= 4.5) return '#3b82f6';
    if (ratio >= 3) return '#f59e0b';
    return '#ef4444';
  }

  $: fgRgb = isValidHex(foreground) ? chroma(foreground).rgb() as [number,number,number] : null;
  $: bgRgb = isValidHex(background) ? chroma(background).rgb() as [number,number,number] : null;
  $: fgCmyk = fgRgb ? rgbToCMYK(fgRgb) : null;
  $: bgCmyk = bgRgb ? rgbToCMYK(bgRgb) : null;
</script>

<div class="space-y-6 animate-fade-in">
  {#if result}
    <div class="rounded-2xl p-6 border border-border transition-colors duration-300"
         style="background-color:{background};">
      <p class="text-2xl font-bold mb-1" style="color:{foreground};">iyiris WCAG Checker</p>
      <p class="text-sm" style="color:{foreground};">
        Este texto evalúa la legibilidad según WCAG 2.1.
      </p>
      <p class="text-xs mt-1" style="color:{foreground};opacity:0.75;">
        The quick brown fox jumps over the lazy dog — 0123456789
      </p>
    </div>
  {/if}

  <div class="flex items-center gap-2">
    <p class="section-label">Colores a comparar</p>
    <span class="ml-auto text-xs font-mono px-2.5 py-0.5 rounded-full border
                 {activeField === 'fg'
                   ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                   : 'bg-purple-500/15 text-purple-400 border-purple-500/30'}">
      ● Editando: {activeField === 'fg' ? 'Primer plano' : 'Fondo'}
    </span>
  </div>

  <!-- Mobile: flex-col stack. Desktop: side-by-side grid -->
  <div class="flex flex-col sm:grid sm:grid-cols-[1fr_auto_1fr] gap-3 sm:items-start">
    <!-- Foreground field -->
    <div
      class="rounded-xl border-2 p-3 cursor-pointer transition-all"
      class:border-blue-500={activeField === 'fg'}
      class:border-border={activeField !== 'fg'}
      on:click={() => (activeField = 'fg')}
      on:keypress={(e) => e.key === 'Enter' && (activeField = 'fg')}
      role="button"
      tabindex="0"
      title="Clic para editar primer plano"
    >
      <div class="flex items-center gap-1.5 mb-2.5">
        <div class="w-2 h-2 rounded-full transition-colors
                    {activeField === 'fg' ? 'bg-blue-500' : 'bg-border'}"/>
        <p class="text-xs font-bold tracking-wide
                  {activeField === 'fg' ? 'text-blue-400' : 'text-muted'}">
          PRIMER PLANO
        </p>
      </div>
      <div class="flex gap-2 items-center">
        <label class="relative w-10 h-10 rounded-lg cursor-pointer border-2
                      {activeField === 'fg' ? 'border-blue-500/50' : 'border-border'}
                      hover:border-blue-400/60 transition shrink-0"
               style="background-color:{isValidHex(foreground) ? foreground : '#888'};">
          <input type="color"
                 value={isValidHex(foreground) ? foreground : '#888888'}
                 on:input={(e) => handlePickerFG(e)}
                 class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
        </label>
        <input
          type="text"
          value={foreground}
          on:input={handleFGInput}
          on:focus={() => (activeField = 'fg')}
          maxlength={7}
          spellcheck={false}
          placeholder="#000000"
          class="flex-1 min-w-0 bg-bg border rounded-lg px-2.5 py-2 font-mono text-sm text-text
                 focus:outline-none transition
                 {activeField === 'fg' ? 'border-blue-500/40 focus:border-blue-500' : 'border-border'}"
        />
      </div>
      {#if fgCmyk}
        <p class="font-mono text-[10px] text-muted mt-2 leading-relaxed">
          cmyk({fgCmyk[0]}%, {fgCmyk[1]}%, {fgCmyk[2]}%, {fgCmyk[3]}%)
        </p>
      {/if}
    </div>

    <!-- Swap button:
         Mobile  → full-width row with horizontal arrows
         Desktop → vertical arrows centered between panels  -->
    <div class="flex items-center justify-center sm:mt-9">
      <button
        on:click={swap}
        class="flex items-center gap-2 px-4 py-2 rounded-xl sm:w-9 sm:h-9 sm:p-0
               bg-surface border border-border text-muted
               hover:text-text hover:border-white/20 transition-all
               sm:flex-none sm:rounded-lg sm:gap-0"
        title="Intercambiar colores"
      >
        <!-- Horizontal icon on mobile, vertical on desktop -->
        <svg class="w-4 h-4 sm:hidden" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <path d="M8 3 4 7l4 4M4 7h16"/>
          <path d="m16 21 4-4-4-4m4 4H4"/>
        </svg>
        <span class="text-xs font-mono sm:hidden">Intercambiar</span>
        <!-- Vertical icon only on desktop -->
        <svg class="w-4 h-4 hidden sm:block" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <path d="M7 16V4m0 0L3 8m4-4 4 4"/>
          <path d="M17 8v12m0 0 4-4m-4 4-4-4"/>
        </svg>
      </button>
    </div>

    <!-- Background field -->
    <div
      class="rounded-xl border-2 p-3 cursor-pointer transition-all"
      class:border-purple-500={activeField === 'bg'}
      class:border-border={activeField !== 'bg'}
      on:click={() => (activeField = 'bg')}
      on:keypress={(e) => e.key === 'Enter' && (activeField = 'bg')}
      role="button"
      tabindex="0"
      title="Clic para editar fondo"
    >
      <div class="flex items-center gap-1.5 mb-2.5">
        <div class="w-2 h-2 rounded-full transition-colors
                    {activeField === 'bg' ? 'bg-purple-500' : 'bg-border'}"/>
        <p class="text-xs font-bold tracking-wide
                  {activeField === 'bg' ? 'text-purple-400' : 'text-muted'}">
          FONDO
        </p>
      </div>
      <div class="flex gap-2 items-center">
        <label class="relative w-10 h-10 rounded-lg cursor-pointer border-2
                      {activeField === 'bg' ? 'border-purple-500/50' : 'border-border'}
                      hover:border-purple-400/60 transition shrink-0"
               style="background-color:{isValidHex(background) ? background : '#fff'};">
          <input type="color"
                 value={isValidHex(background) ? background : '#ffffff'}
                 on:input={(e) => handlePickerBG(e)}
                 class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
        </label>
        <input
          type="text"
          value={background}
          on:input={handleBGInput}
          on:focus={() => (activeField = 'bg')}
          maxlength={7}
          spellcheck={false}
          placeholder="#ffffff"
          class="flex-1 min-w-0 bg-bg border rounded-lg px-2.5 py-2 font-mono text-sm text-text
                 focus:outline-none transition
                 {activeField === 'bg' ? 'border-purple-500/40 focus:border-purple-500' : 'border-border'}"
        />
      </div>
      {#if bgCmyk}
        <p class="font-mono text-[10px] text-muted mt-2 leading-relaxed">
          cmyk({bgCmyk[0]}%, {bgCmyk[1]}%, {bgCmyk[2]}%, {bgCmyk[3]}%)
        </p>
      {/if}
    </div>
  </div>

  <!-- Quick-pick palette -->
  <div>
    <p class="section-label mb-2">
      Paleta → aplica a
      <span class="{activeField === 'fg' ? 'text-blue-400' : 'text-purple-400'} font-semibold">
        {activeField === 'fg' ? 'primer plano ↑' : 'fondo ↑'}
      </span>
    </p>
    <div class="flex gap-1.5 flex-wrap">
      {#each allColors as color}
        <button
          on:click={() => applyToActive(color.hex)}
          class="w-7 h-7 rounded-md border-2 transition-all hover:scale-110 hover:-translate-y-0.5"
          style="background:{color.hex};
                 border-color:{(activeField==='fg' && foreground===color.hex)||(activeField==='bg' && background===color.hex) ? '#fff' : 'transparent'};"
          title="{color.name}: {color.hex}"
        />
      {/each}
    </div>
  </div>

  <!-- Result panel -->
  {#if result}
    <div class="panel p-5 space-y-4">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="section-label">Ratio de contraste</span>
          <span class="font-mono text-3xl font-bold tracking-tight"
                style="color:{ratioColor(result.ratio)};">
            {result.ratioLabel}
          </span>
        </div>
        <div class="h-2.5 bg-border rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all duration-500"
               style="width:{ratioBarWidth(result.ratio)};background:{ratioColor(result.ratio)};"/>
        </div>
        <div class="flex justify-between text-xs font-mono text-muted mt-1.5">
          <span>0:1</span><span>3:1</span><span>4.5:1</span><span>7:1</span><span>21:1</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="bg-bg rounded-xl p-3.5 space-y-2 border border-border">
          <p class="section-label">Texto normal</p>
          <div class="flex gap-2 flex-wrap">
            <span class="badge {result.normalAA ? 'badge-pass' : 'badge-fail'}">{result.normalAA ? '✓' : '✗'} AA</span>
            <span class="badge {result.normalAAA ? 'badge-pass' : 'badge-fail'}">{result.normalAAA ? '✓' : '✗'} AAA</span>
          </div>
          <p class="text-xs text-muted font-mono">4.5:1 (AA) / 7:1 (AAA)</p>
        </div>

        <div class="bg-bg rounded-xl p-3.5 space-y-2 border border-border">
          <p class="section-label">Texto grande ≥18pt</p>
          <div class="flex gap-2 flex-wrap">
            <span class="badge {result.largeAA ? 'badge-pass' : 'badge-fail'}">{result.largeAA ? '✓' : '✗'} AA</span>
            <span class="badge {result.largeAAA ? 'badge-pass' : 'badge-fail'}">{result.largeAAA ? '✓' : '✗'} AAA</span>
          </div>
          <p class="text-xs text-muted font-mono">3:1 (AA) / 4.5:1 (AAA)</p>
        </div>

        <div class="bg-bg rounded-xl p-3.5 space-y-2 border border-border col-span-2">
          <p class="section-label">Componentes UI & gráficos</p>
          <div class="flex gap-2 flex-wrap items-center">
            <span class="badge {result.uiAA ? 'badge-pass' : 'badge-fail'}">{result.uiAA ? '✓' : '✗'} AA (3:1)</span>
            <span class="badge {result.ratio >= 7 ? 'badge-pass' : result.ratio >= 4.5 ? 'badge-warn' : 'badge-fail'}">Nivel: {result.level}</span>
          </div>
          <p class="text-sm text-text mt-1">{levelDescription(result.level)}</p>
        </div>
      </div>
    </div>
  {/if}
</div>
