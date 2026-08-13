---
phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones
plan: 01
subsystem: ui
tags: [alpinejs, x-text, css-tokens, schema-validation, localstorage, node-test, brownfield]

# Dependency graph
requires:
  - phase: 15-slots-y-variantes
    provides: "la rama `variants[]` y la capa `SURFACE_VALIDATORS` / `validateVariants` — el punto de enganche real del campo nuevo"
  - phase: 33-editoriale-ejercicios
    provides: "la caja `.session-feedback` con su escala tipográfica (título serif 17/600, `.session-feedback-correct`, `.session-explanation`) y los tokens `--ed-*`"
  - phase: 34-editoriale-resumen
    provides: "la card de «Errores cometidos» (`.summary-errors li`) y `.summary-error-explanation`"
  - phase: 07-explicaciones
    provides: "el molde del campo opcional retrocompatible (`payload.explanation`) y el doble guard `x-show` de render"
provides:
  - "El campo `translationES: { text, validation }` por VARIANTE, aceptado por el schema en `multiple-choice` y rechazado estructuralmente en `match` / `word-buttons`"
  - "Los 2 nodos de render con doble guard (`x-text` exclusivo), uno por superficie, sin una línea de JS nueva"
  - "La regla CSS única compartida `.session-translation, .summary-error-translation` (serif 16/400 ink, margin 8px 0 0)"
  - "La traducción canónica de la fase en disco: `Paolo es de Nápoles de nacimiento.`"
  - "`tests/schema-translation.test.js` — la matriz SCH-01/02/03 completa (30 tests)"
  - "`tests/screen-translation.test.js` — las nueve aserciones V1-V9 del UI-SPEC (41 tests)"
affects: [46-02-validador-de-traducciones, 46-03-gates-de-cobertura, 46-04-expansion-96-variantes, 46-05-verificacion-visual, 47-53-resto-de-categorias]

# Actuals (#2632) — pairs with the plan's `estimate` to calibrate future estimates.
actuals:
  tokens: 80519
  tasks: 2
  commits: 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Campo de contenido opcional que llega al DOM por el spread del payload ya existente — cero JS nuevo"
    - "Gate anclado al último estado PRE-fase del fichero (`refPreFase46`) en lugar de a HEAD"
    - "Gate de historia (`git log --format=%s -- <ruta>` filtrado por scope de fase) en lugar de `git diff` sobre árbol limpio"
    - "Acotado de región por conteo de anidamiento de `<template>`"

key-files:
  created:
    - tests/schema-translation.test.js
    - tests/screen-translation.test.js
  modified:
    - src/data/schema-validator.js
    - index.html
    - app.css
    - content/exercises/preposiciones.json

key-decisions:
  - "El mensaje de los tres rechazos lleva el prefijo `label` (`variants[k].translationES…`) como todas las reglas hermanas del validator: el UI-SPEC fija el sentido del mensaje, no el prefijo"
  - "El rechazo SCH-02 de `match` va ANTES del early-return de `pairs`, no al final: una variante con `pairs` malformado Y `translationES` debe reportar los DOS errores (D-08)"
  - "Los gates de «cero tokens nuevos» y «cero HTML crudo nuevo» se ancian al último commit PRE-fase-46 del fichero, no a HEAD: contra HEAD el gate deja de morder en cuanto la propia fase committea"
  - "V8 se verifica sobre la HISTORIA de git (ningún commit con scope `(46-NN)` tocó el motor), no con `git diff --stat`: sobre un árbol limpio ese diff está vacío siempre y el gate sería vacuo"
  - "El recuento de `.summary-error-translation` se hace sobre el CSS sin comentarios: el comentario de referencia cruzada de la sección de Resultados es prosa, no una segunda declaración"

