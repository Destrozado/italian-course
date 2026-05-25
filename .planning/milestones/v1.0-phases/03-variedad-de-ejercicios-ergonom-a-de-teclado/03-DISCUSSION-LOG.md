# Phase 3: Variedad de ejercicios + ergonomía de teclado - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-23
**Phase:** 3-Variedad de ejercicios + ergonomía de teclado
**Areas discussed:** UX word-buttons, UX match, Ergonomía teclado, Schema JSON + grading

---

## UX word-buttons

### Q1 — Modelo de selección

| Option | Description | Selected |
|--------|-------------|----------|
| Mover al área respuesta | Banco arriba + área respuesta separada; palabra desaparece del banco al pulsar; click en colocada la devuelve | ✓ |
| Marcar in-place | Palabra se queda en el banco con check/grey; arriba aparece la frase construida concatenada | |
| Slots fijos | Área respuesta con N huecos vacíos según longitud correcta; cada click rellena el siguiente hueco | |

**User's choice:** Mover al área respuesta
**Notes:** Más claro "qué has usado y qué te queda"; el área respuesta es visualmente legible como frase construida.

### Q2 — Distractoras

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, opcionales | Campo `distractors[]` opcional en el JSON; grading exige usar solo las correctas en orden correcto | ✓ |
| Nunca, solo exactas | Banco = palabras justas; solo se falla por orden | |
| Decides tú | Schema lo deja abierto, autor decide ejercicio por ejercicio | |

**User's choice:** Sí, opcionales
**Notes:** Aumenta la dificultad para acercarse a A2 sin obligar a usarlas en cada ejercicio.

### Q3 — Trigger de validación

| Option | Description | Selected |
|--------|-------------|----------|
| Botón 'Comprobar' | Siempre visible bajo el área respuesta; deshabilitado si vacío; Enter también dispara | ✓ |
| Auto si no hay distractoras | Auto-valida cuando #colocadas == #correctas si no hay distractoras; botón si las hay | |
| Solo botón + Enter | Sin botón visible — solo Enter/Space dispara la validación | |

**User's choice:** Botón 'Comprobar'
**Notes:** Coherente con el tono "re-verifica conscientemente" — el usuario decide cuándo. Enter como atajo de teclado.

### Q4 — Feedback al fallar

| Option | Description | Selected |
|--------|-------------|----------|
| Frase correcta literal | Mostrar la respuesta correcta debajo del intento (en rojo); botón Siguiente | ✓ |
| Comparación posición-a-posición | Cada palabra del intento en verde/rojo según coincida; faltantes en gris claro | |
| Solo rojo + 'Siguiente' | Sin mostrar la respuesta correcta | |

**User's choice:** Frase correcta literal
**Notes:** Consistente con multiple-choice (que muestra la opción correcta).

---

## UX match

### Q1 — Comportamiento al completar pareja

| Option | Description | Selected |
|--------|-------------|----------|
| Validar al final solo | Parejas formadas se quedan unidas pero no se evalúan hasta botón Comprobar al final | |
| Validar al instante | Cada pareja evaluada al instante: correcta queda fija verde + apagada; incorrecta parpadeo rojo + deshecha | |
| Validar al instante + acumular fallos | Igual que instante, pero CUALQUIER intento erróneo → ejercicio fallado (incluso si después se completa correctamente) | ✓ |

**User's choice:** Validar al instante + acumular fallos
**Notes:** Refuerza el core value "te obliga a no olvidar". Dispara cascada D-54 al primer error.

### Q2 — Shuffle de columnas

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, ambas columnas | RNG seedable baraja izq y der en cada render | ✓ |
| Solo derecha | Izq en orden del JSON (agrupable temáticamente por el autor); solo der se baraja | |
| No, orden fijo del JSON | Render literal, autor baraja a mano si quiere | |

**User's choice:** Sí, ambas columnas
**Notes:** Maximiza re-verificación; coherente con el espíritu del proyecto.

### Q3 — Tamaño típico

| Option | Description | Selected |
|--------|-------------|----------|
| 3 a 5 (pequeño) | Cabe en una pantalla, parejas grandes; "forced last pair" relevante | |
| 5 a 8 (mediano) | Más denso, más probabilidad de errores parciales | |
| Variable según PDF | Schema acepta 2..~10; layout responsive a N | ✓ |

**User's choice:** Variable según PDF
**Notes:** Decisión sobre "forced last pair" queda como Claude's discretion del planner.

---

## Ergonomía teclado

### Q1 — Teclas para word-buttons

| Option | Description | Selected |
|--------|-------------|----------|
| Números 1-9 = palabras | Sufijo numérico visible en cada palabra; Backspace quita la última; Enter = Comprobar; reaprovecha 1-4 de multi-choice | ✓ |
| Tab + Enter | Usuario tabula y Enter selecciona; más universal pero más pulsaciones | |
| Letras a-z = palabras | Cada palabra con letra; sin límite de 9 pero rompe consistencia con multi-choice | |

**User's choice:** Números 1-9 = palabras
**Notes:** Banco dinámico (re-numerado al menguar). Cap natural de 9 palabras visibles, suficiente para A1/A2.

### Q2 — Teclas para match

| Option | Description | Selected |
|--------|-------------|----------|
| Números izq + letras der | 1-9 izq, a-i der; pulsar `1` marca izq, luego `a` forma pareja | ✓ |
| Tab + Enter | Tabula por items (izq y luego der); 1ª Enter marca, 2ª forma pareja | |
| Números ambas columnas | 1-9 izq, 1-9 der; doble pulsación del mismo número | |

**User's choice:** Números izq + letras der
**Notes:** Cada item lleva sufijo visible (`casa ¹`, `la ᵃ`). Cap 9×9 = 81 parejas, holgado.

