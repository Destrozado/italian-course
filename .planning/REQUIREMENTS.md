# Requirements: Italian Course — Milestone v2.1 (Traducción al español por variante · TRAD-X1)

**Defined:** 2026-08-13
**Core Value:** Que el sistema te obligue a no olvidar. El motor de repetición garantiza que cada categoría se re-verifica constantemente, y que un solo fallo en cualquier ejercicio te devuelve a repetir esa categoría entera.

**Goal del milestone:** Que cada ejercicio muestre la traducción española de su frase al resolverlo — aciertes o falles — separada de la explicación teórica, para aprender vocabulario y reconocer el tiempo verbal en contexto.

**Volumen medido (2026-08-13, `content/exercises/`):** 250 slots / 758 variantes totales, de las cuales **722 son `multiple-choice`** (las que se traducen), 22 `word-buttons` y 14 `match` (fuera de scope, ver más abajo).

## v2.1 Requirements

### Modelo de datos y schema

- [x] **SCH-01**: Cada variante `multiple-choice` puede llevar la traducción española de su frase; el validator la acepta como string no vacío cuando está presente y las 250 slots existentes siguen validando sin ella (retrocompatible, patrón `explanation` de Phase 7).
- [x] **SCH-02**: El validator RECHAZA el campo de traducción en variantes `match` y `word-buttons`, de modo que es imposible autorar traducción donde el diseño dice que no aporta (el prompt de `word-buttons` ya es español; `match` no tiene frase).
- [x] **SCH-03**: El alta del campo NO toca `schemaVersion` (sigue en 13) ni resetea progreso — es contenido en `content/`, no state; verificado por test explícito, no por afirmación.

### Render en pantalla

- [x] **REND-01**: Al FALLAR un `multiple-choice` que tiene traducción, el autor la ve junto al feedback rojo, visualmente distinguible de la `explanation` (son cosas distintas: una traduce, la otra explica la regla).
- [x] **REND-02**: Al ACERTAR, el autor ve la traducción igualmente y dispone de tiempo real de leerla. *(Corregido en la discusión de la Phase 46, 2026-08-13: la redacción original decía «`SESSION_AUTO_ADVANCE_MS` sube desde 600 ms», pero en los modos de ejercicio **no existe auto-avance** — se eliminó en el quick `260615-r3b` y el avance es manual con «Continuar →» (`src/screens/app.js:1741-1750`, `index.html:628`); `SESSION_AUTO_ADVANCE_MS` solo gobierna el modo canción, fuera de scope. En modo contrarreloj el cronómetro se cancela al responder y tampoco auto-avanza (`app.js:1897-1908`). El tiempo de lectura ya es ilimitado en las tres superficies de ejercicio, así que este requirement **no exige ningún cambio de motor**.)*
- [x] **REND-03**: El botón "¿Por qué?" / tecla `e` sigue revelando la `explanation` bajo demanda tras acertar y sigue cancelando el auto-avance — la traducción no le roba el sitio ni cambia su comportamiento.
- [x] **REND-04**: En la sección "Errores cometidos" del resumen, cada fallo muestra la traducción de la frase que falló, junto a su explanation.
- [x] **REND-05**: Un ejercicio SIN traducción no deja hueco, etiqueta ni placeholder en ninguna de las dos superficies (graceful degradation D-121), y el render usa `x-text` exclusivamente (invariante anti-XSS T-02-01).

### Validación de las traducciones

- [x] **TVAL-01**: Existe un prompt de validación propio para traducciones con criterios explícitos derivados de los S1-S6 de canciones (fidelidad it→es, acentos RAE según PRES-05, naturalidad, registro) y NO de R1-R7, que examinan la gramática del slot y aquí no aplican.
- [x] **TVAL-02**: Existe un script hermano de `scripts/validate-song-pass.mjs` que corre el quórum cross-vendor sobre las traducciones y escribe el pase en el JSON.
- [x] **TVAL-03**: Cada traducción lleva su propio `validation.passes[]` y su status se deriva por `deriveStatus` — misma fuente única que ejercicios y canciones, con el override de autor de primera clase (`override: true`) incluido, sin reimplementaciones locales.
- [ ] **TVAL-04**: El reporter tiene un gate de traducción que sale ROJO si alguna traducción presente en el corpus no está `validated`, y ese gate se verifica por MUTACIÓN (romper una traducción a propósito lo pone rojo), no leyendo su código.

