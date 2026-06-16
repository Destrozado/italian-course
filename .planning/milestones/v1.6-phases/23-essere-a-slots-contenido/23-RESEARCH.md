# Phase 23: Essere a slots (contenido) - Research

**Researched:** 2026-06-06
**Domain:** Conversión de contenido JSON legacy `payload` → modelo `slot+variantes` (réplica exacta de Phase 22 / Avere)
**Confidence:** HIGH (precedente Phase 22 completo y verificado; toda la infraestructura inspeccionada en disco)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Granularidad de slots (identidad / estado / cópula):**
- **D-23-01:** Agrupar por regla, pocos slots — identidad (nombre/profesión/nacionalidad/parentesco), estado (stanca/felice/tristi) y cópula/clasificación (Roma è una città) se reagrupan en slots por regla gramatical, no se parten por campo semántico fino. Filosofía: agrupar lo fácil. (Espíritu paralelo a Avere D-19-01.)
- **D-23-02:** El presente indicativo sigue el precedente de Avere — 1 slot por persona/forma (sono/sei/è/siamo/siete/sono), porque cada forma es una trampa de conjugación distinta para el hispanohablante.

**Passato prossimo — participio (concordancia):**
- **D-23-03:** Los ejercicios essere-026..029 (stato/stata/stati/state) se modelan como slots separados por forma de concordancia (masc sing / fem sing / masc pl / fem pl), NO como un único slot con 4 variantes. Razón: la concordancia del participio con el sujeto es la regla distintiva de Essere frente a Avere y el punto difícil para el hispanohablante → el loop debe obligar a acertar cada forma por separado (drilling explícito). Filosofía: drillear lo difícil.
- La `explanation` de estos slots enfatiza la regla de concordancia (el participio de essere concuerda en género/número con el sujeto).

**Variantes nuevas (D-85 + quórum):**
- **D-23-04:** Ambición generosa — autorar variantes nuevas abundantes por quórum cross-vendor R1-R7, sobre todo en los huecos pedagógicos de Essere (concordancia de nacionalidad italiano/italiana, localización con essere, ser-vs-estar). No es una conversión mínima de solo-reagrupar.
- **D-23-05:** Sin cuota fija de densidad — el `23-REAGRUPACION-MAP.md` propone variantes donde la regla lo pida y el autor aprueba en checkpoint. No se fuerza un mínimo por slot.

