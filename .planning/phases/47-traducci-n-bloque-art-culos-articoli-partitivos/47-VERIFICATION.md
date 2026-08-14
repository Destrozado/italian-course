---
phase: 47-traducci-n-bloque-art-culos-articoli-partitivos
verified: 2026-08-14T22:07:15Z
status: passed
score: 4/4 Success Criteria del ROADMAP verificados (1 con matiz documentado, no un gap)
behavior_unverified: 0
overrides_applied: 0
deferred:
  - truth: "Los backstops long-text WINDOWS id 21 y 22 (envoltura multilínea de la traducción en 2+ líneas) se cierran con evidencia de inspección"
    addressed_in: "Primera de las Phases 48-53 que produzca una traducción de ~88+ caracteres en la caja de 622px"
    evidence: "WINDOWS.md ids 21/22, re-medidos en esta fase (462px/65 chars/1 línea) y ABSTENIDOS a propósito por ausencia de sujeto; arrastre aceptado por el autor el 2026-08-14 en el checkpoint bloqueante del plan 47-04"
  - truth: "La lectura de muestra del autor sobre las 96 traducciones de Preposiciones (piloto Phase 46)"
    addressed_in: "No asignada a una fase concreta; es deuda de la Phase 46, WINDOWS id 23, ajena al corpus de esta fase"
    evidence: "WINDOWS.md id 23, sigue open; el 'aprobado' del 2026-08-14 cubre la lectura de muestra del bloque Artículos, no la de Preposiciones"
---

# Phase 47: Traducción — bloque Artículos (Articoli + Partitivos) Verification Report

**Phase Goal:** Que las dos categorías del bloque Artículos muestren la traducción de su frase al
resolverse, con las 110 traducciones autoradas y validadas por el quórum y enganchadas al gate de
cobertura.

**Verificado:** 2026-08-14T22:07:15Z
**Estado:** `passed`
**Re-verificación:** No — verificación inicial

## Método

Esta verificación **no se apoya en las cifras de los SUMMARY**: cada número se re-derivó del disco de
forma independiente (scripts, `node --test`, lectura directa de los JSON de contenido) y, para el
Success Criterion 3, se ejecutó una mutación propia (quitar la entrada `articoli` de
`TRANSLATION_COVERAGE` y correr el gate anti-ceguera) en lugar de aceptar el registro de
`47-MUTACIONES-EVIDENCIA.md` como prueba suficiente.

## Los 4 Success Criteria del ROADMAP, contra el disco

| # | Success Criterion | Estado | Evidencia (recomputada por este verificador) |
|---|---|---|---|
| 1 | Cobertura del bloque: 62 Articoli + 48 Partitivos = 110, frase RESUELTA (hueco relleno), pintado solo en estado resuelto | ✓ VERIFICADO | Recorrido propio de `content/exercises/articoli.json` y `partitivos.json`: 62/62 y 48/48 `multiple-choice` con `translationES.text` no vacío; **0** ocurrencias del patrón `___` dentro de un `text`; los 4 slots `match` (2+2) tienen **0** `translationES` (excluidos por schema/`mcVariantCountOf`, no por olvido). El pintado "solo en estado resuelto" no es verificable por grep sobre `src/app.js` sin tocar el render (fuera de alcance de esta fase, D-46-02 ya fijado en Phase 46); lo confirma el checkpoint de autor del plan 47-04 (ver más abajo) |
| 2 | Calidad validada: quórum cross-vendor con prompt de traducción, `disputed` resueltos con trabajo, acentos RAE tratados como bug real | ✓ VERIFICADO | Recorrido propio: **110/110** con `validation.status: validated` y ≥2 `by` con veredicto `correcta` de vendors distintos; **0** `disputed` residuales. Exactamente **2** overrides de autor en todo el corpus (`articoli-lo-z#1`, `partitivos-qualche#2`), ambos con motivo escrito completo en `passes[]` y trabajo adversarial previo documentado (leído directamente del JSON, no del SUMMARY). Mutación de acentos (evidencia en `47-MUTACIONES-EVIDENCIA.md`, mutación 2): texto desacentuado → los DOS vendors devuelven `incorrecta` con tag `[S4-acentos]` → `disputed` → reporter FAIL — cadena completa sin escáner mecánico, `git status --porcelain scripts/ tests/ docs/` vacío durante la mutación |
| 3 | El gate crece con el bloque: desengancharlas pone ROJO el gate anti-ceguera, verificado corriendo la mutación | ✓ VERIFICADO (mutación propia ejecutada) | Ejecuté yo mismo la mutación: quité la línea de `articoli` de `TRANSLATION_COVERAGE`, corrí `node --test tests/count-arrays-lockstep.test.js` → **4 `not ok`** nombrando explícitamente `articoli` como categoría con traducciones en disco no enganchada (`2 !== 3`), mientras `node scripts/run-validation-271.mjs` seguía en **exit 0** con un `PASS (144/144)` ciego — el "pass ciego" que el gate existe para delatar. Restauré el fichero por copia; `md5sum` idéntico al original (`37ae18c8…`); `git status --porcelain` limpio |
| 4 | Brownfield intacto: `src/domain/` sin tocar, `schemaVersion` 13, `gloss` ES sobrevive, suite verde con reporter exit 0 | ⚠️ PARCIALMENTE CUMPLIDO, documentado y sin regresión | `git diff --stat` de `ca8f797..HEAD` (todo el rango de la fase) sobre `src/domain/` y `src/screens/app.js` → **vacío**. `schemaVersion` = **13** (`src/data/backup.js:61`). `gloss` ES: 0/110 `prompt` del bloque llevan gloss entre paréntesis (ausencia de sujeto, no colisión) — verificado por recorrido propio. **El reporter SÍ sale en exit 0** con `TRAD-COV PASS (206/206)` (verificado). **La suite completa NO sale en exit 0**: `node --test tests/*.test.js tests/fixtures/*.test.js` → exit 1, **1343/1339 pass/4 fail**, y los 4 son el mismo único fichero `tests/requirements-traceability.test.js` (deuda pre-existente `WINDOWS` id 17, `D-45-12`, anterior a esta fase). Confirmado: **cero fallos nuevos** atribuibles a la Phase 47 |

