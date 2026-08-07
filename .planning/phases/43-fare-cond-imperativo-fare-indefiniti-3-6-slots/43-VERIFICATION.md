---
phase: 43-fare-cond-imperativo-fare-indefiniti-3-6-slots
verified: 2026-08-07T12:00:00Z
status: human_needed
score: 3/5 ROADMAP success criteria fully verified now; 2/5 structurally owed (quorum pass), not defects
behavior_unverified: 0
overrides_applied: 0
re_verification: null
human_verification:
  - test: "Pase TOP-LEVEL de quorum base Opus+Sonnet (gsd-validate-exercise, 1 ejercicio por contexto, VAL-03) sobre los 9 slots de fare-cond-imperativo y fare-indefiniti, hoy en validation.status: pending / passes: []."
    expected: "Los 9 slots pasan a validated (≥2 passes correcta, by distintos, cero incorrecta; status === deriveStatus(passes))."
    why_human: "gsd-executor no puede spawnear los Task subagents de gsd-validate-exercise (executor_cannot_run_task_quorum); es una pasada top-level declarada como entregable pendiente por ambos plans, no algo que un grep pueda producir."
  - test: "Ronda EXTRA DeepSeek (D-43-20) sobre las 12 de 35 variantes marcadas: fare-cond-imperativo-imperativo (5), fare-indefiniti-participio-passato (4), fare-indefiniti-infinito-passato (3)."
    expected: "Los 3 slots acaban con al menos un pase cuyo by empieza por deepseek-, además del quorum base."
    why_human: "Vía scripts/validate-ai-pass.mjs con claves en .env; EXTRA_ROUND_SLOTS ya está declarado y en verde en ambos test files, pero el pase real no ha corrido (0 passes en los 9 slots)."
  - test: "Backstop declarado en 43-01: unicidad de lectura de las variantes plurales del imperativo (Loro / noi due) — que el vocativo de cortesía Loro y el sujeto inclusivo noi due excluyan de forma cerrada la lectura de voi (fate)."
    expected: "Ningún lector razonable admite una segunda respuesta defendible en esas 2 variantes."
    why_human: "Marcado explícitamente verification: backstop en el plan — juicio lingüístico que ninguna aserción mecánica cierra; ya fue aprobado en el checkpoint del tracer, pero la red real es el quorum top-level todavía no corrido."
  - test: "Backstop declarado en 43-02: unicidad de lectura de la variante causal del gerundio passato (fare-indefiniti-gerundio-passato #1, aver fatto), la única variante del fichero donde el gerundio simple queda fuera de las options y solo el adverbial de anterioridad lo excluye."
    expected: "Ningún lector razonable admite el gerundio simple como alternativa válida en ese contexto causal."
    why_human: "Mismo motivo: verification: backstop declarado por el plan, pendiente del pase top-level de quorum."
  - test: "WR-01 del code review (abierto, sin fix): en fare-indefiniti-participio-passato, las 2 variantes invariables (#0 Ieri io ho ___ i compiti…, #1 Maria ha ___ una torta…) ofrecen la forma CONCORDADA (fatti / fatta) como distractora incorrecta contra un objeto POSPUESTO. La concordancia con objeto pospuesto es italiano literario/antiguo atestiguado, no agramatical, y no lleva ningún audit trail en notes ni en la explanation ni en el prompt de validación — a diferencia del tratamiento completo que sí recibió avere fatto (magnet 4)."
    expected: "Un lector con criterio filológico decide si esa concordancia es hoy 'defendible como correcta' en el registro de esas frases (el criterio operativo propio de la categoría) o si el riesgo es aceptable sin más tratamiento."
    why_human: "Es exactamente el tipo de juicio que el proyecto reserva al quorum (C2, una_opcion) y a la adjudicación humana en disputed; no está resuelto ni documentado, y el código de review original lo calificó warning (no critical) precisamente porque es menos claro que CR-01, que sí se corrigió."
  - test: "WR-10 del code review (abierto, sin fix): los dos vocativos SINGULARES del imperativo (Marco, ___ una foto al gruppo! con key fa' vs faccia; Signor Rossi, ___ il lavoro con calma. con key faccia vs fate) no llevan el refuerzo de registro que sí se dio a los dos plurales (pronombre Loro, sujeto noi due)."
    expected: "Un lector decide si el vocativo por sí solo (nombre propio informal / título de cortesía) basta para excluir la lectura alternativa de registro, o si estas 2 variantes necesitan el mismo tipo de refuerzo que ya se dio a las 2 plurales."
    why_human: "Juicio de registro sociolingüístico (uso profesional del Lei con nombre de pila; voi di cortesia regional/histórico hacia un solo destinatario) que ningún gate mecánico puede cerrar; el gate existente solo verifica presencia de un marcador del conjunto cerrado, no que ese marcador desambigüe el registro."
