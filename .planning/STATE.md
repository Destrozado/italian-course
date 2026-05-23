---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-05-23T17:30:00Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 2
  completed_plans: 2
  percent: 100
---

# Project State: Italian Course — Ejercicios A1/A2

## Project Reference

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

**Current Focus:** Phase 1 — Loop mínimo end-to-end (Avere + multiple-choice)

## Current Position

Phase: 1 (Loop mínimo end-to-end (Avere + multiple-choice)) — ALL PLANS COMPLETE — READY FOR VERIFIER

- **Phase:** 1 — Loop mínimo end-to-end (Avere + multiple-choice)
- **Plan:** 01-02 (Pantalla de sesión Alpine) — completado 2026-05-23, UAT aprobado por usuario
- **Status:** Plan 01-01 ✓ + Plan 01-02 ✓ — Phase 1 lista para el verifier agent (no marcamos la fase complete aquí; eso lo decide el verifier)
- **Progress:** [██████████] 100% (2/2 planes de Phase 1 — Phase 1 esperando verificación independiente)

## Performance Metrics

| Métrica | Valor |
|---------|-------|
| Fases completadas | 0/4 |
| Requisitos v1 mapeados | 40/40 (100%) |
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

### Active Todos

- [x] Ejecutar `/gsd:plan-phase 1` para descomponer Fase 1 en planes ejecutables (hecho previo)
- [x] Ejecutar Plan 01-01 — esqueleto del proyecto + dominio + seed Avere
- [x] Ejecutar Plan 01-02 — Pantalla de sesión Alpine + persistencia end-to-end — UAT 8/8 aprobado
- [ ] Verifier agent — verificación independiente de Phase 1 antes de marcarla complete

### Blockers

(Ninguno)

### Decisions Pending

- ~~Distribución final del contenido: JSON via fetch o ES module exports~~ — **Resuelto en Plan 01-01:** JSON via `fetch()` con `npx serve` (decisión D-21 del CONTEXT.md materializada).

## Session Continuity

### Last Session

- **Fecha:** 2026-05-23T17:30:00Z
- **Trabajo:** Plan 01-02 ejecutado — Pantalla de sesión Alpine end-to-end. 2 commits atómicos (`a6a37ef`, `5cdecda`) + partial SUMMARY (`e9fd750`) + 2 commits de fix para race condition Alpine descubierta en UAT (`6a27d2c`, `ac46d70`). UAT humano: 8/8 verificaciones aprobadas. Tests del dominio: 14/14 verdes.
- **Siguiente paso:** Verifier agent — verificar Phase 1 de forma independiente antes de marcar la fase complete y proceder a `/gsd:plan-phase 2`.

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

### Next Action

```
/gsd:verify-phase 1   # verificación independiente de Phase 1 por el verifier agent
```

---
*State initialized: 2026-05-23*
*Last updated: 2026-05-23T17:30:00Z after Plan 01-02 completion (UAT 8/8 approved)*
