---
phase: quick-260615-nzi
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/data/storage.js
  - src/data/backup.js
  - src/domain/progress.js
  - src/screens/app.js
  - index.html
  - tests/data-storage.test.js
  - tests/backup.test.js
  - tests/domain-progress.test.js
  - tests/screen-canciones.test.js
autonomous: true
requirements: []
must_haves:
  truths:
    - "Tras migrar un estado v9, el estado resultante es v10 con TODO el progreso preservado byte a byte (categoryProgress, exerciseStats, songProgress, dailyLog, timestamps, inFlightTest)"
    - "Cuando un fallo resetea progreso REAL de una categoría (tenía status hecha/dominada, o racha >0, o algún ejercicio cleared), categoryProgress[catId].vecesFallada sube en 1"
    - "Un fallo sobre una categoría ya a cero (no-hecha, sin racha, sin cleared) NO incrementa vecesFallada; un 2º fallo seguido sobre la misma categoría tampoco recuenta"
    - "El cierre de sesión (applySessionResult) NO recuenta vecesFallada: corre sobre estado ya reseteado por applyImmediateFailure (hadProgress=false), sin doble conteo immediate+session"
    - "Al terminar un playthrough de canción con ≥1 frase fallada, songProgress[songId].vecesFallada sube en 1 exactamente una vez por playthrough; 0 frases falladas → +0"
    - "La tabla de categorías de home muestra 'fallada xN' SOLO si N>0; idem la lista de canciones"
    - "El campo vecesFallada sobrevive el roundtrip export/import del backup"
    - "node --test tests/*.test.js sigue pasando (solo el fallo preexistente ajeno genero-numero 12->13; ningún fallo nuevo)"
  artifacts:
    - path: "src/data/storage.js"
      provides: "migrate9to10 (nominal, preserva todo) + hydrateV10 + CURRENT_SCHEMA_VERSION=10 + blankState v10 + cadena migrate() con eslabón 9->10 y retorno ===10->hydrateV10"
      contains: "migrate9to10"
    - path: "src/domain/progress.js"
      provides: "helper hadProgress(cat) + incremento guardado de vecesFallada en applyImmediateFailure"
      contains: "vecesFallada"
    - path: "src/screens/app.js"
      provides: "incremento de songProgress[songId].vecesFallada en completeSong + vecesFallada expuesto en categoriesForDisplay y songsForDisplay"
      contains: "vecesFallada"
    - path: "index.html"
      provides: "indicador 'fallada xN' (x-show N>0) en filas de categoría y de canción"
      contains: "vecesFallada"
  key_links:
    - from: "src/domain/progress.js applyImmediateFailure"
      to: "categoryProgress[catId].vecesFallada"
      via: "guard hadProgress(prev) antes del reset cascade"
      pattern: "vecesFallada"
    - from: "src/screens/app.js completeSong"
      to: "songProgress[songId].vecesFallada"
      via: "results.some(r => !r.correct)"
      pattern: "vecesFallada"
    - from: "src/data/storage.js migrate()"
      to: "migrate9to10 + hydrateV10"
      via: "cadena schemaVersion 9->10"
      pattern: "schemaVersion === 9"
---

<objective>
Añadir un contador persistente de "veces fallada" (`vecesFallada`, entero) por categoría y por canción, que se incrementa cuando un fallo resetea progreso real. Toca estado persistido en `localStorage` → bump `schemaVersion` 9→10 + migración NOMINAL + `hydrateV10`. Mostrar un indicador discreto "fallada xN" en la tabla de categorías de home y en la lista de canciones, solo si N>0.

Purpose: que el autor vea de un vistazo qué categorías y canciones le cuestan más (cuántas veces ha perdido el progreso en cada una), reforzando el Core Value "que el sistema te obligue a no olvidar".

