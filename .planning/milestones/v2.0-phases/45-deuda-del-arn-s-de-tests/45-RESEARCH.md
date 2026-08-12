# Phase 45: Deuda del arnés de tests — Research

**Researched:** 2026-08-12
**Domain:** Arnés de tests (Node.js built-in test runner) + gates source-assert + reporter de cierre de milestone
**Confidence:** HIGH (todo lo load-bearing se verificó ejecutándolo en esta máquina y revirtiendo)

---

## Summary

Las tres deudas son **de arnés, no de contenido**. Ninguna esconde un fallo: la auditoría ya
confirmó que las 44 aserciones huérfanas pasan y que el tercer array está en sync. El trabajo es
cerrar tres caminos por los que el arnés puede quedarse verde mientras deja de vigilar.

Los tres se verificaron **por mutación en el árbol de trabajo, y se revirtieron**. Resultados
reproducidos hoy, no inferidos:

1. **DEUDA-01** — desincronizando `REAL_CATEGORIES` (`avere: 20 → 21`), la invocación canónica de
   hoy imprime `1101 pass / 0 fail` y **exit 0**. La forma propuesta imprime `1163 pass / 1 fail`
   y **exit 1**. La ceguera es real y la mutación la delata.
2. **DEUDA-02** — borrando la entrada `fare-indefiniti` de `CATEGORIES_WITH_EXPLANATIONS`, el gate
   anti-ceguera se queda en `24/24 pass` y la suite entera en `1096 pass / 0 fail`, **exit 0**. La
   única señal es que el total ENCOGE 5 tests en silencio, y nada asserta ese número.
3. **DEUDA-03** — no existe ni un solo test que asserte la cabecera ni el pie del reporter
   (`grep "Milestone v1.1" tests/` → 0 resultados). El texto es literalmente inverificable hoy,
   que es por lo que lleva cuatro milestones desfasado.

Hay además un hallazgo **que cambia la recomendación del code review de la Phase 44**: el fix que
`44-REVIEW.md:527` propone para WR-06 —«standardise on `node --test --recursive tests/`»— **no
funciona en este Node**. `--recursive` no existe en v22.20.0 (`node: bad option: --recursive`).
Y la alternativa obvia, `node --test tests/**/*.test.js`, es una **trampa de verde silencioso**:
sin comillas y sin `globstar`, bash y `sh` la expanden a los DOS ficheros de `tests/fixtures/`
y corren **63 de 1164 tests con exit 0**. Recomendar esa forma sería introducir, dentro de la fase
que existe para eliminar los verdes mentirosos, un verde mentiroso nuevo.

**Primary recommendation:** canonizar `node --test tests/*.test.js tests/fixtures/*.test.js`
(la única forma verificada correcta bajo los cuatro regímenes de comillas/shell probados); para
DEUDA-02 **reformar el array** añadiéndole clave `slug:` en vez de enseñarle una forma nueva al
extractor (verificado: cero cambios en el extractor, y gana además el gate de par cruzado); y para
DEUDA-03 derivar cabecera y pie del frontmatter YAML de `.planning/STATE.md`, con lectura
fail-soft y un test que lo congele.

---

## User Constraints

**No hay `45-CONTEXT.md`** — `/gsd-discuss-phase` se saltó para esta fase. La fuente vinculante
son los criterios de éxito del ROADMAP (`.planning/ROADMAP.md:359-371`), que son inusualmente
detallados y funcionan como spec.

### Locked Decisions (de `.planning/ROADMAP.md:369-371`, verbatim)

> 1. **DEUDA-01 — `tests/fixtures/` entra en el gate.** Las 44 aserciones de
>    `tests/fixtures/slot-variants-integration.test.js` corren en la invocación canónica de la
>    suite. […] el trabajo es engancharlas, no arreglarlas. Verificación por mutación:
>    desincronizar `REAL_CATEGORIES` y comprobar que la suite canónica se pone ROJA (hoy se queda
>    verde).
> 2. **DEUDA-02 — el tercer array de conteo entra en el gate anti-ceguera.** […] Cerrar exige o
>    darle forma parseable o enseñar al extractor a leer la suya — y en cualquier caso el gate
>    debe ponerse rojo ante una categoría registrada en `categories.json` y ausente de ESE array.
>    Ligado a WR-07 y WR-12 de `44-REVIEW.md`, que tocan el mismo extractor.
> 3. **DEUDA-03 — el reporter deja de mentir sobre su propio objeto.** […] Cierre: el encabezado y
>    el pie se DERIVAN del milestone activo, no se transcriben — mismo principio que ya rige los
>    counts (nunca número mágico). Absorbe WR-06 y WR-10 de `44-REVIEW.md`.

### Claude's Discretion

- **DEUDA-01:** qué forma exacta de invocación se canoniza (mover ficheros vs. ampliar el glob).
- **DEUDA-02:** reformar el array vs. enseñar al extractor. El ROADMAP admite ambas explícitamente.
- **DEUDA-03:** de qué fichero de disco se deriva el milestone activo.
- Si se arreglan de paso WR-07 (`slug:\s*` cruza saltos de línea) y WR-12 (cláusula de no-vacuidad
  acoplada) — el ROADMAP los menciona como «ligados», no como comprometidos.

### Deferred Ideas (OUT OF SCOPE)

- Los otros 23 hallazgos de deuda de `.planning/v2.0-MILESTONE-AUDIT.md`.
- Los juicios de diseño de ejercicio de la Phase 41 (WR-01/04/05).
- La deuda de cobertura de test de la Phase 42 (WR-01..06, IN-01..06).
- Contenido de ejercicios, motor del quiz, prompts de validación (R1-R7 / C1-C5).

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEUDA-01 | `tests/fixtures/slot-variants-integration.test.js` (44 aserciones) corre en la invocación canónica; mutar `REAL_CATEGORIES` pone la suite roja | §DEUDA-01 abajo: 8 formas de invocación medidas, la ganadora verificada bajo 4 regímenes de shell, mutación reproducida verde→roja |
| DEUDA-02 | `CATEGORIES_WITH_EXPLANATIONS` entra en el gate anti-ceguera; el gate se pone rojo ante categoría registrada y ausente de ESE array | §DEUDA-02 abajo: las 2 opciones prototipadas y ejecutadas; Opción A verificada 25/25 verde en sync y roja con mensaje verdadero al mutar |
| DEUDA-03 | Cabecera y pie del reporter DERIVADOS del milestone activo, no transcritos | §DEUDA-03 abajo: 8 sitios literales localizados por grep hoy, fuente de derivación identificada y verificada parseable sin dependencias |

> ⚠️ **Hueco de trazabilidad para el planner.** `DEUDA-01/02/03` están declarados en
> `.planning/ROADMAP.md:364` pero **NO existen en `.planning/REQUIREMENTS.md`**
> (`grep -c DEUDA .planning/REQUIREMENTS.md` → 0). La tabla de Traceability de REQUIREMENTS.md
> cierra en 23 filas con `INT-04 → Phase 44` y su línea de Coverage dice «23/23 requisitos
> mapeados — 0 huérfanos». Si Phase 45 se ejecuta sin añadirlos, quedan tres requisitos huérfanos
> que ninguna auditoría posterior podrá cruzar. **Recomendación: una tarea del plan añade las 3
> filas a REQUIREMENTS.md y actualiza el Coverage a 26/26.**
> `[VERIFIED: .planning/REQUIREMENTS.md:86-119 leído esta sesión; la tabla va de `| MIG-01 | Phase 40 …` a `| INT-04 | Phase 44 — Integración lockstep + cierre | Complete |` y la línea 118 dice verbatim «**Coverage: 23/23 requisitos mapeados — 0 huérfanos, 0 duplicados, 0 gaps.**»]`

---

## Project Constraints (from CLAUDE.md)

| Directiva | Impacto en esta fase |
|-----------|----------------------|
| Web estática, sin servidor, sin build | **No hay `package.json`** (verificado: `ls package.json` → No such file). No se puede canonizar la invocación como `npm test`. La canonización vive en prosa (README + skills) y en el `console.log` del reporter. |
| Sin dependencias / zero-build | Cualquier fix usa solo builtins de Node (`node:fs`, `node:test`, `node:assert`). Cero paquetes nuevos → **la sección Package Legitimacy Audit no aplica a esta fase**. |
| Pinnear versiones exactas, nunca `@latest` | No aplica (no se instala nada). |
| Idioma español | Comentarios, mensajes de assert y prosa nueva en español, como el resto de `tests/` y `scripts/`. |
| **GSD Workflow Enforcement** | Todo cambio pasa por `/gsd-execute-phase`; nada de ediciones sueltas. |

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Descubrimiento de ficheros de test | Invocación / CLI (shell + `node --test`) | Documentación (README, skills) | No hay runner configurable ni `package.json`; el contrato vive en el argumento de línea de comandos y en la prosa que lo transcribe |
| Gate anti-ceguera sobre arrays de conteo | Test tier (`tests/count-arrays-lockstep.test.js`) | — | Es source-assert: lee el TEXTO de otras fuentes, no las importa (D-44-07) |
| Declaración de conteo por categoría | Test tier + script tier (los 3 arrays) | Disco (`content/categories.json`, `content/exercises/*.json`) | Los arrays son declaraciones; la verdad es el disco y el `expected` se deriva de él |
| Identidad del milestone activo | Planning tier (`.planning/STATE.md`) | — | Es dato de proceso, no de código; el reporter debe LEERLO, nunca declararlo |
| Reporte de cierre de milestone | Script tier (`scripts/run-validation-271.mjs`) | Test tier (un test nuevo que congele la derivación) | Hoy el reporter no tiene ningún test que lo cubra en su salida impresa |

