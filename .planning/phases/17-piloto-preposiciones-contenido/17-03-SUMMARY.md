---
phase: 17-piloto-preposiciones-contenido
plan: 03
status: complete
completed: 2026-06-03
requirements: [PILOT-02, PILOT-03]
---

# Plan 17-03 — Variantes nuevas con quórum cross-vendor + slots locativos

## Resultado

Se autoraron **43 variantes nuevas** (patrón D-85) y se sometieron al **quórum cross-vendor R1-R7**. **41 pasaron e integradas**; **2 rechazadas (disputed)** por bugs reales que el quórum cazó. Se crearon los **2 slots locativos nuevos** (PILOT-03). Preposiciones pasa de 47 → **49 slots**.

- **PILOT-03 ✓:** slot `preposiciones-in-locativo` (3 variantes: `in spiaggia` / `in montagna` / `in campagna`) + slot `preposiciones-al-mare` (slot-de-1: `al mare`). Hueco locativo que antes no estaba en ninguna categoría.
- **PILOT-02 ✓:** 37 variantes nuevas integradas en slots existentes (1 por slot cuya regla admite reformulación) + las 4 locativas = 41. Alcance conservador (D-17-06): excepciones idiomáticas y slots ya fusionados no se inflaron.
- Validador: `node scripts/validate-content-fixture.mjs preposiciones …` → **exit 0, 49 ejercicios**. `con payload: 0`. Cero slots sin explanation.

## Quórum cross-vendor (3-vendor: DeepSeek + Opus + Sonnet)

Gemini se rate-limiteó (ventana estrecha del free tier), así que el gate efectivo fue **DeepSeek + Opus + Sonnet** (exactamente el combo que la memoria del proyecto registra como cazador de bugs; Gemini quedó como pase bonus donde respondió). Las 86 validaciones Claude (Opus+Sonnet, 1-por-1 aislado VAL-03) se corrieron vía workflow paralelo.

**El quórum cazó 6 bugs reales que un human-verify habría aprobado:**
- **R7 doble-validez (4, reformuladas y re-validadas OK):** `nv-con-compagnia` (per=beneficio), `nv-negli` (sugli=encima), `nv-sulla` (alla=junto a), `nv-sugli` (negli=dentro) — DeepSeek las marcó; se apretó el contexto italiano y repasaron limpias.
- **R7 doble-validez (1, RECHAZADA):** `nv-nelle` ("I biscotti sono ___ scatole") — Opus+Sonnet `incorrecta`: `sulle scatole` (encima) también válido. Excluida → slot `preposiciones-nelle` queda slot-de-1.
- **C4 explanation-mismatch (1, RECHAZADA):** `nv-sui` ("I piatti sono ___ tavoli") — Opus+Sonnet `incorrecta`: la explanation del slot `sui` describe superficies verticales (muros), no mesas horizontales. Excluida → `preposiciones-sui` queda slot-de-1.

**Ruido descartado (verificado falso):** falso-positivo de acento `fusióna` que Gemini/DeepSeek alucinaron en `nv-del`/`nv-degli` (el JSON dice `fusiona`, sin tilde) — Opus+Sonnet las dieron correcta; integradas.

**Decisión de política (autor):** el gloss `(en español: ...)` que Gemini/DeepSeek marcan como C5-leak es canon de desambiguación R7 (ya validado en Phase 10). Las 3 variantes con gloss puro (`nv-per-durata`, `nv-da-agente`, `nv-nel`) se aprobaron sobre la base Opus+Sonnet `correcta`. Ver memoria `gloss_es_desambiguacion_canon`.

### Audit por variante (C=correcta, I=incorrecta, -=sin pase; 🅖=gloss policy-pass)

