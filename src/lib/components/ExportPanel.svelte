<script lang="ts">
  import type { ColorPalette } from '$lib/utils/colorUtils';
  import { rgbToCMYK } from '$lib/utils/colorUtils';
  import {
    exportToCSS,
    exportToTailwind,
    exportToFormats,
    exportToJSON,
    copyToClipboard,
  } from '$lib/utils/export';

  export let palette: ColorPalette;

  type FormatId = 'css' | 'tailwind' | 'json' | 'table';

  const FORMATS: { id: FormatId; label: string; icon: string; lang: string }[] = [
    { id: 'css',      label: 'CSS Variables',   icon: '#', lang: 'css'  },
    { id: 'tailwind', label: 'Tailwind Config',  icon: '↗', lang: 'js'  },
    { id: 'json',     label: 'JSON',             icon: '{', lang: 'json' },
    { id: 'table',    label: 'Tabla HEX/RGB/HSL',icon: '≡', lang: 'tsv' },
  ];

  let activeFormat: FormatId = 'css';
  let paletteName = 'mi-paleta';
  let copiedFormat: FormatId | null = null;
  let downloadEl: HTMLAnchorElement;

  type OutputMap = { css: string; tailwind: string; json: string; table: string };

  let outputs: OutputMap = {
    css:      exportToCSS(palette, paletteName),
    tailwind: exportToTailwind(palette, paletteName),
    json:     exportToJSON(palette, paletteName),
    table:    exportToFormats(palette),
  };

  $: {
    outputs = {
      css:      exportToCSS(palette, paletteName),
      tailwind: exportToTailwind(palette, paletteName),
      json:     exportToJSON(palette, paletteName),
      table:    exportToFormats(palette),
    };
  }

  $: current = outputs[activeFormat];

  async function handleCopy() {
    const ok = await copyToClipboard(current);
    if (ok) {
      copiedFormat = activeFormat;
      setTimeout(() => (copiedFormat = null), 2000);
    }
  }

  function handleDownload() {
    const ext: Record<FormatId, string> = {
      css: 'css', tailwind: 'js', json: 'json', table: 'tsv',
    };
    const mime: Record<FormatId, string> = {
      css: 'text/css', tailwind: 'text/javascript',
      json: 'application/json', table: 'text/tab-separated-values',
    };
    const blob = new Blob([current], { type: mime[activeFormat] });
    const url  = URL.createObjectURL(blob);
    downloadEl.href = url;
    downloadEl.download = `${paletteName}.${ext[activeFormat]}`;
    downloadEl.click();
    URL.revokeObjectURL(url);
  }

  /** Line count for the output */
  $: lineCount = current.split('\n').length;
</script>

<!-- Hidden anchor for download -->
<a bind:this={downloadEl} class="hidden" href="/" download>dl</a>

