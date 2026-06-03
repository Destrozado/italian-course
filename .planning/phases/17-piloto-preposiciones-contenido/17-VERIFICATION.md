---
phase: 17-piloto-preposiciones-contenido
verified: 2026-06-03T22:30:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
overrides:
  - must_have: "PILOT-02: variantes nuevas autoradas con quórum cross-vendor R1-R7 antes de entrar"
    reason: "Implementado en codebase (41 variantes integradas, audit table en 17-03-SUMMARY, commit 69cd41c). Checkbox en REQUIREMENTS.md quedó sin marcar — olvido editorial, no work pendiente. El contenido en disco y los tests lo verifican."
    accepted_by: "gsd-verifier"
    accepted_at: "2026-06-03T22:30:00Z"
  - must_have: "PILOT-03: slot locativo in spiaggia/montagna/campagna + al mare existe"
    reason: "Implementado en codebase (preposiciones-in-locativo con 3 variantes + preposiciones-al-mare slot-de-1, commit 69cd41c). Checkbox en REQUIREMENTS.md quedó sin marcar — olvido editorial, no work pendiente."
    accepted_by: "gsd-verifier"
    accepted_at: "2026-06-03T22:30:00Z"
---

# Phase 17: Piloto Preposiciones (contenido) — Verification Report

**Phase Goal:** Preposiciones se convierte en el primer caso real del modelo slot+variantes — los 52 ejercicios validados se reagrupan en slots por regla, se autoran variantes nuevas que pasan el quórum, se añade el slot locativo fijo `in spiaggia`, y su progreso se resetea.
**Verified:** 2026-06-03T22:30:00Z
**Status:** passed
**Re-verification:** No — verificación inicial

---

## Resumen ejecutivo

Los 5 criterios de éxito del roadmap están verificados en el codebase mediante comandos ejecutados en vivo. La suite de 342 tests pasa, el validator de contenido devuelve exit 0 con 49 slots, el milestone gate run-validation-271 devuelve PASS (370/370), el assert-avere-prefix-unchanged confirma que las otras 8 categorías no fueron tocadas, y el smoke estricto (`VAL_07_STRICT=1`) pasa 351 tests sin fallos.

La única discrepancia observable es un olvido editorial: REQUIREMENTS.md tiene los checkboxes de PILOT-02 y PILOT-03 sin marcar (`[ ]`), mientras que el trabajo correspondiente existe y funciona en el codebase. Los overrides arriba documentan este desvío y lo aceptan.

---

## Goal Achievement

### Observable Truths

| #  | Truth (Criterio de éxito del roadmap)                                                                                                  | Status                | Evidence                                                                                                                                                              |
|----|---------------------------------------------------------------------------------------------------------------------------------------|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1  | PILOT-01: Los 52 ejercicios se reagrupan en slots por regla — los que entrenan la misma regla reformulada son variantes del mismo slot | VERIFIED              | `preposiciones.json`: 49 slots, 0 payload, 42 slots multi-variante. SUL=3v, AL=2v, DI-posesso=2v, TRA-futuro=2v. IDs únicos=true.                                   |
| 2  | PILOT-02: Variantes nuevas autoradas pasan el quórum cross-vendor R1-R7 antes de entrar                                               | VERIFIED (override)   | 41 variantes integradas en commit `69cd41c`; audit table en 17-03-SUMMARY muestra DeepSeek+Opus+Sonnet por variante; 2 rechazadas (nv-nelle, nv-sui) correctamente excluidas. Checkbox REQUIREMENTS.md sin marcar — olvido editorial. |
| 3  | PILOT-03: Existe slot locativo `in spiaggia / in montagna / al mare / in campagna` que antes no estaba en ninguna categoría           | VERIFIED (override)   | `preposiciones-in-locativo` (3 variantes: spiaggia/montagna/campagna) + `preposiciones-al-mare` (1 variante). Validation status=validated en ambos. Otros archivos de categoría no enseñan la regla locativa. Checkbox REQUIREMENTS.md sin marcar — olvido editorial. |
| 4  | PILOT-04: Al migrar Preposiciones a slots su progreso se resetea a no-hecha (racha 0); las otras 8 categorías conservan su progreso   | VERIFIED              | `migrate6to7` en `storage.js:604` hace delete categoryProgress.preposiciones + filtra exerciseStats por prefijo. `CURRENT_SCHEMA_VERSION=7`. Tests 342/342 verdes incluyendo bloque v7 de data-storage.test.js. |
| 5  | PILOT-05: La estructura final pasa el validator y el smoke paramétrico, con cobertura de explanations preservada a nivel de slot      | VERIFIED              | `node scripts/validate-content-fixture.mjs preposiciones ... -> exit 0, 49 ejercicios`. `node --test tests/*.test.js -> 342 pass, 0 fail`. `VAL_07_STRICT=1 ... -> 351 pass`. `run-validation-271.mjs -> PASS (370/370)`. |