---

# Phase 43: `fare-cond-imperativo` + `fare-indefiniti` — 3 + 6 slots Verification Report

**Phase Goal:** Cierra el paradigma con las dos categorías de cola: condizionale (presente + passato) e
imperativo (5 variantes, sin `io`), y las 6 formas indefinidas, donde el eje de variante deja de ser la
persona y pasa a ser el CONTEXTO (~3 frases por slot). Van juntas porque su volumen sumado de quórum
(≈35 variantes) es del orden de `fare-congiuntivo` sola. Siguen siendo DOS categorías: dos unidades de
reset, no una fusión.

**Verified:** 2026-08-07
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths — the 5 ROADMAP Success Criteria (literal)

| # | Success Criterion (verbatim intent) | Status | Evidence |
|---|---|---|---|
| SC-1 | Condizionale presente en 6 personas con raíz contracta `far-`; condizionale passato (`avrei fatto`) incluido futuro-en-el-pasado (`ha detto che avrebbe fatto`), explanation señalando la divergencia con el español; ≥1 variante que fuerce `farà` vs `farebbe` | ✓ VERIFIED | `fare-cond-imperativo-cond-presente`: 6 variantes, keys `farei/faresti/farebbe/faremmo/fareste/farebbero` sobre `far-`, futuro semplice como distractora en las 6, variante #2 fuerza literalmente `farà` (distractor) vs `farebbe` (key). `fare-cond-imperativo-cond-passato`: 6 variantes `avrei fatto`.. `avrebbero fatto`; explanation desarrolla el par `ha detto que avrebbe fatto` / «dijo que haría». **CR-01 verificado cerrado**: las 4 variantes que el code review encontró con doble lectura (trapassato defendible) están reescritas con adverbiales de posterioridad (`il giorno dopo`, `la settimana successiva`, `più tardi`, `il giorno seguente`) y el nuevo gate `GATE HARD (CR-01)` (`tests/content-fare-cond-imperativo.test.js:826`) está en verde. 4 de 6 variantes llevan marco futuro-nel-passato (mínimo exigido: 2). |
| SC-2 | Imperativo con EXACTAMENTE 5 variantes (`fa'·faccia·facciamo·fate·facciano`), ausencia de `io` documentada, MAGNET resuelto con audit trail, ninguna de `fa'`/`fai`/`fa` como distractora "incorrecta" | ✓ VERIFIED | Confirmado en disco: 5 variantes, keys exactas en orden tu/Lei/noi/voi/Loro. `fa'` es literalmente U+0027 (verificado por codepoint). `fai` y `fa` ausentes por igualdad exacta en las 17 `options` del fichero completo (las 3 categorías comparten fichero); `fa'` aparece exactamente 1 vez y ahí es la key. `notes`, `explanation` y el gate `variants.length === 5` (D-43-08, primero en el bloque 1) documentan la ausencia de `io` como estructural. **Residual (no bloqueante):** WR-10 — los dos vocativos singulares no llevan el mismo refuerzo de registro que los dos plurales; ver Human Verification. |
| SC-3 | Las 6 formas indefinidas con eje CONTEXTO (nunca persona), infinito por anterioridad, gerundio incl. `stare + gerundio` | ✓ VERIFIED | 6 slots confirmados (3+3+4+2+3+3=18). Keys fijas por slot (`fare`, `aver fatto`, `fatto/fatta/fatti/fatte`, `facente/facenti`, `facendo`, `avendo fatto`) — el eje es el encaje sintáctico, no el pronombre; `notes` declara explícitamente la ausencia del gate D-41-07. `infinito-passato`: las 3 variantes fuerzan anterioridad por preposición (`dopo`, `di`, `per`) o deíctico de pasado. `gerundio-presente` #0 examina `stare + gerundio` con el explanation desarrollando que el error es de USO (de más), no de formación, tal como exige INDEF-04. |
| SC-4 | `fatto` en su doble comportamiento (invariable/concordado) con RONDA EXTRA de quórum sobre ese par; `facente` con nota de registro explícita | ⚠️ PARCIAL — human_needed | El contenido y la explanation SÍ cumplen la letra: 4 variantes (2 invariables sin pronombre antepuesto, 2 concordadas con `li`/`le`, nunca `lo`/`la` singular), gate HARD de pronombre verde, explanation con el par de interferencia español/italiano. `facente` tiene 2 variantes sobre los 2 compuestos reales con nota de registro explícita en la explanation. **Lo que SC-4 pide y no puede confirmarse hoy:** la "ronda EXTRA de quórum sobre ese par" — `fare-indefiniti-participio-passato` sigue en `validation.status: "pending"` con `passes: []`; el gate condicionado `EXTRA_ROUND_SLOTS` está escrito y en verde pero nadie lo ha disparado. Es owed work declarado (D-43-20), no un defecto. **Residual (no bloqueante):** WR-01 — las 2 variantes invariables ofrecen la forma concordada como distractora "incorrecta" sin audit trail que documente por qué esa concordancia (literaria/atestiguada) no es "defendible como correcta" en ese contexto; ver Human Verification. |
| SC-5 | Ambas categorías cargan en boot como unidades de reset SEPARADAS y TODAS sus variantes quedan `validated` por quórum cross-vendor R1-R7 con canon editorial y sin leak R1 | ⚠️ PARCIAL — human_needed | La primera mitad está VERIFICADA mecánicamente: `categories.json` tiene 18 entradas, `fare-cond-imperativo` order 17 y `fare-indefiniti` order 18, dos entradas distintas, dos prefijos distintos en `RESET_PREFIXES_V13` (ya presentes desde Phase 40), `git diff --quiet src/screens/app.js src/domain/ src/data/` sale exit 0. La segunda mitad — "todas sus variantes quedan `validated`" — es estructuralmente IMPOSIBLE de confirmar hoy: los 9 slots están en `pending` / `passes: []` por diseño (D-43-02, `executor_cannot_run_task_quorum`); el quórum base Opus+Sonnet vive en una pasada top-level que aún no corrió. Esto es el hand-off declarado explícitamente por ambos plans y confirmado por `VAL_07_STRICT=1 node --test tests/*.test.js` (2 fails, nombrando exactamente los 2 ficheros nuevos). **No es un gap de esta fase**, es owed work con dueño (pase top-level de quorum), y se marca `human_needed` con `insufficient_spec`-style abstención en vez de un pase silencioso. |