## Verificación en disco realizada por este verificador (no transcrita de ningún SUMMARY)

```
$ node scripts/run-validation-271.mjs ; echo $?
  TRAD-COV (206/206 traducciones validated): PASS (206/206)
  Milestone gate PASS.
0

$ node --test tests/count-arrays-lockstep.test.js
# tests 64 / pass 64 / fail 0    → exit 0

$ node --test tests/*.test.js tests/fixtures/*.test.js
# tests 1343 / pass 1339 / fail 4  → exit 1
not ok 142 - trazabilidad de requisitos — la cobertura se DERIVA del disco (DEUDA, D-45-12)

$ git diff --stat ca8f797..HEAD -- src/domain/ src/screens/app.js
(vacío)
```

**Mutación propia (SC-3):** ver tabla arriba. Ejecutada, observada, restaurada y re-verificada por este
verificador de forma independiente de `47-MUTACIONES-EVIDENCIA.md`.

**Recuento propio del corpus del bloque:**

| Categoría | `multiple-choice` | Con `translationES.text` | `validated` con ≥2 `by` distintos | Huecos `___` | Overrides |
|---|---|---|---|---|---|
| `articoli` | 62 | 62 | 62 | 0 | 1 (`articoli-lo-z#1`) |
| `partitivos` | 48 | 48 | 48 | 0 | 1 (`partitivos-qualche#2`) |
| **Total bloque** | **110** | **110** | **110** | **0** | **2** |

Colisiones de frase resuelta idéntica entre las 110: **0** (recomputado, `Set` sobre los 110 textos =
110 elementos únicos).

## Artefactos requeridos

| Artefacto | Esperado | Estado | Detalle |
|---|---|---|---|
| `content/exercises/partitivos.json` | 48 `translationES` completos y `validated` | ✓ VERIFICADO | 48/48 confirmados por recorrido propio |
| `content/exercises/articoli.json` | 62 `translationES` completos y `validated` | ✓ VERIFICADO | 62/62 confirmados por recorrido propio |
| `scripts/run-validation-271.mjs` | Entradas `partitivos` y `articoli` en `TRANSLATION_COVERAGE` con `expected` derivado | ✓ VERIFICADO | Las tres entradas (`preposiciones`, `partitivos`, `articoli`) tienen `slug`/`file` en la misma línea y `expected: mcVariantCountOf(...)` — sin cifra literal, confirmado leyendo el array completo |
| `docs/TRANSLATION-VALIDATION-PROMPT.md` | Excepciones léxicas/estructurales escritas donde el evaluador las lee | ✓ VERIFICADO | Tres excepciones confirmadas por `grep`: forma metalingüística (§ post `->`), PARTITIVO, ADVERBIAL DE COMIDA — las tres presentes en el doc, no solo en SUMMARYs |
| `.planning/phases/46-.../46-CONTEXT.md` | D-46-12 enmendada con 4 notas fechadas | ✓ VERIFICADO | 4 notas confirmadas (`ENMIENDA DEL REGISTRO`, `SEGUNDA NOTA`, `TERCERA NOTA`, `CUARTA NOTA`), todas fechadas 2026-08-14 y con la decisión del autor citada |
| `47-MUTACIONES-EVIDENCIA.md` | Registro literal de las 3 mutaciones con exit codes y líneas | ✓ VERIFICADO | Existe, commiteado, con exit codes, mensajes literales y fotos fechadas de las 4 corridas (1, 2, 3a, 3b) |

## Key Links

