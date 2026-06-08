---
phase: 26-professioni-a-slots-contenido-l-xica
plan: 02
subsystem: contenido-editorial
tags: [professioni, variantes-nuevas, quorum-cross-vendor, feminizacion, R1-R7]
requires:
  - "26-01 (profesiones.json en shape slot+variantes HIBRIDO, 11 slots)"
  - "Infra de quorum cross-vendor (skill gsd-validate-exercise + scripts/validate-ai-pass.mjs)"
provides:
  - "profesiones.json con 12 variantes nuevas validadas integradas en los 5 slots de feminizacion (38 -> 50 variantes)"
  - "los 3 ejes de huecos D-26-04 materializados SOLO en feminizacion (contraste -trice/-essa, invariables -ista/-ante, -o/-a y -iere/-iera)"
affects:
  - "26-03 (conteo final determinable: 11 slots, las variantes NO suben data.exercises.length; sincroniza los counts hardcodeados)"
tech-stack:
  added: []
  patterns:
    - "variantes nuevas validadas 1-por-1 por quorum cross-vendor (opus+sonnet+2 externos by distintos) ANTES de entrar al slot (VAL-03 NUNCA batched)"
    - "fallback D-19-08: mitad Claude via `claude -p` headless (Opus->Sonnet) con el ejercicio SIN su campo validation"
    - "fallback de externos: deepseek-chat + deepseek-reasoner como 2 by distintos cuando Gemini agota cuota 429"
    - "disputed resuelto por REFORMULACION (poeta: contexto Saffo + gloss ES), NO override-atajo (calidad > tokens)"
    - "falso-positivo de un externo sobre texto correcto: re-run del MISMO texto (lavoratore C4-idioma, operaio C5-etiqueta permitida)"
    - "variantes engordan slots existentes sin crear slots nuevos (count estable 11)"
key-files:
  created:
    - ".planning/phases/26-professioni-a-slots-contenido-l-xica/26-02-SUMMARY.md"
  modified:
    - "content/exercises/profesiones.json (38 -> 50 variantes; 12 nuevas en los 5 slots de feminizacion)"
decisions:
  - "Checkpoint aprobado: las superficies tal cual, eroe DESCARTADO -> 12 superficies materializables (el '13' del resumen de la propuesta contaba eroe, que ya estaba en la seccion de descartes; sin tabla/payload). 12 al quorum."
  - "NO crear slots nuevos (D-26-04): las 12 variantes engordan los 5 slots de feminizacion existentes; count final = 11 slots (lo sincroniza 26-03), NO sube"
  - "poeta disputed (Sonnet C2: 'la poeta' invariable moderno compite con poetessa) -> reformulado con contexto 'Saffo e la piu famosa ___ dell'antica Grecia (en espanol: la poetisa)' + gloss ES canon R7; re-validado limpio Opus+Sonnet"
  - "lavoratore y operaio disputed por falso-positivo de deepseek-chat (C4-idioma: 'femenino' es ESPANOL correcto; C5-etiqueta: (masc)/(fem) PERMITIDA por R1 ante elision l') -> re-run del mismo texto, ambos validated; base canonica Opus+Sonnet+deepseek-reasoner ya correcta"
metrics:
  duration: "~90 min"
  completed: "2026-06-09"
  tasks: 1
  files: 1
---

# Phase 26 Plan 02: Professioni variantes nuevas de feminizacion por quorum cross-vendor Summary

Las **12 superficies nuevas** de los 3 ejes de huecos priorizados de FEMINIZACION (D-26-04) autoradas y validadas **1-por-1 por quorum cross-vendor R1-R7** (>=4x correcta: Opus + Sonnet base canonica + 2 externos `by` distintos, CERO incorrecta) e integradas a los 5 slots de feminizacion de 26-01; **0 slots nuevos** (count estable = 11 slots, lo sincroniza 26-03); el **bloque lexico puro** (comprension + 3 match) y los **5 word-buttons** quedan INTACTOS (PROF-01/D-26-02/D-26-06); `validateContent` verde; el rojo del count hardcodeado sigue ESPERADO hasta 26-03.

## What Was Built

**Task 1 (executor previo, commit `6850cf9`):** `26-VARIANTES-NUEVAS.md` — propuesta de los 3 ejes de feminizacion (eroe descartado por irregularidad eroe->eroina, no -essa). El checkpoint:human-verify fue resuelto por el autor con **"aprobado — las superficies tal cual, sin ajustes; eroe DESCARTADO"**. Las tablas materializables de la propuesta listan **12 superficies** (el "13" del resumen sumaba eroe, que vivia en la seccion de descartes sin tabla/payload).

**Task 2 (commits `495771b`, `ff2f34d`, `0752d2b`, `6af6df3`, `4269eeb`):** las 12 superficies validadas por quorum e integradas, 1 commit por slot:

