# 24-REAGRUPACION-MAP.md — Verbi di movimento → slot+variantes (mapa de auditoría)

**Fase:** 24-verbi-di-movimento-a-slots-contenido · **Plan:** 24-01 · **Task 1 (artefacto de auditoría)**
**Estado:** PROPUESTO — pendiente de aprobación del autor en el checkpoint:decision.
**Patrón replicado:** 23-01 (Essere) + 22-01 (Avere) + 19-01/20-01 (Articoli/Partitivi), con el **eje organizador propio** de esta categoría (REGLA DE AUXILIAR) y **DOS divergencias deliberadas** respecto a Essere (concordancia en 1 SOLO slot, no 4; sin cruces multi-cat) + la **divergencia heredada vs Avere** (sin snapshot D-88).
**Decisiones aplicadas:** D-24-01 (reagrupar por REGLA DE AUXILIAR, NO por persona ni por verbo), D-24-02 (movimiento→essere = pocos slots; personas/verbos = variantes intercambiables), D-24-03 (concordancia en UN solo slot — DIVERGENCIA DELIBERADA vs Essere D-23-03), D-24-04 (excepciones→avere en un slot + correre en slot PROPIO), D-24-07/D-159 (explanations sin refs a la CATEGORÍA Essere por id ni prosa), D-24-08 (shape sin payload), D-24-09 (ids TODOS semánticos — sin cruces → sin rango reservado), D-24-10/D-17-05 (merge elegir-la-más-completa + injertar matices), D-24-11 (mover superficies intactas = no re-validar; passes[] verbatim, incluidos disputed→override 011/024/026), D-24-12 (word-buttons slots-de-1; Verbi di movimento NO tiene match — no se inventa), D-24-14 (SIN snapshot APPEND-ONLY — avere-only).

---

## Resumen de cobertura

37 ids fuente → **7 slots** (recomendado). Cada id 001-034, 100-102 aparece exactamente UNA vez como id-fuente. Sin slots nuevos ni variantes nuevas (eso es 24-02).

**Conteo de slots de esta reagrupación: 7** (1 movimiento→essere + 1 concordanza + 1 excepcioni→avere + 1 correre + 3 word-buttons).

| Bloque | Slots | ids-fuente | type |
|--------|-------|-----------|------|
| Selección del auxiliar essere (D-24-01/02) | 1 | 001, 002, 003, 004, 005, 006, 011, 013, 015, 024, 026, 027, 032, 033 | multiple-choice |
| Concordancia del participio — **UN solo slot** (D-24-03) | 1 | 007, 008, 009, 010, 012, 014, 016, 023, 025, 028, 029, 034 | multiple-choice |
| Excepciones → avere (D-24-04) | 1 | 017, 018, 019, 020, 030, 031 | multiple-choice |
| correre — slot PROPIO (D-24-04) | 1 | 021, 022 | multiple-choice |
| Word-buttons (D-24-12) | 3 | 100, 101, 102 | word-buttons |
| **TOTAL** | **7** | **37 ids** | |

> **Conteo MUY por debajo de Essere (25→26) y Avere (19→20)** — coherente con la categoría: D-24-01 prohíbe el slot-por-persona (aquí es passato prossimo, no presente indicativo), D-24-03 agrupa la concordancia en 1 slot (no 4), y NO hay cruces multi-cat 300..305 (Essere/Avere tenían 6 cada uno). El eje "decisión del auxiliar" produce pocos slots densos. El conteo final que sincroniza 24-03 se LEE de `data.exercises.length` real tras 24-02 (las variantes nuevas no suben el count; los slots NUEVOS de huecos D-24-06 sí). Predicción rough CONTEXT ~16-22 era el espejo lineal de Avere/Essere; esta reagrupación da **7** porque las dos divergencias (1 slot de concordancia + sin slot-por-persona) + sin cruces colapsan mucho el count. **Reportado para que 24-03 no use la predicción rough sino el real.**

---

## Tabla detallada por slot

Leyenda columnas: slot-id propuesto · regla/uso · ids-fuente (→variantes) · type · categoryIds · explanation-base + matices a injertar (D-24-10) · ¿celda pobre candidata a 24-02?

### Bloque 1 — Selección del auxiliar essere (1 slot, D-24-01/02)

