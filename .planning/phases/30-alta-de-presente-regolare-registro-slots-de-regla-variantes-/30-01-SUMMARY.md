---
phase: 30-alta-de-presente-regolare-registro-slots-de-regla-variantes-
plan: 01
subsystem: content
tags: [presente-regolare, exercises-json, slot-variants, multiple-choice, word-buttons, A1-conjugation]

# Dependency graph
requires:
  - phase: 29-migracion-10-11
    provides: "migrate10to11/hydrateV11/RESET_PREFIXES_V11=['presente-regolare'] — la categoría nace limpia (no-hecha, racha 0) en el state v11"
provides:
  - "10ª categoría presente-regolare registrada en content/categories.json (order 10)"
  - "content/exercises/presente-regolare.json con 8 objetos-ejercicio (6 mc cubriendo los 6 grupos de regla + 2 wb incl. -isc-)"
  - "Conteo de objetos-ejercicio DEFINITIVO (exercises.length=8) para que Phase 31 sincronice counts/TOTAL_EXPECTED leyéndolo dinámicamente"
  - "Todas las variantes nacidas con validation.status: pending (input para el quórum del plan 30-02)"
affects: [30-02-quorum-validation, 31-cruces-multicat-integracion-lockstep, TOTAL_EXPECTED-sync]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "notes top-level string (hermano de exercises) para metadata autor-internal — sin precedente previo en content/exercises/*.json; el validator ignora claves desconocidas"
    - "id de objeto-ejercicio codifica el grupo de regla en el nombre (presente-regolare-<grupo>[-wb]) para que la verificación de 30-03 aserte cobertura por id"

key-files:
  created:
    - content/exercises/presente-regolare.json
  modified:
    - content/categories.json

key-decisions:
  - "exercises.length=8 (NO 6): 6 objetos multiple-choice + 2 word-buttons; cada objeto tiene un solo type y sus variants[] son de ese type (modelo CONV-01, espejo essere/avere)"
  - "word-buttons selectivos: isc (obligatorio D-30-04) + are (balance avere/essere); el resto de grupos solo multiple-choice"
  - "explanations en español PLANO ASCII (sin tildes: raiz, terminacion) para cumplir canon ASCII-apóstrofe y evitar falsos-positivos de accent-scan cross-vendor"

patterns-established:
  - "0-match documentado en notes autor-internal (D-30-05): la conjugación regular es derivable por raíz → match violaría D-04/R3"

requirements-completed: [PRES-01, PRES-02, PRES-03, PRES-05, PRES-06]

# Metrics
duration: 9min
completed: 2026-06-17
---

# Phase 30 Plan 01: Alta de presente-regolare (registro + slots de regla + variantes) Summary

**10ª categoría presente-regolare registrada (order 10) y materializada en slot+variantes: 8 objetos-ejercicio (6 multiple-choice cubriendo los 6 grupos de regla -are/-ere/-ire/-isc-/velar/palatal + 2 word-buttons incl. el -isc- reforzado), todas las variantes pending para el quórum, 0 match documentado en notes.**

## Performance

- **Duration:** ~9 min
- **Tasks:** 2
- **Files modified:** 2 (1 modify, 1 create)

## Accomplishments
- Categoría `presente-regolare` registrada en `content/categories.json` con order 10 (PRES-01), nombre italiano `Presente indicativo (verbi regolari)`, las 9 entradas existentes intactas.
- `content/exercises/presente-regolare.json` autorado en formato slot+variantes (CONV-01) con **8 objetos-ejercicio** (`exercises.length=8`).
- Los 6 grupos de regla cubiertos en multiple-choice; el grupo `-isc-` reforzado (mc con 3 variantes + objeto word-buttons), la trampa A1 más caída.
- Campo `notes` top-level autor-internal documentando el 0-match (D-30-05).
- Todas las variantes nacidas con `validation.status: "pending"`, `passes: []` (las valida el quórum en 30-02).
- El JSON satisface el shape contract de `src/data/schema-validator.js` (verificado por boot real con `validateContent`).

## Inventario de objetos-ejercicio

| # | id | type | grupo de regla | # variantes | verbos |
|---|-----|------|----------------|-------------|--------|
| 1 | `presente-regolare-are` | multiple-choice | -are | 3 | parlare, lavorare, studiare |
| 2 | `presente-regolare-ere` | multiple-choice | -ere | 2 | prendere, scrivere |
| 3 | `presente-regolare-ire` | multiple-choice | -ire simple | 2 | dormire, partire |
| 4 | `presente-regolare-isc` | multiple-choice | -ire con -isc- | **3** (refuerzo) | finire, capire, preferire |
| 5 | `presente-regolare-velar` | multiple-choice | velar -care/-gare | 2 | giocare, pagare |
| 6 | `presente-regolare-palatal` | multiple-choice | palatal -ciare/-giare | 2 | cominciare, mangiare |
| 7 | `presente-regolare-isc-wb` | word-buttons | -ire con -isc- (refuerzo) | 2 | finire, pulire |
| 8 | `presente-regolare-are-wb` | word-buttons | -are (selectivo) | 2 | parlare, abitare |

