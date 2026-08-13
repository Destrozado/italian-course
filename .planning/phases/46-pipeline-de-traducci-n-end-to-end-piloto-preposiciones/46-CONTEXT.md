# Phase 46: Pipeline de traducción end-to-end (piloto Preposiciones) - Context

**Gathered:** 2026-08-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Bajar el pipeline COMPLETO de traducción al español y demostrarlo end-to-end sobre una categoría real:

1. **Schema** — campo opcional de traducción por variante `multiple-choice`, rechazado en `match` y `word-buttons`, sin tocar `schemaVersion` (sigue en 13) ni resetear progreso.
2. **Render** — la traducción se ve al resolver (acertando Y fallando) en las DOS superficies: la pantalla de ejercicio y "Errores cometidos" del resumen.
3. **Validación** — prompt propio derivado de los S1-S6 de canciones (NO R1-R7) + script hermano de `scripts/validate-song-pass.mjs` que corre el quórum cross-vendor y escribe el pase.
4. **Gates** — cobertura (GATE-01) y anti-ceguera (GATE-02), ambos verificados POR MUTACIÓN.
5. **Piloto** — las **96 variantes** `multiple-choice` de Preposiciones traducidas y `validated` (TRAD-01).

**Requirements:** SCH-01..03 · REND-01..05 · TVAL-01..04 · GATE-01 · GATE-02 · TRAD-01 (15).

**Fuera de la fase (van en Phases 47-53):** cualquier traducción de las otras 17 categorías. La fase compra el derecho a escalar; un prompt de validación malo o un gate ciego descubierto en la variante 500 es el modo de fallo caro que este proyecto ya ha pagado.

**Volumen VERIFICADO contra disco (2026-08-13):** `content/exercises/preposiciones.json` = 50 slots, 96 variantes, **todas `multiple-choice`** (cero `match`, cero `word-buttons`). El piloto cubre la categoría entera.

</domain>

<decisions>
## Implementation Decisions

### Motor y tiempo de lectura

- **D-46-01: El motor queda BYTE-INTACTO. No se toca `SESSION_AUTO_ADVANCE_MS` ni ninguna otra constante ni `src/domain/`.** — **Reversibility:** reversible

  **Hallazgo que fuerza esta decisión (verificado en código, no inferido):** REND-02 y GATE-03 partían de que en ejercicios hay un auto-avance de 600 ms que había que alargar. **Es falso.** El auto-avance al acertar se eliminó de los modos de ejercicio en el quick `260615-r3b`; hoy está *gated* a `sessionMode === 'cancion'` (`src/screens/app.js:1741-1750`) y el avance en ejercicios es MANUAL vía el botón "Continuar →" (`index.html:626-631`). `SESSION_AUTO_ADVANCE_MS = 600` (`app.js:73`) solo gobierna `songAdvance()`, es decir el bloque Canciones, que está fuera de scope de este milestone. En modo contrarreloj (`260615-puq`) el cronómetro se cancela al fijar feedback y `onSessionTimeout` NO auto-avanza (`app.js:1897-1908`).

  **Consecuencia:** el tiempo de lectura de la traducción ya es ilimitado en las tres superficies de ejercicio (repaso, test completo, examen), sin tocar nada. El invariante del milestone sube de «motor intacto salvo UNA excepción declarada» a **«motor byte-intacto»**, que además es más fácil de verificar (`git diff` vacío en `src/domain/` + grep de la constante).

  **REQUIREMENTS.md, ROADMAP.md y STATE.md se corrigieron en esta sesión** para que el texto describa el mecanismo que existe. No se dejó un requisito que describe un mecanismo inexistente (precedente CR-01 de la Phase 44: un registro que miente certifica en verde).

### Modelo de datos

