---
phase: 48
slug: traducci-n-paradigma-fare-4-categor-as
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: 2026-08-16
updated: 2026-08-16
---

# Phase 48 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

Registro autorado en tiempo de plan (`register_authored_at_plan_time: true`): las cinco PLAN.md
llevan su bloque `<threat_model>`, **42 amenazas** en total (T-48-01 … T-48-42), más una descubierta
en auditoría (T-48-43). Ningún SUMMARY declara sección `## Threat Flags` — las cuatro primeras usan
`## Amenazas`; **`48-05-SUMMARY.md` no lleva sección de amenazas en absoluto**, ver warning al pie.

**Corrección de contabilidad del registro.** El brief de la auditoría afirmaba *38 mitigate / 4
accept*; los PLAN dicen **37 mitigate / 5 accept** — `T-48-42` es `accept`, no `mitigate`. Los PLAN
son la fuente correcta y el auditor corrigió al orquestador, no al revés.

**No se aplicó el short-circuit de ASVS L1** pese a que el registro venía de tiempo de plan, y por
un motivo concreto: el code review (`48-REVIEW.md`) había **falsificado una mitigación declarada**
del propio registro. `T-48-06`/`T-48-18`/`T-48-26` («invertir el ratchet del ancla») se apoyaban en
un procedimiento manual —*«se verifica que ningún suelo preexistente baja; un suelo que baje detiene
el plan»*— y `CR-01` demostró end-to-end que **ningún gate lo hacía cumplir**. Una clasificación a
profundidad grep habría certificado esa amenaza en verde leyendo su propio texto de mitigación.

---

## El hallazgo estructural de esta auditoría: CODE-ENFORCED vs PROCEDURAL-ONLY

Es el resultado más útil de la corrida y no estaba en el registro. De las 37 `mitigate`:

- **29 son CODE-ENFORCED** — hay un gate que muerde, con el cableado confirmado en cada punto de
  llamada, no en un solo acierto de `grep`.
- **8 son PROCEDURAL-ONLY** — se cumplieron porque el ejecutor fue diligente, no porque nada vaya a
  detener a quien venga después. Todas verificadas como satisfechas **para esta fase**, cada una por
  medición ejecutada por el auditor.

Una mitigación procedimental que aguantó esta vez **no es lo mismo** que una amenaza cerrada. Esta
distinción es la que convierte el registro en algo auditable en vez de en una declaración de
intenciones, y es la que hay que exigir a los registros de las Phases 49-53.

