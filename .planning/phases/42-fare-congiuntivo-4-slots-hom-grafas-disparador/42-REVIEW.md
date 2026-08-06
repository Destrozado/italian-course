---
phase: 42-fare-congiuntivo-4-slots-hom-grafas-disparador
reviewed: 2026-08-06T10:23:33Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - content/exercises/fare-congiuntivo.json
  - content/categories.json
  - tests/content-fare-congiuntivo.test.js
  - tests/content-fare-indicativo.test.js
  - tests/exercise-types.test.js
findings:
  critical: 0
  warning: 4
  info: 9
  total: 13
status: issues_found
---

# Phase 42: Code Review Report (tercera pasada, `--all`)

**Reviewed:** 2026-08-06T10:23:33Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Tercera pasada sobre los mismos 5 ficheros. Entrada: 0 BLOCKER / 8 WARNING / 8 INFO de la pasada 2,
con las 8 warnings arregladas en 7 commits (`7c302af` … `984990e`) y las 8 INFO deliberadamente
abiertas, ahora en scope.

Baseline reverificado en local, no leído del informe del fixer:
`node --test tests/*.test.js` → **837 pass / 0 fail**.
`node --test tests/content-fare-congiuntivo.test.js` → **64 pass / 0 fail** (eran 62 antes de los
fixes: los dos tests nuevos son el de `tenseFix` disjunto y el de orders contiguos de
`categories.json`). `VAL_07_STRICT=1 node --test tests/*.test.js` → 1 fail, el gate de los 5 slots
`pending`, por diseño. Árbol de trabajo devuelto limpio y verificado byte a byte contra copia previa.

**El contenido sigue sin defectos.** Las 30 variantes tienen respuesta única y defendible, el
registro de `categories.json` es correcto, ninguna forma de la blacklist entra en `prompt` ni en
`options`, y los cinco slots están en `pending` como corresponde. No he podido sustanciar ningún
BLOCKER, y no manufacturo ninguno.

**Los 8 cierres de warning: 5 limpios, 3 parciales.** Verificados por mutación, no por narrativa —
incluido WR-03, cuya medición el fixer declaró contaminada por un `git checkout --` accidental.

| ID | Veredicto | Evidencia |
|---|---|---|
| WR-01 | **CERRADO con residuo** | `facci`/`farei`/`fatta` en un prompt ahora ponen rojo el bloque 6 (P3-M1/M2/M3). Pero el escaneo es case-sensitive → **WR-10** |
| WR-02 | **CERRADO** | el claim quedó acotado a la variante que el test sí puede afirmar; el gate global vive en el bloque 6 y muerde (P3-M2) |
| WR-03 | **CERRADO** | `TENSE_FIX` se DERIVA de la columna `tenseFix` (`:981`). Una sola fuente de verdad; desincronía estructuralmente imposible. `frame` + `tenseFix` en la misma fila → rojo (P3-V); `how` reordenado → rojo (P3-W) |
| WR-04 | **CERRADO, y el razonamiento del fixer es correcto** | ver abajo |
| WR-05 | **CERRADO** | posiciones intercambiadas → rojo en los DOS ficheros (P3-Q); order duplicado → rojo (P3-R); entrada intercalada → rojo (P3-S) |
| WR-06 | **CERRADO** (pasada 2) | sin cambios |
| WR-07 | **PARCIAL** | la extensión de `BARE_HABITUALS` a las 6 variantes sí muerde (P3-Z). El anclaje por ámbito está sobreajustado a la coma → **WR-11**. La rama `concordancia` no sostiene el invariante → **WR-13** |
| WR-08 | **PARCIAL** | mismo mecanismo, mismo sobreajuste → **WR-11** |
| WR-09 | **PARCIAL** | el rechazo cubre pronombre+conj+pronombre (P3-F/F2 rojas) y no cubre nombre+conj+pronombre ni el correlativo → **WR-12** |

**WR-04 — el juicio del fixer se confirma.** Verificado en node: `JSON.parse('{"__proto__":{...}}')`
crea `__proto__` como own property, `({}).polluted` sigue `undefined` y
`Object.getPrototypeOf(parsed) === Object.prototype` sigue `true`. Es decir: la línea eliminada era
vacua **y** el reemplazo que la pasada 2 proponía lo habría sido por la misma razón. Borrar en vez de
reescribir fue la decisión correcta. Y el gate superviviente (escaneo de claves) **muerde**:
inyectando `{ "__proto__": { "polluted": 1 } }` en `exercises[]` la suite pasa a **44 pass / 20 fail**
e incluye el mensaje `T-42-02: clave peligrosa en el JSON de contenido`.