---

## Standard Stack

Fase de deuda interna en un proyecto zero-dependency: **el stack es lo que ya hay**. Cero
instalaciones.

### Core

| Herramienta | Versión | Propósito | Por qué es la estándar aquí |
|-------------|---------|-----------|------------------------------|
| Node.js | **v22.20.0** | Runtime + test runner | `[VERIFIED: node --version ejecutado esta sesión → v22.20.0]`. README:21 exige «Node 22 LTS o superior» |
| `node:test` | builtin de 22.20.0 | Test runner (`describe`/`test`) | Ya es el runner de las 29 suites; sin alternativa que no viole el zero-build |
| `node:assert/strict` | builtin | Aserciones | Ya en uso en las 29 suites |
| `node:fs` (`readFileSync`, `existsSync`) | builtin | Lectura source-assert y de disco | Patrón D-44-07 ya establecido |

### Supporting

| Herramienta | Propósito | Cuándo usarla |
|-------------|-----------|---------------|
| `git checkout -- <file>` | Revertir la mutación de verificación | Después de CADA prueba de mutación, sin excepción |
| `--test-reporter=dot` | Salida compacta | Solo para iterar rápido; el gate se lee con el reporter TAP por defecto |

### Alternatives Considered

| En vez de | Se podría usar | Tradeoff |
|-----------|----------------|----------|
| Glob explícito de dos rutas | `node --test` a pelo (descubrimiento por defecto) | Verificado: barre `tests/util/test-helpers.js` (un helper puro, no un test) por el patrón `**/test-*.js` y lo cuenta como **1 test fantasma** → 1165 en vez de 1164. Inflar el conteo con un no-test es exactamente la clase de ruido que hizo que un delta de `# tests` no significara nada |
| Glob explícito de dos rutas | `node --test "tests/**/*.test.js"` | **RECHAZADO — verde silencioso.** Ver §Common Pitfalls #1 |
| Glob explícito de dos rutas | Mover los 2 ficheros a `tests/` | Viable pero más caro y más frágil; ver §DEUDA-01, Opción 3 |
| Zero-dep | Un runner externo (vitest/jest) | Violaría el constraint zero-build de CLAUDE.md de forma flagrante para pagar deuda de arnés |

**Installation:** ninguna. `[VERIFIED: ls /home/vcompanyb/italian-course/package.json → "No such file or directory"; CLAUDE.md dice verbatim «**Sin `npm install`.** No hay `package.json` en el proyecto — todo es CDN + Node built-in» (README.md:25)]`

---

## Package Legitimacy Audit

**N/A — esta fase no instala ningún paquete externo.** Todo el trabajo es sobre ficheros ya en el
repo (`tests/`, `scripts/`, `README.md`, `.claude/skills/`, `.planning/`) usando exclusivamente
módulos builtin de Node. No hay ecosistema que auditar, cero verdictos SLOP/SUS que reportar.

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Todo | ✓ | v22.20.0 | — |
| `node:test` glob nativo | Formas de invocación con comillas | ✓ | builtin 22.20.0 | Glob de shell (la forma recomendada no lo necesita) |
| `node --test --recursive` | El fix propuesto por WR-06 | **✗** | — | **Ninguno — la opción no existe.** Ver Pitfall #2 |
| `package.json` / npm scripts | Canonizar la invocación como `npm test` | **✗** | — | Canonizar en prosa (README + 2 SKILL.md) + el `console.log` del reporter |
| `git` | Revertir mutaciones de verificación | ✓ | — | — |
| Red / internet | Nada de esta fase | n/a | — | La derivación de DEUDA-03 debe ser 100 % de disco |

**Missing dependencies with no fallback:** ninguna que bloquee. `--recursive` no existe pero la
fase no lo necesita (hay dos formas verificadas mejores).

**Missing dependencies with fallback:** `package.json` — sin él, «canónico» significa
«lo que dicen README + los 2 SKILL.md + el reporter», y por eso el inventario de call-sites de
abajo es load-bearing, no decorativo.

---

## DEUDA-01 — `tests/fixtures/` entra en el gate

### Estado verificado hoy

| Medida | Valor | Cómo se obtuvo |
|---|---|---|
| Suite canónica actual | **1101 pass / 0 fail**, exit 0 | `node --test tests/*.test.js` |
| Idem con `VAL_07_STRICT=1` | **1119 / 1119** | `VAL_07_STRICT=1 node --test tests/*.test.js` |
| `tests/fixtures/slot-variants-integration.test.js` aparte | **44 / 44** | ejecutado solo — coincide exacto con la cifra de la auditoría |
| `tests/fixtures/slot-variants.test.js` aparte | **19 / 19** | ejecutado solo — **segundo fichero huérfano, que el ROADMAP no nombra** |
| Total enganchando los dos | **1164** (1101 + 63) | `+63 = 44 + 19` |
| Idem strict | **1182** | |

> **Hallazgo que el ROADMAP no recoge:** son **DOS** ficheros huérfanos, no uno.
> `tests/fixtures/slot-variants.test.js` (19 tests, Phase 15) también está fuera del gate.
> `44-REVIEW.md:526` sí lo dice de pasada («its two sibling `tests/fixtures/*.test.js` files have
> the same problem»). Cualquier forma que enganche el primero engancha el segundo; el plan debe
> **declarar el delta como +63, no como +44**, o el salto de conteo parecerá inexplicado — que es
> justo lo que `44-REVIEW.md:528-530` avisa que invita al siguiente «ya estaba cubierto».
> `[VERIFIED: node --test tests/fixtures/slot-variants.test.js → "# tests 19 / # pass 19" esta sesión]`

### Las 8 formas de invocación, medidas

| # | Invocación | Resultado | Veredicto |
|---|---|---|---|
| A | `node --test tests/*.test.js` | 1101, exit 0 | La de hoy. Ciega a `tests/fixtures/` |
| B | `node --test tests/` | **exit 1**, `Error: Cannot find module '…/tests'` | Falla. Node resuelve el path como MÓDULO |
| C | `node --test tests` | **exit 1**, mismo error | Falla igual (la barra final es irrelevante) |
| D | `node --test --recursive tests/` | **`node: bad option: --recursive`** | **La opción NO EXISTE en v22.20.0** |
| E | `node --test "tests/**/*.test.js"` (con comillas) | 1164, exit 0 | Correcta **solo si van las comillas** |
| F | `node --test tests/**/*.test.js` (sin comillas, bash) | **63**, exit 0 | ☠️ **Verde silencioso** |
| G | `node --test` (sin argumentos) | 1165, exit 0 | Barre `tests/util/test-helpers.js` (+1 fantasma) |
| **H** | **`node --test tests/*.test.js tests/fixtures/*.test.js`** | **1164, exit 0** | ✅ **Recomendada** |

`[VERIFIED: las 8 filas se ejecutaron en /home/vcompanyb/italian-course esta sesión; los exit codes se capturaron con $? sobre la invocación directa, no a través de un pipe]`

### Por qué H y no E

E y H dan el mismo número. La diferencia es qué pasa cuando alguien la copia mal, y ese es
exactamente el eje de esta fase. Probadas las cuatro combinaciones de shell/comillas:

| Forma | bash + comillas | bash sin comillas | bash `globstar` ON | `sh`/`dash` |
|---|---|---|---|---|
| `tests/**/*.test.js` | 1164 ✅ | **63 ☠️** | 1164 ✅ | **63 ☠️** |
| `tests/*.test.js tests/fixtures/*.test.js` | 1164 ✅ | 1164 ✅ | 1164 ✅ | 1164 ✅ |

`[VERIFIED: matriz ejecutada esta sesión con bash -c / sh -c; "shopt globstar" devolvió "globstar off" como estado por defecto de este shell]`

`**` sin `globstar` **no es un error**: bash lo degrada silenciosamente a `*`, así que
`tests/**/*.test.js` expande a `tests/*/*.test.js` = exactamente los dos ficheros de `fixtures/`.
Se corren 63 de 1164 tests, todo pasa, y **exit 0**. Un autor que copie el comando sin las comillas
—o lo ejecute desde `sh`, o desde un `Bash()` de un agente— recibe verde sobre el 5 % de la suite.
La documentación de Node avisa de esto explícitamente:

> «The glob patterns should be enclosed in double quotes on the command line to prevent shell
> expansion, which can reduce portability across systems.»
> `[CITED: https://nodejs.org/docs/latest-v22.x/api/test.html]`

La forma H no depende de las comillas porque no usa ningún metacarácter que el shell no soporte
universalmente: funciona igual si el shell expande y si lo hace Node.

### Opción 3 (mover los ficheros a `tests/`) — coste real

Enganchan con la invocación actual sin tocarla, pero:

1. `tests/fixtures/slot-variants-integration.test.js:37` hace
   `const projectRoot = resolve(__dirname, '..', '..');` — **dos niveles**. Al mover el fichero,
   `projectRoot` apunta al padre del repo y todos los `readJson` fallan.
   `[VERIFIED: tests/fixtures/slot-variants-integration.test.js:37 leído esta sesión, verbatim: `const projectRoot = resolve(__dirname, '..', '..');`]`
2. Los dos ficheros importan `'../../src/data/schema-validator.js'` y
   `'../../src/data/content-loader.js'` — también dos niveles.
   `[VERIFIED: líneas 32-33 de slot-variants-integration.test.js y 22-23 de slot-variants.test.js leídas esta sesión]`
3. `tests/count-arrays-lockstep.test.js:47` declara la ruta como **string literal** dentro de
   `COUNT_ARRAY_SOURCES`, y `:645` declara `const REPORTER = 'scripts/run-validation-271.mjs';`.
   Mover el fichero sin actualizar `:47` da ENOENT en el gate.
   `[VERIFIED: tests/count-arrays-lockstep.test.js:45-48 leído esta sesión, verbatim:`
   ```js
   const COUNT_ARRAY_SOURCES = [
     'scripts/run-validation-271.mjs',
     'tests/fixtures/slot-variants-integration.test.js',
   ];
   ```
   `]`
4. `tests/fixtures/` seguiría conteniendo `song-golden.json` y `validation-pilot-disputed.json`
   (fixtures de datos de verdad), así que el directorio no desaparece y el nombre deja de explicar
   su contenido.

**Recomendación: NO mover.** Ampliar el glob es 1 línea de contrato contra ~6 ediciones frágiles.

### Mutación de verificación — receta exacta (reproducida hoy)

```bash
cd /home/vcompanyb/italian-course

# 1. MUTAR — desincronizar un `expected` LITERAL de REAL_CATEGORIES.
#    Tiene que ser uno de los 9 literales; los 9 dinámicos (readJson(...).length)
#    son TAUTOLÓGICOS y no muerden (misma ruta, mismo arranque — deuda IN-03).
#    Los literales son: avere 20, essere 26, preposiciones 50, verbos-movimiento 7,
#    sustantivos-irregulares 5, genero-numero 13, profesiones 11, articoli 34, partitivos 19.
perl -0pi -e "s/\{ slug: 'avere', expected: 20 \}/{ slug: 'avere', expected: 21 }/" \
  tests/fixtures/slot-variants-integration.test.js

# 2. LA FORMA VIEJA SE QUEDA VERDE (esto es el bug, y hay que registrarlo)
node --test tests/*.test.js; echo "exit=$?"
#   → # tests 1101 / # pass 1101 / # fail 0 / exit=0     ← MIENTE

# 3. LA FORMA NUEVA SE PONE ROJA
node --test tests/*.test.js tests/fixtures/*.test.js; echo "exit=$?"
#   → # tests 1164 / # pass 1163 / # fail 1 / exit=1
#   → "Conteo inesperado en content/exercises/avere.json: esperaba 21, encontré 20"

# 4. REVERTIR y confirmar
git checkout -- tests/fixtures/slot-variants-integration.test.js
git status --short          # sin cambios en tests/
node --test tests/*.test.js tests/fixtures/*.test.js   # 1164 / 1164
```

`[VERIFIED: los 4 pasos ejecutados literalmente esta sesión; salidas transcritas de la terminal, no reconstruidas. git status quedó limpio tras el paso 4]`

> **No usar «borrar una entrada de `REAL_CATEGORIES`» como mutación.** Esa mutación ya la caza el
> gate anti-ceguera de hoy (`slugsCiegos` sobre esa fuente), así que se pondría roja **por la razón
> equivocada** y certificaría DEUDA-01 sin probar nada. La mutación tiene que atacar una aserción
> que vive DENTRO del fichero huérfano — que es literalmente lo que DEUDA-01 dice que no corre.

---

## DEUDA-02 — el tercer array entra en el gate anti-ceguera

### Cómo funciona el extractor hoy

`tests/count-arrays-lockstep.test.js` no importa las fuentes: lee su **texto** y asserta sobre él
(D-44-07). El pipeline es:

1. `sinComentarios(src)` — escáner carácter a carácter que blanquea comentarios `//` y `/* */`
   **preservando longitud y saltos de línea** (CR-01). Reconoce cadenas `'`, `"`, backtick;
   **NO reconoce literales de expresión regular** (limitación deliberada y documentada).
