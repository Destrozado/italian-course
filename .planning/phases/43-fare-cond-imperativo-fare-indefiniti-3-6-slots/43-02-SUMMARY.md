---
phase: 43-fare-cond-imperativo-fare-indefiniti-3-6-slots
plan: 02
subsystem: content
tags: [json-content, italiano, formas-indefinidas, infinito, participio, gerundio, quorum, node-test, categories-registry, validation-prompt]

# Dependency graph
requires:
  - phase: 40-migraci-n-12-13-reset-selectivo-preventivo-de-las-4-categor-
    provides: "el slug `fare-indefiniti` ya en RESET_PREFIXES_V13 (src/data/storage.js:1345) y el aviso del prefijo compartido `fare-ind` (D-40-03)"
  - phase: 41-fare-indicativo-8-slots-el-bloque-grande
    provides: "el SCOPE-GATE del objeto literal (D-41-06, conjunto cerrado de 7), el 0-gloss del verbo (D-41-05) y las arcaicas de la blacklist (D-41-08)"
  - phase: 42-fare-congiuntivo-4-slots-hom-grafas-disparador
    provides: "el molde de forma de content/exercises/fare-congiuntivo.json y el molde de test de 13 describe con WR-01..WR-11 e IN-03..IN-09"
  - plan: 43-01
    provides: "content/categories.json con 17 entradas y order contiguos, la linea de smoke de fare-cond-imperativo, el hermano tests/content-fare-cond-imperativo.test.js, y las formas conjugadas de condizionale/imperativo que aqui son AUSENCIA"
provides:
  - "categoria `fare-indefiniti` registrada (order 18) y cargando en boot por el camino generico, como unidad de reset independiente de las otras tres de `fare`"
  - "6 slots multiple-choice / 18 variantes con el eje de variante CONTEXTO y nunca la persona: infinito presente (3), infinito passato (3), participio passato (4), participio presente (2), gerundio presente (3), gerundio passato (3)"
  - "el CUARTO MAGNET del milestone resuelto con audit trail: key `aver fatto`, `avere fatto` a blacklist declarada y nombrada en la explanation"
  - "el gate HARD de pronombre del participio passato en su forma satisfacible: solo 3a plural antepuesta, 0 pronombres de concordancia opcional o partitiva, 0 bigramas de singular elidido"
  - "la EXCEPCION ACOTADA de D-43-18 escrita en los DOS sitios que la hacen efectiva: el `notes` del fichero y la seccion 7 de 09-VALIDATION-PROMPT.md"
  - "WR-01 declarado: la concordancia del participio con objeto POSPUESTO es italiano literario/antiguo, se mantiene como distractora (el pool cerrado de D-43-16 no deja alternativa) y va documentada en notes + explanation + seccion 7.4 del prompt de quorum, con gate que congela la decision"
  - "tests/content-fare-indefiniti.test.js — 13 describe / 92 tests de invariantes permanentes, con 5 desviaciones declaradas y 60 pruebas negativas ejecutadas (12 de autoria + 3 de CR-02 + 4 de WR-01 + 41 post-quorum)"
  - "la ruta del prompt de validacion arreglada en los dos skills del quorum (defecto preexistente del archivado de v1.1)"
affects: [44-integracion-counts-cruces, INT-02, INT-03, INT-04, quorum-top-level]

# Actuals (#2632)
actuals:
  tokens: 45406
  tasks: 5
  commits: 12

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "VARIANT_TABLE con `pos: antes|despues|libre` — el cue declarado se comprueba por ADYACENCIA al hueco, no por presencia en cualquier punto del prompt"
    - "gate de doble validez cerrado por exclusion de la distractora en la variante concreta donde seria defendible (participio invariable fuera de las options con hueco inicial o adverbial de anterioridad; infinito compuesto fuera de la variante modal)"
    - "excepcion a un gate global enumerada POR ID DE SLOT y con obligacion sustitutoria, mas su reciproco: el literal exento prohibido en las variantes no exentas"
    - "assert de satisfacibilidad: POOL y CONJUGATE disjuntos, para que el gate de interseccion vacia no sea verde por vacuidad"
    - "frontera de palabra en los escaneos de PRESENCIA y de ADYACENCIA, no solo en los de ausencia: `terminaEnPalabra` / `empiezaPorPalabra` mas `wordish`, porque un gate de presencia matcheado por subcadena no se pone rojo, deja de morder (CR-02)"

key-files:
  created:
    - content/exercises/fare-indefiniti.json
    - tests/content-fare-indefiniti.test.js
  modified:
    - content/categories.json
    - tests/exercise-types.test.js
    - .planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md
    - .claude/skills/gsd-validate-exercise/SKILL.md
    - .claude/skills/gsd-validate-batch/SKILL.md

key-decisions:
  - "El participio invariable `fatto` queda FUERA de las options en las tres variantes donde el hueco abre oracion o va tras un adverbial de anterioridad: `Fatto i compiti la sera prima, ...` y `Fatto tutto in fretta, ...` son participios absolutos GRAMATICALES en italiano, asi que ofrecerlo alli habria creado una segunda respuesta defendible. El plan no lo preveia; sale del mismo criterio operativo de la blacklist que 43-01 aplico a `sarei fatto`."
  - "Las dos variantes de concordancia usan dislocacion SIN puntuacion fuerte (`Marco ha preso i compiti e li ha ___ ieri sera.`) en vez de la interrogacion tematizadora del plan (`I compiti? Marco li ha ___`): con la interrogacion el antecedente queda en mayuscula inicial y el gate del objeto literal, que compara por `includes` sensible a mayusculas, no lo veria; y partiendo por `:` o por `?` el antecedente saldria fuera de la clausula del hueco y el gate contaria 0 objetos."
  - "El escaneo de CONJUGATE se deriva LEYENDO los tres JSON de las otras categorias, no declarando la lista a mano, y se acompana de un assert de disjuncion con POOL: sin ese segundo assert, el gate de interseccion vacia podria estar verde por vacuidad o rojo por construccion sin que nadie supiera cual de las dos cosas pasa."
  - "Los punteros a la seccion 7 del prompt de validacion se anaden como PARRAFOS NUEVOS y no ampliando la frase final de cada criterio, para que `git diff --stat` sobre ese fichero muestre solo adiciones y cero borrados — el criterio de aceptacion que garantiza que ninguna regla existente se altero."
  - "`fare-indefiniti-participio-presente` es el UNICO slot sin ninguna key repetida (facente / facenti). La cabecera del test lo declara y el bloque 2 lo congela con tres asserts (5 slots con alguna repeticion, 4 con todas iguales, el participio presente con 2 distintas)."

