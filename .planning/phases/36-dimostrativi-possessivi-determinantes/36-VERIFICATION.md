---
phase: 36-dimostrativi-possessivi-determinantes
verified: 2026-07-01T00:00:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
---

# Phase 36: Dimostrativi + Possessivi (determinantes) Verification Report

**Phase Goal:** El autor puede ser examinado sobre los dos determinantes que enganchan con el artículo: Dimostrativi (`questo`/`quello` + formas tipo-artículo + colapso ES 3-vías→IT 2-vías + `ciò`) y Possessivi (concordancia con la cosa poseída + artículo obligatorio + excepción de parentesco + `loro` invariable). Ambas nacen en slot+variantes, autoradas por quórum cross-vendor R1-R7, registradas en `categories.json` (order 11, 12).
**Verified:** 2026-07-01
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth (SC) | Status | Evidence |
|---|-----------|--------|----------|
| 1 | `questo` concordancia + `quest'` elisión + formas tipo-artículo de `quello` (6 formas) + 1 slot `match` análogo `articoli-049` + `quei/quegli` split con DeepSeek-pass (magnet) | ✓ VERIFIED | `dimostrativi-questo` (4 variantes: questo/questa/questi/queste); `dimostrativi-quest-elisione` (3× quest'); `dimostrativi-quello` MC (quel/quello/quell'/quei/quegli/quelle) con quei-vs-quegli contrastados; `dimostrativi-match-quello` type=match con 9 pairs cubriendo las 6 formas. Ambos slots de quello llevan pase `deepseek-reasoner` |
| 2 | Colapso ES 3-vías (este/ese/aquel) → IT 2-vías (questo/quello) con anclas de distancia (qui/là) sin doble-validez; `codesto` OOS documentado + ausente de keys/distractoras | ✓ VERIFIED | `dimostrativi-collasso-es`: este→questo (ancla "qui"), aquel→quella (ancla "là in fondo"), ese→quel (ancla "lì vicino"), con gloss ES por variante. `codesto` NO aparece en el archivo (0 hits, grep exit 1); OOS documentado en `notes` como "la tercera forma demostrativa histórica ... queda OUT-OF-SCOPE" |
| 3 | Posesivo concuerda con COSA POSEÍDA (incl. owner≠possessed) + EXIGE artículo (calco distractor) + excepción parentesco con las 4 carve-outs (mia madre / la mia mamma / le mie sorelle / il loro padre); MC-only en possessivi; magnet DeepSeek-pass | ✓ VERIFIED | `possessivi-concordanza`: `Marco (m) lava la sua (f) macchina` → owner≠possessed. `possessivi-articolo`: `La mia casa` vs ES `mi casa`, distractores `Mia`/`mio` (calco sin artículo). `possessivi-parentela`: 4 carve-outs EXACTAS (mia madre / la mia mamma / le mie sorelle / il loro padre) con pase `deepseek-reasoner`. `possessivi.json` no tiene ningún `type:match` |
| 4 | 3 cruces multi-cat con `categoryIds` de 2 (dimostrativi-300, possessivi-300, possessivi-301), cascada D-54, y EXACTAMENTE 2 call-sites de `applyImmediateFailure` | ✓ VERIFIED | `dimostrativi-300`=["dimostrativi","articoli"], `possessivi-300`=["possessivi","articoli"], `possessivi-301`=["possessivi","genero-numero"], todos type=MC. `grep -c "applyImmediateFailure(this.state" src/screens/app.js` = **2** (líneas 1642, 1969). `git diff HEAD src/screens/app.js src/domain/progress.js` = vacío (motor intacto) |
| 5 | Toda variante nueva `validation.status: validated` (≥2 passes correcta, ≥2 `by` distintos); 3 magnets con DeepSeek-pass; explanations acentuadas, apóstrofe ASCII, plain text, gloss canónico, sin R1 leak | ✓ VERIFIED | 15/15 slots (8 dimostrativi + 7 possessivi) `validated` con ≥2 correctas y ≥2 `by` distintos. Magnets `dimostrativi-quello`, `dimostrativi-match-quello`, `possessivi-parentela` todos con `deepseek-reasoner`. 0 smart-quotes, 0 markdown, 0 R1-leak en prompts, glosses ES presentes, explanations acentuadas |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `content/exercises/dimostrativi.json` | 4 núcleo + A2 (ciò, pronominali) + cruce, notes con OOS | ✓ VERIFIED | 8 slots (7 categoría + 1 cruce), notes 865 chars documentando OOS y magnet |
| `content/exercises/possessivi.json` | 5 núcleo/A2 MC-only + 2 cruces, notes | ✓ VERIFIED | 7 slots (5 categoría + 2 cruces), MC-only confirmado |
| `content/categories.json` | dimostrativi order 11, possessivi order 12, id/name/order only, NO origen | ✓ VERIFIED | 12 entradas; dimostrativi/possessivi con solo `{id,name,order}`, sin `origen` (diferido a Phase 39) |
| `src/screens/app.js` / `src/domain/progress.js` | Motor intacto (D-54) | ✓ VERIFIED | git diff vacío; 2 call-sites |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| dimostrativi.json / possessivi.json | schema-validator | `validateContent()` | ✓ WIRED | `validateContent({categories, exercisesByFile})` → `{ok:true, errors:[]}` para ambos archivos |
| content-loader | 15 slots nuevos | loadContent readdir genérico | ✓ WIRED | Cargados genéricamente por slug; categories.json wrapped `{categories:[...]}` según espera el loader |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Schema validator acepta ambos archivos nuevos | `validateContent({...})` | `ok:true, errors:[]` | ✓ PASS |
| D-54 invariante (2 call-sites) | `grep -c "applyImmediateFailure(this.state" src/screens/app.js` | `2` | ✓ PASS |
| Motor intacto | `git diff HEAD src/screens/app.js src/domain/progress.js` | vacío | ✓ PASS |
| Suite de tests (baseline) | `node --test tests/*.test.js` | 597 tests / 596 pass / 1 fail | ✓ PASS (baseline) |
| `codesto` ausente de exercisable content | `grep -ni codesto dimostrativi.json` | 0 hits (exit 1) | ✓ PASS |

