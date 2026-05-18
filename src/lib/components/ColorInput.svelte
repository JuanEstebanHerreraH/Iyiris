<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { isValidHex, randomHex } from '$lib/utils/colorUtils';
  import chroma from 'chroma-js';

  export let value = '#6366f1';

  const dispatch = createEventDispatcher<{ change: string }>();

  let inputText    = value;
  let isValid      = true;
  let isSpinning   = false;

  // Sync prop → local input when parent changes it programmatically
  $: if (isValidHex(value) && value !== inputText) {
    inputText = value;
    isValid = true;
  }

  function handleTextInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    inputText = raw;

    // Try to parse partial inputs like "3f6"
    let hex = raw.trim();
    if (!hex.startsWith('#')) hex = '#' + hex;

    if (isValidHex(hex)) {
      isValid = true;
      dispatch('change', hex);
    } else {
      isValid = false;
    }
  }

  function handlePickerInput(e: Event) {
    const hex = (e.target as HTMLInputElement).value;
    inputText = hex;
    isValid = true;
    dispatch('change', hex);
  }

  function handleRandom() {
    isSpinning = true;
    const hex = randomHex();
    inputText = hex;
    isValid = true;
    dispatch('change', hex);
    setTimeout(() => (isSpinning = false), 600);
  }

  // Preset colors
  const PRESETS = [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981',
    '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4',
  ];

  function applyPreset(hex: string) {
    inputText = hex;
    isValid = true;
    dispatch('change', hex);
  }
</script>

<div class="space-y-3">
  <p class="section-label">Color base</p>

  <!-- Main input row -->
  <div class="flex gap-2 items-stretch">
    <!-- Color picker swatch -->
    <label class="relative w-12 h-12 rounded-xl cursor-pointer shrink-0 overflow-hidden border border-border
                  hover:border-white/20 transition-colors shadow-chip"
           style="background-color: {isValid ? inputText : value};"
           title="Abrir selector de color">
      <input
        type="color"
        value={isValid ? inputText : value}
        on:input={handlePickerInput}
        class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
      />
    </label>

    <!-- Hex text input -->
    <input
      type="text"
      value={inputText}
      on:input={handleTextInput}
      maxlength={7}
      spellcheck={false}
      placeholder="#6366f1"
      class="flex-1 min-w-0 bg-surface border rounded-xl px-4 font-mono text-sm text-text
             focus:outline-none focus:ring-1 transition-all
             {isValid
               ? 'border-border focus:border-white/25 focus:ring-white/10'
               : 'border-red-500/40 focus:border-red-500/60 focus:ring-red-500/10'}"
    />

    <!-- Random button -->
    <button
      on:click={handleRandom}
      class="w-12 h-12 shrink-0 rounded-xl bg-surface border border-border text-muted
             hover:text-text hover:border-white/20 transition-all flex items-center justify-center"
      title="Color aleatorio"
      aria-label="Generar color aleatorio"
    >
      <svg
        class="w-4 h-4 transition-transform duration-500 {isSpinning ? 'rotate-180' : ''}"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      >
        <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/>
        <path d="m18 2 4 4-4 4"/>
        <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/>
        <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.7l-.5-.8"/>
        <path d="m18 14 4 4-4 4"/>
      </svg>
    </button>
  </div>

  <!-- Validation feedback -->
  {#if !isValid}
    <p class="text-xs text-red-400 font-mono animate-fade-in">
      HEX inválido — usa formato #RRGGBB
    </p>
  {/if}

  <!-- Preset swatches -->
  <div class="flex gap-1.5">
    {#each PRESETS as preset}
      <button
        class="w-6 h-6 rounded-md border-2 transition-all hover:scale-110"
        style="background-color: {preset};
               border-color: {preset === (isValid ? inputText : value) ? '#fff' : 'transparent'};"
        on:click={() => applyPreset(preset)}
        title={preset}
        aria-label="Preset {preset}"
      />
    {/each}
  </div>
</div>