**Score:** 3/5 criterios verificados de punta a punta ahora; 2/5 (SC-4, SC-5) tienen su parte de contenido/estructura verificada pero su cláusula de validación por quórum es owed work explícito, no confirmable por inspección estática, y no un defecto de la fase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| CI-01 | 43-01 | Condizionale presente, 6 personas, raíz `far-` | ✓ SATISFIED | Ver SC-1 |
| CI-02 | 43-01 | Condizionale passato, futuro-en-el-pasado | ✓ SATISFIED | Ver SC-1; CR-01 cerrado |
| CI-03 | 43-01 | Imperativo, 5 variantes, MAGNET `fa'` | ✓ SATISFIED | Ver SC-2 |
| INDEF-01 | 43-02 | Infinito presente/passato, anterioridad | ✓ SATISFIED | 3+3 variantes, marcadores de anterioridad confirmados por campo |
| INDEF-02 | 43-02 | Participio passato, invariable vs concordado | ✓ SATISFIED (contenido) / owed (ronda EXTRA) | Ver SC-4 |
| INDEF-03 | 43-02 | Participio presente `facente`, nota de registro | ✓ SATISFIED | 2 variantes, nota de registro confirmada en explanation |
| INDEF-04 | 43-02 | Gerundio presente/passato, `stare + gerundio` | ✓ SATISFIED | Ver SC-3 |

