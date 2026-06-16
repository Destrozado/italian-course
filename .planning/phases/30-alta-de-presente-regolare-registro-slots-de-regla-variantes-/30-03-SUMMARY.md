---
phase: 30-alta-de-presente-regolare-registro-slots-de-regla-variantes-
plan: 03
subsystem: content
tags: [presente-regolare, verification, boot-load, schema-validator, baseline-suite, count-sync, PRES-01]

# Dependency graph
requires:
  - phase: 30-01
    provides: "content/exercises/presente-regolare.json (8 objetos-ejercicio) + registro order 10 en categories.json"
  - phase: 30-02
    provides: "los 8 objetos validation.status: validated (quórum + revalidación canónica Opus 4.8 + Sonnet 4.6 del Addendum)"
provides:
  - "Verificación end-to-end de que presente-regolare carga en boot vía content-loader y pasa validateContent (0 errores de shape)"
  - "Confirmación de suite baseline verde sin regresiones NUEVAS (único fail = el preexistente AJENO genero-numero 12→13, NO de esta fase)"
  - "Conteo DEFINITIVO exercises.length=8 (objetos-ejercicio) + 18 variantes totales, leído dinámicamente del JSON, para que Phase 31 sincronice TOTAL_EXPECTED (183 → 183+8) y los 3 hardcodes"
  - "PRES-01 cerrado: la categoría es usable en home/picker/Repaso 20/Examen sin tocar el motor"
affects: [31-cruces-multicat-integracion-lockstep, TOTAL_EXPECTED-sync, smoke-parametrico]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Verificación de boot read-only: se reproduce el path real de loadContent (validateContent({categories, exercisesByFile})) con node --input-type=module — la firma del export NO es la del node -e del plan (require + posicional); ajustada según read_first como el plan indica"

key-files:
  created:
    - .planning/phases/30-alta-de-presente-regolare-registro-slots-de-regla-variantes-/30-03-SUMMARY.md
  modified: []

key-decisions:
  - "Conteo DEFINITIVO para Phase 31 = exercises.length=8 (objetos-ejercicio), NUNCA 6. Detalle adicional: 18 variantes totales (suma de variants[]). El plan y los SUMMARYs de 30-01/30-02 trackean el grano OBJETO (N=8, '183+8'); Phase 31 decide si su hardcode TOTAL_EXPECTED (scripts/run-validation-271.mjs:170) cuenta objetos (191) o superficies/variantes (201) — ambos números quedan registrados"
  - "La firma real del export es validateContent({ categories, exercisesByFile }) (ES module), NO validateContent(content, categoryIds) posicional del node -e del plan; verificada en src/data/schema-validator.js y reproducida el path real del content-loader (boot fidedigno)"

requirements-completed: [PRES-01]

# Metrics
duration: ~4min
completed: 2026-06-17
---

# Phase 30 Plan 03: Verificación de boot/load + schema-validator + suite baseline Summary

**`presente-regolare` carga en boot y `validateContent` la acepta sin un solo error de shape (8 objetos, 18 variantes, todos `validated`); la suite baseline sigue verde (468/469, único fail = el preexistente AJENO genero-numero 12→13, NO regresión de esta fase); conteo DEFINITIVO `exercises.length=8` registrado para que Phase 31 sincronice `TOTAL_EXPECTED` (183→183+8). PRES-01 cerrado end-to-end, motor intacto.**

## Performance

- **Duration:** ~4 min
- **Tasks:** 1 (verificación read-only)
- **Files modified:** 0 (`.js` de runtime / tests) — solo se crea este SUMMARY (lockstep de counts diferido a Phase 31)

## Resultado de las verificaciones

### 1. BOOT/LOAD + SCHEMA-VALIDATOR — PASS

Se reprodujo el **path real de boot** (`loadContent` en `src/data/content-loader.js`): `validateContent({ categories, exercisesByFile })` con `categories` = `content/categories.json`.`categories` y `exercisesByFile` = `{ 'content/exercises/presente-regolare.json': content.exercises }`.

