---
phase: 47-traducci-n-bloque-art-culos-articoli-partitivos
source: 47-REVIEW.md
applied: 2026-08-15
scope: critical + warning (8 de 12; los 4 Info fuera de alcance)
fixed: 8
rejected_subfixes: 1
status: applied
---

# Phase 47 — Aplicación de los hallazgos del code review

Alcance por defecto (`--fix` sin `--all`): Critical + Warning. Los 4 Info (IN-01 … IN-04) quedan
fuera y siguen abiertos en `47-REVIEW.md`. Una sola pasada (sin `--auto`).

Cada arreglo lleva **golden fail-first** (rojo antes, verde después) y, donde el hallazgo lo pedía,
**verificación por mutación en clon `cp -a`** — nunca sobre el árbol real.

---

## Resultado por hallazgo

| ID | Estado | Commit | Evidencia fail-first |
|---|---|---|---|
| **CR-01** | fixed | `3443a00` | Mutación en clon: guard retirado de los 4 escritores → 3 subtests rojos (2 de comportamiento + gate anti-ceguera). Con el fix, 47/47 verde |
| **CR-02** | fixed | `5ce6513` | Mutación del review (borrar la última variante validated de `articoli-il-cons`): **antes** `PASS (205/205)` exit 0 → **ahora** `FAIL (EL DENOMINADOR ENCOGIÓ — articoli: el ancla fija 62 y en disco quedan 61)` exit 1, suite 4→5 fallos |
| **WR-01** | fixed | `93acfc7` | Mutación: `capitalizarSiAbre` neutralizado → 3 subtests rojos, incluido el barrido en disco |
| **WR-02** | fixed | `4f7b525` | Dos mutaciones de corpus en clon: inyectar `— / sin partitivo` → rojo; inyectar `dell’` (apóstrofo tipográfico) → rojo |
| **WR-03** | fixed **parcial** — 1 de los 2 subcambios RECHAZADO con evidencia | `e8bd3d0` | Mutación del review (drift compensado `avere` 20→19 / `essere` 26→27): **antes** `VAL-06 PASS (250/250)` exit 0 → **ahora** `FAIL (DRIFT POR CATEGORÍA)` exit 1, suite 4→7 fallos |
| **WR-04** | fixed | `ce72315` | Mutación: `concerns` del override de `articoli-lo-z#1` vaciado a `[]` → rojo nombrando la dirección compuesta |
| **WR-05** | fixed | `79d73e3` | Mutación: vuelta a la forma de cadena en las 2 ramas → 2 subtests rojos |
| **WR-06** | fixed | `5f9f239` | `git check-ignore -v --no-index …tmp-1234`: **antes** NO IGNORADO → **ahora** `.gitignore:28:*.json.tmp-*`. Clon con 2 temporales huérfanos: `git status` limpio |

Ficheros nuevos: `scripts/lib/pass-guard.mjs`, `scripts/bump-translation-lock.mjs`,
`content/translation-coverage.lock.json`.

---

## El subcambio rechazado — WR-03, cambio 1

**Sustituir los 9 `expected` literales de `CATEGORIES` por `slotCountOf(...)` es PEOR que el bug.**
No es prudencia: está medido con dos clones y la misma mutación.

- solo el cambio 2 → `FAIL (DRIFT POR CATEGORÍA)`, `REPORTER_EXIT=1`
- cambio 2 **+** cambio 1 → `PASS (250/250)`, `Milestone gate PASS`, `EXIT=0`

La causa: `r.total` es `exercises.length` del **mismo fichero** que `slotCountOf(file)` lee en la
**misma corrida**, así que derivar las 18 vuelve **tautológica** la comparación por categoría. Los 9
literales son hoy el único ancla que no se mueve con el corpus.

Se aplicó solo el cambio 2 y se añadió GATE-04 (que mira únicamente los literales, por la misma
razón). El array `CATEGORIES` quedó **byte-intacto**.

> **Es la tercera vez en este repo que un fix propuesto en un review resulta incorrecto**
> (precedente: `reviewer_fix_needs_same_mutation`, Phase 44, donde 2 de 4 lo eran y uno blanqueaba el
> array `CATEGORIES` entero). El patrón se sostiene: cerrar un gap ≠ verificarlo cerrado.

---

## Tres correcciones a lo que decía el review (o el propio arnés del fixer)

1. **WR-01 son 13 casos, no 12.** Medido en disco: 12 en `articoli` + 1 en `preposiciones`. La lista
   enumerada del review contenía 12 direcciones de articoli; lo que estaba mal era su prosa.
