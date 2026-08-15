---
phase: 48-traducci-n-paradigma-fare-4-categor-as
plan: "01"
subsystem: contenido/traducción
tags: [traduccion, quorum-cross-vendor, tracer, cobertura, ancla, TRAD-03]
status: complete
requires:
  - "content/exercises/fare-indicativo.json (25 slots ya validated a nivel de SLOT)"
  - "scripts/validate-translation-pass.mjs + docs/TRANSLATION-VALIDATION-PROMPT.md (Phase 46)"
  - "content/translation-coverage.lock.json + scripts/bump-translation-lock.mjs (CR-02 de Phase 47)"
provides:
  - "fare-indicativo enganchada a TRANSLATION_COVERAGE con expected DERIVADO"
  - "ancla de TRAD-COV re-emitida con 4 categorías"
  - "5 de 122 traducciones del bloque fare, validated por quórum cross-vendor real"
  - "jueces declarados para el bloque fare: deepseek-reasoner + gemini-3.5-flash-lite"
affects:
  - "planes 48-02 (49 variantes restantes de fare-indicativo), 48-03, 48-04"
tech-stack:
  added: []
  patterns: ["quórum cross-vendor 1-por-1 (VAL-03)", "ancla-ratchet re-emitida por gesto explícito"]
key-files:
  created: []
  modified:
    - content/exercises/fare-indicativo.json
    - scripts/run-validation-271.mjs
    - content/translation-coverage.lock.json
    - tests/content-fare-indicativo.test.js
decisions:
  - "D-48-01: jueces del bloque `fare` fijados en deepseek-reasoner (lado DeepSeek) y gemini-3.5-flash-lite (lado Gemini), para las cuatro categorías y sin cambiarlos a mitad de bloque"
  - "D-48-02: registro canónico del bloque — `i compiti` se traduce «los deberes» (decisión del autor en el gate del tracer)"
  - "D-48-03: el pronombre de sujeto español se OMITE aunque el italiano lo lleve explícito; la morfología verbal basta (decisión del autor en el gate del tracer)"
  - "D-48-04: el key set de variante de los tests de contenido `fare` admite `translationES` como hermano OPCIONAL, descontando ESA clave y ninguna otra"
metrics:
  duration: "~50 min"
  completed: "2026-08-15"
actuals:
  tokens: 2028
  tasks: 3
  commits: 2
---

# Phase 48 Plan 01: El tracer del paradigma `fare` Summary

El camino entero de la fase queda demostrado sobre contenido real: la casilla del trapassato
remoto —donde el objetivo del milestone y la naturalidad del español tiran en direcciones
opuestas— atraviesa las seis capas y sale `validated` por dos vendors, con `fare-indicativo`
enganchada al array de cobertura y el ancla re-emitida.

## Lo que se construyó

| Capa | Estado |
|---|---|
| 1. Traducción autorada | 5 variantes de `fare-indicativo` con `translationES` |
| 2. Quórum cross-vendor real | 10 pases (5 × 2 vendors), los 10 `correcta` |
| 3. Status derivado | las 5 `validated`, con 2 `by` distintos de dos vendors |
| 4. Enganche al array | entrada `fare-indicativo` con `expected` derivado por `mcVariantCountOf` |
| 5. Ancla re-emitida | `translation-coverage.lock.json` con 4 claves, suelos previos intactos |
| 6. Gate anti-ceguera | VERDE, 4 pares ↔ 4 categorías declaradas cubiertas |

**Ninguna capa quedó simulada.** Las llamadas a DeepSeek y Gemini son reales.

## Los 10 veredictos, literales

Jueces declarados para todo el bloque `fare`: **`deepseek-reasoner`** + **`gemini-3.5-flash-lite`**.
Ambos pinneados, ambos respondieron: **cero auto-fallbacks**, así que el `by` escrito coincide con
el modelo pinneado en los 10 pases. Ninguno editado a mano.

