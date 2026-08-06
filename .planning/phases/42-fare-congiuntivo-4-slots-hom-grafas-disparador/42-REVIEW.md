---
phase: 42-fare-congiuntivo-4-slots-hom-grafas-disparador
reviewed: 2026-08-06T07:56:54Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - content/exercises/fare-congiuntivo.json
  - content/categories.json
  - tests/content-fare-congiuntivo.test.js
  - tests/content-fare-indicativo.test.js
  - tests/exercise-types.test.js
findings:
  critical: 3
  warning: 6
  info: 6
  total: 15
status: issues_found
---

# Phase 42: Code Review Report

**Reviewed:** 2026-08-06T07:56:54Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Revisión adversarial de la alta de contenido `fare-congiuntivo` (5 slots x 6 variantes = 30), su
gate de tests nuevo (`tests/content-fare-congiuntivo.test.js`, 13 describes / 59 tests), la reescritura
de un assert en `tests/content-fare-indicativo.test.js` y la línea añadida a `CATEGORIES_WITH_EXPLANATIONS`.

Baseline verificado en local: `node --test tests/*.test.js` → **832/832 pass, 0 fail**.
`node --test tests/content-fare-congiuntivo.test.js` → **59/59 pass**.

**Lo que está limpio y se ha comprobado mecánicamente** (no hace falta volver a mirarlo):

- Estructura: 5 slots, 6 variantes cada uno, 30 en total; 4 opciones por variante; cero duplicados
  internos; `correctIndex` entero en rango y no constante en ningún slot; `categoryIds` exactamente
  `["fare-congiuntivo"]` en los 5; ningún id con sufijo `-\d{3}`; `validation.status: "pending"` con
  `passes: []` coherente con `deriveStatus([])`.
- Paradigma: las 30 keys se han verificado una a una contra el paradigma real del congiuntivo de
  `fare`; los patrones de distractora de los 2 simples (3 ejes), de los 2 compuestos (conjunto cerrado
  de 3 formas de congiuntivo de la persona) y del disparador (cuarteto completo modo x tiempo) se
  cumplen en las 30. La excepción declarada de `noi` del presente (`facciamo` homógrafa) es correcta.
- Encoding: inventario completo de los 13 caracteres no-ASCII del fichero — solo vocales acentuadas
  RAE/italianas y una `ü`. **Cero** smart quotes, cero NBSP, cero em-dash, cero backticks, cero markdown,
  cero `<`/`>`/`&#`. Todos los apóstrofes son U+0027.
- `content/categories.json`: el diff es exactamente una entrada apendida; las 15 previas intactas.
  Se ha comprobado por mutación que la suite SÍ se pone roja si se toca una entrada previa (C2) o si
  se duplica un id (C3) — lo caza el bundle completo de `tests/domain.test.js`.
- La línea añadida a `CATEGORIES_WITH_EXPLANATIONS` tiene la forma correcta de sus vecinas y su
  `expected` es derivado (`slotCountOf`), no un número mágico. El fichero se auto-descubre por
  `content/exercises/${cid}.json` en `src/data/content-loader.js`, así que la entrada de
  `categories.json` es suficiente para que la categoría exista en runtime.

**Lo que no está bien.** Dos defectos de contenido con doble respuesta válida en el slot del
disparador, y el gate declarado como HARD de la fase (no-correferencia de sujetos) es inerte: no puede
ponerse rojo por ningún cambio de contenido. Los tres se sustancian abajo con mutación reproducible.

## Structural Findings (fallow)

No se aportó bloque `<structural_findings>` en esta invocación.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: `fare-congiuntivo-disparador` variante 5 tiene DOS respuestas correctas (`fa` y `faceva`)

**BLOCKER**
**File:** `content/exercises/fare-congiuntivo.json:359-366`