<div class="space-y-5 animate-fade-in">
  <!-- Palette name input -->
  <div>
    <p class="section-label mb-2">Nombre de la paleta</p>
    <input
      type="text"
      bind:value={paletteName}
      placeholder="mi-paleta"
      class="w-full bg-surface border border-border rounded-xl px-4 py-2.5
             font-mono text-sm text-text focus:outline-none focus:border-white/25 transition"
    />
  </div>

  <!-- Format tabs -->
  <div>
    <p class="section-label mb-2">Formato de exportación</p>
    <div class="flex gap-1.5 flex-wrap">
      {#each FORMATS as fmt}
        <button
          class="tab-btn flex items-center gap-1.5 text-xs"
          class:active={activeFormat === fmt.id}
          on:click={() => (activeFormat = fmt.id)}
        >
          <span class="font-mono opacity-60">{fmt.icon}</span>
          {fmt.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Code block -->
  <div class="relative">
    <!-- Header bar -->
    <div class="flex items-center justify-between px-4 py-2 bg-border/50 rounded-t-xl
                border border-border border-b-0">
      <div class="flex gap-1.5">
        <div class="w-2.5 h-2.5 rounded-full bg-red-500/60"/>
        <div class="w-2.5 h-2.5 rounded-full bg-amber-500/60"/>
        <div class="w-2.5 h-2.5 rounded-full bg-emerald-500/60"/>
      </div>
      <span class="font-mono text-[10px] text-muted">
        {FORMATS.find(f => f.id === activeFormat)?.lang ?? ''} — {lineCount} líneas
      </span>
      <div class="flex gap-2">
        <button
          on:click={handleCopy}
          class="text-xs font-mono px-2.5 py-1 rounded-lg bg-surface border border-border
                 text-muted hover:text-text hover:border-white/20 transition-all flex items-center gap-1.5"
        >
          {#if copiedFormat === activeFormat}
            <svg class="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            <span class="text-emerald-400">Copiado</span>
          {:else}
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copiar
          {/if}
        </button>
        <button
          on:click={handleDownload}
          class="text-xs font-mono px-2.5 py-1 rounded-lg bg-surface border border-border
                 text-muted hover:text-text hover:border-white/20 transition-all flex items-center gap-1.5"
        >
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar
        </button>
      </div>
    </div>

    <!-- Code area -->
    <pre
      class="bg-bg border border-border border-t-0 rounded-b-xl p-4 overflow-auto
             font-mono text-xs text-text/80 leading-relaxed max-h-80 whitespace-pre"
    >{current}</pre>
  </div>

  <!-- Quick color table -->
  {#if activeFormat === 'table'}
    <div class="panel overflow-hidden">
      <!-- Format legend -->
      <div class="px-4 py-3 border-b border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-mono">
        {#each [
          { fmt: 'HEX',  desc: 'Web / CSS', example: '#EF449A', use: 'Pantallas digitales' },
          { fmt: 'RGB',  desc: 'Rojo-Verde-Azul (luz)', example: 'rgb(239,68,154)', use: 'Pantallas, CSS' },
          { fmt: 'HSL',  desc: 'Matiz-Saturación-Luz', example: 'hsl(328,84%,60%)', use: 'CSS moderno, ajustes' },
          { fmt: 'CMYK', desc: 'Cian-Magenta-Amarillo-Negro', example: 'cmyk(0,72,36,6)', use: '🖨 Imprenta física' },
        ] as item}
          <div class="space-y-0.5">
            <span class="text-text font-bold">{item.fmt}</span>
            <p class="text-muted">{item.desc}</p>
            <p class="text-subtle">{item.use}</p>
          </div>
        {/each}
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-xs font-mono">
          <thead>
            <tr class="border-b border-border text-muted">
              <th class="text-left px-3 py-2">Nombre</th>
              <th class="text-left px-3 py-2">Muestra</th>
              <th class="text-left px-3 py-2">HEX</th>
              <th class="text-left px-3 py-2 hidden sm:table-cell">RGB</th>
              <th class="text-left px-3 py-2 hidden sm:table-cell">HSL</th>
              <th class="text-left px-3 py-2 hidden md:table-cell">CMYK 🖨</th>
            </tr>
          </thead>
          <tbody>
            {#each [
              palette.base,
              ...palette.analogous,
              ...palette.complementary,
              ...palette.triadic,
              ...palette.monochromatic,
            ] as color}
              {@const c = rgbToCMYK(color.rgb)}
              <tr class="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                <td class="px-3 py-2 text-muted">{color.name}</td>
                <td class="px-3 py-2">
                  <div class="w-6 h-6 rounded border border-white/10"
                       style="background-color:{color.hex};"/>
                </td>
                <td class="px-3 py-2 text-text font-bold">{color.hex.toUpperCase()}</td>
                <td class="px-3 py-2 text-muted hidden sm:table-cell">
                  {color.rgb.join(', ')}
                </td>
                <td class="px-3 py-2 text-muted hidden sm:table-cell">
                  {color.hsl[0]}° {Math.round(color.hsl[1]*100)}% {Math.round(color.hsl[2]*100)}%
                </td>
                <td class="px-3 py-2 text-muted hidden md:table-cell">
                  {c[0]}%, {c[1]}%, {c[2]}%, {c[3]}%
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
