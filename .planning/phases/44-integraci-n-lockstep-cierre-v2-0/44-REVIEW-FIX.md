---
phase: 44-integraci-n-lockstep-cierre-v2-0
fixed_at: 2026-08-12T09:30:21Z
review_path: .planning/phases/44-integraci-n-lockstep-cierre-v2-0/44-REVIEW.md
iteration: 1
fix_scope: critical
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
action_required: true
---

# Phase 44: Code Review Fix Report

**Fixed at:** 2026-08-12
**Source review:** `.planning/phases/44-integraci-n-lockstep-cierre-v2-0/44-REVIEW.md`
**Iteration:** 1
**Scope:** los 4 Critical (CR-01..CR-04). Los 13 Warnings quedan FUERA por decisión del autor.

**Summary:**
- Findings in scope: 4
- Fixed: 4
- Skipped: 0

## Dónde se verificó

`workflow.use_worktrees` está en `false` en `.planning/config.json`, así que se editó y se
commiteó **en el checkout principal**, sin worktree. Todas las cifras de abajo son
reproducibles desde el árbol que estás mirando. Node v22.20.0.

**Baseline al empezar:** `# tests 1092 / # pass 1092 / # fail 0`; reporter
`VAL-06 (250/250 validated): PASS`, `Milestone gate PASS`, exit 0.

**Estado al terminar:** `# tests 1101 / # pass 1101 / # fail 0` (+9 tests: 5 goldens de
CR-01, 2 de CR-02, 2 de CR-04). El reporter ahora sale **rojo, y a propósito** — ver
CR-03, que es lo único de este informe que te pide una decisión.

`git status --short` al terminar muestra solo `M .planning/config.json`, que ya estaba
modificado antes de empezar. `content/exercises/*.json` no se tocó en ningún momento:
las mutaciones de verificación de CR-02 y CR-04 se hicieron sobre **copias** del JSON
(`tests/zz-mutant-*.json`, borradas al acabar), nunca sobre el contenido real.

---

## ⚠️ ACCIÓN REQUERIDA: el gate de milestone está en rojo tras CR-03

Esto no es un fallo del arreglo, es el arreglo funcionando, y no puedo cerrarlo yo porque
la salida está en `content/` (fuera de mi ámbito) o en `deriveStatus` (tu decisión).

```
VAL-06 (250/250 validated): FAIL (248/250 — pending=0, missing=0, disputed=2)
VAL-08 (cero disputed): FAIL (2 disputed: avere-passato-prossimo, profesiones-invariabili)
VAL-09 (status escrito == derivado): FAIL (2 desincronizados: ...)
Milestone gate FAIL
exit=1
```

`avere-passato-prossimo` y `profesiones-invariabili` son **overrides tuyos reales**,
escritos el 2026-05-27 con `[override]` como primer token de `concerns` pero **sin el flag
`override: true`**, porque el flag no existía hasta G-42-3 (Phase 42). Sustantivamente
cumplen: los dos tienen quórum y al menos un pase de modelo. Lo único que les falta es el
flag. Y `src/data/validation-state.js:29` se niega **deliberadamente** a inferir el
override «por lectura de un prefijo en `concerns`», así que la fuente única los llama
`disputed` a conciencia. **El rojo es verdadero, no un falso positivo.**

Las dos salidas, las dos de una línea y las dos tuyas:

1. **Migrar los dos** (lo que la propia cabecera de `validation-state.js` describe como la
   deuda pendiente): añadir `"override": true` a la entry `by: "autor"` de
   `avere-passato-prossimo` y de `profesiones-invariabili`. Verificado en seco: con el flag
   puesto, `deriveStatus` devuelve `validated` para los dos y el gate vuelve a verde.
   `partitivos-negativa` también tiene un pase de autor sin flag pero **no** necesita
   migración: no lleva ningún `incorrecta`, así que ya deriva `validated` por quórum.
2. **Decidir que no eran overrides** y reabrirlos por la cola D-VAL-25/26.

No he hecho ninguna de las dos porque las dos son ediciones de contenido o de política, y
el scope de este pase era cerrar blockers de gates.

