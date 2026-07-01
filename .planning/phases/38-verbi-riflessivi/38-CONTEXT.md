# Phase 38: Verbi riflessivi - Context

**Gathered:** 2026-07-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Dar de alta la **última categoría nueva de examen** del milestone v1.9, nacida en slot+variantes, autorada 1-por-1 por quórum cross-vendor R1-R7, y registrada en `categories.json`:

- **`riflessivi`** (order 14): el reflexivo italiano en 5 capas —
  1. **presente reflexivo** (`mi chiamo`/`ti chiami`/`si chiama`) en todas las personas (REFLEX-01),
  2. **colocación del pronombre ANTES del verbo conjugado** (`mi sveglio`, nunca `*sveglio mi`) vía word-buttons con banco que incluye el orden-distractor (REFLEX-02),
  3. **reflexivo sobre terminaciones regulares** (`si alza`, `ci laviamo`, `vi vestite`) — enganche directo con `presente-regolare` (REFLEX-03),
  4. **passato prossimo reflexivo con `essere` + concordancia del participio -o/-a/-i/-e** (`mi sono svegliato/a`, `si sono alzati/e`) — enganche con `essere`, IN scope (REFLEX-04, el MAGNET),
  5. **2-3 desajustes reflexivos ES↔IT genuinos** (REFLEX-05, slot pequeño de alta señal).

Es la más layered de las 4 altas. Clon EXACTO del patrón v1.7 (`presente-regolare`, Phase 30) y Phases 36/37: categoría nueva nacida directamente en slot+variantes (nunca legacy payload), explanation a nivel de slot, `validation` por variante, cruces con id estable + `categoryIds` de 2. Cubre REFLEX-01..05.

**Slug contract (Phase 35, D-35-01/02 — INVIOLABLE):** el `id`/slug es **`riflessivi`** (ya en `RESET_PREFIXES_V12`, storage.js:1168, sin colisión `startsWith`): (a) `id` en `categories.json`, (b) fichero `content/exercises/riflessivi.json`, (c) prefijo de TODOS los ids de ejercicio (`riflessivi-*`) y de cruce (`riflessivi-300/-301`). NO `verbi-riflessivi` (eso es solo el nombre del directorio de la fase).

**Dentro de scope:** el archivo `content/exercises/riflessivi.json` (slots del núcleo + word-buttons + 2 cruces), y su registro en `categories.json` (append, order 14).

**Fuera de scope (HARD):**
- **Reflexivos recíprocos** (`si amano`, `ci scriviamo` "each other") — A2+/B1, semántica distinta; diferido a un milestone de pronombres.
- **Modal + clítico / clíticos como contenido** — fuera (requieren clíticos como categoría).
- `origen`/PROV-01 (Phase 39), la re-sincronización de los 3 arrays de conteo + `TOTAL_EXPECTED` + `TOTAL_EXPECTED_BASELINE` (Phase 39 lockstep).
- **NO se toca el motor v1.4** (cascada D-54 = EXACTAMENTE 2 call-sites; sampler; slot-engine; schema-validator; migración; backup).

**Nota de count-sync:** esta fase AÑADE contenido (categoría + 2 cruces); los conteos hardcoded quedarán en rojo hasta que Phase 39 los sincronice — rojo esperado (patrón v1.6/v1.7/Phase 36/37). El fail preexistente `genero-numero` 12↔13 es ajeno. El planner puede sincronizar los counts de `riflessivi` al final de Phase 38 O dejarlo a Phase 39; NO es fallo si queda rojo hasta Phase 39.

</domain>

<decisions>
## Implementation Decisions