### Q3 — Enter/Space tras fallo

| Option | Description | Selected |
|--------|-------------|----------|
| Enter avanza siempre | Tras fallo: Enter/Space → sessionAdvance(); tras acierto: irrelevante (auto-avance gestiona) | ✓ |
| Focus al botón Siguiente | Tras fallo, botón recibe focus y Enter/Space nativo del botón lo activa | |
| Cancela auto-avance en acierto | Además, Enter/Space tras acierto cancela el setTimeout 600ms | |

**User's choice:** Enter avanza siempre
**Notes:** Mantiene SESSION-05 intacta (auto-avance 600ms tras acierto). Listener global del componente.

### Q4 — Focus al montar/avanzar sesión

| Option | Description | Selected |
|--------|-------------|----------|
| Foco al body, sin elemento | keydown listener global; ningún botón con focus visual; números no compiten con Enter de botón focado | ✓ |
| Foco al primer botón interactivo | Tab navega; accesibilidad nativa pero hay que preventDefault números para evitar doble activación | |
| Foco a contenedor invisible | `<div tabindex=-1>` captura keydown sin botón focado | |

**User's choice:** Foco al body, sin elemento
**Notes:** Trade-off aceptado: no hay focus visible, pero las teclas funcionan sin colisiones. Cleanup obligatorio al cambiar `currentScreen`.

---

## Schema JSON + grading

### Q1 — Payload word-buttons

| Option | Description | Selected |
|--------|-------------|----------|
| prompt + answer + distractors[] | `answer` array de tokens en orden; `distractors` opcional; banco = shuffle(answer ∪ distractors) | ✓ |
| prompt + tokens[] + correctOrder[] | `tokens` = banco entero; `correctOrder` = índices; más explícito pero más carga al autor | |
| prompt + answer (string) | `answer` = un string; grading hace split por espacios; más natural copy-paste pero requiere normalización | |

**User's choice:** prompt + answer + distractors[]
**Notes:** Forma más natural de escribir manualmente; grading compara array literal post-lowercase.

### Q2 — Payload match

| Option | Description | Selected |
|--------|-------------|----------|
| prompt + pairs[] | Cada pair es tuple [izq, der]; columnas derivadas | ✓ |
| prompt + left[] + right[] + correctMap | Permite repetidos en derecha vía map explícito; más flexible pero más ruido | |
| prompt + items[] con role | Cada item con role y pairId; muy explícito pero verboso | |

**User's choice:** prompt + pairs[]
**Notes:** Sintaxis más compacta. Duplicados en derecha se manejan con grading textual + consumo por índice de pair.

### Q3 — Duplicados en columna derecha

| Option | Description | Selected |
|--------|-------------|----------|
| Permitidos + grading textual | Comparación por texto; ambos `la` sirven para sustantivos femeninos distintos | ✓ |
| Prohibidos por schema | Validator rechaza derechos duplicados; partir en ejercicios atómicos | |
| Permitidos + grading por posición shuffle-aware | Items con índices internos; el usuario debe emparejar la posición correcta | |

**User's choice:** Permitidos + grading textual
**Notes:** Crítico para artículos italianos (varios sustantivos → mismo artículo). Cada pair consumido por índice, no por texto.

### Q4 — Case-sensitivity

| Option | Description | Selected |
|--------|-------------|----------|
| Case-sensitive estricto | NFC ya normaliza; 'Io' ≠ 'io' | |
| Case-insensitive en grading | toLowerCase() antes de comparar; más tolerante con typos del autor | ✓ |
| Flag opcional por ejercicio | Schema acepta `caseSensitive: false` por ejercicio; default true | |

**User's choice:** Case-insensitive en grading
**Notes:** Trade-off favorable a ergonomía del autor. Risk residual: ocultar typos de mayúsculas. Se asume.

---

## Claude's Discretion

- Estilos visuales concretos (color del item seleccionado en match, animación de parpadeo rojo, tipografía del sufijo numérico/alfabético — `<kbd>` vs superíndice Unicode vs `[1]`).
- Layout exacto del área respuesta en word-buttons (placeholder, wrap multi-línea, borde punteado).
- Comportamiento del "forced last pair" en match (auto-completar al penúltimo click vs exigir el click final).
- Renumeración dinámica del banco word-buttons (recalcular en cada render vs guardar índices originales).
- Estructura de `applyResultToSession` helper (extraído de `sessionSelectOption` o duplicado controlado).
- Estrategia `@keydown.window` vs addEventListener manual con cleanup explícito.
- Nomenclatura de propiedades del `appShell` para sub-estados (`wordButtonsBank`, `matchSelectedLeftIdx`, etc.).
- Warning del schema validator cuando word-buttons tiene >9 palabras visibles.
- Indicador visual del item izq seleccionado en match (ring, color de Pico, underline).

## Deferred Ideas

- Auto-completar el "forced last pair" en match (si se descarta y en UAT se siente lento, reconsiderar Phase 5).
- Letras a-z para palabras del banco word-buttons (alternativa a 1-9, sin límite de 9 pero rompe consistencia con multi-choice).
- Tab + Enter como fallback de teclado.
- Flag opcional `caseSensitive: true` por ejercicio (si emerge ejercicio que TESTEE mayúsculas).
- Cancelar auto-avance 600ms con Enter tras acierto.
- Permitir distractoras en match (items izq o der que NO emparejen con nada).
- Animación de parpadeo rojo (CSS keyframes vs setTimeout) — implementación concreta.
- Indicador visual exacto del item izq seleccionado en match.
- Warning suave del schema validator para word-buttons >9 palabras visibles.

---

*Phase: 3-Variedad de ejercicios + ergonomía de teclado*
*Discussion log: 2026-05-23*
