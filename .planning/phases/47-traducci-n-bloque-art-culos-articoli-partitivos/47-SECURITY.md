---
phase: 47
slug: traducci-n-bloque-art-culos-articoli-partitivos
status: blocked
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 3
asvs_level: 1
created: 2026-08-15
---

# Phase 47 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

Registro autorado en tiempo de plan (`register_authored_at_plan_time: true`): las cuatro PLAN.md
llevan su bloque `<threat_model>`, 26 amenazas en total (T-47-01 … T-47-26). Ningún SUMMARY declara
sección `## Threat Flags` — confirmado por `grep` sobre los cuatro.

**No se aplicó el short-circuit de ASVS L1** pese a que el registro venía de tiempo de plan: el code
review (`47-REVIEW.md`) había levantado, minutos antes, un BLOCKER que cae directamente sobre las
amenazas de Repudiation del registro. Clasificar a profundidad grep habría certificado en verde una
mitigación que el propio review demostraba incompleta.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Máquina del autor → APIs de terceros (Gemini, DeepSeek) | Los scripts de validación envían el ejercicio y su traducción a dos vendors externos para el quórum cross-vendor | Texto del corpus (italiano + español, sin datos personales) saliendo; veredicto + concerns entrando. Clave de API en cabecera |
| `.env` → proceso de validación | `loadEnv()` lee las claves de los dos proveedores | Secretos: `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`. `.env` ignorado en git (`.gitignore:8`); solo `.env.example` trackeado |
| Salida del modelo → corpus JSON en disco | El veredicto de un tercero se escribe dentro de `content/exercises/*.json` vía `writePass` | Datos no confiables (`verdict`, `concerns`) escritos en el fichero que gobierna los gates del proyecto |
| Navegador del autor → `localStorage` | La app estática lee el corpus y persiste el progreso | Sin servidor, sin sesiones, sin roles, sin multiusuario |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-47-01 | Tampering — prompt injection vía contenido del corpus | prompt compuesto enviado a los dos vendors | high | mitigate | Guard §6 de `docs/TRANSLATION-VALIDATION-PROMPT.md:531-550` declara `prompt`, `options`, `correctIndex`, `italianoResuelto` y `translationES.text` como DATA a evaluar, nunca como instrucciones; cubre explícitamente el imperativo (`Vieni qui!`). `composePrompt` (`validate-translation-pass.mjs:266-274`) adjunta el bloque DATA **después** del guard, en cada llamada | closed |
| T-47-02 | Information Disclosure — fuga de claves | `loadEnv()` / `callModel` | high | mitigate | Clave solo en cabecera (`:300` `x-goog-api-key`, `:307` `Authorization: Bearer`), nunca en URL. Ningún `console.*` la imprime; las ramas de error solo hacen `res.body.slice(...)` (`:319-320`, `:329`). Pase escrito = exactamente `{by,date,verdict,concerns}` (`:489-494`). Barrido de patrones `sk-…`/`AIza…` sobre `content/`, `docs/`, `scripts/`, `tests/`, `.planning/phases/47*/` → 0 | closed |
| T-47-03 | Tampering — corrupción del corpus por read-modify-write | `writePass` sobre variante anidada | high | mitigate | `withFileLock` (`:77`) envuelve el read-modify-write completo (`:813-830`). `locateVariantTranslation` (`:636-664`) re-estrecha slot → `variants[k]` → `translationES` y la ramificación UPDATE/INSERT ocurre sobre el slice ya estrechado (`:678-679`). `verificarPostcondicion` (`:756-799`) exige parseo, identidad exacta del bloque y cero contaminación antes de tocar disco; escritura atómica temp+`rename` (`:818-821`) | closed |
| T-47-04 | Tampering — dejar el gate de cobertura ciego al editarlo | región de `TRANSLATION_COVERAGE` | high | mitigate | GATE-02 (`count-arrays-lockstep.test.js:1355-1400`) deriva el conjunto de referencia del disco vía `categoriasDeclaradasCubiertas()` (`:386`) — corrido 64/64, tres categorías. Prohibición de prosa con golden-negativos (`:591`, `:1274-1284`). Los tres `expected` derivados con `mcVariantCountOf` y Σ derivada (`run-validation-271.mjs:408-415`). **Mordida observada por mutación** (`47-MUTACIONES-EVIDENCIA.md:401,:444`). Cerrada **para el vector declarado** (ceguera al editar/restaurar la región); ver T-47-27 para el vector nuevo | closed |
| T-47-05 | Repudiation — registro de auditoría que miente | campos de autoría y **override** de los pases | **high** | mitigate | **PARCIAL — ver «Amenazas abiertas» abajo.** Presente: el `by` es el modelo que respondió de verdad, probado por comportamiento (`translation-validator.test.js:497-524`); el override no fabrica quórum (`screen-translation.test.js:539-543`). Ausente: la rama UPDATE permite limpiar un `disputed` sin override y sin rastro, y nada exige motivo escrito en un override de traducción | **open** |
| T-47-06 | Denial of Service — rate limits de los proveedores | cola de fallbacks | medium | mitigate | Bucle secuencial con `await` (concurrencia 1, `:447-450`); 429 honra `Retry-After` de cabecera y la forma de body de Gemini (`:312-318`); auto-fallback al siguiente modelo (`:522-525`); rama 5xx retriable (`:531`); timeout de socket 120 s (`:277`,`:285`); sin respuesta no se emite pase (`:542-543`) | closed |
| T-47-07 | Spoofing / Elevation of Privilege | n/a | low | accept | Scripts locales del propio autor sobre su máquina; sin servidor, sin sesiones, sin roles, sin multiusuario | closed |
| T-47-08 | Tampering — prompt injection (~86 corridas) | prompt compuesto | high | mitigate | Igual que T-47-01, verificado sobre la misma ruta de código | closed |
| T-47-09 | Information Disclosure — fuga de claves (~86 corridas) | `loadEnv()` / `callModel` | high | mitigate | Igual que T-47-02 | closed |
| T-47-10 | Tampering — corrupción por ~86 read-modify-write | `writePass` | high | mitigate | Igual que T-47-03. Corpus íntegro verificado: `articoli` 62/62, `partitivos` 48/48, todas `validated` | closed |
| T-47-11 | Repudiation — registro de auditoría que miente (~86 corridas) | campos de autoría y override | **high** | mitigate | **PARCIAL — misma causa que T-47-05** | **open** |
| T-47-12 | Denial of Service — rate limits | cola de fallbacks | medium | mitigate | Igual que T-47-06. Cola listada contra el proveedor antes de gastar llamadas (`47-02-SUMMARY.md:350-358`) | closed |
| T-47-13 | Spoofing / Elevation of Privilege | n/a | low | accept | Igual que T-47-07 | closed |
| T-47-14 | Tampering — prompt injection (~124 corridas) | prompt compuesto | high | mitigate | Igual que T-47-01 | closed |
| T-47-15 | Information Disclosure — fuga de claves (~124 corridas) | `loadEnv()` / `callModel` | high | mitigate | Igual que T-47-02 | closed |
| T-47-16 | Tampering — corrupción por ~124 read-modify-write | `writePass` | high | mitigate | Igual que T-47-03 | closed |
| T-47-17 | Tampering — dejar el gate de cobertura ciego al editarlo | región de `TRANSLATION_COVERAGE` | high | mitigate | Igual que T-47-04, con las TRES categorías | closed |
| T-47-18 | Repudiation — registro de auditoría que miente (~124 corridas) | campos de autoría y override | **high** | mitigate | **PARCIAL — misma causa que T-47-05** | **open** |
| T-47-19 | Denial of Service — rate limits | cola de fallbacks | medium | mitigate | Igual que T-47-06 | closed |
| T-47-20 | Spoofing / Elevation of Privilege | n/a | low | accept | Igual que T-47-07 | closed |
| T-47-21 | Tampering — una mutación queda committeada | ficheros de contenido y `run-validation-271.mjs` | high | mitigate | `git status --porcelain content/ scripts/ tests/ docs/` → vacío; sin residuos `.tmp-*`; `git diff --name-only da06087~1..HEAD -- src/` → vacío. Restauración fichero a fichero con re-verificación transcrita en `47-MUTACIONES-EVIDENCIA.md` | closed |
| T-47-22 | Repudiation — afirmar que el gate muerde sin haberlo observado | SUMMARY y `47-MUTACIONES-EVIDENCIA.md` | high | mitigate | Foto base con los dos exit codes 0 y fecha (`:60-72`, `2026-08-14T17:45:43Z`); cada mutación con línea literal transcrita y exit code observado; el fichero declara que el registro literal **es** la mitigación (`:13`) y que ninguna cifra se leyó (`:5`). Commits `6ac7e9f`, `bad754e` | closed |
| T-47-23 | Tampering — inventar un gate que el autor rechazó (escáner mecánico de acentos) | mutación de acentos | medium | mitigate | `git diff da06087~1..HEAD` sobre `tests/`+`scripts/`: cero líneas añadidas con `acento`/`tilde`/`accent`/`normalize`/`NFD` | closed |
| T-47-24 | Tampering — dejar el gate anti-ceguera deformado al restaurarlo | región del array de cobertura | high | mitigate | Igual que T-47-04; tras restaurar, gate verde con las TRES categorías y sin pares cruzados | closed |
| T-47-25 | Information Disclosure — fuga de secretos en las llamadas extra | `callModel` | medium | mitigate | Igual que T-47-02 | closed |
| T-47-26 | Spoofing / DoS / EoP — servidor estático del checkpoint | servidor local del checkpoint | low | accept | **Aceptación condicional CUMPLIDA y verificada de forma independiente.** El SUMMARY transcribe `ss -ltnp` sin listener y `curl → 000` en `:3000` y `:3999` (`47-04-SUMMARY.md:320-330`); re-comprobado por el orquestador y por el auditor: sin listener en 3000/3999/8000/5500/8080 | closed |
| T-47-27 | Tampering — el denominador de `TRAD-COV` encoge en silencio al borrar una variante | `run-validation-271.mjs:372-396, 407-415, 921-926` | **high** | mitigate | **NUEVA, sin mitigación.** `expected`, `surfaces` y `validated` se derivan del mismo fichero en la misma corrida, así que borrar una variante traducida y validada mueve los tres sumandos a la vez y las dos igualdades siguen cuadrando: `PASS (205/205)`, exit 0, suite sin mordida. Dada de alta por decisión del autor (2026-08-15) tras el hallazgo CR-02 del code review | **open — registrada, a resolver antes de Phase 48** |
| T-47-28 | Tampering — `*.json.tmp-*` no está en `.gitignore` | `validate-translation-pass.mjs:818` | medium | mitigate | **NUEVA, sin mitigación.** El temporal de la escritura atómica se crea junto al corpus y no está ignorado; un `git add -A` tras una corrida muerta committearía una copia completa y desfasada del corpus. Misma familia que T-47-21, que queda `closed` porque el árbol hoy está limpio y sin `.tmp-*` — pero la superficie no estaba registrada | open — below high threshold (non-blocking) |