patterns-established:
  - "Adyacencia declarada: cuando lo que hace unica la respuesta es la palabra pegada al hueco (negacion, preposicion, modal, verbo de estado, particula concesiva, sustantivo del compuesto), el gate comprueba la ADYACENCIA y no la presencia. Pero con frontera de palabra en los dos extremos (`terminaEnPalabra` / `empiezaPorPalabra`), nunca con `endsWith` / `startsWith` a pelo: `Martha` termina en `ha` y `questa` en `sta`, asi que el matcher crudo aceptaria un nombre propio como auxiliar (corregido en CR-02)."
  - "Excepcion acotada bidireccional: la exencion va por id de slot Y el literal exento se prohibe explicitamente en las variantes no exentas. Sin la segunda mitad la exencion es global de facto."
  - "Interferencia de USO frente a interferencia de FORMA: cuando el hispanohablante construye bien pero usa de mas (stare + gerundio), la explanation tiene que decir eso y no explicar la formacion, que no es donde esta el error."
  - "Excepcion que el quorum tiene que ver: se escribe en 09-VALIDATION-PROMPT.md ANTES de la linea de cierre y con puntero desde el criterio afectado, porque el subagent evalua criterio a criterio y una seccion al final puede pasarle desapercibida."
  - "UN GATE TEMATICO SE ESCRIBE CONTRA EL DEFECTO, NO CONTRA SU ULTIMA SUPERFICIE. El gate de la 5a ronda cubria las aperturas (`Aparece cuando`) y el mismo defecto volvio como predicado de articulo determinado (`es la señal`), invisible para el. Cuando se amplia un gate tematico hay que enumerar las FAMILIAS de superficie con las que la generalizacion puede manifestarse, y verificarlo contra el texto ofensor ANTES de arreglarlo: si el gate ampliado no lo pone rojo, no sirve."
  - "Un gate de ausencia sobre una lista necesita su gemelo POSITIVO cuando el defecto puede ser la INCOMPLETITUD: prohibir formulas no impide que la enumeracion se quede corta, y una lista incompleta se lee como exhaustiva y entonces es falsa en el caso que deja fuera. Y el positivo tiene que mirar la FRASE, no el texto: comprobar presencia global pasa limpia si el literal aparece en otro parrafo por otro motivo."
  - "Toda comparacion de literales sobre prosa va INSENSIBLE A MAYUSCULAS: la posicion donde una formula aparece de verdad es el inicio de oracion, que es justo la que un `includes` sensible no ve. Es el mismo agujero que WR-10 documento para `wordish`, repetido en un gate nuevo dos dias despues."
  - "Una CONDICION GENERAL DE APARICION («aparece cuando...», «se usa cuando...») es una violacion de P1 aunque no lleve ningun adverbio absoluto: enuncia algo sobre toda la lengua. Es el tipo de defecto que sobrevive a cuatro rondas de gates de literal, porque los gates buscaban formulas absolutas y esta no lo era. Cuando el defecto es de TIPO y no de redaccion, el gate va por FAMILIA DE APERTURAS y se verifica con varias formulaciones distintas del mismo tema, no con una."
  - "El punto pedagogico de un slot necesita gate PROPIO, no puede quedarse cubierto por los literales vecinos. En este fichero el par de la interferencia (`non fare` frente a `no hagas`) estaba exigido por el requisito y confirmado por los evaluadores desde la primera ronda, y sin embargo borrar la mitad espanola dejaba la suite VERDE: los tres literales que el gate comprobaba sobrevivian. Un requisito que se cumple por costumbre y no por gate es el mismo patron que CR-02 y que la etiqueta inventada — y solo aparece si se muta cada mitad por separado."
  - "LAS TRES PROHIBICIONES para una explanation de contenido, destiladas de cuatro rondas de quorum en las que TRES defectos los introdujo el arreglo del anterior. P1: ninguna afirmacion sobre la lengua mas alla de lo que el slot examina — cada regla general compra una excepcion y el quorum la encuentra. P2: ninguna descripcion de la estructura del propio ejercicio (conteos, enumeraciones, taxonomias), que caduca en cuanto se toca el contenido. P3: ninguna explicacion de por que falla cada distractora — cada «X no encaja porque...» es una afirmacion general disfrazada. Queda la formacion, que marca frente a su alternativa, y la interferencia real con la L1 donde exista."
  - "Un gate puede EXIGIR el defecto, no solo permitirlo. El gate que obligaba a nombrar por que falla cada distractora mandaba escribir justo lo que P3 veta, y ahi nacieron dos de las falsedades. Cuando un gate de PRESENCIA pide prosa explicativa, hay que preguntarse si esta pidiendo una afirmacion general; los gates que miran el CONTENIDO (options, concordancia) no tienen ese problema y son los que se conservan."
  - "Aplicar varias prohibiciones a la vez tiende a llevarse requisitos por delante: hay que anadir mutaciones que RECORTEN DE MAS (stub por slot, perdida del punto pedagogico obligatorio) para demostrar que los gates de presencia siguen mordiendo. El riesgo simetrico del recorte es tan real como el del crecimiento."
  - "Las listas de literales prohibidos van POR SLOT y nunca globales: lo que un slot no examina, otro si. `participio invariable` es falso en el gerundio passato y correcto en el participio passato con objeto pospuesto, asi que una lista global prohibiria la verdad en el slot de al lado."
  - "DI MENOS: una explanation explica SUS PROPIAS FRASES, no la gramatica de su tema. Cuando un texto necesita tres rondas de correccion con tres motivos distintos, el defecto no es ninguna de las frases: es que intenta enunciar una regla general con excepciones en cada casilla, y cada vez que se completa un poco mas entra una falsedad. Todo lo que afirme sobre casos que el slot NO presenta es superficie de error sin valor pedagogico — el alumno acaba de fallar una de estas frases, no esta estudiando el capitulo. Senal de que sobraba: al recortar desaparecieron cuatro de los cinco hallazgos."
  - "Cuando el mecanismo del defecto es el CRECIMIENTO del texto y no una frase concreta, el gate es un TOPE DE LONGITUD y no una lista de literales. No impide escribir una falsedad; impide que el texto vuelva a crecer hacia donde las tres falsedades entraron."
  - "Una etiqueta declarativa inventada deja el gate que la consume VERDE sobre un dato falso (aqui: dos variantes estructuralmente identicas etiquetadas temporal y causal, con el gate de tipos distintos por slot pasando). Cuando la taxonomia no describe el contenido, se corrige la ETIQUETA y se enumera la excepcion — no se conserva la etiqueta para que el gate siga pasando."
  - "Para restaurar un fichero tras una mutacion se usa una COPIA del fichero, nunca `git checkout`: sobre trabajo no commiteado, el checkout lo borra. Vale igual para el fichero de test que para el JSON de contenido."
  - "No afirmar que una forma italiana es imposible sin haberlo comprobado forma por forma y CONTEXTO por contexto; si la regla real lleva una condicion, escribir la condicion, que sale mas corta que la excepcion que evita. En esta fase tres explanations afirmaron imposibilidad en falso y DOS de las tres las introdujo el arreglo de la anterior: al reencuadrar una variante hay que releer el explanation del slot, porque las frases que la describian quedan huerfanas y una frase huerfana que generaliza es peor que una irrelevante."
  - "Mecanizar esa regla como TRIPWIRE y decirlo: un gate de literales caza la formula (`es agramatical`, `nunca se usa`), no la falsedad, y no puede cazar una condicional falsa. Corolario: no meter en la lista un literal que aparece dentro de una condicional verificada (`deja de ser posible` en el infinito passato) — seria cargo-culting sobre prosa correcta. Y no aplicarlo al `notes`, que tiene que NOMBRAR las afirmaciones corregidas."
  - "Una premisa lingüistica floja no se arregla endureciendo el material, se arregla rebajando la afirmacion. Ante un encaje que NO impone lo que la explanation decia, reformularlo para que si lo imponga significa fabricar una rigidez que la lengua no tiene — el mismo defecto otra vez, con una explanation nueva y mas segura de si misma. Se rebaja la afirmacion y se retira la distractora que era defendible (quorum base, gerundio passato)."
  - "Retirar una distractora por defendible deja un agujero en el criterio de distractoras: hay que reponerla con otra que sea PLAUSIBLE y honestamente incorrecta, no dejar el slot con opciones descartables de un vistazo. Aqui el sustituto es el calco espanol real (infinitivo donde el italiano pide gerundio)."
  - "Cuando un gate se invierte (antes exigia presencia, ahora exige ausencia), el mensaje del assert tiene que contar la premisa corregida, no el conteo: lo que un re-pase futuro debe leer en el diff es por que cambio, no que cambio."
  - "Forma atestiguada como distractora: NO siempre se veta. Si compite en el MISMO registro contemporaneo que la key, se blacklistea (cuarto magnet). Si pertenece a otro registro historico y el pool cerrado del slot hace imposible retirarla, se DECLARA — notes + explanation + prompt de quorum — y se congela con un gate A LA CONTRA, que exige que siga ofreciendose para que un re-pase futuro no la retire y rompa el eje (WR-01)."
  - "Excepcion nueva en un fichero con criterio de cero borrados: se anade como subseccion NUEVA al final de las existentes, aunque una anterior diga 'las dos excepciones'. Reescribir ese numero produciria un borrado; la subseccion nueva se autodeclara respecto al criterio que la anterior cerraba y remite a ella (WR-01, 7.4 tras 7.3)."
  - "Un gate de PRESENCIA matcheado por subcadena no falla: deja de morder. La disciplina de frontera de palabra que el proyecto aplicaba a los escaneos de ausencia vale igual para los de presencia y adyacencia, porque en italiano los cues cortos son sufijos y prefijos de palabras corrientes (`Michele`/`le`, `questa`/`sta`, `Purche`/`Pur`, `partenza`/`parte`). Una prueba por mutacion solo lo demuestra si se compara el gate ANTES y DESPUES: la mutacion puede saltar por otro gate y dar la falsa impresion de que el gate auditado funciona (CR-02)."

requirements-completed: [INDEF-01, INDEF-02, INDEF-03, INDEF-04]

coverage:
  - id: D1
    description: "Infinito presente y infinito passato con la eleccion por ANTERIORIDAD respecto a la principal, el infinito simple como distractora del calco en las 3 variantes del compuesto, y el cuarto magnet resuelto (key elidida, no elidida en blacklist y nombrada en la explanation)"
    requirement: INDEF-01
    verification:
      - kind: unit
        ref: "tests/content-fare-indefiniti.test.js#fare-indefiniti — infinito passato, el cuarto magnet, e imperativo negativo non fare (D-43-17, D-43-14)"
        status: pass
      - kind: unit
        ref: "tests/content-fare-indefiniti.test.js#fare-indefiniti — pool CERRADO de options, cero formas conjugadas (D-43-13, SC-3)"
        status: pass
      - kind: other
        ref: "mutaciones 4 y 9 (la grafia no elidida en options / prompt sin marcador de anterioridad): las dos ponen el gate en rojo nombrando D-43-17 e INDEF-01"
        status: pass
    human_judgment: false
  - id: D2
    description: "Participio passato en su doble comportamiento: 2 variantes invariables con el auxiliar de posesion y objeto pospuesto, 2 concordadas con pronombre objeto directo antepuesto, con el mismo pool de las cuatro terminaciones en las 4 y el gate HARD que deja fuera todo pronombre que haria la concordancia opcional o ambigua"
    requirement: INDEF-02
    verification:
      - kind: unit
        ref: "tests/content-fare-indefiniti.test.js#fare-indefiniti — participio passato, las 4 terminaciones y el gate HARD de pronombre (D-43-16, SC-4)"
        status: pass
      - kind: unit
        ref: "tests/content-fare-indefiniti.test.js#EN POSITIVO: la explanation del participio passato lleva el par de la interferencia (D-43-16, SC-4)"
        status: pass
      - kind: other
        ref: "mutaciones 2 y 3 (pronombre de concordancia opcional / pronombre singular antepuesto con auxiliar elidido): las dos ponen el gate en rojo nombrando D-43-16"
        status: pass
    human_judgment: false
  - id: D3
    description: "Participio presente con 2 variantes construidas sobre sus dos compuestos reales, sin ningun contexto inventado, y con la NOTA DE REGISTRO explicita en la explanation (burocratico, fosilizado, vive en compuestos)"
    requirement: INDEF-03
    verification:
      - kind: unit
        ref: "tests/content-fare-indefiniti.test.js#fare-indefiniti — SCOPE-GATE lexico con la excepcion acotada del participio presente (D-41-06, D-43-18)"
        status: pass
      - kind: unit
        ref: "tests/content-fare-indefiniti.test.js#EN POSITIVO: la explanation del participio presente lleva la NOTA DE REGISTRO (INDEF-03, SC-4)"
        status: pass
      - kind: other
        ref: "mutaciones 5 y 11 (el compuesto fuera de su slot / un tercer contexto de facente): la primera nombra D-43-18 y la segunda INDEF-03 y D-43-03"
        status: pass
    human_judgment: false
  - id: D4
    description: "Gerundio presente y gerundio passato, incluido `stare + gerundio` como progresivo en una variante propia, con la explanation desarrollando que la interferencia real es usarlo de MAS y no formarlo mal"
    requirement: INDEF-04
    verification:
      - kind: unit
        ref: "tests/content-fare-indefiniti.test.js#fare-indefiniti — contextos, objetos y marco progresivo por variante (D-43-12, D-43-15)"
        status: pass
      - kind: unit
        ref: "tests/content-fare-indefiniti.test.js#EN POSITIVO: la explanation del gerundio presente dice que el error es usarlo DE MAS (D-43-15)"
        status: pass
      - kind: other
        ref: "mutaciones 10 y 12 (gerundio simple en la variante concesiva / marco progresivo sin el verbo de estado): las dos ponen el gate en rojo"
        status: pass
    human_judgment: false
  - id: D5
    description: "Registro de la categoria: entrada order 18 en content/categories.json como unidad de reset SEPARADA de fare-cond-imperativo y de fare-indicativo pese al prefijo compartido, cargando en boot sin una linea de motor nueva"
    verification:
      - kind: unit
        ref: "tests/content-fare-indefiniti.test.js#fare-indefiniti — registro de la categoria (D-43-22, SC-5)"
        status: pass
      - kind: integration
        ref: "node --test tests/domain.test.js (schema-validator sobre el bundle auto-descubierto) + git diff --quiet src/screens/app.js src/domain/ src/data/ (exit 0)"
        status: pass
    human_judgment: false
  - id: D6
    description: "La excepcion de la fase llega al subagent del quorum: seccion 7 de 09-VALIDATION-PROMPT.md antes de la linea de cierre, con punteros desde C1/C2/C3, y la ruta del fichero arreglada en los dos skills"
    verification:
      - kind: integration
        ref: "node -e sobre el prompt: indice de la seccion 7 anterior al de `Fin del prompt`, guard de la seccion 6 intacto, `falso positivo` x2, punteros en los 3 criterios; git diff --stat = 33 insertions / 0 deletions; grep de la ruta obsoleta = 0 en los dos skills"
        status: pass
    human_judgment: false
  - id: D8
    description: "Los 6 slots pasan el quorum base Opus+Sonnet, mas la ronda EXTRA DeepSeek de D-43-20 sobre infinito passato y participio passato"
    verification:
      - kind: other
        ref: "quorum base top-level, 1 ejercicio por contexto (VAL-03), TRES rondas. 1a ronda: 3 validated a la primera (los 3 con excepcion declarada en el prompt), 1 validated por override del autor con los 4 pases de modelo preservados, 2 disputed arreglados en dc2450a. 2a ronda: 4 validated, y los 2 restantes eran de PROSA espanola del explanation (C1/C2/C3/C5 pasan en los dos segun ambas IAs), arreglados en b83f11a — concordancia de genero del pronombre y la condicion del introductor. 3a ronda: 4 validated, gerundio-passato recortado en 90e0c3a tras el hallazgo que las DOS IAs alcanzaron por separado (la taxonomia de encajes no describia el contenido, y la etiqueta falsa dejaba verde el gate de tipos distintos), e infinito-presente en disputed. 4a ronda: la mecanica cerrada en los dos (Opus verifico las 12 combinaciones del gerundio passato), y los 2 textos reescritos en b1e101e bajo tres prohibiciones estructurales, porque el recorte de la 3a habia introducido dos falsedades nuevas al comprimir; el autor decidio corregir infinito-presente en vez de dar override. 5a ronda: gerundio-passato validated, e infinito-presente arreglado en 9d4e1a4 retirando una CONDICION GENERAL DE APARICION que las cuatro rondas anteriores no habian aislado por no llevar ninguna formula absoluta. 6a ronda: infinito-presente arreglado en be0acb3 completando la enumeracion de disparadores, y el gate tematico ampliado del ULTIMA SUPERFICIE del defecto al defecto, verificado contra la frase antes de arreglarla"
        status: pass
      - kind: unit
        ref: "tests/content-fare-indefiniti.test.js#PREMISA CORREGIDA: el gerundio SIMPLE no entra en NINGUNA variante del gerundio passato + #PREMISA CORREGIDA: las 3 variantes del gerundio passato ofrecen el CALCO + #la explanation del infinito presente usa el pronombre preposicional correcto (C4, errata de espanol)"
        status: pass
    human_judgment: false
  - id: D7
    description: "Unicidad de lectura de cada una de las 18 variantes: que ninguna admita una segunda respuesta defendible (el infinito simple sin marcador de anterioridad, la forma invariable con pronombre ambiguo, el participio absoluto donde el hueco abre oracion, el gerundio compuesto en una implicita)"
    verification:
      - kind: manual_procedural
        ref: "checkpoint Task 2 (tracer) — auto-aprobado por el orquestador en --auto (gate=blocking, no blocking-human) con revision explicita de los 3 encajes y de la unicidad; las 15 variantes restantes quedan para el pase TOP-LEVEL de quorum + la ronda EXTRA DeepSeek de los 2 slots de D-43-20"
        status: unknown
    human_judgment: true
    rationale: "Es juicio linguistico que ninguna asercion mecanica puede cerrar. Los gates automatizados (anterioridad, pronombre, adyacencia del cue, exclusion por variante) acotan los cuatro vectores conocidos, pero no demuestran la unicidad. El plan lo marca `backstop` para la variante causal del gerundio passato; la red real es el quorum base Opus+Sonnet mas la ronda EXTRA DeepSeek sobre las 7 variantes de los dos slots mas delicados."

