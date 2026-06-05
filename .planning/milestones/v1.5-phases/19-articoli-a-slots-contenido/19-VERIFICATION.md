---
phase: 19-articoli-a-slots-contenido
verified: 2026-06-04T11:00:00Z
status: passed
score: 4/4 must-haves verified
overrides_applied: 0
re_verification: null
gaps: []
deferred: []
human_verification: []
---

# Phase 19: Articoli a slots (contenido) — Verification Report

**Phase Goal:** Convertir el bloque Articoli de ejercicios legacy flat a modelo slot+variantes, cerrando ART-01..ART-04.
**Verified:** 2026-06-04
**Status:** PASSED
**Re-verification:** No — verificación inicial

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | articoli.json tiene 34 slots, todos con variants[], explanation top-level, 0 payload, 0 explanation en variante | VERIFIED | `Total slots: 34 / Has payload: 0 / Slots without explanation: 0 / Variants with own explanation: 0` (verificado programáticamente) |
| 2 | Cruces 300..305 estables con 2 categoryIds; ningún ejercicio artículo-only reutiliza rango 30x | VERIFIED | 6 slots con 2 categoryIds (`articoli-300..305`), 0 slots artículo-only en rango 30x |
| 3 | Indeterminativi (8 slots: un-cons, un-masc-vocal, uno-scons, uno-z, uno-ps, uno-gn, una-invariable, un-fem-vocal) presentes como slots propios con categoryIds=["articoli"] | VERIFIED | Los 8 IDs presentes; todos `categoryIds.length===1` y `categoryIds[0]==='articoli'` |
| 4 | Nuevos slots articoli-lo-yi y articoli-gli-yi existen; 5 celdas pobres con >=2 variantes; suite completa verde | VERIFIED | `articoli-lo-yi` (2 variantes), `articoli-gli-yi` (1 variante); los 5 pobres (lo-ps/gn/x, uno-ps/gn) con 2 variantes; 358/358 pass; VAL_07_STRICT 367/367 |

**Score:** 4/4 truths verified

---

## Requirements Coverage

