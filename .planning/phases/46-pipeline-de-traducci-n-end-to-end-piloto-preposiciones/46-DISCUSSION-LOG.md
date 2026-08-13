# Phase 46: Pipeline de traducción end-to-end (piloto Preposiciones) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-13
**Phase:** 46-Pipeline de traducción end-to-end (piloto Preposiciones)
**Areas discussed:** Tiempo de lectura / auto-avance · Forma del campo en el JSON · Anatomía visual de la traducción · Autoría y validación de las 96

---

## Selección de áreas

| Option | Description | Selected |
|--------|-------------|----------|
| Tiempo de lectura / auto-avance | Resolver la premisa rota de REND-02 | ✓ |
| Forma del campo en el JSON | String plano vs sub-objeto; dónde vive el `validation.passes[]` por traducción | ✓ |
| Anatomía visual de la traducción | Posición, etiqueta, distinción de la explanation, en pantalla y en el resumen | ✓ |
| Autoría y validación de las 96 | Quién escribe, qué quórum valida, dónde vive el gate | ✓ |

**User's choice:** las cuatro.
**Notes:** el área 1 nació de un hallazgo del scout, no de una duda del autor: la premisa de REND-02 contradice el código.

---

## Tiempo de lectura / auto-avance

| Option | Description | Selected |
|--------|-------------|----------|
| Motor byte-intacto | No se toca `SESSION_AUTO_ADVANCE_MS` ni nada del motor; el avance manual ya da tiempo ilimitado. GATE-03 sube de «un único cambio declarado» a «byte-intacto» | ✓ |
| Subirlo igualmente por canciones | Afectaría solo al modo canción, fuera de scope de traducción | |
| Modo contrarreloj: revisarlo | Comprobar si el cronómetro se come la lectura y si debe pararse en estado resuelto | |

**User's choice:** Motor byte-intacto.
**Notes:** la tercera opción se resolvió por verificación en vez de por pregunta — el cronómetro ya se cancela al fijar feedback y `onSessionTimeout` no auto-avanza (`app.js:1897-1908`), así que el tiempo de lectura es ilimitado también ahí.

---

## Forma del campo en el JSON

| Option | Description | Selected |
|--------|-------------|----------|
| Sub-objeto anidado | Precedente `decoyBank`: texto + su propio bloque `validation`. No toca el `validation` del slot, `deriveStatus` se aplica tal cual | ✓ |
| Dos claves hermanas en la variante | String plano + clave de validación al lado; hay que mantenerlas acopladas a mano | |
| String plano + validación en el slot | Array a nivel de slot indexado por posición de variante; reordenar variantes movería los pases | |

**User's choice:** Sub-objeto anidado.

### Nombre de la clave

| Option | Description | Selected |
|--------|-------------|----------|
| `traduccion` | Español ASCII, precedente de `origen` (PROV-01) | |
| `translation` | Inglés, consistente con las claves estructurales del schema | |
| `traduccionEs` | Explícito sobre el idioma de destino | |
| **`translationES`** | *(Other — texto libre del autor)* | ✓ |

**User's choice:** `translationES`.
**Notes:** la clave interna del string se fijó como `text` por decisión de Claude — el nombre externo ya declara el idioma, un `.es` anidado sería redundante.

### No-leak (R1)

| Option | Description | Selected |
|--------|-------------|----------|
| Guard en pantalla + test que lo congela | Mismo doble guard que `explanation` + test que asserta que ningún template pinta sin guard | ✓ |
| El motor no expone el campo hasta resolver | Imposible por construcción, pero toca `src/screens/app.js` | |
| Solo el guard en pantalla | Consistente y barato, pero deja el invariante sin gate | |

**User's choice:** Guard en pantalla + test que lo congela.
**Notes:** argumento decisivo — el payload ya lleva `correctIndex` y `options`, así que esconder la traducción del payload no compra nada real contra inspección.

### Guards estructurales en el schema

| Option | Description | Selected |
|--------|-------------|----------|
| Rechazar que contenga `___` | Caza el error mecánico de copiar el prompt con el hueco sin rellenar | ✓ |
| Rechazar traducción de una sola palabra | Ataca el riesgo de la Phase 49, pero da falsos positivos en frases mínimas | |
| Rechazar que sea idéntica al `gloss` ES | Congela la separación gloss/traducción, pero necesita un regex frágil | |
| Nada más: string no vacío y ya | Una sola autoridad sobre la calidad, pero deja pasar el `___` | |

**User's choice:** solo el rechazo de `___` (multiSelect con una única marca).

---

## Anatomía visual de la traducción

### Posición en pantalla

| Option | Description | Selected |
|--------|-------------|----------|
| En la caja de feedback, bajo «Respuesta correcta» | Orden narrativo qué era → qué significa → por qué; pegada a la palabra correcta, no a la equivocada del prompt | ✓ |
| Bajo el prompt italiano, fuera de la caja | Parece un subtítulo, pero al fallar el prompt lleva la palabra EQUIVOCADA tachada y las dos frases no se corresponden | |
| Al final de la caja, tras la explanation | Entierra la traducción bajo un párrafo largo y rompe el orden entre acierto y fallo | |

