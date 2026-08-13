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

const git = (...args) =>
  execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

/**
 * Lee un fichero tal y como está en HEAD. Es la SEGUNDA fuente, distinta del
 * working tree, que convierte los recuentos de V3 y V4 en una comparación entre
 * dos magnitudes reales — en lugar de un `=== 0` desnudo o de una cifra a mano.
 */
const readHead = (rel) => git('show', `HEAD:${rel}`);

/**
 * Devuelve el sha del commit MÁS RECIENTE que tocó `rel` y que NO pertenece a la
 * fase 46 (su asunto no lleva el scope `(46-NN)`).
 *
 * Por qué existe: comparar el working tree contra HEAD deja de morder en cuanto
 * la fase committea, porque HEAD pasa a contener el cambio que el gate vigila.
 * Anclar la referencia al último estado PRE-fase convierte «cero tokens nuevos»
 * y «cero HTML crudo nuevo» en invariantes de toda la fase, no solo del último
 * commit. Devuelve `null` si no hay ninguno (el llamador lo trata como
 * no-vacuidad, nunca como verde).
 */
function refPreFase46(rel) {
  const lineas = git('log', '--format=%H%x1f%s', '--', rel).split('\n').filter(Boolean);
  for (const linea of lineas) {
    const [sha, asunto] = linea.split('\x1f');
    if (!/\(46-\d+\)/.test(asunto || '')) return sha;
  }
  return null;
}

/** Lee `rel` en su último estado PRE-fase-46. */
function readPreFase46(rel) {
  const sha = refPreFase46(rel);
  assert.ok(sha, `no-vacuidad: no se encuentra ningún commit pre-fase-46 que tocara ${rel}`);
  return git('show', `${sha}:${rel}`);
}

/** ¿Tocó algún commit de la fase 46 esta ruta? (gate NO vacuo: mira la historia,
 *  no un `git diff` sobre un árbol limpio, que pasaría siempre). */
function tocadaPorFase46(rel) {
  const asuntos = git('log', '--format=%s', '--', rel).split('\n').filter(Boolean);
  assert.ok(asuntos.length > 0, `no-vacuidad: git no devuelve historia para ${rel}`);
  return asuntos.filter((s) => /\(46-\d+\)/.test(s));
}

/**
 * Acota el rango [inicio, fin) de un `<template …>` a partir del índice de su
 * apertura, contando anidamientos. Un `indexOf('</template>')` desnudo cerraría
 * en el primer template hijo y el gate de región mediría el trozo equivocado.
 */
function rangoTemplate(src, idxApertura) {
  const ABRE = /<template\b/g;
  const CIERRA = /<\/template>/g;
  let profundidad = 0;
  let cursor = idxApertura;
  while (cursor < src.length) {
    ABRE.lastIndex = cursor;
    CIERRA.lastIndex = cursor;
    const abre = ABRE.exec(src);
    const cierra = CIERRA.exec(src);
    if (!cierra) return null; // template sin cerrar → el llamador lo trata como no-vacuidad
    if (abre && abre.index < cierra.index) {
      profundidad += 1;
      cursor = abre.index + 1;
      continue;
    }
    profundidad -= 1;
    if (profundidad === 0) return [idxApertura, cierra.index + '</template>'.length];
    cursor = cierra.index + 1;
  }
  return null;
}

/** Extrae las etiquetas `<p …>` de `src` cuyo texto contiene `aguja`. */
const nodosPCon = (src, aguja) =>
  (src.match(/<p\b[^>]*>/g) || []).filter((tag) => tag.includes(aguja));

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

// ─────────────────────────────────────────────────────────────────────────────
// V3 · cero tokens --ed-* nuevos (recuento derivado de DOS fuentes)
// ─────────────────────────────────────────────────────────────────────────────

