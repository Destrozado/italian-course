// src/data/validation-state.js — Phase 9 D-VAL-07.
//
// Pure — sin DOM, sin localStorage, sin fetch. D-08 estilo.
// Importable desde Node (`node --test`) y desde el navegador.
//
// Reglas estrictas D-VAL-07 (sticky disputed — NO self-heal):
//   - CUALQUIER pase con verdict === 'incorrecta' → 'disputed' (sticky;
//     un 3er pase 'correcta' posterior NO limpia el estado).
//   - ≥2 pases 'correcta' con `by` DISTINTOS (Set size ≥2) AND cero
//     'incorrecta' → 'validated'. Quórum multi-modelo (D-VAL-02).
//   - Cualquier otro caso (sin passes, 1 pase, mismo by repetido) →
//     'pending'. Estado inicial legítimo.
//
// Defensive reads (`p?.verdict`, `p?.by`) — el JSON puede llegar parcial
// si un subagent crashea mid-write (D-VAL-07 defensive).
//
// OVERRIDE DEL AUTOR (G-42-3, 2026-08-06) — antes esta función no lo
// contemplaba y el comentario decía que la promoción tras override era
// "decisión UX de Phase 10". Nunca se implementó en ninguna parte, y el
// resultado fue que el override se aplicó a mano: `avere-passato-prossimo`
// vive con `status: "validated"` y un pase `incorrecta` dentro, es decir con
// el invariante `status === deriveStatus(passes)` roto en silencio, y
// `partitivos-negativa` y `profesiones-invariabili` igual. El caso ya se
// había dado 3 veces antes de esta cuarta, así que se hace explícito aquí:
//
//   - Un override es una entry con `by: "autor"`, `verdict: "correcta"` y
//     `override: true`. El flag es OBLIGATORIO y explícito: un pase del autor
//     sin él es un voto normal, no un override, para que el override nunca
//     ocurra por accidente ni por lectura de un prefijo en `concerns`.
//   - Un override PROMUEVE a `validated` pese al `incorrecta`, y el
//     `incorrecta` se QUEDA en `passes[]`. Eso es lo que lo distingue de
//     resetear los pases: el disenso sigue siendo legible en el audit trail,
//     y quien lea el fichero ve que hubo objeción y que el autor la resolvió.
//   - Un override NO fabrica quórum, solo resuelve una disidencia: sigue
//     exigiendo >=2 `correcta` con `by` distintos Y al menos una de ellas de
//     un MODELO. Así, un `validated` escrito a mano con un único pase
//     `by: "autor"` sigue derivando `pending`, que es la propiedad
//     anti-falsificación que protegen T-42-03 y su gemelo de fare-indicativo.
//   - Sin ninguna entry de override, el comportamiento es IDÉNTICO al
//     anterior: cualquier `incorrecta` sigue siendo sticky.
//
// La razón de que el override viva aquí y no en la UI: `deriveStatus` es la
// fuente única (WR-01) que consumen el gate VAL-07, los scripts de pase y los
// tests de contenido. Resolver el disenso en cualquier otro sitio obliga a
// escribir `status` a mano, que es exactamente el agujero por el que se colaron
// los 3 casos anteriores.

/** @param {{by?:string, verdict?:string, override?:boolean}} p */
const esOverrideDelAutor = (p) =>
  p?.by === 'autor' && p?.verdict === 'correcta' && p?.override === true;

/**
 * Deriva el `status` desde `passes[]` aplicando las reglas estrictas y
 * stickies de D-VAL-07, más el override explícito del autor.
 *
 * @param {Array<{by:string, date:string, verdict:string, concerns?:string[], override?:boolean}>} passes
 *   Array de pases. Cada entry debe tener al menos `verdict` y `by` para
 *   contar como pase válido. Entradas malformadas se ignoran defensivamente.
 * @returns {"pending" | "validated" | "disputed"}
 */
export function deriveStatus(passes) {
  if (!Array.isArray(passes)) return 'pending';

  const correctas = passes.filter(p => p?.verdict === 'correcta');
  const distinctBy = new Set(correctas.map(p => p?.by).filter(Boolean));
  const hayQuorum = correctas.length >= 2 && distinctBy.size >= 2;

  if (passes.some(p => p?.verdict === 'incorrecta')) {
    // Sticky disputed, salvo override explícito del autor sobre un quórum que
    // ya existe y que incluye al menos un pase de modelo.
    const hayCorrectaDeModelo = correctas.some(p => p?.by && p.by !== 'autor');
    return passes.some(esOverrideDelAutor) && hayQuorum && hayCorrectaDeModelo
      ? 'validated'
      : 'disputed';
  }

  return hayQuorum ? 'validated' : 'pending';
}
