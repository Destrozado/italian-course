# Phase 43: `fare-cond-imperativo` + `fare-indefiniti` — 3 + 6 slots - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-07
**Phase:** 43-`fare-cond-imperativo` + `fare-indefiniti` — 3 + 6 slots
**Areas discussed:** MAGNET del imperativo, Eje CONTEXTO de las indefinidas, Política de distractoras, `facente` y las explanations, Reparto en plans y quórum

**Nota de arranque:** la discusión se abrió porque `/gsd-plan-phase 43 --chain` se detuvo en la puerta de contexto — Phase 43 no tenía `CONTEXT.md` y las Phases 40, 41 y 42 sí. El autor eligió discutir antes de planificar.

---

## MAGNET del imperativo

### Pregunta 1 — La key de la 2ª singular

Contexto aportado antes de preguntar (verificado sobre el corpus, no supuesto): `fa'` no aparece en ningún fichero; `fai` es key de `tu` en `fare-indicativo-presente` y distractora en `fare-congiuntivo`; `fa` es key de `lui/lei` indicativo y de la variante de contraste del slot disparador.

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| `fa'` con apóstrofe | Única forma del imperativo que no vive ya en el corpus; canónica en los manuales; el apóstrofe es lo que hay que aprender. `fai`/`fa` a blacklist, distractoras desde otras casillas. | ✓ |
| `fai` (la forma viva) | La más frecuente hoy. Coste: ya es key de `tu` en indicativo, y `fa'` no se examinaría nunca. | |
| Sacar la 2ª sg del eje de forma | Coste: el motor es MC con un único `correctIndex`; multi-correcta sería motor nuevo, Out of Scope. | |

**Elección:** `fa'` con apóstrofe → **D-43-04**

### Pregunta 2 — La homografía con las formas ya en corpus

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Declarar y explicar, sin contrastar | `notes` la declara con audit trail; la explanation la enseña como el hecho gramatical real (el imperativo formal toma prestado el congiuntivo). Ninguna variante pide decidir entre modos → cero doble validez. | ✓ |
| Contrastar activamente en `options` | Potente pedagógicamente, pero si el marco no excluye una lectura → `disputed` sticky → reset por cascada D-54. | |
| Ignorarlo | El autor vería `faccia` correcta en dos categorías sin explicación; lo leería como incoherencia del material. | |

**Elección:** declarar y explicar → **D-43-06**
**Notas:** cierra el hand-off que D-42-15 dejó abierto y que Phase 42 registró en su `Deferred`.

### Pregunta 3 — El imperativo negativo `non fare`

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Como contexto del infinito presente | Encaja sin forzar: el eje de ese slot es el contexto y el imperativo negativo exige el infinitivo de verdad. SC#2 intacto (5 variantes). | ✓ |
| Solo en la explanation del imperativo | El autor lee la advertencia y nunca se le pregunta. | |
| Fuera de la fase | Precedente: D-41-13 sacó la colocación adverbial por el mismo argumento. | |

**Elección:** contexto del infinito presente → **D-43-14**

### Pregunta 4 — Las formas con clítico

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Blacklist + mención en la explanation | No entran en `options` (atestiguadas y defendibles); `notes` con audit trail; la explanation las nombra como `fa'` + clítico con duplicación. | ✓ |
| Examinar una variante con clítico | Rompería las 5 variantes de SC#2 y mezclaría dos ejes (argumento de D-42-12). | |
| Solo blacklist, sin mencionarlas | Protege igual contra la autoría, pero el autor se topará con `fallo`/`fammi` sin que nada se los haya presentado. | |

**Elección:** blacklist + mención → **D-43-07**
**Notas:** amplía la blacklist de D-42-11, que ya tenía `facci`.

---

## Eje CONTEXTO de las indefinidas

### Pregunta 1 — Volumen y reparto

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Desigual y justificado por slot | `facente` 2 (contextos reales contados; INDEF-03 prohíbe mentir sobre su uso), `participio-passato` 4 (para alojar el par del magnet), resto 3. Cada desviación declarada en `notes`. | ✓ |
| 3 uniformes = 18 | `facente` tendría que sostener 3 contextos reales → riesgo de inventar el tercero. | |
| 4 uniformes = 24 | +6 de quórum y el problema de `facente` empeora. | |

**Elección:** desigual justificado → **D-43-03**
**Notas:** el reparto suma **18** variantes (2 + 4 + 3×4), no 19 — corregido en voz alta antes de escribir el CONTEXT.md. Total de la fase: 35 variantes.

