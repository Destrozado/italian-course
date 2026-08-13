// tests/screen-translation.test.js
//
// Phase 46 plan 01 — el contrato de RENDER de la traducción española (REND-01..05)
// más el camino end-to-end de la frase canónica de la fase:
//
//     content/exercises/preposiciones.json  →  schema-validator  →  las DOS
//     superficies de render (caja de feedback + card de "Errores cometidos").
//
// Congela las nueve aserciones V1-V9 de `46-UI-SPEC.md §Verification Hooks`.
// Este fichero aporta V1, V2, V4 y V6 (Task 1) y V3, V5, V7, V8, V9 (Task 2).
//
// Estrategia (molde de tests/screen-session-editorial.test.js:19-28): los
// ficheros de presentación se leen como TEXTO y se assertea sobre su fuente.
// El render de esta fase es HTML + CSS puro (D-46-01: el motor queda
// BYTE-INTACTO), así que la fuente ES el artefacto a verificar — no hay JS
// nuevo que instanciar.
//
// REGLA DE LA CASA que gobierna este fichero (D-31-06 / CR-01 de la Phase 44):
// toda cifra que un gate congela se DERIVA del disco, jamás se transcribe. Un
// literal `1` / `9` / `600` escrito aquí certificaría en verde un número
// obsoleto el día que el disco cambie. Y todo extractor por regex lleva su
// CLÁUSULA DE NO-VACUIDAD, y va PRIMERO: un escáner que deja de casar devuelve
// lista vacía, y sobre la lista vacía cualquier "no hay ninguno" pasa en VERDE
// sin haber mirado nada.
//
// Se ejecuta con:  node --test tests/*.test.js tests/fixtures/*.test.js   (Node 22 LTS o superior)

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { validateContent } from '../src/data/schema-validator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const readRepo = (rel) => readFileSync(resolve(projectRoot, rel), 'utf8');
const readJson = (rel) => JSON.parse(readRepo(rel));

const cssSrc = readRepo('app.css');
const htmlSrc = readRepo('index.html');

/**
 * Lee un fichero tal y como está en HEAD. Es la SEGUNDA fuente, distinta del
 * working tree, que convierte los recuentos de V3 y V4 en una comparación entre
 * dos magnitudes reales — en lugar de un `=== 0` desnudo o de una cifra a mano.
 */
const readHead = (rel) =>
  execFileSync('git', ['show', `HEAD:${rel}`], { cwd: projectRoot, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });

/** Cuenta ocurrencias de un patrón global. Devuelve 0 si no casa (nunca null). */
const countOf = (src, re) => (src.match(re) || []).length;

// Elimina los comentarios de bloque de una hoja CSS. Va PRIMERO en cualquier
// recuento de selectores: sin este paso, una mención en prosa dentro de un
// comentario cuenta como si fuera una declaración (el mismo bug que
// `sinComentarios` resuelve en tests/count-arrays-lockstep.test.js).
const cssSinComentarios = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '');