---

## Fixed Issues

### CR-01: el gate anti-ceguera era ciego a las entradas comentadas en bloque

**Files modified:** `tests/count-arrays-lockstep.test.js`
**Commit:** `5482f2f`

**Fix aplicado.** La ausencia de comentario dejó de codificarse *dentro* del ancla y se
garantiza *antes*: nuevo `sinComentarios(src)` exportado que blanquea el contenido de los
comentarios `//` y `/* */` preservando saltos de línea y longitud (para que el flag `m` y
los números de línea sigan valiendo), aplicado como primer paso en **`slugsCiegos` Y
`paresSlugFile`** — los dos, porque comparten el ancla de entrada y el agujero estaba en
los dos. Con `paresSlugFile` ciego al bloque, los pares fantasma seguían cuadrando
`pares.length` contra las 18 categorías y la cláusula de no-vacuidad también se quedaba
verde. Más 5 goldens nuevos: bloque de una línea, bloque multilínea, no-falso-rojo, y forma
de `sinComentarios`.

**Desvío deliberado del fix sugerido, y por qué.** El review propone un `String.replace` de
dos pasadas. **Aplicado al pie de la letra produce un falso rojo catastrófico** y lo
verifiqué antes de escribir nada: `run-validation-271.mjs:5` nombra
`` `content/exercises/*.json` `` dentro de un comentario de línea, y ese `s/*` es un `/*`
literal; el regex de bloque abre ahí y cierra en el primer `*/` del fichero (línea 237),
blanqueando las líneas 5-237 — **el array `CATEGORIES` entero** — y las 18 categorías salen
ciegas de golpe. Comprobado: tras esa limpieza la línea 174 queda en blanco. De ahí que sea
un escáner con estado de cadena y no un `replace`. Un falso rojo es un defecto igual que un
falso verde, y además invita a relajar el gate.

**Mutación de verificación** (sobre `scripts/`, revertida con `git checkout --`): envolver
las 4 entradas de `fare` en `/* */` con los delimitadores en líneas propias, que es lo que
produce el «toggle block comment» de un editor:

```js
lines.splice(187, 0, "      */");
lines.splice(183, 0, "      /*");
```

**Rojo literal observado** (`# pass 22 / # fail 2`):

```
INT-02 / D-44-06: scripts/run-validation-271.mjs quedaria CIEGO a estas categorias: fare-indicativo, fare-congiuntivo, fare-cond-imperativo, fare-indefiniti
T-44-03-01: el extractor ve 14 pares y content/categories.json registra 18 categorias: o scripts/run-validation-271.mjs dejo de declarar una entrada, o el extractor dejo de ver su array de conteo
```

Y con esa misma mutación el reporter imprime **`VAL-06 (225/225 validated): PASS` /
`Milestone gate PASS`** — la cifra verbatim del bug que corrió tres fases. Antes del
arreglo, el gate se quedaba en `# fail 0` con solo `fare-cond-imperativo` delatada (la
única cuya línea el `/*` ensucia); las otras tres pasaban por ancladas. Revertido → 24/24
verde.

---

### CR-02: `fare-indefiniti-300` no tenía gate key↔persona

**Files modified:** `tests/content-fare-indefiniti.test.js`
**Commit:** `9c84d7c`
**Status:** fixed

**Fix aplicado.** Portadas las dos mitades del hermano: (1) `personaDelHueco`, el **último**
pronombre **antes** del hueco, y re-apuntado el gate de personas de `:2300` que usaba el
*primer* pronombre del prompt entero (verde por casualidad: hoy los 3 prompts llevan
exactamente uno); (2) el gate que faltaba, que ata la key a **los dos ejes** —persona del
sujeto del hueco y lema que exige el complemento— más la cláusula de que ninguna
distractora satisfaga los dos a la vez. Los dos ejes son necesarios: en la variante 0 el
sujeto es `io` y `devo`/`posso` son ambas de 1sg, así que la persona sola no aísla la
respuesta. Más un golden de la tabla.