- **D-46-02: El campo es `translationES`, un sub-objeto anidado en la VARIANTE, con forma `{ text, validation }`.** — **Reversibility:** costly — cambiar la forma después de la Phase 46 obliga a reescribir las 96 traducciones ya escritas, el schema-validator, los dos templates de render, el script de quórum y el gate del reporter; a partir de la Phase 48 serían cientos de entradas.

  ```json
  {
    "prompt": "Paolo è ___ Napoli di nascita.",
    "options": ["di", "a", "da", "in"],
    "correctIndex": 0,
    "translationES": {
      "text": "Paolo es de Nápoles de nacimiento.",
      "validation": {
        "status": "validated",
        "passes": [ { "by": "…", "date": "…", "verdict": "correcta", "concerns": [] } ]
      }
    }
  }
  ```

  **Por qué sub-objeto y no string plano:** TVAL-03 exige un `validation.passes[]` POR traducción, pero hoy `validation` vive a nivel de SLOT (ver `preposiciones.json`, slot `preposiciones-di-origen`), no de variante. El precedente exacto en repo es **`decoyBank`** en `content/songs/*.json`: un sub-objeto con su propio bloque `validation` hermano de los datos. Así el `validation` del slot no se toca, `deriveStatus` se aplica sin adaptación y el script de quórum escribe donde ya sabe escribir.

  **Descartado — validación a nivel de slot indexada por posición de variante:** acopla el pase al ÍNDICE; reordenar variantes movería silenciosamente los pases a otra frase.

  **Clave interna `text`:** el nombre de la clave externa ya declara el idioma, un `.es` anidado sería redundante.

- **D-46-03: SCH-01 se cumple sobre `translationES.text` (string no vacío), y el schema añade UN guard estructural extra.** Ese guard rechaza que el texto contenga `___`. — **Reversibility:** reversible

  La traducción es de la frase YA RESUELTA. Un `___` dentro solo puede significar que se copió el `prompt` con el hueco sin rellenar: error mecánico, baratísimo de cazar en el validator y caro de cazar a ojo en 722 frases.

  **Descartado deliberadamente:** exigir un mínimo de palabras (falsos positivos en frases italianas genuinamente mínimas) y comparar contra el `gloss` ES del `prompt` (obliga a extraer el gloss con un regex frágil que varía entre categorías). **Toda la demás calidad la juzga el quórum**, autoridad única sobre calidad.

- **D-46-04: SCH-02 — el validator RECHAZA `translationES` en variantes `match` y `word-buttons`.** — **Reversibility:** reversible

- **D-46-05: SCH-03 — `schemaVersion` sigue en 13 y no hay migración `13→14`, verificado por test explícito.** El campo es contenido en `content/`, no state.

### Render

