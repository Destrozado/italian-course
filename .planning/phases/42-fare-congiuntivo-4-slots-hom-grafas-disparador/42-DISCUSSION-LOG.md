# Phase 42: `fare-congiuntivo` — 4 slots (homógrafas + disparador) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-05
**Phase:** 42-`fare-congiuntivo` — 4 slots (homógrafas + disparador)
**Areas discussed:** Estructura y volumen, Bloque homógrafo, Distractoras, Gloss y canon ES

**Selección de áreas:** el autor eligió discutir las **4** áreas propuestas.

**Todos cruzados:** 3 matches (`mobile-responsive-exercise-home.md` 0.9, `decoybank-pos-multi-categoria.md` 0.6, `fare-paradigma-completo.md` 0.6). No se re-preguntó: son exactamente los 3 que Phase 41 ya revisó y descartó con razones documentadas, y se aplicó el mismo tratamiento (reviewed, not folded), avisando al autor de que podía cambiarlo.

---

## Estructura y volumen

### ¿Dónde vive el DISPARADOR de CONG-04?

Contexto presentado: tensión interna del roadmap — el título dice «4 slots» pero SC#4 exige «al menos un slot» para el disparador, con una variante donde lo correcto es el indicativo, que no cabe en el slot de presente porque SC#1 fija sus 6 variantes.

| Option | Description | Selected |
|--------|-------------|----------|
| 5º slot dedicado | `fare-congiuntivo-disparador`, 6 variantes con eje = el DISPARADOR (no la persona). Un solo eje → cero motor nuevo. Total 30 variantes; Phase 44 pasa a 22 slots / ≈113 variantes | ✓ |
| Dentro de los 4 slots | Los 24 prompts ya llevan disparador por construcción; la variante de contraste se añade como 7ª del presente. Mantiene «4 slots» y 25 variantes, pero deja un slot de eje mixto | |
| 5º slot más pequeño | `fare-congiuntivo-disparador` con 3-4 variantes. Cumple SC#4 con menos quórum (27-28 total); un slot con menos variantes se re-pregunta con menos variedad | |

**User's choice:** 5º slot dedicado (recomendado)
**Notes:** Acepta subir el volumen de la fase de ≈24 a 30 variantes y el recuento del milestone a 22 slots / ≈113 variantes. → **D-42-01**

### ¿Cuál es el eje de variante de `congiuntivo passato` y `trapassato` (CONG-03)?

| Option | Description | Selected |
|--------|-------------|----------|
| 6 personas cada uno | Mirror de D-41-01/02: 6 personas del auxiliar con el marco de concordancia covariando sobre el mismo eje único. 12 variantes → total 30 | ✓ |
| Contextos de concordancia | El eje pasa a ser el marco temporal, ~3-4 variantes/slot (≈24-26 total). Foco puro en CONG-03; deja casillas persona×tiempo sin examinar | |
| 6 personas, marco fijo por slot | Persona varía, marco no. Más fácil de blindar contra doble lectura; el autor puede aprender el slot por la forma de la principal | |

**User's choice:** 6 personas cada uno (recomendado)
**Notes:** Mismo argumento con el que D-41-01 rechazó reducir los compuestos de Phase 41. → **D-42-02**

### ¿Qué `categoryIds` lleva el slot del disparador, que contiene una variante cuya respuesta correcta es indicativo?

| Option | Description | Selected |
|--------|-------------|----------|
| Solo `fare-congiuntivo` | `so che fa` no es un cruce: es reconocimiento de disparador dentro del congiuntivo. Lista de cruces de INT-03 cerrada; el slot no arrastra `fare-indicativo` en la cascada D-54 | ✓ |
| Cruce de 2 categorías | Fallar el disparador desmarca también el indicativo. Defendible pedagógicamente; añade un cruce que INT-03 no lista e invade Phase 44 | |
| Cruce, pero lo autora Phase 44 | `categoryIds` de 1 ahora, cruce nuevo en `-300`+ en Phase 44 si se quiere | |

