---
phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones
verified: 2026-08-13T22:55:35Z
status: human_needed
score: 15/15 requirements verified (code+tests); 3 backstop probes abstained (human_needed)
behavior_unverified: 0
overrides_applied: 0
re_verification: null
human_verification:
  - test: "E1 · long-text — confirmar en pantalla que una traducción de 2+ líneas dentro de `.session-translation` (entre `.session-feedback` y el CTA) envuelve por espacios sin desbordar, sin truncarse y sin desplazar el botón «Continuar →»."
    expected: "El texto envuelve limpio en 2+ líneas, cero recorte, CTA sigue visible y clicable."
    why_human: "La premisa NO tiene sujeto en el corpus del piloto: la traducción más larga de Preposiciones (`preposiciones-sugli#1`, 57 caracteres) mide 390px y cabe en UNA sola línea a los 5 anchos de escritorio medidos (1400/1100/900/800/700px). Es un `verification: backstop` explícito del UI-SPEC — abstiene por ausencia de sujeto, no por indulgencia (WINDOWS.md ids 21). Se re-prueba en la primera de las Phases 47-53 cuyo corpus produzca una traducción real de 2+ líneas."
  - test: "E2 · long-text — la misma envoltura multilínea dentro de `.summary-error-translation`, en la card de «Errores cometidos» del resumen."
    expected: "Envuelve sin desbordar ni truncarse dentro de la card, igual que E1."
    why_human: "Misma ausencia de sujeto que E1 (WINDOWS.md id 22); esta superficie no cambió con la enmienda de D-46-06/08."
  - test: "TRAD-01/encoding — lectura de muestra de 3-4 slots completos de Preposiciones para confirmar español natural, acentuado, registro adecuado y ausencia de deriva hacia explanation/gloss."
    expected: "Las traducciones se leen como español natural y correcto, sin convertirse en explicación gramatical ni repetir el gloss."
    why_human: "La autoridad MECÁNICA (quórum cross-vendor, 96/96 `validated` con 2 `by` distintos) ya pasó y fue verificada independientemente en esta sesión. Lo que queda abierto es el ÚLTIMO lector humano: el punto 7 del checkpoint del plan 46-05 no se ejecutó — el autor aprobó los 4 puntos de render (REND-01..05, «Perfecto») pero no la lectura de muestra (WINDOWS.md id 23)."
---

# Phase 46: Pipeline de traducción end-to-end (piloto Preposiciones) Verification Report

**Phase Goal:** Que el autor resuelva un ejercicio de Preposiciones — acertando o fallando — y vea la
traducción española de la frase ya resuelta, con el campo, el render, el validador propio y los gates
ya montados y demostrados sobre las 96 variantes reales de la categoría piloto.

**Verified:** 2026-08-13T22:55:35Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Method note

Esta verificación se hizo EJECUTANDO, no leyendo el SUMMARY: suite completa, reporter, cobertura
derivada del disco, `deriveStatus` sobre las 96 traducciones, byte-intacto del motor contra la
baseline pre-fase, y lectura directa de `index.html` / `schema-validator.js` / los ficheros nuevos
para confirmar contra el código lo que los SUMMARY afirman.

## Goal Achievement

### Observable Truths (agregadas por grupo de requirement — el detalle completo de cada edge-probe
vive en los `must_haves` de cada `46-0N-PLAN.md` y se verificó indirectamente vía la suite de tests
que los codifica, todos en verde)

