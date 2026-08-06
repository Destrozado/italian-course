---
status: testing
phase: 42-fare-congiuntivo-4-slots-hom-grafas-disparador
source: [42-VERIFICATION.md]
started: 2026-08-06T10:00:00Z
updated: 2026-08-06T14:55:00Z
---

## Current Test

number: 3
name: Ojo humano sobre los 18 variantes de 42-02
expected: |
  Jugar la categoría en http://localhost:3000 y confirmar que las 5 casillas se sienten como el
  `presente` ya aprobado — rotación de variante entre pasadas, sujeto siempre presente en las
  homógrafas, disparador que descarta el otro modo sin dudar.
awaiting: user response

## Tests

### 1. Pasada TOP-LEVEL de quórum base (Opus+Sonnet) + ronda EXTRA DeepSeek

Correr el quórum base canónico vía el skill `gsd-validate-exercise` (Opus + Sonnet, criterios C1-C5,
**un subagent fresh por ejercicio — VAL-03, NUNCA batched**) sobre los 5 slots de
`content/exercises/fare-congiuntivo.json`, más la ronda EXTRA DeepSeek obligatoria (D-42-08) vía
`scripts/validate-ai-pass.mjs` sobre las **10 variantes homógrafas**:

| Slot | Variantes homógrafas | Forma |
|------|---------------------|-------|
| `fare-congiuntivo-presente` | io, tu, lui-lei | `faccia` |
| `fare-congiuntivo-imperfetto` | io, tu | `facessi` |
| `fare-congiuntivo-passato` | io, tu, lui-lei | `abbia fatto` |
| `fare-congiuntivo-trapassato` | io, tu | `avessi fatto` |

expected: los 5 slots en `validated`, `VAL_07_STRICT=1` en verde, gates de categoría sin romperse.
result: issue
reported: "Pasada corrida 2026-08-06 en top-level, 1 subagent fresh por ejercicio (VAL-03). La pasada
base dejó 3/5 (`presente` y `passato` disputed); tras arreglar las dos causas y re-pasar, quedan 4/5:
`presente` cerrado en la causa, `passato` reabierto por una objeción NUEVA (G-42-3) que la adjudicación
adversarial desmonta pero que el sticky D-VAL-07 no deja limpiar sin decisión de autor. Los 4 slots del
paradigma llevan pase `deepseek-reasoner` (D-42-08 cumplido). `VAL_07_STRICT=1 node --test tests/*.test.js`
sigue rojo por ese único slot. Suite sin el flag 837/837 verde y `content-fare-congiuntivo.test.js` 64/64
verde, así que `status === deriveStatus(passes)` se sostiene: lo que queda es contenido, no fontanería."
severity: major

Estado FINAL por slot (`133f700`, tras el fix `af41c98` y el re-pase):

| Slot | claude-opus-5 | claude-sonnet-5 | deepseek-reasoner | status |
|------|---------------|-----------------|-------------------|--------|
| `fare-congiuntivo-presente` | correcta | correcta | correcta | validated |
| `fare-congiuntivo-imperfetto` | correcta | correcta | correcta | validated |
| `fare-congiuntivo-passato` | correcta | correcta | **incorrecta** | **disputed** |
| `fare-congiuntivo-trapassato` | correcta | correcta | correcta | validated |
| `fare-congiuntivo-disparador` | correcta | correcta | n/a (no homógrafo) | validated |

Traza de las tres disputes que aparecieron, y de por qué NINGUNA era del tipo que el `notes` predecía
— ver `## Gaps` G-42-1 (resuelto), G-42-2 (resuelto) y G-42-3 (abierto):

| Gap | Slot | Criterio | Naturaleza | Salida |
|-----|------|----------|------------|--------|
| G-42-1 | `presente` | C5-leak (gloss `Benché (aunque)`) | el canon no estaba en el prompt de validación | causa arreglada, contenido intacto |
| G-42-2 | `passato` | C2 (`stamattina` deíctico a hoy) | defecto REAL de contenido | `ieri mattina` |
| G-42-3 | `passato` | C2 (`facessi` imperfectivo) | ruido de un vendor en lo sutil | pendiente de autor |