# Metrics
duration: 30min
completed: 2026-08-07
status: complete
---

# Phase 43 Plan 02: `fare-indefiniti` Summary

**Categoria `fare-indefiniti` autorada de punta a punta — 6 slots multiple-choice / 18 variantes del paradigma NO PERSONAL con el eje de variante CONTEXTO y nunca la persona, el CUARTO MAGNET del milestone (`aver fatto` frente a `avere fatto`) resuelto con audit trail, el gate HARD de pronombre en su forma satisfacible, y la excepcion acotada de `facente` escrita en los dos sitios que la hacen efectiva: el `notes` y el prompt del quorum, con su ruta arreglada en los skills.**

## Performance

- **Duration:** 30 min
- **Started:** 2026-08-07T01:50:00Z
- **Completed:** 2026-08-07T02:20:30Z
- **Tasks:** 5 (4 de ejecucion + 1 checkpoint)
- **Files modified:** 7 (2 creados, 5 modificados)
- **Suite:** 912 pass / 0 fail (baseline) -> **995 pass / 0 fail**; **1027** tras CR-02, WR-01, las seis rondas de quorum y los fixes de 43-01

## Accomplishments

- **INDEF-01** — `fare-indefiniti-infinito-presente` (3 variantes, key `fare`) y `fare-indefiniti-infinito-passato` (3, key `aver fatto`). La decision que el par examina es la ANTERIORIDAD, forzada de forma comprobable en las 3 del compuesto: o la preposicion de posterioridad gobierna la clausula del hueco, o esa clausula lleva un deictico del conjunto cerrado. El infinito simple esta entre las options de las 3, porque es el calco espanol exacto. **CUARTO MAGNET resuelto:** `avere fatto` no aparece en ningun `prompt` ni en ninguna `options[]` de las 18, esta en la blacklist con audit trail, y la explanation dice que tambien es correcta y que la elidida es la normal.
- **INDEF-02** — `fare-indefiniti-participio-passato`, **4** variantes con el MISMO pool de las cuatro terminaciones en las 4 y keys `fatto` / `fatto` / `fatti` / `fatte`. Reparto 2 invariables (objeto pospuesto, sin pronombre antepuesto) + 2 concordadas (pronombre de 3a PLURAL antepuesto), y el gate comprueba que ese reparto sea coherente con las keys y no solo con la tabla. **Gate HARD:** 0 apariciones por palabra suelta de los cuatro pronombres de concordancia opcional ni del partitivo, y 0 bigramas de singular antepuesto (elididos o no), que es la forma satisfacible de D-43-16 que el plan derivo en §Correcciones 5.
- **INDEF-03** — `fare-indefiniti-participio-presente`, **2** variantes y no 3, sobre los dos compuestos reales declarados y ni un contexto inventado. La explanation lleva la NOTA DE REGISTRO literal que el requisito exige (real pero burocratica, fosilizada, vive en esos compuestos, entra para completar el paradigma). La EXCEPCION al SCOPE-GATE va enumerada por id de slot y es **bidireccional**: las 2 exentas deben llevar su compuesto inmediatamente tras el hueco, y las otras 16 no pueden contener esos literales.
- **INDEF-04** — `fare-indefiniti-gerundio-presente` (3, key `facendo`) y `fare-indefiniti-gerundio-passato` (3, key `avendo fatto`). `stare + gerundio` se EXAMINA en una variante propia con el verbo de estado inmediatamente antes del hueco, y su explanation desarrolla que la interferencia real es de USO —el italiano lo restringe a la accion en curso ahora mismo y el hispanohablante lo usa **de mas**— y no de formacion.
- **SC-5** — las DOS categorias de la fase cargan como unidades de reset SEPARADAS: `order: 17` y `order: 18`, dos filas, dos entradas distintas pese a compartir el prefijo `fare-ind` con `fare-indicativo`. `git diff --quiet src/screens/app.js src/domain/ src/data/` sale con **exit 0**: cero lineas de motor para servir un slot de 2, uno de 3 y uno de 4.
- **Prerequisito del hand-off cumplido** — la seccion 7 de `09-VALIDATION-PROMPT.md` existe, esta ANTES de la linea de cierre, el guard anti prompt-injection sigue intacto, el diff es de **solo adiciones**, y los tres punteros estan en C1, C2 y C3. Los dos skills apuntan ya a la ruta real, asi que el quorum base Opus+Sonnet vera la excepcion y no solo DeepSeek.

## Task Commits

1. **Task 1 (tracer): registro order 18 + `notes` completo + infinito presente** — `e36f4c1` (feat)
2. **Task 2: checkpoint del tracer** — sin commit; auto-aprobado por el orquestador en `--auto` (`gate="blocking"`, no `blocking-human`), con revision explicita de los tres encajes y de la unicidad de lectura
3. **Task 3: infinito passato (cuarto magnet) y participio passato (gate HARD)** — `29f909a` (feat)
4. **Task 4: participio presente, gerundio presente y gerundio passato** — `85a7a97` (feat)
5. **Task 5: `tests/content-fare-indefiniti.test.js` (13 describe) + prompt de validacion + rutas de skills** — `ff7d800` (test)

**Post-review:** `20a5cc6` (fix) — CR-02, `6495443` (fix) — WR-01, y `dc2450a`, `b83f11a`, `90e0c3a`, `b1e101e`, `9d4e1a4` y `be0acb3` (fix) — las seis rondas de quorum. Ver sus secciones propias mas abajo.

**Plan metadata:** ver commit `docs(43-02)` al cierre.

## Files Created/Modified

- `content/exercises/fare-indefiniti.json` — **creado**, 269 lineas. 2 claves top-level; `notes` de 20.109 caracteres con las 13 declaraciones (identidad y volumen, EJE = CONTEXTO, REPARTO DESIGUAL justificado slot a slot, CONJUNTO CERRADO DE TIPOS DE CONTEXTO con su reparto por variante, POOL CERRADO, CUARTO MAGNET, blacklist de 25 formas, GATE HARD DE PRONOMBRE, EXCEPCION ACOTADA AL SCOPE-GATE, RECONOCER NO PRODUCIR, NOTA DE REGISTRO, imperativo negativo como contexto, marco progresivo como uso, conjuntos cerrados de marcadores, decisiones de omision, nota de escaneo y nota de count-sync); 6 slots / 18 variantes en `pending`.
- `tests/content-fare-indefiniti.test.js` — **creado**, 1.927 lineas al cierre, 13 `describe` / 92 tests. Las CINCO desviaciones respecto del analogo declaradas en la cabecera, mas el COROLARIO de frontera de palabra de CR-02 y los gates de WR-01 y de la premisa corregida del gerundio passato.
- `content/categories.json` — **modificado**, 1 linea eliminada (la 17a reescrita con coma) y 2 anadidas. 18 entradas, `order` contiguos 1..18.
- `tests/exercise-types.test.js` — **modificado**, 1 linea + 1 comentario en `CATEGORIES_WITH_EXPLANATIONS`, con `expected` dinamico via `slotCountOf`.
- `.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md` — **modificado**, 33 insertions / **0 deletions**. Seccion 7 (7.1 participio presente fosilizado, 7.2 RECONOCER NO PRODUCIR, 7.3 lo que NO se relaja) mas los 3 punteros desde C1, C2 y C3.
- `.claude/skills/gsd-validate-exercise/SKILL.md` y `.claude/skills/gsd-validate-batch/SKILL.md` — **modificados**, 3 lineas en total, solo ruta. Ninguna regla, ningun paso, ningun modelo cambia.

## Decisions Made