### Contenido — 722 traducciones, 18 categorías

- [ ] **TRAD-01**: Preposiciones traducida y validada al 100% (96 variantes) — es el piloto: la primera categoría que atraviesa el pipeline entero (schema → render → validador → gate) sobre contenido real.
- [ ] **TRAD-02**: Bloque Artículos traducido y validado al 100%: Articoli (62) + Partitivos (48) = 110 variantes.
- [ ] **TRAD-03**: Bloque `fare` traducido y validado al 100%: fare-indicativo (54) + fare-congiuntivo (30) + fare-indefiniti (21) + fare-cond-imperativo (17) = 122 variantes.
- [ ] **TRAD-04**: Bloque morfología traducido y validado al 100%: Genero e numero (60) + Sostantivi irregolari (44) = 104 variantes.
- [ ] **TRAD-05**: Bloque léxico-movimiento traducido y validado al 100%: Professioni (55) + Verbi di movimento (54) = 109 variantes.
- [ ] **TRAD-06**: Bloque auxiliares y presente traducido y validado al 100%: Essere (46) + Avere (32) + Presente regolare (25) = 103 variantes.
- [ ] **TRAD-07**: Bloque determinantes y verbos A1/A2 traducido y validado al 100%: Dimostrativi (22) + Possessivi (21) + Riflessivi (18) + Modali (17) = 78 variantes.

### Integración y cierre

- [ ] **GATE-01**: Un gate paramétrico exige 100% de cobertura de traducción en cada categoría declarada cubierta, con el `expected` DERIVADO del disco y nunca transcrito como número mágico.
- [ ] **GATE-02**: El gate anti-ceguera (heredado de Phases 44/45) pone ROJO cualquier categoría declarada cubierta que no esté enganchada al array de cobertura, para que el olvido de enganchar no pueda emitir un PASS.
- [ ] **GATE-03**: Al cierre del milestone: 18/18 categorías y 722/722 traducciones cubiertas y `validated`, suite verde, reporter exit 0, y el motor v1.4 **byte-intacto** — `src/domain/` sin cambios, `SESSION_AUTO_ADVANCE_MS` sin tocar, y la cascada D-54 con exactamente 2 call-sites. *(Corregido en la discusión de la Phase 46, 2026-08-13: ya no hay «ÚNICO cambio declarado» — ver REND-02. El invariante es más fuerte y más fácil de verificar: `git diff` vacío en `src/domain/` y en la constante.)*

## Future Requirements

Reconocidos y diferidos. No entran en el roadmap de v2.1.

### Vocabulario (VOCAB-X1 — milestone siguiente)

- **VOCAB-01**: Modo de vocabulario con modalidades ES→IT · IT→ES · mezclado.
- **VOCAB-02**: Dificultad fácil por selección de opciones (motor existente; el `decoyBank` de canciones es precedente directo para generar distractoras).
- **VOCAB-03**: Dificultad difícil por texto libre — motor nuevo de verdad: normalización de acentos, mayúsculas, artículo (`il`/`la`/`lo`), apóstrofo y respuestas múltiples válidas.
- **VOCAB-04**: Decidir a propósito cuál es la unidad de reset del vocabulario, en lugar de heredar por defecto «un fallo re-arrastra la categoría entera».

> **Dependencia:** VOCAB-X1 se alimenta de los pares ES↔IT que produce v2.1. Por eso este milestone va primero.

### Otros

- **MOBILE-01**: Responsive móvil completo (diferido desde v1.8; el bug grave de gutters ya se hotfixeó en `13b5631`).

## Out of Scope

| Feature | Reason |
|---------|--------|
| Traducción en `word-buttons` (22 variantes) | Su `prompt` YA es español (`Yo tengo un coche.` → construyes el italiano). No hay nada que autorar; añadirlo sería duplicar el mismo texto. |
| Traducción en `match` (14 variantes) | No hay frase que traducir: son pares de palabras sueltas bajo una instrucción ya española. |
| Tocar el bloque Canciones | Ya son traducción it→es troceada y validada por quórum S1-S6. Este milestone no las modifica; solo toma prestado su validador como plantilla. |
| Eliminar o reducir el `gloss` ES del `prompt` (canon R7) | El gloss es PRE-respuesta y desambigua (sin él hay doble validez — bugs reales cazados por el quórum en v1.5/v1.6); la traducción es POST-respuesta y enseña vocabulario. Funciones y momentos distintos: conviven. |
| Mezclar traducción con `explanation` | La `explanation` tiene tres prohibiciones establecidas tras 4 rondas de quórum en Phases 41-44. Una traducción no es una explicación; fundirlas re-engendraría esa deuda de prosa. |
| Migración `schemaVersion 13→14` | Solo haría falta si el campo fuese obligatorio. Se decidió opcional para permitir el avance por bloques de categorías sin que el schema se ponga rojo a mitad. |
| Mostrar la traducción ANTES de responder | Regalaría la respuesta (R1, no leak). El campo solo se pinta en estado resuelto. |
| Modo vocabulario ES↔IT | Es VOCAB-X1, el milestone siguiente. Este produce su materia prima. |