**El aviso de falso positivo que vivía aquí se ha retirado, y conviene saber por qué.** Decía que el
flag C5 sobre el gloss lo levantarían Gemini y DeepSeek, que era falso positivo de política y que la
base Claude lo aprobaría. Lo levantó **Sonnet**, que es la mitad de esa base. El aviso no era una
predicción arriesgada que salió mal: era el síntoma de que la excepción vivía solo en el `notes` de la
categoría, que el subagent nunca ve. Arreglado escribiéndola en R1 y en C5 del propio
`09-VALIDATION-PROMPT.md` (G-42-1). Lo que sí se mantiene del aviso viejo: un flag C4-accent sobre
español sin tildes es bug REAL y se arreglan los acentos, nunca se overridea.

### 2. Confirmación lingüística de unicidad (backstop)

Confirmar que ninguna de las 30 variantes admite una segunda lectura defendible del disparador o del
marco de concordancia. Marcado `verification: backstop` en los dos PLAN.md.

Foco, por orden de riesgo demostrado:
- **Las 6 variantes del slot `fare-congiuntivo-disparador`** — es el punto exacto donde el code review
  ya encontró 2 defectos reales (CR-01, CR-02: `faceva` y `facesse` eran defendibles bajo un `ogni
  giorno` pelado). Corregidos con ancla temporal `in questo momento` / `adesso`, pero el ancla es
  nueva y no ha pasado por quórum.
- **El blindaje de concordancia de `passato` y `trapassato`** — sus 3 distractoras son formas de
  subjuntivo de la misma persona, incluidas las dos simples (`faccia`, `facessi`), así que el marco de
  cada prompt tiene que excluirlas limpiamente o la distractora se vuelve defendible.

expected: el pase de quórum se pronuncia explícitamente sobre esos dos bloques; cero variantes con una
opción defendiblemente correcta además de la key.
result: issue
reported: "El quórum SÍ se pronunció sobre los dos bloques, y el balance es: un defecto real
encontrado y arreglado, y una objeción residual que no se sostiene pero que bloquea el gate.
Disparador: las 6 variantes pasan limpias con Opus y Sonnet, `c2_una_opcion: true` en los dos, así que
el ancla deíctica que corrigió CR-01 y CR-02 aguanta el quórum — ese bloque queda cerrado.
Concordancia: `trapassato` limpio los tres pases; `passato` dio UN defecto real (`stamattina`, G-42-2,
arreglado) y después una objeción distinta (`facessi`, G-42-3) que 2 adjudicadores adversariales
independientes desmontan por la misma vía: el mecanismo que invoca es de predicados estativos y no
alcanza a un télico con objeto definido, y `facessi` comunica otra proposición, no otra respuesta. El
conteo de variantes con una opción defendiblemente correcta además de la key es 0 según la adjudicación
y 1 según DeepSeek, y esa discrepancia es lo único que queda abierto de este test."
severity: major

**Por qué es humano:** ninguna aserción mecánica lo cierra, y el code review ya demostró que el riesgo
no es hipotético. Dar esto por verificado sin la pasada de quórum sería un pase silencioso sobre
exactamente el daño que esta categoría existe para prevenir — con la cascada D-54, una variante con dos
respuestas válidas resetea la categoría entera.

### 3. Ojo humano sobre los 18 variantes de 42-02 (opcional pero recomendado)

Solo el slot `presente` pasó por el checkpoint humano de wave 1. Los 18 de `passato`, `trapassato` y
`disparador` se autoraron con `autonomous: true`, sin gate. Los dos juicios lingüísticos de arriba van
marcados `human_judgment: true` en `coverage.D1` y `coverage.D3` de los SUMMARY.

