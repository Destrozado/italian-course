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

  ---

  **ENMIENDA DEL REGISTRO (2026-08-14 — Phase 47, plan 47-01, Task 3). Decidida por el AUTOR en un `checkpoint:decision` bloqueante: `opcion-b`.** Nada del texto de arriba se retira: el mapeo criterio a criterio, las fronteras y la reversibility `costly` siguen vigentes palabra por palabra. Lo que esta enmienda toca es **el ALCANCE de la obligación de re-validar**, que la redacción original dejó en términos absolutos («todo lo ya `validated` con el prompt viejo») porque nació en una fase que era la ÚNICA que había producido contenido validado. La Phase 47 es la primera que amienda el doc estando ya cerrado un bloque de otra fase, y ahí la regla literal deja de discriminar entre una enmienda que puede cambiar veredictos y una que demostrablemente no puede.

  **Regla enmendada — la obligación se mantiene DONDE LA ENMIENDA TIENE SUJETO.** Amendar `docs/TRANSLATION-VALIDATION-PROMPT.md` sigue obligando a re-validar todo lo `validated` bajo el prompt anterior, **salvo** que la enmienda sea DEMOSTRABLEMENTE INERTE sobre ese cuerpo de contenido. «Demostrablemente inerte» exige las **dos** condiciones a la vez, ambas derivadas del disco y **escritas en el momento**, nunca reconstruidas después:

  1. **Ausencia de sujeto:** cero variantes del cuerpo ya validado presentan la construcción que la enmienda regula.
  2. **Direccionalidad absolutoria:** la enmienda solo puede convertir un `incorrecta` en `correcta`, nunca al revés (ver el argumento de abajo, que es lo que hay que rehacer en cada caso — no una casilla que marcar).

  Si falta cualquiera de las dos, o si la enmienda **endurece** algún criterio en lugar de absolver, se vuelve al **cumplimiento literal**: se re-valida todo, como hizo la Phase 46 descartando 75 `validated` y ~190 llamadas ya pagadas. La deuda aceptada se declara además en `.planning/WINDOWS.md`. Una decisión LOCKED se enmienda por escrito, con fecha y firma; nunca se erosiona en silencio (mismo precedente de forma que la enmienda de D-46-06).

  **Cifras que sostienen la condición 1, RECOMPUTADAS del disco el 2026-08-14 al ejecutar el Task 3** (no transcritas de un plan ni de un SUMMARY). Se buscó la anatomía metalingüística de forma ANCHA: presencia de flecha (`->`, `=>`, `→`, `⇒`) en el `prompt` **o** alguna `option` que sea una etiqueta gramatical española:

  | Categoría | Variantes `multiple-choice` | Con anatomía metalingüística | `validated` bajo el prompt anterior |
  |---|---|---|---|
  | `preposiciones` (Phase 46, cerrada) | 96 | **0** | 96 |
  | `articoli` (Phase 47, sin traducir aún) | 62 | **0** | 0 |
  | `partitivos` (Phase 47) | 48 | **5** (todas en `partitivos-clasificacion`) | 5, y las 5 **bajo el doc YA amendado** |

  Las 5 únicas variantes con sujeto son justo las que motivaron la enmienda y ya se validaron con el doc nuevo delante. El cuerpo que la `opcion-a` obligaría a re-validar —las 96 de `preposiciones`— tiene **sujeto cero**.

  **Argumento de la condición 2: por qué este carve-out NO PUEDE voltear una `correcta`.** Es un argumento comprobable, no una afirmación; quien lo dude puede rehacerlo leyendo la sección «Excepción estructural: el `prompt` METALINGÜÍSTICO» de `docs/TRANSLATION-VALIDATION-PROMPT.md`.

  - **Mecánica del veredicto:** el evaluador emite `incorrecta` cuando encuentra **al menos un** motivo-para-marcar; `correcta` es exactamente el caso en que ese conjunto de motivos queda **vacío**. Voltear una `correcta` requiere, por tanto, **añadir** un motivo nuevo al conjunto.
  - **Lo que la sección añadida instruye:** sus tres viñetas son (a) «**NO** marques `s5_italiano` ni `s2_fidelidad` por la flecha y la cola española», (b) «**NO** exijas que la traducción reproduzca la cola metalingüística», y (c) el recordatorio de que la frase italiana previa a la flecha **sigue** sujeta a S5 y S2 sin rebaja. Las dos primeras **retiran** motivos del conjunto; la tercera **no añade ninguno**: reitera criterios ya vigentes sin exigir nada que S5 y S2 no exigieran antes.
  - **Conclusión:** quitar elementos de un conjunto que ya está vacío lo deja vacío. Ninguna `correcta` puede pasar a `incorrecta` por esta enmienda. Y el criterio para juzgar futuras enmiendas queda operativo: **si una enmienda futura introduce un imperativo de la forma «marca como incorrecta si…» o «exige que…», este argumento NO le aplica** y el carve-out de alcance queda vetado para ella.
  - **El único camino de volteo que sí existe, y por qué tampoco tiene sujeto aquí.** Al re-anclar la fuente de S5/S2 a la frase italiana previa a la flecha, la sección **encoge** lo que hay que reproducir (antes la cadena mixta entera, ahora solo su mitad italiana), y encoger una exigencia no crea fallos. Pero abre un flanco honesto: una traducción que **sí** hubiera reproducido la cola metalingüística podría, bajo el doc nuevo, leerse como que **añade** contenido ausente de la fuente, y S2 castiga añadir igual que omitir. Ese flanco solo puede materializarse en traducciones de `prompt` metalingüísticos, y en `preposiciones` hay **0**. Sujeto cero otra vez, ahora por la vía estricta.
  - **Corroboración empírica (no es la prueba, es consistencia con ella):** `partitivos-clasificacion#0` se re-validó bajo el doc amendado **sin cambiar un solo carácter** de su `translationES.text` (`"He comido algo de pan."`, idéntico en `da06087` y en `dc661e0`) y **sin override de autor**. `deepseek-chat` pasó de `incorrecta` —con el concern literal `[S2-fidelidad] La traducción omite la parte metalingüística del original…`— a `correcta`. El único movimiento observado fue en la dirección absolutoria. Una observación no demuestra la dirección general: eso lo hace el argumento de arriba. Lo que la observación aporta es que el argumento **no está desmentido por los hechos**.

  **Deuda que esta enmienda acepta explícitamente:** las 96 traducciones de `preposiciones` siguen certificadas bajo los criterios PRE-enmienda. Queda declarada en `.planning/WINDOWS.md` con lo que la forzaría a re-validarse de verdad. **Alcance de esta enmienda:** la regla de alcance, no los criterios. `docs/TRANSLATION-VALIDATION-PROMPT.md` es y sigue siendo el único sitio donde viven los criterios.

  ---

  **SEGUNDA NOTA (2026-08-14 — Phase 47, plan 47-02). Decidida por el AUTOR: `opción A`. La enmienda de arriba SÍ tenía sujeto esta vez, el carve-out NO se aplicó, y se ejecutó CUMPLIMIENTO LITERAL de D-46-12.**

  Esta nota existe para dejar constancia de que **la enmienda de 47-01 tiene dientes**. Una regla que solo se invoca cuando exime es una regla decorativa: la primera vez que se escribió, sirvió para NO re-validar 96 traducciones. La segunda vez —hoy— se aplicó su prueba de dos condiciones, **falló una**, y la consecuencia que la propia regla prescribe («si falta cualquiera de las dos, se vuelve al cumplimiento literal») se ejecutó de verdad, gastando llamadas. Eso es lo que la nota certifica, y por eso se escribe aunque el coste haya sido pequeño.

  **Qué se amendó hoy en el doc de criterios:** la *«Excepción léxica: el PARTITIVO italiano se traduce «algo de» / «un poco de» / «unos-unas»»*, hermana de la de `da` + PERSONA y con su misma anatomía. Motivo: `deepseek-chat` marcó `[S2-fidelidad] la traducción añade "algo de", que no está en el original` sobre **4 variantes distintas** mientras `gemini-3.5-flash-lite` aprobaba la construcción IDÉNTICA — el síntoma canónico de un hueco del doc, no de 2N falsos positivos que overridear uno a uno.

  **Aplicación de la prueba de dos condiciones, con las cifras RECOMPUTADAS del disco hoy** (no transcritas del plan ni del prompt de continuación; el cuerpo «ya validado» se midió sobre el fichero tal como estaba en el commit `1f46236`, es decir ANTES de tocar nada). Se buscó el sujeto de forma ancha: presencia de `algo de`, `un poco de`, `unos` o `unas` en `translationES.text`:

  | Categoría | Variantes `multiple-choice` | Con traducción | Con el rendering partitivo | `validated` bajo el prompt anterior Y con rendering |
  |---|---|---|---|---|
  | `preposiciones` (Phase 46, cerrada) | 96 | 96 | **0** | **0** |
  | `articoli` (Phase 47, sin traducir aún) | 62 | 0 | **0** | **0** |
  | `partitivos` (Phase 47) | 48 | 48 | **39** | **35** |

  1. **Ausencia de sujeto: FALLA.** 35 variantes ya `validated` bajo el prompt anterior llevaban la construcción que la enmienda regula. La condición exige **cero**.
  2. **Direccionalidad absolutoria: SE MANTIENE.** La regla nueva solo retira motivos-para-marcar: declara falso positivo el concern «añade "algo de"» y añade explícitamente que **el sustantivo escueto también es fiel**, de modo que no exige el cuantificador ni puede marcar a quien no lo use. Su tercera parte —el NÚMERO, gemela de la DIRECCIÓN en `da` + PERSONA— **reitera S2 sin añadir exigencia**. No introduce ningún imperativo de la forma «marca como incorrecta si…», que es el veto que la enmienda de 47-01 dejó escrito.

  Falla una de las dos ⇒ **cumplimiento literal**, exactamente como la regla manda.

  **Cumplimiento literal ejecutado, y su alcance REAL, dicho sin adornos.** El sujeto vive **entero dentro de `partitivos`**: `preposiciones` tiene **sujeto CERO**, así que —a diferencia de lo que se temía— el cuerpo cerrado de la Phase 46 **no está tocado por esta enmienda** y no había nada que re-validar allí. De las 35 con sujeto:

  | Cuerpo | Variantes | Re-validadas hoy | Resultado |
  |---|---|---|---|
  | Las de 47-01 (cuerpo CONGELADO que el carve-out había eximido) | **3** de sus 5 (`partitivos-clasificacion` #0, #2, #4) | **Sí, quórum completo desde cero** | 6/6 `correcta`, texto intacto byte a byte |
  | Las `disputed` que motivaron la enmienda | **4** (`del-cons#1`, `del-cons#4`, `della-cons#0`, `della-cons#2`) | **Sí, quórum completo desde cero** | Las 4 en verde |
  | Las de este mismo plan 47-02, Task 2 (cuerpo EN VUELO) | **32** | **No** | Cubiertas por la condición 2 |

  **Las 32 NO re-validadas se declaran como decisión de ALCANCE del autor, no como sujeto inexistente.** Literalmente tienen sujeto, igual que las 3 de 47-01. Lo que las distingue no es el disco, es la naturaleza del cuerpo: las 3 de 47-01 pertenecen a un plan **cerrado** que el carve-out había eximido por escrito, y re-validarlas es lo que demuestra que la exención no era un cheque en blanco; las 32 son trabajo **en vuelo del propio plan que está amendando**. Sobre ellas actúa la condición 2, que se mantiene íntegra: la enmienda solo puede convertir `incorrecta` en `correcta`, luego ninguna de sus `correcta` puede voltearse. **Esto es un argumento de por qué es seguro, no una demostración de que no había sujeto** — la diferencia importa, y por eso queda escrita aquí y en `.planning/WINDOWS.md` en vez de disimulada en una cifra.

  **Corroboración empírica de la direccionalidad (consistencia, no prueba):** las 3 de 47-01 se re-validaron **sin cambiar un solo carácter** de su `text` y sin override, y las 6 llamadas volvieron `correcta`. Ninguna `correcta` previa se volteó. Y las 3 de `del-cons#1`, `del-cons#4` y `della-cons#0` pasaron de `disputed` a verde **sin tocar el español**: la regla absuelve, así que el texto se queda. El único movimiento observado, otra vez, fue en la dirección absolutoria.

  **Lo que la re-validación destapó y que la regla NO cubre.** `della-cons#2` no se cerró con la enmienda: necesitó **tres rondas más de trabajo**, cada una con un concern NUEVO de `deepseek-chat` y sobre un objetivo distinto (`al pomodoro`; luego la dirección contraria del mismo punto; luego `A pranzo`), la última con una sugerencia agramatical en español. Se cerró **con trabajo y sin override**, arreglando dos defectos reales del español (`al pomodoro` nombra la preparación, no el tomate crudo; y no se cocina *durante* la comida). Texto final: `Para la comida cocino algo de pasta al tomate.` **Nada de esto se escribió como excepción en el doc de criterios**: eran defectos de la traducción, no huecos de los criterios, y meterlos en el doc habría forzado una tercera enmienda por un problema que no la necesitaba.

  ---

  **TERCERA NOTA (2026-08-14 — Phase 47, seguimiento del plan 47-02). Decidida por el AUTOR: `opción A`, otra vez. La DEUDA DE ALCANCE de la segunda nota queda CERRADA — las 32 se re-validaron, y con ellas el cumplimiento literal de D-46-12 cubre el sujeto ENTERO de la enmienda del PARTITIVO.**

  La segunda nota dejó por escrito, sin disimularlo, que 32 variantes con sujeto **no** se habían re-validado y que eso era una **decisión de alcance del autor**, no una demostración de que no hubiera sujeto. Esa distinción era exactamente el punto débil que la nota señalaba de sí misma. El autor decidió cerrarlo: se re-validaron **las 32 desde cero** bajo el doc ya amendado, con quórum completo cross-vendor.

  **La cifra, RECOMPUTADA del disco** (medida sobre `content/exercises/partitivos.json` tal como estaba en el commit `1f46236`, antes de tocar nada, y derivada — no transcrita de la segunda nota ni del prompt de continuación): **39** variantes traducidas llevaban el rendering partitivo; **−3** del cuerpo de 47-01 (`partitivos-clasificacion` #0, #2, #4) y **−4** de las `disputed` que motivaron la enmienda, ambas tandas ya re-validadas ese mismo día ⇒ **N = 32**.

  | Recuento del cumplimiento literal sobre las 32 | |
  |---|---|
  | Re-validadas desde cero (2 pases cada una) | **32** |
  | Cerradas en verde | **31** |
  | Escaladas al autor como `disputed` | **1** (`partitivos-delle-invariable#0`) |
  | Texto español modificado | **0** — byte a byte idéntico |
  | Overrides nuevos | **0** |
  | Pases PRE-enmienda supervivientes | **0** |

  **Lo que esto demuestra, y lo que NO.** Demuestra la **direccionalidad absolutoria** de la enmienda del PARTITIVO por la vía cara: 31 de 32 `correcta` previas siguieron siendo `correcta` sin tocar un carácter, que es justo lo que la condición 2 predecía y lo que hasta ahora solo estaba *argumentado*. **No** demuestra que el argumento de la condición 2 fuera innecesario: lo confirma, y confirmar un argumento gastando llamadas es precisamente lo que la regla enmendada manda hacer cuando la condición 1 falla. La segunda nota decía «esto es un argumento de por qué es seguro, no una demostración»; esta nota convierte el argumento en medición.

  **Y destapó lo que un argumento no puede destapar: la 32.ª.** `partitivos-delle-invariable#0` volvió `disputed` con un concern **NUEVO**, que la enmienda del partitivo no cubría ni podía cubrir —`[S2-fidelidad] La traducción omite la preposición 'a' del original ('a merenda')`—. Esa variante es el sujeto de la CUARTA nota, abajo. Es el argumento más fuerte a favor de haber pagado el cumplimiento literal: el hallazgo estaba en el resto del cuerpo, no en la parte que la enmienda había motivado.

  — *Autor, 2026-08-14. Phase 47, seguimiento del plan 47-02.*

  ---

  **CUARTA NOTA (2026-08-14 — Phase 47, seguimiento del plan 47-02). SEGUNDA ENMIENDA DEL MISMO PLAN al doc de criterios: la excepción léxica del ADVERBIAL DE COMIDA. Tenía sujeto, y se ejecutó CUMPLIMIENTO LITERAL sobre él, decidido por el AUTOR.**

  Dos enmiendas del doc de criterios en un solo plan es suficientemente inusual como para decirlo en voz alta en vez de dejarlo implícito en un commit. La primera (PARTITIVO) la motivaron 4 `disputed`; esta la motivó **una sola** variante que la primera no pudo cerrar.

  **Qué se amendó:** *«Excepción léxica: el adverbial de comida `a pranzo` / `a cena` se traduce TRANSPONIENDO la preposición»*, tercera hermana de las de `da` + PERSONA y del PARTITIVO, con su misma anatomía. Declara **falso positivo** el concern «la traducción omite la preposición "a" de *a merenda*» y **nada más**: el español no omite la preposición, la **transpone** (`de merienda`, `en la cena`, `para la comida`) porque no admite la italiana ahí. La regla se apoya en una frase que **S2 ya contenía** —«fidelidad estricta no significa palabra por palabra; las diferencias obligadas por la lengua son correctas y no se penalizan»—, así que no rebaja S2: nombra el caso concreto en el que aplicarla al pie de la letra la contradice.

  **Por qué era hueco del doc y no un falso positivo suelto, con la evidencia CONTADA DEL DISCO.** En **todo el corpus** solo **4** variantes traducidas llevan el adverbial de comida italiano con `a`, las 4 en `partitivos`. `deepseek-chat` aprobó **3** de ellas hoy mismo y marcó la **cuarta** por la estructura IDÉNTICA:

  | Variante | Italiano | Español | Veredicto de `deepseek-chat` |
  |---|---|---|---|
  | `della-cons#0` | `A pranzo mangio della carne…` | «**En** la comida como…» | `correcta` |
  | `della-cons#2` | `A pranzo cucino della pasta…` | «**Para** la comida cocino…» | `correcta` |
  | `clasificacion#4` | `A cena bevo dell'acqua.` | «**En** la cena siempre bebo…» | `correcta` |
  | `delle-invariable#0` | `…delle mele **a merenda**.` | «**De** merienda» | **`incorrecta`** |

  **Marcar un patrón y aprobar tres idénticos es la firma canónica de este proyecto para un hueco de criterios**, no para cuatro falsos positivos aislados: es literalmente el mismo síntoma que ya obligó a escribir la excepción del gloss (Phase 42) y la del PARTITIVO (hoy, segunda nota). Y el trabajo adversarial fue al juez MÁS estricto y **del MISMO vendor que el objetor**: `deepseek-reasoner` refutó el concern punto por punto. Con un objetor solo, del mismo pozo, y refutado por su hermano estricto, el diagnóstico de hueco no descansa en la comodidad de quien lo arregla.

  **Prueba de dos condiciones del carve-out de 47-01, aplicada a ESTA enmienda:**

  1. **Ausencia de sujeto: FALLA.** **4** variantes traducidas la presentan (3 ya `validated`, 1 `disputed`). La condición exige cero. Medido sobre las **144** traducciones existentes del corpus: `preposiciones` **0**, `partitivos` **4**. (Hay además **5** variantes SIN traducir que llevan el adverbial —3 en `articoli`, 1 en `fare-indicativo`, 1 en `possessivi`—: no son sujeto de re-validación porque nunca se validaron, y nacerán ya bajo el doc amendado en 47-03 y siguientes.)
  2. **Direccionalidad absolutoria: SE MANTIENE.** La regla retira un motivo-para-marcar y declara fieles varias soluciones sin imponer ninguna. Sus dos puntos de vigilancia —**qué comida** es, y que **el adverbial no desaparezca entero**— reiteran S2 sin añadir exigencia: omitir contenido ya era S2 `false` antes de esta regla. Cero imperativos de la forma «marca como incorrecta si…», que es el veto que 47-01 dejó escrito.

  Falla una ⇒ **cumplimiento literal**, y se ejecutó: **las 4 re-validadas desde cero**, no solo la `disputed`. **8 llamadas, 8 `correcta`**, `by` escrito idéntico al pinneado en las 8 (cero auto-fallbacks; se dice porque `WINDOWS` id 33 advierte que listar un modelo no garantiza invocarlo, y la cola se verificó contra `/v1beta/models` antes de gastar la primera).

  **El español de `delle-invariable#0` NO se tocó.** «He comido unas manzanas de merienda.» se queda tal cual, byte a byte, y pasa de `disputed` a `validated` **sin override**. Es el mismo movimiento que ya hicieron `del-cons#1`, `del-cons#4` y `della-cons#0` con la enmienda anterior: cuando el defecto está en los criterios, se arreglan los criterios y el texto se queda. Overrides nuevos en todo el seguimiento: **0**; el de `qualche#2` sigue siendo el único del plan.

  — *Autor, 2026-08-14. Phase 47, seguimiento del plan 47-02.*

  ---

  **QUINTA NOTA (2026-08-15 — Phase 48, plan 48-02). TERCERA ENMIENDA del doc de criterios: la aclaración de S2 sobre el PRONOMBRE SUJETO explícito. Decidida por el AUTOR en un `checkpoint:decision` bloqueante, resolviendo con una tercera vía («opción C») distinta de las dos que el executor había propuesto. El sujeto se midió, la condición 1 FALLA, y el alcance del cumplimiento literal queda ESCALADO al autor por volumen — declarado aquí como deuda abierta, no ejecutado en silencio.**

  El executor llegó a este checkpoint proponiendo o mantener el español y cerrar con `--adjudicar`, o reescribirlo metiendo el pronombre. **El autor rechazó las dos**: el español no se toca, D-48-03 sigue sin carve-out, y el arreglo va **al doc de criterios**, que es el único fichero que el evaluador lee. Se registra la tercera vía porque es la que la doctrina del proyecto prescribía y ninguna de las dos propuestas contemplaba.

  **Qué se amendó:** *«Aclaración de S2: el PRONOMBRE SUJETO explícito del italiano no tiene que reaparecer en el español»*, cuarta hermana de las de `da` + PERSONA, PARTITIVO y ADVERBIAL DE COMIDA, con su misma anatomía. Declara **falso positivo** el concern «la traducción omite el pronombre sujeto explícito `io` / `tu` / `lui` del original» y **nada más**. Se apoya en una frase que **S2 ya contenía** —«las diferencias obligadas por la lengua (…un pronombre sujeto que el español omite) son correctas y no se penalizan»—, así que no rebaja S2: cierra la rendija de que esa frase hablaba de lo que el ESPAÑOL omite sin decir nada del caso en que el ITALIANO lo explicita, que es una forma marcada en una lengua de sujeto nulo y es justo por donde entraron los concerns.

  **Por qué era hueco del doc y no un defecto de la traducción, con la evidencia CONTADA DEL DISCO.** Firma canónica de la id 37 de `WINDOWS` («marcar un patrón y aprobar N idénticos»), reproducida aquí sobre el slot `fare-indicativo-301`, cuyas tres variantes omiten el pronombre por igual:

  | Variante | Italiano resuelto | Español | Veredicto de `gemini-3.5-flash-lite` |
  |---|---|---|---|
  | `301#0` | `Tu fai i compiti da solo, ma noi ripassiamo…` | «Haces los deberes solo, pero repasamos…» | `correcta` |
  | `301#2` | `Noi facciamo il letto…, e voi controllate…` | «Hacemos la cama…, y controláis…» | `correcta` |
  | `301#1` | `Io faccio una foto…, ma lui commette…` | «Hago una foto…, pero comete…» | **`incorrecta`** |

  El agravante que decidió el diagnóstico: **un segundo vendor llegó solo a la misma objeción**. `deepseek-chat` marcó `[S2-fidelidad] la traducción omite el pronombre sujeto 'lui' (él) del original, que es enfático y contrastivo en italiano`. Dos vendors independientes agarrándose a la misma rendija es evidencia de que la rendija existe, no de que el texto esté mal. Y el trabajo adversarial fue al juez MÁS estricto del MISMO vendor que el objetor: `gemini-2.5-flash` devolvió `correcta`. (`gemini-2.5-pro` se intentó dos veces y devolvió 429 en los 3 reintentos de cada una: sin veredicto, y se dice en vez de omitirlo.)

  **Prueba de dos condiciones del carve-out de 47-01, aplicada a ESTA enmienda. Cifras RECOMPUTADAS del disco el 2026-08-15**, derivadas y no transcritas: se recorrieron las 260 traducciones del corpus, se derivó el status con `deriveStatus` sobre `passes[]` (no se leyó el campo `status`), y se buscó el sujeto de forma ANCHA —`italianoResuelto` con pronombre sujeto italiano explícito (`io`, `tu`, `lui`, `lei`, `noi`, `voi`, `loro`, `egli`, `ella`, `essi`, `esse`) y español que lo omite—, **descontando el gloss R7** del `italianoResuelto` como el propio doc manda:

  | Categoría | Variantes `multiple-choice` | Con traducción | `validated` | CON SUJETO |
  |---|---|---|---|---|
  | `preposiciones` (Phase 46, cerrada) | 96 | 96 | 96 | **0** |
  | `articoli` (Phase 47, cerrada) | 62 | 62 | 62 | **0** |
  | `partitivos` (Phase 47, cerrada) | 48 | 48 | 48 | **0** |
  | `fare-indicativo` (Phase 48, EN VUELO) | 54 | 54 | 53 | **53** |
  | **TOTAL** | **260** | **260** | **259** | **53** |

  La medida ancha daba **54** e incluía `preposiciones-da-encasade#0`; se descartó tras inspeccionarla: el `tu` que disparaba el match vive **dentro del gloss español** (`(en español: 'Paso por tu casa a las ocho')`) y es un **posesivo español**, no un sujeto italiano. Se deja escrito porque la diferencia entre 53 y 54 es exactamente la clase de falso positivo que una medida ancha sin refinar habría convertido en una cifra falsa.

  1. **Ausencia de sujeto: FALLA.** **53** variantes ya `validated` bajo el prompt anterior presentan la construcción que la aclaración regula. La condición exige **cero**.
  2. **Direccionalidad absolutoria: SE MANTIENE, y se verificó en vez de declararse.** La sección nueva tiene 43 líneas; un grep de los patrones de endurecimiento que el veto de 47-01 nombra —`marca (como) incorrecta`, `marca sX_… false`, `exige que`, `debes`, `tienes que marcar/exigir`— devuelve **cero coincidencias**, frente a 4 marcas absolutorias (`FALSO POSITIVO`, `no debe emitirse`, `absuelve … no la exige`, `ya era false antes`). Sus dos puntos de vigilancia —que la **persona** siga siendo recuperable y que no se pierda un **contraste** que la frase afirma— **reiteran S2 sin añadir exigencia**, y lo dicen con esas palabras: cambiar de persona y omitir contenido ya eran S2 `false` antes de esta aclaración. Además la regla **absuelve la omisión sin exigirla**: una traducción que sí escriba el pronombre tampoco se marca, de modo que no puede voltear una `correcta` por ninguno de los dos lados.

  Falla una ⇒ **cumplimiento literal**. Y aquí es donde esta nota se aparta de las cuatro anteriores, en vez de disimularlo:

  **EL ALCANCE DEL CUMPLIMIENTO LITERAL QUEDA ABIERTO Y ESCALADO AL AUTOR.** El sujeto son **53** variantes, por encima del umbral de **40** que el coordinador declaró —y declaró **como supuesto suyo, no como instrucción del autor**— para devolverle la decisión de alcance. Pero la composición del sujeto no es la que ese umbral anticipaba, y esa es la información que el autor necesita para decidir:

  - **Los tres cuerpos CERRADOS tienen sujeto CERO.** Las 206 traducciones de las Phases 46 y 47 —`preposiciones` 96, `articoli` 62, `partitivos` 48— **no están tocadas por esta enmienda**. Es el mismo hallazgo que la segunda nota tuvo con el PARTITIVO, y por el mismo motivo: el sujeto vive entero dentro de la categoría que lo motivó.
  - **Las 53 son trabajo EN VUELO del propio plan que está amendando.** Es literalmente la situación que la segunda nota analizó para sus 32: sobre ellas actúa la **condición 2**, que aquí se mantiene íntegra y verificada. **Esto es un argumento de por qué es seguro, no una demostración de que no haya sujeto** — la distinción importa y por eso queda escrita, igual que se escribió entonces.
  - **Coste del cumplimiento literal si el autor lo elige:** 53 × 2 = **106 llamadas**, con los jueces declarados. La tercera nota es el precedente de que pagarlo destapa lo que un argumento no destapa: allí la variante 32 volvió con un concern nuevo que la enmienda no cubría.

  **Corroboración empírica de la direccionalidad (consistencia, no prueba).** `fare-indicativo-301#1` se re-validó **desde cero** bajo el doc ya amendado, con los dos jueces declarados y `passes[]` reseteado a vacío: **2 llamadas, 2 `correcta`**, y pasa de `disputed` a `validated` **sin tocar un solo carácter del español** («Hago una foto sin problemas, pero comete un error cada vez.», byte a byte idéntica en `35bc8a4` y después) y **sin override**. Es exactamente el movimiento de `partitivos-delle-invariable#0` en la cuarta nota: cuando el defecto está en los criterios, se arreglan los criterios y el texto se queda. El único movimiento observado, otra vez, fue en la dirección absolutoria.

  **El pase retirado, transcrito literal antes de retirarlo** —porque el disenso no se borra en silencio y `passes[]` se reseteó a vacío para re-validar desde cero:

  ```
  { "by": "gemini-3.5-flash-lite", "date": "2026-08-15", "verdict": "incorrecta",
    "concerns": ["[S2-fidelidad] omite el sujeto pronominal explícito \"lui\" de la segunda
      proposición del original (\"pero él comete un error cada vez\"); sugerencia:
      \"Hago una foto sin problemas, pero él comete un error cada vez.\""] }
  ```

  Se retiró **sin `--adjudicar` y sin override**, por decisión expresa del autor: el pase juzgaba bajo unos criterios que ya no rigen, y su contenido sobrevive aquí, en `.planning/WINDOWS.md` y en el histórico de git. El acompañante `deepseek-reasoner: correcta` se retiró con él por la misma razón, para que el quórum nuevo sea íntegramente post-enmienda: **cero pases pre-enmienda supervivientes en esa variante**.

  **Alcance de esta enmienda:** los criterios, no la regla de alcance. `docs/TRANSLATION-VALIDATION-PROMPT.md` es y sigue siendo el único sitio donde viven los criterios; la regla de alcance sigue siendo la de la primera nota, sin tocar.

  — *Registrado por el executor del plan 48-02, 2026-08-15, ejecutando la decisión del autor. La deuda de alcance de las 53 queda ABIERTA y pendiente de su decisión.*

  ---

  **SEXTA NOTA (2026-08-15 — Phase 48, seguimiento del plan 48-02). La DEUDA DE ALCANCE de la quinta nota queda CERRADA: el AUTOR eligió CUMPLIMIENTO LITERAL sobre el sujeto ENTERO, se ejecutó, y destapó un defecto que el argumento de la condición 2 no podía destapar.**

  La quinta nota dejó la deuda abierta porque el sujeto (53) superaba el umbral de 40 que el coordinador había declarado —**como supuesto suyo, no como instrucción del autor**— para devolverle la decisión de alcance. **Ese umbral erró el blanco, y conviene decir por qué en vez de dejarlo pasar:** se había calibrado temiendo que el sujeto alcanzara los cuerpos cerrados y costara «lo que las 206 que la rama `no-aplica` había evitado». La medición mostró otra composición —**206 con sujeto CERO, 53 en vuelo**—, así que el umbral se disparó por volumen sobre un cuerpo que no era el que lo motivaba. El autor decidió con esa corrección delante, y eligió lo mismo que en la tercera nota: **pagar**. Su argumento, citado de la propia recomendación del executor: *el precedente dice que pagarlo destapa lo que un argumento no destapa*.

  **Alcance ejecutado:** las **53** traducciones `validated` bajo el prompt PRE-enmienda, es decir todas las de `fare-indicativo` menos `301#1`, que ya había nacido bajo el doc enmendado y por tanto no era sujeto. **Quórum completo desde cero**, con `passes[]` reseteado a vacío en cada una para que ningún pase pre-enmienda sobreviviera, y con los jueces declarados del bloque (D-48-01). Cola verificada antes de gastar la primera llamada (id 33).

  | Recuento del cumplimiento literal sobre las 53 | |
  |---|---|
  | Re-validadas desde cero (2 pases cada una) | **53** |
  | Llamadas | **106** |
  | Auto-fallbacks (`by` escrito ≠ `by` pinneado) | **0** |
  | Cerradas en verde a la primera | **51** |
  | Escaladas al autor | **2** |
  | Caracteres del español modificados POR EL MERO HECHO DE RE-VALIDAR | **0** |
  | Pases PRE-enmienda supervivientes | **0** — el campo `adjudicacion` desaparece del fichero |
  | Overrides nuevos durante el barrido | **0** |

  **Las dos escaladas son de VENDORS DISTINTOS**, así que no hay sesgo sistemático de un lado y cada una se juzgó por su fondo.

  **(a) `passato-remoto#4` — el objetor repitió una objeción falsa de hecho.** `gemini-3.5-flash-lite` volvió a sostener que el passato remoto de `fare` para `voi` es `feceste` y no `faceste`. Es falso: el paradigma es feci / facesti / fece / facemmo / **faceste** / fecero, y `feceste` es `options[0]` mientras `correctIndex` es 1 — el objetor propone como respuesta correcta justamente la distractora de alternancia cruzada que la `explanation` del slot declara a propósito. Además el concern juzga el EJERCICIO, que la §3 del doc prohíbe. Y el propio objetor aprobó la estructura **idéntica** en `#1` (`facesti`) y `#3` (`facemmo`) en esta misma pasada.

  **Lo que esta variante destapó no es sobre el contenido, sino sobre la herramienta, y es la razón de que necesitara una vía nueva.** El intento de cerrarla con `--adjudicar` **falló por diseño del mecanismo**: `--adjudicar` **no fija el veredicto**, solo PERMITE sobrescribir un `incorrecta` previo; lo que se escribe sigue siendo lo que devuelve el modelo, y en esa muestra volvió a ser `incorrecta`. El resultado en disco fue un pase `incorrecta` **llevando colgado un motivo que refutaba su propio concern**, con el status todavía en `disputed` — un registro que se lee como adjudicado sin estarlo. Se retiró el campo (dejando `verdict` y `concerns` intactos) y **no se re-invocó**, porque re-invocar hasta que el modelo dijera `correcta` es exactamente el dado que el `pass-guard` existe para impedir, con sus mismas palabras. Acumulado del juez declarado sobre esa variante: **3 `incorrecta` y 2 `correcta` en 5 muestras**. El hallazgo queda registrado en `.planning/WINDOWS.md` y asignado al plan 48-05.

  **Cierre por decisión del autor (opción B):** invocación **fresca, pinneada y POST-enmienda** de un tercer modelo, `gemini-2.5-flash`, sobre esa única variante — el `correcta` que ese mismo modelo había dado durante el trabajo adversarial de la Task 2 **no se reutilizó**, porque era PRE-enmienda y reutilizarlo habría violado la condición de cero supervivientes que rige todo este seguimiento. Devolvió `correcta` con `concerns: []`, `by` escrito idéntico al pinneado. **Y solo entonces** se escribió el override de autor. La diferencia que importa: la variante ya tenía **2 pases `correcta` de 2 MODELOS distintos y 2 VENDORS distintos ANTES del override**, así que **el override NO fabrica quórum** —cumple la barra estricta de la `WINDOWS` id 39 y no la débil de la id 35— y el `incorrecta` de `gemini-3.5-flash-lite` **se queda vivo en `passes[]`**. El español no se tocó. Es la única variante del corpus juzgada por un tercer modelo, declarado como desviación de homogeneidad en el ledger; **D-48-01 no cambia** para 48-03 ni 48-04.

  **(b) `passato-remoto#5` — el concern NUEVO, y la razón de que pagar mereciera la pena.** `deepseek-reasoner` marcó `[S6-naturalidad] calco de 'tanti anni fa' como 'hace tantos años'; en español la expresión idiomática es 'hace muchos años'`. **Es un concern nuevo, que la enmienda del pronombre no cubría ni podía cubrir, que vivía en el resto del cuerpo y no en la parte que motivó la enmienda, y que AMBOS jueces habían aprobado en la primera vuelta: solo salió al re-muestrear.** Es el **análogo exacto de `a merenda`** en la tercera nota, hasta en la forma de aparecer. El concern es correcto —`tanti` en ese marco es «muchos», y «hace tantos años» en declarativa neutra es calco—, así que por decisión del autor se reescribió el español a **«Hace muchos años hicieron los deberes.»** y se re-validó desde cero: 2 llamadas, 2 `correcta`. Se evaluó y aceptó que el adjunto temporal coincida con `#2` («Hace muchos años hizo una foto.»): no son byte-idénticas, el eje de variante del slot es la persona, y no colisionan en la forma verbal.

  **Lo que esto demuestra, y lo que NO.** Demuestra la **direccionalidad absolutoria** de la aclaración del pronombre por la vía cara: **ninguna `correcta` previa se volteó por efecto de la enmienda**, y las 2 escaladas lo fueron por motivos **ajenos a ella** —una por inestabilidad del evaluador sobre una casilla, otra por un calco que la enmienda no tocaba—. **No** demuestra que el argumento de la condición 2 sobrara: lo confirma, y confirmarlo gastando llamadas es precisamente lo que la regla enmendada manda cuando la condición 1 falla. Y destapó lo que un argumento no puede destapar, que es la segunda vez consecutiva que el cumplimiento literal se paga y la segunda que encuentra algo real.

  **Estado final, contado del disco con `deriveStatus` sobre `passes[]` y no leyendo el campo `status`:** `fare-indicativo` **54/54 `validated`**, 0 `disputed`, 0 `pending`, escrito == derivado en las 54. Corpus **260/260**, `TRAD-COV` en **PASS**. Overrides de traducción en todo el corpus: **7 antes, 8 ahora** — el de esta nota es el **primer override nuevo de la Phase 48**.

  **LO QUE FORZARÍA RE-VALIDAR EN EL FUTURO:** una enmienda posterior que introduzca un imperativo de la forma «marca como incorrecta si…» o «exige que…» sobre el pronombre sujeto explícito, que es el veto que la primera nota dejó escrito y que esta aclaración respeta.

  — *Autor, 2026-08-15. Phase 48, seguimiento del plan 48-02.*

  ---

  **SÉPTIMA NOTA (2026-08-15 — Phase 48, plan 48-03). CUARTA ENMIENDA del doc de criterios: la aclaración de S2 sobre el MODO obligado del congiuntivo italiano. Decidida por el AUTOR tras un bloqueo escalado por el executor. Tenía sujeto, se midió, y se ejecutó CUMPLIMIENTO LITERAL sobre él.**

  *Nota de numeración: el autor la encargó como «quinta nota». Es la SÉPTIMA — el seguimiento del plan 48-02 añadió la quinta y la sexta el día anterior. Se corrige aquí en vez de escribir un ordinal que chocaría con dos notas ya existentes.*

  **Qué se amendó:** *«Aclaración de S2: el MODO obligado del congiuntivo italiano no tiene que reaparecer en el español»*, quinta hermana de `da` + PERSONA, PARTITIVO, ADVERBIAL DE COMIDA y PRONOMBRE SUJETO. Declara **falso positivo** el concern «traduce el subjuntivo italiano X por el indicativo español Y» / «altera la modalidad concesiva del original» y **nada más**, cuando el conector o el verbo matriz italiano rige congiuntivo **obligatoriamente** —de modo que el modo italiano no porta información, porque aparece igual con hecho real que con hipotético— y el español o bien no lo admite (`*Pienso que haga` es agramatical) o bien lo admite **cambiando el sentido** (`aunque hacemos` = hecho real frente a `aunque hagamos` = hipotético, matiz que `benché` no tiene). Espejar el modo italiano ahí **inyectaría** contenido ausente del original: es un defecto S2, no una mejora. La regla se apoya en la frase que **S2 ya contenía** —«las diferencias obligadas por la lengua son correctas y no se penalizan»—, así que no rebaja S2.

  **Por qué era hueco del doc y no un falso positivo suelto, con la evidencia CONTADA DEL DISCO.** De las **5 concesivas estructuralmente idénticas** de `fare-congiuntivo`, `gemini-3.5-flash-lite` marcó **2** y aprobó **3**:

  | Variante | Español | Veredicto de `gemini-3.5-flash-lite` |
  |---|---|---|
  | `presente#3` | «**Aunque hacemos** todo…» | `correcta` |
  | `imperfetto#3` | «**A pesar de que hacíamos** un pastel…» | `correcta` |
  | `trapassato#5` | «**A pesar de que habían cometido** un error…» | `correcta` |
  | `passato#5` | «**Aunque han hecho** el trabajo…» | **`incorrecta`** |
  | `disparador#1` | «**Aunque haces** los deberes ahora…» | **`incorrecta`** |

  **Marcar un patrón y aprobar idénticos es la firma canónica de este proyecto para un hueco de criterios** (`WINDOWS` id 37), la misma que ya obligó a escribir la excepción del gloss, la del PARTITIVO y la del ADVERBIAL DE COMIDA. Refuerzo independiente: **las 6 divergencias DURAS —donde el español NO tiene elección— pasaron 12/12 sin una sola objeción.** Los jueces solo objetaron, e inconsistentemente, donde el español sí tiene elección. Eso separa el hueco de criterios de un defecto del texto mejor que cualquier argumento.

  **Prueba de dos condiciones del carve-out de 47-01, aplicada a ESTA enmienda:**

  1. **Ausencia de sujeto: FALLA.** El sujeto se midió **ancho primero y refinado después**, sobre las **290** traducciones del corpus. La medida ancha (disparador **o** morfología de congiuntivo) dio **36**, con **6 fuera** de `fare-congiuntivo`; las 6 se inspeccionaron una a una y son **falsos positivos por homografía** —`facciamo`, `faceste`, `abbiamo fatto`, `aveste fatto` en oración principal, sin ningún disparador subordinante, es decir indicativo puro—. Refinado por DISPARADOR, que es lo que hace el modo obligado y por tanto no informativo: **N = 30, las 30 de `fare-congiuntivo`, cero fuera.** Los cuatro cuerpos cerrados (`preposiciones` 96, `articoli` 62, `partitivos` 48, `fare-indicativo` 54 = **260**) tienen **cero** congiuntivo y no entran. El sujeto es íntegramente trabajo **en vuelo del propio plan que amienda**.
  2. **Direccionalidad absolutoria: SE MANTIENE, verificada por GREP y no declarada.** Sobre las 49 líneas de la sección nueva: **cero** coincidencias de los patrones de endurecimiento que el veto de 47-01 nombra (`marca como incorrecta`, `marca sX false`, `exige que`, `debes`, `tienes que marcar/exigir`), frente a **6** marcas absolutorias. Los dos puntos de vigilancia —que el TIEMPO y la PERSONA sigan siendo los del original, y que el valor concesivo/condicional no desaparezca— **reiteran S2 sin añadir exigencia**: los dos ya eran S2 `false` antes. Y la regla **absuelve** el indicativo sin exigirlo, así que tampoco puede voltear a quien escriba subjuntivo cuando el original sí es hipotético.

  Falla una ⇒ **cumplimiento literal**, y se ejecutó: **las 30 re-validadas desde cero**, `passes[]` reseteado a vacío, no solo las 2 `disputed`. **60 llamadas, 60 `correcta`**, `by` escrito idéntico al pinneado en las 60 (**cero auto-fallbacks**). Cero pases pre-enmienda supervivientes.

  **`disparador#1` cierra SIN TOCAR UN CARÁCTER del español y SIN override** —«Aunque haces los deberes ahora, el profesor no está contento.» byte a byte idéntica antes y después—, que es el mismo movimiento de `301#1` (sexta nota) y de `delle-invariable#0` (cuarta). **Overrides nuevos: 0.** El corpus sigue en **8**, los mismos que en `HEAD`.

  **Y el cumplimiento literal destapó, otra vez, lo que un argumento no destapa** — aunque esta vez el hallazgo llegó ANTES, por el camino: `passato#5` traía un concern **compuesto**, cuya segunda mitad («combina incorrectamente un pretérito perfecto con *el mes pasado*») era **correcta y ajena al modo**. Al investigarla apareció **`passato#2`, con el defecto IDÉNTICO y aprobada por los DOS jueces** — un falso negativo del quórum. Las dos se arreglaron (perfecto compuesto → simple: «hizo», «hicieron») por decisión del autor. Detalle que conviene no perder: **la sugerencia del propio juez («Aunque *hayan hecho* … el mes pasado») no arregla su propia segunda objeción.**

  **LO QUE FORZARÍA RE-VALIDAR EN EL FUTURO:** una enmienda posterior que introduzca un imperativo de la forma «marca como incorrecta si…» o «exige que…» sobre el modo del congiuntivo, que es el veto que la primera nota dejó escrito y que esta aclaración respeta.

  — *Autor, 2026-08-15. Phase 48, plan 48-03.*

  ---

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
