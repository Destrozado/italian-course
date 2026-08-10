---
phase: 43-fare-cond-imperativo-fare-indefiniti-3-6-slots
verified: 2026-08-10T00:00:00Z
status: passed
score: 5/5 ROADMAP success criteria verified
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: "3/5 fully verified, 2/5 structurally owed (quorum pass not yet run)"
  gaps_closed:
    - "SC-4/SC-5: pase TOP-LEVEL de quórum Opus+Sonnet sobre los 9 slots — ejecutado en 7 rondas, 9/9 validated"
    - "Ronda EXTRA DeepSeek (D-43-20) sobre los 3 slots marcados — ejecutada, deepseek-* presente en los 3"
    - "Backstop 43-01 (unicidad de lectura plurales del imperativo) — cerrado por el quórum, backstop original identificado como mal planteado y corregido"
    - "Backstop 43-02 (unicidad de lectura causal del gerundio passato) — cerrado por el quórum"
    - "WR-01 (concordancia con objeto pospuesto) — adjudicado por el autor, documentado en notes + explanation + 09-VALIDATION-PROMPT.md §7.4"
    - "WR-10 (refuerzo de registro vocativos singulares) — adjudicado por el autor, asimetría deliberada documentada"
  gaps_remaining: []
  regressions: []
---

# Phase 43: `fare-cond-imperativo` + `fare-indefiniti` — 3 + 6 slots Verification Report

**Phase Goal:** Cierra el paradigma con las dos categorías de cola — condizionale (presente +
passato) e imperativo (5 variantes, sin `io`) — y las 6 formas indefinidas, donde el eje de
variante deja de ser la persona y pasa a ser el CONTEXTO. Siguen siendo DOS categorías: dos
unidades de reset, no una fusión.