**Score:** 5/5 truths verified

---

### Corrección de hecho 57→52

| Archivo | Estado |
|---------|--------|
| `.planning/REQUIREMENTS.md` §PILOT-01 | Dice "52 ejercicios" — CORRECTO |
| `.planning/ROADMAP.md` §Phase 17 Goal | Dice "los 52 ejercicios validados" — CORRECTO |
| `.planning/ROADMAP.md` §Phase 17 Plans | 17-02-PLAN: "Reagrupar los 52 ejercicios a 47 slots" — CORRECTO |

`grep "57 ejercicios" REQUIREMENTS.md ROADMAP.md` devuelve 0 matches.

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `content/exercises/preposiciones.json` | 49 slots shape slot+variantes, 0 payload | VERIFIED | 2257 LOC; 49 slots, 0 payload, 42 multi-variante, 0 sin explanation |
| `src/data/storage.js` | migrate6to7 + hydrateV7 + CURRENT_SCHEMA_VERSION=7 | VERIFIED | Líneas 604/666/35; dispatcher encadena v6→migrate6to7→v7→hydrateV7 |
| `src/data/backup.js` | round-trip v7; imports limpios (sin hydrateV5/V6 muertos post-WR-01) | VERIFIED | Commit 2117ac9 eliminó imports muertos; round-trip testado |
| `tests/data-storage.test.js` | Bloque v7 (reset selectivo, idempotencia, pureza, inFlightTest) | VERIFIED | describe block línea 687; importa migrate6to7/hydrateV7 |
| `tests/exercise-types.test.js` | Bifurcación shape-agnostic (getExplanation/getPrompts) + count 49 | VERIFIED | Array.isArray(ex.variants) x2 en líneas 1284/1288; expected:49 en línea 1266 |
| `tests/fixtures/slot-variants-integration.test.js` | preposiciones expected:49 | VERIFIED | Línea 169 |
| `scripts/run-validation-271.mjs` | preposiciones expected:49, TOTAL_EXPECTED=370 | VERIFIED | Líneas 80 y 91 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `storage.js` dispatcher | `migrate6to7` + `hydrateV7` | if-chain líneas 146-147 | WIRED | `if (s.schemaVersion === 6) s = migrate6to7(s); if (s.schemaVersion === 7) return hydrateV7(s);` |
| `migrate6to7` | `categoryProgress.preposiciones` delete | `delete categoryProgress.preposiciones` línea 609 | WIRED | Deep-clone + delete quirúrgico |
| `migrate6to7` | `exerciseStats` poda por prefijo | `!k.startsWith('preposiciones')` línea 617 | WIRED | Filtro en bucle for..of |
| `migrate6to7` | `inFlightTest` invalidación | `id.startsWith('preposiciones')` línea 625 | WIRED | Invalidación condicional sin mutar input |
| `preposiciones.json` slots | explanation top-level (no en variantes) | estructura JSON | WIRED | 0 slots sin explanation; 0 variantes con explanation propia |
| `tests/exercise-types.test.js` | preposiciones.json via `getExplanation(ex)` | `Array.isArray(ex.variants) ? ex.explanation : ex.payload?.explanation` | WIRED | Bifurcación shape-agnostic; legacy usa payload, slots usan top-level |

---

### Data-Flow Trace (Level 4)

