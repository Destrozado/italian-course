---
phase: 44-integraci-n-lockstep-cierre-v2-0
reviewed: 2026-08-11T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - scripts/run-validation-271.mjs
  - tests/count-arrays-lockstep.test.js
  - tests/fixtures/slot-variants-integration.test.js
  - tests/content-fare-indicativo.test.js
  - tests/content-fare-indefiniti.test.js
  - content/exercises/fare-indicativo.json
  - content/exercises/fare-indefiniti.json
findings:
  critical: 2
  warning: 9
  info: 3
  total: 14
status: issues_found
---

# Phase 44: Code Review Report

**Reviewed:** 2026-08-11
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

El enganche de conteo está **correcto en su estado actual** y lo verifiqué de forma independiente, sin fiarme de que la suite esté verde:

- Los dos arrays de conteo tienen exactamente los 18 slugs registrados en `content/categories.json`, sin duplicados ni entradas extra, y en `run-validation-271.mjs` cada `file:` apunta al `content/exercises/<slug>.json` de su propio slug (comprobado slug a slug, sin truncar `fare-ind`).
- Los 9 `expected` literales que quedan coinciden byte a byte con el disco (preposiciones 50, articoli 34, avere 20, essere 26, genero-numero 13, partitivos 19, profesiones 11, sustantivos-irregulares 5, verbos-movimiento 7). Σ disco = 250, que es lo que el reporter emite.
- Integridad del contenido: 250 ids únicos globalmente, cero `options` con miembros duplicados, cero `correctIndex` fuera de rango, y las 3 keys nuevas concuerdan con el sujeto de su frase (`io→ho`, `noi→abbiamo`, `loro→hanno`; `noi→ripassiamo`, `lui→commette`, `voi→controllate`; `io→devo`, `tu→puoi`, `noi→vogliamo`).
- La re-focalización de `CONJUGATE` en `content-fare-indefiniti.test.js` (excluir los `-300`+ ajenos) **sí** está compensada de verdad por el sub-gate `CRUCES_AJENOS`, que examina palabra a palabra lo excluido. No es una relajación.

Dicho eso, la fase tiene dos defectos de la clase exacta que existe para erradicar —un gate verde sobre un número falso, y un gate que mide la cláusula equivocada— más nueve puntos donde la barra baja sin contrapartida o donde la prosa del fichero afirma cosas que el código desmiente. Ninguno de los dos BLOCKER se ve corriendo la suite: los dos son verdes hoy.

Fuera de alcance, según lo pedido: calidad pedagógica del italiano/castellano y las discrepancias históricas de `genero-numero`/`preposiciones`.

## Critical Issues

### CR-01: El `notes` de `fare-indefiniti` quedó factualmente falso, y un gate congela el conteo obsoleto

**File:** `content/exercises/fare-indefiniti.json:1` (campo `notes`, párrafo de cabecera) + `tests/content-fare-indefiniti.test.js:1054-1058`

**Issue:** Phase 44 añadió `fare-indefiniti-300` **apendando** prosa al final del `notes` sin corregir la cabecera, que sigue diciendo lo contrario del disco. Estas frases son hoy falsas:

1. `"Ningún id de este fichero usa el espacio de sufijos numéricos de tres cifras: fare-indefiniti-300 y siguientes quedan libres para los cruces multi-categoría de Phase 44, y no se pre-crean ni se reservan con placeholder, simplemente no se usan."` — el slot que la propia fase añade es `fare-indefiniti-300`. **No hay retractación en ninguna parte del campo**, a diferencia de `fare-indicativo.json`, que sí escribe su `CORRECCIÓN DEL QUÓRUM TOP-LEVEL`. Un re-pase que lea la cabecera concluirá que el cruce es un error y lo borrará.
2. `"Son 6 slots y 18 variantes"` → disco: 7 slots y 21 variantes.
3. `"Los 6 slots llevan categoryIds con exactamente un id"` y `"categoryIds de exactamente uno en los 6 slots"` → el cruce lleva 2.
4. `"CERO MATCH y CERO WORD-BUTTONS en los 6 slots"` y `"Los 6 slots nacen con status pending"` → describen 6 de 7 sin decirlo.