### Pregunta 2 — Qué examina el slot `participio-passato`

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Todo el slot va de la terminación | Eje único; `options` siempre `fatto`/`fatta`/`fatti`/`fatte`. Dos variantes invariables, dos con concordancia obligatoria. GATE HARD: solo `lo`/`la`/`li`/`le`. | ✓ |
| Mixto: 2 de forma + 2 de concordancia | Dos pools distintos en el mismo slot; el autor no sabría qué le preguntan (D-42-12). | |
| Slot propio para la concordancia (7 slots) | Precedente fuerte (`riflessivi-pp-concordanza`), pero segunda divergencia de conteo del milestone. | |

**Elección:** eje único de terminación → **D-43-16**
**Notas:** el gate del pronombre nace de que la concordancia es *opcional* con `mi`/`ti`/`ci`/`vi` y tiene reglas propias con `ne` — usarlos abriría doble validez.

### Pregunta 3 — Qué covaría entre variantes que comparten key

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Conjunto cerrado de tipos sintácticos, declarado en `notes` | Lista cerrada + qué tipo lleva cada variante + objeto literal distinto. Gate antes de escribir; quórum como red. | ✓ |
| Discreción de autoría, quórum como red | Modo de fallo que D-42-06 nombra: patrón sistemático dejado al quórum se paga varias veces. | |
| Un tipo fijo por slot | El autor aprendería el slot por la forma del contexto (argumento de D-42-02). | |

**Elección:** conjunto cerrado declarado → **D-43-12**

### Pregunta 4 — `aver fatto` vs `avere fatto` (hallazgo)

Surgido al releer la grafía literal `aver(e) fatto` de INDEF-01: son dos formas correctas y atestiguadas, es decir un cuarto magnet de doble validez que INT-04 no declara.

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Key = `aver fatto`, la otra a blacklist | Mismo tratamiento que `fa'`/`fai`. Se registra como CUARTO magnet con ronda extra. | ✓ |
| Key = `avere fatto` | Forma plena y transparente, pero el italiano real usa la elidida de forma abrumadora. | |
| No declarar nada | Omisión silenciosa que el proyecto evita desde D-41-08. | |

**Elección:** key `aver fatto` → **D-43-17**
**Notas:** Phase 44 tendrá que recoger el cuarto magnet en INT-04. Registrado en `Deferred`.

---

## Política de distractoras

### Pregunta 1 — Condizionale presente

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Patrón fijo cross-slot con el futuro en las 6 | (1) futuro de la misma persona, (2) condizionale de otra persona, (3) raíz regularizada inexistente. Cumple SC#1 con margen y regala el par `faremo`/`faremmo`. | ✓ |
| Solo una variante con contraste futuro | Lectura mínima de SC#1; el contraste se examinaría una de cada seis pasadas. | |
| Discreción de autoría por variante | Rompe cinco decisiones seguidas de patrón fijo cross-slot. | |

**Elección:** patrón fijo con el futuro en las 6 → **D-43-09**
**Notas:** el indicativo futuro entra en `options` aquí, invirtiendo lo que D-42-11 prohibía en Phase 42 — misma regla aplicada al contexto, y SC#1 lo exige.

### Pregunta 2 — Pool de opciones de `fare-indefiniti`

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Pool cerrado de formas no personales | Solo el paradigma no personal de `fare`. Gate grep-verificable: ninguna conjugada en `options`. | ✓ |
| Pool cerrado más una conjugada cuando encaje | Mete casillas de otras categorías; una conjugada es descartable de un vistazo. | |
| Sin pool declarado | Se pierde el gate grep-verificable. | |

**Elección:** pool cerrado no personal → **D-43-13**

### Pregunta 3 — Distractoras del imperativo

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Formas reales del imperativo de otro registro | El eje examinado pasa a ser el REGISTRO (tú/usted/vosotros/ustedes). Exige gate de destinatario inequívoco en el prompt. | ✓ |
| Formas de otros modos con la misma raíz | Descartables de un vistazo; el slot dejaría de examinar el registro. | |
| Mixto según la variante | Rompe el patrón fijo cross-slot. | |

**Elección:** imperativo de otro registro → **D-43-05**

### Pregunta 4 — Condizionale passato

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Patrón fijo con el condizionale simple como calco | (1) `farebbe` = el calco español («dijo que haría»), (2) auxiliar en otro tiempo, (3) forma mal construida. Con aviso de trabajo fino de marco. | ✓ |
| Sin el condizionale simple en `options` | Cero riesgo, pero se renuncia a examinar la interferencia que SC#1 nombra. | |
| Discreción de autoría | Mismo coste que arriba. | |

**Elección:** patrón fijo con el calco → **D-43-10**

---

## `facente` y las explanations

