---
created: 2026-06-15T00:00:00.000Z
title: Revisar visibilidad/timing del contador de fallos
area: general
files:
  - src/domain/progress.js
  - src/screens/app.js
  - index.html
---

## Problem

UAT 2026-06-15: el autor tenía racha 1/21 d en una categoría, falló a posta, ahora ve la racha reseteada (0) PERO **no aparece "fallada ×1"** por ningún sitio en la tabla de home.

Causa muy probable (a confirmar): tras el refinamiento `260615-r3b`, el contador `vecesFallada` de categoría se incrementa en `applySessionResult` (rama FAIL-WINS), que solo corre al **COMPLETAR la sesión** (`completeSession` → pantalla de resumen). En cambio, el **reset de racha** es **inmediato** (`applyImmediateFailure` en el instante del fallo). Resultado: si fallas y vuelves a home **sin terminar el examen**, la racha se resetea pero el +1 del contador NO se contabiliza → inconsistencia observable ("fallé, mi racha bajó, pero no cuenta el fallo").

## Solution

TBD — investigar y decidir:
1. **Confirmar el diagnóstico:** ¿el +1 SÍ aparece si se completa el examen hasta el resumen? (probar: fallar + terminar la sesión + volver a home → ¿"fallada ×1" en la columna Racha?).
2. Si es solo timing/abandono, decidir entre:
   - (a) **Contar en el momento del fallo** (mover/duplicar el incremento a `applyImmediateFailure`, robusto al abandono), con dedup por categoría/sesión para no inflar (fallar 2 ejercicios de la misma cat en la misma sesión = +1). Esto alinea el contador con el reset de racha (ambos inmediatos) y con la expectativa del autor ("fallé → cuenta").
   - (b) Mantener el conteo a fin de sesión pero dejar claro en la UI que "cuenta al terminar el examen".
3. Verificar también que el indicador "fallada ×N" se renderiza bien en la columna Racha (condición `x-show="cat.vecesFallada > 0"`).

Nota: el autor eligió la semántica "contar cada examen fallado" (una vez por sesión). La opción (a) la respeta si se dedupea por sesión.