| ID | Sev | Por qué es procedimental | Verificación ejecutada |
|----|-----|--------------------------|------------------------|
| T-48-09 | high | **Ningún gate exige la tercera parte («qué se sigue vigilando») de una excepción del doc.** `grep` de esa cadena sobre `tests/` → **cero coincidencias**. Nada impide que una 6.ª excepción se entregue sin su cláusula de vigilancia | 4/4 excepciones de la fase la llevan (doc `:306`, `:356`, `:421`, `:525`) |
| T-48-16 | high | «Prohibición explícita»; ningún gate detecta una traducción diferenciada artificialmente | `Set` sobre las 122 traducciones `fare-*` → **0 colisiones byte-idénticas** |
| T-48-25 | high | Criterio de aceptación sobre prosa | Las 6 hermanas leídas: **5 simples + 1 compuesta** (`#4 «Habríais hecho»`) — no uniformadas |
| T-48-35 | high | Disciplina de `md5` + `git status` | `git status --porcelain content/ src/ scripts/ tests/ docs/` → **vacío**; sin residuos `*.json.tmp-*` |
| T-48-36 | high | Recorrido del disco sobre fechas | 4 `incorrecta` vivos, todos con fecha 2026-08-14/15 (**pre-mutación**); 0 de la ventana de la mutación |
| T-48-37 | high | Disciplina de control externo | 4 cifras de control publicadas reproducidas exactas (390/462/656/622 px). **Documental — el arnés se retiró y el auditor no pudo re-ejecutarlo** |
| T-48-38 | high | Prohibición de reetiquetar sin evidencia | Ledger 21/22 cerrados solo con sujeto medido; ids 44/46/49 mantenidos `open` a propósito |
| T-48-39 | high | «Escalar, no arreglar aquí» | **Se cumplió** — WR-07 escalado y no arreglado; la id 49 sigue `open` precisamente porque los barridos **no** se convirtieron en gates. CR-01/CR-02 llegaron por el flujo separado de code review, cada uno con su propia evidencia de mutación |

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Máquina del autor → APIs de terceros (Gemini, DeepSeek) | ~320 llamadas de validación en la fase envían el ejercicio y su traducción a dos vendors para el quórum cross-vendor | Texto del corpus (italiano + español, sin datos personales) saliendo; veredicto + concerns entrando. Clave de API en cabecera |
| `.env` → proceso de validación | `loadEnv()` lee las claves de los dos proveedores (`validate-translation-pass.mjs:137-147`, `:156`) | Secretos: `GEMINI_API_KEY`, `DEEPSEEK_API_KEY`. `.env` ignorado en git (`.gitignore:8`) |
| **`.env` → servidor estático del checkpoint** | **Frontera que el registro NO declaró.** Un `npx serve` con raíz en el repo sirve por HTTP todo el árbol, `.env` incluido | Secretos salientes por un cuarto canal que las mitigaciones declaradas (cabecera / URL / log / git) no cubren. Ver T-48-43 |
| Salida del modelo → corpus JSON en disco | El veredicto de un tercero se escribe dentro de `content/exercises/*.json` vía `writePass` | Datos no confiables (`verdict`, `concerns`) escritos en el fichero que gobierna los gates |
| Re-emisión del lock → ancla de TRAD-COV | El ancla es el único dato que un borrado no puede mover consigo | El suelo contra el que se mide toda la cobertura |
| Mutación deliberada → árbol de trabajo real | El plan 48-05 rompe a propósito contenido, reporter y ancla | Una restauración incompleta deja el corpus corrupto o el gate manipulado |
| Navegador del autor → `localStorage` | La app estática lee el corpus y persiste el progreso | Sin sesiones, sin roles, sin multiusuario |

---

## Threat Register