**Desvío deliberado del fix sugerido, y por qué.** El review propone
`MODAL_DEL_COMPLEMENTO = { altrimenti:'dev', permesso:'poss', desiderio:'vogl' }` con
`key.startsWith(...)`. **Eso se pone rojo sobre el contenido real ya validado por quórum**:
la key de la variante 1 es `puoi`, y `'puoi'.startsWith('poss') === false`. Los tres modales
italianos son irregulares y alternan raíz dentro del propio paradigma, así que ningún
prefijo identifica el lema — el mapeo del review falla además en `dobbiamo`, `potete`,
`volete` y `può`. Sustituido por una tabla **cerrada y exhaustiva** de las 18 formas →
`{persona, lema}`, cero inferencia morfológica, con `lui`/`lei` normalizadas a la misma
persona gramatical.

**Mutaciones de verificación** (sobre una **copia** del JSON, `content/` intacto: el fichero
de test se copió con la ruta repuntada a `tests/zz-mutant-fare-indefiniti.json`). Las tres
del review, una por variante, más una cuarta para aislar el eje del modal:

**Rojos literales observados** (cada uno `# pass 109 / # fail 1`):

```
CR-02: #0 tiene sujeto "io" y su key "devi" es de la persona "tu": "Domani io ___ fare i compiti: ..."
CR-02: #1 tiene sujeto "tu" y su key "possono" es de la persona "loro": "Qui tu ___ fare una foto, perché il museo dà il permesso. ..."
CR-02: #2 tiene sujeto "noi" y su key "dovete" es de la persona "voi": "Sabato noi ___ fare una torta ..."
```

La segunda es exactamente la que el review reproduce (`correctIndex: 2` → `3`,
`puoi` → `possono`) y que antes dejaba las 1092 en verde.

Y el eje del modal, aislado (misma persona correcta, lema equivocado — `devo` → `posso`,
las dos de `io`):

```
CR-02: #0 lleva el complemento "altrimenti", que exige dovere, y su key "posso" es de potere: "Domani io ___ fare i compiti: ..."
```

---

### CR-03: `effectiveStatus` saltaba el flag `override: true` obligatorio

**Files modified:** `scripts/run-validation-271.mjs`
**Commit:** `a0d1a11`
**Status:** fixed — **requiere decisión del autor** (ver «ACCIÓN REQUERIDA» arriba)

**Fix aplicado.** Borrada la reimplementación y deferido a la fuente única, como pide el
review: `const effectiveStatus = (passes) => deriveStatus(passes);`. Y la segunda mitad del
fix, la desincronía escrito-vs-derivado promovida de warning impreso a sub-gate real
(**VAL-09**), que entra en `gatePass` con diagnóstico accionable. Añadido VAL-09 al banner
de sub-gates y a la lista de la cabecera para que mi propio cambio no dejara prosa
mintiendo (el resto de la obsolescencia del banner es WR-10 y queda fuera de scope).

**Mutación de verificación.** Aquí el defecto vivía en `scripts/`, así que la mutación es
reinstaurar el relax borrado y observar el **falso verde** que el review describe:

```
VAL-06: PASS (250/250) · VAL-08: PASS · VAL-09: PASS · Milestone gate PASS · exit=0
```

…sobre dos ejercicios que la fuente única llama `disputed`. Revertido con
`git checkout --` → rojo verdadero de nuevo (el bloque de arriba).

**Y las guardas, probadas semánticamente** con el caso verbatim del review
(`[opus:correcta, sonnet:correcta, deepseek:incorrecta, autor:correcta]`):

| caso | `effectiveStatus` VIEJO | `deriveStatus` (AHORA) |
|---|---|---|
| autor SIN `override: true` (el del review) | `validated` | **`disputed`** |
| el mismo CON `override: true` | `validated` | `validated` |
| `override: true` SIN quórum (solo el autor) | `validated` | **`disputed`** |

Guarda 1 (flag) y guarda 2 (quórum) quedan demostradas. **Guarda 3 (≥1 pase de modelo) no
la pude aislar honestamente**: `deriveStatus` considera «modelo» cualquier `by !== 'autor'`,
así que no supe construir un caso que la distinga sin inventarme una segunda identidad de
autor. Corre en el código, pero no la he visto morder.