expected: jugar la categoría en http://localhost:3000 y confirmar que las 5 casillas se sienten como el
`presente` ya aprobado — rotación de variante entre pasadas, sujeto siempre presente en las homógrafas,
disparador que descarta el otro modo sin dudar.
result: [pending]

## Summary

total: 3
passed: 0
issues: 2
pending: 1
skipped: 0
blocked: 0

## Gaps

- gap_id: G-42-3
  truth: "Ninguna de las 6 variantes de `fare-congiuntivo-passato` admite una segunda lectura
    defendible; el marco de concordancia excluye limpiamente los dos tiempos simples del subjuntivo."
  status: failed
  reason: "deepseek-reasoner, en el RE-PASE posterior al fix de G-42-2, abre una objeción DISTINTA de
    la primera: [C2-una_opcion] sobre la variante 0 (io), «Mia madre non crede che io ___ i compiti
    ieri sera», sosteniendo que `facessi` es válido con lectura imperfectiva y que el defecto es del
    slot entero, no de una variante — los seis prompts no forzarían el aspecto perfectivo."
  severity: major
  test: 2
  artifacts:
    - path: "content/exercises/fare-congiuntivo.json"
      issue: "`fare-congiuntivo-passato` — las 6 variantes, según la objeción; la 0 como ejemplo"
  adjudicacion: |
    Sometido a 2 adjudicadores fresh-context (Opus 5 y Sonnet 5) con instrucción ADVERSARIAL —
    defender la lectura alternativa, no confirmar el statu quo. Los dos convergen en ÚNICO:

    1. El mecanismo existe pero NO alcanza a este predicado. La concordanza libera anclada por el
       adverbial (`Non credo che fosse a casa ieri sera`, `Sembra che ieri piovesse`, documentada en
       Serianni y Renzi) es real y estándar, pero opera sobre predicados ESTATIVOS. `fare i compiti`
       es télico con objeto definido: el imperfetto sobre un télico no produce fondo estativo por sí
       solo, exige un punto de observación (`quando sei entrata`, `mentre...`) que el prompt no da.
    2. Y es el argumento que zanja: `facessi` no significa lo mismo que `abbia fatto`. Son dos
       proposiciones con condiciones de verdad distintas — se puede haber estado haciendo los deberes
       toda la tarde y no haberlos hecho. Una forma gramatical que comunica OTRA cosa no es una
       segunda respuesta al hueco, es otra frase. El criterio del proyecto es «defendiblemente
       correcta como respuesta al prompt», no «sobrevive en alguna frase vecina».
    3. Dato empírico que lo remata (Opus): para el progresivo explícito el italiano usa `stessi
       facendo`, perífrasis viva y productiva, y esa forma NO está entre las opciones — el hueco no
       está pidiendo eso.
    4. Reductio (Opus): si esto contara como ambigüedad, ningún hueco de congiuntivo passato sería
       válido nunca, porque a casi cualquiera se le acopla un imperfetto con lectura progresiva
       imaginada. El contraste passato/imperfetto se volvería inenseñable.
    5. Alcance real: los dos coinciden en que la objeción NO es uniforme sobre las seis. `spera che`
       es inmune (`*spera che io facessi` es agramatical, exige `sperava`); `è strano che ... domenica
       scorsa` lo bloquea por deíctico de ocasión única; la concesiva con `benché` no tiene lectura de
       rescate. El eslabón más débil es `mi sembra che` (variante 2), el único disparador que las
       gramáticas citan como receptor natural de la concordanza anómala — y ninguno de los dos lo
       considera roto, porque la idiomaticidad de `fare i compiti` como tarea cerrada sigue empujando
       a la lectura perfectiva.
    6. Blindaje mínimo, propuesto por los dos INDEPENDIENTEMENTE y coincidiendo en el literal:
       `tutti i compiti` en vez de `i compiti`. La cuantificación exhaustiva del objeto fuerza la
       lectura de logro («estar haciendo TODOS los deberes sin terminar» es mucho más forzado) sin
       tocar ninguno de los seis marcadores. Una sola palabra.

    DESCARTADO de la respuesta de Opus: propuso añadir el gloss español al prompt como cierre del
    aspecto. Choca con el 0-gloss del verbo de D-42-13 — en esta categoría un gloss sobre el verbo
    entrega modo y tiempo a la vez, que es doble leak R1. Su otra comprobación sí se hizo: la
    objeción sería correcta si el hueco llevara un predicado estativo, y aquí el hueco es siempre
    `fare`.

    Contra el veredicto de DeepSeek pesan además 4 pases `correcta` de Opus y Sonnet sobre este slot
    (2 en la pasada base y 2 en el re-pase), y que su PRIMERA objeción sobre el mismo slot fue otra
    — la de `stamattina`, que era REAL y quedó arreglada. Es el patrón de ruido en lo sutil.
  missing:
    - "DECISIÓN DE AUTOR entre dos caminos, los dos con la evidencia ya reunida: (a) override de
       autor sobre `passato` con audit trail (VAL-08, `by: \"autor\"`, `verdict: \"correcta\"`),
       apoyado en la adjudicación de arriba — no es override-atajo, el trabajo está hecho; o (b)
       blindar con `tutti i compiti` en las 6 variantes y re-pasar el quórum."
    - "En los dos casos, `VAL_07_STRICT=1` sigue rojo hasta que `passato` deje de estar `disputed`."
  root_cause: "Ruido de juicio de un solo vendor sobre una distinción aspectual fina, no defecto de
    contenido. La objeción generaliza a un predicado télico un mecanismo que la gramática italiana
    documenta para estativos, y confunde «existe una frase italiana con esta forma» con «esta forma
    responde a este prompt»."
  debug_session: ""