Las familias se repiten una vez por plan; se agrupan por familia y se listan todos los IDs para que
ninguno quede sin contabilizar.

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Enforcement | Status |
|-----------|----------|-----------|----------|-------------|------------|-------------|--------|
| T-48-01 / 12 / 20 / 30 | Tampering — prompt injection vía contenido del corpus | prompt compuesto enviado a los dos vendors | high | mitigate | Guard §6 del doc cubre `prompt`, `options`, `correctIndex`, `italianoResuelto`, `translationES.text` y *«cualquier otro campo»*, y explícitamente el vector del italiano imperativo (`Vieni qui!`). `tests/translation-validator.test.js:130-135` assertea que §6 está en el prompt compuesto **y** que el bloque DATA se adjunta después | code-enforced | closed |
| T-48-02 / 13 / 21 / 31 / 40 | Information Disclosure — fuga de claves | `loadEnv()` / `callModel` | **high** | mitigate | Clave solo en cabecera (`:356` `x-goog-api-key`, `:363` `Bearer`), nunca en URL; ningún `console.*` la imprime; las ramas de error solo emiten porciones del cuerpo de respuesta. Cerrada **para los tres canales declarados** — el cuarto, no declarado, es T-48-43 | code-enforced | closed |
| T-48-03 / 11 / 19 / 29 | Tampering — corrupción del corpus por read-modify-write | `writePass` sobre variante anidada | high | mitigate | `withFileLock` `:997`, escritura atómica temp+`rename` `:1002-1005`, y `locateVariantTranslation` estrecha hasta `translationES` de la variante **antes** de ramificar UPDATE/INSERT. Corpus byte-idéntico a `HEAD` | code-enforced | closed |
| T-48-04 / 17 / 27 | Tampering — dejar el gate de cobertura ciego al editarlo | región de `TRANSLATION_COVERAGE` | high | mitigate | Extracción acotada a la región con no-vacuidad derivada del disco y detección de prosa/comentarios; goldens de ausencia, prefijo, un byte, comentario, dos líneas y cruzado. 75/75 | code-enforced | closed |
| T-48-05 / 22 / 32 | Repudiation — registro de auditoría que miente | campos de autoría y override de los pases | high | mitigate | `deriveStatus` (`src/data/validation-state.js:61-77`) impide fabricar quórum; `tests/screen-translation.test.js:548-568` es un gate sobre todo el corpus que exige motivo escrito en cada override. Medido: **8 overrides, todos con motivo largo; 4 `incorrecta` vivos; 0 `adjudicacion`; 0 `disputed`** | code-enforced | closed |
| T-48-06 / 18 / 26 | Tampering — invertir el ratchet del ancla | `content/translation-coverage.lock.json` | **high** | mitigate | **Era PROCEDURAL-ONLY y `CR-01` lo falsificó.** Ahora `scripts/lib/ancla-ratchet.mjs` compara cada suelo contra su valor commiteado en `HEAD`, cableado en GATE-03 (`count-arrays-lockstep.test.js:2709-2733`) **y** en el sub-gate `ANCLA-RATCHET` del reporter (`run-validation-271.mjs:538-551`, `:1145-1157`), integrado en `gatePass` `:1168`. Verificado por mutación del auditor sobre clon — ver audit trail | code-enforced | closed |
| T-48-07 / 14 / 23 / 33 / 41 | Denial of Service — rate limits de los proveedores | cola de fallbacks | medium | mitigate | Secuencial, auto-fallback, `Retry-After` honrado, timeout 120 s, `exitCode: 3` en `:625`/`:1114` | code-enforced | closed |
| T-48-08 / 15 / 24 / 34 / 42 | Spoofing / Elevation of Privilege | n/a | low | accept | Aceptación **honesta para la forma del proyecto** (app local estática, `localStorage`, sin backend, sin sesiones, sin roles, un solo autor) — pero su premisa literal *«sin servidor»* **era falsa durante la fase**. Se recategoriza como aceptación **condicional**, ver AR-48-02 | procedural (condicional) | closed |
| T-48-09 | Tampering — relajar el criterio de todo el corpus arreglando un caso | sección de excepción del doc | high | mitigate | Las 4 excepciones de la fase llevan su parte de vigilancia; **ningún gate lo exige** | **procedural-only** | closed |
| T-48-10 | Repudiation — perder el disenso al re-validar en masa | `passes[]` de las re-validadas | high | mitigate | `pass-guard` en los 4 escritores, más un meta-test (`:988-1008`) que **deriva la lista de escritores del disco**, de modo que un 5.º escritor no puede nacer sin él | code-enforced | closed |
| T-48-16 | Tampering — falsear el corpus para que una métrica salga bien | par de contraste y hermanas | high | mitigate | Ver tabla procedimental | **procedural-only** | closed |
| T-48-25 | Tampering — uniformar contenido para que una heurística salga verde | 6 hermanas del condicional compuesto | high | mitigate | Ver tabla procedimental | **procedural-only** | closed |
| T-48-28 | Tampering — italiano malformado enviado al evaluador | `fillGap` sobre los 3 prompts con hueco inicial y la opción con apóstrofo | high | mitigate | **Más fuerte de lo que el plan afirmaba** (*«la única mitigación es mirarlo»*): goldens de capitalización con hueco inicial y de elisión de apóstrofo, más invariantes derivadas del corpus `:1085-1130` | code-enforced | closed |
| T-48-35 … T-48-39 | Familia de seguridad de la mutación (48-05) | contenido, reporter, ancla, arnés, ledger | high | mitigate | Ver tabla procedimental | **procedural-only** | closed |
| **T-48-43** | **Information Disclosure — `.env` servido por HTTP** | **`npx serve` con raíz en el repo, bind wildcard** | **high** | **mitigate** | **Descubierta en auditoría, no en tiempo de plan. Remediada y verificada — ver abajo** | procedural (condicional) | closed |
| T-48-SC | Supply chain — legitimidad de paquetes | n/a | n/a | n/a | **No aplicable, verificado por ausencia y no aceptado por aserción:** sin `package.json`, sin `package-lock.json`, sin `node_modules` en el árbol; los 28 commits de la fase no tocaron ningún artefacto de dependencias (`vendor/` solo tiene fuentes auto-alojadas, intactas) | n/a | n/a |

