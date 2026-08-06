---
status: testing
phase: 42-fare-congiuntivo-4-slots-hom-grafas-disparador
source: [42-VERIFICATION.md]
started: 2026-08-06T10:00:00Z
updated: 2026-08-06T14:55:00Z
---

## Current Test

number: 3
name: Ojo humano sobre los 18 variantes de 42-02
expected: |
  Jugar la categoría en http://localhost:3000 y confirmar que las 5 casillas se sienten como el
  `presente` ya aprobado — rotación de variante entre pasadas, sujeto siempre presente en las
  homógrafas, disparador que descarta el otro modo sin dudar.
awaiting: user response

## Tests

### 1. Pasada TOP-LEVEL de quórum base (Opus+Sonnet) + ronda EXTRA DeepSeek

Correr el quórum base canónico vía el skill `gsd-validate-exercise` (Opus + Sonnet, criterios C1-C5,
**un subagent fresh por ejercicio — VAL-03, NUNCA batched**) sobre los 5 slots de
`content/exercises/fare-congiuntivo.json`, más la ronda EXTRA DeepSeek obligatoria (D-42-08) vía
`scripts/validate-ai-pass.mjs` sobre las **10 variantes homógrafas**:

| Slot | Variantes homógrafas | Forma |
|------|---------------------|-------|
| `fare-congiuntivo-presente` | io, tu, lui-lei | `faccia` |
| `fare-congiuntivo-imperfetto` | io, tu | `facessi` |
| `fare-congiuntivo-passato` | io, tu, lui-lei | `abbia fatto` |
| `fare-congiuntivo-trapassato` | io, tu | `avessi fatto` |

expected: los 5 slots en `validated`, `VAL_07_STRICT=1` en verde, gates de categoría sin romperse.
result: issue
reported: "Pasada corrida 2026-08-06 en top-level. 3/5 validated. `presente` y `passato` quedan
disputed. Los 4 slots del paradigma SÍ llevan pase `deepseek-reasoner` (D-42-08 cumplido).
`VAL_07_STRICT=1 node --test tests/*.test.js` → 852/853, falla el gate VAL-07 con los 2 disputed.
Suite sin el flag 837/837 verde y `content-fare-congiuntivo.test.js` 64/64 verde, así que
`status === deriveStatus(passes)` se sostiene: los disputed son contenido, no fontanería."
severity: major

Estado por slot tras la pasada (commit `247827b`):

| Slot | claude-opus-5 | claude-sonnet-5 | deepseek-reasoner | status |
|------|---------------|-----------------|-------------------|--------|
| `fare-congiuntivo-presente` | correcta | **incorrecta** | **incorrecta** | **disputed** |
| `fare-congiuntivo-imperfetto` | correcta | correcta | correcta | validated |
| `fare-congiuntivo-passato` | correcta | correcta | **incorrecta** | **disputed** |
| `fare-congiuntivo-trapassato` | correcta | correcta | correcta | validated |
| `fare-congiuntivo-disparador` | correcta | correcta | n/a (no homógrafo) | validated |

Las dos disputes son de naturaleza DISTINTA y no se resuelven igual — ver `## Gaps` G-42-1 y G-42-2.

**El aviso de falso positivo de abajo quedó invalidado por la propia pasada.** D-42-13 predecía el
flag C5 sobre el gloss de conjunción y lo declaraba falso positivo de política «porque la base de
aprobación es Claude Opus más Sonnet». En esta pasada el flag lo levanta **Sonnet**, que es la mitad
de esa base. El supuesto sobre el que se apoyaba la excepción ya no se sostiene: no es que una IA de
fuera discrepe del canon, es que el canon discrepa consigo mismo.

**Aviso de falso positivo conocido:** Gemini y DeepSeek marcarán el gloss léxico de conjunción
(`Benché (aunque)`, `Prima che (antes de que)`) como C5-leak. Es **falso positivo de política**
(D-42-13): el gloss traduce la conjunción, no el verbo, y «aunque» rige los dos modos en español,
así que no filtra la respuesta. **No se arregla.** La base de aprobación es Claude Opus+Sonnet.
En cambio, un flag C4-accent sobre español sin tildes **sí sería bug real** → se arreglan los acentos.