*Status: open · closed · open — below {block_on} threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above `workflow.security_block_on` (`high`) count toward `threats_open`*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

**`threats_open: 3`** — T-47-05, T-47-11, T-47-18. T-47-27 es `high` y está abierta, pero se da de alta
en esta misma auditoría como amenaza nueva y no forma parte del recuento de la corrida que la descubre;
entra en el gate de la Phase 48. T-47-28 es `medium`, bajo el umbral.

---

## Amenazas abiertas — detalle

### T-47-05 / T-47-11 / T-47-18 — Repudiation: el registro de auditoría puede mentir

**La mitigación prometida:** «El autor registrado es el modelo que de verdad respondió, auto-fallback
incluido, verificado por script sobre el disco. Un override sin motivo escrito, o que fabrique quórum,
es fallo del criterio de aceptación.»

**Lo que sí está** (verificado, no leído):

- El `by` registrado **es** el modelo que respondió: `validate-translation-pass.mjs:489-495` escribe
  `by: model` dentro del bucle de cola, y hay prueba **por comportamiento** en
  `tests/translation-validator.test.js:497-524` — un 429 simulado del primario da
  `pass.by === 'modelo-de-fallback'` y el bloque en disco igual.
- El override **no fabrica quórum**: `tests/screen-translation.test.js:539-543` exige ≥1 `correcta` de
  un modelo, y `translation-validator.test.js:640-656` cubre `deriveStatus`.

