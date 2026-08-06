---
phase: 42-fare-congiuntivo-4-slots-hom-grafas-disparador
reviewed: 2026-08-06T09:26:47Z
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
  warning: 8
  info: 8
  total: 16
status: issues_found
---

# Phase 42: Code Review Report (re-revisión)

**Reviewed:** 2026-08-06T09:26:47Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Segunda pasada sobre los mismos 5 ficheros, mismo rango de commits, tras los tres fixes de
blocker (`2c089c3`, `9619fd5`, `99fc184`).

Baseline reverificado en local: `node --test tests/*.test.js` → **835 pass / 0 fail**.
`node --test tests/content-fare-congiuntivo.test.js` → **62 pass / 0 fail** (eran 59 antes de los
fixes: los tres tests nuevos son los de CR-01/CR-02). Árbol de trabajo devuelto limpio tras las 22
mutaciones experimentales.

**Los tres blockers están cerrados y verificados de forma independiente**, no por lectura del
commit sino por mutación fail-first. El detalle está en la sección siguiente. Lo importante: el gate
de CR-03 ya NO es inerte — se pone rojo en 4 de las 4 formas de correferencia que le probé, incluida
una que el fixer no anticipó (principal pospuesta con verbo fuera del léxico, que falla cerrado y con
mensaje correcto).

**Lo que sigue abierto.** De las 6 WARNING previas, **5 reproducen** y **1 (WR-06) está cerrada como
efecto colateral del `PERSON_OF_PRONOUN`** — confirmado por mutación de la tabla, no por lectura. Las
6 INFO reproducen las 6.

**Lo que los fixes introdujeron.** Tres WARNING nuevas (WR-07, WR-08, WR-09) y dos INFO nuevas. La
más sustantiva: el gate de ancla temporal que nació con CR-01/CR-02 comprueba que el literal esté
**en el prompt**, no que esté **en la cláusula que gobierna el hueco**. Mover `in questo momento` a
otra oración del mismo prompt reabre la doble respuesta y la suite se queda en 62/0. El mismo defecto
existe, y es anterior a los fixes, en el gate de marco de concordancia de los dos compuestos — que el
`notes` llama literalmente «el ÚNICO mecanismo que hace que `faccia` y `facessi` no sean defendibles».

## Re-auditoría de los tres blockers cerrados

### CR-01 — CERRADO (contenido correcto y gate real)

`content/exercises/fare-congiuntivo.json:359-366`. El prompt es ahora
`Io so che lui ___ il lavoro in questo momento.`

- **Mata el imperfecto**: sí. `so che` ya descartaba `faccia`/`facesse` por modo; `in questo momento`
  sitúa la acción en el instante de la enunciación y `faceva` pierde su punto de anclaje pasado. Con
  el cuarteto `facesse / fa / faceva / faccia` sobrevive exactamente `fa`.
- **¿Ambigüedad nueva?** No. `in questo momento` no habilita ninguna de las otras tres casillas.
- **¿Italiano natural?** Sí. El presente simple italiano cubre la acción en curso sin necesidad de
  perífrasis (`Cosa fai in questo momento?` — `Faccio i compiti`). `sta facendo` sería más marcado,
  pero es progresivo y queda fuera del scope-gate de la categoría; su ausencia es coherente, no un
  descuido. La colocación `fare il lavoro` es preexistente y viene del conjunto cerrado de 7 objetos.
- **Regresión congelada**: mutación `M-G` (volver a `ogni giorno` en la variante 0) → **59/3**;
  mutación `M-M` (quitar el ancla de la variante 5) → **60/2**. El gate existe y muerde.

### CR-02 — CERRADO (las dos variantes, incluida la que el informe previo dejó como colateral)

`:309-316` → `Io penso che lui ___ il lavoro in questo momento.`
`:319-326` → `Benché (aunque) tu ___ i compiti adesso, il professore non è contento.`

- **Variante 0**: `penso che` fija el modo, `in questo momento` fija el tiempo; `facesse` deja de ser
  defendible porque el imperfecto de subjuntivo con principal en presente necesita referencia pasada
  y aquí no la hay. Sobrevive `faccia`.
