---
schema_version: 1
open_count: 28
waived_count: 0
fixed_count: 6
total_count: 34
last_updated: 2026-08-14T12:07:48.227Z
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
| 26 | 46 | deviation | scripts/validate-translation-pass.mjs |  | IN-01 (code review fase 46, NO arreglado — fuera del alcance critical+warning): 14 de los 20 exports del script no tienen ningun consumidor. Lo que importa no es la superficie muerta sino que locateVariantTranslation y childObjectRanges — el corazon del re-estrechado (invariante 8) — solo se prueban INDIRECTAMENTE via applyPassToText. Darles cobertura directa vale mas que quitarles el export. Mitigado en parte por la post-condicion de CR-02, que ahora verifica cero contaminacion en CADA escritura. | open |  | 2026-08-13T22:49:05.172Z |  |
| 27 | 46 | deviation | scripts/validate-translation-pass.mjs |  | IN-02 (code review fase 46, NO arreglado): tres asperezas del bucle de run(). (1) el wait de rate-limit se calcula antes del break por fallback, valor muerto. (2) la guarda es 'if (r.text)': una respuesta con contenido vacio ('' es falsy, y es justo lo que produce el \|\| '' del provider deepseek) cae al fondo del bucle e imprime '[modelo] error: undefined' — diagnostico enganoso; el arreglo es 'typeof r.text === string' y tratar la cadena vacia como 'sin bloque JSON valido', que ya tiene su reintento. (3) --temp=abc da NaN y JSON.stringify lo serializa como temperature: null. | open |  | 2026-08-13T22:49:05.241Z |  |
| 28 | 46 | deviation | scripts/validate-translation-pass.mjs |  | IN-03 (code review fase 46, NO arreglado): loadEnv hace split('\\n') y conserva el \\r final si .env tiene finales de linea CRLF; una clave con \\r la rechaza la validacion de cabeceras HTTP de Node (ERR_INVALID_CHAR), asi que falla RUIDOSAMENTE, no en silencio. El bloque es verbatim de scripts/validate-song-pass.mjs:75-84, asi que el arreglo (split(/\\r?\\n/) o trim sobre m[2]) le conviene a los DOS scripts. Este repo tiene .planning/WINDOWS.md por algo. No se leyo .env. | open |  | 2026-08-13T22:49:05.309Z |  |
| 29 | 46 | deviation | scripts/validate-translation-pass.mjs |  | IN-04 (code review fase 46, NO arreglado): composePrompt envuelve JSON.stringify en una valla ```json y JSON.stringify no escapa los backticks, asi que un text o un prompt con ``` partiria la valla y dejaria parte del payload fuera del bloque de datos. Riesgo bajo y contenido (el §6 ordena tratar todo el payload como datos, y extractJsonBlock toma el ULTIMO bloque, que es el del evaluador). Ninguna de las 96 traducciones actuales lleva backticks. Arreglo: valla mas larga o rechazar ``` en buildDataBlock. | open |  | 2026-08-13T22:49:05.377Z |  |
| 30 | 46 | unrun-verify | index.html |  | WR-05 (code review fase 46): la mecanica de x-show NO se pudo verificar en un DOM real. Alpine se sirve por CDN (index.html:32), el proyecto es zero-deps (sin package.json, sin jsdom) y las llamadas de red estaban prohibidas en la sesion de arreglo. El REGISTRO ya se corrigio por escrito (D-46-06 enmendada 2026-08-14 + comentario del nodo): el doble guard da INVISIBILIDAD, no ausencia del DOM. Lo verificado en disco: el nodo usa x-show y no la directiva x-if sobre template; la explanation usa la misma mecanica (:613); :547 es el precedente de presencia estructural. Queda abierta la observacion en un navegador de verdad. | open |  | 2026-08-13T22:49:05.443Z |  |
| 31 | 46 | deviation | tests/count-arrays-lockstep.test.js |  | T-46-14 CERRADO el 2026-08-14 por el gate de seguridad de la fase (bloque 9, commit 632a190) — la leccion es la que queda abierta a la lectura: la mitigacion estaba declarada en DOS mitades en el <threat_model> (veredicto por igualdad de enteros + asercion de fuente sobre la region del sub-gate), solo se implemento la primera, y 46-03-SUMMARY.md afirmo las dos como verificadas. grep de toFixed/Math.round/0.99 sobre tests/ devolvia CERO. Se detecto POR MUTACION: con .length === 0 debilitado a >= 0 la suite se quedo en su baseline exacta (1329/1325/4) y el reporter en exit 0. Fila RETRACTADA por escrito, no reescrita. Regla que deriva: una mitigacion con DOS mitades en el plan necesita DOS verificaciones nombradas por separado, y la forma que se cuela (=== debilitado a >=) puede no ser la que el registro nombra (aritmetica de ratio) — cada una exige su propia asercion y su propia mutacion. M-1/M-2/M-3 ejecutadas con rojo observado, exit 1 las tres. | fixed |  | 2026-08-14T07:09:01.649Z | 2026-08-14T07:09:04.617Z |
| 32 | 47 | deviation | .planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-CONTEXT.md |  | DEUDA ACEPTADA por decisión del AUTOR el 2026-08-14 (checkpoint:decision bloqueante del plan 47-01, Task 3: opcion-b). Las 96 traducciones de content/exercises/preposiciones.json siguen certificadas como validated bajo los criterios PRE-enmienda de docs/TRANSLATION-VALIDATION-PROMPT.md: NO se re-validaron tras añadir la excepción estructural del prompt metalingüístico (commit dc661e0). D-46-12 queda ENMENDADA por escrito, con fecha y firma, en 46-CONTEXT.md — no erosionada en silencio. Por qué se juzga seguro, con las dos condiciones derivadas del disco: (1) AUSENCIA DE SUJETO — buscando ancho (flecha -> => y etiquetas gramaticales españolas en options), 0 de 96 variantes mc de preposiciones y 0 de 62 de articoli llevan la anatomía metalingüística; las 5 únicas del bloque están en partitivos-clasificacion y se validaron con el doc YA amendado. (2) DIRECCIONALIDAD ABSOLUTORIA — las tres viñetas de la excepción retiran motivos-para-marcar o reiteran criterios vigentes, y ninguna añade uno nuevo; quitar elementos de un conjunto vacío lo deja vacío, así que ninguna correcta puede pasar a incorrecta. Corroborado (no demostrado) por partitivos-clasificacion#0: deepseek-chat pasó de incorrecta a correcta sin cambiar un carácter del text y sin override. QUÉ FORZARÍA UNA RE-VALIDACIÓN DE VERDAD: (a) una enmienda futura del doc que SÍ tenga sujeto en preposiciones, (b) cualquier enmienda que ENDUREZCA en vez de absolver — reconocible porque introduce un imperativo del tipo 'marca como incorrecta si...' o 'exige que...', (c) que aparezcan prompts metalingüísticos en preposiciones. En cualquiera de los tres casos se vuelve al cumplimiento literal de D-46-12 y se re-validan las 96 | open |  | 2026-08-14T12:07:27.453Z |  |
| 33 | 47 | deviation | scripts/validate-translation-pass.mjs |  | HALLAZGO OPERATIVO (plan 47-01, reusable en las Phases 48-53): verificar un modelo LISTÁNDOLO contra el proveedor es NECESARIO pero NO SUFICIENTE. gemini-2.5-flash-lite aparece VIVO en el listado /v1beta/models de Gemini y sin embargo devuelve HTTP 404 al invocarlo ('no longer available to new users'): está listado y no es invocable con esta clave. El paso 5 del Task 1 del plan manda verificar la cola de fallbacks contra el listado ANTES de gastar llamadas — hacerlo NO garantiza que la cola funcione, solo descarta los modelos ya retirados del listado. La red de seguridad que sí funcionó fue el auto-fallback del script, que aterrizó en gemini-3.5-flash-lite, y el campo by, que registra el modelo que DE VERDAD respondió y no el pinneado: por eso un auto-fallback queda visible en el corpus en lugar de disimulado (T-47-05). Regla que deriva: pinnear un modelo es una preferencia, no una garantía; el único registro fiable de quién validó es el by escrito por el script, y jamás se edita a mano para que quede limpio | open |  | 2026-08-14T12:07:37.515Z |  |
| 34 | 47 | deviation | content/exercises/partitivos.json |  | DECLARACIÓN DE NATURALEZA DEL QUÓRUM (plan 47-01, aplica a todas las traducciones de las Phases 47-53): las 5 variantes de partitivos-clasificacion se validaron con el quórum CROSS-VENDOR POR SCRIPT (deepseek-chat + gemini-3.5-flash-lite vía scripts/validate-translation-pass.mjs), que es lo que D-46-13 establece para la validación de TRADUCCIONES. NO es el quórum canónico Opus+Sonnet por Task subagent de VAL-03: un gsd-executor es él mismo un subagent y no puede spawnear los Task subagents que VAL-03 exige, así que ese camino solo existe en una pasada TOP-LEVEL posterior. Cumple la barra estructural (2 by DISTINTOS, de dos vendors distintos, deriveStatus como fuente única, cero overrides de autor) y por eso el status derivado validated es legítimo. Se declara como lo que es y NUNCA se escribe como canónico: mismo patrón ya registrado en las ids 6, 7, 11 y 12 de este ledger para el quórum de EJERCICIOS. Diferencia importante que no hay que confundir: para traducciones el quórum por script no es un sucedáneo sino el mecanismo DECIDIDO (D-46-13), porque DeepSeek es el estricto en acentos y S4/RAE es el criterio que más pesa aquí | open |  | 2026-08-14T12:07:48.227Z |  |

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
  },
  {
    "id": 26,
    "kind": "deviation",
    "phase": "46",
    "file": "scripts/validate-translation-pass.mjs",
    "line": null,
    "description": "IN-01 (code review fase 46, NO arreglado — fuera del alcance critical+warning): 14 de los 20 exports del script no tienen ningun consumidor. Lo que importa no es la superficie muerta sino que locateVariantTranslation y childObjectRanges — el corazon del re-estrechado (invariante 8) — solo se prueban INDIRECTAMENTE via applyPassToText. Darles cobertura directa vale mas que quitarles el export. Mitigado en parte por la post-condicion de CR-02, que ahora verifica cero contaminacion en CADA escritura.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-13T22:49:05.172Z",
    "resolved_at": null
  },
  {
    "id": 27,
    "kind": "deviation",
    "phase": "46",
    "file": "scripts/validate-translation-pass.mjs",
    "line": null,
    "description": "IN-02 (code review fase 46, NO arreglado): tres asperezas del bucle de run(). (1) el wait de rate-limit se calcula antes del break por fallback, valor muerto. (2) la guarda es 'if (r.text)': una respuesta con contenido vacio ('' es falsy, y es justo lo que produce el || '' del provider deepseek) cae al fondo del bucle e imprime '[modelo] error: undefined' — diagnostico enganoso; el arreglo es 'typeof r.text === string' y tratar la cadena vacia como 'sin bloque JSON valido', que ya tiene su reintento. (3) --temp=abc da NaN y JSON.stringify lo serializa como temperature: null.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-13T22:49:05.241Z",
    "resolved_at": null
  },
  {
    "id": 28,
    "kind": "deviation",
    "phase": "46",
    "file": "scripts/validate-translation-pass.mjs",
    "line": null,
    "description": "IN-03 (code review fase 46, NO arreglado): loadEnv hace split('\\n') y conserva el \\r final si .env tiene finales de linea CRLF; una clave con \\r la rechaza la validacion de cabeceras HTTP de Node (ERR_INVALID_CHAR), asi que falla RUIDOSAMENTE, no en silencio. El bloque es verbatim de scripts/validate-song-pass.mjs:75-84, asi que el arreglo (split(/\\r?\\n/) o trim sobre m[2]) le conviene a los DOS scripts. Este repo tiene .planning/WINDOWS.md por algo. No se leyo .env.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-13T22:49:05.309Z",
    "resolved_at": null
  },
  {
    "id": 29,
    "kind": "deviation",
    "phase": "46",
    "file": "scripts/validate-translation-pass.mjs",
    "line": null,
    "description": "IN-04 (code review fase 46, NO arreglado): composePrompt envuelve JSON.stringify en una valla ```json y JSON.stringify no escapa los backticks, asi que un text o un prompt con ``` partiria la valla y dejaria parte del payload fuera del bloque de datos. Riesgo bajo y contenido (el §6 ordena tratar todo el payload como datos, y extractJsonBlock toma el ULTIMO bloque, que es el del evaluador). Ninguna de las 96 traducciones actuales lleva backticks. Arreglo: valla mas larga o rechazar ``` en buildDataBlock.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-13T22:49:05.377Z",
    "resolved_at": null
  },
  {
    "id": 30,
    "kind": "unrun-verify",
    "phase": "46",
    "file": "index.html",
    "line": null,
    "description": "WR-05 (code review fase 46): la mecanica de x-show NO se pudo verificar en un DOM real. Alpine se sirve por CDN (index.html:32), el proyecto es zero-deps (sin package.json, sin jsdom) y las llamadas de red estaban prohibidas en la sesion de arreglo. El REGISTRO ya se corrigio por escrito (D-46-06 enmendada 2026-08-14 + comentario del nodo): el doble guard da INVISIBILIDAD, no ausencia del DOM. Lo verificado en disco: el nodo usa x-show y no la directiva x-if sobre template; la explanation usa la misma mecanica (:613); :547 es el precedente de presencia estructural. Queda abierta la observacion en un navegador de verdad.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-13T22:49:05.443Z",
    "resolved_at": null
  },
  {
    "id": 31,
    "kind": "deviation",
    "phase": "46",
    "file": "tests/count-arrays-lockstep.test.js",
    "line": null,
    "description": "T-46-14 CERRADO el 2026-08-14 por el gate de seguridad de la fase (bloque 9, commit 632a190) — la leccion es la que queda abierta a la lectura: la mitigacion estaba declarada en DOS mitades en el <threat_model> (veredicto por igualdad de enteros + asercion de fuente sobre la region del sub-gate), solo se implemento la primera, y 46-03-SUMMARY.md afirmo las dos como verificadas. grep de toFixed/Math.round/0.99 sobre tests/ devolvia CERO. Se detecto POR MUTACION: con .length === 0 debilitado a >= 0 la suite se quedo en su baseline exacta (1329/1325/4) y el reporter en exit 0. Fila RETRACTADA por escrito, no reescrita. Regla que deriva: una mitigacion con DOS mitades en el plan necesita DOS verificaciones nombradas por separado, y la forma que se cuela (=== debilitado a >=) puede no ser la que el registro nombra (aritmetica de ratio) — cada una exige su propia asercion y su propia mutacion. M-1/M-2/M-3 ejecutadas con rojo observado, exit 1 las tres.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-14T07:09:01.649Z",
    "resolved_at": "2026-08-14T07:09:04.617Z"
  },
  {
    "id": 32,
    "kind": "deviation",
    "phase": "47",
    "file": ".planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-CONTEXT.md",
    "line": null,
    "description": "DEUDA ACEPTADA por decisión del AUTOR el 2026-08-14 (checkpoint:decision bloqueante del plan 47-01, Task 3: opcion-b). Las 96 traducciones de content/exercises/preposiciones.json siguen certificadas como validated bajo los criterios PRE-enmienda de docs/TRANSLATION-VALIDATION-PROMPT.md: NO se re-validaron tras añadir la excepción estructural del prompt metalingüístico (commit dc661e0). D-46-12 queda ENMENDADA por escrito, con fecha y firma, en 46-CONTEXT.md — no erosionada en silencio. Por qué se juzga seguro, con las dos condiciones derivadas del disco: (1) AUSENCIA DE SUJETO — buscando ancho (flecha -> => y etiquetas gramaticales españolas en options), 0 de 96 variantes mc de preposiciones y 0 de 62 de articoli llevan la anatomía metalingüística; las 5 únicas del bloque están en partitivos-clasificacion y se validaron con el doc YA amendado. (2) DIRECCIONALIDAD ABSOLUTORIA — las tres viñetas de la excepción retiran motivos-para-marcar o reiteran criterios vigentes, y ninguna añade uno nuevo; quitar elementos de un conjunto vacío lo deja vacío, así que ninguna correcta puede pasar a incorrecta. Corroborado (no demostrado) por partitivos-clasificacion#0: deepseek-chat pasó de incorrecta a correcta sin cambiar un carácter del text y sin override. QUÉ FORZARÍA UNA RE-VALIDACIÓN DE VERDAD: (a) una enmienda futura del doc que SÍ tenga sujeto en preposiciones, (b) cualquier enmienda que ENDUREZCA en vez de absolver — reconocible porque introduce un imperativo del tipo 'marca como incorrecta si...' o 'exige que...', (c) que aparezcan prompts metalingüísticos en preposiciones. En cualquiera de los tres casos se vuelve al cumplimiento literal de D-46-12 y se re-validan las 96",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-14T12:07:27.453Z",
    "resolved_at": null
  },
  {
    "id": 33,
    "kind": "deviation",
    "phase": "47",
    "file": "scripts/validate-translation-pass.mjs",
    "line": null,
    "description": "HALLAZGO OPERATIVO (plan 47-01, reusable en las Phases 48-53): verificar un modelo LISTÁNDOLO contra el proveedor es NECESARIO pero NO SUFICIENTE. gemini-2.5-flash-lite aparece VIVO en el listado /v1beta/models de Gemini y sin embargo devuelve HTTP 404 al invocarlo ('no longer available to new users'): está listado y no es invocable con esta clave. El paso 5 del Task 1 del plan manda verificar la cola de fallbacks contra el listado ANTES de gastar llamadas — hacerlo NO garantiza que la cola funcione, solo descarta los modelos ya retirados del listado. La red de seguridad que sí funcionó fue el auto-fallback del script, que aterrizó en gemini-3.5-flash-lite, y el campo by, que registra el modelo que DE VERDAD respondió y no el pinneado: por eso un auto-fallback queda visible en el corpus en lugar de disimulado (T-47-05). Regla que deriva: pinnear un modelo es una preferencia, no una garantía; el único registro fiable de quién validó es el by escrito por el script, y jamás se edita a mano para que quede limpio",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-14T12:07:37.515Z",
    "resolved_at": null
  },
  {
    "id": 34,
    "kind": "deviation",
    "phase": "47",
    "file": "content/exercises/partitivos.json",
    "line": null,
    "description": "DECLARACIÓN DE NATURALEZA DEL QUÓRUM (plan 47-01, aplica a todas las traducciones de las Phases 47-53): las 5 variantes de partitivos-clasificacion se validaron con el quórum CROSS-VENDOR POR SCRIPT (deepseek-chat + gemini-3.5-flash-lite vía scripts/validate-translation-pass.mjs), que es lo que D-46-13 establece para la validación de TRADUCCIONES. NO es el quórum canónico Opus+Sonnet por Task subagent de VAL-03: un gsd-executor es él mismo un subagent y no puede spawnear los Task subagents que VAL-03 exige, así que ese camino solo existe en una pasada TOP-LEVEL posterior. Cumple la barra estructural (2 by DISTINTOS, de dos vendors distintos, deriveStatus como fuente única, cero overrides de autor) y por eso el status derivado validated es legítimo. Se declara como lo que es y NUNCA se escribe como canónico: mismo patrón ya registrado en las ids 6, 7, 11 y 12 de este ledger para el quórum de EJERCICIOS. Diferencia importante que no hay que confundir: para traducciones el quórum por script no es un sucedáneo sino el mecanismo DECIDIDO (D-46-13), porque DeepSeek es el estricto en acentos y S4/RAE es el criterio que más pesa aquí",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-14T12:07:48.227Z",
    "resolved_at": null
  }
]
````
