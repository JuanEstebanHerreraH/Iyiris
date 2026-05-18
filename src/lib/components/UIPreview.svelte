<script lang="ts">
  import type { ColorPalette } from '$lib/utils/colorUtils';
  import { getContrastColor } from '$lib/utils/colorUtils';

  export let palette: ColorPalette;

  // Extract semantic roles from the palette
  $: primary   = palette.base.hex;
  $: secondary = palette.analogous[1]?.hex   ?? palette.analogous[0]?.hex;
  $: accent    = palette.complementary[0]?.hex;
  $: light     = palette.monochromatic[0]?.hex;  // lightest tint
  $: dark      = palette.monochromatic[palette.monochromatic.length - 1]?.hex;
  $: mid       = palette.monochromatic[Math.floor(palette.monochromatic.length / 2)]?.hex;

  $: onPrimary   = getContrastColor(primary);
  $: onSecondary = getContrastColor(secondary);
  $: onAccent    = getContrastColor(accent);
  $: onLight     = getContrastColor(light);
  $: onDark      = getContrastColor(dark);

  let activeTab: 'light' | 'dark' = 'light';

  function tabClass(t: string) {
    return activeTab === t
      ? 'bg-white/10 text-text'
      : 'text-muted hover:text-text';
  }

  function setTab(t: string) {
    if (t === 'light' || t === 'dark') activeTab = t;
  }
</script>