Cinco decisiones de autoria dentro de la discrecion que 43-CONTEXT.md y el plan dejan abierta. Ninguna cambia una decision locked.

1. **El participio invariable `fatto` queda fuera de las options en tres variantes concretas.** El plan proponia para la causal del gerundio presente y para la temporal del gerundio passato distractoras que incluian el participio invariable. La comprobacion obligatoria variante a variante lo tumbo: con el hueco abriendo oracion, `Fatto i compiti la sera prima, io ho potuto dormire...` y `Fatto tutto in fretta, lei ha rotto un piatto` son **participios absolutos gramaticales** en italiano, no errores. Ofrecerlos habria producido una segunda respuesta defendible — exactamente el modo de fallo que la fase existe para cerrar, y el mismo razonamiento con que 43-01 descarto `sarei fatto`. En su lugar entran terminaciones con desacuerdo de genero o numero, agramaticales sin discusion. Queda escrito en el `notes` junto al gate de exclusion.

2. **Las dos variantes de concordancia usan dislocacion sin puntuacion fuerte.** El plan proponia `I compiti? Marco li ha ___ ieri sera.` y `Le foto? Noi le abbiamo ___ in montagna.`. Con esa forma el antecedente queda en mayuscula inicial y el gate del objeto literal, que compara por `includes` sensible a mayusculas como el analogo, no lo veria; y si se partiera por `?` o por `:`, el antecedente saldria fuera de la clausula del hueco y el gate contaria **0** objetos. Se resuelve con coordinacion (`Marco ha preso i compiti e li ha ___ ieri sera.`, `Anna vuole vedere le foto e noi le abbiamo ___ in montagna.`): el antecedente queda en la misma clausula, en minuscula, y el pronombre antepuesto sigue siendo el unico desambiguador. Se prefirio esto a relajar el gate a comparacion insensible a mayusculas, que habria debilitado el escaneo en las 18.

3. **`CONJUGATE` se deriva leyendo los tres JSON reales, y va con un assert de satisfacibilidad.** El plan admitia declararlo literal. Derivarlo hace que el gate siga al contenido de las otras tres categorias sin mantenimiento; el riesgo es que si alguna de ellas incorporase una forma no personal, la interseccion con `POOL` dejaria de ser vacia y el gate se volveria insatisfacible en silencio. Por eso el bloque 7 lleva un tercer assert que congela la disjuncion `POOL` / `CONJUGATE`: sin el, el gate de interseccion vacia podria ser verde por vacuidad o rojo por construccion sin que nadie supiera cual de las dos cosas pasa.

4. **Los punteros del prompt de validacion son parrafos nuevos.** Ampliar la frase final de cada criterio habria producido 3 deletions en el diff, y el criterio de aceptacion exige **solo adiciones y cero borrados** precisamente para demostrar que ninguna regla existente se altero. Como parrafos independientes el diff queda en 33 insertions / 0 deletions y la comprobacion es un gate real, no una lectura.

5. **El participio presente es el unico slot sin repeticion de key, y eso se congela.** La cabecera del test declara la desviacion de las keys repetidas por diseno, pero el hecho preciso es mas fino: cinco de los seis slots repiten **alguna** key, solo **cuatro** la repiten en todas sus variantes, el participio passato la repite dos veces por su reparto 2+2, y el participio presente (`facente` / `facenti`) no repite ninguna. Los tres asserts del bloque 2 congelan las tres cifras para que la repeticion sea intencional y comprobada, no un efecto colateral.

**Reparto concreto dentro de la discrecion del plan** (redaccion de las 18 variantes): 13 tipos de contexto declarados en conjunto cerrado, con 11 de ellos usados y todos distintos dentro de su slot salvo la excepcion enumerada del participio passato; los objetos salen de los 7 heredados mas la inflexion `le foto`, que es la que hace examinable la concordancia femenina plural (`le torte` queda declarada como disponible y sin usar).

## Deviations from Plan

Cero deviation rules de arquitectura o de bloqueo. Una sola aplicacion de **Rule 1 (auto-fix bug)**:

**[Rule 1 - Bug] El `notes` afirmaba un hecho falso sobre la repeticion de keys**
- **Found during:** Task 5, al escribir el gate del bloque 2 que congela esa afirmacion.
- **Issue:** el `notes` escrito en la Task 1 decia que *cinco de los seis slots repiten su key en todas sus variantes*. Es falso: solo cuatro la repiten en todas (`fare`, `aver fatto`, `facendo`, `avendo fatto`); el participio passato la repite dos veces por el reparto 2+2, y el participio presente no repite ninguna. El `notes` es el audit trail que un re-pase futuro lee como fuente, asi que una afirmacion falsa alli es un defecto real, no una imprecision de estilo.
- **Fix:** se reescribio la frase para dar las tres cifras exactas y nombrar el participio presente como el unico sin repeticion; y el assert del test se corrigio para comprobar las tres (5 con alguna repeticion, 4 con todas iguales, 2 keys distintas en el participio presente) en vez de una sola cifra equivocada.
- **Files modified:** `content/exercises/fare-indefiniti.json`, `tests/content-fare-indefiniti.test.js`
- **Commit:** `ff7d800`

Las cinco decisiones de la seccion anterior son ejercicio de la discrecion que el plan delega, y la nº 1 y la nº 2 son ademas el resultado exigido por comprobaciones que el propio plan ordena hacer (unicidad de lectura variante a variante, y satisfacibilidad del gate del objeto literal).

## Issues Encountered

- **El gate del objeto literal frente a un antecedente tematizado.** Detectado al disenar las 2 variantes de concordancia: la forma que el plan propone deja el objeto fuera de la clausula del hueco o en mayuscula inicial. Resuelto con coordinacion (decision 2) y verificado: las 16 no exentas dan exactamente 1 objeto en la clausula del hueco.
- **El participio absoluto como segunda respuesta.** Detectado al comprobar distractora a distractora en el gerundio passato y en la causal del gerundio presente. Resuelto excluyendo `fatto` de esas options (decision 1).
- **`grep -c 'slotCountOf'` da 11 y no 9.** El plan estimaba 9 (5 previas + 3 categorias de `fare` + esta). El conteo real previo era 10 y ahora 11, porque el helper aparece tambien en su definicion y en el comentario IN-03. El criterio se cumple en su forma robusta —«el de antes mas uno»— y el gate exacto que si muerde es `grep -c "slotCountOf('content/exercises/fare-indefiniti.json')" == 1`.
- **Nada mas.** El baseline se re-midio antes de tocar nada (912 pass / 0 fail, precondicion de la Task 1 cumplida) y la suite nunca estuvo en rojo entre commits.

## Pruebas negativas ejecutadas (Task 5, mas las 3 de CR-02 en su seccion propia)

Las 12 mutaciones del JSON real, con restauracion byte a byte verificada (`cmp` contra la copia original, y `git diff` limpio al terminar):

| Mutacion | Resultado | Decision nombrada |
|---|---|---|
| forma conjugada (`faccio`) en `options` | fail 3 | D-43-13 / SC-3 |
| pronombre de concordancia OPCIONAL (`mi`) en el participio passato | fail 4 | D-43-16 |
| pronombre SINGULAR antepuesto con auxiliar elidido (`l'ha`) | fail 5 | D-43-16 |
| la grafia no elidida `avere fatto` en `options` | fail 3 | D-43-17 |
| el compuesto `parte` en una variante que no es del participio presente | fail 2 | D-43-18 |
| `status: validated` con `passes: []` | fail 2 | T-43-03 |
| `validated` con 2 `correcta` del mismo `by` | fail 2 | T-43-03 |
| slot de ronda EXTRA `validated` sin pase `deepseek` | fail 1 | D-43-20 |
| prompt del infinito passato sin marcador de anterioridad | fail 1 | INDEF-01 |
| gerundio simple entre las opciones de la variante concesiva | fail 1 | INDEF-04 |
| un tercer contexto inventado de `facente` | fail 3 | INDEF-03 / D-43-03 |
| marco progresivo sin el verbo de estado antes del hueco | fail 2 | D-43-15 |

## CR-02 (code review de la fase) — los gates casaban por subcadena y no mordian

`43-REVIEW.md` (`ea10408`) dejo un warning WR-05 sobre `tests/content-fare-indefiniti.test.js`. El ejecutor de 43-01 lo detecto y lo transfirio correctamente sin tocarlo, porque el fichero es propiedad exclusiva de este plan. Resuelto en `20a5cc6`, **sin tocar `content/exercises/fare-indefiniti.json`**: el review no encontro doble validez en las 18 variantes, el defecto era del gate.

**El hallazgo.** `CONCORD_CUES` se comparaba con `includes()` crudo. Los cues son bigramas que empiezan por un clitico de dos letras, asi que `"Michele ha fatto".includes("le ha")` es `true`: cualquier sujeto acabado en `-le` seguido del auxiliar satisfacia el cue sin que hubiera ningun clitico antepuesto. El gate estaba verde porque el contenido actual (`li ha fatti`, `le abbiamo fatte`) no dispara el falso positivo — pero existe para cazar una variante FUTURA que rompa D-43-16, y la habria aprobado.

**La auditoria encontro la misma clase de defecto en otros seis sitios**, todos con colision real en italiano y no teorica:

| Sitio | Colision | Efecto |
|---|---|---|
| `CONCORD_CUES` (bloque 8) | `Michele ha` contiene `le ha` | gate INFRA-estricto: aprueba concordancia injustificada |
| `CONCORD_PROHIBIDOS` (bloque 8) | `Michela ha` contiene `la ha` | gate SOBRE-estricto: bloquearia un prompt legitimo |
| `STARE` (bloque 10) | `questa`, `basta`, `vista` acaban en `sta` | el marco progresivo de D-43-15 aceptaba cualquier palabra acabada en -sta |
| `MARCADORES_GERUNDIO_PASSATO` (bloque 10) | `Purché`, `Purtroppo` empiezan por `Pur` | el conteo de marcadores era falseable |
| `COMPUESTOS_FACENTE` (bloque 5) | `partenza` empieza por `parte` | la exencion de D-43-18 era falseable |
| adyacencia de `VARIANT_TABLE` (bloque 3) | `Martha` acaba en `ha` | el cue podia ser sufijo de otra palabra |
| `ADVERBIALI_ANTERIORITA` (bloque 10) | escaneos cruzados | idem |

**El arreglo.** Dos helpers, `terminaEnPalabra()` y `empiezaPorPalabra()`, que exigen que el caracter contiguo por el lado interior no sea letra; la presencia pasa a `wordish()`, que el fichero ya declaraba en su cabecera. Ningun cue se compara ya con `includes` / `endsWith` / `startsWith` a pelo. Sobrevive **un solo** `includes` crudo sobre un prompt —el de los parentesis— y va con su comentario: busca un CARACTER, no una palabra, y una frontera ahi apagaria el gate.

