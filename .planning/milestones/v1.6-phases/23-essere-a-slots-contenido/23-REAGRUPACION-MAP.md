# 23-REAGRUPACION-MAP.md — Essere → slot+variantes (mapa de auditoría)

**Fase:** 23-essere-a-slots-contenido · **Plan:** 23-01 · **Task 1 (artefacto de auditoría)**
**Estado:** PROPUESTO — pendiente de aprobación del autor en el checkpoint:decision.
**Patrón replicado:** 22-01 (Avere) + 19-01 (Articoli) + 20-01 (Partitivi), con DOS divergencias deliberadas frente a Avere (passato en 4 slots separados; sin snapshot).
**Decisiones aplicadas:** D-23-01 (agrupar por regla, pocos slots), D-23-02 (presente por persona/forma), D-23-03 (passato en 4 SLOTS SEPARADOS por concordancia — DIVERGENCIA), D-23-08 (shape sin payload), D-23-09 (ids semánticos libres + cruces id estable + 2 cats), D-23-10 / D-17-05 (merge elegir-la-más-completa + injertar matices), D-23-11 (mover superficies intactas = no re-validar; passes[] verbatim), D-23-12 (word-buttons slots-de-1, Essere NO tiene match — no se inventa), D-23-06 (contraste essere/avere preservado).

---

## Resumen de cobertura

39 ids fuente → **25 slots** (recomendado). Cada id 001-029, 100-103, 300-305 aparece exactamente UNA vez como id-fuente. Sin slots nuevos ni variantes nuevas (eso es 23-02).

**Conteo de slots de esta reagrupación: 25** (6 presente por persona + 5 bloque identidad/nac/prof/estado/cópula + 4 passato SEPARADOS + 4 word-buttons + 6 cruces).

| Bloque | Slots | ids-fuente | type |
|--------|-------|-----------|------|
| Presente indicativo por persona (D-23-02) | 6 | 001, 002, 003+004, 005, 006, 007 | multiple-choice |
| Identidad / nacionalidad / profesión / estado / cópula (D-23-01) | 5 | 009/010/011, 013/014/015, 012/016/017/018/019, 008/020/021/022/023, 024/025 | multiple-choice |
| Passato prossimo participio — **4 SLOTS SEPARADOS** (D-23-03) | 4 | 026, 027, 028, 029 | multiple-choice |
| Word-buttons (D-23-12) | 4 | 100, 101, 102, 103 | word-buttons |
| Cruces multi-cat (D-23-09) | 6 | 300, 301, 302, 303, 304, 305 | multiple-choice |
| **TOTAL** | **25** | **39 ids** | |

> El conteo final que sincroniza 23-03 se LEE de `data.exercises.length` real tras 23-02 (las variantes nuevas no suben el count; los slots NUEVOS de 23-02 — p.ej. el slot ser/estar D-23-07 — sí). Predicción rough CONTEXT: ~19-24; esta reagrupación da **25** (la separación del passato en 4 y de io/loro-sono en 2 slots sube respecto a la predicción mínima — coherente con D-23-02 + D-23-03).

---

## Tabla detallada por slot

Leyenda columnas: slot-id propuesto · regla/persona/uso · ids-fuente (→variantes) · type · categoryIds · explanation-base + matices a injertar (D-23-10) · ¿celda pobre candidata a 23-02?

### Bloque 1 — Presente indicativo por persona (6 slots, D-23-02)

Cada forma del presente es una trampa de conjugación distinta para el hispanohablante → un slot por persona/forma; el motor re-verifica cada celda. Todos `categoryIds: ["essere"]`. Todas las superficies ya llevan una distractora de avere en options (D-23-06, preservar).

