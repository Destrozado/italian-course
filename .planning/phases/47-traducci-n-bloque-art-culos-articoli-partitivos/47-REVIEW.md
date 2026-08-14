---
phase: 47-traducci-n-bloque-art-culos-articoli-partitivos
reviewed: 2026-08-14T22:12:50Z
depth: deep
files_reviewed: 5
files_reviewed_list:
  - scripts/validate-translation-pass.mjs
  - scripts/run-validation-271.mjs
  - tests/translation-validator.test.js
  - tests/screen-translation.test.js
  - tests/count-arrays-lockstep.test.js
findings:
  critical: 2
  warning: 6
  info: 4
  total: 12
status: issues_found
---

# Phase 47: Code Review Report

**Reviewed:** 2026-08-14T22:12:50Z
**Depth:** deep (análisis cruzado + verificación por mutación en clon exacto)
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Rango establecido y verificado: **32 commits**, `da06087..9935c14` (el enunciado
decía 30; `git log --oneline --grep="47-0"` y `git rev-list da06087~1..9935c14`
coinciden en 32). La superficie de código/test realmente tocada es de **4
ficheros / 122 líneas**; `tests/count-arrays-lockstep.test.js` **no cambió** esta
fase, pero se ha revisado porque el gate anti-ceguera es el que gobierna el array
nuevo. El enunciado atribuye a `tests/translation-validator.test.js` el arreglo
del mensaje de quórum que prometía «…y sin override del autor»: ese arreglo vive
en realidad en **`tests/screen-translation.test.js:516-551`**.

**Invariantes brownfield: los tres se cumplen.** `git diff --name-only
da06087~1..9935c14 -- src/` devuelve vacío (`src/domain/` y `src/screens/app.js`
byte-intactos) y `CURRENT_SCHEMA_VERSION` sigue en 13
(`src/data/backup.js:61`). El manejo de secretos es correcto en lo esencial:
`.env` está en `.gitignore`, la clave viaja siempre en header
(`validate-translation-pass.mjs:300,307`), nunca se imprime, y ningún fichero de
`content/exercises/` contiene material de clave.

Lo que **sí** aparece son dos agujeros de gate probados por mutación, ambos del
linaje exacto que este repo ya ha pagado dos veces:

1. el escritor de pases puede convertir un `disputed` en `validated` **borrando**
   el `incorrecta` — sin override, sin motivo escrito y sin dejar rastro en el
   JSON; y
2. `TRAD-COV` deja el denominador encoger en silencio si desaparece una
   **variante** traducida (la mutación 1 del plan 47-04 vació los `passes` y sí
   se puso roja; borrar la variante entera **no**).

Las dos mutaciones se ejecutaron sobre un clon exacto (`cp -a`) con paridad de
baseline confirmada (4 fallos pre-existentes, WINDOWS id 17), y el árbol real
quedó sin tocar. Se han contrastado `.planning/WINDOWS.md` (ids 17, 21, 22,
36-40), `47-MUTACIONES-EVIDENCIA.md` y `deferred-items.md`: **ninguno de los 12
hallazgos de abajo está ya registrado** — en particular D-47-A (el espacio de la
elisión en el render de la app) queda fuera por estar ya anotado y diferido.

---

## Critical Issues

### CR-01: el escritor de pases borra el `incorrecta` previo del mismo modelo y limpia el `disputed` sin dejar rastro

**File:** `scripts/validate-translation-pass.mjs:688`
(mismo patrón en `scripts/validate-ai-pass.mjs:271`,
`scripts/validate-song-pass.mjs:316`, `scripts/validate-decoy-pass.mjs:269`)

**Issue:** la rama UPDATE de `applyPassToText` deduplica por `by`:

```js
const passes = (Array.isArray(cur.passes) ? cur.passes : []).filter((p) => p.by !== pass.by);
passes.push(pass);
const status = deriveStatus(passes);
```

Si el modelo X ya emitió `incorrecta` y se le vuelve a invocar, su pase anterior
**se elimina** del array antes de derivar el status. `deriveStatus` no puede
aplicar el sticky sobre un pase que ya no existe, así que la traducción pasa de
`disputed` a `validated` **sin `override: true`, sin motivo escrito y sin ninguna
huella en el fichero**. Verificado por ejecución real sobre un clon
(`partitivos-qualche#0`):

