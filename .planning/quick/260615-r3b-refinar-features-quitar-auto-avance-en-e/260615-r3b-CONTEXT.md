# Quick Task 260615-r3b: Refinamientos (auto-avance, contrarreloj en tabla, contador por examen) - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning

<domain>
## Task Boundary

Tres refinamientos sobre features ya entregadas esta semana, surgidos del UAT en local:
1. Quitar el auto-avance al acertar en EJERCICIOS (las canciones lo conservan).
2. Toggle "Contrarreloj" encima de la tabla de categorías de home, para que el botón "Examen" de 1 clic arranque cronometrado.
3. Cambiar la semántica del contador `vecesFallada` de categoría: contar CADA examen/sesión fallada (una vez por sesión), en vez de solo "al perder progreso real".

UI/interacción + lógica de dominio (contador). NO añade campos al estado (el campo `vecesFallada` ya existe desde schemaVersion 10). Sin migración nueva.
</domain>

<decisions>
## Implementation Decisions

### CAMBIO 1 — Quitar auto-avance al acertar (solo ejercicios; canciones NO)
- En `applyResultToSession` (rama de acierto, ~L1538): cuando `sessionMode === 'cancion'` se MANTIENE el auto-avance (`songAdvance`, 600ms). Cuando NO es canción (repaso/test-completo/examen), NO programar auto-avance — el usuario avanza manualmente con "Siguiente".
- index.html pantalla `session`: el botón "Siguiente" se muestra ahora SIEMPRE que haya feedback (acierto O fallo), no solo en fallo. Es decir, `x-show="sessionFeedback !== null"` (en los 3 tipos). El botón "¿Por qué?" sigue mostrándose en acierto cuando hay explanation y aún no se reveló (feature #3); ahora es pulsable sin carrera porque no hay auto-avance.
- La pantalla `cancion` NO cambia (sigue auto-avanzando con su `songAdvance`).
- Limpieza: la constante de auto-avance con explicación (`SESSION_AUTO_ADVANCE_WITH_EXPLANATION_MS`, 1500ms) queda sin uso para ejercicios → eliminarla si no la usa nadie más; `SESSION_AUTO_ADVANCE_MS` (600ms) se conserva para canciones. `revealSessionExplanation()` puede conservar su `cancelAutoAdvance()` (no-op inofensivo en ejercicios) o simplificarse — discrecional.

### CAMBIO 2 — Toggle "Contrarreloj ⏱" encima de la tabla de categorías
- Nuevo flag runtime `homeExamTimed` (boolean, default false), NO persistido (consistente con `pickerTimed`/`sessionTimed`).
- Un checkbox/toggle "Contrarreloj ⏱" en home, ENCIMA de la tabla de categorías (entre la button-row y la `<figure>`/tabla, ~index.html L160-175), `x-model="homeExamTimed"`.
- `startExamen(catId)` → `_launchExamen(catId)`: cambiar `this.sessionTimed = false` por `this.sessionTimed = this.homeExamTimed`. Así el examen de 1 clic respeta el toggle.
- El picker (Repaso/Test completo) sigue con su propio checkbox `pickerTimed` sin cambios.

### CAMBIO 3 — Contador: contar cada examen/sesión fallada (categoría)
- RETIRAR el incremento immediate-only de `applyImmediateFailure` (el bloque con el guard `hadProgress`) y RETIRAR el helper `hadProgress` (queda sin uso; verificar que no se use en otro sitio).
- AÑADIR el incremento en `applySessionResult`, en la rama FAIL-WINS (~L113-121, dentro del bucle por categoría cuando `failedCategoryIds.has(catId)`): `cat.vecesFallada = (cat.vecesFallada ?? 0) + 1`. Como el bucle corre una vez por categoría y `failedCategoryIds` es por-sesión, esto cuenta UNA vez por categoría por sesión (fallar 2 ejercicios de la misma categoría en una sesión → +1, no +2).
- Canciones: `completeSong` ya incrementa +1 por playthrough con ≥1 fallo → eso YA coincide con "cada playthrough fallado". NO cambiar canciones.
- Consecuencia (documentar): el contador de categoría ahora se materializa al CERRAR la sesión (`applySessionResult` corre en `completeSession`). Si cierras la pestaña a medias de un test, el reset de racha sí se aplicó (immediate), pero el +1 del contador se contabiliza al completar/reanudar-y-completar la sesión. Aceptable (el "examen fallado" es la unidad de sesión).

### Claude's Discretion
- Nombre exacto del flag (`homeExamTimed` sugerido) y colocación/estilo del toggle (Pico CSS, discreto, alineado con la estética de la tabla).
- Si conviene mantener `revealSessionExplanation`/flag tal cual o simplificar tras quitar el auto-avance.
- Texto del toggle (p.ej. "Contrarreloj ⏱" o "Examen contrarreloj").
</decisions>

<specifics>
## Specific Ideas

- `src/screens/app.js`:
  - `applyResultToSession` (~L1538) rama acierto — quitar auto-avance salvo canción.
  - `_launchExamen` (~L434) / `startExamen` (~L389) — `sessionTimed = homeExamTimed`.
  - constantes de auto-avance (~L72) — limpiar la de 1500ms si queda sin uso.
  - estado: añadir `homeExamTimed` junto a `pickerTimed`/`sessionTimed`.
- `src/domain/progress.js`:
  - `applyImmediateFailure` (~L296) — retirar el incremento + comentarios de vecesFallada; quitar helper `hadProgress` (~L369).
  - `applySessionResult` (~L69) rama FAIL-WINS (~L113-121) — añadir `cat.vecesFallada` +1; `failedCategoryIds` (Set, ~L87) ya disponible.
- index.html:
  - home: toggle "Contrarreloj ⏱" encima de la tabla (~L160-175, antes de `<figure>`).
  - session: botón "Siguiente" `x-show="sessionFeedback !== null"` en los 3 tipos (~L374, L455, L542 zona); "¿Por qué?" sin cambios.
- Tests: ACTUALIZAR los tests de feature #2 (260615-nzi) a la nueva semántica — el test "categoría a cero → 0" pasa a "fallar → +1"; el de "no doble conteo immediate+session" se reinterpreta como "fallar 2 ejercicios de la misma cat en 1 sesión → +1"; mantener el de canción. Tests del auto-avance (feature #3 / hr0) que asuman auto-avance en acierto de ejercicio → actualizar a manual. Correr `node --test tests/*.test.js` (glob obligatorio Node 22.20). El fallo PREEXISTENTE ajeno (genero-numero 12→13) NO se toca; no introducir fallos nuevos.
</specifics>

<canonical_refs>
## Canonical References

Refina las quick tasks 260615-hr0 (auto-avance / ¿Por qué?), 260615-nzi (contador), 260615-puq (contrarreloj). Decisiones del autor en UAT 2026-06-15.
</canonical_refs>