Se documenta el porque en la cabecera del fichero (COROLARIO DE LA ADVERTENCIA) y en el comentario de cada constante afectada, con el ejemplo concreto de colision, para que quien lea `'le ha'` como string entienda por que ya no se compara asi.

**Un segundo hallazgo, de la misma auditoria:** el test *las 2 variantes de concordancia usan el cue declarado en la tabla, adyacente al hueco* **no comprobaba la adyacencia que su nombre promete** — vivia solo en el bloque 3. Anadida, con frontera de palabra, mas un assert de que son exactamente 2.

**Verificacion.**

1. **La clasificacion no cambia** (requisito del coordinador): el reparto del participio passato es `[false, false, true, true]` **identico** antes y despues — 2 sin clitico antepuesto (invariables) y 2 con clitico (concordancia). Suite **998 pass / 0 fail**.
2. **Prueba por mutacion, comparando el gate ANTES y DESPUES.** Es la unica forma honesta de demostrarlo: la mutacion puede saltar por OTRO gate y dar la falsa impresion de que el auditado funciona. Con el matcher viejo, en los tres casos saltaba `fail 1` — y ese unico fallo era siempre el bloque 3 (la tabla de cues, D-43-12), por accidente; el gate auditado tenia **0** tests en rojo.

| Mutacion | Gate auditado | tests del gate en rojo, VIEJO | tests del gate en rojo, NUEVO |
|---|---|---|---|
| `Michele ha ___ i compiti.` con key `fatti` (concordancia sin clitico) | concordancia, bloque 8 | **0** (fail 1 total, solo bloque 3) | **3** (fail 4 total) |
| `Questa ___ i compiti, non posso uscire.` (falso `stare`) | marco progresivo, bloque 10 | **0** (fail 1 total) | **1** (fail 2 total) |
| `Purché ___ una torta per tutti, ...` (falso `Pur`) | marcadores, bloque 10 | **0** (fail 1 total) | **1** (fail 2 total) |

3. **Sin regresion:** las 12 pruebas por mutacion originales siguen mordiendo, y dos de ellas mas fuerte que antes (el pronombre opcional pasa de fail 4 a fail 5 y el singular elidido de fail 5 a fail 6, por el assert de adyacencia nuevo). Restauracion byte a byte verificada con `cmp` y con `git diff --quiet` en cada iteracion.
4. **Fuera de alcance respetado:** `content/exercises/fare-indefiniti.json` sin tocar, los ficheros de 43-01 sin tocar (su `32b2eab` leido antes de correr la suite), `src/` byte-intacto, counts y `TOTAL_EXPECTED` sin tocar, los 9 slots siguen en `pending` con `passes: []`.

Total de pruebas por mutacion de este plan: **15** (12 originales + 3 de CR-02).

## WR-01 (UAT de la fase) — la concordancia con objeto pospuesto, declarada y no blacklisteada

Adjudicado por el autor en el UAT. Resuelto en `6495443`, **sin tocar el contenido de las variantes**: prompts, `options`, `correctIndex`, ids y `validation` quedan byte a byte identicos; solo cambian el `notes` y una `explanation`.

**El hallazgo.** En las 2 variantes INVARIABLES de `fare-indefiniti-participio-passato` (objeto POSPUESTO) una de las tres distractoras es la forma concordada con ese objeto, y esa concordancia esta **atestiguada** en italiano literario y antiguo:

| Variante | Objeto pospuesto | Key (moderna) | Distractora atestiguada | Las otras dos |
|---|---|---|---|---|
| `Ieri io ho ___ i compiti con Anna.` | `i compiti` (m. pl.) | `fatto` | **`fatti`** (`ho fatti i compiti`) | `fatta`, `fatte` — no concuerdan con nada |
| `Maria ha ___ una torta per la festa.` | `una torta` (f. sg.) | `fatto` | **`fatta`** (`ha fatta una torta`) | `fatti`, `fatte` — idem |

Es **una** distractora por variante, no las tres: la precision importa porque es exactamente la opcion que el quorum va a mirar.

**Confirmado que no habia audit trail.** El `notes` mencionaba «objeto pospuesto» solo como tipo de contexto del conjunto cerrado de D-43-12 (donde cae el hueco), y «arcaicas y literarias» se referia a la blacklist de conjugadas de D-41-08 (`fo`, `fé`, `fenno`). Ninguna de las dos decia que la distractora concordada fuera ella misma atestiguada.

**Por que la salida es documental y no la blacklist.** Dos razones, y la primera es la que cierra el debate:

1. **Estructural.** D-43-16 fija el pool de las 4 variantes en las cuatro terminaciones como **eje unico**. Si en las 2 invariables se blacklistean las concordadas, no queda nada que ofrecer: el slot deja de existir. La resolucion documental era la unica posible desde el principio.
2. **De registro.** No es el caso del cuarto magnet. Con `aver fatto` / `avere fatto` las dos formas compiten en el **mismo registro contemporaneo**, asi que la no elegida se veta. Aqui la concordancia pospuesta pertenece a **otro registro historico**, y en italiano moderno estandar la invariable es inequivocamente la unica corriente en un material A1/A2. Aplica por tanto D-43-19 (RECONOCER, NO PRODUCIR) en su **cuarto caso**: se nombra, se explica, no se pide producirla, y puede seguir en `options` porque hoy es la respuesta incorrecta sin discusion.

**Escrito en los cuatro sitios.**

1. **`notes`** — bloque `CONCORDANCIA CON OBJETO POSPUESTO: DECLARADA Y NO BLACKLISTEADA (WR-01, adjudicado por el autor en el UAT de la fase 43)` con las dos razones, la forma atestiguada por variante, el contraste explicito con el cuarto magnet y la frontera.
2. **`09-VALIDATION-PROMPT.md` subseccion 7.4** — **la parte critica**. Contenido: que la concordancia pospuesta existe en italiano literario/antiguo; que **marcarla como segunda respuesta defendible es un FALSO POSITIVO de C2** (y de C3 si se plantea ahi); por que se ofrece y no se retira (el pool cerrado destruiria el slot); y la frontera en negrita — con **pronombre objeto ANTEPUESTO** la concordancia es **OBLIGATORIA**, la invariable **SI** es error, y ahi C2 debe seguir mordiendo con todo. Cierra remitiendo a 7.3 para el criterio de leak. Mas un **puntero nuevo desde C2**, como parrafo independiente.
   - Insertada **antes** de `*Fin del prompt…*`, guard de la seccion 6 intacto, **`12 insertions(+)` y `0 deletions`** verificado con `git diff --stat` y con `git diff -U0 | grep -c '^-[^-]'`.
   - Va **despues** de 7.3 a proposito: 7.3 dice «ninguna de las **dos** excepciones nuevas toca el criterio de leak», y reescribir ese «dos» habria producido un borrado. 7.4 se autodeclara respecto a C5 y remite a 7.3, asi que no queda ninguna afirmacion falsa en el fichero y el diff sigue siendo solo adiciones.
3. **`explanation` del slot** — apunte de registro en tono D-127 (3a impersonal, regla + ejemplo): cita `ho fatti i compiti` y `ha fatta una torta` como formas de textos clasicos que no son erratas, y cierra con que en la norma moderna la invariable es la unica corriente y la unica que se pide.
4. **Gates de test** — dos nuevos en el bloque 8. El primero es **un gate a la contra**, y por eso lleva su comentario: lo normal en esta categoria es *prohibir* la forma atestiguada en `options` (el cuarto magnet, las arcaicas, las formas con clitico), asi que aqui se congela lo **opuesto** —que la concordada SIGA ofreciendose— para que un re-pase futuro que lea el criterio operativo de la blacklist no lo «arregle» y rompa el eje. El segundo exige que la decision este en el `notes` **y** en la 7.4, con la 7.4 antes de la linea de cierre.

**Verificacion por mutacion** (4 nuevas, restauracion byte a byte verificada con `cmp` en el JSON y en el prompt):

| Mutacion | Resultado | Test que salta |
|---|---|---|
| un re-pase «arregla» WR-01 sacando `fatti` del pool | fail 3 | pool cerrado + las 4 terminaciones + **WR-01** |
| el `notes` pierde el bloque de audit trail | fail 1 | **WR-01** (notes y prompt) |
| la 7.4 se mueve **detras** de la linea de cierre | fail 1 | **WR-01** (notes y prompt) |
| la 7.4 desaparece del prompt (excepcion solo en el `notes`) | fail 1 | **WR-01** (notes y prompt) |

Suite **999 → 1001 pass / 0 fail** (78 tests en el fichero de la categoria). Total de pruebas por mutacion de este plan: **19** (12 de autoria + 3 de CR-02 + 4 de WR-01).

## Quorum base + ronda EXTRA — resultado y los 2 `disputed` arreglados

El quorum base top-level (Opus + Sonnet, contexto fresco por ejercicio) mas la ronda EXTRA DeepSeek de D-43-20 corrieron sobre los 6 slots. Resultado: **3 limpios a la primera, 1 por override del autor, 2 `disputed`** arreglados en `dc2450a`.

| Slot | Resultado |
|---|---|
| `infinito-passato` | validated — Opus + Sonnet + **DeepSeek**, los tres `correcta` |
| `participio-presente` | validated |
| `gerundio-presente` | validated |
| `participio-passato` | validated **por override del autor** (ver mas abajo) |
| `infinito-presente` | `disputed` → arreglado |
| `gerundio-passato` | `disputed` → arreglado |

**Las tres excepciones escritas en el prompt funcionaron.** Los tres slots que pasaron a la primera son exactamente los que llevaban excepcion declarada (§7.1 `facente`, §7.2 RECONOCER NO PRODUCIR, §7.4 concordancia pospuesta). Ninguna IA marco los falsos positivos anticipados, y las fronteras duras si mordieron. La §7.4 escrita en WR-01 evito un `disputed` **falso** en `participio-passato` por la via de C2 — el modo de fallo exacto que la seccion 7 existe para prevenir.

### 1. `infinito-presente` — errata de espanol (Sonnet, C4)

La explanation decia «la orden negativa dirigida **a tú**». Tras la preposicion `a` el espanol normativo pide pronombre preposicional (`a ti`). Resuelto con la formula **metalinguistica** que el propio parrafo ya usaba dos lineas despues: «la orden negativa **de tú**», paralela a «la orden afirmativa de tú». Es la que mejor encaja con el registro del parrafo, que en ese punto esta hablando *de* la persona gramatical, no *a* ella.

### 2. `gerundio-passato` — la premisa era falsa (Sonnet, C2)

**Salida elegida: rebajar la afirmacion de la explanation Y hacer uniforme el criterio de exclusion.** No reformule los encajes. Razon: para que un concesivo «imponga» de verdad la anterioridad habria que forzar el italiano, que en `pur + gerundio` es permisivo por diseno — y fabricar esa rigidez es **exactamente el defecto que se me estaba senalando**, cometido otra vez con una explanation nueva y mas segura de si misma. Rebajar la afirmacion dice la verdad y no toca prompts ni keys, asi que la unicidad mecanica que el quorum ya verifico se conserva.

