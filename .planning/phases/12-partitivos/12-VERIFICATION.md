---
phase: 12-partitivos
verified: 2026-05-28T00:00:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 1
human_verification:
  - test: "Abrir la app, ver tabla del home"
    expected: "'Partitivos' aparece como 9ª fila con botón Examen lanzable a 1 clic"
    why_human: "Render Alpine/DOM real — grep confirma categories.json order 9 + categoriesForDisplay, pero la fila visible y el clic Examen requieren navegador"
  - test: "Lanzar Examen de Partitivos y fallar un ejercicio"
    expected: "La categoría Partitivos pasa a no-hecha racha 0; el resumen post-sesión la muestra como afectada"
    why_human: "Sin bridges en v1.2 (D-14) la cascada D-54 no aplica multi-cat aquí, pero el reset y resumen visibles requieren ejecución en navegador"
---

# Phase 12: Partitivos Verification Report

**Phase Goal:** El autor practica y re-verifica el partitivo italiano como una categoría nueva — todas sus formas, sus alternativas, y la distinción clave función partitiva vs preposizione articolata — con ejercicios validados por quórum.
**Verified:** 2026-05-28
**Status:** human_needed
**Re-verification:** No — initial verification (retroactive — VERIFICATION.md ausente al cierre de 12-05; reconstruida durante audit-milestone v1.2)

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Temario exhaustivo del partitivo escrito y revisado ANTES de cualquier ejercicio (orden git, PART-02) | ✓ VERIFIED | git: `12-TEMARIO-PARTITIVOS.md` añadido 2026-05-28 02:32:09 (commit `04db148`); `content/exercises/partitivos.json` añadido 02:44:02 (commit `c415487`). Temario precede ~12 min. |
| 2 | Partitivos 9ª fila + Examen 1 clic + ejercicios cada forma + alternativas | ✓ VERIFIED (código) / human para UI | `categories.json` entry `partitivos` order 9 (único en order 9). 44 ejercicios cubren formas del singular (del/dello/della/dell') + plural (dei/degli/delle) + alternativas (alcuni/alcune, qualche+singular, un po' di con incontables) + mini-bloque omisión negativas. |
| 3 | Distinción partitivo vs preposizione articolata (PART-05) con explanation que remite a Preposiciones | ✓ VERIFIED | Bloque match + clasificación PART-05 presente en 12-03 (commit `4c37490`). Explanations 041/042 suavizadas tras 12-05 disputed (override D-06): mantienen la remisión "esa función pertenece a la categoría Preposiciones; aquí solo se contrasta" sin voz de 1ª persona curador. |
| 4 | Cada ejercicio muestra explanation pedagógica + smoke `CATEGORIES_WITH_EXPLANATIONS` cubre el archivo con cuenta exacta | ✓ VERIFIED | 44/44 con explanation; `tests/exercise-types.test.js` declara `{ file: 'content/exercises/partitivos.json', expected: 44 }`; comentario lockstep `272 + 56 + 44 = 372`. |
| 5 | Reporter `run-validation-271.mjs` exit 0 con todos validated (≥2 `by` distintos) + smoke `VAL_07_STRICT=1` verde con constantes actualizadas | ✓ VERIFIED | `node scripts/run-validation-271.mjs` exit 0, "Milestone gate PASS" (372/372 validated, 0 pending/missing/disputed). `VAL_07_STRICT=1 node --test tests/exercise-types.test.js` exit 0, 137/137 pass. 44/44 partitivos con `status: validated`, todos con ≥2 `by` distintos en `passes[]`. |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `.planning/phases/12-partitivos/12-TEMARIO-PARTITIVOS.md` | Temario exhaustivo, precede `partitivos.json` en git | ✓ VERIFIED | Commit 02:32 < json 02:44; cubre formas singulares/plurales + alternativas + omisión + función vs preposición. |
| `content/exercises/partitivos.json` | 44 ejercicios (37 base MC + 2 match + 5 omisión), validated | ✓ VERIFIED | 44 totales: 42 multiple-choice + 2 match. Todos `status: validated`. |
| `content/categories.json` | Entry `partitivos` order 9 | ✓ VERIFIED | id=partitivos, order=9, name="Partitivos". |
| `scripts/run-validation-271.mjs` | `partitivos` expected 44, `TOTAL_EXPECTED` 372 | ✓ VERIFIED | `{ slug: 'partitivos', file: 'content/exercises/partitivos.json', expected: 44 }`; `TOTAL_EXPECTED = 372`. |
| `tests/exercise-types.test.js` | `partitivos` expected 44 en `CATEGORIES_WITH_EXPLANATIONS` | ✓ VERIFIED | `{ file: 'content/exercises/partitivos.json', expected: 44 }`; comentario `272 + 56 + 44 = 372`. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `partitivos.json` | `schema-validator.js` | MC + match payloads válidos | ✓ WIRED | Smoke 137/137 pass en estricto; payloads MC (options/correctIndex) y match (pairs) válidos. |
| `categories.json` | `app.js categoriesForDisplay` | entry order 9 → fila home + Examen | ✓ WIRED (código) | order 9 único; render visual → human. |
| Reporter `CATEGORIES` + `TOTAL_EXPECTED` | `partitivos.json` length | 3 conteos en lockstep | ✓ WIRED | 44 = 44 = 44; `TOTAL_EXPECTED 372` = 272 + 56 + 44. Reporter PASS exit 0. |
| Sin bridges (D-14) | progress.js cascada | N/A en v1.2 | ✓ INTENCIONAL | Decisión explícita en plan: Partitivos sin bridges para acotar v1.2; PART-X1 al backlog. |