**Issue:**
```
"prompt": "Io so che lui ___ il lavoro ogni giorno."
"options": ["facesse", "fa", "faceva", "faccia"]   correctIndex: 1 -> "fa"
```
`so che` es un verbo de certeza: rige INDICATIVO, y eso descarta `faccia` y `facesse`. Pero no
restringe el TIEMPO del indicativo. `Io so che lui faceva il lavoro ogni giorno.` («Sé que él hacía el
trabajo todos los días») es italiano estándar, perfectamente gramatical y semánticamente coherente.
El único anclaje temporal del prompt es `ogni giorno`, que es compatible con habitual presente y con
habitual pasado por igual; el verbo de la principal (`so`) no impone concordancia sobre un subordinado
en indicativo.

El precedente del propio proyecto lo confirma: en `tests/content-fare-indicativo.test.js:135-136` la
tabla `FRAMES` asigna `ogni giorno` al slot de PRESENTE y reserva marcos propios y disjuntos
(`Da bambino`, `Ogni estate`, `A quei tempi`…) para el imperfetto, precisamente porque un marcador
habitual pelado no separa los dos tiempos. Phase 42 mete presente e imperfetto en el mismo cuarteto de
opciones y quita el marco.

Impacto real: por la cascada de fallo inmediato del motor, elegir `faceva` — que es correcto — resetea
la categoría entera. Es exactamente el «ejercicio injusto» que el `notes` del fichero declara querer
evitar.

Ningún test lo detecta: el bloque 9 solo comprueba la FORMA del cuarteto y el reparto modal de las
keys, nunca la unicidad de lectura.

**Fix:** anclar el tiempo en el prompt, igual que hacen los dos slots compuestos. Por ejemplo:
```json
{
  "prompt": "Io so che lui ___ il lavoro in questo momento.",
  "options": ["facesse", "fa", "faceva", "faccia"],
  "correctIndex": 1
}
```
(`in questo momento` / `adesso` excluyen `faceva` sin tocar el par pedagógico con la variante 0.)
Y añadir el gate que falta al bloque 9, en la línea del que ya existe para los compuestos:

```js
// Cada variante del disparador declara un ancla temporal que fija el TIEMPO,
// no solo el MODO. Sin ella, el cuarteto modo x tiempo tiene dos lecturas.
const TRIGGER_TIME_ANCHORS = ['in questo momento', 'adesso', 'ieri', 'da bambino', 'prima di uscire', 'sarebbe'];
D().variants.forEach((v, k) => {
  assert.ok(
    TRIGGER_TIME_ANCHORS.some((a) => v.prompt.toLowerCase().includes(a)),
    `SC-4: ${TRIGGER_SLOT}#${k} no ancla el tiempo: "${v.prompt}"`
  );
});
```

---

### CR-02: `fare-congiuntivo-disparador` variante 0 admite `facesse` además de `faccia`

**BLOCKER**
**File:** `content/exercises/fare-congiuntivo.json:309-316`

**Issue:**
```
"prompt": "Io penso che lui ___ il lavoro ogni giorno."
"options": ["faceva", "faccia", "fa", "facesse"]   correctIndex: 1 -> "faccia"
```
Misma raíz que CR-01, la otra mitad del «par pedagógico» que el `notes` declara deliberado (variantes
0 y 5 comparten cuarteto). `penso che` fija el MODO (subjuntivo, y esa es la interferencia que la fase
quiere enseñar), pero no fija el TIEMPO: `Penso che lui facesse il lavoro ogni giorno.` («Creo que él
hacía el trabajo todos los días») es congiuntivo imperfetto con principal en presente y referencia
pasada — construcción estándar en italiano. `ogni giorno` no lo excluye.

Es más débil que CR-01 (la lectura presente es la de defecto), pero el coste de equivocarse es el
mismo reset de categoría, y la explanation del slot dice literalmente «con la oración principal en
presente el subjuntivo va en presente», afirmación que un hablante puede rebatir con este mismo prompt.

**Fix:** el mismo ancla temporal que CR-01, manteniendo la colisión de cuartetos que da valor al par:
```json
{ "prompt": "Io penso che lui ___ il lavoro in questo momento.", "correctIndex": 1 }
```
Colateral: la variante 1 (`Benché (aunque) tu ___ i compiti ogni giorno, il professore non è contento.`,
cuarteto `faccia/fai/facessi/facevi`) sufre la misma exposición en menor grado — conviene revisarla en
la misma pasada.

---

### CR-03: el «GATE HARD de no-correferencia» (D-42-06) no puede fallar por un cambio de contenido

**BLOCKER**
**File:** `tests/content-fare-congiuntivo.test.js:421-432`

**Issue:** el test que el plan declara como el gate más duro de la fase compara dos campos escritos a
mano de la MISMA fila de `VARIANT_TABLE`, una constante del propio fichero de test:

```js
if (row.mainPerson !== 'impersonal' && row.mainPerson === row.blankPerson) { sucio.push(...) }
```

`row.blankPerson` sí está anclado al contenido (en los 4 slots del paradigma se exige
`blankPerson === PERSON_CODES[k]` y `PRONOUNS[k].includes(blankSubject)`, líneas 410-416), pero
`row.mainPerson` **no se deriva ni se contrasta con el prompt en ningún punto del fichero**. El único
anclaje del sujeto de la principal es `prompt.includes(row.mainSubject)` (línea 439), que no dice nada
de su persona y que se salta entero cuando `mainSubject` es `null`.

Consecuencia: el gate solo detecta una errata en la tabla del test. Una violación real de
correferencia introducida en el JSON pasa en verde.

**Sustanciado por mutación** (M5, reproducible): sustituyendo el prompt de la variante 0 del disparador por

```
"Io penso che io ___ il lavoro che lui ha visto ogni giorno."
```

—que es, palabra por palabra, la forma que el `notes` del fichero cita como LA incorrecta
(«la forma correcta es Penso di fare i compiti y la incorrecta es Penso che io faccia i compiti»)—
la suite da **59 pass / 0 fail**. Se conservaron todos los literales declarados (`Io`, `lui`,
`penso che`, `il lavoro`), que es exactamente lo que un error de autoría real haría.

Contraste: la mutación M1, que sí rompía un literal declarado, dio 2 fails — es decir, lo que hoy
protege el fichero son los asserts de literalidad, no el gate.

**Fix:** derivar la persona de la principal del prompt en vez de declararla suelta. Mínimo viable:
exigir que el sujeto declarado de la principal y el pronombre del hueco no sean la misma cadena en el
texto, y anclar `mainPerson` a un léxico verbal:

```js
// La persona de la principal se DERIVA del prompt: el segmento anterior al
// disparador no puede contener el pronombre sujeto del hueco como sujeto.
const MAIN_VERB_PERSON = { penso: '1sg', so: '1sg', credevo: '1sg', sapeva: '3sg', /* ... */ };
eachVariant(id, (v, k) => {
  const row = VARIANT_TABLE[id][k];
  const antes = v.prompt.slice(0, v.prompt.search(new RegExp(row.blankSubject + '\\s+___', 'i')));
  const verbo = Object.keys(MAIN_VERB_PERSON).find((w) => new RegExp(`\\b${w}\\b`, 'i').test(antes));
  const derivada = verbo ? MAIN_VERB_PERSON[verbo] : 'impersonal';
  assert.equal(derivada, row.mainPerson,
    `D-42-06: ${id}#${k} la tabla declara mainPerson=${row.mainPerson} y el prompt deriva ${derivada}`);
  assert.notEqual(derivada === 'impersonal' ? null : derivada, row.blankPerson,
    `D-42-06: ${id}#${k} sujetos correferentes: "${v.prompt}"`);
});
```

## Warnings

### WR-01: los escaneos de blacklist / Phase-43 / participio concordado solo miran `options`, nunca `prompt`

**File:** `tests/content-fare-congiuntivo.test.js:538-560`
**Issue:** la cabecera del fichero (líneas 14-19) declara, en mayúsculas y como «no negociable», que
los escaneos de ausencia van «SIEMPRE por campo — `variants[].prompt` y `variants[].options[]`». Los
tres tests del bloque 6 recorren únicamente `v.options`. La documentación describe una cobertura que
el código no tiene.

Sustanciado por mutación, todas con 59 pass / 0 fail:
- **M2** — `'facci'` (blacklist D-42-11) inyectado en un prompt: verde.
- **M3** — `'farei'` (casilla de Phase 43) inyectado en un prompt: verde.
- **M4** — `'fatta'` (participio concordado, MAGNET de Phase 43) inyectado en un prompt: verde.

El riesgo no es teórico: los prompts de esta categoría contienen prosa italiana libre alrededor del
hueco (`il capo non disse niente`, `il professore non è mai contento`), que es justo donde una pasada
futura puede colar una forma prohibida sin darse cuenta.

**Fix:** recorrer `[v.prompt, ...v.options]` con coincidencia por palabra (no por subcadena — la
cabecera ya avisa de por qué), reutilizando el `wordish()` que ya existe en el fichero:

```js
for (const { slot, v, k } of allVariants()) {
  const campos = [v.prompt, ...v.options];
  const sucio = BLACKLIST.filter((f) => campos.some((c) => wordish(f).test(c)));
  assert.deepEqual(sucio, [], `D-42-11: ${slot.id}#${k} ofrece/menciona una forma atestiguada: ${sucio.join(', ')}`);
}
```

### WR-02: el chequeo de Phase-43 en prompt dice «en el fichero» pero recorre 1 de 30 prompts

**File:** `tests/content-fare-congiuntivo.test.js:746-752`
**Issue:** el mensaje del assert es
`'D-42-16: ninguna casilla de Phase 43 puede entrar en el fichero, ni en el prompt'`, pero el sujeto
escaneado es `D().variants[k]` — un único prompt, el de `Se io`. Es el caso concreto del patrón
general de WR-01: el mensaje describe algo estrictamente más fuerte que lo aseverado, y quien lea el
nombre del test creerá que el fichero está cubierto.

**Fix:** sacar el escaneo del test del `se` hipotético a un test propio sobre `allVariants()`:
```js
test('ninguna casilla de Phase 43 aparece en ninguno de los 30 prompts (D-42-16)', () => {
  const sucio = allVariants()
    .filter(({ v }) => PHASE43_FORMS.some((f) => wordish(f).test(v.prompt)))
    .map(({ slot, k, v }) => `${slot.id}#${k}: "${v.prompt}"`);
  assert.deepEqual(sucio, [], 'D-42-16: casilla de Phase 43 en un prompt');
});
```

### WR-03: el bloque 10 congela la ausencia del desambiguador temporal del slot del disparador

**File:** `tests/content-fare-congiuntivo.test.js:780-785`
**Issue:**
```js
assert.equal(conMarco, COMPOUND_SLOTS.includes(id) ? 6 : 0, `D-42-02: ${id} declara ${conMarco} marcos`);
```
El test exige activamente que el slot del disparador declare **cero** marcos. Los compuestos recibieron
un gate de marco (`frame`, bloque 8, líneas 679-690) precisamente porque su cuarteto de distractoras
abarca varios tiempos y sin marco «faccia y facessi serían defendibles» (palabras del `notes`). El
cuarteto del disparador abarca DOS tiempos y DOS modos y no lleva marco — y el test lo blinda. Es la
causa estructural de CR-01 y CR-02, y hace que arreglarlas obligue a tocar también este assert.

**Fix:** cambiar la aserción de «cero marcos» a «marco o ancla temporal equivalente», o introducir un
campo `timeAnchor` en las filas de `VARIANT_TABLE[TRIGGER_SLOT]` y exigirlo igual que `frame` en los
compuestos.

### WR-04: `assert.equal(({}).polluted, undefined)` es una aserción vacua

**File:** `tests/content-fare-congiuntivo.test.js:822`
**Issue:** `JSON.parse` crea `__proto__` como **own property**; nunca escribe en `Object.prototype`.
Verificado:
```
JSON.parse('{"__proto__":{"polluted":1}}')  ->  own keys: ['__proto__'],  ({}).polluted === undefined
```
La aserción no puede fallar por ningún contenido posible del JSON, y `polluted` no es una propiedad que
ningún módulo del proyecto escriba. Se lee como un gate anti-prototype-pollution y no lo es. El assert
que la precede (`claves.filter(...)` sobre `__proto__`/`constructor`/`prototype`) sí es real y basta.

**Fix:** eliminar la línea 822, o convertirla en algo con contenido, p. ej. comprobar que ningún objeto
parseado tiene un prototipo distinto de `Object.prototype`:
```js
const objetos = [];
(function walkObj(n){ if (Array.isArray(n)) n.forEach(walkObj);
  else if (n && typeof n === 'object') { objetos.push(n); Object.values(n).forEach(walkObj); } })(CONTENT);