**0 orphaned requirements.** Los 7 IDs del bloque CI/INDEF de `.planning/REQUIREMENTS.md` (líneas 37-48) están cubiertos exactamente por los `requirements:` de los dos plans; no hay ningún ID adicional mapeado a Phase 43 que no aparezca en ninguno de los dos.

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `content/exercises/fare-cond-imperativo.json` | 2 claves top-level, `notes` + 3 slots (6/6/5=17) | ✓ VERIFIED | Confirmado en disco: `{notes, exercises}`, 3 slots, 6+6+5=17 variantes, `validation.status: "pending"` en los 3 (esperado) |
| `content/exercises/fare-indefiniti.json` | 2 claves top-level, `notes` + 6 slots (3/3/4/2/3/3=18) | ✓ VERIFIED | Confirmado en disco: 6 slots, 3+3+4+2+3+3=18 variantes, `pending` en los 6 (esperado) |
| `content/categories.json` | 18 entradas; `fare-cond-imperativo` order 17, `fare-indefiniti` order 18, 4 claves cada una | ✓ VERIFIED | 18 entradas confirmadas por lectura directa; ambas nuevas con `id/name/order/origen`, `origen: "ia-quorum"` |
| `tests/content-fare-cond-imperativo.test.js` | 13 describe, invariantes permanentes | ✓ VERIFIED | 13 describe / 66 tests (post CR-01), `node --test` aislado: 66 pass / 0 fail |
| `tests/content-fare-indefiniti.test.js` | 13 describe, invariantes permanentes | ✓ VERIFIED | 13 describe / 76 tests (post CR-02), `node --test` aislado: 76 pass / 0 fail |
| `tests/exercise-types.test.js` | 2 líneas nuevas en `CATEGORIES_WITH_EXPLANATIONS` | ✓ VERIFIED | `slotCountOf` dinámico para ambos ficheros nuevos confirmado; 183 pass / 0 fail |
| `09-VALIDATION-PROMPT.md` | Sección 7 nueva, antes de la línea de cierre, solo adiciones | ✓ VERIFIED | Sección 7 (7.1/7.2/7.3) confirmada en líneas 282-309, antes de `*Fin del prompt...*` (línea 309); guard de la sección 6 intacto |
| `.claude/skills/gsd-validate-exercise/SKILL.md`, `gsd-validate-batch/SKILL.md` | Ruta corregida, 0 referencias a la ruta obsoleta | ✓ VERIFIED | `grep` de la ruta obsoleta (`.planning/phases/09-infraestructura...`) devuelve 0 en ambos ficheros; la ruta real aparece correctamente |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `content/categories.json` | `src/data/schema-validator.js` (`knownCategoryIds`) | Referencia de `categoryIds` en los 9 slots nuevos | ✓ WIRED | `node --test tests/*.test.js` da `998 pass / 0 fail` sin errores de "categoría desconocida"; `tests/domain.test.js` incluido y verde |
| `content/categories.json` | `categoriesForDisplay` (`src/screens/app.js:3248`) | `this.content.categories.map(...)` | ✓ WIRED | Confirmado por lectura directa: el getter mapea `content.categories` genéricamente, sin lista hardcodeada de ids |
| `variants[]` | `pickVariantIndex` (`src/domain/session.js:232`) | `slot.variants.length`, axis-agnostic | ✓ WIRED | Confirmado por lectura directa: la función solo lee `Array.isArray(slot.variants) ? slot.variants.length : 1`, sin lógica de eje; sirve slots de 2, 3, 4, 5 y 6 variantes sin cambio |
| `validation.passes[]` | `deriveStatus` (`src/data/validation-state.js`) | Import directo en ambos test files | ✓ WIRED | Confirmado por `grep`; ambos test files exigen `status === deriveStatus(passes)` |
| Slug `fare-cond-imperativo` / `fare-indefiniti` | `RESET_PREFIXES_V13` (`src/data/storage.js:1345`) | Prefijo completo, ya presente desde Phase 40 | ✓ WIRED | Confirmado por code review (verificación independiente) y por `git diff --quiet src/data/` = exit 0 (esta fase no lo toca) |

