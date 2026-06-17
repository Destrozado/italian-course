# Phase 31: Cruces multi-cat + integración lockstep (cierre v1.7) - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase **cierra v1.7** enganchando `presente-regolare` al motor de re-verificación y dejándola integrada en lockstep. Tres entregables (PRES-07, INT-01, INT-02):

1. **Cruces multi-cat `presente-regolare`↔avere/essere** (PRES-07): ejercicios con `categoryIds[]` de 2 categorías que contrastan **presente vs passato prossimo**, donde avere/essere dejan de ser verbos principales y pasan a ser auxiliares. Cascada D-54 inmediata: fallar uno resetea las categorías cruzadas (patrón avere-300..305).
2. **Re-sincronización de counts hardcoded + `TOTAL_EXPECTED`** (INT-01): leídos del nº REAL de slots del JSON final, NO estimación.
3. **+1 entrada en el smoke paramétrico** (INT-02): `CATEGORIES_WITH_EXPLANATIONS` + validación de contenido cubriendo `presente-regolare`; suite verde completa incl. `VAL_07_STRICT=1`; reporter VAL-06 cuenta la categoría nueva (todas las variantes `validated`, 0 disputed sin resolver).

**Brownfield puro:** el motor v1.4 NO se toca. La cascada D-54 sigue con **exactamente 2 call-sites** de `applyImmediateFailure` (verificable por grep). Análogo de referencia: v1.2 (alta Articoli/Partitivi, cruces) + el patrón avere-300..305.

**FUERA de scope:** convertir/tocar los 8 slots base de `presente-regolare` (son DEFINITIVOS de Phase 30); passato prossimo como categoría dedicada (diferido PASSPROX-01); verbos irregulares en presente (categoría aparte, out-of-scope explícito de v1.7); tocar el motor de cascada/sampler/render.

</domain>

<decisions>
## Implementation Decisions

### A — Diseño pedagógico del cruce (qué evalúa)
- **D-31-01:** Cada cruce contrasta **presente vs passato prossimo** con avere/essere como auxiliares — es el corazón del cruce con DOS categorías auxiliares. **Mezcla deliberada de ambas direcciones**:
  - Unos objetos PIDEN la forma compuesta de passato prossimo (auxiliar + participio): `Ieri io ___ con Maria` → `ho parlato`; `Ieri Marco ___ presto` → `è partito`. Evalúa elección de auxiliar correcto + participio.
  - Otros PIDEN el presente regular, con el passato prossimo YA ESCRITO en el prompt como contraste temporal: `Ieri ho parlato spagnolo, ma di solito io ___ italiano` → `parlo`. El passato solo se EXPONE, no se produce.
  - Cubrir las dos direcciones del contraste temporal es deliberado (más munición pedagógica). Acepta la mayor carga de diseño/quórum que implica.

### B — Reparto avere vs essere + participios + verbos
- **D-31-02:** **Ambos auxiliares representados** (avere Y essere), usando **ÚNICAMENTE verbos con participio REGULAR** (`-ato`/`-uto`/`-ito`):
  - avere: parlato, temuto, dormito… (la inmensa mayoría de regulares).
  - essere: partito, arrivato, tornato… (subconjunto regular intransitivo/movimiento que toma essere).
  - **PROHIBIDO**: participios irregulares (preso/fatto/detto/messo) y auxiliares irregulares (andare/venire). Mantiene el cruce dentro del territorio A1 regular — coherente con el alcance de `presente-regolare` y con R6 (una sola dificultad por ejercicio).
- **D-31-03:** Los verbos concretos por cruce los elige el planner/autor de entre verbos A1 de alta frecuencia con participio regular, respetando R6 y el balance avere/essere.

### C — Ubicación + forma de variante + conteo (consecuencias para INT-01)
- **D-31-04:** **Los objetos de cruce viven en `content/exercises/presente-regolare.json`** (la categoría nueva es el hub, análogo fiel a avere-300..305 donde el hub recién añadido aloja sus cruces). Cada cruce lleva `categoryIds: ["presente-regolare","avere"]` o `["presente-regolare","essere"]`. **Sube SOLO el count de `presente-regolare`** (8 → 8+M); avere(20)/essere(26) quedan intactos. INT-01 toca UNA sola entrada nueva del smoke.
- **D-31-05:** **Forma slot+variantes** (NO single-variant pese al precedente avere-300..305): cada objeto de cruce es un slot con **≥2 variantes intercambiables** (verbo fresco al re-presentar) — coherente con D-30-01 (anti-memorización: re-hacer la categoría NO debe repetir la misma frase) y con que la categoría nació en formato slot+variantes. **~4 objetos de cruce (M≈4, ≈8 variantes)** cubriendo la matriz:
  1. compuesto · avere (p.ej. `io ___` → `ho parlato`)
  2. compuesto · essere (p.ej. `lui ___` → `è partito`)
  3. presente-con-contraste · contexto avere
  4. presente-con-contraste · contexto essere
