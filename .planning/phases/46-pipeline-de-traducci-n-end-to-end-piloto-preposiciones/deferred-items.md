# Phase 46 — Deferred items (fuera del alcance de los cambios de esta fase)

Descubrimientos que NO fueron causados por los cambios de esta fase y que por tanto
no se arreglaron aquí (regla de scope boundary del ejecutor: solo se auto-arregla lo
que causan los cambios del task en curso).

## 1. `tests/requirements-traceability.test.js` — 4 subtests en rojo ANTES de esta fase

**Detectado:** 2026-08-13, al medir la línea base de la suite antes de tocar nada
(plan 46-01, Task 1).

**Estado en la línea base (commit `19f41a9`, antes de cualquier cambio mío):**
`node --test tests/*.test.js tests/fixtures/*.test.js` → 1182 tests, 1178 pass,
**4 fail**. Los cuatro son subtests del describe
`trazabilidad de requisitos — la cobertura se DERIVA del disco (DEUDA, D-45-12)`.

**Estado al terminar el plan 46-01:** 1253 tests, 1249 pass, **4 fail** — las MISMAS
cuatro. Cero regresiones introducidas; los 71 tests nuevos pasan todos.

**Causa:** `.planning/REQUIREMENTS.md` se reescribió para el milestone v2.1 en el
commit `04f700f` («docs: define milestone v2.1 requirements»). El documento nuevo
declara `**Coverage:**` sin la cifra `N/N` que el gate ancla, y su tabla de
trazabilidad todavía no tiene filas (ningún requisito de v2.1 está completado aún).
El gate reacciona exactamente como fue diseñado: su propio mensaje de error dice
«Si la forma cambió A PROPÓSITO (milestone nuevo, plantilla nueva), la decisión es
consciente y toca actualizar las anclas de este fichero».

**Por qué NO se arregla aquí:** ese rojo pide una decisión consciente sobre las
anclas del gate y sobre la forma del REQUIREMENTS.md de v2.1 — es decir, sobre el
registro de requisitos del milestone, no sobre el pipeline de traducción. Parchearlo
dentro de un plan de traducción (a) mezclaría en el mismo commit dos deudas que no
tienen nada que ver y (b) tocaría un gate sin la mutación que verifica que sigue
mordiendo, que es precisamente el modo de fallo del CR-01 de la Phase 44 y de los
fixes de revisor de esa misma fase.

**Consecuencia sobre el criterio de aceptación del plan:** el plan 46-01 pedía
`node --test tests/*.test.js tests/fixtures/*.test.js` con exit 0. Con esta deuda
pre-existente el exit code es 1 y no puede ser 0 sin resolverla. Lo verificable —y
lo verificado— es que el recuento de fallos NO cambió: 4 antes, 4 después, los
mismos cuatro nombres. Queda documentado como desviación en el SUMMARY.

**Acción sugerida:** un quick task propio («actualizar las anclas del gate de
trazabilidad a la forma del REQUIREMENTS.md de v2.1»), verificado por mutación
—vaciar una fila y observar el rojo— para que el gate no se quede vacuo al
adaptarlo. Puede resolverse solo en parte a medida que los requisitos de v2.1 se
vayan marcando completados y la tabla gane filas; el ancla `**Coverage: N/N …**`
sigue haciendo falta en cualquier caso.

## 2. `.planning/research/.cache/` sin trackear

**Detectado:** ya presente en `git status` antes de empezar el plan (no lo genera
esta fase). Es salida de caché de un agente de research. Candidato a `.gitignore`,
pero la decisión es del autor y no de un plan de traducción.
