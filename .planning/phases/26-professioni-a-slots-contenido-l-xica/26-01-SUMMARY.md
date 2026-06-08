---
phase: 26-professioni-a-slots-contenido-l-xica
plan: 01
subsystem: contenido-editorial
tags: [slots, profesiones, feminizacion, hibrido, match, word-buttons]
requires:
  - "schemaVersion 9 (Phase 21) — reset selectivo de profesiones"
  - "motor slot+variantes v1.4 (normalizeExerciseToSlot, validateContent, sampler por slot)"
provides:
  - "content/exercises/profesiones.json en shape slot+variantes HIBRIDO (11 slots)"
  - "conteo base de slots (11) para el sync de counts de 26-03"
affects:
  - "tests de count de profesiones (rojo esperado 51->11, lo sincroniza 26-03)"
tech-stack:
  added: []
  patterns:
    - "slot+variantes HIBRIDO: bloque regla por sub-regla CON variantes en 26-02 + bloque lexico SIN variantes (PROF-01/PROF-02)"
    - "merge de explanation elegir-la-mas-completa + injertar matices (D-26-09)"
    - "validation top-level verbatim por base del slot (D-26-10)"
key-files:
  created: []
  modified:
    - "content/exercises/profesiones.json"
    - ".planning/phases/26-professioni-a-slots-contenido-l-xica/26-REAGRUPACION-MAP.md (Task 1, commit a631c5e)"
decisions:
  - "Mapa HIBRIDO aprobado por el autor en el checkpoint:decision ('aprobado', sin ajustes) — D-26-01/02/03"
  - "5 slots de feminizacion + 1 comprension + 3 match slots-de-1 + articolo-suono + word-buttons = 11 slots"
  - "validation de slot = la de la base de cada slot; override del autor de collega (020) preservado verbatim en invariabili"
metrics:
  duration: "~12 min"
  completed: "2026-06-08"
  tasks: 2
  files: 1
---

# Phase 26 Plan 01: Professioni a slots — reagrupación HIBRIDA Summary

Los 51 ejercicios de Professioni reescritos a slot+variantes HIBRIDO (11 slots): bloque regla por sub-regla de feminización (granularidad fina) + bloque léxico puro sin variantes (3 match preservados type:match) + articolo-suono + word-buttons preservados; validateContent verde, override del autor de collega preservado verbatim.

## Qué se hizo

**Task 1 (mapa de reagrupación, commit `a631c5e`)** — ya estaba completo. El `26-REAGRUPACION-MAP.md` mapea los 51 ids fuente 1:1 a 11 slots con el modelo HIBRIDO documentado por bloque, las ubicaciones de 034/041/042/043, el merge de explanations (D-26-09), la sección "sin cruces" y "snapshot no aplica", y el conteo de slots (11) que fija el sync de 26-03. El checkpoint:decision fue resuelto por el autor con **"aprobado"** — el mapa HIBRIDO (modelo `hibrido-regla-por-subregla-lexico-sin-variantes`, D-26-01/02/03) queda aprobado tal cual, sin ajustes.

**Task 2 (reescritura del JSON, commit `27b6692`)** — `content/exercises/profesiones.json` reescrito a **11 slots** según el mapa aprobado:

| # | slot-id | type | variantes | base validation |
|---|---------|------|-----------|-----------------|
| 1 | `profesiones-femminile-o-a` | multiple-choice | 10 (001-008, 034 chirurgo irregular, 035) | 001 |
| 2 | `profesiones-femminile-iera` | multiple-choice | 4 (009-012) | 009 |
| 3 | `profesiones-femminile-trice` | multiple-choice | 8 (013/014/029-033, 042) | 013 |
| 4 | `profesiones-femminile-essa` | multiple-choice | 4 (015-017, 041) | 015 |
| 5 | `profesiones-invariabili` | multiple-choice | 12 (018-028, 043) | 022 (+ override 020 verbatim) |
| 6 | `profesiones-comprensione` | multiple-choice | 2 (039, 040) | 040 |
| 7 | `profesiones-luogo` | match | 1 (200) | 200 verbatim |
| 8 | `profesiones-strumento` | match | 1 (201) | 201 verbatim |
| 9 | `profesiones-azione` | match | 1 (202) | 202 verbatim |
| 10 | `profesiones-articolo-suono` | multiple-choice | 3 (036-038) | 037 |
| 11 | `profesiones-essere-wb` | word-buttons | 5 (100-104) | 100 |

