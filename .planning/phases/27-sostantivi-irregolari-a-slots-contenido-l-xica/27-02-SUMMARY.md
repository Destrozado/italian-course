---
phase: 27-sostantivi-irregolari-a-slots-contenido-l-xica
plan: 02
subsystem: contenido-editorial
tags: [sostantivi-irregolari, variantes-nuevas, quorum-cross-vendor, sovrabbondanti, invariabili, R1-R7]
requires:
  - "27-01 (sustantivos-irregulares.json en shape slot+variantes HIBRIDO, 5 slots, 31 variantes)"
  - "Infra de quorum cross-vendor (skill gsd-validate-exercise + scripts/validate-ai-pass.mjs)"
provides:
  - "sustantivos-irregulares.json con 13 variantes nuevas validadas integradas en los 3 slots del bloque regla (31 -> 44 variantes)"
  - "los 3 ejes de huecos D-27-03 materializados SOLO en el bloque regla (sovrabbondanti -o->-a, invariabili-accentate, invariabili-straniere)"
affects:
  - "27-03 (conteo final determinable: 5 slots, las variantes NO suben data.exercises.length; sincroniza el count hardcodeado 31 -> 5)"
tech-stack:
  added: []
  patterns:
    - "variantes nuevas validadas 1-por-1 por quorum cross-vendor (opus+sonnet+2 externos by distintos) ANTES de entrar al slot (VAL-03 NUNCA batched)"
    - "fallback D-19-08: mitad Claude via `claude -p --model` headless (Opus->Sonnet) con el ejercicio SIN su campo validation"
    - "fallback de externos: deepseek-chat + deepseek-reasoner como 2 by distintos cuando Gemini agota cuota 429"
    - "R7 doble-validez resuelto por REFORMULACION (contexto + concordancia + gloss ES canon), NO override-atajo (calidad > tokens)"
    - "frame de concordancia (Le sue ___ folte) para forzar el genero femenino en sovrabbondanti con masc plural marginal-valido"
    - "variantes engordan slots existentes sin crear slots nuevos (count estable 5)"
key-files:
  created:
    - ".planning/phases/27-sostantivi-irregolari-a-slots-contenido-l-xica/27-02-SUMMARY.md"
  modified:
    - "content/exercises/sustantivos-irregulares.json (31 -> 44 variantes; 13 nuevas en los 3 slots del bloque regla)"
    - ".planning/phases/27-sostantivi-irregolari-a-slots-contenido-l-xica/27-VARIANTES-NUEVAS.md (fixes de checkpoint + resultados del quorum)"
decisions:
  - "Checkpoint aprobado con 2 fixes de materializacion: virtu options 4 distintas ['virtudi','virtù','virtùe','virti'] correctIndex 1 (R5); eta prompt cambiado a Un'età con apostrofo ASCII U+0027 (elision italiana real). Ambas pasaron el quorum limpias."
  - "13/13 superficies VALIDADAS por quorum cross-vendor (gate D-17-07 >=4x correcta, 0 incorrecta, >=2 externos by distintos) e integradas; 0 descartadas en validacion"
  - "4 bugs R7 doble-validez cazados por el quorum en el eje 1 (sovrabbondanti): ciglio (cigli=bordes), sopracciglio (sopraccigli masc marginal-valido), lenzuolo (lenzuoli=sueltas), miglio (migli=mijo) -> resueltos por REFORMULACION (contexto desambiguador + concordancia + gloss ES canon R7), re-validados desde cero limpios"
  - "NO crear slots nuevos (D-27-03): las 13 variantes engordan los 3 slots del bloque regla existentes; count final = 5 slots (lo sincroniza 27-03), NO sube"
  - "bloque lexico (cambio-radice 8 vars) y contraste (plurali-regolari 8 vars) INTACTOS sin variantes nuevas (SOST-01/D-27-05)"
metrics:
  duration: "~120 min"
  completed: "2026-06-09"
  tasks: 1
  files: 2
---

# Phase 27 Plan 02: Sostantivi irregolari variantes nuevas del bloque regla por quorum cross-vendor Summary