| # | Truth (grupo) | Status | Evidence |
|---|---|---|---|
| 1 | SCH-01/02/03 — el schema acepta `translationES` en `multiple-choice`, lo rechaza estructuralmente en `match`/`word-buttons`, no toca `schemaVersion` (sigue en 13) | ✓ VERIFIED | `grep -n translationES src/data/schema-validator.js` muestra los 3 guards (aceptación con validación de forma completa tras WR-04, rechazo x2); `tests/schema-translation.test.js` 100% pass; `node --test` completo confirma retrocompat sobre las 250 slots pre-existentes |
| 2 | REND-01/02/03/04/05 — la traducción se ve al acertar y al fallar, en las dos superficies, con doble guard, `x-text` exclusivo, sin robar el sitio a «¿Por qué?» | ✓ VERIFIED | Leído directamente en `index.html:597-670` (superficie 1, FUERA de `.session-feedback`, sitio fijo, enmienda D-46-06/07 confirmada en disco) y `:1336-1346` (superficie 2, dentro de la card); `tests/screen-translation.test.js` 50/50; **además confirmado en pantalla por el autor** el 2026-08-13 («Perfecto» sobre los 4 puntos: mismo sitio acertando/fallando, no antes de responder, «¿Por qué?» intacto, traducción en cada card de errores) |
| 3 | TVAL-01/02/03 — prompt propio de criterios de traducción (no R1-R7), script hermano de quórum 1-por-1, `deriveStatus` como fuente única sin reimplementación | ✓ VERIFIED | `docs/TRANSLATION-VALIDATION-PROMPT.md` existe (24KB), 5 criterios exactos (`s1_natural`…`s6_naturalidad`, cero `s3_troceado`); `scripts/validate-translation-pass.mjs` existe, `grep -c "import { deriveStatus }"` = 1, cero derivación local; `tests/translation-validator.test.js` 100% pass incluida la prueba de mutación del `writePass` re-estrechado |
| 4 | TVAL-04/GATE-01/GATE-02 — gate de cobertura con `expected` derivado del disco, igualdad de enteros, anti-ceguera contra un conjunto derivado, verificado por mutación real (no lectura) | ✓ VERIFIED | `node scripts/run-validation-271.mjs` → exit 0, `TRAD-COV (96/96 traducciones validated): PASS (96/96)`; `tests/count-arrays-lockstep.test.js` incluido en la suite verde; las 3 mutaciones de D-46-18 (desenganche, extractor roto, `pending`, sin-tildes) están registradas con exit code observado en `46-03-SUMMARY.md` y `46-05-MUTACIONES-EVIDENCIA.md`, y una de ellas (CR-01, "status escrito vs derivado NO entraba en el veredicto") fue cazada por el code review de esta misma fase, arreglada y re-verificada por mutación — confirmé el fix en disco (`scripts/run-validation-271.mjs:919-924`, `allTranslationInconsistencyAddrs.length === 0` SÍ entra en `tradPass`) |
| 5 | TRAD-01 — las 96 variantes de Preposiciones traducidas y `validated` con ≥2 `by` de vendors distintos | ✓ VERIFIED | Medido independientemente sobre el disco: 50 slots, 96 variantes `multiple-choice`, 96 con `translationES.text`, `deriveStatus` sobre las 96 → 0 no-`validated`, `by` distintos = `{deepseek-chat, gemini-3.5-flash-lite}` (2 vendors) |
| 6 | Motor byte-intacto (D-46-01) — `src/domain/` y `src/screens/app.js` sin tocar desde la baseline pre-fase | ✓ VERIFIED | `git diff --stat 19f41a9..HEAD -- src/domain/ src/screens/app.js` → vacío (comparado contra la baseline real, no contra HEAD) |
| 7 | Suite completa verde salvo la deuda pre-existente | ✓ VERIFIED | `node --test tests/*.test.js tests/fixtures/*.test.js` → **1329/1325/4**, exactamente lo esperado. Confirmé independientemente que los 4 fallos (`tests/requirements-traceability.test.js`) están rojos IDÉNTICOS en la baseline `19f41a9` (1182/1178/4, mismo test, mismos 4 subtests) mediante un worktree aislado — no es regresión de esta fase |
| 8 | Requirements coverage — los 15 IDs del frontmatter de los 5 planes están todos en `REQUIREMENTS.md` como `[x]` y `Complete`, sin huérfanos | ✓ VERIFIED | `grep` cruzado: SCH-01..03, REND-01..05, TVAL-01..04, GATE-01/02, TRAD-01 — los 15 aparecen marcados `[x]` y en la tabla de trazabilidad como `Phase 46 \| Complete`. GATE-03 (fuera de esta fase, cierre de milestone) correctamente `[ ]` y no reclamado por ningún plan de la fase |
| 9 | Code review de la fase — 3 critical + 6 warning encontrados, arreglados dentro de la fase y verificados por mutación | ✓ VERIFIED | `46-REVIEW.md` (`status: fixed`); confirmé independientemente el commit `1b13465` (CR-01) en disco: `tradPass` incluye ahora `allTranslationInconsistencyAddrs.length === 0`. Los 9 commits de arreglo (`1b13465`…`96f51de`) existen en `git log`. 4 Info quedan abiertos y documentados en `WINDOWS.md` (ids 26-29), no ocultos |
| 10 | Los 3 `backstop` de UI Considerations / TRAD-01-encoding | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED (abstenido) | Ver §Human Verification. Documentados con evidencia explícita en `46-UI-SPEC.md`, `46-05-SUMMARY.md` y `WINDOWS.md` (ids 21-23) como `ABSTENIDO` — nunca cerrados en silencio, nunca marcados `covered` |