2. `slugsCiegos(src, slugs)` — para cada slug, exige un ancla de tres mitades: **identidad**
   (slug completo byte a byte), **posición** (línea que ABRE una entrada: whitespace horizontal +
   `{` + resto en la misma línea, flag `m`) y **ausencia de comentario** (garantizada por el paso 1).
   La regex, verbatim:
   ```js
   const anclado = new RegExp(`^[^\\S\\n]*\\{[^\\n]*slug:\\s*(['"\`])${escapeRe(slug)}\\1`, 'm');
   ```
   `[VERIFIED: tests/count-arrays-lockstep.test.js:211 leído esta sesión]`
3. `paresSlugFile(src)` / `paresCruzados(src)` — extraen pares `{slug, file}` y delatan los que
   apuntan al fichero de otra categoría (D-40-03, el copia-pega `fare-ind`).

**La causa exacta de la exclusión:** el paso 2 exige la clave literal `slug:`, y
`CATEGORIES_WITH_EXPLANATIONS` **no declara ninguna**. Comprobado:
`grep -c "slug:" tests/exercise-types.test.js` → **0 ocurrencias en todo el fichero**.
`[VERIFIED: grep ejecutado esta sesión sobre las 1626 líneas del fichero]`

### Cómo es el array hoy

`tests/exercise-types.test.js:1338-1366`, **18 entradas**, todas de la forma
`{ file: '<ruta>', expected: <n> }`. Las 4 primeras y las 2 últimas, verbatim del disco:

```js
const CATEGORIES_WITH_EXPLANATIONS = [
  { file: 'content/exercises/preposiciones.json', expected: 50 },
  { file: 'content/exercises/genero-numero.json', expected: 13 },
  { file: 'content/exercises/avere.json', expected: 20 },
  { file: 'content/exercises/sustantivos-irregulares.json', expected: 5 },
  …
  { file: 'content/exercises/fare-cond-imperativo.json', expected: slotCountOf('content/exercises/fare-cond-imperativo.json') },
  { file: 'content/exercises/fare-indefiniti.json',      expected: slotCountOf('content/exercises/fare-indefiniti.json') },
];
```

`[VERIFIED: tests/exercise-types.test.js:1338-1366 leído esta sesión; 18 líneas coincidentes con el patrón "^  { file: 'content/exercises/", contadas por grep -c]`

**Está en sync perfecto:** las 18 entradas ↔ las 18 categorías de `content/categories.json`
(`avere, essere, preposiciones, verbos-movimiento, sustantivos-irregulares, genero-numero,
profesiones, articoli, partitivos, presente-regolare, dimostrativi, possessivi, modali, riflessivi,
fare-indicativo, fare-congiuntivo, fare-cond-imperativo, fare-indefiniti`, orders 1-18).
`[VERIFIED: content/categories.json parseado con node esta sesión → 18 entradas, orders 1..18 contiguos]`

Se consume con `for (const { file, expected } of CATEGORIES_WITH_EXPLANATIONS)` (`:1383`), que
destructura **solo** `file` y `expected` — así que añadir una clave `slug` es inerte para el
consumo. `[VERIFIED: tests/exercise-types.test.js:1383 leído esta sesión]`

### Prueba de la ceguera (mutación, reproducida hoy)

```bash
# borrar la entrada de fare-indefiniti de CATEGORIES_WITH_EXPLANATIONS
node --test tests/count-arrays-lockstep.test.js   # → 24 pass / 0 fail   ← el gate no ve nada
node --test tests/*.test.js; echo $?              # → 1096 pass / 0 fail / exit 0
```

Es decir: la suite ENCOGE de 1101 a 1096 (5 tests menos, los del smoke paramétrico de esa
categoría) **y sigue verde con exit 0**. La única señal es una cifra que nadie asserta.
`[VERIFIED: ejecutado y revertido esta sesión]`

### Las dos opciones, ambas prototipadas y ejecutadas

#### ⚠️ Añadir la fuente a `COUNT_ARRAY_SOURCES` sin más NO funciona

Probado: rompe **dos** tests, no uno.

```
not ok 3 - las dos fuentes de conteo enganchan las categorias registradas (INT-02)
   → "tests/exercise-types.test.js quedaria CIEGO a estas categorias: avere, essere, … (las 18)"
not ok 4 - el par slug ↔ file de cada entrada apunta a su PROPIO fichero (INT-02, D-40-03)
   → "tests/exercise-types.test.js: NO declara `file` por entrada y tampoco DERIVA la ruta del
      slug (no contiene `content/exercises/${slug}.json`): canal de ceguera nuevo, sin cobertura"
```

`[VERIFIED: ejecutado y revertido esta sesión; 25 tests, 23 pass, 2 fail]`

El segundo fallo es la **cláusula de disyuntiva** de `:680-707`: una fuente o declara pares
`slug`+`file` (y entonces el par debe cuadrar) o DERIVA la ruta del slug (y es inmune por
construcción). `CATEGORIES_WITH_EXPLANATIONS` no hace ninguna de las dos, así que el gate la
clasifica como «canal de ceguera nuevo».

> **Nota de prosa-vs-código para el planner:** el mensaje de ese fallo dice «NO declara `file` por
> entrada», y eso es **falso** para este array — sí declara `file`; lo que no declara es `slug`.
> Si se elige la Opción B, ese mensaje hay que reescribirlo o se convierte en un diagnóstico
> mentiroso, que es la misma especie de deuda que la fase existe para pagar.

#### Opción A — dar forma parseable al array (**RECOMENDADA**)

Añadir `slug: '<slug>',` delante del `file:` de cada una de las 18 entradas, y añadir
`'tests/exercise-types.test.js'` a `COUNT_ARRAY_SOURCES`. **Cero cambios en el extractor.**

Resultado medido con el prototipo:

| Comprobación | Resultado |
|---|---|
| `node --test tests/count-arrays-lockstep.test.js` en sync | **25 / 25 pass, 0 fail** |
| `node --test tests/exercise-types.test.js` (el consumo no se entera) | **183 / 183 pass** |
| Con la entrada `fare-indefiniti` borrada | **24 pass / 1 fail** |
| Mensaje del rojo | `INT-02 / D-44-06: tests/exercise-types.test.js quedaria CIEGO a estas categorias: fare-indefiniti` |

`[VERIFIED: prototipo aplicado con perl, ejecutado, mutado, re-ejecutado y revertido esta sesión; git status limpio al final]`

Ventajas sobre B:
- El extractor no crece → WR-07 y WR-12 se quedan como están (o se arreglan aparte, sin acoplarse).
- La fuente pasa a estar cubierta por **los dos** gates: `slugsCiegos` **y** `paresCruzados`
  (el copia-pega `fare-ind` entre slug y file queda cazado también aquí, gratis).
- Hace las tres fuentes **estructuralmente idénticas**, que es lo que hace que la cuarta se
  enganche sin pensar.

Coste: 18 líneas editadas en un fichero de test; el diff es mecánico y regular.

#### Opción B — enseñar al extractor la forma `file:`

Generalizar el ancla para aceptar `slug: '<slug>'` **o** `file: '…/<slug>.json'`. Prototipada:

```js
new RegExp(
  `^[^\\S\\n]*\\{[^\\n]*(?:slug:[^\\S\\n]*(['"\`])${escapeRe(slug)}\\1` +
  `|file:[^\\S\\n]*(['"\`])content/exercises/${escapeRe(slug)}\\.json\\2)`, 'm')
```

Medido sobre las tres fuentes reales: **0 ciegas en las tres** (retrocompatible).
`[VERIFIED: prototipo ejecutado esta sesión contra los 18 slugs y los 3 ficheros]`

Pero exige además **un tercer brazo en la disyuntiva** de `:680-707` y goldens nuevos para la
forma `file:`. Más superficie de extractor, menos cobertura (no gana el gate de par cruzado).

**Veredicto: Opción A.** Menos código, más gate, y ninguna regex nueva que mantener.

### Nota sobre WR-07 y WR-12 (el ROADMAP los declara «ligados»)

Los dos siguen **abiertos en disco**, verificados hoy:

- **WR-07** — `:211` usa `slug:\s*` a dos líneas del comentario que lo prohíbe («`[^\S\n]*` =
  whitespace HORIZONTAL: acota el ancla a una sola linea (un `\s*` podria cruzar saltos de
  linea)», `:209-210`). `paresSlugFile` (`:237`) sí usa `slug:[^\S\n]*`. Fix de una palabra.
  Con la Opción A el ancla de `:211` pasa a gobernar TRES fuentes en vez de dos, así que el
  momento de arreglarlo es este. `[VERIFIED: tests/count-arrays-lockstep.test.js:209-211 leído esta sesión]`
- **WR-12** — `:663-669` asserta `pares.length === SLUGS_REGISTRADOS.length`. Hoy 18 = 18. Solo
  aplica a `REPORTER`, así que la Opción A **no lo agrava** (no mete la tercera fuente en esa
  cláusula). Se puede arreglar o no de forma independiente.
  `[VERIFIED: tests/count-arrays-lockstep.test.js:653-678 leído esta sesión]`

---

## DEUDA-03 — el reporter deja de mentir sobre su propio objeto

### Los sitios stale, localizados HOY (los números del ROADMAP han derivado)

El ROADMAP cita «líneas 4, 7, 43, 70, 376» y `44-REVIEW.md:616` cita «:5-7, :64, :360, :437, :481».
**Las dos listas están desfasadas** — el fichero se editó el 2026-08-12. Grep de hoy sobre
`scripts/run-validation-271.mjs` (542 líneas):

| Línea | Contenido stale (verbatim del disco) | Tipo |
|---|---|---|
| 4 | `// Reporter del milestone v1.1 Phase 10 — gate VAL-04 + VAL-06 + VAL-08.` | comentario |
| 5 | `// Lee los 271 ejercicios distribuidos en los 7 archivos \`content/exercises/*.json\`` | comentario (real: 18 ficheros / 250 slots) |
| 7 | `// \`validation.passes[]\`, y verifica los 3 sub-gates del milestone v1.1.` | comentario |
| 43 | `//       y luego \`/gsd:complete-milestone v1.1\`.` | comentario |
| 68 | `// La suma de \`expected\` es 195.` | comentario (real: 250) |
| **376** | `console.log(\`${BOLD}Milestone v1.1 — gate Phase 10 (VAL-04 + VAL-06 + VAL-08 + VAL-09)${RESET}\`);` | **SALIDA IMPRESA** |
| 453 | `// VAL-06: 271/271 con effectiveStatus === "validated" Y total real = 271.` | comentario |
| **513** | `console.log('  → si OK: /gsd:complete-milestone v1.1');` | **SALIDA IMPRESA** |

`[VERIFIED: grep -n "v1\.1\|Phase 10\|271\|complete-milestone" scripts/run-validation-271.mjs ejecutado esta sesión; líneas 376 y 513 leídas con Read]`

**Solo 376 y 513 son salida impresa** (lo que el ROADMAP llama «encabezado y pie»). Las otras 6 son
comentarios. El ROADMAP pide derivar las dos impresas; los comentarios son prosa que hay que
corregir a mano o borrar (`44-REVIEW.md:633` pide conservar el bloque de historial contable
`:64-162` como audit trail deliberado y sacar de él solo los números que pretenden describir el
comportamiento ACTUAL).

**No existe ningún test que cubra esto.** `grep -rn "Milestone v1.1\|gate Phase 10" tests/` →
**0 resultados**. `[VERIFIED: grep ejecutado esta sesión sobre todo tests/]`
Por eso lleva cuatro milestones desfasado: nada podía ponerse rojo. **Si el plan solo corrige el
texto sin añadir un test de la derivación, la deuda vuelve en v2.1.**

### De dónde derivar el milestone activo

Candidatos evaluados contra el disco:

| Fuente | Parseable | Actual | Veredicto |
|---|---|---|---|
| **`.planning/STATE.md` frontmatter** | ✅ YAML plano, 1 clave por línea | ✅ `milestone: v2.0` | ✅ **RECOMENDADA** |
| `.planning/REQUIREMENTS.md:1` | ⚠️ prosa en el `# H1` | ✅ dice `Milestone v2.0` | Secundaria / cross-check |
| `.planning/ROADMAP.md` | ❌ el marcador es `🚧` + `(ACTIVE…)` en prosa larga | ✅ | Frágil |
| `.planning/MILESTONES.md` | ✅ | ❌ **el último es v1.9** — solo registra SHIPPED | ☠️ Derivaría v1.9: un desfase nuevo |
| `.planning/config.json` | ✅ | ❌ no tiene clave de milestone | No sirve |

Las dos primeras líneas útiles de `.planning/STATE.md`, verbatim:

```yaml
---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Paradigma completo de `fare` (4 categorías por modo)
current_phase: 44
```

`[VERIFIED: .planning/STATE.md:1-8 leído esta sesión]`

`.planning/STATE.md` está **trackeado en git** (`git ls-files .planning/STATE.md` → devuelve la
ruta), así que viaja con el código y no depende de tooling GSD ni de red.
`[VERIFIED: git ls-files ejecutado esta sesión]`

### Esqueleto de la derivación

```js
// El milestone que este gate está cerrando NO se transcribe: se DERIVA del disco,
// por el mismo principio que los counts (D-31-06, nunca número mágico). Un banner
// transcrito lleva cuatro milestones desfasado y nada podía ponerse rojo.
//
// FAIL-SOFT deliberado (lección WR-09): este reporter tiene que poder imprimir su
// tabla aunque el fichero de estado falte. Un throw a nivel de módulo mata el
// proceso sin una sola fila y convierte una etiqueta cosmética en un blocker.
const milestoneActivo = (() => {
  try {
    const raw = readFileSync(resolve(projectRoot, '.planning/STATE.md'), 'utf8');
    return raw.match(/^milestone:[^\S\n]*(\S+)[^\S\n]*$/m)?.[1] ?? null;
  } catch { return null; }
})();

const etiquetaMilestone = milestoneActivo ?? 'milestone desconocido (.planning/STATE.md no legible)';

console.log(`${BOLD}Gate de cierre de ${etiquetaMilestone} — VAL-04 + VAL-06 + VAL-08 + VAL-09 ` +
            `(${CATEGORIES.length} categorías, ${TOTAL_EXPECTED} slots)${RESET}`);
```

y en el pie (`:513`):

```js
console.log(`  → si OK: /gsd-complete-milestone ${etiquetaMilestone}`);
```

> Con los valores de disco de hoy eso imprime `Gate de cierre de v2.0 — … (18 categorías, 250
> slots)`. Las cifras `18` y `250` ya existen en el fichero (`CATEGORIES.length`, `TOTAL_EXPECTED`)
> y ya son correctas — la auditoría lo confirmó (`VAL-06 PASS 250/250`); lo único que faltaba era
> ponerlas en el banner en vez del literal.
> `[ASSUMED: la cifra 250 procede de .planning/v2.0-MILESTONE-AUDIT.md:73, no de una ejecución del reporter en esta sesión — el planner debe re-derivarla en plan-time]`

### ⚠️ Dos restricciones NO obvias al editar este fichero

1. **`scripts/run-validation-271.mjs` es una de las fuentes que `sinComentarios` escanea.** Ese
   escáner **no reconoce literales de expresión regular** (limitación declarada en
   `count-arrays-lockstep.test.js:105-113`). Una regex nueva que contenga `'`, `"` o backtick
   desalinea el escaneo **de esa línea**. El daño está acotado a una línea por construcción
   (`comilla` se declara dentro del `map`), así que es seguro **siempre que ninguna entrada de
   `CATEGORIES` comparta línea con la regex**. La regex propuesta arriba
   (`/^milestone:[^\S\n]*(\S+)[^\S\n]*$/m`) no lleva ninguna comilla → segura.
   `[VERIFIED: tests/count-arrays-lockstep.test.js:105-113 leído esta sesión, verbatim: «NO reconoce literales de expresion regular: un `/…/` que contuviera una comilla suelta desalineeria el escaneo»]`
2. **`:511` imprime la invocación canónica de la suite** (`VAL_07_STRICT=1 node --test
   tests/*.test.js`). DEUDA-01 la cambia → **hay que actualizarla en el mismo plan**, o el
   reporter le dice al autor que corra la forma ciega justo después de decirle que el gate pasa.
   `[VERIFIED: scripts/run-validation-271.mjs:511 leído esta sesión]`

### Renombrar el fichero: **FUERA DE ALCANCE** (recomendado)

El nombre codifica un `271` obsoleto (hoy 250). Inventario de call-sites de `run-validation-271`:

| Fichero | Ocurrencias | Load-bearing |
|---|---|---|
| `tests/count-arrays-lockstep.test.js` | **10** | Sí — `:46` (string en `COUNT_ARRAY_SOURCES`) y `:645` (`const REPORTER`) rompen el gate; las otras 8 son prosa |
| `.claude/skills/gsd-validate-batch/SKILL.md` | 5 | Sí (instrucciones ejecutables) |
| `README.md` | 2 | Sí (`:113` documenta el comando) |
| `.planning/**` (histórico) | decenas de ficheros | No, pero el historial dejaría de ser grepeable |

`[VERIFIED: grep -c por fichero ejecutado esta sesión]`

Renombrar arrastra 17 ediciones load-bearing más el historial. El ROADMAP acota DEUDA-03 a
«encabezado y pie», y el `271` del nombre no engaña a nadie sobre **qué gate corre** — engañaba el
banner. **Recomendación: dejar el nombre, y añadir un comentario de una línea en la cabecera que
diga que el `271` es histórico.** Si el autor lo quiere, va a quick task aparte.

---

## Architecture Patterns

### Diagrama del sistema

```
                     content/categories.json  (18 entradas — LA REFERENCIA)
                                  │
                                  │ readFileSync + JSON.parse
                                  ▼
                    ┌─────────────────────────────┐
                    │ count-arrays-lockstep.test  │  ← el GATE ANTI-CEGUERA
                    │   sinComentarios(texto)     │
                    │   slugsCiegos(texto,slugs)  │
                    │   paresSlugFile / Cruzados  │
                    └─────────────────────────────┘
                       │ lee el TEXTO FUENTE de (source-assert, NUNCA import)
        ┌──────────────┼──────────────────────────┬─────────────────────────┐
        ▼              ▼                          ▼                         ▼
  run-validation   slot-variants-integration   exercise-types          (la 4ª fuente
  -271.mjs         .test.js                    .test.js                 que se dé de alta)
  CATEGORIES       REAL_CATEGORIES             CATEGORIES_WITH_
  {slug,file}      {slug} (file derivado)      EXPLANATIONS {file}
        │              │                          │
        │              │  ✗ DEUDA-01: no corre    │  ✗ DEUDA-02: sin `slug:`,
        │              │    en la suite canónica  │    invisible al extractor
        │              ▼                          ▼
        │        ╔═══════════════════════════════════════════╗
        │        ║  node --test <glob>   ← LA INVOCACIÓN     ║
        │        ║  hoy: tests/*.test.js  → 1101 (ciega)     ║
        │        ║  fix: + tests/fixtures/*.test.js → 1164   ║
        │        ╚═══════════════════════════════════════════╝
        ▼
  banner + pie impresos   ← ✗ DEUDA-03: literal «v1.1 / Phase 10», sin test que lo cubra
        ▲
        │ debe DERIVARSE de
  .planning/STATE.md  (frontmatter: `milestone: v2.0`)
```

### Component Responsibilities

| Fichero | Responsabilidad | Lo que cambia en Phase 45 |
|---|---|---|
| `tests/count-arrays-lockstep.test.js` | Gate anti-ceguera source-assert | +1 entrada en `COUNT_ARRAY_SOURCES`; (opcional) WR-07 |
| `tests/exercise-types.test.js` | Smoke paramétrico de explanations | +clave `slug:` en las 18 entradas (Opción A) |
| `tests/fixtures/slot-variants-integration.test.js` | Pipeline E2E + back-compat SLOT-06 | **Nada** — solo pasa a ejecutarse |
| `tests/fixtures/slot-variants.test.js` | Unitarios del validator/normalizador | **Nada** — solo pasa a ejecutarse (+19) |
| `scripts/run-validation-271.mjs` | Reporter de cierre de milestone | Banner y pie derivados; `:511` actualizada; comentarios stale |
| `README.md`, los 2 `SKILL.md` | Contrato «canónico» en prosa | La invocación nueva, en lockstep |

### Pattern 1: Source-assert sobre una fuente no importable (D-44-07)

**Qué:** leer el texto fuente y assertar sobre él, en vez de importar el módulo.
**Cuándo:** cuando la fuente tiene efectos secundarios al importarse (el guard de coherencia del
reporter llama a `process.exit(1)` a nivel de módulo) o cuando el dato vive en un `const` dentro de
un callback de `describe` y no hay nada que exportar. **Las dos condiciones se dan aquí.**

```js
// Source: tests/count-arrays-lockstep.test.js:44-50 (verbatim del disco)
const COUNT_ARRAY_SOURCES = [
  'scripts/run-validation-271.mjs',
  'tests/fixtures/slot-variants-integration.test.js',
];

const readSrc = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
```

### Pattern 2: La referencia SIEMPRE se lee del disco

**Qué:** el número/lista contra el que se compara nunca se escribe en el test.
**Por qué:** `44-REVIEW.md` CR-01 y la memoria `gate_congela_literal_debe_anclar_disco` registran
el mismo fallo: una cifra escrita en el test se compara consigo misma y es verde para siempre.

```js
// Source: tests/count-arrays-lockstep.test.js:56-60 (verbatim del disco)
const CATEGORIES = JSON.parse(
  readFileSync(new URL('../content/categories.json', import.meta.url), 'utf-8')
);
const SLUGS_REGISTRADOS = CATEGORIES.categories.map((c) => c.id);
```

### Pattern 3: Golden fail-first sobre cadenas literales

**Qué:** antes de aplicar un helper al disco, probarlo contra cadenas literales que representan la
forma rota. `count-arrays-lockstep.test.js:263-482` tiene 8 goldens así.
**Por qué:** «un gate probado solo en verde es una afirmación, no una garantía» (`:261`).
**Aplicación en Phase 45:** si se toca el extractor (Opción B), **cada forma nueva necesita su
golden negativo**. Con la Opción A no hace falta ninguno, porque el ancla no cambia.

### Anti-Patterns to Avoid

- **Assertar una cifra que también está escrita en la prosa de al lado.** Es CR-01 de la Phase 44
  verbatim: la suite firmaba 247 con el reporter en 250. Cualquier cifra nueva (1164, 18, 250) se
  deriva del disco o no se asserta.
- **Cerrar un gap sin verificar por mutación que quedó cerrado.** `44-REVIEW.md:725` y la memoria
  `reviewer_fix_needs_same_mutation`: 2 de los 4 fixes que un revisor propuso eran incorrectos y
  uno era peor que el bug. **Esto incluye los esqueletos de este documento.**
- **Elegir una invocación que dependa de las comillas.** Ver Pitfall #1.
- **Copiar los números de línea del ROADMAP o de `44-REVIEW.md`.** Están desfasados; hay que
  re-greparlos en plan-time.

---

## Don't Hand-Roll

| Problema | No construyas | Usa en su lugar | Por qué |
|---|---|---|---|
| Descubrir ficheros de test | Un script `.mjs` que recorra `tests/` y haga `import()` | El glob de dos rutas de `node --test` | Perdería el aislamiento por fichero, los exit codes y el reporter TAP; y sería una cuarta cosa que puede quedarse desincronizada |
| Quitar comentarios de JS | Un `String.replace` de dos pasadas | `sinComentarios` que ya existe (`:118-165`) | Documentado en `:93-103`: la forma corta produce un **falso rojo catastrófico** — `run-validation-271.mjs:5` contiene `exercises/*.json` dentro de un comentario de línea, ese `s/*` es un `/*` literal, el regex abre ahí y cierra en el primer `*/` del fichero, blanqueando el array `CATEGORIES` entero |
| Anclar un slug en texto fuente | `src.includes(slug)` | `slugsCiegos` (identidad + posición) | `fare-ind` es prefijo de `fare-indicativo` y `fare-indefiniti` (D-40-03): un `includes` da verde a una con solo la otra presente |
| Parsear el frontmatter de STATE.md | Una librería YAML | `raw.match(/^milestone:[^\S\n]*(\S+)$/m)` | Zero-dep es constraint duro de CLAUDE.md; el frontmatter es plano, una clave por línea |
| Verificar que un gate muerde | Leer el código y razonar | Mutar → correr → ver rojo → revertir | Es la política del proyecto (`44-REVIEW.md:725`) y lo que separa este plan del anterior |

**Key insight:** cada pieza que esta fase necesita **ya existe y ya está endurecida** por dos ciclos
de review. La deuda no es que falte maquinaria: es que tres fuentes no están enchufadas a ella. El
plan que escribe helpers nuevos está resolviendo el problema equivocado.

---

## Common Pitfalls

### Pitfall 1: `tests/**/*.test.js` sin comillas corre el 5 % de la suite y sale con exit 0

**Qué sale mal:** bash sin `globstar` (el estado por defecto de este shell) y `sh`/`dash` degradan
`**` a `*`. `tests/**/*.test.js` expande a `tests/*/*.test.js` = los 2 ficheros de `fixtures/`.
**63 de 1164 tests, todo verde, exit 0.**
**Por qué pasa:** `**` no es un error de sintaxis sin `globstar`; es un glob válido con otro
significado. No hay warning.
**Cómo evitarlo:** canonizar `node --test tests/*.test.js tests/fixtures/*.test.js`, que da 1164
bajo los 4 regímenes probados (bash con comillas, bash sin comillas, bash con `globstar`, `sh`).
**Señal de alarma:** un `# tests` de 63, o cualquier número que no sea 1164 / 1182 (strict).
`[VERIFIED: matriz de 7 invocaciones × shells ejecutada esta sesión]`

### Pitfall 2: `--recursive` no existe — el fix que propone el code review de la Phase 44 no compila

**Qué sale mal:** `44-REVIEW.md:527` propone «standardise on `node --test --recursive tests/`».
En v22.20.0: `node: bad option: --recursive`.
**Por qué pasa:** el revisor razonó desde la documentación general del runner sin ejecutarlo — el
mismo modo de fallo que la memoria `reviewer_fix_needs_same_mutation` registra para la Phase 44.
**Cómo evitarlo:** ejecutar cada invocación candidata antes de escribirla en un criterio de
aceptación. **Y no tratar `44-REVIEW.md` como spec ejecutable.**
`[VERIFIED: node --test --recursive tests/ ejecutado esta sesión → "node: bad option: --recursive"]`

### Pitfall 3: `node --test` a pelo barre un helper que no es un test

**Qué sale mal:** el descubrimiento por defecto incluye `**/test-*.{cjs,mjs,js}`, que casa
`tests/util/test-helpers.js` — un módulo de helpers puros sin un solo `test()`. Node lo cuenta como
**1 test que pasa**. Total 1165 en vez de 1164.
**Por qué pasa:** el patrón mira el nombre, no el contenido.
**Cómo evitarlo:** no usar el descubrimiento por defecto; enumerar los dos globs.
**Señal de alarma:** `ok N - tests/util/test-helpers.js` en la salida TAP.
`[VERIFIED: node --test → 1165; node --test tests/util/test-helpers.js → "ok 1 - tests/util/test-helpers.js", "# tests 1 / # pass 1"]`

### Pitfall 4: la mutación de DEUDA-01 falla en silencio si se elige un `expected` dinámico

**Qué sale mal:** 9 de las 18 entradas de `REAL_CATEGORIES` usan
`readJson('…').exercises.length` como `expected`. El assert de conteo compara ese valor **consigo
mismo** (misma ruta, mismo arranque): es tautológico y no puede fallar. Mutarlo no pone nada rojo y
parecería que el enganche no funcionó.
**Por qué pasa:** es la deuda IN-03 declarada en `tests/exercise-types.test.js:1328-1334`, y aplica
igual aquí.
**Cómo evitarlo:** mutar uno de los **9 literales**: `avere 20`, `essere 26`, `preposiciones 50`,
`verbos-movimiento 7`, `sustantivos-irregulares 5`, `genero-numero 13`, `profesiones 11`,
`articoli 34`, `partitivos 19`.
`[VERIFIED: tests/fixtures/slot-variants-integration.test.js:170-195 leído esta sesión; los 9 literales y los 9 dinámicos contados a mano sobre el texto]`

### Pitfall 5: el conteo de la suite ENCOGE en silencio

**Qué sale mal:** borrar una entrada de `CATEGORIES_WITH_EXPLANATIONS` baja el total de 1101 a 1096
con exit 0. La cobertura se evapora y el único síntoma es un número que nadie asserta.
**Por qué pasa:** el `describe` se genera en un bucle sobre el array; menos entradas = menos tests,
no tests rojos.
**Cómo evitarlo:** es exactamente lo que DEUDA-02 cierra. **Corolario para el SUMMARY:** registrar
el conteo pre/post (1101 → 1164) explícitamente, porque el delta es la única defensa contra el
próximo encogimiento (`44-REVIEW.md:528-530`).

### Pitfall 6: números de línea desfasados en los tres documentos de origen

**Qué sale mal:** el ROADMAP dice que el reporter miente en «líneas 4, 7, 43, 70, 376»;
`44-REVIEW.md:616` dice «:5-7, :64, :360, :437, :481»; el disco de hoy dice
**4, 5, 7, 43, 68, 376, 453, 513**. Igual: `count-arrays-lockstep.test.js:107` cita
`run-validation-271.mjs:480` y hoy esa línea es la **511**.
**Por qué pasa:** los ficheros se editaron después de escribirse los documentos.
**Cómo evitarlo:** el plan localiza por **grep de contenido**, nunca por número de línea heredado.

### Pitfall 7: `.planning/MILESTONES.md` derivaría el milestone equivocado

**Qué sale mal:** parece el sitio natural para «el milestone activo», pero solo registra los
SHIPPED — su entrada más reciente es **v1.9**. Derivar de ahí cambiaría un banner desfasado en
cuatro por uno desfasado en uno, con aire de estar arreglado.
**Cómo evitarlo:** derivar de `.planning/STATE.md` (`milestone: v2.0`).
`[VERIFIED: .planning/MILESTONES.md leído esta sesión — la primera sección es «## v1.9 Determinantes + verbos A1/A2 (Shipped: 2026-07-01)»]`

---

## Code Examples

### Cerrar DEUDA-01 (el cambio de contrato)

```bash
# ANTES (ciega a tests/fixtures/ — 1101)
node --test tests/*.test.js

# DESPUÉS (1164; 1182 con VAL_07_STRICT=1)
node --test tests/*.test.js tests/fixtures/*.test.js
VAL_07_STRICT=1 node --test tests/*.test.js tests/fixtures/*.test.js
```

**Inventario EXHAUSTIVO de call-sites a actualizar en lockstep** (grep de contenido, hoy; excluido
todo `.planning/**` histórico, que es registro y no contrato):

| Fichero | Línea | Contenido | Acción |
|---|---|---|---|
| `README.md` | 30 | `node --test tests/*.test.js` (bloque «Tests del dominio») | **Actualizar** |
| `README.md` | 100 | `VAL_07_STRICT=1 node --test tests/*.test.js` | **Actualizar** |
| `README.md` | 32 | «Debe terminar con `pass 14` (o más)» | Actualizar a 1164 (prosa ya obsoleta) |
| `.claude/skills/gsd-validate-batch/SKILL.md` | 479 | `VAL_07_STRICT=1 node --test tests/*.test.js` | **Actualizar** |
| `.claude/skills/it-add-song/SKILL.md` | 26 | `` `node --test tests/*.test.js` en verde. `` | **Actualizar** |
| `.claude/skills/it-add-song/SKILL.md` | 263 | `node --test tests/*.test.js        # verde` | **Actualizar** |
| `scripts/run-validation-271.mjs` | 42 | comentario del exit code 0 | **Actualizar** |
| `scripts/run-validation-271.mjs` | **511** | `console.log('  VAL_07_STRICT=1 node --test tests/*.test.js');` | **Actualizar (salida impresa)** |
| `tests/count-arrays-lockstep.test.js` | 12 | cabecera: «entra en el glob de la suite completa» | **Actualizar** |
| `tests/count-arrays-lockstep.test.js` | 108 | cita `run-validation-271.mjs:480` (hoy 511) | Actualizar la referencia |
| `tests/count-arrays-lockstep.test.js` | 444, 453 | literales DENTRO del golden `SRC_TRAMPA` | **NO TOCAR** — son datos del test, no el contrato |
| `tests/fixtures/slot-variants.test.js` | 15 | `node --test tests/fixtures/slot-variants.test.js` | Correcta (invocación individual) |
| `tests/fixtures/slot-variants-integration.test.js` | 22 | idem | Correcta (invocación individual) |
| `$HOME/.claude/…/memory/test_command_node_glob.md` | — | «Correr la suite completa con la forma glob: `node --test tests/*.test.js`» | **Actualizar la memoria** (`44-REVIEW.md:527` lo pide explícitamente) |
| `content/exercises/fare-indicativo.json`, `fare-congiuntivo.json` | campo `notes` | mencionan la invocación en prosa de audit trail | Dejar (registro histórico) |
| `CLAUDE.md` | — | **cero ocurrencias** | Nada |

`[VERIFIED: grep -n "node --test" ejecutado fichero por fichero esta sesión sobre README.md, CLAUDE.md, los 3 SKILL.md, scripts/, tests/ y content/]`

### Cerrar DEUDA-02, Opción A (la forma verificada)

```js
// tests/exercise-types.test.js:1338+ — se AÑADE `slug:`, no se quita nada.
// El consumo (`for (const { file, expected } of …)`, :1383) destructura solo
// file y expected, así que la clave nueva es inerte para el smoke.
// La clave existe para que el gate anti-ceguera de count-arrays-lockstep pueda
// ANCLAR la entrada (identidad + posición): sin `slug:` el extractor no la ve, y
// una categoría registrada podía desaparecer de aquí en silencio.
const CATEGORIES_WITH_EXPLANATIONS = [
  { slug: 'preposiciones', file: 'content/exercises/preposiciones.json', expected: 50 },
  { slug: 'genero-numero', file: 'content/exercises/genero-numero.json', expected: 13 },
  // … las 18
];
```

```js
// tests/count-arrays-lockstep.test.js:45 — la TERCERA fuente entra en el gate.
const COUNT_ARRAY_SOURCES = [
  'scripts/run-validation-271.mjs',
  'tests/fixtures/slot-variants-integration.test.js',
  'tests/exercise-types.test.js',
];
```

> La cabecera del fichero y los nombres de los `describe` dicen «las DOS fuentes» en varios sitios
> (`:44`, `:616`, `:680`). Con tres, esa prosa pasa a ser falsa — y «la prosa es más cuidadosa que
> el código» es literalmente el patrón que la auditoría nombra como causa raíz
> (`v2.0-MILESTONE-AUDIT.md:160-163`). **Actualizar el texto es parte del fix, no pulido.**

### Cerrar DEUDA-03 con un test que lo congele

Sin esto, DEUDA-03 vuelve. El test tiene que comparar **contra el disco**, nunca contra un literal:

```js
// El banner del reporter no puede transcribir el milestone: lleva cuatro
// desfasado precisamente porque ningún test podía ponerse rojo. Este gate no
// asserta QUÉ milestone es (eso sería un literal que envejece igual): asserta
// que el fichero NO CONTIENE un literal de milestone en su salida impresa, y que
// el valor que deriva coincide con el frontmatter de STATE.md.
const SRC = readFileSync(new URL('../scripts/run-validation-271.mjs', import.meta.url), 'utf8');
const STATE = readFileSync(new URL('../.planning/STATE.md', import.meta.url), 'utf8');
const milestoneEnDisco = STATE.match(/^milestone:[^\S\n]*(\S+)[^\S\n]*$/m)[1];

test('el reporter no transcribe ningún milestone en su salida impresa', () => {
  const lineasImpresas = sinComentarios(SRC)
    .split('\n')
    .filter((l) => l.includes('console.log'));
  const transcritos = lineasImpresas.filter((l) => /\bv\d+\.\d+\b/.test(l));
  assert.deepEqual(
    transcritos, [],
    `DEUDA-03: estas líneas imprimen un milestone LITERAL en vez de derivarlo:\n  ${transcritos.join('\n  ')}`
  );
});
```

> `[ASSUMED]` — este esqueleto **no se ejecutó** en esta sesión. Es una hipótesis, y por la política
> del propio proyecto (`reviewer_fix_needs_same_mutation`) el ejecutor debe verificarlo por mutación
> antes de darlo por bueno. Riesgo conocido: `sinComentarios` es un `export` de
> `count-arrays-lockstep.test.js`; importarlo desde OTRO fichero de test re-registra sus `describe`s
> y duplicaría 25 tests. **Si el test nuevo vive en `count-arrays-lockstep.test.js`, no hay import y
> el problema no existe** — es la ubicación recomendada.

---

## Mutation-Verification Protocol

Regla común a las tres: **mutar → correr → ver ROJO con el mensaje correcto → revertir → confirmar
verde y `git status` limpio.** Un gate que nunca se vio rojo es una afirmación, no una garantía
(`count-arrays-lockstep.test.js:261`).

### DEUDA-01

```bash
perl -0pi -e "s/\{ slug: 'avere', expected: 20 \}/{ slug: 'avere', expected: 21 }/" \
  tests/fixtures/slot-variants-integration.test.js
node --test tests/*.test.js tests/fixtures/*.test.js; echo "exit=$?"
# ESPERADO: 1164 tests / 1163 pass / 1 fail / exit=1
#           "Conteo inesperado en content/exercises/avere.json: esperaba 21, encontré 20"
git checkout -- tests/fixtures/slot-variants-integration.test.js
node --test tests/*.test.js tests/fixtures/*.test.js   # 1164/1164, exit 0
```
`[VERIFIED: ejecutado íntegro esta sesión, incluida la reversión]`

### DEUDA-02

```bash
# borrar la línea de la entrada fare-indefiniti de CATEGORIES_WITH_EXPLANATIONS
node --test tests/count-arrays-lockstep.test.js; echo "exit=$?"
# ESPERADO tras el fix: 24 pass / 1 fail / exit=1
#   "INT-02 / D-44-06: tests/exercise-types.test.js quedaria CIEGO a estas categorias: fare-indefiniti"
# HOY (sin el fix): 24/24 pass, exit 0  ← la ceguera
git checkout -- tests/exercise-types.test.js
```
`[VERIFIED: ambos lados (con y sin el prototipo del fix) ejecutados y revertidos esta sesión]`

### DEUDA-03

No hay gate que mutar hasta que el plan cree uno. Receta en dos partes:

```bash
# (a) mutar el DATO y comprobar que el banner lo SIGUE
sed -i 's/^milestone: v2.0$/milestone: v9.9/' .planning/STATE.md
node scripts/run-validation-271.mjs | head -3
# ESPERADO: el banner dice "v9.9". Si sigue diciendo v2.0, está transcrito, no derivado.
git checkout -- .planning/STATE.md

# (b) mutar el CÓDIGO y comprobar que el test nuevo lo caza
#     (reintroducir un literal `v1.1` en una línea de console.log)
node --test tests/count-arrays-lockstep.test.js
# ESPERADO: rojo, nombrando la línea que transcribe

# (c) robustez fail-soft: el reporter no puede morir sin STATE.md
mv .planning/STATE.md /tmp/STATE.md.bak && node scripts/run-validation-271.mjs; echo "exit=$?"
# ESPERADO: imprime la tabla completa + "milestone desconocido"; exit 0 (los sub-gates pasan)
mv /tmp/STATE.md.bak .planning/STATE.md
```
`[ASSUMED: las tres partes de DEUDA-03 no se ejecutaron — el código a mutar todavía no existe. La parte (c) codifica la lección WR-09 (una lectura a nivel de módulo que puede lanzar mata el reporter antes de imprimir una sola fila).]`

---

## State of the Art

| Enfoque viejo | Enfoque actual | Cuándo cambió | Impacto |
|---|---|---|---|
| `node --test <dir>` para recorrer un directorio | Globs como argumentos posicionales, `glob(7)`, **entre comillas dobles** | Node 21/22 | La solución de esta fase existe sin dependencias; pero la de dos rutas es más robusta que `**` |
| `--recursive` | No existe (nunca llegó a Node 22 estable) | — | El fix de WR-06 hay que reemplazarlo |
| Conteos escritos a mano en los arrays | `expected` derivado del disco (D-31-06) | v1.7 Phase 31 | 9 de las 18 entradas de cada array siguen siendo literales — el suelo del gate |
| Gate por importación del módulo | Source-assert sobre el texto (D-44-07) | v2.0 Phase 44 | Impuesto por el `process.exit(1)` a nivel de módulo del reporter y por los `const` dentro de `describe` |

**Obsoleto / a retirar:**
- `44-REVIEW.md:527` («`node --test --recursive tests/`») — la opción no existe.
- `README.md:32` («Debe terminar con `pass 14` (o más)») — obsoleto por dos órdenes de magnitud.
- `scripts/run-validation-271.mjs:4-7, 43, 68, 453` — objeto del gate, cuatro milestones desfasado.

---

## Assumptions Log

| # | Claim | Section | Riesgo si es falso |
|---|---|---|---|
| A1 | El total de slots hoy es 250 y las categorías 18 — tomado de `v2.0-MILESTONE-AUDIT.md:73-76`, **no** de ejecutar el reporter en esta sesión | DEUDA-03 | Bajo. El banner los deriva de `CATEGORIES.length` / `TOTAL_EXPECTED` en runtime, así que la cifra correcta sale sola. Solo afecta a la prosa del plan |
| A2 | El esqueleto del test de DEUDA-03 (`no transcribe ningún milestone`) funciona tal cual | Code Examples | Medio. **No ejecutado.** El regex `/\bv\d+\.\d+\b/` podría dar falsos positivos sobre otras cadenas impresas. El ejecutor debe mutarlo antes de aceptarlo |
| A3 | La receta fail-soft de DEUDA-03 sale exit 0 sin `.planning/STATE.md` | Mutation Protocol | Medio. **No ejecutado** (el código no existe). Es un requisito de diseño derivado de WR-09, no una observación |
| A4 | Ningún consumidor externo depende de la clave `file:` de `CATEGORIES_WITH_EXPLANATIONS` más allá de `:1383` | DEUDA-02 Opción A | Bajo. Verificado que el array es un `const` local del fichero y no se exporta; la Opción A **añade** una clave, no quita ninguna |
| A5 | Derivar del frontmatter de `.planning/STATE.md` es aceptable para el autor (acopla `scripts/` a `.planning/`) | DEUDA-03 | Medio. Es un juicio de arquitectura sin CONTEXT.md que lo confirme. Alternativa si se rechaza: `.planning/REQUIREMENTS.md:1`. **Candidato a checkpoint humano** |
| A6 | Renombrar `run-validation-271.mjs` está fuera de alcance | DEUDA-03 | Bajo. El ROADMAP acota DEUDA-03 a «encabezado y pie» y no menciona el nombre; el inventario de 17 call-sites load-bearing respalda diferirlo |

---

## Open Questions

1. **¿DEUDA-01/02/03 se añaden a `REQUIREMENTS.md` en esta fase?**
   - Lo que sabemos: están en `ROADMAP.md:364`; **no** en `REQUIREMENTS.md`, cuyo Coverage sigue
     diciendo 23/23.
   - Lo que no está claro: si el autor quiere abrirlos como requisitos de v2.0 (que ya está
     auditado) o como el primer bloque de v2.1.
   - Recomendación: **añadirlos a v2.0** con nota de que nacen de la auditoría, y actualizar
     Coverage a 26/26. Es una edición barata y evita tres huérfanos permanentes.

2. **¿Se arreglan WR-07 y WR-12 aquí?**
   - Lo que sabemos: los dos siguen abiertos; el ROADMAP los llama «ligados» a DEUDA-02, no
     comprometidos. WR-07 es un fix de una palabra (`\s*` → `[^\S\n]*`) sobre el ancla que la
     Opción A pone a gobernar tres fuentes.
   - Recomendación: **WR-07 sí** (mismo ancla, mismo commit, coste nulo, y su golden es trivial:
     `slugsCiegos("{ slug:\n'x' }", ['x'])` debe devolver `['x']`). **WR-12 no** — es ortogonal y
     su fix cambia la semántica de un assert que hoy pasa.

3. **¿El banner debe imprimir también la fase, además del milestone?**
   - Lo que sabemos: el literal actual dice «Milestone v1.1 — gate **Phase 10**».
     `.planning/STATE.md` expone `current_phase: 44`, así que derivarlo es posible.
   - Lo que no está claro: si «gate Phase N» significa algo hoy — el reporter es el gate de CIERRE
     del milestone, no de una fase.
   - Recomendación: **quitar la fase del banner.** Derivar solo el milestone + las cifras
     (`CATEGORIES.length`, `TOTAL_EXPECTED`), como propone `44-REVIEW.md:630`.

---

## Security Domain

Fase interna sobre `tests/` y `scripts/`, sin superficie de red, sin entrada de usuario, sin
cambios en el motor ni en el contenido servido al navegador.

### Applicable ASVS Categories

| ASVS Category | Aplica | Control estándar |
|---|---|---|
| V2 Authentication | no | Sin auth (herramienta local mono-usuario) |
| V3 Session Management | no | Sin sesiones de servidor |
| V4 Access Control | no | Sin multi-usuario |
| V5 Input Validation | **sí, indirectamente** | El único «input» son los ficheros fuente del propio repo, parseados por `sinComentarios` + regex. Riesgo real: **ReDoS / falso rojo**, no inyección |
| V6 Cryptography | no | Sin cripto |
| V14 Configuration | **sí** | La derivación de DEUDA-03 abre una lectura de fichero nueva en el reporter |

### Known Threat Patterns

| Patrón | STRIDE | Mitigación estándar |
|---|---|---|
| Cuantificadores anidados en el ancla del extractor → ReDoS sobre un fichero de 1626 líneas | Denial of Service | Ya mitigado por diseño: `[^\S\n]*` y `[^\n]*` en vez de `\s*`/`.*` (T-44-03-03, comentado en `:209-210`). **Cualquier regex nueva debe seguir la misma regla** |
| Path traversal en la lectura nueva de `.planning/STATE.md` | Tampering | Ruta constante resuelta con `resolve(projectRoot, …)`; sin componente derivado de input |
| El reporter muere antes de imprimir por una lectura a nivel de módulo | Denial of Service (del gate) | **try/catch obligatorio** (lección WR-09: eso convierte una etiqueta cosmética en un blocker) |
| Un literal regex con comilla desalinea `sinComentarios` → falso rojo en el gate anti-ceguera | Tampering (integridad del gate) | La regex nueva no lleva comillas; y ninguna entrada de `CATEGORIES` comparte línea con ella |

**No hay `SECURITY.md` requerido:** cero threats nuevos con superficie externa.

---

## Sources

### Primary (HIGH confidence)

- **Ejecución directa en `/home/vcompanyb/italian-course` (2026-08-12)** — `node --version`;
  8 formas de invocación de `node --test`; matriz de 4 regímenes shell/comillas; conteos por
  fichero; 4 mutaciones aplicadas, medidas y revertidas; 2 prototipos de fix de DEUDA-02
  aplicados, medidos y revertidos. `git status` limpio al final.
- **Ficheros del repo leídos esta sesión:** `tests/count-arrays-lockstep.test.js` (824 líneas,
  íntegro), `tests/exercise-types.test.js:1300-1430`,
  `tests/fixtures/slot-variants-integration.test.js` (232 líneas, íntegro),
  `tests/fixtures/slot-variants.test.js:1-40`, `scripts/run-validation-271.mjs:1-77, 160-240,
  366-395, 440-542`, `content/categories.json` (parseado), `README.md:20-40, 92-115`, `.gitignore`.
- **Documentos de planificación:** `.planning/REQUIREMENTS.md` (íntegro),
  `.planning/v2.0-MILESTONE-AUDIT.md` (íntegro), `.planning/STATE.md:1-45`,
  `.planning/ROADMAP.md:1-40, 154, 359-371`, `.planning/MILESTONES.md:1-60`,
  `.planning/phases/44-…/44-REVIEW.md:495-744` (WR-06/07/08/09/10/11/12/13).

### Secondary (MEDIUM confidence)

- [Node.js v22 Test Runner docs](https://nodejs.org/docs/latest-v22.x/api/test.html) — patrones de
  descubrimiento por defecto, globs como argumentos posicionales, y la recomendación explícita de
  usar comillas dobles. **Cross-verificado ejecutando cada afirmación en v22.20.0.**
- Memoria del proyecto `test_command_node_glob.md` — la razón histórica de la forma canónica actual.
  **Confirmada hoy:** `node --test tests/` sigue fallando con `Cannot find module`.

### Tertiary (LOW confidence)

- Ninguna. Ninguna afirmación load-bearing de este documento descansa solo en búsqueda web o en
  conocimiento de entrenamiento.

---

## Metadata

**Confidence breakdown:**

| Área | Nivel | Razón |
|---|---|---|
| Formas de invocación (DEUDA-01) | **HIGH** | 8 formas ejecutadas + matriz de 4 shells + docs oficiales de Node concordantes |
| Inventario de call-sites | **HIGH** | grep de contenido fichero por fichero, no heredado de ningún documento |
| Extractor y opciones de DEUDA-02 | **HIGH** | Las 2 opciones prototipadas, ejecutadas, mutadas y revertidas |
| Sitios stale del reporter (DEUDA-03) | **HIGH** | grep de contenido hoy; los números del ROADMAP y del REVIEW estaban desfasados |
| Fuente de derivación del milestone | **MEDIUM** | La fuente está verificada en disco y es parseable; que sea la elección arquitectónica *deseada* es juicio sin CONTEXT.md (A5) |
| Esqueletos de código de DEUDA-03 | **LOW** | Hipótesis no ejecutadas (A2, A3) — el ejecutor debe verificarlas por mutación |

**Research date:** 2026-08-12
**Valid until:** 2026-09-11 (30 días; nada aquí depende de versiones que se muevan — solo del
estado del repo, que esta misma fase cambia)
**Estado del árbol al terminar:** limpio. `git status --short` = `M .planning/config.json`
(preexistente) + los directorios nuevos sin trackear de la fase y del caché de research. **Todas
las mutaciones revertidas.**