---

### CR-04: los gates de presencia de objeto matcheaban por subcadena

**Files modified:** `tests/content-fare-indefiniti.test.js`,
`tests/content-fare-indicativo.test.js`
**Commit:** `64f723c`
**Status:** fixed

**Fix aplicado.** Los cuatro call-sites enrutados por `wordish`, que es el matcher que la
cabecera de `content-fare-indefiniti.test.js` declara obligatorio en mayúsculas:
`content-fare-indefiniti.test.js` en el gate de cláusula (las **dos** comparaciones: la de
presencia del objeto declarado y el `filter` que cuenta objetos) y en el gate del cruce; e
`content-fare-indicativo.test.js` en sus dos gates de objeto. Más un golden en cada fichero
—vive en los dos porque `wordish` está duplicado entre ellos— que congela la discriminación
en las dos direcciones, incluyendo `tuttora` además de `soprattutto`.

**Mutación de verificación, dirección 1 (el falso verde).** La del review, verbatim, sobre
copia del JSON:

```
antes  : ___ tutto in fretta, lei ha rotto un piatto.
despues: ___ soprattutto in fretta, lei ha rotto un piatto.
```

**Rojo literal observado** (`# pass 110 / # fail 1`):

```
fare-indefiniti-gerundio-presente#2: la clausula del hueco no lleva "tutto"
```

Y la prueba de que la mutación era invisible antes: la **misma** mutación contra el fichero
de test tal como estaba en `9c84d7c` (el commit anterior a este arreglo) da
`# pass 110 / # fail 0`. Verde total.

**Mutación de verificación, dirección 2 (el falso rojo).** Un prompt legítimo que abre por
`Soprattutto`:

```
antes  : Prima di ___ i compiti, io guardo un film.
despues: Soprattutto prima di ___ i compiti, io guardo un film.
```

Contra el gate **pre-arreglo**, el falso rojo con su diagnóstico falso:

```
fare-indefiniti-infinito-presente#1: 2 objetos en la clausula del hueco (i compiti, tutto)
```

Contra el gate **post-arreglo**, ese rojo desaparece. El único rojo que queda con esa
mutación es de otro gate y es **verdadero**: `el cue declarado de cada variante esta en su
prompt Y en la POSICION que la tabla dice` — al prefijar texto, el cue `Prima di` deja de
estar en su posición declarada. Correcto, no es regresión de CR-04.

---

## Skipped Issues

Ninguno. Los 4 blockers en scope quedan cerrados.

## Notas de scope

- **WR-01..WR-13 no tocados**, según la instrucción. En particular no se ensanchó ningún
  arreglo para cubrirlos de refilón.
- **WR-07 rozado y NO arreglado, a propósito.** El fix sugerido para CR-01 incluye cambiar
  `slug:\s*` por `slug:[^\S\n]*`, que **es** el arreglo de WR-07. Lo dejé en `\s*` tal cual
  para no meter un warning en un pase de blockers. CR-01 queda cerrado igual: el
  comentario se blanquea *antes* de anclar, así que el `\s*` no puede cruzar hasta un slug
  comentado. Sigue abierto lo que WR-07 describe: `{ slug:\n'x' }` ancla.
- **WR-03 sigue abierto y ahora está más solo.** El `/^f/i` ciego del gate G3 conviven en
  el mismo fichero que el `pareceFare` que lo desmiente. No lo toqué.
- **WR-06 sigue abierto y afecta a cómo leer las cifras de arriba.**
  `tests/fixtures/slot-variants-integration.test.js` no entra en `tests/*.test.js`, así que
  el `1101` no incluye sus asserts. Es la segunda fuente de conteo de CR-01: su **texto**
  sí está cubierto por el gate anti-ceguera (y se benefició del arreglo), pero sus
  aserciones internas siguen sin ejecutarse.
- `content/exercises/*.json` sin tocar, verificado con `git status --short`.

---

_Fixed: 2026-08-12_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
</content>
</invoke>
