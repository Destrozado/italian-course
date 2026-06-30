# Phase 34: Canciones · Resultados · Picker - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 34-Canciones · Resultados · Picker
**Areas discussed:** Tarjeta "Continuar", Meta + punto de canción, Anillo de Resultados, Picker Editoriale

---

## Tarjeta "Continuar" (SRP-01)

### ¿Qué canción la alimenta?
| Option | Description | Selected |
|--------|-------------|----------|
| Última jugada (lastPlayedAt) | Destacar la de lastPlayedAt más reciente; ocultar si nunca jugó | |
| Primera pendiente | Primera no-hecha o fallada (siguiente recomendada) | ✓ |
| Omitir la card | No implementar la tarjeta destacada | |

### ¿Qué muestra como "progreso"?
| Option | Description | Selected |
|--------|-------------|----------|
| Barra por estado (sin número) | Llena si pasada; sin "9/14 huecos" (no existe) | ✓ |
| N total de huecos | "N huecos" como meta, sin barra de fracción | |
| Sin barra | Solo portada + overline + título + artista | |

### Overline cuando la destacada es nueva
| Option | Description | Selected |
|--------|-------------|----------|
| Dinámico según estado | "CONTINUAR" si fallada, "EMPEZAR" si no-hecha | ✓ |
| Siempre "CONTINUAR" | Verbatim del handoff | |
| "SIGUIENTE" | Etiqueta neutra única | |

### Cuando no hay pendiente (todas pasada)
| Option | Description | Selected |
|--------|-------------|----------|
| Ocultar la card | Solo la lista (ausencia = señal) | ✓ |
| Destacar última jugada | Caer a lastPlayedAt para repasar | |
| Destacar la primera | Re-jugar la primera de la lista | |

**Notes:** No existe progreso parcial intra-canción (PLAY-05 descarta lo no comprometido); por eso barra por estado y no fracción. El overline dinámico evita la incoherencia de "CONTINUAR" sobre una canción nunca empezada.

---

## Meta + punto de canción (SRP-01)

### Título y artista
| Option | Description | Selected |
|--------|-------------|----------|
| Partir en "—" | "Solo" + cursiva "Ultimo"; mismo patrón D-32-02 | ✓ |
| Título completo, sin artista | Mostrar "Solo — Ultimo" tal cual | |

### Nivel (no existe campo)
| Option | Description | Selected |
|--------|-------------|----------|
| Omitir nivel | Meta = "Ultimo · N huecos" | ✓ |
| Solo huecos | Meta = "N huecos" a secas | |

### Punto de estado (no-hecha/pasada/fallada)
| Option | Description | Selected |
|--------|-------------|----------|
| pasada=verde, fallada=rojo, no-hecha=neutro | Rojo Editoriale en fallada | ✓ |
| pasada=verde, fallada=ámbar, no-hecha=neutro | Ámbar en fallada (menos alarmante) | |

**Notes:** El estado de canción NO es la tríada de categorías; rojo en fallada es coherente con el acento de errores del resto de la app.

---

## Anillo de Resultados (SRP-03)

### Alcance (summary es pantalla compartida)
| Option | Description | Selected |
|--------|-------------|----------|
| En todas | Anillo en repaso/test/examen | ✓ |
| Solo examen | Anillo solo en sessionMode==='examen' | |
| Examen + test-completo | Anillo en sesiones de evaluación | |

### Denominador de "X/Y correctos"
| Option | Description | Selected |
|--------|-------------|----------|
| Respondidos | Y = sessionResults.length | ✓ |
| Total del set | Y = tamaño total lanzado (20 / pool) | |

### Título (multi-categoría vs single)
| Option | Description | Selected |
|--------|-------------|----------|
| Reusar summaryHeaderLabel | Label actual repintado serif | ✓ |
| Genérico por modo | "Examen — {cat}" / "Repaso" / "Test completo" | |

**Notes:** "categorías afectadas (cascada)" mapea al summaryDelta existente; "Errores cometidos" ya existe. El anillo es lo único nuevo (score de sessionResults).

---

## Picker Editoriale (SRP-04, extrapolado)

### Qué cuenta el contador
| Option | Description | Selected |
|--------|-------------|----------|
| Categorías seleccionadas | pickerCheckedCategoryIds.length | ✓ |
| Ejercicios en el pool | pickerPoolSize (redundante con botón Empezar) | |
| Ambos | "3 categorías · N ejercicios" | |

### Estilo de selección
| Option | Description | Selected |
|--------|-------------|----------|
| Filas Editoriale con tick | Filas hairline + check verde, fila clicable | ✓ |
| Checkboxes nativos restyle | <fieldset> nativo repintado | |

### Sub-título de categoría
| Option | Description | Selected |
|--------|-------------|----------|
| Sí, mismo split | "Avere" + cursiva "presente indicativo" (D-32-02) | ✓ |
| Solo el nombre | cat.name a secas | |

**Notes:** El conteo de ejercicios ya lo muestran pickerStartLabel y el aviso de test-completo; el contador cuenta categorías para no duplicar.

---

## Cierre — SRP-02 (reproducción de canción)

No se discutió como gray area: queda determinado por herencia (la pantalla `cancion` ya es word-buttons → aplicar el tratamiento Editoriale + barra superior de Phase 33, sin chip de cronómetro, conservando el auto-avance 600ms de modo canción). El usuario eligió "Listo para context" sin matizarlo → criterio del planner.

## Claude's Discretion

Estructura CSS concreta, nombres de clases, técnica del anillo conic-gradient y su centro de %, tiles de portada tintados (repeating-linear-gradient + inicial serif), render del hueco en la letra y su relleno post-corrección, truncado o no de "categorías afectadas", maquetación de cada pantalla. Respetando "app.css base (sin Pico) + Editoriale encima" y "motor intacto".

## Deferred Ideas

- Flujo 2-pasos "Comprobar → Continuar" en reproducción de canción.
- Arte de portada real + modo oscuro Editoriale (Future Requirements).
- Persistencia de progreso parcial intra-canción (barra "9/14" real) — tocaría el motor.
- Campos artista/nivel/topic por canción — futura tarea de contenido.
- Todo "Responsive móvil (Home + ejercicios)" (score 0.9) — revisado, NO plegado: pantallas de Phases 32/33, v1.8 es desktop-only.