La trampa A1 propia de la categoría: elegir el auxiliar **essere** (no avere) para los verbos de movimiento en passato prossimo. Las distintas personas/verbos son **VARIANTES INTERCAMBIABLES** del mismo slot (la decisión ho/sono es la misma regla; el examen elige 1 al azar → mata la memorización por palabra). Todas las superficies incluidas son las que piden **ELEGIR EL AUXILIAR** (options = formas de essere/avere; correctIndex apunta a essere). Distractoras avere (ho/hai/ha/abbiamo/avete/hanno) PRESERVADAS — son el contraste que entrena la regla (verificado en cada id). `categoryIds: ["verbos-movimiento"]`.

| slot-id | regla/uso | ids-fuente (verificado options = formas essere/avere) | type | explanation-base + matices | celda pobre? |
|---------|-----------|-------------------------------------------------------|------|----------------------------|--------------|
| `verbos-movimiento-essere` | selección del auxiliar essere para verbos de movimiento (andare/venire/partire/tornare/uscire/entrare en distintas personas) | 001 (io sono andato, opt ho/sono/ha/è), 002 (tu sei venuto, opt hai/sei/è/siamo), 003 (lui è partito, opt ha/è/siamo/hanno), 004 (noi siamo tornati, opt abbiamo/siamo/siete/sono), 005 (voi siete entrati, opt avete/siete/siamo/sono), 006 (loro sono usciti, opt hanno/sono/siete/abbiamo), 011 (Maria è andata — elige AUX, opt ha/è/hanno/sono), 013 (I ragazzi sono usciti — elige AUX, opt hanno/sono/siamo/è), 015 (Io donna sono tornata — elige AUX, opt ho/sono/è/siamo), 024 (Anna è venuta — elige AUX, opt ha/è/hanno/siamo), 026 (Le mie amiche sono partite — elige AUX, opt hanno/sono/siete/abbiamo), 027 (io sono venuto, opt ho/sono/è/siamo), 032 (discriminación verbo+aux: è andato vs camminato/ballato/nuotato), 033 (loro sono usciti, opt hanno/sono/abbiamo/siete) → **14 vars** | MC | **base = 001** (la más completa y rule-first: lidera con la regla del auxiliar essere para verbos de movimiento + el **anti-calco "io ho andato"** como hilo conductor, "uno de los errores A1 más persistentes; el reflejo correcto es essere con todos los verbos de movimiento"). **Injertar de 002:** la conjugación completa del auxiliar (sono/sei/è/siamo/siete/sono) se memoriza en bloque. **Injertar de 003:** la grafía `è` (acento grave) ≠ conjunción `e` (y). **Injertar de 006:** `sono` 3ª pl coincide con 1ª sing; el sujeto explícito desambigua. **Injertar de 032:** con essere ya dado, el verbo DEBE ser de movimiento con destino (descarta camminato/ballato/nuotato, que van con avere). Rule-first; cero refs a la CATEGORÍA Essere (D-24-07: "essere" = nombre del auxiliar, válido). | celda RICA (14 vars), pero **HUECO D-24-06 eje (a):** engordar con más verbos essere (scendere/salire/cadere/rimanere-restare/diventare/nascere/morire) en 24-02 |

> **Reparto de los pares aux-vs-participio (011/012, 013/014, 015/016) — Claude's Discretion verificado contra las options reales:**
> - **011** options `["ha","è","hanno","sono"]` → formas de essere/avere → **elige AUXILIAR** → slot `essere`. Su par **012** options `["andato","andata","andati","andate"]` → terminaciones de participio → **elige PARTICIPIO** → slot `concordanza`.
> - **013** options `["hanno","sono","siamo","è"]` → formas de essere/avere → **elige AUXILIAR** → slot `essere`. Su par **014** options `["uscito","uscita","usciti","uscite"]` → terminaciones de participio → **elige PARTICIPIO** → slot `concordanza`.
> - **015** options `["ho","sono","è","siamo"]` → formas de essere/avere → **elige AUXILIAR** → slot `essere`. Su par **016** options `["tornato","tornata","tornati","tornate"]` → terminaciones de participio → **elige PARTICIPIO** → slot `concordanza`.
> Regla aplicada: si las options son formas de essere/avere → elige-auxiliar (slot `essere`); si son terminaciones -o/-a/-i/-e del participio → elige-participio (slot `concordanza`). Consistente con las 3 parejas.