**User's choice:** Solo `fare-congiuntivo` (recomendado)
**Notes:** El cruce congiuntivo↔indicativo queda registrado en Deferred, no en INT-03. → **D-42-03**

### ¿Cómo se reparten las 30 variantes en plans?

| Option | Description | Selected |
|--------|-------------|----------|
| 2 plans, mirror de 41 | 42-01: alta de categoría + presente + imperfetto (12) con tracer sobre el presente · 42-02: passato + trapassato (12) + disparador (6) + el fichero de test | ✓ |
| 1 plan único | Los 5 slots de una. Menos overhead; pierde el gate intermedio del tracer | |
| 3 plans | 12 / 12 / 6+tests. Aísla el slot del disparador, el más novedoso; más ceremonia que trabajo para 30 variantes | |

**User's choice:** 2 plans, mirror de 41 (recomendado)
**Notes:** → **D-42-04**

---

## Bloque homógrafo

**Hallazgo presentado antes de preguntar:** `abbia` es io/tu/lui-lei y `avessi` es io/tu, así que `abbia fatto` y `avessi fatto` son homógrafas igual que `faccia` y `facessi`. El bloque real son 10 variantes de 30, no las 5 del paréntesis de SC#2.

### ¿Qué variantes entran en la ronda EXTRA de quórum que SC#2 exige?

| Option | Description | Selected |
|--------|-------------|----------|
| Las 10 reales | `faccia`×3 · `facessi`×2 · `abbia fatto`×3 · `avessi fatto`×2. Lectura literal de «En TODAS las variantes homógrafas»; el paréntesis es ilustrativo | ✓ |
| Las 5 del paréntesis | Cumple el roadmap al pie de la letra y ahorra 5 pases; deja `abbia fatto`×3 sin red pese a tener el mismo modo de fallo | |
| Las 10 + el slot del disparador | 16 de 30 con ronda extra. Máxima cobertura; coste de validación notablemente más alto | |

**User's choice:** Las 10 reales (recomendado)
**Notes:** → **D-42-05**

### ¿Cómo se blinda la coincidencia de sujetos entre principal y subordinada?

Contexto presentado: en italiano estándar, cuando los sujetos coinciden se exige `di` + infinitivo (`Penso di fare i compiti`, no `Penso che io faccia i compiti`), y `penso che` es el primer disparador que nombra CONG-04.

| Option | Description | Selected |
|--------|-------------|----------|
| Gate HARD en las 30 | Declarado en `notes`: el sujeto de la principal NUNCA coincide con el del hueco. Disparadores impersonales o sujeto explícito distinto. Mirror del SCOPE-GATE HARD de D-41-06 | ✓ |
| Solo donde muerde | Se aplica a las variantes cuyo disparador está en la misma persona que el hueco (io, alguna de noi). Menos restrictivo; deja la regla como criterio caso-a-caso en vez de invariante | |
| Sin gate, lo caza el quórum | La autoría escribe con naturalidad y el quórum marca las defectuosas. La coincidencia es un patrón sistemático, así que se pagaría varias veces | |

**User's choice:** Gate HARD en las 30 (recomendado)
**Notes:** → **D-42-06**

### ¿Qué diferencia entre sí a las variantes que comparten la misma respuesta correcta?

| Option | Description | Selected |
|--------|-------------|----------|
| Disparador + distractoras + objeto | Las tres cosas covarían sobre el eje persona: disparador distinto, distractora de indicativo de ESA persona, objeto literal distinto | ✓ |
| Solo las distractoras | Distractoras específicas por persona; disparador y objeto libres. Más simple; tres frases casi idénticas hacen reconocer el molde | |
| Solo el disparador | Disparador distinto con patrón FIJO de distractoras cross-variante. Máxima uniformidad; dos de las tres perderían la distractora de indicativo de su persona | |