- **D-46-06 (ENMENDADA el 2026-08-13): la traducción se pinta FUERA de la caja de feedback, entre ella y el CTA de avance.** — **Reversibility:** reversible

  **Qué se decidió ANTES** (plan-time, 2026-08-13): la traducción vivía DENTRO de `.session-feedback`, inmediatamente bajo «Respuesta correcta:» y ANTES de la `explanation`, con el orden narrativo **qué era → qué significa → por qué**:

  ```
  ┌─ ¡Esatto! / Quasi… ──────────────┐
  │  Respuesta correcta: **di**       │  ← solo al fallar (ya existe)
  │  Paolo es de Nápoles de nacim…    │  ← la TRADUCCIÓN vivía AQUÍ
  │  La preposición Di indica ori…    │  ← explanation (ya existe)
  │  [ ¿Por qué? ]                    │  ← solo al acertar (ya existe)
  └───────────────────────────────────┘
  ```

  **Qué se decide AHORA** (enmienda del 2026-08-13): el nodo sale de la caja y se sitúa entre el `</div>` de `.session-feedback` y el botón de avance. Sitio **fijo**: el mismo acertando y fallando.

  ```
  ┌─ ¡Esatto! / Quasi… ──────────────┐
  │  Respuesta correcta: **di**       │
  │  La preposición Di indica ori…    │
  │  [ ¿Por qué? ]                    │
  └───────────────────────────────────┘
     Paolo es de Nápoles de nacim…      ← la TRADUCCIÓN, fuera de la caja
     [ Continuar → ]
  ```

  **Quién lo decidió y por qué:** el **autor**, viendo la app funcionando con las 96 traducciones ya en pantalla, durante el `checkpoint:human-verify` del plan 46-05:

  > «creo que en vez de meterlo en el cuadro del error, me gusta más que esté fuera, que se vea claro, […] o justo encima del botón de continuar para verlo siempre, se me hace difícil verlo dentro de la caja de error, cuando aciertas está perfecto»

  El orden narrativo de la decisión original no era falso, pero perdía contra un hecho de uso que solo se ve con la app delante: al ACERTAR la caja apenas tiene una línea y al FALLAR está tintada de rojo y densa, así que la traducción cambiaba de sitio visual entre un caso y otro y en el caso de fallo se camuflaba dentro del recuadro de error. Fuera de la caja el sitio es siempre el mismo y siempre justo antes del gesto de avanzar.

  **Lo que la enmienda NO cambia — la razón de no ir bajo el prompt italiano SIGUE EN PIE:** post-corrección el hueco del prompt se rellena con **la opción que el usuario seleccionó**, no con la correcta (`index.html:537`: `options?.[sessionSelectedIndex]`). Al fallar, la frase italiana de arriba muestra la palabra EQUIVOCADA tachada en rojo; pegarle debajo la traducción de la frase CORRECTA dejaría dos frases contiguas que no se corresponden. Se le planteó ese sitio al autor junto con este y **lo descartó explícitamente por ese motivo**.

  **Tampoco cambia el no-leak (R1 / D-46-11):** el doble guard `sessionFeedback !== null && …translationES?.text` se conserva VERBATIM. «Verlo siempre» significa **siempre en el mismo sitio, aciertes o falles**, nunca antes de responder.

  **ENMIENDA DEL REGISTRO (2026-08-14, code review de la fase, WR-05).** Esta decisión afirmaba que «la traducción revela la palabra correcta y **no puede existir en el DOM pre-respuesta**». Eso declara una garantía MÁS FUERTE que la que el código da, y en este proyecto un registro que afirma de más certifica en verde (CR-01 de la Phase 44). Lo que el doble guard garantiza es **INVISIBILIDAD, no ausencia**: el nodo es un `<p x-show="…" x-text="…">` (`index.html:645-647`), y `x-show` alterna `style.display` mientras `x-text` fija `textContent` en un efecto independiente — igual que la `explanation`, que usa exactamente la misma mecánica (`index.html:613`). La presencia ESTRUCTURAL condicional se consigue en este fichero con `<template x-if>`, que es lo que usa el sub-template de `:547`.

  **Y eso es ACEPTABLE, por la razón que D-46-11 ya dejó escrita:** el payload ya lleva `correctIndex` y `options`, así que la respuesta está en el DOM antes de responder de todos modos; esconder `translationES` no compra nada real contra inspección. **Esto NO reabre D-46-11** ni cambia la postura de seguridad un ápice: lo que se corrige es el REGISTRO, para que una fase futura no lea esto y crea que R1 está cerrado ESTRUCTURALMENTE cuando solo lo está VISUALMENTE.

  **No se envuelve el `<p>` en un `<template x-if>`**: metería un `<template>` entre la traducción y el CTA, y el gate de `tests/screen-translation.test.js` («entre los dos no se cuela ningún otro elemento») exige que ese tramo quede vacío tras quitar comentarios. Ese camino habría que medirlo con el DOM delante.

  **Estado de verificación:** NO ejecutado. Alpine se sirve por CDN (`index.html:32`), el proyecto es zero-deps (sin `package.json`, sin jsdom) y las llamadas de red están prohibidas, así que la mecánica de `x-show` no se pudo observar en un DOM real. Lo que SÍ se verificó en disco: el nodo usa `x-show` y no `<template x-if>`; la `explanation` usa la misma mecánica; y `:547` es el precedente de presencia estructural. El test V5 está bien redactado y no hace falta tocarlo — verifica que **ningún template pinta sin guard**, no la ausencia en el DOM. Era la prosa la que se pasaba de frenada.

  **Precedente de forma:** D-46-01 también se corrigió en sesión y lo dice en su propio cuerpo. Una decisión LOCKED se enmienda por escrito con fecha, autoría y motivo — nunca se sobreescribe en silencio, porque un registro que miente certifica en verde (CR-01 de la Phase 44).