---

## T-48-43 — `.env` servido por HTTP (descubierta en auditoría)

**Lo observado, no lo inferido:**

```
ss -ltn        → LISTEN 0 511  *:3000  *:*        (bind wildcard, NO solo localhost)
ps -p 22152    → node .../serve   cwd = /home/vcompanyb/italian-course
GET /.env        → HTTP 200, 500 bytes
GET /.git/config → HTTP 200, 265 bytes
```

El `npx serve` llevaba ~3 h en marcha (arrancado 2026-08-16 19:43, **dentro de la ventana de
ejecución de 48-05**) con raíz en el repositorio. Servía `.env` —el fichero del que `loadEnv()` saca
`GEMINI_API_KEY` y `DEEPSEEK_API_KEY`— más `.git/config`, `.planning/` completo y el corpus. Ningún
valor de clave fue leído ni impreso, ni por el auditor ni por el orquestador.

**Por qué el registro no lo vio.** La mitigación declarada de la familia de Information Disclosure
cubre exactamente cuatro canales: cabecera, URL, log y git. `.gitignore` impide que la clave se
**commitee**; no hace nada contra que se **sirva**. El canal HTTP no estaba declarado como frontera.

**Causa próxima, dicha sin rodeos:** el servidor lo arrancó el autor porque el checkpoint
`human-verify` del plan 48-05 —y el orquestador al transmitirlo— le pidió abrir la app para
verificar el render. La petición no incluyó cómo arrancarlo de forma segura.

**Regresión respecto de la Phase 47.** Aquella fase trató esta misma superficie como `T-47-26` con
**aceptación condicional** y verificó ausencia de listener en 3000/3999/8000/5500/8080 al cerrar
(`47-04-SUMMARY.md:320-330`). El registro de la 48 se dejó la condición, y la condición se violó.

**Remediación, verificada:** `kill 22152` ejecutado con autorización del autor el 2026-08-16.
Comprobado después por el orquestador: `ss -ltn` sin listener en `:3000`, y `curl :3000/.env` →
`HTTP 000` (puerto cerrado). Los procesos `serve` que quedan en `ps` son el IDE server, atado a
`127.0.0.1`.

**Rotación de claves: NO, por decisión del autor** (2026-08-16), sobre el alcance real medido —
WSL2 tras NAT, alcanzable desde el host Windows y desde donde Windows reenvíe, no desde internet;
ventana de ~3 h; y hace falta que alguien en esa red pidiera exactamente `/.env`. Textual del autor:
*«no hace falta que lo rotes, a priori localhost está a salvo en esta red»*.

**Condición para futuras fases (no es código, es condición de la aceptación):** arrancar el
servidor del checkpoint atado a la interfaz local — `serve --listen 127.0.0.1:3000` — o servir un
subdirectorio en vez de la raíz del repo, y **restaurar el chequeo de «sin listener» de la Phase 47
como paso de cierre**. Mientras esa condición dependa de que alguien se acuerde, esta amenaza es
`procedural`, no `code-enforced`.

---

## Residuales declarados (no bloqueantes)

- **W-01, heredado de la Phase 47, sin cambios.** `bump-translation-lock.mjs:83-88` sigue solo
  **avisando** ante un descenso: no se niega y no exige motivo escrito. El ratchet cerró la vía
  silenciosa de la **edición a mano**; `bump --write` + commit todavía baja un suelo. Es asimétrico
  frente a la doctrina de CR-01, según la cual retirar un pase disidente cuesta una razón grabada.
- **Sin gate que componga todas las variantes por `fillGap`** y assertee buena formación; las
  invariantes comprueban la notación de las opciones, no la salida compuesta. Barrido del auditor
  sobre los 4 ficheros: 4 sujetos, todos bien formados, 0 `NULL`, 0 espaciado malformado.