**User's choice:** Disparador + distractoras + objeto (recomendado)
**Notes:** El paréntesis de la descripción de esta opción citaba `ho fatto`/`hai fatto`/`ha fatto` como distractora de indicativo en el slot de passato. Se corrigió inmediatamente después: choca con SC#3 («no otro modo») y la familia de la distractora en los dos slots compuestos se resolvió en el área Distractoras. La decisión de covariar las tres cosas se mantiene. → **D-42-07**

### ¿Qué vendor hace la ronda EXTRA sobre las 10 homógrafas?

| Option | Description | Selected |
|--------|-------------|----------|
| DeepSeek obligatorio | Mirror de D-41-12 vía `scripts/validate-ai-pass.mjs`, además del quórum base Opus+Sonnet top-level. DeepSeek es el estricto en acentos y concordancia | ✓ |
| DeepSeek + Gemini | 4 `by` distintos en el bloque crítico. Dobla el coste y Gemini marca el gloss ES como leak (falso positivo de política) | |
| Gemini obligatorio | Cambia de vendor a propósito para no depender del mismo crítico. Rompe la continuidad sin razón de contenido | |

**User's choice:** DeepSeek obligatorio (recomendado)
**Notes:** → **D-42-08**

---

## Distractoras

### En `congiuntivo passato` y `trapassato`, ¿de qué familia salen las 3 distractoras?

| Option | Description | Selected |
|--------|-------------|----------|
| Solo subjuntivo, SC#3 literal | Las 3 son formas de subjuntivo de esa persona: el otro compuesto + los dos simples. Cumple «no otro modo» al pie de la letra; el contraste simple-vs-compuesto enseña la anterioridad | ✓ |
| 2 de subjuntivo + 1 de indicativo | Mantiene el error de interferencia real con lectura permisiva de SC#3. El «(no otro modo)» es explícito y obliga a defender una desviación | |
| Desviación declarada con audit trail | Se ofrece el indicativo y se documenta como desviación consciente (precedente D-41-10). Riesgo de que el verificador lea SC#3 como incumplido | |

**User's choice:** Solo subjuntivo, SC#3 literal (recomendado)
**Notes:** Corrige el paréntesis erróneo de la tercera pregunta del área Bloque homógrafo. Consecuencia de autoría asumida: el marco de cada prompt tiene que excluir limpiamente `faccia` y `facessi`. → **D-42-09**

### En `congiuntivo presente` e `imperfetto`, ¿cuál es el patrón fijo de las 3 distractoras?

| Option | Description | Selected |
|--------|-------------|----------|
| 1 indicativo + 1 otra persona + 1 raíz falsa | Híbrido de D-41-09 y del contraste de modo: indicativo de ESA persona · forma real de subjuntivo de OTRA persona · raíz regularizada inexistente | ✓ |
| 2 indicativo + 1 raíz falsa | Doble carga en el contraste de modo; quita la distractora que obliga a leer el sujeto, que es la que justifica que las tres `faccia` existan por separado | |
| Mirror literal de D-41-09 | 2 raíces equivocadas + 1 forma real de otra persona, sin indicativo. Máxima continuidad; la categoría dejaría de examinar el contraste de modo | |

**User's choice:** 1 indicativo + 1 otra persona + 1 raíz falsa (recomendado)
**Notes:** → **D-42-10**

### ¿Cómo se declara la blacklist, dado que Phase 41 blacklisteó el cruce de modo y aquí se usa a propósito?

| Option | Description | Selected |
|--------|-------------|----------|
| Misma regla, aplicada al contexto | La regla ratificada prohíbe la distractora DEFENDIBLE COMO CORRECTA; una forma atestiguada solo lo es si el prompt la admite, y el disparador excluye `faccio`. Blacklist heredada + `facci`, `facciam`, sustantivos homógrafos | ✓ |
| Inversión declarada | Se admite la contradicción con Phase 41 y se documenta como desviación. Deja dos reglas en conflicto en el corpus | |
| Blacklist mínima | Solo las arcaicas heredadas; el quórum descubre el resto. Rompe el principio de que la blacklist protege contra la AUTORÍA | |

