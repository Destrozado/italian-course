# Phase 44: Integración lockstep + cierre v2.0 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-11
**Phase:** 44-Integración lockstep + cierre v2.0
**Areas discussed:** Reparto de los cruces (INT-03), Lista de cruces cerrada en 3, Sincronía de counts (INT-02), Cierre honesto (roadmap vs realidad)

---

## Reparto de los cruces (INT-03)

### ¿Cuántos slots de cruce y en qué fichero vive cada uno?

| Option | Description | Selected |
|--------|-------------|----------|
| 3 slots, alojados por contenido | ↔avere en `fare-indicativo`, ↔modali en `fare-indefiniti`, ↔presente-regolare en `fare-indicativo`. `fare-congiuntivo` y `fare-cond-imperativo` sin cruce. 247→250 slots | ✓ |
| 4 slots, uno por categoría `fare` | Los 3 anteriores + un 4º ↔avere en `fare-congiuntivo` (`abbia fatto`) o `fare-cond-imperativo` (`avrei fatto`), para que las 4 unidades de reset toquen alguna categoría ajena. 247→251 | |
| 6 slots, pares bidireccionales (Phase 31) | Por cada cruce, dos slots: key en la vecina y key en `fare` con la vecina de contexto. Patrón literal de `presente-regolare-300/302`. 247→253 | |

**User's choice:** 3 slots, alojados por contenido
**Notes:** Es lo que el roadmap fija literalmente y el mínimo de quórum. Se aceptó explícitamente que `fare-congiuntivo` y `fare-cond-imperativo` se queden sin cruce — la simetría no es razón suficiente para abrir un 4º.

### ¿En qué sentido apunta cada cruce — qué casilla se pregunta?

| Option | Description | Selected |
|--------|-------------|----------|
| La casilla VECINA; `fare` va de contexto | Key en `avere`/`modali`/`presente-regolare`, con la forma de `fare` escrita en el enunciado. Inversión de `presente-regolare-302/303`. Cero solape con los 22 slots | ✓ |
| La casilla de `fare`; la vecina de contexto | Sentido literal del roadmap. Más directo de autorar, pero repite `passato-prossimo`, `presente` e `infinito-presente` | |
| Mixto: cada cruce elige su sentido | ↔avere y ↔modali a la vecina, ↔presente-regolare a `fare` enmarcado por un regular | |

**User's choice:** La casilla VECINA; `fare` va de contexto
**Notes:** Decidido tras presentarle el hallazgo del scout: `Io devo ___ il letto` → `fare` **ya existe byte a byte** en `fare-indefiniti-infinito-presente` (variante 3, metida por D-43-12), `fare-indicativo-passato-prossimo` ya lleva `sono fatto` como distractora, y `fare-indicativo-presente` ya examina `faccio` con regularizadas inventadas. El sentido literal habría producido duplicados.

### ¿Cuántas variantes lleva cada slot de cruce?

| Option | Description | Selected |
|--------|-------------|----------|
| 3 por cruce = 9 variantes | Media del proyecto (`modali-300` 3, `presente-regolare-300` 3). Eje = persona, 3 personas por slot | ✓ |
| 2 por cruce = 6 variantes | Mínimo del motor. Precedente `riflessivi-300`, `possessivi-300/301`, `dimostrativi-300` | |
| 6 por cruce = 18 variantes | Paradigma completo de persona, coherente con los slots del milestone. Triplica el quórum | |

**User's choice:** 3 por cruce = 9 variantes nuevas
**Notes:** Los cruces son bisagra, no bloque de paradigma — el paradigma ya lo cubren los 22 slots.

### ¿Qué red de quórum llevan los 3 cruces?

| Option | Description | Selected |
|--------|-------------|----------|
| Quórum base + gates declarados antes de escribir | Opus+Sonnet top-level 1-por-1 (VAL-03), sin ronda extra. El riesgo se cierra con gates HARD en `notes` (patrón D-42-06 / D-43-16) | ✓ |
| Base + ronda extra DeepSeek en los 3 | Pase DeepSeek obligatorio sobre las 9 variantes vía `scripts/validate-ai-pass.mjs` | |
| Base + ronda extra solo en ↔presente-regolare | El cruce con más superficie de doble validez | |