Y lo grave: el knock-on aritmético `"con esta categoría y con fare-cond-imperativo el milestone queda en 22 slots y 113 variantes, y TOTAL_EXPECTED pasa de 225 a 247"` es ahora falso en los tres números (disco: **25 slots** de `fare`, **122 variantes**, **TOTAL_EXPECTED = 250**), y el gate de la línea 1054 **asserta que esos números sigan escritos**:

```js
test('EN POSITIVO: el notes declara el knock-on aritmetico que Phase 44 / INT-02 necesita', () => {
  for (const n of ['22 slots', '113', '247']) {
    assert.ok(CONTENT.notes.includes(n), `INT-02: el notes no declara "${n}"`);
  }
});
```

Es decir: la suite está verde **certificando** un TOTAL_EXPECTED de 247 mientras el reporter imprime 250, y el gate impide activamente corregirlo. Es la misma patología que la fase existe para erradicar (`225/225 PASS` sobre un conteo ciego), sólo que ahora con un test firmándola.

**Fix:** corregir la cabecera del `notes` (7 slots / 21 variantes, `categoryIds` de 1 salvo el cruce, y reescribir el párrafo del espacio `-300` para que declare que Phase 44 lo aterriza) y derivar el knock-on del disco en vez de congelar literales:

```js
test('EN POSITIVO: el notes declara el knock-on aritmetico que INT-02 necesita, con los numeros del DISCO', () => {
  const files = ['fare-indicativo', 'fare-congiuntivo', 'fare-cond-imperativo', 'fare-indefiniti']
    .map((f) => JSON.parse(readFileSync(new URL(`../content/exercises/${f}.json`, import.meta.url), 'utf-8')));
  const slots = files.reduce((a, d) => a + d.exercises.length, 0);              // 25
  const variantes = files.reduce((a, d) => a + d.exercises.reduce((b, e) => b + e.variants.length, 0), 0); // 122
  for (const n of [`${slots} slots`, String(variantes), String(TOTAL_EN_DISCO)]) {
    assert.ok(CONTENT.notes.includes(n), `INT-02: el notes no declara "${n}"`);
  }
});
```

(`TOTAL_EN_DISCO` = Σ `exercises.length` de `content/exercises/*.json`, la misma derivación que ya usa el reporter — nunca un literal.)

### CR-02: El gate de eje de persona de los cruces lee el pronombre de la cláusula EQUIVOCADA en `fare-indicativo-301`

**File:** `tests/content-fare-indicativo.test.js:791-798` (y el mismo patrón en `tests/content-fare-indefiniti.test.js:2072-2078`)

**Issue:** el gate toma el **primer** pronombre del prompt como "la persona de la variante":

```js
const personas = s.variants.map((v) => (v.prompt.match(PRONOUN_RE) || [''])[0].toLowerCase());
assert.equal(new Set(personas).size, 3, `D-44-03: ${s.id} repite persona ...`);
```

Pero `fare-indicativo-301` es por diseño una frase de DOS cláusulas, y el primer pronombre es el sujeto de la cláusula de **contexto** (la que trae escrita la forma de `fare`), no el del hueco. Con el contenido actual el gate compara `{tu, io, noi}` cuando las personas realmente examinadas son `{noi, lui, voi}`:

| variante | prompt | primer pronombre (lo que mide el gate) | persona del hueco (lo que debería medir) |
|---|---|---|---|
| #0 | `Tu fai i compiti da solo, ma noi ___ tutto insieme.` | `tu` | `noi` |
| #1 | `Io faccio una foto senza problemi, ma lui ___ un errore ogni volta.` | `io` | `lui` |
| #2 | `Noi facciamo il letto ogni mattina, e voi ___ il lavoro con calma.` | `noi` | `voi` |

Que hoy las dos columnas sean ambas distintas es **coincidencia**. Dos variantes que examinaran `noi` en el hueco con sujetos de contexto distintos pasarían el gate en verde, y el eje de variante de la categoría (D-44-03) dejaría de existir sin señal.

Agravante: **ningún gate ata `options[correctIndex]` a la persona del sujeto del hueco**. En la base eso lo cubre el bloque 3 (`PRONOUNS[k].includes(hit)`), y ese gate se re-apuntó a `BASE_SLOTS`; el bloque 13 re-aserta estructura (hueco, 4 opciones, raíz común, `correctIndex` en rango) pero nunca concordancia. Un `correctIndex` movido a `commetti` en la variante de `lui`, o a `hai` en la de `io`, atraviesa los 12 gates del bloque 13 en verde. Es el defecto de contenido más caro posible aquí (por la cascada D-54 arrastra la categoría vecina entera) y es el único que no está cubierto.

