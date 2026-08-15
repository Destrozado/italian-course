---
phase: 47
slug: traducci-n-bloque-art-culos-articoli-partitivos
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: 2026-08-15
updated: 2026-08-15
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
| T-47-05 | Repudiation — registro de auditoría que miente | campos de autoría y **override** de los pases | **high** | mitigate | **CERRADA en la re-auditoría 2026-08-15 (2.ª corrida).** Presente ya antes: el `by` es el modelo que respondió de verdad (`translation-validator.test.js:497-524`); el override no fabrica quórum. Añadido por CR-01 (`3443a00`) + WR-04 (`ce72315`), re-derivado por el auditor: la ruta silenciosa **lanza** (`applyPassToText` y `writeTranslationPass` sobre clon, fichero byte-intacto, cero residuos `.tmp-*`); la ruta legítima existe y **graba** el motivo en disco (`--adjudicar="…"` → clave `adjudicacion`); no se satisface en blanco (`''`, `'   '`, `'\t\n'`, no-string y las formas CLI degeneradas fallan cerrado); el guard está en **los cuatro** escritores (translation 739/740, ai 279/280, song 324/325, decoy 274/275) con fail-first que nombra el fichero; WR-04 muerde en las 4 direcciones probadas | closed |
| T-47-06 | Denial of Service — rate limits de los proveedores | cola de fallbacks | medium | mitigate | Bucle secuencial con `await` (concurrencia 1, `:447-450`); 429 honra `Retry-After` de cabecera y la forma de body de Gemini (`:312-318`); auto-fallback al siguiente modelo (`:522-525`); rama 5xx retriable (`:531`); timeout de socket 120 s (`:277`,`:285`); sin respuesta no se emite pase (`:542-543`) | closed |
| T-47-07 | Spoofing / Elevation of Privilege | n/a | low | accept | Scripts locales del propio autor sobre su máquina; sin servidor, sin sesiones, sin roles, sin multiusuario | closed |
| T-47-08 | Tampering — prompt injection (~86 corridas) | prompt compuesto | high | mitigate | Igual que T-47-01, verificado sobre la misma ruta de código | closed |
| T-47-09 | Information Disclosure — fuga de claves (~86 corridas) | `loadEnv()` / `callModel` | high | mitigate | Igual que T-47-02 | closed |
| T-47-10 | Tampering — corrupción por ~86 read-modify-write | `writePass` | high | mitigate | Igual que T-47-03. Corpus íntegro verificado: `articoli` 62/62, `partitivos` 48/48, todas `validated` | closed |
| T-47-11 | Repudiation — registro de auditoría que miente (~86 corridas) | campos de autoría y override | **high** | mitigate | **CERRADA — misma evidencia que T-47-05** | closed |
| T-47-12 | Denial of Service — rate limits | cola de fallbacks | medium | mitigate | Igual que T-47-06. Cola listada contra el proveedor antes de gastar llamadas (`47-02-SUMMARY.md:350-358`) | closed |
| T-47-13 | Spoofing / Elevation of Privilege | n/a | low | accept | Igual que T-47-07 | closed |
| T-47-14 | Tampering — prompt injection (~124 corridas) | prompt compuesto | high | mitigate | Igual que T-47-01 | closed |
| T-47-15 | Information Disclosure — fuga de claves (~124 corridas) | `loadEnv()` / `callModel` | high | mitigate | Igual que T-47-02 | closed |
| T-47-16 | Tampering — corrupción por ~124 read-modify-write | `writePass` | high | mitigate | Igual que T-47-03 | closed |
| T-47-17 | Tampering — dejar el gate de cobertura ciego al editarlo | región de `TRANSLATION_COVERAGE` | high | mitigate | Igual que T-47-04, con las TRES categorías | closed |
| T-47-18 | Repudiation — registro de auditoría que miente (~124 corridas) | campos de autoría y override | **high** | mitigate | **CERRADA — misma evidencia que T-47-05** | closed |
| T-47-19 | Denial of Service — rate limits | cola de fallbacks | medium | mitigate | Igual que T-47-06 | closed |
| T-47-20 | Spoofing / Elevation of Privilege | n/a | low | accept | Igual que T-47-07 | closed |
| T-47-21 | Tampering — una mutación queda committeada | ficheros de contenido y `run-validation-271.mjs` | high | mitigate | `git status --porcelain content/ scripts/ tests/ docs/` → vacío; sin residuos `.tmp-*`; `git diff --name-only da06087~1..HEAD -- src/` → vacío. Restauración fichero a fichero con re-verificación transcrita en `47-MUTACIONES-EVIDENCIA.md` | closed |
| T-47-22 | Repudiation — afirmar que el gate muerde sin haberlo observado | SUMMARY y `47-MUTACIONES-EVIDENCIA.md` | high | mitigate | Foto base con los dos exit codes 0 y fecha (`:60-72`, `2026-08-14T17:45:43Z`); cada mutación con línea literal transcrita y exit code observado; el fichero declara que el registro literal **es** la mitigación (`:13`) y que ninguna cifra se leyó (`:5`). Commits `6ac7e9f`, `bad754e` | closed |
| T-47-23 | Tampering — inventar un gate que el autor rechazó (escáner mecánico de acentos) | mutación de acentos | medium | mitigate | `git diff da06087~1..HEAD` sobre `tests/`+`scripts/`: cero líneas añadidas con `acento`/`tilde`/`accent`/`normalize`/`NFD` | closed |
| T-47-24 | Tampering — dejar el gate anti-ceguera deformado al restaurarlo | región del array de cobertura | high | mitigate | Igual que T-47-04; tras restaurar, gate verde con las TRES categorías y sin pares cruzados | closed |
| T-47-25 | Information Disclosure — fuga de secretos en las llamadas extra | `callModel` | medium | mitigate | Igual que T-47-02 | closed |
| T-47-26 | Spoofing / DoS / EoP — servidor estático del checkpoint | servidor local del checkpoint | low | accept | **Aceptación condicional CUMPLIDA y verificada de forma independiente.** El SUMMARY transcribe `ss -ltnp` sin listener y `curl → 000` en `:3000` y `:3999` (`47-04-SUMMARY.md:320-330`); re-comprobado por el orquestador y por el auditor: sin listener en 3000/3999/8000/5500/8080 | closed |
| T-47-27 | Tampering — el denominador de `TRAD-COV` encoge en silencio al borrar una variante | `run-validation-271.mjs`, `content/translation-coverage.lock.json` | **high** | mitigate | **CERRADA en la re-auditoría 2026-08-15 (2.ª corrida).** CR-02 (`5ce6513`) añade un ancla congelada y trackeada que el borrado no puede mover consigo. Mutación corrida **por el auditor** sobre clon: reporter → `FAIL (EL DENOMINADOR ENCOGIÓ — articoli: el ancla fija 62 variante(s) y en disco quedan 61)`, exit 1, suite 4→5 con GATE-03 rojo. **Control positivo:** una variante nueva sin traducir enrojece por COBERTURA (`missing=1`), no por el ancla — las dos causas no se funden. El ancla NO se deriva del corpus en tiempo de corrida, que era la trampa tautológica. Fail-closed: lock ausente/ilegible → exit 1; `categorias` vacío → exit 1. Ver también el WARNING del trinquete, abajo | closed |
| T-47-28 | Tampering — `*.json.tmp-*` no está en `.gitignore` | `validate-translation-pass.mjs` | medium | mitigate | **CERRADA en la re-auditoría 2026-08-15.** WR-06 (`5f9f239`): `git check-ignore -v --no-index` → `.gitignore:28:*.json.tmp-*` casa el temporal del escritor, y **ni el corpus ni el lock** quedan tragados. Direccionalidad comprobada en ambos sentidos — la aserción original salía verde-pero-vacía sin `--no-index` | closed |
| T-47-29 | Tampering — fidelidad de la entrada: 26 pases `validated` computados sobre un `italianoResuelto` que no coincide con el corpus | `fillGap` (arreglado en `93acfc7`); residuo en 13 traducciones ya validadas | low | accept | **PROPUESTA por el auditor, pendiente de decisión del autor.** El código está arreglado y con golden, así que la superficie no crece en las Phases 48-53; el residuo son 13 registros heredados (12 `articoli` + 1 `preposiciones`), 26 pases, **0 `incorrecta`**. Direcciones enumeradas en `47-REVIEW-FIX.md:93-99`. **No bloquea** (`low` < `block_on: high`) | open — below high threshold (non-blocking), pendiente del autor |

