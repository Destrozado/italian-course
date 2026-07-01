# Phase 33: Pantallas de ejercicio - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 33-Pantallas de ejercicio
**Areas discussed:** Opción múltiple (modelo de interacción), Emparejar (modelo de interacción), Sugerencia/feedback/hueco, Barra superior/atrás/cronómetro/overline, Cierre (word-buttons)

---

## Opción múltiple — modelo de interacción

| Option | Description | Selected |
|--------|-------------|----------|
| 2-pasos (handoff EX-03) | Seleccionar → rellena hueco → Comprobar → feedback → Continuar | |
| 1-paso (conservar actual) | Tocar = corrige al instante; solo repintado Editoriale | ✓ |

**User's choice:** 1-paso (conservar actual).
**Notes:** Confirma además mantener el teclado actual (1-4 corrige al instante) y avance manual siempre ("Continuar", sin auto-avance en acierto). Desvía conscientemente del sub-criterio EX-03 (sin botón Comprobar, sin estado selección pre-corrección).

---

## Emparejar — modelo de interacción

| Option | Description | Selected |
|--------|-------------|----------|
| Conservar actual (por-pareja) | Cada pareja valida al instante (flash rojo + cascada D-61); solo repintado | ✓ |
| Adoptar handoff (todo-y-comprobar) | Emparejar todo, luego CTA Comprobar deshabilitado hasta completar | |

**User's choice:** Conservar actual (por-pareja).
**Notes:** Estados visuales del handoff → "Solo los compatibles, tú decides" (planner aplica badge numérico/green-tint; "eligiendo…"/"?"/discontinua solo si encajan). Desvía conscientemente de EX-04 (no hay CTA hasta completar).

---

## Bloque de pregunta — sugerencia, feedback, hueco

| Option | Description | Selected |
|--------|-------------|----------|
| Sugerencia: Omitirla | No mostrar sugerencia cursiva (no hay dato fuente) | ✓ |
| Sugerencia: Derivarla del name | Generar genérica desde el name | |
| Sugerencia: Tú decides | Planner decide | |
| Feedback: Español ('¡Correcto!'/'Casi…') | Títulos en español | |
| Feedback: Italiano ('¡Esatto!'/'Quasi…') | Títulos en italiano, fiel al mock | ✓ |
| Feedback: Sin título | Solo caja + explicación | |
| Hueco: Visible + relleno tras corregir | Frase con hueco; al corregir, relleno verde subrayado/rojo tachado | ✓ |
| Hueco: Solo visible sin relleno | Hueco estilizado sin rellenar | |
| Hueco: Tú decides | Planner decide | |

**User's choice:** Omitir sugerencia · Feedback en italiano · Hueco visible + relleno post-corrección (aplica a MC y word-buttons).
**Notes:** El relleno es post-corrección (no pre-selección), coherente con el flujo 1-paso. La explicación pedagógica actual se conserva bajo el título italiano.

---

## Barra superior — atrás, cronómetro, overline

| Option | Description | Selected |
|--------|-------------|----------|
| Atrás circular = Volver; Reiniciar abajo | Atrás arriba asume Volver al home; Reiniciar permanece abajo | ✓ |
| Atrás arriba = Volver; quitar Reiniciar | Eliminar Reiniciar de la pantalla (pierde UX-01) | |
| Atrás: Tú decides | Planner decide | |
| Cronómetro: chip en barra superior | Chip con segundos, reemplaza la barra que se vacía | |
| Cronómetro: chip + mantener barra | Chip + conservar barra de vaciado como refuerzo | ✓ |
| Cronómetro: Tú decides | Planner decide | |
| Overline: reusar sessionContextLabel | Repintar el contexto actual como overline | ✓ |
| Overline: derivar del name (D-02) | Construir 'NOMBRE · TEMA' del split | |
| Overline: Tú decides | Planner decide | |

**User's choice:** Atrás circular arriba = Volver (Reiniciar abajo) · Chip cronómetro + mantener barra que se vacía · Reusar sessionContextLabel.
**Notes:** Conserva la confirmación requestReturnToHome. Mecánica del timer intacta.

---

## Cierre — word-buttons (EX-05)

| Option | Description | Selected |
|--------|-------------|----------|
| Word-buttons a criterio del planner; listo | Planner extrapola Editoriale coherente con MC; cerrar contexto | ✓ |
| Fijar algo más de word-buttons | El usuario bloquea un detalle | |
| Explorar más zonas grises | Discutir otra zona gris | |

**User's choice:** Word-buttons a criterio del planner; listo para contexto.

---

## Claude's Discretion

- Word-buttons (EX-05): extrapolación completa del lenguaje Editoriale al planner.
- Estados de match "compatibles" con el flujo por-pareja (D-05).
- Estructura CSS, clases nuevas, técnica del hueco/relleno, forma del chip y la barra de progreso superior, maquetación full-height.
- Sugerencia cursiva: omitir o (si surge fuente limpia) neutro — el autor optó por omitir.

## Deferred Ideas

- Flujo 2-pasos "Comprobar → Continuar" (MC) y "emparejar todo y comprobar" (match): rechazados para v1.8; futuro trabajo de motor/UX si se desea.
- Campo `topic`/`hint` por ejercicio para sugerencia cursiva real: futura tarea de contenido.
- Pantallas Canciones · Resultados · Picker → Phase 34.