### Engine Byte-Intact Check

```
git diff --quiet src/screens/app.js src/domain/ src/data/  → exit 0  ✓ CONFIRMED
```

### Test Suite Evidence

| Comando | Resultado | Interpretación |
|---|---|---|
| `node --test tests/*.test.js` | **998 pass / 0 fail** | Suite completa verde; sin regresiones |
| `VAL_07_STRICT=1 node --test tests/*.test.js` | **2 fail**, nombrando exactamente `fare-cond-imperativo.json` y `fare-indefiniti.json` como "todos los ejercicios con validation.status === validated" | Marcador visible del hand-off (D-43-02), estado ESPERADO, no una regresión |
| `node --test tests/content-fare-cond-imperativo.test.js` (aislado) | 66 pass / 0 fail | Confirma la Task 4 |
| `node --test tests/content-fare-indefiniti.test.js` (aislado) | 76 pass / 0 fail | Confirma la Task 5 |
| `node --test tests/exercise-types.test.js` (aislado) | 183 pass / 0 fail | Confirma el smoke paramétrico |

### Anti-Patterns Found

**0 TBD / FIXME / XXX** en los 8 ficheros tocados por la fase (grep directo, cero matches).

**0 stubs** — las 35 variantes están escritas con contenido real, ninguna opción es placeholder, ninguna explanation vacía.

**Ningún fichero fuera de `files_modified`** — `git status --porcelain` solo lista `.planning/config.json` (state tracking, no contenido de la fase).

### Open Code Review Items (43-REVIEW.md) — status re-verified against disk, 2026-08-07

El code review encontró 1 critical + 11 warnings + 7 info. Se re-verificó cuál de eso está realmente
arreglado en el árbol actual, no lo que el SUMMARY afirma:

| ID | Descripción | Estado real en disco |
|---|---|---|
| CR-01 | Trapassato defendible en 4/6 variantes del cond-passato | ✓ **FIXED** (`32b2eab`) — gate nuevo confirmado en verde |
| WR-03 | `DEITTICI_FUTURO` set incompleto | ✓ **FIXED** — `DEITTICI_FUTURO_RE` con patrones añadido |
| WR-04 | `causativo` dead check | ✓ **FIXED** — `CAUSATIVO_TRAS_HUECO` estructural añadido |
| WR-05 | Cues de concordancia sin frontera de palabra (fare-indefiniti) | ✓ **FIXED** (`20a5cc6`, CR-02) — `terminaEnPalabra`/`empiezaPorPalabra` |
| WR-01 | Concordancia con objeto pospuesto ofrecida sin audit trail | ✗ **OPEN** — confirmado en disco: `fatti`/`fatta` siguen como distractoras sin mención en `notes`/`explanation`/prompt de validación. Ver Human Verification. |
| WR-02 | Gate de objeto literal (cond-imperativo) cuenta en la cláusula pero verifica presencia en todo el prompt | ✗ **OPEN** — confirmado en disco (`tests/content-fare-cond-imperativo.test.js:634`); riesgo latente, no defecto activo hoy (todas las 17 variantes actuales pasan) |
| WR-06 | `09-VALIDATION-PROMPT.md` §7.2 pre-juzga C2 ("se cumple gracias a ellas") | ✗ **OPEN** — confirmado literal en línea 301 |
| WR-07 | §7.2 no escribe las formas exentas literalmente, omite la familia de clíticos | ✗ **OPEN** — confirmado: §7.2 sigue describiendo por perífrasis, sin `fai`/`fa`/`fallo`/`fammi`/`fatelo`/`facci` literales |
| WR-08 | 4 copias casi idénticas de la suite de invariantes, sin extraer a helper compartido | ✗ **OPEN** — deuda técnica declarada, advisory |
| WR-09 | Gate del gerundio-passato fija la excepción por índice, no por la propiedad que la justifica | ✗ **OPEN** — confirmado (`GER_PASS_CON_SIMPLE = 0` hardcoded); sin impacto activo hoy (la variante causal no ofrece `facendo` entre sus options) |
| WR-10 | Vocativos singulares del imperativo sin el mismo refuerzo de registro que los plurales | ✗ **OPEN** — confirmado en el contenido. Ver Human Verification. |
| WR-11 | Nota de `TOTAL_EXPECTED` atribuye el delta a 2 categorías en vez de 4 | ✗ **OPEN**, pero **fuera de alcance de Phase 43** — territorio explícito de Phase 44/INT-02, no se pondera aquí |
| IN-01..IN-07 | Hallazgos informativos menores (tautologías de test, gate débil de acentos, notes monolíticos) | Sin cambios; ninguno bloquea el goal de esta fase |

## Gaps Summary

**No hay gaps que bloqueen el goal de esta fase.** Todo lo mecánicamente verificable — los 9 slots en
disco, el registro de las 2 categorías, el motor byte-intacto, la suite completa, el fix de CR-01, el fix
de CR-02/WR-03/WR-04/WR-05 — está confirmado en el árbol real, no solo en el SUMMARY.

Lo que queda pendiente cae en dos cestas, ninguna de las dos un defecto de autoría de esta fase:

1. **Owed work con dueño explícito** — el pase TOP-LEVEL de quórum Opus+Sonnet sobre los 9 slots y la
   ronda EXTRA DeepSeek sobre las 12 variantes marcadas (D-43-20). Es la razón de que SC-4 y SC-5 no
   puedan cerrarse por inspección de código: son criterios que EXIGEN el veredicto de un validador
   independiente, y ese validador todavía no ha corrido. `VAL_07_STRICT=1` está rojo a propósito.
2. **Juicio lingüístico sin cerrar** — 2 backstops declarados por los propios plans (unicidad de lectura
   de los plurales del imperativo y de la variante causal del gerundio passato) más 2 hallazgos del code
   review que quedaron abiertos y son del mismo género de riesgo que CR-01 pero de menor severidad
   (WR-01: concordancia con objeto pospuesto; WR-10: vocativos singulares con menos refuerzo que los
   plurales). Los cuatro son exactamente el tipo de pregunta que el quórum top-level (cesta 1) está
   diseñado para resolver — y en su defecto, requieren adjudicación humana explícita antes de cerrar la
   fase con confianza total.

Ninguno de los dos items abre una segunda respuesta CONFIRMADA en el contenido actual (a diferencia de
CR-01, que sí abría una); son riesgos declarados y sin resolver, no defectos demostrados.

---

_Verified: 2026-08-07_
_Verifier: Claude (gsd-verifier)_
