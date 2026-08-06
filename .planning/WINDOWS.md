---
schema_version: 1
open_count: 6
waived_count: 0
fixed_count: 0
total_count: 6
last_updated: 2026-08-06T23:51:40.597Z
---

# Broken Windows Ledger

> Cross-phase defect register. `/gsd-ship` blocks while `open_count > 0`.
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
  }
]
````
