---
phase: 24-verbi-di-movimento-a-slots-contenido
verified: 2026-06-08T14:00:00Z
status: passed
score: 7/7 must-haves verified
overrides_applied: 0
re_verification: false
---

# Phase 24: Verbi di movimento a slots — Informe de Verificacion

**Phase Goal:** Verbi di movimento se convierte al modelo slot+variantes — los 37 ejercicios validados se reagrupan en slots por regla, se autoran variantes nuevas que pasan el quorum cross-vendor R1-R7, y la estructura final pasa el validator y el smoke. Tercera y ultima de las categorias de verbos.
**Verificado:** 2026-06-08T14:00:00Z
**Status:** passed
**Re-verificacion:** No — verificacion inicial.

---

## Logro del objetivo

### Truths observables

| # | Truth | Status | Evidencia |
|---|-------|--------|-----------|
| 1 | Los 37 ejercicios de Verbi di movimento quedan reagrupados en slots por REGLA DE AUXILIAR (D-24-01); la concordancia en UN solo slot (D-24-03, divergencia deliberada vs Essere); slot correre PROPIO (D-24-04); excepcioni-avere; 3 word-buttons sin match; ids semanticos, categoryIds=["verbos-movimiento"], sin cruces | VERIFICADO | 7 slots reales: essere(21v), concordanza(16v), excepcioni-avere(10v), correre(7v), wb-andare(1), wb-viaggiare(1), wb-uscire(1). `concordanza slots: 1`. `wb: 3 match: 0`. `mal-cat: 0`. `cruces: 0`. Todos los ids semanticos verificados. |
| 2 | Cada slot tiene explanation top-level no vacia (merge D-24-10); anti-calco "io ho andato" en slot essere; "hay destino?" en correre; matriz genero×numero en concordanza con varios verbos; excepcioni lidera con "sin destino -> avere"; ninguna explanation referencia la categoria Essere por id o prosa (D-24-07/D-159) | VERIFICADO | `slots sin explanation: 0`. Comprobado en codigo: essere contiene "ho andato"; correre contiene "hay un destino?"; concordanza cubre -o/-a/-i/-e con uscito/tornato/entrato; excepcioni contiene "destino". `refs Essere-cat: 0`. |
| 3 | Payload eliminado de todos los ejercicios; ninguna variante lleva explanation propia; sin smart-quotes | VERIFICADO | `con payload: 0`. `variantes con explanation: 0`. `smart-quotes: 0` (grep Unicode U+2018..U+201D da 0). |
| 4 | Los 4 ejes de huecos (D-24-06) materializados con ambicion generosa (20 variantes nuevas): eje 1 mas verbos essere (scendere/salire/cadere/rimanere/restare/diventare/nascere); eje 2 mas excepciones avere (passeggiare/sciare/viaggiare/nuotare); eje 3 mas test-de-destino (volare/correre pares contrastivos); eje 4 matriz de concordancia completa (sceso/salita/venuti/partite) | VERIFICADO | Conteo de variantes tras 24-02: essere 14->21 (+7), excepcioni-avere 6->10 (+4), correre 2->7 (+5), concordanza 12->16 (+4) = 20 variantes nuevas. Los 20 commits individuales existen en git (b2ae6b3..5b7b400). Los 4 ejes cubiertos en 24-VARIANTES-NUEVAS.md (62 referencias a terminos clave). |
| 5 | Cada variante nueva paso el quorum cross-vendor R1-R7 (>=4x correcta, 0 incorrecta) antes de integrarse; auxiliar de cada verbo verificado por el quorum (D-24-06); las superficies existentes movidas en 24-01 NO re-validadas (D-24-11) | VERIFICADO | 20 commits individuales (1 por superficie, 1-por-1 NUNCA batched), todos con mensajes "feat(24-02): add ... variant". La tabla de quorum en 24-02-SUMMARY.md registra los 20 ids temporales con sus 4 `by` y `verdict: correcta`. Fallback deepseek-reasoner para ext-2 cuando Gemini 429 (desde superficie 3). Quorum slots existentes: 2 passes legacy de 2026-05-27 (patron identico a essere-sono/avere-passato-prossimo en Phases 22/23 — diseno intencional documentado, ver analisis WR-01 abajo). |
| 6 | Los 3 hardcodes de count (exercise-types.test.js:1270, slot-variants-integration.test.js:170, run-validation-271.mjs:129) + TOTAL_EXPECTED sincronizados contra el conteo REAL de slots (7); suite completa + reporter + smoke estricto verdes | VERIFICADO | Los 3 archivos: `expected: 7`. `TOTAL_EXPECTED = 277` (= 307 - 37 + 7). `node --test tests/*.test.js`: 374/374 PASS. `VAL_07_STRICT=1 node --test tests/*.test.js`: 383/383 PASS. `node scripts/run-validation-271.mjs`: VAL-06 277/277 PASS, VAL-08 PASS, VAL-04 PASS. Exit 0. |
| 7 | validateContent verde; cada slot tiene validation.status="validated" top-level; no existe snapshot APPEND-ONLY ni cruces para Verbi di movimento (D-24-14); R1 (sin leak) y R5 (3+ opciones distintas) verificados en todos los MC | VERIFICADO | `node scripts/validate-content-fixture.mjs verbos-movimiento`: exit 0 (7 ejercicios). `slots variants sin validation top-level: 0`. No existe `.verbos-movimiento-prefix-snapshot.json`. R1: 0 leaks (prompt no contiene la opcion correcta). R5: 0 fallos (todas las variantes MC tienen 4 opciones unicas). |

