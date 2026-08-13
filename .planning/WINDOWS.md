---
schema_version: 1
open_count: 14
waived_count: 0
fixed_count: 3
total_count: 17
last_updated: 2026-08-13T13:00:26.706Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 41 | unrun-verify | content/exercises/fare-indicativo.json |  | Los 4 slots simples estan en validation.status pending: el quorum base Opus+Sonnet (VAL-03, 1 por contexto) y la ronda EXTRA DeepSeek de passato-remoto (D-41-12) siguen sin correr | open |  | 2026-08-03T18:15:04.396Z |  |
| 2 | 41 | deviation | content/exercises/fare-indicativo.json |  | Distractora facetti (1a persona del passato remoto) sustituye a la blacklisteada faci; riesgo residual de que este atestiguada en alguna variedad dialectal — la ronda DeepSeek de D-41-12 debe mirarla con lupa | open |  | 2026-08-03T18:15:04.456Z |  |
| 3 | 41 | unrun-verify | content/exercises/fare-indicativo.json |  | Los 4 slots compuestos estan en validation.status pending: el quorum base Opus+Sonnet (VAL-03, 1 por contexto) y la ronda EXTRA DeepSeek del trapassato remoto (D-41-12, con pronunciamiento explicito sobre las 2 variantes con quando) siguen sin correr | open |  | 2026-08-03T18:34:05.926Z |  |
| 4 | 41 | deviation | content/exercises/fare-indicativo.json |  | Colocacion preverbal de gia en los 12 prompts de trapassato prossimo y futuro anteriore, forzada por la invariante de dos palabras de D-41-10: gramatical y declarada en notes, pero marcada por foco — la pasada de quorum debe confirmarla | open |  | 2026-08-03T18:34:05.985Z |  |
| 5 | 41 | deviation | content/exercises/fare-indicativo.json |  | Las 3 secuencias essere + fatto usadas como distractora malformada en los compuestos vivos (sono/ero/saro fatto y familia) estan bloqueadas SOLO por el objeto directo del prompt: un segundo vendor debe confirmarlo variante a variante | open |  | 2026-08-03T18:34:06.046Z |  |
| 6 | 43 | unrun-verify | content/exercises/fare-cond-imperativo.json |  | Los 3 slots quedan en validation.status pending con passes vacio: el quorum base Opus+Sonnet y la ronda EXTRA DeepSeek (D-43-20) corren en pasada TOP-LEVEL posterior, no dentro del executor (D-43-02, VAL-03) | open |  | 2026-08-06T23:51:40.597Z |  |
| 7 | 43 | unrun-verify | content/exercises/fare-indefiniti.json |  | Los 6 slots quedan en validation.status pending con passes vacio: el quorum base Opus+Sonnet y la ronda EXTRA DeepSeek sobre las 7 variantes de participio passato e infinito passato (D-43-20) corren en pasada TOP-LEVEL posterior, no dentro del executor (D-43-02, VAL-03) | open |  | 2026-08-07T00:20:29.978Z |  |
| 8 | 43 | deviation | content/exercises/fare-indefiniti.json |  | BACKSTOP declarado del plan: en la variante temporal de fare-indefiniti-gerundio-passato el gerundio simple facendo queda entre las opciones y lo unico que lo excluye es el adverbial de anterioridad (la sera prima). Es juicio linguistico, no asercion mecanica: el quorum debe pronunciarse explicitamente o abstenerse a human_needed, nunca dar pase silencioso | open |  | 2026-08-07T00:20:30.038Z |  |
| 9 | 44 | deviation | .planning/REQUIREMENTS.md |  | INT-03 e INT-04 quedan Pending en Traceability: los 3 cruces de 44-02 nacen pending y marcar 'TODAS las variantes validadas' seria un verde que el disco no respalda | fixed |  | 2026-08-11T13:53:03.991Z | 2026-08-11T14:45:03.378Z |
| 10 | 44 | deviation | .planning/ROADMAP.md | 17 | §Milestones (lineas 17, 308, 360) corregido por reemplazo de 3 lineas y no por el skill gsd-phase: el skill solo opera sobre secciones de fase y no cubre la entrada de milestone | open |  | 2026-08-11T13:53:04.059Z |  |
| 11 | 44 | unrun-verify | content/exercises/fare-indicativo.json |  | fare-indicativo-300 y -301 quedan en validation.status pending con passes vacio: el quorum base Opus+Sonnet corre en pasada TOP-LEVEL posterior, no dentro del executor (D-44-11, VAL-03) | fixed |  | 2026-08-11T14:18:24.665Z | 2026-08-11T14:45:03.446Z |
| 12 | 44 | unrun-verify | content/exercises/fare-indefiniti.json |  | fare-indefiniti-300 queda en validation.status pending con passes vacio; G3 (el complemento que excluye dos de los tres modales) es el gate mas delicado de la fase y el quorum top-level debe pronunciarse explicitamente sobre las 3 variantes (D-44-04, D-44-11, VAL-03) | fixed |  | 2026-08-11T14:18:24.730Z | 2026-08-11T14:45:03.510Z |
| 13 | 44 | deviation | tests/count-arrays-lockstep.test.js |  | 44-03: el describe del bloque 2 se retituló para que el grep '^ok .*comentada' del verify del plan case (el TAP de Node indenta los sub-tests); desviación de forma, no de fondo | open |  | 2026-08-12T08:09:57.888Z |  |
| 14 | 44 | deviation | tests/content-fare-indicativo.test.js |  | El comentario puntero mencionaba el token pareceFare y defeteaba el criterio de posicion del TDZ del propio plan; reescrito en prosa sin el token | open |  | 2026-08-12T08:23:55.767Z |  |
| 15 | 45 | deviation | scripts/run-validation-271.mjs |  | D-45-09: el 271 del nombre del fichero codifica un conteo obsoleto (hoy 250). Deuda ACEPTADA y declarada en la cabecera; rename fuera de alcance por 17 call-sites load-bearing | open |  | 2026-08-12T21:40:28.548Z |  |
| 16 | 45 | deviation | tests/requirements-traceability.test.js |  | El gate no cruza con ROADMAP.md: un requisito ausente de las DOS mitades de REQUIREMENTS.md sigue sin gate (D-45-15, medido) | open |  | 2026-08-12T22:25:03.976Z |  |
| 17 | 46 | deviation | tests/requirements-traceability.test.js |  | 4 subtests pre-existentes en rojo (deuda de la transicion a v2.1): falta el ancla **Coverage: N/N** en REQUIREMENTS.md y la tabla de trazabilidad no tiene filas. Impide exit 0 de la suite; ver deferred-items.md de la fase 46 | open |  | 2026-08-13T13:00:26.706Z |  |

