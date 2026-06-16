---
phase: 27-sostantivi-irregolari-a-slots-contenido-l-xica
plan: 01
subsystem: contenido-editorial
tags: [slot-variantes, sostantivi-irregolari, lexica-hibrida, conversion]
requires:
  - "Phase 21 (migración 8→9, reset selectivo de sustantivos-irregulares)"
  - "Motor slot+variantes v1.4 (normalizeExerciseToSlot, pickVariantIndex, getter slot-aware) — NO tocado"
provides:
  - "content/exercises/sustantivos-irregulares.json en formato slot+variantes HIBRIDO (5 slots, 31 variantes)"
  - "27-REAGRUPACION-MAP.md aprobado (artefacto de auditoría, conteo de slots = 5 para el sync de 27-03)"
affects:
  - "27-02 (autoría de variantes nuevas por quórum — solo bloque regla)"
  - "27-03 (sync de counts: sustantivos-irregulares 31→5, TOTAL_EXPECTED 209→183)"
tech-stack:
  added: []
  patterns:
    - "slot+variantes HIBRIDO por bloque (regla CON variantes / léxico SIN variantes / contraste SIN engorde)"
    - "merge D-27-09 elegir-la-más-completa + injertar matices"
    - "move verbatim de superficies + validation top-level (D-27-10)"
key-files:
  created:
    - ".planning/phases/27-sostantivi-irregolari-a-slots-contenido-l-xica/27-01-SUMMARY.md"
  modified:
    - "content/exercises/sustantivos-irregulares.json"
decisions:
  - "5 slots: 3 bloque REGLA (sovrabbondanti, invariabili-accentate, invariabili-straniere) + 1 LEXICO (cambio-radice) + 1 CONTRASTE (plurali-regolari)"
  - "orecchio→orecchie [#007] al slot sovrabbondanti con la nota del plural en -e injertada"
  - "moglie→mogli [#004] al slot plurali-regolari como foil casi-regular -e→-i"
  - "duplicado #008==#025 (tempio→templi) como 2 variantes del lema tempio (mismo answer, distractoras distintas)"
  - "validation top-level = base de cada slot (todas las superficies tienen quórum limpio Opus 4.7 + Sonnet 4.6, resultado idéntico)"
metrics:
  duration: "~12 min (continuación tras checkpoint)"
  completed: "2026-06-09"
  tasks_completed: 2
  files_modified: 1
---

# Phase 27 Plan 01: Sostantivi irregolari a slots (reagrupación + reescritura) Summary

Reagrupación de los 31 ejercicios reales de Sostantivi irregolari al modelo slot+variantes HIBRIDO (D-27-01): 5 slots, 31 variantes, 100% multiple-choice, sin cruces multi-cat ni snapshot, validator verde.

## What Was Done

