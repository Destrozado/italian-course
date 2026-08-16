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

/**
 * Un pase `incorrecta` NO puede llevar `adjudicacion` colgada (WINDOWS id 45, WR-02 del
 * code review de la Phase 48).
 *
 * EL ARTEFACTO QUE PROHIBE, observado y no hipotetico: al cerrar
 * `fare-indicativo-passato-remoto#4` con `--adjudicar` y una refutacion escrita de cuatro
 * puntos, el modelo volvio a devolver `incorrecta`, y en disco quedo un pase `incorrecta`
 * LLEVANDO COLGADO un motivo que refuta su propio concern, con el status todavia en
 * `disputed`. Ese registro SE LEE COMO ADJUDICADO SIN ESTARLO, que es justo lo contrario
 * de lo que el campo documenta.
 *
 * POR QUE VIVE AQUI Y NO SOLO EN EL COMPOSITOR. La negativa se puso en `run()` — el mismo
 * sitio que el saneo de la id 43 rechazo por dejar puertas abiertas. `applyPassToText` /
 * `writeTranslationPass` seguian aceptandolo: `assertNoBorraIncorrectaEnSilencio` retorna
 * EN SECO cuando el veredicto nuevo es `incorrecta` (es su tercera exencion declarada: el
 * disenso no se borra), y nada mas lo miraba. Y no hay red aguas abajo: ningun gate del
 * repo busca este artefacto en el corpus, porque todos comparan escrito-contra-derivado y
 * aqui los dos lados coinciden en `disputed`. Si entra, se queda.
 *
 * NO SE SOLAPA con `assertNoBorraIncorrectaEnSilencio`: aquella mira la TRANSICION (que
 * no se borre un `incorrecta` propio) y esta mira la FORMA del pase que se escribe. Un
 * pase `correcta` con `adjudicacion` sigue siendo legitimo — es el camino que la id 38
 * necesita — y esta funcion no lo toca.
 *
 * @param {{by?:string, verdict?:string, adjudicacion?:unknown}} pass el pase a escribir.
 * @param {string} addr direccion legible de la unidad, para que el mensaje diga sobre que.
 * @throws {Error} si el pase es `incorrecta` y trae una `adjudicacion` no vacia.
 */
export function assertNoAdjudicacionSobreIncorrecta(pass, addr) {
  if (pass?.verdict !== 'incorrecta') return;
  const motivo = typeof pass?.adjudicacion === 'string' ? pass.adjudicacion.trim() : '';
  if (!motivo) return;

  throw new Error(
    `${addr}: un pase \`incorrecta\` NO puede llevar \`adjudicacion\`. El veredicto que devolvio ` +
      `\`${pass?.by}\` sigue siendo \`incorrecta\`, asi que la adjudicacion NO ha adjudicado nada, y ` +
      `grabarla dejaria en el corpus un pase que SE LEE COMO ADJUDICADO SIN ESTARLO — con el status ` +
      `todavia en \`disputed\` y un motivo colgado que refuta su propio concern (WINDOWS id 45). ` +
      `No se ha escrito nada. Las salidas legitimas son TRES y ninguna es re-invocar al mismo ` +
      `modelo: (1) arreglar el texto si el concern tiene razon; (2) enmendar el doc de criterios si ` +
      `el concern es un falso positivo de CLASE, y re-validar desde cero; (3) override de autor ` +
      `(\`by: "autor"\`, \`override: true\`) con el motivo escrito, que es el camino explicito del ` +
      `proyecto para grabar una refutacion sin que el modelo coopere.`
  );
}