- **D-46-07 (ENMENDADA el 2026-08-13): la traducción se distingue de la `explanation` TIPOGRÁFICAMENTE, en serif, y NO lleva etiqueta.** — **Reversibility:** reversible

  **La sustancia de esta decisión se mantiene intacta:** lo que cambió el 2026-08-13 es el SITIO (ver la enmienda de D-46-06), no la distinción tipográfica.

  La traducción va en `var(--ed-font-serif)` (Spectral) porque es **texto de la frase** — hermana del prompt italiano, que es serif 30 (`app.css:858`) — mientras que la `explanation` es Hanken sans 13/400 muted (`app.css:970`) porque es comentario. La distinción es semántica, no decorativa. Beneficio extra: sin etiqueta, el caso «ejercicio sin traducción» es trivialmente limpio (REND-05) — no hay etiqueta ni contenedor que esconder aparte del propio nodo.

  **Sin etiqueta «Traducción:»** y **sin comillas latinas envolventes**: ambas se consideraron y se descartaron (ruido para un autor único que sabe qué está mirando; y las comillas serían literales de template envolviendo un `x-text`).

  **Lo único que la enmienda toca de esta decisión es el MARGEN.** Fuera de la caja, la frase ya no colapsa contra el `margin-top` de la `explanation`, y `.session-cta` no declara `margin-top` ninguno (`app.css:907-923`): sin aire propio arriba **y abajo** quedaría pegada al recuadro tintado y al botón. Medido en Chrome headless sobre el CSS real (`styles.css` + `app.css`, fuentes de `vendor/fonts/`) con la ancestría DOM real: el hueco traducción→CTA era **0 px**. Por eso las cinco declaraciones tipográficas siguen en la regla compartida —un solo criterio de estilo— y el margen se declara por superficie: `16px 0` (md, el mismo valor con el que `.session-feedback` se separa de las opciones) en pantalla, y el `8px 0 0` (sm) de siempre en el resumen. **Cero tokens nuevos, cero valores fuera de la escala de 4px.**

- **D-46-08 (ENMENDADA el 2026-08-13): REND-04 — en «Errores cometidos» del resumen se repite el mismo CRITERIO DE ESTILO, en posición distinta.** — **Reversibility:** reversible

  ```
  ┌─ ERRORES COMETIDOS · 3 ──────────────┐
  │ Tu respuesta: ~~a~~                   │
  │ Respuesta correcta: **di**            │
  │ Paolo es de Nápoles de nacimiento.    │ ← serif
  │ La preposición Di indica origen…      │ ← muted itálica (ya existe)
  └───────────────────────────────────────┘
  ```

  Un solo criterio de estilo que mantener en dos sitios; al revisar errores reconoces el mismo bloque que viste en pantalla. La `explanation` del resumen ya es `--ed-muted` + `italic` (`app.css:1982-1985`), así que el contraste serif/muted-itálica funciona igual que en pantalla.

  **Enmienda del 2026-08-13 — qué significa exactamente «lo mismo».** Antes esta decisión significaba *«misma anatomía en las dos superficies»*. Con D-46-06 enmendada significa **«mismo CRITERIO DE ESTILO (serif 16/400/1.5 ink, declarado UNA sola vez), posición distinta porque el contexto es distinto»**. La superficie 2 **NO se toca**: en la card de «Errores cometidos» la traducción sigue dentro de la card, después de «Respuesta correcta:» y antes de la `explanation`, con su `8px 0 0`.

  **Por qué la divergencia es correcta y no una incoherencia:** en el resumen **no hay botón de avance**, así que el hueco equivalente —«justo encima del CTA»— simplemente no existe ahí. Repetir la posición nueva en el resumen habría significado sacar la traducción de la card, y entonces dejaría de pertenecer al error que comenta; la card ES su contenedor semántico. Lo que el autor pidió es que la traducción esté siempre en el mismo sitio **dentro de la pantalla de ejercicio**, que es donde estudia. Consecuencia práctica en el CSS: la tipografía sigue en el selector doble (una declaración) y solo el margen se declara por superficie.

- **D-46-09: REND-01/REND-05 — mismo doble guard `x-show` que ya usa `explanation`, `x-text` exclusivo (T-02-01), y graceful degradation D-121.** — **Reversibility:** reversible

  El guard es sobre `sessionFeedback !== null` **y** sobre la presencia del campo: sin traducción no hay hueco, etiqueta ni placeholder en ninguna de las dos superficies.

- **D-46-10: REND-03 — el botón «¿Por qué?» / tecla `e` NO cambia.** Sigue revelando la `explanation` bajo demanda tras acertar. La traducción aparece SIEMPRE al resolver, sin affordance propio y sin robarle el sitio.

### R1 (no leak)