**Fix:** derivar la persona de la cláusula del hueco y añadir el gate de concordancia:

```js
// El sujeto del hueco es el ULTIMO pronombre que aparece antes de `___`.
const personaDelHueco = (prompt) => {
  const antes = prompt.split('___')[0];
  const hits = antes.match(PRONOUN_RE) || [];
  return (hits[hits.length - 1] || '').toLowerCase();
};

// (a) el eje de variante se mide sobre el hueco, no sobre el contexto
const personas = s.variants.map((v) => personaDelHueco(v.prompt));
assert.ok(personas.every(Boolean), `${s.id}: variante sin sujeto explicito en la clausula del hueco`);
assert.equal(new Set(personas).size, 3, `D-44-03: ${s.id} repite persona en el hueco: ${personas.join(', ')}`);

// (b) NUEVO: la key concuerda con esa persona (tabla congelada por cruce)
const PERSONA_DE_LA_KEY = {
  'fare-indicativo-300': { io: 'ho', tu: 'hai', lui: 'ha', lei: 'ha', noi: 'abbiamo', voi: 'avete', loro: 'hanno' },
  // -301: 4 personas del MISMO verbo -> comprobar la DESINENCIA por persona
};
```

Para `-301`, donde el lexema varía, basta congelar la desinencia esperada por persona (`-o/-i/-a|-e/-iamo/-ate|-ete/-ano|-ono`) y asertar que `keyOf(v)` termina en la del sujeto del hueco.

## Warnings

### WR-01: El gate anti-ceguera acepta anclas en comentarios y no comprueba la coherencia `slug` ↔ `file`

**File:** `tests/count-arrays-lockstep.test.js:82-87` y `196-225`

**Issue:** `slugsCiegos` sólo exige que el TEXTO `slug: '<slug>'` exista en algún sitio del fichero. El anclaje por slug completo está bien resuelto (el golden de colisión `fare-ind` es correcto y muerde en las dos direcciones — lo verifiqué), pero quedan dos vías por las que el reporter vuelve a quedarse ciego con el gate en verde:

1. **Entrada comentada.** `// { slug: 'fare-indefiniti', file: ..., expected: ... },` sigue satisfaciendo la regex. Comentar una línea "temporalmente" es exactamente el gesto que produce el bug histórico, y es el más plausible de todos.
2. **`file:` del hermano.** Si una entrada declara `slug: 'fare-indefiniti'` con `file: 'content/exercises/fare-indicativo.json'` (copia-pega entre los dos slugs que comparten `fare-ind`), entonces `expected = slotCountOf(fichero equivocado)` y `total` leen el MISMO fichero: el guard dinámico cuadra, el gate anti-ceguera está verde, `fare-indicativo` se cuenta dos veces y los 7 slots de `fare-indefiniti` desaparecen del total. El bloque 4 del test comprueba que `content/exercises/<slug>.json` existe y no está vacío, pero nunca que la entrada del array apunte a ese fichero.

**Fix:** endurecer el ancla y añadir el par:

```js
// 1) el ancla no puede estar comentada: se exige que la linea empiece por `{`
const anclado = new RegExp(`^\\s*\\{[^\\n]*slug:\\s*(['"\`])${escapeRe(slug)}\\1`, 'm');

// 2) NUEVO gate: en el reporter, slug y file tienen que ser el mismo slug
const pares = [...SRC.matchAll(/\{\s*slug:\s*'([^']+)'\s*,\s*file:\s*'([^']+)'/g)];
const cruzados = pares
  .filter(([, slug, file]) => file !== `content/exercises/${slug}.json`)
  .map(([, slug, file]) => `${slug} -> ${file}`);
assert.deepEqual(cruzados, [], 'D-40-03: una entrada declara el fichero de OTRA categoria');
```

### WR-02: `FARE_INITIAL_RE` se apoya en una premisa que el propio fichero desmiente, y contradice a G1

**File:** `tests/content-fare-indicativo.test.js:112-123, 870-875, 952-969` y `tests/content-fare-indefiniti.test.js:980-992`

**Issue:** el comentario justifica prohibir toda inicial `f-` en las options de los cruces diciendo *"En los pools de los cruces (auxiliares de `avere`/`essere`, ...) no hay ninguna palabra legítima con inicial f-"*. Es falso, y la contraprueba está 700 líneas más arriba en el mismo fichero: `ESSERE_FORMS` incluye `fui, fosti, fu, fummo, foste, furono`. El gate G1 (línea 961) **autoriza explícitamente** cualquier miembro de `ESSERE_FORMS` como distractora de auxiliar; si la autoría usa el passato remoto de `essere` (perfectamente legítimo y ya en la whitelist), el gate G1/G2 de la línea 872 se pone **rojo con un diagnóstico falso**: `"mete una forma de fare en options"`. Y arrastra un tercer fichero: `CRUCES_AJENOS` en `content-fare-indefiniti.test.js:988` aplica `/^f/i` a las options de los cruces de las OTRAS tres categorías, así que el mismo contenido legítimo rompería también la suite de `fare-indefiniti` con el mensaje *"la exclusion de CONJUGATE dejaria de ser inocua"*, que no es lo que estaría pasando.

Aparte: `(f|fa|fe)` es una alternación redundante — equivale exactamente a `^f` porque el motor casa la primera alternativa y el resultado sólo se usa vía `.test()`.

**Fix:** restar las formas ya autorizadas en vez de prohibir la inicial a ciegas, y simplificar:

```js
const FORMAS_PERMITIDAS_CON_F = new Set(ESSERE_FORMS.filter((f) => /^f/i.test(f))); // fui, fosti, fu, fummo, foste, furono
const pareceFare = (w) => /^f/i.test(w) && !FORMAS_PERMITIDAS_CON_F.has(w.toLowerCase());
```

### WR-03: El gloss ES de los cruces queda sin ningún gate — justo donde el quórum encontró el leak

**File:** `tests/content-fare-indicativo.test.js:344-368` (0-gloss re-apuntado a `BASE_SLOTS`), bloque 13 (sin contrapartida); `tests/content-fare-indefiniti.test.js:823-843` (ídem)

**Issue:** el 0-gloss (`sin paréntesis` + `sin mencionar el español`) dejó de cubrir los cruces y el bloque de cruces **no lo re-aserta en ninguna forma**. La cabecera promete *"RE-ASERTA los gates que siguen rigiendo sobre ellos"*; aquí no rige ninguno, y son tres agujeros concretos, todos sobre el defecto que esta misma fase tuvo que arreglar:

1. **`fare-indicativo-301` no está fijado al 0-gloss.** Su resolución documentada fue *borrar* los 3 glosses por C5-leak (el gloss conjugaba el verbo del hueco: `repasamos / comete / revisáis`). Nada impide reponerlos: la suite entera seguiría en 1081 pass. La asimetría que el `notes` declara "deliberada y no uniformable" no tiene ni un assert.
2. **La frontera del gloss de `fare-indicativo-300` no está codificada.** El pase de Opus la deja escrita como condición de supervivencia del slot: los glosses usan el pretérito simple (`hice / hicimos / hicieron`) y *"si alguien reescribe un gloss con 'he hecho' o 'hemos hecho', el slot pasa a leak R1 inmediato"*. Es un predicado mecánico trivial y no existe.
3. **`fare-indefiniti-300`: "el gloss NO traduce el modal"** es la frontera que declara su `notes`, y tampoco tiene gate. Un gloss con `tengo que / puedo / quiero` entregaría el modal examinado.

**Fix:** un gate por partición en cada fichero, con lista negra explícita:

```js
test('gloss de los cruces: puede glosar el complemento, NUNCA la casilla examinada (R1)', () => {
  // (a) el -301 vuelve al 0-gloss de la categoria y se queda ahi
  for (const v of byId('fare-indicativo-301').variants) {
    assert.ok(!/[()]/.test(v.prompt), `C5-leak: el -301 recupero el gloss que el quorum obligo a borrar: "${v.prompt}"`);
  }
  // (b) el -300 conserva gloss, pero sin auxiliar compuesto castellano
  const AUX_ES = ['he ', 'has ', 'ha ', 'hemos ', 'habéis ', 'han ', 'había', 'habré'];
  for (const v of byId('fare-indicativo-300').variants) {
    const gloss = (v.prompt.match(/\(([^)]*)\)/) || ['', ''])[1].toLowerCase();
    const sucio = AUX_ES.filter((a) => gloss.includes(a));
    assert.deepEqual(sucio, [], `R1: el gloss exhibe el auxiliar castellano espejo del hueco: ${sucio.join(', ')}`);
  }
});
```

### WR-04: El conteo de pronombres deja de estar acotado en los cruces de una cláusula

**File:** `tests/content-fare-indicativo.test.js:320-325` (base: EXACTAMENTE 1) frente a `791-798` (cruces: sólo `≥1` vía first-match)

**Issue:** el gate base exige exactamente un pronombre sujeto por prompt, y es lo que garantiza que la persona del hueco quede fijada. Para `fare-indicativo-300` y `fare-indefiniti-300` el bloque de cruces sólo comprueba que el primer match no sea vacío (`personas.every((p) => p.length > 0)`), así que un prompt con dos sujetos de personas distintas —el escenario que G2 declara letal para el `-301`— pasa en verde en el `-300`, donde el hueco es el auxiliar y la ambigüedad de persona hace defendibles dos opciones del pool.

**Fix:** exigir el número exacto por cruce, no `≥1`:

```js
const PRONOMBRES_ESPERADOS = { 'fare-indicativo-300': 1, 'fare-indicativo-301': 2 };
for (const s of CROSS_SLOTS) {
  for (const [k, v] of s.variants.entries()) {
    const hits = v.prompt.match(PRONOUN_RE) || [];
    assert.equal(hits.length, PRONOMBRES_ESPERADOS[s.id], `${s.id}#${k}: ${hits.length} sujetos (${hits.join(', ')})`);
  }
}
```

### WR-05: El guard de coherencia mata el camino defensivo del reporter y deja tres bloques de código muerto

**File:** `scripts/run-validation-271.mjs:170-171, 213-223, 247-265, 271-291, 422-424, 498-500`

**Issue:** el guard de coherencia (213-223) llama a `slotCountOf` sobre **las 18** categorías, en el ámbito del módulo, antes del bucle, y `slotCountOf` no captura nada. Consecuencias verificables leyendo el orden de ejecución:

- Cualquier JSON ausente, no parseable o sin `exercises` aborta el reporter con un `ENOENT`/`SyntaxError`/`TypeError` crudo. Con eso, `loadCategory` (que el comentario describe como *"NUNCA throws — el batch debe poder continuar reportando el resto de categorías aunque una esté corrupta (defensa en profundidad frente a T-10-02-02)"*) **nunca puede devolver `{ok:false}`**: el fichero que rompe a `loadCategory` ya rompió a `slotCountOf`. La fila `ERROR DE CARGA`, la variable `anyLoadError` y la sugerencia final `"- Carga: uno o más JSONs no se pudieron leer/parsear"` son código muerto y el operador recibe un stack trace en lugar de la remediación documentada.
- El warning `r.total !== r.expected` (422-424) tampoco puede dispararse nunca: para las 9 categorías dinámicas ambos lados derivan del mismo fichero en el mismo arranque, y para las 9 literales el guard ya hizo `process.exit(1)` antes de imprimir. El comentario de 165-166 (*"El reporter falla si la suma encontrada en disco no coincide con el expected — protege contra archivos JSON con ejercicios borrados/duplicados"*) describe un mecanismo que en la ruta real no se alcanza.

La fase editó este fichero y extendió el patrón a 4 categorías más, así que la deuda es ahora un 22 % mayor. **Fix:** envolver `slotCountOf` para que el fallo se convierta en dato y no en excepción, y dejar que el bucle reporte:

```js
const slotCountOf = (file) => {
  try {
    const d = JSON.parse(readFileSync(resolve(projectRoot, file), 'utf8'));
    return Array.isArray(d.exercises) ? d.exercises.length : null;   // null = corrupta
  } catch { return null; }
};
```
…y en el guard tratar `null` como FAIL explícito con el mensaje de remediación, en vez de dejar escapar el throw.

### WR-06: Contabilidad obsoleta en la cabecera del reporter, el fichero cuyo trabajo es que los números no mientan

**File:** `scripts/run-validation-271.mjs:5-6, 64, 154-162, 360, 437, 481-482`

**Issue:** la fase añadió 4 entradas y dejó intacta la prosa que las contradice:

- Línea 5-6: *"Lee los 271 ejercicios distribuidos en los 7 archivos"* → hoy son 250 en 18 archivos.
- Línea 64: *"La suma de `expected` es 195."* → hoy 250. Es la frase que está inmediatamente encima del array que la fase editó.
- El historial contable acaba en *"→ 195 (v1.7 Phase 31)"*: no hay entrada de Phase 39 (4 categorías + `genero-numero` 12→13) ni de Phase 44 (4 categorías de `fare`). El único rastro de las nuevas es el comentario del guard, que dice *"el total lo dicta el disco"* — cierto pero insuficiente como audit trail en un proyecto donde el historial numérico ES el artefacto.
- Línea 360 sigue imprimiendo `Milestone v1.1 — gate Phase 10` y las líneas 481-482 remiten a `/gsd:complete-milestone v1.1` en un cierre de v2.0.

**Fix:** añadir la entrada `→ 250 (v2.0 Phase 44, INT-02)` al historial con el mismo formato que las anteriores, corregir las dos cifras de la cabecera y el banner/mensaje de cierre a v2.0.

### WR-07: La lista de fuentes de conteo del gate anti-ceguera es, a su vez, una lista a mano

**File:** `tests/count-arrays-lockstep.test.js:45-48`

**Issue:** el invariante congelado es *"ninguna categoría registrada queda fuera de los arrays"*, pero no *"ningún array de conteo queda fuera del gate"*. `COUNT_ARRAY_SOURCES` son dos rutas escritas a mano: una tercera fuente futura nace ciega, exactamente un nivel por encima del bug que la fase arregla. Verifiqué que hoy la lista es completa (sólo `run-validation-271.mjs` y `slot-variants-integration.test.js` declaran entradas `slug: '...'`; el `expected: 12` de `run-validation-pilot.mjs:202` es un ancho de columna, no un conteo), así que es deuda latente y no un fallo actual.

**Fix:** cerrar el bucle con un descubrimiento por disco:

```js
test('no hay ninguna fuente de conteo fuera de COUNT_ARRAY_SOURCES', () => {
  const candidatos = [...globSync('{scripts,tests}/**/*.{js,mjs}')]
    .filter((f) => /slug:\s*['"][a-z-]+['"][^\n]*expected/.test(readSrc(f)))
    .filter((f) => !COUNT_ARRAY_SOURCES.includes(f) && f !== 'tests/count-arrays-lockstep.test.js');
  assert.deepEqual(candidatos, [], `INT-02: fuente de conteo no vigilada por el gate: ${candidatos.join(', ')}`);
});
```

### WR-08: `OBJECT_PRONOUN_RE` no distingue el clítico del artículo y escanea también el gloss castellano

**File:** `tests/content-fare-indicativo.test.js:112` y `940-950`

**Issue:** `/(^|[^\p{L}])(lo|la|li|le)([^\p{L}]|$)/iu` se aplica al prompt COMPLETO, paréntesis del gloss incluido, y `la/le/lo/li` son artículos legítimos tanto en italiano como en castellano. Un prompt válido del tipo `"Ieri noi ___ fatto le foto"` (objeto pospuesto, participio invariable, cero ambigüedad) o un gloss con `"la torta"` pondría el gate rojo con el mensaje *"lleva un pronombre objeto antepuesto y el participio fatto tendría que concordar"*, que sería falso. Hoy pasa por suerte: los 7 objetos del conjunto cerrado empiezan por `i/un/una/il` y los 3 glosses actuales no contienen ningún `la`/`le` suelto. El predicado que de verdad importa es la **anteposición al auxiliar**, no la presencia en cualquier parte de la frase.

**Fix:** acotar al segmento relevante:

```js
// Solo el tramo ANTES del hueco cuenta (el clitico antepuesto precede al auxiliar),
// y el gloss entre parentesis se descarta porque es castellano.
const tramoAnteHueco = (p) => p.replace(/\([^)]*\)/g, '').split('___')[0];
assert.ok(!OBJECT_PRONOUN_RE.test(tramoAnteHueco(v.prompt)), ...);
```

### WR-09: RegExp construida sin escapar desde datos, y satisfacible por el adverbio `fa`

**File:** `tests/content-fare-indicativo.test.js:80` y `924-932`

**Issue:** dos problemas en el mismo gate (`la forma de fare va ESCRITA en los 3 prompts`):

1. `new RegExp(\`(^|\\W)${f}(\\W|$)\`)` interpola `f` **sin escapar**, mientras el fichero hermano de esta misma fase (`count-arrays-lockstep.test.js:67`) sí define `escapeRe` para exactamente este caso. Hoy `ALL_CANON_FORMS_SIMPLES` no contiene metacaracteres, así que es latente; en cuanto el paradigma incluya una forma apostrofada tipo `fa'` (que ya vive en `OTHER_MOODS` y en `ATESTIGUADAS`) el patrón cambia de significado en silencio.
2. El gate acepta `fa` como "forma de `fare` escrita", pero `fa` es también el adverbio temporal italiano, y el propio fichero lo usa en `REMOTE_FRAMES` (`'anni fa'`) y en `FRAMES` (`'Molti anni fa'`, `'Tanti anni fa'`). Un prompt de cruce cuyo único hit fuera `"Molti anni fa"` satisfaría D-44-02 sin traer escrita **ninguna** forma verbal de `fare` — el gate quedaría verde sobre el contexto ausente.

**Fix:** escapar y exigir que el hit esté en la cláusula sin hueco, excluyendo `fa` del repertorio de anclas o exigiéndolo adyacente a un sujeto pronominal:

```js
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ANCLAS = ALL_CANON_FORMS_SIMPLES.filter((f) => f !== 'fa');  // `fa` = adverbio 'anni fa'
const contexto = v.prompt.split('___')[0];
const escritas = ANCLAS.filter((f) => new RegExp(`(^|\\W)${escapeRe(f)}(\\W|$)`).test(contexto));
```

## Info

### IN-01: La evidencia de "el `test(` count creció 42→67 y 86→126" mide otra cosa

**File:** `tests/content-fare-indicativo.test.js`, `tests/content-fare-indefiniti.test.js`

**Issue:** ese conteo incluye las llamadas `.test()` de regex (`wordish(f).test(texto)`, `PRONOUN_RE.test(...)`, decenas por fichero). Las declaraciones reales de test son **42 → 58** y **86 → 97** (`grep -c "^\s*test("`). No es un defecto de código, pero como métrica de "no se debilitó ningún gate" es engañosa en un fichero que usa `.test(` en cada gate. Relacionado: el comentario de `content-fare-indicativo.test.js:235` dice *"acota de golpe los 14 call-sites"* y los call-sites de `allVariants()` son 10 (el de `fare-indefiniti` sí dice 13 y son 13).

**Fix:** usar `node --test --reporter=tap ... | grep -c '^ok'` o el resumen del runner como evidencia, y corregir el 14 → 10.

### IN-02: Detalles de higiene en `count-arrays-lockstep.test.js`

**File:** `tests/count-arrays-lockstep.test.js:59-60, 82, 241-245`

**Issue:** (a) `slugsCiegos` se exporta y nadie lo importa — export muerto (defendible por testabilidad, pero conviene declararlo en el comentario o quitarlo); (b) `SLUGS_REGISTRADOS` recorre `CATEGORIES.categories` en vez de reutilizar `ENTRADAS`, que es la misma referencia declarada la línea anterior; (c) `assert.deepEqual(<boolean>, true, ...)` en el gate de unicidad de `order` debería ser `assert.equal(...)` o `assert.ok(...)` — `deepEqual` sobre un booleano funciona pero oscurece la intención y el diff que imprime en rojo no dice nada útil.

**Fix:** `assert.ok(new Set(orders).size === orders.length, ...)` y `const SLUGS_REGISTRADOS = ENTRADAS.map((c) => c.id);`.

### IN-03: `esCruce` acopla la exclusión de `CONJUGATE` a una convención que se enforcea en OTRO fichero

**File:** `tests/content-fare-indefiniti.test.js:250`

**Issue:** `const esCruce = (id) => /-\d{3}$/.test(id);` decide qué slots de las otras tres categorías se excluyen de `CONJUGATE`. Que "sufijo de 3 cifras" ⇔ "es un cruce" sólo está garantizado por el gate invertido de `content-fare-indicativo.test.js:279-292` (y sus gemelos), es decir por un fichero distinto. Si una categoría futura usa el espacio numérico para otra cosa, la exclusión se ensancha en silencio. El sub-gate `CRUCES_AJENOS` limita el daño (verifica que lo excluido no contenga formas de `fare`), así que hoy es acoplamiento documentable, no bug.

**Fix:** un comentario explícito de dependencia, o mejor, excluir por `categoryIds.length > 1` (la propiedad que define un cruce) en vez de por la forma del id.

---

_Reviewed: 2026-08-11_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
