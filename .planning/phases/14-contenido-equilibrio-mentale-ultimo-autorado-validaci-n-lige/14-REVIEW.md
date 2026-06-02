---
phase: 14-contenido-equilibrio-mentale-ultimo-autorado-validaci-n-lige
reviewed: 2026-06-02T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - content/songs/equilibrio-mentale.json
  - content/songs.json
  - tests/song-validator.test.js
findings:
  critical: 0
  warning: 0
  info: 2
  total: 2
status: clean
---

# Phase 14: Code Review Report

**Reviewed:** 2026-06-02
**Depth:** standard
**Files Reviewed:** 3
**Status:** clean

## Summary

Phase 14 is a content-authoring phase: it adds one hand-authored Italian→Spanish
song document (`content/songs/equilibrio-mentale.json`, 17 phrases), registers it
in the song index (`content/songs.json`), and adds two lockstep sub-tests to
`tests/song-validator.test.js`. No engine, validator, or UI code changed.

I reviewed against the live `validateSongs` rules and the locked decisions
(D-01..D-09). I ran adversarial structural and encoding checks and executed the
full test suite. Findings:

- **JSON parses** clean; UTF-8 well-formed.
- **Lockstep verified**: index `phraseCount` (17) === `doc.phrases.length` (17);
  index `title` === document `title` (em-dash `—` matches byte-for-byte).
- **Phrase ids unique** (17/17) and slug-shaped (`equilibrio-mentale-NNN`).
- **All prompts non-empty**; **all answer arrays** are ≥1 non-empty string token.
- **No non-lyric noise**: scanned for live-show credits ("See Ultimo Live",
  "Get tickets"), "You might also like", other-song titles
  (Supereroi/Buon viaggio/Non sapere mai), section markers (`[Strofa]`,
  `[Ritornello]`, `[Coda]`), `Embed`/`Lyrics`/`http` artifacts, and stray
  digits/brackets in prompts — none present.
- **Encoding clean**: every prompt and answer token is NFC-normalized (matches
  the loader's NFC normalize step), so no normalization drift at boot. Italian
  apostrophes are consistently ASCII (`'`) with zero mixed typographic `’`.
  Spanish answers follow RAE accentuation (círculo, razón, jarrón, sótano,
  avión, dirección, estación, enséñame, tú, cómo, sé, porqués).
- **Decisions honored**: all phrases carry `categoryIds: []` (D-04/D-05,
  conservative hooking for future CATPROC); no `distractors` (D-07); Italian
  orthography preserved in `prompt`, RAE Spanish in `answer` (D-06). These are
  deliberate and **not** defects.
- **Tests pass**: `node --test tests/song-validator.test.js` → 17/17 green,
  including the real-content validation test and both new lockstep sub-tests.

No Critical or Warning findings. The two Info items below are observations, not
blockers.

## Info

### IN-01: Refrain-variant collapse cannot be machine-verified from artifacts

**File:** `content/songs/equilibrio-mentale.json:43`
**Issue:** D-03 mandates collapsing the two textual variants of the Ritornello
("dentro **ai** miei perché" 1st pass vs "dentro **i** miei perché" 2nd pass)
to a single phrase, preferring the 1st appearance. Phrase `-007` correctly uses
"dentro ai miei perché" (1st variant), and the coda "Allora insegnami tu a
vivere" (×7 in source) appears exactly once as `-016` (D-02). This matches the
decisions. Flagged only because verifying *completeness* of the collapse (that
no unique line was accidentally dropped during de-duplication) requires the
source lyric, which is not in the reviewable artifacts — it rests on the
human-verify checkpoint (D-08). No defect observed in the submitted content.
**Fix:** None required. Documented so the author-oracle sign-off on phrase
coverage is the accountable gate, not this automated review.

### IN-02: Synthetic-test category set diverges from real catalog (intentional, slightly fragile)

**File:** `tests/song-validator.test.js:18`
**Issue:** The hand-written unit tests use
`knownCategoryIds = new Set(['avere', 'preposiciones', 'essere'])` — a 3-element
subset, not the real 9 categories. This is fine for isolated shape tests and the
real-content test correctly loads all 9 from `content/categories.json`
(lines 246-247). The minor risk: a future author who hooks a real phrase to a
valid-but-unlisted category (e.g. `articoli`) in a synthetic test fixture would
get a confusing "categoría desconocida" failure unrelated to the rule under
test. Purely a test-maintenance ergonomics note; no current impact.
**Fix:** Optional — if synthetic fixtures grow, derive the test set from
`categories.json` (as the real-content test already does) instead of a
hardcoded subset.

---

_Reviewed: 2026-06-02_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