**Dónde está lo nuevo.** Las 4 warnings de esta pasada están **todas** en el código que los fixes
introdujeron, que es exactamente donde el mandato decía que había más probabilidad de hallazgo. Los
tres cierres parciales comparten un patrón: el fix se escribió contra la mutación concreta de la
pasada 2 y cubre esa forma y solo esa. La mutación de la pasada 2 se pone roja; una variación trivial
de la misma mutación sigue verde.

**Las 8 INFO reproducen las 8.** Ninguna quedó cerrada de rebote por los fixes de warning. Se suma
IN-09, del código nuevo.

## Structural Findings (fallow)

No se aportó bloque `<structural_findings>` en esta invocación.

## Narrative Findings (AI reviewer)

## Critical Issues

Ninguna. Los tres blockers de la pasada 1 siguen cerrados y reverificados en esta pasada:
correferencia 1sg/1sg inyectada en el disparador#0 → **62/2** (P3-T); vuelta a `ogni giorno` en la
variante de contraste → **61/3** (P3-U).

## Warnings

### WR-10 (NUEVA): el escaneo de ausencia sobre `prompt` que introdujo el fix de WR-01 es case-sensitive

**File:** `tests/content-fare-congiuntivo.test.js:736` (`camposDe`), usado en `:738-774`
**Issue:** el fix de WR-01 extendió los tres escaneos de ausencia de `options` a `prompt`, y en
`prompt` compara con `wordish(f).test(texto)` sobre el texto **crudo**. `BLACKLIST` y
`PHASE43_FORMS` están todas en minúscula, y `PARTICIPIO_CONCORDADO` es `/\bfatt[aie]\b/` sin flag
`i`. Resultado: la misma forma pasa o no pasa según su capitalización, y la posición donde una forma
prohibida aparecería de verdad en un prompt es justo la que el gate no ve — **inicio de oración**.

Sustanciado, pares mutación/control sobre el mismo prompt y con el disparador declarado intacto:

| Mutación | Prompt | Resultado |
|---|---|---|
| P3-Y4 | `Bisogna che io ___ i compiti stasera. Non facci altro.` | **63/1** (rojo, D-42-11) |
| P3-Y3 | `Bisogna che io ___ i compiti stasera. Facci attenzione.` | **64/0 — verde** |
| P3-Y5 | `Bisogna che io ___ i compiti stasera. Farei tutto.` | **64/0 — verde** |
| P3-Y6 | `Bisogna che io ___ i compiti stasera. Fatta la torta.` | **64/0 — verde** |

Las tres formas verdes son precisamente las tres que el `notes` declara peligrosas: `Facci` es la
forma corta de 2ª persona con `ci` aglutinado que D-42-11 marca como el calco más probable de la
autoría, `Farei` es casilla declarada de Phase 43 (D-42-16), y `Fatta la torta, ...` es un participio
absoluto — el MAGNET de Phase 43 (D-42-15) en su construcción más natural, que empieza oración por
definición.

Es además una inconsistencia **dentro del mismo fichero**: el escaneo de perífrasis (`:693`) sí
normaliza (`c.toLowerCase().includes(m)`), y el de habituales pelados (`:1036`) también.

**Fix:** normalizar en `prompt`, dejando `option` con igualdad exacta (que es correcta: las opciones
son formas sueltas y en minúscula).
```js
const hit = campo === 'option' ? texto === f : wordish(f).test(texto.toLowerCase());
```
y para el participio, `const PARTICIPIO_CONCORDADO = /\bfatt[aie]\b/i;`.

### WR-11 (NUEVA): `segmentoDelHueco()` está sobreajustado a la coma — sustituye un `includes` inerte por otro que solo ve una forma de la mutación