| Req | Description | Status | Evidence |
|-----|-------------|--------|----------|
| ART-01 | 56 ejercicios reagrupados en slots por regla; superficies movidas intactas a variants[] | SATISFIED | 34 slots presentes, 64 variantes totales (56 heredadas + 8 nuevas), 0 re-validaciones |
| ART-02 | Variantes nuevas autorizadas por quórum cross-vendor R1-R7; huecos y/i+vocal como slots nuevos | SATISFIED | 8 superficies nuevas con 4 passes correcta cada una; slots `articoli-lo-yi` y `articoli-gli-yi` presentes; 5 celdas pobres engordadas a >=2 variantes |
| ART-03 | Indeterminativi como slots propios con categoryIds=["articoli"], sin categoría nueva | SATISFIED | 8 slots indeterminativi, todos `categoryIds=["articoli"]`; 0 categoría nueva creada |
| ART-04 | 3 hardcodes de count + TOTAL_EXPECTED sincronizados al real; suite verde sin tocar lógica de test/validator/loader | SATISFIED | Los 3 hardcodes = 34 (`exercise-types.test.js:1273`, `slot-variants-integration.test.js:174`, `run-validation-271.mjs:87`); `TOTAL_EXPECTED = 348`; tests 358/358; VAL_07_STRICT 367/367; VAL-06 PASS (348/348) |

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `content/exercises/articoli.json` | 34 slots slot+variantes, 0 payload | VERIFIED | 34 slots, 0 payload, 64 variantes, todos `validation.status: validated` top-level |
| `tests/exercise-types.test.js` | expected articoli = 34 | VERIFIED | Línea 1273: `expected: 34` |
| `tests/fixtures/slot-variants-integration.test.js` | expected articoli = 34 | VERIFIED | Línea 174: `expected: 34` |
| `scripts/run-validation-271.mjs` | articoli = 34, TOTAL_EXPECTED = 348 | VERIFIED | Línea 87: `expected: 34`; línea 97: `TOTAL_EXPECTED = 348` |
| `.planning/phases/19-articoli-a-slots-contenido/19-REAGRUPACION-MAP.md` | Mapa de auditoría id-fuente→slot | VERIFIED | Archivo presente |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| articoli.json (34 slots) | exercise-types.test.js | `expected: 34` hardcode | WIRED | Test lee el JSON; count 34 coincide |
| articoli.json (34 slots) | slot-variants-integration.test.js | `expected: 34` hardcode | WIRED | Count consistente |
| articoli.json (34 slots) | run-validation-271.mjs | `expected: 34`, `TOTAL_EXPECTED = 348` | WIRED | Reporter VAL-06 PASS (348/348) |
| articoli-lo-yi / gli-yi | validation.status top-level | D-19-09 elevación quórum variante→slot | WIRED | Los 2 slots nuevos tienen `validation.status: validated` + `passes[]` de 4 a nivel slot |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Suite completa verde | `node --test tests/*.test.js` | 358 pass, 0 fail | PASS |
| VAL_07_STRICT verde | `VAL_07_STRICT=1 node --test tests/*.test.js` | 367 pass, 0 fail | PASS |
| Reporter milestone gate | `node scripts/run-validation-271.mjs` | VAL-06 PASS (348/348); VAL-08 PASS; VAL-04 PASS; Milestone gate PASS | PASS |
| 34 slots, 0 payload, 0 explanation en variante | node script inline | Verificado | PASS |
| 5 celdas pobres con >=2 variantes | node script inline | lo-ps:2, lo-gn:2, lo-x:2, uno-ps:2, uno-gn:2 | PASS |
| Smart quotes 0 | node script inline | 0 | PASS |
| C'è / È correctos (WR-01, WR-02 fix) | node script inline | `È ___ studentessa` / `C'è ___ ragazzo` | PASS |
| #NNN refs 0 | node script inline | 0 | PASS |
| Answer-leak en prompts 0 | node script inline | 0 | PASS |

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `scripts/run-validation-271.mjs` | 2,5,311 | Comentarios / nombre del archivo dicen "271" pero TOTAL_EXPECTED es 348 | Info | Documentación obsoleta, 0 impacto funcional (IN-02 del REVIEW ya catalogado) |
| `content/exercises/articoli.json` | todos | Dos formatos de provenance en `validation` top-level: 2 passes (32 slots de 19-01) vs 4 passes + bloque por variante (2 slots de 19-02) | Info | 0 impacto funcional hoy; posible confusión en auditoría futura (IN-01 del REVIEW ya catalogado) |

Sin blockers. Sin TBD/FIXME/XXX sin referenciar.

---

## Human Verification Required

Ninguno. Todos los criterios son verificables programáticamente.

---

## Gaps Summary

Ningún gap. Los 4 requisitos ART-01..ART-04 verificados contra el código real:

- **ART-01**: 34 slots con 64 variantes totales, 0 payload, 0 explanation en variante, reagrupación trazable via 19-REAGRUPACION-MAP.md.
- **ART-02**: 8 superficies nuevas integradas (5 celdas pobres + 2 slots y/i+vocal), todas con 4 passes quórum cross-vendor.
- **ART-03**: 8 slots indeterminativi con `categoryIds=["articoli"]`; sin categoría nueva.
- **ART-04**: Los 3 hardcodes = 34, TOTAL_EXPECTED = 348, suite 358/358, VAL_07_STRICT 367/367, reporter PASS (348/348).

Los dos ítems Info (IN-01 provenance dual, IN-02 comment drift en script) son deuda de documentación sin impacto funcional, ya catalogados en 19-REVIEW.md.

---

_Verified: 2026-06-04T11:00:00Z_
_Verifier: Claude (gsd-verifier)_
