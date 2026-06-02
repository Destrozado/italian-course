---
phase: 11-articoli
plan: 03
subsystem: content
tags: [articoli, match, bridges, multi-category, cascade-D54]
requires: ["11-02 (articoli-001..048 base multiple-choice)"]
provides:
  - "Bloque match articolo<->sustantivo (articoli-049 determinativo, articoli-050 indeterminativo)"
  - "6 bridges multi-categoria articoli-300..305 (articoli<->genero-numero + articoli<->sustantivos-irregulares)"
  - "content/exercises/articoli.json en conteo FINAL = 56 ejercicios"
affects:
  - "Plan 11-04: debe propagar el conteo final 56 a los 3 puntos de integracion (categories.json, run-validation-271.mjs CATEGORIES+TOTAL_EXPECTED, tests/exercise-types.test.js CATEGORIES_WITH_EXPLANATIONS)"
tech-stack:
  added: []
  patterns:
    - "match con duplicados textuales en columna derecha (D-66)"
    - "bridge multiple-choice categoryIds:[A,B] -> cascada D-54 heredada (sin codigo nuevo)"
key-files:
  created: []
  modified:
    - "content/exercises/articoli.json (append: 2 match + 6 bridges)"
decisions:
  - "Match blocks numerados articoli-049/050 (continuan numeracion base, NO rango 300 reservado a bridges)"
  - "Conteo final 56 (2 match + 6 bridges sobre los 48 base); ligeramente sobre el ~45-55 orientativo por incluir 2 match blocks, dentro de la densidad objetivo (D-12)"
metrics:
  duration: ~10min
  completed: 2026-05-27
---

# Phase 11 Plan 03: Match articolo<->sustantivo + Bridges multi-categoria Summary

Anadidos por append a `content/exercises/articoli.json` el bloque `match` articolo<->sustantivo (mas profundo que genero-numero: lo/gli/uno + plurales + trampas) y los 6 bridges multi-categoria `articoli-300..305` que cruzan Articoli con genero-numero y sustantivos-irregulares (patron avere-302), todos con explanation curada en status pending. El archivo queda en su **conteo FINAL: 56 ejercicios**.

## CONTEO FINAL DEL ARCHIVO (para plan 11-04)

**`content/exercises/articoli.json` = 56 ejercicios.**

Desglose: 48 base multiple-choice (11-02) + 2 match (049, 050) + 6 bridges (300..305).

Este `<N>=56` es el numero que el plan 11-04 debe propagar identico a los 3 puntos de integracion:
- `content/categories.json` (entry articoli order 8 — ya registrada en 11-02 como deviation)
- `scripts/run-validation-271.mjs`: `CATEGORIES[]` entry `articoli expected:56` + `TOTAL_EXPECTED` 272 -> 328
- `tests/exercise-types.test.js`: `CATEGORIES_WITH_EXPLANATIONS` entry `{ file:'content/exercises/articoli.json', expected:56 }`

## Trabajo realizado

### Task 1 — Bloque match articolo<->sustantivo (commit a68e89a)
- **articoli-049** (determinativo avanzado): pairs studente/zio/psicologo->lo, gnocchi/amici/zii->gli, libri->i. 3 valores distintos columna derecha (lo, gli, i) cumple R3; duplicados intencionales (D-66, lo x3 / gli x3). Va mas profundo que genero-numero-208 (que solo cubre il/la/l' singular). Explanation ensena la regla agrupada (z-/s+cons-/ps-/gn- disparan lo en singular, gli en plural).
- **articoli-050** (indeterminativo): pairs studente/zaino->uno, amico/libro->un, amica->un', casa->una. 4 valores distintos (uno, un, un', una). Cubre la trampa #7 del temario (un'amica con apostrofo vs un amico sin apostrofo).
- DESIGN RULE respetada: match solo para articolo<->sustantivo (no derivable por raiz).

### Task 2 — 6 bridges multi-categoria articoli-300..305 (commit d6daf4c)
- **Cruce articoli<->genero-numero** (articoli-300/301/302): le ragazze (plural fem), gli studenti (plural de lo), i libri (plural de il). Cruza la regla del articulo con la concordancia numero/genero.
- **Cruce articoli<->sustantivos-irregulares** (articoli-303/304/305): le braccia (sing masc braccio -> plural fem), le uova (sing masc l'uovo -> plural fem), gli zii (plural de lo zio). Espejo del modelo avere-302.
- Cada bridge: `categoryIds:["articoli", X]` exactamente 2 slugs (articoli primero), explanation que cubre AMBAS dimensiones del cruce.
- Solo los 2 cruces permitidos (D-10): NO profesiones ni preposiciones.
- Cascada D-54 heredada: fallar un bridge resetea ambas categorias por `categoryIds:[A,B]`, sin codigo nuevo (D-11).

## Verificacion

- `node scripts/validate-content-fixture.mjs articoli content/exercises/articoli.json` -> exit 0 (56 ejercicios).
- Match: 2 bloques, >=3 valores distintos cada uno, incluyen lo/gli/uno/un' (profundidad D-06).
- Bridges: 6 con regex `^articoli-3\d\d$`, todos categoryIds[2] con articoli primero, cruces EXACTAMENTE genero-numero + sustantivos-irregulares (ambos presentes, ninguno ilegal).
- Todos los nuevos ejercicios en `validation:{status:"pending",passes:[]}` para el quorum del plan 11-05.

## Deviations from Plan

None - plan ejecutado tal como esta escrito. El conteo final 56 quedo ligeramente por encima del centro del rango orientativo ~45-55 por incluir 2 match blocks (determinativo + indeterminativo), ambos no redundantes; dentro de la densidad objetivo (tipo Preposiciones/Profesiones, D-12).

## Known Stubs

None. Todos los ejercicios tienen prompt, options/pairs, correctIndex y explanation curada reales. El unico estado pendiente es `validation.status:"pending"`, que es el flujo previsto (flip a validated lo hace el quorum en 11-05, D-15).

## Checkpoint Task 3 — APROBADO

Task 3 era un `checkpoint:human-verify` (gate blocking, auto_advance OFF). El autor reviso match + bridges y respondio **"aprobado"** el 2026-05-27, CONFIRMANDO el conteo total final = **56 ejercicios** sin solicitar cambios. Estado: **APPROVED / COMPLETE**.

El conteo canonico confirmado (56) es el que el plan 11-04 debe propagar identico a los 3 puntos de integracion (categories.json, run-validation-271.mjs CATEGORIES+TOTAL_EXPECTED, tests/exercise-types.test.js CATEGORIES_WITH_EXPLANATIONS).

## Self-Check: PASSED

- `content/exercises/articoli.json` -> FOUND (56 ejercicios, verificado en disco).
- Commit a68e89a (match) -> FOUND.
- Commit d6daf4c (bridges) -> FOUND.
- Commit 3335c7b (SUMMARY) -> FOUND.
- Checkpoint Task 3 aprobado por el autor, conteo 56 confirmado y registrado.