- **Variante 1**: `adesso` cumple lo mismo. Comprobé además la lectura contrafactual, que es la única
  por la que `facessi` podría volver: `Benché tu facessi i compiti adesso...` exigiría apódosis en
  condicional, y la principal es `il professore non è contento`, indicativo presente. La lectura
  queda bloqueada. Frase natural.
- **El par pedagógico sobrevive**: la 0 y la 5 comparten ancla literal (`in questo momento`) y difieren
  solo en el disparador; hay test dedicado que lo congela (`:913-922`).

### CR-03 — CERRADO en su núcleo, con dos huecos residuales (ver WR-09)

`tests/content-fare-congiuntivo.test.js:490-539`. El gate deriva ahora los dos sujetos del `prompt`
(`deriveBlankSubject` :200-203, `deriveMainPerson` :230-234) y usa `VARIANT_TABLE` solo como contraste.
Lo probé con **6 mutaciones fail-first, todas rojas**:

| Mutación | Forma | Resultado |
|---|---|---|
| M-A | correferencia 1sg/1sg (`Io penso che io ___`), la forma que el `notes` cita como incorrecta | **60/2** |
| M-B | verbo de principal fuera del léxico (`Io immagino che...`) | **60/2** (falla cerrado, mensaje correcto) |
| M-C | principal POSPUESTA correferente (`Benché noi ___ tutto, noi non siamo mai contenti`) | **60/2** |
| M-F | correferencia 3sg/3sg con verbo SÍ presente en el léxico (`Lui crede che lui ___`) | **59/3** |
| N-C | concordancia rota (`controlla` → `controllava` en el disparador#3) | **61/1** |
| N-G | `correctIndex` movido a una distractora | **60/2** |

Verificaciones de diseño que confirmo como sólidas:

- El paso 3 del gate (`:533`) opera sobre los valores **derivados**, no sobre la tabla. Eso significa
  que una edición *coherente* de contenido + tabla que introdujera correferencia también se pone roja
  — no solo la divergencia. Ese es el punto que hacía inerte al gate anterior y está bien resuelto.
- `deriveMainPerson` devolviendo `null` → `assert.ok` rojo es fail-closed deliberado y funciona (M-B).
- El matcher `wordish` con frontera `\p{L}` impide efectivamente que `so` haga match dentro de
  `penso che`, que es una colisión real entre dos disparadores de este fichero. Verificado.

Lo que **no** cubre: sujetos coordinados delante del hueco (WR-09) y ámbito del ancla (WR-07).

## Structural Findings (fallow)

No se aportó bloque `<structural_findings>` en esta invocación.

## Narrative Findings (AI reviewer)

## Critical Issues

Ninguna. Los tres blockers previos están cerrados y no he podido sustanciar ninguno nuevo.

## Warnings

### WR-01: los escaneos de blacklist / Phase-43 / participio concordado siguen mirando solo `options`

**REPRODUCE** — sin cambios respecto del informe previo.

**File:** `tests/content-fare-congiuntivo.test.js:645-667`
**Issue:** la cabecera del fichero (`:14-23`) declara «no negociable» que los escaneos de ausencia van
«SIEMPRE por campo — `variants[].prompt` y `variants[].options[]`». Los tres tests del bloque 6
recorren únicamente `v.options`. Reverificado por mutación, las tres en **62 pass / 0 fail**:

- **M-I** — `'facci'` (blacklist D-42-11) inyectado en un prompt: verde.
- **M-J** — `'farei'` (casilla de Phase 43) inyectado en un prompt: verde.
- **M-K** — `'fatta'` (participio concordado, MAGNET de Phase 43) inyectado en un prompt: verde.

Comprobado además que la suite COMPLETA tampoco los caza: el `leakPattern` R1 de
`tests/exercise-types.test.js:1377` es una lista cerrada de marcas editoriales y no contiene ninguna
forma de `fare`.

**Fix:** recorrer `[v.prompt, ...v.options]` con `wordish()`, que ya existe en el fichero:
```js
for (const { slot, v, k } of allVariants()) {
  const campos = [v.prompt, ...v.options];
  const sucio = BLACKLIST.filter((f) => campos.some((c) => wordish(f).test(c)));
  assert.deepEqual(sucio, [], `D-42-11: ${slot.id}#${k} ofrece/menciona una forma atestiguada: ${sucio.join(', ')}`);
}
```

### WR-02: el chequeo de Phase-43 en prompt dice «en el fichero» pero recorre 1 de 30 prompts

**REPRODUCE** — sin cambios.

**File:** `tests/content-fare-congiuntivo.test.js:924-930`
**Issue:** el mensaje del assert (`:929`) es
`'D-42-16: ninguna casilla de Phase 43 puede entrar en el fichero, ni en el prompt'`, pero el sujeto
escaneado es `D().variants[k]` con `k` = índice de `Se io` — un único prompt de los 30. Es el caso
concreto del patrón de WR-01; M-J lo confirma.

**Fix:** sacar el escaneo a un test propio sobre `allVariants()`:
```js
test('ninguna casilla de Phase 43 aparece en ninguno de los 30 prompts (D-42-16)', () => {
  const sucio = allVariants()
    .filter(({ v }) => PHASE43_FORMS.some((f) => wordish(f).test(v.prompt)))
    .map(({ slot, k, v }) => `${slot.id}#${k}: "${v.prompt}"`);
  assert.deepEqual(sucio, [], 'D-42-16: casilla de Phase 43 en un prompt');
});
```

### WR-03: la información de fijación temporal del slot del disparador vive ahora en DOS tablas

**CAMBIA** — el defecto de contenido que motivaba esta WARNING está cerrado; lo que queda es el
problema de duplicación que el fixer anticipó, y es real.

**File:** `tests/content-fare-congiuntivo.test.js:866-874` (TENSE_FIX) y `:958-963` (bloque 10)
**Issue:** el bloque 10 sigue exigiendo activamente que el slot del disparador declare **cero**
`frame` (`assert.equal(conMarco, COMPOUND_SLOTS.includes(id) ? 6 : 0, ...)`), así que el fix de
CR-01/CR-02 tuvo que crear una segunda tabla paralela, `TENSE_FIX`, indexada por `k` igual que
`VARIANT_TABLE[TRIGGER_SLOT]` pero declarada 578 líneas más abajo y con su propio comentario
explicando por qué no es una columna `frame`. Dos tablas por variante para el mismo slot, sin ningún
assert que las cruce: nada impide que una fila de `TENSE_FIX` quede desalineada con la de
`VARIANT_TABLE` si alguien reordena las variantes del disparador.

El informe previo pedía «cambiar la aserción de cero marcos a marco o ancla equivalente»; eso NO se
hizo, se eligió la tabla separada. Es una elección defendible, pero deja el riesgo de desincronía.

**Fix (mínimo):** cruzar las dos tablas al menos por longitud e índice, o mover `TENSE_FIX` a una
columna `tenseFix` de `VARIANT_TABLE[TRIGGER_SLOT]` y relajar el assert de `:961` a
`frame === null` solamente (que es lo que de verdad quiere decir: el marco de CONCORDANCIA de los
compuestos no aplica aquí).

### WR-04: `assert.equal(({}).polluted, undefined)` sigue siendo una aserción vacua

**REPRODUCE** — sin cambios.

**File:** `tests/content-fare-congiuntivo.test.js:1000`
**Issue:** `JSON.parse` crea `__proto__` como **own property**; nunca escribe en `Object.prototype`.
La aserción no puede fallar por ningún contenido posible del JSON, y `polluted` no es una propiedad
que ningún módulo del proyecto escriba. Se lee como un gate anti-prototype-pollution y no lo es. El
assert que la precede (`:998`, `claves.filter(...)` sobre `__proto__`/`constructor`/`prototype`) sí
es real y basta.

**Fix:** eliminar la línea 1000, o darle contenido:
```js
const objetos = [];
(function walkObj(n){ if (Array.isArray(n)) n.forEach(walkObj);
  else if (n && typeof n === 'object') { objetos.push(n); Object.values(n).forEach(walkObj); } })(CONTENT);
