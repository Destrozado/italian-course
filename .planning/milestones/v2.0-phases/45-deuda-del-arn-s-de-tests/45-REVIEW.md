---
phase: 45-deuda-del-arn-s-de-tests
reviewed: 2026-08-13T00:00:00Z
depth: standard
files_reviewed: 26
files_reviewed_list:
  - .claude/skills/gsd-validate-batch/SKILL.md
  - .claude/skills/it-add-song/SKILL.md
  - README.md
  - scripts/run-validation-271.mjs
  - tests/count-arrays-lockstep.test.js
  - tests/exercise-types.test.js
  - tests/requirements-traceability.test.js
  - tests/content-fare-cond-imperativo.test.js
  - tests/content-fare-congiuntivo.test.js
  - tests/content-fare-indefiniti.test.js
  - tests/content-fare-indicativo.test.js
  - tests/domain.test.js
  - tests/exercise-fill-in.test.js
  - tests/file-lock.test.js
  - tests/screen-canciones.test.js
  - tests/screen-context-label.test.js
  - tests/screen-examen.test.js
  - tests/screen-home-editorial.test.js
  - tests/screen-repeat-failed.test.js
  - tests/screen-responsive.test.js
  - tests/screen-session-editorial.test.js
  - tests/screen-song-grouped.test.js
  - tests/screen-timer-mode.test.js
  - tests/screen-wordbuttons-slots.test.js
  - tests/song-validator.test.js
  - tests/word-groups.test.js
findings:
  critical: 2
  warning: 5
  info: 4
  total: 11
status: issues_found
---

# Phase 45: Code Review Report

**Reviewed:** 2026-08-13
**Depth:** standard
**Files Reviewed:** 26
**Status:** issues_found

## Summary

Reviewed the test-harness debt payoff (DEUDA-01/02/03 + the new requirements-traceability
gate), the reporter's milestone derivation, and the four contract documents. Nineteen files
received header-comment-only edits and were confirmed as such against the diff; they carry no
findings.

Every claim below was **measured by mutation**, not reasoned. A byte-identical copy of the
tree was made in a scratchpad, mutated, and `node --test tests/count-arrays-lockstep.test.js
tests/requirements-traceability.test.js` re-run. Baseline: `# pass 39 / # fail 0`. Full suite
baseline on the real tree: `# tests 1179 / # fail 0`.

**What holds up.** DEUDA-02 is solid: deleting an entry, stripping a `slug:` key, crossing a
`slug`↔`file` pair, and block-commenting four entries of `CATEGORIES_WITH_EXPLANATIONS` all go
red with a true diagnostic. DEUDA-03's banner derivation works end-to-end, including the three
fail-soft paths (`STATE.md` absent, `STATE.md` without a `milestone:` key, `STATE.md` in CRLF —
all print the full table and exit 0 with an honest "milestone desconocido" label). The
`tests/fixtures/` glob coverage gate goes red for a file one level deeper. The Coverage-figure
derivation goes red when the written number diverges from the row count.

**What does not.** Two gates do not go red for conditions they claim to watch, and both were
proven vacuous by mutation:

- **CR-01** — the DEUDA-01 lockstep can be broken back to the *exact* pre-phase state. Reverting
  one of `README.md`'s two invocations to `node --test tests/` leaves the suite at `# fail 0`.
  So does a brand-new test header written with `node --test tests/` or `node --test --recursive
  tests/`. The gate recognises exactly one degraded shape and is blind to the others — including
  the one this repository actually had.
- **CR-02** — the DEUDA-03 version gate loses coverage of the reporter's tail whenever
  `sinComentarios` desyncs, and its non-vacuity clause is written to catch only *total* blanking,
  never *partial*. Two realistic mutations hide a hand-written `v1.1` in printed output at
  `# fail 0`.

Both are the same defect class the phase exists to pay down, one level up: **the prose of these
gates is more careful than their code.** Alongside them, two of the four contract files this
phase edited still transcribe a four-milestone-stale version and a deprecated slash command
(WR-02, WR-03) — the reporter was cleaned, the documents that instruct the operator were not.

