# Quick Task 260615-hr0: Ver la explicación del ejercicio aunque aciertes - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning

<domain>
## Task Boundary

Permitir consultar la `explanation` de un ejercicio TAMBIÉN cuando se acierta (hoy solo se ve al fallar). Casos de uso: aciertas por casualidad, o dudabas entre dos y quieres confirmar el porqué.

Aplica solo a EJERCICIOS (multiple-choice, word-buttons, match) en la pantalla `session`. NO a canciones (las frases de canción no tienen `explanation`). Pura UI/interacción derivada — NO toca estado persistido (localStorage), scoring ni racha.

Hecho clave del flujo actual: al acertar se marca `sessionFeedback='correct'` y se programa auto-avance con `setTimeout(advance, 600)` (handle en `sessionAutoAdvanceHandle`, cancelable con `cancelAutoAdvance()`). La explicación + botón "Siguiente" hoy solo aparecen con `sessionFeedback === 'incorrect'`.
</domain>

<decisions>
## Implementation Decisions

### 1. Enfoque: botón/atajo "¿Por qué?" que cancela el auto-avance
- Al ACERTAR se mantiene el auto-avance rápido (flujo veloz cuando te la sabes), PERO aparece un affordance "¿Por qué?" (botón visible + atajo de teclado, sugerencia tecla `e`).
- Cualquier interacción con ese affordance (clic o tecla) **cancela el auto-avance** (`cancelAutoAdvance()`) y revela la explicación + un botón "Siguiente" para continuar manualmente.
- Para que dé tiempo a reaccionar, **subir el tiempo de auto-avance en acierto** (hoy 600 ms). Sugerencia: ~1500 ms cuando el ejercicio TIENE explicación; mantener 600 ms cuando no hay explicación (nada que ver). Usar una CONSTANTE nombrada, no número mágico disperso.
- El affordance "¿Por qué?" solo se muestra en acierto si el ejercicio actual tiene `explanation` no vacía.

### 2. Revelado: bajo demanda
- Al acertar, la explicación NO se muestra de entrada. Solo aparece tras pulsar "¿Por qué?" / el atajo. No estorba cuando aciertas con seguridad.

### 3. Alcance
- Los 3 tipos de ejercicio (multiple-choice, word-buttons, match). El comportamiento al FALLAR no cambia (sigue mostrando explicación + Siguiente como ahora).
- Canciones: sin cambios (no tienen explanation).

### Claude's Discretion
- Nombre del flag de estado (sugerencia: `sessionExplanationRevealed` booleano) y de la constante de tiempo.
- Reset del flag al avanzar (`sessionAdvance`) y al iniciar/saltar ejercicio, para no arrastrar el revelado entre ejercicios.
- Texto/estilo exacto del botón "¿Por qué?" (Pico CSS, discreto). Atajo `e` salvo colisión con un binding existente del session keydown handler — verificar.
- Si conviene reutilizar el mismo bloque de markup de explicación que ya existe para el caso incorrect (condición ampliada) o duplicarlo controladamente.
</decisions>

<specifics>
## Specific Ideas

- `src/screens/app.js`:
  - `gradeAndFeedback` (~L1460-1521): marca `sessionFeedback` y programa el auto-avance 600 ms en acierto. Aquí va el cambio de tiempo condicional + (si revela) cancelación.
  - `cancelAutoAdvance()` (~L1589), `sessionAdvance()` (~L1547, resetea feedback — resetear también el nuevo flag).
  - session keydown handler (~L1961, `@keydown.window` en index.html) — añadir tecla del atajo `e` solo cuando `sessionFeedback === 'correct'` y hay explanation; debe cancelar auto-avance y revelar.
  - Patrón de getters para `sessionCurrentExercise.payload.explanation`.
- `index.html`: bloques de los 3 tipos en `session` (~L371 MC, ~L432 word-buttons, ~L521 match) y el botón "Siguiente" (~L374 hoy `x-show="sessionFeedback === 'incorrect'"`). Habrá que mostrar Siguiente también cuando se haya revelado en acierto.
- `styles.css`: estilo del botón "¿Por qué?".
- Tests: seguir patrón de `tests/` (p.ej. el flujo de grade/feedback si hay test de sesión); correr con `node --test tests/*.test.js` (glob obligatorio en Node 22.20). Hay 1 fallo PREEXISTENTE ajeno (genero-numero 12→13) — no tocar.
</specifics>

<canonical_refs>
## Canonical References

Todo `.planning/todos/pending/2026-06-15-ver-explicacion-del-ejercicio-aunque-aciertes.md`. Sin specs externas.
</canonical_refs>