Output: estado v10 con campos `vecesFallada` lazy-init; lógica de conteo idempotente sin doble conteo; UI con el indicador; tests verdes.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/260615-nzi-contador-de-fallos-por-categor-a-y-canci/260615-nzi-CONTEXT.md
@CLAUDE.md
@.planning/STATE.md

<!-- DECISIONES BLOQUEADAS DEL AUTOR (CONTEXT.md) — canon, no revisar:
  - Categoría: +1 SOLO al perder progreso real (guard hadProgress), dentro de
    applyImmediateFailure (call-site canónico D-54). applySessionResult NO recuenta.
  - Canción: +1 por playthrough con ≥1 frase fallada, UNA vez.
  - Mostrar en home categorías + lista canciones SOLO si N>0.
  - Migración 9→10 NOMINAL (preserva TODO) + hydrateV10; campos vecesFallada
    lazy-init con `?? 0`.
-->

<!-- INTERFACES Y HECHOS VERIFICADOS CONTRA EL CÓDIGO REAL (no inventar; ya
     confirmados por el planner — el executor DEBE re-confirmar antes de editar): -->

<interfaces>
storage.js (src/data/storage.js):
  - CURRENT_SCHEMA_VERSION = 9  (L35) → pasa a 10.
  - blankState() (L68-79): { schemaVersion, exerciseStats:{}, categoryProgress:{},
    dailyLog:{}, songProgress:{}, lastBackupAt:null, firstUsedAt:null }. inFlightTest omitido.
  - migrate() dispatcher (L149-166): cadena `if (s.schemaVersion === N) s = migrateNtoM(s)`
    terminando en `if (s.schemaVersion === 9) return hydrateV9(s)`.
  - migrate8to9 (L850-894) y hydrateV9 (L915-934): PLANTILLA EXACTA del bump.
    NOTA: migrate8to9 es selectivo (resetea 6 categorías). El bump 9→10 NO resetea
    nada — es NOMINAL puro (espejo del patrón de hydrate, preservando todo con
    deep-clone JSON.parse(JSON.stringify(...)) por sub-dict).

backup.js (src/data/backup.js):
  - import desde storage.js (L26) incluye migrate8to9, hydrateV9.
  - CURRENT_SCHEMA_VERSION = 9 (L47) espejo inline → pasa a 10.
  - cadena de migración (L124-134) termina en `if (...===8) migrate8to9; migrated = hydrateV9(migrated)`.

progress.js (src/domain/progress.js):
  - applyImmediateFailure(state, exercise, content, today) (L296-334): ÚNICO punto de
    cascada de fallo de categoría (D-54). Clona categoryProgress, y por cada catId en
    exercise.categoryIds hace: prev = next.categoryProgress[catId] ?? blankCategoryProgress();
    next.categoryProgress[catId] = { ...prev, status:'no-hecha', clearedExerciseIds:[],
    streakDays:0, becameHechaAt:undefined, becameDominadaAt:undefined, lastPracticedDate:today }.
    AQUÍ va el incremento, ANTES del reset, con guard hadProgress(prev).
  - applySessionResult (L69-185), rama FAIL-WINS (L113-121): corre sobre state YA reseteado
    por applyImmediateFailure → hadProgress será false → NO recuenta. (Verificar que NO se
    añade incremento aquí.)
  - blankCategoryProgress() (L344-354): NO incluye vecesFallada (lazy-init con ?? 0; no
    hace falta añadirlo aquí, pero es discrecional — si se añade, debe ser 0).

