# Phase 2: Mecánica completa de re-verificación - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-23
**Phase:** 2-Mecánica completa de re-verificación (cascada + estados + dashboard)
**Areas discussed:** Navegación entre pantallas, Home dashboard + badges, Picker + lanzador, Resumen de fin de sesión, Racha cuándo cuenta, Cascada multi-categoría, Persistencia in-flight Test completo, Testabilidad del dominio

---

## Navegación entre pantallas

### Pregunta 1: ¿Cómo gestionamos el cambio entre home / picker / sesión / resumen?

| Option | Description | Selected |
|--------|-------------|----------|
| Componente Alpine único (router en memoria) | Un solo `<div x-data="app">` raíz con `currentScreen` switch; sin URL, deep-link imposible (Recomendado). | ✓ |
| Hash router (#/home, #/session) | Mini-router de ~20 LOC con `hashchange`; deeplinkable. | |
| Componentes Alpine por pantalla | Cuatro `x-data` separados con orquestador externo. | |

**User's choice:** Componente Alpine único.

### Pregunta 2: ¿Cómo estructuramos el factory `appShell`?

| Option | Description | Selected |
|--------|-------------|----------|
| Factory plano con todo dentro | `src/screens/app.js` con `currentScreen`, `content`, `state` y todos los métodos como props planas. ~400-500 LOC. | ✓ |
| `appShell` + sub-factories compuestos con spread | `{ ...homeState, ...pickerState, ...sessionState, ...summaryState, ... }`. Reparte código (Recomendado). | |
| `Alpine.store` global + sub-componentes minimal | Singleton store + `x-data` pequeño por pantalla. Patrón nuevo. | |

**User's choice:** Factory plano (eligió simplicidad sobre composición).

### Pregunta 3: Semántica de abandono del Repaso

| Option | Description | Selected |
|--------|-------------|----------|
| Solo cerrar pestaña descarta; botón `Volver` también descarta sin confirmar | (Recomendado por coherencia con "Repaso es desechable"). | |
| Cerrar pestaña descarta, `Volver` muestra confirmación | Doble seguridad contra clicks accidentales. | ✓ |
| Sin botón de salida durante el Repaso | Refuerza core value pero puede frustrar. | |

**User's choice:** Cerrar descarta silencioso; `Volver` con confirmación inline.

### Pregunta 4: Tras volver al home desde el resumen

| Option | Description | Selected |
|--------|-------------|----------|
| Home recargada con estado actualizado, sin animación | (Recomendado). | ✓ |
| Home con resaltado breve en categorías tocadas | CSS animation + tracking. | |
| Más preguntas sobre navegación | | |

**User's choice:** Home recargada sin animación.

---

## Home dashboard + diseño de badges

### Pregunta 1: Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Tabla densa (una fila por categoría) | 5 columnas alineadas, escaneo de un vistazo (Recomendado). | ✓ |
| Cards apiladas | Más aireado, más scroll. | |
| Lista compacta tipo checklist | Más ligero, menos preciso para comparar. | |

**User's choice:** Tabla densa.

### Pregunta 2: Distinción visual del badge

| Option | Description | Selected |
|--------|-------------|----------|
| Glifo Unicode + color de Pico | `●` / `✓` / `★` con CSS vars, cero dependencias (Recomendado). | ✓ |
| Texto puro coloreado | `no hecha` / `hecha` / `dominada` (palabras). | |
| Pill/Badge con fondo | `[no hecha]` con bg gris, etc. Más visual. | |

**User's choice:** Glifo Unicode + color de Pico.

### Pregunta 3: Celebración al alcanzar `dominada`

| Option | Description | Selected |
|--------|-------------|----------|
| Sin celebración: solo el badge `★` | Sobrio, coherente con "sigue apareciendo igual" (Recomendado). | ✓ |
| Mensaje destacado en el resumen | Highlight inline. | |
| Banner discreto en el home | Persiste hasta próxima visita. | |

**User's choice:** Sin celebración.

### Pregunta 4: Botón(es) de acción desde el home

| Option | Description | Selected |
|--------|-------------|----------|
| Dos botones grandes arriba: `Repaso 20` y `Test completo` | Máximo affordance (Recomendado). | ✓ |
| Dos botones abajo de la tabla | Da prioridad al estado. | |
| Un único botón `Empezar sesión` que va al picker | Reduce ruido, añade click. | |
| Botón por fila (acceso rápido) | Combinación rica, adelanta scope. | |

**User's choice:** Dos botones grandes arriba.

---

## Picker + lanzador de modos

### Pregunta 1: ¿Picker compartido o por modo?

| Option | Description | Selected |
|--------|-------------|----------|
| Picker único, modo heredado del botón en home | Misma pantalla, cabecera y botón cambian (Recomendado). | ✓ |
| Picker único con switch de modo dentro | Toggle radio dentro del picker. | |
| Dos pickers separados | Permite recordar selección por modo. | |

**User's choice:** Picker único, modo heredado.

### Pregunta 2: Contador en vivo de ejercicios

| Option | Description | Selected |
|--------|-------------|----------|
| Botón `Empezar` muestra número real en label | Una fuente de verdad (Recomendado). | ✓ |
| Contador como texto separado encima del botón | Más informativo, más ruido. | |
| Sin contador en vivo, solo aviso si pool < 20 | Aviso interrumpe. | |

**User's choice:** Número en label del botón.

### Pregunta 3: Aviso previo de Test completo

| Option | Description | Selected |
|--------|-------------|----------|
| Aviso inline en picker, sin modal | Más fluido (Recomendado). | ✓ |
| Confirm modal al pulsar Empezar | Bloquea hasta confirmar. | |
| Las dos: aviso inline + confirm si > umbral | Doble seguridad. | |

**User's choice:** Aviso inline.

### Pregunta 4: Estado inicial de los checkboxes

| Option | Description | Selected |
|--------|-------------|----------|
| Todos marcados por defecto | Rápido para flujo diario (Recomendado). | |
| Recordar última selección | Personal, requiere persistir. | |
| Todos desmarcados por defecto | Más deliberado, más clicks. | ✓ |
| Solo `no-hecha` marcadas | Pedagógico, le quita control. | |

**User's choice:** Todos desmarcados (eligió enfoque deliberado sobre el recomendado).

---

## Resumen de fin de sesión

### Pregunta 1: Información más prominente

| Option | Description | Selected |
|--------|-------------|----------|
| Delta de estado por categoría tocada | Tabla/lista detallada por categoría (Recomendado). | ✓ |
| Score global arriba + diff colapsable | `18/20` con detalle bajo click. | |
| Lista plana sin razones del fallo | Compacto. | |

**User's choice:** Delta detallado por categoría.

### Pregunta 2: Tono de las regresiones

| Option | Description | Selected |
|--------|-------------|----------|
| Neutral factústico | Texto plano, color sutil (Recomendado). | ✓ |
| Positivo reformulado | "Necesita revisión", sin "falló". | |
| Énfasis fuerte en negativo + botón `Repetir Avere` | Adelanta scope. | |

**User's choice:** Neutral factústico.

### Pregunta 3: Botones al pie

| Option | Description | Selected |
|--------|-------------|----------|
| Solo `Volver al home` | Simplicidad, flujo lineal (Recomendado). | ✓ |
| `Volver` + `Empezar otra sesión` | Útil para consecutivas. | |
| `Volver` + `Repetir esta sesión` | Pedagógico, adelanta scope. | |

**User's choice:** Solo `Volver al home`.

---

## Racha: cuándo cuenta exactamente

### Pregunta 1: Categoría `no-hecha` tocada sin fallar pero no cubre todos los ejercicios

| Option | Description | Selected |
|--------|-------------|----------|
| Racha NO incrementa hasta llegar a `hecha` | Estricto, coherente con "domesticada" (Recomendado). | ✓ |
| Racha incrementa cada día que toques sin fallar | Premia constancia. | |
| Solo en `hecha`, pero el día de promoción cuenta como día 1 | Más intuitivo. | |

**User's choice:** Solo cuenta en `hecha` (y el día de promoción cuenta como día 1 — incorporado en D-38).

### Pregunta 2: Ya `hecha` en Avere, sesión toca 2/12 ejercicios sin fallar

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, basta tocar + no fallar (1 vez por día) | Coherente con DOMAIN-07 (Recomendado). | ✓ |
| Sí, pero solo si cubre ≥N% | Más exigente, opaco. | |
| Sí, solo si vuelves a recubrir todos | Muy estricto, casi inalcanzable con Repaso 20. | |

**User's choice:** Bastante tocar + no fallar.

---

## Cascada multi-categoría intra-sesión

### Pregunta 1: Acierto previo en solo-Avere, luego fallo en `[avere,genero]`

| Option | Description | Selected |
|--------|-------------|----------|
| Fail-wins absoluto: cleared = [] | Coherente con reset (Recomendado). | ✓ |
| Fail resetea, post-fallo arranca nuevo cleared | Más permisivo, más código. | |
| Resetear solo si `hecha`/`dominada` | Cosmético. | |

**User's choice:** Fail-wins absoluto.

### Pregunta 2: Aciertos POST-fallo en misma sesión

| Option | Description | Selected |
|--------|-------------|----------|
| También se descartan; solo cuenta sesión futura sin fallos | Sesión = transacción (Recomendado). | ✓ |
| Sí cuentan: rellenan nuevo cleared | Realista psicológicamente. | |
| Cuentan pero NO pueden promocionar a `hecha` | Híbrido. | |

**User's choice:** Sesión = transacción atómica.

### Pregunta 3: Sesión sin fallos pero no cubre todos los ejercicios

| Option | Description | Selected |
|--------|-------------|----------|
| Acumulan en clearedExerciseIds para futuras sesiones | Cleared = round actual (Recomendado). | ✓ |
| Se descartan si no llegamos a cubrir todo en esta sesión | Más exigente. | |
| Acumulan solo dentro de ventana de tiempo | TTL, más código. | |

**User's choice:** Acumulan entre sesiones.

---

## Persistencia in-flight Test completo

### Pregunta 1: Dónde guardar

| Option | Description | Selected |
|--------|-------------|----------|
| Subcampo `inFlightTest` en `italianCourse.v1` | Un solo blob, mismo export (Recomendado). | ✓ |
| Clave separada `italianCourse.v1.inflight` | Aislado, defensivo. | |
| Clave separada y NO incluida en export | El export es solo progreso. | |

**User's choice:** Subcampo del blob principal.

### Pregunta 2: Frecuencia de escritura

| Option | Description | Selected |
|--------|-------------|----------|
| Tras cada respuesta | Zero data loss (Recomendado). | ✓ |
| Tras cada N respuestas (ej. 5) | Buffer, ahorro insignificante. | |
| Al disparar `visibilitychange` | No garantiza disparo en cierre brusco. | |

**User's choice:** Tras cada respuesta.

### Pregunta 3: Notificación al abrir

| Option | Description | Selected |
|--------|-------------|----------|
| Banner persistente en home con `[Reanudar][Descartar]` | No interrumpe (Recomendado). | ✓ |
| Modal automático bloqueante | Garantiza decisión, rompe flujo. | |
| Botón `Reanudar test` y nada más | Riesgo confusión. | |

**User's choice:** Banner persistente.

### Pregunta 4: Conflicto al pulsar `Test completo` con in-flight

| Option | Description | Selected |
|--------|-------------|----------|
| Confirmación `¿Descartarlo y empezar uno nuevo?` | (Recomendado). | ✓ |
| Botón deshabilitado mientras haya in-flight | Parece roto. | |
| Sobrescribe silenciosamente | Destructivo. | |

**User's choice:** Confirmación.

---

## Testabilidad del dominio

### Pregunta 1: Cómo inyectar `today`

| Option | Description | Selected |
|--------|-------------|----------|
| Parámetro explícito `applySessionResult(state, sessionResult, content, today)` | Más puro, recomendado por research (Recomendado). | ✓ |
| Inyectable opcional con default `today = todayLocal()` | Híbrido. | |
| Mock global de `Date` | Opaco. | |
| Inyectar un `clock` object | Extensible, más código. | |

**User's choice:** Parámetro explícito.

### Pregunta 2: Cobertura obligatoria (multiSelect)

| Option | Description | Selected |
|--------|-------------|----------|
| Cascada multi-cat | | ✓ |
| Promociones y regresiones completas (no-hecha→hecha→dominada→no-hecha) | | ✓ |
| Racha 1-vez-por-día + DOMAIN-06 | | ✓ |
| Sampler edge cases | | ✓ |

**User's choice:** Las cuatro.

---

## Pregunta final: cierre

| Option | Description | Selected |
|--------|-------------|----------|
| Listo, escribe CONTEXT.md | (Recomendado). | ✓ |
| Discutir más sobre sampler | | |
| Discutir más sobre shape del state | | |
| Discutir otras zonas grises emergentes | | |

**User's choice:** Listo para escribir CONTEXT.md.

---

## Claude's Discretion

Recolectado en CONTEXT.md sección `### Claude's Discretion`:
- Estilos visuales concretos del badge (qué tono exacto dentro de Pico vars)
- Layout HTML exacto de cada pantalla
- Nombres internos de propiedades del `appShell`
- Estructura del `summaryDelta`
- Implementación concreta del descarte de `inFlightTest` al completar Test completo
- Empaquetar pantallas en un solo archivo o split organizativo
- Cómo materializar las confirmaciones inline (`<dialog>`, `confirm()`, sub-template Alpine)
- Si añadir `exerciseStats.lastShownAt`

## Deferred Ideas

Recolectado en CONTEXT.md sección `<deferred>`:
- Animación de resaltado al volver al home
- Botón `Repetir esta sesión` en el resumen
- Botón por fila para acceso rápido a categoría
- Recordar última selección del picker
- Aviso de oversubscribe en picker (>20 cats elegidas)
- `lastShownAt` en `exerciseStats`
- Cap del `dailyLog`
- Multi-tab guard
