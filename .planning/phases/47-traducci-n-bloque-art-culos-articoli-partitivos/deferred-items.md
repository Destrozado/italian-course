# Hallazgos aplazados — Phase 47

Cosas destapadas al ejecutar, FUERA del alcance del plan que las encontró. No se
arreglan aquí; se anotan para que no se pierdan.

## D-47-A · El hueco arrastra un espacio que la elisión no escribe (cosmético, UI)

**Destapado en:** plan 47-02, Task 2, al arreglar `fillGap` (commit `005e49c`).

Los `prompt` del corpus escriben el hueco con espacios a los dos lados
(`Metti ___ aceto nell'insalata.`). Cuando la opción correcta es una forma **elidida**
(`dell'`, `l'`, `un'`, `quest'`, `quell'`), el italiano correcto la suelda a la palabra
siguiente (`dell'aceto`), y ese espacio sobra.

En el pipeline de traducción ya está resuelto: `fillGap` suelda la elisión antes de
componer el payload, así que el evaluador recibe italiano limpio.

**Lo que queda abierto es el RENDER de la app**, y se afirma verificado, no supuesto:
`src/screens/app.js:2802` parte el `prompt` por el literal `___` y renderiza el hueco
como un slot inline entre las dos mitades. Como las dos mitades conservan sus espacios,
el alumno ve `Metti dell' aceto` con el espacio, igual que veía el payload antes del
arreglo.

- **Alcance:** las 21 variantes con opción correcta elidida, en 7 ficheros — `articoli`
  (10), `dimostrativi` (5), `partitivos` (3), `profesiones` (2), `genero-numero` (1).
- **Por qué NO se toca aquí:** el plan 47-02 tiene `src/domain/` y `src/screens/app.js`
  declarados intocables, y esto es una cuestión de renderizado/autoría, no de traducción.
- **Trampa para quien lo arregle:** el discriminador NO puede ser «la palabra siguiente
  empieza por vocal». El corpus tiene una apócope, `fare-cond-imperativo-imperativo#0`
  (`Marco, fa' una foto...`), que va seguida de vocal y que NO se suelda. El criterio
  correcto es ortográfico: consonante ante el apóstrofo = elisión (suelda), vocal ante el
  apóstrofo = apócope (no suelda). Ya está implementado y testeado en
  `scripts/validate-translation-pass.mjs` (`OPCION_ELIDIDA`) y se puede reutilizar.

## D-47-B · La `explanation` de `partitivos-qualche` glosa «algunos» y las 3 traducciones dicen singular

**Destapado en:** plan 47-02, continuación, al descargar el override de autor sobre
`partitivos-qualche#2` (commit `b7c1ddb`).

La `explanation` del slot abre con **«Qualche significa algunos** pero en italiano rige
siempre singular»`. Las **tres** traducciones del slot, en cambio, resuelven en singular:

| Variante | `translationES.text` |
|---|---|
| `#0` | Todavía tengo **algún** libro por leer. |
| `#1` | Hay **algún** problema con la conexión. |
| `#2` | Conozco a **alguna** chica simpática en clase. |

El alumno lee «significa algunos» en la explicación y «alguna» en la traducción de la
misma frase. La `explanation` **no es incoherente en sentido estricto** —dice exactamente
que el valor es plural *pero* la rección es singular, que es la regla real—, pero la
fricción de lectura existe y es la que el override de `#2` hizo visible.

**Por qué NO se toca aquí, y esto es lo importante:** una `explanation` es **contenido de
ejercicio gobernado por el quórum R1-R7**
(`.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md`),
**no por los criterios S1-S6 de traducción**. Editarla dentro de este plan sería validar
prosa de ejercicio **bajo el prompt equivocado**, que es precisamente el error de método
que el proyecto tiene prohibido. El `validation` a nivel de slot está `validated` desde
**2026-05-28** (`deepseek-v4-pro` + `claude-opus-4-7`) y tocar la `explanation` lo
invalidaría, obligando a re-correr R1-R7 sobre el slot entero.

**Alcance si se decide arreglar:** el slot `partitivos-qualche` completo, vía
`/gsd-validate-exercise` (quórum R1-R7), no vía el validador de traducciones. Decisión
deliberada del autor, no automática.