> **Ubicación de 032 (discriminación verbo+auxiliar):** propuesta = al slot `verbos-movimiento-essere` (recomendación del planner, D-24 sección 5). Justificación: 032 ("Lui è ___ a casa di Maria" → andato, descarta camminato/ballato/nuotato) es una superficie de selección **guiada por el auxiliar essere ya dado** — refuerza el reflejo essere-con-destino. Las distractoras son verbos §4 (avere) que no encajan con `è`. **El autor confirma o lo mueve a un slot propio de discriminación en el checkpoint.**

> **Nota:** el id **026** (Le mie amiche partite) NO estaba en la lista candidata literal del plan/interfaces para el slot `essere`, pero sus options `["hanno","sono","siete","abbiamo"]` son formas de essere/avere → es una superficie de **elige-auxiliar** → se asigna a `verbos-movimiento-essere` por la regla del reparto (no a concordanza). Marcado explícitamente aquí para auditoría. (Su `validation` lleva disputed→override del autor — ver criterio de merge abajo.)

### Bloque 2 — Concordancia del participio — **UN SOLO slot (D-24-03, DIVERGENCIA DELIBERADA vs Essere)**

**DIVERGENCIA CRÍTICA #1 frente a Essere.** Essere partió el passato (stato/stata/stati/state) en **4 SLOTS SEPARADOS** (D-23-03). Verbi di movimento **AGRUPA** la concordancia del participio (andato/a/i/e y los demás participios) en **UN SOLO slot con las formas como variantes** (D-24-03). **Razón:** la concordancia del participio con essere **ya se drillea forma-por-forma en la categoría Essere**; duplicar ese drilling aquí restaría foco a la **regla propia de Verbi di movimento, que es la SELECCIÓN DEL AUXILIAR** (Bloque 1, donde se reserva el drilling fuerte). Aquí la concordancia se agrupa. Todas las superficies incluidas son las que piden **ELEGIR EL PARTICIPIO** (options = terminaciones -o/-a/-i/-e). `categoryIds: ["verbos-movimiento"]`. **NO separar en 4 slots.**

| slot-id | regla/uso | ids-fuente (verificado options = terminaciones de participio) | type | explanation-base + matices | celda pobre? |
|---------|-----------|---------------------------------------------------------------|------|----------------------------|--------------|
| `verbos-movimiento-concordanza` | concordancia género×número del participio con essere (andato/a/i/e y otros: uscito/a/i/e, tornato/a/i/e, entrato/a/i/e) | 007 (andata fem sg, Lei è ___), 008 (andato masc sg, Lui è ___), 009 (andati masc pl, Noi uomini), 010 (andate fem pl, Noi donne), 012 (andata — elige PART, par de 011), 014 (usciti — elige PART, par de 013), 016 (tornata — elige PART, par de 015), 023 (andate fem pl, Loro donne), 025 (entrati masc pl, Voi siete), 028 (uscito masc sg, Marco sei), 029 (tornati masc pl, I miei genitori), 034 (entrati masc pl, Marco e Luigi — sujeto compuesto) → **12 vars** | MC | **base = 008** (la más completa: enuncia la **matriz de 4 celdas** explícitamente "-o masc sing, -a fem sing, -i masc pl, -e fem pl" con essere). **Injertar de 007:** a diferencia del español donde el participio con haber es invariable, el italiano marca el género del sujeto en la terminación. **Injertar de 023:** las 4 terminaciones se aplican a TODOS los participios de verbos de movimiento, no solo a andare (la base usa varios verbos: uscire/tornare/entrare). **Injertar de 010:** `andate` (part fem pl) coincide visualmente con 2ª pl del presente `voi andate` — el auxiliar `siamo/sono` desambigua. **Injertar de 034:** sujeto compuesto (Marco e Luigi) → plural masc por defecto; basta un masculino en el grupo. Rule-first; varios verbos para completar la matriz (D-24-03); cero refs a la CATEGORÍA Essere (D-24-07). | celda RICA (12 vars); **HUECO D-24-06 eje (d):** matriz de concordancia completa con varios verbos (las 4 formas × varios verbos) en 24-02 |