```
TRAS EL INCORRECTA        -> status: disputed  | gemini-3.5-flash-lite:correcta, deepseek-chat:incorrecta
TRAS RE-CORRER EL MISMO   -> status: validated | gemini-3.5-flash-lite:correcta, deepseek-chat:correcta
¿queda rastro del incorrecta en el JSON? false
```

Por qué importa aquí y no es teoría: con `--temp=0.2` el veredicto de un mismo
modelo **no es determinista**, así que esta ruta es literalmente «re-tirar los
dados sobre el fallo hasta que pase» — el sesgo de selección que el propio autor
razonó y eliminó al decidir la opción B+ (WINDOWS id 38: «re-juzgar solo las que
fallaron sería re-tirar los dados sobre los fallos con un dado distinto»). El
proyecto tiene un mecanismo de primera clase para resolver una disidencia
(`by:"autor"` + `override:true` + motivo en `concerns`, G-42-3) que exige trabajo
y deja el disenso legible; esta ruta lo puentea entera y es **más silenciosa** que
él. Ningún gate la ve: `VAL-09`/`TRAD-COV` comparan escrito-vs-derivado, y aquí
los dos coinciden porque el pase desapareció de los dos lados.

Colateral relacionado y comprobado: los 62 pases `deepseek-chat` retirados de
`articoli` en `264dd19` —8 de ellos `incorrecta`— dejan el JSON con aspecto de
quórum limpio que nunca disputó nada; el audit trail vive solo en git y en el
SUMMARY. Esa decisión está adjudicada por el autor y registrada (WINDOWS id 38) y
**no se re-litiga aquí**; lo que se señala es que el código no distingue esa
retirada deliberada de un borrado accidental, porque no hay invariante de
append-only en ninguna parte.

**Fix (hipótesis, no evidencia — lo que tendría que ser cierto y cómo verificarlo):**
la corrección sólo es correcta si (a) re-correr un modelo sigue siendo posible
para *sustituir* un pase, y (b) ningún flujo legítimo de las Phases 48-53
necesita que un `incorrecta` desaparezca sin adjudicación. Ambas cosas se pueden
comprobar contra el corpus antes de tocar nada.

```js
// scripts/validate-translation-pass.mjs, rama UPDATE
const previos = Array.isArray(cur.passes) ? cur.passes : [];
const sustituido = previos.find((p) => p.by === pass.by);
if (sustituido?.verdict === 'incorrecta' && pass.verdict !== 'incorrecta') {
  throw new Error(
    `${slotId}#${k}: ${pass.by} ya emitió un \`incorrecta\` sobre esta traducción. ` +
    `Sobrescribirlo BORRARÍA el disenso y limpiaría el disputed sin override ni motivo. ` +
    `Un incorrecta se resuelve con trabajo (segundo juez, enmienda del doc) o con un ` +
    `override de autor explícito — nunca re-tirando el dado contra el mismo modelo. ` +
    `El pase nuevo va impreso en stdout.`
  );
}
const passes = previos.filter((p) => p.by !== pass.by);
```

**Verificación exigida (regla de la casa: el fix del revisor también se muta):**
1. Golden fail-first en `tests/translation-validator.test.js`: `incorrecta` de X →
   escribir `correcta` de X → esperar `throws`. Debe fallar contra el código
   actual (hoy devuelve `validated`).
2. Mutación en clon: repetir la secuencia de arriba y observar que el JSON queda
   **byte a byte** como antes del segundo pase y el exit code es 3 (pase pagado,
   no escrito) y no 0.
3. Control de no-regresión: re-correr un modelo cuyo pase previo era `correcta`
   debe seguir sustituyendo sin error — si no, el flujo de re-validación completa
   de 47-02 (las 32 + las 4) dejaría de ser posible.

---

### CR-02: `TRAD-COV` deja encoger el denominador en silencio — borrar una variante traducida sale VERDE en el reporter y en la suite entera

**File:** `scripts/run-validation-271.mjs:372-396, 407-415, 921-926`

**Issue:** `TOTAL_TRANSLATION_EXPECTED` se deriva de `mcVariantCountOf(file)`, y
`surfaces`/`validated` se cuentan recorriendo **el mismo fichero**. Si desaparece
una variante `multiple-choice` ya traducida y validada, los **tres** sumandos
bajan a la vez y las dos igualdades del veredicto siguen cuadrando:

```js
totalTranslationValidated === TOTAL_TRANSLATION_EXPECTED &&
totalTranslationActual    === TOTAL_TRANSLATION_EXPECTED
```

Verificado por mutación en clon exacto (`cp -a`, baseline de paridad confirmada:
4 fallos pre-existentes), borrando la última variante de `articoli-il-cons`
—traducida y `validated`—:

```
=== SUITE ===     # fail 4      (idéntico al baseline: NINGÚN test mordió)
=== REPORTER ===  TRAD-COV (205/205 traducciones validated): PASS (205/205)
                  Milestone gate PASS.   REPORTER_EXIT=0