patterns-established:
  - "Referencia pre-fase para gates de no-crecimiento: `refPreFase46(ruta)` devuelve el commit más reciente que tocó la ruta y cuyo asunto NO lleva el scope de la fase; el gate compara working tree contra ese blob"
  - "Gate de intocabilidad por historia: si un commit de la fase tocó una ruta que debe quedar byte-intacta, su asunto lleva el scope `(46-NN)` y el test se pone rojo — a diferencia de `git diff`, sobrevive al commit"
  - "Control positivo junto a cada aserción de ausencia: V7 exige que las regiones acotadas SÍ contengan `explanation`, y V9 que la explanation SÍ mire `sessionExplanationRevealed`, para que un verde nunca signifique «el símbolo desapareció»"
  - "Comparación de propiedades CSS por NOMBRE declarado, no por substring: `includes('height')` casa `line-height` y produce un rojo falso sobre una declaración que el contrato exige"

requirements-completed: [SCH-01, SCH-02, SCH-03, REND-01, REND-02, REND-03, REND-04, REND-05]

coverage:
  - id: D1
    description: "El schema ACEPTA `translationES.text` en variantes `multiple-choice` y rechaza el texto vacío y el que arrastra el hueco `___`"
    requirement: "SCH-01"
    verification:
      - kind: unit
        ref: "tests/schema-translation.test.js#SCH-01 — translationES se acepta en variantes multiple-choice"
        status: pass
    human_judgment: false
  - id: D2
    description: "El schema RECHAZA `translationES` en variantes `match` y `word-buttons` por presencia de la clave, con el label de la variante correcta"
    requirement: "SCH-02"
    verification:
      - kind: unit
        ref: "tests/schema-translation.test.js#SCH-02 — translationES se rechaza en word-buttons y match (D-46-04)"
        status: pass
      - kind: integration
        ref: "mutación sobre contenido REAL: translationES en avere-ho (multiple-choice) valida; en avere-wb-posesion (word-buttons) y avere-match-persone-1 (match) falla con el mensaje y label exactos"
        status: pass
    human_judgment: false
  - id: D3
    description: "`schemaVersion` sigue en 13 sin migración 13→14, y un state pre-existente sobrevive al boot con su progreso intacto"
    requirement: "SCH-03"
    verification:
      - kind: unit
        ref: "tests/schema-translation.test.js#SCH-03 — el campo es contenido, no state: cero migración (D-46-05)"
        status: pass
    human_judgment: false
  - id: D4
    description: "La traducción se pinta en la caja de feedback al resolver — acertando y fallando — con doble guard y `x-text` exclusivo, entre «Respuesta correcta:» y la explanation"
    requirement: "REND-01"
    verification:
      - kind: unit
        ref: "tests/screen-translation.test.js#V5 — no-leak: ningún template pinta translationES sin guard (R1 / D-46-11)"
        status: pass
      - kind: unit
        ref: "tests/screen-translation.test.js#V6 — orden DOM: qué era → qué significa → por qué (D-46-06 / D-46-08)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Un solo nodo y una sola expresión sirven a los dos desenlaces: no hay rama separada para el acierto, así que la traducción no se duplica"
    requirement: "REND-02"
    verification:
      - kind: unit
        ref: "tests/screen-translation.test.js#V5 — el guard de la superficie 1 exige TAMBIÉN la presencia del dato (doble guard, D-46-09)"
        status: pass
    human_judgment: false
  - id: D6
    description: "El botón «¿Por qué?» y la tecla `e` no tocan la traducción: su guard no referencia el flag de explanation-revelada, y la fase no añade temporizadores"
    requirement: "REND-03"
    verification:
      - kind: unit
        ref: "tests/screen-translation.test.js#V9 — el guard de la traducción NO referencia el flag de explanation-revelada"
        status: pass
      - kind: unit
        ref: "tests/screen-translation.test.js#V8 — la fase no añade ningún temporizador (REND-03: el toggle es síncrono)"
        status: pass
    human_judgment: false
  - id: D7
    description: "La card de «Errores cometidos» pinta la traducción de la variante EXACTA fallada (resuelta por `variantIndex`), antes de su explanation"
    requirement: "REND-04"
    verification:
      - kind: unit
        ref: "tests/screen-translation.test.js#V5 — el guard de la superficie 2 usa optional chaining defensivo espejo de la explanation"
        status: pass
      - kind: unit
        ref: "tests/screen-translation.test.js#V6 — superficie 2: la traducción va antes de summary-error-explanation"
        status: pass
    human_judgment: false
  - id: D8
    description: "Sin traducción no hay nodo, hueco, etiqueta, placeholder ni guion en ninguna de las dos superficies (graceful degradation D-121)"
    requirement: "REND-05"
    verification:
      - kind: unit
        ref: "tests/screen-translation.test.js#V5 (doble guard en las dos superficies) + #V7 (cero ocurrencias en word-buttons/match)"
        status: pass
    human_judgment: false
  - id: D9
    description: "El motor queda BYTE-INTACTO: ningún commit de la fase toca `src/domain/` ni `src/screens/app.js`, y la traducción llega a las dos superficies por el spread del payload que ya existía"
    verification:
      - kind: unit
        ref: "tests/screen-translation.test.js#V8 — el motor queda byte-intacto (D-46-01 / D-46-11)"
        status: pass
    human_judgment: false
  - id: D10
    description: "La traducción se ve realmente en pantalla, en la caja de feedback y en la card de error, con la anatomía y el contraste serif/comentario que el autor eligió"
    verification: []
    human_judgment: true
    rationale: "Los tests congelan la fuente (markup, CSS y orden DOM), no los píxeles renderizados. Las dos comprobaciones `backstop` del UI-SPEC (envoltura de la traducción más larga en cada superficie) están asignadas al plan 46-05, cuando exista la traducción más larga del piloto de la que derivarlas; con una sola frase corta no hay nada que probar sobre envoltura multilínea."

