# Phase 17: Piloto Preposiciones (contenido) - Research

**Researched:** 2026-06-03
**Domain:** Reagrupación de contenido a slot+variantes + migración de state (reset) + quórum cross-vendor + smoke paramétrico
**Confidence:** HIGH (todo verificado leyendo el código y los 52 ejercicios reales; cero dependencia de training data)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions (copiadas verbatim de 17-CONTEXT.md)

- **D-17-01 (regla pedagógica):** Cada **regla distinta** = 1 slot. Los ejercicios que reformulan la **misma regla** pasan a ser variantes del mismo slot. `di`=origen-estable, `di`=posesión y `di`=materia son **tres slots distintos** (tres reglas), NO un único slot "di". Descartado: agrupar por preposición base.
- **D-17-02 (1 slot por forma):** Las formas articolate se mantienen **separadas por forma**: `nel`, `nello`, `nella`, `nei`, `negli`, `nelle`… cada forma es su propio slot. Variantes = reformular la **misma forma con otro sustantivo** del mismo artículo. Descartado: "1 slot por base" y "por singular/plural".
- **D-17-03 (fusión de duplicados de forma):** Donde ya existen varios ejercicios entrenando la **misma forma exacta**, se fusionan como variantes de un slot. Confirmado: **006/013/043** (`sul`) → 1 slot 3 variantes; **011/015** (`al`) → 1 slot 2 variantes. El resto de singletons quedan slot-de-1.
- **D-17-04 (separar por forma):** `in spiaggia / in montagna / al mare / in campagna` se modela como **dos slots**: slot `in`-locativo-fijo (`in spiaggia`, `in montagna`, `in campagna` = 3 variantes) + slot `al mare` (slot de 1, forma `al` distinta). Descartado: "1 slot, 4 variantes".
- **D-17-05 (elegir la más completa + injertar matices):** La explicación del slot = elegir la explicación más completa/general de las existentes como base + injertar los matices únicos de las descartadas. Merge **ligero**, NO reescritura total, NI quedarse con una sola perdiendo matices. Pasa por **revisión del autor** (D-85). Las variantes NO llevan explicación propia (D-15-02).
- **D-17-06 (alcance "donde tenga sentido"):** Solo se autoran variantes nuevas en slots cuya regla **admite reformulación natural**. Las **excepciones idiomáticas únicas** (`vado a casa`, `al mare`) quedan como **slot-de-1** sin forzar variantes artificiales. Descartado: "todos los slots ≥2 variantes".
- **D-17-07 (quórum cross-vendor completo):** Cada variante **nueva** entra solo si pasa el quórum cross-vendor R1-R7: `scripts/validate-ai-pass.mjs` (Gemini + DeepSeek) **Y** una pasada de Claude (skill `gsd-validate-exercise`, Opus+Sonnet, 1-por-1, fresh context, C1-C5). **Todos** deben dar verdict "correcta". Los 52 ejercicios **existentes** ya validados NO se re-validan (salvo cambio de superficie al reagrupar).
- **D-17-08 (migración idempotente 6→7):** Reset vía bump `schemaVersion` 6→7 con `migrate6to7` + `hydrateV7`. `migrate6to7` hace **exactamente**: (1) borrar `categoryProgress['preposiciones']`; (2) podar las claves `exerciseStats['preposiciones-*']`. Las otras 8 categorías **intactas**. `backup.js` se extiende a v7. Descartado: "derivado de ids" y "botón manual".

### Claude's Discretion (copiada verbatim)

- **Esquema de id del slot fusionado:** qué id gana cuando varios ejercicios se fusionan. Como el progreso se resetea, la estabilidad de ids legacy **no importa** → el planner elige (id más bajo del grupo, renumeración secuencial limpia, etc.) respetando unicidad. Coherente con D-15-09.
- **Forma exacta de `migrate6to7`/`hydrateV7`:** firma, ubicación en el dispatcher, si conviene un helper de poda por prefijo. Respetar el patrón literal y la idempotencia.
- **Edge case `inFlightTest` de Preposiciones:** evaluar si un test en vuelo que toque Preposiciones necesita invalidarse en `migrate6to7` (los ids cambian) o si el default/guard existente lo cubre. Preferencia: invalidar/limpiar el inFlightTest si referencia ids de Preposiciones obsoletos.
- **Cobertura del smoke paramétrico (PILOT-05):** cómo se extiende/parametriza el smoke test para verificar la estructura final (1 variante por slot, explanation por slot, validator verde). Respetar el patrón `node --test tests/*.test.js`.
- **Re-validación de superficie reagrupada:** si al reagrupar cambia la **superficie** (prompt/options reformulados), cuenta como variante nueva y pasa el quórum (D-17-07). Si solo cambia de contenedor (mismo texto movido a `variants[]`), NO requiere re-validación.

### Deferred Ideas (OUT OF SCOPE)

- Reescritura de explicaciones a regla generalizada (descartada por coste; se opta por elegir+injertar D-17-05).
- Articolate como 1 slot por base (descartada D-17-02 a favor de 1-slot-por-forma).
- Conversión del resto de categorías a slots (CONV-01) — backlog post-v1.4; siguen como slots de 1 variante.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PILOT-01 | Los 52 ejercicios validados de Preposiciones se reagrupan en slots por regla (misma regla reformulada = variantes del mismo slot) | §Reagrupación Mapping (mapa concreto id→slot abajo) + §Slot+Variantes JSON Shape (before/after real) + validator ya acepta `variants[]` (verificado en `schema-validator.js:201` `validateVariants`) |
| PILOT-02 | Se autoran variantes nuevas (D-85) donde tenga sentido; cada una pasa el quórum cross-vendor antes de entrar | §Cross-Vendor Quórum Pipeline + §Autoría: qué slots admiten reformulación natural (tabla) |
| PILOT-03 | Se añade el slot de preposición locativa fija `in spiaggia / in montagna / al mare / in campagna` (hueco detectado) | §Reagrupación Mapping (2 slots nuevos S-LOC-IN + S-AL-MARE) + gap confirmado por grep (ninguna categoría tiene spiaggia/montagna/al mare) |
| PILOT-04 | Al migrar Preposiciones a slots, su progreso se resetea a no-hecha (racha 0); el resto conserva su progreso | §Migración 6→7 (patrón literal de la cadena + migrate6to7/hydrateV7 spec + backup v7 + inFlightTest edge case) |
| PILOT-05 | La estructura final pasa el validator y el smoke test paramétrico (cobertura de explanations por slot preservada) | §Validator + Smoke Paramétrico (los 4 lugares que rompen al convertir + cómo extenderlos) |
</phase_requirements>

## Summary

Phase 17 es **principalmente trabajo de contenido + un eslabón de migración de state + sincronización de tests**, no de arquitectura nueva. Todo el andamiaje (validator de `variants[]`, loader `normalizeExerciseToSlot`, motor slot-aware que re-envuelve la variante en un synthetic `.payload`) ya existe y funciona desde Phases 15-16. Lo que falta es **llenar el modelo con contenido real**: reagrupar los 52 ejercicios de Preposiciones en ~40 slots por regla/forma, autorar variantes nuevas donde la regla lo admita (cada una pasa el quórum cross-vendor), añadir 2 slots locativos nuevos, resetear el progreso de Preposiciones vía `migrate6to7`, y **arreglar los 4 puntos del test/script suite que leen `payload.explanation`/`payload.prompt` y hardcodean `expected: 52`** — esos puntos rompen en el momento en que Preposiciones deja de ser legacy-payload.

El hallazgo más importante para el planner: **convertir Preposiciones a slot+variantes rompe simultáneamente 4 lugares que hoy están verdes** porque todos asumen el shape legacy `ex.payload.*`: (1) `tests/exercise-types.test.js` `CATEGORIES_WITH_EXPLANATIONS` (lee `ex.payload?.explanation`, `expected: 52`, R1/R2 sobre `payload.prompt`/`payload.explanation`); (2) el mismo array bajo `VAL_07_STRICT` (lee `ex.validation?.status`); (3) `tests/fixtures/slot-variants-integration.test.js` (`expected: 52` para preposiciones); (4) `scripts/run-validation-271.mjs` (`expected: 52` + `TOTAL_EXPECTED = 373`). Tras la fusión habrá ~40 slots, ~5 menos que 52, y muchos ejercicios ya no tendrán `payload`. El smoke paramétrico PILOT-05 **es exactamente** la tarea de hacer que estos checks entiendan el shape slot+variantes (explanation a nivel de slot, count = nº de slots, R1/R2 sobre `variants[].prompt` y `ex.explanation`).

