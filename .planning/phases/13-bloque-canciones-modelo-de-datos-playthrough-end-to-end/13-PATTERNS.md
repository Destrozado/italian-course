# Phase 13: Bloque Canciones + modelo de datos + playthrough end-to-end - Pattern Map

**Mapped:** 2026-06-02
**Files analyzed:** 8 surfaces (4 new files, 4 modified files)
**Analogs found:** 8 / 8 (every surface has a concrete in-repo analog — pure brownfield reuse)

> **Brownfield invariant:** This phase builds NOTHING new architecturally. Every surface below copies an existing pattern with a minimal, surgical extension. The `wordButtons.grade()` handler, the `applyImmediateFailure` cascade primitive, the migration chain, the `summaryDelta` shape, and the `currentScreen` switch are all reused **as-is**. The only genuinely new code is: (a) a song content JSON shape, (b) a song-file validator added to the dispatch, (c) `migrate4to5` + `songProgress` sub-tree, (d) a `'canciones'` listing screen, (e) a playthrough that wires existing primitives in a song-specific path that does NOT touch `buildSession`/`buildFullTest`.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `content/songs/<slug>.json` (new) | content / model | file-I/O (static JSON) | `content/exercises/avere.json` (`word-buttons` payload) | exact (shape), reversed direction |
| `content/songs.json` index (new, optional) | content / model | file-I/O | `content/categories.json` | exact |
| song-file validator in `src/data/schema-validator.js` (modify) | validator | transform / validate | `validateWordButtonsPayload` + `validateContent` | exact (role + flow) |
| song content loader in `src/data/content-loader.js` (modify) | data loader | file-I/O (fetch) | `loadContent` + `fetchJson` + `normalizeNfcInPlace` | exact |
| Canciones screen + home button in `index.html` + `src/screens/app.js` (modify) | screen / route | event-driven (UI) | home `.button-row-prominent` + category table + `currentScreen` switch (D-24) | exact (role), role-match (listing vs table) |
| song playthrough in `src/screens/app.js` (modify) | screen controller | request-response (grade loop) | `_launchExamen` + `sessionSelectOption` + `applyResultToSession` + `sessionAdvance` | exact |
| song-phrase cascade in `src/screens/app.js` + `src/domain/progress.js` (reuse) | domain | event-driven (immediate fail) | `applyImmediateFailure` (single call-site) | exact (reuse as-is) |
| `songProgress` state + `migrate4to5` in `src/data/storage.js` (modify) | model / migration | CRUD (localStorage) | `migrate3to4` + `hydrateV4` + `categoryProgress` sub-tree | exact |
| post-song summary in `src/screens/app.js` + `index.html` (modify) | screen | transform / render | `completeSession` + `computeSummaryDelta` + `summary-errors` template | exact (concept), role-match (no streak) |

---

## Pattern Assignments

### 1. `content/songs/<slug>.json` (content/model, file-I/O) — NEW

**Analog:** `content/exercises/avere.json` — the `word-buttons` payload entry.

**Payload shape to copy** (`content/exercises/avere.json` lines ~446-459):
```json
{
  "id": "avere-100",
  "type": "word-buttons",
  "categoryIds": ["avere"],
  "payload": {
    "prompt": "Yo tengo un coche.",
    "answer": ["io", "ho", "una", "macchina"],
    "distractors": ["è", "sono"]
  }
}
```

**CRITICAL — the it→es REVERSAL (D-05, D-06, PLAY-02):** For a song phrase, the direction inverts vs the exercises above.
- `prompt` = the **Italian** line (shown verbatim, with original punctuation/caps as text-to-translate).
- `answer[]` = the **Spanish** tokens (no punctuation, NFC).
- `distractors?` = optional Spanish decoys (D-05: default none).
- The handler `wordButtons.grade()` (`src/exercise-types/word-buttons.js` lines 40-48) is language-agnostic — it compares token sequences case-insensitively. **Reused as-is**, zero changes.