// La frase canónica de la fase, derivada del CONTENIDO en disco — no transcrita.
const PREPOSICIONES_REL = 'content/exercises/preposiciones.json';
const preposiciones = readJson(PREPOSICIONES_REL);
const slotCanonico = preposiciones.exercises.find((e) => e.id === 'preposiciones-di-origen');
const varianteCanonica = slotCanonico?.variants?.find((v) => v?.translationES !== undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Camino end-to-end · el contenido real con el campo nuevo VALIDA
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 46 — la frase canónica atraviesa contenido → schema (end-to-end)', () => {
  test('el slot canónico existe y una de sus variantes lleva translationES', () => {
    // No-vacuidad: sin este assert, los tests de abajo mirarían `undefined` y
    // un corpus que perdiera el campo pasaría en verde.
    assert.ok(slotCanonico, `falta el slot "preposiciones-di-origen" en ${PREPOSICIONES_REL}`);
    assert.ok(
      varianteCanonica,
      `ninguna variante de "preposiciones-di-origen" declara translationES en ${PREPOSICIONES_REL}`
    );
    assert.equal(varianteCanonica.prompt, 'Paolo è ___ Napoli di nascita.');
  });

  test('la traducción canónica está en disco con sus acentos RAE (PRES-05)', () => {
    assert.equal(varianteCanonica.translationES.text, 'Paolo es de Nápoles de nacimiento.');
    // El texto de la traducción es de la frase YA RESUELTA: sin hueco (D-46-03).
    assert.ok(
      !varianteCanonica.translationES.text.includes('___'),
      'la traducción no puede arrastrar el hueco "___" del prompt'
    );
  });

  test('nace con validation propia en pending y passes vacío (D-46-02)', () => {
    assert.deepEqual(varianteCanonica.translationES.validation, { status: 'pending', passes: [] });
  });

  test('el validation a nivel de SLOT queda intacto (no se toca, D-46-02)', () => {
    assert.equal(slotCanonico.validation.status, 'validated');
    assert.ok(slotCanonico.validation.passes.length >= 2, 'el quórum del slot sigue en su sitio');
  });

  test('validateContent acepta el fichero REAL con el campo nuevo (retrocompat sobre disco)', () => {
    const result = validateContent({
      categories: readJson('content/categories.json').categories,
      exercisesByFile: { [PREPOSICIONES_REL]: preposiciones.exercises }
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
    assert.deepEqual(result.errors, []);
  });

  test('la traducción canónica aparece UNA sola vez en el fichero de contenido', () => {
    const ocurrencias = countOf(readRepo(PREPOSICIONES_REL), /Paolo es de Nápoles de nacimiento\./g);
    assert.equal(ocurrencias, 1, 'la traducción canónica está duplicada en el corpus');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// V1 · el bloque CSS compartido con sus seis declarantes exactos
// ─────────────────────────────────────────────────────────────────────────────

describe('V1 — app.css declara el bloque compartido de la traducción (UI-SPEC §CSS Contract)', () => {
  // El bloque se acota por índices para que los seis declarantes se busquen
  // DENTRO de la regla nueva y no en cualquier parte de las ~2000 líneas.
  const selectorRe = /\.session-translation,\s*\n\.summary-error-translation\s*\{/;

  test('el selector doble existe, en una sola regla y en el orden del contrato', () => {
    assert.match(cssSinComentarios(cssSrc), selectorRe, 'falta el selector doble compartido');
  });

  test('la regla declara los seis valores exactos del contrato', () => {
    const limpio = cssSinComentarios(cssSrc);
    const inicio = limpio.search(selectorRe);
    assert.ok(inicio !== -1, 'no-vacuidad: sin el selector localizado no hay bloque que inspeccionar');
    const bloque = limpio.slice(inicio, limpio.indexOf('}', inicio) + 1);

    assert.ok(bloque.includes('font-family: var(--ed-font-serif)'), 'font-family serif');
    assert.ok(bloque.includes('font-size: 16px'), 'font-size 16px');
    assert.ok(bloque.includes('font-weight: 400'), 'font-weight 400');
    assert.ok(bloque.includes('line-height: 1.5'), 'line-height 1.5');
    assert.ok(bloque.includes('color: var(--ed-ink)'), 'color ink');
    assert.ok(bloque.includes('margin: 8px 0 0'), 'margin 8px 0 0');
  });

  test('la regla no puede recortar la traducción: cero height/overflow (E1/E2 · overflow)', () => {
    const limpio = cssSinComentarios(cssSrc);
    const inicio = limpio.search(selectorRe);
    assert.ok(inicio !== -1, 'no-vacuidad: selector no localizado');
    const bloque = limpio.slice(inicio, limpio.indexOf('}', inicio) + 1);

    // Se comparan NOMBRES DE PROPIEDAD declarados, no substrings: `line-height`
    // contiene "height" y un `includes('height')` desnudo daría un rojo falso
    // sobre una declaración que el contrato EXIGE.
    const cuerpo = bloque.slice(bloque.indexOf('{') + 1, bloque.lastIndexOf('}'));
    const propiedades = [...cuerpo.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
    assert.ok(propiedades.length > 0, 'no-vacuidad: el extractor no ve ninguna declaración en el bloque');

    const PROHIBIDAS = ['height', 'max-height', 'min-height', 'overflow', 'text-overflow', 'overflow-wrap', 'max-width', 'text-wrap'];
    const infractoras = propiedades.filter((p) => PROHIBIDAS.includes(p));
    assert.deepEqual(
      infractoras,
      [],
      `la regla nueva declara propiedades prohibidas por el UI-SPEC §CSS Contract: ${infractoras.join(', ')}`
    );
    assert.ok(!bloque.includes('!important'), 'el UI-SPEC prohíbe !important en esta fase');
  });

  test('la fase no añade ningún @media (desktop-only, UI-SPEC §Design System)', () => {
    assert.equal(
      countOf(cssSrc, /@media/g),
      countOf(readHead('app.css'), /@media/g),
      'el recuento de @media de app.css cambió: esta fase no añade responsive'
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// V2 · el criterio de estilo se declara UNA sola vez (D-46-08)
// ─────────────────────────────────────────────────────────────────────────────

describe('V2 — un solo criterio de estilo para las dos superficies (D-46-08)', () => {
  test('.session-translation se declara una sola vez en app.css (recuento derivado)', () => {
    assert.equal(countOf(cssSrc, /\.session-translation\b/g), 1);
  });

  test('.summary-error-translation se declara una sola vez (sin duplicar en Resultados)', () => {
    // Sobre el CSS SIN comentarios: el comentario de referencia cruzada de la
    // sección de Resultados es prosa, no una segunda declaración. Contar sobre
    // el texto crudo confundiría una mención con un criterio duplicado.
    assert.equal(countOf(cssSinComentarios(cssSrc), /\.summary-error-translation\b/g), 1);
  });

  test('la sección de Resultados NO declara regla propia para la traducción', () => {
    // El descendiente `.summary-errors .summary-error-translation` sería una
    // subida de especificidad innecesaria (nombre nuevo, sin legacy que vencer).
    assert.equal(countOf(cssSinComentarios(cssSrc), /\.summary-errors\s+\.summary-error-translation/g), 0);
  });

  test('styles.css no gana ninguna regla para las clases nuevas', () => {
    const legacy = readRepo('styles.css');
    assert.equal(countOf(legacy, /session-translation|summary-error-translation/g), 0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// V4 · x-text exclusivo, cero inyección de HTML crudo (T-02-01)
// ─────────────────────────────────────────────────────────────────────────────

describe('V4 — la traducción fluye por x-text y nunca por HTML crudo (T-02-01)', () => {
  test('el recuento de la directiva de HTML crudo en index.html es IDÉNTICO al de HEAD', () => {
    // Dos magnitudes de DOS fuentes distintas (working tree vs HEAD), no un
    // `=== 0` desnudo: si un día el repo tuviera un x-html legítimo, este gate
    // sigue cazando el que añada ESTA fase.
    const enHead = countOf(readHead('index.html'), /x-html/g);
    const enDisco = countOf(htmlSrc, /x-html/g);
    assert.equal(
      enDisco,
      enHead,
      `index.html pasó de ${enHead} a ${enDisco} usos de inyección de HTML crudo: T-02-01 prohíbe añadir ninguno`
    );
  });

  test('los dos nodos de traducción enlazan el dato por x-text', () => {
    const nodos = htmlSrc.match(/<p[^>]*(?:session-translation|summary-error-translation)[^>]*>/g) || [];
    // No-vacuidad PRIMERO: el número de nodos se deriva del propio HTML.
    assert.equal(nodos.length, 2, `esperaba los 2 nodos de traducción, el escáner ve ${nodos.length}`);
    for (const nodo of nodos) {
      assert.ok(nodo.includes('x-text='), `un nodo de traducción no usa x-text: ${nodo}`);
      assert.ok(!nodo.includes('x-html'), `un nodo de traducción usa HTML crudo: ${nodo}`);
    }
  });

  test('la fase no introduce fetch, await, skeleton ni spinner en index.html (E1/E2 · loading)', () => {
    const head = readHead('index.html');
    for (const patron of [/\bfetch\(/g, /\bawait\b/g, /skeleton/gi, /spinner/gi]) {
      assert.equal(
        countOf(htmlSrc, patron),
        countOf(head, patron),
        `index.html cambió su recuento de ${patron}: esta fase no añade frontera de carga`
      );
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// V6 · orden DOM en las dos superficies (D-46-06 / D-46-08)
// ─────────────────────────────────────────────────────────────────────────────

describe('V6 — orden DOM: qué era → qué significa → por qué (D-46-06 / D-46-08)', () => {
  test('superficie 1: feedback-correct < translation < explanation', () => {
    const iCorrect = htmlSrc.indexOf('session-feedback-correct');
    const iTrad = htmlSrc.indexOf('session-translation');
    const iExpl = htmlSrc.indexOf('class="session-explanation"');

    // No-vacuidad: los tres anclajes tienen que existir antes de ordenarlos.
    assert.ok(iCorrect !== -1, 'falta .session-feedback-correct');
    assert.ok(iTrad !== -1, 'falta .session-translation');
    assert.ok(iExpl !== -1, 'falta .session-explanation');

    assert.ok(iCorrect < iTrad, 'la traducción debe ir DESPUÉS de "Respuesta correcta:"');
    assert.ok(iTrad < iExpl, 'la traducción debe ir ANTES de la explanation');
  });

  test('superficie 2: la traducción va antes de summary-error-explanation', () => {
    const iTrad = htmlSrc.indexOf('summary-error-translation');
    const iExpl = htmlSrc.indexOf('class="summary-error-explanation"');
    assert.ok(iTrad !== -1, 'falta .summary-error-translation');
    assert.ok(iExpl !== -1, 'falta .summary-error-explanation');
    assert.ok(iTrad < iExpl, 'en la card de error la traducción va ANTES de la explanation');
  });

  test('superficie 2: la traducción va DESPUÉS de la línea "Respuesta correcta:"', () => {
    const iTrad = htmlSrc.indexOf('summary-error-translation');
    const iCorrecta = htmlSrc.lastIndexOf('Respuesta correcta:', iTrad);
    assert.ok(iCorrecta !== -1, 'no hay línea "Respuesta correcta:" antes del nodo de traducción');
    assert.ok(iCorrecta < iTrad);
  });
});