**File:** `tests/content-fare-congiuntivo.test.js:102`, usado en `:905` (marco de los compuestos),
`:1009` (ancla del disparador) y `:1055-1056` (par pedagógico)
**Issue:** `p.split(/[,;.]/).find((s) => s.includes('___'))`. El comentario que lo precede
(`:79-101`) declara que aproxima «la cláusula que gobierna el hueco» por «el segmento delimitado por
puntuación fuerte». El problema es que la clase de caracteres es `[,;.]` y nada más: **dos cláusulas
distintas coordinadas sin coma, o separadas por dos puntos o por raya, caen en el mismo segmento**, y
una relativa incrustada también. El literal desplazado sigue estando «en la cláusula del hueco» a
ojos del gate.

Las dos mutaciones de la pasada 2 se ponen rojas — y solo esas dos. Sustanciado, controles y
bypasses sobre los mismos dos prompts:

| Mutación | Prompt | Resultado |
|---|---|---|
| P3-G (control) | `Io penso che lui ___ il lavoro, e in questo momento io sono stanco.` | **62/2** rojo |
| P3-A | `Io penso che lui ___ il lavoro e in questo momento io sono stanco.` | **64/0 verde** |
| P3-B | `Io penso che lui ___ il lavoro: in questo momento io sono stanco.` | **64/0 verde** |
| P3-B2 | `Io penso che lui ___ il lavoro — in questo momento io sono stanco.` | **64/0 verde** |
| P3-H (control) | `Mia madre non crede che io ___ i compiti, ieri sera lei dormiva.` | **63/1** rojo |
| P3-C | `Mia madre non crede che io ___ i compiti e ieri sera lei dormiva.` | **64/0 verde** |
| P3-C2 | `Mia madre non crede che io ___ i compiti che lei preparava ieri sera.` | **64/0 verde** |
| P3-C3 | `Mia madre non crede che io ___ i compiti: ieri sera lei dormiva.` | **64/0 verde** |

En P3-A el ancla modifica a `sono stanco` y `facesse` vuelve a ser defendible; en P3-C2 `ieri sera`
modifica a `preparava` dentro de la relativa y el subordinado se queda sin marcador de acción
terminada, así que `faccia` vuelve a ser defendible. Son, literalmente, CR-02 y el defecto de WR-08
reabiertos, con la coma quitada. Quitar una coma es una edición de autoría enteramente plausible: el
italiano no la exige delante de `e`.

**Y el gate falla también en la otra dirección**, rechazando italiano correcto:

| Mutación | Prompt | Resultado |
|---|---|---|
| P3-O | `Io penso che lui, in questo momento, ___ il lavoro.` | **61/3 rojo** |
| P3-O2 | `Mia madre non crede che io ___ i compiti, ieri sera.` | **63/1 rojo** |

P3-O es italiano idiomático e impecable, con el ancla en inciso dentro de la propia cláusula del
hueco, y se pone rojo dos veces (el ancla queda fuera del segmento y además `BLANK_SUBJECT_RE` pierde
la adyacencia `lui ___`). Un gate que rechaza la redacción correcta empuja al autor a redactar para
el test.

**Fix:** el ámbito no se puede aproximar por puntuación. Dos salidas defendibles, y la primera es
suficiente:
1. **Anclar por posición relativa al hueco en vez de por segmento**, que es lo que el mecanismo pide
   de verdad: el literal tiene que estar en la ventana que va del disparador al final del sintagma
   del hueco, sin cruzar un verbo finito ajeno. En la práctica, exigir que el literal aparezca
   **después** del `che`/disparador y que entre el hueco y el literal no haya ni puntuación fuerte ni
   conjunción coordinante:
   ```js
   const CORTES = /[,;.:—]|(?:^|[^\p{L}])(?:e|ed|ma|però|mentre)(?:[^\p{L}]|$)/u;
   const anclaGobiernaElHueco = (p, lit) => {
     const i = p.indexOf('___'), j = p.indexOf(lit);
     if (i < 0 || j < 0) return false;
     const entre = j > i ? p.slice(i + 3, j) : p.slice(j + lit.length, i);
     return !CORTES.test(entre);
   };
   ```
   Sigue siendo una aproximación, pero cierra P3-A/B/B2/C/C3 y no rechaza P3-O.
2. Si se prefiere no complicar el matcher, **declarar en el comentario lo que el gate NO cubre**, y
   bajar el claim: hoy el comentario dice «AMBITO, no presencia» y lo que hay es «mismo segmento
   entre comas», que no es lo mismo. Un gate que promete más de lo que da es peor que uno honesto,
   porque una pasada futura deja de mirar.