**Contraste essere / avere:**
- **D-23-06:** Reforzar agresivamente el contraste essere/avere. Distractoras avere (ho/hai/ha…) en los slots donde tenga sentido + explicaciones que avisan del calco español: edad con avere (ho trent'anni), no essere; ser/estar → essere; posesión (avere) vs identidad/estado/localización (essere).

**Hueco ser/estar:**
- **D-23-07:** Crear un slot nuevo dedicado a ser-vs-estar (el hueco pedagógico más grande de Essere): variantes que contrastan los dos usos (p.ej. "Maria è stanca" [estado/estar] vs "Maria è medico" [identidad/ser]) con `explanation` explícita del calco. Se re-verifica como tema propio en el loop.

**Precedente LOCKED de Phase 22 (no se re-discute — aplica idéntico):**
- **D-23-08 (shape):** Sin `payload`; todo el contenido a `variants[]` (shallow). `explanation` siempre top-level, una por slot. MC = `{prompt, options[], correctIndex}`; word-buttons = `{prompt, answer[], distractors[]}`.
- **D-23-09 (ids):** Ids semánticos (`essere-sono`, `essere-passato-prossimo-stato`, `essere-ser-estar`…). Excepción cross-cat: `essere-300..305` conservan id legacy + sus `categoryIds[]` (cascada D-54) — sin renumerar, porque `clearedExerciseIds` de las otras categorías depende de esos ids.
- **D-23-10 (merge de explanations, D-17-05):** Al fusionar slots, elegir la explanation más completa + injertar los matices únicos de las descartadas.
- **D-23-11 (validación heredada):** Mover superficies intactas a `variants[]` NO requiere re-validar (cosmético). Los `validation.passes[]` (incluidas resoluciones disputed con override del autor) se mueven verbatim. Solo las variantes nuevas pasan quórum.
- **D-23-12 (word-buttons):** Los 4 word-buttons de Essere (essere-100..103) = slots-de-1, sin forzar variantes (D-19-03). Essere no tiene match en el set legacy (no se inventa).
- **D-23-13 (base de aprobación quórum):** Pase de aprobación canónico = Claude Opus 4.8 + Sonnet 4.6 (ambas `correcta`); quórum multi-vendor (Gemini/DeepSeek vía `scripts/validate-ai-pass.mjs`) como refuerzo. El C5-leak sobre el gloss ES "(en español: …)" es falso-positivo de política (canon R7 del autor) — mantener.

### Claude's Discretion
- La asignación exacta ejercicio→slot de los grupos identidad/estado/cópula (cuántos slots resultan) se resuelve en `23-REAGRUPACION-MAP.md` con checkpoint del autor, dentro de la guía D-23-01.
- El número final de slots. Predicción rough Essere: ~19-24 slots. Se fija en el mapa antes del rewrite para planear el sync de counts.
- Redacción concreta de prompts/options/explanations de variantes nuevas (sujeto a quórum).

### Deferred Ideas (OUT OF SCOPE)
- None — la discusión se mantuvo dentro del scope. Las otras 5 conversiones ya están como fases 24-27; el bloque Canciones y los tiempos verbales futuros (TENSE-X1..X4) siguen en backlog v1.6 boundary.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ESS-01 | Los 39 ejercicios de Essere se reagrupan en slots por regla con explanation a nivel de slot; la estructura final pasa el validator y el smoke paramétrico con los counts re-sincronizados al nº real de slots. | Reagrupación propuesta abajo (~21 slots); validator `scripts/validate-content-fixture.mjs`; 3 count-sites + TOTAL_EXPECTED identificados con line numbers exactos; smoke ya shape-agnostic (no hay que tocar lógica). |
| ESS-02 | Se autoran variantes nuevas (D-85 + quórum cross-vendor R1-R7) donde la regla admite reformulación; cada variante pasa el quórum antes de entrar; huecos → slots nuevos. | Huecos pedagógicos identificados (nacionalidad concordancia, localización, ser/estar slot nuevo D-23-07); pipeline de quórum `validate-ai-pass.mjs` + skill `gsd-validate-exercise` confirmado; D-23-13 base de aprobación. |
</phase_requirements>

## Summary

Phase 23 es una réplica casi exacta de Phase 22 (Avere → slots), que está **completa y verificada** (8/8 must-haves, suite 374/374, reporter 320/320). Toda la metodología, el shape target, el pipeline de quórum y los sitios de count-sync ya existen y están probados. El trabajo de esta fase es **instanciar** ese patrón para el contenido específico de Essere — NO re-decidir metodología (locked en CONTEXT.md).

La fuente `content/exercises/essere.json` tiene **39 ejercicios**: 25 multiple-choice (essere-001..029, con saltos), 4 word-buttons (essere-100..103) y 6 cruces multi-cat (essere-300..305). El shape target es `content/exercises/avere.json` (ya convertido, 20 slots): cada slot = `{id, type, categoryIds, explanation (top-level), variants[] (shallow, sin explanation/validation propias), validation (top-level)}`.

**Tres diferencias clave frente a Avere** que el planner debe tratar con cuidado:
1. **NO existe snapshot/assert para Essere.** Los scripts `snapshot-avere-prefix.mjs` / `assert-avere-prefix-unchanged.mjs` / `.avere-prefix-snapshot.json` están **hardcodeados a `avere.json`** y no leen essere.json en absoluto. Essere **no tiene** análogo y **no requiere re-base** — esa columna de Phase 22 desaparece en Phase 23. (Confirmado en disco.) Ver Open Q #3 / Runtime State Inventory.
2. **El participio passato se parte en 4 slots separados** (D-23-03), al revés de Avere donde el passato fue 1 slot con N variantes. Esto sube el count.
3. **Mismatch de model IDs:** D-23-13 pide aprobación con **Opus 4.8 + Sonnet 4.6**, pero el skill `gsd-validate-exercise` y todo el contenido existente usan literalmente `claude-opus-4-7` / `claude-sonnet-4-6`. Ver Open Q #1 (decisión del planner/autor).

**Primary recommendation:** Replicar la estructura de 3 planes de Phase 22 (22-01 reagrupación + re-base snapshot → 23-01 reagrupación SIN snapshot; 22-02 variantes nuevas → 23-02; 22-03 count-sync → 23-03). Predecir ~21 slots tras reagrupación (antes de variantes nuevas) para pre-planear el count-sync, leyendo SIEMPRE el count real del JSON al final (lección 19-03/20-03: nunca estimar el hardcode).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Definición de contenido (slots/variantes) | Database / Storage (JSON estático en `content/exercises/`) | — | El contenido vive en archivos JSON editados a mano; es la única superficie que esta fase toca de runtime. |
| Validación de shape | Build / Tooling (`scripts/validate-content-fixture.mjs` → `src/data/schema-validator.js`) | — | Validator ya bifurca por shape (payload XOR variants[]) desde v1.4; no se toca. |
| Smoke paramétrico de cobertura editorial | Build / Tooling (`tests/exercise-types.test.js`, `tests/fixtures/slot-variants-integration.test.js`) | — | Ya shape-agnostic (`Array.isArray(ex.variants)`); solo se actualiza el count hardcode. |
| Reporter de counts | Build / Tooling (`scripts/run-validation-271.mjs`) | — | TOTAL_EXPECTED + per-category expected; se recalcula. |
| Quórum de variantes nuevas | Build / Tooling (`scripts/validate-ai-pass.mjs` externos + skill `gsd-validate-exercise` Claude) | — | Pipeline existente; no se modifica, solo se invoca 1-por-1. |
| Motor de examen / sampler / cascada D-54 / loader | API / Runtime (`src/`) | — | **NO se toca** (FUERA de scope, locked). Ya consume slot+variantes desde Phase 16. |

## Standard Stack

No hay packages que instalar. El proyecto es web estática zero-deps, offline, single-user (ver CLAUDE.md). Todo el tooling es Node.js nativo (`node --test`, scripts `.mjs` con ESM nativo). Las únicas dependencias externas son las **API keys** (GEMINI_API_KEY / DEEPSEEK_API_KEY en `.env`) que `validate-ai-pass.mjs` solo LEE para el quórum cross-vendor.

### Core (herramientas ya presentes, no se instalan)
| Herramienta | Invocación | Propósito |
|-------------|-----------|-----------|
| Validator de shape | `node scripts/validate-content-fixture.mjs essere content/exercises/essere.json` | Verifica payload XOR variants[], explanation top-level, superficie válida por type. Exit 0 = OK. `[VERIFIED: scripts/validate-content-fixture.mjs leído]` |
| Test runner | `node --test tests/*.test.js` (path desnudo falla en Node 22.20 — usar glob) | Suite completa incl. smoke paramétrico. `[VERIFIED: MEMORY test_command_node_glob]` |
| Smoke estricto | `VAL_07_STRICT=1 node --test tests/*.test.js` | Lee `ex.validation?.status` top-level por slot. `[VERIFIED: 22-03-PLAN]` |
| Reporter de counts | `node scripts/run-validation-271.mjs` | VAL-04/06/08; falla si la suma en disco != TOTAL_EXPECTED. `[VERIFIED: run-validation-271.mjs leído]` |
| Quórum externos | `node scripts/validate-ai-pass.mjs <id> --model=gemini-2.5-flash --fallback=deepseek-chat --write` | Mitad externa del quórum (Gemini/DeepSeek), auto-fallback 429. `[VERIFIED: validate-ai-pass.mjs leído]` |
| Quórum Claude | Skill `gsd-validate-exercise <id>` (1-por-1, NUNCA batched) | Mitad Claude (Opus + Sonnet). `[VERIFIED: .claude/skills/gsd-validate-exercise/SKILL.md leído]` |
| Count real del JSON | `node -e "console.log(require('./content/exercises/essere.json').exercises.length)"` | El número a escribir en los 3 hardcodes — LEER, no estimar. `[VERIFIED: 22-03-PLAN]` |

**Installation:** N/A — sin packages. (Esta sección existe solo para confirmar zero-deps; no hay Package Legitimacy Audit porque no se instala nada.)

## Package Legitimacy Audit

**No aplica.** Esta fase no instala ningún package externo (proyecto estático offline zero-deps; ver CLAUDE.md "What NOT to Use"). El único acceso externo son las API keys de `.env` (leídas, no instaladas) para el quórum. No hay nada que auditar con slopcheck.

## Architecture Patterns

### System Architecture Diagram

```
content/exercises/essere.json  (39 ejercicios legacy payload)
        │
        │  PLAN 23-01: reagrupación por regla (D-23-01..03, D-23-08..12)
        │  - merge explanations (D-17-05 / D-23-10)
        │  - mover superficies INTACTAS a variants[] (NO re-validar)
        │  - ids semánticos salvo cross-cat (essere-300..305 id legacy estable)
        ▼
essere.json  (~21 slots slot+variantes)  ──checkpoint:decision (autor aprueba mapa)──┐
        │                                                                            │
        │  PLAN 23-02: variantes/slots NUEVOS (D-23-04..07)                          │
        │  - huecos: nacionalidad concord., localización, ser/estar (slot nuevo)     │
        │  - cada superficie NUEVA → quórum 1-por-1 (NUNCA batched):                 │
        │        validate-ai-pass.mjs (Gemini+DeepSeek) + skill (Opus+Sonnet)        │
        │  - gate D-17-07: >=4x "correcta", 0 "incorrecta" ANTES de integrar         │
        │  ──checkpoint:human-verify (autor revisa superficies pre-quórum)──┘        │
        ▼                                                                            │
essere.json  (~24-30 slots finales)                                                  │
        │                                                                            │
        │  PLAN 23-03: count-sync (lee data.exercises.length REAL del JSON)          │
        ▼                                                                            ▼
   ┌────────────────────┬──────────────────────────────────┬───────────────────────┐
   │ exercise-types     │ slot-variants-integration         │ run-validation-271    │
   │ .test.js:1271      │ .test.js:168                      │ .mjs:103 + TOTAL:111  │
   │ expected: N        │ expected: N                       │ expected: N + recalc  │
   └────────────────────┴──────────────────────────────────┴───────────────────────┘
        │
        ▼
   node --test tests/*.test.js  +  VAL_07_STRICT=1  +  run-validation-271.mjs  → todos verdes
        │
        ▼
   (loader de la app consume essere.json en boot — NO se toca el motor)
```

### Pattern 1: Shape de un slot (verificado contra avere.json)
**What:** Cada slot es un objeto con `explanation` top-level y `variants[]` shallow.
**When to use:** Todos los slots de Essere.
**Example:**
```jsonc
// Source: content/exercises/avere.json (slot avere-ho, ya convertido)
{
  "id": "essere-sono",                  // semántico (salvo cross-cat)
  "type": "multiple-choice",            // a nivel de slot
  "categoryIds": ["essere"],            // ["essere", "X"] solo en cruces
  "explanation": "La forma 'sono'...",  // top-level, NO en variantes (D-23-08)
  "variants": [
    { "prompt": "Io ___ Maria.", "options": ["sei","sono","ho","siamo"], "correctIndex": 1 }
    // word-buttons: { "prompt", "answer":[...], "distractors":[...] }
    // NINGUNA variante lleva explanation ni validation propia
  ],
  "validation": { "status": "validated", "passes": [ /* movido verbatim del/los fuente */ ] }
}
```

### Pattern 2: Cruce multi-cat (id estable, NO renumerar)
**What:** Los 6 cruces conservan id legacy + `categoryIds[]` de 2 ids.
**Why critical:** `clearedExerciseIds` de las otras categorías referencia esos ids; renumerar rompe la cascada D-54. (Confirmado: `tests/domain.test.js:211` cubre essere-300..305 explícitamente.)
**Example:**
```jsonc
// Source: avere.json avere-302 (ya convertido); essere-302 análogo
{ "id": "essere-302", "type": "multiple-choice",
  "categoryIds": ["essere","verbos-movimiento"],   // 2 ids PRESERVADOS
  "explanation": "...", "variants": [ {/* payload de essere-302 movido intacto */} ],
  "validation": {/* del fuente */} }
```

### Anti-Patterns to Avoid
- **Renumerar los cruces essere-300..305:** rompe `clearedExerciseIds` y la cascada D-54 multi-categoría. Id legacy ESTABLE obligatorio (D-23-09).
- **Re-validar superficies movidas intactas:** prohibido (D-23-11) — es cambio de contenedor, no de contenido. Solo variantes NUEVAS pasan quórum.
- **Poner `explanation` o `validation` en una variante:** ambos van top-level a nivel de slot (D-23-08). El validator/smoke esperan exactamente eso.
- **Hardcodear un count estimado:** leer `data.exercises.length` del JSON real (lección 19-03/20-03: estimaron ~25, real fue 34).
- **Buscar/crear un snapshot para Essere:** no existe ni se necesita (ver Runtime State Inventory). No copiar a ciegas la tarea de re-base de 22-01/22-02.
- **Validar más de una superficie por contexto/spawn:** NUNCA batched (VAL-03); 1-por-1, fresh context.
- **Smart-quotes / markdown en prompts o explanations:** el smoke FALLA (`exercise-types.test.js:1320` smart-quote scan, `:1332` markdown scan). Apóstrofes ASCII U+0027 obligatorios.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Validar shape del JSON | Validador propio | `scripts/validate-content-fixture.mjs` | Ya invoca la firma real de `validateContent`; bifurca por shape. |
| Verificar cobertura editorial + smart-quotes + markdown | Scan ad-hoc | smoke `exercise-types.test.js` (ya shape-agnostic) | No tocar lógica; solo el count hardcode. |
| Quórum de variantes nuevas | Llamadas manuales a APIs | `validate-ai-pass.mjs` + skill `gsd-validate-exercise` | Auto-fallback 429, `by` registrado correctamente, status por `deriveStatus`, 1 commit/ejercicio. |
| Recalcular TOTAL_EXPECTED | A mano sin trazar | Patrón del comentario-historial en `run-validation-271.mjs:64-94` | El comentario narra cada cambio del total; espejar la línea de Avere. |

**Key insight:** Toda la maquinaria de conversión ya existe y está probada en 3 conversiones previas (Preposiciones piloto, Articoli, Partitivos) + Avere. El riesgo no es construir nada nuevo, sino instanciar fielmente sin desviarse del patrón locked.

## Runtime State Inventory

> Esta es una fase de refactor de contenido (rename de ids + reestructuración). Inventario obligatorio.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | **Ninguno en runtime activo.** Phase 21 (`migrate8to9`) ya reseteó el progreso de las 6 categorías a convertir, incluida `essere` (categoryProgress + exerciseStats por prefijo + racha a 0). El `clearedExerciseIds` de essere ya está vacío. → renumeración de ids essere-only es LIBRE. `[VERIFIED: REQUIREMENTS.md MIG-03; tests/domain.test.js reset]` | Ninguna migración de datos; el reset ya ocurrió en Phase 21. |
| Live service config | **Ninguno.** Proyecto offline, sin servicios externos (sin n8n, sin DBs, sin schedulers). El único JSON es estático en repo. `[VERIFIED: CLAUDE.md constraints]` | Ninguna. |
| OS-registered state | **Ninguno.** Web estática, doble-click. `[VERIFIED: CLAUDE.md]` | Ninguna. |
| Secrets/env vars | `GEMINI_API_KEY` / `DEEPSEEK_API_KEY` en `.env` (leídos por `validate-ai-pass.mjs` para el quórum). Nombres no cambian; solo se leen. `[VERIFIED: validate-ai-pass.mjs:82]` | Ninguna — solo lectura. |
| Build artifacts | **Snapshot APPEND-ONLY de Avere NO aplica a Essere.** `scripts/.avere-prefix-snapshot.json`, `snapshot-avere-prefix.mjs`, `assert-avere-prefix-unchanged.mjs` y `assert-multi-cat-cross.mjs` están **hardcodeados a `content/exercises/avere.json`** y NO leen essere.json. NO existe `.essere-prefix-snapshot.json`. `[VERIFIED: grep + lectura de los 4 scripts]` | **Ninguna.** Essere no tiene snapshot que re-basar. El planner NO debe replicar la tarea de re-base de 22-01/22-02. Confirmar explícitamente "no aplica" en el plan para no copiar a ciegas. |

**Crítico — cross-cat ids (essere-300..305):** Aunque el progreso de essere se reseteó, los ids essere-300..305 aparecen en `categoryIds[]` de cruces multi-categoría. Las OTRAS categorías cruzadas (avere, profesiones, verbos-movimiento, genero-numero, sustantivos-irregulares, preposiciones) **no fueron todas reseteadas** — solo las 6 de conversión (avere/essere/verbos-movimiento/genero-numero/profesiones/sustantivos-irregulares; pero `preposiciones` NO está en las 6 y conserva progreso byte-intacto, MIG-03). Por seguridad y por D-23-09, conservar los ids essere-300..305 ESTABLES evita cualquier desincronización de `clearedExerciseIds` en categorías no reseteadas (preposiciones es la única cruzada no-reseteada, vía essere-305). Verificación: `tests/domain.test.js` cubre essere-300..305 al instante.

## Common Pitfalls

### Pitfall 1: Copiar la tarea de re-base del snapshot D-88 a ciegas
**What goes wrong:** El planner replica 22-01/22-02 incluyendo `node scripts/snapshot-avere-prefix.mjs` para Essere.
**Why it happens:** Phase 22 tenía una tarea prominente de re-base; el patrón "casi exacto" induce a copiarla.
**How to avoid:** NO existe snapshot de Essere. Los scripts son avere-only (hardcoded path). El plan de Essere OMITE toda la columna de snapshot/assert. Documentar explícitamente "Essere no tiene snapshot — no aplica re-base D-88".
**Warning signs:** Una tarea de plan que mencione `.essere-prefix-snapshot.json` o `assert-essere-prefix-unchanged.mjs` (no existen).

### Pitfall 2: Modelar el passato prossimo como 1 slot (como Avere)
**What goes wrong:** Agrupar essere-026..029 (stato/stata/stati/state) en 1 slot con 4 variantes.
**Why it happens:** Avere hizo el passato como 1 slot; el instinto de réplica.
**How to avoid:** D-23-03 lo PROHÍBE explícitamente — 4 slots separados por forma de concordancia (drilling). Esta es la divergencia deliberada más importante frente a Avere.
**Warning signs:** El mapa de reagrupación con un solo slot `essere-passato-prossimo`.

### Pitfall 3: Count estimado en los hardcodes
**What goes wrong:** Escribir el `expected` con la predicción (~21) en vez del count real tras 23-02.
**Why it happens:** Estimación disponible antes del JSON final.
**How to avoid:** El count-sync (23-03) lee `node -e "console.log(require('./content/exercises/essere.json').exercises.length)"` y usa ESE número en los 3 sitios. Las variantes nuevas NO suben el count (solo los slots NUEVOS, p.ej. el slot ser/estar de D-23-07, sí).
**Warning signs:** Los 3 hardcodes no coinciden entre sí o con el JSON.

### Pitfall 4: Smart-quotes / acentos legacy arrastrados
**What goes wrong:** El legacy essere.json tiene apóstrofes ASCII (`l'amico`, `trent'anni`, `d'acqua`) que deben preservarse; un editor puede convertirlos a smart-quotes; o las explanations españolas pueden arrastrar tildes ausentes.
**Why it happens:** Copy-paste, auto-corrección de editor.
**How to avoid:** Apóstrofes ASCII U+0027. Scan de smart-quotes (`grep -nP '[\x{2018}\x{2019}\x{201C}\x{201D}]'`) = 0. Scan de acentos sobre superficies movidas (lección Phase 19 WR-01/WR-02). DeepSeek es estricto en acentos; un pre-scan ahorra un pase de quórum.
**Warning signs:** El smoke falla con "Smart quotes encontradas".

### Pitfall 5: Mismatch de model IDs en el quórum
**What goes wrong:** D-23-13 dice "Opus 4.8 + Sonnet 4.6" pero el skill emite `claude-opus-4-7` / `claude-sonnet-4-6` literales en `passes[].by`.
**Why it happens:** El skill y todo el contenido previo usan los IDs viejos; D-23-13 nombra versiones más nuevas.
**How to avoid:** Decisión del planner/autor (ver Open Q #1). El skill hardcodea los IDs viejos en 5+ sitios; cambiarlos rompería la consistencia del audit trail con el contenido existente. Lo más seguro es tratar D-23-13 como "Opus + Sonnet de la generación canónica del proyecto" y dejar que el skill emita lo que emite, O actualizar el skill conscientemente (fuera de scope de contenido). Surfacear al autor en checkpoint.
**Warning signs:** Confusión sobre qué string poner en `passes[].by`.

## Code Examples

### Verificar el count real de Essere (driver del count-sync)
```bash
# Source: 22-03-PLAN.md interfaces
node -e "console.log(require('./content/exercises/essere.json').exercises.length)"
```

### Validar el shape tras reescribir
```bash
# Source: scripts/validate-content-fixture.mjs leído
node scripts/validate-content-fixture.mjs essere content/exercises/essere.json
# OK validación: N ejercicio(s) en content/exercises/essere.json (slug=essere)
```

### Quórum de una superficie nueva (1-por-1, NUNCA batched)
```bash
# Source: 22-02-PLAN.md interfaces + validate-ai-pass.mjs
# Mitad externa (Gemini + DeepSeek, by distintos):
node scripts/validate-ai-pass.mjs <id-temporal> --model=gemini-2.5-flash --fallback=deepseek-chat --write
node scripts/validate-ai-pass.mjs <id-temporal> --model=deepseek-chat --avoid=gemini-2.5-flash --write
# Mitad Claude (skill, Opus->Sonnet secuencial):
#   gsd-validate-exercise <id-temporal>
# Gate D-17-07: passes[] final >=4x "correcta", 0 "incorrecta" antes de integrar
```

### Asserts de integridad sobre el JSON convertido (espejo de 22-01 acceptance)
```bash
# Source: 22-01-PLAN.md acceptance_criteria, adaptado a essere
# 0 con payload:
node -e "const d=JSON.parse(require('fs').readFileSync('content/exercises/essere.json','utf8')); console.log('con payload:', d.exercises.filter(e=>e.payload).length)"
# Slots sin explanation top-level == 0:
node -e "const d=JSON.parse(require('fs').readFileSync('content/exercises/essere.json','utf8')); console.log('slots sin explanation:', d.exercises.filter(e=>Array.isArray(e.variants)&&(!e.explanation||!e.explanation.trim())).length)"
# Variantes con explanation propia == 0:
node -e "const d=JSON.parse(require('fs').readFileSync('content/exercises/essere.json','utf8')); console.log('variantes con explanation:', d.exercises.flatMap(e=>e.variants||[]).filter(v=>v.explanation!==undefined).length)"
# Cruces: 6 con 2 cats e ids estables:
node -e "const d=JSON.parse(require('fs').readFileSync('content/exercises/essere.json','utf8')); const c=d.exercises.filter(e=>/^essere-30[0-5]$/.test(e.id)); console.log('cruces:', c.length, 'con 2 cats:', c.filter(e=>e.categoryIds.length===2).length)"
# Word-buttons (debe ser 4) y NO match:
node -e "const d=JSON.parse(require('fs').readFileSync('content/exercises/essere.json','utf8')); console.log('wb:', d.exercises.filter(e=>e.type==='word-buttons').length, 'match:', d.exercises.filter(e=>e.type==='match').length)"
```

## Essere-specific: Reagrupación propuesta (insumo del 23-REAGRUPACION-MAP.md)

> Mapa PROPUESTO por el researcher, derivado de los `notes`/options/correctIndex/categoryIds reales de los 39 ejercicios. El planner lo refina y el autor lo aprueba en el checkpoint:decision (Claude's Discretion sobre la asignación exacta). Predicción rough: **~21 slots de reagrupación** (antes de slots nuevos de 23-02).

### Bloque 1 — Presente indicativo por persona (D-23-02, 1 slot por forma) → 6 slots
| slot-id propuesto | persona/forma | ids-fuente | explanation-base + matices a injertar (D-23-10) |
|-------------------|---------------|-----------|--------------------------------------------------|
| `essere-sono` | sono (io, 1ª sing) | 001 (+ loro comparte forma, ver nota) | 001 (identidad); matiz: `sono` también es 3ª pl |
| `essere-sei` | sei (tu, 2ª sing) | 002 | 002 (nacionalidad interrogativa) |
| `essere-e` | è (lui/lei, 3ª sing) | 003, 004 | base 003/004; matiz: acento grave è ≠ conjunción e; misma forma lui/lei |
| `essere-siamo` | siamo (noi, 1ª pl) | 005 | 005 (localización; falso amigo ser/estar) |
| `essere-siete` | siete (voi, 2ª pl) | 006 | 006 (estado; concordancia adjetival) |
| `essere-sono-loro` | sono (loro, 3ª pl) | 007 | 007; matiz: misma forma que io, contexto desambigua |

**Nota de discreción:** essere-001 (io sono) y essere-007 (loro sono) comparten forma `sono`. Avere los habría tenido como personas distintas. El autor decide en checkpoint si `io sono` y `loro sono` son 2 slots (por persona, espíritu D-23-02) o 1 slot `essere-sono` con 2 variantes (por forma). Recomendación: **2 slots** (cada persona es una trampa distinta, espíritu literal de D-23-02). Esto da 6 slots de presente como arriba (001=io, 002=tu, 003+004=lui/lei, 005=noi, 006=voi, 007=loro).

### Bloque 2 — Identidad / nacionalidad / profesión / cópula (D-23-01, agrupar por regla) → ~5-6 slots
Agrupar lo fácil. Candidatos (el autor afina el número en checkpoint):
| slot-id propuesto | regla | ids-fuente | notas |
|-------------------|-------|-----------|-------|
| `essere-identidad` | identidad/parentesco con essere (nombre, amigo, hermano) | 009 (presentación), 010 (parentesco), 011 (amigo di Luca) | celda rica; merge D-23-10 |
| `essere-nacionalidad` | nacionalidad con essere + concordancia + di-origen | 013 (masc sing), 014 (fem sing + di), 015 (pl masc) | **hueco pedagógico (D-23-04): concordancia italiano/italiana** → variantes nuevas en 23-02 |
| `essere-profesion` | profesión/rol con essere (sin artículo) | 012 (rol pl), 016 (medico), 017 (avvocata fem), 018 (rol pl), 019 (disyuntiva) | celda rica; contraste essere/avere (D-23-06) |
| `essere-stato` | estado/emoción con essere (stanca/felice/tristi) | 008 (non stanca), 020 (stanca), 021 (felice), 022 (contenti), 023 (tristi) | falso amigo estar→essere; distractoras avere (D-23-06) |
| `essere-copula` | cópula clasificatoria (X es de la clase Y) | 024 (Roma è città), 025 (gatto è animale) | uso esencial puro |

### Bloque 3 — Passato prossimo participio (D-23-03, SLOTS SEPARADOS por concordancia) → 4 slots
**Divergencia deliberada frente a Avere.** NO 1 slot con 4 variantes; SÍ 4 slots, uno por forma de concordancia. La explanation enfatiza la regla de concordancia género/número.
| slot-id propuesto | concordancia | id-fuente |
|-------------------|--------------|-----------|
| `essere-passato-prossimo-stato` | masc sing (stato) | 026 (io sono stato) |
| `essere-passato-prossimo-stata` | fem sing (stata) | 027 (Maria è stata) |
| `essere-passato-prossimo-stati` | masc pl (stati) | 028 (noi siamo stati) |
| `essere-passato-prossimo-state` | fem pl (state) | 029 (le ragazze sono state) |

### Bloque 4 — Word-buttons (D-23-12, slots-de-1) → 4 slots
| slot-id propuesto | sub-área | id-fuente |
|-------------------|----------|-----------|
| `essere-wb-identidad` | identidad/presentación múltiple | 100 |
| `essere-wb-nacionalidad` | nacionalidad pl + di-origen | 101 |
| `essere-wb-profesion` | profesión fem + in-lugar | 102 |
| `essere-wb-passato` | passato pl masc + a-ciudad + per-duración | 103 |

Essere **no tiene match** en el set legacy — no se inventa (D-23-12).

### Bloque 5 — Cruces multi-cat (D-23-09, id ESTABLE) → 6 slots
| slot-id (ESTABLE) | categoryIds | id-fuente |
|-------------------|-------------|-----------|
| `essere-300` | `["essere","avere"]` | 300 (è medico + ha trent'anni) |
| `essere-301` | `["essere","profesiones"]` | 301 (avvocata) |
| `essere-302` | `["essere","verbos-movimiento"]` | 302 (è andata) |
| `essere-303` | `["essere","genero-numero"]` | 303 (italiani di Milano) |
| `essere-304` | `["essere","sustantivos-irregulares"]` | 304 (braccia stanche) |
| `essere-305` | `["essere","preposiciones"]` | 305 (di Milano) |

### Conteo proyectado de reagrupación
6 presente + ~5 identidad/nac/prof/estado/cópula + 4 passato + 4 word-buttons + 6 cruces = **~21 slots** (antes de slots nuevos). Con el slot ser/estar nuevo de D-23-07 y posibles separaciones que el autor decida: **~21-24 slots** (coherente con la predicción ~19-24 de CONTEXT.md). El count final SE LEE del JSON en 23-03.

### Huecos pedagógicos para variantes nuevas (D-23-04, ambición generosa) — insumo del 23-VARIANTES-NUEVAS.md
1. **Nacionalidad concordancia italiano/italiana/italiani/italiane** — slot `essere-nacionalidad`: variantes masc/fem sing/pl con essere (spagnolo/spagnola, tedesco/tedesca…). Hueco explícito en D-23-04.
2. **Localización con essere** (sono a casa, è in ufficio, siamo al mare) — engordar `essere-siamo`/`essere-e` o slot de localización; falso amigo estar→essere.
3. **Slot ser/estar dedicado (D-23-07, slot NUEVO)** — `essere-ser-estar`: contrastar "Maria è stanca" (estado/estar) vs "Maria è medico" (identidad/ser), explanation explícita del calco español. Se re-verifica como tema propio.
4. **Contraste essere/avere agresivo (D-23-06)** — distractoras avere (ho/hai/ha) y explicaciones del calco: edad con avere (ho trent'anni), no essere; posesión vs identidad. Tejido en explanations + distractoras donde tenga sentido.

### Ejercicios que alimentan el contraste essere/avere (D-23-06)
Todos los MC legacy de Essere ya llevan una distractora de avere en options: 001(`ho`), 002(`hai`), 003(`ha`), 004(`ha`), 005(`abbiamo`), 006(`avete`), 007(`hanno`), 008(`ha`), 009(`ho`), 010(`ha`), 011(`hai`), 012(`avete`), 013(`ho`), 014(`ha`), 015(`hanno`), 016(`ha`), 017(`ha`), 018(`avete`), 019(`hai`), 020(`ha`), 021(`ho`), 022(`abbiamo`), 023(`avete`), 024(`ha`), 025(`ha`). Word-buttons 100(`ho`/`ha`), 101(`abbiamo`), 102(`ha`), 103(`abbiamo`). El cruce 300 es el contraste esencial (è medico + ha trent'anni). D-23-06 pide AMPLIAR este patrón en las variantes nuevas, especialmente: edad (avere), ser/estar (essere), posesión (avere) vs identidad/estado/localización (essere).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `payload: {prompt, options, correctIndex, explanation}` por ejercicio | `explanation` top-level + `variants[]` shallow por slot | v1.4 Phase 16/17 (motor slot-aware) | El motor ya consume ambos; el validator/smoke bifurcan por `Array.isArray(ex.variants)`. Esta fase migra el contenido, no el motor. |
| Avere passato = 1 slot con N variantes | Essere passato = 4 slots por concordancia | D-23-03 (esta fase) | Sube el count; drilling explícito de stato/stata/stati/state. |
| Avere tenía snapshot APPEND-ONLY D-88 con re-base | Essere NO tiene snapshot | esta fase | Una tarea menos; no replicar re-base. |

**Deprecated/outdated:**
- El campo `notes` del legacy es autor-internal (no se lee en runtime). En la conversión se descarta (no se mueve a variants[]); su contenido pedagógico relevante se injerta en la `explanation` del slot si aporta un matiz (D-23-10).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | El conteo proyectado de reagrupación es ~21 slots (6 presente + ~5 identidad/etc + 4 passato + 4 wb + 6 cruces). | Reagrupación propuesta | Bajo — es una predicción para pre-planear; el count real se lee del JSON en 23-03. El autor afina el bloque identidad/estado/cópula en checkpoint. |
| A2 | io-sono (001) y loro-sono (007) se modelan como 2 slots separados (por persona) en vez de 1 slot por forma. | Bloque 1 nota de discreción | Medio — afecta el count en 1 slot. Es Claude's Discretion; el autor decide en checkpoint. Recomendación basada en espíritu literal de D-23-02. |
| A3 | El skill `gsd-validate-exercise` seguirá emitiendo `claude-opus-4-7`/`claude-sonnet-4-6` en `passes[].by` (no Opus 4.8/Sonnet 4.6 como nombra D-23-13). | Pitfall 5 / Open Q #1 | Medio — afecta el audit trail. Decisión del autor; ver Open Q #1. No bloquea la conversión de contenido. |

## Open Questions

1. **Model IDs del quórum: D-23-13 (Opus 4.8 + Sonnet 4.6) vs skill literal (claude-opus-4-7 + claude-sonnet-4-6)**
   - What we know: El skill `gsd-validate-exercise` hardcodea `claude-opus-4-7` y `claude-sonnet-4-6` en 5+ sitios (SKILL.md líneas 25, 97, 107, 143, 149…) por D-VAL-02 (audit trail estable). Todo el contenido existente (avere.json, essere.json legacy) usa esos IDs en `passes[].by`. D-23-13 nombra "Opus 4.8 + Sonnet 4.6".
   - What's unclear: Si el autor quiere que las variantes NUEVAS de Essere registren `claude-opus-4-8`/`claude-sonnet-4-6` (rompiendo consistencia con el contenido previo) o seguir con los IDs del skill.
   - Recommendation: Surfacear al autor en el checkpoint de 23-02. Lo más conservador es interpretar D-23-13 como "la pareja canónica Opus+Sonnet del proyecto" y dejar que el skill emita sus IDs literales (consistencia de audit trail). Si el autor quiere actualizar los IDs, es un cambio al skill (fuera del scope de contenido) que debe decidirse explícitamente.

2. **Número exacto de slots en el bloque identidad/estado/cópula (Claude's Discretion)**
   - What we know: D-23-01 dice "agrupar por regla, pocos slots". Los candidatos son identidad, nacionalidad, profesión, estado, cópula (~5 slots).
   - What's unclear: Si nacionalidad+profesión se separan o se funden; si estado va con cópula; etc.
   - Recommendation: El planner propone los ~5 slots de arriba; el autor afina en el checkpoint:decision de 23-01 (es Claude's Discretion explícita).

3. **¿Existe algún snapshot/assert para Essere? — RESUELTO: NO**
   - What we know: `snapshot-avere-prefix.mjs`, `assert-avere-prefix-unchanged.mjs`, `.avere-prefix-snapshot.json` y `assert-multi-cat-cross.mjs` están hardcodeados a `content/exercises/avere.json` (verificado por lectura). No existe `.essere-prefix-snapshot.json`. Essere nunca tuvo blindaje APPEND-ONLY D-88.
   - What's unclear: Nada — resuelto.
   - Recommendation: El plan de Essere OMITE toda la columna de snapshot/re-base. Documentar "no aplica" explícitamente para que el ejecutor no copie la tarea de 22-01/22-02.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | validator, tests, scripts, quórum | ✓ (asumido) | 22.20 (MEMORY: path desnudo falla, usar glob) | — |
| `scripts/validate-content-fixture.mjs` | shape validation | ✓ | — `[VERIFIED: leído]` | — |
| `scripts/run-validation-271.mjs` | count reporter | ✓ | — `[VERIFIED: leído]` | — |
| `scripts/validate-ai-pass.mjs` | quórum externos | ✓ | — `[VERIFIED: leído]` | — |
| skill `gsd-validate-exercise` | quórum Claude | ✓ | — `[VERIFIED: SKILL.md leído]` | `claude -p --model …` headless si Task no disponible (D-19-08) |
| GEMINI_API_KEY | quórum Gemini | ✗ no verificable aquí (en `.env`) | — | DeepSeek (`--fallback=deepseek-chat`); o deepseek-reasoner como 2º by externo (precedente 22-VERIFICATION) |
| DEEPSEEK_API_KEY | quórum DeepSeek | ✗ no verificable aquí (en `.env`) | — | El otro vendor externo |
| snapshot scripts para Essere | — | ✗ NO EXISTEN (y NO se necesitan) | — | N/A — no aplica a Essere |

**Missing dependencies with no fallback:** Ninguna que bloquee. El quórum requiere ≥2 `by` externos distintos; si Gemini agota cuota (429), DeepSeek (chat + reasoner) cubre los 2 externos (precedente documentado en 22-VERIFICATION, fallback D-19-08).

## Validation Architecture

> nyquist_validation no está explícitamente en false → incluido.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node --test` (Node.js nativo) |
| Config file | none (glob de `tests/*.test.js`) |
| Quick run command | `node --test tests/exercise-types.test.js` |
| Full suite command | `node --test tests/*.test.js` (path desnudo falla en Node 22.20 — usar glob) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ESS-01 | Shape válido (payload XOR variants[], explanation top-level) | integration | `node scripts/validate-content-fixture.mjs essere content/exercises/essere.json` | ✅ |
| ESS-01 | Cobertura editorial + smart-quotes + markdown por slot | smoke | `node --test tests/exercise-types.test.js` (count en :1271) | ✅ (shape-agnostic; solo cambia count) |
| ESS-01 | back-compat validateContent + count por slug | integration | `node --test tests/fixtures/slot-variants-integration.test.js` (count en :168) | ✅ |
| ESS-01 | Suma global de counts (TOTAL_EXPECTED) | reporter | `node scripts/run-validation-271.mjs` (essere :103, TOTAL :111) | ✅ |
| ESS-01/02 | Status validated por slot top-level | strict smoke | `VAL_07_STRICT=1 node --test tests/*.test.js` | ✅ |
| ESS-02 | Cada variante nueva con quórum ≥4x correcta | manual+tooling | quórum 1-por-1 (`validate-ai-pass.mjs` + skill); evidencia en `passes[]` | ✅ |

### Sampling Rate
- **Per task commit:** `node scripts/validate-content-fixture.mjs essere content/exercises/essere.json` (tras editar el JSON); 1 commit por superficie validada en 23-02.
- **Per wave merge:** `node --test tests/*.test.js` + `VAL_07_STRICT=1 node --test tests/*.test.js`.
- **Phase gate:** suite completa verde + `node scripts/run-validation-271.mjs` PASS + validator exit 0 antes de `/gsd:verify-work`.

### Wave 0 Gaps
- None — la infraestructura de test cubre todos los requisitos. El smoke ya es shape-agnostic (no requiere nuevo test). El único cambio es el count hardcode en los 3 sitios (parte de 23-03, no de Wave 0).

## Security Domain

> Proyecto estático offline single-user. Superficie de ataque mínima.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Sin auth (single-user local). |
| V3 Session Management | no | Sin sesiones. |
| V4 Access Control | no | Sin multi-usuario. |
| V5 Input Validation | yes | El JSON de contenido es input al loader/validator; `validateContent` rechaza shape inválido. Smart-quote/markdown scans previenen contaminación de render. |
| V6 Cryptography | no | Sin cripto; API keys solo se leen de `.env`. |

### Known Threat Patterns for esta fase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Markdown/HTML en explanation o prompt (anti-XSS render plain-text, T-02-01) | Tampering | smoke markdown scan (`exercise-types.test.js:1332`); validator. |
| Smart-quotes contaminan el render (CONT-06) | Tampering | smoke smart-quote scan (`exercise-types.test.js:1320`); apóstrofes ASCII U+0027. |
| Count desincronizado → gate falso-verde/falso-rojo | Tampering | los 3 hardcodes + TOTAL_EXPECTED se leen del MISMO `data.exercises.length` real; reporter falla si la suma en disco != esperado. |
| Renumerar cruces rompe cascada D-54 (data-integrity) | Tampering | id estable essere-300..305 + 2 categoryIds; acceptance asserta `cruces: 6 con 2 cats: 6`. |
| Variante nueva con respuesta ambigua / construcción incorrecta / acento erróneo | Tampering | quórum cross-vendor (DeepSeek estricto en acentos); gate ≥4x correcta 0 incorrecta antes de integrar; NUNCA batched. |
| Prompt-injection al evaluador del quórum | Tampering | contenido autorado por el propio autor (single-user, sin input externo); el VALIDATION-PROMPT trata el ejercicio como DATA. Riesgo bajo. |
| npm/pip installs | — | N/A — zero-deps, sin packages. |

## Project Constraints (from CLAUDE.md)

- **Tech stack:** web estática (HTML+CSS+JS, sin servidor); doble-click y funciona, sin instalar nada. → NO introducir build steps ni packages.
- **Persistencia:** localStorage + export/import JSON; sin DB ni backend.
- **Contenido:** ejercicios en archivos JSON por categoría editados a mano. → esta fase edita `content/exercises/essere.json`.
- **Idioma de interfaz:** español (explanations en español; gloss ES R7 es canon).
- **Versiones pinneadas** (D-VAL-02 espíritu): model IDs literales en `passes[].by` (relevante para Open Q #1).
- **GSD Workflow Enforcement:** todo cambio de archivo pasa por un comando GSD. → la conversión va por los planes 23-01/02/03.
- **Pinned CDN versions** filosofía → no usar floating versions (no aplica a contenido, pero refuerza Open Q #1 sobre IDs estables).

## Sources

### Primary (HIGH confidence)
- `content/exercises/essere.json` — fuente, 39 ejercicios leídos íntegros (sub-temas, distractoras avere, cross-cat categoryIds, apóstrofes ASCII).
- `content/exercises/avere.json` — shape target ya convertido (20 slots; estructura de slot/variants/explanation/validation, ids semánticos, cruces).
- `.planning/phases/22-avere-a-slots-contenido/22-01-PLAN.md`, `22-02-PLAN.md`, `22-03-PLAN.md` — metodología de los 3 planes (reagrupación, quórum, count-sync).
- `.planning/phases/22-avere-a-slots-contenido/22-REAGRUPACION-MAP.md`, `22-VARIANTES-NUEVAS.md`, `22-VERIFICATION.md` — plantillas de artefactos + counts finales (23→20).
- `scripts/validate-content-fixture.mjs`, `scripts/run-validation-271.mjs` (líneas 60-130) — validator + reporter + TOTAL_EXPECTED + comentario-historial leídos.
- `scripts/snapshot-avere-prefix.mjs`, `scripts/assert-avere-prefix-unchanged.mjs`, `scripts/assert-multi-cat-cross.mjs` — confirmado hardcoded a avere.json (no aplica a Essere).
- `tests/exercise-types.test.js` (1255-1344), `tests/fixtures/slot-variants-integration.test.js` (160-184) — count-sites + smoke shape-agnostic + smart-quote/markdown scans leídos.
- `.claude/skills/gsd-validate-exercise/SKILL.md` — pipeline de quórum Claude + model IDs literales.
- `.planning/REQUIREMENTS.md` (ESS-01/02, MIG-03 reset) y `.planning/phases/23-essere-a-slots-contenido/23-CONTEXT.md` (decisiones locked).

### Secondary (MEDIUM confidence)
- `MEMORY.md` (exercise_authoring_rules, multi_vendor_quorum_validator, gloss_es_desambiguacion_canon, test_command_node_glob, cross_vendor_catches_bugs) — reglas R1-R7, comando de test, gloss ES canon.
- `scripts/validate-ai-pass.mjs` (líneas 1-135) — defaults de modelos externos, auto-fallback 429.

### Tertiary (LOW confidence)
- None — todas las afirmaciones técnicas verificadas contra disco.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — todo el tooling leído en disco; zero-deps confirmado.
- Architecture: HIGH — shape verificado contra avere.json convertido; los 3 planes de Phase 22 son el patrón literal.
- Pitfalls: HIGH — derivados de la verificación de Phase 22 (8/8) y de la inspección directa de los scripts (snapshot avere-only) y del smoke (scans).
- Reagrupación propuesta: MEDIUM — la asignación exacta es Claude's Discretion; el autor afina en checkpoint. El conteo se lee del JSON real.

**Research date:** 2026-06-06
**Valid until:** 2026-07-06 (estable — contenido + tooling interno, sin dependencias de ecosistema fast-moving)