| Eje | Slot destino | Superficies nuevas (forma verificada por el quorum) |
|-----|--------------|------------------------------------------------------|
| 1 — CONTRASTE -tore/-trice | `profesiones-femminile-trice` (8->11 vars) | scrittore->scrittrice, lettore->lettrice, lavoratore->lavoratrice |
| 1 — CONTRASTE -e/-essa | `profesiones-femminile-essa` (4->6 vars) | poeta->poetessa (reformulado), principe->principessa |
| 2 — INVARIABLES -ista/-ante | `profesiones-invariabili` (12->16 vars) | artista, regista (-ista) + comandante, agente (-nte) — invariables, distractora = calco -istessa/-antessa |
| 3 — -o/-a REGULAR | `profesiones-femminile-o-a` (10->12 vars) | maestro->maestra, operaio->operaia |
| 3 — -iere/-iera | `profesiones-femminile-iera` (4->5 vars) | giardiniere->giardiniera |

Total: **12 variantes nuevas** integradas -> 50 variantes en 11 slots (38 de 26-01 + 12 nuevas). 0 slots nuevos.

## Verification Evidence

- `node scripts/validate-content-fixture.mjs profesiones content/exercises/profesiones.json` -> **exit 0, 11 ejercicios**
- trice variants: **11** (>8 de 26-01), essa variants: **6** (>4 de 26-01) — el contraste -trice/-essa engordado en sus dos slots
- Cada superficie nueva paso el quorum con **>=4 `by` correcta, >=2 externos `by` distintos, 0 incorrecta** ANTES de integrarse (gate D-17-07 PASS en las 12, auditado en el fixture temporal)
- slots con variants[] sin validation top-level: **0** (todos validated; los 5 engordados conservan su validation top-level de 26-01)
- con payload: **0** (ningun id temporal legacy residual)
- match slots: **3** (PRESERVADOS, D-26-02/D-04, no convertidos a MC, sin variantes nuevas)
- word-buttons slots: **1** (PRESERVADO, D-26-06; nota: 26-01 agrupo los 5 WB en 1 slot `profesiones-essere-wb` con 5 variants — intacto)
- comprension variants: **2** (NO engordo — bloque lexico puro PROF-01)
- cruces 30x: **0** · todos categoryIds=["profesiones"]: **true**
- refs cross-cat (Articoli/Essere/Genero por id/prosa): **0** (D-26-05)
- override autor de collega (020) presente verbatim en invariabili: **true** (no degradado al engordar)
- smart-quotes en el JSON: **0** (grep `[‘’“”]` sin matches)
- total slots: **11** (las 12 variantes NO suben `data.exercises.length`)
- NO snapshot para Professioni (avere-only, D-26-10) — no se ejecuto ningun script de snapshot/assert; NO se crearon cruces 300..305

## Flujo del quorum (1-por-1, NUNCA batched)

Cada superficie se materializo como ejercicio MC legacy aislado (id temporal `tmp-prof-*` + payload + validation vacia) en un fixture temporal (`tests/fixtures/tmp-prof-26-02.json`, eliminado al final) y se valido en >=4 pases:

1. **Base canonica Claude (D-26-11):** `claude -p --model claude-opus-4-7` y `--model claude-sonnet-4-6` headless via un script helper temporal (`scripts/tmp-claude-pass.mjs`, eliminado al final), 1 proceso por modelo por superficie (fallback D-19-08, el executor no tiene Task). Cada proceso = contexto vacio = equivalente funcional NUNCA batched (VAL-03), ejercicio SIN su campo validation (no sesgar).
2. **Refuerzo externos:** `validate-ai-pass.mjs --write`. La primera superficie (scrittore) tomo gemini + deepseek-chat. A partir de la 2a, **Gemini agoto cuota (429)** en todas; el 2o `by` externo distinto se cubrio con **deepseek-chat + deepseek-reasoner** (precedente 22-VERIFICATION / 23-02 / 24-02 / 25-02). Atencion al pitfall del fallback: cuando Gemini cae a deepseek-chat, el 2o externo DEBE forzarse a deepseek-reasoner (avoid deepseek-chat), o ambos colapsan al mismo `by` y `writePass` sobreescribe -> se corrigio explicitamente.
3. **Gate D-17-07:** passes[] final >= 4x correcta (>=2 by externos distintos), 0 incorrecta -> validated. Tras pasar, la superficie se movio a variants[] del slot (sin explanation ni validation propia — comparten la del slot) y se elimino el id temporal.

## Deviations from Plan

**Plan ejecutado segun lo aprobado en el checkpoint.** No hubo desviaciones de scope; las decisiones son del autor (checkpoint "aprobado, eroe descartado") y la resolucion de los disputes por el flujo documentado:

### Bug real cazado por el quorum (Rule 1 — resuelto por REFORMULACION)

