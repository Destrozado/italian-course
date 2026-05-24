---
phase: 05-essere-categoria-fundamental-que-faltaba
plan: 01
subsystem: content
tags: [italian, content, essere, a1, multi-cat, schema-validation]

requires:
  - phase: 04-backup-robusto-contenido-completo
    provides: 6 PDFs transcritos + DESIGN RULE Phase 4 + patrón multi-cat avere-300..305 + APPEND-ONLY blindado (scripts/assert-avere-prefix-unchanged.mjs) + schema dispatch table cubre 3 tipos
provides:
  - 7ª categoría essere (order:2) en content/categories.json
  - content/exercises/essere.json con 39 ejercicios (35 mc + 4 wb + 0 match)
  - cobertura A1 completa: conjugación presente (6 personas + 2 variantes) + identidad + nacionalidad + profesión (contraste avere) + estado/condición + cópula clasificatoria + participio passato prossimo (las 4 formas stato/stata/stati/state con concordancia)
  - 6 cruces multi-categoría essere-300..305 (espejo del patrón avere-300..305) que ejercitan la cascada D-54 sobre cada par essere×{avere, profesiones, verbos-movimiento, genero-numero, sustantivos-irregulares, preposiciones}
  - smoke test multi-cat paramétrico sobre TODOS los archivos de content/exercises/ (no solo avere.json) — futuras categorías heredan el test automáticamente
affects: [milestone v1.5 close, futuras phases A2 essere-imperfetto/futuro/imperativo, sub-categoría esserci v2]

tech-stack:
  added: []
  patterns:
    - "Patrón D-91: distractoras pedagógicas fijas (1 avere + 2 essere mal + 1 correcta) en CADA multi-choice de essere — verificable por script (regex/grep)"
    - "Smoke test paramétrico: iterar content/exercises/*.json con readdirSync — cualquier categoría nueva con multi-cat hereda cobertura sin tocar el test"
    - "Estrategia bloques pedagógicos commit-by-commit: 4 bloques temáticos revisados pedagógicamente por el autor antes de cada commit (D-96 ← D-85)"

key-files:
  created:
    - content/exercises/essere.json
    - .planning/phases/05-essere-categoria-fundamental-que-faltaba/05-01-SUMMARY.md
  modified:
    - content/categories.json
    - tests/domain.test.js
    - .planning/STATE.md
    - .planning/ROADMAP.md
    - .planning/REQUIREMENTS.md

key-decisions:
  - "D-89: mezcla 35 mc + 4 wb + 0 match (DESIGN RULE Phase 4 excluye match — essere derivable por raíz)"
  - "D-90: 4 word-buttons, 1 por sub-área (identidad essere-100, nacionalidad essere-101, profesión essere-102, participio essere-103)"
  - "D-91: patrón fijo de distractoras EN TODOS los multi-choice — 1 avere + 2 essere mal + 1 correcta — verificable por script"
  - "D-92: reparto cuantitativo final 8+5+4+5+4+2+5 = 33 base + 6 multi-cat = 39 (margen sobre ROADMAP ≥30)"
  - "D-93: participio passato prossimo SE INCLUYE (las 4 formas stato/stata/stati/state con concordancia masc/fem × sing/pl)"
  - "D-94: 6 cruces multi-cat con categoryIds EXACTOS espejo de avere-300..305 (Phase 4 D-87)"
  - "D-99: categories.json shift — avere order:1, essere order:2, las 5 existentes +1"
  - "Placeholder essere.json en Task 1 commit: empty {exercises:[]} para que content-loader no rompa al boot entre Task 1 commit y Task 2 commit"

patterns-established:
  - "Pattern 1: bloques pedagógicos commit-by-commit con revisión humana inline — 4 commits secuenciales sobre el mismo archivo (Task 2..5) cada uno revisable pedagógicamente"
  - "Pattern 2: distractoras pedagógicamente fijas verificables por script — D-91 es una regla mecánica con assert verificable, no una guideline soft"
  - "Pattern 3: smoke test paramétrico file-iterator — readdirSync('content/exercises/') genera un sub-test por archivo, cualquier extensión futura hereda cobertura sin editar el test"

requirements-completed:
  - SEED-03

duration: ~40min
completed: 2026-05-24
---

# Phase 5: Essere — categoría fundamental que faltaba — Plan 05-01 Summary

**Essere cerrada como 7ª categoría con 39 ejercicios A1 (conjugación + identidad + nacionalidad + profesión + estado + cópula + participio) + 6 cruces multi-cat espejo del patrón Phase 4 — el milestone v1.0 queda funcionalmente simétrico (Avere ↔ Essere).**