2. **WR-02:** la primera redacción del test marcaba `un po' di` (5 ocurrencias) como infracción. El
   discriminador solo gobierna el apóstrofo **final**; uno interno cae en la rama normal, que es lo
   correcto. La premisa equivocada era la del test, no la del código.
3. **WR-06:** `git check-ignore` sin `--no-index` se niega a declarar ignorado un fichero trackeado,
   así que la aserción de direccionalidad pasaba en verde aunque la regla fuese `*.json*` y se tragara
   el corpus entero — otra vez un mensaje prometiendo más de lo que comprueba. Con `--no-index` las
   dos mutaciones salen rojas.

---

## Impacto sobre `47-SECURITY.md`

| Amenaza | Estado en la auditoría | Qué la cierra |
|---|---|---|
| T-47-05 / T-47-11 / T-47-18 — Repudiation | **open** (bloqueantes) | CR-01 (ruta de borrado silencioso) + WR-04 (motivo escrito obligatorio) |
| T-47-27 — el denominador encoge en silencio | open, diferida a Phase 48 | CR-02 |
| T-47-28 — `*.json.tmp-*` sin ignorar | open, bajo umbral | WR-06 |

`47-SECURITY.md` **no se modificó**: reclasificar amenazas es del auditor. Re-ejecutar
`/gsd-secure-phase 47` para que verifique las mitigaciones nuevas y recalcule `threats_open`.

---

## Decisión pendiente del autor — consecuencia de WR-01

`fillGap` enviaba italiano con **minúscula inicial** en **13 de las 206** traducciones. El código está
arreglado, pero **los pases de esas 13 se computaron sobre entrada defectuosa**. No se re-validó
ninguna: cero llamadas a vendors, cero caracteres del corpus tocados.

- **12 en `articoli`**: `la-invariable#0`, `l-fem-vocal#0`, `l-fem-vocal#2`, `i-plural#1`,
  `le-invariable#0`, `le-invariable#2`, `300#0`, `301#0`, `302#0`, `303#0`, `304#0`, `305#0` — las 12
  `validated` con `gemini-3.5-flash-lite:correcta` + `deepseek-reasoner:correcta`.
- **1 en `preposiciones`**: `tra-futuro#1` (Phase 46) — `validated` con `deepseek-chat:correcta` +
  `gemini-3.5-flash-lite:correcta`.

**26 pases sobre entrada defectuosa, 0 `incorrecta`.**

Lo que acota la decisión:

- Ningún juez levantó el punto — pero el propio doc-block del marcador nulo razona que eso es **suerte
  del evaluador, no ausencia de defecto**.
- La de `preposiciones` pertenece a una fase **cerrada**: re-validarla toca el cuerpo de la Phase 46.
- Por la palanca de 47-01 (prueba de dos condiciones del carve-out), la condición 1 —ausencia de
  sujeto— **falla**: hay 13 sujetos.

**Advertencia operativa:** con CR-01 en pie, re-validar con un modelo que ya votó `incorrecta` ahora
**lanza**. Ninguna de las 13 lo tiene, así que hoy no bloquea; pero la retirada deliberada (precedente
del cambio de juez, `WINDOWS` id 38) ya exige `--adjudicar="<motivo>"`, y el motivo queda grabado en
el JSON.

---

## Estado final verificado (re-derivado por el orquestador, no aceptado del fixer)

```
REPORTER   TRAD-COV (206/206): PASS (206/206) · Milestone gate PASS · exit 0
           preposiciones 96/96 · partitivos 48/48 · articoli 62/62
SUITE      1360 tests / 1356 pass / 4 fail
           los 4 pre-existentes de requirements-traceability (WINDOWS id 17)
OVERRIDES  2 en el bloque de esta fase (articoli-lo-z#1, partitivos-qualche#2) — cero nuevos
CORPUS     git diff 04636a3..HEAD -- content/exercises/  →  VACÍO
BROWNFIELD git diff 04636a3..HEAD -- src/  →  VACÍO ; CURRENT_SCHEMA_VERSION = 13
DOCS       git diff 04636a3..HEAD -- docs/  →  VACÍO (doc de criterios sin tocar)
STATUS     ?? .planning/research/.cache/  (pre-existente, sin trackear)
           sin residuos .tmp-* ; ningún commit con --no-verify
```

Nota de línea base: los contratos de arriba están medidos contra **`04636a3`** (la auditoría de
seguridad), no contra el `10ce371` del snapshot de arranque, que es de la era Phase 46. Los conteos de
suite del fixer (1297/1293/4) y los del orquestador (1360/1356/4) difieren porque el segundo incluye
`tests/fixtures/*.test.js`; **el número de fallos —4, y los mismos— coincide en ambos**.