**1. [Quorum-catch] poeta: doble-validez C2 (R7)**
- **Cazado por:** claude-sonnet-4-6 (base canonica) — verdict incorrecta, `[C2-una_opcion]`
- **Issue:** el prompt original `Il poeta -> la ___` con `poeta` entre las options creaba doble-validez: `la poeta` (invariable, uso contemporaneo documentado, como la artista/atleta) compite con `poetessa`. R7 exige resolver la ambiguedad en el PROMPT, no post-fallo.
- **Fix (calidad > tokens, NO override-atajo):** reformulado a `Saffo e la piu famosa ___ dell'antica Grecia (en espanol: la poetisa).` — el contexto historico (Saffo, la poetisa por antonomasia) + el **gloss ES canon R7** "(en espanol: la poetisa)" fijan inequivocamente la forma sufijada tradicional, eliminando la lectura invariable. Explanation reescrita en consecuencia.
- **Re-validacion:** quorum completo desde cero -> Opus + Sonnet + deepseek-chat + deepseek-reasoner todos correcta (4x, 0 incorrecta).
- **Commit:** `ff2f34d`

### Falsos-positivos de un externo sobre texto correcto (re-run del MISMO texto, no reformulacion)

**2. [Falso-positivo] lavoratore: deepseek-chat C4-idioma**
- deepseek-chat marco incorrecta `[C4-explanation]` alegando que "'femenino' deberia ser 'femminile' en italiano". **Falso positivo:** la explanation esta en ESPANOL ("el femenino es -trice"), donde "femenino" es la palabra correcta — el evaluador confundio el idioma. La base canonica (Opus+Sonnet) + deepseek-reasoner dieron correcta. Re-run de deepseek-chat sobre el MISMO texto -> correcta (precedente Phase 19/22/23/25). La entry incorrecta (sticky) se limpio antes del re-run por ser alucinacion de idioma, no juicio sobre contenido.

**3. [Falso-positivo] operaio: deepseek-chat C5-etiqueta**
- deepseek-chat marco incorrecta `[C5-leak]` por las etiquetas `(masc)/(fem)`. **Falso positivo:** R1/C5 PERMITE explicitamente esas etiquetas cuando son estructuralmente necesarias ante elision `l'` que no desambigua el genero (`l'operaio` masc / `l'operaia` fem) — exactamente el caso aqui, y el mismo patron de los legacy `L'impiegato (masc)/L'avvocato (masc)/L'architetto (masc)` ya validados en 26-01. Opus + Sonnet + deepseek-reasoner dieron correcta. Re-run de deepseek-chat sobre el MISMO texto -> correcta.

> Estos 2 falsos-positivos NO son bugs de contenido (la base canonica Opus+Sonnet, que es la base de aprobacion D-26-11, dio correcta en ambos desde el primer pase; el otro externo deepseek-reasoner tambien). El feedback del autor (MEMORY) distingue: bug real -> reformular (poeta); alucinacion de un externo sobre texto correcto -> re-run del mismo texto.

Ningun auto-fix (Rules 2-3) adicional fue necesario.

## Fallback aplicado (no es desviacion)

- **Gemini 429:** Gemini agoto su cuota diaria tras la 1a superficie. Cubierto con deepseek-chat + deepseek-reasoner como 2 `by` externos distintos (precedente MEMORY multi_vendor_quorum_validator + Phases 22/23/24/25). El quorum se computa sobre el `by` real -> cada superficie tiene >=2 externos distintos. scrittore conservo gemini + deepseek-chat (los disponibles antes del agotamiento).

## Known Stubs

None — las 12 variantes son contenido real validado, integradas y operativas. El bloque lexico puro (comprension + 3 match) y los word-buttons NO reciben variantes por diseno (PROF-01/D-26-02/D-26-06: no toda celda admite variantes intercambiables) — documentado en 26-VARIANTES-NUEVAS.md, no son stubs.

## Threat Flags

None — todas las variantes mitigan T-26-07 (forma femenina/invariabilidad confirmada por el quorum; el contraste -trice/-essa y el calco -istessa cazados en las distractoras), T-26-08 (0 variantes en el bloque lexico), T-26-03 (sin leak R1, sin smart-quotes/markdown), T-26-05 (0 refs a las categorias Articoli/Essere/Genero), T-26-06 (override de collega preservado). No se introduce superficie de seguridad nueva (app local single-user offline).

## Rojo esperado (NO arreglado aqui — es 26-03)

`node --test tests/*.test.js` -> **373 pass / 1 fail**. El unico fail es el count hardcodeado de profesiones (`Esperaba 51 ejercicios, encontre 11`) en la suite de fixtures. Es el rojo ESPERADO documentado en el plan; lo sincroniza 26-03 contra `data.exercises.length` real (= 11 slots; las 12 variantes nuevas NO suben el count). NO se tocan counts aqui.

## Self-Check: PASSED

- FOUND: content/exercises/profesiones.json (11 slots, 50 variantes, validateContent exit 0)
- FOUND: .planning/phases/26-professioni-a-slots-contenido-l-xica/26-02-SUMMARY.md
- FOUND commits 495771b (eje1 trice) · ff2f34d (eje1 essa) · 0752d2b (eje2 invariabili) · 6af6df3 (eje3 o-a) · 4269eeb (eje3 iera)
- Archivos temporales (fixture tmp-prof-26-02.json + helper tmp-claude-pass.mjs) eliminados; sin untracked