app.js (src/screens/app.js):
  - Dos call-sites de applyImmediateFailure: L1555 (applyResultToSession, multi-choice/
    word-buttons/match-final) y L1798 (matchPickRight, primer fallo de match, guard
    matchHadFailure). AMBOS delegan en applyImmediateFailure → el incremento de categoría
    se hereda sin tocar app.js para categorías.
  - completeSong() (L2246-2301): ÚNICO punto de cierre del playthrough. Ya computa
    `const status = results.some(r => !r.correct) ? 'fallada' : 'pasada'` (L2252) y escribe
    newState.songProgress[songId] = { status, lastPlayedAt: today } (L2257). AQUÍ va el
    incremento de canción: si results.some(r => !r.correct), vecesFallada = (prev ?? 0)+1.
    completeSong se llama UNA vez al pasar el final (L635); returnToSongList (L2309) limpia
    sub-estado pero NO re-llama completeSong → no hay recuento al reentrar al resumen.
  - categoriesForDisplay getter (L2727-2762): mapea content.categories → filas. progress =
    this.state.categoryProgress?.[cat.id]. Añadir vecesFallada: progress?.vecesFallada ?? 0.
  - songsForDisplay getter (L2780-2793): mapea songsById → filas. status =
    this.state.songProgress?.[song.id]?.status. Añadir vecesFallada:
    this.state.songProgress?.[song.id]?.vecesFallada ?? 0.

index.html:
  - tabla categorías: <template x-for="cat in categoriesForDisplay"> filas L170-189.
    Columna "Categoría" (td x-text="cat.name" L177) es buen sitio para el indicador inline.
  - lista canciones: <template x-for="song in songsForDisplay"> filas L227-239.
    Columna "Canción" (td x-text="song.title" L234) es buen sitio para el indicador inline.