**User's choice:** En la caja de feedback, bajo «Respuesta correcta».
**Notes:** el dato que decidió la opción salió del scout — `index.html:537` rellena el hueco con `options[sessionSelectedIndex]`, la opción del usuario, no la correcta.

### Distinción respecto a la `explanation`

| Option | Description | Selected |
|--------|-------------|----------|
| Serif, sin etiqueta | La traducción es texto de la frase (hermana del prompt serif); la explanation es comentario (sans muted). Distinción semántica, y el caso vacío es trivial | ✓ |
| Etiqueta «Traducción:» en línea | Espejo de «Respuesta correcta:», inequívoco pero hay que esconder la etiqueta cuando no hay campo | |
| Comillas latinas «…» sin etiqueta | Marca que es la frase sin gastar etiqueta, pero serían literales de template | |

**User's choice:** Serif, sin etiqueta.

### «Errores cometidos» del resumen

| Option | Description | Selected |
|--------|-------------|----------|
| Mismo orden y misma lógica serif | El resumen repite la anatomía de la pantalla; un solo criterio de estilo en dos sitios | ✓ |
| Más compacta que en pantalla | Menos peso visual en listas largas, pero pierde la distinción semántica | |
| Tras la explanation, cerrando la tarjeta | Rompe la correspondencia con el orden de la pantalla | |

**User's choice:** Mismo orden y misma lógica serif.

---

## Autoría y validación de las 96

### Autoría

| Option | Description | Selected |
|--------|-------------|----------|
| Subagents Claude, 1 slot por subagent | Precedente D-85; cada subagent ve el slot entero con su explanation y sus variantes hermanas | ✓ |
| Un script LLM que las genere en lote | Más barato, pero generador y validador saldrían del mismo pozo de modelos | |
| El autor a mano | Máxima calidad de partida, pero 96 en el piloto y 722 en el milestone | |

**User's choice:** Subagents Claude, 1 slot por subagent.

### Quórum

| Option | Description | Selected |
|--------|-------------|----------|
| DeepSeek + Gemini por script | Espejo de `validate-song-pass.mjs`, 1-por-1, `--avoid` para 2 `by` distintos; DeepSeek es el estricto en acentos y corre dentro del executor | ✓ |
| Opus + Sonnet por Task en top-level | Quórum canónico de ejercicios, pero el executor no puede spawnear Task | |
| Mixto: script cross-vendor + un pase Claude | Diversidad máxima, pero mete un paso manual en cada una de las 96 | |

**User's choice:** DeepSeek + Gemini por script.

### Gates

| Option | Description | Selected |
|--------|-------------|----------|
| Reporter + meta-test de mutación | Cobertura en `run-validation-271.mjs` con `expected` derivado; anti-ceguera en `count-arrays-lockstep.test.js`, que ya es ese meta-test | ✓ |
| Todo en un test nuevo de tests/ | Más fácil de leer, pero deja el reporter sin saber nada de traducciones | |
| Todo en el reporter | Un solo sitio, pero el reporter acabaría testeándose a sí mismo | |

**User's choice:** Reporter + meta-test de mutación.

---

## Corrección de requisitos desalineados

| Option | Description | Selected |
|--------|-------------|----------|
| Corregirlos ahora | Reescribir REND-02 y el invariante en REQUIREMENTS.md / ROADMAP.md / STATE.md | ✓ |
| Solo en CONTEXT.md, corregir más tarde | Más rápido, con el riesgo de que la Phase 53 verifique GATE-03 contra un texto obsoleto | |

**User's choice:** Corregirlos ahora.
**Notes:** aplicado en esta sesión sobre `.planning/REQUIREMENTS.md` (REND-02, GATE-03), `.planning/ROADMAP.md` (SC 2 de la Phase 46, SC 3 de la Phase 53, resumen de milestone y línea de cierre) y `.planning/STATE.md` (bloque de invariantes). Cada corrección deja constancia escrita de qué decía antes y por qué cambió.

---

## Claude's Discretion

- Nombres del doc de prompt y del script de quórum (se sugiere el espejo del par de canciones).
- Clave interna del string dentro de `translationES` → `text`.
- Nombres de las clases CSS nuevas y su ubicación en `app.css`.
- Forma de la dirección compuesta slot+variante en la CLI del script de quórum.
- Troceado de la fase en plans.

## Deferred Ideas

- Subir `SESSION_AUTO_ADVANCE_MS` por el modo canción — quick task propio si alguna vez se siente corto.
- Que el motor oculte el campo del payload — re-evaluable solo si el payload deja de llevar la respuesta.
- Guard de schema «una sola palabra» — el riesgo es de la Phase 49 y allí lo cubre el quórum.
- Guard de schema «idéntica al gloss» — el criterio vive en el prompt de validación.
- Etiqueta «Traducción:» y comillas latinas envolventes.
