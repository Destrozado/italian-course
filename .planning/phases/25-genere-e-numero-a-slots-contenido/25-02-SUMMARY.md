---
phase: 25-genere-e-numero-a-slots-contenido
plan: 02
subsystem: contenido-editorial
tags: [genero-numero, variantes-nuevas, quorum-cross-vendor, morfologia, R1-R7]
requires:
  - "25-01 (genero-numero.json en shape slot+variantes, 12 slots, 40 superficies)"
  - "Infra de quorum cross-vendor (skill gsd-validate-exercise + scripts/validate-ai-pass.mjs)"
provides:
  - "genero-numero.json con 20 variantes nuevas validadas integradas (60 variantes totales en 12 slots)"
  - "los 4 ejes de huecos D-25-04 materializados (invariables, sonido duro con excepcion, genero -trice/-essa, plural base)"
affects:
  - "25-03 (conteo final determinable: 12 slots, las variantes no suben data.exercises.length)"
tech-stack:
  added: []
  patterns:
    - "variantes nuevas validadas 1-por-1 por quorum cross-vendor (opus+sonnet+2 externos by distintos) ANTES de entrar al slot"
    - "fallback D-19-08: pase Claude via `claude -p` headless (Opus->Sonnet) cuando el executor no tiene Task"
    - "fallback de externos: deepseek-chat + deepseek-reasoner como 2 by distintos cuando Gemini agota cuota 429"
    - "variantes engordan slots existentes sin crear slots nuevos (count estable 12)"
key-files:
  created:
    - ".planning/phases/25-genere-e-numero-a-slots-contenido/25-02-SUMMARY.md"
  modified:
    - "content/exercises/genero-numero.json (40 -> 60 variantes; 20 nuevas en 7 slots existentes)"
decisions:
  - "Checkpoint aprobado: 17 propuestas + extras del eje 1 (computer/autobus a invariabili) + medico (eje 2, plurale-co-chi PIERDE) = 20 superficies nuevas"
  - "NO crear slots nuevos (D-25-04): las variantes engordan slots existentes; count final = 12 (lo sincroniza 25-03), NO sube"
  - "R5 corregido: las 4 superficies del eje 3 (-trice/-essa) materializadas con 4 options TODAS distintas (la propuesta .md tenia un option duplicado)"
  - "amico->amici (PIERDE el sonido, sin h) es la excepcion estrella del eje 2, confirmada por el quorum"
metrics:
  duration: "~50 min"
  completed: "2026-06-08"
  tasks: 1
  files: 1
---

# Phase 25 Plan 02: Genere e numero variantes nuevas por quorum cross-vendor Summary

Las **20 superficies nuevas** de los 4 ejes de huecos priorizados (D-25-04) autoradas y validadas **1-por-1 por quorum cross-vendor R1-R7** (>=4x correcta: Opus + Sonnet + 2 externos `by` distintos, CERO incorrecta) e integradas a los 7 slots MC existentes de 25-01; **0 slots nuevos** (count estable = 12 slots, lo sincroniza 25-03); `validateContent` verde; el rojo del count hardcodeado (40 vs 12) sigue ESPERADO hasta 25-03.

## What Was Built

**Task 1 (ya hecho por el ejecutor previo, commit `b2e9986`):** `25-VARIANTES-NUEVAS.md` — propuesta de 17 superficies de los 4 ejes. El checkpoint:human-verify fue resuelto por el autor con decisiones: (1) las 17 al quorum, formas eje 2 confirmadas; (2) materializar tambien las extras del eje 1 (`computer`, `autobus` -> invariabili) y `medico` (-> plurale-co-chi, PIERDE el sonido) -> ~20 superficies; (3) NO crear slots nuevos (count 12); (4) R5: las 4 del eje 3 con 4 options TODAS distintas.

**Task 2 (commits `a568668`, `16e9b1b`, `48805cd`, `ed3d419`, `70ec5ee`):** las 20 superficies validadas por quorum e integradas:

| Eje | Slot destino | Superficies nuevas (forma verificada por el quorum) |
|-----|--------------|------------------------------------------------------|
| 1 — INVARIABLES | `genero-numero-invariabili` (5->12 vars) | virtù, libertà, qualità (acentuados); sport, bar, computer, autobus (extranjerismos consonante) — todos invariables (plural = singular) |
| 2 — SONIDO DURO -co/-go con excepcion | `genero-numero-plurale-co-chi` (7->13 vars) | amico->amici, greco->greci, nemico->nemici, medico->medici (PIERDEN, sin h); lago->laghi, gioco->giochi (CONSERVAN, con h) |
| 3 — GENERO -tore/-trice vs -e/-essa | `femminile-trice` (4->6) + `femminile-essa` (4->6) | direttore->direttrice, pescatore->pescatrice (-trice); barone->baronessa, conte->contessa (-essa) |
| 4 — PLURAL base -o/-a/-e | `plurale-o-i` (3->4), `plurale-a-e` (3->4), `plurale-e-i` (4->5) | gatto->gatti (masc -o), porta->porte (fem -a), fiore->fiori (-e) |

Total: **20 variantes nuevas** integradas → 60 variantes en 12 slots (40 de 25-01 + 20 nuevas). 0 slots nuevos.

## Verification Evidence

