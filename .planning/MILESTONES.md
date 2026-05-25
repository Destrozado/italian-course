# Milestones

## v1.0 v1.0 — Italian Course A1/A2 (motor re-verificación + 7 categorías + Modo Examen) (Shipped: 2026-05-25)

**Phases completed:** 12 phases, 26 plans, 71 tasks

**Key accomplishments:**

- Walking Skeleton complete — Alpine 3.15.12 + Pico 2.1.1 (CDN+SRI), pure domain modules with 14-test node --test suite, hand-written schema validator with NFC normalization, localStorage wrapper keyed `italianCourse.v1`, and 12 Avere seed exercises ready for Plan 02 to wire the UI.
- End-to-end loop verified by user. La app arranca con `npx serve`, carga 10-12 ejercicios de Avere, responde clicks con feedback verde/rojo (verde auto-avanza 600ms, rojo requiere "Siguiente"), persiste contadores UNA sola vez al final, y al recargar refleja los contadores. 8/8 verificaciones manuales aprobadas. 14/14 tests del dominio siguen verdes.
- Máquina de estados pura del dominio v2: cascada fail-wins, promociones no-hecha→hecha→dominada (21 días), racha con `lastSuccessDate` guard, `dailyLog` idempotente, migración schemaVersion 1→2 transparente — 38 tests verdes (14 supervivientes Phase 1 + 8 nuevos de storage + 18 nuevos del state machine).
- Sampler completo (GUARANTEE + FILL + buildFullTest) + DOMAIN-06 implementado como `applyNewExerciseRegression` pura separada con preservación crítica de `clearedExerciseIds` (D-40) — 51 tests verdes (38 supervivientes Plan 02-01 + 8 sampler nuevos + 5 DOMAIN-06 nuevos).
- Domain tests:
- Domain tests:
- Tipo word-buttons funcional end-to-end (click + teclado 1-9 + Backspace + Enter), schema validator refactorizado a dispatch table cerrada con los 3 tipos Phase 3, y helper compartido applyResultToSession que centraliza la cascada D-54 en un único call-site para preparar 03-02 sin riesgo de duplicación.
- Tipo match operativo con click izq → click der (o teclado 1-9 + a-i), cascada D-61 inmediata + idempotente al primer fallo (guard `matchHadFailure` con 2 call-sites EXACTOS de `applyImmediateFailure` verificados por test), grading con duplicados textuales en columna derecha (D-66 consumo por índice), y dispatch table del validator cerrada con 3 impls reales (sin stubs intermedios).
- PASS
- State schema v3 + módulo puro `src/data/backup.js` con `parseBackupFile`/`buildBackupWrapper` (6 reject paths español verbatim del UI-SPEC) + helper `daysSinceISO` DST-safe + pantalla Backup completa (handlers export/import, banner home recordatorio >7d con reactividad sobre `state.lastBackupAt`, 3er botón en home, firstUsedAt plumbing inline en 4 call-sites) + 23 tests nuevos (128/128 verdes) — el autor puede exportar/importar progreso desde el día 1 del plan ANTES de transcribir los 6 PDFs.
- Setup de las 6 categorías + transcripción de Preposiciones (50 ejercicios cobertura PDF completa) y Verbos de movimiento (37 ejercicios cobertura PDF completa) + helper validate-content-fixture.mjs + placeholders B-1.
- Transcripción de los 3 PDFs restantes (Sustantivos Irregulares 31 + Género y Número 40 + Profesiones 51 = 122 ejercicios nuevos) + DESIGN RULE 'match-if-not-trivial-by-root' anclada como patrón normativo + retro-patch a sustantivos-irregulares + meta-rule -ista invariable + 3rd match profesión↔acción.
- Cierre Phase 4 — SEED-02 multi-cat (6 cruces avere-300..305) + smoke test cascada real (130 tests verdes) + UAT integral 5/5 ROADMAP success criteria.
- Essere cerrada como 7ª categoría con 39 ejercicios A1 (conjugación + identidad + nacionalidad + profesión + estado + cópula + participio) + 6 cruces multi-cat espejo del patrón Phase 4 — el milestone v1.0 queda funcionalmente simétrico (Avere ↔ Essere).
- Vertical slice MVP (UX-01) entregado end-to-end:
- Vertical slice MVP (UX-02) entregado end-to-end
- Optional `payload.explanation: string` field across 3 exercise types + dual render (inline feedback + summary-errors) + 2 seed explanations en preposiciones-001/006, todo en una vertical slice con UAT 6/6 PASS
- 50/50 explanations curadas para `content/exercises/preposiciones.json` via patrón D-85 (3 batches con review autor frase por frase) + smoke test paramétrico + reapertura PROJECT.md Out of Scope con audit trail del pivote post-uso-real
- 50 explanations Preposiciones re-acentuadas con español correcto (acentos + ñ) + smoke test refactorizado a array paramétrico extensible — tests 181/181 verdes en cada commit
- 40 explanations Género-Número ingestadas del draft pre-revisado del autor en 1 commit honesto + 2ª entry al array smoke paramétrico atómica (anti-rojo) + audit trail completo PROJECT/REQ/ROADMAP — tests 184/184 verdes, UAT humano 6/6 PASS
- 23/23 explanations Avere curadas en 2 batches D-85 (12 MC presente/idiomático/passato prossimo + 2 word-buttons + 3 match + 6 multi-cat) tras relajar el guard APPEND-ONLY con helper `stripAdditive` (D-178 opción A) + CLI `--path` para roundtrip dry-run. Tests 184 → 187/187 verdes.
- 31/31 explanations Sustantivos-irregulares curadas en 2 batches D-85 (17+14, todos multi-choice). Patrón Edit ancla larga aplicado preventivamente desde el primer ejercicio. Tests 187 → 190/190 verdes. Cobertura editorial total: 113/271 → 144/271 = 53.1%.
- 37/37 explanations Verbos-movimiento curadas en 2 batches D-85 (19+18, 34 multi-choice + 3 word-buttons). D-159 cross-ref constraint preservado con regex ampliada Warning 10 (cero referencias a Essere por ID o prosa). Patrón Edit ancla larga aplicado preventivamente — cero ocurrencias del bug 7.2-01 Batch A. Tests 190 → 193/193 verdes. Cobertura editorial total: 144/271 → 181/271 = 66.8%.
- 39/39 explanations Essere curadas en 2 batches D-85 (21+18, 35 multi-choice + 4 word-buttons). D-166 cross-refs útiles materializadas con holgura 8x sobre el mínimo (24 matches sobre ≥3 obligatorio — Warning 7). Patrón Edit ancla larga aplicado preventivamente — cero ocurrencias del bug 7.2-01 Batch A. Tests 193 → 196/196 verdes. Cobertura editorial total: 181/271 → 220/271 = 81.2%. Solo Profesiones (51) resta para cobertura 100%.
- 51/51 explanations Profesiones curadas en 3 batches D-85 (17+17+17, 43 multi-choice + 5 word-buttons + 3 match). Batch C ATÓMICO unificó ingest contenido + entry array `CATEGORIES_WITH_EXPLANATIONS` (7ª entry) + audit trail consolidado PROJECT.md/REQUIREMENTS.md/ROADMAP.md en UN SOLO COMMIT (Blocker 3 — D-162 + D-167 + D-169 unificados). Tests 196 → 199/199 verdes. Patrón Edit ancla larga aplicado preventivamente — cero recovery commits, notes preservados 51/51. Cobertura editorial total: 220/271 → 271/271 = 100%. EXPL-13 + EXPL-14 cerrados. Phase 7.2 ESTRUCTURALMENTE COMPLETA — milestone v1.0 pre-ship listo (autor decide cuándo ejecutar /gsd-complete-milestone v1.0 — D-180 closure separada).
- `.planning/PROJECT.md`

---