- **6 objetos multiple-choice** (uno por grupo) + **2 objetos word-buttons** → `exercises.length = 8`.
- `-isc-` es el grupo MÁS reforzado: mc con 3 variantes + wb dedicado.
- word-buttons selectivos: `-isc-` obligatorio (D-30-04) + `-are` para balance estilo avere/essere (D-30-06); el resto de grupos solo mc.
- 0 objetos de tipo `match` (D-30-05).

## Cobertura de las 6 personas (D-30-03)

| Persona | Aparece en (objeto / variante) |
|---------|--------------------------------|
| io | are v1 (Io parlo), isc v1 (Io finisco), ire v2 (Io parto), isc-wb v1 (io finisco) |
| tu | are v2 (Tu lavori), isc v2 (Tu capisci), velar v1 (Tu giochi), palatal v1 (Tu cominci), isc-wb v2 (tu pulisci) |
| lui | are v3 (Lui studia), isc v3 (Lui preferisce) |
| noi | ere v1 (Noi prendiamo), velar v2 (Noi paghiamo), palatal v2 (Noi mangiamo), are-wb v1 (noi parliamo) |
| voi | ere v2 (Voi scrivete) |
| loro | ire v1 (Loro dormono), are-wb v2 (loro abitano) |

Las 6 personas io/tu/lui/noi/voi/loro están cubiertas a nivel de categoría. `voi` y `loro` (las menos frecuentes) vigiladas: `voi` en ere v2, `loro` en ire v1 y are-wb v2.

## Task Commits

1. **Task 1: Registrar la categoría presente-regolare (order 10)** — `14eec06` (feat)
2. **Task 2: Autorar presente-regolare.json (6 mc + 2 wb + notes)** — `ba3151d` (feat)

## Files Created/Modified
- `content/categories.json` — +1 entrada `{ "id": "presente-regolare", "name": "Presente indicativo (verbi regolari)", "order": 10 }`
- `content/exercises/presente-regolare.json` — CREADO: objeto `{ notes, exercises[8] }` en formato slot+variantes

## Decisions Made
- **exercises.length=8, NO 6:** cada objeto-ejercicio tiene un solo `type`; mc y wb del mismo grupo son objetos separados (modelo CONV-01 espejo essere/avere). 6 mc + 2 wb. NUNCA hardcodear 6 como conteo de objetos — Phase 31 lee el conteo REAL del JSON.
- **explanations en español plano ASCII (sin tildes):** se usaron formas sin acento (raiz, terminacion, conservar) para garantizar plain-text ASCII y apóstrofes ASCII, alineado con el canon y para no disparar falsos-positivos del accent-scan cross-vendor (memoria feedback-cross-vendor-catches-bugs). El gloss `(en espanol: …)` es canon R7 (memoria gloss-es-desambiguacion-canon), no leak.
- **word-buttons selectivos (isc + are):** balance estilo avere/essere; no uno por grupo, no solo el obligatorio.

## Deviations from Plan
None - plan executed exactly as written.

## Authoring Rules Applied (R1-R7)
- **R1:** ningún prompt contiene la regla ni la solución (solo la frase + el hueco / la frase ES a traducir).
- **R2:** ninguna explanation referencia otros ejercicios por #NNN.
- **R4:** explanations enfocadas al alumno (regla + contraste IT-ES + gotcha), sin meta de curador.
- **R6:** una modificación pedagógica por ejercicio (un grupo de regla por objeto).
- **R7:** cada prompt admite UNA forma válida; los distractores son conjugaciones erróneas (otras personas o la forma sin -isc-/sin h/con doble i); gloss `(en espanol: …)` para desambiguar persona donde aplica. Verificados mentalmente todos los distractores.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- **Plan 30-02 (quórum):** input listo — 8 objetos con todas las variantes `validation.status: pending`. El quórum cross-vendor R1-R7 (1-por-1, fresh-context) rellenará `passes[]` y pasará a `validated`/`disputed`.
- **Phase 31 (integración lockstep):** el conteo de objetos-ejercicio queda DEFINITIVO en `exercises.length=8` para sincronizar `TOTAL_EXPECTED` (183 → 183 + 8) y los 3 hardcodes, leído dinámicamente del JSON.
- Motor de re-verificación NO tocado (brownfield puro: solo contenido + registro).

## Self-Check: PASSED

- FOUND: content/categories.json
- FOUND: content/exercises/presente-regolare.json
- FOUND: .planning/phases/30-.../30-01-SUMMARY.md
- FOUND commit: 14eec06 (Task 1)
- FOUND commit: ba3151d (Task 2)

---
*Phase: 30-alta-de-presente-regolare-registro-slots-de-regla-variantes-*
*Completed: 2026-06-17*
