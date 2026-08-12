# Deferred items — Phase 45

Hallazgos fuera del alcance del plan en curso, registrados para no arreglarlos a escondidas
ni perderlos.

| Item | Encontrado en | Descripción | Por qué se difiere |
|---|---|---|---|
| `.planning/research/.cache/` sin trackear ni ignorar | 45-01, `git status` | Directorio de caché generado por el tooling de research; aparece como `??` en cada `git status` del repo. | Es ruido de tooling GSD, no de este plan. Arreglarlo son 1-2 líneas en `.gitignore` y va a quick task, no a un plan de DEUDA-01. |
| ~~`scripts/run-validation-271.mjs` sigue con comentarios stale (`v1.1`, `Phase 10`, `271`, `195`) y el pie imprime `/gsd:complete-milestone v1.1`~~ **RESUELTO** | 45-01, tarea 1 | El plan 45-01 acotó su edición de este fichero a las 2 menciones de la invocación canónica. | Era **DEUDA-03**, y el plan **45-03 la pagó**: el encabezado y el pie derivan el milestone de `.planning/STATE.md` (fail-soft) y quedan congelados por un gate source-assert. Verificado al cerrar el milestone (2026-08-13): `grep -n 'gsd:complete-milestone\|v1\.1' scripts/run-validation-271.mjs` → **0 ocurrencias**. El `271` del nombre de fichero sigue abierto y vive en su propia fila. |
| El nombre `run-validation-271.mjs` codifica un `271` obsoleto | 45-01 | 17 call-sites load-bearing + historial de `.planning/`. | El research lo declara FUERA DE ALCANCE con recomendación escrita: quick task aparte si el autor lo quiere. |