**Score:** 9/10 grupos de truth VERIFIED (equivalente a 15/15 requirements a nivel de código+test), 1 grupo (3 items backstop) abstenido y correctamente enrutado a revisión humana.

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `src/data/schema-validator.js` | SCH-01/02 (aceptación + 2 rechazos) | ✓ VERIFIED | 3 guards de `translationES` confirmados, incluida la extensión WR-04 (claves desconocidas, forma de `validation`, `\r|\n`) |
| `index.html` | 2 nodos de render, doble guard, `x-text` exclusivo | ✓ VERIFIED | `.session-translation` fuera de la caja (enmienda D-46-06/07), `.summary-error-translation` dentro de la card; ambos con guard + `x-text` |
| `app.css` | Regla CSS compartida | ✓ VERIFIED | Confirmado en el diff de la fase (implícito en `tests/screen-translation.test.js` V1/V2/V3 pasando) |
| `content/exercises/preposiciones.json` | 96 `translationES` validated | ✓ VERIFIED | 50 slots, 96 variantes, 96 `translationES.text`, 96 `validated`, 2 `by` distintos, 0 huecos `___` |
| `docs/TRANSLATION-VALIDATION-PROMPT.md` | Criterios S1/S2'/S4/S5'/S6, sin S3 | ✓ VERIFIED | Existe, 24KB, `s3_troceado` = 0 ocurrencias, 5 criterios exactos presentes |
| `scripts/validate-translation-pass.mjs` | Script de quórum, dirección compuesta, `deriveStatus` importado | ✓ VERIFIED | Existe, import único de `deriveStatus`, `withFileLock` presente |
| `scripts/run-validation-271.mjs` | `TRANSLATION_COVERAGE`, sub-gate `TRAD-COV` | ✓ VERIFIED | Ejecutado, exit 0, PASS (96/96), veredicto incluye la desincronía (post-CR-01) |
| `tests/count-arrays-lockstep.test.js` | GATE-02 anti-ceguera | ✓ VERIFIED | Incluido en la corrida completa, verde |
| `tests/schema-translation.test.js`, `tests/screen-translation.test.js`, `tests/translation-validator.test.js` | Matrices de test de la fase | ✓ VERIFIED | Los tres ficheros existen y pasan 133/133 al correrlos aislados |
| `tests/fixtures/translation-pilot.json` | Fixture de escritura real | ✓ VERIFIED | Existe (5.6KB) |

### Key Link Verification

| From | To | Via | Status |
|---|---|---|---|
| `content/exercises/preposiciones.json` | `index.html` | spread del payload → `translationES?.text` | ✓ WIRED (confirmado en fuente) |
| `index.html` | `app.css` | clases `.session-translation`/`.summary-error-translation` | ✓ WIRED |
| `src/data/schema-validator.js` | `content/exercises/preposiciones.json` | `validateContent` sobre el corpus real | ✓ WIRED (suite verde incluye este test) |
| `scripts/validate-translation-pass.mjs` | `src/data/validation-state.js` | `import { deriveStatus }` | ✓ WIRED |
| `scripts/run-validation-271.mjs` | `content/exercises/preposiciones.json` | `mcVariantCountOf` + `TRANSLATION_COVERAGE` | ✓ WIRED (exit 0 real) |
| `tests/count-arrays-lockstep.test.js` | `scripts/run-validation-271.mjs` | escaneo del array de cobertura, anti-ceguera | ✓ WIRED |

### Behavioral Spot-Checks / Probe Execution

| Behavior | Command | Result | Status |
|---|---|---|---|
| Suite completa | `node --test tests/*.test.js tests/fixtures/*.test.js` | 1329 tests / 1325 pass / 4 fail (deuda pre-existente confirmada contra baseline) | ✓ PASS |
| Reporter de cierre | `node scripts/run-validation-271.mjs` | exit 0, `TRAD-COV (96/96): PASS`, `Milestone gate PASS.` | ✓ PASS |
| Cobertura derivada del disco | script inline sobre `preposiciones.json` | 50 slots / 96 variantes MC / 96 con texto | ✓ PASS |
| `deriveStatus` sobre las 96 | script inline importando `validation-state.js` | 0 no-`validated`; `by` = {deepseek-chat, gemini-3.5-flash-lite} | ✓ PASS |
| Byte-intacto | `git diff --stat 19f41a9..HEAD -- src/domain/ src/screens/app.js` | vacío | ✓ PASS |
| Tests aislados de la fase | `node --test tests/schema-translation.test.js tests/screen-translation.test.js tests/translation-validator.test.js` | 133/133 | ✓ PASS |
| Baseline de la deuda de trazabilidad | worktree en `19f41a9` + `node --test tests/requirements-traceability.test.js` | 4 fail idénticos (mismos nombres de subtest) | ✓ PASS (confirma no-regresión) |

### Requirements Coverage

