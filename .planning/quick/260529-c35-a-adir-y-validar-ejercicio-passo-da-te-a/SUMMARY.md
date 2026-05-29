---
quick_id: 260529-c35
slug: a-adir-y-validar-ejercicio-passo-da-te-a
date: 2026-05-29
status: complete
---

# Summary: Añadir y validar ejercicio "Passo da te alle otto"

## Qué se hizo

Alta de `preposiciones-052` en `content/exercises/preposiciones.json`, un
multiple-choice que enseña el uso idiomático de la preposición simple **`da` +
persona = "a/en casa de"** (`Passo da te alle otto` = "Paso por tu casa a las
ocho"), la excepción que la profesora marcó como aprender de memoria. Validado por
quórum multi-modelo a `validated`.

## Ejercicio

- **prompt:** `Passo ___ te alle otto. (en español: 'Paso por tu casa a las ocho')`
- **options:** `["a", "per", "da", "in"]` — correcta: `da` (index 2)
- **explanation:** regla `da` + persona = "en casa de", con gotcha del calco
  hispanohablante `por`→`per`.

## Decisiones de diseño (R1-R7)

- **R6 (un punto):** `da` simple con pronombre tónico. Distinto de
  `preposiciones-040` (`dai cugini`) y `-042` (`dalle zie`), que cubren
  `da` + articolata.
- **R7/C2 (doble-validez `da` vs `per`):** se aplicó la técnica estrella ya
  validada en `preposiciones-051` — incluir la traducción española objetivo en el
  prompt. Fija el significado ("en casa de"), que solo `da` expresa, sin filtrar la
  regla gramatical → no viola R1/C5. Sonnet confirmó en su razonamiento que el
  gloss hace el trabajo de desambiguación frente a la lectura coloquial de
  `passo per te`.

## Validación (quórum)

1-por-1, fresh context, prompt self-contained R1-R7→C1-C5 (skill
`gsd-validate-exercise`):

| Pase | by | verdict | concerns |
|------|-----|---------|----------|
| 1 | claude-opus-4-8 | correcta | [] |
| 2 | claude-sonnet-4-6 | correcta | [] |

`deriveStatus()` → **validated** (≥2 `by` distintos, cero `incorrecta`).

## Gates verificados

- `node -e` JSON.parse OK (52 ejercicios en preposiciones).
- `node scripts/validate-content-fixture.mjs preposiciones …` → exit 0.
- `node --test tests/*.test.js` → 266 PASS / 0 fail (bump `expected` 51→52 en
  `CATEGORIES_WITH_EXPLANATIONS`).
- `VAL_07_STRICT=1 node --test tests/*.test.js` → 275 PASS / 0 fail.
- `node scripts/run-validation-271.mjs` → **Milestone gate PASS** (bump
  `expected` 51→52 y `TOTAL_EXPECTED` 372→373).

## Archivos tocados

- `content/exercises/preposiciones.json` — +preposiciones-052 (validated).
- `tests/exercise-types.test.js` — preposiciones expected 51→52.
- `scripts/run-validation-271.mjs` — preposiciones expected 51→52, TOTAL 372→373.
- `.planning/STATE.md` — sección Quick Tasks Completed.
- `.planning/quick/260529-c35-…/` — PLAN.md + SUMMARY.md.

## Estado final

DONE — `preposiciones-052` existe y está `validated`; todas las gates en verde.