Lo que hice, y va mas alla de lo estrictamente senalado:

- **El gerundio simple sale de las options de las TRES variantes**, no solo de las dos que ya no lo tenian. Y la razon queda **invertida** y escrita: no es que sea agramatical —eso era la premisa falsa— sino que seria **DEFENDIBLE**, y una distractora defendible es justo lo que prohibe el criterio operativo de la blacklist de esta misma categoria. Aplicado a una forma del propio pool.
- **Revise las tres variantes, no solo la senalada.** El encuadre decia que solo una carecia de `facendo` y eran dos (indices 1 y 2), asi que el `correcta` de Opus sobre este slot estaba contaminado por ese dato. La v0 era ademas el **backstop declarado del plan**, la unica que ofrecia el contraste, y su distractora admitia lectura instrumental (`facendo i compiti la sera prima` = «haciendo los deberes la noche antes» como medio). Se resolvia con el mismo movimiento.
- **Contrapartida obligada, para no vaciar C3.** Quitar `facendo` dejaba el slot con distractoras descartables de un vistazo (`fare`, `facente`, participios con desacuerdo). Entra en su lugar el **infinito compuesto** en las 3: es la interferencia REAL del hispanohablante —el espanol dice *a pesar de haber hecho*, *por haber terminado*, con infinitivo— y si es agramatical en una subordinada implicita de este tipo. Distractora plausible y honestamente incorrecta.
- **El contraste simple/compuesto no se pierde:** se examina en el marco **progresivo** del `gerundio-presente`, donde el verbo de estado hace el compuesto categoricamente agramatical y el contraste es duro y no interpretable. Congelado con gate propio para que nadie lo lea como perdida.

### 3. `participio-passato` — override del autor, recogido en el `notes`

DeepSeek y Gemini (desempate) marcaron `C5-leak` en las 2 variantes de clitico antepuesto: la vocal final del clitico coincide con la del participio (`li`/`fatti`, `le`/`fatte`), asi que se podria acertar copiando la ultima letra. **No lo toque** — el autor lo adjudico por override, con motivo escrito y los 4 pases de modelo preservados, los 2 `incorrecta` incluidos.

Lo que si hice es **sacarlo de `passes[]` y escribirlo en el `notes`** con su audit trail: el riesgo es real y queda **asumido, no negado**; las tres razones (el clitico antepuesto ES la regla examinada y los cuatro clitcos de 3a riman por morfologia, retirar las variantes incumpliria SC-4, y `mi`/`ti`/`ci`/`vi` estan prohibidos por D-43-16 porque abren doble validez, que es peor); y la **mitigacion**: las 2 variantes de objeto pospuesto exigen la invariable, asi que copiar terminaciones por sistema falla la mitad del slot y la cascada D-54 devuelve a repetir la categoria entera. El atajo no sobrevive a las cuatro variantes.

### Segunda ronda de quorum — los 2 restantes, los dos de PROSA

Tras `dc2450a` volvieron 4 slots `validated`. Los 2 que quedaban eran de **prosa espanola del `explanation`**, no de mecanica: en los dos, Opus y Sonnet coinciden en que C1, C2, C3 y C5 pasan. Arreglados en `b83f11a`.

**El rediseno del `gerundio-passato` funciono.** Las dos IAs confirman que el infinito compuesto desnudo es agramatical en las tres variantes. Opus anade el dato que conviene no perder: lo que blinda el slot es que el participio distractor esta **deliberadamente descordado** (`fatte` con `i compiti`, `fatta` con `il lavoro`) — si estuviera concordado, `Fatti i compiti la sera prima, ho potuto dormire` seria italiano valido y habria doble validez. No se toca.

**1. `infinito-presente` — concordancia de genero (Opus, C4).** El cierre remitia con `de ellas` a la coordinacion «la negacion, la preposicion **o el modal**», de genero mixto con un masculino dentro: el plural va en masculino, `de ellos`. Tampoco lo salvaba la concordancia por proximidad, porque el elemento contiguo (`el modal`) es masculino, y no hay ningun antecedente femenino plural en el texto (`la palabra` y `la pista` son singulares). Sonnet dio `correcta`: venia avisado de la errata anterior, que era de regimen preposicional, reviso los regimenes —correctos— y no miro el genero del pronombre. Caso limpio de por que el quorum son dos.

**2. `gerundio-passato` — la afirmacion seguia siendo demasiado rigida (Opus, C4).** Decia que el italiano exige aqui el gerundio «y **nunca** `aver fatto`, que en una subordinada implicita de este tipo **es agramatical**». Falso en los mismos encajes que el bloque examina: `per aver fatto` es causal implicita estandar y `dopo aver fatto` es la temporal de anterioridad mas frecuente de A2; en terminologia italiana «subordinata implicita» **incluye por definicion las infinitivas**, asi que la etiqueta no acotaba nada. Lo agramatical **no es** el infinitivo compuesto: es el infinitivo compuesto **SIN INTRODUCTOR**, que es lo unico que ofrecen las `options`. Tal como estaba, el alumno salia con la regla de evitar `dopo aver fatto`, que es un error caro. Y el contraste tampoco era paralelo: las dos formulas espanolas citadas llevan subordinante delante, y su calco italiano con preposicion es correcto.

Resuelto **escribiendo la condicion en vez de la prohibicion**, que es mas corto que la excepcion que evita: el gerundio se basta solo para encabezar la subordinada, el infinitivo compuesto necesita introductor delante, y con introductor es correcto y corriente — se citan `dopo aver fatto i compiti` y `per aver fatto un errore` **para que el alumno no salga evitandolos**. Cerrado tambien el hueco del criterio de seleccion, que no justificaba la key de la concesiva (`Pur ___ una torta`, sin ninguna marca de anterioridad): `pur` admite los dos gerundios, asi que elegir el compuesto es ahi una decision de precision y no una obligacion gramatical.

**El mismo bloque del `notes` repetia la afirmacion falsa por otra via**, y lo corregi tambien alli. El `notes` es el audit trail que lee un re-pase futuro; dejar ahi una afirmacion linguistica falsa es exactamente el mecanismo que produjo toda esta cadena.

### La regla de fondo, y su mecanizacion honesta

En esta fase se corrigieron **tres** explanations que afirmaban imposibilidad en falso, y **dos de las tres las introdujo el arreglo de la anterior** — se sustituyo una afirmacion falsa por otra. En este fichero paso **dos veces**. La regla, ahora escrita: **no afirmar que una forma italiana es imposible sin haberlo comprobado forma por forma y contexto por contexto; y si la regla real lleva una condicion, escribir la condicion.** Ademas, al retirar o reencuadrar una variante hay que revisar el `explanation` del slot: las frases que la describian quedan huerfanas, y una frase huerfana que generaliza es peor que una irrelevante.

Mecanizada como gate file-wide que prohibe la predicacion **desnuda** de imposibilidad en las 6 explanations (`es agramatical`, `nunca se usa`, `no se usa nunca`, `no existe en italiano`, `es imposible en italiano`). Va con **su limite escrito**, que importa tanto como el gate:

- Es un **tripwire, no una demostracion**: caza la formula, no la falsedad, y **no puede cazar una condicional falsa**. Su valor es recordar la disciplina en el diff.
- **NO incluye `deja de ser posible`**, aunque fue una de las formulas defectuosas: en `infinito-passato` aparece dentro de una condicional **verificada** («con cualquiera de los dos, …», donde `dopo fare` no es italiano estandar y un adverbial de pasado si bloquea el infinitivo simple). Banear el literal habria puesto rojo prosa correcta — cargo-culting sobre la forma en vez de sobre el defecto.
- Se aplica **solo a las explanations, nunca al `notes`**, por la misma razon que el escaneo de blacklist: el `notes` tiene que **nombrar** las afirmaciones falsas que se corrigieron, con su audit trail, asi que un gate de ausencia ahi pondria rojo el texto que documenta la correccion.

### Tercera ronda — DI MENOS, y un gate que estaba verde sobre una etiqueta falsa

Tras `b83f11a` quedaron 4 slots `validated`, `infinito-presente` pendiente de decision del autor (no se toca) y `gerundio-passato` por tercera vez. Arreglado en `90e0c3a`.

**La mecanica ya estaba solida y los dos modelos lo confirman:** C1, C2, C3 y C5 pasan. Sonnet confirma ademas que la rigidez de la ronda 2 quedo corregida. El problema seguia siendo el `explanation`.

**El hallazgo que las DOS IAs alcanzaron por separado: la taxonomia no cuadraba.** El texto declaraba «temporal / causal / concesiva» y el slot contiene **absoluta / absoluta / concesiva**. La variante 1 (`___ il lavoro il giorno prima, lei era già libera.`) no es causal: es estructuralmente **identica** a la 0 —gerundio + objeto + adverbial de anterioridad— y no hay conector causal en ninguna de las tres.

**Y ese error no vivia solo en la prosa.** `VARIANT_TABLE` declaraba `implicita-temporal` e `implicita-causal` para esas dos variantes, asi que el gate de «tipos distintos dentro de cada slot» —que existe precisamente para impedir que tres frases sean el mismo ejercicio tres veces— **estaba verde sobre una etiqueta falsa**. Es el patron de CR-02 otra vez: un gate que no muerde porque el dato que compara ya venia falseado. Corregido declarando el eje **real** (la presencia de la particula concesiva), con reparto **2 + 1** y excepcion enumerada, en vez de mantener la etiqueta inventada para que el gate siguiera pasando. Un gerundio absoluto desnudo no viene formalmente diferenciado en temporal o causal: la lectura es inferencial, asi que la distincion era invencion mia.

**La instruccion de fondo, distinta de las rondas anteriores: DI MENOS.** Tres rondas con tres motivos y **dos de los tres introducidos al arreglar el anterior** no son mala suerte. El texto intentaba enunciar la gramatica general de la subordinacion implicita italiana, que tiene excepciones en cada casilla, y cada vez que se completaba un poco mas entraba una falsedad. La explanation baja de **~2100 a 1010 caracteres** y se queda con lo unico que hace falta para resolver **estas tres frases**: la regla de formacion, que marca el compuesto frente al simple, y por que no encajan las opciones ofrecidas.

Cada retirada cierra un hallazgo de la ronda:

| Retirado | Por que |
|---|---|
| La taxonomia de encajes | El hallazgo de las dos IAs: enseñaba un patron que el ejercicio no tiene |
| La regla general del introductor | Ademas de sobrar, **licenciaba lo que queria excluir**: decia «preposicion ni particula» y unas lineas antes llamaba particula a `pur`, de modo que autorizaba `pur aver fatto`. Lo exacto seria «preposicion que lo RIJA», y `pur` no lo rige porque selecciona gerundio |
| La comparacion con el espanol | Fallo **dos veces seguidas**; la ultima afirmando que «su calco con preposicion seria igualmente correcto», falso para la concesiva porque `nonostante aver fatto` no es norma moderna |
| El adjetivo «invariable» sobre el participio | Solo se sostiene con objeto pospuesto: con pronombre antepuesto es `avendoli fatti`, que es la doctrina que enseña el propio slot de participio passato de este fichero |