### WR-12 (NUEVA): el rechazo de sujeto coordinado no es total — un conjunto `nombre + pronombre` pasa entero

**File:** `tests/content-fare-congiuntivo.test.js:250-251` (`COORD_SUBJECT_RE`), usado en `:571-574`
**Issue:** la regex exige **pronombre** `\s+(e|ed|o|od)\s+` **pronombre** delante del hueco. El
comentario que la precede (`:230-249`) razona el rechazo como categórico —«fallar cerrado es el
comportamiento correcto»— pero el rechazo solo cubre esa forma. Con el primer conjunto nominal, o con
un correlativo, `deriveBlankSubject` se queda con el último pronombre, la persona derivada cuadra con
la tabla y **el gate entero da verde**.

Sustanciado, con los controles de la pasada 2 al lado:

| Mutación | Prompt | Resultado |
|---|---|---|
| P3-F (control) | `Io penso che io e lui ___ il lavoro in questo momento.` | **63/1 rojo** |
| P3-F2 (control) | `Io penso che tu e lui ___ il lavoro in questo momento.` | **63/1 rojo** |
| P3-D | `Io penso che mia madre e lui ___ il lavoro in questo momento.` | **64/0 verde** |
| P3-D2 | `Io penso che sia lei sia lui ___ il lavoro in questo momento.` | **64/0 verde** |

P3-D es el caso caro y el más probable de los dos: el sujeto real es 3ª del plural, así que la key
declarada `faccia` pasa a ser **incorrecta** (tocaría `facciano`), y el prompt lo hace con exactamente
el mismo material léxico que ya usan las 30 variantes — `mia madre`, `il professore`, `il capo`,
`mio fratello` son sujetos de principal de este fichero, así que `Il professore e lui ___` no es una
construcción exótica. Además rompe D-42-05: la unicidad de la respuesta en las homógrafas la da el
pronombre sujeto, y aquí el pronombre miente sobre la persona.

**Fix:** rechazar por la forma del **conector delante del hueco**, no por la categoría de los dos
conjuntos. Basta con exigir que entre el pronombre derivado y el `che`/disparador no haya coordinante
ni correlativo:
```js
const COORD_SUBJECT_RE =
  /(?:^|[^\p{L}])(?:\p{L}+\s+)?(?:e|ed|o|od|né|sia)\s+(?:\p{L}+\s+)?(?:io|tu|lui|lei|noi|voi|loro)(?:\s+non)?\s+___/iu;
```
Con eso P3-D y P3-D2 caen y los controles P3-F/F2 siguen cayendo. Nótese que `io e mia madre ___`
(coordinación con el pronombre en primer lugar) **ya falla cerrado** hoy, porque
`BLANK_SUBJECT_RE` no encuentra pronombre adyacente y `assert.ok(blankSubject)` se pone rojo — ese
lado sí está bien.

### WR-13 (NUEVA): la rama `concordancia` del gate temporal no sostiene el invariante que declara, y no aporta cobertura independiente

**File:** `tests/content-fare-congiuntivo.test.js:1012-1023`, con los literales en `:355-357`
**Issue:** dos defectos en el mismo `else`, y son acumulativos.

**Uno — no comprueba el TIEMPO, que es lo único que la rama existe para comprobar.** Para `k=2,3,4`
los literales declarados (`È necessario`, `controlla`, `sarebbe`) son simplemente los verbos de la
principal; el assert solo exige que aparezcan como palabra. El `notes` del fichero declara como
INVARIANTE congelado que «ninguna de las seis variantes puede quedarse con el TIEMPO sin fijar», y el
gate lo sostiene fuerte para las 3 ancladas y **no lo sostiene** para estas 3. Sustanciado con una
edición coherente de contenido + tabla + léxico, que es exactamente lo que una pasada futura haría
siguiendo las instrucciones del propio comentario de `MAIN_CLAUSE_VERBS` («si un prompt usa un verbo
de principal que no esta aqui […] para que una pasada futura amplie el lexico»):

