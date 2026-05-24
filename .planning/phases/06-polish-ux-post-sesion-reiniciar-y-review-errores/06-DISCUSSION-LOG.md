# Phase 6: Polish UX post-sesión — reiniciar + review errores - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-24
**Phase:** 06-polish-ux-post-sesion-reiniciar-y-review-errores
**Areas discussed:** Alcance del Reiniciar (UX-01), UX del botón Reiniciar (UX-01), Captura del userAnswer por tipo (UX-02), Layout y persistencia de Errores cometidos (UX-02)

---

## Área 1 — Alcance del Reiniciar (UX-01)

### Pregunta 1.1: ¿A qué sesiones aplica el botón "Reiniciar ejercicios"?

| Option | Description | Selected |
|--------|-------------|----------|
| Solo Repaso 20 (Recommended) | x-show sessionMode === 'repaso'. Test completo ya cubierto por banner home (Reanudar/Descartar D-43). Solución quirúrgica al dolor UAT real. | ✓ |
| Repaso 20 + Test completo (con descarte explícito) | Simétrico pero añade punto de borrado destructivo durante la sesión que hoy solo vive en home. | |
| Solo durante feedback de fallo | Menos clutter pero pierde el caso "aún no respondí pero quiero reiniciar". | |

**User's choice:** Solo Repaso 20.
**Notes:** Coherente con el UAT Phase 4 ("muchas veces fallas a mitad..."), que captura el dolor exclusivamente sobre Repaso 20. Test completo ya tiene su modelo reanudable establecido (D-41/D-42/D-43).

### Pregunta 1.2: Al reiniciar a mitad de sesión, ¿qué pasa con aciertos/fallos respondidos?

| Option | Description | Selected |
|--------|-------------|----------|
| Descartar aciertos + preservar fallos D-54 + re-samplear 20 (Recommended) | Mismo modelo SESSION-08. Aciertos no-comprometidos se pierden. Fallos D-54 ya persistidos quedan. exerciseStats NO se bumpea. buildSession() corre de nuevo. | ✓ |
| Descartar aciertos + preservar fallos + MISMO orden de los 20 | Resetea cursor pero reusa el array sessionExerciseIds original. | |
| Sumar aciertos al "nuevo Repaso" (concatenar) | Extiende la cola en vez de reiniciar. Choca con la semántica natural. | |

**User's choice:** Descartar aciertos + preservar fallos D-54 + re-samplear 20.
**Notes:** Re-samplear es deseable — los 20 nuevos pueden diferir por Math.random, así no se repiten exactamente los ejercicios que ya viste. Invariante D-54 intacto.

---

## Área 2 — UX del botón Reiniciar (UX-01)

### Pregunta 2.1: ¿Reset directo o confirmación inline?

| Option | Description | Selected |
|--------|-------------|----------|
| Reset directo, 1 clic (Recommended) | Sin diálogo. Coherente con el dolor UAT ("por 1 solo click"). | ✓ |
| Confirmación inline (5ª call-site de requestConfirm) | 2 clics + modal. Patrón consistente pero contradice el dolor. | |
| Reset directo cuando sessionResults vacío; confirma si ya hubo respuestas | Lógica condicional. Sutil y divergente del modelo binario. | |

**User's choice:** Reset directo, 1 clic.
**Notes:** El invariante D-54 ya persistió los fallos; descartar aciertos es coherente con SESSION-08 — sin confirmación es coherente con el modelo.

### Pregunta 2.2: ¿Dónde aparece el botón visualmente?

| Option | Description | Selected |
|--------|-------------|----------|
| Junto a '← Volver al home' en un .button-row bajo el <hr> (Recommended) | Patrón consistente con picker/backup/home. Cero clutter. x-show sessionMode === 'repaso'. | ✓ |
| Botón discreto en la cabecera junto al indicador 'Ejercicio X/N' | Más cerca del foco, pero rompe el patrón "salidas abajo bajo <hr>". | |
| Solo durante feedback rojo (junto a 'Siguiente') | Engancha al momento del UAT pero pierde el caso pre-respuesta y duplica botón en los 3 sub-templates. | |

**User's choice:** Junto a '← Volver al home' en un .button-row bajo el <hr>.
**Notes:** Reutiliza la arquitectura existente del bloque de salida de la pantalla session. Visible toda la sesión sin importar sessionFeedback.

---

## Área 3 — Captura del userAnswer por tipo (UX-02)

### Pregunta 3.1: Para multi-choice, ¿qué guardamos?

| Option | Description | Selected |
|--------|-------------|----------|
| Texto literal de la opción clickada (Recommended) | userAnswer = ex.payload.options[idx] (string). Robusto frente a refactors. | ✓ |
| Índice numérico (sessionSelectedIndex) | Compacto pero acopla el rendering al schema actual. | |
| Ambos {idx, text} | Redundante; over-engineering para v1. | |

**User's choice:** Texto literal de la opción clickada.

### Pregunta 3.2: Para word-buttons, ¿qué guardamos?

| Option | Description | Selected |
|--------|-------------|----------|
| Array de palabras tal cual lo formó el autor (Recommended) | userAnswer = [...this.wordButtonsAnswer]. Refleja exactamente lo que clicó incluyendo orden erróneo. | ✓ |
| String ya unido con espacios | Equivalente legible pero pierde info de tokens individuales. | |

