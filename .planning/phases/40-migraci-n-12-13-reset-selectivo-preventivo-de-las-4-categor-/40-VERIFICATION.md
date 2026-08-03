---
phase: 40-migraci-n-12-13-reset-selectivo-preventivo-de-las-4-categor-
verified: 2026-08-03T11:00:45Z
status: passed
score: 15/15 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 40: Migración `12→13` (reset selectivo preventivo de las 4 categorías de `fare`) Verification Report

**Phase Goal:** El state sube a `schemaVersion 13` con un eslabón que resetea selectivamente el progreso de las 4 categorías nuevas de `fare` (efectivamente no-op al nacer sin progreso), dejando el terreno limpio para que nazcan sin estado espurio y sin rozar las 14 categorías existentes. Va PRIMERA — invariante de v1.5 (Phase 18), v1.6 (Phase 21), v1.7 (Phase 29) y v1.9 (Phase 35).
**Verified:** 2026-08-03T11:00:45Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Reset selectivo: los 4 slugs de `fare` quedan ausentes (`hasOwnProperty === false`) de `categoryProgress`/`exerciseStats`, `no-hecha` racha 0 | ✓ VERIFIED | `migrate12to13` (storage.js:1392-1434); tests `migrate12to13 borra categoryProgress…` y `…poda exerciseStats…` pass |
| 2 | 14 legacy + `songProgress` byte-intactas (snapshot `deepEqual` pre/post) | ✓ VERIFIED | test `no-regresión: las 14 legacy + songProgress quedan byte-idénticas…` (data-storage.test.js:2329) pass |
| 3 | edge: adjacency — `fare-indicativo-001` + `fare-indefiniti-001` en el mismo fixture, ambos ausentes, ninguna legacy afectada | ✓ VERIFIED | test `…resetea AMBOS slugs del solape fare-ind…` (data-storage.test.js:2145) + tracer end-to-end (backup.test.js:734) pass |
| 4 | edge: empty — sub-dicts `null`/`'x'`/`42` caen a `{}`; sin `inFlightTest` → `undefined`; `blankState().schemaVersion === 13` | ✓ VERIFIED | tests `…con sub-dict no-objeto (corrupto) cae a {}`, `…sin inFlightTest no crashea…`, `blankState() devuelve schemaVersion 13` all pass |
| 5 | edge: ordering — idempotencia + pureza, mismo key set en 2 pasadas | ✓ VERIFIED | tests `…es idempotente…` y `…es puro (no muta el input…)` pass |
| 6 | Anti-prototype-pollution: `({}).polluted === undefined`, `schemaVersion === 13` tras `__proto__` own-property malicioso | ✓ VERIFIED | tests `migrate12to13 anti-prototype-pollution…` y `hydrateV13 anti-prototype-pollution…` pass (see Anti-Patterns note re: 40-REVIEW.md scope) |
| 7 | `hydrateV13` shape-only: preserva `fare-indicativo` si ya v13-shaped, deep-clona (`assert.notEqual` por referencia) | ✓ VERIFIED | test `hydrateV13 es espejo de hydrateV12 (versión 13) SIN poda…` pass |
| 8 | Backup round-trip v13 preserva progreso legacy | ✓ VERIFIED | tests `round-trip v13: export…` y `round-trip v13 preserva…` (backup.test.js:850,860) pass |
| 9 | Import wrapper v12 con `fare-indicativo` → sale v13 sin esa categoría, `preposiciones` intacta | ✓ VERIFIED | test `import de backup v12 → state v13 con fare-indicativo/fare-indefiniti reseteadas…` (backup.test.js:873) + tracer pass |
| 10 | edge: boundary — 12 y 13 aceptados (salen en 13), 14 rechazado con `/versión más nueva/i` | ✓ VERIFIED | test `frontera de versión: wrappers 12 y 13…` (backup.test.js:897) pass |
| 11 | edge: empty (MIG-02) — `schemaVersion` ausente/`null`/cadena → `/falta o no es número/` | ✓ VERIFIED | test `schemaVersion ausente, null, cadena o NaN…` (backup.test.js:921) pass |
| 12 | edge: precision — no entero o `<1` (`12.5`,`13.5`,`NaN`,`0`,`-1`) → `/schemaVersion inválido/`, nunca hidrata | ✓ VERIFIED | tests `…12.5, 13.5, 0, -1…` y `…1e999 → Infinity…` (backup.test.js:943,959) pass — `NaN` legitimately routed to the type-guard test instead (documented, correct per JSON semantics) |
| 13 | edge: encoding (backstop) — `startsWith` es code-unit-based y los 4 slugs son ASCII puro sin marcas combinantes, ninguna normalización Unicode cambia el reset | ✓ VERIFIED | Direct empirical observation (see below) — not merely symbol presence |
| 14 | `CURRENT_SCHEMA_VERSION` = 13 espejado en `storage.js` y `backup.js`, nunca desincronizado | ✓ VERIFIED | `grep -c "CURRENT_SCHEMA_VERSION = 13"` = 1 in each file |
| 15 | Suite sin fails nuevos + `git diff` del motor vacío | ✓ VERIFIED | `node --test tests/*.test.js` → 697 pass/0 fail (baseline 672); `VAL_07_STRICT=1` → 711/0; `git diff --stat src/screens/app.js src/domain/` empty; `git status --porcelain` clean |

