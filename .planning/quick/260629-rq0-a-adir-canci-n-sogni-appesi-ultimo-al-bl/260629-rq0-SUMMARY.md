---
phase: quick-260629-rq0
plan: 01
subsystem: content-canciones
tags: [songs, content, quorum, S1-S5, disputed-resolved, brownfield]
provides:
  - "Canción sogni-appesi jugable (8ª real) con 84 phrases validadas por quórum S1-S5"
affects:
  - "content/songs.json (índice) — 9ª entrada"
key-files:
  created:
    - content/songs/sogni-appesi.json
  modified:
    - content/songs.json
decisions:
  - "84 phrases (la más larga): generada vía script por la fuerte repetición (3 estribillos + 3 puentes); variantes con/sin 'E' inicial y 'Io vivo' preservadas verbatim"
  - "FIX real (019): 'Gli ho urlato di odiarlo contro' → mood corregido a subjuntivo 'le grité que lo odiara'; 'contro' (adverbial intensificador) folded — ambos vendors convergieron en esta forma tras 3 iteraciones"
  - "FIX real (024): 'Gli chiedo di ridere insieme' → 'le pido que riamos juntos' (la forma con infinitivo era agramatical)"
  - "Oráculo Opus (024): falso-positivo S4 sobre 'riamos' — subjuntivo de reír es llana terminada en -s con diptongo, sin tilde (el hiato acentuado es del indicativo 'reímos')"
metrics:
  completed: "2026-06-29"
  tasks: 2
  files: 2
  disputed: 2
  disputed_resolved: 2
status: complete
---

# Sogni appesi — Ultimo (quick-260629-rq0)

Añadida `sogni-appesi` (8ª real): 84 phrases (verso largo + 3 estribillos + 3 puentes + verso rap), espejo de `bella-davvero.json`, **generada vía script** por la repetición. Índice phraseCount 84.

**Validación:** quórum S1-S5 1-por-1. Resultado final **84/84 validated, 0 disputed**, tras resolver 2 disputadas (ambos vendors `incorrecta` = bugs reales que yo subtraduje):

| Phrase | Bug | Resolución |
|--------|-----|-----------|
| 019 `di odiarlo contro` | mood (orden→subjuntivo) | FIX → `le grité que lo odiara` (convergencia de ambos vendors; `contro` folded) |
| 024 `di ridere insieme` | infinitivo agramatical + acento | FIX → `le pido que riamos juntos`; oráculo Opus sobre falso-positivo S4 `riamos` |

**Tests:** suite 473 pass / 1 fail (preexistente ajeno: genero-numero). song-validator 20/20 verde.