**Primary recommendation:** Estructura el plan en olas: (1) producir el **mapa de reagrupación** (abajo) como artefacto revisable por el autor; (2) reescribir `content/exercises/preposiciones.json` a slot+variantes moviendo superficies existentes (sin re-validar — solo cambio de contenedor) + fusionando duplicados + injertando explanations (D-17-05); (3) autorar variantes nuevas 1-por-1 con quórum cross-vendor (D-17-07, checkpoint humano por variante); (4) añadir `migrate6to7`/`hydrateV7` + backup v7 + invalidación de inFlightTest; (5) actualizar los 4 puntos de test/script + extender el smoke paramétrico al shape slot. El validator NO necesita tocarse (ya acepta `variants[]`).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Reagrupación de ejercicios a slots | Content (`content/exercises/preposiciones.json`) | — | El modelo slot+variantes vive en `content/`, no en el state (D-15-09). El loader lo normaliza vía `normalizeExerciseToSlot`. |
| Autoría de variantes nuevas | Content + Pipeline de validación (scripts + skill) | — | Las variantes son superficies JSON; el quórum es un pipeline de scripts/subagents, no runtime. |
| Explicación a nivel de slot | Content (top-level `ex.explanation`) | Validator (`validateVariants` la exige) | SLOT-02: la explanation es compartida; el validator ya la enforça cuando hay `variants[]`. |
| Reset de progreso de Preposiciones | Database/Storage (`src/data/storage.js` migración) | Backup (`src/data/backup.js`) | El progreso vive en localStorage; el reset es una poda quirúrgica dentro de la cadena de migración por schemaVersion. |
| Validación estructural del shape final | Validator (`schema-validator.js`) | Tests/Scripts (smoke paramétrico) | El validator ya valida `variants[]`; el smoke paramétrico asserta la estructura final a nivel de test. |
| inFlightTest con ids obsoletos | Storage (migración) | App (resume guard) | Los ids de Preposiciones cambian; un test en vuelo que los referencie debe invalidarse en `migrate6to7`. |

## Standard Stack

Este es un proyecto **zero-deps, zero-build, static web** (HTML + CSS + JS vanilla ES modules + localStorage). No se instala ningún paquete en esta fase. El "stack" relevante es el conjunto de herramientas YA en el repo:

### Core (existente, sin instalación)
| Herramienta | Ubicación | Propósito en esta fase |
|-------------|-----------|------------------------|
| Validator de contenido | `src/data/schema-validator.js` (`validateContent`, `validateVariants`, `SURFACE_VALIDATORS`) | Ya valida `variants[]` desde Phase 15. **No se modifica.** Verifica que el JSON reagrupado pasa. |
| Loader normalizador | `src/data/content-loader.js` (`normalizeExerciseToSlot`) | Ya normaliza slot+variantes y legacy→slot-de-1. **No se modifica.** |
| Cadena de migración | `src/data/storage.js` (`migrateNtoM` + `hydrateVN` + dispatcher `migrate()` + `CURRENT_SCHEMA_VERSION`) | Se **extiende** con `migrate6to7` + `hydrateV7` + bump a 7. |
| Backup round-trip | `src/data/backup.js` (`parseBackupFile`, `buildBackupWrapper`, `CURRENT_SCHEMA_VERSION` espejo) | Se **extiende** a v7 (cadena + constante + import de `migrate6to7`/`hydrateV7`). |
| Validador cross-vendor externo | `scripts/validate-ai-pass.mjs` (Gemini/DeepSeek, `--write`, auto-fallback 429) | Se **invoca** por cada variante nueva. **No se modifica.** |
| Skill quórum Claude | `.claude/skills/gsd-validate-exercise/SKILL.md` (Opus+Sonnet, 1-por-1) | Se **invoca** por cada variante nueva. **No se modifica.** |
| Smoke paramétrico | `tests/exercise-types.test.js` (`CATEGORIES_WITH_EXPLANATIONS` + bloque `VAL_07_STRICT`) | Se **extiende** para entender el shape slot+variantes de Preposiciones. |

### Runtime de test
| Herramienta | Versión | Comando |
|-------------|---------|---------|
| Node.js test runner | v22.20.0 (verificado `node --version`) | `node --test tests/*.test.js` (path con glob — el path desnudo `tests/` falla en Node 22.20, ver memoria del proyecto) `[VERIFIED: node --version]` |
| Smoke estricto VAL-07 | mismo | `VAL_07_STRICT=1 node --test tests/*.test.js` |

### Alternatives Considered
| En vez de | Se podría usar | Tradeoff |
|-----------|----------------|----------|
| Modificar `schema-validator.js` | (nada) | No hace falta: `validateVariants` ya acepta el shape (verificado leyendo el código). Tocarlo añade riesgo sin beneficio. |
| `migrate6to7` con poda explícita | Re-derivar progreso de ids | Descartado en D-17-08 (deja racha/dominada stale). |

**Installation:** Ninguna. Cero paquetes nuevos (consistente con CLAUDE.md "zero-deps invariant"). `.env` con `GEMINI_API_KEY` + `DEEPSEEK_API_KEY` ya existe (verificado `ls -la .env`).

## Package Legitimacy Audit

**No aplica.** Esta fase no instala ningún paquete externo (proyecto zero-deps, zero-build por constraint de CLAUDE.md). slopcheck no se ejecuta porque no hay packages que auditar. `[VERIFIED: codebase — no package.json existe; CLAUDE.md "zero-deps invariant"]`

## Reagrupación Mapping (PILOT-01 / PILOT-03) — la columna vertebral del plan

Leídos los **52 ejercicios completos** de `content/exercises/preposiciones.json`. Cada uno tiene un `notes` que declara su regla/forma exacta. Aplicando D-17-01 (regla pedagógica = 1 slot), D-17-02 (articolate 1-slot-por-forma), D-17-03 (fusión de duplicados de forma):

> **Confianza:** HIGH para el agrupamiento — derivado directamente del campo `notes` de cada ejercicio leído íntegro. Los ids de slot propuestos (`S-NN`) son ilustrativos; el esquema final es Claude's Discretion del planner.

### Bloque A — Preposiciones SEMPLICI (reglas distintas = slots distintos, D-17-01)

| Slot propuesto | Regla (notes) | Ejercicios fuente | ¿Fusión? | ¿Admite variante nueva? (D-17-06) |
|----------------|---------------|-------------------|----------|-----------------------------------|
| S-DI-origen | `di` = origen/identidad estable ("è di Roma di nascita") | 001 | singleton | Sí (otra persona/ciudad de nacimiento) |
| S-A-casa | `a` = dirección con `casa` (excepción idiomática) | 002 | singleton | **No** — excepción idiomática única → slot-de-1 |
| S-DA-provenienza | `da` = provenienza del movimiento | 003 | singleton | Sí (otro destino+origen ciudad, cuidando R7 doble-validez) |
| S-IN-paese | `in` = luogo (paesi/regioni) | 004 | singleton | Sí (otro país/región) |
| S-CON-compagnia | `con` = compagnia | 005 | singleton | Sí (otra compañía) |
| S-PER-scopo | `per` = scopo/finalidad (+infinitivo) | 007 | singleton | Sí (otro objetivo +infinitivo) |
| S-TRA-futuro | `tra` = tempo futuro ("tra due giorni") | 008 | singleton | Cuidado: 049 usa `fra` (sinónimo eufónico) — ver nota abajo |
| S-PER-durata | `per` = durata ("per due ore") | 009 | singleton | Sí (otra duración cuantificada) |
| S-DI-posesso | `di` = posesso con nombre propio | 010, 012 | **FUSIÓN (2)** — ambos `di` posesión nombre propio sin contracción | Sí |
| S-A-ciudad | `a` = direzione con ciudad | 016 | singleton | Sí (otra ciudad). **Contraste con S-IN-paese — pareja pedagógica** |
| S-A-hora | `a` = tempo (la hora) | 017 | singleton | Sí (otra hora: "alle otto", "a mezzanotte") |
| S-DA-agente | `da` = agente (pasiva) | 018 | singleton | Sí (otra frase pasiva con gloss "por X") |
| S-IN-trasporto | `in` = mezzo di trasporto cerrado | 019 | singleton | Sí (in treno / in autobus) |
| S-SU-argomento | `su` = argomento (sobre/tema) | 020 | singleton | Sí (otro libro/tema, cuidando di/su doble-validez R7) |
| S-CON-strumento | `con` = mezzo/strumento (instrumental) | 050 | singleton | Sí (otro instrumento) |
| S-DI-materia | `di` = materia en colocación fija ("esame di matematica") | 051 | singleton | Sí (lezione di storia / corso di cucina) |
| S-DA-encasade | `da` = "en/a casa de" con personas (pronombre/nombre) | 052 | singleton | Sí (da Maria / dal medico — cuidando da/per gloss) |