**User's choice:** Misma regla, aplicada al contexto (recomendado)
**Notes:** → **D-42-11**

### ¿Qué 4 opciones ofrece el slot del DISPARADOR?

| Option | Description | Selected |
|--------|-------------|----------|
| Modo × tiempo: 4 casillas reales | `faccia` · `fa` · `facesse` · `faceva`. Decide modo Y tiempo; ninguna forma inventada; la variante de contraste usa el mismo patrón | ✓ |
| Solo el eje del modo | `faccia` vs `fa` + 2 formas mal construidas. Foco quirúrgico; con dos reales y dos obviamente falsas es una moneda al aire de facto | |
| Modo × persona | `faccia` vs `fa` + formas reales de otras personas. Mezcla dos ejes en el slot cuyo propósito es aislar uno | |

**User's choice:** Modo × tiempo: 4 casillas reales (recomendado)
**Notes:** → **D-42-12**

---

## Gloss y canon ES

### ¿Qué política de gloss ES lleva esta categoría?

Contexto presentado: el español también tiene subjuntivo, así que un gloss del verbo regala modo y tiempo (doble leak). Pero aparece un confound nuevo: `benché`, `purché`, `prima che`, `nonostante` están por encima del A1 que el autor prepara.

| Option | Description | Selected |
|--------|-------------|----------|
| 0-gloss del verbo, gloss del disparador | Cero gloss sobre la forma verbal; sí gloss léxico de la conjunción (`Benché (aunque)`). No filtra: «aunque» rige los dos modos en español. Canon R7 aplicado al léxico | ✓ |
| 0-gloss total | Mirror literal de D-41-05. Máxima continuidad; deja el confound de vocabulario, y fallar por no saber `benché` resetea la categoría vía cascada D-54 | |
| Gloss completo | Gloss de la frase entera como en el resto del corpus. «Es necesario que yo haga» entrega la respuesta — leak R1 directo | |

**User's choice:** 0-gloss del verbo, gloss del disparador (recomendado)
**Notes:** Se avisó de que Gemini/DeepSeek marcarán el gloss como C5-leak y que es falso positivo de política (base de aprobación: Claude Opus+Sonnet). → **D-42-13**

### El error de interferencia `penso che` (subj. it.) / «pienso que» (indic. esp.): ¿dónde se dice?

| Option | Description | Selected |
|--------|-------------|----------|
| Desarrollado en el disparador + recordatorio en los 2 simples | La explanation del disparador lo desarrolla con el par explícito; presente e imperfetto llevan una línea; passato y trapassato no lo repiten (ahí el eje es la anterioridad) | ✓ |
| Solo en el disparador | Una vez, en el slot cuyo propósito es exactamente eso. Cero redundancia; el motor sirve un slot por sesión, así que se puede fallar sin volver a leer la advertencia | |
| En las 5 explanations | Máxima exposición y cada slot autosuficiente; diluye lo específico de cada casilla y sobra en passato/trapassato | |

**User's choice:** Desarrollado en el disparador + recordatorio en los 2 simples (recomendado)
**Notes:** Tono D-127 (3ª impersonal, regla, ejemplo paralelo italiano-español). → **D-42-14**

### `faccia`/`facciamo`/`facciano` son 3 de las 5 formas del imperativo de Phase 43 (y `fate` ya vive en Phase 41). ¿Qué hace Phase 42?

