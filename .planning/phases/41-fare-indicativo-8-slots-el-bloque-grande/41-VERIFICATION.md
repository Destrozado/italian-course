---
phase: 41-fare-indicativo-8-slots-el-bloque-grande
verified: 2026-08-03T19:19:03Z
status: human_needed
score: 12/13 must-haves verified (1 routed to human_needed by design — SC-4's quorum closure)
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Correr la pasada TOP-LEVEL de quórum base (Opus+Sonnet vía gsd-validate-exercise) sobre los 8 slots de fare-indicativo.json, 1 ejercicio por contexto (VAL-03), más la ronda EXTRA DeepSeek obligatoria (D-41-12) sobre fare-indicativo-passato-remoto y fare-indicativo-trapassato-remoto, y la re-declaración local del 0-gloss en concerns de cada pase Opus."
    expected: "Los 8 slots quedan validation.status: 'validated' con >=2 passes 'correcta' de 'by' distintos y 0 'incorrecta'; VAL_07_STRICT=1 node --test tests/*.test.js pasa a verde; tests/content-fare-indicativo.test.js sigue verde con status === deriveStatus(passes)."
    why_human: "El quórum canónico Opus+Sonnet spawnea Task subagents y no está disponible dentro de un subagent gsd-executor ni de este verificador (D-41-15); es la mitad mecánica de SC-4 que la fase deliberadamente no cierra en 41-01/41-02."
  - test: "Confirmar, con el mismo rigor que ya se aplicó a las 4 variantes del futuro anteriore (CR-01, corregido en a613252/cc212ff), que ninguna de las 48 variantes admite una segunda lectura defendible del marco temporal — backstop declarado en ambos PLAN.md (verification: backstop) — prestando atención especial a las 2 variantes 'quando' del trapassato remoto y a los 12 casos que el code review deja abiertos como WR-01/WR-04/WR-05 (colapso de discriminación a 2 opciones, explanations que no nombran la familia de distractora que sí ofrecen, colocación marcada de già sin corrección en el texto)."
    expected: "El pase de quórum se pronuncia explícitamente sobre esos puntos en validation.passes[].concerns, y ninguna variante queda con una opción defendiblemente correcta además de la key."
    why_human: "Es un juicio lingüístico marcado 'verification: backstop' en el PLAN.md porque ninguna aserción mecánica puede cerrarlo; el code review ya encontró y corrigió una instancia real (CR-01) actuando exactamente como esta red de seguridad, lo que demuestra que el riesgo es real y no hipotético."
---

# Phase 41: `fare-indicativo` — 8 slots (el bloque grande) Verification Report

**Phase Goal:** El autor puede ser examinado sobre el indicativo completo de `fare` — 4 tiempos simples (presente, imperfetto, passato remoto, futuro semplice) y 4 compuestos (passato prossimo, trapassato prossimo, trapassato remoto, futuro anteriore) — como UNA sola categoría nacida en slot+variantes, con la persona como eje de variante (la rota `pickVariantIndex`, sin código nuevo) y todas las variantes validadas 1-por-1 por quórum cross-vendor R1-R7.

**Verified:** 2026-08-03T19:19:03Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | SC-1: 4 tiempos simples, persona distinta cada pasada, distractoras del error real (`*facerò`, regularización de raíz) | ✓ VERIFIED | Keys de los 4 slots simples confirmadas byte a byte contra el paradigma (`faccio/fai/fa/facciamo/fate/fanno`, `facevo…`, `feci…`, `farò…`); `facerò`/`facerai`/`facerà`/`faceremo`/`facerete`/`faceranno` presente en las 6 variantes del futuro semplice y nunca como key (verificado con `node -e`) |
| 2 | SC-2: 3 compuestos vivos con `avere`+`fatto`, TIEMPO DEL AUXILIAR según marco, sin doble lectura (R7) | ✓ VERIFIED (backstop parcial, ver ítem 13) | Invariante de 2 palabras con `fatto`/`fare` como segunda confirmada en las 96 opciones compuestas; CR-01 (doble validez epistémica de `avrà fatto`/`avranno fatto` en 4 variantes de `passato-prossimo`/`trapassato-prossimo`) encontrada por code review y corregida en `a613252`/`cc212ff` — confirmado en disco: las 4 variantes ahora usan `ebbe fatto`/`ebbero fatto`, inequívocamente bloqueadas por el marco reciente/de-anterioridad-pasada de cada slot |
| 3 | SC-3: trapassato remoto SIEMPRE en su marco (subordinada + principal en passato remoto), explanation explícita | ✓ VERIFIED | Los 6 prompts reparten `dopo che`/`quando`/`appena` 2+2+2 exactamente; los 6 verbos principales están en passato remoto y ninguno es forma de `fare`; explanation contiene literalmente "Fuera de ese marco la forma no se usa"; las 2 variantes `quando` no ofrecen auxiliar en imperfetto ni forma simple, así que la lectura queda única por los 2 mecanismos declarados |
| 4a | SC-4 (mitad mecánica): canon editorial heredado + 0 leak R1 | ✓ VERIFIED | `node --test tests/*.test.js` → 766/766 (821/821 con fixtures); sub-tests editoriales de `CATEGORIES_WITH_EXPLANATIONS` en verde; 0 `<`/`>`/`&#`/`javascript:`/smart-quotes/`__proto__` en el fichero (comprobado directamente) |
| 4b | SC-4 (mitad de fondo): las 48 variantes quedan `validation.status: validated` por quórum Opus+Sonnet | ✗ NOT MET — **outstanding by design, no fabricado** | Los 8 slots están en `status: "pending"` con `passes: []`; `VAL_07_STRICT=1 node --test tests/*.test.js` falla nombrando exactamente los 8 slots `(pending)` — el marcador honesto declarado en ambos SUMMARY. El quórum canónico corre TOP-LEVEL, fuera del alcance del executor y de este verificador (D-41-15). Routed a Human Verification #1 |
| 5 | SC-5: la categoría carga en boot y aparece en home/picker/Repaso/Examen sin una línea de motor nueva | ✓ VERIFIED | `git diff --stat src/screens/app.js src/domain/ src/data/` → vacío; `categoriesForDisplay` (`src/screens/app.js:3238-3248`) mapea `content.categories` 1:1 genéricamente; `pickVariantIndex` (`src/domain/session.js:232`) inalterado y sirve cualquier `N` de variantes por construcción; entrada de `fare-indicativo` presente y correcta en `categories.json` (15ª, `order:15`, `origen:"ia-quorum"`) |
| 6 | D-41-01: 48 = 8 slots × 6 variantes exactas, sin repetir persona | ✓ VERIFIED | `exercises.length === 8`, `Σ variants.length === 48`, las 8 keys-sets coinciden exactamente con `CANON` del test, sin duplicados |
| 7 | D-41-05: 0-gloss — cero `(`/`)` ni `espa` en los 48 prompts | ✓ VERIFIED | Escaneo directo sobre los 48 `prompt`: 0 coincidencias con `(`, `)`, `espa` |
| 8 | D-41-06: SCOPE-GATE de perífrasis — cero `colazione`/`spesa`/`freddo`/`farcel`/causativo | ✓ VERIFIED | Escaneo directo sobre 96 campos (`prompt`+`options`): 0 coincidencias; los 48 objetos salen del conjunto cerrado de 7 |
| 9 | D-41-07: pronombre sujeto explícito en las 48 | ✓ VERIFIED | Los 48 prompts contienen `___` y al menos uno de los 6 pronombres; 0 prompts sin pronombre |
| 10 | D-41-08: blacklist de formas atestiguadas ausente de `options` (16 formas + otros modos + homógrafas) | ✓ VERIFIED | `tests/content-fare-indicativo.test.js` bloque 6 escanea `ATESTIGUADAS` (27 formas) palabra-a-palabra sobre las 192 opciones; WR-03 del code review (la lista original solo cubría 5/16) fue cerrada en `eb086d8` — confirmado en disco: el `Set` ahora contiene las 16 + homógrafas + otros modos |
| 11 | D-41-11: marcos disjuntos passato-remoto ↔ passato-prossimo, en ambas direcciones | ✓ VERIFIED | 0 marcadores recientes en `passato-remoto`; 0 marcadores remotos en `passato-prossimo`; 0 opciones con `fatto` en `passato-remoto`; 0 opciones que sean forma simple de passato remoto en `passato-prossimo` |
| 12 | D-41-13/D-41-14: 8 slots MC-only, ids semánticos verbatim, `-300`+ libre | ✓ VERIFIED | `type` único `'multiple-choice'`; los 8 ids coinciden exactamente con el mapa de D-41-14; 0 ids con sufijo numérico de 3 cifras; `notes` declara 0-match y 0-word-buttons como decisión razonada |
| 13 | Backstop: ninguna de las 48 variantes admite una segunda lectura del marco (R7) | ⚠️ human_needed | `verification: backstop` en ambos PLAN.md — juicio lingüístico que ninguna aserción mecánica cierra. El code review YA encontró una instancia real (CR-01, corregida) demostrando que el riesgo es real; quedan además 3 hallazgos abiertos del review (WR-01, WR-04, WR-05) que tocan la misma familia de riesgo sin llegar a doble validez confirmada. Cierre real = pasada de quórum top-level. Routed a Human Verification #2 |

**Score:** 12/13 truths verified (1 routed to human_needed by explicit phase design — SC-4's quorum closure and its backstop counterpart)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `content/exercises/fare-indicativo.json` | 8 slots MC, 48 variantes, `notes` con 6+ declaraciones, `validation` en `pending` | ✓ VERIFIED | 8 slots, 48 variantes, `notes` de ~9.000 caracteres con las 9 declaraciones (0-gloss, 0-match, 0-wb, blacklist con audit trail ×4 grupos, SCOPE-GATE, marcos disjuntos, distractora malformada, colocación de già, prohibición imperfetto en trapassato remoto, retirada del futuro anteriore) |
| `content/categories.json` | 15 entradas; la nueva `fare-indicativo`, order 15, `origen:"ia-quorum"` | ✓ VERIFIED | 15 entradas confirmadas; las 14 previas con key-set idéntico a como quedaron; la nueva coincide byte a byte con lo declarado |
| `tests/exercise-types.test.js` | 1 línea nueva en `CATEGORIES_WITH_EXPLANATIONS` con `expected` dinámico | ✓ VERIFIED | Presente; sub-tests editoriales corren sobre el fichero y pasan |
| `tests/content-fare-indicativo.test.js` | Fichero de test nuevo con los invariantes permanentes de la categoría | ✓ VERIFIED | 634 líneas, 14 `describe`, escaneos por-campo (nunca sobre fichero completo salvo higiene), `deriveStatus` importado del módulo real — 61 tests, todos en verde |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `content/categories.json` | `src/data/schema-validator.js` (`knownCategoryIds`) | `categoryIds` de cada slot referencia una categoría conocida | ✓ WIRED | `node --test tests/*.test.js` → `fail 0`; sin la entrada, `tests/domain.test.js:322-341` se pondría rojo |
| `content/categories.json` | `src/screens/app.js` (`categoriesForDisplay`) | mapeo 1:1 de `content.categories` | ✓ WIRED | Código leído directamente (`app.js:3238-3253`); la fila aparece por construcción en cuanto existe la entrada |
| `variants[]` | `src/domain/session.js` (`pickVariantIndex`) | `slot.variants.length` determina el rango de índice | ✓ WIRED | Función leída directamente (línea 232-235): genérica en `N`, sin código añadido |
| `validation.passes[]` | `src/data/validation-state.js` (`deriveStatus`) | `tests/content-fare-indicativo.test.js` importa la función real y exige `status === deriveStatus(passes)` | ✓ WIRED | Import confirmado (línea 32); con `passes: []`, `deriveStatus([]) === 'pending'`, coherente con el estado en disco |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Suite completa sin regresiones | `node --test tests/*.test.js` | 766 pass / 0 fail | ✓ PASS |
| Suite completa + fixtures | `node --test tests/*.test.js tests/fixtures/*.test.js` | 821 pass / 0 fail | ✓ PASS |
| Marcador honesto del hand-off de quórum | `VAL_07_STRICT=1 node --test tests/*.test.js` | 1 fail — nombra exactamente los 8 slots `(pending)` | ✓ PASS (el fallo ES el estado correcto) |
| Motor v1.4 intacto | `git diff --stat src/screens/app.js src/domain/ src/data/` | sin salida | ✓ PASS |
| Árbol de trabajo limpio (salvo la bandera efímera del orquestador) | `git status --porcelain` | solo `.planning/config.json` (bandera `_auto_chain_active`, no es entregable de esta fase) | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| IND-01 | 41-01 | Presente, trampa `facc-`/`fa-` | ✓ SATISFIED | Keys y distractoras verificadas |
| IND-02 | 41-01 | Imperfetto, raíz latina `fac-` | ✓ SATISFIED | Keys verificadas, 0 forma regularizada como key |
| IND-03 | 41-01 | Passato remoto, alternancia `fec-`/`fac-` | ✓ SATISFIED | Reparto de raíz por persona verificado |
| IND-04 | 41-01 | Futuro semplice, raíz contracta `far-`, nunca `facerò` | ✓ SATISFIED | `facerò`+familia en las 6 variantes, nunca key |
| IND-05 | 41-02 | 3 compuestos con `avere`+`fatto`, tiempo del auxiliar por marco | ✓ SATISFIED (contenido correcto; CR-01 ya corregido) | Invariante de 2 palabras confirmada; el único defecto de doble-validez detectado (CR-01) está reparado |
| IND-06 | 41-02 | Trapassato remoto dentro de su marco sintáctico | ✓ SATISFIED | Marco obligatorio + reparto 2+2+2 + explanation explícita, verificados |

**Nota sobre REQUIREMENTS.md:** las 6 filas IND-01..06 están marcadas `[x]` como "Complete" en el documento. Esa marca es precisa para "contenido autorado y estructuralmente correcto" pero el requisito completo de la fase (validación 1-por-1 por quórum cross-vendor, SC-4) no está cerrado — ver truth #4b. No se trata de una discrepancia del documento, sino de la naturaleza en dos pasos del proceso (autoría vía executor + quórum vía top-level) que D-41-15 declara explícitamente.

**Orphaned requirements:** ninguno. INT-01..04 pertenecen literalmente a Phase 44 (confirmado en REQUIREMENTS.md §Mapping y ROADMAP §Phase 44); no se buscaron ni se autoraron aquí, correctamente.

### Anti-Patterns Found

Ninguno de nivel BLOQUEANTE. 0 marcadores de deuda (`TBD`/`FIXME`/`XXX`) en los ficheros de esta fase. Los siguientes son hallazgos de calidad ya identificados por `41-REVIEW.md` y explícitamente aceptados como abiertos por el estado de la fase (no bloquean el goal, no crean doble validez confirmada):

| File | Finding | Severity | Status |
|------|---------|----------|--------|
| `content/exercises/fare-indicativo.json` (12 variantes compuestas) | WR-01: la distractora de infinitivo lleva el auxiliar en PRESENTE en vez del auxiliar propio del slot, colapsando la discriminación a 2 opciones en 12/24 variantes compuestas | ⚠️ WARNING (abierto, conocido) | No fabricado, no crea doble validez; reduce calidad pedagógica |
| `tests/content-fare-indicativo.test.js:544` | WR-02: el assert de acentos RAE solo exige 1 carácter acentuado en toda la explanation | ⚠️ WARNING (abierto, conocido) | Test casi-vacuo pero no falso — no hay violación real de acentos en los datos (verificado: 10-27 caracteres acentuados reales por explanation) |
| `content/exercises/fare-indicativo.json:380,454` | WR-04: 2 explanations no nombran la familia de distractora de infinitivo que sí ofrecen sus variantes tu/lui/voi | ⚠️ WARNING (abierto, conocido) | Omisión didáctica, no error de contenido |
| `content/exercises/fare-indicativo.json` (12 prompts) | WR-05: colocación preverbal marcada de `già`, sin corrección en el texto de la explanation | ⚠️ WARNING (abierto, conocido) | Gramatical pero no se corrige al alumno |
| `scripts/run-validation-271.mjs`, `tests/fixtures/slot-variants-integration.test.js` | WR-06: reporter y count-guard ciegos a `fare-indicativo` | ⚠️ WARNING (deferred, por diseño) | Explícitamente diferido a Phase 44/INT-02; documentado en `notes` y en ambos SUMMARY |
| Varios | IN-01..04: audit-trail vacuo mientras `pending`, higiene no cubre `categories.json`, SCOPE-GATE cubre 4/5 familias, blacklist solo sobre `options` | ℹ️ INFO (abierto, conocido) | Cosméticos, no afectan el goal de esta fase |

**Hallazgos ya cerrados y confirmados en disco durante esta verificación:**
- **CR-01 (crítico)** — doble validez epistémica de `avrà fatto`/`avranno fatto` en 4 variantes: confirmado corregido en `a613252` + `cc212ff`, verificado leyendo el JSON resultante y razonando sobre el marco de cada variante afectada.
- **WR-03 (warning)** — blacklist de "inexistentes" cubría solo 5/16 formas: confirmado cerrado en `eb086d8`, verificado leyendo el `Set ATESTIGUADAS` (27 formas) y su uso en el bloque 6 del test.

### Human Verification Required

1. **Pasada TOP-LEVEL de quórum base (Opus+Sonnet) + ronda EXTRA DeepSeek (D-41-12)**
   **Test:** Ejecutar `gsd-validate-exercise` 8 veces (1 por slot, fresh context, VAL-03) sobre `fare-indicativo.json`, con la ronda EXTRA DeepSeek obligatoria sobre `fare-indicativo-passato-remoto` y `fare-indicativo-trapassato-remoto`, y con cada pase Opus registrando en `concerns` la re-declaración local del 0-gloss.
   **Expected:** Los 8 slots quedan `validation.status: "validated"` (≥2 `correcta` de `by` distintos, 0 `incorrecta`); `VAL_07_STRICT=1 node --test tests/*.test.js` pasa a verde.
   **Why human:** El skill spawnea Task subagents, inaccesibles tanto al executor (`gsd-executor`) como a este verificador; es la mitad de fondo de SC-4 que la fase declara explícitamente como no cerrada por diseño (D-41-15).

2. **Confirmación final de unicidad de lectura del marco en las 48 variantes (backstop R7)**
   **Test:** Que la pasada de quórum del punto 1 se pronuncie explícitamente sobre: (a) las 2 variantes `quando` del trapassato remoto, (b) los 12 casos donde la distractora de infinitivo no aísla la lección que dice enseñar (WR-01), y (c) cualquier otra lectura defendible del estilo de la ya encontrada y corregida en CR-01.
   **Expected:** Cero variantes con una opción defendiblemente correcta además de la key.
   **Why human:** Marcado literalmente `verification: backstop` en ambos PLAN.md — juicio lingüístico que ninguna aserción mecánica puede cerrar. El propio code review ya demostró el riesgo real (CR-01), así que abstenerse a "verificado" sin la pasada de quórum sería un pase silencioso sobre exactamente el tipo de daño que esta fase existe para prevenir.

### Gaps Summary

No hay gaps que bloqueen el goal de la fase. Los 8 slots están correctamente autorados, la categoría es jugable de punta a punta sin tocar el motor, y el único criterio de éxito no cumplido (SC-4, el cierre por quórum) es un paso de proceso deliberadamente diferido a una pasada top-level fuera del alcance de `execute-phase` — está declarado, está marcado con un rojo honesto (`VAL_07_STRICT=1`), y no hay ningún pase fabricado. El código de review encontró y el equipo YA corrigió el único defecto de doble-validez confirmada (CR-01) y la única brecha de cobertura de blacklist (WR-03) antes de esta verificación. Quedan 9 hallazgos de calidad abiertos y conocidos (WR-01/02/04/05/06, IN-01..04), ninguno bloqueante, todos ya documentados en `41-REVIEW.md`.

**Siguiente paso recomendado:** correr la pasada top-level de quórum (8 invocaciones de `gsd-validate-exercise` + 2 rondas extra DeepSeek) antes de considerar la fase completamente cerrada; opcionalmente resolver WR-01/04/05 en esa misma pasada, ya que tocan directamente la calidad de las explanations y las distractoras que el quórum va a revisar de todos modos.

---

*Verified: 2026-08-03T19:19:03Z*
*Verifier: Claude (gsd-verifier)*
