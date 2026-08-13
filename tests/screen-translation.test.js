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
import { deriveStatus } from '../src/data/validation-state.js'; // fuente única del status (WR-01)

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

/**
 * Acota el rango [inicio, fin) de un `<div …>` a partir del índice de su
 * apertura, contando anidamientos. Es el mismo problema que `rangoTemplate`
 * resuelve para los templates: un `indexOf('</div>')` desnudo cerraría en el
 * primer div hijo y el gate de «dentro / fuera de la caja» mediría una región
 * que no es la caja.
 */
function rangoDiv(src, idxApertura) {
  const ABRE = /<div\b/g;
  const CIERRA = /<\/div>/g;
  let profundidad = 0;
  let cursor = idxApertura;
  while (cursor < src.length) {
    ABRE.lastIndex = cursor;
    CIERRA.lastIndex = cursor;
    const abre = ABRE.exec(src);
    const cierra = CIERRA.exec(src);
    if (!cierra) return null; // div sin cerrar → el llamador lo trata como no-vacuidad
    if (abre && abre.index < cierra.index) {
      profundidad += 1;
      cursor = abre.index + 1;
      continue;
    }
    profundidad -= 1;
    if (profundidad === 0) return [idxApertura, cierra.index + '</div>'.length];
    cursor = cierra.index + 1;
  }
  return null;
}

/**
 * Parte una hoja CSS (ya SIN comentarios) en reglas planas `{ selector, cuerpo }`.
 * No entiende at-rules anidadas — las reglas de dentro de un `@media` salen como
 * si fueran de primer nivel, que es inocuo aquí porque esta fase no añade
 * ninguno (V1) y las clases que inspecciona no viven en uno. Cualquier fallo de
 * parseo degrada a lista vacía, y de eso se encargan las cláusulas de
 * no-vacuidad: nunca a un verde silencioso.
 */
const reglasCss = (limpio) =>
  [...limpio.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim(),
    cuerpo: m[2]
  }));

/** Nombres de propiedad declarados en el cuerpo de una regla. */
const propiedadesDe = (cuerpo) => [...cuerpo.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);

/**
 * Lee el shorthand `margin` de una regla y devuelve `{ top, bottom }` en px,
 * resolviendo la expansión de CSS (1 valor → los cuatro; 2 → vertical/horizontal;
 * 3 → top/horizontal/bottom). Devuelve `null` si no hay margin o si algún valor
 * no es px ni `0`, para que el llamador lo trate como no-vacuidad en vez de
 * comparar `NaN` con `NaN`.
 */