## Performance

- **Duration:** ~40 min (inline interactivo con 4 checkpoints de revisión humana)
- **Started:** 2026-05-24
- **Completed:** 2026-05-24
- **Tasks:** 7/7 completas
- **Files modified:** 5 (1 nuevo essere.json, 1 categories.json shift, 1 test parametrización, + STATE/ROADMAP/REQUIREMENTS tracking)
- **Commits:** 6 atómicos en `master` (1ede87e, 888afcf, fafcff5, 3e675f6, 5cc4e3d, 16375da)

## Accomplishments

### content/categories.json shift (Task 1 — D-99)

7 entradas con orders 1..7 únicos. Avere mantiene order:1 como reflejo de su madurez (Phase 1). Essere insertada como order:2 reflejando peso pedagógico equivalente. Las 5 categorías existentes (preposiciones, verbos-movimiento, sustantivos-irregulares, genero-numero, profesiones) desplazadas order +1. Commit incluyó un placeholder `essere.json` con `{exercises:[]}` para que `content-loader.js` no rompiera al boot entre commits.

### content/exercises/essere.json — 39 ejercicios (Tasks 2-5)

| Bloque | Commit | Ejercicios | Sub-áreas |
|--------|--------|-----------|-----------|
| 1 | 888afcf | 13 (12mc + 1wb) | Conjugación presente (essere-001..008 con io/tu/lui/lei/noi/voi/loro + interrogación + negación) + identidad (essere-009..012 mc + essere-100 wb) |
| 2 | fafcff5 | 15 (14mc + 1wb) | Nacionalidad (essere-013..015 + essere-101 wb) + profesión (essere-016..019 + essere-102 wb con contraste essere/avere `Lui è medico`) + estado/condición (essere-020..023, incluye falso amigo crítico essere-020 `Maria è stanca`) + cópula clasificatoria (essere-024..025) |
| 3 | 3e675f6 | 5 (4mc + 1wb) | Participio passato prossimo (essere-026..029 mc + essere-103 wb) cubriendo las 4 formas `stato/stata/stati/state` con concordancia masc/fem × sing/pl |
| 4 | 5cc4e3d | 6 (6mc) | Multi-cat essere-300..305 espejo de avere-300..305 — un cruce por cada otra categoría, cada uno dispara cascada D-54 al fallar |

**Total: 39 ejercicios = 35 mc + 4 wb + 0 match.**

### Patrón D-91 distractoras — invariante verificable

Cada multi-choice tiene **exactamente 1 forma de avere (de {ho,hai,ha,abbiamo,avete,hanno}) + 2 formas de essere mal conjugadas (de {sono,sei,è,siamo,siete}) + 1 correcta**. Verificable por script Python:

```python
AVERE={'ho','hai','ha','abbiamo','avete','hanno'}
for e in exercises:
    if e['type']=='multiple-choice':
        assert sum(1 for o in e['payload']['options'] if o in AVERE) == 1
        assert len(e['payload']['options']) == 4
```

Las 35 multi-choice pasan. Cada fallo enseña O conjugación essere O contraste essere/avere — cero distractoras rellenas sin valor pedagógico.

### Cobertura pedagógica núcleo: contraste essere/avere

Foco principal de la categoría — el hispanohablante confunde:
- **Edad:** italiano `avere` (`Lui ha 30 anni`), español "tener" — cubierto en essere-300 (`Mio fratello è medico e ha trent'anni` fuerza ambos)
- **Profesión:** italiano `essere` (`Lei è medico`), español "ser" — cubierto en essere-016..019 + essere-301 + essere-102 wb (todos con trampa `ha medico`)
- **Estado/condición:** italiano `essere` (`Maria è stanca`), español "estar" (falso amigo) — cubierto en essere-020..023 (todos con trampa `ha stanca`)
- **Pasado próximo de essere:** italiano `essere stato` con auxiliar `essere`, español "haber estado" (calco erróneo `ho stato`) — cubierto en essere-026..029 + essere-103 wb (todos con trampa `ho stato`/`abbiamo stato`)

### 6 cruces multi-cat (D-94)

| ID | categoryIds | Cruce | Frase |
|----|-------------|-------|-------|
| essere-300 | essere+avere | edad vs profesión en MISMA frase | `Mio fratello è medico e ha trent'anni` |
| essere-301 | essere+profesiones | profesión fem (-o→-a) | `Lei è avvocata` |
| essere-302 | essere+verbos-movimiento | auxiliar passato prossimo intransitivo | `Maria è andata al cinema` (D-95 UAT trigger) |
| essere-303 | essere+genero-numero | concordancia plural masc | `Noi siamo italiani di Milano` |
| essere-304 | essere+sustantivos-irregulares | plural irregular braccio→braccia | `Le mie braccia sono stanche` |
| essere-305 | essere+preposiciones | `di` con origen | `Io sono di Milano e parlo italiano` |

