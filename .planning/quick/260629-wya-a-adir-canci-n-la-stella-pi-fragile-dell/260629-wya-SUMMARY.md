---
phase: quick-260629-wya
plan: 01
subsystem: content-canciones
tags: [songs, content, quorum, S1-S5, disputed-resolved, brownfield]
provides:
  - "Canción la-stella-piu-fragile jugable (10ª real) con 49 phrases validadas por quórum S1-S5"
affects:
  - "content/songs.json (índice) — nueva entrada"
key-files:
  created:
    - content/songs/la-stella-piu-fragile.json
  modified:
    - content/songs.json
decisions:
  - "49 phrases: marcadores '…' de sección eliminados de los prompts (no son verso cantado); estribillos + finales incluidos cada vez; variantes verbatim (Se/E se riniziasse, Non/Io non chiederei, che indossi/che lasci)"
  - "Generada vía script por la repetición. id con dígitos/ASCII: 'la-stella-piu-fragile'"
  - "Quórum corregido a deepseek-chat + deepseek-reasoner (2 vendors distintos garantizados) tras un driver previo con bug de shell (read_by no sustituía \\$1 → 2º pase caía en deepseek-chat y sobreescribía el 1º)"
  - "FIX real (010): 'come si declina'→'como declina' (sin tilde: comparativo/modal, no interrogativo)"
  - "Oráculo Opus en 3 falsos-positivos de DeepSeek-reasoner: 013 'riniziasse' (verbo italiano válido, letra real; 037 idéntica validó), 018 'decirte' (llana terminada en vocal, sin tilde; 042 idéntica validó), 029 'Che poi'→'además' (marcador discursivo, consistente con 001/019/043)"
metrics:
  completed: "2026-06-30"
  tasks: 2
  files: 2
  disputed: 4
  disputed_resolved: 4
status: complete
---

# La stella più fragile dell'universo — Ultimo (quick-260629-wya)

Añadida `la-stella-piu-fragile` (10ª real): 49 phrases, espejo de `bella-davvero.json`, generada vía script. Índice phraseCount 49.

**Validación:** quórum S1-S5 1-por-1. Resultado final **49/49 validated, 0 disputed**, tras resolver 4 disputadas:

| Phrase | Tipo | Resolución |
|--------|------|-----------|
| 010 `come si declina` | bug real (tilde) | FIX → `como declina` (comparativo, sin tilde); re-validado 2 vendors |
| 013 `riniziasse` | falso+ S5 | oráculo Opus (verbo italiano válido, letra real; 037 validó) |
| 018 `decirte` | falso+ S4 | oráculo Opus (llana en vocal, sin tilde; 042 validó) |
| 029 `Che poi`→`además` | falso+ S2 | oráculo Opus (marcador discursivo; consistente con 001/019/043) |

**Nota de proceso:** el primer driver tenía un bug de heredoc (`$1` sin sustituir) que dejó 48 frases en `pending` (2º pase sobreescribía el 1º vía mismo vendor); se rehízo con un driver correcto (deepseek-chat + deepseek-reasoner).

**Tests:** suite 473 pass / 1 fail (preexistente ajeno: genero-numero). Las 10 canciones cargan y phraseCount coincide.
