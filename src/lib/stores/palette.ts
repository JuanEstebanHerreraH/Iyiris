import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { generatePalette, randomHex } from '$lib/utils/colorUtils';
import type { ColorPalette, SavedPalette } from '$lib/utils/colorUtils';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export type TabId = 'palette' | 'contrast' | 'colorblind' | 'preview' | 'export';

const LS_KEY = 'chromacraft_v1_palettes';

// ────────────────────────────────────────────────────────────────────────────
// Storage helpers
// ────────────────────────────────────────────────────────────────────────────

function loadSavedPalettes(): SavedPalette[] {
  if (!browser) return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SavedPalette[]) : [];
  } catch {
    return [];
  }
}

function persistPalettes(palettes: SavedPalette[]): void {
  if (!browser) return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(palettes));
  } catch {
    /* ignore quota errors */
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Base color store
// ────────────────────────────────────────────────────────────────────────────

const INITIAL_COLOR = '#6366f1'; // indigo

export const baseColor = writable<string>(INITIAL_COLOR);

/** The currently generated palette, derived from baseColor */
export const currentPalette = derived<typeof baseColor, ColorPalette>(
  baseColor,
  ($color) => generatePalette($color),
);

// ────────────────────────────────────────────────────────────────────────────
// Active tab
// ────────────────────────────────────────────────────────────────────────────

export const activeTab = writable<TabId>('palette');

// ────────────────────────────────────────────────────────────────────────────
// Saved palettes
// ────────────────────────────────────────────────────────────────────────────

function createSavedPalettesStore() {
  const { subscribe, set, update } = writable<SavedPalette[]>(loadSavedPalettes());

  return {
    subscribe,

    save(name: string): void {
      const palette = get(currentPalette);
      const color   = get(baseColor);
      const entry: SavedPalette = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: name.trim() || 'Sin nombre',
        baseColor: color,
        palette,
        createdAt: new Date().toISOString(),
      };
      update(list => {
        const next = [...list, entry];
        persistPalettes(next);
        return next;
      });
    },

    remove(id: string): void {
      update(list => {
        const next = list.filter(p => p.id !== id);
        persistPalettes(next);
        return next;
      });
    },

    load(saved: SavedPalette): void {
      baseColor.set(saved.baseColor);
    },

    clear(): void {
      set([]);
      if (browser) localStorage.removeItem(LS_KEY);
    },
  };
}

export const savedPalettes = createSavedPalettesStore();

// ────────────────────────────────────────────────────────────────────────────
// UI helpers
// ────────────────────────────────────────────────────────────────────────────

export function setRandomColor(): void {
  baseColor.set(randomHex());
}