assert.deepEqual(objetos.filter((o) => Object.getPrototypeOf(o) !== Object.prototype), []);
```

### WR-05: el índice en `categories.json` se codifica a mano cuando el comentario promete derivarlo

**REPRODUCE** — sin cambios.

**File:** `tests/content-fare-indicativo.test.js:670-680` y `tests/content-fare-congiuntivo.test.js:1112-1119`
**Issue:** el comentario de la reescritura dice literalmente *«Se reescribe a la forma estable:
indice = order-1»* (`content-fare-indicativo.test.js:675`), pero el código aserta
`assert.equal(idx, 14)` y el análogo `assert.equal(idx, 15)`. El invariante enunciado no está
codificado: son dos constantes independientes que hoy coinciden. Los mensajes
(`'order 15 -> indice 14'`, `'order 16 -> indice 15'`) refuerzan una lectura falsa.

Comprobado además que **nadie** aserta el invariante global: ni orders únicos, ni contiguos, ni array
ordenado por `order`. Hoy se cumplen los tres (`1..16`, únicos, ordenados) — por casualidad, no por
gate. `tests/domain.test.js` solo usa `order` en un fixture.

**Fix:** derivar de verdad, en los dos ficheros:
```js
const cat = entradas.find((c) => c.id === 'fare-congiuntivo');
assert.equal(entradas.indexOf(cat), cat.order - 1, 'el array define el display (indice = order - 1)');
```
Y, en uno solo de los dos, el invariante global que hoy no cubre nadie:
```js
test('categories.json: orders únicos, contiguos desde 1, y array ordenado por order', () => {
  assert.deepEqual(entradas.map((c) => c.order), entradas.map((_, i) => i + 1));
});
```

### WR-07 (NUEVA): el gate de ancla temporal comprueba PRESENCIA del literal, no su ÁMBITO

**File:** `tests/content-fare-congiuntivo.test.js:883-911` (y `TENSE_FIX` en `:866-874`)
**Issue:** el gate que nació con el fix de CR-01/CR-02 se reduce, en su rama útil, a
`assert.ok(v.prompt.includes(lit))`. No verifica que el ancla esté en la cláusula que gobierna el
hueco. Tres agujeros, los tres sustanciados y los tres en **62 pass / 0 fail**:

- **N-A** — ancla desplazada a otra oración del mismo prompt:
  `"Io penso che lui ___ il lavoro, e in questo momento io sono stanco."` El ancla ya no sitúa la
  acción del subordinado, así que `facesse` vuelve a ser defendible y con ella la doble respuesta que
  CR-02 cerró. **Verde.**
- **N-B** — lo mismo en la variante de contraste (`so che`), reabriendo CR-01. **Verde.**
- **M-H** — `ogni giorno` reintroducido en una variante de rama `'concordancia'`
  (`È necessario che voi ___ il letto ogni giorno prima di uscire`). El chequeo de `BARE_HABITUALS`
  (`:904`) está filtrado a `r.how === 'ancla'`, así que las tres variantes de concordancia pueden
  recibir un habitual pelado sin rojo. **Verde.**

Y un cuarto punto, menor pero de la misma raíz: `includes` es subcadena, no palabra. En N-C cambié
`controlla` por `controllava` (que rompe de verdad la concordancia del disparador#3, porque una
principal en pasado hace defendible `facessero`) y el assert del ancla siguió verde —
`'controllava'.includes('controlla')` es `true`. La mutación se puso roja, pero por
`deriveMainPerson` devolviendo `null`, no por el gate temporal. El gate que la fase declara como
guardián del invariante no fue el que la cazó.

Nótese además que la rama `'concordancia'` no comprueba **nada** sobre el mecanismo: acepta cualquier
literal presente en el prompt. Para `k=2,3,4` los literales declarados (`È necessario`, `controlla`,
`sarebbe`) son simplemente los verbos de la principal, sin ninguna aserción de que su tiempo fije el
del subordinado. El `notes` del fichero declara como INVARIANTE congelado que «ninguna de las seis
variantes puede quedarse con el TIEMPO sin fijar»; el gate lo sostiene para 3 de 6.

**Fix:** anclar por ámbito, no por presencia. Mínimo viable: exigir que el ancla esté en el mismo
segmento que el hueco (entre el disparador y el siguiente signo de puntuación fuerte), y extender el
chequeo de habituales pelados a las 6 variantes:
```js
const segmentoDelHueco = (p) => (p.split(/[,;.]/).find((s) => s.includes('___')) || '');
for (const { k, how, lit } of TENSE_FIX) {
  const p = D().variants[k].prompt;
  if (how === 'ancla') {
    assert.ok(segmentoDelHueco(p).includes(lit),
      `CR-01/CR-02: ${TRIGGER_SLOT}#${k} lleva el ancla "${lit}" fuera de la clausula del hueco: "${p}"`);
  } else {
    assert.ok(wordish(lit).test(p.toLowerCase()),
      `CR-01/CR-02: ${TRIGGER_SLOT}#${k} no lleva "${lit}" como palabra: "${p}"`);
  }
  // Habitual pelado: prohibido en las SEIS, no solo en las ancladas.
  const h = BARE_HABITUALS.filter((x) => p.toLowerCase().includes(x));
  assert.deepEqual(h, [], `CR-01/CR-02: ${TRIGGER_SLOT}#${k} usa un habitual pelado: ${h.join(', ')}`);
}
```

### WR-08 (NUEVA): el gate de marco de concordancia de los compuestos tiene el mismo defecto de ámbito

**File:** `tests/content-fare-congiuntivo.test.js:786-797`, concretamente `:794`
**Issue:** `assert.ok(v.prompt.includes(marcos[k]), ...)`. El comentario que lo precede (`:787-789`)
dice que es «el ÚNICO mecanismo que hace que `faccia` y `facessi` no sean defendibles» y que «si el
marco no fija el punto temporal de la principal y la anterioridad del subordinado, la variante tiene
dos respuestas correctas». El assert no comprueba nada de eso: solo que la cadena aparezca.

Sustanciado, **62 pass / 0 fail**:

- **N-D** — marco desplazado a una cláusula ajena:
  `"Mia madre non crede che io ___ i compiti, ieri sera lei dormiva."`
  `ieri sera` pasa a modificar `dormiva`, el subordinado se queda sin marcador de acción terminada y
  `faccia` (congiuntivo presente, que está en las opciones) vuelve a ser defendible. **Verde.**

Es un defecto anterior a los tres fixes de blocker, pero es código de esta fase y la corrección de
WR-07 debería aplicarse aquí en el mismo movimiento — si no, se arregla el gate del slot 5 y se deja
sin arreglar el de los slots 3 y 4, que es exactamente el mismo bug.

**Fix:** el mismo `segmentoDelHueco()` de WR-07 aplicado a `marcos[k]`.

### WR-09 (NUEVA): `deriveBlankSubject` toma el ÚLTIMO pronombre, así que un sujeto coordinado pasa

**File:** `tests/content-fare-congiuntivo.test.js:198-203`, usado en `:503`
**Issue:** `BLANK_SUBJECT_RE` captura el pronombre inmediatamente anterior al hueco (con `non`
opcional). Con un sujeto coordinado captura solo el segundo miembro, y el resto del gate queda
satisfecho. Es el hueco residual del fix de CR-03. Sustanciado, ambas en **62 pass / 0 fail**:

- **M-D** — `"Io penso che io e lui ___ il lavoro in questo momento."`
  Deriva `blankSubject = 'lui'` (3sg), que coincide con la tabla, así que el gate da verde. Pero el
  sujeto real es `io e lui` = `noi` (1pl): la key `faccia` pasa a ser **incorrecta** (tocaría
  `facciamo`), y además hay correferencia parcial con el `Io` de la principal, que es justo lo que
  D-42-06 declara HARD. Ni el gate de correferencia ni el de cuarteto de `PERSON_INDEX` lo ven,
  porque los dos leen la persona de la tabla.
- **M-E** — `"Io penso che tu e lui ___ ..."`: idéntico, con sujeto real de 2pl.

**Fix:** rechazar la coordinación explícitamente antes de derivar:
```js
const COORD_RE = /(?:^|[^\p{L}])(io|tu|lui|lei|noi|voi|loro)\s+(?:e|o|ed|od)\s+(?:io|tu|lui|lei|noi|voi|loro)(?:\s+non)?\s+___/iu;
assert.ok(!COORD_RE.test(v.prompt),
  `D-42-06: ${id}#${k} el hueco lleva sujeto coordinado; la persona derivada seria falsa: "${v.prompt}"`);