# Metrics
duration: 11min
completed: 2026-08-13
status: complete
---

# Phase 46 Plan 01: Pipeline de traducción end-to-end (tracer) Summary

**La frase canónica `Paolo è ___ Napoli di nascita.` → `Paolo es de Nápoles de nacimiento.` atraviesa contenido → schema → las DOS superficies de render con el motor byte-intacto: `translationES` llega al DOM por el spread del payload que ya existía, así que la fase entera es HTML + CSS puro más 43 líneas de validator.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-08-13T12:44:11Z
- **Completed:** 2026-08-13T12:55:30Z
- **Tasks:** 2
- **Files modified:** 6 (4 modificados + 2 creados)

## Accomplishments

- **El camino de producto funciona de punta a punta sobre UNA frase**, que era el propósito del tracer: el hallazgo del UI-researcher se confirmó en ejecución — `payload: { ...surface, explanation: slot.explanation }` (`src/screens/app.js:2703` y `:2742`) hace fluir `translationES` a los dos templates **sin una línea de JS nueva**. `git diff` en `src/domain/` y `src/screens/app.js` está vacío y ningún commit de la fase los toca.
- **Schema completo**: `translationES` aceptado en `multiple-choice` con `text` string no vacío y sin el hueco `___` (SCH-01, D-46-03), y rechazado estructuralmente en `match` y `word-buttons` (SCH-02, D-46-04) por presencia de la clave — nunca por su contenido, así que ningún acento ni escape puede esquivarlo.
- **Retrocompatibilidad demostrada sobre el fichero REAL**, no sobre un fixture: el corpus v2.0 entero sigue validando con el campo nuevo presente en una sola variante. Cifras **medidas en disco**: 18 categorías, 250 slots, **758 variantes en total** — de las cuales **722 son `multiple-choice`** (el pool traducible del milestone), 22 `word-buttons` y 14 `match`. Cero slots por la rama `payload` legacy.
- **Los dos nodos de render** con doble guard `x-show` (estado resuelto **Y** presencia del dato) y `x-text` exclusivo, más **una sola** regla CSS compartida por las dos superficies (D-46-08). Cero tokens `--ed-*` nuevos, cero hex literales, cero `@media`, diff de `app.css` puramente aditivo (24 líneas `+`, 0 `-`) y `styles.css` sin tocar.
- **71 tests nuevos** (30 de schema + 41 de render) que congelan las nueve aserciones V1-V9 del UI-SPEC, **verificados por MUTACIÓN**: 11 mutaciones ejecutadas, las 11 en rojo, árbol restaurado en verde.

## Task Commits