| slot-id | regla/persona | ids-fuente | type | explanation-base + matices | celda pobre? |
|---------|---------------|-----------|------|----------------------------|--------------|
| `essere-sono` | presente 1ª sing (io), identidad | 001 → 1 var | MC | sube tal cual (001); matiz YA dentro: distractora `ho`=avere (calco 'yo tengo Maria'); nota: `sono` también es 3ª pl (lo entrena `essere-sono-loro`) | **SÍ** → engordar en 23-02 (localización con essere, ser/estar) |
| `essere-sei` | presente 2ª sing (tu), nacionalidad interrogativa | 002 → 1 var | MC | sube tal cual (002); matiz: nacionalidad siempre con essere, nunca avere; distractora `hai`=avere | **SÍ** |
| `essere-e` | presente 3ª sing (lui/lei), identidad/estado | 003 + 004 → 2 vars | MC | **base = 003** (define `è` con acento grave, 3ª sing lui/lei/Lei cortesía, y la regla ortográfica `è`≠conjunción `e`). **Injertar de 004:** misma forma `è` sirve para lui Y lei (3ª sing comparte conjugación los dos géneros) + concordancia adjetival fem del predicado (simpatica, no simpatico). Rule-first. | regla con 2 vars; candidata a más variantes 23-02 |
| `essere-siamo` | presente 1ª pl (noi), localización | 005 → 1 var | MC | sube tal cual (005); matiz YA dentro: falso amigo crítico ser/estar (italiano usa essere para ambos); `a casa` pide essere; distractora `abbiamo`=avere | **SÍ** → engordar 23-02 (localización con essere) |
| `essere-siete` | presente 2ª pl (voi), estado | 006 → 1 var | MC | sube tal cual (006); matiz: concordancia adjetival plural (pronti masc / pronte fem); distractora `avete`=avere | **SÍ** |
| `essere-sono-loro` | presente 3ª pl (loro), localización/estado | 007 → 1 var | MC | sube tal cual (007); matiz YA dentro: `sono` 3ª pl coincide con 1ª sing io, contexto desambigua; bloque mnemónico sono/sei/è/siamo/siete/sono; distractora `hanno`=avere | **SÍ** |

> **Nota de discreción (A2 — para confirmación del autor):** essere-001 (io sono) y essere-007 (loro sono) comparten la forma `sono`. **Recomendación: 2 slots por persona** (`essere-sono` io + `essere-sono-loro` loro) siguiendo el espíritu literal de D-23-02 (cada persona es una trampa distinta; verificado: 001 "Io ___ Maria" correct=sono identidad; 007 "Loro ___ in vacanza" correct=sono localización — usos distintos además de personas distintas). **Alternativa:** fundirlos en 1 slot `essere-sono` con 2 variantes (por forma) → bajaría el count a **24**. El autor decide en el checkpoint (afecta el count en 1 slot).

### Bloque 2 — Identidad / nacionalidad / profesión / estado / cópula (5 slots, D-23-01)

Agrupar lo fácil, pocos slots por regla. Todos `categoryIds: ["essere"]`. Cada slot multi-variante registra explanation-base + matices injertados (D-23-10).