**Lo que falta — 1: existe una ruta que limpia un `disputed` sin override y sin rastro.**
Reproducida por el auditor sin llamadas de red, invocando la función pura exportada `applyPassToText`
sobre un documento sintético, sin tocar ningún fichero del árbol:

```
1) tras el incorrecta      -> status: disputed  | gemini-3.5-flash-lite:correcta, deepseek-chat:incorrecta
2) re-corriendo el MISMO   -> status: validated | gemini-3.5-flash-lite:correcta, deepseek-chat:correcta
   ¿queda rastro del incorrecta? false
   ¿hay override:true?        false
```

La causa es literal, en `scripts/validate-translation-pass.mjs:688`:

```js
const passes = (Array.isArray(cur.passes) ? cur.passes : []).filter((p) => p.by !== pass.by);
```

El filtro corre **antes** de `deriveStatus`, y `deriveStatus` solo aplica el sticky si el `incorrecta`
**sigue en el array** (`src/data/validation-state.js:68`). Con `--temp=0.2` el veredicto del mismo
modelo no es determinista, así que es una ruta de re-tirar el dado hasta el verde que **puentea** el
mecanismo `by:"autor"` + `override:true` + motivo y es **más silenciosa** que él. Ningún gate la ve:
`VAL-09` y `TRAD-COV` comparan escrito-vs-derivado, y aquí los dos lados se mueven juntos. Ningún test
la cubre.