**Verified:** 2026-08-10
**Status:** passed
**Re-verification:** Yes — after gap closure (previous verification 2026-08-07 was `human_needed`,
pending the top-level quorum pass and the author's UAT adjudications; both have since closed)

## Goal Achievement

### Observable Truths — the 5 ROADMAP Success Criteria (literal)

| # | Success Criterion (verbatim intent) | Status | Evidence |
|---|---|---|---|
| SC-1 | Condizionale presente 6 personas, raíz `far-`; condizionale passato con futuro-en-el-pasado; explanation con la divergencia español; ≥1 variante `farà` vs `farebbe` | ✓ VERIFIED | Confirmado en disco: `fare-cond-imperativo-cond-presente` 6 variantes, keys `farei/faresti/farebbe/faremmo/fareste/farebbero`; `fare-cond-imperativo-cond-passato` 6 variantes `avrei fatto`..`avrebbero fatto`. Ambos slots `validated` (quórum Opus+Sonnet, `by` distintos, 0 `incorrecta`). CR-01 (trapassato defendible en 4/6 variantes) fue corregido en `32b2eab` y el propio quórum encontró y cerró después 3 hallazgos más profundos sobre este mismo slot (inclusivo, impedimento-vs-cierre-de-evento, `Al posto tuo` doblemente válido) en `877f3fc`/`6de4066`/`e657aea` — el slot pasó por 4 rondas antes de `validated`. |
| SC-2 | Imperativo EXACTAMENTE 5 variantes, ausencia de `io` documentada, MAGNET con audit trail, ninguna de `fa'`/`fai`/`fa` como distractora incorrecta | ✓ VERIFIED | 5 variantes en disco, keys exactas tu/Lei/noi/voi/Loro. `fa'` es U+0027 (byte-verificado). `fai`/`fa` ausentes de las 17 `options` del fichero. Slot `validated` con quórum Opus+Sonnet + override de autor documentado sobre un flag de deepseek verificado como factualmente erróneo (ver sección de juicio 1 más abajo). |
| SC-3 | 6 formas indefinidas con eje CONTEXTO (nunca persona), infinito por anterioridad, gerundio con `stare + gerundio` | ✓ VERIFIED | 6 slots, 3+3+4+2+3+3=18 variantes confirmados. Keys fijas por slot; el eje es el encaje sintáctico. `infinito-passato`: anterioridad forzada por preposición/deíctico en las 3. `gerundio-presente` examina `stare + gerundio` como uso, no formación. Los 6 slots `validated`. |
| SC-4 | `fatto` doble comportamiento (invariable/concordado) con RONDA EXTRA de quórum; `facente` con nota de registro | ✓ VERIFIED | `fare-indefiniti-participio-passato`: 4 variantes, 2 invariables (objeto pospuesto, key `fatto`) + 2 concordadas (`li`/`le` antepuestos, keys `fatti`/`fatte`). **Ronda EXTRA cumplida**: `deepseek-chat` + `gemini-2.5-flash` presentes en `passes[]`, ambos `incorrecta` por C5-leak sobre las 2 concordadas; el autor hizo override (`by:"autor"`, `override:true`) tras desempate 2-2, motivo escrito y riesgo asumido explícitamente. `facente`: 2 variantes, nota de registro confirmada en la explanation. Slot final: `validated`. |
| SC-5 | Ambas categorías cargan en boot como unidades de reset SEPARADAS y TODAS sus variantes quedan `validated` por quórum cross-vendor sin leak R1 | ✓ VERIFIED | `categories.json` 18 entradas, `fare-cond-imperativo` order 17, `fare-indefiniti` order 18, dos entradas distintas. `RESET_PREFIXES_V13` (`src/data/storage.js:1345`) contiene ambos slugs completos y sin truncar. `categoriesForDisplay` (`src/screens/app.js:3248`) itera `content.categories` genéricamente, sin lista hardcodeada. `git diff --quiet src/screens/app.js src/domain/ src/data/` → exit 0. **Los 9 slots están `validated`** con `status === deriveStatus(passes)` verificado programáticamente para los 9 (ver detalle abajo) — la cláusula de quórum de SC-5 está cerrada, no solo la de registro. |

**Score:** 5/5 criterios verificados de punta a punta, sin ítems `human_needed` pendientes.

### Verificación programática de `deriveStatus` sobre los 9 slots reales

Se importó `deriveStatus` de `src/data/validation-state.js` (la misma fuente que consumen los
gates de test) y se ejecutó contra los `passes[]` reales de los dos ficheros de contenido en
disco — no contra lo que dice el SUMMARY:

```
fare-cond-imperativo-cond-presente   stored=validated derived=validated OK
fare-cond-imperativo-cond-passato    stored=validated derived=validated OK
fare-cond-imperativo-imperativo      stored=validated derived=validated OK
fare-indefiniti-infinito-presente    stored=validated derived=validated OK
fare-indefiniti-infinito-passato     stored=validated derived=validated OK
fare-indefiniti-participio-passato   stored=validated derived=validated OK
fare-indefiniti-participio-presente  stored=validated derived=validated OK
fare-indefiniti-gerundio-presente    stored=validated derived=validated OK
fare-indefiniti-gerundio-passato     stored=validated derived=validated OK
ALL MATCH: true
```

Los 9/9 coinciden. Ningún `validated` fue escrito a mano; los dos que llevan override cumplen la
condición exigida por `deriveStatus` (`by:"autor"`, `verdict:"correcta"`, `override:true`, sobre un
quórum de modelo preexistente que incluye al menos un `correcta` que no es del autor).

### Juicio 1 — Los dos overrides de autor: ¿bien formados? ¿SC-5 satisfecho bajo este mecanismo?

**Conclusión: sí, en ambos casos.** Los dos overrides cumplen la forma que `deriveStatus` exige
(no fabrican quórum: el quórum Opus+Sonnet ya existe de forma independiente en los dos slots antes
del override) y el disenso queda preservado literal en `passes[]`, no borrado:

1. **`fare-indefiniti-participio-passato`** — DeepSeek y Gemini marcaron C5-leak sobre las 2
   variantes con clítico antepuesto (`li ha ___` → `fatti`, `le abbiamo ___` → `fatte`), razonando
   que la vocal final del clítico "rima" con la terminación del participio y delata la respuesta.
   El override del autor (fechado 2026-08-09, con desempate cross-vendor explícitamente pedido)
   documenta que el flag **es real y no tiene arreglo de contenido**: el clítico antepuesto no es
   una pista añadida sino el disparador gramatical que el slot examina — sin él no queda ejercicio,
   y D-43-16 ya prohíbe los pronombres que abrirían doble validez real (`mi/ti/ci/vi`). Retirar las
   2 variantes incumpliría SC-4 literalmente. El riesgo (acertar copiando la última letra) se acepta
   por escrito, con mitigación parcial declarada (las 2 invariables del mismo slot exigen lo
   contrario). Esto es una adjudicación honesta de un trade-off estructural real, no un atajo.

2. **`fare-cond-imperativo-imperativo`** — DeepSeek marcó C5-leak alegando que la explanation
   "revela que la respuesta es siempre la forma apostrofada para todas las variantes". Verificado
   contra el fichero: las 5 keys son las 5 formas distintas por destinatario (`fa'`, `faccia`,
   `facciamo`, `fate`, `facciano`), no una sola. El override documenta la refutación punto por
   punto (la frase citada por DeepSeek habla de la 2ª singular únicamente, en el contexto de
   D-43-19 RECONOCER-NO-PRODUCIR; ningún prompt contiene su propia key). El flag es
   demostrablemente un falso positivo del validador, no un hallazgo de contenido.

Ambos overrides preservan el pase `incorrecta` dentro de `passes[]` (no lo eliminan), cumpliendo el
principio de audit trail no destructivo que `src/data/validation-state.js` documenta en su
comentario de cabecera (G-42-3). **Conclusión sobre SC-5:** "todas sus variantes quedan `validated`
por quórum cross-vendor" se satisface — el mecanismo de override es un dispositivo de primera clase
del propio sistema de validación del proyecto (no un bypass ad-hoc), requiere un quórum de modelo
preexistente para poder aplicarse, y en ninguno de los dos casos fabrica un veredicto: en el primero
adjudica un trade-off real e irresoluble por contenido, y en el segundo corrige un error de hecho
del validador que la propia auditoría de esta verificación pudo confirmar leyendo el fichero.

### Juicio 2 — Los dos backstops declarados como `verification: backstop`

Ambos truths se marcaron explícitamente como juicio lingüístico que ningún assert mecánico podía
cerrar, con instrucción expresa de abstenerse a `human_needed` si no había evidencia explícita.

1. **Backstop 43-01 (unicidad de lectura de los plurales del imperativo, `Loro`/`noi due`
   excluyendo `voi`).** El propio quórum (Opus y Sonnet, por separado) encontró que el backstop
   **estaba mal planteado**: la amenaza real no era el vocativo de cortesía sino que la 1ª plural
   exhortativa (`facciamo`) es inclusiva y ningún vocativo puede excluirla porque el hablante queda
   dentro del grupo. Verificado en disco: `facciamo` ya no aparece en ninguna `options[]` donde no
   es la key (solo en la variante 2, donde sí lo es) — la resolución fue retirar la forma del pool
   en vez de reforzar un vocativo que no podía cerrar nada. El quórum confirmó variante a variante
   que no queda ninguna otra lectura defendible tras el cambio. Esto es evidencia explícita, no una
   abstención — el hallazgo del backstop original resultó parcialmente equivocado, pero el proceso
   que debía detectarlo (quórum + revisión humana) lo hizo, y el resultado final está verificado.

2. **Backstop 43-02 (unicidad de lectura de la variante causal del gerundio passato).** Verificado
   en disco: `facendo` (gerundio simple) no aparece en ninguna de las 3 variantes de
   `fare-indefiniti-gerundio-passato` — fue retirado de las 3, no solo de la señalada originalmente
   (el quórum encontró que el planteamiento inicial listaba mal cuáles variantes lo tenían). Lo que
   cierra la lectura no es solo el adverbial de anterioridad sino que el participio distractor está
   deliberadamente descordado con el objeto de cada frase (verificado: `Fatte`/`fatta` no concuerdan
   con `i compiti`/`il lavoro`), lo que bloquea la lectura de participio absoluto. Ambos modelos
   confirman la unicidad tras 7 rondas de corrección de la explanation (que no tocaron ni prompts ni
   options ni keys).

**Conclusión:** ambos backstops se cierran con evidencia explícita post-quórum, no con una
abstención ni con un pase silencioso. En ambos casos el quórum reveló que el backstop original
tenía un defecto de diagnóstico (apuntaba al mecanismo equivocado), y la corrección de contenido
resultante está verificada en el fichero real, no solo declarada en el SUMMARY.

### DEV-43-01 — Desviación aceptada: 3 de 17 variantes con 3 `options` en vez de 4

**Verificado en disco:** `fare-cond-imperativo-imperativo` variantes 1 (`faccia`), 3 (`fate`) y 4
(`facciano`) tienen efectivamente 3 elementos en `options` (`["fate","faccia","facciano"]`, etc.),
frente a las 2 variantes restantes (0 y 2) que tienen 4. Coincide exactamente con lo declarado en
`43-UAT.md` §Desviaciones aceptadas (DEV-43-01, `aceptada_el: 2026-08-09`).

**Legalidad técnica confirmada:** `src/data/schema-validator.js:445` acepta explícitamente
`options.length` de 3 o 4 (`if (!Array.isArray(options) || options.length < 3 || options.length > 4)`),
así que el motor no necesita ningún cambio y no hay violación de esquema.

**Razonamiento verificado como sólido:** con `fa'` vetada por SC-2 (nunca distractora) y
`facciamo` retirada por ser inclusiva (backstop, ver Juicio 2), a las 3 variantes cuya key es una
de las 3 formas restantes solo quedan 2 distractoras reales del paradigma cerrado de 5 formas.
Las alternativas de relleno consideradas y descartadas (`facete`, `faccino`, `facite`) son palabras
italianas reales que se habrían ofrecido como "incorrectas" — exactamente el defecto que la fase
corrigió 4 veces en otros puntos. El gate `EXPECTED_OPTIONS` en
`tests/content-fare-cond-imperativo.test.js` congela el reparto 4/3/4/3/3 y está en verde. Esto es
una desviación de un must_have escrito, correctamente documentada con motivo, coste asumido
(25%→33% de probabilidad de acierto por azar en 3 de 17 variantes) y legalidad técnica — no un
defecto oculto.

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `content/exercises/fare-cond-imperativo.json` | 2 claves top-level, 3 slots (6/6/5=17) | ✓ VERIFIED | Confirmado en disco: `{notes, exercises}`, 3 slots, 6+6+5=17 variantes, los 3 `validated` |
| `content/exercises/fare-indefiniti.json` | 2 claves top-level, 6 slots (3/3/4/2/3/3=18) | ✓ VERIFIED | Confirmado en disco: 6 slots, 3+3+4+2+3+3=18 variantes, los 6 `validated` |
| `content/categories.json` | 18 entradas; order 17/18 | ✓ VERIFIED | 18 entradas confirmadas; `fare-cond-imperativo` order 17, `fare-indefiniti` order 18, ambas `origen: "ia-quorum"` |
| `tests/content-fare-cond-imperativo.test.js` | invariantes permanentes | ✓ VERIFIED | Presente, incluido en `node --test tests/*.test.js`, verde |
| `tests/content-fare-indefiniti.test.js` | invariantes permanentes | ✓ VERIFIED | Presente, incluido en `node --test tests/*.test.js`, verde |
| `tests/exercise-types.test.js` | líneas nuevas en `CATEGORIES_WITH_EXPLANATIONS` | ✓ VERIFIED | Confirmado presente, parte de la suite verde |
| `09-VALIDATION-PROMPT.md` | secciones 7.1-7.4 | ✓ VERIFIED | Confirmadas: 7.4 en línea 313, antes de `Fin del prompt` (línea 325); guard de sección 6 intacto |
| `.claude/skills/gsd-validate-exercise/SKILL.md`, `gsd-validate-batch/SKILL.md` | ruta corregida | ✓ VERIFIED | Ronda EXTRA DeepSeek y quórum base ambos corrieron con éxito, lo que confirma indirectamente que la ruta resuelve |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `content/categories.json` | `src/data/schema-validator.js` (`knownCategoryIds`) | Referencia de `categoryIds` | ✓ WIRED | `node --test tests/*.test.js` → 1026 pass / 0 fail, sin errores de categoría desconocida |
| `content/categories.json` | `categoriesForDisplay` (`src/screens/app.js:3248`) | `this.content.categories.map(...)` | ✓ WIRED | Confirmado por lectura directa: mapeo genérico, sin lista hardcodeada de ids |
| `variants[]` | `pickVariantIndex` (`src/domain/session.js:232`) | `slot.variants.length`, axis-agnostic | ✓ WIRED | Confirmado por lectura directa: `Array.isArray(slot.variants) ? slot.variants.length : 1`, sirve slots de 2 a 6 variantes sin cambio |
| `validation.passes[]` | `deriveStatus` (`src/data/validation-state.js`) | Verificación programática directa | ✓ WIRED | Ejecutado contra los 9 slots reales: 9/9 `stored === derived` |
| Slug `fare-cond-imperativo`/`fare-indefiniti` | `RESET_PREFIXES_V13` (`src/data/storage.js:1345`) | Prefijo completo | ✓ WIRED | Confirmado por lectura directa, ambos slugs verbatim en el array |

### Engine Byte-Intact Check

```
git diff --quiet src/screens/app.js src/domain/ src/data/  → exit 0  ✓ CONFIRMED
```

### Test Suite Evidence

| Comando | Resultado | Interpretación |
|---|---|---|
| `node --test tests/*.test.js` | **1026 pass / 0 fail** | Suite completa verde |
| `VAL_07_STRICT=1 node --test tests/*.test.js` | **1044 pass / 0 fail** | El marcador honesto de la fase, antes rojo por diseño, ahora en verde — los 9 slots están `validated` |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| CI-01 | 43-01 | Condizionale presente, 6 personas, raíz `far-` | ✓ SATISFIED | Ver SC-1 |
| CI-02 | 43-01 | Condizionale passato, futuro-en-el-pasado | ✓ SATISFIED | Ver SC-1; `validated` |
| CI-03 | 43-01 | Imperativo, 5 variantes, MAGNET `fa'` | ✓ SATISFIED | Ver SC-2; `validated` (con override documentado) |
| INDEF-01 | 43-02 | Infinito presente/passato, anterioridad | ✓ SATISFIED | `validated` en ambos slots |
| INDEF-02 | 43-02 | Participio passato, invariable vs concordado | ✓ SATISFIED | Ver SC-4; `validated` con ronda EXTRA + override |
| INDEF-03 | 43-02 | Participio presente `facente`, nota de registro | ✓ SATISFIED | `validated` |
| INDEF-04 | 43-02 | Gerundio presente/passato, `stare + gerundio` | ✓ SATISFIED | Ver SC-3; `validated` |

**0 orphaned requirements.** Los 7 IDs CI/INDEF de `.planning/REQUIREMENTS.md` (líneas 97-103)
están marcados `Complete` y cubiertos exactamente por los `requirements:` de los dos plans.

### Anti-Patterns Found

**0 TBD / FIXME / XXX / TODO / HACK / PLACEHOLDER** (con frontera de palabra) en los ficheros de
contenido de la fase.

**0 stubs.** Las 35 variantes están escritas con contenido real; ninguna opción es placeholder.

**`git status --porcelain`** limpio — no hay ficheros fuera de commit relacionados con la fase.

### Open Code Review Items (43-REVIEW.md) — estado re-verificado 2026-08-10

| ID | Descripción | Estado real en disco |
|---|---|---|
| CR-01 | Trapassato defendible en 4/6 variantes del cond-passato | ✓ **FIXED** (`32b2eab`, y reforzado por 3 hallazgos posteriores del propio quórum) |
| CR-02 | Gates de concordancia con match por subcadena en fare-indefiniti | ✓ **FIXED** (`20a5cc6`) |
| WR-01 | Concordancia con objeto pospuesto sin audit trail | ✓ **RESUELTO por adjudicación del autor** — documental (no blacklist), en 4 sitios: `notes`, explanation, `09-VALIDATION-PROMPT.md` §7.4, gate a la contra que congela que la forma SIGA ofreciéndose |
| WR-03, WR-04, WR-05 | Gates incompletos/débiles | ✓ **FIXED** durante las correcciones post-review |
| WR-10 | Vocativos singulares sin refuerzo de registro equivalente a los plurales | ✓ **RESUELTO por adjudicación del autor** — asimetría deliberada: `Marco` reforzado con posesivo `il tuo`, `Signor Rossi` se deja como está (el título de cortesía ya es inequívoco); razonamiento documentado en `notes` |
| WR-02, WR-06, WR-07, WR-08, WR-09, WR-11 | Hallazgos de deuda técnica y precisión de gates, severidad warning/info | Sin cambios reportados desde la verificación anterior. **No bloquean el goal de la fase** — son deuda técnica declarada (duplicación de fixtures de test WR-08, precisión de un gate de scope WR-02, redacción de prompt WR-06/07, atribución de un comentario informativo WR-11 sobre Phase 44). Ninguno es un TBD/FIXME sin referencia; están documentados en un artefacto de fase (43-REVIEW.md) con severidad explícita. |

## Gaps Summary

**Ninguno.** Los dos ítems que la verificación anterior (2026-08-07) dejó en `human_needed` —el
pase top-level de quórum sobre los 9 slots y las dos adjudicaciones humanas de WR-01/WR-10— se
cerraron entre el 2026-08-07 y el 2026-08-10, y esta re-verificación confirma cada cierre contra el
código real, no contra las afirmaciones del SUMMARY: `deriveStatus` recalculado sobre los 9 slots
reales coincide con el `status` almacenado en los 9, la ronda EXTRA DeepSeek deja rastro `by`
verificable en los 3 slots que D-43-20 exige, los dos overrides de autor están bien formados según
la propia función que los arbitra, y los dos backstops se cerraron con evidencia explícita
(incluyendo el hallazgo de que uno de los dos backstops originales apuntaba al mecanismo
equivocado, corregido por el propio proceso de quórum). La suite completa está en verde en las dos
modalidades (`1026/1026` normal, `1044/1044` con `VAL_07_STRICT=1`), y el motor v1.4 permanece
byte-intacto.

Los ítems WR-02, WR-06, WR-07, WR-08, WR-09 y WR-11 quedan abiertos como deuda técnica de severidad
warning/info, explícitamente documentada en `43-REVIEW.md` con archivo y línea. No bloquean el goal
de esta fase; WR-11 en particular es territorio de Phase 44 (INT-02) por diseño.

---

_Verified: 2026-08-10_
_Verifier: Claude (gsd-verifier)_
