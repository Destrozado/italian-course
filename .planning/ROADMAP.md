# Roadmap: Italian Course — Ejercicios A1/A2

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## Milestones

- ✅ **v1.0 — Motor re-verificación + 7 categorías + Modo Examen** — Phases 1-8 (shipped 2026-05-25). Ver [milestones/v1.0-ROADMAP.md](./milestones/v1.0-ROADMAP.md) para detalles completos.

## Phases

<details>
<summary>✅ v1.0 (Phases 1-8) — SHIPPED 2026-05-25</summary>

- [x] Phase 1: Loop mínimo end-to-end (2/2 plans) — completed 2026-05-23
- [x] Phase 2: Mecánica completa de re-verificación (4/4 plans) — completed 2026-05-23
- [x] Phase 3: Variedad de ejercicios + ergonomía de teclado (3/3 plans) — completed 2026-05-24
- [x] Phase 4: Backup robusto + contenido completo (4/4 plans) — completed 2026-05-24
- [x] Phase 5: Essere — categoría fundamental que faltaba (1/1 plan) — completed 2026-05-24
- [x] Phase 6: Polish UX post-sesión — reiniciar + review errores (2/2 plans) — completed 2026-05-24
- [x] Phase 7: Explicaciones pedagógicas al fallar — Preposiciones (2/2 plans) — completed 2026-05-25
- [x] Phase 7.1: Explicaciones Género-Número + canon ortográfico (2/2 plans) — completed 2026-05-25
- [x] Phase 7.2: Explicaciones 5 categorías restantes (cobertura 100%) (5/5 plans) — completed 2026-05-25
- [x] Phase 8: Modo Examen por categoría (1/1 plan) — completed 2026-05-25

**Total:** 10 fases activas, 26 plans, 71 tasks, 271/271 ejercicios curados (7 categorías), 62/62 v1 requirements, 209/209 tests verdes.

</details>

### 📋 v1.1 (Planned — to be defined)

Próximas fases se planifican con `/gsd-new-milestone`. Items deferred del backlog (Phase 8.y "Reiniciar examen", Phase 8.x deferred, etc.) son candidatos naturales para v1.1.

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Loop mínimo end-to-end | v1.0 | 2/2 | Complete | 2026-05-23 |
| 2. Mecánica completa de re-verificación | v1.0 | 4/4 | Complete | 2026-05-23 |
| 3. Variedad de ejercicios + ergonomía | v1.0 | 3/3 | Complete | 2026-05-24 |
| 4. Backup robusto + contenido completo | v1.0 | 4/4 | Complete | 2026-05-24 |
| 5. Essere — categoría fundamental | v1.0 | 1/1 | Complete | 2026-05-24 |
| 6. Polish UX post-sesión | v1.0 | 2/2 | Complete | 2026-05-24 |
| 7. Explicaciones pedagógicas — Preposiciones | v1.0 | 2/2 | Complete | 2026-05-25 |
| 7.1. Explicaciones Génnum + canon ortográfico | v1.0 | 2/2 | Complete | 2026-05-25 |
| 7.2. Explicaciones 5 cats restantes (100%) | v1.0 | 5/5 | Complete | 2026-05-25 |
| 8. Modo Examen por categoría | v1.0 | 1/1 | Complete | 2026-05-25 |

## Backlog

### Phase 999.1: Botón "Reiniciar ejercicios" en pantalla de sesión (PROMOTED → Phase 6)

**Status:** Promoted to active roadmap as part of Phase 6 (Polish UX post-sesión). See archived milestone for active spec.

### Phase 999.2: Pantalla "Resultado" final con review de errores cometidos (PROMOTED → Phase 6)

**Status:** Promoted to active roadmap as part of Phase 6 (Polish UX post-sesión). See archived milestone for active spec.

### Phase 7.x (futuro, opcional): Explanations para las otras 6 categorías (CLOSED → Phase 7.1 + 7.2)

**Status:** Cerrado durante Phase 7.2 — todas las 7 categorías tienen explanations 100% (271/271 ejercicios).

### Phase 8.x (futuro, opcional): Modo Examen multi-cat / atajos teclado / copy especializada banner reanudar

**Status:** Backlog. Items deferred del CONTEXT.md §`<deferred>` de Phase 8 — capturados para no perderlos pero out-of-scope Phase 8: (a) Examen multi-cat (selección de 2-3 cats para examinar en bloque); (b) atajos de teclado (E + número de fila); (c) copy especializada en banner reanudar ("Examen de Avere a medias" vs "Test completo a medias"); (d) diferenciación visual en pantalla session entre Examen y Test completo regular; (e) homogeneización de las 6 call-sites del helper `requestConfirm` con confirmLabel unificado (`'Continuar'` vs `'Descartar y empezar'`).

### Phase 8.y (post-v1.0, opcional): Botón "Reiniciar examen" en pantalla session

**Status:** Backlog. Capturado durante cierre milestone v1.0 (2026-05-25, sign-off informal del autor). Hoy `restartRepaso()` solo dispara cuando `sessionMode === 'repaso'` (guard defensivo D-100). Para Examen (sessionMode='test-completo' D-189) el botón "Reiniciar ejercicios" no aparece — coherente con el comportamiento de Test Completo regular, pero el autor lo echaría en falta dentro de un Examen para empezar de cero la misma cat sin volver al home + click Examen otra vez. Implementación esperada: extender el guard a `sessionMode === 'repaso' || sessionMode === 'test-completo'` + re-llamar `buildFullTest([catId])` cuando es test-completo (en vez de `buildSession`) + condicional x-show del botón actualizado. Trivial via `/gsd-quick` cuando emerja dolor en uso real.

---
*Roadmap created: 2026-05-23*
*Milestone v1.0 shipped 2026-05-25 — 10 fases activas (1, 2, 3, 4, 5, 6, 7, 7.1, 7.2, 8), 26 plans, 271/271 ejercicios curados, 62/62 v1 requirements, 209/209 tests verdes. Detalles completos en `.planning/milestones/v1.0-ROADMAP.md`.*
