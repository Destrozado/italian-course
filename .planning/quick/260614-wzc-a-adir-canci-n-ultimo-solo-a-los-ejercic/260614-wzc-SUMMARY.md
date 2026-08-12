---
phase: quick-260614-wzc
plan: 01
subsystem: contenido / canciones
tags: [contenido, canciones, ultimo, traduccion]
status: complete
prior_status: shipped
requires: [content/songs/equilibrio-mentale.json (formato de referencia)]
provides: ["content/songs/solo.json", "entrada 'solo' en content/songs.json"]
affects: [tests/song-validator.test.js (lockstep + validateSongs sobre el repo)]
tech-stack:
  added: []
  patterns: ["JSON de canción id/title/phrases con answer troceado por palabras y categoryIds []"]
key-files:
  created: ["content/songs/solo.json"]
  modified: ["content/songs.json"]
decisions:
  - "Letra EXACTA aportada por el autor en el prompt (no la versión de memoria del modelo): la canción empieza 'Oggi mi chiudo di nuovo...'"
  - "Agrupación ~2 versos por frase en estrofas (como equilibrio-mentale); las líneas del estribillo se trocean una por frase por ser largas y distintas"
  - "Estribillos repetidos NO se deduplican: coro 1 (solo-007..015) y coro 2 (solo-022..029) se materializan verbatim"
  - "'е' cirílica (U+0435) de 'Non ci riesco' normalizada a 'e' latina (U+0065)"
  - "'vole' (no estándar) en solo-019 se conserva tal como lo pasó el autor; se traduce por su sentido ('quiere')"
metrics:
  duration: ~1 min
  completed: 2026-06-14
---

# Quick 260614-wzc: Añadir canción "Solo — Ultimo" Summary

Canción "Solo — Ultimo" añadida al banco de ejercicios de traducción italiano→español: **34 frases** con prompt italiano y answer troceado palabra por palabra, registrada en el índice en lockstep, validador en verde.

## Qué se hizo

- **Task 1 — `content/songs/solo.json`** (commit `fcf4185`): documento de canción replicando el formato de `equilibrio-mentale.json` (mismas claves, orden, indentación 2 espacios, `answer`/`categoryIds` en una línea). `id: "solo"`, `title: "Solo — Ultimo"`, 34 frases con ids secuenciales `solo-001`..`solo-034`. Cada frase: prompt italiano (acentos/apóstrofos conservados), answer español troceado en tokens sin puntuación interna, `categoryIds: []`.
- **Task 2 — `content/songs.json`** (commit `174eb1f`): registrada la entrada `{ "id": "solo", "title": "Solo — Ultimo", "phraseCount": 34 }` en lockstep con el documento.

## Corrección importante

El primer pase del executor generó una letra DISTINTA (recordada de memoria, "Quante volte ti ho cercato in un sorriso...") porque la letra literal no llegó al PLAN.md. Se detectó en revisión y se reescribió `solo.json` con la letra EXACTA que aportó el autor. Los commits del executor (`57d2da8`, `1167f47`) se descartaron vía `git reset --soft` y se rehízo el contenido correcto.

## Validación

- `node --test tests/song-validator.test.js` → **17/17 PASS, 0 fail** (incluye `validateSongs` sobre el repo real + lockstep `phraseCount === phrases.length` y match de title).
- Cirílico: `grep -cP '[\x{0400}-\x{04FF}]' content/songs/solo.json` → **0**.
- IDs únicos: 34/34.
