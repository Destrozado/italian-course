---
phase: 46
slug: pipeline-de-traducci-n-end-to-end-piloto-preposiciones
status: secured
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: 2026-08-14
---

# Phase 46 — Security

> Contrato de seguridad de la fase: registro de amenazas, riesgos aceptados y audit trail.
> Registro autorado en **plan-time** (`register_authored_at_plan_time: true`): los 5 planes traen su
> bloque `<threat_model>`. El auditor verificó **que las mitigaciones existen**, no buscó amenazas
> nuevas.

---

## Contexto que define qué es superficie real

Web **estática de un solo usuario**: sin servidor, sin backend, sin sesiones, sin roles, sin
multi-usuario y sin datos de terceros. Corre en local (`npx serve` en localhost) y persiste en
`localStorage`. La mayoría de los controles ASVS de aplicación web con autenticación **no tienen
sujeto aquí**, y padearlos sería ceremonial. Lo que sí es superficie en esta fase:

1. **Inyección de contenido en el DOM** — el texto de traducción se pinta con `x-text`, nunca con el
   atributo de HTML crudo (T-02-01). Es el único ítem que sería `high` si se violara.
2. **Prompt injection** — el texto viaja a DeepSeek y Gemini; el guard §6 heredado de
   `docs/SONG-VALIDATION-PROMPT.md` debe seguir presente y preceder al bloque de datos.
3. **Manejo de secretos** — claves desde `.env`, nunca logueadas ni escritas en un registro de pase.
4. **Escritura no confiable** — read-modify-write sobre JSON de contenido bajo `withFileLock`.
5. **Integridad del registro de validación** — el `verdict` validado contra su enum antes de persistir.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Navegador ↔ contenido en disco | `fetch` de los JSON de `content/` al arrancar; una sola vez por carga | Definiciones de ejercicio y traducciones (no sensible) |
| Navegador ↔ `localStorage` | Progreso del autor; la fase **no escribe** state (SCH-03, sin migración) | Progreso, contadores (no sensible, local) |
| `scripts/validate-translation-pass.mjs` ↔ DeepSeek / Gemini | HTTPS de salida a dos hostnames **hardcodeados** (sin hostname controlable → sin SSRF) | Texto de traducción + prompt de criterios; clave en header |
| Script ↔ corpus en disco | Read-modify-write bajo `withFileLock`, temp + `rename` atómico | `translationES.validation.passes[]` |

---

## Threat Register

27 amenazas: **13 `high`** (mitigate), **6 `medium`** (mitigate), **8 `low`** (accept).
Cerradas **27/27**. Evidencia ejecutada, no leída — el proyecto trata «leí el código y parece
correcto» como no-verificación (lección de la Phase 45: cinco gates vacuos, los cinco cazados solo al
correr la mutación).