Total: 51 superficies movidas intactas a `variants[]`; `payload` eliminado de todas; explanations rule-first mergeadas a nivel de slot (contraste -trice/-essa, anti-calco -istessa, NO-inserción-de-H en chirurga, falsos amigos chirurgia/fotografia, pilota/collega -a invariable, anglicismo manager); variantes sin explanation propia; ids TODOS semánticos con `categoryIds=["profesiones"]`.

## Decisiones tomadas

- **Modelo HIBRIDO (D-26-01/02/03)** confirmado por el autor: bloque REGLA (5 slots de feminización) recibirá variantes nuevas en 26-02; bloque LÉXICO PURO (comprensión + 3 match) sin variantes (PROF-01). PROF-02 se cumple: autoría donde hay regla, documentado que el léxico no la admite.
- **Granularidad FINA** en feminización: -o/-a, -iera, -tore/-trice, -e/-essa e invariabili en slots SEPARADOS — para no difuminar el contraste de sufijos (trampa A1 estrella).
- **3 match preservados** como `type:match` con `variant={prompt,pairs}` (D-26-02/D-04); **5 word-buttons** preservados como `type:word-buttons` con `variant={prompt,answer,distractors}` (D-26-06).
- **Criterio de merge de validation** = la del ejercicio base de cada slot (no fusión de passes[]), registrado en el mapa. El disputed→override del autor de collega (020) se preservó **verbatim** dentro de `profesiones-invariabili.validation.passes[]` (junto al pase incorrecta de Sonnet y el override de `by:autor`), de modo que sigue presente en el JSON sin re-validar (D-26-10).

## Verificación

- `node scripts/validate-content-fixture.mjs profesiones content/exercises/profesiones.json` → **exit 0** (11 ejercicios).
- Acceptance todo verde: payload=0; slots sin explanation=0; variantes con explanation=0; match slots=3 todos con `variants[].pairs`; wb slots=1 todos con `variants[].answer`; invariabili=1; slots de feminización -o-a/-iera/-trice/-essa todos presentes (true); articolo-suono=1; mal-cat=0; cruces 300-305=0; override autor presente=true; refs cross-cat (Articoli/Essere/Genere)=0; smart-quotes=0; ASCII apostrophes=89, curly=0, markdown en explanations=0; total variants movidas=51.
- `node --test tests/*.test.js` → **373 pass / 1 fail**. El único fallo es el count hardcodeado de profesiones (`Esperaba 51 ejercicios... encontré 11`, `tests/exercise-types.test.js:1300`). **Rojo ESPERADO** — lo sincroniza 26-03 (51→11 en los 3 hardcodes + `TOTAL_EXPECTED`). NO se arregló aquí (instrucción explícita del autor).
- **NO snapshot**: Professioni no tiene snapshot/assert APPEND-ONLY (avere-only, hardcoded a avere.json; la mención en `assert-multi-cat-cross.mjs:19` es comentario de ejemplo, D-26-12). NO se ejecutó ni creó ningún script de snapshot; no existe `.profesiones-prefix-snapshot.json`. NO aplica re-base D-88. NO hay cruces multi-cat (no existen profesiones-300..305) y no se crearon.

## Deviations from Plan

None - plan ejecutado exactamente como escrito. El mapa aprobado se aplicó tal cual; el conteo real (11 slots) coincidió con el reportado en el mapa; el único rojo de tests es el esperado y documentado para 26-03.

## Self-Check: PASSED

- FOUND: content/exercises/profesiones.json (11 slots, validateContent exit 0)
- FOUND commit a631c5e (Task 1 mapa)
- FOUND commit 27b6692 (Task 2 reescritura)