tests:
  - tests/data-storage.test.js: import line L28 (añadir migrate9to10, hydrateV10);
    bloque migrate8to9 L1121+ como plantilla; helper v8WithSixCategories() L1126 como
    plantilla de fixture.
  - tests/domain-progress.test.js: import L21; bloque applyImmediateFailure L642+ como plantilla.
  - tests/backup.test.js: roundtrip export/import.
  - tests/screen-canciones.test.js: completeSong / songsForDisplay como plantilla.
  - Correr SIEMPRE con glob: `node --test tests/*.test.js` (path desnudo falla en Node 22.20).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Migración nominal 9→10 + hydrateV10 + backup roundtrip</name>
  <files>src/data/storage.js, src/data/backup.js, tests/data-storage.test.js, tests/backup.test.js</files>
  <behavior>
    - migrate9to10(v9) devuelve un estado IDÉNTICO salvo schemaVersion:10; preserva
      categoryProgress, exerciseStats, songProgress, dailyLog, lastBackupAt, firstUsedAt,
      inFlightTest. Incluye los sub-campos `vecesFallada` que ya existieran (el deep-clone
      JSON los conserva).
    - migrate9to10 es puro (no muta el input) e idempotente sobre la shape.
    - hydrateV10(parsed) es espejo de hydrateV9 con versión 10 (type-guards defensivos +
      deep-clone por sub-dict).
    - La cadena migrate() lleva un v8/v9 hasta v10: `if (s.schemaVersion === 9) s =
      migrate9to10(s)` y el retorno final pasa a `if (s.schemaVersion === 10) return hydrateV10(s)`.
    - blankState() devuelve schemaVersion:10.
    - backup: parseBackupFile migra hasta v10 (export del estado actual reimportable sin
      "versión más nueva"); buildBackupWrapper sigue tomando state.schemaVersion. Un state
      con categoryProgress[x].vecesFallada=N y songProgress[y].vecesFallada=M sobrevive el
      roundtrip buildBackupWrapper → JSON.stringify → parseBackupFile con N y M intactos.
  </behavior>
  <action>
    VERIFICAR PRIMERO contra el código: leer storage.js L34-35, L68-79, L149-166, L850-934 y
    backup.js L26, L47, L124-134 para confirmar el patrón exacto del último bump (migrate8to9
    / hydrateV9) antes de tocar nada.

    En src/data/storage.js: (1) cambiar CURRENT_SCHEMA_VERSION de 9 a 10. (2) Añadir
    `export function migrate9to10(v9)` como bump NOMINAL PURO: reconstruye el root literal
    `{ schemaVersion: 10, exerciseStats, categoryProgress, dailyLog, songProgress, lastBackupAt,
    firstUsedAt, inFlightTest }` con el mismo deep-clone defensivo por sub-dict
    (`typeof X === 'object' && X !== null ? JSON.parse(JSON.stringify(X)) : {}`) y los mismos
    type-guards de timestamps (string|null) que hydrateV9. A DIFERENCIA de migrate8to9 NO hace
    `delete` ni poda por prefijo: preserva TODO (no se puede reconstruir el histórico de fallos;
    los campos vecesFallada se lazy-init a 0 al leer/incrementar, no retroactivamente).
    inFlightTest se preserva tal cual (`inFlightTest: v9.inFlightTest`). (3) Añadir
    `export function hydrateV10(parsed)` espejo LITERAL de hydrateV9 con schemaVersion:10.
    (4) En migrate(): añadir `if (s.schemaVersion === 9) s = migrate9to10(s);` tras el eslabón
    8→9, y cambiar la línea de retorno de `if (s.schemaVersion === 9) return hydrateV9(s)` a
    `if (s.schemaVersion === 10) return hydrateV10(s)`. Documentar con docblock el patrón
    "bump nominal que preserva todo, vecesFallada lazy-init" (estilo de los docblocks previos,
    referenciando quick-260615-nzi). hydrateV9 y migrate8to9 se CONSERVAN (eslabones de cadena
    + backward-compat de tests).

    En src/data/backup.js: (1) añadir `migrate9to10, hydrateV10` al import desde storage.js
    (L26). (2) cambiar el CURRENT_SCHEMA_VERSION inline de 9 a 10 (L47) + actualizar su docblock.
    (3) en la cadena (L124-134) añadir `if (migrated.schemaVersion === 9) migrated =
    migrate9to10(migrated);` y cambiar la hidratación final de `hydrateV9` a `hydrateV10`.

    Tests: en tests/data-storage.test.js añadir `migrate9to10, hydrateV10` al import (L28) y un
    bloque `describe('data/storage v10 — migrate9to10 nominal (quick-260615-nzi)')` con tests:
    (a) migrate9to10 bumpea schemaVersion a 10 y deep-equals el v9 salvo la versión (preserva
    las 9 categorías/stats/songProgress, incl. un categoryProgress con vecesFallada y un
    songProgress con vecesFallada — fixture nuevo, NO reusar el reset de v8WithSixCategories);
    (b) migrate9to10 es puro (no muta el input); (c) idempotente sobre la shape (re-ejecutar
    sobre v10 vía hydrate da misma shape); (d) hydrateV10 garantiza shape con sub-dicts
    malformados → {}; (e) cadena end-to-end: un v8 sube a v10 con las 6 ya reseteadas por
    migrate8to9 (cadena completa) y schemaVersion 10. En tests/backup.test.js añadir un test
    de roundtrip: buildBackupWrapper(state v10 con vecesFallada en una categoría y una canción)
    → JSON.stringify → parseBackupFile → assert ok:true, state.schemaVersion 10 y
    state.categoryProgress[cat].vecesFallada / state.songProgress[song].vecesFallada preservados.
    NUNCA pongas fenced code en este action; nombres/firmas arriba bastan.
  </action>
  <verify>
    <automated>node --test tests/data-storage.test.js tests/backup.test.js</automated>
  </verify>
  <done>migrate9to10 + hydrateV10 existen y exportados; CURRENT_SCHEMA_VERSION=10 en storage.js y backup.js; cadena migrate() y cadena de backup terminan en v10; blankState v10; los tests nuevos de migración nominal y de roundtrip pasan; ningún test preexistente de storage/backup se rompe.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Conteo de fallos — categoría (guard hadProgress) + canción (por playthrough)</name>
  <files>src/domain/progress.js, src/screens/app.js, tests/domain-progress.test.js</files>
  <behavior>
    - Helper hadProgress(cat): true sii `cat && (cat.status === 'hecha' || cat.status ===
      'dominada' || (cat.streakDays ?? 0) > 0 || (Array.isArray(cat.clearedExerciseIds) &&
      cat.clearedExerciseIds.length > 0))`. Definido UNA sola vez.
    - applyImmediateFailure: por cada catId, si hadProgress(prev) === true entonces
      next.categoryProgress[catId].vecesFallada = (prev.vecesFallada ?? 0) + 1, y LUEGO se
      aplica el reset existente (el spread del reset debe preservar el vecesFallada ya
      incrementado — no pisarlo con prev). Si hadProgress(prev) === false, vecesFallada se
      preserva tal cual (prev.vecesFallada ?? 0, sin +1).
    - Idempotencia: re-invocar applyImmediateFailure con el mismo ejercicio NO recuenta
      (tras el 1er fallo la categoría está reseteada → hadProgress false).
    - No doble conteo: applyImmediateFailure(fallo) seguido de applySessionResult con el
      mismo fail en answers produce vecesFallada incrementado exactamente UNA vez
      (applySessionResult NO toca vecesFallada).
    - completeSong: si results.some(r => !r.correct) entonces songProgress[songId].vecesFallada
      = (prev?.vecesFallada ?? 0) + 1; si 0 frases falladas, +0. Una vez por playthrough.
  </behavior>
  <action>
    VERIFICAR PRIMERO: leer progress.js L296-334 (applyImmediateFailure), L113-121 (rama
    FAIL-WINS de applySessionResult — confirmar que NO debe tocar vecesFallada), L344-354
    (blankCategoryProgress); y app.js L2246-2301 (completeSong), confirmando que es el único
    cierre de playthrough y que returnToSongList no re-llama completeSong.

    En src/domain/progress.js: añadir el helper privado módulo-level `function hadProgress(cat)`
    con la definición EXACTA de arriba (D del CONTEXT, una sola definición compartida). En
    applyImmediateFailure, dentro del bucle `for (const catId of catIds)`, ANTES de escribir el
    objeto reseteado: capturar `const prev = next.categoryProgress[catId] ?? blankCategoryProgress();`
    (ya existe ese patrón — reutilízalo), calcular `const wasProgress = hadProgress(prev);` y
    `const nextVecesFallada = (prev.vecesFallada ?? 0) + (wasProgress ? 1 : 0);`, y al construir
    el objeto reseteado añadir el campo `vecesFallada: nextVecesFallada` (junto a status/
    clearedExerciseIds/streakDays/becameHechaAt/becameDominadaAt/lastPracticedDate). NO cambies
    nada de la rama FAIL-WINS de applySessionResult (L113-121) ni de su clonado de categoría
    (L110-111): debe seguir SIN tocar vecesFallada — el reset corre sobre estado ya reseteado
    (hadProgress false implícito) y el clon `{ ...prev }` preserva el vecesFallada existente sin
    incrementarlo. Actualiza el docblock de applyImmediateFailure documentando el conteo guardado
    (quick-260615-nzi) y la garantía de cero doble conteo. (Discrecional: puedes añadir
    `vecesFallada: 0` a blankCategoryProgress() por explicitud; si lo haces, no rompas los tests
    que comparan la shape de blankCategoryProgress — verifícalos.)

    En src/screens/app.js > completeSong: tras computar `status` y construir `newState` con el
    clon de songProgress, ANTES (o en la misma asignación que) `newState.songProgress[songId] =
    { status, lastPlayedAt: today }`, leer el contador previo
    `const prevVF = this.state.songProgress?.[songId]?.vecesFallada ?? 0;` y el flag de fallo
    `const huboFallo = results.some(r => !r.correct);` (reutiliza el mismo `results.some(...)`
    que ya alimenta `status` para una sola fuente de verdad). Escribir
    `newState.songProgress[songId] = { status, lastPlayedAt: today, vecesFallada: prevVF +
    (huboFallo ? 1 : 0) };`. Documentar con comentario que es +1 por playthrough con ≥1 frase
    fallada, una sola vez (completeSong se invoca una vez al pasar el final; returnToSongList no
    recuenta).

    Tests: en tests/domain-progress.test.js (import L21 ya trae applyImmediateFailure /
    applySessionResult) añadir un bloque `describe('domain/progress — contador vecesFallada de
    categoría (quick-260615-nzi)')` con: (a) categoría con progreso real (status 'hecha' o racha
    >0 o clearedExerciseIds no vacío) → applyImmediateFailure incrementa vecesFallada a 1 y deja
    el reset (status no-hecha, racha 0, cleared []); (b) categoría a cero (no-hecha, racha 0,
    cleared []) → vecesFallada sigue 0; (c) idempotencia: dos applyImmediateFailure seguidos con
    el mismo ejercicio → vecesFallada 1 (no 2); (d) NO doble conteo: applyImmediateFailure +
    applySessionResult con el mismo fail en answers → vecesFallada exactamente 1 (espejo del
    test de idempotencia integral existente ~L697); (e) cada uno de los 4 disyuntos de
    hadProgress dispara el +1 por separado (status hecha; status dominada; streakDays>0;
    clearedExerciseIds.length>0). Usa el mismo estilo de fixtures de state/exercise/content que
    el bloque applyImmediateFailure existente (L642+). El test de conteo de canción
    (completeSong) va en Task 3 (junto al getter de canciones) para mantener este task en dominio puro.
  </action>
  <verify>
    <automated>node --test tests/domain-progress.test.js</automated>
  </verify>
  <done>hadProgress definido una vez; applyImmediateFailure incrementa vecesFallada solo con progreso real, idempotente, sin doble conteo con applySessionResult; completeSong incrementa songProgress[songId].vecesFallada una vez por playthrough con ≥1 fallo; tests de categoría pasan; ningún test preexistente de progress se rompe.</done>