### Bloque 3 — Excepciones → avere (1 slot, D-24-04)

Las excepciones que **SIEMPRE** piden avere: movimiento **sin destino concreto** (viaggiare/nuotare/camminare/ballare) → avere + **participio invariable**. Todas la misma regla → un slot con variantes intercambiables. Distractoras essere (siamo/sei/è/sono/siete) PRESERVADAS — son el contraste. `categoryIds: ["verbos-movimiento"]`.

| slot-id | regla/uso | ids-fuente | type | explanation-base + matices | celda pobre? |
|---------|-----------|-----------|------|----------------------------|--------------|
| `verbos-movimiento-excepcioni-avere` | excepciones de movimiento sin destino concreto → avere + participio invariable (viaggiare/nuotare/camminare/ballare) | 017 (viaggiare abbiamo), 018 (nuotare hai), 019 (camminato — elige participio invariable), 020 (ballato hanno), 030 (nuotato avete), 031 (camminato ha) → **6 vars** | MC | **base = 017** (la más completa: lidera con la regla "viaggiare es excepción dentro del grupo de movimiento; aunque implique movimiento, **no apunta a un destino concreto** → auxiliar avere, no essere" + "con avere el participio queda **invariable**, a diferencia de los verbos del grupo essere que sí concuerdan"). **Injertar de 019:** con avere el participio termina siempre en -o (camminato), sin marcar género ni número; las terminaciones -a/-i/-e solo aparecen tras essere (son trampas tras avere). **Injertar de 030:** el filtro mental siempre es "¿hay destino?", no "¿hay movimiento?" (la trampa es elegir essere por contagio). **Injertar de 020:** el grupo avere para actividades (ballare/nuotare/camminare/viaggiare) se memoriza en bloque. **Injertar de 031:** "per due ore" indica duración, no destino — ese complemento identifica las excepciones. Rule-first; cero refs a la CATEGORÍA Essere (D-24-07). | celda RICA (6 vars); **HUECO D-24-06 eje (b):** más excepciones avere (passeggiare/sciare/saltare/viaggiare en más personas) en 24-02 — **verificar que cada verbo toma realmente avere (no inventar excepciones)** |

### Bloque 4 — correre — slot PROPIO (1 slot, D-24-04)

**Slot PROPIO, separado de las excepciones puras.** Razón (D-24-04): correre **NO es una excepción fija** — alterna según haya destino (con destino → essere; sin destino → avere). Mezclarlo con las excepciones puras (que SIEMPRE piden avere) difuminaría dos reglas distintas. La explanation pregunta: **"¿hay un destino? Con destino, essere; sin destino, avere."** `categoryIds: ["verbos-movimiento"]`.

| slot-id | regla/uso | ids-fuente | type | explanation-base + matices | celda pobre? |
|---------|-----------|-----------|------|----------------------------|--------------|
| `verbos-movimiento-correre` | correre alterna auxiliar según destino (test de destino) | 021 (ho corso al parco — sin destino → AVERE, opt sono/ho/è/hanno), 022 (Marco è corso a casa — con destino → ESSERE, opt ha/è/hanno/avete) → **2 vars** | MC | **base = 021** (presenta el verbo especial que cambia de auxiliar según destino + el ejemplo sin destino "al parco per un'ora" → avere, y avisa de la frase complementaria con destino → essere; misma forma `corso`, distinto auxiliar). **Injertar de 022:** la **pregunta clave** explícita "¿hay un destino? Con destino, essere; sin destino, avere" (el caso con destino "a casa" → `è corso`). Las dos variantes son las dos caras del mismo contraste (021 sin destino / 022 con destino). Rule-first; cero refs a la CATEGORÍA Essere (D-24-07). | **HUECO D-24-06 eje (c):** más test-de-destino (correre/volare/saltare/salire/scendere con y sin destino) en 24-02 — **verificar el auxiliar real de cada verbo** |

### Bloque 5 — Word-buttons (3 slots-de-1, D-24-12)

No se fuerzan variantes (D-24-12). `categoryIds: ["verbos-movimiento"]`, explanation sube tal cual a top-level. **Verbi di movimento NO tiene match en el set legacy — no se inventa.** Apóstrofes ASCII preservados (`quest'anno` en 101).

