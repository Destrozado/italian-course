---
phase: 16
slug: motor-de-examen-por-slots
status: secured
threats_open: 0
threats_closed: 8
asvs_level: 1
created: 2026-06-03
---

# SECURITY.md — Phase 16 (motor-de-examen-por-slots)

**Audit date:** 2026-06-03
**ASVS Level:** 1
**Block policy:** block_on=high
**Result:** SECURED — 8/8 threats closed (2 accept dispositions documented below)
**Context:** Local single-user static web app (Alpine.js + Pico CSS). No backend, no
network, no auth, no multi-tenancy. localStorage only. Content authored by the sole
user. Register authored at plan time (register_authored_at_plan_time: true).

Implementation files were NOT modified. Verification by grep/read against the cited
implementation locations only.

---

## Threat Verification

| Threat ID | Category | Disposition | Status | Evidence |
|-----------|----------|-------------|--------|----------|
| T-16-01 | Tampering | mitigate | CLOSED | `Array.isArray(slot.variants)` guard → n=1 → returns 0; never indexes out of range. src/domain/session.js:232-233 |
| T-16-02 | Denial of Service | mitigate | CLOSED (see WR-01) | `Math.floor(rng()*n)` with `n<=1→0`. src/domain/session.js:233. Seeded edge tests assert in-range. tests/domain-session.test.js:224-228, 301-304 |
| T-16-XSS | Information disclosure / Injection | accept | CLOSED | Zero `x-html`/`innerHTML`/`insertAdjacentHTML`/`outerHTML` in render code. All variant surfaces via `x-text`. Session render index.html:321,350,357,373,423,434,523; summary-errors index.html:755,760,772,779,783,796,800 |
| T-16-DATALOSS | Tampering | mitigate | CLOSED | Legacy resume fallback `ift.exerciseIds.map(() => 0)`; schemaVersion stays 6. src/screens/app.js:1122-1124; src/data/storage.js:35 (CURRENT_SCHEMA_VERSION = 6, no `= 7`) |
| T-16-REGR | Tampering | mitigate | CLOSED | Exactly 2 real `applyImmediateFailure(` call-sites (raw grep 3 = 1 JSDoc mention). progress.js NOT modified this phase (last touched Phase 2). src/screens/app.js |
| T-16-NULL | Denial of Service | mitigate | CLOSED | Getter defensive guards: content null (2276), cursor out of range (2277), id absent (2279), slot absent (2288), surface fallback `variants?.[vIdx] ?? variants?.[0] ?? {}` (2291). Mirrored in summaryVariantSurface (2330-2332). src/screens/app.js |
| T-16-SC | Tampering | accept | CLOSED | No package.json, no lockfile, no node_modules. Zero installs. Native `node --test` only. Phase 16 commits touched only index.html + src/screens/app.js (+ session.js/tests in Plan 01). |

T-16-01 and T-16-02 share one register row in 16-01-PLAN; T-16-XSS/DATALOSS/REGR/NULL/SC
in 16-02-PLAN. T-16-SC appears in both plans (single accepted-risk entry).

---

## Accepted Risks Log

### T-16-XSS — variant surface render (accept)
Variant surfaces (prompt / options / answer / explanation) render via Alpine `x-text`
(textContent), never `x-html`/`innerHTML`. Verified: zero x-html/innerHTML in render
code; the only matches are comments asserting "NUNCA x-html". The synthetic-payload
re-wrap (sessionCurrentExercise getter and summaryVariantSurface helper) preserved the
x-text vector — no new injection sink introduced. Rationale holds: app is local
single-user; content is authored by the same user; no third-party input crosses any
trust boundary. Accepted.

### T-16-SC — supply chain / package installs (accept)
Static stack, no build, no package manager. No package.json, package-lock.json, or
node_modules present in the repo. Tests run on native `node --test`. Phase 16
introduced zero new dependencies. Rationale holds. Accepted.

---

## Robustness Observations (low severity, NOT blockers)

### WR-01 (re T-16-02) — pickVariantIndex lacks the structural out-of-range net it documents
`pickVariantIndex` (session.js:231-234) computes `Math.floor(rng() * n)` with no
`Math.min(n-1, ...)` clamp and no fallback. Its JSDoc (session.js:221-222) claims the
edge `rng()→1.0` is covered "igual que el patrón de weightedPickOne" — this is
inaccurate for n>=2. `weightedPickOne` (session.js:264-265) is structurally safe (loop
falls through to "return last candidate"); `pickVariantIndex` is not. If an injected
`rng()` returned exactly 1.0 (out of its documented `[0,1)` contract), the result would
be index `n`, one past the end of `variants`.

Why NOT a blocker: the declared T-16-02 mitigation (`Math.floor(rng()*n)`, `n<=1→0`,
seeded tests) is literally present. The runtime RNG is `Math.random`, which never
returns 1.0; the function contract requires `[0,1)`; single-user local context with no
adversarial RNG source. The gap is a JSDoc overclaim plus an absent defensive clamp, not
an exploitable condition. No seeded test injects `rng()→1.0` to exercise the edge, so the
claim is unverified by tests as well. Recommend (non-blocking) either adding
`Math.min(n - 1, Math.floor(rng() * n))` or correcting the JSDoc to drop the
"covers rng()→1.0" claim. Implementation file is read-only here — logged for the author.

### WR-02 (resume path) — stored variantIndex not range-checked against a shrunken variants[]
On resume, a persisted `variantIndex` is restored as-is and resolved by the getter via
`slot.variants?.[vIdx] ?? slot.variants?.[0] ?? {}` (app.js:2291). If a slot's
`variants[]` later shrinks (content edit) below a previously persisted index, the getter
falls back gracefully to variant 0 / `{}` — no crash. Graceful degradation, no range
assertion. Low severity given single-user local context. Logged, not a blocker.

---

## Unregistered Flags

None. Neither 16-01-SUMMARY.md nor 16-02-SUMMARY.md contains a `## Threat Flags`
section, and no new attack surface appeared during implementation outside the threat
register. Phase 16 diffs are confined to src/domain/session.js, tests/domain-session.test.js,
src/screens/app.js, and index.html — all within scope of the declared threats.

---

## Threats Open

0
