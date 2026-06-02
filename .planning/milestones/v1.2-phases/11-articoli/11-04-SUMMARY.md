---
phase: 11-articoli
plan: 04
subsystem: integration
tags: [articoli, integration, lockstep, reporter, smoke-test, categories]
requires:
  - "11-03 (content/exercises/articoli.json en conteo FINAL = 56)"
provides:
  - "articoli cableado en los 3 puntos de integracion con conteos en LOCKSTEP (N=56)"
  - "categoria articoli surfaceada como 8a fila del home + boton Examen (via categoriesForDisplay, cero codigo UI)"
  - "reporter run-validation-271.mjs y smoke test conocen articoli con su cuenta exacta"
affects:
  - "Plan 11-05: el reporter dara exit 0 cuando los 56 articoli pasen de pending a validated via quorum (unico item pendiente para el gate verde)"
tech-stack:
  added: []
  patterns:
    - "alta de categoria = bump de constantes en 3 sitios (D-144): categories.json + reporter CATEGORIES/TOTAL_EXPECTED + CATEGORIES_WITH_EXPLANATIONS"
    - "categoria nueva auto-surfacea home row + Examen sin codigo UI (categoriesForDisplay, examenEnabled = totalCount > 0)"
key-files:
  created:
    - ".planning/phases/11-articoli/11-04-SUMMARY.md"
  modified:
    - "scripts/run-validation-271.mjs (CATEGORIES + TOTAL_EXPECTED 272->328 + comentario)"
    - "tests/exercise-types.test.js (CATEGORIES_WITH_EXPLANATIONS + comentario de cierre)"
decisions:
  - "N=56 leido del archivo real (articoli.json), coincide con el conteo canonico confirmado por el autor en 11-03; propagado identico a los 3 sitios"
  - "Integration point #1 (categories.json) NO editado en este plan: ya satisfecho por 11-02 (deviation Rule 3, order 8); verificado correcto y completo, sin duplicado"
metrics:
  duration: ~8min
  completed: 2026-05-27
---

# Phase 11 Plan 04: Integracion articoli (3 puntos en lockstep) Summary

Cableada la categoria `articoli` en los TRES puntos de integracion que un alta de categoria requiere, con los tres numeros de conteo en LOCKSTEP a **N = 56** (la longitud real de `content/exercises/articoli.json`). Sin tocar engine ni codigo UI. ART-01 cubierto: la entry en categories.json auto-surfacea la 8a fila del home + boton Examen via `categoriesForDisplay`.

## VALOR N USADO EN LOS 3 SITIOS

**N = 56** (48 base multiple-choice + 2 match + 6 bridges). Leido del archivo real `content/exercises/articoli.json` (`exercises.length === 56`); coincide con el conteo canonico confirmado por el autor en el checkpoint de 11-03. No hubo discrepancia archivo vs SUMMARY: el archivo manda y el archivo dice 56.

- `content/categories.json` — entry articoli order 8 (YA presente desde 11-02; verificada, no duplicada).
- `scripts/run-validation-271.mjs` — CATEGORIES entry `articoli expected: 56` + `TOTAL_EXPECTED` 272 -> **328**.
- `tests/exercise-types.test.js` — CATEGORIES_WITH_EXPLANATIONS entry `{ file: 'content/exercises/articoli.json', expected: 56 }`.

## Trabajo realizado

### Task 1 — Resolver N + categories.json (NO editado: ya satisfecho por 11-02)
- Resuelto N=56 leyendo el archivo real (`node -e ... exercises.length`).
- Verificado que `content/categories.json` ya contiene la entry articoli con `id "articoli"`, `name "Articoli (artículos)"`, `order 8`, registrada por 11-02 como deviation Rule 3 (el gate validator la exigia). Las 8 categorias parsean; las otras 7 intactas.
- `node scripts/validate-content-fixture.mjs articoli content/exercises/articoli.json` -> exit 0 (56 ejercicios).
- **Integration point #1 tratado como ya satisfecho; NO se anadio duplicado.** Sin commit de Task 1 (el archivo ya estaba correcto en disco; cualquier edit habria sido no-op o duplicado).

