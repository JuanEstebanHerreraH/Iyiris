<script lang="ts">
  import { baseColor, currentPalette, activeTab, setRandomColor } from '$lib/stores/palette';
  import type { TabId } from '$lib/stores/palette';

  import ColorInput          from '$lib/components/ColorInput.svelte';
  import ColorInfo           from '$lib/components/ColorInfo.svelte';
  import PaletteDisplay      from '$lib/components/PaletteDisplay.svelte';
  import ContrastChecker     from '$lib/components/ContrastChecker.svelte';
  import ColorblindSimulator from '$lib/components/ColorblindSimulator.svelte';
  import UIPreview           from '$lib/components/UIPreview.svelte';
  import ExportPanel         from '$lib/components/ExportPanel.svelte';
  import FavoritesSidebar    from '$lib/components/FavoritesSidebar.svelte';

  const TABS: { id: TabId; label: string; icon: string }[] = [
    { id: 'palette',    label: 'Paleta',       icon: '◈' },
    { id: 'contrast',   label: 'Contraste',    icon: '◐' },
    { id: 'colorblind', label: 'Daltonismo',   icon: '◎' },
    { id: 'preview',    label: 'Vista Previa', icon: '▣' },
    { id: 'export',     label: 'Exportar',     icon: '⤓' },
  ];

  let sidebarOpen = true;
  function handleColorChange(e: CustomEvent<string>) {
    baseColor.set(e.detail);
  }
</script>

<svelte:head>
  <title>iyiris — Diseño de Paletas</title>
</svelte:head>

<div class="min-h-screen flex flex-col" style="background-color: #07070f;">
  <!-- ═══ Top bar ═══════════════════════════════════════════════════════════ -->
  <header class="h-14 border-b border-border flex items-center px-5 gap-4 shrink-0 z-10
                 bg-surface/80 backdrop-blur-md sticky top-0">
    <!-- Logo -->
    <div class="flex items-center gap-2.5 shrink-0">
      <img
        src="/iyiris-logo.png"
        alt="iyiris"
        class="w-8 h-8 rounded-lg object-cover"
      />
      <span class="font-display font-bold text-base tracking-tight text-text">
        iyiris
      </span>
    </div>

    <!-- Tabs (desktop) — centrados con absolute -->
    <nav class="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
      {#each TABS as tab}
        <button
          class="tab-btn flex items-center gap-1.5 text-xs"
          class:active={$activeTab === tab.id}
          on:click={() => activeTab.set(tab.id)}
        >
          <span class="opacity-60">{tab.icon}</span>
          {tab.label}
        </button>
      {/each}
    </nav>

    <!-- Right side -->
    <div class="ml-auto flex items-center gap-2">
      <button
        on:click={() => (sidebarOpen = !sidebarOpen)}
        class="btn-ghost text-xs flex items-center gap-1.5 hidden md:flex"
        title="Toggle panel de favoritos"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        Favoritos
      </button>
    </div>
  </header>

  <!-- ═══ Mobile tabs ════════════════════════════════════════════════════════ -->
  <nav class="flex md:hidden items-center gap-0.5 px-3 py-2 border-b border-border
              overflow-x-auto bg-surface/60 backdrop-blur-md">
    {#each TABS as tab}
      <button
        class="tab-btn flex items-center gap-1 text-[11px] whitespace-nowrap"
        class:active={$activeTab === tab.id}
        on:click={() => activeTab.set(tab.id)}
      >
        <span>{tab.icon}</span>
        {tab.label}
      </button>
    {/each}
  </nav>

  <!-- ═══ Main layout ════════════════════════════════════════════════════════ -->
  <div class="flex flex-1 overflow-hidden">

    <!-- ─── Left panel ────────────────────────────────────────────────────── -->
    <aside class="w-64 shrink-0 border-r border-border hidden md:flex flex-col
                  bg-surface/50 overflow-y-auto">
      <div class="p-5 space-y-5">
        <ColorInput value={$baseColor} on:change={handleColorChange} />

        {#if $currentPalette}
          <ColorInfo palette={$currentPalette} on:change={handleColorChange} />

          <div>
            <p class="section-label mb-2">Escala monocromática</p>
            <div class="flex rounded-xl overflow-hidden border border-border" style="height:32px;">
              {#each $currentPalette.monochromatic as c}
                <div class="flex-1" style="background-color:{c.hex};" title={c.hex}/>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </aside>

    <!-- ─── Center ─────────────────────────────────────────────────────────── -->
    <main class="flex-1 overflow-y-auto">
      <div class="md:hidden p-4 border-b border-border bg-surface/50">
        <ColorInput value={$baseColor} on:change={handleColorChange} />
      </div>

      <div class="p-5 md:p-7 max-w-3xl mx-auto">
        {#if $currentPalette}
          {#if $activeTab === 'palette'}
            <PaletteDisplay palette={$currentPalette} />
          {:else if $activeTab === 'contrast'}
            <ContrastChecker palette={$currentPalette} />
          {:else if $activeTab === 'colorblind'}
            <ColorblindSimulator palette={$currentPalette} />
          {:else if $activeTab === 'preview'}
            <UIPreview palette={$currentPalette} />
          {:else if $activeTab === 'export'}
            <ExportPanel palette={$currentPalette} />
          {/if}
        {:else}
          <div class="flex items-center justify-center h-64">
            <div class="text-center space-y-2">
              <div class="text-4xl animate-pulse-soft">◈</div>
              <p class="text-sm text-muted">Generando paleta…</p>
            </div>
          </div>
        {/if}
      </div>
    </main>

    <!-- ─── Right panel: favorites ─────────────────────────────────────────── -->
    {#if sidebarOpen}
      <aside class="w-72 shrink-0 border-l border-border hidden md:flex flex-col
                    bg-surface/50 overflow-hidden">
        <div class="px-5 pt-5 pb-2 border-b border-border">
          <div class="flex items-center justify-between">
            <p class="section-label">Paletas guardadas</p>
            <button
              on:click={() => (sidebarOpen = false)}
              class="text-muted hover:text-text transition-colors"
              aria-label="Cerrar panel"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-hidden p-5">
          <FavoritesSidebar />
        </div>
      </aside>
    {/if}
  </div>

  <!-- ═══ Status bar ═════════════════════════════════════════════════════════ -->
  <footer class="h-8 border-t border-border flex items-center px-5 gap-4 shrink-0
                 bg-surface/30 hidden md:flex">
    <span class="font-mono text-[10px] text-muted">iyiris v0.1.0</span>
    <span class="font-mono text-[10px] text-border">|</span>
    <span class="font-mono text-[10px] text-muted">
      Sin backend · TypeScript + Svelte + chroma.js
    </span>
    <span class="ml-auto font-mono text-[10px]" style="color: {$baseColor};">
      ● {$baseColor.toUpperCase()}
    </span>
  </footer>
</div>