**Nota baseline:** el único fail (`genero-numero.json` — "12/12 ejercicios con explanation válida") es AJENO/preexistente (v1.7/v1.8 lo shippearon), NO una regresión de Phase 36. Ni dimostrativi ni possessivi aparecen en el fallo.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DEMOS-01 | 36-01 | concordancia questo/questa/questi/queste | ✓ SATISFIED | `dimostrativi-questo` 4 variantes |
| DEMOS-02 | 36-01 | elisión quest' ante vocal | ✓ SATISFIED | `dimostrativi-quest-elisione` (anno/amica/estate) |
| DEMOS-03 | 36-01 | formas quello + 1 match análogo articoli-049 | ✓ SATISFIED | `dimostrativi-quello` MC + `dimostrativi-match-quello` |
| DEMOS-04 | 36-01 | colapso ES 3→IT 2 con anclas qui/là | ✓ SATISFIED | `dimostrativi-collasso-es` con anclas + gloss |
| DEMOS-05 | 36-02 | ciò + formas pronominales | ✓ SATISFIED | `dimostrativi-cio` single-variant + `dimostrativi-pronominali` |
| POSS-01 | 36-03 | concordancia con cosa poseída | ✓ SATISFIED | `possessivi-concordanza` (owner≠possessed) |
| POSS-02 | 36-03 | exige artículo (vs ES) | ✓ SATISFIED | `possessivi-articolo` con calco distractor |
| POSS-03 | 36-03 | excepción parentesco (drop artículo) | ✓ SATISFIED | `possessivi-parentela` (mia madre) |
| POSS-04 | 36-03 | retorno del artículo (plural/alterado) | ✓ SATISFIED | `possessivi-parentela` (le mie sorelle / la mia mamma / il loro padre) |
| POSS-05 | 36-04 | ambigüedad suo (his/her) + loro invariable | ✓ SATISFIED | `possessivi-suo` (his/her) + `possessivi-loro` (4 formas invariables) |

INT-01..04 mapeados a Phase 39 en REQUIREMENTS.md (fuera de scope de Phase 36 — count-sync + PROV-01 lockstep).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| dimostrativi.json | 301 | substring "todo" en "todo lo demás" | ℹ️ Info | Falso positivo del scan de debt-markers; texto español legítimo. No es un marcador de deuda |

Sin debt markers reales, sin smart-quotes, sin markdown, sin R1-leak.

### Human Verification Required

Ninguna. Toda la verificación es programática (contenido JSON, validador de schema, invariante grep/git, suite de tests). El motor de examen es genérico y ya cubierto por tests; las 2 filas nuevas aparecen en home/picker/Repaso/Examen sin código nuevo (verificado vía content-loader + categoriesForDisplay genéricos).

### Gaps Summary

Ninguno. Los 5 Success Criteria del ROADMAP están observablemente satisfechos en el codebase. Los ítems fuera de scope (3 count arrays + TOTAL_EXPECTED/BASELINE, campo `origen`/PROV-01, fail preexistente de genero-numero) están correctamente diferidos a Phase 39 según CONTEXT.md y el plan del milestone — NO son gaps de Phase 36.

---

_Verified: 2026-07-01_
_Verifier: Claude (gsd-verifier)_
