# Requirements: Italian Course — Milestone v2.1 (Traducción al español por variante · TRAD-X1)

**Defined:** 2026-08-13
**Core Value:** Que el sistema te obligue a no olvidar. El motor de repetición garantiza que cada categoría se re-verifica constantemente, y que un solo fallo en cualquier ejercicio te devuelve a repetir esa categoría entera.

**Goal del milestone:** Que cada ejercicio muestre la traducción española de su frase al resolverlo — aciertes o falles — separada de la explicación teórica, para aprender vocabulario y reconocer el tiempo verbal en contexto.

**Volumen medido (2026-08-13, `content/exercises/`):** 250 slots / 758 variantes totales, de las cuales **722 son `multiple-choice`** (las que se traducen), 22 `word-buttons` y 14 `match` (fuera de scope, ver más abajo).

## v2.1 Requirements

### Modelo de datos y schema

- [ ] **SCH-01**: Cada variante `multiple-choice` puede llevar la traducción española de su frase; el validator la acepta como string no vacío cuando está presente y las 250 slots existentes siguen validando sin ella (retrocompatible, patrón `explanation` de Phase 7).
- [ ] **SCH-02**: El validator RECHAZA el campo de traducción en variantes `match` y `word-buttons`, de modo que es imposible autorar traducción donde el diseño dice que no aporta (el prompt de `word-buttons` ya es español; `match` no tiene frase).
- [ ] **SCH-03**: El alta del campo NO toca `schemaVersion` (sigue en 13) ni resetea progreso — es contenido en `content/`, no state; verificado por test explícito, no por afirmación.

### Render en pantalla

- [ ] **REND-01**: Al FALLAR un `multiple-choice` que tiene traducción, el autor la ve junto al feedback rojo, visualmente distinguible de la `explanation` (son cosas distintas: una traduce, la otra explica la regla).
- [ ] **REND-02**: Al ACERTAR, el autor ve la traducción igualmente y el auto-avance le deja tiempo real de leerla (`SESSION_AUTO_ADVANCE_MS` sube desde 600 ms; el valor final se fija en UAT con uso real).
- [ ] **REND-03**: El botón "¿Por qué?" / tecla `e` sigue revelando la `explanation` bajo demanda tras acertar y sigue cancelando el auto-avance — la traducción no le roba el sitio ni cambia su comportamiento.
- [ ] **REND-04**: En la sección "Errores cometidos" del resumen, cada fallo muestra la traducción de la frase que falló, junto a su explanation.
- [ ] **REND-05**: Un ejercicio SIN traducción no deja hueco, etiqueta ni placeholder en ninguna de las dos superficies (graceful degradation D-121), y el render usa `x-text` exclusivamente (invariante anti-XSS T-02-01).

### Validación de las traducciones

- [ ] **TVAL-01**: Existe un prompt de validación propio para traducciones con criterios explícitos derivados de los S1-S6 de canciones (fidelidad it→es, acentos RAE según PRES-05, naturalidad, registro) y NO de R1-R7, que examinan la gramática del slot y aquí no aplican.
- [ ] **TVAL-02**: Existe un script hermano de `scripts/validate-song-pass.mjs` que corre el quórum cross-vendor sobre las traducciones y escribe el pase en el JSON.
- [ ] **TVAL-03**: Cada traducción lleva su propio `validation.passes[]` y su status se deriva por `deriveStatus` — misma fuente única que ejercicios y canciones, con el override de autor de primera clase (`override: true`) incluido, sin reimplementaciones locales.
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
- [ ] **GATE-03**: Al cierre del milestone: 18/18 categorías y 722/722 traducciones cubiertas y `validated`, suite verde, reporter exit 0, y el motor v1.4 intacto salvo el ÚNICO cambio declarado (`SESSION_AUTO_ADVANCE_MS`) — la cascada D-54 sigue con exactamente 2 call-sites.

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
| SCH-01 | — | Pending |
| SCH-02 | — | Pending |
| SCH-03 | — | Pending |
| REND-01 | — | Pending |
| REND-02 | — | Pending |
| REND-03 | — | Pending |
| REND-04 | — | Pending |
| REND-05 | — | Pending |
| TVAL-01 | — | Pending |
| TVAL-02 | — | Pending |
| TVAL-03 | — | Pending |
| TVAL-04 | — | Pending |
| TRAD-01 | — | Pending |
| TRAD-02 | — | Pending |
| TRAD-03 | — | Pending |
| TRAD-04 | — | Pending |
| TRAD-05 | — | Pending |
| TRAD-06 | — | Pending |
| TRAD-07 | — | Pending |
| GATE-01 | — | Pending |
| GATE-02 | — | Pending |
| GATE-03 | — | Pending |

**Coverage:**
- v2.1 requirements: 22 total
- Mapped to phases: 0
- Unmapped: 22 ⚠️ (se resuelve al crear el roadmap)

---
*Requirements defined: 2026-08-13*
*Last updated: 2026-08-13 after milestone v2.1 definition*