### 2. Confirmación lingüística de unicidad (backstop)

Confirmar que ninguna de las 30 variantes admite una segunda lectura defendible del disparador o del
marco de concordancia. Marcado `verification: backstop` en los dos PLAN.md.

Foco, por orden de riesgo demostrado:
- **Las 6 variantes del slot `fare-congiuntivo-disparador`** — es el punto exacto donde el code review
  ya encontró 2 defectos reales (CR-01, CR-02: `faceva` y `facesse` eran defendibles bajo un `ogni
  giorno` pelado). Corregidos con ancla temporal `in questo momento` / `adesso`, pero el ancla es
  nueva y no ha pasado por quórum.
- **El blindaje de concordancia de `passato` y `trapassato`** — sus 3 distractoras son formas de
  subjuntivo de la misma persona, incluidas las dos simples (`faccia`, `facessi`), así que el marco de
  cada prompt tiene que excluirlas limpiamente o la distractora se vuelve defendible.

expected: el pase de quórum se pronuncia explícitamente sobre esos dos bloques; cero variantes con una
opción defendiblemente correcta además de la key.
result: issue
reported: "El quórum SÍ se pronunció sobre los dos bloques, y la mitad del expected se cumple y la otra
no. Sobre el slot del disparador: las 6 variantes pasan limpias con Opus y Sonnet, `c2_una_opcion: true`
en los dos, así que el ancla deíctica nueva (`in questo momento` / `adesso`) que corrigió CR-01 y CR-02
aguanta el quórum. Sobre el blindaje de concordancia: `trapassato` pasa limpio los tres pases, pero
`passato` NO — DeepSeek encuentra una variante con dos lecturas defendibles, que es exactamente la
condición que este test existía para descartar. Así que el conteo de `cero variantes con una opción
defendiblemente correcta además de la key` es 1, no 0."
severity: blocker

**Por qué es humano:** ninguna aserción mecánica lo cierra, y el code review ya demostró que el riesgo
no es hipotético. Dar esto por verificado sin la pasada de quórum sería un pase silencioso sobre
exactamente el daño que esta categoría existe para prevenir — con la cascada D-54, una variante con dos
respuestas válidas resetea la categoría entera.

### 3. Ojo humano sobre los 18 variantes de 42-02 (opcional pero recomendado)

Solo el slot `presente` pasó por el checkpoint humano de wave 1. Los 18 de `passato`, `trapassato` y
`disparador` se autoraron con `autonomous: true`, sin gate. Los dos juicios lingüísticos de arriba van
marcados `human_judgment: true` en `coverage.D1` y `coverage.D3` de los SUMMARY.

expected: jugar la categoría en http://localhost:3000 y confirmar que las 5 casillas se sienten como el
`presente` ya aprobado — rotación de variante entre pasadas, sujeto siempre presente en las homógrafas,
disparador que descarta el otro modo sin dudar.
result: [pending]

## Summary

total: 3
passed: 0
issues: 2
pending: 1
skipped: 0
blocked: 0

## Gaps

