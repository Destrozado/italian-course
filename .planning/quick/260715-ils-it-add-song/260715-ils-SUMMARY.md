---
quick_id: 260715-ils
status: complete
date: 2026-07-15
---

# Quick Task 260715-ils — Skill de proyecto /it-add-song

## Qué se hizo
Se creó `.claude/skills/it-add-song/SKILL.md`: un skill de proyecto que captura el
pipeline COMPLETO de alta de canciones (recorrido 2× esta sesión), en el estilo de
`.claude/skills/gsd-validate-exercise/SKILL.md`.

## Contenido del skill
- **Frontmatter**: name `it-add-song`, description, argument-hint, allowed-tools
  (Read/Write/Edit/Bash/Glob/Grep/AskUserQuestion).
- **Pipeline documentado** (Pasos 0-9): leer fuentes de verdad → trocear+traducir
  (S1-S6, sin puntuación, sin leak, acentos RAE) → generar `content/songs/<id>.json`
  con formato corpus → registrar en `content/songs.json` (phraseCount) → dedup de
  representantes → quórum cross-vendor (`validate-song-pass.mjs`, rotación DeepSeek
  chat/reasoner + Gemini, 2 by distintos) → resolver `disputed` (calidad > tokens,
  sin override-atajo) → propagar `validation` a duplicados → tests → commits +
  STATE.
- **Paso opcional `--decoys`**: modo agrupado (decoyBank D1-D5) vía
  `validate-decoy-pass.mjs` + `serializeSong`.
- **`<critical_constraints>`** codifica los gotchas de las memorias del autor
  (2 by distintos; quórum top-level; Gemini 429 → deepseek-reasoner; S1 ignora
  puntuación; normalizar caracteres espurios; no concurrencia de escritores;
  acentos RAE = bug real; estribillos verbatim + propagación).

## Verificación
- Frontmatter YAML válido (4 claves).
- Todos los archivos referenciados existen; los flags de `validate-song-pass.mjs`
  citados (`--model/--fallback/--avoid/--write/--dry-run/--temp`) están soportados;
  `serializeSong` exportado por el script de decoys.
- El runtime registró el skill: aparece como `/it-add-song` en la lista disponible.

## Siguiente
- Replicar para ejercicios (`/it-add-exercise`) y, más ligero, categorías, si al
  autor le convence la forma.
