# Roadmap: Italian Course — Ejercicios A1/A2

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## Milestones

- ✅ **v1.0 — Motor re-verificación + 7 categorías + Modo Examen** — Phases 1-8 (shipped 2026-05-25). Ver [milestones/v1.0-ROADMAP.md](./milestones/v1.0-ROADMAP.md) para detalles completos.
- 📋 **v1.1 — Validación editorial** — Phases 9-10 (planning 2026-05-25). 271/271 ejercicios validados por quórum multi-AI contra R1-R7 antes de seguir confiando en el material para aprender.

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

### 📋 v1.1 (Planning — Validación editorial)

- [ ] **Phase 9: Infraestructura de validación** — Schema `validation` opcional + validation prompt operacionalizando R1-R7 + workflow 1-por-1 documentado + smoke test paramétrico + piloto sobre 1 categoría
- [ ] **Phase 10: Ejecución validación 271 ejercicios + escalada disputed** — Aplicar workflow multi-AI a las 7 categorías hasta `validated:271/271` + UX inline de escalada para verdicts `incorrecta`

## Phase Details

### Phase 9: Infraestructura de validación
**Goal**: Crear la maquinaria (schema + prompt + workflow + gate de tests) que hará posible validar los 271 ejercicios 1-por-1 con quórum multi-AI sin re-inventar el proceso cada vez. Cerrar la fase con un piloto small-scale sobre una categoría real para probar que el pipeline funciona antes de invertir 1.5-2M tokens en Phase 10.
**Depends on**: Milestone v1.0 cerrado (las 7 categorías ya curadas y con explanations)
**Requirements**: VAL-01, VAL-02, VAL-03, VAL-05, VAL-07
**Success Criteria** (what must be TRUE):
  1. El schema validator acepta los 271 ejercicios actuales sin tocar el JSON (campo `validation` opcional, backward-compat verificada vía `node --test`).
  2. Existe un documento `.planning/phases/.../VALIDATION-PROMPT.md` con los 5 criterios binarios verbatim listos para copy-paste a un agente fresco; cualquiera (incluido el autor) puede ejecutarlo manualmente sobre 1 ejercicio sin contexto adicional. R1-R7 están operacionalizados en los 5 criterios.
  3. Existe un script o flujo documentado (`scripts/validate-exercise.mjs` o equivalente) que demuestra el patrón "1 ejercicio = 1 agente fresco = SOLO ese ejercicio en contexto" y justifica explícitamente por qué NO se batch (root cause de los 4 bugs cazados post-v1.0).
  4. Un smoke test paramétrico nuevo en `tests/exercise-types.test.js` falla si CUALQUIER ejercicio tiene `validation.status` ≠ `validated` (o el campo ausente cuando el feature flag está activado) — durante Phase 9 el flag está desactivado para que los 271 sigan en `pending`/sin campo y los tests sigan verdes; el flag se activa al final de Phase 10.
  5. Piloto end-to-end completado: ≥1 ejercicio real (sugerido: `preposiciones-040` u otro de los 4 bugs motivadores) ha pasado el workflow completo con ≥2 pases registrados en `passes[]`, con `by`/`date`/`verdict`/`concerns?` poblados según VAL-05, y el resultado (validated o disputed) consistent con el schema VAL-01.
**Plans:** 1/3 plans executed
Plans:
- [x] 09-01-PLAN.md — Schema validator extension (validateValidationShape) + pure helper deriveStatus + smoke test paramétrico VAL-07 tras feature flag
- [ ] 09-02-PLAN.md — VALIDATION-PROMPT.md self-contained (R1-R7 inline) + .claude/skills/gsd-validate-exercise/SKILL.md orquestador + fixture E3 (C5-leak) + relax stripAdditive
- [ ] 09-03-PLAN.md — Piloto end-to-end 3 ejercicios (preposiciones-040 + avere-001 + pilot-disputed-c5-leak-001) + scripts/run-validation-pilot.mjs reporter + gate D-VAL-15 checkpoint

### Phase 10: Ejecución validación 271 ejercicios + escalada disputed
**Goal**: Aplicar el workflow Phase 9 a los 271 ejercicios de las 7 categorías hasta que el smoke test paramétrico vea `validation.status === "validated"` en todos. Construir el flujo de escalada inline para los verdicts `incorrecta` (autor revisa, decide accept/reject/rewrite, queda audit trail). El milestone v1.1 NO cierra hasta 271/271.
**Depends on**: Phase 9 (infraestructura completa + piloto PASS)
**Requirements**: VAL-04, VAL-06, VAL-08
**Success Criteria** (what must be TRUE):
  1. Los 271 ejercicios tienen `validation.passes[]` con ≥2 entries de AIs distintos (`passes[].by` diferentes), y `validation.status === "validated"` — verificable abriendo cualquier JSON o ejecutando el smoke test paramétrico (que estará activado al cierre).
  2. Los 4 bugs motivadores documentados en PROJECT.md (preposiciones-040 amici/dai, preposiciones-032 nelle pareti, preposiciones-047 cadere sugli alberi, preposiciones-031 libri/scaffali) están en estado `validated` con `concerns` previos que justifican o el fix aplicado al prompt/answer/distractors, o la decisión consciente del autor de mantenerlo + override del status (VAL-08 audit trail).
  3. Cuando una AI emite `verdict: incorrecta`, el flujo surface el caso al autor con prompt original + verdict + concerns + sugerencia de fix; el autor decide (accept fix / reject mantener original / reescribir) y la decisión queda registrada — verificable abriendo al menos 1 ejercicio cuyo `passes[]` muestre el ciclo disputed→resolved (puede ser uno de los 4 motivadores o cualquier otro encontrado durante la ejecución).
  4. El smoke test paramétrico VAL-07 (activado al final de la fase) corre verde con assertion estricta "cero ejercicios con `status !== 'validated'`" — la ejecución diaria de `node --test tests/*.test.js` previene regresión editorial: cualquier ejercicio nuevo o modificado sin re-validar rompe los tests inmediatamente.
  5. Audit trail completo en `passes[]` para los 271 ejercicios: `{by, date ISO, verdict, concerns?}` poblados — el autor puede auditar a posteriori qué AI validó qué ejercicio y cuándo, sin abrir logs externos.
**Plans**: TBD

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
| 9. Infraestructura de validación | v1.1 | 1/3 | In Progress|  |
| 10. Ejecución validación 271 ejercicios + escalada | v1.1 | 0/? | Not started | — |

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