- gap_id: G-42-2
  truth: "Ninguna de las 30 variantes admite una segunda lectura defendible; en particular el marco de
    concordancia de `passato` excluye limpiamente los dos tiempos simples del subjuntivo."
  status: failed
  reason: "deepseek-reasoner, [C2-una_opcion] sobre `fare-congiuntivo-passato` variante 1 (tu):
    «Il professore dubita che tu ___ il lavoro stamattina.» con key `abbia fatto`. La distractora
    `faccia` (congiuntivo presente) es defendible: `dubita che tu faccia il lavoro stamattina` es
    italiano correcto si `stamattina` se lee como la mañana de hoy todavía en curso. El marcador no
    fuerza la lectura de anterioridad, así que la variante tiene dos respuestas válidas."
  severity: blocker
  test: 2
  artifacts:
    - path: "content/exercises/fare-congiuntivo.json"
      issue: "`fare-congiuntivo-passato` variants[1].prompt — marcador `stamattina`"
  missing:
    - "Sustituir `stamattina` por un marcador inequívocamente pasado, coherente con los otros cinco
       del slot (`ieri sera`, `la settimana scorsa`, `domenica scorsa`, `sabato scorso`,
       `il mese scorso`) y distinto de todos ellos — el notes exige los seis distintos entre sí."
    - "Re-pasar el quórum sobre `fare-congiuntivo-passato` tras el fix (sticky disputed: un tercer
       `correcta` NO limpia el estado, hay que reemplazar los passes o registrar override de autor)."
  root_cause: "El notes declara que los seis marcadores del slot sitúan la acción como ya terminada,
    pero `stamattina` es deíctico a HOY y no cumple esa propiedad: los otros cinco son inequívocamente
    pasados, y ese es el único de los seis que admite lectura de acción en curso. El blindaje de
    concordancia de D-42-09 se apoya en dos patas, la principal en presente y el marcador de acción
    terminada; en esta variante la segunda pata no sostiene, así que el congiuntivo presente no cae
    por aspecto y sobrevive como respuesta defendible."
  debug_session: ""

- gap_id: G-42-1
  truth: "Los 5 slots quedan `validation.status: \"validated\"` y `VAL_07_STRICT=1` pasa a verde."
  status: failed
  reason: "`fare-congiuntivo-presente` queda disputed: claude-sonnet-5 y deepseek-reasoner emiten
    [C5-leak] sobre el gloss de conjunción `Benché (aunque)` de la variante 3 (noi). D-42-13 preveía
    este flag como falso positivo de política, pero lo condicionaba a que viniese de Gemini/DeepSeek
    «porque la base de aprobación es Claude Opus más Sonnet» — y aquí lo levanta Sonnet."
  severity: major
  test: 1
  artifacts:
    - path: "content/exercises/fare-congiuntivo.json"
      issue: "`fare-congiuntivo-presente` variants[3].prompt — gloss `(aunque)` sobre `Benché`"
    - path: "content/exercises/fare-congiuntivo.json"
      issue: "`notes`, D-42-13 — el aviso al quórum nombra solo Gemini y DeepSeek como fuente
        esperada del flag; el supuesto quedó invalidado"
  missing:
    - "DECISIÓN DE AUTOR, no arreglo mecánico: o se quita el gloss de los 4 prompts que lo llevan
       (2 `Benché`, 1 `Nonostante`, 1 `Prima che`) y se mueve a la explanation, o se mantiene el
       canon y se registra override de autor con audit trail (VAL-08, `by: \"autor\"`)."
    - "Si se mantiene el canon: reescribir el aviso de D-42-13 en `notes` para que declare que el
       flag puede venir TAMBIÉN de la base Claude, y decir qué se hace entonces — tal como está,
       el aviso predice un mundo que esta pasada ya refutó."
  root_cause: "El flag no se distribuye por proveedor sino por variante: Sonnet aprobó el mismo gloss
    en `imperfetto` (`Nonostante (a pesar de que)`), en `passato` (`Benché (aunque)`) y en las dos del
    `disparador` (`Benché`, `Prima che`), y solo lo marcó en `presente`. DeepSeek hizo lo mismo:
    aprobó el gloss de `imperfetto` y marcó el de `presente`. Es decir, los dos disidentes son
    internamente inconsistentes consigo mismos sobre el mismo patrón, lo que apunta a ruido de
    juicio sobre una regla que R1 no resuelve explícitamente (R1 declara una sola excepción, las
    etiquetas neutras (masc)/(fem), y el gloss léxico de conjunción no está en el texto de R1 —
    vive solo en el notes del proyecto, que el subagent no ve). El desacuerdo es de POLÍTICA no
    escrita en el prompt, no de italiano."
  debug_session: ""