### Cue de género/número para el pp-concordancia (D-38-01) — NOMBRES PROPIOS
- **D-38-01:** El slot de passato prossimo (REFLEX-04, el MAGNET) fija el género+número del sujeto con **nombres propios + sujetos explícitos** en cada prompt, NO con etiqueta gramatical ni gloss ES:
  - `Marco` → `-o` (`mi sono svegliato` / `Marco si è svegliato`), `Maria` → `-a` (`svegliata`), `i ragazzi` → `-i` (`si sono alzati`), `le ragazze` → `-e` (`alzate`).
  - El sujeto porta género+número de forma NATURAL → una sola terminación correcta, sin R1-leak (no se nombra la terminación ni la regla).
  - **NO usar gloss ES aquí:** el español (`me he despertado`) NO concuerda el participio con el sujeto; un gloss confundiría en vez de desambiguar. El gloss `(en español: …)` se reserva para las capas donde la reflexividad ES↔IT difiere (REFLEX-05) o donde persona/significado sea defendible.
  - **Precedente EXACTO shipeado:** `presente-regolare-301` (cruce presente-regolare↔essere) YA usa esta técnica verbatim (`Marco è partito` / `Maria è tornata` / `i ragazzi sono arrivati` / `le ragazze sono entrate`). Clonar su mecánica de cue y su disciplina de verificación (D-31-08: las 4 terminaciones -o/-a/-i/-e verificadas explícitamente).

### Pares ES↔IT mismatch (D-38-02) — TRÍO DEL RESEARCH
- **D-38-02:** El slot REFLEX-05 (pequeño, alta señal) ejerce las **3 divergencias genuinas** del research, sin fabricar trampas falsas:
  - **`ammalarsi`** (IT reflexivo) vs ES "enfermar / ponerse enfermo" (no reflexivo directo).
  - **`dimenticarsi (di)`** (IT reflexivo opcional + preposición) vs ES "olvidarse (de)".
  - **`salire`** (IT NO-reflexivo, "subir") vs ES "subirse".
  - Gloss ES `(en español: …)` OBLIGATORIO donde la reflexividad difiere (Pitfall 6/9: es el desambiguador legítimo, no leak). Verificar cada verbo italiano contra su contraparte española en el pre-commit R5.
  - Los solapamientos que SÍ coinciden (chiamarsi/llamarse, svegliarsi/despertarse, alzarsi/levantarse, arrabbiarsi/enfadarse) NO son mismatch → no van en este slot (no fabricar trampa donde no la hay).

### Mapa de slots / granularidad (D-38-03) — GUÍA + CHECKPOINT DEL AUTOR
- **D-38-03:** El mapa exacto (ids con prefijo `riflessivi-`, nº final de slots, MC vs word-buttons por slot) lo aprueba el autor en **checkpoint:decision al inicio de la autoría** (patrón v1.6/v1.7/Phase 36 D-36-01/Phase 37 D-37-02 — funcionó bien). Aquí se fija solo la **cobertura mínima** = las 5 capas REFLEX-01..05 + las 2 cruces.
- **Mapa PROPUESTO (guía, no rígido):** `riflessivi-presente` (MC, chiamarsi + personas), `riflessivi-collocazione-wb` (word-buttons, colocación del pronombre, REFLEX-02), `riflessivi-su-regolari` (MC/word-buttons, reflexivo sobre terminación regular, REFLEX-03), `riflessivi-pp-concordanza` (MC, el MAGNET, REFLEX-04), `riflessivi-mismatch` (MC, el trío ES↔IT, REFLEX-05), + `riflessivi-300`/`riflessivi-301` (cruces). El autor puede consolidar/partir dentro de la cobertura.
- **0-match (D-04, heredado):** `match` NO justificado — pronombre↔persona (`mi`↔io) es asociación mecánica = exactamente lo que D-04/R3 prohíben; la conjugación es derivable por raíz. Solo MC + word-buttons. Documentar el 0-match en `notes` (mirror de `presente-regolare`).