- **Sub-afirmación no falsable:** *«el `by` es el modelo que de verdad respondió… nunca se edita a
  mano»* no la puede probar ningún control. Las mitades comprobables (no fabricar quórum, motivo
  escrito en el override, disenso preservado) sí están gateadas.
- **Abiertas por decisión expresa del autor, anotadas y no re-abiertas:** WR-07 (`GATE-03` dice
  `disco 0` donde el `0` es el fallback de un `??`, ledger id 53) y la pérdida de mayúscula inicial
  en el render (36 ejercicios, 7 categorías, ledger id 59).
- **Warning de registro:** `48-05-SUMMARY.md` **no lleva sección de amenazas** y nunca menciona
  T-48-35…T-48-42. El plan que carga la familia de mayor riesgo se entregó con cero reporte de
  amenazas; el auditor las verificó contra `48-MUTACIONES-EVIDENCIA.md` y el disco en su lugar.

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-48-01 | T-48-08 / 15 / 24 / 34 / 42 | Scripts locales del propio autor sobre su máquina; app estática sin backend, sin sesiones, sin roles, sin multiusuario. Sin sujeto real de Spoofing/EoP. Precedente: `AR-47-01` | autor | 2026-08-16 |
| AR-48-02 | T-48-43 | Servidor estático local del checkpoint. **Aceptación condicionada a cerrarlo al terminar y a atarlo a `127.0.0.1`** — la primera mitad se violó durante esta fase y se remedió con `kill` verificado; la segunda queda como condición para las Phases 49-53. Precedente de formato: `AR-47-02` | autor | 2026-08-16 |
| AR-48-03 | T-48-43 | **No rotar `GEMINI_API_KEY` ni `DEEPSEEK_API_KEY`** tras la exposición de ~3 h, sobre el alcance medido (WSL2 tras NAT, sin ruta desde internet). Decisión explícita del autor, registrada con su ventana temporal exacta para que sea revisable si el alcance de red cambia | autor | 2026-08-16 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-16 (1.ª corrida) | 43 | 42 | 1 (T-48-43, `high`, bloqueante) | gsd-security-auditor (opus) |
| 2026-08-16 (tras la remediación) | 43 | 43 | 0 | orquestador (verificación independiente) |

Notas de la corrida:

- **Verificación por ejecución, por encima de la profundidad grep que ASVS L1 exigiría.** El auditor
  clonó el árbol a un directorio desechable y reprodujo el exploit de `CR-01`, que antes era
  totalmente silencioso: suelo `preposiciones` 96→95 → GATE-03 **74/1**, reporter `ANCLA-RATCHET
  FAIL`, exit 1; el exploit completo (suelo + borrar `preposiciones-col#0`) → `TRAD-COV` sigue
  `PASS (327/327)` —confirmando su ceguera— pero `ANCLA-RATCHET FAIL`, exit 1; borrar la clave
  entera → rojo; borrar el fichero de lock → falla **ruidosamente** con ENOENT explícito. Los tres
  bootstraps comprobados, y una prueba de no-vacuidad assertea que el lock real se lee `leida`, de
  modo que la rama de bootstrap no puede tragarse el gate. **El fix es real.**
- **No se aceptó el reporte del fixer:** el auditor re-derivó cada cifra por su cuenta.
- **El auditor corrigió al orquestador dos veces:** la contabilidad del registro (37/5, no 38/4) y
  el alcance de la mitigación de Information Disclosure (cerrada para los canales declarados, con un
  cuarto canal vivo que ninguna de las dos partes había visto).
- El árbol de trabajo quedó intacto: toda la mutación se hizo sobre clon desechable.
- Suite reproducida en **1389 / 1385 pass / 4 fail**; los 4 son de `requirements-traceability`
  (deuda documental D-45-12), preexistentes y no de seguridad.
- **Lo que el auditor convertiría en gate a continuación:** `T-48-09`, porque es la misma condición
  sin cerrar que la id 49 del ledger — ninguna de las dos tiene gate, y cada enmienda absolutoria
  nueva amplía superficie que el quórum no respalda.
