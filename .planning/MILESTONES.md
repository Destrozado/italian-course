# Milestones

## v1.3 — Canciones (bloque de traducción) (Shipped: 2026-06-02)

**Phases completed:** 2 phases (13-14), 3 plans, ~6 tasks
**Stats:** +1,101 LOC (`src/`, `content/`, `index.html`), 306/306 tests verdes, 19/19 requirements (4 SONG + 5 PLAY + 4 LINK + 3 DATA + 3 CONT). Git range `9d29e90`→`ea59cfe`. Timeline: 1 día (2026-06-02).
**Brownfield:** reutiliza el engine v1.0 (cascada D-54, word-buttons `grade()`, schema-validator `PAYLOAD_VALIDATORS`, patrón Test-completo) — NO reconstruye el motor.

**Key accomplishments:**

- Bloque "Canciones" separado del home (6º `currentScreen`): listado con estado por canción (no hecha / pasada / fallada) + número de frases; estado plano `{status, lastPlayedAt}` persistido en localStorage entre sesiones (NO dominada/racha/21-day) — SONG-01..04.
- Playthrough secuencial it→es reutilizando word-buttons en dirección INVERSA (línea italiana = prompt → user construye tokens españoles): N frases en orden tipo Test completo sin reinicio a mitad, feedback verde/rojo inmediato con traducción correcta al fallar, resumen post-canción (Block A frases falladas vs correcta + Block B impacto en categorías) — PLAY-01..05.
- Enganche al motor por frase vía cascada D-54: fallar una frase con `categoryIds` resetea esas categorías gramaticales (1 solo call-site, reusando `applyResultToSession`, 0 nuevos `applyImmediateFailure`); frases sin categoría guardadas sin cascada (LINK-03, preparado para CATPROC futuro); canciones standalone fuera del sampler Repaso 20 / Test / tabla de categorías (LINK-04) — LINK-01..04.
- Modelo de datos coherente con lo existente: schema de canción + `validateSongs` export separado (no extiende `PAYLOAD_VALIDATORS`) con banner visible, `migrate4to5`/`hydrateV5` deep-clone defensivo (schemaVersion 4→5), `backup.js` extendido a v5 para round-trip export/import — DATA-01..03.
- Primera canción real "Equilibrio mentale (Home piano session) — Ultimo" autorada como 17 frases it→es (limpieza de ruido no-lírico + segmentación por sentido + traducción curada por bloques + enganche limpio) con validación ligera autor-oráculo (1 pase IA, NO quórum estricto R1-R7) — CONT-01..03.
- Bug del MOTOR cazado durante UAT humano: `bankWithKeys` guardaba solo contra `sessionCurrentExercise` (null en modo canción por LINK-04), dejando el banco de palabras vacío en TODAS las canciones; arreglado en `02d6f4a` + tests de regresión. Tras el fix el autor confirmó la canción jugable de principio a fin.

**Known deferred items at close:** 4 (acknowledged — see STATE.md §Deferred Items). 2 son quick tasks heredados de v1.0 (`260525-pwq` shuffle multi-choice, `260525-vvj` botón reiniciar examen — ambos shipped, marcados "missing" por frontmatter sin status reconocible); 2 son escenarios human-UAT de Phase 13 (cascada D-54 desde frase de canción, PLAY-05 abandono/re-entrada, LINK-04 aislamiento) cubiertos por tests automáticos (306/306) y por la confirmación en navegador de Phase 14, pero nunca click-through manual formal.

---

## v1.2 Más contenido A1 (Articoli + Partitivos) (Shipped: 2026-05-28)

**Phases completed:** 4 phases, 10 plans, 21 tasks

**Key accomplishments:**