### Las 2 cruces multi-cat (D-38-04) — SC#4 EXIGE 2
- **D-38-04:** SC#4 exige DOS cruces (a diferencia de Phase 37 que tenía 1); ambos con id estable + `categoryIds` de 2, al final del array:
  - **`riflessivi-300`** → `categoryIds: ["riflessivi","presente-regolare"]`: el reflexivo PRESENTE construido sobre terminación regular (`mi sveglio`/`ci laviamo`) — la historia "ya sabes la terminación del -are/-ere/-ire, lo nuevo es el pronombre pre-puesto".
  - **`riflessivi-301`** → `categoryIds: ["riflessivi","essere"]`: el passato prossimo con `essere` + concordancia (`mi sono svegliato/a`) — donde `essere` cascadea. Análogo directo del shipeado `presente-regolare-301`.
- **Invariante D-54:** los cruces se autoran como slots+variantes normales reusando `applyResultToSession`; **NO añaden call-sites** de `applyImmediateFailure` (siguen EXACTAMENTE 2: `app.js:1642`, `app.js:1969`). Verificable por grep + smoke paramétrico (readdir auto-cubre los cruces).

### Magnet pp-agreement (REFLEX-04, Pitfall 6) — RONDA EXTRA DeepSeek
- Slot `riflessivi-pp-concordanza` dedicado con las **4 terminaciones -o/-a/-i/-e como variantes contrastantes**, cada prompt con cue de sujeto (D-38-01), **CERO auxiliar `avere`** (todos los reflexivos toman `essere`; `*mi ho svegliato` es distractora, nunca key), y **ronda EXTRA de quórum con pase DeepSeek obligatorio** (DeepSeek estricto en concordancia/acentos; caza el `-o` para sujeto femenino que human-verify aprueba). Modelar según MOV-01 / `essere` `stato/stata/stati/state` / `presente-regolare-301` (disciplina D-31-08: verificar las 4 terminaciones explícitamente). Verificar ANTES del quórum: no `avere` aux, no `-o` sin cue masculino.

### Canon editorial (locked por memoria del proyecto)
- Explanations en español acentuado (RAE) + apóstrofes ASCII U+0027 + plain text (sin markdown) + gloss `(en español: …)` canónico donde desambigua (persona/significado/reflexividad divergente), NO en el pp-concordanza (D-38-01). Italianismos citados literalmente (`mi sveglio`, `si è svegliata`, `ci laviamo`). Sin leak de regla/persona/terminación-objetivo en el prompt (R1). Sin smart-quotes.
- `validation.status: validated` (≥2 passes correcta, ≥2 `by` distintos) en cada variante nueva. **Caveat de validación (ver [[executor_cannot_run_task_quorum]]):** si la autoría corre vía execute-phase→gsd-executor, el quórum base canónico Opus+Sonnet (skill `gsd-validate-exercise`, que spawnea Task subagents) NO está disponible dentro del subagent → cae a Opus-inline + DeepSeek (cumple la barra estructural). Para el quórum base Opus+Sonnet, validar en top-level tras execute-phase. El pase DeepSeek en el MAGNET es obligatorio en cualquier caso.

### Claude's Discretion
- Nombres exactos de ids de slot (prefijo `riflessivi-`), nº final de slots, MC vs word-buttons por slot — aprobado por el autor en checkpoint:decision (D-38-03). Word-buttons OBLIGATORIO al menos para la colocación del pronombre (REFLEX-02).
- Estructura de plans (probable 1 track — categoría única, aunque más layered que Modali; posible ronda extra por el magnet).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### El patrón a clonar (v1.7 + Phase 36/37)
- `content/exercises/presente-regolare.json` — molde EXACTO: top-level `{notes, exercises[]}`; slots MC + word-buttons (con `answer[]`+`distractors[]`); `notes` documentando el 0-match. **`presente-regolare-301`** (líneas ~473+) = el ANÁLOGO DIRECTO del pp-concordanza: cruce presente-regolare↔essere con las 4 terminaciones -o/-a/-i/-e y cue por nombres propios (Marco/Maria/i ragazzi/le ragazze). Clonar su mecánica.
- `content/exercises/modali.json` / `content/exercises/dimostrativi.json` / `possessivi.json` — categorías gemelas recién nacidas (Phases 36/37); mismo molde, canon, shape de `validation`, cruces `-300`/`-301`.
- `content/exercises/essere.json` — la categoría con la que cascadea `riflessivi-301` (pp con essere); verificar el shape de sus slots de concordancia.
- `.planning/phases/37-verbi-modali/37-CONTEXT.md` + `37-PATTERNS.md` — el precedente inmediato (mismo milestone, mismo patrón); D-37-01 (cruce), D-37-02 (checkpoint slot-map), scope-gate, canon.