Las **13 superficies nuevas** de los 3 ejes de huecos priorizados del BLOQUE REGLA (D-27-03) autoradas y validadas **1-por-1 por quorum cross-vendor R1-R7** (>=4x correcta: Opus 4.8 + Sonnet 4.6 base canonica + 2 externos `by` distintos, CERO incorrecta) e integradas a los 3 slots del bloque regla de 27-01; **0 slots nuevos** (count estable = 5 slots, lo sincroniza 27-03); el **bloque lexico puro** (cambio-radice) y el de **contraste** (plurali-regolari) quedan INTACTOS (SOST-01/D-27-05); `validateContent` verde; el rojo del count hardcodeado sigue ESPERADO hasta 27-03.

## What Was Built

**Task 1 (executor previo, commit `0cb85eb`):** `27-VARIANTES-NUEVAS.md` — propuesta de los 3 ejes del bloque regla (13 superficies; muro/frutto/budello/cervello descartados pre-quorum por doble-plural semantico o caracter literario). El checkpoint:human-verify fue resuelto por el autor con **"aprobado + 2 fixes"**: (1) virtù options corregidas a 4 valores distintos `["virtudi","virtù","virtùe","virti"]` correctIndex 1 (R5); (2) età prompt cambiado a `Un'età, due ___.` (elision italiana, apostrofo ASCII U+0027). Ambos fixes aplicados antes de validar esas dos superficies.

**Task 2 (commit `703d2cf`):** las 13 superficies validadas por quorum e integradas:

| Eje | Slot destino | Superficies nuevas (forma verificada por el quorum) |
|-----|--------------|------------------------------------------------------|
| 1 — SOVRABBONDANTI -o->-a | `sustantivos-irregulares-sovrabbondanti` (10->16 vars) | ciglio->ciglia, sopracciglio->sopracciglia, paio->paia, lenzuolo->lenzuola, miglio->miglia + inverso ciglia->ciglio |
| 2 — INVARIABILI-ACCENTATE | `sustantivos-irregulares-invariabili-accentate` (3->7 vars) | virtù, tribù, novità, età (vocal tonica final, tilde grave) |
| 3 — INVARIABILI-STRANIERE | `sustantivos-irregulares-invariabili-straniere` (2->5 vars) | bar, computer, autobus (consonante final, invariables) |

Total: **13 variantes nuevas** integradas -> 44 variantes en 5 slots (31 de 27-01 + 13 nuevas). 0 slots nuevos. Las variantes en `variants[]` NO llevan explanation ni validation propia (comparten la del slot, que conserva su `validation` top-level de 27-01).

## Verification Evidence

- `node scripts/validate-content-fixture.mjs sustantivos-irregulares content/exercises/sustantivos-irregulares.json` -> **exit 0, 5 ejercicios**
- sovrabbondanti variants: **16** (>10 de 27-01); invariabili-accentate: **7** (>3); invariabili-straniere: **5** (>2) — los 3 slots del bloque regla engordados
- Cada superficie nueva paso el quorum con **>=4 `by` correcta, >=2 externos `by` distintos, 0 incorrecta** ANTES de integrarse (gate D-17-07 PASS en las 13, auditado en el fixture temporal)
- slots con variants[] sin validation top-level: **0** (todos validated; los 3 engordados conservan su validation top-level de 27-01)
- con payload: **0** (ningun id temporal legacy residual)
- no-MC: **0** (set 100% MC, sin match/word-buttons introducidos)
- cambio-radice variants: **8** (INTACTO), plurali-regolari variants: **8** (INTACTO) — bloque lexico y contraste sin engorde (SOST-01/D-27-05)
- cruces 30x: **0** · todos categoryIds=["sustantivos-irregulares"]: **true**
- refs cross-cat (Genere e numero/Articoli por id/prosa): **0** (D-27-06)
- smart-quotes en el JSON: **0** (grep `[‘’“”]` sin matches); apostrofo de `Un'età` = U+0027 (charcode 39) confirmado
- R1: 0 leaks en ningun prompt nuevo (sin §N, sin -o->-a, sin "invariable/sobreabundante" en el prompt)
- total slots: **5** (las 13 variantes NO suben `data.exercises.length`)
- NO snapshot para Sostantivi irregolari (avere-only) — no se ejecuto ningun script de snapshot/assert; NO se crearon cruces 300..305

## Flujo del quorum (1-por-1, NUNCA batched)