- **D-46-11: El no-leak se garantiza con el guard en pantalla MÁS un test que congela el invariante. NO se cambia el motor para ocultar el campo del payload.** — **Reversibility:** reversible

  El todo TRAD-X1 sugería que «el schema o el motor lo hagan imposible, no solo la pantalla». Se evaluó y se descartó construir la superficie sin la traducción e inyectarla al fijar feedback: **el payload ya lleva `correctIndex` y `options`**, o sea que la respuesta ya está en el DOM antes de responder; esconder `translationES` del payload no compra nada real contra inspección, y tocaría `src/screens/app.js` en un milestone que queremos brownfield puro de contenido (D-46-01).

  **Lo que sí se hace:** un test que asserta que NINGÚN template pinta la traducción sin el guard de `sessionFeedback`. Sin ese test el invariante queda sin gate y una superficie nueva añadida más adelante puede olvidarlo sin que nadie se entere.

### Validación de las traducciones

- **D-46-12: TVAL-01 — prompt propio en un doc hermano de `docs/SONG-VALIDATION-PROMPT.md`, derivado de los S1-S6 de canciones y explícitamente NO de R1-R7.** — **Reversibility:** costly — cambiar los criterios después de validar un bloque obliga a re-validar todo lo ya `validated` con el prompt viejo.

  **Mapeo criterio a criterio, decidido en esta discusión:**

  | Criterio de canciones | Aplica a traducciones de ejercicio |
  |---|---|
  | **S1** — Español natural y con sentido | **Sí, tal cual** |
  | **S2** — Fidelidad con licencia poética | **NO** — los ejercicios son prosa didáctica, no letra; la licencia poética no tiene sitio. Se reemplaza por fidelidad estricta. |
  | **S3** — Troceado correcto | **Desaparece** — aquí no hay troceado por palabras |
  | **S4** — Ortografía / acentos RAE | **Sí, tal cual** (PRES-05: un flag de acento sobre el español es bug REAL, no falso positivo) |
  | **S5** — Prompt italiano fiel y limpio | **Adaptado** — la fuente es la frase italiana con el hueco RELLENO por la opción correcta |
  | **S6** — Naturalidad idiomática / anti-calco | **Sí, tal cual** |

  El prompt debe conservar el **contrato de output parseable** (§4), los **few-shot PASS/FAIL** (§5) y el **guard anti prompt-injection** (§6) del original.

  **Frontera con `explanation` que el prompt debe hacer explícita:** una traducción NO es una explicación. Las tres prohibiciones de la `explanation` existen tras 4 rondas de quórum en las Phases 41-44; fundirlas re-engendraría esa deuda de prosa. **Y frontera con el `gloss` ES del `prompt` (canon R7):** el gloss es PRE-respuesta y desambigua; la traducción es POST-respuesta y enseña vocabulario. Conviven, no se solapan, y la traducción no puede limitarse a repetir el gloss.

- **D-46-13: TVAL-02 — script hermano de `scripts/validate-song-pass.mjs`, con el quórum cross-vendor DeepSeek + Gemini, 1-por-1 (VAL-03).** — **Reversibility:** reversible

  Espejo exacto del script de canciones: `--model` / `--fallback` / `--avoid` (para garantizar 2 `by` distintos) / `--write` / `--dry-run` / `--temp`; auto-fallback en 429 registrando SIEMPRE el modelo que de verdad respondió; zero-deps; `withFileLock` para el read-modify-write; `deriveStatus` importado de `src/data/validation-state.js` como fuente única.

  **Por qué DeepSeek + Gemini por script y no Opus + Sonnet por Task:** el `gsd-executor` no puede spawnear subagents Task, lo que obligaría a validar 96 veces a mano fuera del `execute-phase`. Además DeepSeek ya demostró ser el estricto en acentos, que es justo el criterio S4/RAE que más pesa aquí.

  **Diferencia con el script de canciones a tener en cuenta al implementar:** el `writePass` de canciones INSERTA el bloque `validation` si no existe. Aquí pasa lo mismo (`translationES.validation` nace vacío al autorar), pero el objetivo a localizar no es una frase por `id` en `data.phrases` — es **una variante dentro de un slot**, que necesita una dirección compuesta (id de slot + índice de variante).

- **D-46-14: TVAL-03 — el status sale de `deriveStatus`, sin reimplementaciones locales, con el override de autor de primera clase disponible (`by: "autor"` + `verdict: "correcta"` + `override: true`).** — **Reversibility:** reversible

  Un `disputed` se resuelve con **trabajo y motivo escrito**, nunca con override-atajo. Calidad > tokens.