````json
[
  {
    "id": 1,
    "kind": "unrun-verify",
    "phase": "41",
    "file": "content/exercises/fare-indicativo.json",
    "line": null,
    "description": "Los 4 slots simples estan en validation.status pending: el quorum base Opus+Sonnet (VAL-03, 1 por contexto) y la ronda EXTRA DeepSeek de passato-remoto (D-41-12) siguen sin correr",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-03T18:15:04.396Z",
    "resolved_at": null
  },
  {
    "id": 2,
    "kind": "deviation",
    "phase": "41",
    "file": "content/exercises/fare-indicativo.json",
    "line": null,
    "description": "Distractora facetti (1a persona del passato remoto) sustituye a la blacklisteada faci; riesgo residual de que este atestiguada en alguna variedad dialectal — la ronda DeepSeek de D-41-12 debe mirarla con lupa",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-03T18:15:04.456Z",
    "resolved_at": null
  },
  {
    "id": 3,
    "kind": "unrun-verify",
    "phase": "41",
    "file": "content/exercises/fare-indicativo.json",
    "line": null,
    "description": "Los 4 slots compuestos estan en validation.status pending: el quorum base Opus+Sonnet (VAL-03, 1 por contexto) y la ronda EXTRA DeepSeek del trapassato remoto (D-41-12, con pronunciamiento explicito sobre las 2 variantes con quando) siguen sin correr",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-03T18:34:05.926Z",
    "resolved_at": null
  },
  {
    "id": 4,
    "kind": "deviation",
    "phase": "41",
    "file": "content/exercises/fare-indicativo.json",
    "line": null,
    "description": "Colocacion preverbal de gia en los 12 prompts de trapassato prossimo y futuro anteriore, forzada por la invariante de dos palabras de D-41-10: gramatical y declarada en notes, pero marcada por foco — la pasada de quorum debe confirmarla",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-03T18:34:05.985Z",
    "resolved_at": null
  },
  {
    "id": 5,
    "kind": "deviation",
    "phase": "41",
    "file": "content/exercises/fare-indicativo.json",
    "line": null,
    "description": "Las 3 secuencias essere + fatto usadas como distractora malformada en los compuestos vivos (sono/ero/saro fatto y familia) estan bloqueadas SOLO por el objeto directo del prompt: un segundo vendor debe confirmarlo variante a variante",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-03T18:34:06.046Z",
    "resolved_at": null
  },
  {
    "id": 6,
    "kind": "unrun-verify",
    "phase": "43",
    "file": "content/exercises/fare-cond-imperativo.json",
    "line": null,
    "description": "Los 3 slots quedan en validation.status pending con passes vacio: el quorum base Opus+Sonnet y la ronda EXTRA DeepSeek (D-43-20) corren en pasada TOP-LEVEL posterior, no dentro del executor (D-43-02, VAL-03)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-06T23:51:40.597Z",
    "resolved_at": null
  },
  {
    "id": 7,
    "kind": "unrun-verify",
    "phase": "43",
    "file": "content/exercises/fare-indefiniti.json",
    "line": null,
    "description": "Los 6 slots quedan en validation.status pending con passes vacio: el quorum base Opus+Sonnet y la ronda EXTRA DeepSeek sobre las 7 variantes de participio passato e infinito passato (D-43-20) corren en pasada TOP-LEVEL posterior, no dentro del executor (D-43-02, VAL-03)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-07T00:20:29.978Z",
    "resolved_at": null
  },
  {
    "id": 8,
    "kind": "deviation",
    "phase": "43",
    "file": "content/exercises/fare-indefiniti.json",
    "line": null,
    "description": "BACKSTOP declarado del plan: en la variante temporal de fare-indefiniti-gerundio-passato el gerundio simple facendo queda entre las opciones y lo unico que lo excluye es el adverbial de anterioridad (la sera prima). Es juicio linguistico, no asercion mecanica: el quorum debe pronunciarse explicitamente o abstenerse a human_needed, nunca dar pase silencioso",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-07T00:20:30.038Z",
    "resolved_at": null
  },
  {
    "id": 9,
    "kind": "deviation",
    "phase": "44",
    "file": ".planning/REQUIREMENTS.md",
    "line": null,
    "description": "INT-03 e INT-04 quedan Pending en Traceability: los 3 cruces de 44-02 nacen pending y marcar 'TODAS las variantes validadas' seria un verde que el disco no respalda",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-11T13:53:03.991Z",
    "resolved_at": "2026-08-11T14:45:03.378Z"
  },
  {
    "id": 10,
    "kind": "deviation",
    "phase": "44",
    "file": ".planning/ROADMAP.md",
    "line": 17,
    "description": "§Milestones (lineas 17, 308, 360) corregido por reemplazo de 3 lineas y no por el skill gsd-phase: el skill solo opera sobre secciones de fase y no cubre la entrada de milestone",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-11T13:53:04.059Z",
    "resolved_at": null
  },
  {
    "id": 11,
    "kind": "unrun-verify",
    "phase": "44",
    "file": "content/exercises/fare-indicativo.json",
    "line": null,
    "description": "fare-indicativo-300 y -301 quedan en validation.status pending con passes vacio: el quorum base Opus+Sonnet corre en pasada TOP-LEVEL posterior, no dentro del executor (D-44-11, VAL-03)",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-11T14:18:24.665Z",
    "resolved_at": "2026-08-11T14:45:03.446Z"
  },
  {
    "id": 12,
    "kind": "unrun-verify",
    "phase": "44",
    "file": "content/exercises/fare-indefiniti.json",
    "line": null,
    "description": "fare-indefiniti-300 queda en validation.status pending con passes vacio; G3 (el complemento que excluye dos de los tres modales) es el gate mas delicado de la fase y el quorum top-level debe pronunciarse explicitamente sobre las 3 variantes (D-44-04, D-44-11, VAL-03)",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-08-11T14:18:24.730Z",
    "resolved_at": "2026-08-11T14:45:03.510Z"
  },
  {
    "id": 13,
    "kind": "deviation",
    "phase": "44",
    "file": "tests/count-arrays-lockstep.test.js",
    "line": null,
    "description": "44-03: el describe del bloque 2 se retituló para que el grep '^ok .*comentada' del verify del plan case (el TAP de Node indenta los sub-tests); desviación de forma, no de fondo",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-12T08:09:57.888Z",
    "resolved_at": null
  },
  {
    "id": 14,
    "kind": "deviation",
    "phase": "44",
    "file": "tests/content-fare-indicativo.test.js",
    "line": null,
    "description": "El comentario puntero mencionaba el token pareceFare y defeteaba el criterio de posicion del TDZ del propio plan; reescrito en prosa sin el token",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-12T08:23:55.767Z",
    "resolved_at": null
  },
  {
    "id": 15,
    "kind": "deviation",
    "phase": "45",
    "file": "scripts/run-validation-271.mjs",
    "line": null,
    "description": "D-45-09: el 271 del nombre del fichero codifica un conteo obsoleto (hoy 250). Deuda ACEPTADA y declarada en la cabecera; rename fuera de alcance por 17 call-sites load-bearing",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-12T21:40:28.548Z",
    "resolved_at": null
  },
  {
    "id": 16,
    "kind": "deviation",
    "phase": "45",
    "file": "tests/requirements-traceability.test.js",
    "line": null,
    "description": "El gate no cruza con ROADMAP.md: un requisito ausente de las DOS mitades de REQUIREMENTS.md sigue sin gate (D-45-15, medido)",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-12T22:25:03.976Z",
    "resolved_at": null
  },
  {
    "id": 17,
    "kind": "deviation",
    "phase": "46",
    "file": "tests/requirements-traceability.test.js",
    "line": null,
    "description": "4 subtests pre-existentes en rojo (deuda de la transicion a v2.1): falta el ancla **Coverage: N/N** en REQUIREMENTS.md y la tabla de trazabilidad no tiene filas. Impide exit 0 de la suite; ver deferred-items.md de la fase 46",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-13T13:00:26.706Z",
    "resolved_at": null
  }
]
````