describe('V3 — app.css no gana ningún token nuevo (UI-SPEC §Color)', () => {
  /** Definiciones de token (`--ed-x: valor;`) declaradas en el `:root`. */
  function tokensDeRoot(src) {
    const limpio = cssSinComentarios(src);
    const iRoot = limpio.indexOf(':root');
    if (iRoot === -1) return null;
    const bloque = limpio.slice(limpio.indexOf('{', iRoot) + 1, limpio.indexOf('}', iRoot));
    return [...bloque.matchAll(/(--ed-[a-z0-9-]+)\s*:/g)].map((m) => m[1]);
  }

  const enDisco = tokensDeRoot(cssSrc);
  const enPreFase = tokensDeRoot(readPreFase46('app.css'));

  test('no-vacuidad: el extractor ve tokens en las DOS fuentes', () => {
    assert.ok(Array.isArray(enDisco) && enDisco.length > 0, 'el extractor no ve tokens en el app.css de disco');
    assert.ok(Array.isArray(enPreFase) && enPreFase.length > 0, 'el extractor no ve tokens en el app.css pre-fase');
  });

  test('el recuento de tokens del :root es idéntico al de antes de la fase', () => {
    assert.equal(
      enDisco.length,
      enPreFase.length,
      `app.css pasó de ${enPreFase.length} a ${enDisco.length} tokens --ed-*: esta fase declara CERO tokens nuevos`
    );
  });

  test('y el conjunto de nombres es exactamente el mismo (ni añadidos ni renombrados)', () => {
    assert.deepEqual([...enDisco].sort(), [...enPreFase].sort());
  });

  test('las reglas nuevas no usan hex literales: consumen tokens', () => {
    const selectorRe = /\.session-translation,\s*\n\.summary-error-translation\s*\{/;
    const limpio = cssSinComentarios(cssSrc);
    const inicio = limpio.search(selectorRe);
    assert.ok(inicio !== -1, 'no-vacuidad: selector no localizado');
    const bloque = limpio.slice(inicio, limpio.indexOf('}', inicio) + 1);
    assert.equal(countOf(bloque, /#[0-9a-fA-F]{3,8}\b/g), 0, 'la regla nueva declara un hex literal');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// V5 · no-leak: nadie pinta la traducción sin guard de estado resuelto (D-46-11)
// ─────────────────────────────────────────────────────────────────────────────

describe('V5 — no-leak: ningún template pinta translationES sin guard (R1 / D-46-11)', () => {
  // La cifra de referencia se DERIVA del disco: tantos nodos como clases de
  // traducción declaradas en el markup.
  const clasesDeclaradas = countOf(htmlSrc, /class="(?:session-translation|summary-error-translation)"/g);
  const nodosConCampo = nodosPCon(htmlSrc, 'translationES');
  const ocurrencias = [...htmlSrc.matchAll(/translationES/g)].map((m) => m.index);

  test('CLÁUSULA DE NO-VACUIDAD (va primero): el escáner ve tantos nodos como clases declaradas', () => {
    // Un escáner que deja de casar devuelve lista vacía, y sobre la lista vacía
    // el "ninguno sin guard" de abajo pasaría en VERDE sin haber mirado nada.
    assert.ok(clasesDeclaradas > 0, 'index.html no declara ninguna clase de traducción');
    assert.equal(
      nodosConCampo.length,
      clasesDeclaradas,
      `el escáner ve ${nodosConCampo.length} nodos con translationES y el markup declara ` +
        `${clasesDeclaradas} clases de traducción: o se añadió un nodo sin clase, o el escáner dejó de casar`
    );
    assert.ok(ocurrencias.length >= nodosConCampo.length, 'menos ocurrencias que nodos: imposible');
  });

  test('cada ocurrencia de translationES vive DENTRO de uno de esos nodos', () => {
    // Cierra la puerta de atrás: una ocurrencia suelta fuera de un <p> con clase
    // (en un x-text de otro elemento, por ejemplo) escaparía al chequeo de guard.
    const rangos = [];
    let desde = 0;
    for (const tag of nodosConCampo) {
      const idx = htmlSrc.indexOf(tag, desde);
      assert.notEqual(idx, -1, 'no-vacuidad: nodo localizado por regex pero no por índice');
      rangos.push([idx, idx + tag.length]);
      desde = idx + tag.length;
    }
    const fuera = ocurrencias.filter((i) => !rangos.some(([a, b]) => i >= a && i < b));
    assert.deepEqual(
      fuera,
      [],
      `hay ${fuera.length} ocurrencia(s) de translationES fuera de los nodos de traducción declarados`
    );
  });

  test('todos los nodos llevan guard de estado resuelto (explícito o estructural)', () => {
    for (const tag of nodosConCampo) {
      const guardExplicito = tag.includes('sessionFeedback !== null');           // superficie 1
      const guardEstructural = tag.includes('summaryVariantSurface(result)');    // superficie 2 (x-for de fallos)
      assert.ok(
        guardExplicito || guardEstructural,
        `un nodo pinta translationES sin guard de estado resuelto: ${tag}`
      );
    }
  });

  test('el guard de la superficie 1 exige TAMBIÉN la presencia del dato (doble guard, D-46-09)', () => {
    const nodo = nodosConCampo.find((t) => t.includes('sessionFeedback !== null'));
    assert.ok(nodo, 'no-vacuidad: no se localiza el nodo de la superficie 1');
    assert.match(
      nodo,
      /x-show="sessionFeedback !== null && sessionCurrentExercise\.payload\.translationES\?\.text"/,
      'el x-show de la superficie 1 no es el doble guard del UI-SPEC'
    );
  });

  test('el guard de la superficie 2 usa optional chaining defensivo espejo de la explanation', () => {
    const nodo = nodosConCampo.find((t) => t.includes('summaryVariantSurface(result)'));
    assert.ok(nodo, 'no-vacuidad: no se localiza el nodo de la superficie 2');
    assert.match(nodo, /x-show="summaryVariantSurface\(result\)\?\.payload\?\.translationES\?\.text"/);
    assert.match(nodo, /x-text="summaryVariantSurface\(result\)\?\.payload\?\.translationES\?\.text"/);
  });

  test('el nodo de la superficie 2 vive dentro de la sección de errores del resumen', () => {
    const iSeccion = htmlSrc.indexOf('<section class="summary-errors">');
    assert.notEqual(iSeccion, -1, 'no-vacuidad: no se localiza la sección de errores');
    const iCierre = htmlSrc.indexOf('</section>', iSeccion);
    assert.notEqual(iCierre, -1, 'no-vacuidad: la sección de errores no cierra');
    const iNodo = htmlSrc.indexOf('summary-error-translation');
    assert.ok(iNodo > iSeccion && iNodo < iCierre, 'el nodo del resumen está fuera de la sección de errores');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// V7 · translationES no aparece en los sub-templates word-buttons ni match
// ─────────────────────────────────────────────────────────────────────────────

describe('V7 — el campo no asoma en los sub-templates de word-buttons ni match (SCH-02)', () => {
  const APERTURAS = [
    `<template x-if="sessionCurrentExercise.type === 'word-buttons'">`,
    `<template x-if="sessionCurrentExercise.type === 'match'">`,
    `<template x-if="summaryVariantSurface(result).type === 'word-buttons'">`,
    `<template x-if="summaryVariantSurface(result).type === 'match' && result.userAnswer">`
  ];

  const regiones = APERTURAS.map((apertura) => {
    const idx = htmlSrc.indexOf(apertura);
    const rango = idx === -1 ? null : rangoTemplate(htmlSrc, idx);
    return { apertura, idx, rango };
  });

  test('CLÁUSULA DE NO-VACUIDAD: las CUATRO regiones se localizaron y se acotaron', () => {
    const noLocalizadas = regiones.filter((r) => r.idx === -1).map((r) => r.apertura);
    assert.deepEqual(noLocalizadas, [], 'sub-templates no localizados (¿cambió el markup?)');
    const noAcotadas = regiones.filter((r) => r.rango === null).map((r) => r.apertura);
    assert.deepEqual(noAcotadas, [], 'sub-templates sin `</template>` de cierre emparejado');
    // Sin longitud, un "cero ocurrencias dentro" mediría la cadena vacía.
    for (const { apertura, rango } of regiones) {
      assert.ok(rango[1] - rango[0] > apertura.length, `región vacía para ${apertura}`);
    }
  });

  test('cero ocurrencias de translationES dentro de las cuatro regiones', () => {
    for (const { apertura, rango } of regiones) {
      const region = htmlSrc.slice(rango[0], rango[1]);
      assert.equal(
        countOf(region, /translationES/g),
        0,
        `translationES asoma dentro de ${apertura}, pero SCH-02 lo rechaza en ese tipo`
      );
    }
  });

  test('las regiones de match/word-buttons SÍ contienen su explanation (control positivo)', () => {
    // Control de que las regiones acotadas son las de verdad y no trozos vacíos:
    // los cuatro sub-templates sí pintan `explanation`.
    for (const { apertura, rango } of regiones) {
      const region = htmlSrc.slice(rango[0], rango[1]);
      assert.ok(
        countOf(region, /explanation/g) > 0,
        `la región de ${apertura} no contiene ni una explanation: seguramente está mal acotada`
      );
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// V8 · motor BYTE-INTACTO (D-46-01)
// ─────────────────────────────────────────────────────────────────────────────

describe('V8 — el motor queda byte-intacto (D-46-01 / D-46-11)', () => {
  const RUTAS_MOTOR = ['src/domain', 'src/screens/app.js'];

  test('ningún commit de la fase 46 tocó src/domain/ ni src/screens/app.js', () => {
    for (const rel of RUTAS_MOTOR) {
      const deLaFase = tocadaPorFase46(rel);
      assert.deepEqual(
        deLaFase,
        [],
        `${rel} fue modificado por la fase 46: ${deLaFase.join(' | ')}. El render de esta fase es HTML + CSS puro`
      );
    }
  });

  test('tampoco hay cambios sin committear en las rutas del motor', () => {
    const sucio = git('diff', '--stat', 'HEAD', '--', ...RUTAS_MOTOR).trim();
    assert.equal(sucio, '', `hay cambios sin committear en el motor:\n${sucio}`);
  });

  test('SESSION_AUTO_ADVANCE_MS conserva el valor que tenía antes de la fase (derivado)', () => {
    const leerConstante = (src) => {
      const m = src.match(/SESSION_AUTO_ADVANCE_MS\s*=\s*(\d+)/);
      return m ? Number(m[1]) : null;
    };
    const enDisco = leerConstante(readRepo('src/screens/app.js'));
    const enPreFase = leerConstante(readPreFase46('src/screens/app.js'));
    const enHead = leerConstante(readHead('src/screens/app.js'));

    // No-vacuidad en las TRES fuentes: un extractor que deja de casar devuelve
    // null en las tres y `null === null` pasaría en verde.
    assert.notEqual(enDisco, null, 'el extractor no ve la constante en el disco');
    assert.notEqual(enPreFase, null, 'el extractor no ve la constante pre-fase');
    assert.notEqual(enHead, null, 'el extractor no ve la constante en HEAD');

    assert.equal(enDisco, enPreFase, 'la fase cambió SESSION_AUTO_ADVANCE_MS');
    assert.equal(enDisco, enHead);
  });

  test('la fase no añade ningún temporizador (REND-03: el toggle es síncrono)', () => {
    for (const rel of ['index.html', 'src/screens/app.js']) {
      assert.equal(
        countOf(readRepo(rel), /setTimeout|setInterval/g),
        countOf(readPreFase46(rel), /setTimeout|setInterval/g),
        `${rel} cambió su recuento de temporizadores: esta fase no introduce estado async`
      );
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// V9 · el resto de la pantalla, sin cambios (D-46-01 / D-46-10, REND-03)
// ─────────────────────────────────────────────────────────────────────────────

describe('V9 — prompt, "¿Por qué?" y CTA siguen intactos (D-46-01 / D-46-10)', () => {
  test('las tres clases y sus literales de copy siguen presentes', () => {
    for (const clase of ['session-prompt', 'session-why', 'session-cta']) {
      assert.ok(htmlSrc.includes(`class="${clase}"`), `falta class="${clase}"`);
    }
    for (const literal of ['Continuar →', '¿Por qué?', '¡Esatto!', 'Quasi…']) {
      assert.ok(htmlSrc.includes(literal), `falta el literal de copy "${literal}"`);
    }
  });

  test('el recuento de esos literales es el mismo que antes de la fase (ni uno nuevo)', () => {
    const pre = readPreFase46('index.html');
    for (const literal of ['Continuar →', '¿Por qué?', '¡Esatto!', 'Quasi…']) {
      const re = new RegExp(literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      assert.equal(
        countOf(htmlSrc, re),
        countOf(pre, re),
        `el recuento del literal "${literal}" cambió: esta fase no añade ni cambia copy de interfaz`
      );
    }
  });

  test('el guard de la traducción NO referencia el flag de explanation-revelada', () => {
    // El botón "¿Por qué?" y la tecla `e` togglan `sessionExplanationRevealed`.
    // Si el x-show de la traducción lo mirase, pulsar el botón repetidamente
    // podría ocultarla o duplicarla (REND-03).
    const nodos = nodosPCon(htmlSrc, 'translationES');
    assert.ok(nodos.length > 0, 'no-vacuidad: sin nodos localizados no hay guard que inspeccionar');
    for (const nodo of nodos) {
      assert.ok(
        !nodo.includes('sessionExplanationRevealed'),
        `el nodo de traducción referencia sessionExplanationRevealed: ${nodo}`
      );
    }
    // Control positivo: el nodo de la explanation SÍ lo referencia, así que el
    // flag existe y la aserción de arriba no es verde por ausencia del símbolo.
    const nodoExplanation = nodosPCon(htmlSrc, 'class="session-explanation"');
    assert.ok(nodoExplanation.length > 0, 'no-vacuidad: no se localiza el nodo de la explanation');
    assert.ok(
      nodoExplanation.some((t) => t.includes('sessionExplanationRevealed')),
      'la explanation dejó de mirar sessionExplanationRevealed: el control positivo ya no controla nada'
    );
  });

  test('la traducción no añade affordance propio: cero botones nuevos en index.html', () => {
    assert.equal(
      countOf(htmlSrc, /<button\b/g),
      countOf(readPreFase46('index.html'), /<button\b/g),
      'el recuento de botones cambió: la traducción aparece SIEMPRE al resolver, sin affordance (D-46-10)'
    );
  });
});