| Option | Description | Selected |
|--------|-------------|----------|
| Hand-off documentado, sin mencionarlo | Se registra en `notes` y en Deferred que 4 de las 5 formas del imperativo ya viven en el corpus y que el magnet de Phase 43 es mayor que el `fa'`/`fai`/`fa` de INT-04. Las explanations no mencionan el imperativo. Precedente: Phase 41 con `fa` | ✓ |
| Hand-off + nota en la explanation | La explanation del presente dice que esas formas son también el imperativo de cortesía. Verdad y útil; pisa material declarado de Phase 43 | |
| Solo hand-off en Deferred | Sin tocar `notes`. Las `notes` son donde este proyecto guarda los audit trails que sobreviven a la planificación | |

**User's choice:** Hand-off documentado, sin mencionarlo (recomendado)
**Notes:** → **D-42-15**

### El `se` hipotético exige condizionale en la principal, y el condizionale es de Phase 43. ¿Cómo se resuelve?

| Option | Description | Selected |
|--------|-------------|----------|
| Principal con otro verbo | `Se io facessi i compiti, mia madre sarebbe contenta`. Periodo ipotetico bien construido; ninguna casilla de `fare` de Phase 43 entra en el fichero | ✓ |
| Admitir `farei` en la principal | Más natural y repite el verbo objetivo; mete la casilla declarada de Phase 43, que la blacklist heredada ya excluye | |
| Quitar el `se` hipotético | Frontera más limpia; SC#4 lo nombra explícitamente y el verificador va a buscarlo | |

**User's choice:** Principal con otro verbo (recomendado)
**Notes:** → **D-42-16**

---

## Cierre

Tras las 4 áreas se ofreció explorar más zonas grises (los marcos temporales concretos de passato/trapassato y cómo blindar que el subjuntivo simple no sea válido · si el conjunto cerrado de objetos literales se hereda o se amplía · qué gates concretos se congelan en el fichero de test). El autor eligió **«Listo para CONTEXT.md»**, dejando esas tres a discreción de Claude.

## Claude's Discretion

- Redacción de los 30 prompts y las 5 explanations.
- Reparto de los 6 disparadores entre las 6 variantes del slot nuevo, y cuál es el de contraste `so che`.
- Los marcos temporales concretos de `passato`/`trapassato` y cómo blindan que `faccia`/`facessi` no sean válidas.
- Qué objeto literal lleva cada frase; reparto de disparadores impersonales frente a sujeto-explícito-distinto para cumplir D-42-06.
- Profundidad y estructura de cada explanation.
- `name` exacto de la entrada de `categories.json` (order 16).
- Nombres y estructura de los gates de `tests/content-fare-congiuntivo.test.js`.
- Sincronizar o no el count de `fare-congiuntivo` al final de la fase.

## Deferred Ideas

- Cruce multi-categoría `fare-congiuntivo` ↔ `fare-indicativo` (`-300`+) — no está en INT-03.
- Segunda variante de contraste en indicativo en el slot del disparador.
- El magnet ampliado del imperativo de Phase 43 (4 de sus 5 formas ya en el corpus).
- Disparadores que Phase 42 no usa (`affinché`, `sebbene`, `a meno che`, superlativo relativo…).
- Perífrasis y modismos de `fare` (`fare-modismi`).
- Cruces multi-cat + sync de counts + `TOTAL_EXPECTED` + baseline-guard → Phase 44. **El milestone sube a 22 slots / ≈113 variantes.**
- Mismo patrón para `andare`/`venire`/`dire` (v2.1+).
- Discrepancias de conteo VAL-06 preexistentes (`genero-numero`, `preposiciones`).

### Reviewed Todos (not folded)

- **FARE-X1 — paradigma completo del verbo `fare`** — documento de diseño del milestone entero; canonical ref, no todo consumible. Mismo tratamiento que en Phases 40 y 41.
- **Responsive móvil — gutters del figure + tamaño del prompt** — falso positivo del matcher (puntúa por `del`, `phase`). CSS responsive, ajeno a una fase de contenido JSON.
- **decoyBank.pos con varias categorías por token** — DECOY-X1, pipeline de canciones. Sin relación; el autor ya aceptó el `disputed` (opción A, 2026-07-27).
