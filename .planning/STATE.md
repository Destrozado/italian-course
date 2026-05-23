---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-05-23T14:46:11Z"
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 2
  completed_plans: 1
  percent: 50
---

# Project State: Italian Course — Ejercicios A1/A2

## Project Reference

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

**Current Focus:** Phase 1 — Loop mínimo end-to-end (Avere + multiple-choice)

## Current Position

Phase: 1 (Loop mínimo end-to-end (Avere + multiple-choice)) — EXECUTING
Plan: 2 of 2 (siguiente — 01-01 completado)

- **Phase:** 1 — Loop mínimo end-to-end (Avere + multiple-choice)
- **Plan:** 01-02 (Pantalla de sesión Alpine) — siguiente
- **Status:** Plan 01-01 completado; pendiente Plan 01-02
- **Progress:** [█████░░░░░] 50% (1/2 planes de Phase 1 — equivalente a 12.5% del proyecto: 1/8 planes nominales si las fases siguientes mantienen ~2 planes)

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

### Active Todos

- [x] Ejecutar `/gsd:plan-phase 1` para descomponer Fase 1 en planes ejecutables (hecho previo)
- [x] Ejecutar Plan 01-01 — esqueleto del proyecto + dominio + seed Avere
- [ ] Ejecutar Plan 01-02 — Pantalla de sesión Alpine + persistencia end-to-end

### Blockers

(Ninguno)

### Decisions Pending

- ~~Distribución final del contenido: JSON via fetch o ES module exports~~ — **Resuelto en Plan 01-01:** JSON via `fetch()` con `npx serve` (decisión D-21 del CONTEXT.md materializada).

## Session Continuity

### Last Session

- **Fecha:** 2026-05-23T14:46:11Z
- **Trabajo:** Plan 01-01 ejecutado — Walking Skeleton + 12 ejercicios seed de Avere + 14 tests `node --test` verdes. 3 commits atómicos (997388c, 9fbb947, 4aca6a1) + commit final docs.
- **Siguiente paso:** Plan 01-02 — Pantalla de sesión Alpine sobre `window.__appBoot` (`session.js` screen + Alpine.start + persistencia única al final de sesión)

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

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 1 | 01-01 | ~14 min | 3 | 16 |

### Next Action

```
/gsd:execute-phase 1   # continúa con Plan 01-02
```

---
*State initialized: 2026-05-23*
*Last updated: 2026-05-23T14:46:11Z after Plan 01-01 completion*
