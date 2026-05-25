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
// El override manual del autor se registra como una entry adicional con
// `by: "autor"` y `verdict: "correcta"` (audit trail VAL-08), pero al
// llegar aquí YA es disputed-sticky — la promoción a validated tras
// override es decisión UX de Phase 10 (escalada), NO de esta función.

/**
 * Deriva el `status` desde `passes[]` aplicando las reglas estrictas y
 * stickies de D-VAL-07.
 *
 * @param {Array<{by:string, date:string, verdict:string, concerns?:string[]}>} passes
 *   Array de pases. Cada entry debe tener al menos `verdict` y `by` para
 *   contar como pase válido. Entradas malformadas se ignoran defensivamente.
 * @returns {"pending" | "validated" | "disputed"}
 */
export function deriveStatus(passes) {
  if (!Array.isArray(passes)) return 'pending';

  const hasIncorrecta = passes.some(p => p?.verdict === 'incorrecta');
  if (hasIncorrecta) return 'disputed';

  const correctas = passes.filter(p => p?.verdict === 'correcta');
  const distinctBy = new Set(correctas.map(p => p?.by).filter(Boolean));
  if (correctas.length >= 2 && distinctBy.size >= 2) return 'validated';

  return 'pending';
}
