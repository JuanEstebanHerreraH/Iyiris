<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import chroma from 'chroma-js';
  import { rgbToCMYK, isValidHex } from '$lib/utils/colorUtils';
  import type { ColorPalette } from '$lib/utils/colorUtils';

  export let palette: ColorPalette;

  const dispatch = createEventDispatcher<{ change: string }>();

  let hexInput = '';
  let rInput = ''; let gInput = ''; let bInput = '';
  let hInput = ''; let sInput = ''; let lInput = '';
  let cInput = ''; let mInput = ''; let yInput = ''; let kInput = '';

  let hexError  = false;
  let rgbError  = false;
  let hslError  = false;
  let cmykError = false;

  let focused: 'hex' | 'rgb' | 'hsl' | 'cmyk' | null = null;

  $: if (palette) syncFromPalette(palette);

  function syncFromPalette(p: ColorPalette) {
    if (focused !== 'hex') { hexInput = p.base.hex.toUpperCase(); hexError = false; }
    if (focused !== 'rgb') { [rInput, gInput, bInput] = p.base.rgb.map(String); rgbError = false; }
    if (focused !== 'hsl') {
      const [h, s, l] = p.base.hsl;
      hInput = String(h);
      sInput = String(Math.round(s * 100));
      lInput = String(Math.round(l * 100));
      hslError = false;
    }
    if (focused !== 'cmyk') {
      const cmyk = rgbToCMYK(p.base.rgb);
      [cInput, mInput, yInput, kInput] = cmyk.map(String);
      cmykError = false;
    }
  }

  function onHexInput(e: Event) {
    let raw = (e.target as HTMLInputElement).value;
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
      <span class="row-label">HEX</span>
      <input class="row-input" type="text" maxlength={7} spellcheck={false}
        bind:value={hexInput}
        on:input={onHexInput}
        on:focus={() => (focused = 'hex')}
        on:blur={() => (focused = null)}
        placeholder="#6366f1" />
    </div>

    <!-- RGB -->
    <div class="color-row" class:error={rgbError}>
      <span class="row-label">RGB</span>
      <div class="flex gap-1 flex-1 justify-end">
        <input class="channel-input" type="number" min="0" max="255"
          bind:value={rInput} on:input={onRgbInput}
          on:focus={() => (focused = 'rgb')} on:blur={() => (focused = null)} title="Red" />
        <input class="channel-input" type="number" min="0" max="255"
          bind:value={gInput} on:input={onRgbInput}
          on:focus={() => (focused = 'rgb')} on:blur={() => (focused = null)} title="Green" />
        <input class="channel-input" type="number" min="0" max="255"
          bind:value={bInput} on:input={onRgbInput}
          on:focus={() => (focused = 'rgb')} on:blur={() => (focused = null)} title="Blue" />
      </div>
    </div>

    <!-- HSL -->
    <div class="color-row" class:error={hslError}>
      <span class="row-label">HSL</span>
      <div class="flex gap-1 flex-1 justify-end items-center">
        <div class="relative">
          <input class="channel-input w-14" type="number" min="0" max="360"
            bind:value={hInput} on:input={onHslInput}
            on:focus={() => (focused = 'hsl')} on:blur={() => (focused = null)} title="Hue" />
          <span class="unit">°</span>
        </div>
        <div class="relative">
          <input class="channel-input w-12" type="number" min="0" max="100"
            bind:value={sInput} on:input={onHslInput}
            on:focus={() => (focused = 'hsl')} on:blur={() => (focused = null)} title="Saturation" />
          <span class="unit">%</span>
        </div>
        <div class="relative">
          <input class="channel-input w-12" type="number" min="0" max="100"
            bind:value={lInput} on:input={onHslInput}
            on:focus={() => (focused = 'hsl')} on:blur={() => (focused = null)} title="Lightness" />
          <span class="unit">%</span>
        </div>
      </div>
    </div>

    <!-- CMYK -->
    <div class="color-row" class:error={cmykError}>
      <span class="row-label">CMYK</span>
      <div class="flex gap-0.5 flex-1 justify-end items-center">
        <div class="relative">
          <input class="cmyk-input" type="number" min="0" max="100"
            bind:value={cInput} on:input={onCmykInput}
            on:focus={() => (focused = 'cmyk')} on:blur={() => (focused = null)} title="Cyan" />
          <span class="unit">%</span>
        </div>
        <div class="relative">
          <input class="cmyk-input" type="number" min="0" max="100"
            bind:value={mInput} on:input={onCmykInput}
            on:focus={() => (focused = 'cmyk')} on:blur={() => (focused = null)} title="Magenta" />
          <span class="unit">%</span>
        </div>
        <div class="relative">
          <input class="cmyk-input" type="number" min="0" max="100"
            bind:value={yInput} on:input={onCmykInput}
            on:focus={() => (focused = 'cmyk')} on:blur={() => (focused = null)} title="Yellow" />
          <span class="unit">%</span>
        </div>
        <div class="relative">
          <input class="cmyk-input" type="number" min="0" max="100"
            bind:value={kInput} on:input={onCmykInput}
            on:focus={() => (focused = 'cmyk')} on:blur={() => (focused = null)} title="Key/Black" />
          <span class="unit">%</span>
        </div>
      </div>
    </div>

  </div>
</div>

<style>
  .color-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    background-color: rgb(0 0 0 / 0.4);
    border: 1px solid var(--color-border, rgb(255 255 255 / 0.08));
    gap: 0.5rem;
    transition: border-color 0.15s;
  }
  .color-row:focus-within { border-color: rgb(255 255 255 / 0.2); }
  .color-row.error { border-color: rgb(239 68 68 / 0.5); }
  .row-label {
    font-size: 0.65rem;
    color: var(--color-muted, rgb(255 255 255 / 0.4));
    flex-shrink: 0;
    letter-spacing: 0.05em;
  }
  .row-input {
    background: transparent; border: none; outline: none;
    font-family: inherit; font-size: 0.7rem;
    color: var(--color-text, #e2e2e2);
    text-align: right; width: 100%; min-width: 0;
  }
  .channel-input {
    background: transparent; border: none; outline: none;
    font-family: inherit; font-size: 0.7rem;
    color: var(--color-text, #e2e2e2);
    text-align: right; width: 2.6rem;
    -moz-appearance: textfield;
    padding-right: 1rem;
  }
  .channel-input::-webkit-outer-spin-button,
  .channel-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .cmyk-input {
    background: transparent; border: none; outline: none;
    font-family: inherit; font-size: 0.65rem;
    color: var(--color-text, #e2e2e2);
    text-align: right; width: 2rem;
    -moz-appearance: textfield;
    padding-right: 0.8rem;
  }
  .cmyk-input::-webkit-outer-spin-button,
  .cmyk-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .relative { position: relative; }
  .unit {
    position: absolute; right: 0; top: 50%; transform: translateY(-50%);
    font-size: 0.65rem; color: var(--color-muted, rgb(255 255 255 / 0.35));
    pointer-events: none;
  }
</style>
