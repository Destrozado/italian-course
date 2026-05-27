# Roadmap: Italian Course — Ejercicios A1/A2

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## Milestones

- ✅ **v1.0 — Motor re-verificación + 7 categorías + Modo Examen** — Phases 1-8 (shipped 2026-05-25). Ver [milestones/v1.0-ROADMAP.md](./milestones/v1.0-ROADMAP.md) para detalles completos.
- ✅ **v1.1 — Validación editorial** — Phases 9-10 (shipped 2026-05-27). 272/272 ejercicios validados por quórum multi-AI (Opus + Sonnet) contra R1-R7, 55 disputed resueltos. Ver [milestones/v1.1-ROADMAP.md](./milestones/v1.1-ROADMAP.md) para detalles completos.

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

<details>
<summary>✅ v1.1 (Phases 9-10) — SHIPPED 2026-05-27</summary>

- [x] Phase 9: Infraestructura de validación (3/3 plans) — completed 2026-05-26
- [x] Phase 10: Ejecución validación 271 ejercicios + escalada disputed (5/5 plans) — completed 2026-05-27

**Total:** 2 fases, 8 plans, 272/272 ejercicios validados por quórum Opus 4.7 + Sonnet 4.6, 55 disputed resueltos, 0 deferred, 8/8 requirements VAL-01..08. Detalles completos en `.planning/milestones/v1.1-ROADMAP.md`.

</details>

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
| 9. Infraestructura de validación | v1.1 | 3/3 | Complete   | 2026-05-26 |
| 10. Ejecución validación 271 ejercicios + escalada | v1.1 | 5/5 | Complete | 2026-05-27 |

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

**Status:** Cerrado vía quick task `260525-vvj` (commit `7eaf5a2`) — `restartRepaso()` extendido a dual-mode `'repaso'` + `'test-completo'`, x-show del botón actualizado, 223→230 tests verdes (+7 presence-check). Deja de ser backlog.

### Phase 11+ (post-v1.1, futuro): Categorías nuevas, modo móvil, etc.

**Status:** Backlog v1.2+. Items capturados en PROJECT.md §"Next Milestone Goals (post-v1.1)": categorías nuevas conforme la profesora entrega material (Pretérito imperfetto, Futuro semplice, Condicionale, Subjuntivo), responsive móvil si emerge dolor, refactor cosmético confirmLabel unificado en las 6 call-sites.

---
*Roadmap created: 2026-05-23*
*Milestone v1.0 shipped 2026-05-25 — 10 fases activas (1, 2, 3, 4, 5, 6, 7, 7.1, 7.2, 8), 26 plans, 71 tasks, 271/271 ejercicios curados, 62/62 v1 requirements, 209/209 tests verdes. Detalles completos en `.planning/milestones/v1.0-ROADMAP.md`.*
*Milestone v1.1 planning started 2026-05-25 — Phase 9 (infra) + Phase 10 (ejecución), 8 requirements VAL-01..08, target 271/271 `validation.status === "validated"`.*
