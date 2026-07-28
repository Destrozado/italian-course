# Plan 38-02 — Summary

**Plan:** 38-02 — Sello canónico Opus+Sonnet + ronda EXTRA DeepSeek del MAGNET (top-level)
**Wave:** 2 (depends_on: 38-01)
**Status:** COMPLETE
**Executed:** 2026-07-01 (top-level, NO vía gsd-executor — el skill/quórum de Task subagents requiere contexto top-level)
**Requirements:** REFLEX-01..05 (cierre canónico SC#5 / INT-04)

## Self-Check: PASSED

## Qué se hizo

Remate canónico de la validación de `content/exercises/riflessivi.json` que el Plan 01 dejó con quórum ESTRUCTURAL (claude-opus-4-8 + DeepSeek). Ejecutado top-level para poder aplicar el quórum canónico Opus+Sonnet.

### 1. Sello canónico `claude-sonnet-4-6` (los 7 slots)
Se lanzó un validador Sonnet fresco (contexto aislado, 1 ejercicio por spawn — VAL-03, NUNCA batched) por cada uno de los 7 slots, aplicando el prompt canónico R1-R7 → C1-C5 (`.planning/milestones/v1.1-phases/09-.../09-VALIDATION-PROMPT.md`). **Resultado: 7/7 `verdict: correcta`, las 5 criterias `true`, `concerns: []`.** El pase `claude-sonnet-4-6` se AÑADIÓ (append, sin degradar pases previos) al `validation.passes[]` de cada slot; `status` re-derivado con `deriveStatus()`.

**Audit canónico-vs-fallback (SC#5):** `sonnet-sealed: 7/7`, `fallback-only: (none)`. El sello Sonnet canónico quedó estampado en TODOS los slots — no hubo que recurrir al fallback cross-vendor.

Estado final de `by` por slot (≥3 distintos, todos `correcta`):
| Slot | by |
|------|-----|
| riflessivi-presente | claude-opus-4-8, deepseek-reasoner, claude-sonnet-4-6 |
| riflessivi-collocazione-wb | claude-opus-4-8, deepseek-reasoner, claude-sonnet-4-6 |
| riflessivi-su-regolari | claude-opus-4-8, deepseek-reasoner, claude-sonnet-4-6 |
| riflessivi-pp-concordanza (MAGNET) | claude-opus-4-8, deepseek-chat, deepseek-reasoner, claude-sonnet-4-6 |
| riflessivi-mismatch | claude-opus-4-8, deepseek-chat, claude-sonnet-4-6 |
| riflessivi-300 | claude-opus-4-8, deepseek-chat, claude-sonnet-4-6 |
| riflessivi-301 | claude-opus-4-8, deepseek-chat, deepseek-reasoner, claude-sonnet-4-6 |

### 2. Ronda EXTRA DeepSeek obligatoria (D-38-04, Pitfall 6)
`riflessivi-pp-concordanza` y `riflessivi-301` recibieron una ronda EXTRA con `deepseek-reasoner` (estricto en concordancia/acentos) vía `scripts/validate-ai-pass.mjs --write`. **Resultado: `correcta` en ambos** sobre el contenido YA corregido (ver deviation). Los `concerns[]` (pase opus-4-8) auditan explícitamente las 4 terminaciones -o/-a/-i/-e por sujeto (D-31-08); CERO auxiliar `avere` en las keys; SIN gloss ES (D-38-01). Verificado por gate automático.

## Deviations (Rule 1 — canon_recheck del propio plan)

**D1 — Corrección de acento italiano `si e` → `si è` (14 ocurrencias).** El `<canon_recheck>` del Plan 02 exige verificar que Plan 01 respetó el canon y, si no, arreglar y re-validar. Se detectó que las OPTIONS de los 2 nodos de concordancia almacenaban la forma sin acento `si e svegliato` (`e` = conjunción "y") en vez de `si è svegliato` (`è` = auxiliar "es/ha"). Era:
- un error ortográfico italiano real (è ≠ e cambia el significado),
- inconsistente con el análogo shipeado `presente-regolare-301` (que usa `è partito`/`è tornata`),
- inconsistente con la propia `explanation` del slot (que ya usaba `si è`).

Los validadores Sonnet lo aprobaron leyéndolo caritativamente como `si è`, pero es canon bloqueado (preservar acentos italianos parte de la forma; memoria `explanations_must_be_accented` / Pitfall 10 = bug real, no override). **Fix:** reemplazo `"si e ` → `"si è ` (14 ocurrencias, todas auxiliares en options; distractoras conservan su tipo de error, solo con la ortografía del auxiliar corregida). Re-validado con la ronda EXTRA DeepSeek-reasoner (estricto en acentos) → `correcta`. Motor intacto.

## Verificación (todos los gates PASS)
- V1: 7/7 slots `validated`, ≥2 `by` distintos, todos `correcta`.
- V2 (soft audit): 7/7 sonnet-sealed, 0 fallback.
- V3: MAGNET + riflessivi-301 con pase DeepSeek, audit D-31-08 de las 4 terminaciones, CERO `avere` en keys.
- V4: SIN gloss ES en los 2 nodos de concordancia (D-38-01).
- V5: `validate-content-fixture.mjs riflessivi` → exit 0 (7 ejercicios, slug riflessivi).
- V6: `node --test tests/*.test.js` → 598 pass / 1 fail. El único fail es el PREEXISTENTE y AJENO `genero-numero.json` (espera 12, hay 13) — documentado en CONTEXT como fuera de scope. El test de cascada multi-cat para `riflessivi.json` PASA (SC#4: la cascada D-54 propaga a ambas categorías de los cruces).
- V7: `applyImmediateFailure(this.state` = 2 call-sites (D-54).
- V8: `git diff` de `app.js`/`progress.js` vacío (motor intacto).

## Key files
- `content/exercises/riflessivi.json` — MODIFIED: +7 pases `claude-sonnet-4-6`, +2 pases `deepseek-reasoner` (concordancia), 14 acentos `si e`→`si è` corregidos. Todas las variantes `validation.status: validated`.

## Notas / carry-forward
- **categories.json NO se tocó** (registrada en Plan 01, order 14, sin `origen`).
- **Counts en rojo hasta Phase 39** = esperado (patrón v1.6/v1.7/36/37). El `origen`/PROV-01 y la sincronización de `TOTAL_EXPECTED`/`TOTAL_EXPECTED_BASELINE` son de Phase 39.
- SC#5 / INT-04 honrados con el quórum canónico R1-R7 (Opus+Sonnet + DeepSeek de refuerzo), sin disputas pendientes.