- **D-46-15: La AUTORÍA de las 96 la hacen subagents Claude, 1 slot por subagent.** — **Reversibility:** reversible

  Precedente D-85 del proyecto (variantes autoradas + quórum después). Cada subagent ve un slot entero — su `explanation` y sus 1-3 variantes — así que traduce con el contexto de la regla delante y mantiene coherencia entre las variantes hermanas.

  **Por qué NO un script LLM que las genere en lote:** el generador y el validador saldrían del mismo pozo de modelos externos, y el quórum cross-vendor dejaría de ser independiente justo donde más valor tiene (precedente: el quórum cross-vendor cazó 8 bugs que los checkpoints human-verify habían aprobado).

### Gates

- **D-46-16: GATE-01 (cobertura) vive en `scripts/run-validation-271.mjs` con su propio array paramétrico de traducción y el `expected` DERIVADO del disco (patrón `slotCountOf`), nunca transcrito como número mágico.** — **Reversibility:** reversible

- **D-46-17: GATE-02 (anti-ceguera) vive en `tests/count-arrays-lockstep.test.js`, que ya ES el meta-test que muta arrays de conteo y comprueba que aparece el rojo.** — **Reversibility:** reversible

  El anti-ceguera necesita mutar el array y observar el rojo: eso es un test. Meterlo dentro del reporter significaría que el reporter se testea a sí mismo.

- **D-46-18: Las TRES mutaciones de la fase se EJECUTAN y se observa el rojo. Leer el código del gate no cuenta como verificación.**
  1. Dejar una traducción en `pending` → gate de traducción ROJO.
  2. Quitarle los acentos a una traducción → ROJO.
  3. Declarar Preposiciones cubierta y NO engancharla al array de cobertura → gate anti-ceguera ROJO.

  Lección de la Phase 45: cinco gates vacuos, los cinco cazados corriendo la mutación. Y si un fix propuesto por el code review de la fase toca un gate, **ese fix se verifica con la misma mutación que el código que arregla** (2 de 4 fixes de revisor en la Phase 44 eran incorrectos y uno era peor que el bug).

### Claude's Discretion

- Nombres exactos del doc de prompt y del script (se sugiere el espejo del par de canciones: `docs/TRANSLATION-VALIDATION-PROMPT.md` + `scripts/validate-translation-pass.mjs`).
- Nombres de las clases CSS nuevas y su ubicación en `app.css`.
- Forma exacta de la dirección compuesta slot+variante en la CLI del script de quórum.
- Troceado de la fase en plans.

### Folded Todos

- **`traduccion-es-por-ejercicio.md`** (TRAD-X1, `resolves_phase: 46`) — el todo del autor que originó el milestone. Sus seis puntos de diseño «a decidir en plan-time» quedan TODOS resueltos: nivel = variante (sí), R1 no-leak (D-46-11), colisión con el `gloss` R7 (D-46-12, conviven), separado de `explanation` (D-46-12), precedente Canciones (D-46-12/13, es la plantilla), migración (D-46-05, no hay), acentos RAE (D-46-12, S4 se conserva).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos y alcance de la fase
- `.planning/REQUIREMENTS.md` — los 22 requirements de v2.1; SCH-01..03, REND-01..05, TVAL-01..04, GATE-01/02 y TRAD-01 son de esta fase. **REND-02 y GATE-03 fueron corregidos el 2026-08-13 en esta discusión** (ver D-46-01).
- `.planning/ROADMAP.md` §"Phase 46" — Success Criteria de la fase (también corregidos).
- `.planning/todos/pending/traduccion-es-por-ejercicio.md` — el todo TRAD-X1 original del autor.

### Plantilla del validador (la fuente de la que se deriva TVAL-01/TVAL-02)
- `docs/SONG-VALIDATION-PROMPT.md` — criterios S1-S6, contrato de output parseable (§4), few-shot PASS/FAIL (§5), guard anti prompt-injection (§6). **El mapeo criterio a criterio está en D-46-12.**
- `scripts/validate-song-pass.mjs` — el script a espejar: CLI, auto-fallback en 429, `--avoid`, `withFileLock`, `writePass` que INSERTA el bloque `validation`.
- `docs/VALIDACION-QUORUM.md` — doctrina general de quórum del proyecto.
- `scripts/validate-ai-pass.mjs` — el hermano de ejercicios (R1-R7); útil como referencia estructural, **NO como fuente de criterios**.
- `.planning/quick/260615-vkr-validador-de-frases-de-canci-n-es-infra-/260615-vkr-CONTEXT.md` — el contexto con el que nació el validador de canciones.