1. **Task 1 (tracer): la frase canónica atraviesa schema y las DOS superficies** — `f33e2ff` (feat)
2. **Task 2 (RED): matriz de schema con SCH-02 en rojo** — `65ee19b` (test)
3. **Task 2 (GREEN): rechazo SCH-02 + V3/V5/V7/V8/V9** — `e6efe42` (feat)

_No hubo commit de REFACTOR: no había nada que limpiar (los dos bloques nuevos del validator son el molde literal de `payload.explanation`, ya establecido tres veces en el mismo fichero)._

## Files Created/Modified

- `content/exercises/preposiciones.json` — `translationES { text, validation }` en la variante 2 del slot `preposiciones-di-origen`. El `validation` a nivel de SLOT no se toca; el de la traducción nace en `pending` con `passes: []`, listo para el quórum del plan 46-02. Indentación 2 y `options` uno por línea preservados (el `writePass` del 46-02 depende de esa estabilidad).
- `src/data/schema-validator.js` — +43 líneas: el bloque de aceptación en `validateMultipleChoiceSurface` y el rechazo estructural en `validateWordButtonsSurface` y `validateMatchSurface`.
- `index.html` — +20 líneas: los 2 nodos `<p>` con su comentario de justificación, copiados verbatim del UI-SPEC §DOM Contract.
- `app.css` — +24 líneas: la regla del selector doble tras `.session-explanation`, más el comentario de referencia cruzada (sin regla) en la sección de Resultados.
- `tests/schema-translation.test.js` — **nuevo**, 30 tests: la matriz SCH-01/02/03 con los 13 casos del bloque `<behavior>` del plan.
- `tests/screen-translation.test.js` — **nuevo**, 41 tests: V1-V9 del UI-SPEC más el camino end-to-end sobre el contenido real.

## Decisions Made

1. **El prefijo `label` va DENTRO de las comillas del mensaje** (`"variants[1].translationES.text" debe ser…`). El UI-SPEC §Copywriting Contract fija el texto del mensaje y el plan aclara que va «prefijado por `label` como todas las reglas hermanas»; el PATTERNS.md ya anticipaba esta reconciliación («el UI-SPEC fija el sentido, no el prefijo»). Los tests assertean el sufijo literal del contrato **más** el label, así que las dos mitades quedan congeladas.
2. **El rechazo SCH-02 de `match` va al PRINCIPIO de la función, no al final.** `validateMatchSurface` tiene un early-return cuando `pairs` no es array; con el rechazo al final, una variante `match` con `pairs` malformado **y** `translationES` se habría escapado sin reportar el segundo error. Hay un test explícito de convivencia de errores (D-08).
3. **Los gates de no-crecimiento se anclan al último commit PRE-fase, no a HEAD.** El criterio del plan pedía comparar contra `git show HEAD:index.html`, y eso se cumple; pero contra HEAD el gate deja de morder en cuanto la propia fase committea el cambio que vigila. Se añadió `refPreFase46(ruta)` — el commit más reciente que tocó la ruta y cuyo asunto NO lleva el scope `(46-NN)` — y los recuentos de tokens `--ed-*`, `x-html`, `setTimeout`, `<button>` y literales de copy se comparan contra ese blob. Es la misma lección del CR-01 de la Phase 44 aplicada a la referencia en vez de a la cifra.
4. **V8 se verifica sobre la HISTORIA, no con `git diff`.** `git diff --stat src/domain/` sobre un árbol limpio está vacío **siempre**: como gate de «el motor no se tocó en esta fase» habría sido verde para siempre. El test mira si algún commit que tocó esas rutas lleva el scope `(46-NN)`. El `git diff` se conserva como comprobación adicional de deriva sin committear.
5. **El recuento de V2 para `.summary-error-translation` se hace sobre el CSS sin comentarios.** El comentario de referencia cruzada de la sección de Resultados menciona el criterio compartido en prosa; contarlo como declaración habría dado un falso duplicado. El mismo paso `sinComentarios` que `tests/count-arrays-lockstep.test.js` aplica antes de contar, por la misma razón.
6. **Se añadieron controles POSITIVOS a las aserciones de ausencia.** V7 exige que las cuatro regiones acotadas SÍ contengan `explanation` (si no, están mal acotadas) y V9 exige que el nodo de la explanation SÍ referencie `sessionExplanationRevealed` (si no, el flag desapareció y la ausencia en el nodo de traducción no prueba nada). Sin ellos, «cero ocurrencias» significa lo mismo que «el escáner dejó de mirar».

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Comparación de propiedades CSS por substring producía un rojo falso**
- **Found during:** Task 1 (paso 6, primera ejecución de `tests/screen-translation.test.js`)
- **Issue:** La aserción de «cero `height` / `overflow` en la regla nueva» se escribió con `includes('height')`, que casa `line-height: 1.5` — una declaración que el contrato **exige**. El test salió rojo culpando al CSS correcto.
- **Fix:** Extraer los NOMBRES de propiedad declarados (`/([a-z-]+)\s*:/g`) y comparar contra la lista prohibida, con cláusula de no-vacuidad de que el extractor ve al menos una declaración. El bug estaba en el test, no en el CSS.
- **Files modified:** `tests/screen-translation.test.js`
- **Verification:** 41/41 verde; la mutación M6 (duplicar el criterio) y M4 (token nuevo) siguen dando rojo, así que la relajación no volvió vacua la aserción.
- **Committed in:** `f33e2ff` (Task 1)