- Temario exhaustivo de Articoli (determinativi il/lo/l'/la/i/gli/le + indeterminativi un/uno/una/un') cruzado con cada disparador fonetico y las 6 trampas canonicas D-04, aprobado por el autor como checklist de cobertura previo a cualquier ejercicio.
- 1. [Rule 3 - Blocking] Registrar `articoli` en categories.json
- `content/exercises/articoli.json` = 56 ejercicios.
- N = 56
- 56/56 ejercicios de articoli validados por quórum cross-vendor (DeepSeek Flash + Opus 4.7); 8 bugs de autoría capturados y corregidos; gate verde cerrado (reporter exit 0 328/328, smoke estricto 268/0).
- Temario de cobertura del partitivo italiano estructurado sobre el eje incontable↔contable — 7 formas del/dello/della/dell'/dei/degli/delle × disparador fonético heredado de Articoli + 3 alternativas por restricción gramatical + omisión en negativa + distinción partitivo/preposizione (PART-05), commiteado ANTES de cualquier ejercicio (D-13).
- 37 ejercicios multiple-choice de Partitivos (del-formas incontable/contable 001-026 + alternativas por restricción gramatical 027-033 + mini-bloque omisión ∅ 034-037), todos pending para quórum, validando contra el schema.
- Cierra el contenido de Partitivos en N=44: bloque match sustantivo↔forma partitiva (D-08) + 5 ejercicios de clasificación partitivo-vs-preposizione articolata (PART-05), todos `status: pending` para el quórum de 12-05.
- Cablea la categoría partitivos en los 3 puntos de integración con los conteos en LOCKSTEP a N=44 (longitud real de partitivos.json): categories.json order 9 (verificada, ya presente), reporter CATEGORIES { slug, file, expected:44 } + TOTAL_EXPECTED 328->372, y test CATEGORIES_WITH_EXPLANATIONS expected:44 (sin slug). Cubre PART-01 sin tocar engine ni UI.
- Plan:

---

## v1.1 — Validación editorial (Shipped: 2026-05-27)

**Phases completed:** 2 phases (9-10), 8 plans

**Key accomplishments:**

- Infraestructura de validación (Phase 9): campo `validation` opcional en el schema con `deriveStatus()` sticky-disputed, `VALIDATION-PROMPT.md` self-contained que operacionaliza R1-R7 en 5 criterios binarios C1-C5, skill `gsd-validate-exercise` (quórum Opus 4.7 + Sonnet 4.6, 1-por-1 con context aislado), smoke test paramétrico VAL-07 tras feature flag, y piloto end-to-end de 3 ejercicios.
- Sub-skill `gsd-validate-batch` (Phase 10): orquestador inline que itera la validación por categoría con resume idempotente (estado de verdad en los JSON), checkpoints AskUserQuestion, y cola disputed con 4 caminos (accept-fix / reject+override / rewrite / skip) + reporter `run-validation-271.mjs` zero-deps con 3 sub-gates.
- 272/272 ejercicios validados por ≥2 IAs distintas en las 7 categorías (preposiciones 51, avere 23, essere 39, genero-numero 40, profesiones 51, sustantivos-irregulares 31, verbos-movimiento 37). 55 disputed resueltos, 0 deferred.
- Clases de bug editorial cazadas y corregidas: meta-staging del curador en explanations, doble-validez (formas con dos plurales/femeninos aceptados + género no fijado), errores factuales en explanations, y leak de regla en el prompt vía etiquetas. El autor como oráculo final en cada disputed (overrides registrados con `by:autor`).
- +1 ejercicio al corpus (`preposiciones-051`, par di/su) creado durante la resolución de disputed. Constantes 271→272 actualizadas en reporter y test. Gates de cierre verdes: reporter exit 0 (VAL-04+06+08) + smoke test estricto `VAL_07_STRICT=1 node --test tests/*.test.js` 261/261 PASS.
- Audit trail completo en git: 1 commit por ejercicio validado + commits fix/override POST-fix por cada disputed resuelto + STATE.md por categoría (~370 commits desde v1.0).

---

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