**Security:** none. Calibrated to reality — single-user, offline, no backend, no network, no
untrusted input. The one interpolation of file content into output (`milestoneActivo` into an
ANSI banner) is bounded to a single non-whitespace token from a git-tracked planning file; the
existing comment already reasons this through correctly. No finding.

---

## Critical Issues

### CR-01: El lockstep de DEUDA-01 se queda VERDE cuando un call-site vuelve a `node --test tests/` — la forma exacta de antes de la fase

**File:** `tests/count-arrays-lockstep.test.js:1073-1080` (`menciones`), `:1127-1152` (lockstep),
`:1154-1176` (regla de prefijo)

**Issue:** `menciones()` reconoce UNA sola forma degradada — `PREFIJO_SUITE` = `node --test
tests/*.test.js` — y la deduce por aritmética: `cortas = cuenta(PREFIJO) − cuenta(CANONICA)`.
Cualquier otra manera de escribir mal la invocación aporta CERO ocurrencias de prefijo, así que
`cortas` sale 0 y el gate pasa. Medido sobre el árbol copiado:

| Mutación | Resultado |
|---|---|
| MUT6: en `README.md`, **una** de las dos invocaciones → `node --test tests/` | `# pass 39 / # fail 0` ← **VERDE** |
| MUT1: cabecera de test NUEVA con `node --test tests/` | `# pass 39 / # fail 0` ← **VERDE** |
| MUT2: cabecera de test NUEVA con `node --test --recursive tests/` | `# pass 39 / # fail 0` ← **VERDE** |
| MUT5 (control): la misma invocación → `node --test tests/*.test.js` | `# fail 1` ← rojo |
| MUT24 (control): **todas** las de README → `node --test tests/` | `# fail 1` ← rojo, y solo porque `canonicas === 0` («mudo») |

MUT6 es el caso grave: README conserva una canónica, así que la cláusula de no-vacuidad por
fichero (`canonicas === 0`) no dispara, y `cortas = 1 − 1 = 0`. El README queda diciéndole al
autor que corra un comando que sale con `exit 1` y `Cannot find module`, y nada se pone rojo.
Es literalmente la desincronización descrita en el comentario `:1056-1061` («retirar el segundo
glob de UNA de las dos invocaciones de README.md dejaba el gate VERDE»), cerrada solo para la
degradación a `tests/*.test.js` y abierta para la degradación a `tests/`.

MUT1/MUT2 desmienten la garantía escrita en `:1157-1159`: «la cabecera numero 20 nace correcta o
el gate la nombra». `node --test tests/` es la forma que tenían `tests/domain.test.js`,
`tests/song-validator.test.js` y `tests/word-groups.test.js` ANTES de esta fase — el gate no
puede ver la reincidencia exacta que existe para impedir. `--recursive` es además el fix que
propuso el code review de la Phase 44 y que esta misma fase midió y prohibió por escrito
(`:1007-1009`): un agente que lo re-proponga no encuentra ningún rojo.

El título del test (`…en TODAS sus menciones`) y el del bloque (`el contrato la documenta
entera`) afirman una cobertura que el código no tiene.

**Fix:** dejar de reconocer UNA forma mala y pasar a reconocer las invocaciones REALES,
comparándolas contra la canónica. Boceto:

```js
// Toda invocacion `node --test …` de un texto, con sus argumentos hasta el delimitador.
// Reconoce lo que HAY, no una forma mala concreta: la forma numero 5 de escribirlo mal
// nace delatada en vez de invisible (CR-01).
const invocaciones = (texto) =>
  [...texto.matchAll(/node --test[^\n`'"()]*/g)].map((m) => m[0].trimEnd());

// Una invocacion de FICHERO SUELTO es legitima y no documenta la suite.
const ES_FICHERO_SUELTO = /^node --test [^ *]+\.test\.js$/;

