---
phase: quick-260629-w7g
plan: 01
subsystem: content-canciones
tags: [songs, content, cleanup, brownfield]
provides:
  - "Bloque Canciones sin la canción de prueba; 8 canciones reales"
affects:
  - "content/songs.json (índice) — eliminada 1ª entrada (mini-prueba)"
key-files:
  deleted:
    - content/songs/mini-prueba.json
  modified:
    - content/songs.json
decisions:
  - "Borrado seguro: las únicas refs en código fuera del índice/archivo eran fixtures de tests (backup/data-storage) que usan 'mini-prueba' como clave de ejemplo en songProgress, NO cargan el contenido → no se rompen"
  - "Refs en .planning/ (docs históricos) se conservan"
metrics:
  completed: "2026-06-29"
  tasks: 1
  files: 2
status: complete
---

# Eliminar canción de prueba mini-prueba (quick-260629-w7g)

Borrada `content/songs/mini-prueba.json` (3 frases de prueba) y su entrada del índice `content/songs.json`. El bloque Canciones pasa de 9 a **8 canciones reales** (equilibrio-mentale, solo, ti-dedico-il-silenzio, bella-davvero, cuore-di-plastica, buongiorno-vita, 22-settembre, sogni-appesi).

**Tests:** suite 473 pass / 1 fail (preexistente ajeno: genero-numero). Las 8 canciones cargan y phraseCount coincide.
