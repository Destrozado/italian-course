---
phase: quick-260629-rl3
plan: 01
subsystem: content-canciones
tags: [songs, content, quorum, S1-S5, brownfield]
provides:
  - "Canción 22-settembre jugable (7ª real) con 37 phrases validadas por quórum S1-S5"
affects:
  - "content/songs.json (índice) — 8ª entrada"
key-files:
  created:
    - content/songs/22-settembre.json
  modified:
    - content/songs.json
decisions:
  - "37 phrases: 3 estribillos + línea final extra incluidos cada vez; id de canción empieza por dígito ('22-settembre'), verificado que validateSongs y el validador lo localizan"
  - "Token numérico '22' en phrase 027; comilla interna en 018 escapada; 'ma' tras negación (030) → 'sino'"
  - "0 disputed, 0 override: contenido limpio en ambos vendors a la primera"
metrics:
  completed: "2026-06-29"
  tasks: 2
  files: 2
  disputed: 0
status: complete
---

# 22 settembre — Ultimo (quick-260629-rl3)

Añadida `22-settembre` (7ª real): 37 phrases, espejo de `bella-davvero.json`. Índice phraseCount 37.

**Validación:** quórum S1-S5 1-por-1. **37/37 validated, 0 disputed** — limpio a la primera.

**Decisiones de traducción:** `stringere/lasciare perdere`→`aferrarme/dejarlo estar`; `ridere a squarciagola`→`reír a carcajadas`; `andrò a meta`→`llegaré a la meta`; `ma vita della gente`→`sino vida de la gente`.

**Tests:** suite 473 pass / 1 fail (preexistente ajeno: genero-numero). song-validator 20/20 verde.