No aplica para esta fase: los artefactos son archivos de contenido JSON y lógica de migración de estado (no componentes que renderizan datos dinámicos en el navegador). La verificación de que los datos fluyen correctamente se acredita mediante los tests automatizados y los scripts de validación ejecutados.

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| preposiciones.json tiene 49 slots, 0 payload | `node -e "... data.exercises.length, filter payload"` | 49 slots, 0 payload | PASS |
| Slots multi-variante fusionados (SUL=3, AL=2, DI-posesso=2, TRA-futuro=2) | `node -e "... sul.variants.length"` | SUL=3, AL=2, DI-posesso=2, TRA-futuro=2 | PASS |
| Slots locativos existen con contenido correcto | `node -e "... locativo.variants.map(v=>v.prompt)"` | spiaggia/montagna/campagna en in-locativo; mare en al-mare | PASS |
| Validator de contenido exit 0 | `node scripts/validate-content-fixture.mjs preposiciones ...` | "OK validación: 49 ejercicio(s)" | PASS |
| Suite de tests completa | `node --test tests/*.test.js` | 342 pass, 0 fail | PASS |
| Smoke estricto | `VAL_07_STRICT=1 node --test tests/*.test.js` | 351 pass, 0 fail | PASS |
| Milestone gate | `node scripts/run-validation-271.mjs` | PASS (370/370) | PASS |
| Avere intacto | `node scripts/assert-avere-prefix-unchanged.mjs` | OK: 17 ejercicios intactos | PASS |

---

### Probe Execution

No hay probe scripts convencionales (`scripts/*/tests/probe-*.sh`) en este proyecto. Los checks ejecutables son los scripts de validación arriba documentados, todos con exit 0.

---

### Requirements Coverage

| Requirement | Plan | Descripción | Status | Evidence |
|-------------|------|-------------|--------|----------|
| PILOT-01 | 17-02 | 52 ejercicios reagrupados en slots por regla | SATISFIED | preposiciones.json: 49 slots shape slot+variantes, commit e75073a |
| PILOT-02 | 17-03 | Variantes nuevas con quórum cross-vendor R1-R7 | SATISFIED | 41 variantes integradas, audit table en 17-03-SUMMARY, commit 69cd41c |
| PILOT-03 | 17-03 | Slot locativo in spiaggia/montagna/al mare/campagna | SATISFIED | preposiciones-in-locativo (3v) + preposiciones-al-mare (1v), commit 69cd41c |
| PILOT-04 | 17-01 | Reset progreso Preposiciones; otras 8 categorías intactas | SATISFIED | migrate6to7 en storage.js:604; tests 342/342 verdes |
| PILOT-05 | 17-04 | Validator + smoke paramétrico verdes; explanations por slot | SATISFIED | Todos los comandos de verificación exit 0 |

**Discrepancia editorial:** Los checkboxes de PILOT-02 y PILOT-03 en REQUIREMENTS.md permanecen sin marcar (`[ ]`). El diff de git confirma que el commit `e75073a` (17-02) marcó PILOT-01, PILOT-04 y PILOT-05, pero 17-03 (el plan que entrega PILOT-02/03) no actualizó los checkboxes. El trabajo existe en el codebase (commit `69cd41c`, 41 variantes integradas, 2 slots locativos con validation en disco). **Esto es un olvido editorial, no work pendiente.** Los overrides en el frontmatter documentan la aceptación.

---

### Anti-Patterns Found

Ninguno en archivos de la fase. Scan de marcadores de deuda en `storage.js`, `backup.js`, `data-storage.test.js`, `backup.test.js`, `exercise-types.test.js`, `run-validation-271.mjs`: 0 matches de TBD/FIXME/XXX.

Los warnings del code review (WR-01 a WR-03) y los items informativos (IN-01, IN-02) fueron detectados en el archivo `17-REVIEW.md` y resueltos en el commit `2117ac9` ("No functional change"). Sin stubs ni implementaciones vacías.

---

### Human Verification Required

No se identifican items que requieran verificación humana adicional para los criterios de esta fase. La correctness del contenido pedagógico (que las explicaciones son pedagógicamente correctas para el estudiante de italiano) es competencia del autor, quien aprobó:
- El mapa de reagrupación (checkpoint D-17-03 aprobado)
- La fusión tra/fra (checkpoint `tra-fra-fusion` aprobado)
- Los textos de las variantes nuevas antes del quórum (patrón D-85)

---

### Gaps Summary

No hay gaps. Los 5 criterios de éxito del roadmap están verificados en el codebase. La única observación (checkboxes editoriales sin marcar en REQUIREMENTS.md para PILOT-02/03) queda documentada como override aceptado — no bloquea la validez del trabajo entregado.

---

_Verified: 2026-06-03T22:30:00Z_
_Verifier: Claude (gsd-verifier), Sonnet 4.6_