- **D-31-06 (contrato de conteo INT-01):** Tras añadir los cruces, `exercises.length` de `presente-regolare.json` pasa de 8 a **8+M (≈12)**. INT-01 sincroniza:
  - `TOTAL_EXPECTED` en `scripts/run-validation-271.mjs`: `183 → 183 + (8+M)` (≈195).
  - Los 3 hardcodes de count (`tests/exercise-types.test.js`, `tests/fixtures/slot-variants-integration.test.js`, `scripts/run-validation-271.mjs`) — todos **leídos del nº REAL de slots del JSON** (`presente-regolare.json` expected = 8+M dinámico), **nunca hardcodear un número mágico**. El N real lo determina el JSON final de esta fase, no una estimación.

### D — Validación por quórum de los cruces nuevos
- **D-31-07:** Los cruces nuevos pasan el **quórum completo R1-R7** idéntico a los slots base: skill `gsd-validate-exercise` 1-por-1 (un subagent fresh-context por ejercicio, NUNCA batched, VAL-03), base de aprobación **Claude Opus + Sonnet**, `disputed` → autor-oráculo con audit trail (calidad > tokens, SIN override-atajo). Cierra con `VAL_07_STRICT=1` y 0 disputed sin resolver; reporter VAL-06 cuenta la categoría.
- **D-31-08:** Los criterios de validación verifican **EXPLÍCITAMENTE** dos correcciones nuevas que introduce el passato prossimo: (a) **concordancia participio↔sujeto con essere** en género/número (`è partito`/`è partita`/`sono partiti`/`sono partite`); (b) **elección correcta de auxiliar** (avere vs essere) para el verbo. El scan de acentos del canon español (DeepSeek estricto, Opus indulgente — memoria `feedback-cross-vendor-catches-bugs`) también aplica a explanations/glosses.

### Claude's Discretion
- Esquema exacto de `id` de los objetos de cruce (convención sugerida `presente-regolare-300..`, espejo del bloque numérico de avere-300..305) y orden dentro del JSON.
- `type` por objeto de cruce (multi-choice por defecto, espejo de avere-300..305; word-buttons solo si aporta y no rompe el patrón D-30-07).
- Verbos concretos por cruce (de entre A1 de alta frecuencia con participio regular) y nº exacto de variantes por slot por encima de ≥2.
- Texto pedagógico exacto de cada `explanation` (R1-R7, canon español acentuado plain-text).
- Cómo leer el N real del JSON en los 3 hardcodes (require/parse) sin tocar el motor.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Patrón de cruce multi-cat (análogo directo — espejar, NO reinventar)
- `content/exercises/avere.json` — objetos `avere-300..305`: `categoryIds[]` de 2 categorías, `id` estable en bloque numérico, `validation.passes[]` por quórum. Patrón EXACTO a replicar (salvo que aquí los cruces son slot+variantes, D-31-05, y viven en el hub `presente-regolare.json`).
- `content/exercises/essere.json` — la otra categoría auxiliar cruzada; referencia del presente de essere (sono/sei/è) que pasa a auxiliar en passato prossimo.
- `content/exercises/presente-regolare.json` — DONDE viven los cruces (D-31-04); 8 slots base DEFINITIVOS de Phase 30 (NO tocar), se le AÑADEN los ~4 objetos de cruce.

### Integración lockstep (los 3 hardcodes + TOTAL_EXPECTED — INT-01)
- `scripts/run-validation-271.mjs` — `TOTAL_EXPECTED = 183` (línea ~170) + comentario-historial del total + reporter VAL-06 (`totalValidated === TOTAL_EXPECTED`). Sube a `183 + (8+M)`.
- `tests/exercise-types.test.js` — array `CATEGORIES_WITH_EXPLANATIONS` (línea ~1265): 9 entradas `{ file, expected }`, **falta `presente-regolare`** → INT-02 añade la 10ª `{ file: 'content/exercises/presente-regolare.json', expected: 8+M }`. El loop valida count + explanation + ASCII/no-markdown.
- `tests/fixtures/slot-variants-integration.test.js` — 3er hardcode de count a sincronizar.

### Cascada D-54 (PRES-07 — motor NO se toca, solo verificar)
- `applyImmediateFailure` — **exactamente 2 call-sites** (verificable por grep); la cascada inmediata resetea las categorías cruzadas al fallar un cruce. La fase NO añade ni modifica call-sites — solo aporta el contenido cruzado que los dispara.

### Reglas de autoría y validación (OBLIGATORIAS antes de autorar cruces)
- **Memoria del agente `exercise-authoring-rules` (R1-R7)** — vive en memoria, NO es fichero del repo; aplicarla íntegra (R7 gloss ES "(en español: …)" canon).
- `.claude/skills/gsd-validate-exercise/SKILL.md` — skill de validación 1-por-1 con quórum (Opus+Sonnet → C1-C5); NUNCA batched (VAL-03); actualiza `validation.passes[]`.
- `scripts/validate-ai-pass.mjs` — validador multi-vendor cross-vendor (Gemini/DeepSeek, fallback 429, `--write`); claves en `.env`; pool elegible por verificación.
- `src/data/schema-validator.js` — el validador de shape que los objetos de cruce nuevos deben satisfacer.