**Score:** 15/15 truths verified (0 present, behavior-unverified)

**Evidence for truth #13 (encoding backstop):** ran a direct Node check against the actual
`RESET_PREFIXES_V13` array: all 4 slugs pass `/^[\x00-\x7F]*$/` (pure ASCII) and
`p.normalize('NFC') === p.normalize('NFD')` (no combining marks to normalize), and confirmed
`String.prototype.startsWith` matches a decomposed/accented variant of a *legacy-shaped* key
correctly (code-unit prefix comparison, no implicit normalization). This is a directly-observed
runtime behavior against the shipped array, not symbol presence — satisfies the `backstop` bar
per `references/honest-verifier.md`.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/data/storage.js` | `RESET_PREFIXES_V13` + block comment, `migrate12to13`, `hydrateV13`, `CURRENT_SCHEMA_VERSION=13` | ✓ VERIFIED | All present (lines 1297-1479); block comment covers all 4 required points (D-40-02/03/05/07) |
| `src/data/backup.js` | imports `migrate12to13`/`hydrateV13`, `CURRENT_SCHEMA_VERSION=13`, Phase 40 phrase appended | ✓ VERIFIED | line 26 (import), line 56-61 (appended comment + constant), lines 151-152 (chain) |
| `tests/data-storage.test.js` | `describe` v13 block with migrate/hydrate tests + no-regression fixture | ✓ VERIFIED | `describe('data/storage v13 …')` at line 2088, 14 tests, no-regression at line 2329 |
| `tests/backup.test.js` | `describe` v13 block: round-trip, import v12→v13, tracer, boundary tests | ✓ VERIFIED | tracer `describe` at 733, main v13 `describe` at 802 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `storage.js` dispatcher `migrate()` | `migrate12to13` → `hydrateV13` | `if (s.schemaVersion === 12) s = migrate12to13(s); if (s.schemaVersion === 13) return hydrateV13(s);` | ✓ WIRED | storage.js:161-163, confirmed by reading |
| `backup.js` import chain | `migrate12to13` / `hydrateV13` | `if (migrated.schemaVersion === 12) migrated = migrate12to13(migrated); migrated = hydrateV13(migrated);` | ✓ WIRED | backup.js:151-152 |
| `storage.js` ↔ `backup.js` | `CURRENT_SCHEMA_VERSION` mirror | both = 13 | ✓ WIRED | grep confirms 1 each |
| `RESET_PREFIXES_V13` | `exerciseStats` prune + `inFlightTest` invalidation | two consumption sites | ✓ WIRED | storage.js:1408, 1416 |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full suite, no regressions | `node --test tests/*.test.js` | 697 pass / 0 fail | ✓ PASS |
| Strict variant | `VAL_07_STRICT=1 node --test tests/*.test.js` | 711 pass / 0 fail | ✓ PASS |
| Tracer test in isolation | `node --test --test-name-pattern="tracer" tests/backup.test.js` | 1 pass / 0 fail | ✓ PASS |
| Engine untouched | `git diff --stat src/screens/app.js src/domain/` | empty | ✓ PASS |
| Working tree fully committed, no stray files | `git status --porcelain` | empty | ✓ PASS |
| Pre-existing (v1.9) `__proto__` bug reproduced identically, not a Phase 40 regression | `migrate11to12` on `__proto__`-own-property fixture | `Object.getPrototypeOf(out.exerciseStats) === Object.prototype` → `false` (same defect as `migrate12to13`) | ✓ PASS (confirms known_context) |

### Probe Execution

SKIPPED — no `scripts/*/tests/probe-*.sh` conventions or phase-declared probes found for this migration phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|--------------|-------------|-------------|--------|----------|
| MIG-01 | 40-01-PLAN.md | `migrate12to13` + `hydrateV13` idempotent, anti-pollution, `CURRENT_SCHEMA_VERSION=13`, selective reset by prefix | ✓ SATISFIED | Truths #1-7, #13-14 |
| MIG-02 | 40-01-PLAN.md | `backup.js` round-trip v13, import `v12→v13`, rejects `>13` | ✓ SATISFIED | Truths #8-12, #14 |

No orphaned requirements — REQUIREMENTS.md maps only MIG-01/MIG-02 to Phase 40, matching the plan's `requirements:` frontmatter exactly.

### Anti-Patterns Found

No debt markers (`TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`) in the 4 phase-modified files
(two grep hits on the literal Spanish word "TODO" meaning "all/entire" — false positives, not debt
markers).

**Pre-existing, non-blocking for this phase (per orchestrator-established known_context):**
`40-REVIEW.md` documents 2 critical + 6 warning findings, the two critical ones (CR-01: `__proto__`
own-property survives `hydrateV13`; CR-02: `migrate12to13`'s prune loop re-parents `exerciseStats`
via the `__proto__` setter) being **faithful, byte-for-byte reproductions of the pre-existing
`migrate11to12`/`hydrateV12` analog already on `main` since v1.9** — independently re-confirmed above
(spot-check row). Fixing them is explicitly family-wide, cross-phase work per D-40-06's scope fence
and is correctly out of Phase 40's scope; it does not block this phase's goal. The specific
must-have truth about anti-prototype-pollution (#6) is scoped narrowly to "global `Object.prototype`
not polluted" and is genuinely true and tested — the broader sub-dict re-parenting issue is a
distinct, inherited concern tracked separately in `40-REVIEW.md`.

### Human Verification Required

None.

### Gaps Summary

No gaps. All 15 must-have truths verified (including the one `backstop`-tagged edge case, confirmed
via direct empirical observation rather than symbol presence), all 4 artifacts present/substantive/
wired, all 4 key links wired, both requirements (MIG-01, MIG-02) satisfied, no orphaned requirements,
no debt markers, and the full test suite (697/0, strict 711/0) plus the engine-untouched gate
(`git diff --stat src/screens/app.js src/domain/` empty) independently re-confirmed rather than taken
from SUMMARY.md on trust. The three deviations documented in `40-01-SUMMARY.md` (leaving `stateV12()`
at 12, moving `NaN` to the type-guard test with `1e999`→`Infinity` added to the integer-guard case,
and the `grep -c "migrate12to13"` count of 3 vs. the plan's stale expectation of 2) were each checked
against the actual code/precedent and are legitimate plan-time bug fixes, not scope shortcuts.

---

_Verified: 2026-08-03T11:00:45Z_
_Verifier: Claude (gsd-verifier)_
