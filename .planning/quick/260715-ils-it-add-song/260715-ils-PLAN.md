---
quick_id: 260715-ils
type: execute
wave: 1
depends_on: []
autonomous: false
files_modified:
  - .claude/skills/it-add-song/SKILL.md
must_haves:
  truths:
    - "Existe .claude/skills/it-add-song/SKILL.md con frontmatter válido (name it-add-song, description, argument-hint, allowed-tools) siguiendo la casa (espejo de gsd-validate-exercise)."
    - "El skill documenta el pipeline COMPLETO de alta de canción: derivar id/title, trocear+traducir (S1-S6, sin puntuación, sin leak, acentos RAE), crear content/songs/<id>.json, registrar en content/songs.json (phraseCount), dedup+propagación de duplicados, quórum cross-vendor vía scripts/validate-song-pass.mjs (rotación DeepSeek chat/reasoner + Gemini, 2 by distintos), resolución de disputed (calidad > tokens, sin override-atajo), tests, commit atómico, STATE."
    - "Incluye el paso OPCIONAL de decoyBank (modo agrupado) referenciando docs/DECOY-VALIDATION-PROMPT.md + scripts/validate-decoy-pass.mjs."
    - "Codifica los gotchas de las memorias (2 by distintos; ejecutar quórum en top-level; Gemini rate-limit → deepseek-reasoner 2º by; S1 ignora puntuación; normalizar caracteres espurios; no concurrencia de escritores sobre el mismo JSON)."
    - "Mensajes/prosa en español (FOUND-04)."
  artifacts:
    - path: ".claude/skills/it-add-song/SKILL.md"
      provides: "Skill de proyecto para alta de canciones."
      contains: "it-add-song"
---

# Quick Task 260715-ils: Skill de proyecto /it-add-song

Capturar el pipeline de alta de canciones (recorrido 2× esta sesión) en un skill
de proyecto reutilizable, en el estilo de `.claude/skills/gsd-validate-exercise/SKILL.md`.