*Status: open · closed · open — below {block_on} threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above `workflow.security_block_on` (`high`) count toward `threats_open`*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

**`threats_open: 0`** tras la 2.ª corrida (2026-08-15). Las tres bloqueantes (T-47-05 / T-47-11 /
T-47-18) más T-47-27 y T-47-28 quedaron cerradas con evidencia **ejecutada** — reproducción y mutación
en clon por el auditor, no lectura del reporte del fixer. T-47-29 queda abierta pero es `low`, bajo el
umbral `high`, y no cuenta para el gate.

---

## Historial — las amenazas que estuvieron abiertas (1.ª corrida) y cómo se cerraron

> Lo que sigue es el diagnóstico de la **1.ª corrida** (2026-08-15), conservado como historia. Las
> tres se cerraron en la **2.ª corrida** del mismo día tras los arreglos `3443a00` (CR-01) y
> `ce72315` (WR-04); la evidencia de cierre está en la tabla del registro y en el Audit Trail.

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
**Cerrada por CR-02 (`5ce6513`) en la 2.ª corrida**, con la mutación ejecutada por el auditor.

---

## Avisos de la 2.ª corrida — no bloquean, conviene tenerlos presentes

### W-01 — El trinquete del ancla es asimétrico

Los tres ficheros nuevos no abren superficie: `scripts/lib/pass-guard.mjs` es una función pura sin I/O
ni red, `bump-translation-lock.mjs` es **dry-run por defecto**, y el lock está trackeado, no ignorado y
leído fail-closed.