Cada superficie se materializo como ejercicio MC legacy aislado (id temporal `tmp-sost-*` + payload + validation vacia) en un fixture temporal (`tests/fixtures/tmp-sost-27-02.json`, eliminado al final) y se valido en >=4 pases:

1. **Base canonica Claude (D-27-11):** `claude -p --model claude-opus-4-7` y `--model claude-sonnet-4-6` headless via un helper temporal (`scripts/tmp-claude-pass.mjs`, eliminado al final), 1 proceso por modelo por superficie (fallback D-19-08, el executor no tiene Task). Cada proceso = contexto vacio = equivalente funcional NUNCA batched (VAL-03), ejercicio SIN su campo validation (no sesgar).
2. **Refuerzo externos:** `validate-ai-pass.mjs --write`. Gemini agoto cuota (429) en varias superficies; el 2o `by` externo distinto se cubrio con **deepseek-chat + deepseek-reasoner** (precedente 22/23/24/25/26-02). Pitfall del fallback corregido: cuando Gemini cae a deepseek-chat, el 2o externo se fuerza a deepseek-reasoner (avoid deepseek-chat) o ambos colapsan al mismo `by`.
3. **Gate D-17-07:** passes[] final >= 4x correcta (>=2 externos distintos), 0 incorrecta -> validated. Tras pasar, la superficie se movio a variants[] del slot (sin explanation ni validation propia) y se elimino el id temporal.

Coste: 13 superficies x (2 canonicos + 2 externos) + 4 re-validaciones por reformulacion = ~68 invocaciones, 1-por-1.

## Deviations from Plan

**Plan ejecutado segun lo aprobado en el checkpoint** ("aprobado + 2 fixes"). Los 2 fixes de materializacion son decisiones del autor; las reformulaciones de los 4 disputes son la resolucion por el flujo documentado (calidad > tokens, NO override-atajo).

### Bugs reales cazados por el quorum (Rule 1 — resueltos por REFORMULACION)

Los 4 fueron R7 doble-validez en el eje 1 (sovrabbondanti): una opcion-distractora resultaba ser un plural italiano VALIDO con otro sentido, haciendo el prompt desnudo `Un X, due ___` ambiguo. Resueltos anclando una sola lectura por contexto + concordancia + gloss ES canon R7, y re-validados desde cero (4x correcta).

**1. [Quorum-catch] ciglio: doble-validez C2 (R7)**
- **Cazado por:** claude-opus-4-7 (base canonica) — verdict incorrecta `[C2-una_opcion]`
- **Issue:** `cigli` (masc) es plural valido de `ciglio` con el sentido "bordes/orillas"; el prompt `Un ciglio, due ___.` no fijaba la lectura anatomica "pestañas" (`ciglia`).
- **Fix:** prompt reformulado a `Mi trucco gli occhi: ho un ciglio lungo e due ___ corte (en español: pestañas).` — contexto de maquillaje + concordancia femenina `corte` + gloss ES fijan `ciglia`.
- **Re-validacion:** Opus + Sonnet + gemini + deepseek-chat todos correcta.

**2. [Quorum-catch] sopracciglio: doble-validez C2 (R7) — unanime (3/4)**
- **Cazado por:** Sonnet + deepseek-chat + deepseek-reasoner — `sopraccigli` (masc) es plural marginal-valido en Treccani/Devoto-Oli, ambos significan "cejas".
- **1er intento de fix fallido:** un frame `un X / due Y` con contexto implicaba "3 cejas" (C1 absurdo) y `sopraccigliii` triple-i era typo, no distractor (cazado por Opus en el re-pase).
- **Fix definitivo:** prompt sin contraste numerico, con frame de concordancia: `Le sue ___ folte le coprono gli occhi (en español: cejas).` — la concordancia femenina `le ... folte` exige `sopracciglia` (el masc `sopraccigli` pediria `i ... folti`), eliminando la doble-validez. Distractor masc valido conservado pero ya descartado por la concordancia.
- **Re-validacion:** Opus + Sonnet + deepseek-chat + deepseek-reasoner todos correcta.

**3. [Quorum-catch] lenzuolo: doble-validez C2 (R7) — unanime (4/4)**
- **Cazado por:** Opus + Sonnet + deepseek-chat + deepseek-reasoner — `lenzuoli` (masc) es plural valido para sabanas sueltas; `lenzuola` (fem) para el juego de cama.
- **Fix:** prompt reformulado a `Le ___ del letto matrimoniale sono pulite (en español: las sábanas).` — contexto de cama colectivo + concordancia `le ... pulite` + gloss ES fijan `lenzuola`.
- **Re-validacion:** Opus + Sonnet + deepseek-chat + deepseek-reasoner todos correcta.

