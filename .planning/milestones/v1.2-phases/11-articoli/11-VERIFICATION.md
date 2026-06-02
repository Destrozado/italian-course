---
phase: 11-articoli
verified: 2026-05-28T00:00:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Abrir la app, ver tabla del home"
    expected: "'Articoli (artículos)' aparece como 8ª fila con botón Examen lanzable a 1 clic"
    why_human: "Render Alpine/DOM real — grep confirma categories.json order 8 + categoriesForDisplay, pero la fila visible y el clic Examen requieren navegador"
  - test: "En sesión, fallar un bridge articoli-300..305"
    expected: "AMBAS categorías (articoli + genero-numero/sustantivos-irregulares) pasan a no-hecha racha 0 al instante; el resumen post-sesión muestra las 2+ categorías afectadas"
    why_human: "Cascada D-54 en runtime + render del resumen — la lógica flatMap(categoryIds) está verificada en código, pero el reset instantáneo y el resumen visible necesitan ejecución en navegador"
---

# Phase 11: Articoli Verification Report

**Phase Goal:** El autor practica y re-verifica todos los artículos determinativos e indeterminativos italianos como una categoría nueva, con ejercicios que cubren cada forma, cada disparador fonético y cada trampa canónica, validados por quórum.
**Verified:** 2026-05-28
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Temario exhaustivo escrito ANTES de cualquier ejercicio (orden git, ART-02) | ✓ VERIFIED | TEMARIO añadido 2026-05-27 23:02:32; articoli.json añadido 23:18:37 — temario precede en git. Temario tiene `## Determinativi`, `## Indeterminativi`, `## Trampas canonicas`, `## Fuera de alcance (A2)` con `pn/y` marcados A2. |
| 2 | Articoli 8ª fila + Examen 1 clic + cada celda (formas × disparadores × trampas) cubierta | ✓ VERIFIED (código) / human para UI | categories.json: articoli order 8 (único en order 8). Todas las formas presentes (il/lo/l'/la/i/gli/le/un/uno/una/un'). Las 8 trampas canónicas (lo zio, gli gnocchi, lo psicologo, uno studente, l'amico, l'amica, un'amica, un amico) PRESENT. |
| 3 | Fallar bridge articoli↔X resetea AMBAS categorías (D-54) + resumen muestra 2+ | ✓ VERIFIED (código) / human para runtime | 6 bridges (300-305) categoryIds:[articoli, genero-numero]×3 + [articoli, sustantivos-irregulares]×3. progress.js cascade usa `flatMap(categoryIds)` — resetea cada categoría; heredado sin código nuevo. |
| 4 | Cada ejercicio muestra explanation pedagógica (español acentuado, plain text, ASCII U+0027) + CATEGORIES_WITH_EXPLANATIONS cubre cuenta exacta | ✓ VERIFIED | 56/56 con explanation; 0 con markdown; 0 con U+2019; 0 <20 chars. test expected=56 para articoli.json. |
| 5 | Reporter exit 0 (todos validated ≥2 by) + VAL_07_STRICT tests verde con constantes actualizadas | ✓ VERIFIED | `node scripts/run-validation-271.mjs` exit 0, gate PASS, TOTAL_EXPECTED=328. `VAL_07_STRICT=1 node --test` exit 0, 268 pass / 0 fail. 56/56 validated, 56/56 con ≥2 by distintos. |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `.planning/phases/11-articoli/11-TEMARIO-ARTICOLI.md` | Checklist cobertura, precede articoli.json en git | ✓ VERIFIED | Secciones Determinativi/Indeterminativi/Trampas/Fuera de alcance; A2 marcado. |
| `content/exercises/articoli.json` | 56 ejercicios, base MC + match + 6 bridges, validated | ✓ VERIFIED | 56 total: 54 multiple-choice + 2 match; 50 single-cat + 6 bridges. |
| `content/categories.json` | Entry articoli order 8 | ✓ VERIFIED | id=articoli, order=8, name="Articoli (artículos)". |
| `scripts/run-validation-271.mjs` | articoli expected 56, TOTAL_EXPECTED 328 | ✓ VERIFIED | slug:'articoli' expected:56; TOTAL_EXPECTED=328. |
| `tests/exercise-types.test.js` | articoli expected 56 en CATEGORIES_WITH_EXPLANATIONS | ✓ VERIFIED | expected:56; comentario 272+56=328. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| articoli.json | schema-validator.js | MC + match payloads válidos | ✓ WIRED | Tests estrictos verdes; payloads MC (options/correctIndex) y match (pairs 6-7) válidos. |
| articoli.json bridges | progress.js cascada D-54 | categoryIds:[A,B] → reset ambas | ✓ WIRED | flatMap(categoryIds) en failedCategoryIds; reset por categoría sin código nuevo. |
| categories.json | app.js categoriesForDisplay | entry → fila home + Examen | ✓ WIRED (código) | order 8; render visual → human. |
| reporter CATEGORIES + TOTAL_EXPECTED | articoli.json length | 3 conteos en lockstep | ✓ WIRED | 56=56=56; reporter PASS exit 0. |

### Integration Lockstep (3-count)

articoli.json length **56** == reporter expected **56** == test expected **56**. TOTAL_EXPECTED 272→328 (+56). Consistente.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| ART-01 | 11-04 | Categoría existe, 8ª | ✓ SATISFIED | categories.json order 8. |
| ART-02 | 11-01 | Temario ANTES (git) | ✓ SATISFIED | git: temario 23:02 < json 23:18. |
| ART-03 | 11-02 | Formas determinativo + disparadores | ✓ SATISFIED | il/lo/l'/la/i/gli/le presentes. |
| ART-04 | 11-02 | Formas indeterminativo | ✓ SATISFIED | un/uno/una/un' presentes. |
| ART-05 | 11-02, 11-03 | Trampas canónicas | ✓ SATISFIED | Las 8 trampas PRESENT. |
| ART-06 | 11-03 | Bridges multi-categoría + cascada | ✓ SATISFIED | 6 bridges (300-305), 2 cats exactas c/u, cascada D-54. **Nota:** REQUIREMENTS.md aún marca ART-06 como Pending/`[ ]` (líneas 18, 67) — entrada de tracking obsoleta; el código SÍ entrega ART-06. |
| ART-07 | 11-02, 11-03 | Explanation curada | ✓ SATISFIED | 56/56, plain text, sin U+2019. |
| ART-08 | 11-05 | Validación quórum ≥2 IAs | ✓ SATISFIED | 56/56 validated, ≥2 by distintos (pool cross-vendor claude-opus-4-7 + deepseek-v4-flash; VAL-04 satisfecho). |

Todos los 8 IDs declarados en frontmatter y cubiertos. Ningún ID huérfano.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Reporter gate | `node scripts/run-validation-271.mjs` | exit 0, "Milestone gate PASS" | ✓ PASS |
| Strict smoke test | `VAL_07_STRICT=1 node --test tests/*.test.js` | exit 0, 268 pass / 0 fail | ✓ PASS |
| Conteo lockstep | node parse 3 sitios | 56=56=56 | ✓ PASS |
| Quórum invariante | node parse passes[] | 56/56 ≥2 by | ✓ PASS |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| tests/exercise-types.test.js | 328 | "Debe" (comentario, no debt marker) | ℹ️ Info | Falso positivo del grep — no es TODO/FIXME. |

Sin debt markers (TODO/FIXME/XXX/TBD) reales. Sin stubs. Sin smart quotes. Sin markdown en explanations.

### Human Verification Required

1. **Fila Articoli + Examen en home** — Abrir la app y confirmar que "Articoli (artículos)" es la 8ª fila con botón Examen lanzable a 1 clic. Código verificado (order 8, categoriesForDisplay); render es visual.

2. **Cascada D-54 en runtime** — Fallar un bridge (articoli-300..305) y confirmar que ambas categorías pasan a no-hecha racha 0 al instante y el resumen post-sesión muestra las 2+ categorías. Lógica flatMap(categoryIds) verificada; el reset instantáneo y el resumen visible requieren navegador.

### Gaps Summary

Sin gaps que bloqueen el objetivo. Las 5 Success Criteria del roadmap están verificadas en código y los dos gates (reporter + tests estrictos) pasan en verde. Los 8 requirements ART están satisfechos en el codebase.

Una observación documental: REQUIREMENTS.md sigue marcando ART-06 como Pending/`[ ]` (líneas 18 y 67) pese a que los 6 bridges y la cascada D-54 están entregados — entrada de tracking obsoleta, no un fallo del objetivo. Recomendación: actualizar a Complete.

Estado human_needed por dos verificaciones visuales/runtime (fila home + cascada en navegador) que no se pueden confirmar por grep.

---

_Verified: 2026-05-28_
_Verifier: Claude (gsd-verifier)_