**User's choice:** Quórum base + gates declarados antes de escribir
**Notes:** Consistente con el principio del proyecto — «gate declarado ANTES de escribir, quórum como red y no como mecanismo». Cerró el área con los 3 gates G1/G2/G3 propuestos (invariabilidad de `fatto` sin `lo/la/li/le`; sujeto explícito + un solo verbo regular candidato; marco que excluye 2 de los 3 modales) aceptados tal cual.

---

## Lista de cruces cerrada en 3

### El contraste imperativo ↔ congiuntivo que D-43-06 dejó diferido: ¿entra como 4º cruce?

| Option | Description | Selected |
|--------|-------------|----------|
| No entra — lista cerrada en 3 | El argumento de D-43-06 sigue vigente: `faccia`/`facciamo`/`facciano` son key de congiuntivo Y forma real del imperativo formal → doble validez → `disputed` sticky → reset de categoría | ✓ |
| Sí, entra como 4º cruce con marco blindado | `fare-cond-imperativo-300`; da cruce a las dos categorías que se quedan sin él. Exige gate HARD de marco + ronda extra | |
| Sí, pero solo en la explanation | Sin slot nuevo; refuerzo de la explanation del imperativo. Coste cero, pero el autor nunca lo re-verifica | |

**User's choice:** No entra — lista cerrada en 3
**Notes:** Segunda vez que se descarta (la primera fue D-43-06). Se queda en `Deferred` como candidato v2.1+. Se hizo notar que la opción «solo en la explanation» era vacua: D-43-06 ya hizo que la explanation del imperativo enseñe la homografía.

---

## Sincronía de counts (INT-02)

### ¿Cómo se cierra INT-02 — solo el append, o además se mata la clase de bug?

| Option | Description | Selected |
|--------|-------------|----------|
| Append de 4 + gate anti-ceguera | +4 entradas con `expected` dinámico, más un test que lee `content/categories.json` y falla si una categoría registrada no aparece en los arrays de conteo | ✓ |
| Solo el append de 4 (espejo literal de Phase 39) | Lo mínimo que pide el roadmap. Cero infra nueva | |
| Derivar los arrays de `categories.json` | Con tabla de overrides para los 9 `expected` literales. Mata la ceguera de raíz pero cambia el diseño de la infra de tests | |

**User's choice:** Append de 4 + gate anti-ceguera
**Notes:** Decidido tras señalar que solo faltan **2** arrays (no los 3 del roadmap — `CATEGORIES_WITH_EXPLANATIONS` y el smoke los engancharon 41/42/43), que `TOTAL_EXPECTED` y el baseline-guard ya son derivados, y que el reporter lleva **tres fases** emitiendo `225/225 PASS` estando ciego a 22 slots. Se rechazó derivar todo porque los 9 `expected` literales sí muerden hoy (protegen contra ejercicios borrados/duplicados) y derivarlos los convertiría en tautología.

### Si el gate anti-ceguera entra: ¿dónde vive y qué rompe?

| Option | Description | Selected |
|--------|-------------|----------|
| En la suite de tests, siempre activo | Corre en cada `node --test tests/*.test.js`, sin flag. Es donde el proyecto pone sus invariantes permanentes | ✓ |
| En el reporter, con `exit 1` | Junto al guard de coherencia de `TOTAL_EXPECTED`. Vive donde vive la mentira, pero el reporter es un gesto manual | |
| En los dos sitios | Redundancia deliberada | |

**User's choice:** En la suite de tests, siempre activo
**Notes:** Se le informó de la restricción descubierta en el scout: los dos arrays **no son importables** (`REAL_CATEGORIES` es un `const` dentro del callback de un `describe`; el `.mjs` del reporter hace `process.exit(1)` al cargarse), así que el gate irá por **source-assert**, el patrón que el proyecto ya usa para `app.js`.

---

## Cierre honesto: roadmap vs realidad

### El roadmap y REQUIREMENTS van desfasados de la realidad. ¿Qué se hace con eso?

| Option | Description | Selected |
|--------|-------------|----------|
| Corregir los documentos como parte de la fase | ROADMAP §Phase 44 SC#2/SC#4 e INT-02/INT-04 se editan para describir lo real: 22 slots, 113 variantes, `TOTAL_EXPECTED` 250, 4 magnets | ✓ |
| Documentar la divergencia en VERIFICATION.md | Texto histórico intacto; la verificación declara cada desfase con su causa | |
| Corregir solo los números; los magnets en VERIFICATION | Los conteos son gates por grep; el 4º magnet se declara sin reescribir INT-04 | |