const menciones = (texto) => {
  const todas = invocaciones(texto);
  return {
    canonicas: todas.filter((i) => i === INVOCACION_CANONICA).length,
    cortas: todas.filter((i) => i !== INVOCACION_CANONICA && !ES_FICHERO_SUELTO.test(i)).length,
  };
};
```

**ESTE SNIPPET ES HIPÓTESIS DE REVISOR, NO EVIDENCIA — hay que mutarlo antes de aceptarlo**
(precedente D-45: 2 de 4 fixes propuestos en el review de la Phase 44 eran incorrectos). Dos
cosas medidas que lo condicionan:

1. **Falsos rojos garantizados sin tratarlos.** El inventario real de ocurrencias de `node
   --test` en los 4 call-sites + las 29 cabeceras es: 33 canónicas, 5 × `node --test tests/`,
   5 × `node --test` a pelo, 3 × `node --test tests/*.test.js`, 1 × `node --test
   tests/**/*.test.js`, 1 × `node --test --recursive tests/`, y 11 de fichero suelto. Casi todas
   las «malas» son **catálogos deliberados de formas prohibidas** (`:1004-1017` de este fichero,
   el párrafo nuevo de `README.md:32`, y los avisos `(NO 'node --test tests/': …)` de
   `domain.test.js`, `song-validator.test.js` y `word-groups.test.js`). El fix necesita una
   marca explícita para esas líneas (p. ej. saltar toda línea que contenga `PROHIBIDA` /
   `NO \`node --test`), o convierte la documentación correcta en rojo.
2. Verificar en las dos direcciones: verde sobre el árbol actual **y** rojo sobre MUT1, MUT2 y
   MUT6 (reproducciones exactas arriba). Un fix que solo se comprueba en verde repite el defecto.

---

### CR-02: El gate de DEUDA-03 se queda ciego a la COLA del reporter y su cláusula de no-vacuidad no puede verlo

**File:** `tests/count-arrays-lockstep.test.js:1294-1320` (bloque 7), `:152-199` (`sinComentarios`),
`:1246-1250` (`lineasQueEmiten`)

**Issue:** el bloque 7 escanea versiones sobre `sinComentarios(readSrc(REPORTER))`. El escáner
tiene dos desincronizaciones que blanquean CÓDIGO real, y la cláusula de no-vacuidad está escrita
para detectar solo el blanqueo TOTAL — lo dice su propio comentario (`:1298-1302`: «Si
`sinComentarios` blanquease el fichero ENTERO»). El blanqueo PARCIAL, que es el realista, pasa.
Ambas medidas:

| Mutación | Resultado |
|---|---|
| MUT20: literal de regex con `/*` (`/tests\/*.test.js/`) inyectado tras `CATEGORIES`, y `console.log('… milestone v1.1.')` justo debajo | `# pass 36 / # fail 0` ← **VERDE** |
| MUT21: `console.log(\`…\n  https://example.test/x — … milestone v1.1\`)` (template literal multilínea con una URL en la continuación) | `# pass 36 / # fail 0` ← **VERDE** |
| MUT11 (control): `v1.1` en una línea de salida normal | `# fail 1` ← rojo |

Mecanismo, medido:

- **MUT20** — el escáner ve `/` seguido de `*` dentro del literal de regex, entra en `enBloque`,
  y como no hay `*/` blanquea **desde ahí hasta el final del fichero**. El escaneo de versiones
  se queda ciego a toda la cola. `lineasQueEmiten` sigue > 0 porque los `console.log` de ANTES
  del punto de inyección sobreviven, así que la no-vacuidad no dispara.
- **MUT21** — la cabecera de `sinComentarios` (`:126-128`) declara que el estado de cadena
  «se resetea en cada salto de linea» y presenta eso como *acotación del daño*. Lo que no dice es
  el efecto secundario: **las líneas de continuación de un template literal multilínea se escanean
  como CÓDIGO**. Un `//` en ellas (una URL — el caso más plausible que existe) blanquea el resto
  de esa línea. Y si la continuación llevase un `/*`, se abre bloque y se cae en MUT20.

El guard de integridad del bloque 3-ter (`:815-855`) cubre exactamente este riesgo… pero solo
para las **líneas de entrada de los arrays de conteo**. Las líneas de salida del reporter, que
son las que el bloque 7 mira, no tienen guard equivalente. Hay un reconocimiento explícito del
peligro para un consumidor y ninguno para el otro.