- **P3-I** — prompt `Prima che (antes de que) loro ___ un errore, il capo controllava tutto.`,
  `tenseFix.lit` → `'controllava'`, `controllava: '3sg'` añadido al léxico → **64 pass / 0 fail**.

Con la principal en pasado, `facessero` (que está en el cuarteto de opciones) pasa a ser la respuesta
estándar y la key declarada `facciano` pasa a ser incorrecta. Es el defecto de CR-01/CR-02 en su
forma pura, y el gate que la fase declara como su guardián lo deja pasar.

**Dos — hoy la rama no cubre nada que no cubra ya otro assert.** Neutralizándola (`true ||
wordish(lit).test(...)`) y volviendo a mutar los tres prompts, los tres siguen rojos por otras vías:

| Mutación (rama neutralizada) | Resultado | Quién la caza |
|---|---|---|
| `k=2` sin `È necessario` | **63/1 rojo** | el test de disparador único (`:521`) y `deriveMainPerson` |
| `k=3` sin `controlla` | **63/1 rojo** | `deriveMainPerson` → `null` → fail-closed (`:596`) |
| `k=4` sin `sarebbe` | **62/2 rojo** | `deriveMainPerson` + `assert.match(/\bsarebbe\b/)` (`:1074`) |

O sea: la rama añade 3 asserts, y su aportación neta de cobertura hoy es cero. La corrección de
WR-07 mejoró de verdad la mitad `ancla` y en la mitad `concordancia` cambió un `includes` inerte por
un `wordish` igual de inerte, con un comentario que afirma lo contrario.

**Fix:** cerrar esto de verdad es una **decisión de contenido**, no un fix de test — hay que decidir
qué tiempos de principal son admisibles por variante. Lo mínimo defendible, y que sí es un fix de
test, es hacer explícito el tiempo:
```js
// El tiempo de la principal es lo que fija el del subordinado. Se declara, no se infiere.
const MAIN_TENSE = { presente: 'presente', condizionale: 'condizionale' };
// tenseFix: { how: 'concordancia', lit: 'controlla', mainTense: 'presente' }
const TIEMPO_ADMISIBLE = ['presente', 'condizionale'];   // NUNCA pasado: reabre el imperfetto
assert.ok(TIEMPO_ADMISIBLE.includes(r.mainTense),
  `CR-01/CR-02: ${TRIGGER_SLOT}#${k} declara principal en ${r.mainTense}, que deja el TIEMPO sin fijar`);