**Task 1 — mapa de reagrupación (ya completado antes del checkpoint, commit `55808b3`):** `27-REAGRUPACION-MAP.md` con la decisión híbrida documentada por bloque (SOST-01/SOST-02), los 31 ids fuente mapeados 1:1 a 5 slots, las ubicaciones de orecchio→orecchie [#007] y moglie→mogli [#004], la resolución del duplicado #008==#025 y la asignación de inversos/adjetivo. **El checkpoint:decision fue resuelto por el autor con "aprobado" — el mapa AS-IS, sin ajustes.**

**Task 2 — reescritura del JSON (commit `32d36ab`):** `content/exercises/sustantivos-irregulares.json` reescrito a **5 slots** según el mapa aprobado:

| slot id | bloque | nº vars | ids-fuente (en orden) |
|---|---|---|---|
| `sustantivos-irregulares-sovrabbondanti` | REGLA | 10 | 003, 002, 020, 021, 022, 023, 006, 007, 029, 030 |
| `sustantivos-irregulares-invariabili-accentate` | REGLA | 3 | 009, 010, 011 |
| `sustantivos-irregulares-invariabili-straniere` | REGLA | 2 | 012, 013 |
| `sustantivos-irregulares-cambio-radice` | LEXICO | 8 | 001, 005, 008, 024, 025, 026, 027, 031 |
| `sustantivos-irregulares-plurali-regolari` | CONTRASTE | 8 | 018, 014, 015, 016, 017, 019, 004, 028 |
| **TOTAL** | | **31** | **31 ids** |

- `payload` eliminado de los 31 ejercicios fuente (0 restantes); cada superficie movida VERBATIM a `variants[]` como `{prompt, options, correctIndex}` (100% MC, 0 match, 0 word-buttons).
- `explanation` top-level por slot, rule-first, vía merge D-27-09 (base + matices injertados): sovrabbondanti (base 003 + grafts de 002/006/007/022/023/029/030), invariabili-accentate (base 009 + 010/011), invariabili-straniere (base 012 + 013), cambio-radice (base 001 + 005/008/024/025/026/027/031), plurali-regolari (base 018 + 014/015/016/017/019/004/028).
- Ninguna variante lleva `explanation` ni `validation` propias.
- `validation` top-level movida verbatim de la superficie base de cada slot (todas con quórum limpio `claude-opus-4-7` + `claude-sonnet-4-6`, ambas `correcta`, 0 concerns).
- Duplicado #008==#025 (tempio→templi) presente como 2 variantes del lema tempio (mismo answer `templi`, distractoras distintas).
- Inversos/adjetivo asignados a variants[] de su lema: braccia→braccio (029) y uova→uovo (030) a sovrabbondanti; uomini→uomo (027), giovani uomini (026), dei→dio (031) a cambio-radice; donne→donna (028) a plurali-regolari.
- Todos los ids semánticos, `categoryIds: ["sustantivos-irregulares"]`; sin ids 300..305.
- Sin smart-quotes (0); apóstrofes ASCII; acentos italianos (città/caffè/università) preservados; ninguna explanation referencia las categorías Genere e numero / Articoli por id ni prosa (D-27-06).

## Criterio de merge de validation (D-27-10)

Criterio = validation de la BASE elegida en el mapa para cada slot. Como los 31 ejercicios fuente llevan el MISMO quórum limpio (Opus 4.7 + Sonnet 4.6, ambas `correcta`, 0 concerns) y **NO hay disputed→override en el set fuente (verificado: 0)**, el resultado es idéntico independientemente de la base. El move es trivial verbatim (divergencia vs Professioni, que tenía el override de collega).

## Sin snapshot / cruces / disputed

Sostantivi irregolari **no tiene** snapshot APPEND-ONLY (el único es `scripts/.avere-prefix-snapshot.json`, avere-only, 0 refs a sustantivos), ni cruces multi-cat (no existen `sustantivos-irregulares-300..305`), ni disputed→override (0 en el fuente). **No aplica la re-base D-88.** No se ejecutó ni creó ningún script/archivo de snapshot para esta categoría.

## Verification

- `node scripts/validate-content-fixture.mjs sustantivos-irregulares content/exercises/sustantivos-irregulares.json` → **exit 0** (5 ejercicios).
- con payload: **0** · slots sin explanation: **0** · variantes con explanation: **0** · no-MC: **0**
- sub-reglas separadas (sovrabbondanti / invariabili-accentate / invariabili-straniere): **las tres true**
- cambio-radice variants: **8** · templi variants: **2** · plurali-regolari: **1** slot
- mal-cat: **0** · cruces 300-305: **0** · refs cross-cat (D-27-06): **0** · smart-quotes: **0**
- total slots: **5** · total variantes: **31** · snapshot file: **no existe**

### Rojo esperado (NO arreglado aquí — es 27-03)

`node --test tests/*.test.js` quedará rojo en el count hardcodeado de `sustantivos-irregulares` (los 3 hardcodes siguen en 31; el real ahora es 5) + `TOTAL_EXPECTED`. Esto es ESPERADO y lo sincroniza 27-03 (delta de fase base = −31 + 5 = −26; TOTAL_EXPECTED 209 → 183). NO se tocan los counts en este plan.

## Deviations from Plan

None - plan executed exactly as written (mapa aprobado AS-IS; el conteo real 5 coincide con el reportado en el mapa; Task 1 no rehecho).

## Self-Check: PASSED

- FOUND: content/exercises/sustantivos-irregulares.json (5 slots, validator exit 0)
- FOUND: commit 32d36ab (Task 2)
- FOUND: commit 55808b3 (Task 1, prior)
- FOUND: .planning/phases/27-sostantivi-irregolari-a-slots-contenido-l-xica/27-01-SUMMARY.md