</task>

<task type="auto">
  <name>Task 3: UI — indicador "fallada xN" en categorías y canciones + test de canción</name>
  <files>src/screens/app.js, index.html, tests/screen-canciones.test.js</files>
  <action>
    VERIFICAR PRIMERO: leer app.js L2727-2762 (categoriesForDisplay) y L2780-2793
    (songsForDisplay), e index.html L170-189 (filas categoría) y L227-239 (filas canción).

    En src/screens/app.js: en el getter `categoriesForDisplay`, en el objeto de fila que se
    devuelve, añadir `vecesFallada: progress?.vecesFallada ?? 0` (progress ya es
    `this.state.categoryProgress?.[cat.id]`). En el getter `songsForDisplay`, dentro del map,
    añadir `vecesFallada: this.state.songProgress?.[song.id]?.vecesFallada ?? 0` al objeto de
    fila (lee defensivo con ?? 0, D-47).

    En index.html: en la fila de categoría (td de "Categoría", x-text="cat.name" ~L177)
    añadir un indicador discreto junto al nombre, visible solo si N>0 — p.ej. un
    `<small x-show="cat.vecesFallada > 0" x-text="\`fallada x${cat.vecesFallada}\`"></small>`
    (Pico CSS: `<small>` ya queda atenuado; usa x-show, NO concatenar en el x-text del nombre,
    para no romper el binding existente). En la fila de canción (td de "Canción",
    x-text="song.title" ~L234) añadir el mismo indicador con `song.vecesFallada`. Mantener el
    estilo discreto del proyecto; reutilizar `<small>`/Pico, sin clases nuevas salvo que haga
    falta. Anti-XSS: el contador es un entero derivado del estado (no del JSON de contenido),
    seguro en x-text.

    Tests: en tests/screen-canciones.test.js añadir un test de completeSong que verifique el
    conteo de canción: simular un playthrough con ≥1 frase fallada en sessionResults
    (results.some(!correct) true) → completeSong escribe songProgress[songId].vecesFallada = 1;
    un playthrough sin fallos → +0 (preserva el previo, 0 si no había). Reusa el harness/factory
    de app existente en ese fichero (mismo patrón con el que ya se prueba completeSong /
    songsForDisplay). Si el harness no permite ejercitar completeSong directamente, prueba el
    getter songsForDisplay con un state que tenga songProgress[id].vecesFallada=N y assert que
    la fila expone vecesFallada:N — y deja el incremento de completeSong cubierto por el assert
    sobre el state resultante. NO inventes APIs: usa exactamente las que existen en el fichero.
  </action>
  <verify>
    <automated>node --test tests/screen-canciones.test.js</automated>
  </verify>
  <done>categoriesForDisplay y songsForDisplay exponen vecesFallada (?? 0); index.html muestra "fallada xN" solo si N>0 en ambas listas con x-show; el test de canción (incremento por playthrough con fallo / +0 sin fallo, o el getter exponiendo vecesFallada) pasa; ningún test preexistente de screen-canciones se rompe.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| backup JSON import → state | El archivo `.json` importado es input no confiable (editable a mano); cruza a `parseBackupFile`. |