**2. [Rule 1 - Bug] La primera versión del rechazo SCH-02 en `match` quedaba tras el early-return**
- **Found during:** Task 2 (GREEN)
- **Issue:** Al colocar el rechazo al final de `validateMatchSurface`, el `return` del guard de `pairs` no-array lo dejaba inalcanzable para variantes con `pairs` malformado. Los tests de la matriz no lo cazaban porque todos usan `pairs` válido.
- **Fix:** Mover el rechazo antes del early-return, en las dos funciones, con el comentario que explica por qué esa posición no es cosmética. Añadido el test de convivencia de errores (prompt vacío + answer vacío + translationES → tres errores).
- **Files modified:** `src/data/schema-validator.js`, `tests/schema-translation.test.js`
- **Verification:** el test de convivencia pasa; la mutación M10 (eliminar el rechazo) da rojo en 5 tests.
- **Committed in:** `e6efe42` (Task 2 GREEN)

**3. [Rule 2 - Missing Critical] El comentario de referencia cruzada rompía V2**
- **Found during:** Task 1 (paso 5)
- **Issue:** La primera redacción del comentario de la sección de Resultados citaba el selector literal `.session-translation, .summary-error-translation`. El criterio V2 del plan cuenta `/\.session-translation\b/g` sobre `app.css` crudo y esperaba 1: la mención en prosa lo habría puesto en 2 y el gate habría acusado de duplicar el criterio a un comentario que dice justamente lo contrario.
- **Fix:** Reescribir el comentario sin los selectores punteados **y** contar sobre el CSS sin comentarios en la aserción de `.summary-error-translation`. Las dos lecturas (cruda y sin comentarios) quedan verdes, así que el criterio del plan se cumple al pie de la letra y además de forma robusta ante comentarios futuros.
- **Files modified:** `app.css`, `tests/screen-translation.test.js`
- **Verification:** ambos recuentos dan 1; M6 (regla duplicada de verdad) da rojo.
- **Committed in:** `f33e2ff` (Task 1)

### Desviación de alcance declarada (NO auto-arreglada)

**4. La suite completa NO termina en exit 0 — deuda PRE-EXISTENTE, fuera de alcance**
- **Criterio afectado:** «`node --test tests/*.test.js tests/fixtures/*.test.js` termina con exit 0» (ambos tasks).
- **Línea base medida ANTES de tocar nada** (commit `19f41a9`): 1182 tests, 1178 pass, **4 fail**.
- **Al terminar:** 1253 tests, 1249 pass, **4 fail** — las MISMAS cuatro, mismo nombre de suite. Los 71 tests nuevos pasan todos; cero regresiones.
- **Causa:** los 4 fallos son subtests de `tests/requirements-traceability.test.js` provocados por la reescritura de `.planning/REQUIREMENTS.md` para el milestone v2.1 (commit `04f700f`): falta el ancla `**Coverage: N/N …**` y la tabla de trazabilidad aún no tiene filas.
- **Por qué no se arregla aquí:** el propio mensaje del gate pide una decisión consciente sobre sus anclas y sobre la forma del REQUIREMENTS.md de v2.1 — un asunto del registro de requisitos, no del pipeline de traducción. Tocar un gate sin correr la mutación que verifica que sigue mordiendo es exactamente el modo de fallo del CR-01 de la Phase 44. Documentado en `deferred-items.md` con la acción sugerida.