El mismo filtro está en `validate-ai-pass.mjs:271`, `validate-song-pass.mjs:316` y
`validate-decoy-pass.mjs:269`.

**Lo que falta — 2: nada exige motivo escrito en un override de TRADUCCIÓN.**
`tests/screen-translation.test.js:516-551` no lo comprueba. La guarda equivalente sí existe para las
validaciones de slot (`content-fare-cond-imperativo.test.js:1615-1617`,
`content-fare-congiuntivo.test.js:1356-1359`, `content-fare-indefiniti.test.js:2102`) y no se replicó
para la unidad nueva. La frase de la mitigación hoy es solo un criterio manual.

**Contexto estructural relacionado (no contado como hallazgo):** los 62 pases `deepseek-chat`
retirados de `articoli` en `264dd19` — decisión del autor, adjudicada y registrada en `WINDOWS` id 38 —
incluían **8 `incorrecta`** (`git show 264dd19 | grep "^-.*incorrecta" | wc -l` → 8). El JSON en disco
ya no muestra esa disidencia: vive solo en git, el ledger y el SUMMARY. **No hay invariante
append-only en ninguna parte**, así que el código no distingue una retirada deliberada de un borrado
accidental.

**Remediación requerida antes de cerrar:**

1. Guarda append-only / de adjudicación en la rama UPDATE de `validate-translation-pass.mjs`, replicada
   en `validate-ai-pass.mjs`, `validate-song-pass.mjs` y `validate-decoy-pass.mjs`.
2. Exigencia de motivo escrito en el override de traducción, al nivel de las guardas de slot.
3. Ambas verificadas con golden **fail-first** y mutación en clon — un fix propuesto es hipótesis, no
   evidencia (`reviewer_fix_needs_same_mutation`).

### T-47-27 — el denominador de `TRAD-COV` encoge en silencio

Alta por decisión del autor (2026-08-15), lectura estrecha: T-47-04 / T-47-17 / T-47-24 están
redactadas y acotadas al vector «dejar el gate ciego **al editar / restaurar la región**», y ese vector
está cerrado y verificado por mutación. CR-02 no requiere tocar la región — es un vector nuevo, a
granularidad de variante. La mutación de esta fase vació `passes` (que sí enrojece) y nunca probó el
borrado de variante.

Debe resolverse antes de las Phases 48-53, donde entran ~720 traducciones.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-47-01 | T-47-07 / T-47-13 / T-47-20 | Scripts locales del propio autor sobre su máquina; sin servidor, sin sesiones, sin roles, sin multiusuario. Sin sujeto real de Spoofing/EoP. Precedente de formato: `46-SECURITY.md:60-61` | autor | 2026-08-14 |
| AR-47-02 | T-47-26 | Servidor estático local del checkpoint, escuchando solo en la interfaz local. **Aceptación condicionada a cerrarlo al terminar** — condición cumplida y verificada de forma independiente por el auditor y por el orquestador | autor | 2026-08-14 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-15 | 28 | 23 | 5 (3 bloqueantes + T-47-27 diferida a Phase 48 + T-47-28 bajo umbral) | gsd-security-auditor (opus) |

Notas de la corrida:

- Registro autorado en tiempo de plan; **short-circuit L1 no aplicado** a propósito, por la evidencia
  del code review sobre las amenazas de Repudiation.
- El auditor no modificó ningún fichero de implementación; CR-01 se reprodujo sobre un documento
  sintético en memoria. Árbol verificado limpio (`git status --porcelain` → solo el
  `.planning/research/.cache/` pre-existente sin trackear).
- Línea base, no hallazgo: la suite da 4 fallos pre-existentes de `requirements-traceability`
  (`WINDOWS` id 17), sin regresiones nuevas.
- `IN-01` del code review (`loadEnv` no recorta whitespace final, `:124-125`) es un problema de
  diagnóstico (401 en vez de mensaje claro), **no** de divulgación: la clave sigue viajando solo en
  cabecera y sin loguearse. No abre ninguna amenaza del registro.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [ ] `threats_open: 0` confirmed — **NO: `threats_open: 3`**
- [ ] `status: verified` set in frontmatter — **NO: `status: blocked`**

**Approval:** pending — bloqueado por T-47-05 / T-47-11 / T-47-18