assert.deepEqual(objetos.filter((o) => Object.getPrototypeOf(o) !== Object.prototype), []);
```

### WR-05: el índice en `categories.json` se codifica a mano cuando el comentario promete derivarlo

**File:** `tests/content-fare-indicativo.test.js:670-679` y `tests/content-fare-congiuntivo.test.js:934-941`
**Issue:** el comentario de la reescritura dice literalmente *«Se reescribe a la forma estable:
indice = order-1»*, pero el código aserta `assert.equal(idx, 14)` (y `assert.equal(idx, 15)` en el
análogo). El invariante enunciado no está codificado: son dos constantes independientes que casualmente
coinciden hoy. El mensaje del assert (`'order 15 -> indice 14'`) refuerza esa lectura falsa.

Nadie asserta además que el array esté globalmente ordenado por `order`, ni que los `order` sean únicos.

**Fix:** derivar de verdad, en los dos ficheros:
```js
const cat = entradas.find((c) => c.id === 'fare-indicativo');
const idx = entradas.indexOf(cat);
assert.equal(idx, cat.order - 1, 'D-41-16: el array define el display (indice = order - 1)');
```
Y, en uno solo de los dos, añadir el invariante global que hoy no cubre nadie:
```js
test('categories.json: orders únicos, contiguos desde 1, y array ordenado por order', () => {
  const orders = entradas.map((c) => c.order);
  assert.deepEqual(orders, entradas.map((_, i) => i + 1));
});
```

### WR-06: en el slot del disparador, `blankSubject` y `blankPerson` no están cruzados

**File:** `tests/content-fare-congiuntivo.test.js:401-419`
**Issue:** el assert `PRONOUNS[k].includes(row.blankSubject)` está gateado a
`if (PARADIGM_SLOTS.includes(id))`. Para `fare-congiuntivo-disparador` — cuyo eje NO es la persona, así
que `PERSON_CODES[k]` no aplica — no queda ninguna comprobación de que el pronombre que aparece en el
prompt sea el de la persona declarada. `blankPerson` es la entrada del cuarteto en el bloque 9
(`PERSON_INDEX[...blankPerson]`), así que una declaración incoherente desplaza silenciosamente el
criterio de todo el bloque 9.

**Fix:** sustituir el gate por un mapa pronombre→persona aplicable a los 5 slots:
```js
const PERSON_OF = { io: '1sg', tu: '2sg', lui: '3sg', lei: '3sg', noi: '1pl', voi: '2pl', loro: '3pl' };
assert.equal(PERSON_OF[row.blankSubject], row.blankPerson,
  `${id}#${k}: blankSubject "${row.blankSubject}" no es de la persona ${row.blankPerson}`);
