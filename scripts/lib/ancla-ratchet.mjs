// scripts/lib/ancla-ratchet.mjs — Phase 48, CR-01 y CR-02 del code review.
//
// EL RATCHET HISTORICO DEL ANCLA DE TRAD-COV, en UN solo sitio.
//
// EL AGUJERO QUE CIERRA. El ancla de `content/translation-coverage.lock.json` es, por
// diseno, lo unico que el borrado de una variante NO puede mover consigo: `expected`,
// `surfaces` y `validated` se derivan del MISMO fichero en la MISMA corrida, asi que al
// borrar una variante traducida y validada los tres bajan a la vez y las igualdades del
// veredicto siguen cuadrando. Pero el ancla misma no se confrontaba con NADA: sus dos
// consumidores comparaban exclusivamente `disco < suelo`. Bajar un suelo a mano era por
// tanto un no-op silencioso, y con el suelo bajado el vector volvia a estar abierto.
//
// Su valor COMMITEADO en HEAD es la unica referencia que la edicion del arbol de trabajo
// no puede mover. De ahi el ratchet.
//
// SIGUE SIENDO UN SUELO, NO UNA IGUALDAD, y eso es load-bearing: la doctrina escrita en
// scripts/bump-translation-lock.mjs:19-25 y en run-validation-271.mjs dice que crecer NO
// enrojece el ancla —el rojo de una variante nueva sin traducir lo pone la cobertura, que
// es su causa propia— porque fundir las dos causas dejaria al autor sin saber si le falta
// traducir o si le falta una variante. El ratchet no toca ese lado: solo enrojece la firma
// exacta del exploit, la edicion HACIA ABAJO.
//
// POR QUE VIVE EN UNA LIB Y NO DUPLICADO. Lo consumen DOS superficies —el sub-gate
// ANCLA-RATCHET del reporter, que es el comando que el autor corre a mano antes de cerrar
// milestone, y GATE-03 de tests/count-arrays-lockstep.test.js, que es el que corre la
// suite—. Dos copias de la misma doctrina divergen; una sola no puede.

import { execFileSync } from 'node:child_process';

export const LOCK_COBERTURA = 'content/translation-coverage.lock.json';

/** Un valor imprimible para el diagnostico, tambien cuando `JSON.stringify` da `undefined`. */
const legible = (v) => JSON.stringify(v) ?? String(v);

/**
 * Los suelos del ancla que NO son enteros no negativos (CR-02).
 *
 * POR QUE ES UN GATE Y NO UNA PARANOIA. Los dos consumidores comparan `disco < suelo` a
 * pelo contra un valor que sale de un JSON editable a mano. Y `54 < null` es `false`;
 * `54 < "cincuenta y cuatro"` es `false` (NaN); `54 < true` es `false`. En los tres casos
 * el ancla de esa categoria queda MUDA y ninguno de los dos gates emite nada. La
 * no-vacuidad se comprobaba a nivel de MAPA y se abandonaba a nivel de ENTRADA, que es
 * donde vive el dato que decide.
 *
 * @param {Record<string, unknown>} categorias mapa slug -> suelo declarado.
 * @returns {string[]} un diagnostico por entrada invalida, con su clave y su valor.
 */
export function suelosNoEnteros(categorias) {
  return Object.entries(categorias)
    .filter(([, suelo]) => !Number.isInteger(suelo) || suelo < 0)
    .map(([slug, suelo]) => `${slug}: ${legible(suelo)}`);
}

/**
 * El ancla tal y como esta COMMITEADA en HEAD, que es la referencia del ratchet.
 *
 * DEVUELVE UN ESTADO Y NUNCA LANZA POR AUSENCIA. El caso `ausente` es el bootstrap
 * legitimo: el commit que da de alta el lock no tiene con que compararse. Lo que NO hace
 * es pasar en silencio — quien lo consume imprime el motivo.
 *
 * LANZA, en cambio, cuando el ancla SI existe en HEAD y es ilegible: ahi la referencia
 * existe y esta rota, que no es un bootstrap. Un gate que no puede leer su referencia no
 * pasa en verde.
 *
 * @param {string} ruta ruta del ancla relativa a la raiz del repo.
 * @param {string} root directorio desde el que se invoca a git.
 * @returns {{estado:'leida', categorias:Record<string, unknown>}|{estado:'ausente', motivo:string}}
 */
export function anclaCommiteadaEnHead(ruta = LOCK_COBERTURA, root = process.cwd()) {
  let crudo;
  try {
    crudo = execFileSync('git', ['show', `HEAD:${ruta}`], {
      cwd: root,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    const detalle = String(e?.stderr || e?.message || e).trim().split('\n')[0];
    return { estado: 'ausente', motivo: `git show HEAD:${ruta} no devolvio nada (${detalle})` };
  }
  let doc;
  try {
    doc = JSON.parse(crudo);
  } catch (e) {
    throw new Error(
      `ANCLA-RATCHET: el ancla COMMITEADA en HEAD (${ruta}) no se puede parsear (${e.message}), ` +
        `asi que el ratchet historico no tiene referencia. Un gate que no puede leer su referencia ` +
        `no pasa en verde.`
    );
  }
  const categorias = doc && typeof doc.categorias === 'object' && doc.categorias !== null ? doc.categorias : null;
  if (!categorias) {
    throw new Error(
      `ANCLA-RATCHET: el ancla COMMITEADA en HEAD (${ruta}) no declara un objeto "categorias". ` +
        `El ratchet historico no tiene referencia y no pasa en verde sin ella.`
    );
  }
  return { estado: 'leida', categorias };
}

/**
 * Las claves cuyo suelo BAJO respecto del ancla commiteada en HEAD (CR-01).
 *
 * LOS DOS BOOTSTRAPS, tratados a proposito y no por accidente:
 *   - Una clave NUEVA, ausente del ancla de HEAD: dar de alta una categoria NO es bajar un
 *     suelo. VERDE. El agujero de una categoria cubierta y sin anclar ya lo cierra la
 *     clausula de "declarada cubierta y SIN anclar", que es su sitio.
 *   - Una clave RETIRADA del ancla del arbol de trabajo: SI es una bajada, y la maxima —
 *     retirar la clave entera es lo que permite sacar la categoria del denominador sin que
 *     nadie chiste, que es el vector hermano del borrado de variante.
 *
 * @param {Record<string, unknown>} head suelos commiteados en HEAD.
 * @param {Record<string, unknown>} hoy suelos del ancla en el arbol de trabajo.
 * @returns {string[]} un diagnostico por bajada, vacio si ninguna bajo.
 */
export function suelosQueBajaronRespectoDeHead(head, hoy) {
  return Object.entries(head).flatMap(([slug, sueloHead]) => {
    if (!Number.isInteger(sueloHead)) {
      return [
        `${slug}: el ancla de HEAD declara ${legible(sueloHead)}, que no es un entero, asi que el ` +
          `ratchet no puede comparar esta clave`,
      ];
    }
    if (!(slug in hoy)) {
      return [`${slug}: HEAD ancla ${sueloHead} variante(s) y el arbol de trabajo RETIRO la clave entera del ancla`];
    }
    const sueloHoy = hoy[slug];
    if (Number.isInteger(sueloHoy) && sueloHoy < sueloHead) {
      return [`${slug}: HEAD ancla ${sueloHead} y el arbol de trabajo declara ${sueloHoy}`];
    }
    return [];
  });
}
