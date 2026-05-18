<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import chroma from 'chroma-js';
  import { rgbToCMYK, isValidHex } from '$lib/utils/colorUtils';
  import type { ColorPalette } from '$lib/utils/colorUtils';

  export let palette: ColorPalette;
  const dispatch = createEventDispatcher<{ change: string }>();

  let hexInput = ''; let hexError = false;
  let rInput = ''; let gInput = ''; let bInput = ''; let rgbError = false;
  let hInput = ''; let sInput = ''; let lInput = ''; let hslError = false;
  let cInput = ''; let mInput = ''; let yInput = ''; let kInput = ''; let cmykError = false;

  let focused: 'hex' | 'rgb' | 'hsl' | 'cmyk' | null = null;

  // Solo sincroniza cuando cambia la paleta Y el campo no está en foco
  let lastHex = '';
  $: if (palette && palette.base.hex !== lastHex) {
    lastHex = palette.base.hex;
    if (focused !== 'hex') { hexInput = palette.base.hex.toUpperCase(); hexError = false; }
    if (focused !== 'rgb') { [rInput, gInput, bInput] = palette.base.rgb.map(String); rgbError = false; }
    if (focused !== 'hsl') {
      const [h, s, l] = palette.base.hsl;
      hInput = String(h); sInput = String(Math.round(s * 100)); lInput = String(Math.round(l * 100));
      hslError = false;
    }
    if (focused !== 'cmyk') {
      const cmyk = rgbToCMYK(palette.base.rgb);
      [cInput, mInput, yInput, kInput] = cmyk.map(String); cmykError = false;
    }
  }

  function onHexInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    hexInput = raw;
    let hex = raw.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (isValidHex(hex)) { hexError = false; dispatch('change', hex.toLowerCase()); }
    else { hexError = true; }
  }

  function onRgbInput() {
    const r = parseInt(rInput), g = parseInt(gInput), b = parseInt(bInput);
    if ([r, g, b].every(n => !isNaN(n) && n >= 0 && n <= 255)) {
      rgbError = false;
      try { dispatch('change', chroma(r, g, b).hex()); } catch { rgbError = true; }
    } else { rgbError = true; }
  }

  function onHslInput() {
    const h = parseFloat(hInput), s = parseFloat(sInput) / 100, l = parseFloat(lInput) / 100;
    if (!isNaN(h) && !isNaN(s) && !isNaN(l) && h >= 0 && h <= 360 && s >= 0 && s <= 1 && l >= 0 && l <= 1) {
      hslError = false;
      try { dispatch('change', chroma.hsl(h, s, l).hex()); } catch { hslError = true; }
    } else { hslError = true; }
  }

  function onCmykInput() {
    const c = parseFloat(cInput), m = parseFloat(mInput), y = parseFloat(yInput), k = parseFloat(kInput);
    if ([c, m, y, k].every(n => !isNaN(n) && n >= 0 && n <= 100)) {
      cmykError = false;
      try {
        const kk = k / 100;
        const r = Math.round(255 * (1 - c / 100) * (1 - kk));
        const g = Math.round(255 * (1 - m / 100) * (1 - kk));
        const b = Math.round(255 * (1 - y / 100) * (1 - kk));
        dispatch('change', chroma(r, g, b).hex());
      } catch { cmykError = true; }
    } else { cmykError = true; }
  }
</script>