**Nota TRA/FRA (008 + 049):** ambos entrenan `tempo futuro` (la MISMA regla), pero 049 usa la forma `fra` por regla eufónica ante `tr-`. Bajo D-17-01 (regla pedagógica) son la **misma regla** → candidatos a fusión en 1 slot `S-TRA-FRA-futuro` con 2 variantes (tra due giorni / fra tre giorni). Bajo D-17-02 (1-slot-por-forma, que aplica a articolate) `tra`≠`fra` son formas distintas. **Decisión que el planner debe resolver / llevar al autor:** tra/fra son sinónimos de la MISMA preposición (no articolate distintas), así que la lectura natural es D-17-01 → 1 slot 2 variantes. Lo señalo como punto de confirmación (ver Assumptions Log A1).

### Bloque B — Preposiciones ARTICOLATE (1 slot por forma, D-17-02; fusión de duplicados de forma, D-17-03)

| Slot propuesto | Forma | Ejercicios fuente | ¿Fusión? | ¿Admite variante nueva? |
|----------------|-------|-------------------|----------|--------------------------|
| S-SUL | `su+il` = sul | **006, 013, 043** | **FUSIÓN (3)** — caso confirmado D-17-03 | Sí (ya hay 3; tope natural alcanzado) |
| S-AL | `a+il` = al | **011, 015** | **FUSIÓN (2)** — caso confirmado D-17-03 | Sí (otro masc sing: al cinema/al telefono ya cubren 2) |
| S-DEL | `di+il` = del | 021 | singleton | Sí (otro masc sing regular) |
| S-DELLO | `di+lo` = dello | 022 | singleton | Sí (otro s+cons/z/gn/ps/x) |
| S-DELLA | `di+la` = della | 023 | singleton | Sí (otro fem sing) |
| S-DEI | `di+i` = dei | 024 | singleton | Sí (otro masc plur regular) |
| S-DEGLI | `di+gli` = degli | 025 | singleton | Sí (otro masc plur vocal/s+cons) |
| S-DELLE | `di+le` = delle | 026 | singleton | Sí (otro fem plur) |
| S-NEL | `in+il` = nel | 027 | singleton | Sí (otro masc sing, contexto "dentro de") |
| S-NELLO | `in+lo` = nello | 028 | singleton | Sí (otro s+cons/z) |
| S-NELLA | `in+la` = nella | 029 | singleton | Sí (otra fem sing) |
| S-NEI | `in+i` = nei | 030 | singleton | Sí (otro masc plur regular) |
| S-NEGLI | `in+gli` = negli | 031 | singleton | Sí (cuidado semántica contenedor — ver notes 031) |
| S-NELLE | `in+le` = nelle | 032 | singleton | Sí (cuidado semántica contenedor — ver notes 032) |
| S-ALLO | `a+lo` = allo | 033 | singleton | Sí (otro s+cons: allo zoo) |
| S-ALLA | `a+la` = alla | 034 | singleton | Sí (otra fem sing) |
| S-AI | `a+i` = ai | 035 | singleton | Sí (otro masc plur regular) |
| S-AGLI | `a+gli` = agli | 036 | singleton | Sí (otro masc plur vocal/s+cons) |
| S-ALLE | `a+le` = alle | 037 | singleton | Sí (otra fem plur, cuidando a/de gloss) |
| S-DAL | `da+il` = dal | 038 | singleton | Sí (otro masc sing) |
| S-DALLO | `da+lo` = dallo | 039 | singleton | Sí (otro s+cons) |
| S-DAI | `da+i` = dai | 040 | singleton | Sí (otro masc plur regular consonante: cuidado celda `i` no `gli`) |
| S-DAGLI | `da+gli` = dagli | 041 | singleton | Sí (otro masc plur vocal/s+cons) |
| S-DALLE | `da+le` = dalle | 042 | singleton | Sí (otra fem plur) |
| S-DALLA | `da+la` = dalla | 014 | singleton | Sí (otra fem sing, cuidando da/a gloss) |
| S-SULLO | `su+lo` = sullo | 044 | singleton | Sí (otro s+cons) |
| S-SULLA | `su+la` = sulla | 045 | singleton | Sí (otra fem sing) |
| S-SUI | `su+i` = sui | 046 | singleton | Sí (otro masc plur regular) |
| S-SUGLI | `su+gli` = sugli | 047 | singleton | Sí (cuidado verbo posarsi vs cadere — ver notes 047) |
| S-SULLE | `su+le` = sulle | 048 | singleton | Sí (otra fem plur) |

### Bloque C — Slots NUEVOS locativos (PILOT-03, D-17-04)

| Slot propuesto | Forma | Variantes a autorar (todas pasan quórum) | Notas |
|----------------|-------|-------------------------------------------|-------|
| S-LOC-IN | `in` locativo fijo sin artículo | `in spiaggia`, `in montagna`, `in campagna` (3 variantes) | Gap CONFIRMADO por grep: ninguna categoría tiene spiaggia/montagna/al mare/in campagna `[VERIFIED: grep content/]`. Las 3 son nuevas → quórum cross-vendor D-17-07 |
| S-AL-MARE | `al` = a+il locativo fijo | `al mare` (slot-de-1, D-17-04/D-17-06 excepción idiomática) | Nueva → quórum cross-vendor |

### Conteo resultante (para sincronizar los hardcodes de test/script)

- 52 ejercicios fuente → **fusiones que reducen count:** SUL (3→1, −2), AL (2→1, −1), DI-posesso 010/012 (2→1, −1), y posiblemente TRA/FRA (2→1, −1 si se confirma A1).
- Sin contar slots nuevos: **52 − 5 = 47 slots** (o 48 si tra/fra NO se fusionan).
- **+2 slots nuevos** (S-LOC-IN, S-AL-MARE) → **~49 slots** (o 50).
- **Número exacto depende de cuántas variantes nuevas se autoran**, pero el **count de SLOTS** (lo que cuentan los tests) es ~49-50, NO 52. El planner DEBE actualizar los 4 hardcodes (§Validator + Smoke). `[ASSUMED: conteo final — depende de confirmación tra/fra y revisión del autor del mapa]`

## Slot+Variantes JSON Shape (PILOT-01)

Confirmado leyendo `schema-validator.js` (`validateVariants`, líneas 201-222), `content-loader.js` (`normalizeExerciseToSlot`, líneas 43-64) y el fixture `slot-demo.json`. El shape autorado de un slot con variantes es:

```jsonc
{
  "id": "preposiciones-sul",            // id de slot (= exercise id; esquema = Claude's Discretion)
  "type": "multiple-choice",            // a NIVEL de slot (D-15-05)
  "categoryIds": ["preposiciones"],     // a nivel de slot, array no vacío
  "explanation": "Su con contacto físico horizontal se fusiona con Il dando Sul...",  // OBLIGATORIA a nivel de slot (SLOT-02 / schema-validator.js:203)
  "variants": [                          // array NO vacío (schema-validator.js:207)
    { "prompt": "Il gatto è ___ tavolo.", "options": ["sul","nel","al","dal"], "correctIndex": 0 },
    { "prompt": "Le chiavi sono ___ tavolo.", "options": ["nel","sul","al","dal"], "correctIndex": 1 },
    { "prompt": "Il quaderno è ___ banco.", "options": ["sul","sullo","sulla","nel"], "correctIndex": 0 }
  ],
  "validation": { "status": "validated", "passes": [ ... ] }   // opcional top-level (schema-validator.js:604)
}
```

