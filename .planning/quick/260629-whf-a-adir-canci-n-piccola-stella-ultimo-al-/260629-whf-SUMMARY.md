---
phase: quick-260629-whf
plan: 01
subsystem: content-canciones
tags: [songs, content, quorum, S1-S5, disputed-resolved, brownfield]
provides:
  - "Canción piccola-stella jugable (9ª real) con 42 phrases validadas por quórum S1-S5"
affects:
  - "content/songs.json (índice) — nueva entrada"
key-files:
  created:
    - content/songs/piccola-stella.json
  modified:
    - content/songs.json
decisions:
  - "42 phrases: estribillo (x2) + puente + estribillo final (x4) incluidos cada vez; generada vía script por la repetición de 'Sei la piccola stella che porto / Nei momenti in cui non ho luce'"
  - "FIX real (009): 'Sei risorsa'→'eres un recurso' (el español requiere artículo; ambos vendors lo pidieron); re-validado 2 vendors correcta"
metrics:
  completed: "2026-06-29"
  tasks: 2
  files: 2
  disputed: 1
  disputed_resolved: 1
---

# Piccola stella — Ultimo (quick-260629-whf)

Añadida `piccola-stella` (9ª real): 42 phrases, espejo de `bella-davvero.json`, generada vía script por la repetición del estribillo. Índice phraseCount 42.

**Validación:** quórum S1-S5 1-por-1. Resultado final **42/42 validated, 0 disputed**, tras resolver 1 disputada (bug real, ambos vendors): 009 `Sei risorsa`→`eres un recurso` (el español requiere artículo).

**Tests:** suite 473 pass / 1 fail (preexistente ajeno: genero-numero). Las 9 canciones cargan y phraseCount coincide.
