---
quick_id: 260727-dcy
status: complete
date: 2026-07-27
commits: 10
---

# Quick Task 260727-dcy — SUMMARY

## Resultado

Las **14 canciones** del corpus tienen ya `decoyBank` en **todas** sus frases
(639/639): el modo "decoradores agrupados" está disponible en todo el bloque
Canciones, no solo en las 4 que lo tenían.

| Métrica | Valor |
|---|---|
| Canciones convertidas | 10 (las que faltaban) |
| Frases con `decoyBank` nuevo | 441 (311 únicas + 130 duplicados por propagación) |
| `decoyBank.validation` = validated | 632 / 639 del corpus (434 / 441 de las nuevas) |
| `disputed` | 7 (1 frase única × 7 apariciones — ver abajo) |
| Traducciones (`phrase.validation`) tocadas | 0 — las 639 siguen `validated` |
| Tests | `node --test tests/*.test.js` → **665 pass / 0 fail** |

## Cómo se hizo

1. **Dedup** por `prompt|answer` → 311 representantes únicos de 441 frases.
2. **Autoría** de `decoyBank` por representante: mapa POS completo de
   `answer ∪ distractors` + 3-4 decoys plausibles-pero-incorrectos.
3. **Pre-flight local** (D1 cobertura, D3 decoy∉answer, D5 formato/duplicados)
   antes de gastar llamadas de quórum — evitó errores mecánicos.
4. **Quórum cross-vendor D1-D5**, un loop SECUENCIAL por canción y canciones en
   paralelo (un escritor por fichero): `deepseek-chat` + `gemini-2.5-flash`, con
   `deepseek-reasoner` como 2º `by` cuando Gemini rate-limitaba (429 frecuente).
5. **Resolución de 40 disputes** (Paso 6, calidad > tokens, sin override-atajo):
   arreglo del decoy/POS señalado + re-paso del `by` que objetó (`writePass`
   reemplaza el pase del mismo `by`, así el `incorrecta` desaparece).
6. **Propagación** del `decoyBank` validado a los duplicados del estribillo.
7. Commit atómico por canción.

## Convenciones POS fijadas (extraídas del corpus ya validado)

`que` relativo → `pronombre`, completivo → `conjuncion`; `al`/`del` →
`preposicion`; `nada`/`nadie`/`todo` → `pronombre`; `mi`/`tu` → `determinante`
y `tú`/`mí` → `pronombre`; `como`/`mientras` → `conjuncion`; `hay` → `verbo`.

## Qué aprendió el quórum sobre la autoría (patrones de los 40 disputes)

- **Adverbios de relleno como decoy son ruido D4.** `nunca`/`siempre` en frases
  sin negación ni eje temporal se rechazan sistemáticamente. Un buen decoy es el
  **opuesto** o el **cuasi-homógrafo** de una palabra de `answer`
  (`acerco`/`alejo`, `enciendo`/`apago`, `cuelga`/`colgada`).
- **`bien` no es sustantivo** en "hacer daño/bien" → `adverbio`. Error real mío.
- **4 bugs D3 reales** (decoy que era alternativa válida): `gente` por `personas`,
  `quieres` por `quieras`, `mi` por `el`, `barco` por `barca`. Los sinónimos y las
  variantes de conjugación aceptables son la trampa más fácil de colar.
- **El quórum se contradice en lo sutil**: el mismo modelo pidió `pronombre` para
  `la` y luego `articulo`; llamó ruido a `nada` y luego lo propuso como arreglo.
  Ante objeción no estable → re-pasar (a temp distinta); ante objeción estable →
  juicio humano.

## Pendiente de decisión del autor (1 frase)

**`22-settembre-009`** — "Io la vita la prendo com'è" → `["yo","la","vida","la","tomo","como","es"]`
(propagada a 7 apariciones, todas `disputed`).

`la` aparece dos veces con función distinta (artículo en "la vida", pronombre de
objeto en "la tomo"), pero `decoyBank.pos` está indexado por **texto** de palabra
y solo admite una etiqueta. `deepseek-reasoner` lo marca `incorrecta` de forma
**estable** (3 re-pases, temp 0.2 / 0.6 / 1.0) y en su último concern admite que
el arreglo es cambiar el esquema, no el contenido — lo que **contradice la propia
regla D1** ("los duplicados textuales solo requieren UNA entrada en `pos`").

No se ha forzado a `validated` (`deriveStatus` es sticky y un override sería
atajo). Opciones para el autor:

| Opción | Coste | Efecto |
|---|---|---|
| **A. Aceptar el disputed** | 0 | La frase es jugable igual (el modo agrupado no lee `validation`); queda 632/639 validated |
| **B. `pos` acepta array de categorías** | Cambio de esquema + `word-groups.js` + tests + re-validar | Resuelve la clase entera de casos, no solo este |
| **C. Reformular la traducción** a "yo tomo la vida como es" | Cambia una traducción ya `validated` → re-validar S1-S6 | Elimina el `la` duplicado; español igual de natural |

**Decisión del autor (2026-07-27): opción A.** Se acepta el `disputed`; la frase
queda jugable y el corpus en 632/639 `validated`. La opción B queda anotada como
**DECOY-X1** en `.planning/ROADMAP.md` §Backlog + plan de ataque detallado en
`.planning/todos/pending/decoybank-pos-multi-categoria.md`, para reactivar si el
patrón reaparece en una canción nueva.

## Ficheros

`content/songs/{equilibrio-mentale,ti-dedico-il-silenzio,cuore-di-plastica,solo,
22-settembre,bella-davvero,sul-finale,la-stella-piu-fragile,buongiorno-vita,
sogni-appesi}.json` — 10 commits atómicos (`d51619c`..`6d7842d`).
