---
phase: 20-partitivi-a-slots-contenido
verified: 2026-06-05T00:00:00Z
status: passed
score: 9/9 must-haves verified
overrides_applied: 0
---

# Phase 20: Partitivi a slots (contenido) — Informe de Verificacion

**Objetivo de la fase:** Partitivi se convierte al modelo slot+variantes — los 44 ejercicios validados se reagrupan en slots por regla (del-formas por disparador fonetico + eje contable/incontable + alternativas qualche/alcuni/un po' di + omision en negativa + distincion partitivo-vs-preposizione articolata), se autoran variantes nuevas que pasan el quorum cross-vendor R1-R7, y la estructura final pasa el validator y el smoke parametrico con counts re-sincronizados — cerrando el bloque Articulos de CONV-01 y el milestone v1.5.

**Verificado:** 2026-06-05
**Estado:** PASSED
**Re-verificacion:** No — verificacion inicial

---

## Resultado global

### Verdades observables

| # | Verdad | Estado | Evidencia |
|---|--------|--------|-----------|
| 1 | Los 44 ejercicios legacy reagrupados en slots por regla: del-formas split por sub-disparador, alternativas en 3 slots, slot de contraste de negativa con ∅, slot de clasificacion de 3 opciones, 2 match | VERIFICADO | `partitivos.json` tiene 19 slots (17 de la reagrupacion + 2 nuevos de huecos). 10 del-formas, 3 alternativas, 1 negativa, 1 clasificacion, 2 match — todos presentes. `node -e "...exercises.length"` = 19. |
| 2 | Ningun ejercicio conserva payload; toda variante va en variants[]; ninguna variante lleva explanation propia; toda slot multi-variante tiene explanation top-level no vacia | VERIFICADO | Aserciones directas sobre el JSON: `con payload: 0`, `slots sin explanation: 0`, `variantes con explanation: 0`. |
| 3 | categoryIds=["partitivos"] en todos los slots (0 cruces inter-categoria) | VERIFICADO | `cats no-partitivos: 0`. IDs semanticos libres sin rango reservado (D-20-07). |
| 4 | 2 slots type:match presentes (038/039 como slots-de-1); slot de clasificacion con 5 variantes de 3 opciones (no rellenadas a 4) | VERIFICADO | `match slots: 2`. Clasificacion: 5 variantes cada una con `options.length === 3`. |
| 5 | Opcion ∅ (U+2205) preservada verbatim en el slot de negativa; sin smart-quotes en todo el archivo | VERIFICADO | `grep -c "∅" partitivos.json` = 5 (>= 2 requerido). `grep -nP smart-quotes` = 0. |
| 6 | 6 variantes nuevas (4 celdas pobres engordadas a 2 variantes + 2 slots nuevos suoni speciali) pasan quorum cross-vendor R1-R7 antes de integrarse (>=4x correcta, cero incorrecta) | VERIFICADO | Slots `degli-gn` y `degli-ps`: 4 passes distintos (gemini-2.5-flash + deepseek-chat + claude-opus-4-7 + claude-sonnet-4-6), todos `correcta`. Celdas pobres: `dello-scons`, `degli-scons`, `degli-vocal`, `degli-z` con 2 variantes cada una y `validation.status = validated`. |
| 7 | Todo slot con variants[] tiene `validation.status = validated` top-level (D-19-09; requerido por VAL_07_STRICT) | VERIFICADO | `slots variants sin validation top-level validated: 0`. |
| 8 | Los 3 hardcodes de count de Partitivi (expected: 44) sincronizados al conteo REAL (19) y TOTAL_EXPECTED recalculado a 323 (= 348 - 44 + 19) | VERIFICADO | `exercise-types.test.js:1274` = `expected: 19`. `slot-variants-integration.test.js:175` = `expected: 19`. `run-validation-271.mjs:98` = `expected: 19`. `TOTAL_EXPECTED = 323`. Los 3 coinciden con `data.exercises.length` real. |
| 9 | Suite completa verde: `node --test tests/*.test.js` 358/358, `VAL_07_STRICT=1 node --test tests/*.test.js` 367/367, `node scripts/run-validation-271.mjs` PASS (323/323), `validateContent` exit 0 | VERIFICADO | Todos los comandos ejecutados en verificacion independiente. 0 fallos. Reporter muestra VAL-06 PASS (323/323), VAL-08 PASS, VAL-04 PASS. |

**Puntuacion:** 9/9 verdades verificadas

---

### Artefactos requeridos

| Artefacto | Esperado | Estado | Detalle |
|-----------|----------|--------|---------|
| `content/exercises/partitivos.json` | 19 slots en shape slot+variantes (payload eliminado, variants[]+explanation top-level, 0 cruces) | VERIFICADO | Existe, 19 slots, todos los checks de estructura pasan, validateContent exit 0. |
| `.planning/phases/20-partitivi-a-slots-contenido/20-REAGRUPACION-MAP.md` | Mapa de auditoria id-fuente -> slot, cubre los 44 ids 1:1 | VERIFICADO | Existe. Cubre los 44 ids (22 del-formas + 4 pares D-01 + 7 alternativas + 4 negativa + 5 clasificacion + 2 match = 44). Aprobado por el autor en checkpoint:decision. |
| `.planning/phases/20-partitivi-a-slots-contenido/20-VARIANTES-NUEVAS.md` | Propuesta de 6 superficies nuevas con R6 verificado | VERIFICADO | Existe. 4 celdas pobres + 2 slots nuevos (degli+gn, degli+ps). Dello+gn/ps/x singular descartados conservadoramente. Aprobado por el autor en checkpoint:human-verify. |
| `tests/exercise-types.test.js` | expected partitivos sincronizado a 19; bifurcacion Array.isArray sin tocar | VERIFICADO | Linea 1274 = `expected: 19`. `grep -c "Array.isArray(ex.variants)"` = 2 (sin modificar). Articoli sigue en 34 (linea 1273). |
| `tests/fixtures/slot-variants-integration.test.js` | expected partitivos sincronizado a 19 | VERIFICADO | Linea 175 = `expected: 19`. Articoli sigue en 34 (linea 174). |
| `scripts/run-validation-271.mjs` | expected partitivos = 19; TOTAL_EXPECTED = 323; comentario del historial actualizado | VERIFICADO | Linea 98 = `expected: 19`. Linea 104 = `TOTAL_EXPECTED = 323`. Comentario del historial registra la conversion (lineas 81-87). |

---

### Verificacion de enlaces clave (key links)

| Desde | Hacia | Via | Estado | Detalle |
|-------|-------|-----|--------|---------|
| `content/exercises/partitivos.json` | `validateContent / normalizeExerciseToSlot` | shape slot+variantes (payload XOR variants[]) | WIRED | `validateContent` exit 0 sobre los 19 slots. `con payload: 0`. Shape variants[] enforzado por el validator existente. |
| Slot de omision en negativa | opcion `∅ / sin partitivo` | U+2205 EMPTY SET preservado verbatim | WIRED | 5 ocurrencias de `∅` en el JSON (4 en opciones de 034-037 + 1 en clasificacion). Ninguna corrupta. |
| Los 3 hardcodes de count + TOTAL_EXPECTED | `data.exercises.length` real de partitivos.json | sincronizacion contra el JSON real, no estimacion | WIRED | Los 3 values = 19 = `data.exercises.length`. TOTAL_EXPECTED = 323 = 348-44+19. `run-validation-271.mjs` PASS sin warning de count. |
| Cada variante/slot nuevo | `validation.passes[]` | quorum cross-vendor (>=4 pases, todos correcta) | WIRED | Slots `degli-gn` y `degli-ps`: 4 pases distintos, todos `correcta`. Celdas pobres: validation status inherited de los ejercicios fuente + quorum de la variante nueva. |

---

### Trazado de datos — Nivel 4

No aplica para artefactos de contenido puro (JSON de ejercicios). El motor de examen (v1.4) que consume `partitivos.json` no fue modificado en esta fase. La verificacion de que el motor consume correctamente el shape slot+variantes se garantiza por: (a) `validateContent` exit 0, (b) suite de tests shape-agnostic (`Array.isArray(ex.variants)` bifurcacion heredada del piloto) verde con 358/358.

---

### Verificaciones de comportamiento (spot-checks)

| Comportamiento | Comando | Resultado | Estado |
|----------------|---------|-----------|--------|
| Validator de contenido acepta los 19 slots | `node scripts/validate-content-fixture.mjs partitivos content/exercises/partitivos.json` | "OK validacion: 19 ejercicio(s)" | PASS |
| Suite completa sin fallos | `node --test tests/*.test.js` | 358/358, 0 fallos | PASS |
| Smoke estricto VAL_07_STRICT | `VAL_07_STRICT=1 node --test tests/*.test.js` | 367/367, 0 fallos | PASS |
| Reporter de validacion PASS | `node scripts/run-validation-271.mjs` | PASS — VAL-06 (323/323), VAL-08 PASS, VAL-04 PASS | PASS |
| Ejercicios de Partitivi en el smoke de integracion | `node --test tests/fixtures/slot-variants-integration.test.js` | 26/26 | PASS |

---

### Cobertura de requisitos

| Requisito | Plan que lo cubre | Descripcion | Estado | Evidencia |
|-----------|------------------|-------------|--------|-----------|
| PART-01 | 20-01 | 44 ejercicios reagrupados en slots por regla (del-formas/alternativas/negativa/clasificacion) | SATISFECHO | 19 slots en partitivos.json con los 5 sub-bloques correctamente estructurados; mapa de reagrupacion aprobado por el autor. |
| PART-02 | 20-02 | Variantes nuevas por quorum cross-vendor R1-R7; huecos como slots nuevos | SATISFECHO | 6 superficies nuevas con 4x "correcta" cada una; 4 celdas pobres a 2 variantes; 2 slots nuevos (degli-gn, degli-ps) con validation top-level. |
| PART-03 | 20-03 | Estructura final pasa validator + smoke parametrico (counts re-sincronizados) | SATISFECHO | 3 hardcodes = 19; TOTAL_EXPECTED = 323; suite + reporter + smoke estricto 0 fallos. |

Ningun requisito de la fase huerfano o sin cubrir.

---

### Anti-patrones encontrados

| Archivo | Linea | Patron | Severidad | Impacto |
|---------|-------|--------|-----------|---------|
| `content/exercises/partitivos.json` | 1099 | "degli" contiene la subcadena "gli" que dispara un grep de HACK pero NO es un marcador de deuda — es texto italiano ordinario en una explanation | INFO | Falso positivo confirmado; el contexto es `"El error frecuente es dei studenti o dei amici en vez de degli"`. No hay marcadores de deuda reales. |

Sin marcadores TBD, FIXME o XXX en ningun archivo modificado. Sin placeholders. Sin smart-quotes. Sin payload residual.

---

### Verificacion humana requerida

No se identifican items que requieran verificacion humana. Las decisiones criticas del autor (aprobacion del mapa de reagrupacion en el checkpoint:decision y aprobacion de las 6 superficies nuevas en el checkpoint:human-verify) estan documentadas como aprobadas ("aprobado") en el DISCUSSION-LOG de la fase. El quorum cross-vendor cubrio la correccion linguistica y pedagogica de todas las superficies nuevas.

---

### Resumen

Phase 20 alcanza su objetivo declarado completamente. Los 44 ejercicios legacy de Partitivi han sido convertidos al modelo slot+variantes:

- **Contenido (PART-01):** 17 slots de reagrupacion con las 5 reglas estructurales propias de Partitivi (del-formas split por sub-disparador, alternativas en 3 slots, slot de contraste de negativa con ∅, slot de clasificacion de 3 opciones, 2 match). Los 44 ids fuente mapeados 1:1, ninguno perdido ni duplicado.
- **Variantes nuevas (PART-02):** 6 superficies nuevas con quorum cross-vendor completo (Gemini + DeepSeek + Claude Opus-4-7 + Sonnet-4-6, 4x "correcta", cero "incorrecta"). 4 celdas pobres engordadas a 2 variantes; 2 slots nuevos de huecos de suoni speciali (degli-gn, degli-ps). 1 disputed resuelto por reformulacion de verbo ("piden" -> "exigen") sin override-atajo.
- **Smoke y counts (PART-03):** 3 hardcodes sincronizados al conteo real (19); TOTAL_EXPECTED = 323; suite completa 358/358 y 367/367 con VAL_07_STRICT. Logica del smoke no tocada (bifurcacion Array.isArray heredada). Articoli=34 intacto.

Todos los 11 commits referenciados en los SUMMARYs existen en el repositorio (bf8ba9b..eceae09). Ningun stub, ningun payload residual, ningun marcador de deuda.

El milestone v1.5 queda cerrado: 9/9 requisitos (MIG-01/02 en Phase 18, ART-01..04 en Phase 19, PART-01..03 en Phase 20) completados.

---

_Verificado: 2026-06-05_
_Verificador: Claude (gsd-verifier)_