<div class="space-y-5 animate-fade-in">
  <!-- Theme switch -->
  <div class="flex items-center gap-1 bg-surface border border-border rounded-xl p-1 w-fit">
    {#each ['light', 'dark'] as t}
      <button
        class="px-4 py-1.5 rounded-lg text-sm font-medium transition-all {tabClass(t)}"
        on:click={() => setTab(t)}
      >
        {t === 'light' ? '☀ Claro' : '☾ Oscuro'}
      </button>
    {/each}
  </div>

  <!-- ─── LIGHT THEME PREVIEW ──────────────────────────────────────────── -->
  {#if activeTab === 'light'}
    <div class="rounded-2xl border border-border overflow-hidden shadow-panel"
         style="background-color: {light}; color: {onLight};">
      <!-- Navbar -->
      <nav class="px-5 py-3 flex items-center gap-4 border-b"
           style="background-color: {primary}; border-color: {primary}dd; color: {onPrimary};">
        <span class="font-display font-bold text-base">MiApp</span>
        <div class="flex gap-4 text-sm ml-2">
          {#each ['Inicio', 'Productos', 'Nosotros'] as item}
            <a href="#" class="opacity-80 hover:opacity-100 transition-opacity" style="color: {onPrimary};">
              {item}
            </a>
          {/each}
        </div>
        <div class="ml-auto">
          <button class="px-3 py-1 rounded-lg text-xs font-semibold border"
                  style="border-color: {onPrimary}55; color: {onPrimary};">
            Ingresar
          </button>
        </div>
      </nav>

      <!-- Hero section -->
      <div class="px-5 py-8 text-center" style="background: linear-gradient(135deg, {light} 0%, {mid}33 100%);">
        <p class="text-xs font-mono font-bold uppercase tracking-widest mb-2 opacity-60"
           style="color: {primary};">
          Bienvenido
        </p>
        <h1 class="text-2xl font-display font-bold mb-3" style="color: {onLight};">
          Diseña con color
        </h1>
        <p class="text-sm mb-5 opacity-70" style="color: {onLight};">
          Tu paleta aplicada en una interfaz real. Ajusta el color base y ve los cambios en tiempo real.
        </p>
        <div class="flex gap-3 justify-center">
          <button class="px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all hover:brightness-110"
                  style="background-color: {primary}; color: {onPrimary};">
            Empezar gratis
          </button>
          <button class="px-5 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
                  style="border-color: {primary}55; color: {primary};">
            Ver demo
          </button>
        </div>
      </div>

      <!-- Cards row -->
      <div class="px-5 py-5 grid grid-cols-3 gap-3">
        {#each [
          { title: 'Diseño',       icon: '◈', desc: 'Crea paletas en segundos' },
          { title: 'Accesible',    icon: '◎', desc: 'WCAG AA/AAA verificado'   },
          { title: 'Exportable',   icon: '⤓', desc: 'CSS, Tailwind, JSON'      },
        ] as card}
          <div class="rounded-xl p-4 border" style="background-color: {light}ee; border-color: {primary}22;">
            <div class="w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-lg"
                 style="background-color: {primary}22; color: {primary};">
              {card.icon}
            </div>
            <p class="font-semibold text-sm mb-1" style="color: {onLight};">{card.title}</p>
            <p class="text-xs opacity-60" style="color: {onLight};">{card.desc}</p>
          </div>
        {/each}
      </div>

      <!-- Badge + input row -->
      <div class="px-5 pb-5 flex flex-wrap gap-2 items-center">
        {#each ['Nuevo', 'Popular', 'Destacado', 'Beta'] as label, i}
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style="background-color: {[primary, secondary, accent, mid][i % 4]}22;
                       color: {[primary, secondary, accent, mid][i % 4]};">
            {label}
          </span>
        {/each}
        <div class="ml-auto flex items-center gap-2">
          <input type="text" placeholder="Buscar…" readonly
                 class="px-3 py-1.5 rounded-lg text-xs border outline-none w-28"
                 style="background: {light}; border-color: {primary}33; color: {onLight};" />
          <button class="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style="background-color: {accent}; color: {onAccent};">
            Buscar
          </button>
        </div>
      </div>
    </div>

  <!-- ─── DARK THEME PREVIEW ───────────────────────────────────────────── -->
  {:else}
    <div class="rounded-2xl border border-border overflow-hidden shadow-panel"
         style="background-color: {dark}; color: {onDark};">
      <!-- Navbar -->
      <nav class="px-5 py-3 flex items-center gap-4 border-b"
           style="border-color: {primary}33;">
        <span class="font-display font-bold text-base" style="color: {primary};">MiApp</span>
        <div class="flex gap-4 text-sm ml-2">
          {#each ['Inicio', 'Productos', 'Nosotros'] as item}
            <a href="#" class="opacity-60 hover:opacity-100 transition-opacity" style="color: {onDark};">
              {item}
            </a>
          {/each}
        </div>
        <div class="ml-auto">
          <button class="px-3 py-1 rounded-lg text-xs font-semibold"
                  style="background-color: {primary}; color: {onPrimary};">
            Ingresar
          </button>
        </div>
      </nav>

      <!-- Hero -->
      <div class="px-5 py-8 text-center" style="background: radial-gradient(ellipse at top, {primary}15 0%, transparent 70%);">
        <p class="text-xs font-mono font-bold uppercase tracking-widest mb-2"
           style="color: {primary};">Bienvenido</p>
        <h1 class="text-2xl font-display font-bold mb-3" style="color: {onDark};">
          Diseña con color
        </h1>
        <p class="text-sm mb-5 opacity-50" style="color: {onDark};">
          Tu paleta aplicada en modo oscuro. Ajusta el color base y ve los cambios.
        </p>
        <div class="flex gap-3 justify-center">
          <button class="px-5 py-2 rounded-xl text-sm font-semibold"
                  style="background-color: {primary}; color: {onPrimary};">
            Empezar gratis
          </button>
          <button class="px-5 py-2 rounded-xl text-sm font-semibold border"
                  style="border-color: {primary}55; color: {primary};">
            Ver demo
          </button>
        </div>
      </div>

      <!-- Cards -->
      <div class="px-5 py-5 grid grid-cols-3 gap-3">
        {#each [
          { title: 'Diseño',     icon: '◈', color: primary   },
          { title: 'Accesible',  icon: '◎', color: secondary },
          { title: 'Exportable', icon: '⤓', color: accent    },
        ] as card}
          <div class="rounded-xl p-4 border" style="border-color: {card.color}22; background-color: {card.color}0a;">
            <div class="w-8 h-8 rounded-lg mb-3 flex items-center justify-center"
                 style="background-color: {card.color}22; color: {card.color};">
              {card.icon}
            </div>
            <p class="font-semibold text-sm mb-1" style="color: {onDark};">{card.title}</p>
            <p class="text-xs" style="color: {onDark}; opacity:0.45;">Descripción breve aquí</p>
          </div>
        {/each}
      </div>

      <!-- Alert / notification example -->
      <div class="px-5 pb-5 space-y-2">
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl border"
             style="border-color: {primary}33; background-color: {primary}15;">
          <span style="color: {primary};">●</span>
          <p class="text-xs" style="color: {onDark}; opacity: 0.8;">
            Notificación informativa usando el color primario como acento.
          </p>
        </div>
        <div class="flex items-center gap-3 px-4 py-3 rounded-xl border"
             style="border-color: {accent}33; background-color: {accent}15;">
          <span style="color: {accent};">◆</span>
          <p class="text-xs" style="color: {onDark}; opacity: 0.8;">
            Alerta usando el color complementario como acento de contraste.
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
