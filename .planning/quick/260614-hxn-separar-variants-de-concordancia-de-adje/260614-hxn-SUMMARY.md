---
quick_id: 260614-hxn
title: "Separar variants de concordancia de adjetivo de la categoría essere"
status: shipped
type: execute
date: 2026-06-14
files_modified:
  - content/exercises/essere.json
  - content/exercises/genero-numero.json
requirements: [QUICK-260614-hxn]
commits:
  - 983ade4: "refactor(quick-260614-hxn-01): reducir essere-nacionalidad a 3 variants de verbo"
  - ea91936: "feat(quick-260614-hxn-02): añadir bloque genero-numero-nazionalita"
metrics:
  tasks: 2
  files: 2
---

# Quick Task 260614-hxn: Separar variants de concordancia de adjetivo de essere — Summary

Desacoplada la concordancia de adjetivo de nacionalidad de la conjugación de essere: las 3 variants que prueban el adjetivo (italiano/italiani/italiane) se movieron verbatim de `essere-nacionalidad` a un bloque nuevo `genero-numero-nazionalita` con `categoryIds: ["genero-numero"]`, de modo que un fallo de concordancia ya resetea género/número y no essere.

## What Was Done

### Task 1 — Reducir essere-nacionalidad a 3 variants de verbo (commit 983ade4)

- Eliminadas del array `variants` las 3 entradas de concordancia de adjetivo ("Marco è ___ di Firenze.", "Marco e Luca sono ___.", "Anna e Giulia sono ___.").
- Conservadas verbatim las 3 variants de verbo: "Io ___ spagnolo." (sono), "Lei ___ italiana di Milano." (è), "Loro ___ tedeschi." (sono).
- `explanation` reescrita para enfocarse SOLO en essere predicativo (essere vs avere como trampa A1; el verbo concuerda en persona/número con el sujeto; di + ciudad para origen). Retirado todo el material de ortografía/concordancia del adjetivo (no-capitalización, género spagnolo/spagnola, plural -co→-chi tedesco/tedeschi, nunca -s). Respetada R1 (sin leak: no se nombran las formas sono/è en prosa de modo que delaten el hueco) y sin refs #NNN.
- `validation` marcada para re-validar: `status: "pending"`, `passes: []` (retirados los pases Opus 4.7 + Sonnet 4.6 previos, ya no aplican porque cambió el contenido).

### Task 2 — Añadir bloque genero-numero-nazionalita (commit ea91936)

- Bloque nuevo insertado junto a los bloques `femminile-*` de concordancia en `genero-numero.json`, en el formato compacto del archivo (options en una línea, passes en una línea).
- `id`: `genero-numero-nazionalita` (único; no choca con los 12 ids existentes).
- `type`: `multiple-choice`; `categoryIds`: `["genero-numero"]` — la atribución del fallo va aquí, NO a essere.
- 3 variants de concordancia preservadas VERBATIM (prompt/options/correctIndex exactos del bloque origen): "Marco è ___ di Firenze." correctIndex 1; "Marco e Luca sono ___." correctIndex 1; "Anna e Giulia sono ___." correctIndex 2.
- `explanation` hereda el material de concordancia + ortografía que salió de essere (patrón -o/-a/-i/-e; nacionalidades no se capitalizan; di + ciudad; -co→-chi tedeschi; nunca -s). Canon editorial: español acentuado, plain text, apóstrofes ASCII U+0027, rule-first. R1 sin leak; sin refs #NNN. R5: cada variant trae 4 distractores genuinamente distintos (las 4 formas), preservados al mover.
- `validation`: `status: "pending"`, `passes: []`.

## Verification

- `node -e JSON.parse` sobre ambos archivos: sin error.
- `node scripts/validate-content-fixture.mjs essere content/exercises/essere.json` → exit 0 (26 ejercicios).
- `node scripts/validate-content-fixture.mjs genero-numero content/exercises/genero-numero.json` → exit 0 (13 ejercicios).
- essere-nacionalidad: 3 variants de verbo, 0 de adjetivo, status pending, passes [].
- genero-numero-nazionalita: 3 variants de adjetivo verbatim, categoryIds ["genero-numero"], status pending, passes [].

La re-validación por quórum (gsd-validate-exercise) NO se ejecutó: este task solo marca ambos bloques como pending para que el autor sepa re-validarlos.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- FOUND: content/exercises/essere.json
- FOUND: content/exercises/genero-numero.json
- FOUND commit: 983ade4
- FOUND commit: ea91936
