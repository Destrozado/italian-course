# Phase 28: Responsive / mobile-friendly - Context

**Gathered:** 2026-06-15
**Status:** Ready for UI design contract

<domain>
## Phase Boundary

Hacer la app responsive / usable en móvil. Hoy es desktop-only: CERO media queries en `styles.css` (509 líneas), aunque el `<meta viewport>` ya está. Pico CSS (classless) + Alpine.js, zero-build. App de una sola persona, uso local; el móvil se evalúa "después" según CLAUDE.md y ahora se echa en falta.

Cubre TODAS las pantallas (`currentScreen`): `home`, `picker`, `session`, `cancion`, `summary`, `cancion-summary`, `backup`.
</domain>

<decisions>
## Implementation Decisions (LOCKED — del autor)

### Problemas concretos detectados en móvil (a resolver sí o sí)
- **Tabla de home** (6 columnas: Estado / Categoría / Racha / Ejercicios / Última vez / Examen) se corta; el botón **"Examen"** (última columna, acción clave) queda fuera de pantalla. → En móvil debe **colapsar a tarjetas verticales** (una tarjeta por categoría con campos etiquetados), no scroll horizontal. El "Examen" debe quedar visible y con buena área táctil.
- **Fila de 4 botones** (Repaso 20 / Test completo / Canciones / Backup) no envuelve → **"Backup" se sale**. → Debe envolver/apilar en móvil para que los 4 se vean.

### Restricciones técnicas (LOCKED)
- Mantener **Pico CSS** (classless) y **zero-build**. Solo **CSS** (media queries en `styles.css`) + **ajustes mínimos de markup** (p.ej. `data-label` en celdas para el patrón tabla→tarjetas, contenedores). SIN frameworks nuevos, SIN build step.
- **Desktop NO debe cambiar de aspecto** — todo el responsive va detrás de media queries que solo aplican por debajo del/los breakpoint(s).
- Mobile = teléfono en vertical (objetivo principal). Tablet intermedio: razonable, no obsesivo.

### Alcance por pantalla (todas)
- **home**: tabla→tarjetas + button-row que envuelve + el toggle "Contrarreloj ⏱" recién añadido + banners (inflight/backup).
- **picker**: checkboxes de categorías (lista), checkbox "Contrarreloj", botón "Empezar".
- **session**: cabecera (título de contexto `sessionContextLabel` + progreso + barra de cronómetro/segundos) + tarjeta de ejercicio + botones de los 3 tipos: multiple-choice (opciones), word-buttons (grid de palabras + zona de respuesta), match (grid 2 columnas izq/der). + botones "¿Por qué?"/"Siguiente".
- **cancion**: playthrough (análogo a session, word-buttons inverso).
- **summary** y **cancion-summary**: listas de resultados / errores.
- **backup**: botones export/import + mensajes.

### Áreas de atención específicas
- **Cronómetro** (barra `<progress>` + segundos): debe verse y no romper la cabecera en móvil.
- **match grid** (`grid-template-columns: 1fr 1fr`): en móvil estrecho puede necesitar adaptarse (¿mantener 2 col más estrechas? ¿apilar?). Decisión del UI-SPEC.
- **word-buttons**: el grid de palabras y la zona de respuesta deben fluir sin romper; ya hay `overflow-wrap: anywhere`.
- **Áreas táctiles**: botones con tamaño cómodo para dedo (no los densos de la tabla desktop).

### Claude's Discretion (para el UI-SPEC)
- Número y valor de breakpoints (p.ej. un único breakpoint ~640px, o dos).
- Patrón exacto tabla→tarjetas (CSS `display:block` por fila + `::before` con `data-label`, o reestructura del markup con `data-label`).
- Cómo se adapta cada grid (match/word-buttons) y la cabecera del cronómetro.
- Detalles de espaciado/tipografía móvil dentro de las vars de Pico.
</decisions>

<canonical_refs>
## Canonical References

- CLAUDE.md → "Progressive Upgrade Paths": *Responsive mobile UI | Low (~horas) | Pico CSS es responsive por defecto. Añadir un par de media queries en un CSS propio para las piezas no-Pico (grids de word-buttons, columnas de match). Sin cambio de framework.* — esta fase materializa ese upgrade path.
- Pantallas y markup actuales en `index.html`; estilos en `styles.css` (sin media queries hoy).
</canonical_refs>