### Task 2 — run-validation-271.mjs (commit a4a486d)
- Edicion 1: insertada entry `{ slug: 'articoli', file: 'content/exercises/articoli.json', expected: 56 }` JUSTO tras preposiciones (orden alfabetico del resto).
- Edicion 2: `TOTAL_EXPECTED` 272 -> 328 (numero entero literal, no expresion).
- Edicion 3: comentario 63-69 actualizado explicando 328 = 272 (v1.0/v1.1) + 56 articoli (8a categoria, v1.2 Phase 11).
- Suma de expected de las 8 entries == 328 == TOTAL_EXPECTED (consistencia interna del reporter verificada).

### Task 3 — exercise-types.test.js (commit 326de3e)
- Anadida 1 linea a CATEGORIES_WITH_EXPLANATIONS: `{ file: 'content/exercises/articoli.json', expected: 56 }`.
- Comentario de cierre actualizado (271/271 -> 328 con explanations curadas) para no quedar enganoso.
- `node --test tests/exercise-types.test.js` -> **123 tests pass, 0 fail**. Los 3 invariantes editoriales de articoli pasan: coverage exacto 56/56 + apostrofes ASCII U+0027 + plain text sin markdown markers (+ R1 no-leak prompt y R2 no cross-refs).

## Verificacion

- **LOCKSTEP OK**: articoli.json length (56) == reporter CATEGORIES expected (56) == test CATEGORIES_WITH_EXPLANATIONS expected (56); TOTAL_EXPECTED == 328 == 272 + 56.
- `node --test tests/exercise-types.test.js` -> 123 pass / 0 fail.
- `node scripts/validate-content-fixture.mjs articoli ...` -> exit 0.
- `node scripts/run-validation-271.mjs` -> exit 1, **esperado y correcto**: el unico FAIL es VAL-06 (272/328 validated, pending=56, disputed=0, missing=0). El total en disco (328) coincide con TOTAL_EXPECTED — la consistencia de conteo PASA; solo el status `pending` de los 56 articoli bloquea el gate. Lo cierra el plan 11-05 (quorum). NO se intento arreglar el status aqui.

## Deviations from Plan

**1. [Rule 3 - Blocking issue, anticipado por el plan] Integration point #1 (categories.json) ya satisfecho — no editado, no duplicado**
- **Found during:** Task 1 (cross-check con el contexto del plan y 11-02).
- **Issue:** El plan describe anadir la entry articoli a categories.json, pero el plan 11-02 ya la registro (order 8) como deviation Rule 3 porque el gate validator la exigia.
- **Fix:** Verificado que la entry existente es correcta y completa (id/name/order exactos, 8 categorias, fixture exit 0). NO se anadio una entry duplicada ni se re-edito el archivo. El edit de Task 1 quedo como no-op intencional; no genero commit.
- **Files modified:** Ninguno (verificacion read-only de content/categories.json).
- **Commit:** N/A (sin cambios que commitear para Task 1).

El resto del plan se ejecuto exactamente como esta escrito.

## Known Stubs

None. Los 3 puntos de integracion estan cableados con valores reales (N=56 leido de disco). El unico estado pendiente es `validation.status: "pending"` de los 56 ejercicios de articoli, que es el flujo previsto (flip a validated lo hace el quorum en 11-05). No es un stub: es el siguiente paso planificado del pipeline editorial.

## Threat Flags

None. Edits de configuracion/registro (constantes de conteo en scripts Node + 1 entry de categoria). El unico valor renderizado (name de categoria) ya estaba en categories.json desde 11-02 y pasa por x-text (T-02-01 LOCKED). No se introdujo superficie de red, auth, file access ni schema nuevo no contemplado en el threat_model del plan.

## Self-Check: PASSED

- `scripts/run-validation-271.mjs` -> FOUND (slug 'articoli', TOTAL_EXPECTED=328, verificado en disco).
- `tests/exercise-types.test.js` -> FOUND (entry articoli expected:56, verificado).
- `content/categories.json` -> FOUND (entry articoli order 8, 8 categorias, verificado read-only).
- Commit a4a486d (Task 2 reporter) -> FOUND.
- Commit 326de3e (Task 3 smoke test) -> FOUND.
- LOCKSTEP de los 3 conteos a 56 + TOTAL_EXPECTED 328 -> VERIFICADO.