| Variante | Traducción | `deepseek-reasoner` | `gemini-3.5-flash-lite` | Status derivado |
|---|---|---|---|---|
| `trapassato-remoto#0` | «Después de que hube hecho los deberes, salí de casa.» | `correcta`, `concerns: []` | `correcta`, `concerns: []` | `validated` |
| `passato-remoto#0` | «En 1990 cometí un error.» | `correcta`, `concerns: []` | `correcta`, `concerns: []` | `validated` |
| `passato-prossimo#3` | «Hoy hemos hecho un pastel y lo comemos en la cena.» | `correcta`, `concerns: []` | `correcta`, `concerns: []` | `validated` |
| `300#0` | «Esta mañana he hecho los deberes antes de salir.» | `correcta`, `concerns: []` | `correcta`, `concerns: []` | `validated` |
| `301#0` | «Haces los deberes solo, pero repasamos todo juntos.» | `correcta`, `concerns: []` | `correcta`, `concerns: []` | `validated` |

`deriveStatus` ejecutado sobre los `passes[]` leídos del disco, no afirmado.

### Clasificación de los concerns en las tres lecturas

**Vacía, y esa es la evidencia.** Los 10 pases llegaron con `concerns: []`. No hay ningún
«candidato a hueco de criterios», ningún «límite del evaluador» y ningún «defecto real de la
traducción» que clasificar. La clasificación no se omite: **no tiene sujeto**.

## La predicción del plan NO se cumplió — y eso es el hallazgo

El plan declaró: «es probable que el quórum marque `[S6-naturalidad]` sobre el pretérito
anterior». **No ocurrió.** Los dos vendors aprobaron «hube hecho» sin una sola objeción, y
`deepseek-reasoner` razonó explícitamente que corresponde al trapassato remoto.

Sobre la casilla más dura del bloque, **S2 tal como está escrita ya basta**: la regla que hacía
falta («cambia el tiempo verbal» ⇒ `false`) ya estaba en el doc, y ningún juez la aplicó al revés.
Eso es exactamente lo que el plan quería medir en la variante 5 y no en la 122.

Los dos vendors nombraron además, sin que se les preguntara, las dos reglas que más riesgo tenían:
- `300#0`: «El gloss no debe reproducirse» — la viñeta del gloss de frase completa se aplica bien.
- `301#0`: «la omisión de pronombres sujeto evita el calco» — D-48-03 confirmada por el evaluador.

## Task 3 (checkpoint:decision): **NO APLICABLE por ausencia de sujeto**

Los criterios de aceptación del propio Task 3 lo prevén: «Si el Task 2 no produjo ningún candidato
a hueco de criterios… se registra como no aplicable… y el plan continúa sin preguntar nada al
autor.» Con 10/10 `correcta` y 10/10 `concerns: []` **no hay excepción candidata que evaluar**, así
que no hay nada que decidir entre las opciones a/b/c/d.

**Consecuencia directa: D-46-12 NO se dispara.** `docs/TRANSLATION-VALIDATION-PROMPT.md` queda con
**cero líneas de diff** (verificado con `git diff --stat`), así que las 206 traducciones de las
Phases 46-47 siguen certificadas bajo el prompt vigente y no hay re-validación que presupuestar.
El dato que habría acotado el coste, derivado del disco por si el plan 48-02 lo necesita:
`preposiciones` 96, `articoli` 62, `partitivos` 48 = **206** ya `validated` bajo este mismo prompt.

## Desviaciones del plan

### 1. [Rule 3 — Bloqueante] El plan no tenía SEIS capas, sino SIETE

**Encontrado durante:** Task 1, al correr la suite tras escribir la primera traducción.

**Problema:** cada una de las cuatro categorías `fare` tiene un test de contenido propio que
congela el key set de variante en exactamente `['correctIndex','options','prompt']`.
`preposiciones`, `articoli` y `partitivos` **no tienen ese fichero**, así que las Phases 46 y 47
nunca chocaron con esta capa. El plan la declara inexistente por escrito («Cero símbolos nuevos en
`src/`», y ninguna entrada de test en la tabla de artefactos). Escribir el primer `translationES`
puso `tests/content-fare-indicativo.test.js:302` en rojo de inmediato.

**Arreglo:** descontar `translationES` del conjunto comparado, **y esa clave sola**. Cualquier otra
clave intrusa sobrevive al filtro y sigue enrojeciendo el `deepEqual`.

**Verificado por MUTACIÓN, no por que pasara a verde** (memoria del proyecto: «el fix del revisor
también se muta»):