Pero: el lock **no puede bumpearse en silencio** —siempre deja diff en git sobre un fichero trackeado,
con `emitido` fechado— **y sin embargo sí puede aflojarse hacia abajo**. Comprobado: `bump --write`
sobre el clon con la variante borrada bajó `articoli: 62 → 61` y el reporter volvió a **verde**
(exit 0). La herramienta **avisa** (`⚠ el disco tiene MENOS variantes que el lock`) pero **no se niega
y no exige motivo escrito**.

El rastro es real, pero es **más débil que la doctrina que CR-01 acaba de establecer**: retirar un pase
disidente cuesta un motivo grabado en el JSON; soltar el ancla de cobertura cuesta solo `--write`.
Encaja con el modelo de confianza del repo (autor único, local), por eso no bloquea — pero es una
asimetría deliberada, no un descuido, y conviene que quede escrita.

**Decisión del autor, 2026-08-15: el ancla se queda.** Su razón acota además para qué sirve y para qué
no: *en este milestone la cantidad de ejercicios no cambia — solo se añade una clave (`translationES`)
a cada variante ya existente.* De ahí se sigue algo que refuerza el ancla en vez de debilitarla:

- Los valores por categoría, una vez emitidos, **no deben variar nunca** dentro del milestone.
- El lock solo **crece**, al enganchar una categoría nueva (una entrada por fase, 48 → 53).
- Por tanto **un número que cambia es siempre un bug**, jamás mantenimiento rutinario. El caso
  «aflojar hacia abajo» que W-01 describe no tiene uso legítimo en este milestone.

Queda como deuda menor y opcional: convertir `bump-translation-lock.mjs` en estrictamente aditivo
—permitir añadir categorías, negarse a bajar un valor existente sin motivo escrito— cerraría la
asimetría sin coste de fricción, precisamente porque bajar un valor no es una operación que este
milestone necesite. No se hace ahora: no bloquea y nadie lo ha pedido.

### W-02 — `adjudicacion` como marcador forense es más débil de lo que parece

`if (ADJUDICAR) pass.adjudicacion = ADJUDICAR` marca **cualquier** pase cuando se pasa la bandera, no
solo el que desplaza un `incorrecta`. La presencia del campo no prueba por sí sola que hubo retirada.
No reabre la ruta silenciosa —que es lo que la amenaza persigue— pero debilita `adjudicacion` como
evidencia de auditoría.

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
| 2026-08-15 (1.ª corrida) | 28 | 23 | 5 (3 bloqueantes + T-47-27 + T-47-28) | gsd-security-auditor (opus) |
| 2026-08-15 (2.ª corrida, tras los 8 fixes) | 29 | 28 | 1 (T-47-29, `low`, bajo umbral) | gsd-security-auditor (opus) |

Notas de la 2.ª corrida:

- Verificación **por ejecución**, por encima de la profundidad grep que ASVS L1 exigiría, en las tres
  amenazas re-auditadas: el escenario CR-01 reproducido contra `applyPassToText` y contra la ruta
  completa a disco `writeTranslationPass`; la mutación de borrado de T-47-27 corrida por el auditor
  sobre clon, con control positivo para separar las dos causas de rojo; la direccionalidad de T-47-28
  comprobada en ambos sentidos.
- **No se aceptó el reporte del fixer:** el auditor re-derivó cada cifra. Corrigió su propio primer
  barrido de WR-01 (heurístico, daba 14) ejecutando el `fillGap` anterior de verdad
  (`git show 93acfc7~1`) → **13 traducciones / 26 pases / 0 `incorrecta`**, confirmando la cuenta del
  fixer.
- Re-chequeo puntual de las 23 previamente cerradas, porque los arreglos tocaron los escritores y
  `run-validation-271.mjs`: `composePrompt`/`buildDataBlock` sin una línea cambiada en
  `04636a3..HEAD`; clave solo en cabecera y barrido `sk-…`/`AIza…` → 0; `withFileLock` +
  `verificarPostcondicion` + temp/`renameSync` no solo intactos sino **ejercitados** (el throw del
  guard dejó el fichero byte-intacto sin residuo temporal); `count-arrays-lockstep` 66/66; diff vacío
  en `content/exercises/`, `src/` y `docs/`.
- T-47-29 se registra **sin marcar como aceptada**: su disposición `accept` requiere la firma del
  autor, que no se ha dado. Queda `open` bajo umbral hasta que el autor decida sobre las 13.

Notas de la 1.ª corrida:

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
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-08-15

Pendiente del autor, sin bloquear el gate:

1. **T-47-29** — decidir sobre las 13 traducciones cuyos 26 pases se computaron con entrada
   defectuosa (12 `articoli` + 1 `preposiciones`/Phase 46 cerrada, 0 `incorrecta`). Re-validar, o
   aceptar el riesgo por escrito y firmarlo en el Accepted Risks Log.
2. **W-01** — si la asimetría del trinquete del ancla debe corregirse (exigir motivo escrito para
   aflojarlo hacia abajo, como CR-01 exige para retirar un pase disidente) o aceptarse tal cual.
