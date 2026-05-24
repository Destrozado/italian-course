// src/domain/dates.js
//
// Pure domain module — sin DOM, sin capa de persistencia, sin fetch.
// Importable desde Node (`node --test`) y desde el navegador.
//
// Decisiones aplicadas:
//   - DOMAIN-01: `todayLocal()` devuelve `YYYY-MM-DD` usando el reloj LOCAL
//     (no UTC), con `getFullYear/getMonth/getDate` + `padStart`. NUNCA usar
//     `toISOString().slice(0,10)` — eso es UTC y rompe la racha de 21 días
//     para usuarios fuera del huso UTC (Phase 2).
//   - D-79 (Phase 4): `daysSinceISO(iso, todayStr)` puro DST-safe via
//     local-noon anchor (mismo algoritmo que parseIsoLocal en
//     src/screens/app.js:1431-1442). Puede devolver negativo si iso > today
//     (fecha futura por clock skew o edición manual) — el caller decide
//     qué hacer (Pitfall #5 RESEARCH §4).

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

/**
 * Días enteros transcurridos desde un timestamp ISO 8601 UTC hasta una fecha
 * local `YYYY-MM-DD`.
 *
 * DST-safe via local-noon anchor: parsea el ISO con `new Date(iso)`, lo
 * formatea a fecha local con `todayLocal(d)`, y luego ancla ambos extremos
 * a las 12:00 locales para evitar saltos por horarios de verano (Pitfall #4
 * RESEARCH §4 — días con 23h o 25h en regiones que aplican DST).
 *
 * Puede devolver NEGATIVO cuando `iso` representa una fecha futura respecto
 * a `todayStr` (clock skew, edición manual del backup). El caller decide
 * qué hacer (Pitfall #5: shouldShowBackupBanner trata `days < 0` como
 * "no mostrar banner").
 *
 * Defensivo:
 *   - Argumentos no-string → 0.
 *   - ISO inválido (`Date.getTime()` NaN) → 0.
 *   - `todayStr` no formato `YYYY-MM-DD` → 0 (parseIsoLocalNoon devuelve null).
 *
 * @param {string} iso - ISO 8601 UTC (ej. '2026-05-24T14:32:11.000Z').
 * @param {string} todayStr - Fecha local 'YYYY-MM-DD' (típicamente de todayLocal()).
 * @returns {number} Días enteros. Negativo si iso > todayStr.
 */
export function daysSinceISO(iso, todayStr) {
  if (typeof iso !== 'string' || typeof todayStr !== 'string') return 0;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 0;
  const isoLocalDate = todayLocal(d);
  const a = parseIsoLocalNoon(isoLocalDate);
  const b = parseIsoLocalNoon(todayStr);
  if (!a || !b) return 0;
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/**
 * Parse de `YYYY-MM-DD` a `Date` local con anchor en mediodía (12:00:00
 * locales) — evita DST shifts si la operación atraviesa el cambio horario.
 * Privado del módulo (espejo del `parseIsoLocal` que vive en
 * `src/screens/app.js:1563-1571`; no se importa cross-layer).
 *
 * @param {string} isoDate
 * @returns {Date|null}
 */
function parseIsoLocalNoon(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0);
}