### Fuente única de status
- `src/data/validation-state.js` — `deriveStatus` + el override de autor de primera clase (`by: "autor"` + `override: true`). Prohibido reimplementar la derivación en local.

### Schema y contenido
- `src/data/schema-validator.js` — el patrón `payload.explanation` opcional (líneas 413-421, 476-481, 539-546) es el molde exacto del campo opcional retrocompatible.
- `content/exercises/preposiciones.json` — el contenido del piloto: 50 slots, 96 variantes, todas `multiple-choice`.
- `content/songs/22-settembre.json` — el precedente `decoyBank` (sub-objeto con `validation` propio) que justifica D-46-02.

### Render
- `index.html:613-620` (repaso/test) · `:727-736` · `:867-882` (word-buttons) — los tres bloques de `explanation` con su doble guard.
- `index.html:1294-1297` y vecinos — la `explanation` en «Errores cometidos» del resumen.
- `index.html:525-539` — el prompt con `.session-gap`, que post-corrección se rellena con la opción SELECCIONADA (base de D-46-06).
- `app.css:858-865` (`.session-prompt` serif 30) · `:957-977` (`.session-feedback-correct`, `.session-explanation`) · `:1982-1985` (`.summary-error-explanation` muted itálica) — el sistema tipográfico sobre el que se apoya D-46-07.

### Motor (solo para verificar que NO se toca)
- `src/screens/app.js:73` (`SESSION_AUTO_ADVANCE_MS`) · `:1740-1750` (auto-avance gated a canción) · `:1873-1908` (cronómetro y timeout) — la evidencia de D-46-01.

### Gates
- `scripts/run-validation-271.mjs` — el reporter; array `CATEGORIES` con `expected` derivado.
- `tests/count-arrays-lockstep.test.js` — el meta-test anti-ceguera que muta arrays y comprueba el rojo.
- `tests/exercise-types.test.js:1328-1375` — `slotCountOf` y el patrón de `expected` derivado del disco.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`decoyBank` (`content/songs/*.json`)** — precedente estructural exacto de D-46-02: sub-objeto de datos con su propio `validation.passes[]` hermano, colgando de un elemento que ya tiene su `validation` a otro nivel.
- **`payload.explanation` (`src/data/schema-validator.js`)** — molde del campo opcional retrocompatible aplicado a los tres tipos de payload; se replica para `translationES` invirtiendo la política en `match` / `word-buttons` (allí se RECHAZA, SCH-02).
- **`deriveStatus` (`src/data/validation-state.js`)** — fuente única de status + override de autor. Se importa, no se replica.
- **`scripts/validate-song-pass.mjs`** — plantilla completa del script de quórum: routing por prefijo de modelo, auto-fallback 429, `--avoid`, `withFileLock`, `writePass` que inserta el bloque `validation`.
- **`.session-feedback` / `.session-explanation` / `.summary-error-explanation` (`app.css`)** — la caja tintada y su escala tipográfica ya existen; la traducción es un nodo más dentro de ellas.
- **`slotCountOf` (`tests/exercise-types.test.js:1335`)** — helper de `expected` derivado del disco, obligatorio para GATE-01.
- **`tests/count-arrays-lockstep.test.js`** — el meta-test de mutación ya montado; GATE-02 se añade ahí, no se inventa de cero.

### Established Patterns

- **Campo opcional aplicado a todo el corpus = fase de pipeline + fases de contenido** (Phases 7 / 7.1 / 7.2 de v1.0). Esta fase es la 7.
- **Doble guard de render:** `x-show` sobre `sessionFeedback` **y** sobre la presencia del dato; `x-text` exclusivo, jamás `x-html` (T-02-01); graceful degradation D-121.
- **Quórum 1-por-1, nunca batched (VAL-03):** un contexto fresco por unidad validada.
- **`expected` derivado del disco, nunca literal mágico** (D-31-06); el precedente contrario ya costó un CR-01 en la Phase 44.
- **Gate verificado por mutación, no por lectura** (Phase 45).
- **`by` registrado = el modelo que de verdad respondió**, no el pinneado.