### Contrato de slugs (Phase 35 — INVIOLABLE)
- `.planning/phases/35-migraci-n-11-12-*/35-CONTEXT.md` — D-35-01/02/03: el slug es **`riflessivi`** (ya en `RESET_PREFIXES_V12`, storage.js:1168; sin colisión). Phase 38 DEBE usarlo exactamente.

### Requisitos
- `.planning/REQUIREMENTS.md` — REFLEX-01..05 (líneas 38-42); línea 131 (Phase 38 = la más layered, REFLEX-04 IN scope → 1 magnet, ronda extra); INT-03/INT-04 (cruces + quórum con rondas extra en magnets, para el cierre).

### Investigación del milestone (LEER antes de autorar)
- `.planning/research/FEATURES.md` — inventario de slots VERBI RIFLESSIVI (líneas 33-35 presente + colocación + reflexivo-sobre-regular; 48 pp con essere+agreement; 49/51 ES↔IT mismatch con los pares concretos; 96 "builds on presente-regolare"; 108/119 **match NOT justified** → MC + word-buttons; 136 REFLEX-04 IN scope).
- `.planning/research/PITFALLS.md` — **Pitfall 6** (líneas 115-134, el MAGNET): pp essere-agreement (4-way -o/-a/-i/-e, cue de sujeto, no `avere`; modelar según MOV-01/essere/pr-301 D-31-08) + ES↔IT mismatch (verificar cada verbo vs español). Pitfall 8 (R1 leak), 9 (gloss ES R7 mantener), 10 (acentos = bug real). Línea 344/362/388 (no saltar DeepSeek en el slot reflexivo). Línea 248 (cruces content-only, D-54).
- `.planning/research/ARCHITECTURE.md` — Pattern 1 (alta = clon v1.7), Pattern 3 (append order 14; `order` documental, el array define el display), Pattern 5 (cruces multi-cat, D-54 en 2 call-sites). §Count Sync (touch-points para Phase 39).

### Infra de quórum
- Skill `gsd-validate-exercise` (Opus + Sonnet, C1-C5, NUNCA batched, 1 subagent fresh por ejercicio) — la vía canónica, **pero no disponible dentro del executor** (ver `[[executor_cannot_run_task_quorum]]`; validar en top-level para el quórum base).
- `scripts/validate-ai-pass.mjs` (Gemini/DeepSeek, auto-fallback 429, `--write`) — refuerzo cross-vendor; claves en `.env`. Pase DeepSeek OBLIGATORIO en el magnet pp-concordanza.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`presente-regolare-301`**: copiar VERBATIM la mecánica del slot de concordancia (4 terminaciones -o/-a/-i/-e como variantes, cue por nombres propios, distractora de auxiliar `avere`) para `riflessivi-pp-concordanza` y para el cruce `riflessivi-301`.
- **`content/exercises/presente-regolare.json`**: molde de estructura (notes+exercises, MC + word-buttons con answer[]/distractors[], cruces -300+, notes documentando 0-match).
- **`content/categories.json`**: hoy 13 entradas (order 1-13, `modali` order 13 es la última tras Phase 37). APPEND 1 entrada `riflessivi` order 14. `order` documental; el array define el display. NO `origen` (Phase 39).