## Traceability

Rellenado durante la creación del roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCH-01 | Phase 46 | Complete |
| SCH-02 | Phase 46 | Complete |
| SCH-03 | Phase 46 | Complete |
| REND-01 | Phase 46 | Complete |
| REND-02 | Phase 46 | Complete |
| REND-03 | Phase 46 | Complete |
| REND-04 | Phase 46 | Complete |
| REND-05 | Phase 46 | Complete |
| TVAL-01 | Phase 46 | Complete |
| TVAL-02 | Phase 46 | Complete |
| TVAL-03 | Phase 46 | Complete |
| TVAL-04 | Phase 46 | Pending |
| TRAD-01 | Phase 46 | Pending |
| TRAD-02 | Phase 47 | Pending |
| TRAD-03 | Phase 48 | Pending |
| TRAD-04 | Phase 49 | Pending |
| TRAD-05 | Phase 50 | Pending |
| TRAD-06 | Phase 51 | Pending |
| TRAD-07 | Phase 52 | Pending |
| GATE-01 | Phase 46 | Pending |
| GATE-02 | Phase 46 | Pending |
| GATE-03 | Phase 53 | Pending |

**Coverage:**

- v2.1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓ (sin huérfanos, sin duplicados — cada requirement va a EXACTAMENTE una fase)

**Cómo se agruparon (rationale):**

| Fase | Requirements | Por qué juntos |
|------|--------------|----------------|
| **Phase 46** — Pipeline end-to-end (piloto Preposiciones) | SCH-01..03 · REND-01..05 · TVAL-01..04 · GATE-01 · GATE-02 · TRAD-01 | Es el patrón validado del propio proyecto para esta forma exacta (Phase 7 de v1.0: schema + render + UNA categoría entera end-to-end antes de escalar). El pipeline **debe probarse sobre contenido real antes de escalar**: un prompt de validación malo descubierto en la variante 500 es el modo de fallo caro. Los gates van AQUÍ, no al final — la lección de v2.0 es que un array de conteo añadido tarde emitió `225/225 PASS` con una categoría desenganchada. |
| **Phases 47-52** — bloques de contenido | TRAD-02..07 (uno por fase) | Son 626 traducciones a mano + quórum tras el piloto. Una fase por bloque de 78-122 variantes mantiene cada fase ejecutable y su gate cerrable; colapsarlas produciría fases que no se pueden terminar. Independientes entre sí: solo comparten el array de cobertura, que cada fase engancha en lockstep dentro de su propio commit. |
| **Phase 53** — cierre | GATE-03 | Solo se puede afirmar (y verificar por mutación) con los seis bloques cerrados: 722/722, suite verde, reporter exit 0 y motor intacto salvo `SESSION_AUTO_ADVANCE_MS`. |

**Volumen por fase** (verificado contra `content/exercises/` el 2026-08-13, derivado del disco):
`46` Preposiciones 96 · `47` Articoli 62 + Partitivos 48 = 110 · `48` fare-indicativo 54 + congiuntivo 30 + indefiniti 21 + cond-imperativo 17 = 122 · `49` Genero e numero 60 + Sostantivi irregolari 44 = 104 · `50` Professioni 55 + Verbi di movimento 54 = 109 · `51` Essere 46 + Avere 32 + Presente regolare 25 = 103 · `52` Dimostrativi 22 + Possessivi 21 + Riflessivi 18 + Modali 17 = 78. **Total 722.**

---
*Requirements defined: 2026-08-13*
*Last updated: 2026-08-13 after roadmap creation (Phases 46-53; 22/22 requirements mapped, 0 orphans)*