| Mutación | Esperado | Obtenido |
|---|---|---|
| clave intrusa `hint` en una variante | ROJO | ROJO (`key set de fare-indicativo-presente#0`) |
| `prompt` renombrado a `promt` (obligatoria ausente) | ROJO | ROJO (7 fallos) |
| restaurado | VERDE + disco byte-idéntico | VERDE, `diff -q` IDÉNTICO |

**Fichero:** `tests/content-fare-indicativo.test.js` · **Commit:** `5aa0302`

**Lo que esto significa para los planes siguientes —— la misma pared espera en tres ficheros más:**

| Fichero | Línea | Plan que la va a encontrar |
|---|---|---|
| `tests/content-fare-congiuntivo.test.js` | 448 | **48-03** |
| `tests/content-fare-indefiniti.test.js` | 660 | **48-04** |
| `tests/content-fare-cond-imperativo.test.js` | 609 | **48-04** |

**Deliberadamente NO pre-arreglados** (ratificado por el autor en el gate): ensanchar un gate antes
de que exista el contenido que lo justifica lo deja vacuo. Cada plan lo abre cuando le toca, y lo
muta como se mutó éste.

## Gate del tracer — las tres decisiones del autor

El gate se disparó tras el commit del tracer (modo interactivo). El autor respondió `continuar` y
fijó tres criterios **para el bloque entero**, no solo para la casilla:

1. El slice del tracer queda aprobado tal cual; el arreglo Rule 3 aceptado con su mutación como
   evidencia.
2. **`i compiti` → «los deberes»** (D-48-02). Propagado ya a `300#0` y `301#0`.
3. **El pronombre de sujeto se omite** (D-48-03), aunque el eje de variante del slot sea la persona.

## Verificación

| # | Criterio | Resultado |
|---|---|---|
| 1 | Gate anti-ceguera VERDE | `exit 0`; **4** pares extraídos ↔ **4** categorías declaradas cubiertas; 0 pares cruzados |
| 2 | Ancla re-emitida por el gesto explícito | 4 claves; `articoli` 62, `partitivos` 48, `preposiciones` 96 **idénticos a `HEAD`**; diff = clave nueva + fecha, nada más |
| 3 | Rojo en TRAD-COV y **no** en VAL-08 | `exit 1` — ver transcripción abajo |
| 4 | 5 variantes con status derivado del disco | las 5 `validated`, 2 `by` distintos, 2 vendors |
| 5 | 10 veredictos literales y clasificados | transcritos arriba; clasificación vacía por ausencia de sujeto |
| 6 | Decisión sobre el doc registrada | NO APLICABLE, con los veredictos que lo demuestran |
| 7 | Brownfield | `git diff --stat src/domain/ src/screens/app.js` **vacío**; `schemaVersion` = **13** |
| 8 | Suite sin regresiones | **1360** tests, 1356 pass, **4** fail — los mismos 4 de la línea base |

### Las cinco líneas del reporter, literales

```
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (260/260 traducciones validated): FAIL (211/260 — pending=0, missing=49, disputed=0)

fare-indicativo          | 54       | 5          | 0         | 0        | 49
```

**Que VAL-08 siga en PASS es el comportamiento correcto** (`WINDOWS` id 40): VAL-08 reduce sobre el
bucle de SLOTS y es ciego a los `disputed` de traducción por diseño. El rojo se pidió en TRAD-COV,
que es su sitio, y ahí salió. **Cero violaciones de ancla** en la corrida.

### Los 4 fallos pre-existentes (línea base, NO causados por esta fase)

Todos de `tests/requirements-traceability.test.js` (`WINDOWS` id 17, `D-45-12`):
`la forma del documento sigue donde este gate la busca` · `la cifra escrita en la linea de Coverage
cuadra con el conteo real de filas` · `cero DUPLICADOS en las dos mitades (WR-01)` · `cero
huerfanos en las DOS direcciones`.

La suite **no sale en exit 0 hoy y eso no lo causa esta fase**. El criterio aplicado es «los mismos
4 fallos, cero regresiones nuevas», no «exit 0» — pedir exit 0 obligaría a tocar un gate de
trazabilidad desde un plan de traducción, que es el modo de fallo del CR-01 de la Phase 44.

## Cifras recomputadas del disco (gana el disco)

Todas las cifras del plan se recomputaron al ejecutar y **todas cuadran**:

| Hecho | Plan | Medido | ¿Cuadra? |
|---|---|---|---|
| Variantes `mc` de `fare-indicativo` | 54 | **54** | sí |
| Total del bloque `fare` | 122 | **54+30+21+17 = 122** | sí |
| Slots `match` / `word-buttons` en el bloque | 0 | **0** (25 slots, los 25 `mc`) | sí |
| Colisiones de frase italiana resuelta | 0 sobre 122 | **0 sobre 122** | sí |
| Traducciones en el bloque | 0 → | **5** de 122 | — |
| Ancla previa | 62 / 48 / 96 | **62 / 48 / 96** | sí |

## Sondas de bordes

- **`empty`**: los cuatro casos con sujeto quedan cubiertos por `tests/schema-translation.test.js`
  (95 pass, 0 fail). El quinto —rechazo en `match`/`word-buttons`— **se abstiene por ausencia de
  sujeto**, recomputado: 0 slots de esos tipos en las cuatro categorías. Criterio del schema
  vigente y sin tocar.
- **`ordering`**: comprobado permutando de verdad, no afirmado. `deriveStatus` sobre los `passes[]`
  invertidos devuelve `validated` igual que sobre el original. La permutación del array de
  cobertura la cubre el subtest `ORDERING: permutar las entradas del array no cambia el conjunto
  de ciegas ni de cruzadas`, en verde.
- **`adjacency`**: mitad mecánica confirmada (cada variante lleva su propio campo, cero
  deduplicación). La mitad de contenido —colisiones ESPAÑOLAS— se cuenta en 48-05, como el plan
  asigna.

## Amenazas

- **T-48-01** (prompt injection): §6 del doc declara `translationES.text` y «cualquier otro campo
  del payload» como DATA, así que el vector del español entre paréntesis del gloss está cubierto.
  `300#0` lo ejerció con un gloss de frase completa y ningún vendor lo obedeció como directiva.
- **T-48-02** (fuga de claves): claves leídas del `.env` y comprobadas por presencia/longitud, sin
  imprimir valor; viajan en cabecera. Ninguna clave en el JSON ni en este SUMMARY.
- **T-48-03** (corrupción read-modify-write): el `validation` a nivel de SLOT de los 10 slots quedó
  **idéntico a `HEAD`**, comparado como dos fotos distintas (disco vs versión committeada), 0
  diferencias. `notes` idéntico.
- **T-48-05** (audit trail que miente): cero `by` editados a mano, cero auto-fallbacks, cero
  overrides nuevos (siguen **2** en el corpus, los mismos que en `HEAD`).
- **T-48-06** (invertir el ratchet): `bump-translation-lock.mjs` corrido primero SIN flag; el único
  cambio propuesto fue `fare-indicativo: — → 54 [ALTA]`. Ningún suelo bajó.

## Known Stubs

Ninguno. Las 5 traducciones son contenido definitivo y validado; las 49 restantes de
`fare-indicativo` son el alcance declarado del plan 48-02, no un stub de éste.

## Notas para el plan 48-02

1. **Los tres tests de contenido de los otros bloques** (tabla arriba) van a enrojecer en 48-03 y
   48-04. Está previsto y documentado; el arreglo y su mutación son los de aquí.
2. **No hace falta enmendar el doc de criterios** por lo visto hasta ahora, y por tanto **no hay
   re-validación de las 206** que presupuestar.
3. Los jueces están fijados (D-48-01) y no se cambian a mitad de bloque.
4. Registro fijado: «los deberes» y pronombre de sujeto omitido.
5. Sigue abierto y sin evidencia todavía: `faccia` / `facciamo` / `facciano` entre congiuntivo e
   imperativo, las tres formas donde el español TAMPOCO desambigua. Se deciden en 48-03 y 48-04.

## Self-Check: PASSED

- `content/exercises/fare-indicativo.json` — FOUND (5 `translationES`, las 5 `validated`)
- `scripts/run-validation-271.mjs` — FOUND (entrada `fare-indicativo`, `expected` derivado)
- `content/translation-coverage.lock.json` — FOUND (4 claves)
- `tests/content-fare-indicativo.test.js` — FOUND (key set ensanchado y mutado)
- Commit `5aa0302` — FOUND
- Commit `e4055e6` — FOUND