```

El corpus perdió una traducción validada y **todo salió verde con una cifra
distinta**. Es el `PASS (144/144)` de la Phase 46 un nivel de granularidad más
abajo: el gate anti-ceguera de `tests/count-arrays-lockstep.test.js` sólo protege
la **categoría** (`categoriasDeclaradasCubiertas()`, línea 386, exige ≥1 variante
con `translationES`), no la **variante**. `VAL-06` tampoco lo ve porque el número
de slots no cambia.

La mutación 1 del plan 47-04 **no** cubre este vector: vació `validation.passes`
dejando la variante en su sitio, lo que sí baja `validated` sin bajar `expected`
y sí se pone rojo. Borrar la variante mueve los dos lados a la vez.

**Fix (hipótesis, no evidencia):** hace falta un ancla que **no** se derive del
mismo fichero en la misma corrida — si se deriva, vuelve a ser tautológica y el
gate se pierde conservando la forma (el caveat de
`tests/exercise-types.test.js:1328-1334`). Dos formas defensibles, y la elección
es del autor porque cambia la ergonomía de las Phases 48-53:

- **(a) monotonía por categoría**, congelada en disco y fechada: un
  `content/translation-coverage.lock.json` con `{ slug: <nº de variantes mc> }`
  que el reporter confronte y que sólo se re-emita con un gesto explícito del
  autor. Cierra el vector; el precio es un fichero que hay que bumpear a
  propósito cada vez que crece una categoría.
- **(b) ancla en el gate anti-ceguera**: extender
  `categoriasDeclaradasCubiertas()` para devolver también el conteo y asertar
  contra los `expected` que el reporter declara — pero hoy los dos leerían el
  mismo JSON, así que **sin (a) esto no muerde** y sería un gate vacuo con
  aspecto de vigilar. Anotado explícitamente porque es la salida que parece
  natural y no lo es.

**Verificación exigida:** repetir exactamente la mutación de arriba (borrar una
variante traducida de una categoría cubierta) sobre un clon y observar exit 1 con
mensaje que nombre la categoría y el delta; y el control positivo de que
**añadir** una variante nueva sin traducir siga saliendo rojo por cobertura
incompleta y no por el ancla nueva, para que las dos causas no se fundan.

---

## Warnings

### WR-01: `fillGap` deja la frase italiana en minúscula inicial cuando el hueco abre el `prompt` — 11 de las 62 variantes de Articoli se enviaron así al quórum de pago

**File:** `scripts/validate-translation-pass.mjs:233-245`

**Issue:** las tres ramas de `fillGap` sustituyen el hueco por la opción tal cual.
Cuando el `prompt` **empieza** por `___` y la opción es un artículo en minúscula,
el `italianoResuelto` que viaja en el payload no es italiano ortográficamente
válido. Barrido sobre el corpus traducido completo: **12 casos**, 11 en `articoli`
(esta fase) y 1 en `preposiciones` (Phase 46):

```
articoli-la-invariable#0  "___ casa di mia nonna è grande."   -> "la casa di mia nonna è grande."
articoli-304#0            "___ uova sono nel frigorifero."    -> "le uova sono nel frigorifero."
articoli-l-fem-vocal#0    "___ amica di Sofia è spagnola."    -> "l'amica di Sofia è spagnola."
… (articoli-l-fem-vocal#2, -i-plural#1, -le-invariable#0/#2, -300, -301, -302, -303, -305)
```

Es **exactamente la misma clase de defecto** que motivó la excepción del marcador
nulo, y el doc-block de esa excepción (líneas 214-232) escribe la doctrina que
aquí no se aplicó: «el evaluador que la recibe tiene razón al marcarla bajo S5, y
ese `incorrecta` NO es un falso positivo del criterio: es un defecto de lo que le
enviamos. Por eso el arreglo vive AQUÍ». Ninguno de los 24 pases sobre esas 11
variantes levantó el punto —se comprobó grepeando sus `concerns`—, pero eso es
suerte del evaluador, no ausencia de defecto: el mismo doc-block razona que
mandar una cadena mal construida ablanda S5 en vez de dejar de generarla. Con
~720 traducciones por delante en las Phases 48-53, la superficie crece.

Agravante de forma: el golden nuevo
`tests/translation-validator.test.js:564` **congela el defecto**:
`fillGap('___ pane è buono.', NULO, 0) === 'pane è buono.'`. El mensaje («hueco
inicial: sin espacio suelto delante») es honesto sobre lo que comprueba, pero la
aserción fija de paso una `p` minúscula al principio de frase como comportamiento
esperado.

**Fix (hipótesis):** sólo es correcto si en el corpus **no** existe ninguna
opción que deba permanecer en minúscula a principio de frase (por ejemplo un
marcador de notación). Comprobable con el mismo barrido de arriba antes de
tocar nada.

```js
// al final de fillGap, común a las tres ramas
const capitalizarSiAbre = (frase, promptOriginal) =>
  /^\s*___/.test(promptOriginal) && frase
    ? frase[0].toLocaleUpperCase('it') + frase.slice(1)
    : frase;
```

**Verificación exigida:** golden fail-first sobre las 3 ramas (`'___ casa …'`,
`"___ amica …"` con `l'`, y `'___ pane è buono.'` con `∅`) que falle contra el
código actual; y barrido de mutación sobre el corpus confirmando que las 12
direcciones cambian y **sólo** esas 12 (las otras 194 traducciones deben quedar
byte a byte iguales).

---

### WR-02: los dos invariantes de corpus en que se apoyan las ramas nuevas de `fillGap` viven en PROSA, no derivados del disco

**File:** `scripts/validate-translation-pass.mjs:188-212`

**Issue:** las dos ramas nuevas descansan sobre afirmaciones fechadas escritas en
comentario:

- «Hoy sólo existe una [marcador nulo] en todo el corpus, `"∅ / sin partitivo"`
  del slot `partitivos-negativa`» (línea 189-191);
- «el único caso de apócope del corpus, `fa' una foto`» (línea 209-210).

Ambas son **ciertas hoy** —verificado por barrido: 4 ocurrencias de una única
notación `∅`, 1 apócope (`fa'`, en `fare-cond-imperativo`), 84 opciones elididas
en 5 formas, 0 apóstrofos tipográficos `’`— pero **nada las deriva del disco**.
Si una fase futura da de alta un segundo marcador nulo con otra notación (`—`,
`(nada)`, `Ø` U+00D8) o una apócope nueva, `MARCADOR_NULO` / `OPCION_ELIDIDA`
dejan de casar, la frase malformada vuelve al evaluador y **ningún test se pone
rojo**. Es el patrón que este repo ya congeló con la lección «un gate que
assertea una cifra escrita en el `notes` sin derivarla del disco certifica en
verde un número obsoleto»: aquí la cifra es «una notación / una apócope», y el
riesgo es idéntico. Nota concreta: `fare-cond-imperativo` (donde vive `fa'`)
todavía **no** está en `TRANSLATION_COVERAGE`, así que el contraejemplo de la
apócope hoy sólo existe como golden sintético; entra en producción en las
Phases 48-53.

**Fix (hipótesis):** un test derivado del disco, no una lista escrita:

```js
// tests/translation-validator.test.js
test('el corpus no declara ninguna notación de ausencia que MARCADOR_NULO no reconozca', () => {
  const sospechosas = todasLasOpciones()
    .filter((o) => /(^|\s)(∅|Ø|—|–|\(nada\)|\(niente\)|sin\s)/i.test(o))
    .filter((o) => !MARCADOR_NULO.test(o));
  assert.deepEqual(sospechosas, [], 'notación de ausencia nueva: fillGap la incrustaría en la frase');
});
```

**Verificación exigida:** el test debe ponerse rojo al inyectar en un clon una
opción `"— / sin partitivo"` en un slot cualquiera, y volver a verde al
restaurar. Sin esa mutación el test es una afirmación, no una garantía.

---

### WR-03: la mitad de `CATEGORIES.expected` sigue siendo literal congelado, y el guard sólo compara SUMAS — el drift compensado sale verde

**File:** `scripts/run-validation-271.mjs:299-323, 339-349, 730-732`

**Issue:** 9 de las 18 entradas usan `slotCountOf(file)` (derivado) y las otras 9
llevan una cifra escrita a mano (`preposiciones: 50`, `articoli: 34`,
`avere: 20`, `essere: 26`, `genero-numero: 13`, `partitivos: 19`,
`profesiones: 11`, `sustantivos-irregulares: 5`, `verbos-movimiento: 7`), pese a
que el propio fichero declara D-31-06 «NUNCA un número mágico» (línea 293-295).
El guard de coherencia (339-349) confronta **Σ literales vs Σ disco**, así que un
drift en una sola categoría sí se caza — pero dos drifts que se compensan pasan.
Verificado por mutación en clon (mover `avere-ragione` de `avere.json` a
`essere.json`: 20→19 y 26→27):

```
→ Total 19 ≠ esperado 20 para avere        (warning IMPRESO)
→ Total 27 ≠ esperado 26 para essere       (warning IMPRESO)
  VAL-06 (250/250 validated): PASS (250/250)
Milestone gate PASS.
```

El aviso por categoría de la línea 730-732 **no lo consume ningún sub-gate**:
`val06Pass` sólo mira `totalValidated`/`totalActual`. Es literalmente la forma que
el CR-03 de la Phase 44 arregló para `VAL-09` («era un warning meramente
impreso, y mientras lo fue el reporter podía cerrar el milestone contradiciendo
el fichero que acababa de leer») dejada viva un nivel más abajo. Nota: el
`TRANSLATION_COVERAGE` que añade esta fase **sí** deriva sus tres `expected` —
esa parte está bien hecha; lo que queda desalineado es el array veterano de al
lado.

**Fix (hipótesis):** dos cambios independientes, y conviene no confundirlos.

1. Sustituir los 9 literales por `slotCountOf(...)`, uniformando el array. **Sólo
   es correcto si** ninguna de esas 9 cifras codifica hoy una discrepancia
   deliberada con el disco — se comprueba imprimiendo `expected` vs
   `slotCountOf(file)` por categoría **antes** de tocar nada (hoy cuadran las 18;
   si alguna no cuadrase, sustituirla borraría un rojo legítimo).
2. Consumir el aviso por categoría en el veredicto:
   `const val06Pass = … && perCategory.every(r => r.loadError || r.total === r.expected);`

**Verificación exigida:** repetir la mutación del movimiento de slot entre dos
categorías **no** cubiertas de traducción y observar exit 1; y el control de que
la corrida limpia sigue en exit 0. Ojo con el precedente citado en la memoria del
proyecto: un fix de revisor sobre este mismo array llegó a blanquearlo entero, así
que la edición debe verificarse con `git diff` sobre las 18 líneas y no sólo con
el exit code.

---

### WR-04: nada exige motivo escrito en un `override` de TRADUCCIÓN — la guarda existe para los slots y no se replicó para la unidad nueva

**File:** `tests/screen-translation.test.js:516-551`

**Issue:** la rama nueva reconoce el override con
`p?.by === 'autor' && p?.verdict === 'correcta' && p?.override === true` y exige,
correctamente, ≥1 `correcta` de un modelo. Pero **no comprueba que el override
lleve motivo escrito**. Esa guarda sí existe para las validaciones de slot
(`tests/content-fare-cond-imperativo.test.js:1615-1617`,
`content-fare-congiuntivo.test.js:1356-1359`,
`content-fare-indefiniti.test.js:2102`), con el razonamiento explícito «un
override sin motivo escrito es indistinguible de un descuido». El corpus de
traducción tiene ya **2 overrides** (`partitivos-qualche#2`, `articoli-lo-z#1`),
los dos con motivo largo — así que el test pasaría hoy; el problema es que no
puede fallar si el tercero llega vacío, y las Phases 48-53 traen 720 traducciones
más.

Nota de calibración, no de defecto: la rama es fiel a `deriveStatus`
(`src/data/validation-state.js:69-80`), incluido que un override sostenga un
`validated` con **autor + 1 modelo** — que es lo que hoy sostiene
`partitivos-qualche#2` (2 `incorrecta` de DeepSeek + 1 `correcta` de Gemini +
autor). Eso está adjudicado y registrado (WINDOWS id 35, `open` a propósito) y no
se re-abre aquí.

**Fix:**

```js
if (hayOverride) {
  const overrides = val.passes.filter(esOverrideDelAutor);
  assert.ok(
    overrides.every((p) => Array.isArray(p.concerns) && p.concerns.some((c) => c.trim().length > 0)),
    `${rel} · ${addr}: override del autor SIN motivo escrito — indistinguible de un descuido`
  );
  assert.ok(correctas.some((p) => p?.by && p.by !== 'autor'), …);
}
```

**Verificación:** mutar en clon el `concerns` del override de `articoli-lo-z#1` a
`[]` y observar el rojo con esa dirección compuesta nombrada; restaurar y volver
a verde.

---

### WR-05: `fillGap` pasa la `option` como cadena de REEMPLAZO de `String.replace`, así que `$&`, `$'`, `` $` `` y `$n` se interpretan

**File:** `scripts/validate-translation-pass.mjs:243-244`

**Issue:** las dos ramas no-nulas hacen
`prompt.replace(/___\s*/, opt)` y `prompt.replace('___', opt)`. El segundo
argumento de `replace` es un **patrón de sustitución**, no un literal.
Comprobado ejecutando:

```
fillGap('Compro ___ pane.', ['$&del'], 0)  ->  "Compro ___del pane."   // $& reinserta el hueco
fillGap('Compro ___ pane.', ["d$'"],  0)   ->  "Compro d pane. pane."  // $' duplica la cola
```

Hoy es inalcanzable —ninguna opción del corpus contiene `$`— así que es
robustez, no un defecto vivo. Pero la rama afectada es justamente la de las
opciones con apóstrofo, y `$'` son dos caracteres; el fallo sería silencioso
(frase malformada enviada al evaluador de pago) y no lo cazaría ningún gate.

**Fix:** usar la forma de función, que trata el valor como literal:

```js
if (OPCION_ELIDIDA.test(opt)) return prompt.replace(/___\s*/, () => opt);
return prompt.replace('___', () => opt);
```

**Verificación:** golden con `['$&del']` y `["d$'"]` que falle contra el código
actual (hoy devuelve las cadenas de arriba) y pase tras el cambio, más control de
no-regresión sobre las 206 traducciones (el `italianoResuelto` de las 206 debe
quedar byte a byte idéntico).

---

### WR-06: los ficheros temporales del escritor atómico no están en `.gitignore`

**File:** `scripts/validate-translation-pass.mjs:818`

**Issue:** la escritura atómica crea `${file}.tmp-${process.pid}` **en el mismo
directorio** que el corpus. `git check-ignore` confirma que no está ignorado:

```
$ git check-ignore -v "content/exercises/articoli.json.tmp-1234"
NO IGNORADO
```

El doc-block razona que `findSlot` no puede verlo porque filtra por `.json`
—cierto—, pero no cubre el otro consumidor: un `git add -A` tras una corrida
muerta commitearía una copia completa y desfasada del corpus. `.gitignore` ya
ignora los `*.lock` de `scripts/lib/file-lock.mjs` por el razonamiento
equivalente («un `.lock` en el árbol es residuo de una corrida muerta, nunca
contenido»); la misma frase vale aquí y no se escribió.

**Fix:** añadir a `.gitignore`:

```
# Temporales de la escritura atómica de los scripts de pase (rename-based).
# Un `.tmp-<pid>` en el árbol es residuo de una corrida muerta, nunca contenido.
*.json.tmp-*
```

**Verificación:** `git check-ignore -v content/exercises/articoli.json.tmp-1234`
debe devolver la regla; y `git status --porcelain` tras interrumpir una escritura
en un clon debe salir limpio.

---

## Info

### IN-01: `loadEnv` conserva el whitespace final del valor

**File:** `scripts/validate-translation-pass.mjs:124-125`
**Issue:** `(.*)` es codicioso, así que `\s*$` no recorta nada:
`GEMINI_API_KEY=xyz ` se carga como `"xyz "` y viaja al header con el espacio →
401 en vez de un diagnóstico. (El caso CRLF **sí** está cubierto por accidente:
`.` en regex JS no casa `\r`, comprobado.)
**Fix:** `out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');`

### IN-02: la rama del marcador nulo normaliza la puntuación de TODA la frase, no sólo la del hueco

**File:** `scripts/validate-translation-pass.mjs:240`
**Issue:** `.replace(/\s+([.,;:!?])/g, '$1')` es global. Comprobado:
`fillGap('Non compro ___ pane , grazie .', ['∅ / sin partitivo'], 0)` →
`"Non compro pane, grazie."` — el arreglo silenció dos erratas de autoría a dos
tokens del hueco, así que el evaluador nunca las ve.
**Fix:** anclar la limpieza al punto de corte, p. ej. reconstruyendo con
`prompt.slice(0, i)` / `prompt.slice(j)` en vez de un `replace` global.

### IN-03: `regionCruda` no contiene la región cruda

**File:** `tests/count-arrays-lockstep.test.js:1030`
**Issue:** `const regionCruda = regionDeArray(crudo, ARRAY_DE_TRADUCCION)` — pero
`regionDeArray` devuelve el texto **ya limpio** de comentarios (su propio
doc-block, línea 330, lo dice). El comportamiento es correcto; el nombre miente y
en este fichero la distinción crudo-vs-limpio es load-bearing.
**Fix:** renombrar a `regionLimpia`.

### IN-04: `TRANSLATION_COVERAGE` rompe la convención de orden que el fichero declara

**File:** `scripts/run-validation-271.mjs:407-411`
**Issue:** `CATEGORIES` documenta «D-VAL-22 orden lockeado: riesgo-first
(preposiciones) + alfabético resto» y lo cumple; el array nuevo va
`preposiciones, partitivos, articoli` — riesgo-first correcto, resto en orden de
llegada. El golden `ORDERING` (línea 1330) prueba que el veredicto es
insensible al orden, así que es puramente legibilidad, pero con 18 categorías por
delante el array se vuelve ilegible sin convención.
**Fix:** reordenar a `preposiciones, articoli, partitivos` y anotar la
convención en el bloque de arriba, como hace `CATEGORIES`.

---

## Lo que se comprobó y está BIEN

Se registra porque un review que sólo lista defectos no dice dónde se miró:

- **Invariantes brownfield:** `src/` sin un solo byte de diff en los 32 commits;
  `CURRENT_SCHEMA_VERSION` = 13.
- **Secretos:** clave siempre en header (`x-goog-api-key` / `Authorization`),
  nunca en URL, nunca en log, nunca en mensaje de error; `.env` ignorado;
  `.env.example` es el único trackeado; cero material de clave en
  `content/exercises/`.
- **Salida no confiable del modelo escrita al corpus:** el camino está bien
  cerrado — contrato §4 derivado del propio doc (`parseContrato`, con cláusula de
  no-vacuidad), `concerns` sin coerción, `verificarPostcondicion` re-parsea el
  documento entero y exige (1) JSON válido, (2) bloque idéntico al compuesto y
  (3) cero contaminación fuera del bloque. Un `concerns` con llaves, comillas o
  emoji no puede descuadrar el splice.
- **`fillGap`, ramas nuevas:** el discriminador ortográfico consonante-vs-vocal
  ante apóstrofo es **correcto** para todo el corpus (84 elisiones en 5 formas,
  1 apócope, 0 apóstrofos tipográficos), y el contraejemplo `fa' una foto` está
  bien elegido: es el único caso que el criterio ingenuo («la siguiente empieza
  por vocal») habría roto.
- **Mensajes vs aserciones:** revisadas una a una las 10 aserciones nuevas de
  `translation-validator.test.js` y `screen-translation.test.js`. Ninguna promete
  más de lo que comprueba; el defecto de esa clase que la fase encontró está
  efectivamente cerrado.
- **`TRANSLATION_COVERAGE`:** los tres `expected` se derivan
  (`mcVariantCountOf`), la suma también, `TRAD-COV` tiene cláusula de
  no-vacuidad **antes** del veredicto y distingue las tres causas de rojo. La
  ceguera a nivel de **categoría** está genuinamente cerrada por `GATE-02`
  (`categoriasDeclaradasCubiertas()` deriva la referencia del disco). Lo que
  queda abierto es sólo la granularidad de variante (CR-02).
- **Baseline respetado:** los 4 fallos de `requirements-traceability` (WINDOWS id
  17), el `VAL-08 PASS` sobre un `disputed` de traducción (id 40) y los backstops
  21/22 no se reportan como novedad.

---

_Reviewed: 2026-08-14T22:12:50Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: deep — 2 mutaciones ejecutadas en clones `cp -a` con paridad de baseline; árbol real sin tocar_
