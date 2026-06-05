---
phase: 18-migraci-n-7-8-reset-selectivo-articoli-partitivos
verified: 2026-06-04T00:00:00Z
status: passed
score: 8/8 must-haves verified
overrides_applied: 0
---

# Phase 18: Migración `7→8` (reset selectivo articoli + partitivos) — Informe de Verificación

**Phase Goal:** El state migra de `schemaVersion 7` a `8` reseteando el progreso SOLO de Articoli y Partitivi (las otras 7 categorías conservan su progreso byte-intacto), dejando libre la renumeración de ids que harán las dos fases de contenido — replicando el patrón de `migrate6to7`/`hydrateV7` del piloto pero con DOS categorías reseteadas a la vez en una sola migración.
**Verificado:** 2026-06-04
**Estado:** PASSED
**Re-verificación:** No — verificación inicial

---

## Logro del Objetivo

### Verdades Observables

| # | Verdad | Estado | Evidencia |
|---|--------|--------|-----------|
| 1 | Tras migrate7to8, el progreso de articoli queda reseteado (categoryProgress borrado, exerciseStats podado, racha 0) | ✓ VERIFICADO | `storage.js:723` — `delete categoryProgress.articoli`; filtro `!k.startsWith('articoli')` en línea 732; test `migrate7to8 borra categoryProgress.articoli y partitivos` verde (358/358) |
| 2 | Tras migrate7to8, el progreso de partitivos queda reseteado (categoryProgress borrado, exerciseStats podado, racha 0) | ✓ VERIFICADO | `storage.js:724` — `delete categoryProgress.partitivos`; filtro `!k.startsWith('partitivos')` en línea 732; test `migrate7to8 poda exerciseStats con prefijo articoli y partitivos` verde |
| 3 | Las otras 7 categorías (avere, essere, preposiciones, verbos-movimiento, sustantivos-irregulares, genero-numero, profesiones) conservan categoryProgress y exerciseStats byte-idénticos pre/post migración | ✓ VERIFICADO | Test D-04 `no-regresión D-04: las 7 categorías no-reseteadas quedan byte-idénticas` — fixture con las 9 categorías, assert.deepEqual por categoría, verde; ningún prefijo colisiona con `articoli`/`partitivos` |
| 4 | migrate7to8 invalida inFlightTest si contiene algún id que empieza por articoli o partitivos; lo preserva si no | ✓ VERIFICADO | `storage.js:739-741` — predicado `id.startsWith('articoli') \|\| id.startsWith('partitivos')`; tests `invalida inFlightTest que referencia ids de articoli o partitivos` y `preserva inFlightTest que NO toca articoli ni partitivos` verdes |
| 5 | migrate7to8 es idempotente y puro (no muta el input) y no contamina el prototipo global | ✓ VERIFICADO | Deep-clone defensivo `JSON.parse(JSON.stringify(...))` por sub-dict en líneas 720-721, 727-728, 748, 751; tests `es idempotente`, `es puro (no muta el input)`, `anti-prototype-pollution` verdes |
| 6 | backup.js exporta v8 y un export v8 se reimporta sin error de versión más nueva | ✓ VERIFICADO | `backup.js:42` — `CURRENT_SCHEMA_VERSION = 8`; `backup.js:112` — guard `> CURRENT_SCHEMA_VERSION`; test `round-trip v8: export → import sin "versión más nueva"` verde; `wrapper.schemaVersion === 8` y `r.state.schemaVersion === 8` |
| 7 | Un backup v7 importado migra a v8 reseteando articoli+partitivos; un backup con schemaVersion > 8 se rechaza | ✓ VERIFICADO | `backup.js:127-128` — eslabón `if (migrated.schemaVersion === 7) migrated = migrate7to8(migrated)` + `migrated = hydrateV8(migrated)`; test `import de backup v7 → state v8 con articoli/partitivos reseteados (D-06)` y test `rejects future schemaVersion > 8` (fixture schemaVersion 9) verdes |
| 8 | La suite completa (baseline + nuevos tests v8) pasa con node --test tests/*.test.js | ✓ VERIFICADO | `node --test tests/*.test.js`: **358/358 pass, 0 fail** (baseline 342 + 16 nuevos tests v8) |

**Puntuación: 8/8 verdades verificadas**

---

## Criterios de Éxito del Roadmap

### SC-1: migrate7to8 + hydrateV8 (idempotente + deep-clone defensivo anti-prototype-pollution) — reset de articoli Y partitivos
**Estado: VERIFICADO**

- `storage.js` línea 718: `export function migrate7to8(v7)`
- `storage.js` línea 779: `export function hydrateV8(parsed)`
- Deep-clone: `JSON.parse(JSON.stringify(...))` por sub-dict (líneas 720-721, 727-728, 748, 751, 753)
- Dos `delete` explícitos (líneas 723-724) + filtro de doble prefijo (línea 732)
- inFlightTest: predicado OR con ambos prefijos (línea 740)
- 13 tests nuevos en `tests/data-storage.test.js` cubriendo reset, idempotencia, pureza, anti-prototype-pollution, inFlightTest, hydrateV8 sin poda, cadena completa

### SC-2: Las otras 7 categorías conservan su progreso byte-intacto (verificable por test)
**Estado: VERIFICADO**

- Test D-04 `no-regresión D-04` (línea 1061 de `tests/data-storage.test.js`): fixture con las 9 categorías completas, `assert.deepEqual` por cada una de las 7 preservadas (categoryProgress + exerciseStats × 2 claves por categoría). Verde.
- Seguridad de prefijo documentada en JSDoc de `migrate7to8` (líneas 698-703): ningún id de las otras 7 empieza por `articoli` ni `partitivos`.

### SC-3: backup.js exporta v8 reimportable; backup v7 migra a v8 reseteando articoli+partitivos; backups >8 rechazados
**Estado: VERIFICADO**

- `backup.js:26` — `migrate7to8, hydrateV8` importados de `./storage.js`
- `backup.js:42` — `CURRENT_SCHEMA_VERSION = 8` (espejo inline)
- `backup.js:127-128` — eslabón v7→v8 + hydrate final a v8
- `backup.js:112` — guard `state.schemaVersion > CURRENT_SCHEMA_VERSION` cubre >8 automáticamente
- Test `round-trip v8` (schemaVersion 8 ida y vuelta), test `import de backup v7 → state v8` (articoli/partitivos reseteados, avere preservado), test `rejects future schemaVersion > 8` (fixture 9, rechazado con "versión más nueva") — todos verdes

### SC-4: La app arranca limpia sobre el state migrado y los tests siguen verdes (los 342 baseline + los nuevos de la cadena v8)
**Estado: VERIFICADO**

- `node --test tests/*.test.js` ejecutado: **358/358 pass, 0 fail, 0 cancelled, 0 skipped**
- `CURRENT_SCHEMA_VERSION = 8` en `storage.js` (línea 35) — `blankState()` devuelve schemaVersion 8
- Cadena `migrate()` completa en `storage.js:140-155`: `1→2→3→4→5→6→7→migrate7to8→hydrateV8`
- `blankState()` assert en `backup.test.js:93` sincronizado a 8

---

## Artefactos Requeridos

| Artefacto | Descripción esperada | Estado | Detalles |
|-----------|----------------------|--------|----------|
| `src/data/storage.js` | migrate7to8 + hydrateV8 + CURRENT_SCHEMA_VERSION = 8 + eslabón en migrate() | ✓ VERIFICADO | Líneas 35, 149-150, 718, 779 — todas presentes y sustantivas |
| `src/data/backup.js` | CURRENT_SCHEMA_VERSION espejo = 8 + eslabón migrate7to8/hydrateV8 en parseBackupFile + import actualizado | ✓ VERIFICADO | Líneas 26, 42, 127-128 — presentes y correctas |
| `tests/data-storage.test.js` | Bloque describe v8 con 13 tests + helper v7WithArticoliPartitivos + test D-04 reforzado | ✓ VERIFICADO | Líneas 862-1107 — 13 tests + helper + test D-04, todos verdes |
| `tests/backup.test.js` | Bloque v8 round-trip + import v7→v8 con reset + sync de asserts de versión a 8 + forward-compat con fixture 9 | ✓ VERIFICADO | Líneas 303-382 (bloque v8), línea 427 (forward-compat con schemaVersion 9), líneas 93, 121, 155, 175, 196, 242, 282 sincronizadas a 8 |

---

## Verificación de Eslabones Clave (Key Links)

| Desde | Hacia | Via | Estado | Evidencia |
|-------|-------|-----|--------|-----------|
| `storage.js migrate()` | `migrate7to8 + hydrateV8` | `if (s.schemaVersion === 7) s = migrate7to8(s)` + `if (s.schemaVersion === 8) return hydrateV8(s)` | ✓ CONECTADO | Líneas 149-150 de `storage.js` — eslabón fall-through correcto |
| `backup.js parseBackupFile` | `migrate7to8 + hydrateV8` (importados de storage.js) | `if (migrated.schemaVersion === 7) migrated = migrate7to8(migrated)` + `migrated = hydrateV8(migrated)` | ✓ CONECTADO | Líneas 127-128 de `backup.js` — eslabón insertado antes del hydrate final |

---

## Traza de Flujo de Datos (Nivel 4)

No aplica — esta fase es pura migración de datos (funciones puras, sin componentes de UI que rendericen datos dinámicos). Las funciones exportadas son utilities testeables directamente; no hay flujo de estado a capa de presentación en esta fase.

---

## Spot-Checks de Comportamiento

| Comportamiento | Comando | Resultado | Estado |
|----------------|---------|-----------|--------|
| Suite completa verde tras migración | `node --test tests/*.test.js` | 358/358 pass, 0 fail | ✓ PASS |
| export function migrate7to8 existe en storage.js | `grep -q "export function migrate7to8" src/data/storage.js` | encontrado línea 718 | ✓ PASS |
| export function hydrateV8 existe en storage.js | `grep -q "export function hydrateV8" src/data/storage.js` | encontrado línea 779 | ✓ PASS |
| CURRENT_SCHEMA_VERSION = 8 en storage.js | línea 35 de storage.js | `const CURRENT_SCHEMA_VERSION = 8;` | ✓ PASS |
| CURRENT_SCHEMA_VERSION = 8 en backup.js | línea 42 de backup.js | `const CURRENT_SCHEMA_VERSION = 8;` | ✓ PASS |
| migrate7to8 importado en backup.js | línea 26 de backup.js | `import { ..., migrate7to8, hydrateV8 } from './storage.js'` | ✓ PASS |
| Forward-compat usa schemaVersion 9 en el fixture | líneas 430-431 de backup.test.js | `schemaVersion: 9` en wrapper y state | ✓ PASS |

---

## Cobertura de Requisitos

| Requisito | Plan | Descripción | Estado | Evidencia |
|-----------|------|-------------|--------|-----------|
| MIG-01 | 18-01 | migrate7to8 + hydrateV8 idempotente, deep-clone defensivo, reset SOLO de articoli+partitivos, las otras 7 byte-intactas | ✓ SATISFECHO | Implementación completa en storage.js + 13 tests nuevos + test D-04 verde |
| MIG-02 | 18-01 | backup.js round-trip v8; import backup v7 migra a v8 reseteando articoli+partitivos; >8 rechazados | ✓ SATISFECHO | Implementación completa en backup.js + tests round-trip/import v7/forward-compat verdes |

**Notas:** MIG-01 y MIG-02 estaban ya marcados como `[x]` (Complete) en REQUIREMENTS.md. Sin requisitos huérfanos — la tabla de trazabilidad mapea los 9 requisitos de v1.5 a fases (MIG→18, ART→19, PART→20) sin gaps.

---

## Cumplimiento del Gate TDD

| Tarea | Commit RED (test) | Commit GREEN (feat) | Orden correcto |
|-------|-------------------|---------------------|----------------|
| Task 1 (storage.js) | `465afc1` — `test(18-01): add failing tests for migrate7to8 + hydrateV8 reset selectivo` | `39fc7e8` — `feat(18-01): implement migrate7to8 + hydrateV8 + bump CURRENT_SCHEMA_VERSION=8` | ✓ test precede feat |
| Task 2 (backup.js) | `9e460d5` — `test(18-01): add failing tests for backup round-trip v8 + import v7->v8` | `b5380e5` — `feat(18-01): extend backup.js to round-trip v8 + import v7->v8 with reset` | ✓ test precede feat |

Gate TDD: CUMPLIDO (ciclo RED→GREEN con commits separados en ambas tareas).

---

## Anti-Patrones Detectados

| Archivo | Línea | Patrón | Severidad | Impacto |
|---------|-------|--------|-----------|---------|
| — | — | — | — | Ninguno detectado |

Se verificó la ausencia de TBD/FIXME/XXX sin referencia, return null/[]/{} en flujos de datos reales, y props hardcodeadas vacías. Las funciones devuelven objetos completos con todos los sub-dicts garantizados. El único `hydrateV7` que queda importado en `backup.js` pero no referenciado por la cadena es comportamiento documentado y esperado (backward-compat, según plan).

---

## Verificación Humana Requerida

Ninguna. Todos los criterios son verificables programáticamente:

- Reset de datos: cubierto por tests de Node.js (assert.equal sobre claves ausentes + assert.deepEqual byte a byte)
- Idempotencia, pureza y anti-prototype-pollution: cubiertos por tests
- Round-trip de backup: cubierto por tests
- Arranque de la app: la suite verde (358/358) confirma que el module graph arranca limpio

No hay comportamiento de UI en esta fase (D-01: sin guard ni banner). Sin interacción de usuario que verificar.

---

## Resumen de Decisiones del Contexto (D-01..D-06)

| Decisión | Estado |
|----------|--------|
| D-01: Fase shippeable sola sin guard/banner de conversión; suite verde | ✓ Cumplido — sin UI nueva; 358/358 pass |
| D-02: Reset por prefijo de id (articoli* + partitivos*) en categoryProgress, exerciseStats e inFlightTest | ✓ Cumplido — los tres mecanismos implementados y testados |
| D-03: Seguridad de prefijo — las otras 7 categorías no colisionan | ✓ Cumplido — test D-04 con fixture de 9 categorías confirma ausencia de colisiones |
| D-04: Test reforzado de no-regresión con fixture de 9 categorías | ✓ Cumplido — test en línea 1061 de data-storage.test.js, verde |
| D-05: CURRENT_SCHEMA_VERSION = 8 espejo en ambos archivos; round-trip v8; >8 rechazados | ✓ Cumplido — ambas constantes sincronizadas, round-trip y reject testados |
| D-06: Import de backup v7 con progreso de articoli/partitivos — se pierde por diseño | ✓ Cumplido — test `import de backup v7 → state v8` verifica el reset sobre datos del backup viejo |

---

_Verificado: 2026-06-04_
_Verificador: Claude (gsd-verifier)_