**User's choice:** Array de palabras tal cual lo formó el autor.

### Pregunta 3.3: Para match (fallado), ¿qué guardamos?

| Option | Description | Selected |
|--------|-------------|----------|
| Solo el PRIMER pareo erróneo: {leftWord, rightWord} (Recommended) | Mismo guard !matchHadFailure que D-61. Coincide con la "lógica de un solo intento" de los otros tipos. Mínimo cambio. | ✓ |
| Todos los intentos erróneos como array | Más info pero ROI dudoso. | |
| Snapshot completo de pairs correctas + flag matchHadFailure | No captura cuál fue el error. | |

**User's choice:** Solo el PRIMER pareo erróneo.
**Notes:** Simetría arquitectónica con D-61 — el primer fallo es el que dispara la cascada Y el que se muestra en el resumen.

---

## Área 4 — Layout y persistencia de Errores cometidos (UX-02)

### Pregunta 4.1: ¿Cómo se organiza la lista?

| Option | Description | Selected |
|--------|-------------|----------|
| Lista plana cronológica (Recommended) | Orden en que se respondieron. Mapping directo desde sessionResults.filter(!correct). | ✓ |
| Agrupada por categoría | Más complejidad de agrupación, decisión adicional sobre multi-cat. v2 candidate. | |
| Agrupada por tipo de ejercicio | Rompe el orden cronológico y duplica la separación que summaryDelta ya hace. | |

**User's choice:** Lista plana cronológica.

### Pregunta 4.2: ¿Persiste en localStorage o vive solo durante el resumen?

| Option | Description | Selected |
|--------|-------------|----------|
| Solo durante el resumen, in-memory (Recommended) | sessionResults vive en sub-estado Alpine; se limpia en Volver al home. Sin migración schemaVersion. | ✓ |
| Persistir 'errores recientes' en localStorage (rolling 3 sesiones) | Migración 3→4 + UI nueva. No pedido. | |
| Persistir solo dentro de inFlightTest para Test completo reanudable | Mezcla 2 modelos. | |

**User's choice:** Solo durante el resumen, in-memory.

### Pregunta 4.3: ¿La sección 'Errores cometidos' aparece también en el resumen del Test completo, o solo en Repaso 20?

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, ambos modos — persistir userAnswer en inFlightTest con migración v3→v4 (Recommended) | Extiende inFlightTest.answers con userAnswer. migrate3to4 backfillea null. Feature uniforme. | ✓ |
| Solo Repaso 20 — sin migración | Cero migración pero asimetría Repaso↔Test que el autor podría echar de menos. | |
| Ambos modos pero sin persistir (Test reanudado pierde detalle pre-cierre) | Inconsistente y confuso. | |

**User's choice:** Sí, ambos modos — persistir userAnswer en inFlightTest con migración v3→v4.
**Notes:** Migración nominal (solo backfillea null en sub-objeto opcional). Coherente con la disciplina v1→v2→v3 ya establecida.

### Pregunta 4.4: ¿Formato visual de cada fila?

| Option | Description | Selected |
|--------|-------------|----------|
| Prompt + 'tu respuesta' (rojo) + 'correcta' (verde) en un <li> multi-línea (Recommended) | Reutiliza .incorrecta. Legible sin saturación. Acepta 3-30+ errores. | ✓ |
| Tabla densa: 3 columnas | Frágil con contenido variable (prompts largos, word-buttons con 8+ palabras). | |
| Una sola línea: 'prompt — escribiste X, era Y' | Compacto pero rompe en word-buttons/match. | |

**User's choice:** Multi-línea con .incorrecta rojo + correcta verde.

---

## Claude's Discretion

Items delegados al planner / executor en CONTEXT.md §"Claude's Discretion":

- Etiqueta exacta del botón ("Reiniciar ejercicios" vs "Reiniciar" vs "↻ Reiniciar") según restricciones de `.button-row`.
- CSS exacto del spacing entre `<ul.summary-delta>` y `<section.summary-errors>` (`<hr>` o solo margin-top).
- Texto literal del header de la sección.
- Mostrar o no `ex.notes` en cada fila de error (recomendación: NO en v1).
- 1 plan combinado vs 2 plans secuenciales — recomendación CONTEXT.md: 2 plans secuenciales (Plan 06-01 Reiniciar + Plan 06-02 Errores cometidos) por aislamiento de UAT.
- Refactor del bloque shared entre `startSession()` y `restartRepaso()` (recomendación: duplicar v1).
- Tests específicos a añadir/extender en `tests/domain.test.js` + `tests/data-storage.test.js`.

## Deferred Ideas

Capturadas en CONTEXT.md §"Deferred Ideas":

- Botón Reiniciar en Test completo (v2 candidate).
- Persistencia rolling de errores recientes (state.recentErrors[]).
- Pantalla "Errores históricos" / consulta post-resumen.
- Agrupación por categoría dentro de la lista plana (compromise: `<hr>` separador).
- Mostrar `ex.notes` en la fila de error.
- Botón "Repetir solo los errores" (nueva sesión con IDs fallados — "drill mode" futuro).
- Refactor a helper común entre startSession y restartRepaso.
- Highlight visual para errores multi-cat.
- Tests e2e headless.
- Snooze del banner backup.
- Botón Reiniciar post-summary.
