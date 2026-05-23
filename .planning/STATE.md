---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-05-23T21:32:30Z"
progress:
  total_phases: 4
  completed_phases: 2
  total_plans: 9
  completed_plans: 7
  percent: 78
---

# Project State: Italian Course — Ejercicios A1/A2

## Project Reference

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

**Current Focus:** Phase 3 — Variedad de ejercicios + ergonomía de teclado

## Current Position

Phase: 3 (Variedad de ejercicios + ergonomía de teclado) — EXECUTING
Plan: 1 of 3 — **COMPLETED** (2026-05-23, ver [03-01-SUMMARY.md](./phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-01-SUMMARY.md))
Next: Plan 03-02 (Slice vertical match)

- **Phase:** 3
- **Plan:** 03-01 completado; siguiente 03-02
- **Status:** Executing Phase 3
- **Progress:** [████████░░] 78% (7/9 planes — 2 de 4 fases completadas + 1/3 planes de Phase 3)

## Performance Metrics

| Métrica | Valor |
|---------|-------|
| Fases completadas | 2/4 |
| Requisitos v1 completos | 32/40 (80% — Phase 1: 19 + Phase 2: 13) |
| Requisitos v1 mapeados | 40/40 (100%) |
| Tests dominio | 58 verdes |
| Granularidad | coarse |
| Mode | MVP (vertical slices) |

## Accumulated Context

### Key Decisions