| From | To | Via | Estado |
|---|---|---|---|
| `content/exercises/articoli.json` / `partitivos.json` | `scripts/run-validation-271.mjs` | `TRANSLATION_COVERAGE` cuenta variantes `multiple-choice` frente a `translationES` validated | ✓ WIRED (confirmado por reporter y por mutación propia) |
| `content/exercises/*.json` | `tests/count-arrays-lockstep.test.js` | `categoriasDeclaradasCubiertas()` deriva del disco qué categorías exigen enganche | ✓ WIRED (confirmado por mutación propia: desenganchar produce 4 `not ok` nombrando la categoría) |

## Requisitos

| Requisito | Plan fuente | Descripción | Estado | Evidencia |
|---|---|---|---|---|
| TRAD-02 | 47-01/02/03/04 | Bloque Artículos traducido y validado al 100%: Articoli (62) + Partitivos (48) = 110 | ✓ SATISFECHO | REQUIREMENTS.md lo marca `[x] Complete` en Phase 47; disco lo respalda (110/110 `validated`, reporter `PASS (206/206)`, gate anti-ceguera verde) |

No hay requisitos huérfanos: `REQUIREMENTS.md` mapea solo TRAD-02 a la Phase 47.

## Anti-patrones

Ningún `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/placeholder encontrado en los ficheros de contenido o de script
modificados por la fase. Cero `return null`/stub en el pipeline de traducción (no se tocó `src/`).

## Backstops heredados y su estado (no se reetiquetan como pasados)

- **WINDOWS id 21 y 22** (long-text, envoltura multilínea): **siguen `open`, ABSTENIDOS a propósito**.
  La traducción más larga del bloque (`partitivos-dello-scons#0`, 65 caracteres, 462px) sigue cabiendo
  en una línea en las dos superficies — la premisa "2+ líneas" sigue sin sujeto. El autor aceptó el
  **arrastre** el 2026-08-14 dentro del checkpoint bloqueante del plan 47-04, no la envoltura en sí.
  Correctamente no reportado como pasado ni como gap de esta fase: sin contenido que produzca 2+
  líneas, no hay nada que verificar.
- **WINDOWS id 23** (lectura de muestra del piloto de Preposiciones): sigue `open`, es deuda de la
  Phase 46 y ajena al corpus de esta fase. La lectura de muestra **del bloque Artículos** sí se hizo
  (checkpoint del plan 47-04, "aprobado", incluidas las 5 variantes metalingüísticas).
- **WINDOWS id 40** (VAL-08 no cubre `disputed` de nivel traducción): hallazgo de diseño de gate,
  declarado y no arreglado a propósito (arreglarlo exigiría su propia mutación, fuera del mandato de
  este plan). No afecta la corrección de TRAD-COV, que sí captura los `disputed` de traducción
  necesariamente. Queda como nota para las Phases 48-53, no como gap de la 47.
- **WINDOWS id 35** (override `partitivos-qualche#2` que NO cumple la barra estructural del plan
  47-02): sigue `open` a propósito para que el autor lo revise a sabiendas. Verificado que el override
  existe, tiene motivo escrito y no está disimulado — el ledger lo declara explícitamente como el que
  no cumple la barra, a diferencia del de `articoli-lo-z#1` que sí la cumple.

## Verificación del autor (checkpoint ya resuelto dentro de la fase)

El plan 47-04, Task 3 (`checkpoint:human-verify`, `gate="blocking"`), fue resuelto por el autor el
2026-08-14 con la respuesta literal `"aprobado"`, cubriendo: render en las dos superficies (caja de
feedback y "Errores cometidos"), el caso "sin traducción" sin hueco/placeholder, la lectura de muestra
de 3-4 slots incluidas las 5 variantes metalingüísticas, y la aceptación explícita del arrastre de los
backstops 21/22. Esta verificación humana ya ocurrió dentro del propio flujo de la fase y no se reabre
aquí; no genera un nuevo ítem de verificación humana pendiente para este informe.

## Gaps Summary

**No hay gaps que bloqueen el cierre de la fase.** El único matiz —SC-4, "suite verde con reporter en
exit 0"— está parcialmente cumplido: el **reporter** sí sale en exit 0 (`TRAD-COV PASS (206/206)`), pero
la **suite completa** no, por 4 fallos pre-existentes de `tests/requirements-traceability.test.js`
(`WINDOWS` id 17, deuda `D-45-12` de una fase anterior). Verificado independientemente que son
exactamente los mismos 4 fallos que existían antes de esta fase (cero regresiones nuevas atribuibles a
la Phase 47). Los dos backstops long-text (ids 21/22) siguen abiertos por ausencia de sujeto y viajan
documentados a las Phases 48-53, tal como el propio plan de cierre preveía como una de sus dos salidas
legítimas.

---

*Verificado: 2026-08-14T22:07:15Z*
*Verifier: Claude (gsd-verifier)*