| slot-id | sub-área | id-fuente | type | explanation |
|---------|----------|-----------|------|-------------|
| `verbos-movimiento-wb-andare` | "Ella ha ido al cine" → essere + concordancia fem (Lei è andata al cinema) | 100 → 1 var | word-buttons | sube tal cual (100); dos piezas: auxiliar essere (`è`, no `ha`) + participio fem (`andata`, no `andato`); distractoras `ha`/`andato` |
| `verbos-movimiento-wb-viaggiare` | "Nosotros hemos viajado mucho" → excepción avere + participio invariable (Noi abbiamo viaggiato) | 101 → 1 var | word-buttons | sube tal cual (101); excepción §4 viaggiare → avere; participio invariable `viaggiato` (no `viaggiati`); distractoras `siamo`/`viaggiati`; token `quest'anno` apóstrofe ASCII |
| `verbos-movimiento-wb-uscire` | "Ellos han salido a las ocho" → essere + concordancia masc pl (Loro sono usciti) | 102 → 1 var | word-buttons | sube tal cual (102); auxiliar essere (`sono`, no `hanno`) + participio masc pl (`usciti`, no `uscito`); distractoras `hanno`/`uscito` |

---

## Criterio de merge de `validation` (D-24-11)

Casi todos los 37 ejercicios fuente llevan el quórum limpio `claude-opus-4-7` + `claude-sonnet-4-6` ambas `correcta` (verificado en el JSON). **Excepción:** **011, 024, 026** tienen un pass `claude-sonnet-4-6` `incorrecta` (`[C5-leak] participio fem insinúa essere`) **resuelto con override del autor → `correcta`** (formato par-complementario intencional, coherente con 013/015/025). Estos disputed→override se preservan **verbatim** (D-24-11; no se re-validan). Por tanto:

- **Slots-de-1** (los 3 word-buttons `verbos-movimiento-wb-*`): el `validation` top-level del único ejercicio fuente sube **verbatim**.
- **Slots multi-variante:**
  - `verbos-movimiento-essere` (14 vars; base = **001**): el `validation` top-level se toma de la **base (001)**, quórum limpio Opus+Sonnet correcta. Las superficies se mueven INTACTAS (D-24-11) → no se re-valida. **Los disputed→override de 011/024/026** (que entran como variantes NO-base de este slot) se preservan en el historial de su id fuente; su validation no sube al slot (la del slot es la de la base 001). Sin pérdida: el matiz par-complementario ya está cubierto por la regla del slot.
  - `verbos-movimiento-concordanza` (12 vars; base = **008**): `validation` de la base (008), quórum limpio.
  - `verbos-movimiento-excepcioni-avere` (6 vars; base = **017**): `validation` de la base (017), quórum limpio.
  - `verbos-movimiento-correre` (2 vars; base = **021**): `validation` de la base (021), quórum limpio.
- **Criterio elegido = validation de la base** (el id marcado "base = X" en cada tabla). Se registrará en el SUMMARY de 24-02 (y verbatim ya en 24-01 al reescribir el JSON). Alternativa (fusionar passes[] de todas las variantes) descartada por simplicidad y porque la base ya cubre el quórum; el autor puede pedir la fusión en el checkpoint.

> **Nota sobre los disputed→override 011/024/026:** son superficies de **elige-auxiliar** (su hueco es el auxiliar, no el participio), por lo que el concern C5-leak ("el participio fem ya insinúa essere") es precisamente el que el autor overrideó como falso-positivo de política (el ejercicio sigue exigiendo elegir persona/número del auxiliar). Entran como variantes NO-base del slot `verbos-movimiento-essere`; su validation con override se conserva en el JSON como historial del id, pero la validation TOP-LEVEL del slot es la de la base 001. **No re-validar (D-24-11).**

---

## Sección EXPLÍCITA — Sin cruces multi-cat: no existen verbos-movimiento-300..305

**DIVERGENCIA #2 frente a Essere/Avere.** Verbi di movimento **NO tiene cruces multi-cat**:

- El set legacy tiene **34 MC (001-034) + 3 word-buttons (100/101/102)** = 37 ids, **TODOS con `categoryId` único `verbos-movimiento`** (verificado en el JSON: 0 ids con 2+ categorías, 0 ids en rango 300..305).
- Essere y Avere tenían 6 cruces cada uno (essere-300..305 / avere-300..305) con id ESTABLE + 2 categoryIds. **AQUÍ NO existen.**

