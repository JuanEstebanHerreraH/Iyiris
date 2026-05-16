# ChromaCraft 🎨

Herramienta profesional de diseño de paletas de color — **Fase 1 (Web)**.

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | SvelteKit 2 + Svelte 4 |
| Lenguaje | TypeScript estricto |
| Estilos | Tailwind CSS 3 |
| Color engine | chroma.js 2 |
| Persistencia | localStorage (sin backend) |
| Build | Vite 5 |

## Características

- **Paletas automáticas** — análogos, complementarios, triádicos, monocromáticos
- **Contraste WCAG** — ratio en tiempo real, niveles AA / AAA para texto normal, grande y UI
- **Simulación daltonismo** — protanopía, deuteranopía, tritanopía, acromatopsia
- **Vista previa UI** — botones, cards, navbar, badges en tema claro y oscuro
- **Exportación** — CSS custom properties, Tailwind config, JSON, tabla HEX/RGB/HSL
- **Favoritos** — guarda y carga paletas desde localStorage

---

## Setup rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Servidor de desarrollo
npm run dev

# 3. Build de producción
npm run build

# 4. Vista previa del build
npm run preview
```

La app queda en **http://localhost:5173**

---

## Estructura del proyecto

```
chromacraft/
├── src/
│   ├── app.html                    # Template HTML (carga fuentes Google)
│   ├── app.css                     # Tailwind + clases globales + grain
│   │
│   ├── lib/
│   │   ├── utils/
│   │   │   ├── colorUtils.ts       # Generación de paletas con chroma.js
│   │   │   ├── contrast.ts         # Cálculo WCAG AA/AAA
│   │   │   ├── colorblind.ts       # Matrices de simulación de daltonismo
│   │   │   └── export.ts           # CSS / Tailwind / JSON / TSV
│   │   │
│   │   ├── stores/
│   │   │   └── palette.ts          # Estado global + localStorage
│   │   │
│   │   └── components/
│   │       ├── ColorInput.svelte       # Picker + texto + presets
│   │       ├── ColorChip.svelte        # Chip reutilizable con copy
│   │       ├── PaletteDisplay.svelte   # Las 4 armonías en grid
│   │       ├── ContrastChecker.svelte  # WCAG en tiempo real
│   │       ├── ColorblindSimulator.svelte
│   │       ├── UIPreview.svelte        # Mockup claro/oscuro
│   │       ├── ExportPanel.svelte      # Código exportable
│   │       └── FavoritesSidebar.svelte # Gestión de favoritos
│   │
│   └── routes/
│       ├── +layout.svelte          # Import CSS global
│       └── +page.svelte            # Shell principal (sidebar + tabs)
│
├── tailwind.config.js
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Roadmap

| Fase | Estado | Descripción |
|------|--------|-------------|
| **1 — Web** | ✅ Completa | SvelteKit + Tailwind + chroma.js |
| **2 — Desktop** | ⏳ Pendiente | Empaquetado con Tauri 2.0 → `.exe` / `.dmg` |
| **3 — Mobile** | ⏳ Pendiente | Tauri 2.0 Mobile → `.apk` Android |

---

## Notas de diseño

- **Sin backend**: toda la lógica corre en el navegador
- **localStorage key**: `chromacraft_v1_palettes`
- Las matrices de daltonismo están basadas en Brettel (1997) / Viénot (1999)
- El contraste usa la fórmula oficial WCAG 2.1 a través de `chroma.contrast()`