**Gates estructurales, no por literal**, como se pidio:

- **Tope de longitud** (1200), porque el mecanismo del defecto era el **crecimiento** del texto y no una frase concreta. No impide escribir una falsedad; impide que el texto vuelva a crecer hacia la regla general.
- **0 taxonomia** y **0 comparacion con el espanol** en este slot.
- **Los participios ofrecidos DESCORDADOS con el objeto de su frase.** Es lo que Opus identifico como el blindaje real: si concordaran, `Fatti i compiti la sera prima, ho potuto dormire` seria participio absoluto valido y habria doble validez. Estaba hecho a proposito **pero sin declarar en ningun sitio**, asi que un re-pase podia «arreglar» la concordancia y romper el slot sin que nada se pusiera rojo. Ahora tiene gate y mapa `CONCORDANCIA_DEL_OBJETO` completo (los 9 objetos), que usan dos gates de signo contrario: el de WR-01 exige que la concordada este en `options`, este exige que no.
- **Guardia de regresion** con los 7 literales retirados en las tres rondas, comentado uno a uno con la ronda que lo retiro.

El `notes` lleva el bloque `DECISIÓN DE RECORTE` con las cuatro retiradas y su porque, el criterio de fondo —**una explanation explica sus propias frases, no la gramatica de su tema**— y la declaracion de la discordancia deliberada.

**Un incidente propio que conviene dejar escrito.** Durante la bateria de mutaciones use `git checkout tests/content-fare-indefiniti.test.js` para restaurar el fichero tras mutarlo, y eso lo revirtio al ultimo commit, **borrando las cinco ediciones no commiteadas** de esta ronda. Las rehice desde el contexto y verifique la paridad (90 tests, 1021 pass, identico a antes del accidente), pero la leccion es la del propio proyecto: para restaurar se usa una **copia del fichero**, nunca un `git checkout` sobre trabajo sin commitear. Las mutaciones sobre el JSON ya se hacian asi; la del fichero de test fue la excepcion y fue el error.

### Cuarta ronda — reescritura bajo tres prohibiciones, y el gate que exigia el defecto

El recorte de la 3a ronda **quito cuatro de los cinco hallazgos** (la senal se confirmo), pero comprimir obligo a absolutos y metio **dos falsedades nuevas**. En vez de parchear frase a frase por cuarta vez, los dos textos se reescriben bajo tres prohibiciones estructurales. Arreglado en `b1e101e`.

**La mecanica esta cerrada en los dos, cuarta ronda consecutiva:** C1, C2, C3 y C5 pasan en ambos modelos. Opus verifico las 12 combinaciones del `gerundio-passato` y confirma que el infinitivo compuesto desnudo es indefendible en las tres variantes y que la descordancia del participio cierra el participio absoluto. Lo unico que no convergia era la prosa.

**Las dos falsedades que introdujo mi propio recorte:**

| Afirmacion | Por que es falsa | Lo exacto |
|---|---|---|
| «la particula `pur` solo admite gerundio» | `pur` admite infinitivo regido por `di` (`pur di vincere`), adjetivo (`pur stanco, continuò`), participio (`pur invitato, non venne`) y verbo finito (`pur se`) | El infinitivo desnudo se descarta ahi por **falta del regente `di`**, no por una restriccion de `pur` |
| «las terminaciones no concuerdan con ningun elemento de su frase» | En la variante 1 (`___ il lavoro il giorno prima, **lei** era già libera`), `fatta` es f. sg. y `lei` tambien: **concuerda** | Lo que cierra el participio absoluto es que la concordancia debe ser con el **objeto** (`il lavoro`, m. sg.), no con el sujeto |

**Y tres en `infinito-presente`**, que el autor decidio corregir en vez de dar override: el inventario «ninguna de las demas formas no personales encaja detras de ellos» (falso: tras un modal encaja `aver fatto` con lectura epistemica, y tras `non` encaja el gerundio — **contradecia mi propio diseno**, porque excluí `aver fatto` de las `options` de la variante modal por ese mismo motivo); «detras de una preposicion... nunca otra forma no personal, igual que el espanol» (falso: `dopo mangiato`, `dopo finito`; y el remate amplificaba el absoluto porque el espanol si excluye el participio ahi); y la disyuncion excluyente con atributo plural, que pide `es la senal`.

**Las tres prohibiciones, ahora criterio permanente escrito en el `notes`:**

1. **Ninguna afirmacion sobre el italiano mas alla de lo que el slot examina.** Cada regla general compra una excepcion y el quorum la encuentra.
2. **Ninguna descripcion de la estructura del propio ejercicio** — conteos, enumeraciones, taxonomias. Caducaron tres veces al tocar el contenido.
3. **Ninguna explicacion de por que falla cada distractora.** Cada «X no encaja porque…» es una afirmacion general disfrazada.

Queda la formacion, que marca frente a su alternativa, y la interferencia real con el espanol donde exista. Textos: **1300 → 865** y **1010 → 953** caracteres.

**El hallazgo mas incomodo de esta ronda es sobre un gate mio.** El gate `la explanation del gerundio passato nombra las dos familias de opciones que hay que descartar` exigia nombrar `aver fatto`, `fare`, `concuerdan` y `pur`. Es decir: **mandaba escribir exactamente el contenido que P3 veta**, y ahi murieron los dos absolutos de esta ronda. El gate no solo permitia el defecto — **lo exigia**. Retirado con nota de poda; lo que cubria de verdad lo cubren los gates estructurales de `options` y el de discordancia del participio, que miran el **contenido** y no la prosa, y que siguen vivos.

**Gates nuevos, con listas POR SLOT y nunca globales** (lo que un slot no examina, otro si: `participio invariable` es falso en el gerundio passato y **correcto** en el participio passato con objeto pospuesto):

- **Tope de longitud por slot** (1100 y 1200). El mecanismo del defecto en esta fase no ha sido una frase concreta sino el **crecimiento** del texto: cada ronda anadia precision y con ella una excepcion. Es el unico gate que ataca eso.
- **Guardia de regresion por slot** con los 12 literales retirados en las cuatro rondas, cada uno comentado con la ronda que lo retiro.
- **Gate P1** contra las familias de afirmacion general (inventarios de que forma cabe tras que palabra, `solo admite`).

**Riesgo simetrico comprobado.** Aplicar tres prohibiciones a la vez tiende a llevarse requisitos por delante, asi que anadi tres mutaciones que **recortan de mas**: un stub en cada uno de los dos slots y la perdida del desarrollo del imperativo negativo. Las tres ponen rojo los gates de presencia (D-43-14 e INDEF-04), asi que los requisitos siguen mordiendo. Los gates de D-43-19 (`avere fatto` nombrada) e INDEF-03 (nota de registro) viven en slots que no se han tocado.

### Quinta ronda — el ultimo hallazgo, y un hueco propio en los gates

`gerundio-passato` paso a `validated`: el recorte funciono, y el hallazgo del gate que **exigia** la prosa vetada fue lo que explico las cuatro rondas anteriores. Quedaba `infinito-presente` por **una sola frase** (Opus; Sonnet la dio `correcta`). Arreglado en `9d4e1a4`.

**El defecto era de un tipo que las cuatro rondas anteriores no habian aislado.** La frase «aparece cuando otro elemento de la frase ya aporta esa informacion» **no usaba ninguna formula absoluta** de las que los gates ya vigilaban. Su defecto era de **tipo**: enunciaba una **condicion general de aparicion** de la forma, que es una afirmacion sobre toda la lengua.

Y falla por los dos extremos:

- **Por arriba:** el italiano usa el infinitivo nominalizado (`Fumare fa male`) y en instruccion impersonal (`Vietato fumare`, `Non calpestare l'erba`) sin ningun elemento que aporte persona ni numero.
- **Por abajo, y es lo grave:** falla justo en la variante que el propio texto declara la mas importante. En el imperativo negativo la persona la aporta la **construccion**, no otro elemento — el vocativo es prescindible y `Non fare rumore!` funciona solo. La generalizacion solo describia las variantes de `io` y de `devo`.

Retirada **sin sustituir**, porque el parrafo no perdia la transicion: 865 → 797 caracteres. La interferencia del imperativo negativo se mantiene intacta.

**Gate por TEMA y no por literal**, que es lo que el caso pedia: caza la familia de aperturas que enuncian condicion de aparicion (`Aparece cuando`, `Se usa cuando`, `solo aparece`…), porque el defecto era de tipo y no de redaccion. Verificado con **tres formulaciones distintas** del mismo tema, y con una cuarta en otro slot para comprobar que el gate no estaba atado a `infinito-presente`.

**Un hueco propio, encontrado y cerrado.** Al probar el riesgo simetrico descubri que **el punto pedagogico del slot no estaba gateado**: una mutacion que borraba `no hagas` dejaba la suite **verde**, porque los tres literales que el gate comprobaba (`infinitivo`, `negativ`, `orden`) sobrevivian. El par `non fare` frente a `no hagas` estaba exigido por el requisito y confirmado por los dos evaluadores desde la primera ronda, pero solo vivia en la prosa. Ahora el gate exige el **par completo**, verificado borrando cada mitad por separado. Es el mismo patron que CR-02 y que la etiqueta inventada de la 3a ronda: un requisito que se cumplia por costumbre y no por gate.

### Sexta ronda — la enumeracion incompleta, y el gate ampliado al defecto en vez de a su ultima superficie

Opus dio `correcta`; Sonnet marco C4 sobre la frase final, la que quedo tras retirar la de la 5a ronda. **Las dos lecturas eran defendibles:** como señal **suficiente** (si hay preposicion o modal, no conjugada) V0 no la falsea; como **exhaustiva** —por el «siempre» y el articulo determinado, `la` señal— falla en V0, donde lo que precede al hueco es `non`, ni preposicion ni modal, y es la variante que el propio texto declara la mas importante.

**El arreglo: enumeracion completa y sin articulo determinado**, para que las dos lecturas queden satisfechas de raiz. Dos precisiones de redaccion, porque «incluir la negacion» a secas habria creado una falsedad nueva —el sexto caso del mismo patron:

- Se escribe **«orden negativa»** y no «negacion»: `non` precede a formas conjugadas constantemente (`non faccio`), asi que listar la negacion como señal de forma no personal seria falso.
- Se escribe **«forma no personal»** y no «infinitivo»: tras preposicion el italiano admite participio (`dopo mangiato`), que es no personal, asi que la version con «infinitivo» habria repetido literalmente el hallazgo de la 4a ronda.