<div>
  <p class="section-label mb-3">Información del color</p>
  <div class="space-y-1.5 font-mono">

    <!-- HEX -->
    <div class="color-row" class:error={hexError}>
      <span class="lbl">HEX</span>
      <input class="row-input" type="text" maxlength={7} spellcheck={false}
        value={hexInput}
        on:input={onHexInput}
        on:focus={() => (focused = 'hex')}
        on:blur={() => (focused = null)}
        placeholder="#6366f1" />
    </div>

    <!-- RGB -->
    <div class="color-row" class:error={rgbError}>
      <span class="lbl">RGB</span>
      <div class="ch-group">
        <input class="ch" type="number" min="0" max="255" value={rInput}
          on:input={(e) => { rInput = (e.target as HTMLInputElement).value; onRgbInput(); }}
          on:focus={() => (focused = 'rgb')} on:blur={() => (focused = null)} title="R" />
        <input class="ch" type="number" min="0" max="255" value={gInput}
          on:input={(e) => { gInput = (e.target as HTMLInputElement).value; onRgbInput(); }}
          on:focus={() => (focused = 'rgb')} on:blur={() => (focused = null)} title="G" />
        <input class="ch" type="number" min="0" max="255" value={bInput}
          on:input={(e) => { bInput = (e.target as HTMLInputElement).value; onRgbInput(); }}
          on:focus={() => (focused = 'rgb')} on:blur={() => (focused = null)} title="B" />
      </div>
    </div>

    <!-- HSL -->
    <div class="color-row" class:error={hslError}>
      <span class="lbl">HSL</span>
      <div class="ch-group">
        <div class="rel">
          <input class="ch w14" type="number" min="0" max="360" value={hInput}
            on:input={(e) => { hInput = (e.target as HTMLInputElement).value; onHslInput(); }}
            on:focus={() => (focused = 'hsl')} on:blur={() => (focused = null)} title="H" />
          <span class="unit">°</span>
        </div>
        <div class="rel">
          <input class="ch w12" type="number" min="0" max="100" value={sInput}
            on:input={(e) => { sInput = (e.target as HTMLInputElement).value; onHslInput(); }}
            on:focus={() => (focused = 'hsl')} on:blur={() => (focused = null)} title="S" />
          <span class="unit">%</span>
        </div>
        <div class="rel">
          <input class="ch w12" type="number" min="0" max="100" value={lInput}
            on:input={(e) => { lInput = (e.target as HTMLInputElement).value; onHslInput(); }}
            on:focus={() => (focused = 'hsl')} on:blur={() => (focused = null)} title="L" />
          <span class="unit">%</span>
        </div>
      </div>
    </div>

    <!-- CMYK -->
    <div class="color-row" class:error={cmykError}>
      <span class="lbl">CMYK</span>
      <div class="ch-group">
        <div class="rel">
          <input class="ch cmyk" type="number" min="0" max="100" value={cInput}
            on:input={(e) => { cInput = (e.target as HTMLInputElement).value; onCmykInput(); }}
            on:focus={() => (focused = 'cmyk')} on:blur={() => (focused = null)} title="C" />
          <span class="unit">%</span>
        </div>
        <div class="rel">
          <input class="ch cmyk" type="number" min="0" max="100" value={mInput}
            on:input={(e) => { mInput = (e.target as HTMLInputElement).value; onCmykInput(); }}
            on:focus={() => (focused = 'cmyk')} on:blur={() => (focused = null)} title="M" />
          <span class="unit">%</span>
        </div>
        <div class="rel">
          <input class="ch cmyk" type="number" min="0" max="100" value={yInput}
            on:input={(e) => { yInput = (e.target as HTMLInputElement).value; onCmykInput(); }}
            on:focus={() => (focused = 'cmyk')} on:blur={() => (focused = null)} title="Y" />
          <span class="unit">%</span>
        </div>
        <div class="rel">
          <input class="ch cmyk" type="number" min="0" max="100" value={kInput}
            on:input={(e) => { kInput = (e.target as HTMLInputElement).value; onCmykInput(); }}
            on:focus={() => (focused = 'cmyk')} on:blur={() => (focused = null)} title="K" />
          <span class="unit">%</span>
        </div>
      </div>
    </div>

  </div>
</div>

<style>
  .color-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.35rem 0.6rem; border-radius: 0.5rem;
    background: rgb(0 0 0 / 0.4);
    border: 1px solid rgb(255 255 255 / 0.08);
    gap: 0.4rem; transition: border-color 0.15s;
  }
  .color-row:focus-within { border-color: rgb(255 255 255 / 0.22); }
  .color-row.error { border-color: rgb(239 68 68 / 0.5); }

  .lbl { font-size: 0.6rem; color: rgb(255 255 255 / 0.38); flex-shrink: 0; letter-spacing: 0.06em; }

  .row-input {
    background: transparent; border: none; outline: none;
    font-family: inherit; font-size: 0.7rem; color: #e2e2e2;
    text-align: right; width: 100%; min-width: 0;
  }

  .ch-group { display: flex; gap: 0.25rem; align-items: center; flex: 1; justify-content: flex-end; }

  .rel { position: relative; }

  .ch {
    background: transparent; border: none; outline: none;
    font-family: inherit; font-size: 0.68rem; color: #e2e2e2;
    text-align: right; width: 2.4rem;
    -moz-appearance: textfield; padding-right: 0.85rem;
  }
  .ch.w14 { width: 2.8rem; }
  .ch.w12 { width: 2.2rem; }
  .ch.cmyk { width: 1.9rem; padding-right: 0.75rem; font-size: 0.62rem; }
  .ch::-webkit-outer-spin-button, .ch::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

  .unit {
    position: absolute; right: 0; top: 50%; transform: translateY(-50%);
    font-size: 0.58rem; color: rgb(255 255 255 / 0.3); pointer-events: none;
  }
</style>