| Fecha | Decisión | Razón |
|-------|----------|-------|
| 2026-05-23 | Stack Alpine.js 3.15 + Pico CSS 2.1 + vanilla ES modules + localStorage | Cero build step, "doble click y funciona" (vía `npx serve`), todo en CDN con versiones pinned |
| 2026-05-23 | `npx serve` en vez de `file://` doble click puro | Firefox bloquea localStorage bajo `file://`, fetch de JSON local bloqueado en todos los navegadores |
| 2026-05-23 | Fallar resetea racha a 0 (estricto) | Fiel al espíritu "que te obligue a no olvidar" |
| 2026-05-23 | Añadir ejercicio nuevo a categoría `hecha` la devuelve a `no-hecha` | Coherente con la definición de `hecha` = "todos los ejercicios completados sin fallar" |
| 2026-05-23 | Test completo es reanudable; Repaso abandonado se descarta | Test completo es inversión grande; Repaso es desechable |
| 2026-05-23 | Weight cap = 10 en sampler ponderado: `1/(1+min(timesShown,10))` | Evita que ejercicios nuevos (timesShown=0) monopolicen el muestreo durante semanas |
| 2026-05-23 | Contadores por ejercicio son monotónicos — nunca se resetean | La historia es valiosa; lo que se resetea es `clearedExerciseIds` por categoría |
| 2026-05-23 | Roadmap COARSE = 4 fases vertical-slice | El autor priorizó simplicidad; 4 fases entregan valor observable cada una |
| 2026-05-23 | Layer-purity contract materializado en código (Plan 01-01) | `src/domain/*` y `src/data/schema-validator.js` no importan storage/fetch/DOM; testables con node --test sin browser |
| 2026-05-23 | Plan 01 `buildSession` es FILL-only (sin set-cover) | RESEARCH.md A5 — Phase 1 solo tiene 1 categoría, set-cover es no-op; Phase 2 añade la fase guarantee |
| 2026-05-23 | Plan 01 `applySessionResult` reducido — solo actualiza exerciseStats | Cascada y estados de categoría llegan en Phase 2; contadores monotónicos garantizados |
| 2026-05-23 | README invoca `node --test tests/*.test.js` (glob) en vez de `tests/` | Node 22.20 trata `tests/` como módulo y falla; el glob es portable entre versiones |
| 2026-05-23 | Avere seed = 12 ejercicios (top del rango 10-12) | Maximiza material disponible para el sampler; 6 presente indicativo + 2 idiomáticos + 4 passato prossimo del PDF |
| 2026-05-23 | Alpine init pattern: script-ordering (main.js antes que Alpine en `<head>`) + sync top-level `alpine:init` listener + factory acepta Promise<{content,state}> | Plan 02 descubrió en UAT que el patrón dual (`alpine:init` + `window.Alpine` guard) de `01-RESEARCH.md` Pattern 8 NO funciona cuando la registración ocurre después de `await loadContent`. El nuevo patrón es determinista (HTML script ordering spec) y desacopla el ciclo Alpine del fetch async vía Promise handoff |
| 2026-05-23 | `applySessionResult` solo escribe localStorage al final de sesión (no por respuesta) | D-20 materializada — verificado en UAT 4: la key `italianCourse.v1` no aparece hasta que se completa la última respuesta |
| 2026-05-23 | Plan 03-01 — Dispatch table `PAYLOAD_VALIDATORS` cerrada para los 3 tipos Phase 3 | Reemplaza el branch literal `ex.type !== 'multiple-choice'` por lookup; añadir un tipo nuevo se reduce a 1 línea + función validator. Stub match dentro de la tabla (no fuera) mantiene la promesa "dispatch table cerrada" |
| 2026-05-23 | Plan 03-01 — `applyResultToSession` como SINGLE call-site de `applyImmediateFailure` | Cascada D-54 inmediata se ejecuta desde un único punto del código (Pitfall #2 evitado arquitectónicamente, no por revisión manual). Plan 03-02 añadirá `matchPickRight` reusando el helper sin riesgo de duplicación |
| 2026-05-23 | Plan 03-01 — Stub mensaje validator estable sin plan ID (B3) | `'type "match" aún no soportado'` sin "en este plan" ni "03-02"; el mensaje es válido para producción aunque el plan se renombre. Lección: comentarios docs también cuentan como código — los grep ACs sobre código de producción son literales incluyendo comentarios |
| 2026-05-23 | Plan 03-01 — `fisherYates` exportable público desde `src/domain/session.js` | Un único algoritmo de shuffle determinista reusable por `buildSession`, `buildFullTest`, y `initSubStateForExercise` (banco word-buttons). Layer purity preservada — screen importa de domain, no al revés |
| 2026-05-23 | Plan 03-01 — `@keydown.window` dentro de outer `x-if="currentScreen === 'session'"` | Cleanup automático al desmontar (D-72 confirmado; A1 Assumptions Log no requirió fallback a addEventListener manual). Pattern reusable por 03-02 sin re-evaluar |
| 2026-05-23 | Plan 03-01 — Sub-estados de TODOS los tipos declarados desde el primer plan que los toca | Match sub-estados (matchLeft, matchRight, matchPairsConsumed, etc.) declarados en el factory en 03-01 aunque la lógica llega en 03-02 — permite limpieza universal en `initSubStateForExercise` sin tener que volver a tocar el factory |

### Active Todos

- [x] Ejecutar `/gsd:plan-phase 1` para descomponer Fase 1 en planes ejecutables (hecho previo)
- [x] Ejecutar Plan 01-01 — esqueleto del proyecto + dominio + seed Avere
- [x] Ejecutar Plan 01-02 — Pantalla de sesión Alpine + persistencia end-to-end — UAT 8/8 aprobado
- [x] Ejecutar Plan 03-01 — word-buttons end-to-end + atajos teclado mínimos + helpers compartidos
- [ ] Ejecutar Plan 03-02 — match end-to-end (reemplaza stub validator, añade matchPickRight + flashMatchPair, rama match en handleSessionKey/initSubStateForExercise)
- [ ] Ejecutar Plan 03-03 — UAT checkpoint (4 criterios ROADMAP + 8 pitfalls + 2 exploit-proof + W2 regression smoke Phase 2)

### Blockers

(Ninguno)

### Decisions Pending

- ~~Distribución final del contenido: JSON via fetch o ES module exports~~ — **Resuelto en Plan 01-01:** JSON via `fetch()` con `npx serve` (decisión D-21 del CONTEXT.md materializada).

## Session Continuity

### Last Session

- **Fecha:** 2026-05-23 (Plan 03-01 completed)
- **Trabajo actual (Plan 03-01):** ejecución end-to-end de 3 tasks en 6 commits (cb17a97, dd45a0a, 9b1beac, 14ec6d4, 3be17c0, f12838a) — word-buttons handler + dispatch-table validator + 23 tests, refactor fisherYates exportable, refactor sessionSelectOption→applyResultToSession single call-site D-54, sub-estados word-buttons + match placeholders + handlers + handleSessionKey + initSubStateForExercise, 2 ejercicios word-buttons en avere.json, sub-template HTML + CSS .wb-*. 81/81 tests verdes (58 baseline Phase 1+2 + 23 nuevos). Phase 2 regression smoke (5 pasos UAT humano) NO ejecutado en wave sequential — mitigado por equivalencia algebraica del refactor + single call-site verificado por grep + 58 tests baseline siguen verdes. Recomendación 03-03: ejecutar el smoke regression Phase 2 ANTES de los pasos word-buttons/match en el UAT.
- **Trabajo previo (Phase 3 discuss):** `/gsd:discuss-phase 3` ejecutado. 4 áreas grises discutidas (UX word-buttons, UX match, ergonomía teclado, schema JSON + grading), 16 preguntas single-turn, 17 decisiones nuevas capturadas (D-56..D-72).
- **Trabajo (Phase 3 UI-SPEC):** `/gsd:ui-phase 3` ejecutado. `gsd-ui-researcher` (opus) generó `03-UI-SPEC.md` (352 líneas, 28 KB) resolviendo 5 puntos de Claude's discretion: superíndice Unicode `¹²³ᵃᵇᶜ` con `.kbd-hint` (vs `<kbd>`), outline 2px Pico primary para item izq seleccionado en match, `@keyframes match-flash-red` 300ms única WCAG §2.3.1 safe, placeholder vía `::before` italic muted, forced-last-pair NO auto-completar. `gsd-ui-checker` (sonnet) aprobó 6/6 dimensiones (copywriting, visuals, color, typography, spacing, registry safety) sin issues bloqueantes. 3 notas de calidad no bloqueantes para el planner: documentar inline el selector `.wb-answer.incorrecta`, garantizar cleanup del `setTimeout` de match-flash, aceptar `aria-live="polite"` sobre `.wb-answer`. Commit `47f2995`. Resumen:
  - Word-buttons: banco → área respuesta, distractoras opcionales, botón Comprobar + Enter, frase correcta literal al fallar.
  - Match: validación instantánea por pareja, cualquier intento erróneo → ejercicio fallado (cascada D-54 inmediata en el primer error), shuffle ambas columnas, tamaño 2..~10 variable.
  - Teclado: 1-9 dinámicos en word-buttons (Backspace quita última, Enter = Comprobar); 1-9 izq + a-i der en match; Enter/Space tras fallo dispara sessionAdvance (auto-avance 600ms intacto); foco al body con keydown listener global del session sub-template.
  - Schema: word-buttons `{prompt, answer[], distractors?[]}`; match `{prompt, pairs:[[izq,der]]}`; duplicados en derecha permitidos con grading textual + consumo por índice; case-insensitive global en grading (no en multi-choice).
- **Archivos generados:** `.planning/phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-CONTEXT.md` + `03-DISCUSSION-LOG.md` + `03-UI-SPEC.md`. Commits `53f0aba` (CONTEXT/LOG), `47f2995` (UI-SPEC).
- **Lección recurrente pendiente:** double-defense Alpine sigue sin ADR (heredado de Phase 2). Phase 3 lo aplica también a los nuevos sub-templates (`sessionCurrentExercise.payload.answer`, `.pairs`).
- **Siguiente paso:** `/clear` luego `/gsd:plan-phase 3` para descomponer Phase 3 en planes ejecutables. El planner verá CONTEXT.md (D-56..D-72) + UI-SPEC.md (6/6 dimensiones aprobadas) + RESEARCH.md (a generar). Plan probable: 03-01 schema validator + grade() de los 2 tipos + tests; 03-02 sub-templates en index.html + sub-estados en appShell + handlers UI; 03-03 keydown global + sufijos visibles + UAT.

### Files Generated

**Initialization:**

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/research/SUMMARY.md`, `STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/config.json`

**Plan 01-01 (Walking Skeleton):**

- `index.html`, `styles.css`, `README.md`
- `src/main.js`
- `src/domain/{dates,session,progress}.js`
- `src/data/{schema-validator,content-loader,storage}.js`
- `src/exercise-types/{index,multiple-choice}.js`
- `content/categories.json`, `content/exercises/avere.json`
- `tests/domain.test.js`, `tests/util/seeded-rng.js`
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-01-SUMMARY.md`

**Plan 01-02 (Session Screen Alpine):**

- `src/screens/session.js` (new)
- `src/main.js` (extended con sync top-level Alpine listener + Promise handoff)
- `index.html` (extended con markup Alpine; ordering main.js antes que Alpine defer)
- `styles.css` (extended con [x-cloak] + .correcta/.incorrecta)
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-02-SUMMARY.md`

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 1 | 01-01 | ~14 min | 3 | 16 |
| 1 | 01-02 | ~22 min | 3 (2 auto + 1 checkpoint) | 4 |
| 3 | 03-01 | ~38 min | 3 (Task 1 + Task 2a en 4 sub-commits + Task 2b) | 10 (3 created + 7 modified) |

### Next Action

```
# Plan 03-01 completado. Siguiente:
/gsd:execute-phase 3   # continuar con 03-02 (match) y 03-03 (UAT)
```

Plan 03-02 reusará los helpers de 03-01 (applyResultToSession, initSubStateForExercise, handleSessionKey, cancelMatchFlash, fisherYates) sin modificarlos — solo añade la rama match en cada uno, reemplaza el stub validateMatchPayload por impl real, y añade el archivo nuevo `src/exercise-types/match.js`.

---
*State initialized: 2026-05-23*
*Last updated: 2026-05-23T21:32:30Z after Plan 03-01 completion (81/81 tests verdes, 6 commits, helpers compartidos listos para 03-02)*