```

## Info

### IN-01: `CANON` duplica verbatim los cuatro paradigmas

**File:** `tests/content-fare-congiuntivo.test.js:82-88` vs `99-102`
**Issue:** las cuatro filas del paradigma de `CANON` son copias literales de `CONG_PRES`, `CONG_IMPF`,
`CONG_PASS` y `CONG_TRAP`, declaradas 17 líneas más abajo. Editar una copia y no la otra desincroniza
la especificación en silencio: el bloque 2 compararía contra una tabla y los bloques 7-9 contra otra.
**Fix:** `const CANON = { 'fare-congiuntivo-presente': CONG_PRES, ... }` moviendo las cuatro constantes
por encima, y dejando solo la fila del disparador como literal (que sí es específica).

### IN-02: la «RED de seguridad» de indicativo compuesto no puede fallar de forma independiente

**File:** `tests/content-fare-congiuntivo.test.js:669-677`
**Issue:** el test anterior (líneas 653-667) fija las 3 distractoras a un conjunto CERRADO por igualdad
exacta. La intersección de `IND_COMPOUND` con ese universo cerrado es vacía (verificado), así que si el
test de conjunto cerrado pasa, este no puede fallar nunca. Es defensa en profundidad inofensiva pero
infla el conteo de tests sin añadir cobertura.
**Fix:** ninguna acción obligatoria; si se conserva, documentar en el comentario que es redundante por
construcción y no un gate independiente.

### IN-03: el `expected` dinámico hace tautológica la aserción de conteo

**File:** `tests/exercise-types.test.js:1295` y `1321-1327`
**Issue:** `expected: slotCountOf('content/exercises/fare-congiuntivo.json')` lee el conteo del mismo
fichero que después vuelve a leer y comparar (`assert.equal(data.exercises.length, expected)`). Para
todas las entradas dinámicas (desde `presente-regolare` hacia abajo) esa aserción no puede fallar.
La forma pedida por la fase (derivado, no mágico) se cumple; lo que se pierde es el gate de conteo.
El resto del describe (explanation no vacía, smart quotes, markdown, R1, R2) sí es cobertura real y sí
se aplica al fichero nuevo.
**Fix:** si el gate de conteo importa, el número de slots vive ya en
`tests/content-fare-congiuntivo.test.js:257-262` (`5 x 6 = 30`); dejarlo ahí y quitar la ilusión de
cobertura aquí, o comentar la vacuidad junto a la línea.

### IN-04: `slot-variants-integration.test.js` sigue ciego a la categoría nueva

**File:** `tests/fixtures/slot-variants-integration.test.js:168-184`
**Issue:** `REAL_CATEGORIES` termina en `riflessivi`; ni `fare-indicativo` ni `fare-congiuntivo` están.
Además el fichero vive en `tests/fixtures/`, así que el glob `node --test tests/*.test.js` no lo
ejecuta. El `notes` del contenido declara este count-sync diferido a Phase 44 / INT-02 y advierte que
el efecto es «ciego, no rojo», que es peor que un rojo. Se registra aquí para que no se pierda: la
fase 42 añade una categoría más a la lista de invisibles.
**Fix:** ninguna en esta fase (diferido por decisión). Al llegar a Phase 44, añadir las 4 categorías de
`fare` y mover el fichero al glob o documentar su comando de ejecución.

### IN-05: no se comprueba que cada prompt tenga EXACTAMENTE un hueco

**File:** `tests/content-fare-congiuntivo.test.js:382-385`
**Issue:** el test usa `v.prompt.includes('___')`. Un prompt con dos huecos (o con `______` por un
typo) pasa en verde y rompería el render, ya que el motor sustituye un único hueco.
**Fix:** `assert.equal(v.prompt.split('___').length - 1, 1, ...)`.

### IN-06: la dosificación D-42-14 solo se comprueba en negativo

**File:** `tests/content-fare-congiuntivo.test.js:833-844`
**Issue:** el test verifica que el disparador DESARROLLE la interferencia y que los compuestos NO la
repitan, pero no verifica el tercer tramo de la decisión: que presente e imperfetto lleven la línea de
recordatorio. Hoy ambas explanations sí la llevan (`penso che pide subjuntivo en italiano mientras que
su equivalente castellano pide indicativo`), así que el contenido es correcto; lo que falta es el gate.
**Fix:**
```js
for (const id of SIMPLE_SLOTS) {
  assert.match(byId(id).explanation, /penso che pide subjuntivo/,
    `D-42-14: ${id} debe llevar la línea de recordatorio de interferencia`);
}
```

---

_Reviewed: 2026-08-06T07:56:54Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