**Reglas que enforça el validator (verificadas en el código):**
- `payload` XOR `variants[]` — nunca ambos, nunca ninguno (`schema-validator.js:147-156`). Al convertir a slot, **se elimina `payload`** y aparece `variants[]` + `explanation` top-level.
- `explanation` top-level string no vacío cuando hay `variants[]` (`:203`).
- `variants[]` no vacío (`:207`).
- Cada variante es un objeto plano con la **superficie** del `type` (multiple-choice → `{prompt con ___, options 3-4 strings, correctIndex en rango}`), validada por `validateMultipleChoiceSurface` (`:425`). **La variante NO lleva `explanation` propia** (sube a slot; verificado en el test de integración línea 137).

### Before/After concreto (fusión real S-AL = 011 + 015)

**ANTES (2 ejercicios legacy, tal cual en disco):**
```jsonc
{ "id": "preposiciones-011", "type": "multiple-choice", "categoryIds": ["preposiciones"],
  "payload": { "prompt": "Andiamo ___ cinema.", "options": ["a","al","nel","in"], "correctIndex": 1,
    "explanation": "Cuando A precede a un sustantivo con artículo definido se fusiona... A + Il = Al. Andiamo al cinema..." } }
{ "id": "preposiciones-015", "type": "multiple-choice", "categoryIds": ["preposiciones"],
  "payload": { "prompt": "Parlo ___ telefono.", "options": ["a","al","nel","con"], "correctIndex": 1,
    "explanation": "En italiano la locución fija para hablar por teléfono es parlare al telefono, con A contraída en Al..." } }
```

**DESPUÉS (1 slot, 2 variantes; explanation = la más completa + matiz injertado, D-17-05):**
```jsonc
{ "id": "preposiciones-al", "type": "multiple-choice", "categoryIds": ["preposiciones"],
  "explanation": "Cuando A precede a un sustantivo masculino singular con artículo definido Il se fusiona en la preposición articolata Al (a + il). El error típico A1 es usar la preposición simple A sola, olvidando que el artículo debe contraerse. Atención: algunas locuciones fijas también lo exigen, como 'parlare al telefono'.",   // base = 011 (más general) + matiz idiomático de 015
  "variants": [
    { "prompt": "Andiamo ___ cinema.", "options": ["a","al","nel","in"], "correctIndex": 1 },   // superficie de 011 MOVIDA sin cambio → NO re-validación (Claude's Discretion: "solo cambia de contenedor")
    { "prompt": "Parlo ___ telefono.", "options": ["a","al","nel","con"], "correctIndex": 1 }    // superficie de 015 MOVIDA sin cambio → NO re-validación
  ] }
```

