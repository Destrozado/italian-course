# Roadmap: Italian Course — Ejercicios A1/A2

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## Milestones

- ✅ **v1.0 — Motor re-verificación + 7 categorías + Modo Examen** — Phases 1-8 (shipped 2026-05-25). Ver [milestones/v1.0-ROADMAP.md](./milestones/v1.0-ROADMAP.md) para detalles completos.
- ✅ **v1.1 — Validación editorial** — Phases 9-10 (shipped 2026-05-27). 272/272 ejercicios validados por quórum multi-AI (Opus + Sonnet) contra R1-R7, 55 disputed resueltos. Ver [milestones/v1.1-ROADMAP.md](./milestones/v1.1-ROADMAP.md) para detalles completos.
- 🚧 **v1.2 — Más contenido A1 (Articoli + Partitivos)** — Phases 11-12 (en curso). 2 categorías nuevas diseñadas desde cero: temario exhaustivo → ejercicios → explanations → validación por quórum reutilizando la infra editorial v1.1.

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

### v1.2 — Más contenido A1 (Articoli + Partitivos) — ACTIVE

- [ ] **Phase 11: Articoli** — 8ª categoría: temario exhaustivo det+indet → ejercicios cada forma/disparador/trampa → explanations → bridges multi-cat → validación quórum
- [ ] **Phase 12: Partitivos** — 9ª categoría: temario exhaustivo del partitivo → ejercicios cada forma/alternativa → distinción partitivo vs preposizione articolata → explanations → validación quórum

## Phase Details

### Phase 11: Articoli
**Goal**: El autor practica y re-verifica todos los artículos determinativos e indeterminativos italianos como una categoría nueva, con ejercicios que cubren cada forma, cada disparador fonético y cada trampa canónica, validados por quórum.
**Depends on**: Nada nuevo del milestone (infra v1.1 ya existe: motor de re-verificación, 3 tipos de ejercicio, schema validator, skill `gsd-validate-batch`, reporter, R1-R7). NO modifica engine.
**Requirements**: ART-01, ART-02, ART-03, ART-04, ART-05, ART-06, ART-07, ART-08
**Success Criteria** (what must be TRUE):
  1. Existe un documento de temario exhaustivo de Articoli (det `il/lo/l'/la/i/gli/le` + indet `un/uno/una/un'` × disparadores fonéticos s+cons/z/gn/ps/pn/x/y/vocal × trampas canónicas) escrito y revisado ANTES de que exista ningún ejercicio de la categoría — el orden temario-antes-de-ejercicios es verificable en el historial git (hard requirement ART-02).
  2. El autor ve "Articoli" como 8ª fila en la tabla del home, puede lanzar un Examen de esa categoría con 1 clic, y cada celda del temario (forma × disparador × trampa, incl. `lo zio`/`gli gnocchi`/`lo psicologo`/`uno studente`/`l'amico`/`l'amica`/`un'amica` vs `un amico`) tiene al menos un ejercicio que la ejercita.
  3. Fallar un ejercicio-bridge Articoli↔género-número o Articoli↔sustantivos-irregulares resetea AMBAS categorías a `no-hecha` con racha 0 al instante (cascada D-54), y el resumen post-sesión muestra las 2+ categorías afectadas (patrón avere-300..).
  4. Cada ejercicio de Articoli muestra una explanation pedagógica al fallar (canon español acentuado + italianismos preservados, plain text, apóstrofes ASCII U+0027), y el smoke test paramétrico `CATEGORIES_WITH_EXPLANATIONS` cubre el archivo nuevo con su cuenta exacta.
  5. El reporter `node scripts/run-validation-271.mjs` sale exit 0 incluyendo todos los ejercicios nuevos de Articoli (cada uno `status: validated` con ≥2 `by` distintos en `passes[]`), y el smoke test estricto `VAL_07_STRICT=1 node --test tests/*.test.js` sigue verde con las constantes de cuenta actualizadas.
**Plans**: 5 plans en 5 waves (cadena secuencial — el archivo de contenido compartido fuerza serializacion; validacion interactiva al final)
- [ ] 11-01-PLAN.md — Temario exhaustivo de Articoli (PRIMER entregable, checkpoint human-verify, ART-02)
- [ ] 11-02-PLAN.md — Bloque base multiple-choice det+indet + explanations curadas (ART-03/04/05/07)
- [ ] 11-03-PLAN.md — Bloque match articolo↔sustantivo + ~6 bridges multi-cat + explanations (ART-05/06/07)
- [ ] 11-04-PLAN.md — Integracion 3-count lockstep: categories.json + reporter + test (ART-01)
- [ ] 11-05-PLAN.md — Validacion por quorum gsd-validate-batch (interactivo) + gate verde (ART-08)
**UI hint**: yes

