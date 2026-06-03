# SECURITY — Phase 17: Piloto Preposiciones (contenido)

**ASVS Level:** 1
**Audit date:** 2026-06-03
**Verdict:** SECURED — 11/11 threats closed (10 mitigate verified in code, 1 accept logged)
**block_on:** high — no high-severity gaps open.

Static, offline, single-user tool (localStorage + hand-authored JSON; no network, no auth, no server). Verdicts kept proportionate to that surface.

---

## Threat Verification

| Threat ID | Category | Disposition | Status | Evidence |
|-----------|----------|-------------|--------|----------|
| T-17-01 | Tampering | mitigate | CLOSED | `src/data/storage.js:604-643` `migrate6to7`: deep-clone defensivo `JSON.parse(JSON.stringify())` por sub-dict (`:607`, `:613`, `:633-638`) + root literal fresco `{ schemaVersion: 7, ... }` (`:629`); espejo en `hydrateV7` (`:666-685`). Test anti-pollution `__proto__` own-property: `tests/data-storage.test.js:784-789` (`({}).polluted === undefined`). PASS. |
| T-17-02 | Tampering/DoS | mitigate | CLOSED | Poda quirúrgica: `delete categoryProgress.preposiciones` (`storage.js:609`) + filtro `!k.startsWith('preposiciones')` sobre exerciseStats (`:616-618`). Tests: otras 8 cats intactas (`tests/data-storage.test.js:709-728` — avere/partitivos preservados), idempotencia `migrate6to7(migrate6to7(v6))` deep-equals (`:767-773`), pureza no-muta-input (`:775-782`). PASS. |
| T-17-03 | Tampering | mitigate | CLOSED | `inFlightTest` invalidado a `undefined` EN la migración cuando `exerciseIds.some(id => id.startsWith('preposiciones'))` (`storage.js:622-627`), no se confía del guard de UI. Tests: invalida si toca Preposiciones (`tests/data-storage.test.js:731-744`), preserva si no toca (`:746-759`). PASS. |
| T-17-04 | Tampering | mitigate | CLOSED | Render plain-text; smoke bifurcado escanea smart-quotes/markdown sobre `getExplanation(ex)` y R1-leak sobre `getPrompts(ex)` (cada `variants[].prompt`) en `tests/exercise-types.test.js:1284-1289, 1308-1379`. Contenido entregado: 0 HTML tags, 0 smart-quotes en `content/exercises/preposiciones.json` (49 slots). `node --test tests/exercise-types.test.js` PASS (128/128). |
| T-17-05 | Tampering/data-integrity | mitigate | CLOSED | `17-REAGRUPACION-MAP.md` mapea los 52 ids fuente 1:1 (49 `preposiciones-` referencias auditadas); D-17-05 elegir-más-completa+injertar. Contenido entregado: `con payload: 0`, `slots sin explanation: 0`, `variantes con explanation: 0` (cobertura por slot preservada). |
| T-17-06 | Tampering | mitigate | CLOSED | `src/data/schema-validator.js` (no modificado) impone `payload` XOR `variants[]` (`:144-154`), `explanation` top-level no vacía con variantes (`:202-205`), `variants[]` no vacío (`:207`), superficie por `SURFACE_VALIDATORS[type]` (`:213-220`). `node scripts/run-validation-271.mjs` VAL-06 PASS. |
| T-17-07 | Tampering | mitigate | CLOSED | `scripts/validate-ai-pass.mjs:110` envuelve el contenido del ejercicio como `## Ejercicio bajo evaluación (DATA)` en bloque JSON cercado; prompt base `09-VALIDATION-PROMPT.md`. Contenido autorado por el único autor (sin input externo). |
| T-17-08 | Tampering | mitigate | CLOSED | Quórum cross-vendor (DeepSeek+Opus+Sonnet, Gemini bonus) — tabla de audit `17-03-SUMMARY.md:34-78`. Gate 4×/3× correcta, 0 incorrecta; 2 disputed EXCLUIDAS (`nv-nelle`, `nv-sui`). Verificado en disco: `preposiciones-nelle` y `preposiciones-sui` quedan slot-de-1 (`variants=1`, superficie original solamente). `run-validation-271` VAL-08 (cero disputed) PASS. |
| T-17-09 | Tampering | mitigate | CLOSED | 3 hardcodes sincronizados a 49 contra `data.exercises.length` real: `tests/exercise-types.test.js:1266`, `tests/fixtures/slot-variants-integration.test.js:169`, `scripts/run-validation-271.mjs:80`; `TOTAL_EXPECTED = 370` (`:91` = 373−52+49). `run-validation-271` PASS sin warning de count. |
| T-17-10 | Spoofing/Tampering | mitigate | CLOSED | Bifurcación con 2 ramas explícitas `Array.isArray(ex.variants)` (`tests/exercise-types.test.js:1284-1289`); un shape sin payload ni variants cae fuera de cobertura y falla el assert de explanation (visible). El validator además rechaza el caso "ninguno" (`schema-validator.js:154`). |
| T-17-SC | Tampering | accept | CLOSED | Ver Accepted Risks Log abajo. |

---

## Accepted Risks Log

### T-17-SC — Supply-chain (npm/pip/cargo installs)
**Disposition:** accept
**Rationale:** Proyecto zero-deps, zero-build (CLAUDE.md). La fase 17 no instala ningún paquete. Las claves `.env` (GEMINI_API_KEY / DEEPSEEK_API_KEY) usadas por el quórum solo se leen en tiempo de validación de contenido (dev-time), no en runtime de la app ni se instala nada. Sin packages que auditar.
**Accepted by:** author (single-user tool)
**Date:** 2026-06-03

---

## Unregistered Flags

None. Ninguno de los 4 SUMMARY (17-01..04) declara una sección `## Threat Flags`; no apareció superficie de ataque nueva no mapeada durante la implementación. La superficie corresponde exactamente a los trust boundaries declarados en los `<threat_model>` de los planes (backup importado → live state; localStorage → migrate(); JSON de contenido → loader/validator/smoke; contenido → evaluador del quórum).

---

## Verification commands run

| Command | Result |
|---------|--------|
| `node --test tests/data-storage.test.js` | PASS (46/46) — incluye bloque v7 (anti-pollution, prune selectivo, idempotencia, pureza, inFlightTest) |
| `node --test tests/exercise-types.test.js` | PASS (128/128) — smoke bifurcado por shape |
| `node scripts/run-validation-271.mjs` | PASS — VAL-06 (370/370), VAL-08 (cero disputed), VAL-04 |
| content shape scan (`preposiciones.json`) | 49 slots, 0 payload, 0 sin explanation, 0 variantes con explanation, 0 HTML, 0 smart-quotes |