### Integration Points

- `src/data/schema-validator.js` — acepta `translationES` en `multiple-choice` (variantes), lo rechaza en `match` y `word-buttons`, y valida `text` como string no vacío sin `___`.
- `index.html` — 2 superficies: la caja `.session-feedback` de la pantalla de ejercicio y la tarjeta de «Errores cometidos» del resumen. Solo el sub-template `multiple-choice` de cada una.
- `app.css` — clases nuevas para la traducción en ambas superficies (serif).
- `content/exercises/preposiciones.json` — 96 objetos `translationES` nuevos.
- `scripts/run-validation-271.mjs` — array de cobertura de traducción + gate.
- `tests/count-arrays-lockstep.test.js` — mutación anti-ceguera del array nuevo.
- **`src/domain/` y `src/screens/app.js`: NO se tocan** (D-46-01, D-46-11).

</code_context>

<specifics>
## Specific Ideas

- **Anatomía exacta de la caja de feedback** (D-46-06) — el autor eligió este layout sobre un mockup concreto:

  ```
  ┌─ ¡Esatto! / Quasi… ──────────────┐
  │  Respuesta correcta: **di**       │  ← solo al fallar
  │  Paolo es de Nápoles de nacim…    │  ← TRADUCCIÓN
  │  La preposición Di indica ori…    │  ← explanation
  │  [ ¿Por qué? ]                    │  ← solo al acertar
  └───────────────────────────────────┘
  ```

- **Anatomía exacta del resumen** (D-46-08):

  ```
  ┌─ ERRORES COMETIDOS · 3 ──────────────┐
  │ Tu respuesta: ~~a~~                   │
  │ Respuesta correcta: **di**            │
  │ Paolo es de Nápoles de nacimiento.    │ ← serif
  │ La preposición Di indica origen…      │ ← muted itálica
  └───────────────────────────────────────┘
  ```

- **El nombre de la clave lo eligió el autor explícitamente: `translationES`** (rechazó `traduccion`, `translation` y `traduccionEs`).

- **Frase de ejemplo canónica de la fase** (slot `preposiciones-di-origen`, variante 1): `Paolo è ___ Napoli di nascita.` → `Paolo es de Nápoles de nacimiento.` Sirve de caso de prueba en el schema, el render y el prompt de validación.

</specifics>

<deferred>
## Deferred Ideas

- **Subir `SESSION_AUTO_ADVANCE_MS` por el modo canción** — se consideró y se descartó: afectaría SOLO al bloque Canciones, que está fuera de scope de traducción (sus frases ya SON traducción validada). Si algún día el auto-avance de 600 ms en canciones se siente corto, es un quick task propio.
- **Que el motor oculte el campo del payload hasta resolver** — descartado en D-46-11 con razón técnica (el payload ya expone `correctIndex`). Si algún día el payload deja de llevar la respuesta, merece re-evaluarse.
- **Guard de schema «traducción de una sola palabra»** — descartado en D-46-03 por falsos positivos; el riesgo que atacaba (glosa en vez de frase) es explícitamente de la **Phase 49** (morfología) y allí lo cubre el quórum.
- **Guard de schema «traducción idéntica al `gloss` ES del prompt»** — descartado en D-46-03 por fragilidad del regex; el criterio vive en el prompt de validación (D-46-12), no en el schema.
- **Etiqueta «Traducción:» y comillas latinas envolventes** — descartadas en D-46-07 a favor de la distinción serif.

### Reviewed Todos (not folded)

- **`mobile-responsive-exercise-home.md`** — el matcher lo puntuó alto (0.9) por keywords de UI, pero es responsive móvil, diferido desde v1.8 a un milestone propio. No es de esta fase.
- **`decoybank-pos-multi-categoria.md`** — DECOY-X1, diferido hasta que el patrón reaparezca en una canción nueva. Ajeno a traducciones de ejercicio.
- **`vocabulario-es-it.md`** — VOCAB-X1, el milestone SIGUIENTE. Se alimenta de los pares ES↔IT que produce v2.1, por eso va después.

</deferred>

---

*Phase: 46-Pipeline de traducción end-to-end (piloto Preposiciones)*
*Context gathered: 2026-08-13*