### Phase 12: Partitivos
**Goal**: El autor practica y re-verifica el partitivo italiano como una categoría nueva — todas sus formas, sus alternativas, y la distinción clave función partitiva vs preposizione articolata — con ejercicios validados por quórum.
**Depends on**: Phase 11 (patrón de categoría nueva ya recorrido: temario→ejercicios→explanations→validación; constantes de cuenta del reporter y `CATEGORIES_WITH_EXPLANATIONS` ya ampliadas una vez). Reutiliza la misma infra editorial; NO modifica engine.
**Requirements**: PART-01, PART-02, PART-03, PART-04, PART-05, PART-06, PART-07
**Success Criteria** (what must be TRUE):
  1. Existe un documento de temario exhaustivo del partitivo (formas `del/dello/della/dell'/dei/degli/delle` + alternativas `alcuni/alcune`/`qualche`+singular/`un po' di` + omisión en negativas) escrito y revisado ANTES de que exista ningún ejercicio de la categoría — orden temario-antes-de-ejercicios verificable en git (hard requirement PART-02).
  2. El autor ve "Partitivos" como 9ª fila en la tabla del home, puede lanzar un Examen de esa categoría con 1 clic, y hay ejercicios que cubren cada forma del partitivo (singular `del/dello/della/dell'` y plural `dei/degli/delle`) más las alternativas (`alcuni/alcune`, `qualche`+singular, `un po' di` con incontables).
  3. Hay ejercicios que obligan al autor a distinguir la función partitiva ("algo de") de la preposizione articolata ("de el") cuando comparten la misma forma `del/della` — la explanation deja claro que la función prepositiva vive en la categoría Preposiciones, no aquí.
  4. Cada ejercicio de Partitivos muestra una explanation pedagógica al fallar (mismo canon que Articoli), y el smoke test paramétrico `CATEGORIES_WITH_EXPLANATIONS` cubre el archivo nuevo con su cuenta exacta.
  5. El reporter `node scripts/run-validation-271.mjs` sale exit 0 incluyendo todos los ejercicios nuevos de Partitivos (cada uno `status: validated` con ≥2 `by` distintos en `passes[]`), y el smoke test estricto `VAL_07_STRICT=1 node --test tests/*.test.js` sigue verde con las constantes de cuenta actualizadas.
**Plans**: TBD
**UI hint**: yes

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
| 9. Infraestructura de validación | v1.1 | 3/3 | Complete | 2026-05-26 |
| 10. Ejecución validación 271 ejercicios + escalada | v1.1 | 5/5 | Complete | 2026-05-27 |
| 11. Articoli | v1.2 | 0/5 | Planned | - |
| 12. Partitivos | v1.2 | 0/? | Not started | - |

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

### Phase 13+ (post-v1.2, futuro): Más categorías, modo móvil, bridges Partitivos, etc.

**Status:** Backlog v1.3+. Items capturados en PROJECT.md §"Next Milestone Goals" + REQUIREMENTS.md §Future: categorías nuevas conforme la profesora entrega material (Pretérito imperfetto / Futuro semplice / Condizionale / Congiuntivo — TENSE-X1..X4), bridges multi-categoría Partitivos↔género-número/sustantivos (PART-X1, diferido para acotar v1.2), responsive móvil si emerge dolor, refactor cosmético confirmLabel unificado en las 6 call-sites.

---
*Roadmap created: 2026-05-23*
*Milestone v1.0 shipped 2026-05-25 — 10 fases activas (1, 2, 3, 4, 5, 6, 7, 7.1, 7.2, 8), 26 plans, 71 tasks, 271/271 ejercicios curados, 62/62 v1 requirements, 209/209 tests verdes. Detalles completos en `.planning/milestones/v1.0-ROADMAP.md`.*
*Milestone v1.1 shipped 2026-05-27 — Phase 9 (infra) + Phase 10 (ejecución), 8 requirements VAL-01..08, 272/272 `validation.status === "validated"`. Detalles completos en `.planning/milestones/v1.1-ROADMAP.md`.*
*Milestone v1.2 planning started 2026-05-27 — Phase 11 (Articoli) + Phase 12 (Partitivos), 15 requirements (8 ART + 7 PART), 2 categorías nuevas de contenido. Numeración de fases continúa desde v1.1 (NO reset). Cada fase: temario exhaustivo ANTES de ejercicios → curado explanations → validación por quórum reutilizando infra v1.1.*
