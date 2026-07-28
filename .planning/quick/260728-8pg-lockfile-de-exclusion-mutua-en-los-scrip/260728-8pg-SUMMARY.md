---
quick_id: 260728-8pg
status: complete
completed: 2026-07-28
subsystem: infra-validacion
tags: [concurrencia, lockfile, zero-deps, scripts-validacion, tdd]
requires:
  - scripts/validate-ai-pass.mjs
  - scripts/validate-song-pass.mjs
  - scripts/validate-decoy-pass.mjs
provides:
  - "scripts/lib/file-lock.mjs — withFileLock(file, fn, opts): exclusión mutua entre procesos"
affects:
  - "flujo /it-add-song: los loops de pase dejan de depender de disciplina humana"
tech_stack:
  added: []
  patterns:
    - "lockfile atómico vía fs.openSync(path, 'wx') (crear-o-fallar en una syscall)"
    - "backoff exponencial con jitter + timeout duro con error nombrado"
    - "handlers de proceso instalados perezosamente y retirados al soltar el último lock"
key_files:
  created:
    - scripts/lib/file-lock.mjs
    - tests/file-lock.test.js
  modified:
    - scripts/validate-ai-pass.mjs
    - scripts/validate-song-pass.mjs
    - scripts/validate-decoy-pass.mjs
    - .gitignore
    - .planning/STATE.md
metrics:
  tasks: 3
  commits: 4
  tests_before: 665
  tests_after: 672
  duration: ~35min
---

# Quick Task 260728-8pg: lockfile de exclusión mutua en los scripts de validación

Los tres scripts de pase serializan ahora su read-modify-write completo con un
lockfile atómico compartido, convirtiendo en garantía del código lo que
`it-add-song` documentaba como disciplina humana ("NO lanzar dos loops a la vez").

## Qué se construyó

**`scripts/lib/file-lock.mjs`** (240 líneas, zero-deps: `node:fs`, `node:os`,
`node:process`). API: `withFileLock(file, fn, opts)`, `lockPathFor(file)`,
`isProcessAlive(pid)`, y las constantes `DEFAULT_TIMEOUT_MS` (30s) /
`DEFAULT_STALE_MS` (60s).

- **Adquisición atómica** — `fs.openSync('<file>.lock', 'wx')` crea-o-falla en una
  sola syscall. No hay `existsSync` + `writeFileSync` en ninguna parte, así que no
  existe ventana TOCTOU entre comprobar y crear (T-8PG-01).
- **Lockfile diagnosticable** — contiene `{ pid, hostname, acquiredAt }` en JSON.
- **Reclamación segura de locks obsoletos** (T-8PG-02) — reclamable si el lockfile
  no parsea/no tiene `pid`, si el PID está muerto, o si `acquiredAt` es más antiguo
  que `staleMs`. Antes de borrar, el lockfile se **re-lee y se compara byte a byte**:
  si cambió, otro proceso ya lo reclamó y no se toca. `EPERM` de
  `process.kill(pid, 0)` (proceso de otro usuario) se trata como **VIVO** — nunca se
  reclama. `release()` sólo borra si el `pid` del lockfile es el propio.
- **Espera acotada** (T-8PG-04) — backoff 25ms → 500ms con factor 1.7 y jitter ±25%;
  al agotar el timeout lanza un `Error` que nombra el archivo, el lockfile, el
  timeout, el `pid`/`hostname`/`acquiredAt` del dueño y la pista de borrarlo a mano.
- **Liberación garantizada** (T-8PG-03) — `finally` + handlers `exit`, `SIGINT` (130),
  `SIGTERM` (143) y `uncaughtException` (1, replicando el comportamiento por defecto
  de Node). Los handlers se instalan **perezosamente** en la primera adquisición y se
  retiran (`process.off`) al vaciarse el `Set` de locks tomados: en una corrida normal
  sin concurrencia sólo viven los pocos ms de la escritura, así que no alteran el
  comportamiento observable de los scripts.

**Cableado en los tres `writePass`** (ahora `async`, cuerpo íntegro dentro del lock):

| Script | Región crítica protegida |
|---|---|
| `validate-ai-pass.mjs` | `readFileSync` → splice de texto → `writeFileSync` |
| `validate-song-pass.mjs` | `readFileSync` común + **ambas ramas** (UPDATE con su `return` temprano, e INSERT) dentro del mismo callback |
| `validate-decoy-pass.mjs` | **la lectura se movió dentro del lock** (ver abajo) |