**Score:** 7/7 truths verificadas

---

### Artefactos requeridos

| Artefacto | Esperado | Status | Detalles |
|-----------|----------|--------|---------|
| `content/exercises/verbos-movimiento.json` | 7 slots slot+variantes, payload=0, explanation top-level, variants[], sin smart-quotes | VERIFICADO | 7 slots (4 MC + 3 wb). Payload=0. Explanation no vacia en todos. Variantes sin explanation propia. 0 smart-quotes. 0 cruces. categoryIds=["verbos-movimiento"] en todos. |
| `.planning/phases/24-verbi-di-movimento-a-slots-contenido/24-REAGRUPACION-MAP.md` | Mapa auditado de 37 ids fuente -> slots por regla de auxiliar; secciones "sin cruces" y "snapshot no aplica" | VERIFICADO | Archivo existe (22.7 KB). Committeado en 448a6ae. Aprobado por el autor en checkpoint:decision. |
| `.planning/phases/24-verbi-di-movimento-a-slots-contenido/24-VARIANTES-NUEVAS.md` | Set propuesto de superficies nuevas (4 ejes) con id temporal + slot destino + superficie R1-R7 + auxiliar verificado | VERIFICADO | Archivo existe (24.1 KB). Committeado en 3def9d4. Cubre los 4 ejes D-24-06 con verificaciones de auxiliar. |
| `tests/exercise-types.test.js` | expected verbos-movimiento = 7; logica shape-agnostic sin tocar | VERIFICADO | Linea 1270: `expected: 7`. `grep -c "Array.isArray(ex.variants)"` = 2 (logica intacta). Commit a24cf29. |
| `tests/fixtures/slot-variants-integration.test.js` | REAL_CATEGORIES verbos-movimiento expected = 7 | VERIFICADO | Linea 170: `expected: 7`. Commit 6464f80. |
| `scripts/run-validation-271.mjs` | expected verbos-movimiento = 7; TOTAL_EXPECTED = 277; comentario del historial actualizado con MOV-01 | VERIFICADO | expected: 7 en linea 129. TOTAL_EXPECTED = 277 en linea 132. Comentario lineas 104-115 documenta conversion a slots, concordancia 1 slot D-24-03, correre propio D-24-04. Commit 6464f80. |

---

### Verificacion de key links