**Punto clave para el planner:** mover una superficie existente intacta a `variants[]` **NO requiere re-validación** (Claude's Discretion: "solo cambia de contenedor"). Solo las variantes con **superficie nueva o reformulada** pasan el quórum (D-17-07). Esto reduce drásticamente el coste de tokens: las ~52 superficies existentes se mueven gratis; solo las variantes autoradas nuevas (PILOT-02 + PILOT-03) consumen quórum.

## Migración 6→7 (PILOT-04)

Patrón literal de la cadena existente, extraído de `src/data/storage.js`:

**Dispatcher actual (`migrate()`, líneas 137-151):** fall-through encadenado sobre `s.schemaVersion`:
```js
if (s.schemaVersion === 5) s = migrate5to6(s);
if (s.schemaVersion === 6) return hydrateV6(s);   // ← AQUÍ se inserta el nuevo eslabón
// versión desconocida → warn + blankState
```
Pasa a:
```js
if (s.schemaVersion === 5) s = migrate5to6(s);
if (s.schemaVersion === 6) s = migrate6to7(s);    // NUEVO
if (s.schemaVersion === 7) return hydrateV7(s);   // NUEVO
```

**`CURRENT_SCHEMA_VERSION`** (storage.js:35) sube `6 → 7`. **`blankState()`** (storage.js:56) sube `schemaVersion: 7` y su JSDoc.

**`migrate6to7(v6)` debe hacer EXACTAMENTE (D-17-08):**
1. Deep-clone defensivo de TODOS los sub-dicts vía `JSON.parse(JSON.stringify(...))` (patrón anti-prototype-pollution CR-03/T-04-02, idéntico a `migrate5to6`).
2. **Borrar `categoryProgress['preposiciones']`** — tras el deep-clone del sub-dict, `delete cloned.preposiciones` (o reconstruir sin esa clave). Esto resetea racha/clearedExerciseIds/dominada/lastSuccessDate → la categoría re-lazy-inicializa como no-hecha (D-47).
3. **Podar las claves `exerciseStats['preposiciones-*']`** — filtrar las claves del clon de `exerciseStats` que empiecen por `preposiciones-` (o `preposiciones`). Helper de poda por prefijo = Claude's Discretion.
4. Las otras 8 categorías + `dailyLog` + `songProgress` + `lastBackupAt` + `firstUsedAt` se preservan íntegros (deep-clone, sin tocar).
5. `schemaVersion: 7`.
6. **Idempotencia:** re-ejecutar sobre un v7 ya migrado produce el mismo resultado (Preposiciones ya ausente → delete no-op). Pureza: no muta el input.

**Punto sutil sobre la nueva key prefix:** hoy las claves de `exerciseStats` son `preposiciones-001`..`preposiciones-052` (ids legacy). Tras el reset, cuando el autor re-haga Preposiciones, el sampler lazy-inicializa pesos con los **nuevos ids de slot** (`preposiciones-al`, `preposiciones-sul`, etc.). El prefijo de poda `preposiciones` cubre AMBOS esquemas (legacy y nuevo) — pero la poda en `migrate6to7` solo necesita limpiar los **legacy** que existan en el state del autor en el momento de migrar. Confirmar que el match de prefijo no pode accidentalmente otra categoría con ese prefijo (no la hay: las 9 categorías son `avere/essere/preposiciones/verbos-movimiento/sustantivos-irregulares/genero-numero/profesiones/articoli/partitivos` — ninguna otra empieza por `preposiciones`). `[VERIFIED: content/categories.json + run-validation-271.mjs CATEGORIES]`

**`hydrateV7(parsed)`:** espejo LITERAL de `hydrateV6` (storage.js:538) con la versión a 7. **NO repite la poda** — la poda es responsabilidad de `migrate6to7` durante la cadena; un state que llega a `hydrateV7` ya viene v7-shaped (Preposiciones ya reseteada) o es un import directo v7. Mismo deep-clone defensivo por sub-dict. (Precedente: `hydrateV6` no re-ejecuta lógica de `migrate5to6`, solo garantiza shape.)

**`backup.js` v7 (líneas 26, 36, 113-120):**
- Import: añadir `migrate6to7, hydrateV7` al import desde `./storage.js` (línea 26).
- Constante espejo `CURRENT_SCHEMA_VERSION = 7` (línea 36).
- Cadena de migración del parse (líneas 115-120): añadir `if (migrated.schemaVersion === 6) migrated = migrate6to7(migrated);` y cambiar el `hydrateV6` final por `hydrateV7`.
- El guard forward-compat (`> CURRENT_SCHEMA_VERSION`) y la coherencia wrapper↔state se ajustan solos al subir la constante.
- **Round-trip:** un export del state v7 actual debe reimportarse sin error "versión más nueva".

**Edge case `inFlightTest` de Preposiciones (Claude's Discretion — preferencia: invalidar):**
- `inFlightTest` viaja en el mismo blob (D-41) y persiste `{exerciseIds, variantIndices, answers, ...}`. Si el autor migra con un Test completo en vuelo que incluye slots de Preposiciones, los `exerciseIds` referencian ids legacy (`preposiciones-006`) que **ya no existen** tras la reagrupación → al reanudar, `slotById[id]` será `undefined` y el render fallará.
- **Recomendación:** en `migrate6to7`, si `inFlightTest` existe y alguno de sus `exerciseIds` empieza por `preposiciones-` (o más conservador: empieza por `preposiciones`), **borrar el `inFlightTest`** (`delete next.inFlightTest`). Es el approach más seguro y coherente con la filosofía del reset (Preposiciones empieza de cero). Un Test completo abortado es aceptable dado que el reset es un evento único.
- **Alternativa menos invasiva** (descartada): conservar inFlightTest pero filtrar solo los ids de Preposiciones — rompe la integridad del Test (answers desalineados con exerciseIds). NO recomendada.
- Verificar el guard de resume existente: `app.js:321` ya chequea `this.state.inFlightTest` antes de abrir el confirm; pero NO valida que los ids existan en `slotById`. Por eso la invalidación debe pasar en la **migración**, no confiarse del guard de UI.

## Cross-Vendor Quórum Pipeline (PILOT-02 / D-17-07)

El quórum tiene **dos mitades independientes** que ambas deben dar "correcta" para que una variante nueva entre:

### Mitad 1 — Externos (Gemini + DeepSeek) vía `scripts/validate-ai-pass.mjs`

Invocación verificada leyendo el script:
```bash
# Pase Gemini (primario) con fallback a DeepSeek si 429:
node scripts/validate-ai-pass.mjs <exercise-id> --model=gemini-2.5-flash --fallback=deepseek-chat --write
# Pase DeepSeek, evitando el modelo que ya emitió el otro pase:
node scripts/validate-ai-pass.mjs <exercise-id> --model=deepseek-chat --avoid=gemini-2.5-flash --write
```
- **Localización del ejercicio:** el script escanea `content/exercises/*.json` Y `tests/fixtures/*.json` buscando el `id` exacto (`findExercise`, línea 87). El ejercicio nuevo debe existir en `content/exercises/preposiciones.json` con su `id` antes de invocar.
- **`--write`:** muta `validation.passes[]` in-place de forma quirúrgica (`writePass`, línea 257) — borra cualquier pase previo del mismo `by`, añade el nuevo, re-deriva `status` vía `deriveStatus` (fuente única `src/data/validation-state.js`). Preserva el formato compacto del JSON.
- **Claves:** lee `.env` (`GEMINI_API_KEY`, `DEEPSEEK_API_KEY`) — ya presente (`ls -la .env`). El `by` registrado es SIEMPRE el modelo que realmente respondió (importante para el quórum ≥2 `by` distintos).
- **El prompt es el MISMO** `09-VALIDATION-PROMPT.md` (R1-R7 → C1-C5) que usa el skill (línea 38). Cero divergencia de criterios entre vendors.

**⚠️ El ejercicio bajo validación es un SLOT con `variants[]`, no un ejercicio legacy con `payload`.** El prompt `09-VALIDATION-PROMPT.md` y los criterios C1-C5 referencian `payload.prompt` / `payload.options` / `payload.explanation` (shape legacy). `validate-ai-pass.mjs` pasa `JSON.stringify(found.ex)` entero (línea 111) — el modelo verá el shape slot+variantes. **Riesgo (MEDIUM):** los modelos pueden confundirse si la variante a validar está en `variants[k]` y la explanation en top-level. **Recomendación para el planner:** validar cada variante nueva **como un ejercicio multiple-choice legacy aislado** (un JSON temporal `{id, type, categoryIds, payload:{prompt,options,correctIndex,explanation}}`) ANTES de integrarla al slot — así el prompt C1-C5 ve el shape que espera. Tras pasar el quórum, mover la superficie al `variants[]` del slot (movimiento sin re-validación). Esto evita reescribir el VALIDATION-PROMPT.md. `[ASSUMED — verificar con un dry-run; ver Assumptions Log A2]`

### Mitad 2 — Claude (Opus + Sonnet) vía skill `gsd-validate-exercise`

- **1-por-1, fresh context, NUNCA batched** (constraint arquitectónica del skill, root-cause de los 4 bugs post-v1.0). Un spawn `Task()` por variante.
- Model IDs literales: `claude-opus-4-7` (Pase 1) + `claude-sonnet-4-6` (Pase 2), secuencial.
- Emite `validation.passes[]` + `deriveStatus` + 1 commit atómico por ejercicio.
- Retry budget = 1 si el JSON sale malformado; si falla 2× → `verdict: null` + concern `[meta] parse failed`, ejercicio queda `pending`.
- **Mismo riesgo de shape slot+variantes que la Mitad 1** — misma recomendación (validar como legacy aislado primero).

### Gate "correcta de TODOS los vendors" (D-17-07)

`deriveStatus(passes)` da `validated` solo con ≥2 entries `correcta` con `by` distintos; CUALQUIER `incorrecta` → `disputed` (sticky). Para el gate D-17-07 ("todos correcta"), el planner debe verificar que para cada variante nueva el `passes[]` final contiene **4 entries correcta** (gemini + deepseek + opus + sonnet) o al menos el subconjunto que el autor exija — y CERO `incorrecta`. Una `disputed` bloquea la variante hasta resolverse (calidad > tokens, incluir gloss español para desambiguar doble-validez R7 — memoria del proyecto).

### Complemento de scan de acentos (memoria del proyecto)

DeepSeek es **estricto en acentos**, Opus **indulgente**. El cross-vendor ya caza esto, pero como complemento barato el planner puede añadir un scan ASCII/tildes sobre las explanations nuevas antes del quórum (el VALIDATION-PROMPT §C4 D-135 ya enforça acentos RAE, pero un pre-scan evita gastar un pase en un fallo de tilde trivial). `[CITED: MEMORY.md feedback_cross_vendor_catches_bugs.md]`

### Patrón de invocación NUNCA batched

Cada variante nueva = un ciclo completo de 4 pases (2 scripts + 2 subagents). Si se autoran, p.ej., 25 variantes nuevas, son 25 ciclos independientes. El plan debe estructurar esto como **un checkpoint:human-verify por variante** (D-85: Claude propone → autor revisa → quórum), no un batch.

## Validator + Smoke Paramétrico (PILOT-05) — los 4 lugares que rompen

Al convertir Preposiciones a slot+variantes, **4 lugares hoy verdes rompen** porque leen el shape legacy `ex.payload.*` y/o hardcodean `expected: 52`. PILOT-05 ES arreglar estos 4 + extender la cobertura al shape slot. Verificado leyendo cada archivo:

| # | Lugar | Qué asume hoy (legacy) | Qué rompe | Cómo extender |
|---|-------|------------------------|-----------|---------------|
| 1 | `tests/exercise-types.test.js` `CATEGORIES_WITH_EXPLANATIONS` (línea 1266) bloque "explanation coverage" | `expected: 52`; lee `ex.payload?.explanation`; R1 sobre `ex.payload?.prompt`; R2 sobre `ex.payload?.explanation` | Count cambia a ~49-50; los ejercicios de Preposiciones ya no tienen `payload` → coverage da 0 explanations, R1/R2 no escanean nada | Para Preposiciones: contar **slots**, leer `ex.explanation` (top-level) para coverage, escanear `ex.variants[].prompt` para R1 y `ex.explanation` para R2. Las otras 8 cats siguen leyendo `payload` |
| 2 | `tests/exercise-types.test.js` bloque `VAL_07_STRICT` (línea 1399) | `expected` del mismo array; lee `ex.validation?.status !== 'validated'` | El count; pero `validation` es top-level → ese check SÍ sobrevive (validation no cambió de sitio). Solo rompe el count compartido | El `validation` top-level se mantiene en el shape slot → solo sincronizar el count del array compartido |
| 3 | `tests/fixtures/slot-variants-integration.test.js` `REAL_CATEGORIES` (línea 169) | `{ slug: 'preposiciones', expected: 52 }` | `exercises.length` ya no es 52 (es nº de slots) | Actualizar a nº de slots final |
| 4 | `scripts/run-validation-271.mjs` (línea 75 + 86) | `{ slug:'preposiciones', expected: 52 }` + `TOTAL_EXPECTED = 373` | `total !== expected` warning; `totalActual !== TOTAL_EXPECTED` → VAL-06 FAIL | Actualizar `expected` de preposiciones y recalcular `TOTAL_EXPECTED` (373 − 52 + nº_slots_final) |

**Decisión de diseño para el smoke paramétrico (Claude's Discretion):** el patrón más limpio es **bifurcar el assert por shape** dentro del loop: si el ejercicio tiene `variants[]` → assert shape slot (explanation top-level no vacía, ≥1 variante, cada `variants[].prompt` sin leak R1); si tiene `payload` → assert legacy como hoy. Esto hace el smoke **shape-agnostic** y deja el camino abierto para CONV-01 (futuras categorías convertidas) sin reescribir el test. Alternativa más simple (descartada): un array separado `SLOT_CATEGORIES` solo para Preposiciones — duplica infra.

**Lo que PILOT-05 debe assertar sobre la estructura final (criterio de éxito):**
- Validator verde: `node scripts/validate-content-fixture.mjs preposiciones content/exercises/preposiciones.json` exit 0 (ya soporta `variants[]`).
- 1 variante por slot **se elige** en sesión (eso es runtime del motor Phase 16, ya testado en `session.js` tests) — el smoke de contenido asserta que cada slot tiene `variants[]` no vacío y `explanation` presente.
- Cobertura de explanations **preservada**: todo slot tiene `explanation` top-level no vacía (no se pierde ninguna regla al fusionar).
- R1 (sin leak en prompt) ahora sobre `variants[].prompt`; R2 (sin #NNN) sobre `ex.explanation`.

**Comando de test (memoria del proyecto):** `node --test tests/*.test.js` — el glob es obligatorio; el path desnudo `tests/` falla en Node 22.20. `[CITED: MEMORY.md test_command_node_glob.md]`. Smoke estricto: `VAL_07_STRICT=1 node --test tests/*.test.js`.

## Don't Hand-Roll

| Problema | No construyas | Usa | Por qué |
|----------|---------------|-----|---------|
| Validar el shape slot+variantes | Un validador nuevo | `validateContent`/`validateVariants` existente | Ya valida `variants[]`, explanation top-level, superficie por tipo. Tocarlo añade riesgo. |
| Normalizar legacy→slot o passthrough | Lógica de normalización ad-hoc | `normalizeExerciseToSlot` existente | El motor Phase 16 ya consume `slotById` de esta función. |
| Migración + deep-clone defensivo | Una poda manual fuera del patrón | `migrateNtoM`/`hydrateVN` chain | Anti-prototype-pollution + idempotencia + dispatcher ya resueltos; copiar `migrate5to6` literal. |
| Validar variantes nuevas | Un pase manual / batch | `validate-ai-pass.mjs` + skill `gsd-validate-exercise` | El quórum cross-vendor 1-por-1 es el cazador de bugs documentado (memoria). Batched re-introduce el bug class. |
| Derivar status de validación | Reimplementar la lógica | `deriveStatus` de `src/data/validation-state.js` | Fuente única (WR-01); sticky disputed (D-VAL-07). |
| Recontar/assertar estructura | Un script nuevo de conteo | Extender `CATEGORIES_WITH_EXPLANATIONS` + `run-validation-271.mjs` | La infra de gate ya existe; solo sincronizar counts + bifurcar por shape. |

**Key insight:** Esta fase es **90% contenido + sincronización**, 10% código nuevo (solo `migrate6to7`/`hydrateV7`/backup v7). Toda la maquinaria de validación, normalización y migración ya está construida y testada. El error a evitar es reconstruir cualquiera de estas piezas.

## Common Pitfalls

### Pitfall 1: Olvidar actualizar los 4 hardcodes de count → suite roja
**Qué va mal:** Convertir Preposiciones a slots reduce el count de 52 a ~49-50 y elimina `payload`. Los 4 lugares (§Validator + Smoke) fallan: counts desalineados + lecturas `payload.explanation` vacías.
**Por qué pasa:** Los tests se escribieron asumiendo el shape legacy y un count fijo de 52, replicado en 4 archivos.
**Cómo evitar:** Tratar la actualización de los 4 hardcodes como **una tarea explícita del plan**, sincronizada con el count final de slots. Correr `node --test tests/*.test.js` + `node scripts/run-validation-271.mjs` tras la conversión.
**Señal temprana:** `Total NN ≠ esperado 52` en el reporter; `NN/NN ejercicios con explanation válida` da 0 para Preposiciones.

### Pitfall 2: Validar la variante nueva con el shape slot completo confunde a los vendors
**Qué va mal:** Pasar el slot entero (`{variants:[...], explanation:...}`) al quórum; el prompt C1-C5 espera `payload.prompt`/`payload.options`/`payload.explanation`.
**Por qué pasa:** `validate-ai-pass.mjs` y el skill serializan el ejercicio entero; el VALIDATION-PROMPT es legacy-payload-céntrico.
**Cómo evitar:** Validar cada variante nueva como un **ejercicio multiple-choice legacy aislado** (JSON temporal con `payload`) antes de integrarla. Tras quórum, mover la superficie al `variants[]` (sin re-validación).
**Señal temprana:** Concerns del tipo "no encuentro payload" o verdicts erráticos.

### Pitfall 3: No invalidar `inFlightTest` → crash al reanudar tras reset
**Qué va mal:** Un Test completo en vuelo con ids `preposiciones-006` (legacy) persiste en `inFlightTest`; tras la reagrupación esos ids no existen en `slotById` → `undefined` al reanudar.
**Por qué pasa:** `inFlightTest` viaja en el blob de state; `migrate6to7` resetea progreso pero no toca inFlightTest si no se le instruye.
**Cómo evitar:** En `migrate6to7`, borrar `inFlightTest` si referencia ids de Preposiciones (preferencia del autor). NO confiarse del guard de UI (no valida existencia de ids).
**Señal temprana:** Error de render al reanudar un Test tras el primer boot post-migración.

### Pitfall 4: Re-validar superficies que solo cambiaron de contenedor
**Qué va mal:** Gastar quórum (tokens) re-validando los 52 ejercicios existentes al moverlos a `variants[]`.
**Por qué pasa:** Confundir "cambio de contenedor" (mover texto idéntico) con "superficie nueva".
**Cómo evitar:** Solo pasan quórum las variantes con prompt/options **nuevos o reformulados** (D-17-07 + Claude's Discretion). Las superficies movidas intactas NO se re-validan.
**Señal temprana:** El plan tiene >52 invocaciones de quórum (debería ser solo el nº de variantes NUEVAS).

### Pitfall 5: Perder un matiz de explanation al fusionar (rompe PILOT-05 cobertura)
**Qué va mal:** Al fusionar (p.ej. SUL 006/013/043), quedarse con una explanation y descartar matices únicos de las otras (contraste con Nel, pitfall "dentro vs sobre").
**Por qué pasa:** Atajo de elegir la primera en vez de elegir-la-más-completa + injertar (D-17-05).
**Cómo evitar:** Por cada fusión, comparar las explanations fuente, elegir la más general como base, injertar los matices únicos no cubiertos. Revisión del autor (D-85).
**Señal temprana:** Una explanation de slot fusionado es más corta/pobre que la suma de las originales.

## Code Examples

### Patrón `migrate6to7` (derivado literal de `migrate5to6` storage.js:503)
```js
// Source: src/data/storage.js migrate5to6 (patrón a clonar) + D-17-08
export function migrate6to7(v6) {
  // deep-clone defensivo (CR-03 / anti-prototype-pollution) por sub-dict
  const clone = (x) => (typeof x === 'object' && x !== null) ? JSON.parse(JSON.stringify(x)) : {};

  const categoryProgress = clone(v6.categoryProgress);
  delete categoryProgress.preposiciones;                       // (1) reset categoría (D-17-08)

  const exerciseStatsAll = clone(v6.exerciseStats);
  const exerciseStats = {};                                    // (2) poda por prefijo
  for (const k of Object.keys(exerciseStatsAll)) {
    if (!k.startsWith('preposiciones')) exerciseStats[k] = exerciseStatsAll[k];
  }

  // (edge case) invalidar inFlightTest si toca Preposiciones (Claude's Discretion: preferencia invalidar)
  let inFlightTest = v6.inFlightTest;
  if (inFlightTest && Array.isArray(inFlightTest.exerciseIds) &&
      inFlightTest.exerciseIds.some(id => typeof id === 'string' && id.startsWith('preposiciones'))) {
    inFlightTest = undefined;
  }

  return {
    schemaVersion: 7,
    exerciseStats,
    categoryProgress,
    dailyLog: clone(v6.dailyLog),
    songProgress: clone(v6.songProgress),
    lastBackupAt: typeof v6.lastBackupAt === 'string' ? v6.lastBackupAt : null,
    firstUsedAt: typeof v6.firstUsedAt === 'string' ? v6.firstUsedAt : null,
    inFlightTest
  };
}
```
*(Ilustrativo — la firma exacta y el helper de poda son Claude's Discretion. `hydrateV7` = espejo literal de `hydrateV6` con versión 7, SIN la poda.)*

### Invocación quórum por variante nueva (verificada en `validate-ai-pass.mjs`)
```bash
# Mitad 1 — externos (cada variante nueva, 1-por-1):
node scripts/validate-ai-pass.mjs <new-variant-id> --model=gemini-2.5-flash --fallback=deepseek-chat --write
node scripts/validate-ai-pass.mjs <new-variant-id> --model=deepseek-chat --avoid=gemini-2.5-flash --write
# Mitad 2 — Claude (skill, 1 spawn por ejercicio, secuencial Opus→Sonnet):
/gsd-validate-exercise <new-variant-id>
# Gate D-17-07: passes[] debe tener 4× "correcta" (by distintos), CERO "incorrecta".
```

## State of the Art

No aplica (no hay libraries externas que evolucionen). El "estado del arte" relevante es **el estado del propio repo tras Phases 15-16**, ya verificado:

| Antes (asunción del roadmap) | Realidad verificada | Impacto |
|------------------------------|---------------------|---------|
| "57 ejercicios de Preposiciones" | **52** (verificado leyendo el JSON + `run-validation-271.mjs` ya dice `expected: 52`) | Corregir 57→52 en REQUIREMENTS.md (línea 30) y ROADMAP.md (líneas 69, 104, 108) como parte de la fase |
| `schemaVersion` actual = 5 | **6** (`migrate5to6`/`hydrateV6` ya en disco, D-15-09) | El bump es 6→7, no 5→6 |
| Motor consume `.payload` | Motor consume `slotById` y re-envuelve la variante en synthetic `payload` (`sessionCurrentExercise`) | El contenido reagrupado fluye sin tocar el motor |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | tra (008) y fra (049) entrenan la MISMA regla (tempo futuro) → fusión en 1 slot 2 variantes (lectura D-17-01) | Reagrupación Mapping Bloque A | Si el autor los quiere separados (lectura D-17-02 por forma), el count de slots sube en 1 y la tabla cambia. Bajo impacto — confirmar con autor. |
| A2 | Validar variantes nuevas como ejercicio legacy aislado (con `payload`) evita confundir a los vendors con el shape slot | Cross-Vendor Quórum Pipeline / Pitfall 2 | Si los vendors manejan bien el shape slot, este paso extra es innecesario (pero inofensivo). Verificar con un `--dry-run` sobre un slot. |
| A3 | Conteo final de slots ≈ 49-50 (52 − 5 fusiones + 2 nuevos) | Reagrupación Mapping / Conteo resultante | El número exacto depende de variantes nuevas autoradas y de A1. Los 4 hardcodes deben sincronizarse con el count REAL final, no con esta estimación. |
| A4 | Ninguna otra categoría usa el prefijo `preposiciones` en `exerciseStats` → poda por prefijo segura | Migración 6→7 | Verificado contra las 9 categorías; riesgo nulo salvo alta futura de una categoría con ese prefijo (no existe). |
| A5 | `validation` top-level se preserva en el shape slot (el validator lo acepta vía `validateValidationShape`) | Validator + Smoke (#2) | Verificado en `schema-validator.js:604` — el campo es top-level y opcional; sobrevive a la conversión. |

## Open Questions

1. **¿tra/fra fusionados o separados? (A1)**
   - Lo que sabemos: ambos = tempo futuro (misma regla pedagógica D-17-01); difieren solo por eufonía.
   - Lo que no está claro: si el autor quiere 1 slot (regla) o 2 (forma). D-17-02 habla de articolate, no de sinónimos simples.
   - Recomendación: tratar como 1 slot 2 variantes (D-17-01 manda); confirmar en revisión del mapa.

2. **¿Cuántas variantes nuevas autorar por slot? (alcance D-17-06)**
   - Lo que sabemos: solo "donde tenga sentido"; excepciones idiomáticas quedan slot-de-1.
   - Lo que no está claro: el número concreto por slot (1? 2?) — afecta coste de quórum y count final.
   - Recomendación: el plan debe proponer un target conservador (p.ej. llevar los slots-de-1 que admiten reformulación a 2 variantes) y dejar que el autor ajuste. NO inflar.

3. **Esquema de id de slot fusionado**
   - Lo que sabemos: la estabilidad de ids legacy no importa (progreso se resetea, D-17-08 + Claude's Discretion).
   - Recomendación: renumeración limpia semántica (`preposiciones-sul`, `preposiciones-al`, …) o secuencial (`preposiciones-001`..). La semántica facilita el debug; la secuencial preserva el patrón de los demás archivos. Decisión del planner.

## Environment Availability

| Dependencia | Requerida por | Disponible | Versión | Fallback |
|-------------|---------------|------------|---------|----------|
| Node.js | Tests + scripts de validación | ✓ | v22.20.0 `[VERIFIED]` | — |
| `.env` con `GEMINI_API_KEY` + `DEEPSEEK_API_KEY` | `validate-ai-pass.mjs` (variantes nuevas) | ✓ (archivo presente, 500 bytes) `[VERIFIED: ls -la .env]` | auto-fallback entre modelos si 429; si falta una key el script avisa y salta a fallback |
| Acceso a Claude (Task subagents) | skill `gsd-validate-exercise` | ✓ (entorno Claude Code) | Opus 4.7 + Sonnet 4.6 | retry budget 1; si parse falla 2× → pending |
| Conexión a internet | Pases Gemini/DeepSeek | Asumida en runtime de validación | — | Sin red, las variantes nuevas no pasan quórum → bloquean PILOT-02 (no hay fallback offline) |

**Missing dependencies con fallback:** ninguna crítica. Si una API key externa falta, el auto-fallback y la mitad Claude del quórum siguen operativos (pero D-17-07 exige TODOS correcta — el planner debe garantizar las 4 keys/accesos antes de la ola de autoría).

## Validation Architecture

> `workflow.nyquist_validation` está **`false`** en `.planning/config.json` `[VERIFIED]` → esta sección es informativa, no un gate Nyquist. El proyecto usa su propio smoke paramétrico (PILOT-05) en su lugar.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` nativo (Node v22.20.0) |
| Config file | none — se descubre por glob |
| Quick run command | `node --test tests/*.test.js` (glob obligatorio, no `tests/`) |
| Full suite command | `node --test tests/*.test.js` + `node scripts/run-validation-271.mjs` |
| Smoke estricto | `VAL_07_STRICT=1 node --test tests/*.test.js` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PILOT-01 | Slots con variants[] validan | unit | `node scripts/validate-content-fixture.mjs preposiciones content/exercises/preposiciones.json` | ✅ existe |
| PILOT-01 | Count de slots + shape slot correcto | param | `node --test tests/exercise-types.test.js` (extender `CATEGORIES_WITH_EXPLANATIONS` bifurcado por shape) | ⚠️ extender |
| PILOT-03 | Slots locativos presentes con variantes | param | mismo smoke (assert S-LOC-IN tiene 3 variantes, S-AL-MARE 1) | ⚠️ extender |
| PILOT-04 | migrate6to7 resetea solo Preposiciones, idempotente, anti-pollution | unit | `node --test tests/data-storage.test.js` (añadir tests v6→v7) | ⚠️ extender |
| PILOT-04 | backup round-trip v7 | unit | `node --test tests/backup.test.js` (añadir v7) | ⚠️ extender |
| PILOT-05 | Cobertura explanations preservada (todo slot con explanation) | param | smoke bifurcado por shape | ⚠️ extender |
| PILOT-02 | Variantes nuevas validated (cross-vendor) | manual+script | quórum por variante + `run-validation-271.mjs` gate | ✅ infra existe (sincronizar counts) |

### Sampling Rate
- **Per task commit:** `node --test tests/<archivo-tocado>.test.js`
- **Per wave merge:** `node --test tests/*.test.js`
- **Phase gate:** suite completa verde + `node scripts/run-validation-271.mjs` PASS + `VAL_07_STRICT=1 node --test tests/*.test.js` verde.

### Wave 0 Gaps
- [ ] Extender `tests/exercise-types.test.js` `CATEGORIES_WITH_EXPLANATIONS` (bifurcar por shape slot/legacy + sincronizar count Preposiciones).
- [ ] `tests/fixtures/slot-variants-integration.test.js` — actualizar `expected` de preposiciones.
- [ ] `scripts/run-validation-271.mjs` — actualizar `expected` preposiciones + `TOTAL_EXPECTED`.
- [ ] `tests/data-storage.test.js` — tests de `migrate6to7`/`hydrateV7` (reset selectivo, idempotencia, anti-prototype-pollution, otras 8 cats intactas, inFlightTest invalidado).
- [ ] `tests/backup.test.js` — round-trip v7.

## Security Domain

> `security_enforcement` no aparece explícito en `.planning/config.json`; el proyecto aplica un gate ASVS L1 humano en fases con boot (precedente Phase 15/16 checkpoints). Esta fase es **contenido + migración de state local**, sin red en runtime ni input de usuario no confiable.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | El JSON de contenido se valida con `validateContent` (hand-written, acumula errores, NFC normalize en el borde). El smoke paramétrico ya escanea HTML-like (`/<[^>]+>/`) y markdown markers (anti-XSS T-02-01). |
| V6 Cryptography | no | Sin cripto. |
| V2/V3/V4 Auth/Session/Access | no | App single-user local, sin backend ni auth. |

### Known Threat Patterns for este stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Prototype pollution vía state importado / migrado | Tampering | Deep-clone defensivo `JSON.parse(JSON.stringify())` por sub-dict en `migrate6to7`/`hydrateV7` (patrón CR-03/T-04-02 ya establecido). Reconstrucción literal del root. |
| XSS vía explanation/prompt con HTML/markdown | Tampering | Render plain-text; smoke asserta `/<[^>]+>/` y `(\*\*|__|##|\`)` ausentes; apóstrofes ASCII U+0027 (CONT-06). |
| Prompt-injection en el quórum (texto del ejercicio dirige al evaluador) | Tampering | Guard anti prompt-injection §6 del VALIDATION-PROMPT (el contenido es DATA, no instrucción). |
| Pérdida de progreso de OTRAS categorías al migrar | Tampering/DoS | `migrate6to7` poda SOLO `preposiciones*`; tests deben afirmar las otras 8 cats intactas. `assert-avere-prefix-unchanged.mjs` debe seguir verde. |

## Runtime State Inventory

> Esta fase incluye una migración de state (reset de Preposiciones) — inventario de state runtime que el reset toca:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data (localStorage) | `categoryProgress['preposiciones']` (racha/clearedExerciseIds/dominada/lastSuccessDate) + `exerciseStats['preposiciones-001..052']` en el blob `italianCourse.v1` del navegador del autor | **Data migration:** `migrate6to7` borra ambos al bootear (one-shot, automático). Las otras 8 cats intactas. |
| Live service config | inFlightTest persistido CON ids `preposiciones-*` legacy si hay un Test en vuelo al migrar | **Code edit + data migration:** invalidar `inFlightTest` en `migrate6to7` si referencia ids de Preposiciones (Claude's Discretion, preferencia invalidar). |
| OS-registered state | None — app web estática, sin tasks/daemons/registrations | None (verificado: stack es static web local, CLAUDE.md). |
| Secrets/env vars | `.env` con `GEMINI_API_KEY`/`DEEPSEEK_API_KEY` — usadas por el quórum, NO renombradas ni tocadas | None (solo lectura por `validate-ai-pass.mjs`). |
| Build artifacts | None — zero-build (sin egg-info, sin dist, sin compilados) | None (verificado: zero-build invariant). |
| Backup files | Exports `.json` previos del autor en schemaVersion ≤6 | **Code edit:** `backup.js` extiende la cadena a v7 → un import de un backup v6 migra a v7 (resetea Preposiciones en el import, coherente). Round-trip de export v7 debe reimportarse sin "versión más nueva". |

**Pregunta canónica respondida:** tras actualizar `preposiciones.json` + el código, el único state runtime con la vieja estructura es el **localStorage del navegador del autor** (progreso + stats + posible inFlightTest) y sus **backups .json**. `migrate6to7` (boot) + `backup.js` v7 (import) cubren ambos. Cero state OS/secrets/build afectado.

## Project Constraints (from CLAUDE.md)

| Directiva | Cómo la respeta esta investigación |
|-----------|-----------------------------------|
| Web estática, HTML+CSS+JS vanilla, sin servidor/build | Cero paquetes nuevos; toda la lógica en ES modules existentes. |
| Persistencia localStorage + export/import JSON | El reset es una migración de schemaVersion en localStorage; backup.js v7 cubre export/import. |
| Contenido = JSON editado a mano | La reagrupación es edición de `preposiciones.json`; el shape slot+variantes es el contrato de autoría (fixture `slot-demo.json`). |
| Interfaz en español | Mensajes de validador/scripts en español (FOUND-04); response_language del prompt = español prosa, inglés identificadores. |
| Pinned versions, zero floating deps | No aplica (cero CDN nuevo); model IDs del quórum pinned (`claude-opus-4-7`, `claude-sonnet-4-6`, `gemini-2.5-flash`, `deepseek-chat`). |
| "Cambios mínimos" | Reusar validator/loader/migration chain/quórum existentes; solo añadir `migrate6to7`/`hydrateV7`/backup v7 + sincronizar 4 hardcodes. |
| GSD Workflow Enforcement | El trabajo se descompone vía `/gsd:plan-phase 17`. |

## Sources

### Primary (HIGH confidence — leídos íntegros en esta sesión)
- `content/exercises/preposiciones.json` (52 ejercicios completos, campos `notes`) — base del mapa de reagrupación.
- `src/data/storage.js` — cadena de migración completa (`migrate1to2`..`migrate5to6`, `hydrateV2`..`hydrateV6`, dispatcher, `CURRENT_SCHEMA_VERSION=6`, `blankState`).
- `src/data/backup.js` — `parseBackupFile`, `buildBackupWrapper`, cadena de migración v6, constante espejo.
- `src/data/schema-validator.js` — `validateContent`, `validateVariants`, `SURFACE_VALIDATORS`, `validateValidationShape` (shape slot+variantes aceptado).
- `src/data/content-loader.js` — `normalizeExerciseToSlot`, `variantFromPayload`, `loadContent` → `slotById`.
- `scripts/validate-ai-pass.mjs` — invocación, `--write`, `findExercise`, auto-fallback, `.env`.
- `scripts/run-validation-271.mjs` — `CATEGORIES` (preposiciones `expected: 52`), `TOTAL_EXPECTED = 373`, gates VAL-04/06/08.
- `scripts/run-validation-pilot.mjs`, `scripts/validate-content-fixture.mjs` — reporters/validador de fixture.
- `.claude/skills/gsd-validate-exercise/SKILL.md` — quórum Claude 1-por-1, constraints.
- `.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md` — R1-R7 → C1-C5 verbatim.
- `tests/exercise-types.test.js` (líneas 1255-1416) — smoke paramétrico `CATEGORIES_WITH_EXPLANATIONS` + `VAL_07_STRICT`.
- `tests/fixtures/slot-variants-integration.test.js` — shape slot, back-compat counts.
- `.planning/phases/15-*/15-CONTEXT.md` (vía CONTEXT canonical refs), `.planning/phases/16-*/16-CONTEXT.md` — contrato heredado (variantIndex, slotById, synthetic-payload re-wrap).
- `.planning/STATE.md` — schemaVersion=6, 52 confirmado, decisiones D-15-09/D-16-*.
- `node --version` → v22.20.0; `ls -la .env` → presente; `grep content/` → spiaggia gap confirmado.

### Secondary (MEDIUM confidence)
- `~/.claude/.../memory/` (vía system context): test command glob, cross-vendor caza bugs, accent scan, authoring rules R1-R7, disputed resolution.

### Tertiary (LOW confidence)
- Conteo final exacto de slots (depende de A1/A3 + revisión del autor del mapa) — estimación ~49-50.

## Metadata

**Confidence breakdown:**
- Reagrupación mapping: HIGH — derivado de los 52 `notes` leídos íntegros; ids de slot ilustrativos (discreción del planner).
- Slot+variantes shape: HIGH — verificado en validator + loader + fixture + test de integración.
- Migración 6→7: HIGH — patrón clonado de `migrate5to6` verificado línea a línea; firma exacta = discreción.
- Quórum cross-vendor: HIGH para el mecanismo (scripts leídos); MEDIUM para el manejo del shape slot por los vendors (A2).
- Smoke paramétrico / 4 hardcodes: HIGH — los 4 lugares localizados y leídos.
- Conteo final: MEDIUM — depende de A1/A3 y revisión del autor.

**Research date:** 2026-06-03
**Valid until:** 2026-07-03 (stable — proyecto interno, sin deps externas que muevan; re-verificar solo si el código de storage/validator/scripts cambia antes de planificar)