**4. [Quorum-catch] miglio: doble-validez C2 (R7)**
- **Cazado por:** deepseek-reasoner (base canonica Opus+Sonnet ya correcta, pero la entry incorrecta hace disputed-sticky y la concern es legitima) — `migli` es plural valido de `miglio`=mijo (cereal); `miglia` de `miglio`=milla.
- **Fix:** prompt reformulado a `La città è lontana: dobbiamo percorrere ancora molte ___ in macchina (en español: millas).` — contexto de distancia recorrida fija el sentido de medida y exige `miglia`.
- **Re-validacion:** Opus + Sonnet + deepseek-chat + deepseek-reasoner todos correcta.

### Fixes de checkpoint aplicados (decisiones del autor, no desviacion)

- **virtù (R5):** options materializadas como `["virtudi","virtù","virtùe","virti"]`, correctIndex 1 (4 valores distintos; corrige la respuesta duplicada de la propuesta). Quorum limpio.
- **età (apostrofo):** prompt `Un'età, due ___.` con apostrofo ASCII U+0027 (elision italiana real `un'età`), correctIndex 0 -> `età`. Quorum limpio.

Ningun auto-fix (Rules 2-3) adicional fue necesario.

## Fallback aplicado (no es desviacion)

- **Gemini 429:** Gemini agoto su cuota en la mayoria de superficies tras las primeras. Cubierto con deepseek-chat + deepseek-reasoner como 2 `by` externos distintos (precedente MEMORY multi_vendor_quorum_validator + Phases 22-26). El quorum se computa sobre el `by` real -> cada superficie tiene >=2 externos distintos. ciglio, paio conservaron gemini + deepseek-chat (disponibles antes del agotamiento).
- **claude -p Sonnet vacio (miglio):** un pase Sonnet via `claude -p` devolvio output vacio (transitorio); re-ejecutado -> correcta. No es bug de contenido.

## Known Stubs

None — las 13 variantes son contenido real validado, integradas y operativas. El bloque lexico puro (cambio-radice) y el de contraste (plurali-regolari) NO reciben variantes por diseño (SOST-01/D-27-05: cambio de raiz impredecible no admite variantes intercambiables; los foils regulares no son el proposito a engordar) — documentado en 27-VARIANTES-NUEVAS.md, no son stubs.

## Threat Flags

None — todas las variantes mitigan T-27-06 (forma plural/invariabilidad confirmada por el quorum; las 4 doble-validez R7 cazadas y resueltas), T-27-07 (0 variantes en bloque lexico/contraste), T-27-03 (sin leak R1, sin smart-quotes/markdown, tildes graves en las acentuadas), T-27-05 (0 refs a Genere e numero/Articoli), T-27-09 (no slots nuevos; validation top-level de 27-01 conservada). No se introduce superficie de seguridad nueva (app local single-user offline).

## Rojo esperado (NO arreglado aqui — es 27-03)

`node --test tests/*.test.js` -> **373 pass / 1 fail**. El unico fail es el count hardcodeado de sustantivos-irregulares (`Esperaba 31 ejercicios, encontré 5`) en la suite de fixtures — es el rojo de 27-01 (5 slots vs 31 superficies legacy) que 27-03 sincroniza contra `data.exercises.length` real (= 5 slots; las 13 variantes nuevas NO suben el count). NO se tocan counts aqui.

## Self-Check: PASSED

- FOUND: content/exercises/sustantivos-irregulares.json (5 slots, 44 variantes, validateContent exit 0)
- FOUND: .planning/phases/27-sostantivi-irregolari-a-slots-contenido-l-xica/27-02-SUMMARY.md
- FOUND commit 703d2cf (integracion de las 13 variantes + 27-VARIANTES-NUEVAS.md)
- FOUND commit previo 0cb85eb (Task 1 propuesta)
- Archivos temporales (fixture tmp-sost-27-02.json + helpers tmp-claude-pass.mjs / tmp-insert-pass.mjs / tmp-quorum-one.sh) eliminados; sin untracked