```
OK validateContent acepta presente-regolare.json (8 objetos-ejercicio)
```

- **0 errores de shape.** Todos los objetos cumplen el contrato slot+variantes: `id`/`type`/`categoryIds` presentes, `variants[]` no vacío, `explanation` a nivel de slot (SLOT-02), superficies multiple-choice (`prompt` con `___`, `options` 3-4, `correctIndex` en rango) y word-buttons (`prompt`, `answer` ≥1 token) válidas, bloque `validation` bien formado (`status`/`passes[]`/`by`/`date` ISO/`verdict`).
- `categoryIds: ["presente-regolare"]` referencia la categoría registrada (order 10) — no hay referencia a categoría desconocida.

**Nota sobre la firma:** el `node -e` del plan usaba `require('./src/data/schema-validator.js')` y la firma posicional `validate(content, cats)`. El export REAL es un ES module `export function validateContent({ categories, exercisesByFile })`. Tal como el plan instruye ("ajustar los argumentos si difiere"), se usó `node --input-type=module` con la firma de objeto real, reproduciendo fielmente el path del content-loader. El resultado (0 errores) es el mismo que ve el boot del navegador.

### 2. SUITE BASELINE — VERDE (sin regresiones nuevas)

```
# tests 469
# pass 468
# fail 1
```

- **Único fail = el preexistente AJENO** (`tests/exercise-types.test.js:1300`, subtest "12/12 ejercicios con explanation válida"):
  ```
  Esperaba 12 ejercicios en content/exercises/genero-numero.json, encontré 13
  13 !== 12
  ```
  Es el fail documentado en STATE.md y en los SUMMARYs de 30-01/30-02: el quick task `260614-hxn` separó las 3 variants de concordancia a un 13º objeto (`genero-numero-nazionalita`) sin sincronizar el hardcode `12` del test. **NO es regresión de Phase 30** — no toca `presente-regolare` ni su archivo.
- **0 fails NUEVOS atribuibles al alta.** Ningún test que itere `content/exercises/*.json` o un count table se volvió rojo por el archivo nuevo: `presente-regolare` aún NO está en `TOTAL_EXPECTED` (`scripts/run-validation-271.mjs:170` = 183) ni en `CATEGORIES_WITH_EXPLANATIONS` ni en el smoke paramétrico (eso es Phase 31/INT-02). La suite baseline sigue verde porque la categoría todavía no entra en esos arrays — exactamente el lockstep diferido del plan.
- `presente-regolare` solo aparece en `tests/backup.test.js` y `tests/data-storage.test.js` (cadena de migración v11, Phase 29) — no en tablas de conteo de contenido, por eso no hay rojo nuevo.

### 3. CONTEO DEFINITIVO PARA PHASE 31

| Grano | Valor | Sync Phase 31 |
|-------|-------|---------------|
| **objetos-ejercicio (`exercises.length`)** | **8** | `TOTAL_EXPECTED` por objetos: 183 → **183 + 8 = 191** |
| variantes totales (suma `variants[]`) | 18 | por superficies/variantes: 183 → **183 + 18 = 201** |

**El conteo canónico que Phase 31 debe consumir es `exercises.length = 8` (objetos-ejercicio)** — coherente con el frontmatter del plan ("`183 + 8`"), los SUMMARYs de 30-01/30-02 y `key-decisions`. **NUNCA "6".** Se registra además el grano variante (18) para que Phase 31 decida explícitamente qué grano cuenta su hardcode `TOTAL_EXPECTED` (`scripts/run-validation-271.mjs:170`). Ambos leídos DINÁMICAMENTE del JSON, no estimados.

### Inventario de objetos-ejercicio (input de Phase 31)

