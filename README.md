# Italian Course — Ejercicios A1/A2

Web personal de ejercicios de italiano para preparar el A1 (y luego A2). Pura repetición y re-verificación constante por categoría, sin servidor, sin cuenta, todo local en el navegador del autor.

## Primer arranque

Solo dos pasos (uno por sesión):

```bash
# Desde la raíz del proyecto
cd italian-course
npx serve .
```

El servidor levanta en `http://localhost:3000`. **Abre esa URL y haz un bookmark** — a partir de aquí, abres el bookmark y listo.

Si todo va bien verás `App cargada. La sesión arrancará en Plan 02.` debajo del título. (La UI interactiva entra en Plan 02; Plan 01 es el esqueleto.)

## Requisitos

- **Node 22 LTS o superior.** Verifica con `node --version` (debería empezar por `v22.` o mayor).
- Conexión a internet la primera vez (para que `npx` descargue `serve` y el navegador cachee Alpine.js + Pico CSS desde CDN). Después funciona offline.
- Navegador moderno (Chrome, Firefox, Edge).

**Sin `npm install`.** No hay `package.json` en el proyecto — todo es CDN + Node built-in.

## Tests del dominio

```bash
node --test tests/*.test.js
```

Debe terminar con `pass 14` (o más) y exit code 0. Los tests cubren funciones puras (fechas, sampler de sesión, contadores, validador, exercise-types). Los módulos que tocan `localStorage` y `fetch` (`storage.js`, `content-loader.js`) se verifican manualmente vía `npx serve`.

> Los tests usan el reloj LOCAL del runner. En un huso muy exótico el test de medianoche local podría fallar; documentado en `tests/domain.test.js`.

## Estructura

```
italian-course/
├── index.html                       # Bootstrap HTML + CDN tags (SRI)
├── styles.css                       # Mínimo (Pico classless cubre lo demás)
├── src/
│   ├── main.js                      # Orquestador del bootstrap (Plan 02 lo extiende)
│   ├── domain/                      # Funciones puras (testeables sin DOM)
│   │   ├── dates.js
│   │   ├── session.js
│   │   └── progress.js
│   ├── data/
│   │   ├── schema-validator.js      # Pure
│   │   ├── content-loader.js        # fetch + NFC + validate
│   │   └── storage.js               # localStorage wrapper
│   └── exercise-types/
│       ├── index.js                 # Registry
│       └── multiple-choice.js
├── content/
│   ├── categories.json              # Registro maestro de categorías
│   └── exercises/
│       └── avere.json               # 12 ejercicios seed
├── tests/
│   ├── domain.test.js               # node --test
│   └── util/seeded-rng.js
└── material-profesora/              # PDFs de la profesora (fuente; no se lee en runtime)
```

## Editar contenido

Los ejercicios viven en `content/exercises/<categoria>.json`. Edítalos a mano con tu editor favorito.

**Si un JSON tiene un typo** (id duplicado, opción vacía, `correctIndex` fuera de rango, falta el hueco `___` en el `prompt`…), al recargar la página verás un **banner rojo** con la lista completa de problemas (archivo + id de ejercicio + descripción). Si hay errores, la app NO arranca: corrige y recarga.

El validador es estricto a propósito — la idea es que un typo invisible nunca llegue a engañarte durante una sesión.

## Por qué `npx serve` y no doble click

Doble click sobre `index.html` no funciona, y no es por capricho:

- **Firefox bloquea `localStorage`** bajo el origin `file://` (devuelve SecurityError). Perderías el progreso entre recargas.
- **Los módulos ES (`<script type="module">`) no cargan** bajo `file://` en ningún navegador moderno.
- **`fetch('content/...')` está bloqueado** universalmente bajo `file://`.

`npx serve` resuelve los tres problemas sirviendo todo bajo `http://localhost:3000`. Un comando, un bookmark, listo.

## Estado del proyecto

Fase actual: **Phase 1 — Loop mínimo end-to-end (Avere + multiple-choice)**.

Phase 1 entrega el esqueleto + 12 ejercicios seed de Avere derivados del PDF `material-profesora/Clase_Italiano_Auxiliar_Avere.pdf`. La UI interactiva (sesión, feedback verde/rojo, indicador X/N) la conecta Plan 02 sobre este esqueleto.

## Validación editorial (milestone v1.1)

El milestone v1.1 garantiza que cada uno de los 271 ejercicios curados en v1.0 está validado individualmente contra los criterios R1-R7 (frase italiana natural, una única opción válida, distractoras plausibles, explanation coherente sin meta-staging y cero leak de la regla en el prompt) mediante un quórum multi-modelo (≥2 AIs distintos). El outcome esperado es que los 271 ejercicios queden con `validation.status === "validated"` en sus archivos JSON. La validación importa porque cierra el bug class de batched-curation que motivó el milestone tras descubrir 4 ambigüedades semánticas reales en uso (preposiciones-040, -032, -047, -031).

### Smoke test estricto al cierre del milestone

Durante Phase 9 y Phase 10 el smoke test paramétrico VAL-07 vive tras un feature flag `VAL_07_STRICT=1` para no bloquear el desarrollo mientras los 269 ejercicios pendientes aún no están validados. Una vez el reporter `scripts/run-validation-271.mjs` sale exit 0 (271/271 validated, cero disputed), el autor activa MANUALMENTE el smoke test estricto:

```bash
# Linux/macOS — gate del milestone v1.1
VAL_07_STRICT=1 node --test tests/*.test.js
```

Una vez activo, cualquier ejercicio nuevo o modificado sin `validation.status === "validated"` rompe el test inmediatamente → previene regresión editorial.

El flip es MANUAL por diseño — no hay auto-flip al cerrar la 7ª categoría para que el gesto del autor sea consciente y deliberado (per RESEARCH Q6 + D-VAL-17). Si quieres persistirlo permanentemente, añade `export VAL_07_STRICT=1` a tu shell rc.

### Workflow editorial — comandos

Los comandos del autor para Phase 10 son:

- `/gsd-validate-exercise <id>` — valida 1 ejercicio (Phase 9 skill).
- `/gsd-validate-batch <category> | --all-pending | <id1,id2,...>` — valida en bucle (Phase 10 sub-skill).
- `node scripts/run-validation-271.mjs` — reporter del milestone gate (Phase 10 reporter).

El sub-skill batch ofrece cola disputed VAL-08 con 4 caminos terminales (Accept fix / Reject + override / Rewrite manualmente / Skip defer) y un checkpoint AskUserQuestion por cada categoría procesada.