- gap_id: G-42-2
  truth: "Ninguna de las 30 variantes admite una segunda lectura defendible; en particular el marco de
    concordancia de `passato` excluye limpiamente los dos tiempos simples del subjuntivo."
  status: resolved
  resolved_by: "af41c98 — `stamattina` -> `ieri mattina` en el prompt, el ejemplo de la explanation,
    la lista del notes y la tabla CANON del test; audit trail en el notes"
  resolved_at: 2026-08-06
  resolved_note: "La objeción NO reapareció en el re-pase: los tres pases se pronuncian sobre el slot
    y ninguno vuelve a `stamattina`. Con `ieri mattina` el aspecto queda cerrado y el congiuntivo
    presente vuelve a caer, que era el mecanismo que D-42-09 prometía."
  reason: "deepseek-reasoner, [C2-una_opcion] sobre `fare-congiuntivo-passato` variante 1 (tu):
    «Il professore dubita che tu ___ il lavoro stamattina.» con key `abbia fatto`. La distractora
    `faccia` (congiuntivo presente) es defendible: `dubita che tu faccia il lavoro stamattina` es
    italiano correcto si `stamattina` se lee como la mañana de hoy todavía en curso. El marcador no
    fuerza la lectura de anterioridad, así que la variante tiene dos respuestas válidas."
  severity: blocker
  test: 2
  artifacts:
    - path: "content/exercises/fare-congiuntivo.json"
      issue: "`fare-congiuntivo-passato` variants[1].prompt — marcador `stamattina`"
  missing:
    - "Sustituir `stamattina` por un marcador inequívocamente pasado, coherente con los otros cinco
       del slot (`ieri sera`, `la settimana scorsa`, `domenica scorsa`, `sabato scorso`,
       `il mese scorso`) y distinto de todos ellos — el notes exige los seis distintos entre sí."
    - "Re-pasar el quórum sobre `fare-congiuntivo-passato` tras el fix (sticky disputed: un tercer
       `correcta` NO limpia el estado, hay que reemplazar los passes o registrar override de autor)."
  root_cause: "El notes declara que los seis marcadores del slot sitúan la acción como ya terminada,
    pero `stamattina` es deíctico a HOY y no cumple esa propiedad: los otros cinco son inequívocamente
    pasados, y ese es el único de los seis que admite lectura de acción en curso. El blindaje de
    concordancia de D-42-09 se apoya en dos patas, la principal en presente y el marcador de acción
    terminada; en esta variante la segunda pata no sostiene, así que el congiuntivo presente no cae
    por aspecto y sobrevive como respuesta defendible."
  debug_session: ""

