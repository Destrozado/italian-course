---
phase: 11-articoli
plan: 02
subsystem: content
tags: [articoli, multiple-choice, contenido-editorial, a1]
status: complete
requires:
  - "11-01 (temario aprobado: 11-TEMARIO-ARTICOLI.md)"
provides:
  - "content/exercises/articoli.json — base multiple-choice det+indet (48 ejercicios, status pending)"
  - "content/categories.json — registro de la categoria articoli (order 8)"
affects:
  - "11-03 (anadira bloque match + bridges al mismo archivo)"
  - "11-05 (validara por quorum los 48 ejercicios pending)"
tech-stack:
  added: []
  patterns:
    - "JSON envelope { exercises: [...] } (analogo a avere.json/genero-numero.json)"
    - "multiple-choice grading por indice (D-05)"
    - "validation.status pending + passes[] vacio (D-15)"
key-files:
  created:
    - content/exercises/articoli.json
  modified:
    - content/categories.json
decisions:
  - "Registrar articoli en categories.json en este plan (no en 11-04) porque el fixture validator cruza categoryIds contra el registro — sin la entrada, la acceptance gate del propio plan falla"
requirements-completed: [ART-03, ART-04, ART-05, ART-07]
metrics:
  duration: ~15min
  completed: 2026-05-27
  tasks_completed: 3
  tasks_total: 3
  exercises: 48
---

# Phase 11 Plan 02: Bloque base multiple-choice de Articoli Summary

48 ejercicios multiple-choice que cubren el sistema completo de articulos italianos (determinativi `il/lo/l'/la/i/gli/le` + indeterminativi `un/uno/una/un'`), cada forma en su disparador fonetico, con las 7 trampas canonicas D-04 y explanations pedagogicas curadas; todos en `validation.status: pending` para el quorum posterior (11-05).

## Que se construyo

- **Tarea 1 (commit `d8fcad8`):** `content/exercises/articoli.json` creado con el bloque DETERMINATIVO, `articoli-001..034` (34 ejercicios):
  - masc sing `il` ante consonante simple (libro, ragazzo, cane, tavolo)
  - masc sing `lo` ante s+cons (studente, studio, spagnolo), z (zio, zaino, zucchero), ps (psicologo), gn (gnomo), x (xilofono)
  - masc sing `l'` ante vocal (amico, occhio, uomo, orso)
  - fem sing `la` (casa, zia, studentessa) y `l'` (amica, opera, isola)
  - masc plural `i` (libri, ragazzi) vs `gli` (studenti, zii, psicologi, gnocchi, amici, occhi)
  - fem plural `le` invariable (case, amiche, studentesse)
  - Trampas D-04 cubiertas: `lo zio`, `lo psicologo`, `lo zaino`, `gli gnocchi`, `l'amico`/`l'amica`
- **Tarea 2 (commit `049b271`):** APPEND del bloque INDETERMINATIVO, `articoli-035..048` (14 ejercicios):
  - masc `un` ante consonante (libro, ragazzo) y ante vocal SIN apostrofo (amico, occhio)
  - masc `uno` ante s+cons (studente), z (zaino), ps (psicologo), gn (gnomo)
  - fem `una` (casa, zia, studentessa) y `un'` ante vocal CON apostrofo (amica, opera, ora)
  - Trampas D-04: `uno studente`, `uno zaino`, contraste `un'amica` (apostrofo) vs `un amico` (sin apostrofo) explicito en las explanations (espejo pedagogico)

## Verificacion

- `node scripts/validate-content-fixture.mjs articoli content/exercises/articoli.json` → exit 0, 48 ejercicios validos contra el schema (prompt con `___`, options 3-4 strings, correctIndex en rango).
- Todos los ejercicios tienen `payload.explanation` no vacia.
- Todos en `validation: {status:"pending", passes:[]}`.
- Cero comillas tipograficas (apostrofes ASCII U+0027 verificado por grep Unicode).
- Explanations sin tokens markdown (`**`/`__`/`##`/backtick) ni referencias `#NNN`.
- Commit de articoli.json POSTERIOR en git al temario 11-01 (`74cd086` < `d8fcad8` < `049b271`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Registrar `articoli` en categories.json**
- **Found during:** Task 1 (verificacion)
- **Issue:** El plan instruye NO tocar categories.json (diferido a 11-04). Pero la acceptance gate del propio plan es `node scripts/validate-content-fixture.mjs articoli ...` exit 0, y ese fixture invoca `validateContent` cargando el `categories.json` real y cruzando cada `categoryIds: ["articoli"]` contra el registro. Sin la entrada, los 34 ejercicios fallaban con "referencia a categoria desconocida: articoli" y la gate no podia pasar.
- **Fix:** Anadida la unica entrada de registro `{ "id": "articoli", "name": "Articoli (artículos)", "order": 8 }` exactamente como prescribe 11-PATTERNS.md. NO se tocaron `run-validation-271.mjs` ni `tests/exercise-types.test.js` (siguen reservados a 11-04).
- **Files modified:** content/categories.json
- **Commit:** d8fcad8

## Task 3 — Checkpoint human-verify (gate blocking): APROBADO

Tarea 3 era un checkpoint `human-verify` con gate bloqueante (patron D-85): el autor revisa por bloques las explanations del bloque base. El autor respondio **"aprobado"** SIN solicitar cambios: las 48 explanations det+indet, las trampas D-04 y el contraste de apostrofo `un'amica`/`un amico` quedan fijados tal cual. No se reescribio ninguna explanation ni se reformulo ningun ejercicio; `content/exercises/articoli.json` permanece intacto respecto a las tareas 1-2.

El plan queda COMPLETO. El bloque match + bridges (11-03) y la validacion por quorum (11-05) son planes posteriores que operaran sobre este archivo.

**Nota para 11-04:** la categoria `articoli` YA esta registrada en `content/categories.json` (order 8) — registrada en este plan como deviation Rule 3 (ver arriba). El plan 11-04 NO debe volver a anadirla; solo le quedan `scripts/run-validation-271.mjs` y `tests/exercise-types.test.js`, que permanecen sin tocar.

## Self-Check: PASSED
- FOUND: content/exercises/articoli.json (48 ejercicios)
- FOUND: content/categories.json (entrada articoli order 8)
- FOUND commit: d8fcad8 (Task 1 determinativo)
- FOUND commit: 049b271 (Task 2 indeterminativo)