→ El ejecutor de Task 2 **NO debe**: crear ningún id `verbos-movimiento-30[0-5]`; copiar la columna de cruces de Essere/Avere; reservar ningún rango. **TODOS los ids son semánticos** (D-24-09: sin cruces → sin rango reservado): `verbos-movimiento-essere`, `verbos-movimiento-concordanza`, `verbos-movimiento-excepcioni-avere`, `verbos-movimiento-correre`, `verbos-movimiento-wb-andare`, `verbos-movimiento-wb-viaggiare`, `verbos-movimiento-wb-uscire`. **TODOS los slots `categoryIds: ["verbos-movimiento"]`** (1 sola categoría). Crear cruces sería capacidad nueva fuera de scope (D-24-12/14).

---

## Sección EXPLÍCITA — Snapshot / re-base D-88: **NO APLICA a Verbi di movimento**

**DIVERGENCIA heredada de Essere (vs Avere Phase 22).** Verbi di movimento **NO tiene** blindaje APPEND-ONLY ni snapshot:

- `scripts/snapshot-avere-prefix.mjs`, `scripts/assert-avere-prefix-unchanged.mjs` y `scripts/.avere-prefix-snapshot.json` están **hardcodeados a `content/exercises/avere.json`** (avere-only, **0 refs a verbos-movimiento**, igual que con Essere).
- **NO existe** `.verbos-movimiento-prefix-snapshot.json` (no se busca ni se crea).
- Verbi di movimento **nunca tuvo** invariante D-88 (el blindaje se creó solo para los 17 ejercicios legacy de Avere en Phase 4).

→ El ejecutor de Task 2 **NO debe**: ejecutar `snapshot-avere-prefix.mjs` ni `assert-avere-prefix-unchanged.mjs`; buscar o crear `.verbos-movimiento-prefix-snapshot.json`; replicar la tarea de re-base D-88 de 22-01/22-02. **Esta columna de Phase 22 NO aplica (igual que en Essere Phase 23).** Documentar en el SUMMARY: "Verbi di movimento no tiene snapshot APPEND-ONLY ni cruces multi-cat — no aplica re-base D-88".

---

## Notas para 24-02 (NO ejecutar aquí)

- **Celdas pobres / candidatas a engordar:** todos los slots multi-variante son ya RICOS (essere 14, concordanza 12, excepcioni-avere 6), pero los 4 ejes de huecos PRIORIZADOS (D-24-06) materializan variantes/slots nuevos por quórum cross-vendor R1-R7.
- **Los 4 ejes de huecos PRIORIZADOS (D-24-06, ambición generosa, sin cuota fija):**
  1. **(a) Más verbos essere (engorde del slot `verbos-movimiento-essere`):** scendere, salire, cadere, rimanere/restare, diventare/nascere/morire (verbos de estado/cambio que también piden essere). **Verificar que cada verbo toma realmente essere (no inventar excepciones)** — lo cierra el quórum de 24-02.
  2. **(b) Más excepciones avere (engorde de `verbos-movimiento-excepcioni-avere`):** passeggiare, sciare, saltare, viaggiare en más personas. **Verificar el auxiliar real de cada verbo.**
  3. **(c) Más test-de-destino (engorde de `verbos-movimiento-correre`):** correre/volare/saltare/salire/scendere con y sin destino (drillea la regla "¿hay destino?"). **Verificar el auxiliar real según destino.**
  4. **(d) Matriz de concordancia completa (engorde de `verbos-movimiento-concordanza`):** las 4 formas (-o/-a/-i/-e) con varios verbos como variantes.
  - Cada candidata la concreta el mapa de 24-02 y la valida el quórum cross-vendor R1-R7 antes de entrar.
- **Counts de tests/scripts:** se sincronizan en 24-03 contra el conteo REAL final tras 24-02 (`data.exercises.length`). NO se tocan aquí ni se estiman. (Esta reagrupación da **7 slots**; 24-02 puede subir el count con slots NUEVOS de huecos.)

---

*Mapa propuesto por el planner/executor; refinado y aprobado por el autor en el checkpoint:decision de 24-01.*