| slot-id | regla | ids-fuente | type | explanation-base + matices a injertar | celda / hueco |
|---------|-------|-----------|------|----------------------------------------|---------------|
| `essere-identidad` | identidad/parentesco/relación con essere (nombre, hermano, amigo de X) | 009 (presentación `sono italiana`), 010 (parentesco `è mio fratello`), 011 (`sei l'amico di Luca?`) → 3 vars | MC | **base = 010** — la más completa en contraste pedagógico: define identidad con essere + el eje **ser un familiar (essere) vs tener un familiar (avere)** ('è mio fratello' ≠ 'ha un fratello'). **Injertar de 009:** la presentación encadenada arranca con 'mi chiamo' y sigue con essere; concordancia de género del adjetivo de identidad (italiana fem / italiano masc). **Injertar de 011:** identidad por relación con essere + 'di' para el vínculo; elisión `lo→l'` ante vocal (l'amico) con apóstrofe ASCII obligatorio. Rule-first. Distractoras avere (ho/ha/hai) preservadas. | celda rica; candidata a más variantes 23-02 |
| `essere-nacionalidad` | nacionalidad con essere + concordancia género/número + di-origen | 013 (`sono spagnolo` masc sing), 014 (`è italiana di Milano` fem sing + di), 015 (`sono tedeschi` masc pl) → 3 vars | MC | **base = 013** — la más general: nacionalidad siempre con essere + dos detalles ortográficos (nacionalidades NO se capitalizan; concorda en género con el hablante spagnolo/spagnola). **Injertar de 014:** origen ciudadano essere + nacionalidad + 'di' + ciudad (di canónica con nombre propio, frente a 'da' de movimiento); femenino italiana. **Injertar de 015:** plural masculino tedesco→tedeschi (patrón -co→-chi para preservar el sonido duro); el plural italiano nunca cierra en -s. Rule-first. Distractoras avere preservadas. | **HUECO PEDAGÓGICO (D-23-04): concordancia italiano/italiana/italiani/italiane sistemática** → variantes nuevas en 23-02 (masc/fem × sing/pl) |
| `essere-profesion` | profesión/rol con essere (sin artículo) | 012 (rol pl `siete studenti`), 016 (`è medico` masc), 017 (`è avvocata` fem -o→-a), 018 (`siete studenti di lingue, non professori`), 019 (disyuntiva `professore o studente?`) → 5 vars | MC | **base = 016** — el contraste esere/avere más explícito (D-23-06): profesión predicativa siempre con essere, sin artículo; pitfall hispanohablante 'ha medico'. **Injertar de 017:** femenino productivo -o→-a (avvocato→avvocata); el italiano contemporáneo prefiere la forma femenina plena. **Injertar de 012:** rol/identidad plural, el italiano omite el artículo indeterminado en el rol predicativo plural; concordancia universitari plural masc. **Injertar de 018:** rol académico + 'di' + área; el contraste 'non professori' fuerza identidad; studenti masc plural genérico cubre grupo mixto (studentesse si solo fem). **Injertar de 019:** la disyuntiva sobre rol también pide essere; ambas opciones sin artículo. Rule-first. Distractoras avere preservadas. | celda rica; contraste essere/avere (D-23-06) a reforzar en 23-02 |
| `essere-stato` | estado físico/emoción con essere (falso amigo estar→essere) | 008 (`non è stanca` negación), 020 (`è stanca` fem sing), 021 (`sono felice` 1ª sing), 022 (`siamo contenti della scuola` pl), 023 (`non siete tristi` pl negación) → 5 vars | MC | **base = 020** — el falso amigo crítico más nítido: el estado físico transitorio se predica con essere donde el español usa estar (Maria è stanca = está cansada); las sensaciones físicas momentáneas (hambre/calor) sí piden avere (ho fame/caldo) pero el estado se queda con essere. **Injertar de 008:** la negación 'non' va delante del verbo conjugado, sin auxiliar; pitfall calco 'no tiene cansada' (avere). **Injertar de 021:** la emoción/ánimo se predica con essere; adjetivo invariable en singular felice (masc=fem), plural felici; pitfall 'tengo felicidad'. **Injertar de 022:** estado emocional plural + preposición articulada 'della' (di+la) para causa; concordancia plural masc contenti. **Injertar de 023:** 'non' delante del verbo, sin doble negación; adjetivo triste invariable en género, varía en número (tristi). Rule-first. Distractoras avere (ha/ho/abbiamo/avete) preservadas. | falso amigo estar→essere (núcleo D-23-06/D-23-07); candidata a más variantes 23-02 |
| `essere-copula` | cópula clasificatoria (X es de la clase Y) | 024 (`Roma è una città italiana`), 025 (`Il gatto è un animale domestico`) → 2 vars | MC | **base = 024** — define la cópula clasificatoria 'X es de la clase Y' como uso esencial puro de essere (ni estado ni acción) + el italianismo 'città' (acento grave, invariable, patrón -tà femenino abstracto). **Injertar de 025:** las definiciones tipo diccionario usan essere; el artículo definido 'il' ante sustantivo genérico expresa la clase entera; pitfall 'ha un animale' calco sin sentido. Rule-first. Distractora `ha`=avere preservada. | uso esencial puro; estable |

> **Open Q #2 (para confirmación del autor):** la propuesta es **5 slots separados** (identidad / nacionalidad / profesión / estado / cópula). Alternativas que el autor puede pedir: (a) fundir **nacionalidad + profesión** en un slot 'rasgos predicativos con essere' (bajaría a 4 slots de bloque); (b) fundir **estado + cópula** (improbable: estado=transitorio/falso-amigo, cópula=esencial/clasificatorio — reglas distintas). Recomendación: **mantener los 5 separados** — cada uno es una regla pedagógica distinta y nacionalidad tiene un hueco propio (concordancia) que merece slot dedicado para engordar en 23-02.

### Bloque 3 — Passato prossimo participio — **4 SLOTS SEPARADOS por concordancia (D-23-03, DIVERGENCIA frente a Avere)**

**DIVERGENCIA CRÍTICA #1 frente a Avere.** Avere modeló el passato como 1 slot con N variantes. Essere lo parte en **4 SLOTS SEPARADOS**, uno por forma de concordancia del participio (masc sing / fem sing / masc pl / fem pl). Razón: la concordancia del participio de essere con el sujeto es **la regla distintiva de Essere frente a Avere** (cuyo participio es invariable) y el punto duro para el hispanohablante → el loop debe **obligar a acertar stato/stata/stati/state por separado** (drilling explícito). Cada slot-de-1; cada explanation enfatiza la regla de concordancia género/número. `categoryIds: ["essere"]`. **NO fundir en 1 slot.**

| slot-id | concordancia | id-fuente | type | explanation (sube + enfatiza concordancia) |
|---------|--------------|-----------|------|---------------------------------------------|
| `essere-passato-prossimo-stato` | masc sing (stato) | 026 (`io sono stato a Roma`) → 1 var | MC | sube tal cual (026); ya enfatiza: auxiliar essere + participio `stato`; pitfall fortísimo `ho stato` (calco 'he estado'); verbos intransitivos piden essere de auxiliar. Concordancia masc sing. |
| `essere-passato-prossimo-stata` | fem sing (stata) | 027 (`Maria è stata felice`) → 1 var | MC | sube tal cual (027); ya enfatiza: el participio concuerda en género/número con el sujeto cuando el auxiliar es essere → `stata` (no stato) para Maria; las 4 formas stato/stata/stati/state. Concordancia fem sing. |
| `essere-passato-prossimo-stati` | masc pl (stati) | 028 (`noi siamo stati a Milano`) → 1 var | MC | sube tal cual (028); ya enfatiza: 1ª pl auxiliar `siamo` + participio `stati` (plural masc); pitfall `abbiamo stato`. Concordancia masc pl. |
| `essere-passato-prossimo-state` | fem pl (state) | 029 (`le ragazze sono state qui`) → 1 var | MC | sube tal cual (029); ya enfatiza: 3ª pl auxiliar `sono` + participio `state` (plural fem); las 4 celdas de la matriz masc/fem × sg/pl cubiertas. Concordancia fem pl. |

> Las 4 explanations fuente ya son rule-first y ya enfatizan la concordancia; suben **tal cual** a top-level. No hay merge entre variantes (cada slot es de-1). Distractoras avere (ho/ha/abbiamo/hanno) preservadas en cada uno.

### Bloque 4 — Word-buttons (4 slots-de-1, D-23-12)

No se fuerzan variantes (D-23-12). `categoryIds: ["essere"]`, explanation sube tal cual. **Essere NO tiene match en el set legacy — no se inventa.** Apóstrofes ASCII preservados.

| slot-id | sub-área | id-fuente | type | explanation |
|---------|----------|-----------|------|-------------|
| `essere-wb-identidad` | identidad/presentación múltiple ("Yo soy María y él es Luca") | 100 → 1 var | word-buttons | sube tal cual (100); coordina dos identidades con 'e' (y); distractoras `ho`/`ha`=avere; 'e' (y) ≠ 'è' (es) |
| `essere-wb-nacionalidad` | nacionalidad pl + di-origen ("Nosotros somos italianos de Milán") | 101 → 1 var | word-buttons | sube tal cual (101); essere + adjetivo plural + 'di' + ciudad; plural -i no -os; distractora `abbiamo`=avere |
| `essere-wb-profesion` | profesión fem + in-lugar ("Ella es médica en un hospital") | 102 → 1 var | word-buttons | sube tal cual (102); profesión con essere + 'in' lugar de trabajo; distractora `ha`=avere |
| `essere-wb-passato` | passato pl masc + a-ciudad + per-duración ("Hemos estado en Roma una semana") | 103 → 1 var | word-buttons | sube tal cual (103); passato di essere: auxiliar `siamo` + participio `stati`; pitfall `abbiamo stato`; 'a' ciudad + 'per' duración; distractora `abbiamo`=avere |

### Bloque 5 — Cruces multi-categoría (6 slots-de-1, D-23-09)

**id ESTABLE intacto (essere-300..305)** + **categoryIds de 2 ids preservados [VERIFIED: leídos del JSON]**. Rango 300..305 RESERVADO/excluido de la renumeración de slots essere-only. No romper `clearedExerciseIds` de las categorías cruzadas ni la cascada D-54 (preposiciones es la única cruzada NO reseteada en Phase 21 → la más sensible, vía essere-305). Cada cruce → slot-de-1 (su payload MC → 1 variant + explanation top-level). Apóstrofe ASCII en `trent'anni` (300) preservado.

| slot-id (ESTABLE) | cruce | categoryIds | id-fuente | explanation |
|-------------------|-------|-------------|-----------|-------------|
| `essere-300` | essere + avere (è medico + ha trent'anni) | `["essere","avere"]` | 300 → 1 var | sube tal cual (300) — el contraste esencial: profesión con essere + edad con avere |
| `essere-301` | essere + profesiones (avvocata fem -o→-a) | `["essere","profesiones"]` | 301 → 1 var | sube tal cual (301) |
| `essere-302` | essere + verbos-movimiento (è andata, passato intransitivo) | `["essere","verbos-movimiento"]` | 302 → 1 var | sube tal cual (302) |
| `essere-303` | essere + genero-numero (italiani di Milano) | `["essere","genero-numero"]` | 303 → 1 var | sube tal cual (303) |
| `essere-304` | essere + sustantivos-irregulares (braccia stanche) | `["essere","sustantivos-irregulares"]` | 304 → 1 var | sube tal cual (304) |
| `essere-305` | essere + preposiciones (di Milano, origen) | `["essere","preposiciones"]` | 305 → 1 var | sube tal cual (305) |

---

## Criterio de merge de `validation` (D-23-11)

Todos los 39 ejercicios fuente llevan el quórum limpio `claude-opus-4-7` + `claude-sonnet-4-6` ambas `correcta` (verificado en el JSON). **NO hay disputed ni override de autor en Essere** (a diferencia de Avere 009). Por tanto:

- **Slots-de-1** (los 6 presente salvo `essere-e`, los 4 passato, los 4 word-buttons, los 6 cruces, `essere-copula` si el autor lo dejara de-1): el `validation` top-level del único ejercicio fuente sube **verbatim**.
- **Slots multi-variante** (`essere-e` 003+004; `essere-identidad` 009/010/011; `essere-nacionalidad` 013/014/015; `essere-profesion` 012/016/017/018/019; `essere-stato` 008/020/021/022/023; `essere-copula` 024/025): el `validation` top-level se toma del **ejercicio cuya superficie/explanation domina la base del slot** (el id marcado "base = X" arriba: 003, 010, 013, 016, 020, 024 respectivamente). Las superficies se mueven INTACTAS → no se re-valida (D-23-11, cambio de contenedor). El criterio elegido (validation de la base) se registrará en el SUMMARY de 23-02.
- Nota sobre el concern de 008 (Sonnet C4-explanation, NO invalida — verdict `correcta`): al ser 008 una variante NO-base de `essere-stato` (la base es 020), su validation no sube al slot; el concern queda en el historial del id fuente original (descartado en la conversión, pues el ejercicio fuente desaparece como entidad independiente). El matiz pedagógico de 008 (negación + estado con essere) SÍ se injerta en la explanation del slot. Sin pérdida de información validada.

---

## Sección EXPLÍCITA — Snapshot / re-base D-88: **NO APLICA a Essere**

**DIVERGENCIA CRÍTICA #2 frente a Avere.** Essere **NO tiene** blindaje APPEND-ONLY ni snapshot:

- `scripts/snapshot-avere-prefix.mjs`, `scripts/assert-avere-prefix-unchanged.mjs` y `scripts/.avere-prefix-snapshot.json` están **hardcodeados a `content/exercises/avere.json`** (verificado: `0 essere refs` en ambos scripts).
- **NO existe** `.essere-prefix-snapshot.json` (verificado en disco).
- Essere **nunca tuvo** invariante D-88 (el blindaje se creó solo para los 17 ejercicios legacy de Avere en Phase 4).

→ El ejecutor de Task 2 **NO debe**: ejecutar `snapshot-avere-prefix.mjs` ni `assert-avere-prefix-unchanged.mjs`; buscar o crear `.essere-prefix-snapshot.json`; replicar la tarea de re-base D-88 de 22-01/22-02. **Esta columna de Phase 22 desaparece en Phase 23.** Documentar en el SUMMARY: "Essere no tiene snapshot APPEND-ONLY — no aplica re-base D-88".

---

## Notas para 23-02 (NO ejecutar aquí)

- **Celdas pobres a engordar:** los slots de presente con 1 variante (`essere-sono`, `essere-sei`, `essere-siamo`, `essere-siete`, `essere-sono-loro`) → autorar variantes nuevas por quórum cross-vendor R1-R7.
- **Huecos de regla → variantes/slots NUEVOS (D-23-04, ambición generosa):**
  1. **Nacionalidad concordancia italiano/italiana/italiani/italiane** sistemática (slot `essere-nacionalidad`) — masc/fem × sing/pl con essere.
  2. **Localización con essere** (sono a casa, è in ufficio, siamo al mare) — engordar `essere-siamo`/`essere-sono`/`essere-e` o slot de localización; falso amigo estar→essere.
  3. **Slot ser/estar dedicado (D-23-07, slot NUEVO)** — `essere-ser-estar`: contrastar "Maria è stanca" (estado/estar) vs "Maria è medico" (identidad/ser), explanation explícita del calco español. Sube el count en 23-02.
  4. **Contraste essere/avere agresivo (D-23-06)** — distractoras avere y explicaciones del calco: edad con avere (ho trent'anni) no essere; posesión vs identidad/estado/localización.
- **Counts de tests/scripts:** se sincronizan en 23-03 contra el conteo REAL final tras 23-02 (`data.exercises.length`). NO se tocan aquí ni se estiman.

---

*Mapa propuesto por el planner/executor; refinado y aprobado por el autor en el checkpoint:decision de 23-01.*