**`.gitignore`**: patrón `*.lock` con comentario explicativo al estilo del archivo.

## Decisión de diseño relevante: mover la lectura en `validate-decoy-pass`

En ese script el lock por sí solo no habría protegido nada. `found.data` se parseaba
al arrancar (`findSongPhrase`) y entre esa lectura y la escritura media una llamada
HTTP de **hasta 120s** al modelo. Serializar sólo el `writeFileSync` habría seguido
volcando un objeto en memoria obsoleto, pisando cualquier pase que otro proceso
hubiera insertado durante la espera. Por eso el callback re-parsea el archivo desde
disco, localiza la frase por `phraseId` y lanza un error descriptivo si desapareció.
`found.data` / `found.idx` siguen usándose para construir el prompt; sólo el camino
de escritura dejó de depender de ellos. Esta reubicación estaba explícitamente
autorizada por el plan.

## Verificación

| Comprobación | Resultado |
|---|---|
| `node --test tests/*.test.js` | **672 pass / 0 fail** (665 baseline + 7 nuevos) |
| `tests/file-lock.test.js` | 7/7 en 269ms (holgado bajo el techo de 3s) |
| Exclusión **cross-process** con 2 procesos node reales | con lock sobreviven los 2 pases; sin lock se pierde 1 |
| `--dry-run` de los 3 scripts | exit 0 y stdout+stderr **byte-idénticos** al baseline previo (`diff -q`) |
| SIGINT / SIGTERM / crash asíncrono | exit 130 / 143 / 1, los tres **liberando** el lock |
| Zero-deps (T-8PG-SC) | sin `package.json` ni `node_modules` |
| `.lock` residuales en `content/`, `tests/fixtures/` | 0 |
| `grep -c withFileLock` en los 3 scripts | 2 en cada uno (import + uso) |

Cobertura de `tests/file-lock.test.js`: (a) adquisición/liberación con retorno
propagado y contenido del lockfile validado; (a-bis) `fn` que lanza → error propagado
y lock liberado; (b) exclusión real sin pérdida de escrituras + **golden-negative**
que demuestra que sin lock el test detecta el bug; (c) reclamación por PID muerto
(vía `spawnSync('node', ['-e', ''])`); (c-bis) reclamación por antigüedad; (c-ter)
guarda de seguridad — un lock de proceso vivo y reciente queda **intacto** en disco;
(d) el error de timeout contiene la ruta del archivo y el PID del dueño.

Más allá de los gates del plan, se validó a mano la afirmación cross-process (los
tests unitarios corren en un solo proceso) y las cuatro rutas de liberación por
señal, que ningún test automatizado cubre.

## Commits

| Hash | Tipo | Descripción |
|---|---|---|
| `4521554` | test | RED: exclusión mutua + golden-negative |
| `09b04a7` | feat | `file-lock.mjs` + cableado en `validate-ai-pass` + `.gitignore` |
| `448fb1c` | feat | cableado en `validate-song-pass` y `validate-decoy-pass` |
| `d41457a` | test | cobertura completa (a, a-bis, c, c-bis, c-ter, d) |

## Desviaciones del plan

Ninguna de fondo. Un solo ajuste durante la ejecución: el `staleMs` de las opciones
compartidas del test de exclusión se subió de 50ms a 5000ms. Con 50ms y una sección
crítica de 20ms el segundo titular habría podido considerar **obsoleto** el lock del
primero (vivo y legítimo) y reclamárselo, haciendo el test intermitente. Los casos
que sí necesitan un `staleMs` pequeño lo pasan puntualmente en sus propias `opts`.

## Known Stubs

Ninguno. No quedan stubs, TODOs ni tests saltados; los `<verify>` de las tres tasks
se ejecutaron íntegros.

## Notas para el futuro

- El lock desbloquea **paralelizar los pases** de `it-add-song` (hoy secuenciales por
  fichero para no corromper el JSON). El skill sigue documentando la disciplina
  manual; actualizar esa nota es un follow-up natural, fuera del alcance de este plan.
- `staleMs` de 60s es una red de seguridad, no el mecanismo principal: si un pase
  legítimo llegara a superar los 60s **dentro** de la región crítica (hoy imposible —
  la llamada HTTP queda fuera del lock), otro proceso podría reclamárselo.

## Self-Check: PASSED

- `scripts/lib/file-lock.mjs` — FOUND
- `tests/file-lock.test.js` — FOUND
- Commits `4521554`, `09b04a7`, `448fb1c`, `d41457a` — FOUND en `git log`