| localStorage raw → state | Blob persistido puede estar corrupto/editado; cruza a `loadState`/`migrate`. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-nzi-01 | Tampering | migrate9to10 / hydrateV10 (prototype pollution vía __proto__ own-property en backup importado) | mitigate | Reconstrucción literal del root `{ schemaVersion:10, ... }` + deep-clone `JSON.parse(JSON.stringify(...))` por sub-dict (mismo patrón anti-PP que migrate8to9/hydrateV9 — neutraliza getters y __proto__). |
| T-nzi-02 | Tampering | vecesFallada importado como valor no-entero (string, objeto) | accept | El valor solo se lee con `?? 0` y se renderiza vía x-text (sin eval); un valor no-numérico mostraría texto inocuo y `(x ?? 0) + 1` lo trataría como NaN sin crash de seguridad. Riesgo nulo (single-user, sin backend). |
| T-nzi-03 | Information Disclosure | indicador "fallada xN" en x-text | accept | Contador entero derivado del estado, no del JSON de contenido; sin PII; renderizado con x-text (no x-html). |
</threat_model>

<verification>
- `node --test tests/*.test.js` (GLOB obligatorio, Node 22.20): debe pasar todo salvo el ÚNICO fallo preexistente ajeno (genero-numero 12→13). No introducir fallos nuevos.
- Conteo de tests: el número total de asserts/tests sube (migración nominal + roundtrip + conteo categoría + conteo canción); el único fallo sigue siendo el preexistente.
- Smoke manual opcional (no bloqueante): abrir index.html servido, fallar un ejercicio de una categoría con progreso → la fila muestra "fallada x1"; repetir el fallo seguido → sigue x1; superar y fallar de nuevo → x2.
</verification>

<success_criteria>
- schemaVersion 10 en storage.js y backup.js; migrate9to10 (nominal, preserva todo) + hydrateV10 en la cadena; blankState v10.
- vecesFallada de categoría: +1 solo con hadProgress real, idempotente, sin doble conteo immediate+session; helper hadProgress definido una vez.
- vecesFallada de canción: +1 por playthrough con ≥1 fallo, una vez (completeSong).
- Roundtrip de backup preserva vecesFallada en categoría y canción.
- Indicador "fallada xN" en home (categorías) y lista de canciones, solo si N>0.
- `node --test tests/*.test.js`: solo el fallo preexistente ajeno; cero fallos nuevos.
</success_criteria>

<output>
Create `.planning/quick/260615-nzi-contador-de-fallos-por-categor-a-y-canci/260615-nzi-SUMMARY.md` when done
</output>
