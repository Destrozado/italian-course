// src/domain/dates.js
//
// Pure domain module — sin DOM, sin localStorage, sin fetch.
// Importable desde Node (`node --test`) y desde el navegador.
//
// Decisiones aplicadas:
//   - DOMAIN-01: `todayLocal()` devuelve `YYYY-MM-DD` usando el reloj LOCAL
//     (no UTC), con `getFullYear/getMonth/getDate` + `padStart`. NUNCA usar
//     `toISOString().slice(0,10)` — eso es UTC y rompe la racha de 21 días
//     para usuarios fuera del huso UTC (Phase 2).

/**
 * Devuelve la fecha local en formato `YYYY-MM-DD`.
 *
 * Usa el reloj local del proceso/browser (TZ-correcto, DST-seguro). El
 * parámetro `now` es inyectable para tests.
 *
 * @param {Date} [now=new Date()] - Instante a formatear (default: ahora).
 * @returns {string} Fecha en formato `YYYY-MM-DD` según huso local.
 */
export function todayLocal(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