**User's choice:** Corregir los documentos como parte de la fase
**Notes:** D-43-17 lo dejó escrito literalmente («Phase 44 tiene que recogerlo, o su SC#4 quedará describiendo un estado que no es el real»). Se le advirtió del aviso de proceso: `ROADMAP.md` va por el skill `gsd-phase` (anti-pattern #15 de GSD), `REQUIREMENTS.md` sí es edición directa. También se detectó que INT-03 escribe `verbi-modali` cuando el slug real es `modali`.

### SC#3 pide que `git diff src/screens/app.js src/domain/` quede vacío. ¿Vacío contra qué referencia?

| Option | Description | Selected |
|--------|-------------|----------|
| Contra el arranque del milestone v2.0 | Diff contra el commit base de v2.0. Un diff contra `HEAD~1` sale vacío siempre y sería un gate vacuo | ✓ |
| Contra el estado al empezar Phase 44 | Demuestra que la fase no tocó el motor, pero no dice nada de las Phases 40-43 | |
| Las dos referencias, con la de v2.0 como bloqueante | Gate rápido por plan + gate de milestone bloqueante | |

**User's choice:** Contra el arranque del milestone v2.0
**Notes:** Base resuelta y gate verificado en vivo durante la discusión: `0a9a2e5` («docs: create milestone v2.0 roadmap (5 phases)», padre de `639156f`). `git diff 0a9a2e5..HEAD -- src/screens/app.js src/domain/` → **vacío**; `grep -c` → **2**. Se detectó y documentó la trampa: contra esa base `src/data/` **no** sale vacío (Phase 40 metió `migrate12to13` en `storage.js`, Phase 42 amplió `validation-state.js`), y el `notes` de Phase 43 dice «`git diff … src/data/` vacío» — cierto por fase, falso por milestone.

### ¿Cómo se reparten los plans y en qué orden?

| Option | Description | Selected |
|--------|-------------|----------|
| 2 plans: counts+docs primero, cruces después | 44-01 mecánico → reporter 247/247 PASS honesto; 44-02 cruces `pending` → reporter 247/250 rojo honesto; luego quórum top-level y gate de cierre | ✓ |
| 2 plans: cruces primero, counts después | Argumento literal del roadmap, pero deja al reporter mintiendo 225/225 durante todo el primer plan | |
| 1 plan único | Granularidad `coarse` y volumen pequeño, pero mezcla trabajo mecánico con autoría de contenido | |

**User's choice:** 2 plans: counts+docs primero, cruces después
**Notes:** El orden se eligió por honestidad del marcador. El argumento del roadmap («los counts solo pueden derivarse cuando los JSON son definitivos») no aplica porque los `expected` son dinámicos y siguen al disco solos.

---

## Claude's Discretion

- Redacción concreta de las 9 variantes y las 3 explanations, dentro de D-44-02 y los gates G1-G3.
- Qué 3 personas muestrea cada cruce y qué objeto literal del conjunto cerrado lleva cada frase.
- Qué verbo regular examina `fare-indicativo-301` y qué complemento excluye dos de los tres modales en `fare-indefiniti-300`.
- Qué compuesto enmarca `fare-indicativo-300` (cualquiera con `fatto` invariable).
- Ubicación exacta del gate anti-ceguera (fichero propio vs `describe` existente) y la forma del regex del source-assert.
- Nombres y estructura de los gates de test de los 3 cruces.
- Cómo se redacta el append al `notes` de los dos ficheros.
- Si el gate de cierre corre dentro de 44-02 o como paso de verificación de fase.

## Deferred Ideas

- Cruce imperativo ↔ congiuntivo (`fare-cond-imperativo-300`) — descartado por segunda vez; candidato v2.1+.
- Cruces para `fare-congiuntivo` y `fare-cond-imperativo` — sin cruce por decisión.
- Pares bidireccionales estilo Phase 31 (`-302`/`-303`) — descartados por solape.
- Derivar los arrays de conteo de `categories.json` con overrides — descartado por superficie.
- Unificar las tres implementaciones gemelas de `slotCountOf`.
- Actualizar el string obsoleto del reporter («si OK: `/gsd:complete-milestone v1.1`») — cosmético.
- `PROV-X1` (procedencia por-slot), discrepancias VAL-06 preexistentes, partir `fare-indicativo`, `andare`/`venire`/`dire`, perífrasis de `fare`, responsive móvil — todos con backlog propio.