- gap_id: G-42-1
  truth: "Los 5 slots quedan `validation.status: \"validated\"` y `VAL_07_STRICT=1` pasa a verde."
  status: resolved
  resolved_by: "af41c98 — la excepción del gloss léxico de conjunción se escribe en R1 y en el detalle
    de C5 de 09-VALIDATION-PROMPT.md, con su límite explícito (no cubre el gloss sobre la forma verbal
    ni sobre la palabra del blank); el aviso de D-42-13 en el notes se reescribe"
  resolved_at: 2026-08-06
  resolved_note: "Cerrado en la CAUSA y no por override: `fare-congiuntivo-presente` pasa a
    `validated` con los tres pases `correcta`. Opus lo razona explícitamente, «the Benché (aunque)
    gloss is the declared R1/C5 subordinating-conjunction exception, not a leak». El contenido no se
    tocó — el gloss se queda. El arreglo sirve a toda validación futura del proyecto, no solo a esta
    categoría."
  reason: "`fare-congiuntivo-presente` queda disputed: claude-sonnet-5 y deepseek-reasoner emiten
    [C5-leak] sobre el gloss de conjunción `Benché (aunque)` de la variante 3 (noi). D-42-13 preveía
    este flag como falso positivo de política, pero lo condicionaba a que viniese de Gemini/DeepSeek
    «porque la base de aprobación es Claude Opus más Sonnet» — y aquí lo levanta Sonnet."
  severity: major
  test: 1
  artifacts:
    - path: "content/exercises/fare-congiuntivo.json"
      issue: "`fare-congiuntivo-presente` variants[3].prompt — gloss `(aunque)` sobre `Benché`"
    - path: "content/exercises/fare-congiuntivo.json"
      issue: "`notes`, D-42-13 — el aviso al quórum nombra solo Gemini y DeepSeek como fuente
        esperada del flag; el supuesto quedó invalidado"
  missing:
    - "DECISIÓN DE AUTOR, no arreglo mecánico: o se quita el gloss de los 4 prompts que lo llevan
       (2 `Benché`, 1 `Nonostante`, 1 `Prima che`) y se mueve a la explanation, o se mantiene el
       canon y se registra override de autor con audit trail (VAL-08, `by: \"autor\"`)."
    - "Si se mantiene el canon: reescribir el aviso de D-42-13 en `notes` para que declare que el
       flag puede venir TAMBIÉN de la base Claude, y decir qué se hace entonces — tal como está,
       el aviso predice un mundo que esta pasada ya refutó."
  root_cause: "El flag no se distribuye por proveedor sino por variante: Sonnet aprobó el mismo gloss
    en `imperfetto` (`Nonostante (a pesar de que)`), en `passato` (`Benché (aunque)`) y en las dos del
    `disparador` (`Benché`, `Prima che`), y solo lo marcó en `presente`. DeepSeek hizo lo mismo:
    aprobó el gloss de `imperfetto` y marcó el de `presente`. Es decir, los dos disidentes son
    internamente inconsistentes consigo mismos sobre el mismo patrón, lo que apunta a ruido de
    juicio sobre una regla que R1 no resuelve explícitamente (R1 declara una sola excepción, las
    etiquetas neutras (masc)/(fem), y el gloss léxico de conjunción no está en el texto de R1 —
    vive solo en el notes del proyecto, que el subagent no ve). El desacuerdo es de POLÍTICA no
    escrita en el prompt, no de italiano."
  debug_session: ""