| Threat ID | Category | Severity | Disposition | Mitigación / evidencia | Status |
|-----------|----------|----------|-------------|------------------------|--------|
| T-46-01 | Tampering / DOM injection | high | mitigate | Cero atributos de HTML crudo (`grep` → exit 1); las 9 menciones son prosa de comentario. Ambos nodos usan `x-text` (`index.html:667-669`, `:1341-1343`). Mutación: `x-text`→HTML crudo ⇒ V4 subtests 1-2 ROJOS | closed |
| T-46-02 | Info disclosure / leak pre-respuesta | high | mitigate | Doble guard `sessionFeedback !== null && …translationES?.text` (`index.html:667`). Mutación: quitar la mitad de estado ⇒ V5 subtests 3-4 ROJOS. Cegar el escáner ⇒ 6 fallos por no-vacuidad | closed |
| T-46-03 | Tampering / regresión del motor | medium | mitigate | `git diff 19f41a9..HEAD -- src/domain/ src/screens/app.js` vacío (contra la baseline, **no** contra HEAD). V8 ancla al pre-fase derivado de la historia con guard anti-colapso | closed |
| T-46-04 | DoS | low | accept | Aceptación documentada y **razonable y verificada**: la fase no añade `createServer`/`.listen(` | closed |
| T-46-05 | Spoofing / Repudiation / EoP | low | accept | Documentada; no hay auth, sesiones ni roles en el proyecto. **Razonable** | closed |
| T-46-06 | Tampering / prompt injection | high | mitigate | §6 presente y reescrito con los campos de este payload; verificado que **viaja en cada llamada y precede al DATA**. Mutación: borrar §6 ⇒ suite ROJA. Ver WARNING 1 | closed |
| T-46-07 | Info disclosure / secretos | high | mitigate | Clave solo en header, nunca en URL/query. `grep` de `console.*` con key/bearer/auth → exit 1. Pase escrito = exactamente `['by','date','verdict','concerns']` (comprobado escribiendo de verdad). `.env` en `.gitignore` y ausente de `git ls-files` | closed |
| T-46-08 | Tampering / corrupción en escritura | high | mitigate | Todo el RMW dentro de `withFileLock`; **CR-02 presente**: temp + `rename` y post-condición de JSON válido llamada ANTES del primer write. Caso corruptor ejecutado: throw, fichero intacto, cero temps huérfanos. Ver WARNING 2 | closed |
| T-46-09 | Tampering / respuesta como código | medium | mitigate | `extractJsonBlock` = `JSON.parse` del último bloque cercado. `grep -E 'eval\(|new Function|node:vm'` → exit 1. Solo `verdict` y `concerns` llegan al disco | closed |
| T-46-10 | Repudiation / `by` que miente | medium | mitigate | Ejecutado con caller inyectado: 429 en el primario ⇒ `by = gemini-3.5-flash-lite`, **no** el pinneado | closed |
| T-46-11 | DoS proveedores | low | accept | Documentada y **sustanciada**: `Retry-After`, `maxRetries = 3`, auto-fallback; «no daña el corpus» lo respalda la atomicidad de T-46-08 | closed |
| T-46-12 | Spoofing / EoP | low | accept | Documentada; script local sin servidor. **Razonable** | closed |
| T-46-13 | Repudiation / gate vacuo | high | mitigate | Cláusula de no-vacuidad **primero** y fail-loud nombrado. Mutación: 0 variantes MC ⇒ `FAIL (AUSENCIA DE DATOS)`, exit 1 — un `0/0` **no** pasa en verde. Quitar una `validation` ⇒ `FAIL (95/96)`, exit 1 | closed |
| **T-46-14** | **Tampering / umbral ablandado silenciosamente** | **high** | **mitigate** | **Abierta en la primera pasada del auditor y CERRADA el 2026-08-14.** La mitigación estaba declarada en DOS mitades y solo existía una: el veredicto era igualdad de enteros (presente y mordiendo), pero la «aserción de fuente sobre la región del sub-gate» **no existía** (`grep` en `tests/` → cero) y el SUMMARY la afirmaba como hecha. Candado escrito (bloque 9 de `tests/count-arrays-lockstep.test.js`, commit `632a190`): región del veredicto derivada del fuente, no-vacuidad primero, y **dos** aserciones porque ninguna ve a la otra — (a) `toFixed`/`Math.round`/decimal/división, (b) comparación laxa `>=`/`>`. Mutaciones M-1/M-2/M-3 con rojo observado; M-1 re-verificada de forma independiente por el orquestador | closed |
| T-46-15 | Info disclosure / reporter | low | accept | Documentada y **verificada**: imports del reporter solo `node:fs/url/path` + módulo local — cero red, cero `.env`, no imprime texto de contenido | closed |
| T-46-16 | Spoofing / DoS / EoP | low | accept | Documentada y consistente. **Razonable** | closed |
| T-46-17 | Tampering / prompt injection ×192 | high | mitigate | Misma evidencia que T-46-06. Ver WARNING 1 | closed |
| T-46-18 | Info disclosure ×192 | high | mitigate | T-46-07 más barrido del corpus real por patrones de clave → **0** | closed |
| T-46-19 | Tampering / corrupción ×192 | high | mitigate | T-46-08 más comprobación estructural del lote: con `translationES` neutralizado a ambos lados, `19f41a9` y `HEAD` del corpus son **byte-idénticos** ⇒ cero cambios fuera de `translationES` | closed |
| T-46-20 | Repudiation / registro que miente | high | mitigate | Sobre disco: `by` = `{deepseek-chat: 96, gemini-3.5-flash-lite: 96}`, `override:true` = **0**, `by:"autor"` = **0**, cero claves extra. Más la prueba de fallback de T-46-10 | closed |
| T-46-21 | DoS / rate limits | medium | mitigate | `Retry-After` del header y del body, 3 reintentos, auto-fallback verificado por comportamiento | closed |
| T-46-22 | Spoofing / EoP | low | accept | Documentada. **Razonable** | closed |
| T-46-23 | Tampering / mutación committeada | high | mitigate | Corpus ausente de `git status --porcelain`; `git diff HEAD` del corpus vacío; md5 disco == md5 HEAD; cero ficheros temporales. Reporter exit 0. Ver WARNING 3 sobre el sub-criterio «suite exit 0» | closed |
| T-46-24 | Repudiation / afirmar sin observar | high | mitigate | `46-05-MUTACIONES-EVIDENCIA.md`: 10 exit codes registrados con líneas literales transcritas y fechadas. El auditor **reprodujo sus dos cifras clave**. El doc declara honestamente el exit 1 de la suite en vez de maquillarlo | closed |
| T-46-25 | Tampering / gate que el autor rechazó | medium | mitigate | Cero escáner mecánico de acentos añadido: los hits son un round-trip UTF-8 y el congelado de un literal único, no un escáner de corpus. La autoridad sigue en el quórum (`s4_acentos`) | closed |
| T-46-26 | Info disclosure / 2 llamadas extra | medium | mitigate | Mismo camino verificado en T-46-07/18 | closed |
| T-46-27 | Spoofing / DoS / EoP | low | accept | Documentada y **verificada**: sin listener ni dependencia nueva; sin `package.json` ni `node_modules`; egress solo a dos hostnames hardcodeados | closed |