- `node scripts/validate-content-fixture.mjs genero-numero content/exercises/genero-numero.json` -> **exit 0, 12 ejercicios**
- amico->amici presente como variante validada del slot sonido-duro: **true**
- Cada superficie nueva paso el quorum con **>=4 `by` correcta, 0 incorrecta** ANTES de integrarse (auditado en el fixture temporal: byTot>=4, ext>=2, inc=0 en las 20)
- slots con variants[] sin validation top-level: **0** (todos validated, los 7 engordados conservan su validation top-level de 25-01)
- con payload: **0** (ningun id temporal legacy residual)
- match slots: **2** (PRESERVADOS, D-25-03/D-04, no convertidos a MC)
- cruces 300-305: **0** · word-buttons: **0**
- refs a la categoria Articoli (id/prosa): **0** (D-25-02)
- smart-quotes: **0** (grep `[‘’“”]` sin matches); acentos italianos correctos en options (virtù/libertà/qualità) — DeepSeek estricto en acentos validó cada uno
- total variantes: **60** (40 + 20); las variantes NO suben `data.exercises.length` (= 12)
- categorias vecinas intactas: avere (20) OK, articoli (34) OK
- NO snapshot para genero-numero (avere-only, D-25-10) — no se ejecuto ningun script de snapshot/assert

## Flujo del quorum (1-por-1, NUNCA batched)

Cada superficie se materializo como ejercicio MC legacy aislado (id temporal + payload) en un fixture temporal y se valido en 4 pases:
1. **Base canonica Claude (D-25-09):** `claude -p --model claude-opus-4-7` y `--model claude-sonnet-4-6` headless, 1 proceso por modelo por superficie (fallback D-19-08, el executor no tiene Task). Cada `claude -p` es un proceso aislado con contexto vacio = equivalente funcional NUNCA batched (VAL-03), ejercicio SIN su campo validation (no sesgar).
2. **Refuerzo externos:** `validate-ai-pass.mjs --write`. Gemini agoto cuota (429) en casi todas las superficies; el 2º `by` externo distinto se cubrio con **deepseek-chat + deepseek-reasoner** (precedente 22-VERIFICATION / 23-02 / 24-02). qualità tomo gemini + deepseek-chat (los 2 externos disponibles antes del agotamiento).
3. **Gate D-17-07:** passes[] final >= 4x correcta (>=2 by externos distintos), 0 incorrecta -> validated. Tras pasar, la superficie se movio a variants[] del slot (sin explanation ni validation propia — comparten la del slot) y se elimino el id temporal.

Las 20 superficies pasaron limpias: **0 disputed, 0 reformulaciones necesarias**. El quorum confirmo la forma real de plural/femenino de cada palabra (D-25-04): especialmente la regla no-predecible del sonido duro (-co/-go) — amico/greco/nemico/medico PIERDEN (sin h), lago/gioco CONSERVAN (con h).

## Deviations from Plan

**Plan ejecutado segun lo aprobado en el checkpoint.** Las desviaciones respecto a la *propuesta .md* de Task 1 son las decisiones EXPLICITAS del autor en el checkpoint (no auto-aplicadas):
- **+3 superficies vs la propuesta (17->20):** computer, autobus (eje 1 -> invariabili), medico (eje 2 -> plurale-co-chi). Aprobado por el autor (decision 2 del checkpoint).
- **R5 eje 3 corregido:** las 4 superficies -trice/-essa se materializaron con 4 options TODAS distintas (la propuesta tenia un option duplicado por error de redaccion). Recordatorio R5 del checkpoint (decision 4) y de la propia propuesta.

Ningun auto-fix (Rules 1-3) fue necesario — las superficies pasaron el quorum a la primera.

## Fallback aplicado (no es desviacion)

- **Gemini 429:** Gemini agoto su cuota diaria en casi todas las superficies. Cubierto con deepseek-chat + deepseek-reasoner como 2 `by` externos distintos (precedente documentado en MEMORY multi_vendor_quorum_validator + Phases 22/23/24). El quorum se computa sobre el `by` real -> cada superficie tiene >=2 externos distintos.

## Known Stubs

None — las 20 variantes son contenido real validado; integradas y operativas. Las celdas pobres marcadas en 25-01 (articolo-suono 2 vars, articolo-plurale-logo 1 var, match-plurale 1 var) NO eran ejes priorizados por el autor (D-25-04 marco los 4 ejes morfologicos) — se dejan intactas, no son stubs.

## Threat Flags

None — todas las variantes mitigan T-25-05 (forma de plural/femenino confirmada por el quorum), T-25-03 (sin leak R1, sin smart-quotes/markdown), T-25-02b (0 refs a la categoria Articoli). No se introduce superficie de seguridad nueva (app local single-user offline).

## Rojo esperado (NO arreglado aqui — es 25-03)

`node --test tests/*.test.js` -> **373 pass / 1 fail**. El unico fail es el count hardcodeado de genero-numero (Esperaba 40, encontre 12) en `tests/exercise-types.test.js`, `tests/fixtures/slot-variants-integration.test.js` y `scripts/run-validation-271.mjs` (+ `TOTAL_EXPECTED`). Es el rojo ESPERADO documentado; lo sincroniza 25-03 contra `data.exercises.length` real (= 12; las 20 variantes nuevas NO suben el count). NO se tocan counts aqui.

## Self-Check: PASSED

- FOUND: content/exercises/genero-numero.json (12 slots, 60 variantes, validateContent exit 0)
- FOUND: .planning/phases/25-genere-e-numero-a-slots-contenido/25-02-SUMMARY.md
- FOUND commit a568668 (virtù) · 16e9b1b (eje 1 resto) · 48805cd (eje 2) · ed3d419 (eje 3) · 70ec5ee (eje 4)
- Archivos temporales (fixture + script helper) eliminados; sin untracked