| From | To | Via | Status | Detalles |
|------|----|-----|--------|---------|
| `content/exercises/verbos-movimiento.json` | validateContent / normalizeExerciseToSlot | shape slot+variantes (payload XOR variants[]) | WIRED | `validate-content-fixture.mjs verbos-movimiento` exit 0; pattern `"variants"\s*:\s*\[` presente en todos los slots. |
| el slot concordanza (UN solo slot, D-24-03) | el slot essere y el slot excepcioni-avere (slots distintos por regla) | reparto de los pares aux-vs-participio verificado contra las options reales | WIRED | `concordanza slots: 1` confirmado. Variantes del slot essere tienen options de formas essere/avere; variantes del slot concordanza tienen options de terminaciones -o/-a/-i/-e. |
| las 20 variantes nuevas (24-02) | validation.passes[] de cada quorum individual | quorum cross-vendor (20 commits 1-por-1) | WIRED | 20 commits feat(24-02) en git (b2ae6b3..5b7b400). Cada commit corresponde a 1 superficie. Tabla de quorum en 24-02-SUMMARY. `validation.status: validated` en todos los slots. |
| 3 hardcodes de count + TOTAL_EXPECTED | data.exercises.length real de verbos-movimiento.json | sincronizacion contra el conteo REAL del JSON | WIRED | Los 3 hardcodes (7/7/7) + TOTAL_EXPECTED (277) coinciden con `data.exercises.length = 7`. 277 = 307 - 37 + 7 aritmeticamente verificado. |

---

### Data-Flow Trace (Level 4)

No aplica. Esta fase es de contenido editorial JSON y sincronizacion de tests. No hay componentes de render dinamico introducidos — el motor slot-aware (loader/validator/sampler) ya existia desde Phase 16 y no se modifico.

---

### Behavioral Spot-Checks

| Comportamiento | Comando | Resultado | Status |
|----------------|---------|-----------|--------|
| Fixture validator verde | `node scripts/validate-content-fixture.mjs verbos-movimiento content/exercises/verbos-movimiento.json` | exit 0, "OK validacion: 7 ejercicio(s)" | PASS |
| Suite completa verde | `node --test tests/*.test.js` | 374/374 PASS, 0 FAIL | PASS |
| Smoke estricto verde | `VAL_07_STRICT=1 node --test tests/*.test.js` | 383/383 PASS, 0 FAIL | PASS |
| Reporter de validacion verde | `node scripts/run-validation-271.mjs` | VAL-06 277/277 PASS; VAL-08 PASS; VAL-04 PASS; exit 0 | PASS |
| Count real = 7 | `node -e "console.log(require('./content/exercises/verbos-movimiento.json').exercises.length)"` | 7 | PASS |
| TOTAL_EXPECTED = 307 - 37 + 7 | Verificacion aritmetica | 277 = 307 - 37 + 7 | PASS |
| Ninguna variante lleva explanation propia | inline node check | variantes con explanation: 0 | PASS |
| Concordancia en 1 solo slot (D-24-03) | inline node check | concordanza slots: 1 | PASS |
| Sin cruces 300-305 | inline node check | cruces: 0 | PASS |
| Sin refs a categoria Essere (D-24-07) | inline node check | refs Essere-cat: 0 | PASS |
| R5: 3+ opciones distintas en todos los MC | inline node check | R5 failures: 0 | PASS |
| R1: sin leak de respuesta en el prompt | inline node check | R1 potential failures: 0 | PASS |

---

### Cobertura de requisitos

| Requisito | Plan | Descripcion | Status | Evidencia |
|-----------|------|-------------|--------|-----------|
| MOV-01 | 24-01, 24-03 | Los 37 ejercicios de Verbi di movimento se reagrupan en slots por regla con explanation a nivel de slot; la estructura final pasa el validator y el smoke con los counts re-sincronizados al n real de slots | SATISFECHO | 7 slots por regla de auxiliar (D-24-01); validateContent verde; 3 hardcodes = 7; TOTAL_EXPECTED = 277; suite 374/374 + strict 383/383 + reporter 277/277 PASS. |
| MOV-02 | 24-02 | Se autoran variantes nuevas (D-85 + quorum cross-vendor R1-R7) donde la regla admite reformulacion; cada variante pasa el quorum antes de entrar; huecos -> slots nuevos | SATISFECHO | 20 variantes nuevas (4 ejes D-24-06); todas >=4x correcta; 20 commits 1-por-1; 0 slots nuevos (todos los ejes engordan slots existentes, aprobado por el autor). Auxiliar de cada verbo confirmado por el quorum. |