*Status: open · closed · open — below `high` threshold (non-blocking)*
*Severity: critical > high > medium > low — solo las OPEN a partir de `high` cuentan para `threats_open`*
*Disposition: mitigate (implementación requerida) · accept (riesgo documentado) · transfer (tercero)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-46-01 | T-46-04, T-46-16, T-46-27 | DoS sin sujeto: app estática, un solo usuario, local. La fase no añade listener, servidor ni dependencia | autor (plan-time) | 2026-08-13 |
| R-46-02 | T-46-05, T-46-12, T-46-22 | Spoofing / Repudiation / EoP sin sujeto: no hay auth, sesiones, roles ni multi-usuario | autor (plan-time) | 2026-08-13 |
| R-46-03 | T-46-11 | DoS de los proveedores externos: mitigado en lo alcanzable (`Retry-After`, 3 reintentos, auto-fallback) y sin daño al corpus por la escritura atómica | autor (plan-time) | 2026-08-13 |
| R-46-04 | T-46-15 | El reporter no hace red ni lee `.env` ni imprime contenido; su exposición es la consola del autor en su propia máquina | autor (plan-time) | 2026-08-13 |

*Los riesgos aceptados no reaparecen en auditorías futuras.*

---

## WARNINGs (registrados, no bloqueantes)

1. **Escape de la valla del prompt** (residual de T-46-06/17). `JSON.stringify` **no escapa
   backticks**, así que un `translationES.text` con ` ``` ` puede romper la valla del bloque de datos.
   **Hoy inerte**: 0 de las 96 traducciones llevan backtick, y el schema rechaza `___` y saltos de
   línea. Registrado en `WINDOWS.md` id 29. **Conviene subirlo de Info a mitigación antes de que las
   Phases 47-53 añadan 722 traducciones** (valla más larga, o rechazar ` ``` ` en el bloque de datos).
2. **La post-condición de CR-02 no tiene candado de regresión.** Comentarla deja la suite en verde: el
   control existe y funciona (verificado por comportamiento), pero nada impide que desaparezca. Mismo
   patrón que T-46-14, un nivel más abajo.
3. **La suite sale exit 1 por deuda heredada**, no por esta fase: 4 subtests de
   `tests/requirements-traceability.test.js`, rojos idénticos en la baseline `19f41a9` (allí
   1178/1182). Consecuencia de registro: el sub-criterio «suite exit 0» de T-46-23 nunca se cumplió —
   declarado honestamente, no oculto.
4. **`46-01-SUMMARY.md` y `46-02-SUMMARY.md` no tienen sección `## Threat Flags`** (03 y 04 sí; 05 los
   referencia en prosa). El auditor lo cubrió verificando los diffs directamente.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-14 | 27 | 26 | 1 (T-46-14, high) | gsd-security-auditor (ASVS L1, block_on: high) |
| 2026-08-14 | 27 | 27 | 0 | orquestador — T-46-14 cerrada con el candado `632a190`; M-1 re-verificada de forma independiente |

**Nota de honestidad sobre esta auditoría.** T-46-14 **no** se cerró por «el control está bien hoy».
La amenaza es *ablandamiento silencioso*, y lo que la mitiga es el candado de regresión, no el estado
actual del operador: sin la aserción, cambiar `=== 0` por `>= 0` no ponía nada en rojo (la suite se
quedaba en 1325/4, exactamente la baseline). Además, la fila de T-46-14 en `46-03-SUMMARY.md`
**afirmaba que la verificación se había hecho** — falso, y de la misma especie que el CR-01 de la
Phase 44 que este proyecto ya pagó. Está **retractada por escrito y fechada** en ese SUMMARY, no
borrada ni reescrita como si siempre hubiera sido correcta.

Efecto colateral favorable del candado: cubre los **6** veredictos del reporter, no solo `tradPass`,
así que un `val06Pass` ablandado en una fase futura también se cazará.

---

## Sign-Off

- [x] Todas las amenazas tienen disposición (mitigate / accept / transfer) — 19 mitigate, 8 accept
- [x] Riesgos aceptados documentados en el Accepted Risks Log (R-46-01 … R-46-04)
- [x] `threats_open: 0` confirmado
- [x] La única amenaza abierta de la primera pasada (T-46-14) cerrada con candado y verificada por mutación
- [x] Motor byte-intacto contra la baseline pre-fase `19f41a9`, no contra `HEAD`
