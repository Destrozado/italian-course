---
title: "FARE-X1 — paradigma completo del verbo `fare` (21 formas, 4 categorías)"
area: content
created: 2026-07-27
source: conversación con el autor 2026-07-27
severity: feature
status: completed
target: milestone v2.0
resolved: 2026-08-13
resolved_by: "Milestone v2.0 (Phases 40-45)"
---

> **CERRADO 2026-08-13 al cerrar el milestone v2.0.** Entregado tal cual: las 4 categorías
> (`fare-indicativo`, `fare-congiuntivo`, `fare-cond-imperativo`, `fare-indefiniti`) están
> registradas en `content/categories.json` (orders 15-18). Volumen real **22 slots / 113
> variantes** frente a los «21 slots ≈ 107» estimados aquí: `fare-congiuntivo` salió con 5
> slots, no 4, porque CONG-04 pidió un slot para el DISPARADOR (ver D-42-01). Las 6 trampas
> de contenido listadas abajo se resolvieron todas en plan-time y quedan documentadas en los
> SUMMARY de las Phases 41-43.

## Qué

Cubrir el paradigma **completo** de `fare` —verbo muy frecuente y muy irregular—
con un ejercicio por cada casilla del paradigma. Diseño acordado con el autor el
2026-07-27.

### Encaje en el motor (sin código nuevo)

`pickVariantIndex` (`src/domain/session.js:232`) elige **una variante por slot y
por sesión**, uniforme al azar. Eso da gratis lo que pedía el autor —"21 preguntas,
una por conjugación, con persona distinta cada pasada"— con el primitivo
slot+variantes ya existente (v1.4):

- **slot** = una casilla del paradigma (p. ej. *congiuntivo imperfetto*)
- **variante** = la persona (io / tu / lui-lei / noi / voi / loro)

### Agrupación: 4 categorías por modo (decisión del autor)

La categoría es la **unidad de reset** (core value: un fallo re-arrastra la
categoría entera), así que el agrupamiento es una decisión de diseño, no estética.
Precedente: `260614-hxn` separó `genero-numero-nazionalita` de `essere-nacionalidad`
por exactamente este motivo.

| # | id propuesto | Slots | Contenido |
|---|---|---|---|
| 1 | `fare-indicativo` | 8 | presente · imperfetto · passato remoto · futuro semplice · passato prossimo · trapassato prossimo · trapassato remoto · futuro anteriore |
| 2 | `fare-congiuntivo` | 4 | presente · imperfetto · passato · trapassato |
| 3 | `fare-cond-imperativo` | 3 | condizionale presente · condizionale passato · imperativo presente |
| 4 | `fare-indefiniti` | 6 | infinito pres/pass · participio pres/pass · gerundio pres/pass |

**Riesgo asumido y aceptado:** `fare-indicativo` mete *presente* (diario) y
*trapassato remoto* (extinto en el habla) en la misma unidad de reset. Si la
categoría se atasca y nunca se pone verde, **partirla en semplici/composti** — es
barato y hay precedente (`260614-hxn`). Vigilarlo tras las primeras semanas de uso.

## Volumen estimado

**21 slots ≈ 107 variantes**: 48 indicativo (8×6) + 24 congiuntivo (4×6) +
12 condizionale (2×6) + 5 imperativo + ~18 de las indefinidas. Cada variante por
quórum R1-R7 → tamaño de **milestone**, no de quick task (v1.9 fueron 4 categorías).

## Trampas de contenido detectadas (resolver en plan-time)

1. **Las formas indefinidas no conjugan por persona.** `fare`/`fatto`/`facendo`
   son formas fijas: en esos 6 slots el eje de variante NO es la persona sino el
   **contexto** (frases distintas que exijan esa forma). ~3 variantes por slot.
2. **El imperativo no tiene `io`** → 5 variantes, no 6.
3. **Celdas homógrafas** — obligan a que el pronombre sujeto esté EN la frase o el
   ejercicio es irresoluble:
   - congiuntivo presente: `faccia` para io / tu / lui-lei (3 variantes, misma respuesta)
   - congiuntivo imperfetto: `facessi` para io y tu
4. **MAGNET de doble validez:** imperativo `tu` admite `fa'` y `fai` (y `fa`), todas
   atestiguadas. Necesita rondas extra de quórum, como los MAGNETs de v1.9
   (`quei/quegli`, parentesco de possessivi).
5. **`trapassato remoto`** solo aparece en subordinada tras passato remoto
   (`dopo che ebbe fatto…`). Sin ese marco la frase es artificial — el frame es
   parte del ejercicio.
6. **`participio presente` (`facente`)** es burocrático/fosilizado. Decidir si entra
   como tal o con una nota de registro.

## Siguiente paso

`/gsd-new-milestone` para abrir **v2.0** con estas 4 categorías. El backlog ya tenía
el hueco: *"Verbos IRREGULARES en presente (andare/fare/venire/dire…) son categoría
aparte"* (out-of-scope explícito de v1.7). Este trabajo cubre `fare`; `andare`,
`venire` y `dire` quedan como candidatos posteriores con el mismo patrón.