### Pregunta 1 — El choque con el SCOPE-GATE de D-41-06

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Excepción declarada y acotada al slot | `facente funzione` / `facente parte` entran; excepción escrita en `notes` con su frontera. Razón de fondo: D-41-06 vetaba perífrasis del VERBO; `facente funzione` es un participio fosilizado. | ✓ |
| Contextos burocráticos genéricos | Rozan lo que INDEF-03 prohíbe: un italiano no escribe así. | |
| `facente` solo en la explanation, sin slot | `fare-indefiniti` bajaría a 5 slots contra REQUIREMENTS; INDEF-03 sin variante que lo respalde. | |

**Elección:** excepción acotada y declarada → **D-43-18**

### Pregunta 2 — El principio «reconocer, no producir»

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Principio declarado, aplicado a los tres casos | `facente`, `fai`/`fa` y `avere fatto` bajo un solo razonamiento; cada explanation con su línea en tono D-127. | ✓ |
| Nota por caso, solo donde el requisito la pide | El autor podría fallar y no entender por qué su forma no estaba entre las opciones. | |
| Solo en `notes`, no en las explanations | `notes` es metadata, no se muestra; INDEF-03 dice literalmente «la explanation avisa». | |

**Elección:** principio declarado → **D-43-19**

### Pregunta 3 — `stare + gerundio`

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Una variante del slot `gerundio-presente` | Cumple INDEF-04 sin slot nuevo. La explanation desarrolla la interferencia real: el error no es formarlo, es usarlo de más. | ✓ |
| Slot propio para el progresivo | Segunda divergencia de conteo del milestone. | |
| Solo en la explanation | INDEF-04 y SC#3 lo nombran los dos: el verificador buscará que se examine. | |

**Elección:** variante del gerundio presente → **D-43-15**

---

## Reparto en plans y quórum

### Pregunta 1 — Cuántos plans

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| 2 plans secuenciales, uno por categoría | Cada plan dueño de su categoría de punta a punta, con tracer sobre el condizionale presente. Waves distintas → sin conflicto en `categories.json`. | ✓ |
| 3 plans: contenido, contenido, tests | Los ficheros de contenido no validan sin su entrada de categoría → rojos hasta el tercero; granularidad `coarse`. | |
| 2 plans en paralelo, misma wave | Chocan en `categories.json` y en el array del smoke sin ganar tiempo de reloj. | |

**Elección:** 2 plans secuenciales → **D-43-02**

### Pregunta 2 — Alcance de la ronda extra de quórum

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| 12 variantes: los tres bloques de doble validez | Imperativo (5) + participio-passato (4) + infinito-passato (3). Escala de D-41-12 (12/48) y D-42-08 (10/30). | ✓ |
| 18 variantes: los cuatro bloques | Añade condizionale passato (6) = la mitad de la fase; D-42-08 rechazó esa proporción. | |
| 6 variantes: mínimo literal | Deja sin red las variantes vecinas del mismo slot, que comparten modo de fallo (recorte que D-42-05 rechazó). | |

**Elección:** 12 variantes → **D-43-20**

---

## Claude's Discretion

Registrado en detalle en `43-CONTEXT.md` §Claude's Discretion. En resumen: redacción de las 35 variantes y las 9 explanations; mapa exacto de ids de slot (con prefijo byte a byte y sin sufijos de 3 cifras); `name` de las dos entradas de `categories.json`; reparto de objetos literales y de tipos de contexto; marcos temporales del condizionale passato; reparto de destinatarios en el imperativo; profundidad de cada explanation; nombres y estructura de los gates de los dos ficheros de test; y si se sincronizan o no los counts al cierre de la fase.

## Deferred Ideas

Registradas en detalle en `43-CONTEXT.md` §Deferred. Las dos que Phase 44 necesita sí o sí:

1. **El CUARTO magnet** (`aver fatto` / `avere fatto`) no está en la lista de tres de INT-04 — Phase 44 tiene que recogerlo o su SC#4 describirá un estado que no es el real.
2. **Los números cerrados:** 22 slots / 113 variantes en el milestone, `TOTAL_EXPECTED` 225 → **247**. El SC#2 de Phase 44 dice «225 + los 21 slots nuevos»; son 22 desde D-42-01.

Resto: slot propio de concordancia del participio, slot propio del progresivo, imperativo negativo en otras personas, contraste activo imperativo↔congiuntivo, cruces multi-cat, sync de counts, perífrasis y modismos de `fare`, partir `fare-indicativo`, mismo patrón para `andare`/`venire`/`dire`, y las discrepancias VAL-06 preexistentes.

### Reviewed Todos (not folded)

Los tres que devolvió el matcher se arrastraron con el mismo razonamiento de las Phases 40, 41 y 42, sin gastar un turno de pregunta (se avisó al autor de que podía objetar): FARE-X1 (documento de diseño del milestone entero, no un todo consumible), responsive móvil (falso positivo del matcher, es CSS), y `decoyBank.pos` (pipeline de canciones, sin relación).