```

## Info

### IN-01: `CANON` duplica verbatim los cuatro paradigmas

**REPRODUCE.**
**File:** `tests/content-fare-congiuntivo.test.js:86-92` vs `:103-106`
**Issue:** las cuatro filas del paradigma de `CANON` son copias literales de `CONG_PRES`, `CONG_IMPF`,
`CONG_PASS` y `CONG_TRAP`, declaradas 17 líneas más abajo. Editar una copia y no la otra desincroniza
la especificación en silencio: el bloque 2 compararía contra una tabla y los bloques 7-9 contra otra.
**Fix:** `const CANON = { 'fare-congiuntivo-presente': CONG_PRES, ... }`, moviendo las cuatro
constantes por encima y dejando solo la fila del disparador como literal.

### IN-02: la «RED de seguridad» de indicativo compuesto no puede fallar de forma independiente

**REPRODUCE.**
**File:** `tests/content-fare-congiuntivo.test.js:776-784`
**Issue:** el test anterior (`:760-774`) fija las 3 distractoras a un conjunto CERRADO por igualdad
exacta. La intersección de `IND_COMPOUND` con ese universo cerrado es vacía, así que si el test de
conjunto cerrado pasa, este no puede fallar nunca.
**Fix:** ninguna acción obligatoria; si se conserva, documentar en el comentario que es redundante por
construcción y no un gate independiente.

### IN-03: el `expected` dinámico hace tautológica la aserción de conteo

**REPRODUCE.**
**File:** `tests/exercise-types.test.js:1295` y `:1321-1327`
**Issue:** `expected: slotCountOf('content/exercises/fare-congiuntivo.json')` lee el conteo del mismo
fichero que después vuelve a leer y comparar (`assert.equal(data.exercises.length, expected)`). Para
todas las entradas dinámicas esa aserción no puede fallar. La forma pedida por la fase (derivado, no
mágico) se cumple; lo que se pierde es el gate de conteo. El resto del describe (explanation no vacía,
smart quotes, markdown, R1, R2) sí es cobertura real y sí se aplica al fichero nuevo.
**Fix:** el número de slots ya vive en `tests/content-fare-congiuntivo.test.js:326-331` (`5 x 6 = 30`);
dejarlo ahí y comentar la vacuidad aquí.

### IN-04: `slot-variants-integration.test.js` sigue ciego a la categoría nueva

**REPRODUCE.**
**File:** `tests/fixtures/slot-variants-integration.test.js:168-185`
**Issue:** reverificado: `REAL_CATEGORIES` termina en `riflessivi`; ni `fare-indicativo` ni
`fare-congiuntivo` están. Además el fichero vive en `tests/fixtures/`, así que el glob
`node --test tests/*.test.js` no lo ejecuta. El `notes` declara este count-sync diferido a Phase 44 /
INT-02 y advierte que el efecto es «ciego, no rojo», que es peor que un rojo.
**Fix:** ninguna en esta fase (diferido por decisión). En Phase 44, añadir las 4 categorías de `fare`
y mover el fichero al glob o documentar su comando de ejecución.

### IN-05: no se comprueba que cada prompt tenga EXACTAMENTE un hueco

**REPRODUCE** — confirmado por mutación.
**File:** `tests/content-fare-congiuntivo.test.js:451-454`
**Issue:** el test usa `v.prompt.includes('___')`. Mutación **M-L**
(`"Bisogna che io ___ i compiti ___ stasera."`) → **62 pass / 0 fail**. Un prompt con dos huecos
rompería el render, ya que el motor sustituye un único hueco.
**Fix:** `assert.equal(v.prompt.split('___').length - 1, 1, ...)`.

### IN-06: la dosificación D-42-14 solo se comprueba en negativo

**REPRODUCE.**
**File:** `tests/content-fare-congiuntivo.test.js:1011-1022`
**Issue:** el test verifica que el disparador DESARROLLE la interferencia y que los compuestos NO la
repitan, pero no el tercer tramo de la decisión: que presente e imperfetto lleven la línea de
recordatorio. Hoy ambas explanations sí la llevan, así que el contenido es correcto; falta el gate.
**Fix:**
```js
for (const id of SIMPLE_SLOTS) {
  assert.match(byId(id).explanation, /penso che pide subjuntivo/,
    `D-42-14: ${id} debe llevar la linea de recordatorio de interferencia`);
}
```

### IN-07 (NUEVA): el SCOPE-GATE del objeto solo comprueba presencia, no exclusividad

**File:** `tests/content-fare-congiuntivo.test.js:625-635`, línea `:631`
**Issue:** `if (!v.prompt.includes(obj))`. Verifica que el objeto declarado esté, no que sea el único.
Mutación **N-F** (`"Bisogna che io ___ i compiti e una torta stasera."`) → **62 pass / 0 fail**, pese
a que el prompt pasa a tener dos objetos y a que el sujeto/objeto del hueco deja de ser unívoco.
**Fix:** contar cuántos objetos del conjunto cerrado aparecen y exigir exactamente 1.

### IN-08 (NUEVA): el gate de 0-gloss del verbo solo escanea paréntesis

**File:** `tests/content-fare-congiuntivo.test.js:581-607`
**Issue:** los dos tests que acotan el gloss iteran `v.prompt.matchAll(/\(([^)]*)\)/g)`. Un gloss del
VERBO en corchetes, en comillas o tras coma no lo ve ninguno; el `/espa/i` de `:576` solo caza la
palabra «español». Mutación **N-E** (`"Bisogna che io ___ [haga] i compiti stasera."`) →
**62 pass / 0 fail**, y también verde en la suite completa (el `leakPattern` R1 de
`tests/exercise-types.test.js:1377` es una lista cerrada de marcas editoriales que no incluye
castellano suelto).
Riesgo bajo — el canon R7 del proyecto usa siempre paréntesis — pero el test declara «0-gloss del
VERBO: PROHIBIDO y absoluto» (`:564-567`) y lo que cubre es «prohibido entre paréntesis».
**Fix:** añadir un escaneo por palabra de un set corto de formas castellanas de `hacer`
(`haga`, `hagas`, `hiciera`, `hicieras`, `haces`, `hace`, `hacía`…) sobre los 30 prompts.

## Hallazgos previos que NO reproducen (cerrados)

- **CR-01** — cerrado. Contenido corregido + gate de regresión real (M-G, M-M rojas).
- **CR-02** — cerrado en las dos variantes, incluida la colateral que el informe previo dejó abierta.
- **CR-03** — cerrado en su núcleo. El gate ya no compara la tabla consigo misma; deriva del `prompt`
  y se pone rojo en las 4 formas de correferencia probadas. Quedan dos huecos de forma, registrados
  como WR-07 y WR-09, no como reapertura del blocker.
- **WR-06** — cerrado, y verificado, no asumido. `PERSON_OF_PRONOUN` (`:191-193`) se aplica en
  `:513-518` a los **5** slots, no solo a `PARADIGM_SLOTS`. Mutando la tabla del slot del disparador
  (`blankSubject: 'voi'` con `blankPerson: '3pl'`, que es exactamente la incoherencia que desplazaba
  el criterio del bloque 9) la suite pasa a **60 pass / 2 fail**. El efecto colateral que el fixer
  reportó es real.

---

_Reviewed: 2026-08-06T09:26:47Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
_Mutaciones ejecutadas: 22 (M-A..M-N, N-A..N-H). Árbol de trabajo revertido y verificado limpio;_
_`node --test tests/*.test.js` → 835 pass / 0 fail tras la revisión._