```
Y, para que el `mainTense` declarado no sea otra columna que nadie cruza contra el JSON, cerrar la
lista de verbos de principal admisibles por tiempo en un mapa `verbo → tiempo` y derivar el tiempo
del prompt igual que `deriveMainPerson` deriva la persona. Mientras eso no exista, el comentario
debería decir que la rama `concordancia` es declarativa y que el invariante del `notes` se sostiene
para 3 de 6.

## Info

### IN-01: `CANON` duplica verbatim los cuatro paradigmas

**REPRODUCE** — sin cambios.
**File:** `tests/content-fare-congiuntivo.test.js:111-117` vs `:128-131`
**Issue:** las cuatro filas del paradigma de `CANON` siguen siendo copias literales de `CONG_PRES`,
`CONG_IMPF`, `CONG_PASS` y `CONG_TRAP`, declaradas 17 líneas más abajo. Editar una copia y no la otra
desincroniza la especificación en silencio: el bloque 2 compararía contra una tabla y los bloques 7-9
contra otra.
**Fix:** `const CANON = { 'fare-congiuntivo-presente': CONG_PRES, ... }`, moviendo las cuatro
constantes por encima y dejando solo la fila del disparador como literal.

### IN-02: la «RED de seguridad» de indicativo compuesto no puede fallar de forma independiente

**REPRODUCE** — sin cambios.
**File:** `tests/content-fare-congiuntivo.test.js:883-891`
**Issue:** el test anterior (`:867-881`) fija las 3 distractoras a un conjunto CERRADO por igualdad
exacta ordenada. La intersección de `IND_COMPOUND` con ese universo cerrado es vacía, así que si el
test de conjunto cerrado pasa, este no puede fallar nunca.
**Fix:** ninguna acción obligatoria; si se conserva, documentar en el comentario que es redundante
por construcción y no un gate independiente.

### IN-03: el `expected` dinámico hace tautológica la aserción de conteo

**REPRODUCE** — sin cambios.
**File:** `tests/exercise-types.test.js:1295` y `:1323-1329`
**Issue:** `expected: slotCountOf('content/exercises/fare-congiuntivo.json')` y
`data = JSON.parse(readFileSync(path))` resuelven a **la misma ruta** y leen en el mismo momento de
evaluación del módulo, así que `assert.equal(data.exercises.length, expected)` es una identidad. La
forma pedida por la fase (derivado, no mágico) se cumple; lo que se pierde es el gate de conteo. El
resto del describe (explanation no vacía, smart quotes, markdown, R1, R2) sí es cobertura real y sí
se aplica al fichero nuevo.
**Fix:** el número de slots ya vive en `tests/content-fare-congiuntivo.test.js:391-396` (`5 x 6 = 30`);
dejarlo ahí y comentar la vacuidad aquí.

### IN-04: `slot-variants-integration.test.js` sigue ciego a la categoría nueva

**REPRODUCE** — reverificado.
**File:** `tests/fixtures/slot-variants-integration.test.js:168-185`
**Issue:** `REAL_CATEGORIES` sigue terminando en `riflessivi`; ni `fare-indicativo` ni
`fare-congiuntivo` están. Además el fichero vive en `tests/fixtures/`, así que el glob
`node --test tests/*.test.js` no lo ejecuta (confirmado: los 24 ficheros del glob no lo incluyen). El
`notes` declara este count-sync diferido a Phase 44 / INT-02 y advierte que el efecto es «ciego, no
rojo», que es peor que un rojo.
**Fix:** ninguna en esta fase (diferido por decisión). En Phase 44, añadir las 2 categorías de `fare`
y mover el fichero al glob o documentar su comando de ejecución.

### IN-05: no se comprueba que cada prompt tenga EXACTAMENTE un hueco

**REPRODUCE** — reconfirmado por mutación.
**File:** `tests/content-fare-congiuntivo.test.js:516-519`
**Issue:** el test usa `v.prompt.includes('___')`. Mutación **P3-J**
(`"Bisogna che io ___ i compiti ___ stasera."`) → **64 pass / 0 fail**. Un prompt con dos huecos
rompería el render, porque el motor sustituye un único hueco. Nota colateral: `segmentoDelHueco`
también asume un hueco — con dos, `find` se queda con el primer segmento y el gate de ámbito de
WR-11 mira la cláusula equivocada.
**Fix:** `assert.equal(v.prompt.split('___').length - 1, 1, ...)`.

### IN-06: la dosificación D-42-14 solo se comprueba en negativo

**REPRODUCE** — reconfirmado por mutación.
**File:** `tests/content-fare-congiuntivo.test.js:1194-1205`
**Issue:** el test verifica que el disparador DESARROLLE la interferencia y que los compuestos NO la
repitan, pero no el tercer tramo de la decisión: que presente e imperfetto lleven la línea de
recordatorio. Mutación **P3-X** (línea `penso che pide subjuntivo…` borrada de las explanations de
los dos slots simples) → **64 pass / 0 fail**. Hoy el contenido es correcto; falta el gate.
**Fix:**
```js
for (const id of SIMPLE_SLOTS) {
  assert.match(byId(id).explanation, /penso che pide subjuntivo/,
    `D-42-14: ${id} debe llevar la linea de recordatorio de interferencia`);
}
```

### IN-07: el SCOPE-GATE del objeto solo comprueba presencia, no exclusividad

**REPRODUCE** — reconfirmado por mutación.
**File:** `tests/content-fare-congiuntivo.test.js:699-709`, línea `:705`
**Issue:** `if (!v.prompt.includes(obj))`. Verifica que el objeto declarado esté, no que sea el
único. Mutación **P3-K** (`"Bisogna che io ___ i compiti e una torta stasera."`) → **64 pass / 0
fail**, pese a que el prompt pasa a tener dos objetos.
**Fix:** contar cuántos objetos del conjunto cerrado aparecen y exigir exactamente 1.

### IN-08: el gate de 0-gloss del verbo solo escanea paréntesis

**REPRODUCE** — reconfirmado por mutación.
**File:** `tests/content-fare-congiuntivo.test.js:648-681`
**Issue:** los dos tests que acotan el gloss iteran `v.prompt.matchAll(/\(([^)]*)\)/g)`. Un gloss del
VERBO en corchetes, en comillas o tras coma no lo ve ninguno; el `/espa/i` de `:650` solo caza la
palabra «español». Mutación **P3-L** (`"Bisogna che io ___ [haga] i compiti stasera."`) →
**64 pass / 0 fail**. Riesgo bajo — el canon R7 del proyecto usa siempre paréntesis — pero el
comentario declara «0-gloss del VERBO: PROHIBIDO y absoluto» (`:638-640`) y lo que cubre es
«prohibido entre paréntesis».
**Fix:** añadir un escaneo por palabra de un set corto de formas castellanas de `hacer`
(`haga`, `hagas`, `hiciera`, `hicieras`, `haces`, `hace`, `hacía`…) sobre los 30 prompts.

### IN-09 (NUEVA): tres asserts nuevos comparan la tabla consigo misma y no pueden fallar por ningún cambio del JSON

**File:** `tests/content-fare-congiuntivo.test.js:991-996` (declaración de `tenseFix`),
`:1000-1003` (`PRESENT_DEICTICS.includes(lit)`) y `:1116-1131` (bloque 10, conteos y disyunción)
**Issue:** los cuatro sujetos de estas aserciones —`TENSE_FIX`, `PRESENT_DEICTICS`, `VARIANT_TABLE`,
`COMPOUND_SLOTS`— son constantes del propio fichero de test. Ninguna lee `CONTENT`. Es la misma forma
que hacía inerte al gate de CR-03 antes de su fix, aunque aquí el propósito es distinto y legítimo:
proteger la tabla de una edición futura incoherente (P3-V y P3-W lo confirman: editando la tabla se
ponen rojas). No es un defecto, pero conviene que el comentario lo diga, porque leídas en el
contexto de un bloque cuyo tema es «el JSON cumple X» se leen como cobertura de contenido y no lo
son.
**Fix:** una línea de comentario por assert: «self-check de VARIANT_TABLE; no lee el JSON».

## Hallazgos previos que NO reproducen (cerrados)

- **CR-01, CR-02, CR-03** — cerrados. Reverificados en esta pasada (P3-T, P3-U).
- **WR-01** — cerrado. Los tres escaneos recorren `prompt` y `options` y muerden (P3-M1/M2/M3).
  Queda el residuo de capitalización, registrado como **WR-10**, no como reapertura.
- **WR-02** — cerrado. El claim del assert quedó acotado a lo que ese test puede afirmar y el gate
  global vive en el bloque 6.
- **WR-03** — cerrado y verificado **sobre el fichero actual**, no sobre la narrativa del fixer:
  `TENSE_FIX` (`:981`) se deriva de la columna `tenseFix` de `VARIANT_TABLE`; no existe ya una
  segunda tabla. La desincronía que motivaba la warning es estructuralmente imposible, y los dos
  asserts simétricos del bloque 10 muerden (P3-V: **62/2**; P3-W: **63/1**).
- **WR-04** — cerrado, y el razonamiento del fixer verificado como correcto en los dos puntos: la
  línea borrada era vacua y el reemplazo propuesto lo habría sido igual. El gate superviviente muerde
  (**44/20**).
- **WR-05** — cerrado en los dos ficheros, más el invariante global de `categories.json` que nadie
  cubría (P3-Q, P3-R, P3-S: **123/3** las tres).
- **WR-06** — cerrado en la pasada 2, sin cambios.
- **WR-07, WR-08, WR-09** — **parcialmente** cerrados. La forma exacta que la pasada 2 mutó se pone
  roja en las tres; una variación trivial de la misma mutación sigue verde. No se declaran cerradas:
  quedan vivas bajo **WR-11**, **WR-12** y **WR-13**.

---

_Reviewed: 2026-08-06T10:23:33Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
_Mutaciones ejecutadas: 30 (P3-A .. P3-Z6), sobre `content/exercises/fare-congiuntivo.json`,_
_`content/categories.json` y `tests/content-fare-congiuntivo.test.js`. Árbol de trabajo revertido y_
_verificado byte a byte contra copia previa; `git status --porcelain` vacío y_
_`node --test tests/*.test.js` → 837 pass / 0 fail tras la revisión._