function margenDe(regla) {
  const m = /margin\s*:\s*([^;]+);/.exec(regla?.cuerpo || '');
  if (!m) return null;
  const partes = m[1].trim().split(/\s+/).map((v) => {
    if (v === '0') return 0;
    return /^\d+px$/.test(v) ? parseInt(v, 10) : NaN;
  });
  if (partes.length === 0 || partes.some(Number.isNaN)) return null;
  const [top, , tercero] = partes;
  const bottom = partes.length >= 3 ? tercero : top;
  return { top, bottom };
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

// CÓMO SE DIRECCIONA LA VARIANTE CANÓNICA, y por qué NO por «la que lleva
// traducción». La primera redacción de este fichero la localizaba con
// `find(v => v.translationES !== undefined)`, que funcionaba SÓLO mientras el
// piloto del plan 46-01 tenía UNA traducción en todo el corpus. Desde el plan
// 46-04 las 96 variantes multiple-choice de Preposiciones la llevan, así que ese
// `find` devuelve la variante 0 (`Maria viene da Pisa…`) y los tests de abajo
// medían una frase que no es la canónica. La identidad ESTABLE de una variante es
// su `prompt` italiano — el ejercicio en sí —, no el artefacto que este bloque
// está verificando. Se ancla ahí, con cláusula de no-vacuidad delante.
const PROMPT_CANONICO = 'Paolo è ___ Napoli di nascita.';
const varianteCanonica = slotCanonico?.variants?.find((v) => v?.prompt === PROMPT_CANONICO);
const IDX_CANONICO = slotCanonico?.variants?.findIndex((v) => v?.prompt === PROMPT_CANONICO) ?? -1;

// ─────────────────────────────────────────────────────────────────────────────
// Camino end-to-end · el contenido real con el campo nuevo VALIDA
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 46 — la frase canónica atraviesa contenido → schema (end-to-end)', () => {
  test('el slot canónico existe, se localiza por su PROMPT, y esa variante lleva translationES', () => {
    // No-vacuidad: sin estos asserts, los tests de abajo mirarían `undefined` y
    // un corpus que perdiera el campo pasaría en verde.
    assert.ok(slotCanonico, `falta el slot "preposiciones-di-origen" en ${PREPOSICIONES_REL}`);
    assert.ok(
      varianteCanonica,
      `ninguna variante de "preposiciones-di-origen" tiene el prompt canónico ` +
        `"${PROMPT_CANONICO}" en ${PREPOSICIONES_REL}`
    );
    // El índice se DERIVA del disco y se afirma coherente con el objeto hallado:
    // así el `find` y el `findIndex` no pueden divergir en silencio.
    assert.ok(IDX_CANONICO >= 0, 'no-vacuidad: el índice de la variante canónica no se pudo derivar');
    assert.equal(slotCanonico.variants[IDX_CANONICO], varianteCanonica);
    assert.ok(
      varianteCanonica.translationES !== undefined,
      'la variante canónica dejó de declarar translationES'
    );
  });

  test('la traducción canónica está en disco con sus acentos RAE (PRES-05)', () => {
    // Este literal NO es una cifra derivable: es el MOLDE de contenido que el plan
    // 46-01 committeó y que el 46-01-SUMMARY registra byte a byte. Congelarlo es
    // deliberado — si una resolución de `disputed` reescribiera esta frase, el rojo
    // de aquí es la señal correcta de que el molde cambió y hay que actualizarlo a
    // conciencia, no un gate caducado.
    assert.equal(varianteCanonica.translationES.text, 'Paolo es de Nápoles de nacimiento.');
    // El texto de la traducción es de la frase YA RESUELTA: sin hueco (D-46-03).
    assert.ok(
      !varianteCanonica.translationES.text.includes('___'),
      'la traducción no puede arrastrar el hueco "___" del prompt'
    );
  });

  test('lleva validation PROPIA y su status es el DERIVADO de sus passes (D-46-02 / VAL-09)', () => {
    const val = varianteCanonica.translationES.validation;
    assert.ok(val && typeof val === 'object', 'la traducción canónica no declara validation propia');
    assert.ok(Array.isArray(val.passes), 'validation.passes debe ser un array');
    // El status NO se transcribe: se DERIVA de los passes que hay en disco con la
    // fuente única (`deriveStatus`). La primera redacción congelaba
    // `{ status: 'pending', passes: [] }`, que era el estado TRANSITORIO del tracer
    // — el quórum del plan 46-04 lo promueve a `validated` y el gate habría muerto
    // en la misma fase. Así sigue mordiendo: cualquier `status` escrito a mano que
    // no cuadre con sus propios passes se pone rojo aquí y en el sub-gate VAL-09.
    assert.equal(
      val.status,
      deriveStatus(val.passes),
      `el status escrito ("${val.status}") no es el que derivan sus ${val.passes.length} pase(s)`
    );
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
// V1 · el criterio tipográfico COMPARTIDO + un margen POR SUPERFICIE
//
// D-46-06 quedó ENMENDADA el 2026-08-13 (decisión del autor en el checkpoint del
// plan 46-05): en pantalla la traducción vive FUERA de `.session-feedback`, justo
// encima del CTA. Por eso el margen dejó de ser compartido — sale de la regla
// doble y se declara por superficie —, mientras la TIPOGRAFÍA sigue declarada una
// sola vez, que es lo que D-46-08 exige tras su propia enmienda: mismo criterio
// de estilo, posición distinta porque el contexto es distinto.
// ─────────────────────────────────────────────────────────────────────────────

describe('V1 — criterio compartido + margen por superficie (UI-SPEC §CSS Contract)', () => {
  const limpio = cssSinComentarios(cssSrc);
  const reglasTrad = reglasCss(limpio).filter((r) =>
    /\.(?:session-translation|summary-error-translation)\b/.test(r.selector)
  );
  // La regla compartida se localiza por lo que HACE (declarar tipografía), no por
  // su posición en el fichero.
  const compartida = reglasTrad.find((r) => /font-family\s*:/.test(r.cuerpo));
  const pantalla = reglasTrad.find((r) => r.selector === '.session-translation');
  const resumen = reglasTrad.find((r) => r.selector === '.summary-error-translation');

  test('CLÁUSULA DE NO-VACUIDAD (va primero): el parser ve las tres reglas de traducción', () => {
    // Un parser que deja de casar devuelve lista vacía, y sobre la lista vacía
    // cualquier "ninguna declara X" de abajo pasaría en VERDE sin mirar nada.
    assert.ok(reglasTrad.length > 0, 'el parser de CSS no ve NINGUNA regla de traducción en app.css');
    assert.ok(compartida, 'ninguna regla de traducción declara font-family: falta el criterio compartido');
    assert.ok(pantalla, 'falta la regla de margen propia de .session-translation');
    assert.ok(resumen, 'falta la regla de margen propia de .summary-error-translation');
  });

  test('el selector doble de la regla compartida va en el orden del contrato', () => {
    assert.ok(compartida, 'no-vacuidad: sin regla compartida no hay selector que inspeccionar');
    assert.match(compartida.selector, /^\.session-translation,\s*\n\.summary-error-translation$/);
  });

  test('la regla compartida declara los CINCO valores tipográficos exactos del contrato', () => {
    assert.ok(compartida, 'no-vacuidad: sin regla compartida no hay bloque que inspeccionar');
    assert.ok(compartida.cuerpo.includes('font-family: var(--ed-font-serif)'), 'font-family serif');
    assert.ok(compartida.cuerpo.includes('font-size: 16px'), 'font-size 16px');
    assert.ok(compartida.cuerpo.includes('font-weight: 400'), 'font-weight 400');
    assert.ok(compartida.cuerpo.includes('line-height: 1.5'), 'line-height 1.5');
    assert.ok(compartida.cuerpo.includes('color: var(--ed-ink)'), 'color ink');
  });

  test('el MARGEN ya NO vive en la regla compartida: depende del contexto (D-46-06 enmendada)', () => {
    assert.ok(compartida, 'no-vacuidad: sin regla compartida no hay cuerpo que inspeccionar');
    assert.deepEqual(
      propiedadesDe(compartida.cuerpo).filter((p) => p.startsWith('margin')),
      [],
      'la regla compartida volvió a declarar margen: las dos superficies ya no comparten posición'
    );
  });

  test('el margen de pantalla despega la frase de la caja Y del CTA; el del resumen no cambia', () => {
    const mPantalla = margenDe(pantalla);
    const mResumen = margenDe(resumen);
    // No-vacuidad del extractor de shorthand: sin esto, `null` vs `null` compararía
    // dos ausencias y pasaría en verde.
    assert.ok(mPantalla, 'no-vacuidad: no se lee el margen de .session-translation');
    assert.ok(mResumen, 'no-vacuidad: no se lee el margen de .summary-error-translation');

    // Comparación DERIVADA entre las dos superficies, no un literal suelto: fuera
    // de la caja tintada hace falta más aire que dentro de ella.
    assert.ok(
      mPantalla.top > mResumen.top,
      `la traducción de pantalla vive FUERA de la caja: su margen superior (${mPantalla.top}px) ` +
        `debe superar el de la card del resumen (${mResumen.top}px)`
    );
    // `.session-cta` no declara margin-top (se assertea abajo), así que este margen
    // inferior es LO ÚNICO que separa la frase del botón. Medido en Chrome headless
    // sobre el CSS real: sin él, hueco = 0 px.
    assert.ok(mPantalla.bottom > 0, 'sin margen inferior la traducción queda pegada al CTA "Continuar →"');
    assert.equal(mResumen.bottom, 0, 'en el resumen el margen inferior sigue en 0: colapsa contra la explanation');

    // Escala de 4px del proyecto: ningún valor off-grid nuevo (UI-SPEC §Spacing).
    for (const v of [mPantalla.top, mPantalla.bottom, mResumen.top]) {
      assert.equal(v % 4, 0, `${v}px está fuera de la escala de 4px del proyecto`);
    }
  });

  test('.session-cta sigue sin declarar margen: el aire inferior de la traducción es el único hueco', () => {
    // Ancla al disco la medición que justifica el margen inferior. Si el CTA gana
    // un margin-top, ese razonamiento caduca y hay que volver a medir.
    const cta = reglasCss(limpio).find((r) => r.selector === '.session-cta');
    assert.ok(cta, 'no-vacuidad: no se localiza la regla .session-cta en app.css');
    assert.ok(propiedadesDe(cta.cuerpo).length > 0, 'no-vacuidad: la regla .session-cta sale vacía');
    assert.deepEqual(
      propiedadesDe(cta.cuerpo).filter((p) => p.startsWith('margin')),
      [],
      '.session-cta ganó un margen: el hueco traducción→CTA ya no lo produce solo la traducción, re-medir'
    );
  });

  test('ninguna de las tres reglas puede recortar la traducción: cero height/overflow (E1/E2 · overflow)', () => {
    assert.ok(reglasTrad.length > 0, 'no-vacuidad: sin reglas localizadas no hay nada que inspeccionar');
    const PROHIBIDAS = ['height', 'max-height', 'min-height', 'overflow', 'text-overflow', 'overflow-wrap', 'max-width', 'text-wrap'];
    for (const regla of reglasTrad) {
      // Se comparan NOMBRES DE PROPIEDAD declarados, no substrings: `line-height`
      // contiene "height" y un `includes('height')` desnudo daría un rojo falso
      // sobre una declaración que el contrato EXIGE.
      const propiedades = propiedadesDe(regla.cuerpo);
      assert.ok(propiedades.length > 0, `no-vacuidad: la regla ${regla.selector} sale sin declaraciones`);
      const infractoras = propiedades.filter((p) => PROHIBIDAS.includes(p));
      assert.deepEqual(
        infractoras,
        [],
        `${regla.selector} declara propiedades prohibidas por el UI-SPEC §CSS Contract: ${infractoras.join(', ')}`
      );
      assert.ok(!regla.cuerpo.includes('!important'), `${regla.selector} usa !important, prohibido en esta fase`);
    }
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

describe('V2 — un solo CRITERIO DE ESTILO para las dos superficies (D-46-08 enmendada)', () => {
  // Sobre el CSS SIN comentarios: el comentario de referencia cruzada de la
  // sección de Resultados es prosa, no una segunda declaración. Contar sobre el
  // texto crudo confundiría una mención con un criterio duplicado.
  const limpio = cssSinComentarios(cssSrc);
  const reglasTrad = reglasCss(limpio).filter((r) =>
    /\.(?:session-translation|summary-error-translation)\b/.test(r.selector)
  );
  const TIPOGRAFICAS = /(?:font-family|font-size|font-weight|line-height|font-style|color)\s*:/;

  test('CLÁUSULA DE NO-VACUIDAD (va primero): el parser ve reglas de traducción', () => {
    assert.ok(reglasTrad.length > 0, 'el parser de CSS no ve NINGUNA regla de traducción en app.css');
  });

  test('exactamente UNA regla declara tipografía, y es la del selector doble', () => {
    const conTipografia = reglasTrad.filter((r) => TIPOGRAFICAS.test(r.cuerpo));
    assert.equal(
      conTipografia.length,
      1,
      `el criterio de estilo (serif 16/400/1.5 ink) se declara ${conTipografia.length} veces: ` +
        `D-46-08 exige UNO solo para las dos superficies (${conTipografia.map((r) => r.selector).join(' | ')})`
    );
    assert.match(conTipografia[0].selector, /^\.session-translation,\s*\n\.summary-error-translation$/);
  });

  test('las demás reglas de traducción declaran SOLO el margen, nada tipográfico', () => {
    const soloMargen = reglasTrad.filter((r) => !TIPOGRAFICAS.test(r.cuerpo));
    assert.ok(soloMargen.length > 0, 'no-vacuidad: no hay reglas de margen por superficie que inspeccionar');
    for (const regla of soloMargen) {
      assert.deepEqual(
        propiedadesDe(regla.cuerpo),
        ['margin'],
        `${regla.selector} declara algo más que el margen: lo único que divergió entre superficies es la POSICIÓN`
      );
    }
  });

  test('cada superficie tiene exactamente UNA regla de margen propia', () => {
    for (const clase of ['.session-translation', '.summary-error-translation']) {
      const propias = reglasTrad.filter((r) => r.selector === clase);
      assert.equal(propias.length, 1, `${clase} tiene ${propias.length} reglas propias, debe tener 1`);
    }
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
// V6 · posición en el DOM de las dos superficies (D-46-06 ENMENDADA / D-46-08)
//
// La primera redacción congelaba el orden DENTRO de la caja de feedback
// (`session-translation` entre `session-feedback-correct` y `session-explanation`).
// Eso dejó de describir el diseño el 2026-08-13, cuando el autor —viendo la app en
// el checkpoint del plan 46-05— pidió el nodo FUERA de la caja, justo encima del
// CTA. El invariante que se congela ahora es el que él pidió, y es más fuerte:
// NO dentro de `.session-feedback`, y SÍ antes del CTA. La superficie 2 no cambia.
// ─────────────────────────────────────────────────────────────────────────────

describe('V6 — la traducción vive FUERA de la caja y encima del CTA (D-46-06 enmendada / D-46-08)', () => {
  // Los anclajes se buscan DENTRO del sub-template multiple-choice: `index.html`
  // tiene TRES bloques `.session-feedback` (multiple-choice, word-buttons y match)
  // y un `indexOf` global mediría cualquiera de ellos.
  const APERTURA_SUB = `<template x-if="sessionCurrentExercise.type === 'multiple-choice'">`;
  const iSub = htmlSrc.indexOf(APERTURA_SUB);
  const rangoSub = iSub === -1 ? null : rangoTemplate(htmlSrc, iSub);
  const sub = rangoSub ? htmlSrc.slice(rangoSub[0], rangoSub[1]) : '';

  const iClaseCaja = sub.indexOf('class="session-feedback"');
  const iAperturaCaja = iClaseCaja === -1 ? -1 : sub.lastIndexOf('<div', iClaseCaja);
  const rangoCaja = iAperturaCaja === -1 ? null : rangoDiv(sub, iAperturaCaja);
  const iTrad = sub.indexOf('class="session-translation"');
  const iCta = sub.indexOf('class="session-cta"');

  test('CLÁUSULA DE NO-VACUIDAD (va primero): la región y los tres anclajes se localizaron', () => {
    // Sin esto, un extractor que deja de casar devolvería región vacía e índices
    // -1, y los "está fuera de la caja" de abajo pasarían en VERDE sin mirar nada.
    assert.ok(rangoSub, `no se acota el sub-template multiple-choice (${APERTURA_SUB})`);
    assert.ok(rangoCaja, 'no se acota el <div class="session-feedback"> del sub-template');
    assert.ok(rangoCaja[1] - rangoCaja[0] > 'class="session-feedback"'.length, 'la región de la caja sale vacía');
    assert.ok(iTrad !== -1, 'falta class="session-translation" en el sub-template multiple-choice');
    assert.ok(iCta !== -1, 'falta class="session-cta" en el sub-template multiple-choice');

    // Control positivo: la región acotada es la caja DE VERDAD, no un trozo suelto.
    const caja = sub.slice(rangoCaja[0], rangoCaja[1]);
    assert.ok(
      caja.includes('class="session-explanation"') && caja.includes('¡Esatto!'),
      'la región acotada no contiene la explanation ni el título italiano: está mal acotada'
    );
  });

  test('EL INVARIANTE NUEVO: el nodo NO está dentro del bloque .session-feedback', () => {
    assert.ok(rangoCaja, 'no-vacuidad: sin la caja acotada no hay dentro/fuera que decidir');
    assert.ok(iTrad !== -1, 'no-vacuidad: no se localiza el nodo de traducción');
    assert.ok(
      iTrad < rangoCaja[0] || iTrad >= rangoCaja[1],
      `la traducción está DENTRO de la caja de feedback (índice ${iTrad} en el rango ` +
        `[${rangoCaja[0]}, ${rangoCaja[1]})): el autor la quiere FUERA, en sitio fijo, acertando y fallando`
    );
  });

  test('va DESPUÉS del cierre de la caja y ANTES del CTA "Continuar →"', () => {
    assert.ok(rangoCaja && iTrad !== -1 && iCta !== -1, 'no-vacuidad: anclajes sin localizar');
    assert.ok(iTrad > rangoCaja[1], 'la traducción debe ir después del cierre de la caja de feedback');
    assert.ok(iTrad < iCta, 'la traducción debe ir ANTES del CTA: es el sitio fijo donde el autor la busca');
  });

  test('está JUSTO encima del CTA: entre los dos no se cuela ningún otro elemento', () => {
    assert.ok(iTrad !== -1 && iCta !== -1, 'no-vacuidad: anclajes sin localizar');
    const finTrad = sub.indexOf('</p>', iTrad);
    const iAperturaCta = sub.lastIndexOf('<button', iCta);
    assert.ok(finTrad !== -1, 'no-vacuidad: el nodo de traducción no cierra con </p>');
    assert.ok(iAperturaCta > finTrad, 'no-vacuidad: no se acota el tramo traducción→CTA');
    const entre = sub.slice(finTrad + '</p>'.length, iAperturaCta).replace(/<!--[\s\S]*?-->/g, '');
    assert.equal(
      entre.trim(),
      '',
      `entre la traducción y el CTA hay markup: ${entre.trim().slice(0, 120)}`
    );
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
    const limpio = cssSinComentarios(cssSrc);
    const reglasTrad = reglasCss(limpio).filter((r) =>
      /\.(?:session-translation|summary-error-translation)\b/.test(r.selector)
    );
    assert.ok(reglasTrad.length > 0, 'no-vacuidad: el parser no ve ninguna regla de traducción');
    for (const regla of reglasTrad) {
      assert.equal(
        countOf(regla.cuerpo, /#[0-9a-fA-F]{3,8}\b/g),
        0,
        `${regla.selector} declara un hex literal`
      );
    }
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