### Established Patterns
- **Nace en slot+variantes (≥2 por slot rule-rich), NUNCA legacy payload** (Anti-Pattern 4; v1.7/Phase 36/37).
- **DESIGN RULE (D-04):** `match` solo si el pareo NO es derivable/mecánico. Aquí pronombre↔persona ES mecánico → 0-match, solo MC + word-buttons (D-38-03).
- **Cruces multi-cat** con id estable (`riflessivi-300`/`-301`) + `categoryIds` de 2, reusando `applyResultToSession` — 0 nuevos call-sites de `applyImmediateFailure` (D-54 = 2, `app.js:1642`/`app.js:1969`).
- **Canon editorial** + **quórum cross-vendor con ronda extra DeepSeek en el magnet** (Pitfall 6).

### Integration Points
- `content-loader.js loadContent()`: fetch de `content/exercises/riflessivi.json` + NFC + `validateContent` (permisivo) + `slotById` via `normalizeExerciseToSlot`. Se carga genéricamente en boot.
- `app.js categoriesForDisplay`: itera `content.categories` en orden de array → la fila `riflessivi` aparece en home/picker/Repaso/Examen sin código nuevo (SC#5).
- Motor: NO se toca. Sampler, cascada, promociones, racha, migración, backup — intactos.

</code_context>

<specifics>
## Specific Ideas

- **Cue por nombres propios** en el pp-concordanza: Marco/Maria/i ragazzi/le ragazze (mirror de `presente-regolare-301`), NUNCA etiqueta `(femenino)` ni gloss ES (el español no concuerda el participio). Cada una de las 4 terminaciones -o/-a/-i/-e con su cue.
- **CERO `avere`** en cualquier variante reflexiva del pp; `*mi ho svegliato` es distractora obligatoria, jamás key. Grep-verificable.
- **Trío ES↔IT:** ammalarsi / dimenticarsi (di) / salire — con gloss ES donde la reflexividad difiere. No fabricar mismatch con verbos que sí coinciden (chiamarsi/svegliarsi/alzarsi/arrabbiarsi).
- **word-buttons de colocación** (REFLEX-02): banco con el orden-distractor `*sveglio mi` para forzar `mi sveglio` (pronombre ANTES del verbo conjugado).
- **2 cruces** (SC#4): `riflessivi-300` (↔presente-regolare, presente) y `riflessivi-301` (↔essere, pp concordancia). Al final del array.

</specifics>

<deferred>
## Deferred Ideas

- **Reflexivos recíprocos** (`si amano`, `ci scriviamo` "each other") — A2+/B1, semántica distinta; backlog de un milestone de pronombres.
- **Clíticos como contenido / modal+clítico** — fuera de v1.9 (requieren clíticos como categoría).
- **Sincronización de counts + `TOTAL_EXPECTED` + `TOTAL_EXPECTED_BASELINE`** — Phase 39 (lockstep de cierre). Aceptable sincronizar los counts de `riflessivi` al final de Phase 38, pero el sync completo del milestone vive en Phase 39.
- **PROV-01 `origen: "ia-quorum"`** en la entrada de `categories.json` de `riflessivi` — Phase 39. El registro base (id/name/order 14) es de Phase 38.
- **Re-validación con el quórum base Opus+Sonnet** — si la autoría corre vía executor (sin Task subagents), estampar el pase Sonnet canónico requiere una pasada top-level posterior (ver `[[executor_cannot_run_task_quorum]]`).

### Reviewed Todos (not folded)
- **"Responsive móvil — gutters del figure (Home) + tamaño del prompt en ejercicios"** (`area: ui`, score 0.9) — MISMO falso positivo que en Phases 35/36/37: el matcher puntúa alto por solapamiento de palabras genéricas (home/prompt/status/phase), pero es trabajo de CSS responsive móvil, ajeno a una fase de autoría de CONTENIDO JSON. Pertenece al backlog "responsive móvil", no a v1.9. No plegado.

</deferred>

---

*Phase: 38-Verbi riflessivi*
*Context gathered: 2026-07-01*