| Requirement | Source Plan | Status | Evidence |
|---|---|---|---|
| SCH-01, SCH-02, SCH-03 | 46-01 | ✓ SATISFIED | schema-validator.js + tests |
| REND-01..05 | 46-01 | ✓ SATISFIED | index.html + tests + confirmación visual del autor |
| TVAL-01, TVAL-02, TVAL-03 | 46-02 | ✓ SATISFIED | prompt + script + tests |
| TVAL-04, GATE-01, GATE-02 | 46-03 | ✓ SATISFIED | reporter + lockstep test + 3 mutaciones ejecutadas |
| TRAD-01, TVAL-03 | 46-04 | ✓ SATISFIED | 96/96 validated, disco verificado |
| TVAL-04, GATE-01, GATE-02, TRAD-01 | 46-05 | ✓ SATISFIED (mutaciones 1/2 de contenido) | evidencia literal en `46-05-MUTACIONES-EVIDENCIA.md`, exit codes confirmados en la corrida actual (`exit 0`, `PASS (96/96)`) |

**Ningún requirement de la fase queda huérfano.** GATE-03 (cierre de milestone) correctamente fuera del alcance de esta fase.

### Anti-Patterns Found

Ninguno nuevo. El propio code review de la fase (`46-REVIEW.md`, depth: deep, ejecutando mutaciones)
encontró 3 critical + 6 warning + 4 info; los 9 críticos/warning fueron arreglados dentro de la fase
con commit atómico y verificación por mutación (confirmé independientemente el fix de CR-01 en
disco). Los 4 Info quedan abiertos y **documentados como deuda en `.planning/WINDOWS.md`** (ids 26-29),
no ocultos ni silenciados. No encontré ningún gate vacío ni tautológico adicional al revisar
`scripts/run-validation-271.mjs` y `tests/count-arrays-lockstep.test.js`.

### Human Verification Required

### 1. E1 · long-text — envoltura multilínea en `.session-translation`

**Test:** Cuando el corpus produzca una traducción de 2+ líneas dentro de la caja de feedback,
confirmar en pantalla que envuelve sin desbordar, sin truncarse y sin desplazar el CTA.
**Expected:** Envoltura limpia, CTA visible.
**Why human:** Sin sujeto en el corpus del piloto (la más larga mide 390px = 1 línea a todos los
anchos de escritorio medidos). Es un `verification: backstop` explícito del UI-SPEC, abstenido por
decisión del autor el 2026-08-13 (commit `4291c8a`), registrado en `WINDOWS.md` id 21. Se re-prueba
en la primera de las Phases 47-53 con una traducción real de 2+ líneas.

### 2. E2 · long-text — envoltura multilínea en `.summary-error-translation`

**Test:** Misma comprobación en la card de «Errores cometidos».
**Expected:** Envoltura limpia sin desbordar.
**Why human:** Misma ausencia de sujeto que #1 (`WINDOWS.md` id 22).

### 3. TRAD-01/encoding — lectura de muestra de 3-4 slots completos

**Test:** Leer varias traducciones completas del piloto para confirmar español natural, acentuado, de
registro adecuado, y que ninguna se deslizó hacia explicación gramatical o repetición literal del gloss.
**Expected:** Español correcto y natural en las muestras leídas.
**Why human:** La autoridad mecánica (quórum cross-vendor) ya pasó (96/96 `validated`, verificado
independientemente en esta sesión). El punto 7 del checkpoint del plan 46-05 —la lectura de
muestra— no se ejecutó; el autor aprobó los 4 puntos de render pero no esta lectura
(`WINDOWS.md` id 23).

### Gaps Summary

No hay gaps que bloqueen el objetivo de la fase. Las 15 requirements de la fase están satisfechas con
evidencia de ejecución (no de lectura): suite 1329/1325/4 (4 = deuda pre-existente confirmada contra
la baseline `19f41a9`), reporter en exit 0 con `TRAD-COV PASS (96/96)`, motor byte-intacto verificado
contra la baseline real, y las 3 mutaciones de D-46-18 ejecutadas con rojo observado y registrado. El
code review propio de la fase encontró y arregló 3 critical + 6 warning con verificación por mutación,
y dejó 4 Info documentados como deuda no bloqueante.

Lo único que separa el resultado de un `passed` limpio son los **3 ítems `backstop`** (E1/E2 long-text
+ la mitad humana de TRAD-01/encoding) que el propio proyecto ya trató correctamente: los abstuvo por
ausencia de sujeto en este corpus específico en lugar de fabricar un cierre falso, y los dejó
documentados en `WINDOWS.md` como ítems abiertos para revisión humana futura. Por la doctrina de este
verificador (un `backstop` sin evidencia se abstiene → `human_needed`, nunca pasa en silencio), esta
verificación respeta esa misma regla y enruta los 3 ítems a revisión humana en lugar de darlos por
buenos — sin que eso implique que el trabajo de la fase esté incompleto: el autor ya fue consultado
durante el checkpoint de la propia fase y tomó la decisión de diferirlos explícitamente.

---

_Verified: 2026-08-13T22:55:35Z_
_Verifier: Claude (gsd-verifier)_
