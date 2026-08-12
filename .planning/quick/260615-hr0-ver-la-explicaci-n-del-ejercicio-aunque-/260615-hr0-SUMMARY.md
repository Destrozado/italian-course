---
phase: quick-260615-hr0
plan: 01
subsystem: ui-session
tags: [ui, session, explanation, keyboard, alpine]
requires: []
provides:
  - "sessionExplanationRevealed flag + revealSessionExplanation() action"
  - "auto-avance condicional a explanation en acierto (constantes nombradas)"
  - "botón/atajo '¿Por qué?' en los 3 tipos de ejercicio"
affects:
  - src/screens/app.js
  - index.html
  - styles.css
  - tests/exercise-types.test.js
tech-stack:
  added: []
  patterns:
    - "UI derivada por-ejercicio NO persistida (flag de sesión, reset al avanzar/iniciar)"
    - "source-assert tests (readFileSync + assert.match, sin instanciar Alpine)"
key-files:
  created: []
  modified:
    - src/screens/app.js
    - index.html
    - styles.css
    - tests/exercise-types.test.js
decisions:
  - "Atajo tecla `e` colocado ANTES del bloque a..i del keydown handler (e ∈ [a..i] que retorna temprano cuando sessionFeedback !== null)"
  - "Auto-avance largo (1500ms) SOLO con explanation y NO en canción; 600ms en el resto"
  - "Flag reseteado en sessionAdvance + 5 puntos de inicio de sesión; song path intacto"
metrics:
  duration: ~25min
  completed: 2026-06-15
status: complete
---

# Quick Task 260615-hr0: Ver la explicación del ejercicio aunque aciertes - Summary

Affordance "¿Por qué?" (botón + tecla `e`) que revela bajo demanda la `explanation` al ACERTAR en los 3 tipos de ejercicio, cancelando el auto-avance; pura UI/interacción derivada sin tocar estado persistido, scoring ni racha.

## What Was Built

**Task 1 — Lógica en app.js (commit bf91e39):**
- Constantes de módulo `SESSION_AUTO_ADVANCE_MS = 600` y `SESSION_AUTO_ADVANCE_WITH_EXPLANATION_MS = 1500` (sustituyen el literal `600` disperso).
- Campo de estado `sessionExplanationRevealed: false` (UI derivada por-ejercicio, no persistida).
- En `applyResultToSession` rama acierto: tiempo de auto-avance condicional — largo (1500ms) cuando NO es canción y `ex.payload.explanation` es truthy; 600ms en cualquier otro caso. El dispatch `songAdvance` vs `sessionAdvance` no cambia.
- Método `revealSessionExplanation()`: guard `sessionFeedback === 'correct'` + `payload.explanation` truthy → `cancelAutoAdvance()` + `sessionExplanationRevealed = true`.
- Reset del flag en `sessionAdvance()` y en los 5 puntos de inicio/reset de sesión (co-localizado con cada `sessionFeedback = null` de transición). El path de canción (`songAdvance`) no se tocó.
- Atajo de teclado tecla `e` en `handleSessionKey`, colocado ANTES del bloque de letras a..i (que retorna temprano cuando `sessionFeedback !== null`). Dispara solo en acierto + explanation + no-revelado; `preventDefault()` + `revealSessionExplanation()`.

**Task 2 — Markup + estilo (commit 46b43a6):**
- Botón "¿Por qué?" (`class="session-why"`, `@click="revealSessionExplanation()"`) con `x-show="sessionFeedback === 'correct' && ...explanation && !sessionExplanationRevealed"` en los 3 bloques (MC, word-buttons dentro del `.button-row`, match).
- Condición del `<p class="session-explanation">` ampliada a `(incorrect || (correct && revealed)) && explanation` reutilizando el mismo `<p>` (sin duplicar markup).
- Botón "Siguiente" ampliado a `incorrect || (correct && revealed)`; `@click="sessionAdvance"` sin cambios.
- `.session-why`: estilo discreto outline/muted (transparente, borde muted, 0.9em) coherente con `.session-explanation`, sin competir con "Siguiente".

**Task 3 — Test (commit d9fbccf):**
- `describe('quick-260615-hr0: ver explicación al acertar')` con 3 tests source-assert: (1) reveal cancela auto-avance + setea flag + gated a correct; (2) `sessionAdvance` resetea el flag; (3) constantes de tiempo condicionales + atajo `e` gated a correct + explanation.

## Deviations from Plan

None - plan executed exactly as written. Las decisiones a discreción (nombre del flag, constante de tiempo, tecla `e`, reutilizar el `<p>` existente) se tomaron tal como sugería el CONTEXT.md/PLAN.md.

## Verification

- **Baseline previo:** `node --test tests/*.test.js` → 387 tests / 386 pass / 1 fail. El único fallo es preexistente y ajeno: `content/exercises/genero-numero.json — 12/12 ejercicios` (encontró 13; tarea 260614-hxn). NO se tocó.
- **Tras los cambios:** `node --test tests/*.test.js` → 390 tests / 389 pass / **1 fail** (el MISMO preexistente genero-numero 12→13). +3 tests nuevos, +3 pass, 0 fallos NUEVOS.
- grep de markup: `grep -c "revealSessionExplanation\|sessionExplanationRevealed" index.html` → 12 (≥6 esperado).
- Bloque de canción (`handleSongKey`, `songAdvance`, `wb-correct-answer` ~L642) intacto; flujo de FALLO intacto (rama `incorrect` sigue presente en cada condición ampliada).

## Self-Check: PASSED

- src/screens/app.js — FOUND (modificado)
- index.html — FOUND (modificado)
- styles.css — FOUND (modificado)
- tests/exercise-types.test.js — FOUND (modificado)
- Commit bf91e39 — FOUND
- Commit 46b43a6 — FOUND
- Commit d9fbccf — FOUND