**El agujero del gate, que era lo importante.** El gate de la 5a ronda solo cubria la familia de **aperturas** (`Aparece cuando`, `Se usa cuando`…), es decir **la superficie con la que el defecto se manifesto la ultima vez, no el defecto**. Esta frase decia `es la señal` y no la habria cazado. Ampliado con la segunda familia —predicados de articulo determinado que cierran una enumeracion como si fuera completa: `es la señal`, `es la pista`, `es lo que indica`, `basta con que haya`— y **verificado contra la frase antes de arreglarla**: el gate ampliado la ponia roja, que es la prueba que el caso pedia.

**Al probarlo aparecieron dos agujeros mas en mis propios gates:**

1. **Comparaba con `includes` sensible a mayusculas**, asi que la mutacion `Basta con que haya un modal delante.` —con la B de inicio de frase— pasaba limpia. Es **el mismo agujero que WR-10 ya documento para `wordish`**: la posicion donde la formula aparece de verdad es el inicio de oracion, que era justo la que no se veia. Ahora compara en minusculas.
2. **Faltaba el gate POSITIVO.** Acortar la enumeracion a dos elementos **no lo cazaba nada** — y esa era exactamente la forma del defecto que Sonnet marco. Añadido, derivado de `VARIANT_TABLE` (un disparador por tipo de contexto del slot), y exigiendo los tres **en la misma frase**: la primera version mirando el texto entero tambien pasaba limpia, porque `orden negativa` seguia apareciendo mas arriba, donde se desarrolla la interferencia. Comprobar presencia en el texto no dice nada sobre si la **lista** esta completa; la unidad que hay que mirar es la frase.

Verificado con cuatro mutaciones: caer cada uno de los tres disparadores por separado, y partir la enumeracion en dos frases con los tres presentes pero no juntos. Las cuatro rojas.

### Estado y verificacion

- `passes[]` vaciado **solo** en los slots tocados en cada ronda (`pending`). Los otros intactos, incluido el override del `participio-passato` con sus 4 pases de modelo, que no se re-deriva ni se limpia, y `infinito-presente`, que en la 4a ronda el autor decidio corregir en vez de dar override.
- **20 gates nuevos** entre las seis rondas (y 1 podado con nota), cada uno con mensaje que nombra el hallazgo, y **41 mutaciones** verificadas con restauracion byte a byte. Primera ronda (7): reintroducir `facendo` (fail 2), quitar el calco (fail 1), volver a afirmar que el encaje exige el compuesto (fail 1), volver a la errata `a tú` (fail 1), borrar el override del `notes` (fail 1), borrar la premisa corregida (fail 1), quitar el compuesto del marco progresivo (fail 2). Segunda ronda (6): volver a `de ellas` (fail 1), volver a la prohibicion desnuda (fail 2), quitar los dos introductores correctos (fail 2), quitar la justificacion de la key concesiva (fail 1), un absoluto desnudo en otra explanation cualquiera (fail 1), y borrar la condicion del `notes` (fail 1). Tercera ronda (6): concordar el participio distractor (fail 1), reponer la taxonomia (fail 1), reponer la regla del introductor (fail 1), reponer la comparacion con el espanol (fail 1), hacer crecer el texto por encima del tope (fail 1), y reponer la etiqueta `implicita-causal` en la tabla (fail 1). Cuarta ronda (8): los dos absolutos del recorte (fail 2 y fail 1), los dos del infinito presente (fail 1 y fail 1), el tope por slot (fail 1), y **tres que recortan DE MAS** para verificar el riesgo simetrico: stub en cada slot (fail 2 y fail 2) y perdida del desarrollo del imperativo negativo (fail 1). Quinta ronda (6): la frase retirada vuelve literal (fail 2), tres formulaciones distintas del mismo TEMA incluida una en otro slot (fail 1 cada una), y las dos mitades del par pedagogico borradas por separado (fail 1 cada una) — estas dos ultimas son el hueco propio que se encontro y cerro. Sexta ronda (8): la frase retirada vuelve literal (fail 2), tres superficies distintas de la familia 2 del gate (fail 1 cada una, una de ellas descubriendo que la comparacion era sensible a mayusculas), y cuatro contra la completitud de la enumeracion — caer cada disparador por separado y partirla en dos frases (fail 1 cada una).
- Prompts y keys **sin tocar en ninguna de las seis rondas**: las 18 variantes quedan byte a byte identicas. Solo cambian 3 listas de `options` (1a ronda), 4 explanations y el `notes`. `src/` byte-intacto, counts sin tocar. Suite **1027 pass / 0 fail**, 92 tests en el fichero de la categoria.

**Un fallo propio que conviene dejar escrito.** La primera version del gate de la errata C4 la escribi con `/\ba t[uú]\b/`. `\b` en JS es **ASCII-only**, asi que no casa tras `ú`: el gate nacia muerto y su mutacion daba `fail 0`. Es **el defecto de CR-02 cometido otra vez**, en el mismo fichero y dos dias despues de arreglarlo. Lo cazo la prueba por mutacion, no la lectura — que es justamente para lo que existen. Rehecho con `wordish` y documentado en el propio test.

## Threat Flags

Ninguna. El escaneo de superficie no encontro endpoints, rutas de auth, accesos a fichero ni cambios de esquema en frontera de confianza que no estuvieran ya en el `<threat_model>` del plan. Las tres amenazas `high` quedan mitigadas y verificadas: **T-43-05** (slug byte a byte con el agravante del prefijo compartido) por el `describe` 13, que ademas congela que `fare-indicativo` y `fare-indefiniti` son dos entradas distintas; **T-43-06** (doble validez / cascada D-54) por los gates HARD de los bloques 5, 7, 8, 9 y 10 mas las 12 mutaciones; y **T-43-07** (posicion e integridad de la edicion del prompt) por la comprobacion de indice de cadena, el `git diff --stat` de solo adiciones y el assert de que el guard de la seccion 6 sigue presente. **T-43-08** (ruta obsoleta en los skills) queda cerrada: 0 ocurrencias de la ruta muerta, 2 de la real en el skill de ejercicio y 1 en el de batch.

## Known Stubs

Ninguno. Las 18 variantes estan escritas, ninguna opcion es placeholder, ninguna explanation esta vacia, y no hay ningun `TODO` ni valor hardcodeado que llegue a la UI.

El `validation.status: "pending"` de los 6 slots **no es un stub**: es el estado de hand-off que D-43-02 exige y que el plan declara como entregable visible. El executor no puede correr el quorum base canonico porque no puede spawnear los Task subagents del skill `gsd-validate-exercise`; fabricar `passes[]` habria destruido la unica evidencia de revision que el autor tiene (prohibicion explicita del plan, T-43-03).

`le torte` queda declarado en el conjunto cerrado de objetos y sin usar. **Tampoco es un stub**: el conjunto declara el universo LEGAL de objetos, no una lista de obligaciones, y su hermano `le foto` es el que la sintaxis exigia.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

**Fase 43 cerrada.** Las dos categorias estan en disco, registradas y con sus invariantes congelados. Estado de cierre, todo ESPERADO:

- `node --test tests/*.test.js` → **995 pass / 0 fail**.
- `VAL_07_STRICT=1 node --test tests/*.test.js` → **2 fail**, nombrando los **9** slots `pending` de las dos categorias nuevas y **ningun** gate nuevo. Es el marcador visible del hand-off, no un fallo.
- `node scripts/run-validation-271.mjs` → sigue en `PASS (225/225)`. Es la ceguera documentada del reporter: no vera las dos categorias hasta Phase 44 / INT-02.
- `git diff --quiet src/screens/app.js src/domain/ src/data/` → exit 0. El motor v1.4 sigue byte-intacto en toda la fase.

**Pendiente y explicito — el pase TOP-LEVEL de quorum**, que no corre dentro del executor (D-43-02, `[[executor_cannot_run_task_quorum]]`):

1. Los **9** slots (3 de `fare-cond-imperativo` + 6 de `fare-indefiniti`) pasan de `pending` a `validated`, con `status === deriveStatus(passes)`.
2. **El prerequisito ya esta cumplido:** la seccion 7 de `09-VALIDATION-PROMPT.md` esta escrita y los dos skills apuntan a la ruta real. El subagent vera la excepcion del compuesto fosilizado y el principio RECONOCER NO PRODUCIR, asi que **no** debe marcar `facente funzione` / `facente parte` como poco naturales ni los magnets como sin resolver. Si lo hace, el bug esta en el prompt y no en el contenido.
3. **Ronda EXTRA obligatoria** (D-43-20): pase DeepSeek sobre las **12** variantes de los 3 slots marcados — las 5 del imperativo de 43-01, las 4 del participio passato y las 3 del infinito passato. Los gates condicionados ya estan escritos y en verde en los dos ficheros de test; se pondran rojos si alguno de esos slots llega a `validated` sin un `by` que empiece por `deepseek`.
4. **Un ejercicio por contexto, NUNCA batched** (VAL-03). `by` = el modelo realmente resuelto, no el ID pinneado de la skill.
5. Un flag **C4-accent** sobre espanol sin tildes es bug **REAL**: se arreglan los acentos, nunca override.
6. Punto de atencion propio de esta categoria para quien adjudique: el **backstop** declarado es la variante temporal del gerundio passato, la unica del fichero donde el gerundio simple queda entre las opciones y lo unico que lo excluye es el adverbial de anterioridad. Es juicio linguistico; si el verificador no puede confirmarlo con evidencia explicita, debe abstenerse a `human_needed`, nunca dar pase silencioso.

**Para Phase 44 / INT-02, numeros cerrados:** el milestone queda en **22 slots / 113 variantes** y `TOTAL_EXPECTED` debe pasar de 225 a **247**. Los arrays hardcoded de conteo, `TOTAL_EXPECTED` y la formula del baseline-guard **no** se han tocado: son el entregable literal de esa fase.

**Para Phase 44 / INT-04:** los magnets del milestone son **CUATRO** y no tres. El cuarto —`aver fatto` frente a `avere fatto`— esta resuelto aqui con audit trail en el `notes`, en la explanation y en la blacklist; **INT-04 tiene que recogerlo** o su criterio de exito describira un estado que no es el real.

**Para Phase 44 / INT-03:** el espacio de ids `fare-indefiniti-300`+ queda libre. No se ha pre-creado ni reservado con placeholder.

## Self-Check: PASSED

Los 7 ficheros declarados existen en disco y los 4 hashes de commit existen en el historial:

- `content/exercises/fare-indefiniti.json`, `tests/content-fare-indefiniti.test.js`, `content/categories.json`, `tests/exercise-types.test.js`, `.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md`, `.claude/skills/gsd-validate-exercise/SKILL.md`, `.claude/skills/gsd-validate-batch/SKILL.md` — FOUND
- `e36f4c1`, `29f909a`, `85a7a97`, `ff7d800` — FOUND

---
*Phase: 43-fare-cond-imperativo-fare-indefiniti-3-6-slots*
*Completed: 2026-08-07*
