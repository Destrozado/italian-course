# Quick Task 260615-hhp: Mostrar título de ubicación/contexto durante la sesión - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning

<domain>
## Task Boundary

Añadir una referencia contextual permanente (título) visible mientras estás DENTRO de una sesión de ejercicios o una canción, para no olvidar dónde estás. Pura UI derivada — NO toca el estado persistido (localStorage), NO cambia lógica de negocio.

Pantallas afectadas: `session`, `cancion`, y los resúmenes `summary` y `cancion-summary`.
</domain>

<decisions>
## Implementation Decisions

### 1. Colocación
- El título de contexto va ENCIMA del progreso, como título (estilo `<h2>` / encabezado). Debajo, el progreso actual ("Ejercicio 3 de 20") en tamaño menor.
- Jerarquía: dónde estás (título) → cuánto llevas (progreso).

### 2. Formato de texto por modo (con prefijo de modo)
- **Examen de una sola categoría** (`sessionMode === 'test-completo'` con 1 categoría): `"Examen: <nombre categoría>"` (p.ej. "Examen: Preposizioni").
- **Repaso** (`sessionMode === 'repaso'`): `"Repaso (<N> ejercicios)"` donde N = nº real de ejercicios de la sesión (no hardcodear 20; usar la longitud real, p.ej. `sessionExerciseIds.length`).
- **Canción** (`sessionMode === 'cancion'`): `"Canción: <title>"` (p.ej. "Canción: Solo — Ultimo"), tomando `content.songsById[songActiveId].title`.

### 3. Multi-categoría → genérico por modo
- En `test-completo` con VARIAS categorías: NO listar nombres → mostrar solo `"Examen"`.
- En `repaso` (que mezcla categorías): `"Repaso (<N> ejercicios)"` (genérico por modo, no lista categorías).
- Solo se muestra el nombre de categoría cuando el examen es de UNA sola categoría.

### 4. Mostrar también en resúmenes
- Sí: las pantallas `summary` (fin de sesión) y `cancion-summary` (fin de canción) también muestran el contexto, para coherencia. Respetar el header propio que ya tienen esas pantallas (añadir el contexto, no romperlo).

### Claude's Discretion
- Nombre exacto del getter (sugerencia: `sessionContextLabel`, reutilizable para session/cancion/summary).
- Marcado HTML concreto y clase CSS; respetar Pico CSS y la estética actual.
- Si para los resúmenes conviene un getter aparte o el mismo (el summary puede necesitar saber de qué sesión venía — verificar qué estado sobrevive al pasar a `summary`/`cancion-summary`).
</decisions>

<specifics>
## Specific Ideas

- Patrón existente a imitar: getters de label del picker (`pickerHeaderLabel`, `pickerStartLabel`) en `src/screens/app.js`.
- Markup: `index.html` pantallas `session` (~L316, `<header x-text="sessionProgressLabel">`), `cancion` (~L586, `<header x-text="songProgressLabel">`), `summary` (~L664, `summaryHeaderLabel`), `cancion-summary` (~L835).
- Para derivar la categoría del examen single-cat: en `_launchExamen` se fija `categoryIds = [catId]`; el nombre se saca de `content/categories.json` (`name`) — verificar el mapa disponible (p.ej. `content.categoriesById` o equivalente).
</specifics>

<canonical_refs>
## Canonical References

No hay specs externas — requisitos capturados en las decisiones de arriba + el todo `.planning/todos/pending/2026-06-15-mostrar-titulo-de-ubicacion-actual-en-ejercicios.md`.
</canonical_refs>