| Variante | DeepSeek | Gemini | Opus | Sonnet | Estado |
|---|---|---|---|---|---|
| nv-di-origen | C | C | C | C | INTEGRADA |
| nv-da-provenienza | C | C | C | C | INTEGRADA |
| nv-in-paese | C | C | C | C | INTEGRADA |
| nv-con-compagnia | C | C | C | C | INTEGRADA |
| nv-per-scopo | C | C | C | C | INTEGRADA |
| nv-per-durata 🅖 | I | I | C | C | INTEGRADA |
| nv-a-ciudad | C | C | C | C | INTEGRADA |
| nv-a-hora | C | C | C | C | INTEGRADA |
| nv-da-agente 🅖 | C | I | C | C | INTEGRADA |
| nv-in-trasporto | C | - | C | C | INTEGRADA |
| nv-con-strumento | C | C | C | C | INTEGRADA |
| nv-del | C | - | C | C | INTEGRADA |
| nv-dello | C | C | C | C | INTEGRADA |
| nv-della | C | - | C | C | INTEGRADA |
| nv-dei | C | - | C | C | INTEGRADA |
| nv-degli | C | C | C | C | INTEGRADA |
| nv-delle | C | - | C | C | INTEGRADA |
| nv-allo | C | C | C | C | INTEGRADA |
| nv-alla | C | - | C | C | INTEGRADA |
| nv-ai | C | - | C | C | INTEGRADA |
| nv-agli | C | - | C | C | INTEGRADA |
| nv-alle | C | - | C | C | INTEGRADA |
| nv-nel 🅖 | I | I | C | C | INTEGRADA |
| nv-nello | C | - | C | C | INTEGRADA |
| nv-nella | C | - | C | C | INTEGRADA |
| nv-nei | C | - | C | C | INTEGRADA |
| nv-negli | C | - | C | C | INTEGRADA |
| nv-nelle | C | C | I | I | EXCLUIDA (disputed) |
| nv-dal | C | - | C | C | INTEGRADA |
| nv-dallo | C | - | C | C | INTEGRADA |
| nv-dalla | C | - | C | C | INTEGRADA |
| nv-dai | C | C | C | C | INTEGRADA |
| nv-dagli | C | - | C | C | INTEGRADA |
| nv-dalle | C | - | C | C | INTEGRADA |
| nv-sullo | C | - | C | C | INTEGRADA |
| nv-sulla | C | - | C | C | INTEGRADA |
| nv-sui | C | - | I | I | EXCLUIDA (disputed) |
| nv-sugli | C | - | C | C | INTEGRADA |
| nv-sulle | C | - | C | C | INTEGRADA |
| nv-in-spiaggia | C | - | C | C | INTEGRADA |
| nv-in-montagna | C | - | C | C | INTEGRADA |
| nv-in-campagna | C | - | C | C | INTEGRADA |
| nv-al-mare | C | - | C | C | INTEGRADA |

## Desviaciones

- **Gemini rate-limit:** gate ejecutado como 3-vendor (DeepSeek+Opus+Sonnet) en vez de 4-vendor; Gemini bonus donde respondió (13/43). Decisión del autor ("terminar usando deepseek"). Sigue siendo cross-vendor (2 organizaciones: DeepSeek + Anthropic).
- **Commit granularity:** integración en 1 commit (no 1-por-variante) porque el quórum corrió como workflow batch de 86 agentes; el audit per-variante queda en este SUMMARY.
- **2 variantes rechazadas:** `nv-nelle`, `nv-sui` quedan slot-de-1 (sus slots conservan su superficie original validada). PILOT-02 conservador no exige variante en todo slot.

## Pendiente para 17-04

Los 3 hardcodes `expected: 52` siguen rojos a propósito (1 test falla: `exercise-types.test.js` "explanation coverage" espera 52, hay 49). El conteo final real es **49 slots** — 17-04 lo sincroniza + bifurca el smoke por shape.

## Self-Check: PASSED
- Validador verde (49 ejercicios, 0 payload, 0 sin explanation)
- 2 slots locativos creados (PILOT-03)
- 41 variantes nuevas integradas tras quórum cross-vendor (PILOT-02)
- Superficies existentes de 17-02 NO re-validadas (solo las 43 nuevas pasaron quórum)