---

**Total deviations:** 3 auto-arregladas (2 bugs, 1 missing-critical) + 1 desviación de alcance declarada.
**Impact on plan:** los tres auto-arreglos eran necesarios para la corrección; dos de ellos eran bugs **en mis propios gates**, cazados por ejecutarlos en lugar de leerlos. Cero scope creep: ni un fichero fuera de los seis declarados en `files_modified`.

## Verificación por mutación (D-46-18 — leer el gate no cuenta)

Las 11 mutaciones se **ejecutaron**, se observó el rojo, y el árbol restaurado volvió a verde (41/41 y 30/30). Backup y restauración por copia de fichero, sin `git stash` ni `git clean`.

| # | Mutación | Resultado |
|---|---|---|
| M1 | Quitar el guard `sessionFeedback !== null` del nodo de la superficie 1 | ROJO (2) |
| M2 | Renombrar `class="session-translation"` (el escáner deja de casar) | **ROJO (3)** — la cláusula de no-vacuidad de V5 se dispara en lugar de pasar en verde |
| M3 | Colar `translationES` en el sub-template `word-buttons` | ROJO (3) |
| M4 | Añadir un token `--ed-*` nuevo al `:root` | ROJO (2) |
| M5 | Cambiar `SESSION_AUTO_ADVANCE_MS` de 600 a 1200 | ROJO (2) |
| M6 | Duplicar el criterio de estilo en la sección de Resultados | ROJO (2) |
| M7 | Cambiar el `x-text` del nodo por inyección de HTML crudo | ROJO (2) |
| M8 | Renombrar la clase del nodo rompiendo el orden DOM | ROJO (2) |
| M9 | Eliminar el guard del hueco `___` de SCH-01 | ROJO (1) |
| M10 | Eliminar el rechazo SCH-02 de `word-buttons` | ROJO (5) |
| M11 | Rechazar SCH-02 por CONTENIDO (`?.text`) en vez de por presencia | ROJO (2) |

**Mutación sobre contenido REAL** que pedía el criterio de aceptación: `translationES` añadido a `avere-ho` (`multiple-choice`) → `ok: true`; a `avere-wb-posesion` (`word-buttons`) y a `avere-match-persone-1` (`match`) → `ok: false` con el mensaje exacto y el label `variants[0]`.

## Issues Encountered

- **La capa de validación que nombra el CONTEXT no era la correcta**, tal y como advertía el PATTERNS.md: `translationES` vive en la VARIANTE, así que el enganche es la capa `*Surface` (vía `validateVariants`), no los wrappers `validate*Payload`. Se implementó donde dice el pattern map. Si se hubiera puesto en los wrappers, el campo del contenido real nunca se habría validado (las 250 slots del corpus van por la rama `variants[]`) y los tests de rechazo habrían pasado en verde sin validar nada.
- **`localStorage` no existe bajo Node y no había precedente de stub** en la suite (`tests/data-storage.test.js` evita `loadState`/`saveState` por eso). Para probar la verdad de SCH-03 «un state pre-existente sobrevive al boot» hacía falta el camino de producción real, no un atajo por `hydrateV13`: se instala un `localStorage` mínimo sobre `globalThis`, se ejercita `loadState()` y se restaura el global en un `finally`. El test asserta además que el boot no escribió ni una clave nueva.
- **Ninguna incidencia con el punto de inserción del markup:** las líneas que citaba el plan (`:606`/`:607` y `:1284`/`:1285`) coincidían byte a byte con el disco.

## User Setup Required