| # | id | type | # variantes | status |
|---|-----|------|-------------|--------|
| 1 | `presente-regolare-are` | multiple-choice | 3 | validated |
| 2 | `presente-regolare-ere` | multiple-choice | 2 | validated |
| 3 | `presente-regolare-ire` | multiple-choice | 2 | validated |
| 4 | `presente-regolare-isc` | multiple-choice | 3 | validated |
| 5 | `presente-regolare-velar` | multiple-choice | 2 | validated |
| 6 | `presente-regolare-palatal` | multiple-choice | 2 | validated |
| 7 | `presente-regolare-isc-wb` | word-buttons | 2 | validated |
| 8 | `presente-regolare-are-wb` | word-buttons | 2 | validated |

**8 objetos** (6 multiple-choice + 2 word-buttons) · **18 variantes** · 8/8 `validation.status: validated`.

### 4. USABILIDAD END-TO-END — CONFIRMADA

La categoría está registrada en `content/categories.json` con `{ "id": "presente-regolare", "name": "Presente indicativo (verbi regolari)", "order": 10 }` y sus 8 objetos cargan vía `validateContent` sin error. Con la categoría registrada + válida y el motor slot+variantes v1.4 intacto, el flujo home/picker/Repaso 20/Examen la incluye AUTOMÁTICAMENTE (el listado deriva de `categories.json`; el sampler consume `exerciseById`/`slotById` que `loadContent` construye para todo `categoryRegistry`). No requiere cambio de motor — PRES-01 satisfecho end-to-end.

## Threat mitigations verificadas

- **T-30-07 (DoS — boot falla si el shape no satisface el contrato):** mitigado. Este plan ejecutó el boot/load real + `validateContent` + la suite completa; `validateContent` acepta el JSON con 0 errores → el boot del navegador no fallará por shape.
- **T-30-08 (Tampering — un test que itera content/*.json se vuelve rojo por el archivo nuevo):** verificado y distinguido. El único rojo es el preexistente AJENO (genero-numero 12→13), NO un rojo nuevo por count de presente-regolare; documentado como input para Phase 31, NO parcheado aquí (preserva el lockstep).

## Deviations from Plan

None - plan ejecutado exactamente como está escrito. La única adaptación prevista por el propio plan fue ajustar la invocación de `validateContent` a su firma de export real (`{ categories, exercisesByFile }`, ES module) en lugar del `require()` posicional del snippet — el plan lo instruye explícitamente ("Confirmar la firma real del export en el read_first y ajustar los argumentos si difiere"). 0 archivos de runtime/tests modificados.

## Issues Encountered

- **Firma del `node -e` del plan inexacta:** el snippet asumía CommonJS (`require`) + firma posicional `validate(content, cats)`; el export real es ES module `validateContent({ categories, exercisesByFile })`. Resuelto reproduciendo el path real del content-loader con `node --input-type=module` (boot fidedigno). Sin impacto en el resultado.

## Next Phase Readiness

- **Phase 31 (integración lockstep):** todo listo. Conteo DEFINITIVO `exercises.length=8` (objetos) / 18 (variantes) registrado, 8/8 `validated`, boot/load verde. Phase 31 sincroniza `TOTAL_EXPECTED` (`scripts/run-validation-271.mjs:170`, hoy 183 → 183+8=191 por objetos o 183+18=201 por variantes — decisión de grano explícita en Phase 31), `CATEGORIES_WITH_EXPLANATIONS`, el conteo del smoke paramétrico (+1 entrada) y, de paso, puede resolver el fail preexistente de `genero-numero` (12→13) si entra en su scope de lockstep.
- Motor de re-verificación NO tocado (brownfield puro: verificación read-only).

## Self-Check: PASSED

- FOUND: content/exercises/presente-regolare.json (8 objetos, validateContent OK)
- FOUND: content/categories.json (presente-regolare order 10)
- FOUND: .planning/phases/30-.../30-03-SUMMARY.md
- VERIFY GATE: validateContent 0 errores + suite 468/469 (único fail preexistente AJENO genero-numero) + exercises.length=8 registrado → PASS

---
*Phase: 30-alta-de-presente-regolare-registro-slots-de-regla-variantes-*
*Completed: 2026-06-17*
