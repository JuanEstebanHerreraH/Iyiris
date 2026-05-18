<script lang="ts">
  import { savedPalettes, baseColor } from '$lib/stores/palette';
  import type { SavedPalette } from '$lib/utils/colorUtils';
  import { getContrastColor } from '$lib/utils/colorUtils';

  let saveName = '';
  let confirmClearId: string | null = null;

  function handleSave() {
    if (!saveName.trim()) return;
    savedPalettes.save(saveName.trim());
    saveName = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
  }

  function handleLoad(p: SavedPalette) {
    savedPalettes.load(p);
  }

  function handleDelete(id: string) {
    if (confirmClearId === id) {
      savedPalettes.remove(id);
      confirmClearId = null;
    } else {
      confirmClearId = id;
      setTimeout(() => (confirmClearId = null), 2500);
    }
  }

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short',
      });
    } catch { return ''; }
  }

  /** Mini color strip from a saved palette */
  function getSwatchColors(p: SavedPalette): string[] {
    return [
      p.palette.base.hex,
      p.palette.analogous[0]?.hex,
      p.palette.complementary[0]?.hex,
      p.palette.triadic[0]?.hex,
      p.palette.monochromatic[2]?.hex,
    ].filter(Boolean) as string[];
  }
</script>

<div class="h-full flex flex-col gap-4">
  <!-- Save current palette -->
  <div>
    <p class="section-label mb-2">Guardar paleta actual</p>
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={saveName}
        on:keydown={handleKeydown}
        placeholder="Nombre de la paleta…"
        maxlength={40}
        class="flex-1 min-w-0 bg-bg border border-border rounded-xl px-3 py-2
               text-sm text-text font-sans focus:outline-none focus:border-white/25 transition"
      />
      <button
        on:click={handleSave}
        disabled={!saveName.trim()}
        class="px-3 py-2 rounded-xl text-sm font-semibold bg-white/10 border border-border
               text-text hover:bg-white/15 hover:border-white/20 transition-all
               disabled:opacity-30 disabled:cursor-not-allowed"
        title="Guardar"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- List -->
  <div class="flex-1 overflow-y-auto space-y-2 min-h-0">
    {#if $savedPalettes.length === 0}
      <div class="text-center py-10 space-y-2">
        <div class="text-3xl opacity-20">◈</div>
        <p class="text-xs text-muted">No hay paletas guardadas.</p>
        <p class="text-xs text-muted opacity-60">Guarda tu primera paleta arriba.</p>
      </div>
    {:else}
      {#each $savedPalettes as p (p.id)}
        <div
          class="group panel p-3 cursor-pointer hover:border-white/15 transition-all"
          on:click={() => handleLoad(p)}
          on:keypress={(e) => e.key === 'Enter' && handleLoad(p)}
          role="button"
          tabindex="0"
          aria-label="Cargar paleta {p.name}"
        >
          <!-- Color swatch strip -->
          <div class="flex rounded-lg overflow-hidden h-6 mb-2.5 border border-white/5">
            {#each getSwatchColors(p) as hex}
              <div class="flex-1" style="background-color: {hex};"/>
            {/each}
          </div>

          <div class="flex items-center justify-between">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-text truncate">{p.name}</p>
              <p class="font-mono text-[10px] text-muted mt-0.5">
                {p.baseColor.toUpperCase()} · {formatDate(p.createdAt)}
              </p>
            </div>
            <div class="flex items-center gap-1 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <!-- Base color dot -->
              <div class="w-4 h-4 rounded-full border border-white/10 shrink-0"
                   style="background-color: {p.baseColor};"/>
              <!-- Delete -->
              <button
                on:click|stopPropagation={() => handleDelete(p.id)}
                class="w-7 h-7 rounded-lg flex items-center justify-center transition-all
                       {confirmClearId === p.id
                         ? 'bg-red-500/20 text-red-400'
                         : 'text-muted hover:text-red-400 hover:bg-red-500/10'}"
                title={confirmClearId === p.id ? 'Click para confirmar' : 'Eliminar'}
              >
                {#if confirmClearId === p.id}
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                {:else}
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6m4-6v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                {/if}
              </button>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Footer -->
  {#if $savedPalettes.length > 0}
    <div class="border-t border-border pt-3">
      <p class="text-[10px] text-muted font-mono text-center">
        {$savedPalettes.length} paleta{$savedPalettes.length !== 1 ? 's' : ''} — guardadas en localStorage
      </p>
    </div>
  {/if}
</div>