None — cero dependencias nuevas, cero configuración externa, cero claves. El gate de legitimidad de paquetes no aplica (sin instalaciones).

## Next Phase Readiness

**Listo para el plan 46-02 (validador de traducciones):**
- La forma `translationES: { text, validation: { status, passes[] } }` está fijada y en disco, con `status: "pending"` y `passes: []` esperando el primer pase de quórum.
- La indentación del fichero es estable (2 espacios, `options` uno por línea), que es la premisa del `writePass` quirúrgico.
- **Aviso que el 46-02 debe leer del PATTERNS.md §Delta:** el `validation` a escribir es el de `variants[k].translationES`, y el slot **ya tiene** un `"validation"` propio — `objSlice.includes('"validation"')` daría un falso UPDATE sobre el bloque equivocado. Profundidades de indentación **medidas en disco** para el bloque nuevo: la clave `"translationES"` a **10** espacios, `"text"` y `"validation"` a **12**, y `"status"` / `"passes"` a **14**. El `ind = '      '` (6) del analog de canciones NO sirve tal cual. Verificar por escritura real sobre una copia y `git diff`, no por lectura.

**Listo para el plan 46-04 (expansión a las 95 variantes restantes):** el camino está demostrado, así que la expansión es autoría de contenido más quórum, sin riesgo de arquitectura. Un test de este plan congela deliberadamente que **hay exactamente 1** variante traducida y dice en su mensaje de error que el 46-04 debe actualizar esa cifra — es un recordatorio activo, no una cifra olvidada.

**Nota para el plan 46-03 (gates):** cifras medidas en disco el 2026-08-13, para que `mcVariantCountOf` se compare contra algo y no contra sí mismo — **derivarlas del disco igualmente, esto es contexto, no la fuente**:
- Por SLOTS: 223 `multiple-choice`, 14 `word-buttons`, 13 `match` (250 en total, cero por la rama `payload` legacy).
- Por VARIANTES: **722 `multiple-choice`**, 22 `word-buttons`, 14 `match` (758 en total).
- Preposiciones (el piloto): 50 slots, **96 variantes**, todas `multiple-choice`.

La cobertura de traducción se mide en VARIANTES `multiple-choice`, no en slots. **Ojo con el «722»:** el plan y el CONTEXT lo llaman «722 variantes» a secas, pero es el recuento de variantes `multiple-choice`, no el total de variantes del corpus (758). Un gate que compare la cobertura contra «el total de variantes» daría 722/758 y nunca cerraría.

**Nota para el plan 46-05 (verificación visual):** las dos comprobaciones `backstop` del UI-SPEC siguen pendientes por diseño — con una sola frase corta no hay envoltura multilínea que inspeccionar.

**Único blocker abierto (ajeno a esta fase):** los 4 fallos pre-existentes de `tests/requirements-traceability.test.js` impiden que la suite dé exit 0. Ver `deferred-items.md`.

## Self-Check: PASSED

- Los 6 ficheros de `files_modified` existen en disco, más los 2 artefactos de planificación.
- Los 3 commits declarados existen en `git log` (`f33e2ff`, `65ee19b`, `e6efe42`).
- `git diff --stat src/domain/ src/screens/app.js` → vacío. Cero commits con scope `(46-NN)` sobre esas rutas.
- `grep -c 'Paolo es de Nápoles de nacimiento.' content/exercises/preposiciones.json` → 1.
- `git diff --numstat HEAD~3 HEAD -- app.css styles.css` → `24 0 app.css`; `styles.css` sin tocar.
- Exactamente 1 variante del corpus lleva `translationES`.
- Suite: 1253 tests / 1249 pass / 4 fail — los mismos 4 pre-existentes de la línea base.

**Corrección detectada por este self-check:** la primera redacción de este SUMMARY decía «723 variantes», cifra que **transcribí** en lugar de medirla (el «722» del plan es el recuento de variantes `multiple-choice`, no el total de 758). Corregida contra el disco, con la ambigüedad del «722» documentada arriba para el plan 46-03. Es la lección de D-31-06 aplicándose al propio documento que la cita.

---
*Phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones*
*Completed: 2026-08-13*
