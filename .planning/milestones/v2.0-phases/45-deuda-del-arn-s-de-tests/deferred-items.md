# Deferred items — Phase 45

Hallazgos fuera del alcance del plan en curso, registrados para no arreglarlos a escondidas
ni perderlos.

## Abiertos

| Item | Encontrado en | Descripción | Por qué se difiere |
|---|---|---|---|
| `.planning/research/.cache/` sin trackear ni ignorar | 45-01, `git status` | Directorio de caché generado por el tooling de research; aparece como `??` en cada `git status` del repo. | Es ruido de tooling GSD, no de este plan. Arreglarlo son 1-2 líneas en `.gitignore` y va a quick task, no a un plan de DEUDA-01. |
| El nombre `run-validation-271.mjs` codifica un `271` obsoleto | 45-01 | 17 call-sites load-bearing + historial de `.planning/`. | El research lo declara FUERA DE ALCANCE con recomendación escrita: quick task aparte si el autor lo quiere. Registrado como **D-45-09** y en `.planning/WINDOWS.md`. |

## Resueltos dentro de la propia fase

> Estos salen de la tabla de arriba a propósito: el pre-close audit del milestone cuenta **filas**,
> no estados, así que dejar aquí un item resuelto infla el recuento de deuda abierta — que es
> exactamente la clase de registro que miente contra la que existe esta fase.

**`scripts/run-validation-271.mjs` con comentarios stale y el pie imprimiendo
`/gsd:complete-milestone v1.1`** — diferido en 45-01 tarea 1 (el plan acotaba su edición de ese
fichero a las 2 menciones de la invocación canónica) porque era **DEUDA-03**, objeto explícito del
plan 45-03.

**Pagado por el plan 45-03** (commits `1b107e2`, `31df042`): el encabezado y el pie **derivan** el
milestone activo de `.planning/STATE.md` (fail-soft, degradan a «milestone desconocido» con las 18
filas completas y exit 0), y quedan congelados por un gate source-assert que se pone rojo si alguien
vuelve a transcribir una versión a mano. Verificado al cerrar el milestone (2026-08-13):

```
$ grep -n 'gsd:complete-milestone\|v1\.1' scripts/run-validation-271.mjs
(0 ocurrencias)
```

El `271` del **nombre del fichero** es harina de otro costal y sigue abierto — vive en su propia
fila arriba.