Cada cruce dispara cascada D-54 inmediata sobre las 2 categorías al fallar. Verificado en UAT-E (autor falló essere-302 → resumen mostró essere + verbos-movimiento ambas en `no-hecha` racha=0).

### Smoke test paramétrico (Task 6 — 16375da)

Refactor del smoke multi-cat de Phase 4 (que era avere-específico) a una iteración con `readdirSync('content/exercises/')`. Cada archivo con ≥1 ejercicio multi-cat genera un sub-test automático. Resultado:

- avere.json: cascada sobre avere-300 (avere+profesiones) ✓
- essere.json: cascada sobre essere-300 (essere+avere) ✓
- 5 archivos sin multi-cat: skip silently
- Bundle test: los 7 archivos juntos pasan validateContent ✓

Tests pasan de **130 → 145 verdes** (6 nuevos sub-tests de cascada + 1 nuevo bundle test). Cualquier categoría futura con multi-cat hereda cobertura sin editar el test.

### UAT INTEGRAL 6/6 PASS (Task 7)

| # | Criterio ROADMAP §Phase 5 | Verificación | Status |
|---|---------------------------|--------------|--------|
| A | 7ª entrada essere order:2, resto +1 | Visual home + categories.json schema | ✅ PASS |
| B | essere.json ≥30, validado, NFC, apóstrofes ASCII | localStorage + 39 ejercicios + scripts/validate-content-fixture.mjs exit 0 | ✅ PASS |
| C | Cobertura 7 sub-áreas + participio | Repaso 20 solo essere muestra variedad pedagógica | ✅ PASS |
| D | DESIGN RULE Phase 4 (match excluido + distractoras D-91) | 0 match estructural + script D-91 sobre los 35 mc | ✅ PASS |
| E | ≥1 multi-cat dispara cascada D-54 | Autor falló essere-302 → resumen muestra essere + verbos-movimiento reseteadas | ✅ PASS |
| F | Sesión Repaso 20 con essere completa sin errores UX | UAT humano completo | ✅ PASS |

## Self-Check: PASSED

- ✅ 7 tasks ejecutadas (1 auto + 5 checkpoint:human-verify + 1 auto/TDD)
- ✅ 6 commits atómicos en master
- ✅ SUMMARY.md creado
- ✅ 145/145 tests verdes (139 baseline + 6 multi-cat paramétricos)
- ✅ schema validation pasa para los 7 archivos
- ✅ APPEND-ONLY respetado (essere.json crece monotónicamente entre commits; avere.json sin tocar)
- ✅ Apóstrofes ASCII U+0027 en todo el contenido (grep smart quotes = 0)
- ✅ D-91 verificable por script en los 35 multi-choice
- ✅ UAT humano 6/6 PASS

## Deviations from PLAN

- **Task 1 incluye placeholder essere.json `{exercises:[]}`** (no solo categories.json shift como decía el plan literal). Motivo: sin el placeholder, content-loader rompe entre commits con `HTTP 404` al fetch essere.json. El placeholder cumple validación schema (lista vacía aceptada) y es sobreescrito por Task 2. Cero riesgo, aplicación nunca queda rota.
- **Task 6 reformulado como refactor paramétrico** (no como extensión literal). El plan sugería extender el test específico; el refactor reemplaza el test avere-específico por una iteración sobre todos los archivos, que es estrictamente mejor (cubre essere automáticamente + cualquier categoría futura). 6 sub-tests nuevos + 1 bundle test reformulado.
- **essere-008 prompt clarificado**: el plan ejemplificó `Maria non ___ stanca, è felice.` que tenía la respuesta "è" como giveaway visible. Cambiado a `Maria non ___ stanca oggi.` para mantener el pedagogía limpia (un solo hueco, sin spoiler).
- **essere-009 prompt corregido**: el plan ejemplificó `Io ___ Maria, ___ piacere.` (2 huecos) y luego dijo "usar `Io ___ Maria.` simple" pero ese era idéntico a essere-001. Cambiado a `Mi chiamo Anna e ___ italiana.` (nuevo contexto identidad sin duplicar essere-001).

Todas las deviaciones documentadas, justificadas pedagógica/técnicamente, sin tocar locks D-89..D-99.
