---
status: diagnosed
phase: 44-integraci-n-lockstep-cierre-v2-0
source: [44-VERIFICATION.md]
started: 2026-08-11T15:30:00Z
updated: 2026-08-11T17:35:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Render de las 18 categorías (INT-01)
expected: Las 18 filas en el orden de `categories.json` (order 1-18), sin huecos ni duplicados, sin romper el layout de la tabla del home ni el picker de Repaso/Examen. Las 4 de `fare` cierran la lista.
result: pass

### 2. Cascada D-54 sobre los cruces nuevos, en sesión jugada de verdad (INT-03)
expected: Al fallar `fare-indicativo-300`, `fare-indicativo-301` o `fare-indefiniti-300`, se resetean LAS DOS categorías de su `categoryIds` — la propia `fare-*` y la vecina (`avere`, `presente-regolare` o `modali` respectivamente) — quedando ambas en racha 0 / no-hecha. Hoy solo está verificado por la vía negativa (`grep -c 'applyImmediateFailure(this.state'` = 2 y diff del motor vacío), nunca jugando.
result: pass

### 3. Decisión sobre los 9 warnings + 3 info del code review (44-REVIEW.md)
expected: Decisión explícita: aceptar la deuda con nota, o abrir un fix puntual antes de `/gsd-complete-milestone v2.0`. Los dos que el reviewer señaló como más relevantes, y que tocan el Core Value (que no se cuele un ejercicio con dos respuestas defendibles), son WR-01 — el gate anti-ceguera sigue verde ante una entrada COMENTADA del array y no comprueba la correspondencia `slug` ↔ `file`, así que un copy-paste de `fare-ind` doblaría un hermano y perdería el otro con el guard dinámico cuadrando — y WR-03 — los glosses ES de los 3 cruces no tienen ningún gate propio, que es justo donde el quórum cazó el leak C5 real de `fare-indicativo-301`, de modo que nada mecánico protege el 0-gloss de una regresión futura.
result: issue
reported: "`fix WR-01 WR-02 WR-03`"
severity: major
decision: |
  El autor decide arreglar WR-01, WR-02 y WR-03 antes de `/gsd-complete-milestone v2.0`.
  Los otros 6 warnings (WR-04…WR-09) y los 3 info (IN-01…IN-03) se aceptan como deuda
  documentada.

  Contexto de la decisión: el autor propuso primero resolver la doble validez quitando
  una de las dos respuestas defendibles ("no es texto libre, tiene que seleccionar la
  correcta de las que se le dan"). Se aclaró que (a) hoy NO hay ningún ejercicio con dos
  respuestas defendibles — el único caso real, `fare-indicativo-301`, ya se cerró con ese
  mismo gesto: borrar lo que sobraba; (b) en ese caso la ambigüedad vivía en el PROMPT (el
  gloss conjugaba el verbo del hueco), no en las `options`, así que quitar una distractora
  no lo habría arreglado — borrar el gloss sí, y por eso el gate de WR-03 inspecciona
  paréntesis en el prompt y no el array de opciones; y (c) WR-01 no es contenido en
  absoluto, es que el arnés de test se queda verde ante el mismo patrón que ya mordió en
  CR-01. Los tres son fixes SOLO de test, cero cambio de contenido.

## Summary

total: 3
passed: 2
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-44-3-WR01
  truth: "El gate anti-ceguera de `tests/count-arrays-lockstep.test.js` se pone rojo si el reporter deja de ver una categoría"
  status: failed
  reason: "User reported: `fix WR-01 WR-02 WR-03` — decisión de cerrar WR-01 en vez de aceptarlo como deuda"
  severity: major
  test: 3
  root_cause: "`slugsCiegos` sólo exige que el TEXTO `slug: '<slug>'` aparezca en algún sitio del fichero, sin anclar la línea ni cruzar `slug` con `file`. Deja dos vías de ceguera con el gate en verde: (1) una entrada COMENTADA (`// { slug: 'fare-indefiniti', ... }`) satisface la regex; (2) una entrada con `slug: 'fare-indefiniti'` y `file: 'content/exercises/fare-indicativo.json'` (copia-pega entre los dos slugs que comparten el prefijo `fare-ind`) hace que `expected` y `total` lean el MISMO fichero, así que el guard dinámico cuadra, `fare-indicativo` se cuenta dos veces y los 7 slots de `fare-indefiniti` desaparecen del total."
  artifacts:
    - path: "tests/count-arrays-lockstep.test.js"
      issue: "líneas 82-87 y 196-225 — ancla de slug sin `^\\s*\\{` y sin gate de par `slug` ↔ `file`"
  missing:
    - "Anclar la regex de `slugsCiegos` a inicio de entrada (con flag `m`) para que una entrada comentada NO la satisfaga"
    - "Añadir gate D-40-03: extraer los pares `{ slug, file }` del reporter y assertear que todo `file` es exactamente `content/exercises/<slug>.json`"
  debug_session: ".planning/phases/44-integraci-n-lockstep-cierre-v2-0/44-REVIEW.md — WR-01"

- gap_id: G-44-3-WR02
  truth: "Los gates de options de los cruces sólo se ponen rojos ante contenido realmente ilegítimo, con un diagnóstico verdadero"
  status: failed
  reason: "User reported: `fix WR-01 WR-02 WR-03` — decisión de cerrar WR-02 en vez de aceptarlo como deuda"
  severity: major
  test: 3
  root_cause: "`FARE_INITIAL_RE` prohíbe toda inicial `f-` en las options de los cruces apoyándose en una premisa que el propio fichero desmiente: `ESSERE_FORMS` incluye `fui, fosti, fu, fummo, foste, furono`, y el gate G1 (línea 961) autoriza EXPLÍCITAMENTE cualquier miembro de `ESSERE_FORMS` como distractora de auxiliar. Si la autoría usa el passato remoto de `essere` — legítimo y ya en whitelist — G1/G2 se pone rojo con el diagnóstico falso 'mete una forma de fare en options'. Arrastra un tercer fichero: `CRUCES_AJENOS` aplica el mismo `/^f/i` a los cruces de las otras tres categorías y rompería con el mensaje igualmente falso 'la exclusion de CONJUGATE dejaria de ser inocua'. Aparte, la alternación `(f|fa|fe)` es redundante: equivale a `^f` porque sólo se usa vía `.test()`."
  artifacts:
    - path: "tests/content-fare-indicativo.test.js"
      issue: "líneas 112-123, 870-875, 952-969 — `FARE_INITIAL_RE` prohíbe la inicial f- a ciegas y contradice al gate G1 del mismo fichero"
    - path: "tests/content-fare-indefiniti.test.js"
      issue: "líneas 980-992 — `CRUCES_AJENOS` propaga el mismo `/^f/i` a los cruces de las otras tres categorías"
  missing:
    - "Restar las formas ya autorizadas en vez de prohibir la inicial: derivar el set de formas con f- desde `ESSERE_FORMS` y exceptuarlas"
    - "Simplificar la alternación redundante `(f|fa|fe)` a `^f`"
    - "Aplicar la misma resta en `CRUCES_AJENOS` de `content-fare-indefiniti.test.js`"
  debug_session: ".planning/phases/44-integraci-n-lockstep-cierre-v2-0/44-REVIEW.md — WR-02"

- gap_id: G-44-3-WR03
  truth: "El gloss ES de los 3 cruces no puede regalar la casilla examinada (R1/C5), y un intento de reponerlo pone la suite roja"
  status: failed
  reason: "User reported: `fix WR-01 WR-02 WR-03` — decisión de cerrar WR-03 en vez de aceptarlo como deuda; es el gate que protege el Core Value"
  severity: major
  test: 3
  root_cause: "El 0-gloss (`sin paréntesis` + `sin mencionar el español`) se re-apuntó a `BASE_SLOTS`, así que dejó de cubrir los cruces, y el bloque de cruces NO lo re-asserta en ninguna forma — pese a que su cabecera promete 'RE-ASERTA los gates que siguen rigiendo sobre ellos'. Tres agujeros, todos sobre el defecto que esta misma fase tuvo que arreglar: (1) `fare-indicativo-301` no está fijado al 0-gloss — su resolución documentada fue BORRAR los 3 glosses por C5-leak (el gloss conjugaba el verbo del hueco: `repasamos / comete / revisáis`) y nada impide reponerlos con la suite entera en verde; (2) la frontera del gloss de `fare-indicativo-300` no está codificada — el pase de Opus la deja escrita como condición de supervivencia (pretérito simple `hice / hicimos / hicieron`; con `he hecho` / `hemos hecho` pasa a leak R1 inmediato); (3) `fare-indefiniti-300` declara en su `notes` que 'el gloss NO traduce el modal' y tampoco tiene gate — un gloss con `tengo que / puedo / quiero` entregaría el modal examinado."
  artifacts:
    - path: "tests/content-fare-indicativo.test.js"
      issue: "líneas 344-368 — 0-gloss re-apuntado a `BASE_SLOTS`; bloque 13 (cruces) sin contrapartida"
    - path: "tests/content-fare-indefiniti.test.js"
      issue: "líneas 823-843 — ídem: el 0-gloss deja de cubrir el cruce y no se re-asserta"
  missing:
    - "Gate por partición: `fare-indicativo-301` vuelve al 0-gloss y se queda ahí — assertear ausencia de paréntesis en todos sus `variants[].prompt`"
    - "Gate por partición: `fare-indicativo-300` conserva gloss pero sin auxiliar compuesto castellano — blacklist explícita contra el contenido del paréntesis"
    - "Gate por partición: el gloss de `fare-indefiniti-300` no traduce el modal — blacklist contra el contenido del paréntesis"
  debug_session: ".planning/phases/44-integraci-n-lockstep-cierre-v2-0/44-REVIEW.md — WR-03"

## Deuda aceptada (no gaps)

Decisión del autor en el test 3: WR-04, WR-05, WR-06, WR-07, WR-08, WR-09, IN-01, IN-02
e IN-03 quedan como deuda documentada en `44-REVIEW.md`. No abren plan de cierre en esta
fase y no bloquean `/gsd-complete-milestone v2.0`.
