// scripts/lib/pass-guard.mjs — Phase 47, CR-01 del code review (T-47-05 / T-47-11 / T-47-18).
//
// EL AGUJERO QUE CIERRA. Los cuatro escritores de pase deduplican por `by` antes de
// derivar el status:
//
//   const passes = (cur.passes ?? []).filter((p) => p.by !== pass.by);
//   passes.push(pass);
//   const status = deriveStatus(passes);
//
// Si el modelo X ya había emitido un `incorrecta` y se le vuelve a invocar, su pase
// anterior DESAPARECE del array antes de que `deriveStatus` lo vea. Y `deriveStatus`
// (src/data/validation-state.js:68) sólo aplica el sticky sobre un `incorrecta` que
// SIGUE en el array, así que la unidad pasa de `disputed` a `validated` sin
// `override: true`, sin motivo escrito y sin ninguna huella en el JSON. Con `--temp=0.2`
// el veredicto de un mismo modelo no es determinista: es, literalmente, re-tirar el dado
// sobre el fallo hasta que salga verde. Ningún gate lo ve — `VAL-09` y `TRAD-COV`
// comparan escrito-contra-derivado, y aquí los dos lados se mueven juntos porque el pase
// se fue de los dos.
//
// POR QUÉ NO ES UNA PROHIBICIÓN A SECAS. La fase 47 SÍ retiró deliberadamente 62 pases
// `deepseek-chat` de `articoli` (8 de ellos `incorrecta`) al cambiar de juez a mitad de
// corpus — decisión del autor, adjudicada y registrada (WINDOWS id 38). Ese camino tiene
// que seguir existiendo. Lo que no puede seguir existiendo es que sea INDISTINGUIBLE de
// un borrado accidental. De ahí la forma del guard:
//
//   - por defecto, sustituir un `incorrecta` propio por un veredicto no-`incorrecta`
//     LANZA, y no se escribe nada (el pase va impreso en stdout: está pagado);
//   - el único camino para hacerlo es `--adjudicar="<motivo>"`, que exige un motivo
//     escrito y lo GRABA EN EL PASE, dentro del JSON. La retirada del disenso deja
//     entonces constancia en el propio fichero, no sólo en git.
//
// Es la misma doctrina que el override de autor de `deriveStatus` (G-42-3): resolver una
// disidencia cuesta trabajo y queda legible. Lo que este guard prohíbe es la ruta que
// puenteaba ese mecanismo siendo MÁS silenciosa que él.
//
// LO QUE NO TOCA, a propósito:
//   - sustituir un pase `correcta` por cualquier cosa (el flujo normal de re-validación:
//     47-02 re-corrió 32 + 4 variantes así, y tiene que seguir siendo posible);
//   - sustituir un `incorrecta` por otro `incorrecta` (el disenso no se borra);
//   - `deriveStatus` y `src/data/validation-state.js`, que se quedan byte-intactos.

/**
 * @param {Array<{by?:string, verdict?:string}>} previos  passes[] tal cual está en disco.
 * @param {{by?:string, verdict?:string, adjudicacion?:string}} pass  el pase que se quiere escribir.
 * @param {string} addr  dirección legible de la unidad (id de slot, `slot#k`, id de frase…),
 *   para que el mensaje diga SIEMPRE sobre qué se estaba escribiendo.
 * @throws {Error} si la escritura borraría un `incorrecta` propio sin adjudicación escrita.
 */
export function assertNoBorraIncorrectaEnSilencio(previos, pass, addr) {
  const anteriores = Array.isArray(previos) ? previos : [];
  const sustituido = anteriores.find((p) => p?.by === pass?.by);
  if (sustituido?.verdict !== 'incorrecta') return;
  if (pass?.verdict === 'incorrecta') return;

  const motivo = typeof pass?.adjudicacion === 'string' ? pass.adjudicacion.trim() : '';
  if (motivo) return;

  throw new Error(
    `${addr}: ${pass?.by} ya emitió un \`incorrecta\` sobre esta unidad. Sobrescribirlo con ` +
      `\`${pass?.verdict}\` BORRARÍA el disenso del array y limpiaría el disputed sin override, ` +
      `sin motivo y sin dejar rastro en el JSON. Un \`incorrecta\` se resuelve con TRABAJO ` +
      `(segundo juez, enmienda del doc de criterios, override de autor con motivo) — nunca ` +
      `re-tirando el dado contra el mismo modelo. Si la retirada es deliberada (p. ej. un ` +
      `cambio de juez sobre la categoría entera), re-invoca con ` +
      `--adjudicar="<motivo escrito>": el motivo queda GRABADO en el pase, dentro del fichero. ` +
      `No se ha escrito nada; el pase va impreso en stdout.`
  );
}