**Song-level shape (Claude's Discretion — recommended, coherent with "one file per content unit"):** a song document = ordered list of phrases + metadata. Each phrase carries `categoryIds[]` (LINK-01) which MAY be empty `[]` (LINK-03 — phrases without category, no cascade). Suggested shape, mirroring the exercise-file wrapper `{ "exercises": [...] }`:
```json
{
  "id": "mini-prueba",
  "title": "Mini-canción de prueba",
  "phrases": [
    { "id": "mini-prueba-001", "prompt": "<Italian line>", "answer": ["<es>", "<es>"], "categoryIds": ["avere"] },
    { "id": "mini-prueba-002", "prompt": "<Italian line>", "answer": ["..."], "categoryIds": [] }
  ]
}
```
> Note divergence from exercises: a song phrase need NOT carry `type` (it is always song-line / word-buttons-inverse) and `categoryIds` MAY be empty (LINK-03), unlike `validateContent` which requires `categoryIds` non-empty for exercises (`schema-validator.js` line 110). The song validator (surface 3) must relax this rule.

---

### 2. `content/songs.json` index (content/model, file-I/O) — NEW (optional)

**Analog:** `content/categories.json` (read in full, 13 lines).

```json
{
  "categories": [
    { "id": "avere", "name": "Avere (auxiliar)", "order": 1 }
  ]
}
```

**Pattern:** a thin index array used to drive the listing + derive the load set, exactly like `categories.json` drives the category load in `main.js` lines 67-74. A `songs.json` with `{ "songs": [{ "id": "mini-prueba", "title": "...", "phraseCount": N }] }` lets the Canciones listing render without fetching every song file. Mirror the `main.js` boot pattern (lines 67-74): fetch the index, map ids, then `loadSongs(ids)`.

---

### 3. Song-file validator in `src/data/schema-validator.js` (validator, transform) — MODIFY

**Analog:** `validateWordButtonsPayload` (lines 203-231) for per-phrase payload + the `validateContent` accumulator loop (lines 50-143) for file-level structure.

**Accumulate-all-errors invariant (D-08)** — copy verbatim: never throw mid-walk; push into an `errors[]` array and return `{ok, errors}`. The `push(file, exerciseId, reason)` closure (line 52) and Spanish messages (FOUND-04) are the house style.

**Per-phrase validator to copy** (adapt from `validateWordButtonsPayload`, lines 203-222):
```javascript
function validateSongPhrasePayload(phrase, file, push) {
  const { prompt, answer, distractors } = phrase;        // NOTE: payload is flattened onto phrase, or nest under .payload — builder's call
  if (typeof prompt !== 'string' || !prompt.trim()) {
    push(file, phrase.id, '"prompt" debe ser string no vacío');
  }
  if (!Array.isArray(answer) || answer.length === 0) {
    push(file, phrase.id, `"answer" debe ser array de al menos 1 token`);
  } else if (answer.some(t => typeof t !== 'string' || !t.trim())) {
    push(file, phrase.id, '"answer" contiene tokens vacíos o no-string');
  }
  if (distractors !== undefined) {
    if (!Array.isArray(distractors)) {
      push(file, phrase.id, '"distractors" debe ser array si está presente');
    } else if (distractors.some(t => typeof t !== 'string' || !t.trim())) {
      push(file, phrase.id, '"distractors" contiene tokens vacíos o no-string');
    }
  }
}
```

**KEY DIVERGENCE from exercise validator:** `categoryIds` for a song phrase is **optional and may be empty** (LINK-03). Do NOT copy the `categoryIds` non-empty check at `schema-validator.js` line 110. Instead: if `categoryIds` is present, validate that each entry is a string referencing a known category (copy lines 113-121, the `knownCategoryIds.has(cid)` reference check), but an empty/absent array is valid.

**Dispatch / entrypoint (DATA-02):** Two viable patterns —
- (a) Add a new top-level `validateSongs({ songs, knownCategoryIds })` export alongside `validateContent`, called by the song loader; OR
- (b) Extend `PAYLOAD_VALIDATORS` (lines 30-34) only if song phrases are modeled as `type: 'song-line'` exercises. Given LINK-04 (songs must NOT enter the exercise pool), pattern (a) — a separate validator + separate load path — is the cleaner match for the standalone constraint. Builder decides; the dispatch-table-as-single-source-of-truth idiom (line 18) is the convention either way.

**Banner-on-malformed path (DATA-02):** The loader throws `Error` with `.errors = errors[]` (`content-loader.js` lines 54-58), and `main.js` catch (lines 103-106) calls `renderValidationBanner(errors)`. Song validation errors must flow through the SAME mechanism so a malformed song JSON produces a visible banner, coherent with the existing validator.

---

### 4. Song content loader in `src/data/content-loader.js` (data loader, file-I/O) — MODIFY

**Analog:** `loadContent` (lines 29-71) + `fetchJson` (lines 79-85) + `normalizeNfcInPlace` (lines 95-109).

**Load + NFC-on-the-edge + validate sequence to copy** (lines 31-58):
```javascript
const songsRaw = await fetchJson('content/songs.json');
for (const sid of songIds) {
  const raw = await fetchJson(`content/songs/${sid}.json`);
  // ...collect
}
normalizeNfcInPlace(songData);              // NFC at the border (D-09 / CONT-06) BEFORE validating
const { ok, errors } = validateSongs({ songs: songData, knownCategoryIds });
if (!ok) { const err = new Error('Validación de canciones fallida'); err.errors = errors; throw err; }
```

**Why this matters:** `wordButtons.grade()` assumes NFC-normalized tokens and does NOT renormalize (`word-buttons.js` line 19). The loader is the single place NFC is applied. Song answers MUST pass through `normalizeNfcInPlace` here, exactly like exercises.

**Standalone enforcement (LINK-04):** Songs load via their OWN call (`loadSongs(songIds)` or an extension of `loadContent` that returns a separate `songsById` map). They must NOT be merged into `exerciseById` (lines 61-65) — that map feeds `buildSession`/`buildFullTest`. Keep `songsById` (or `songs[]`) a sibling field on the returned content object so the playthrough reads it directly and the sampler never sees it.

---

### 5. Canciones screen + home button (screen/route, event-driven) — MODIFY `index.html` + `src/screens/app.js`

**Analog A — home prominent button** (`index.html` lines 144-148):
```html
<div class="button-row button-row-prominent">
  <button type="button" @click="openPicker('repaso')">Repaso 20</button>
  <button type="button" @click="openPicker('test-completo')">Test completo</button>
  <button type="button" class="secondary" @click="currentScreen = 'backup'">Backup</button>
</div>
```
**D-01:** Add a 4th button **as a protagonist** (NOT `class="secondary"` like Backup) — e.g. `<button type="button" @click="currentScreen = 'canciones'">Canciones</button>`. It joins the prominent row at the same visual weight as Repaso/Test.

**Analog B — `currentScreen` switch (D-24)** (`index.html` lines 65, 193, 255, 518, 687; `app.js` line 93):
```html
<template x-if="currentScreen === 'home'"> ... </template>
<template x-if="currentScreen === 'picker'"> ... </template>
<template x-if="currentScreen === 'session' && sessionCurrentExercise"> ... </template>
<template x-if="currentScreen === 'summary' && summaryDelta"> ... </template>
<template x-if="currentScreen === 'backup'"> ... </template>
```
The `currentScreen` prop is declared at `app.js` line 93 (`currentScreen: 'home'`). Add `'canciones'` (listing) and, per Claude's Discretion, either reuse `'session'`/`'summary'` for playthrough or add dedicated `'cancion'`/`'cancion-summary'` values. **Invariant:** screens are mutually-exclusive `<template x-if>` blocks; the `@keydown.window` listener inside the session template auto-unmounts when `currentScreen` changes (D-72 — see `app.js` lines 1055, 1666-1667).

**Analog C — listing table (SONG-01, SONG-02)** (`index.html` lines 151-186, the category table with `x-for`):
```html
<template x-for="cat in categoriesForDisplay" :key="cat.id">
  <tr>
    <td><span :class="`badge-${cat.status}`" x-text="cat.badgeGlyph"></span></td>
    <td x-text="cat.name"></td>
    ...
    <td><button @click="startExamen(cat.id)">Examen</button></td>
  </tr>
</template>
```
The song listing copies this `x-for` + status-badge + 1-click-action structure. Each row shows song title, status badge (`no hecha`/`pasada`/`fallada` — D-02), phrase count (SONG-02), and a "Jugar" button (`@click="startSong(song.id)"`, SONG-03 — mirrors `startExamen(cat.id)` 1-click launch). Use a `songsForDisplay` getter mirroring `categoriesForDisplay` to map raw song data + `songProgress` state into display rows.

**Double-defense Alpine (house pattern):** Any new banner/listing uses a null-safe getter + an outer `x-if` guard before inner bindings, because bindings evaluate before `init()` resolves. See `inFlightTestActive` getter (`app.js` lines 1943-1947) and `shouldShowBackupBanner` (`index.html` lines 123, 677-685). `songsForDisplay` must guard `if (!this.content) return []` like `bankWithKeys` (`app.js` line 1921).

---

### 6. Song playthrough (screen controller, request-response) — MODIFY `src/screens/app.js`

**Analog:** `_launchExamen` (lines 370-424) for launch + `applyResultToSession` (lines 1217-1247) for the grade/feedback/advance loop + `sessionAdvance` (lines 1262-1285).

**Launch pattern to copy** (`_launchExamen`, lines 370-423) — the "build ordered list → reset sub-state → init first item → transition to screen" shape:
```javascript
_launchExamen(catId) {
  this.cancelAutoAdvance();
  this.cancelMatchFlash();
  const allExercises = Object.values(this.content.exerciseById);
  const result = buildFullTest([catId], allExercises);   // ← SONGS: do NOT call this; use song.phrases in order (PLAY-01)
  this.sessionMode = 'test-completo';
  this.sessionExerciseIds = result.exerciseIds;
  this.sessionCursor = 0;
  this.sessionResults = [];
  this.sessionSelectedIndex = null;
  this.sessionFeedback = null;
  this.wordButtonsBank = [];
  this.wordButtonsAnswer = [];
  // ...reset match sub-state...
  if (result.exerciseIds.length > 0) {
    const firstEx = this.content.exerciseById[result.exerciseIds[0]];
    this.initSubStateForExercise(firstEx);
  }
  this.persistInFlightTest();          // ← SONGS: omit (PLAY-05: no resume slot — deferred)
  this.currentScreen = 'session';
}
```
**CRITICAL standalone divergence (LINK-04, PLAY-01):** `startSong(songId)` must NOT call `buildFullTest`/`buildSession`. Instead it takes the song's `phrases[]` **in declared order** (no shuffle — PLAY-01 sequential to the end) as the playthrough list. Phrases come from the separate `songsById`/`songs` map, never from `exerciseById`. And per PLAY-05 (no mid-song resume — deferred), the song path should NOT write `inFlightTest`.

**Init sub-state for a phrase** — reuse the `word-buttons` branch of `initSubStateForExercise` (lines 1603-1613):
```javascript
if (exercise.type === 'word-buttons') {
  const all = [...(exercise.payload.answer ?? []), ...(exercise.payload.distractors ?? [])];
  this.wordButtonsBank = fisherYates(all);   // visual shuffle of Spanish bank (D-05)
  this.wordButtonsAnswer = [];
}
```
A song phrase is graded exactly like a word-buttons exercise; the bank is the shuffled `answer ∪ distractors`. Reuse `fisherYates` (`session.js` lines 50-57) for the visual bank shuffle — that helper is allowed in the song path (it shuffles the bank, not the phrase order).

**Grade → feedback → advance loop** — copy `wordButtonsCheck` (lines 1344-1357) + `applyResultToSession` (lines 1217-1247):
```javascript
wordButtonsCheck() {
  if (this.sessionFeedback !== null) return;
  if (!this.wordButtonsCanCheck) return;
  const ex = this.sessionCurrentExercise;
  const correct = registry[ex.type].grade(ex, { tokens: this.wordButtonsAnswer });
  this.applyResultToSession(ex, correct, [...this.wordButtonsAnswer]);   // defensive clone
}
```
```javascript
applyResultToSession(ex, correct, userAnswer) {
  this.sessionFeedback = correct ? 'correct' : 'incorrect';
  this.sessionResults.push({ exerciseId: ex.id, correct, userAnswer });
  if (correct) {
    this.sessionAutoAdvanceHandle = setTimeout(() => this.sessionAdvance(), 600);  // PLAY-03 green auto-advance
  } else {
    const newState = applyImmediateFailure(this.state, ex, this.content, todayLocal()); // ← cascade (surface 7)
    newState.firstUsedAt = newState.firstUsedAt ?? new Date().toISOString();
    saveState(newState);
    this.state = newState;
    // red: expose "Siguiente" button; user advances manually
  }
  // (song path) omit the inFlightTest persist branch
}
```
**Single call-site invariant (D-54 / Pitfall #2):** `applyImmediateFailure` is invoked from EXACTLY ONE place per grade. Keep the song playthrough routing failures through this same helper. Do NOT add a second cascade call-site.

**Advance + end-of-song detection** — copy `sessionAdvance` (lines 1262-1285): increment cursor, reset `sessionSelectedIndex`/`sessionFeedback`, init next phrase's sub-state, and when `cursor >= length` call the completion routine (surface 8 analog of `completeSession`).

**Keyboard shortcuts (D-72, Claude's Discretion):** Reuse `handleSessionKey` (lines 1698+) bound via `@keydown.window` on the session `<article>` (`index.html` line 256: `<article @keydown.window="handleSessionKey($event)">`). The word-buttons branches (digits 1-9 = bank pick, Backspace = remove last, Enter = Comprobar / advance after fail) already cover song phrases since phrases are word-buttons-typed. Auto-unmount on `currentScreen` change is the cleanup (D-72).

**Word-buttons session render to copy** (`index.html` lines 330-385) — the `.wb-bank` / `.wb-answer` / "Respuesta correcta:" / Comprobar+Siguiente block. The Italian prompt is shown as the phrase to translate; reuse this template verbatim (it already renders `payload.prompt` as the text and `payload.answer.join(' ')` as the correct answer on fail — PLAY-03).

---

### 7. Cascade on phrase failure (domain, event-driven) — REUSE `src/domain/progress.js` AS-IS

**Analog:** `applyImmediateFailure` (`progress.js` lines 296-334) — reused with ZERO changes.

```javascript
export function applyImmediateFailure(state, exercise, content, today) {
  const next = {
    ...state,
    categoryProgress: { ...(state.categoryProgress ?? {}) },
    dailyLog: { ...(state.dailyLog ?? {}) }
  };
  const catIds = exercise?.categoryIds ?? [];
  for (const catId of catIds) {
    const prev = next.categoryProgress[catId] ?? blankCategoryProgress();
    next.categoryProgress[catId] = {
      ...prev, status: 'no-hecha', clearedExerciseIds: [], streakDays: 0,
      becameHechaAt: undefined, becameDominadaAt: undefined, lastPracticedDate: today
    };
  }
  // dailyLog[today] += catIds to BOTH practiced + withFailure (idempotent)
  return next;
}
```
**How songs use it (LINK-01, LINK-02, LINK-03):** A song phrase object exposes `categoryIds[]`. A failed phrase with non-empty `categoryIds` passes through `applyImmediateFailure` and cascades identically to an exercise — the function reads `exercise.categoryIds` and resets each touched category (status→`no-hecha`, streak→0). A phrase with empty `categoryIds` (LINK-03) loops zero times → no cascade, no state change. **No code change required** — the empty-array case is already a no-op.

**Persistence timing (D-54):** failures persist IMMEDIATELY (`saveState` synchronous inside the red branch of `applyResultToSession`, lines 1229-1233), before any abandon is possible. This is the existing invariant — songs inherit it unchanged.

---

### 8. `songProgress` state + `migrate4to5` (model/migration, CRUD) — MODIFY `src/data/storage.js`

**Analog:** `migrate3to4` (lines 304-354) + `hydrateV4` (lines 373-394) + the `categoryProgress` sub-tree pattern.

**Bump constant** (line 35): `CURRENT_SCHEMA_VERSION = 4` → `5`.

**`blankState` extension** (lines 55-65): add `songProgress: {}` alongside `categoryProgress: {}`.

**Dispatcher extension** (`migrate` lines 135-147): add the new link:
```javascript
if (s.schemaVersion === 3) s = migrate3to4(s);
if (s.schemaVersion === 4) s = migrate4to5(s);     // ← NEW
if (s.schemaVersion === 5) return hydrateV5(s);    // ← NEW (was hydrateV4)
```

**`migrate4to5` to copy from `migrate3to4` shape** (lines 339-354) — the deep-clone-defensive reconstruction:
```javascript
export function migrate4to5(v4) {
  return {
    schemaVersion: 5,
    exerciseStats:   (typeof v4.exerciseStats   === 'object' && v4.exerciseStats   !== null) ? JSON.parse(JSON.stringify(v4.exerciseStats))   : {},
    categoryProgress:(typeof v4.categoryProgress === 'object' && v4.categoryProgress !== null) ? JSON.parse(JSON.stringify(v4.categoryProgress)) : {},
    dailyLog:        (typeof v4.dailyLog        === 'object' && v4.dailyLog        !== null) ? JSON.parse(JSON.stringify(v4.dailyLog))        : {},
    songProgress:    (typeof v4.songProgress    === 'object' && v4.songProgress    !== null) ? JSON.parse(JSON.stringify(v4.songProgress))    : {},  // ← NEW sub-tree
    lastBackupAt: typeof v4.lastBackupAt === 'string' ? v4.lastBackupAt : null,
    firstUsedAt:  typeof v4.firstUsedAt  === 'string' ? v4.firstUsedAt  : null,
    inFlightTest: v4.inFlightTest
  };
}
```
**Deep-clone defense (CR-03, lines 330-338):** the `JSON.parse(JSON.stringify(...))` round-trip on each sub-dict is the house anti-prototype-pollution pattern — copy it for `songProgress` too. `hydrateV5` mirrors `hydrateV4` (lines 373-394) with the `songProgress` line added and `schemaVersion: 5`.

**`songProgress` sub-tree shape (D-02, D-03 — model on `categoryProgress`, but SIMPLER):**
```javascript
// songProgress[songId] = { status: 'no-hecha' | 'pasada' | 'fallada', lastPlayedAt?: 'YYYY-MM-DD' }
```
**KEY DIVERGENCE from `categoryProgress`:** Song state is NOT sticky and has NO 21-day streak / no `dominada` (D-03). It is **redimible/bidirectional** — reflects the LAST completed playthrough only:
- complete with 0 fails → `pasada`
- complete with ≥1 fail → `fallada`
- replay a `fallada` clean → back to `pasada`; replay a `pasada` with a fail → down to `fallada`.

So do NOT copy the `streakDays`/`becameHechaAt`/`becameDominadaAt`/promotion machinery from `blankCategoryProgress` (`progress.js` lines 344-353). `songProgress` is a flat status overwrite.

**Write timing (D-02):** song status is **write-once-at-end** of the playthrough (set in the completion routine, surface 8 of playthrough). The category cascade (surface 7) persists immediately per failed phrase; the song's own status persists only when the playthrough finishes. Two independent writes — mirror exactly the "aciertos write-once / fallos immediate" split already in `applyResultToSession`.

---

### 9. Post-song summary (screen, transform/render) — MODIFY `src/screens/app.js` + `index.html`

**Analog:** `completeSession` (`app.js` lines 1811-1848) + `computeSummaryDelta` (lines 2288-2372) + the `summary-errors` template (`index.html` lines 590-658).

**Completion routine to copy from `completeSession`** (lines 1811-1847) — snapshot-before / apply / compute-delta / snapshot-results / transition:
```javascript
completeSession() {
  const sessionResult = { answers: this.sessionResults };
  const today = todayLocal();
  const before = JSON.parse(JSON.stringify(this.state.categoryProgress ?? {}));  // deep-clone snapshot for delta
  const newState = applySessionResult(this.state, sessionResult, this.content, today);
  newState.firstUsedAt = newState.firstUsedAt ?? new Date().toISOString();
  saveState(newState);
  this.state = newState;
  const { delta, headerLabel } = computeSummaryDelta(before, newState, sessionResult, this.content);
  this.summaryDelta = delta;
  this.summaryHeaderLabel = headerLabel;
  this.summarySessionResults = [...this.sessionResults];   // CR-02 snapshot — survives unmount
  this.cancelAutoAdvance();
  this.currentScreen = 'summary';
}
```
**Song completion divergence:** the song routine ALSO writes `songProgress[songId].status` here (D-02 write-once-at-end): `status = this.sessionResults.some(r => !r.correct) ? 'fallada' : 'pasada'`. It does NOT call `applySessionResult` (that bumps `exerciseStats` + runs category promotions for the exercise pool — songs are standalone, LINK-04). The category cascade already happened per-phrase via `applyImmediateFailure`. So the song completion computes its category-impact block from the **failed phrases' categoryIds** directly (see below) rather than via `applySessionResult`.

**Two summary blocks (D-04, PLAY-04):**

**Block A — failed phrases list (reuse `summary-errors` template verbatim, `index.html` lines 590-633).** The word-buttons error sub-template (lines 624-633) already renders exactly "Tu respuesta vs Respuesta correcta":
```html
<template x-if="content.exerciseById[result.exerciseId].type === 'word-buttons'">
  <div>
    <div>Tu respuesta: <span class="user-answer" x-text="(result.userAnswer || []).join(' ')"></span></div>
    <div>Respuesta correcta: <strong x-text="content.exerciseById[result.exerciseId].payload.answer.join(' ')"></strong></div>
  </div>
</template>
```
For songs, the lookup source is `songPhraseById` (or the song's phrases) instead of `content.exerciseById`, but the shape (`{exerciseId, correct, userAnswer}` pushed in `applyResultToSession` line 1219) and the `(result.userAnswer || []).join(' ')` rendering are identical. The outer guard `summarySessionResults.some(r => !r.correct && ...)` (line 590) and the CR-02 snapshot-vs-live-results lesson apply directly. Failed phrases WITHOUT category still appear here (D-04 — they are errors), they just don't appear in Block B.

**Block B — "Categorías que bajaron de estado por esto" (adapt the `summaryDelta` CONCEPT, not `applySessionResult`).** Copy the auxiliary-set + before/after-status idiom from `computeSummaryDelta` (lines 2289-2341):
```javascript
const failedCategoryIds = new Set(
  answers.filter(a => !a.correct).flatMap(a => songPhraseById[a.exerciseId]?.categoryIds ?? [])
);
// for each catId: statusBefore (from `before` snapshot) → statusAfter (from newState.categoryProgress)
// list only categories that regressed (isRegression: was hecha/dominada, now no-hecha)
```
Reuse the factual/neutral language of the existing delta render (`index.html` lines 522-543: `categoría: antes → después`, `delta-regression` arrow class) — **no gamification** (per Specifics). The block lists only the grammar categories that cascaded due to THIS song's failed phrases, closing the pedagogical loop (D-04). The `before` snapshot must be captured at song START (or before the first cascade) since `applyImmediateFailure` mutates `categoryProgress` mid-playthrough — note this timing carefully: unlike `completeSession` where the snapshot is taken at the end before a single `applySessionResult`, the song cascade is incremental, so the "before" must be captured at launch.

**Return-to-list:** mirror `returnToHomeFromSummary` (lines 1856-1864) — clear `summaryDelta`/`summaryHeaderLabel`/`summarySessionResults`, `resetSession()`, and set `currentScreen` back to `'canciones'` (the listing, so the user sees the updated song status — SONG-02/SONG-04).

---

## Shared Patterns

### Layer purity (D-02)
**Source:** every `src/domain/*` and `src/exercise-types/*` module header (e.g. `word-buttons.js` lines 21-25, `progress.js` line 4).
**Apply to:** any new pure logic (song status derivation, song completion delta). No DOM / no storage / no fetch in domain/exercise-type modules — keep them Node-testable. The `app.js` screen layer is the ONLY place that touches `saveState`, `setTimeout`, and DOM.

### Immediate-failure-persist vs write-once-at-end (D-54 / D-20)
**Source:** `applyResultToSession` (`app.js` lines 1221-1236).
**Apply to:** song playthrough. Phrase failures → `applyImmediateFailure` + synchronous `saveState` in the instant of grading (cascade is unloseable). Song's OWN `pasada`/`fallada` status → written only at playthrough completion (D-02).

### Double-defense Alpine (null-safe getter + `x-if` guard)
**Source:** `sessionCurrentExercise` getter (`app.js` lines 1890-1896, `if (!this.content) return null`), `bankWithKeys` (line 1921), `inFlightTestActive` (lines 1943-1947); `index.html` outer guards (lines 255, 518, 590, 687).
**Apply to:** the Canciones listing getter (`songsForDisplay`), the playthrough screen template (guard on current phrase), and the summary blocks. Bindings evaluate before `init()` resolves and during the unmount tick — always guard.

### Timer cleanup (Pitfall #5)
**Source:** `cancelAutoAdvance` (`app.js` lines 1291-1296) called from `sessionAdvance`, `resetSession`, `destroy` (lines 248-251).
**Apply to:** the song playthrough's 600ms green auto-advance handle (`sessionAutoAdvanceHandle`). Reuse the existing handle + `cancelAutoAdvance` — no new timer field needed if the song path reuses the `session*` sub-state.

### Boot wiring (load → state → regression → resolve)
**Source:** `main.js` bootstrap (lines 61-102).
**Apply to:** song loading. Add `loadSongs(songIds)` after `loadContent` (line 74), attach `songsById`/`songs` to the content handoff, and ensure song load errors flow into the same `catch` → `renderValidationBanner` path (lines 103-106). `applyNewExerciseRegression` (line 85) does NOT run over songs (standalone, LINK-04).

---

## No Analog Found

None. Every surface in this phase has a concrete, current in-repo analog. This is a pure brownfield reuse phase.

---

## Metadata

**Analog search scope:** `src/screens/`, `src/data/`, `src/domain/`, `src/exercise-types/`, `content/`, `index.html`, `src/main.js`
**Files scanned:** 11 source files read (full or targeted), 1 example content file inspected
**Pattern extraction date:** 2026-06-02