**Fix:** un guard DIFERENCIAL — escanear con un segundo reconocedor de comentarios, ingenuo e
independiente (por línea, sin entender cadenas: el sesgo contrario al del escáner), y exigir que
los dos coincidan. Si discrepan, algo desalineó a uno de los dos y el veredicto no vale.

```js
// Reconocedor NAIVE e independiente. No entiende cadenas y por eso NO puede
// desalinearse dentro de una: es el sesgo contrario al de `sinComentarios`.
// Que los dos coincidan es la prueba de que el escaneo de versiones mira el
// fichero entero y no una cola blanqueada (CR-02).
const sinComentariosNaive = (src) => {
  let bloque = false;
  return src.split('\n').map((l) => {
    const t = l.trim();
    if (bloque) { if (t.includes('*/')) bloque = false; return ''; }
    if (t.startsWith('/*')) { if (!t.includes('*/')) bloque = true; return ''; }
    if (t.startsWith('//') || t.startsWith('*')) return '';
    return l;
  });
};

test(`${REPORTER}: los dos reconocedores de comentario ven las MISMAS versiones (CR-02)`, () => {
  const src = readSrc(REPORTER);
  assert.deepEqual(
    versionesEscritasAMano(sinComentarios(src).split('\n')),
    versionesEscritasAMano(sinComentariosNaive(src)),
    `CR-02: el escaner y el reconocedor naive discrepan sobre ${REPORTER}. O un literal de ` +
      `regex con /* abrio bloque y blanqueo la cola del fichero, o un template literal ` +
      `multilinea trae un // en una linea de continuacion. En los dos casos el escaneo de ` +
      `versiones del bloque 7 dejo de mirar parte del reporter y su clausula de no-vacuidad ` +
      `no puede verlo, porque solo detecta el blanqueo TOTAL`
  );
});
```

**Verificado por mutación antes de proponerlo** (a diferencia del primer candidato que probé,
un guard byte-a-byte sobre las líneas con `console.`, que cazaba MUT20 pero **no** MUT21 y por
eso queda descartado):

- árbol actual: `escaner=[] naive=[]` → **coinciden, verde**
- MUT20: `escaner=[] naive=["607: if (RE_GLOB) console.log('  → gate del milestone v1.1.');"]` → **rojo**
- MUT21: `escaner=[] naive=["607: https://example.test/x — gate del milestone v1.1\`);"]` → **rojo**

Complemento barato y en la misma dirección: añadir a la cabecera de `sinComentarios` (`:119-128`)
la limitación que hoy no nombra — que las líneas de continuación de un template literal multilínea
se escanean como código —, porque hoy el texto presenta el reset por línea solo como virtud.

---

## Warnings

### WR-01: El gate de trazabilidad certifica «0 duplicados» sin comprobar duplicados

**File:** `tests/requirements-traceability.test.js:146-152`, `:218-233`, `:254-269`

**Issue:** la línea que el gate congela dice literalmente `**Coverage: 26/26 requisitos mapeados
— 0 huérfanos, 0 duplicados, 0 gaps.**`. El gate comprueba huérfanos en las dos direcciones y la
cifra contra el número de FILAS, pero nunca la unicidad. `idsMapeados.length` cuenta filas, no IDs
distintos, y el cruce de huérfanos usa `Array.prototype.includes`, que es insensible a duplicados.
Tampoco se comparan nunca `idsMapeados.length` e `idsDefinidos.length` entre sí. Medido:

- MUT18: fila `| DEUDA-03 | … |` DUPLICADA + `Coverage: 27/27` → `# pass 39 / # fail 0` ← **VERDE**
- MUT17 (control): `Coverage: 27/27` con 26 filas → `# fail 1` ← rojo
- MUT19 (control): `DEUDA-03` definido y sin fila → `# fail 1` ← rojo

Resultado: el documento puede afirmar 27 requisitos mapeados teniendo 26, con la propia línea
diciendo «0 duplicados», y el gate lo firma. Es la misma especie de cifra que miente que el
fichero existe para eliminar, un peldaño más abajo.

**Fix:** añadir la comprobación al mismo test, después de la cláusula de no-vacuidad:

```js
const dupes = (xs) => [...new Set(xs.filter((x, i) => xs.indexOf(x) !== i))];
const duplicados = [
  ...dupes(idsMapeados).map((id) => `${id}: fila de trazabilidad DUPLICADA`),
  ...dupes(idsDefinidos).map((id) => `${id}: definido como requisito DOS veces`),
];
assert.deepEqual(
  duplicados,
  [],
  `DEUDA: la linea de Coverage de ${REQUIREMENTS_REL} afirma «0 duplicados» y el gate no lo ` +
    `comprobaba: una fila repetida infla idsMapeados.length y deja pasar una cifra inflada ` +
    `en verde: ${duplicados.join('; ')}`
);
```

Verificar en las dos direcciones: verde sobre el árbol actual, rojo sobre MUT18.

### WR-02: `gsd-validate-batch/SKILL.md` — artefacto EJECUTABLE, editado en esta fase, sigue transcribiendo `v1.1`, `271` y `/gsd:complete-milestone`

**File:** `.claude/skills/gsd-validate-batch/SKILL.md:482`, `:626`, `:477`, `:438`, `:19`, `:21`

**Issue:** este fichero es un call-site del gate de lockstep y se editó en esta fase — pero solo
la línea del glob. Lo que quedó dentro:

- `:482` — `"Si ambos exit 0: el milestone v1.1 está listo para \`/gsd:complete-milestone v1.1\`."`
- `:626` — `"…verifica los 3 sub-gates VAL-04 + VAL-06 + VAL-08 sobre los 271 ejercicios… Solo entonces procede \`/gsd:complete-milestone v1.1\`."`
- `:477` — `# Gate final del milestone — verifica VAL-04 + VAL-06 + VAL-08.`
- `:438` — `VAL-06 (271/271 validated) impide cerrar el milestone con deferred.`

Tres mentiras medibles contra el disco de hoy: el milestone es `v2.0` (`.planning/STATE.md:3`),
los sub-gates son CUATRO (`VAL-04 + VAL-06 + VAL-08 + VAL-09`, como imprime el propio banner
nuevo) y los slots son 250, no 271 (salida real del reporter: `18 categorías, 250 slots`).
Además `/gsd:complete-milestone` es la forma con DOS PUNTOS que D-45-11 acaba de declarar vieja
y sustituir por la de guion en el pie del reporter — y aquí se le sigue dando al operador como
instrucción a ejecutar.

Es exactamente el defecto de DEUDA-03 (una transcripción congelada cuatro milestones) en el
artefacto que un agente LEE PARA ACTUAR. El gate de lockstep solo mira la cadena de invocación,
así que nada de esto se pone rojo. La fase aplicó su estándar al reporter y no al documento que
instruye sobre el reporter.

**Fix:** en `:482` y `:626`, sustituir el comando transcrito por una referencia a la salida del
reporter, que es la que sí deriva del disco — misma solución que ya se aplicó al pie del propio
reporter:

```md
Si ambos exit 0: el milestone está listo para `/gsd-complete-milestone <el milestone que
imprime el pie de `scripts/run-validation-271.mjs`>`. Qué milestone es lo dice esa salida,
derivado de `.planning/STATE.md` — nunca este documento.
```

Y en `:477`/`:438`/`:19`/`:21`, quitar `271` y `3 sub-gates`: el reporter imprime los conteos y
la enumeración completa. Si se quiere que esto no vuelva a envejecer, el camino barato es meter
los dos `SKILL.md` en un gate del mismo corte que el bloque 7 (ninguna versión de milestone
escrita a mano fuera de un bloque de historial).

### WR-03: `README.md` sigue con la etiqueta «Phase 10» que esta misma fase borró del banner

**File:** `README.md:115`, `:92`, `:94`

**Issue:** `:115` dice `- \`node scripts/run-validation-271.mjs\` — reporter del milestone gate
(Phase 10 reporter).`. «Phase 10» es la etiqueta EXACTA que D-45-10 eliminó del banner por no
significar nada desde hacía cuatro milestones (`45-03`), y sobrevive intacta en el README, que
es call-site del gate de lockstep y se editó en esta fase. `:92` y `:94` siguen encabezando
`## Validación editorial (milestone v1.1)` con «cada uno de los 271 ejercicios» — la misma cifra
que `:98` acaba de quitar dos párrafos más abajo, dejando el documento contradiciéndose consigo
mismo en la misma pantalla.

**Fix:** `:115` → `` - `node scripts/run-validation-271.mjs` — reporter de cierre de milestone
(deriva el milestone y los conteos del disco y los imprime). `` Y en `:92-94`, o fechar la
sección explícitamente como historia (`## Validación editorial (nació en el milestone v1.1)`),
que es el trato que el reporter le da a su historial contable, o quitar el `271` como se hizo
en `:98`.

### WR-04: el mensaje fail-soft afirma «las dos causas son reales» y hay una tercera, medida

**File:** `scripts/run-validation-271.mjs:113-121` (`milestoneActivo`), `:610-614` (el pie)

**Issue:** el pie dice `No se pudo derivar y las dos causas son reales: o falta el fichero, o no
declara la clave milestone.` Hay una tercera: la clave existe y su valor NO es un único token
sin espacios. El regex `/^milestone:[^\S\n]*(\S+)[^\S\n]*$/m` exige que tras el token solo quede
whitespace horizontal hasta fin de línea. Medido (MUT16, `milestone: v2.0 final` en STATE.md):

- reporter → `Gate de cierre de milestone desconocido (no se pudo derivar de .planning/STATE.md)`,
  exit 0, **sin decir por qué de verdad**
- suite → `# fail 1` (`milestoneEnDisco()` lanza con el mismo mensaje incompleto,
  `tests/count-arrays-lockstep.test.js:1283-1289`)

O sea: una edición benigna del frontmatter degrada el banner en silencio y pone la suite roja, y
los dos mensajes le dicen al autor que busque una causa que no es. Un diagnóstico falso en un
mensaje de error es del mismo tipo que un banner desfasado — le hace perder el tiempo al lector
en el sitio exacto donde el fichero promete no hacerlo.

**Fix:** distinguir «no hay clave» de «hay clave con valor no parseable», en los dos sitios:

```js
// scripts/run-validation-271.mjs
const lineaMilestone = raw.match(/^milestone:[^\n]*$/m);          // ¿existe la clave?
const encontrado     = raw.match(/^milestone:[^\S\n]*(\S+)[^\S\n]*$/m); // ¿un solo token?
```

y que el pie nombre las TRES causas (falta el fichero / no hay clave / la clave declara
`${lineaMilestone[0].trim()}`, que no es un token único). Réplica de lo mismo en el `throw` de
`milestoneEnDisco()`.

### WR-05: la exención del propio fichero en la regla de prefijo va con una justificación falsa

**File:** `tests/count-arrays-lockstep.test.js:1160-1168`, `:1049-1054`

**Issue:** la exención se justifica así: «La exencion no es un pase libre: el test de arriba ya
exige que este fichero declare INVOCACION_CANONICA, y su cabecera la lleva completa». **Ningún
test exige eso.** `CALL_SITES_INVOCACION` (`:1049-1054`) contiene `README.md`, los dos `SKILL.md`
y `scripts/run-validation-271.mjs` — `tests/count-arrays-lockstep.test.js` NO está. Medido
(MUT22, degradando la cabecera del propio fichero a la forma corta): `# pass 36 / # fail 0`.

La exención es además más ancha de lo que su motivo pide: los datos que la justifican son
`:518` y `:527` (los goldens `SRC_TRAMPA`), pero cubre las 1448 líneas, incluida la cabecera.

**Fix:** estrechar la exención a las líneas que la merecen y cerrar el hueco:

```js
// EXENCION ACOTADA A LOS GOLDENS, no al fichero entero: la forma corta vive aqui como
// DATO (SRC_TRAMPA reproduce el `/*` de `tests/*.test.js` dentro de una CADENA).
const SIN_GOLDENS = (src) =>
  src.split('\n').filter((l) => !l.includes('SRC_TRAMPA') && !/^\s*(const SRC_TRAMPA|\s+console\.log\('  VAL_07)/.test(l)).join('\n');
```

y —más simple y más fiable que afinar el filtro— **meter `tests/count-arrays-lockstep.test.js`
en `CALL_SITES_INVOCACION`**, que es lo que el comentario ya afirma que pasa. Así su cabecera
queda obligada a declarar la canónica y la exención deja de ser un pase libre. Verificar contra
MUT22.

---

## Info

### IN-01: la cláusula de no-vacuidad del bloque 3-ter es un suelo de corpus, no por fuente

**File:** `tests/count-arrays-lockstep.test.js:836-843`

**Issue:** `lineasDeEntrada >= SLUGS_REGISTRADOS.length` compara el total de las TRES fuentes
(54 líneas hoy) contra 18. Una fuente que aportase cero líneas de entrada no lo trip: quedarían
36 ≥ 18. El agujero está tapado indirectamente por el bloque 3 (esa fuente saldría con las 18
categorías ciegas), así que no es explotable hoy — pero la cláusula no vigila lo que su comentario
dice vigilar.

**Fix:** contar por fuente y exigir el suelo en cada una: `for (const rel of COUNT_ARRAY_SOURCES)`
acumulando en un `Map`, y assert de que ninguna entrada del mapa está por debajo de
`SLUGS_REGISTRADOS.length`.

### IN-02: la enumeración de tests solo mira `tests/`

**File:** `tests/count-arrays-lockstep.test.js:1089-1093`

**Issue:** `TESTS_EN_DISCO` enumera recursivamente `tests/` y nada más. Un `*.test.js` creado
fuera (medido: `src/zz.test.js`) es invisible para el gate de cobertura — `# pass 36 / # fail 0`.
Es la misma clase de fichero-que-no-corre que DEUDA-01, un directorio más allá.

**Fix:** enumerar desde la raíz del proyecto (excluyendo `node_modules/`, `vendor/`, `.planning/`)
en vez de desde `tests/`, o dejar escrito en el comentario que la garantía está acotada a `tests/`.

### IN-03: 8 de 29 ficheros de test no documentan la invocación canónica, y el gate solo prohíbe la forma corta

**File:** `tests/count-arrays-lockstep.test.js:1154-1176`

**Issue:** medido con grep sobre el árbol: `tests/backup.test.js`, `tests/data-storage.test.js`,
`tests/domain-progress.test.js`, `tests/domain-session.test.js`,
`tests/schema-validator-origen.test.js`, `tests/screen-multi-choice-shuffle.test.js`,
`tests/fixtures/slot-variants.test.js` y `tests/fixtures/slot-variants-integration.test.js` no
contienen la invocación canónica. Los dos últimos son precisamente los ficheros cuya no-ejecución
ERA DEUDA-01. El gate permite el silencio; solo castiga la forma corta. La afirmación de
`:1156-1159` («las ~19 cabeceras de tests/ documentan como se corre la suite entera») describe 21
de 29.

**Fix:** decidir y escribir cuál de las dos es la regla — o toda cabecera de `tests/` documenta
la canónica (y entonces el gate lo exige, con los 8 ficheros actualizados), o documentarla es
opcional (y entonces `:1156-1159` se corrige para no prometerlo).

### IN-04: la suite entera depende ahora de dos documentos de `.planning/`

**File:** `tests/count-arrays-lockstep.test.js:1269-1291`, `tests/requirements-traceability.test.js:61-90`

**Issue:** `.planning/STATE.md` y `.planning/REQUIREMENTS.md` son ahora referencias load-bearing
del arnés. Medido: mover o renombrar `STATE.md` deja la suite en `# fail 1` (el reporter sí
sobrevive, fail-soft, correcto). Es deliberado y está razonado en los dos ficheros — pero el
acoplamiento ya está en DOS sitios y `/gsd-cleanup` archiva directorios de `.planning/`.

**Fix:** nada que cambiar hoy; anotar la dependencia donde vive el riesgo (`.planning/` +
el workflow de archivado) para que un archivado futuro sepa que mueve un fichero del que cuelga
el arnés de tests.

---

_Reviewed: 2026-08-13_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
