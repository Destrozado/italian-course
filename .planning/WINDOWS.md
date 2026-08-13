---
schema_version: 1
open_count: 20
waived_count: 0
fixed_count: 5
total_count: 25
last_updated: 2026-08-13T21:53:36.138Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 41 | unrun-verify | content/exercises/fare-indicativo.json |  | Los 4 slots simples estan en validation.status pending: el quorum base Opus+Sonnet (VAL-03, 1 por contexto) y la ronda EXTRA DeepSeek de passato-remoto (D-41-12) siguen sin correr | open |  | 2026-08-03T18:15:04.396Z |  |
| 2 | 41 | deviation | content/exercises/fare-indicativo.json |  | Distractora facetti (1a persona del passato remoto) sustituye a la blacklisteada faci; riesgo residual de que este atestiguada en alguna variedad dialectal — la ronda DeepSeek de D-41-12 debe mirarla con lupa | open |  | 2026-08-03T18:15:04.456Z |  |
| 3 | 41 | unrun-verify | content/exercises/fare-indicativo.json |  | Los 4 slots compuestos estan en validation.status pending: el quorum base Opus+Sonnet (VAL-03, 1 por contexto) y la ronda EXTRA DeepSeek del trapassato remoto (D-41-12, con pronunciamiento explicito sobre las 2 variantes con quando) siguen sin correr | open |  | 2026-08-03T18:34:05.926Z |  |
| 4 | 41 | deviation | content/exercises/fare-indicativo.json |  | Colocacion preverbal de gia en los 12 prompts de trapassato prossimo y futuro anteriore, forzada por la invariante de dos palabras de D-41-10: gramatical y declarada en notes, pero marcada por foco — la pasada de quorum debe confirmarla | open |  | 2026-08-03T18:34:05.985Z |  |
| 5 | 41 | deviation | content/exercises/fare-indicativo.json |  | Las 3 secuencias essere + fatto usadas como distractora malformada en los compuestos vivos (sono/ero/saro fatto y familia) estan bloqueadas SOLO por el objeto directo del prompt: un segundo vendor debe confirmarlo variante a variante | open |  | 2026-08-03T18:34:06.046Z |  |
| 6 | 43 | unrun-verify | content/exercises/fare-cond-imperativo.json |  | Los 3 slots quedan en validation.status pending con passes vacio: el quorum base Opus+Sonnet y la ronda EXTRA DeepSeek (D-43-20) corren en pasada TOP-LEVEL posterior, no dentro del executor (D-43-02, VAL-03) | open |  | 2026-08-06T23:51:40.597Z |  |
| 7 | 43 | unrun-verify | content/exercises/fare-indefiniti.json |  | Los 6 slots quedan en validation.status pending con passes vacio: el quorum base Opus+Sonnet y la ronda EXTRA DeepSeek sobre las 7 variantes de participio passato e infinito passato (D-43-20) corren en pasada TOP-LEVEL posterior, no dentro del executor (D-43-02, VAL-03) | open |  | 2026-08-07T00:20:29.978Z |  |
| 8 | 43 | deviation | content/exercises/fare-indefiniti.json |  | BACKSTOP declarado del plan: en la variante temporal de fare-indefiniti-gerundio-passato el gerundio simple facendo queda entre las opciones y lo unico que lo excluye es el adverbial de anterioridad (la sera prima). Es juicio linguistico, no asercion mecanica: el quorum debe pronunciarse explicitamente o abstenerse a human_needed, nunca dar pase silencioso | open |  | 2026-08-07T00:20:30.038Z |  |
| 9 | 44 | deviation | .planning/REQUIREMENTS.md |  | INT-03 e INT-04 quedan Pending en Traceability: los 3 cruces de 44-02 nacen pending y marcar 'TODAS las variantes validadas' seria un verde que el disco no respalda | fixed |  | 2026-08-11T13:53:03.991Z | 2026-08-11T14:45:03.378Z |
| 10 | 44 | deviation | .planning/ROADMAP.md | 17 | §Milestones (lineas 17, 308, 360) corregido por reemplazo de 3 lineas y no por el skill gsd-phase: el skill solo opera sobre secciones de fase y no cubre la entrada de milestone | open |  | 2026-08-11T13:53:04.059Z |  |
| 11 | 44 | unrun-verify | content/exercises/fare-indicativo.json |  | fare-indicativo-300 y -301 quedan en validation.status pending con passes vacio: el quorum base Opus+Sonnet corre en pasada TOP-LEVEL posterior, no dentro del executor (D-44-11, VAL-03) | fixed |  | 2026-08-11T14:18:24.665Z | 2026-08-11T14:45:03.446Z |
| 12 | 44 | unrun-verify | content/exercises/fare-indefiniti.json |  | fare-indefiniti-300 queda en validation.status pending con passes vacio; G3 (el complemento que excluye dos de los tres modales) es el gate mas delicado de la fase y el quorum top-level debe pronunciarse explicitamente sobre las 3 variantes (D-44-04, D-44-11, VAL-03) | fixed |  | 2026-08-11T14:18:24.730Z | 2026-08-11T14:45:03.510Z |
| 13 | 44 | deviation | tests/count-arrays-lockstep.test.js |  | 44-03: el describe del bloque 2 se retituló para que el grep '^ok .*comentada' del verify del plan case (el TAP de Node indenta los sub-tests); desviación de forma, no de fondo | open |  | 2026-08-12T08:09:57.888Z |  |
| 14 | 44 | deviation | tests/content-fare-indicativo.test.js |  | El comentario puntero mencionaba el token pareceFare y defeteaba el criterio de posicion del TDZ del propio plan; reescrito en prosa sin el token | open |  | 2026-08-12T08:23:55.767Z |  |
| 15 | 45 | deviation | scripts/run-validation-271.mjs |  | D-45-09: el 271 del nombre del fichero codifica un conteo obsoleto (hoy 250). Deuda ACEPTADA y declarada en la cabecera; rename fuera de alcance por 17 call-sites load-bearing | open |  | 2026-08-12T21:40:28.548Z |  |
| 16 | 45 | deviation | tests/requirements-traceability.test.js |  | El gate no cruza con ROADMAP.md: un requisito ausente de las DOS mitades de REQUIREMENTS.md sigue sin gate (D-45-15, medido) | open |  | 2026-08-12T22:25:03.976Z |  |
| 17 | 46 | deviation | tests/requirements-traceability.test.js |  | 4 subtests pre-existentes en rojo (deuda de la transicion a v2.1): falta el ancla **Coverage: N/N** en REQUIREMENTS.md y la tabla de trazabilidad no tiene filas. Impide exit 0 de la suite; ver deferred-items.md de la fase 46 | open |  | 2026-08-13T13:00:26.706Z |  |
| 18 | 46 | unrun-verify | scripts/validate-translation-pass.mjs |  | El camino HTTP real (callModel/httpPost contra DeepSeek o Gemini) NO se ejecutó en el plan 46-02: los tests cubren dry-run, fail-fast y run() con caller inyectado, pero ninguna llamada de red de verdad. Se cierra al correr el quorum real en el plan 46-04 | fixed |  | 2026-08-13T13:30:40.095Z | 2026-08-13T19:44:26.378Z |
| 19 | 46 | unmet-truth | content/exercises/preposiciones.json |  | TRAD-COV en ROJO por diseño al cierre de 46-03: 0/96 traducciones validated (95 missing, 1 pending). Lo cierra el plan 46-04 autorando y validando las 95 que faltan. | fixed |  | 2026-08-13T19:02:40.435Z | 2026-08-13T21:53:07.145Z |
| 20 | 46 | deviation | content/exercises/preposiciones.json |  | OBSERVACION para las Phases 47-53 (decision del autor 2026-08-13: se dejan): 16 de las 96 variantes con traduccion llevan en el prompt una glosa espanola de frase completa (en espanol: '...') que coincide palabra por palabra con la traduccion, asi que el espanol sale dos veces en pantalla. El quorum las aprobo por la excepcion E1 de docs/TRANSLATION-VALIDATION-PROMPT.md (si la glosa ES la frase completa, coincidir es traducir bien). Si al usar la app molesta, la palanca es acortar la glosa del prompt, no la traduccion. Derivado del disco; ojo: 14 glosas van entre comillas y 2 no (preposiciones-col#0 y #1) | open |  | 2026-08-13T21:37:01.935Z |  |
| 21 | 46 | unmet-truth | .planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-UI-SPEC.md |  | BACKSTOP E1 long-text ABSTENIDO (decision del autor 2026-08-13, commit 4291c8a): la envoltura multilinea de .session-translation entre la caja de feedback y el CTA NO se puede confirmar porque la premisa no tiene SUJETO en el piloto — la traduccion mas larga (preposiciones-sugli#1, 57 chars = 390 px medidos en Chrome headless sobre el CSS real) cabe en UNA linea a 1400/1100/900/800/700 px de viewport. La prueba sintetica de 165 chars (2 lineas limpias, overflow-wrap normal, max-width none, cero desborde y cero truncado) es PREPARACION, no cierre. El cambio de sitio del 2026-08-13 no lo revierte: mueve el nodo, no alarga el contenido. Se re-prueba en la primera de las Phases 47-53 con frases mas largas. NO es covered aunque el autor aprobara el render | open |  | 2026-08-13T21:53:22.989Z |  |
| 22 | 46 | unmet-truth | .planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-UI-SPEC.md |  | BACKSTOP E2 long-text ABSTENIDO (misma decision del autor, commit 4291c8a): la misma envoltura multilinea dentro de la card de Errores cometidos (.summary-error-translation), medida igual (57 chars = 390 px = 1 linea). Esta superficie NO cambio con la enmienda de D-46-06/08. Ausencia de sujeto, no indulgencia — mismo patron que PRES-05 en el plan 46-04. Se arrastra a las Phases 47-53 | open |  | 2026-08-13T21:53:23.054Z |  |
| 23 | 46 | unmet-truth | content/exercises/preposiciones.json |  | BACKSTOP TRAD-01/encoding ABSTENIDO en su mitad HUMANA: la lectura de muestra de 3-4 slots completos (punto 7 del checkpoint del plan 46-05) no se realizo. Su autoridad mecanica es el quorum cross-vendor y ESA mitad paso (96/96 validated, 2 by distintos: deepseek-chat + gemini-3.5-flash-lite). El Perfecto del autor del 2026-08-13 fue sobre los 4 puntos de render (REND-01..05), no sobre una lectura de muestra. Un backstop sin evidencia se abstiene, nunca pasa en silencio | open |  | 2026-08-13T21:53:23.119Z |  |
| 24 | 46 | deviation | src/main.js | 74 | NOTA DE UAT para las Phases 47-53 (nos costo una ronda de diagnostico en vivo en el plan 46-05): el contenido se hace fetch UNA SOLA VEZ al arrancar la app. src/main.js:74 (await loadContent en bootstrap, resuelve appDataReady) -> src/screens/app.js:389 (await appDataReady en init, queda en this.content para toda la vida de la pestana). grep fetch( en src/screens/app.js = 0 ocurrencias: startSession NO vuelve a leer el JSON. Consecuencia: empezar un Examen nuevo NO recarga el contenido, asi que una pestana abierta desde antes de editar el JSON sirve contenido viejo y el sintoma se lee como un bug de render que no existe. TODA UAT de contenido empieza recargando la pestana (F5), nunca empezando una sesion nueva | open |  | 2026-08-13T21:53:36.063Z |  |
| 25 | 46 | deviation | tests/screen-translation.test.js |  | HALLAZGO de diseno de gates (plan 46-05): V4 y V9 cuentan literales sobre TODO index.html como texto, COMENTARIOS INCLUIDOS. V4 compara countOf(htmlSrc, /x-html/g) contra readHead(index.html); V9 hace lo propio con los 4 literales de copy contra readPreFase46(index.html). La primera redaccion del comentario del nodo movido nombraba los literales de copy y la directiva de inyeccion de HTML crudo, y los DOS gates se pusieron rojos solos sin mutacion (V4: paso de 9 a 10 usos; V9: el recuento de Continuar cambio, 3 !== 2). Obligo a reescribir la prosa del comentario sin esos tokens. Es la deuda id 14 de la Phase 44 reapareciendo (un comentario que menciona el token que su propio gate cuenta), cazada esta vez POR EL GATE y no por un humano. Dato de diseno para las Phases 47-53, que escribiran 17 tandas de comentarios sobre estas mismas superficies; anotado tambien en 46-UI-SPEC.md seccion DOM Contract | open |  | 2026-08-13T21:53:36.138Z |  |

````json
[
  {
    "id": 1,
    "kind": "unrun-verify",
    "phase": "41",
    "file": "content/exercises/fare-indicativo.json",
    "line": null,
    "description": "Los 4 slots simples estan en validation.status pending: el quorum base Opus+Sonnet (VAL-03, 1 por contexto) y la ronda EXTRA DeepSeek de passato-remoto (D-41-12) siguen sin correr",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-03T18:15:04.396Z",
    "resolved_at": null
  },
  {
    "id": 2,
    "kind": "deviation",
    "phase": "41",
    "file": "content/exercises/fare-indicativo.json",
    "line": null,
    "description": "Distractora facetti (1a persona del passato remoto) sustituye a la blacklisteada faci; riesgo residual de que este atestiguada en alguna variedad dialectal — la ronda DeepSeek de D-41-12 debe mirarla con lupa",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-03T18:15:04.456Z",
    "resolved_at": null
  },
  {
    "id": 3,
    "kind": "unrun-verify",
    "phase": "41",
    "file": "content/exercises/fare-indicativo.json",
    "line": null,
    "description": "Los 4 slots compuestos estan en validation.status pending: el quorum base Opus+Sonnet (VAL-03, 1 por contexto) y la ronda EXTRA DeepSeek del trapassato remoto (D-41-12, con pronunciamiento explicito sobre las 2 variantes con quando) siguen sin correr",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-03T18:34:05.926Z",
    "resolved_at": null
  },
  {
    "id": 4,
    "kind": "deviation",
    "phase": "41",
    "file": "content/exercises/fare-indicativo.json",
    "line": null,
    "description": "Colocacion preverbal de gia en los 12 prompts de trapassato prossimo y futuro anteriore, forzada por la invariante de dos palabras de D-41-10: gramatical y declarada en notes, pero marcada por foco — la pasada de quorum debe confirmarla",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-03T18:34:05.985Z",
    "resolved_at": null
  },
  {
    "id": 5,
    "kind": "deviation",
    "phase": "41",
    "file": "content/exercises/fare-indicativo.json",
    "line": null,
    "description": "Las 3 secuencias essere + fatto usadas como distractora malformada en los compuestos vivos (sono/ero/saro fatto y familia) estan bloqueadas SOLO por el objeto directo del prompt: un segundo vendor debe confirmarlo variante a variante",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-03T18:34:06.046Z",
    "resolved_at": null
  },
  {
    "id": 6,
    "kind": "unrun-verify",
    "phase": "43",
    "file": "content/exercises/fare-cond-imperativo.json",
    "line": null,
    "description": "Los 3 slots quedan en validation.status pending con passes vacio: el quorum base Opus+Sonnet y la ronda EXTRA DeepSeek (D-43-20) corren en pasada TOP-LEVEL posterior, no dentro del executor (D-43-02, VAL-03)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-06T23:51:40.597Z",
    "resolved_at": null
  },
  {
    "id": 7,
    "kind": "unrun-verify",
    "phase": "43",
    "file": "content/exercises/fare-indefiniti.json",
    "line": null,
    "description": "Los 6 slots quedan en validation.status pending con passes vacio: el quorum base Opus+Sonnet y la ronda EXTRA DeepSeek sobre las 7 variantes de participio passato e infinito passato (D-43-20) corren en pasada TOP-LEVEL posterior, no dentro del executor (D-43-02, VAL-03)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-07T00:20:29.978Z",
    "resolved_at": null
  },
  {
    "id": 8,
    "kind": "deviation",
    "phase": "43",
    "file": "content/exercises/fare-indefiniti.json",
    "line": null,
    "description": "BACKSTOP declarado del plan: en la variante temporal de fare-indefiniti-gerundio-passato el gerundio simple facendo queda entre las opciones y lo unico que lo excluye es el adverbial de anterioridad (la sera prima). Es juicio linguistico, no asercion mecanica: el quorum debe pronunciarse explicitamente o abstenerse a human_needed, nunca dar pase silencioso",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-07T00:20:30.038Z",
    "resolved_at": null
  },
  {
    "id": 9,
    "kind": "deviation",
    "phase": "44",
    "file": ".planning/REQUIREMENTS.md",
    "line": null,
    "description": "INT-03 e INT-04 quedan Pending en Traceability: los 3 cruces de 44-02 nacen pending y marcar 'TODAS las variantes validadas' seria un verde que el disco no respalda",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-11T13:53:03.991Z",
    "resolved_at": "2026-08-11T14:45:03.378Z"
  },
  {
    "id": 10,
    "kind": "deviation",
    "phase": "44",
    "file": ".planning/ROADMAP.md",
    "line": 17,
    "description": "§Milestones (lineas 17, 308, 360) corregido por reemplazo de 3 lineas y no por el skill gsd-phase: el skill solo opera sobre secciones de fase y no cubre la entrada de milestone",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-11T13:53:04.059Z",
    "resolved_at": null
  },
  {
    "id": 11,
    "kind": "unrun-verify",
    "phase": "44",
    "file": "content/exercises/fare-indicativo.json",
    "line": null,
    "description": "fare-indicativo-300 y -301 quedan en validation.status pending con passes vacio: el quorum base Opus+Sonnet corre en pasada TOP-LEVEL posterior, no dentro del executor (D-44-11, VAL-03)",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-11T14:18:24.665Z",
    "resolved_at": "2026-08-11T14:45:03.446Z"
  },
  {
    "id": 12,
    "kind": "unrun-verify",
    "phase": "44",
    "file": "content/exercises/fare-indefiniti.json",
    "line": null,
    "description": "fare-indefiniti-300 queda en validation.status pending con passes vacio; G3 (el complemento que excluye dos de los tres modales) es el gate mas delicado de la fase y el quorum top-level debe pronunciarse explicitamente sobre las 3 variantes (D-44-04, D-44-11, VAL-03)",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-11T14:18:24.730Z",
    "resolved_at": "2026-08-11T14:45:03.510Z"
  },
  {
    "id": 13,
    "kind": "deviation",
    "phase": "44",
    "file": "tests/count-arrays-lockstep.test.js",
    "line": null,
    "description": "44-03: el describe del bloque 2 se retituló para que el grep '^ok .*comentada' del verify del plan case (el TAP de Node indenta los sub-tests); desviación de forma, no de fondo",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-12T08:09:57.888Z",
    "resolved_at": null
  },
  {
    "id": 14,
    "kind": "deviation",
    "phase": "44",
    "file": "tests/content-fare-indicativo.test.js",
    "line": null,
    "description": "El comentario puntero mencionaba el token pareceFare y defeteaba el criterio de posicion del TDZ del propio plan; reescrito en prosa sin el token",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-12T08:23:55.767Z",
    "resolved_at": null
  },
  {
    "id": 15,
    "kind": "deviation",
    "phase": "45",
    "file": "scripts/run-validation-271.mjs",
    "line": null,
    "description": "D-45-09: el 271 del nombre del fichero codifica un conteo obsoleto (hoy 250). Deuda ACEPTADA y declarada en la cabecera; rename fuera de alcance por 17 call-sites load-bearing",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-12T21:40:28.548Z",
    "resolved_at": null
  },
  {
    "id": 16,
    "kind": "deviation",
    "phase": "45",
    "file": "tests/requirements-traceability.test.js",
    "line": null,
    "description": "El gate no cruza con ROADMAP.md: un requisito ausente de las DOS mitades de REQUIREMENTS.md sigue sin gate (D-45-15, medido)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-12T22:25:03.976Z",
    "resolved_at": null
  },
  {
    "id": 17,
    "kind": "deviation",
    "phase": "46",
    "file": "tests/requirements-traceability.test.js",
    "line": null,
    "description": "4 subtests pre-existentes en rojo (deuda de la transicion a v2.1): falta el ancla **Coverage: N/N** en REQUIREMENTS.md y la tabla de trazabilidad no tiene filas. Impide exit 0 de la suite; ver deferred-items.md de la fase 46",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-13T13:00:26.706Z",
    "resolved_at": null
  },
  {
    "id": 18,
    "kind": "unrun-verify",
    "phase": "46",
    "file": "scripts/validate-translation-pass.mjs",
    "line": null,
    "description": "El camino HTTP real (callModel/httpPost contra DeepSeek o Gemini) NO se ejecutó en el plan 46-02: los tests cubren dry-run, fail-fast y run() con caller inyectado, pero ninguna llamada de red de verdad. Se cierra al correr el quorum real en el plan 46-04",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-13T13:30:40.095Z",
    "resolved_at": "2026-08-13T19:44:26.378Z"
  },
  {
    "id": 19,
    "kind": "unmet-truth",
    "phase": "46",
    "file": "content/exercises/preposiciones.json",
    "line": null,
    "description": "TRAD-COV en ROJO por diseño al cierre de 46-03: 0/96 traducciones validated (95 missing, 1 pending). Lo cierra el plan 46-04 autorando y validando las 95 que faltan.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-13T19:02:40.435Z",
    "resolved_at": "2026-08-13T21:53:07.145Z"
  },
  {
    "id": 20,
    "kind": "deviation",
    "phase": "46",
    "file": "content/exercises/preposiciones.json",
    "line": null,
    "description": "OBSERVACION para las Phases 47-53 (decision del autor 2026-08-13: se dejan): 16 de las 96 variantes con traduccion llevan en el prompt una glosa espanola de frase completa (en espanol: '...') que coincide palabra por palabra con la traduccion, asi que el espanol sale dos veces en pantalla. El quorum las aprobo por la excepcion E1 de docs/TRANSLATION-VALIDATION-PROMPT.md (si la glosa ES la frase completa, coincidir es traducir bien). Si al usar la app molesta, la palanca es acortar la glosa del prompt, no la traduccion. Derivado del disco; ojo: 14 glosas van entre comillas y 2 no (preposiciones-col#0 y #1)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-13T21:37:01.935Z",
    "resolved_at": null
  },
  {
    "id": 21,
    "kind": "unmet-truth",
    "phase": "46",
    "file": ".planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-UI-SPEC.md",
    "line": null,
    "description": "BACKSTOP E1 long-text ABSTENIDO (decision del autor 2026-08-13, commit 4291c8a): la envoltura multilinea de .session-translation entre la caja de feedback y el CTA NO se puede confirmar porque la premisa no tiene SUJETO en el piloto — la traduccion mas larga (preposiciones-sugli#1, 57 chars = 390 px medidos en Chrome headless sobre el CSS real) cabe en UNA linea a 1400/1100/900/800/700 px de viewport. La prueba sintetica de 165 chars (2 lineas limpias, overflow-wrap normal, max-width none, cero desborde y cero truncado) es PREPARACION, no cierre. El cambio de sitio del 2026-08-13 no lo revierte: mueve el nodo, no alarga el contenido. Se re-prueba en la primera de las Phases 47-53 con frases mas largas. NO es covered aunque el autor aprobara el render",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-13T21:53:22.989Z",
    "resolved_at": null
  },
  {
    "id": 22,
    "kind": "unmet-truth",
    "phase": "46",
    "file": ".planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-UI-SPEC.md",
    "line": null,
    "description": "BACKSTOP E2 long-text ABSTENIDO (misma decision del autor, commit 4291c8a): la misma envoltura multilinea dentro de la card de Errores cometidos (.summary-error-translation), medida igual (57 chars = 390 px = 1 linea). Esta superficie NO cambio con la enmienda de D-46-06/08. Ausencia de sujeto, no indulgencia — mismo patron que PRES-05 en el plan 46-04. Se arrastra a las Phases 47-53",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-13T21:53:23.054Z",
    "resolved_at": null
  },
  {
    "id": 23,
    "kind": "unmet-truth",
    "phase": "46",
    "file": "content/exercises/preposiciones.json",
    "line": null,
    "description": "BACKSTOP TRAD-01/encoding ABSTENIDO en su mitad HUMANA: la lectura de muestra de 3-4 slots completos (punto 7 del checkpoint del plan 46-05) no se realizo. Su autoridad mecanica es el quorum cross-vendor y ESA mitad paso (96/96 validated, 2 by distintos: deepseek-chat + gemini-3.5-flash-lite). El Perfecto del autor del 2026-08-13 fue sobre los 4 puntos de render (REND-01..05), no sobre una lectura de muestra. Un backstop sin evidencia se abstiene, nunca pasa en silencio",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-13T21:53:23.119Z",
    "resolved_at": null
  },
  {
    "id": 24,
    "kind": "deviation",
    "phase": "46",
    "file": "src/main.js",
    "line": 74,
    "description": "NOTA DE UAT para las Phases 47-53 (nos costo una ronda de diagnostico en vivo en el plan 46-05): el contenido se hace fetch UNA SOLA VEZ al arrancar la app. src/main.js:74 (await loadContent en bootstrap, resuelve appDataReady) -> src/screens/app.js:389 (await appDataReady en init, queda en this.content para toda la vida de la pestana). grep fetch( en src/screens/app.js = 0 ocurrencias: startSession NO vuelve a leer el JSON. Consecuencia: empezar un Examen nuevo NO recarga el contenido, asi que una pestana abierta desde antes de editar el JSON sirve contenido viejo y el sintoma se lee como un bug de render que no existe. TODA UAT de contenido empieza recargando la pestana (F5), nunca empezando una sesion nueva",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-13T21:53:36.063Z",
    "resolved_at": null
  },
  {
    "id": 25,
    "kind": "deviation",
    "phase": "46",
    "file": "tests/screen-translation.test.js",
    "line": null,
    "description": "HALLAZGO de diseno de gates (plan 46-05): V4 y V9 cuentan literales sobre TODO index.html como texto, COMENTARIOS INCLUIDOS. V4 compara countOf(htmlSrc, /x-html/g) contra readHead(index.html); V9 hace lo propio con los 4 literales de copy contra readPreFase46(index.html). La primera redaccion del comentario del nodo movido nombraba los literales de copy y la directiva de inyeccion de HTML crudo, y los DOS gates se pusieron rojos solos sin mutacion (V4: paso de 9 a 10 usos; V9: el recuento de Continuar cambio, 3 !== 2). Obligo a reescribir la prosa del comentario sin esos tokens. Es la deuda id 14 de la Phase 44 reapareciendo (un comentario que menciona el token que su propio gate cuenta), cazada esta vez POR EL GATE y no por un humano. Dato de diseno para las Phases 47-53, que escribiran 17 tandas de comentarios sobre estas mismas superficies; anotado tambien en 46-UI-SPEC.md seccion DOM Contract",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-13T21:53:36.138Z",
    "resolved_at": null
  }
]
````