### Requisitos y roadmap
- `.planning/REQUIREMENTS.md` — PRES-07 + INT-01 + INT-02 + tabla de mapeo Phase 31.
- `.planning/ROADMAP.md` §Phase 31 — goal + 3 success criteria (cruces+cascada / counts+TOTAL_EXPECTED / smoke+VAL_07_STRICT).
- `.planning/phases/30-…/30-CONTEXT.md` — D-30-01 (anti-memorización verbo+persona), D-30-02 (contrato de conteo `183 + exercises.length REAL`, nunca hardcodear), estructura final de los 8 slots base.
- `.planning/phases/29-…/29-CONTEXT.md` — migración v11 / state donde nace la categoría.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`avere-300..305` (en avere.json)**: shape exacto del cruce — `id`, `type: multiple-choice`, `categoryIds[]` de 2, `explanation`, `variants[]`, `validation.passes[]` por quórum. Aquí: mismo shape pero `variants[]` con ≥2 (slot+variantes, D-31-05) y alojados en `presente-regolare.json`.
- **`CATEGORIES_WITH_EXPLANATIONS` (tests/exercise-types.test.js:1265)**: array de 9 `{file, expected}`; el loop valida count + explanation válida + invariantes de contenido. Añadir la 10ª entrada = el alta del smoke (INT-02).
- **`TOTAL_EXPECTED` (run-validation-271.mjs:170)**: única constante a re-sincronizar en el reporter VAL-06.

### Established Patterns
- **Slot = regla, variantes intercambiables (CONV-01)** + D-30-01: el sampler por slot elige variante fresca al re-presentar → los cruces slot+variantes obligan a aplicar el contraste presente/passato a léxico fresco (no memorizar la frase).
- **Cruce multi-cat + cascada D-54**: `categoryIds[]` de 2 → fallar el cruce propaga reset a AMBAS categorías; la cascada inmediata sigue con 2 call-sites de `applyImmediateFailure` (motor intacto, grep-verificable).
- **Quórum 1-por-1 NUNCA batched (VAL-03)**; `disputed`→autor-oráculo (memoria `feedback-disputed-resolution`); cross-vendor caza bugs (memoria `feedback-cross-vendor-catches-bugs`); gloss ES canon R7 (memoria `gloss-es-desambiguacion-canon`); explanations acentuadas (memoria `explanations-must-be-accented`).
- **Test runner**: `node --test tests/*.test.js` (path desnudo falla en Node 22.20 — memoria `test-command-node-glob`).

### Integration Points
- Los counts deben leerse del **JSON real** (`presente-regolare.json` final con cruces), no de un número estimado — el contrato de conteo de D-30-02/D-31-06 es dinámico.
- El reset preventivo de `presente-regolare` ya está en `migrate10to11`/`hydrateV11` (Phase 29); la cascada de los cruces opera sobre el state v11.

</code_context>

<specifics>
## Specific Ideas

El autor mantiene su prioridad anti-memorización también en los cruces: aunque el precedente avere-300..305 es single-variant, los cruces de presente-regolare son **slot+variantes** para que re-hacer la categoría tras un fallo nunca repita la misma frase (D-30-01 aplicado al cruce). El contraste presente↔passato prossimo se introduce en AMBAS direcciones (pedir la forma compuesta y pedir el presente con el passato de contraste) deliberadamente, asumiendo más carga de diseño/quórum a cambio de munición pedagógica. La concordancia del participio con essere (`è partita`/`sono partiti`) es el riesgo de corrección NUEVO del milestone y recibe chequeo explícito en el quórum — no se delega a que Opus/Sonnet lo cacen sin instrucción.

</specifics>

<deferred>
## Deferred Ideas

- **Passato prossimo como categoría dedicada (PASSPROX-01)**: los cruces de esta fase EXPONEN/usan el passato prossimo regular como contraste, pero la categoría completa (elección de auxiliar + participio como tema propio, incluyendo irregulares) es backlog de un milestone futuro. Los cruces se limitan a participios regulares (D-31-02) para no invadir ese alcance.
- **Cruces con participio irregular (ho fatto / ho preso)**: considerado y descartado en discusión (D-31-02) a favor de mantener el cruce en territorio A1 regular. Reconsiderar cuando exista la categoría passato prossimo dedicada.
- **Cruces single-variant tipo avere-300..305**: descartado a favor de slot+variantes (D-31-05) por coherencia anti-memorización. Anotado por si en review se ve que la carga de quórum de ≈8 variantes no compensa.

</deferred>

---

*Phase: 31-cruces-multi-cat-integraci-n-lockstep-cierre-v1-7*
*Context gathered: 2026-06-17*