---

### Anti-patrones encontrados

| Archivo | Linea | Patron | Severidad | Impacto |
|---------|-------|--------|-----------|---------|
| `content/exercises/verbos-movimiento.json` | validation.passes de cada slot | Passes[] con fecha 2026-05-27 no cubren las variantes nuevas de 24-02 (2026-06-08) | WARNING (WR-01 del 24-REVIEW.md) | Sin impacto en correccion del contenido ni en los gates (VAL_07_STRICT pasa). Patron IDENTICO al de essere.json (essere-sono: 2 passes legacy 2026-05-27 aunque tiene variantes nuevas de 23-02) y avere.json (avere-passato-prossimo: 3 passes legacy aunque tiene 8 variantes). El patron es diseno intencional en los 3 planes: las variantes se validan 1-por-1 con ids temporales antes de integrarse; el slot-level validation.passes[] refleja el quorum del ejercicio BASE (el que dominaba la reagrupacion, D-24-11). Los 20 commits de quorum individuales son el audit trail real de cada variante nueva. El 24-REVIEW.md lo documenta como WR-01 y propone una mejora de auditoria opcional. |

**Evaluacion del WR-01 (patron de quorum slot-nivel):** CONFORME con el diseno de las fases previas. El diseno intencional es:
- Los temp IDs se validan 1-por-1 con el quorum completo (4+ passes, cada uno registrado en 24-02-SUMMARY.md y en el commit message).
- Tras pasar, la variante se mueve al `variants[]` del slot sin re-validacion del slot completo (D-24-11 — cambio de contenedor, no de superficie).
- El `validation.passes[]` del slot refleja el quorum del ejercicio BASE de 24-01 (es la gate de slot, no la gate de variante).
- Este patron se aplico identicamente en Phase 22 (avere) y Phase 23 (essere) para slots existentes con variantes nuevas.

La unica diferencia con Phase 23 es que essere-ser-estar fue un SLOT NUEVO -> recibio passes fresh de 2026-06-08. En Phase 24, al no crearse ningun slot nuevo (los 4 ejes engordan slots existentes), no hay ninguna fecha fresca en passes[]. Esto es matematicamente consistente con D-24-11 y el patron establecido. No es un BLOCKER.

No se encontraron: TBD, FIXME, XXX sin referencia en ningun archivo modificado por la fase.

---

### Verificacion humana requerida

Ninguna. Todos los checks son verificables programaticamente. Esta fase es de contenido JSON y sincronizacion de tests — sin componentes de UI, ni comportamiento en tiempo real, ni servicios externos nuevos.

---

### Resumen del objetivo

**El objetivo de la Phase 24 esta ALCANZADO.**

Los 37 ejercicios legacy de Verbi di movimento se han convertido al modelo slot+variantes:
- 7 slots organizados por REGLA DE AUXILIAR (D-24-01): essere (21v) + concordanza UN solo slot (16v, D-24-03) + excepcioni-avere (10v) + correre PROPIO (7v, D-24-04) + 3 word-buttons slots-de-1.
- 20 variantes nuevas (4 ejes D-24-06) integradas con quorum cross-vendor completo, 1-por-1, 20 commits individuales verificables en git.
- validateContent verde, suite 374/374 PASS, VAL_07_STRICT 383/383 PASS, reporter 277/277 PASS.
- MOV-01 y MOV-02 satisfechos; REQUIREMENTS.md puede marcarse [x] para ambos.
- El unico punto de atencion (WR-01) es un gap de auditoria documental — no un error de contenido ni de funcionalidad — y es consistente con el patron deliberado establecido en Phases 22 y 23.

---

_Verificado: 2026-06-08T14:00:00Z_
_Verificador: Claude (gsd-verifier)_