### Integration Lockstep (3-count)

`partitivos.json` length **44** == reporter expected **44** == test expected **44**. `TOTAL_EXPECTED` 328 → **372** (+44). Consistente.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| PART-01 | 12-04 | Categoría existe, 9ª | ✓ SATISFIED | `categories.json` order 9. |
| PART-02 | 12-01 | Temario ANTES (git) | ✓ SATISFIED | git: temario 02:32 < json 02:44 (mismo día, +12 min). |
| PART-03 | 12-02 | Formas singular + plural del partitivo | ✓ SATISFIED | del/dello/della/dell'/dei/degli/delle cubiertos en bloque base 12-02. |
| PART-04 | 12-02 | Alternativas (alcuni/qualche/un po' di) | ✓ SATISFIED | Bloque alternativas por restricción + mini-bloque omisión negativas en 12-02. |
| PART-05 | 12-03 | Distinción partitivo vs preposizione | ✓ SATISFIED | Match block + clasificación 12-03 (commit `4c37490`); explanations 041/042 conservan remisión a Preposiciones (D-06). |
| PART-06 | 12-02, 12-03 | Explanation pedagógica curada | ✓ SATISFIED | 44/44 con explanation; canon español acentuado, plain text, ASCII U+0027. |
| PART-07 | 12-05 | Validación quórum ≥2 IAs distintas | ✓ SATISFIED | 44/44 `status: validated`; cross-vendor pool: `deepseek-v4-pro` + `claude-opus-4-7` + 1 entry `autor` (override autorizado D-02 en partitivos-036). Todos los ejercicios tienen ≥2 `by` distintos. |

Todos los 7 IDs declarados en frontmatter de plans están satisfechos. Ningún ID huérfano.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Reporter gate | `node scripts/run-validation-271.mjs` | exit 0, "Milestone gate PASS" (372/372) | ✓ PASS |
| Strict smoke test | `VAL_07_STRICT=1 node --test tests/exercise-types.test.js` | exit 0, 137 pass / 0 fail | ✓ PASS |
| Distinct AIs per validated (VAL-04) | reporter sub-gate | PASS — todos con ≥2 `by` distintos | ✓ PASS |
| Cero disputed (VAL-08) | reporter sub-gate | PASS — 0 disputed | ✓ PASS |

## Overrides Applied

**1 override autor durante 12-05 (autorizado por el autor, "aplica los fix necesarios"):**

| Ejercicio | Decisión | Razón |
| --- | --- | --- |
| `partitivos-036` (`Ho ___ amici a Roma.` → degli) | OVERRIDE camino-b (D-02 prevalece) | DeepSeek Pro flagueó ambigüedad (∅ es gramaticalmente válido); el ejercicio entrena deliberadamente USAR el partitivo en afirmativa — matiz pedagógico clave del bloque omisión. Entry `by:"autor" verdict:"correcta"` + `status="validated"` literal (bypass `deriveStatus` per workflow). Documentado en 12-05-SUMMARY.md y en `validation.passes[]` del ejercicio. |

Resoluciones complementarias (no overrides, sino ACCEPT-FIX con re-validate):
- `partitivos-032`/`033`: distractor `un po' di` reemplazado por `alcuni`/`alcuna` (la doble-validez italiana coloquial cazada por ambas IAs ya no aplica). Re-validate: ambos pases `correcta`.
- `partitivos-041`/`042`: explanation suavizada sin voz curador 1ª persona; remisión a Preposiciones preservada (D-06). Re-validate: ambos pases `correcta`.

## Tech Debt / Deferred

- **PART-X1 (bridges multi-cat Partitivos↔género-número/sustantivos):** diferido a v1.3+ por decisión D-14 ("acotar v1.2"). Capturado en REQUIREMENTS.md §Future + ROADMAP backlog.
- **Sin bridges → cascada D-54 no se ejercita en Partitivos:** intencional v1.2 (Partitivos solo activa reset por categoría propia; no afecta a otras categorías al fallar).

## Notas

- VERIFICATION.md creado retroactivamente durante `/gsd-audit-milestone v1.2` (2026-05-28). El gate del milestone ya estaba verde al cierre de 12-05 (commit `710fb36`); este reporte formaliza el artefacto que faltaba para el archivo del milestone.
- Toda la evidencia es re-ejecutable: `node scripts/run-validation-271.mjs` y `VAL_07_STRICT=1 node --test tests/exercise-types.test.js` siguen exit 0 al momento de la verificación.
