<review>
## Code Quality

The codebase is a single large `app.js` file for a piano learning application ("PianoSpark") containing game logic, session management, reward systems, and UI rendering coordination. Overall quality is **fair to middling**: the code is readable at the local level (descriptive names, logical groupings with comments), but it accumulates serious structural and architectural debt.

**Strengths:**
- Consistent naming conventions (`camelCase` functions, `UPPER_CASE` constants, `S.` state prefix)
- Useful inline comment headers (`// ── section name ──`)
- The `act()` dispatcher pattern creates a predictable action surface

**Weaknesses:**

1. **God-object state (`S`)**: All application state lives in a single mutable global `S`. There is no encapsulation, no type safety, and no clear schema. Mutations happen freely throughout.

2. **Monolithic `act()` dispatcher**: The `switch` statement spans hundreds of lines with nested logic, `var` declarations inside `case` blocks (requiring `{}` wrapping — used inconsistently), and side effects mixed with state changes. Cases like `"new_custom"` call `prompt()` directly inside the dispatcher, coupling UI input to business logic.

3. **`var` everywhere**: The entire file uses `var`, which has function-scoping and hoisting issues. Several `var` declarations inside `switch` cases leak to function scope (e.g., `var chords`, `var set`, `var parts` across multiple cases), causing potential variable shadowing.

4. **No error handling**: No `try/catch` anywhere. Functions like `loadState()`, `saveState()`, `recoverFromCrash()`, `startDetection()`, and `playChord()` are called but never defined in this file — if any throws, the whole app silently fails.

5. **Deeply implicit dependencies**: References to `BADGES`, `CURRICULUM`, `SESSION_PLANS`, `LH_PATTERNS`, `FINGER_BADGES`, `DAILY_TYPES`, `PLAY_STYLES`, `SONGS`, `PLACEMENT_TESTS`, `TAB`, `SCR`, `T`, `LN`, `S`, and many functions (`showToast`, `showConfetti`, `playSound`, `render`, `chordsUpToLevel`, etc.) are used but never declared in this file. The entire codebase context is opaque.

6. **Timer management is fragile**: Timers (`T.session`, `T.drill`, `T.daily`, `T.sessionStep`, etc.) are managed manually with `setInterval`/`clearInterval`. There is no centralized timer registry, making it easy to leak intervals (e.g., `tickSession` calls `render()` even when timers may have already been cleared).

7. **Inconsistent guard patterns**: `tickDrill` checks `S.drillActive`, `tickSession` checks `S.active`, but there is no unified tick guard pattern. A cleared interval still calls its callback once in some environments.

8. **Magic numbers and strings**: Hard-coded values appear without explanation: `30` (XP interval), `5` (XP amount), `20`/`30`/`40`/`50` (XP per completion), `0.08` (intrinsic reward probability), `4000` (runner interval ms), `0.15`/`0.3` (rhythm accuracy thresholds). These should be named constants.

9. **Documentation**: Function-level JSDoc is absent. The file header and section separators help, but there are no parameter types, return value descriptions, or explanations of side effects.

10. **`buildIdx` is a module-level mutable**: `var buildIdx = 0;` is a bare global that gets reset inconsistently, creating race conditions if `build_play` is triggered rapidly.

---

## Redundant Files

Only one file is provided (`app.js`), but within it:

- **`completeLegacySession()` vs `completeGuidedSession()`**: ~70% duplicated logic (XP award, chord progress, badge check, history, `checkPracticeDate`, `checkLevelUp`, `checkReward`, `saveState`, `render`). This should be consolidated into a shared `_finalizeSession(type, data)` helper.

- **`tickSession` / `tickDrill` / `tickDaily` / `tickSessionStep`**: All four follow the identical decrement-check-zero-call-complete-else-render pattern. A generic `createCountdownTick(getActive, decrement, onComplete)` factory would eliminate the repetition.

- **`start_ear` / `next_ear`**: Identical logic duplicated across two `act()` cases. A single `_pickEarChord()` helper is needed.

- **`start_quiz` / `next_quiz`**: Both assign `S.quizQ = genQuiz(); S.quizAns = null;` — identical two-liner, no reason to duplicate.

- **`playSound("complete")` called in `completeLegacySession`, `completeDrill`, `completeDaily`, `completeGuidedSession`**: The guarded badge-toast path in `completeLegacySession` and `completeGuidedSession` conditionally skips `playSound` but the logic differs between the two, creating a subtle behavioral inconsistency.

---

## Errors and Bugs

1. **`tickSession` — Potential negative timer render** (`tickSession`, line ~9): `S.timer--` runs before the `<= 0` check. If `tickSession` is called when `S.timer` is already `0` (e.g., due to a double-tick from a slow event loop), `S.timer` becomes `-1`, `completeLegacySession` is called, but `render()` at the end of `tickSession` is never reached — harmless here but fragile.

2. **`completeLegacySession` — `clearInterval` after tick has already fired** (line ~17): The interval is cleared inside the completion function, but the tick that triggered `completeLegacySession` was already executing. If `tickSession` is somehow re-entered (e.g., tab visibility change causing catch-up), the session could complete twice. No completion guard (e.g., `if (S.completedSessions.indexOf(...) >= 0) return;`) exists.

3. **`checkLevelUp` — Off-by-one in session parsing** (line ~72): `var parts = curr.sessions.split("-"); var lastSession = parseInt(parts[1]);` — if `curr.sessions` is a single session number (not a range), `parts[1]` is `undefined` and `lastSession` is `NaN`. The condition `S.currentSession > NaN` is always `false`, silently blocking level-up.

4. **`checkReward` — `S.nextRewardAt` uninitialized** (line ~87): On first call with `VR-2-3` or `VR-5-8` schedule, `S.nextRewardAt` may be `undefined`. `S.actionsSinceReward >= undefined` evaluates to `false`, so the first reward never fires. Initial state must set `S.nextRewardAt = 2` (or similar).

5. **`adaptBpm` — `speed_demon` badge duplicated without re-render** (line ~120): The badge is pushed to `S.earned` but `saveState()` is called without `checkBadges()` or `render()`. The toast shows but the UI badge display may lag until the next render cycle.

6. **`pickReviewChords` — Infinite loop risk** (line ~136): The `while (chords.length < 2 && available.length > 0)` loop samples randomly from `available` without removing items. If `available` has only one chord and `chords` already contains it, the loop runs forever. The `indexOf` guard prevents adding it, but `available.length > 0` stays true.

7. **`genQuiz` — Infinite loop risk** (line ~155): Same pattern: `while (options.length < 4)` samples `pool` randomly without shrinking it. If `pool.length < 4`, the loop will never terminate because it can't find 4 unique options. The guard `if (pool.length < 4) pool = chordsUpToLevel(3)` only fires once — if `chordsUpToLevel(3)` also returns fewer than 4 chords, infinite loop occurs.

8. **`songTick` — `S.songsDone` nullable** (line ~190): `if (!S.songsDone) S.songsDone = [];` is a runtime null-guard that should be initial state. Its presence indicates the initial state object is incomplete.

9. **`completeGuidedSession` — `plan` used after null-check but `plan.newMove` access unchecked** (line ~248): `addHistory("guided_session", { session: plan.num, chord: plan.newMove ? plan.newMove.chord : null })` is correct, but two lines earlier `if (plan.newMove && plan.newMove.chord)` mutates chord progress — if `plan` is somehow `null` here (the outer `if (plan)` should prevent it, but the `S.level` access below is outside that block), `CURRICULUM[Math.min(S.level, 8) - 1]` runs unconditionally.

10. **`completeFingerExercise` — Incorrect "new day" detection** (line ~278): The logic checks whether `anyDoneToday` is true *after* updating `stats.lastDone = Date.now()`. Since `stats.lastDone` was just set to now, the exercise just completed will always be found as done today, so `anyDoneToday` will always be `true`, and `S.fingerDaysLogged` will **never** increment. The check should happen *before* updating `lastDone`, or explicitly exclude the current exercise from the loop.

11. **`act("start_runner")` — Timer not stopped on `stop_runner`** (line ~490): `stop_runner` clears `T.runner` and sets `S.runnerActive = false`, but the anonymous function inside `setInterval` (spawning targets) still calls `spawnRunnerTarget()` and `render()` one final time after `stop_runner` because of event loop ordering. It should check `S.runnerActive` at the top of the callback.

12. **`act("play_song")` — `T.song` not cleared before new interval** (line ~450): When `play_song` is called while already playing, the interval is cleared correctly. But if `select_song` is called and then `play_song` without stopping, `T.song` from a previous song is not explicitly cleared before assigning a new one, risking a leaked interval (depends on whether `select_song` always stops playback first — it sets `S.songPlaying = false` but does **not** clear `T.song`).

13. **`act("tab")` — Missing `render()` / `saveState()`**: The `tab` case does not call `saveState()`, so switching tabs isn't persisted. On reload, the user always returns to the default tab.

14. **`var` inside `switch` without block scope** (multiple locations): For example, `case "placement_fail": { var test = ... }` uses a block but `case "start_ear": var ePool = ...` does not, causing `ePool`, `ec` to be hoisted to `act()` function scope and potentially colliding with similarly-named `var` declarations in other cases (`nePool`, `nec`).

15. **`tickSessionStep` missing timer guard**: Unlike the other tick functions, `tickSessionStep` does not check whether the interval handle `T.sessionStep` still exists before decrementing, and it calls `render()` directly — if `advanceSessionStep` clears the interval but the callback fires one more time, a render with stale step state occurs.

---

## Potential Improvements

1. **Extract state schema**: Define an explicit `DEFAULT_STATE` object with all fields initialized to their correct default values (including `nextRewardAt: 2`, `songsDone: []`, `fingerStats: {}`, etc.). This eliminates runtime null-guards scattered throughout the code.

2. **Replace manual timer management with a `TimerManager` class**:
   ```js
   var TimerManager = {
     _timers: {},
     start: function(id, fn, ms) { this.stop(id); this._timers[id] = setInterval(fn, ms); },
     stop: function(id) { if (this._timers[id]) { clearInterval(this._timers[id]); delete this._timers[id]; } },
     stopAll: function() { Object.keys(this._timers).forEach(this.stop.bind(this)); }
   };
   ```
   This prevents leaks and simplifies all tick management.

3. **Fix the `completeFingerExercise` day-logging bug** by capturing the old `lastDone` value before overwriting it:
   ```js
   var prevLastDone = stats.lastDone;
   stats.lastDone = Date.now();
   var wasNewDay = !prevLastDone || new Date(prevLastDone).toDateString() !== today;
   ```

4. **Guard random-sampling loops against infinite iteration**:
   ```js
   // Safe version for genQuiz
   var shuffled = pool.slice().sort(function() { return Math.random() - 0.5; });
   var options = shuffled.slice(0, 4).map(function(c) { return c.short; });
   ```

5. **Extract XP constants and probability values into a config object**:
   ```js
   var CONFIG = {
     XP: { SESSION: 20, DRILL: 30, DAILY: 40, GUIDED: 50, QUIZ: 10, CHORD: 5 },
     REWARD: { INTRINSIC_CHANCE: 0.08 },
     BPM: { MIN: 40, MAX: 200, STEP_UP: 3, STEP_DOWN: 5 }
   };
   ```

6. **Consolidate `completeLegacySession` and `completeGuidedSession`** into a shared `_finalizeSession(opts)` function to remove duplicated badge-check, XP-award, history-logging, and save/render sequences.

7. **Split `act()` into domain-specific handlers**: e.g., `handleNavigationAction`, `handleSessionAction`, `handleGameAction`, `handleSettingsAction`. Each could be a plain object map `{ action: fn }` for O(1) dispatch instead of a linear `switch`.

8. **Add completion flags to prevent double-completion**: Each timer tick that calls a `complete*` function should set a guard (e.g., `if (S._completing) return; S._completing = true;`) before the async call chain.

9. **Migrate `var` to `const`/`let`**: Eliminates hoisting bugs, reduces scope pollution, and makes intent clearer. The `var parts`, `var chords`, `var set` declarations inside `switch` cases are particularly hazardous.

10. **Add `saveState()` to the `tab` case**: Users expect their last tab to be restored on reload.

11. **Centralize `playSound` / `showToast` calls at session completion**: The current conditional pattern (`if (badges.length) showToast(...) else { showToast(...); playSound(...); }`) means sound is skipped on badge earn. Consider always playing a sound and overlaying the badge toast.

12. **Consider a proper state management pattern** (even a simple pub/sub or Redux-lite) to replace the mutable global `S`, making state changes traceable and enabling undo/redo beyond the single `undoReset`.

---

## Suggested Features

1. **Offline / PWA Support**: The app appears to be a standalone web app. Adding a Service Worker and Web App Manifest would allow offline practice, critical for a music learning tool used away from reliable internet.

2. **Practice Streak Visualization**: The code tracks `checkPracticeDate()` implicitly, but there's no visible streak counter or calendar heatmap (like GitHub's contribution graph) on the home screen. This directly reinforces the daily habit loop already encoded in the reward engine.

3. **Audio Input Chord Detection Feedback Loop**: `startDetection()` is called but its results aren't surfaced in the guided session flow. Integrating real-time detected chord name display with a "match/no-match" indicator during the `try` and `refine` new-move phases would close the feedback loop.

4. **Spaced Repetition for Chord Progress**: `S.chordProg` tracks a 0–100 progress value per chord, but it only increases. Adding decay (chords you haven't practiced recently decrease in score) and surfacing "due for review" chords would implement a proper SRS system that aligns with the interleaving logic already in `pickReviewChords()`.

5. **Session Replay / History Detail View**: `addHistory()` is called throughout but the history data appears unused in the rendered UI (based on this file). A practice journal view showing past session details (duration, chords, XP earned, accuracy) would increase engagement and give learners a sense of progress.

6. **Metronome Subdivision Control**: The metronome (`startMetronome`) only supports a single beat interval. Adding subdivision options (quarter, eighth, triplet) and a visual beat indicator (flash/pulse) would make it significantly more useful for rhythm training.

7. **Difficulty Presets**: `adaptBpm` adjusts BPM automatically, but users have no way to set a starting difficulty preference. Adding Easy/Medium/Hard presets that initialize `adaptiveBpm`, clean streak thresholds, and reward phase parameters would make onboarding smoother.

8. **Shareable Progress Cards**: A "Share your streak" feature generating a canvas/SVG snapshot of XP, level, badges, and days practiced would add social stickiness aligned with the reward engine's goals.

9. **Guided Session Pause/Resume with Context**: `S.paused` stops timers but the `tickSessionStep` guard only checks `S.paused` — there's no UI feedback about what step was paused or how much time remains. A proper pause overlay showing the current step, remaining time, and "what to do while paused" tip would improve UX.

10. **Trill Speed Tracker**: `S.personalBests.bpm` tracks BPM, and `bestTrillSpeed` exists in `fingerStats` but is never written to. Completing the trill speed measurement feature (record taps-per-second during trill exercises) and displaying personal bests would make the finger exercise section more compelling.

---

## Summary

`app.js` is a feature-rich but architecturally fragile single file. The core logic is functionally sound and the product design (reward phases, adaptive BPM, guided sessions) is sophisticated. However, the codebase has several **active bugs** that affect correctness (finger day-logging never increments, infinite loop risk in quiz/review chord selection, `nextRewardAt` uninitialized), and the absence of error handling or type guards means any undefined external dependency silently breaks the app.

**Priority recommendations (ordered):**

1. **Fix the `completeFingerExercise` day-logging bug** — it means a core progression metric is permanently stuck at 0.
2. **Fix the infinite loop risks in `genQuiz` and `pickReviewChords`** — these can hang the browser tab.
3. **Initialize `S.nextRewardAt`** in the default state to prevent the reward engine from silently misfiring.
4. **Centralize timer management** to prevent interval leaks across the 6+ concurrent timers.
5. **Consolidate duplicate session-completion logic** and extract magic numbers into named constants to make the reward tuning maintainable as the curriculum grows.
</review>
## Suggested Features

1. **Velocity-sensitive playback**: `playNote` currently uses a fixed gain of `0.4`. Accepting a `velocity` parameter (0–1, mapped from e.g. how quickly a button is tapped or a MIDI input value) would make practice feedback more expressive and could feed into the adaptive difficulty engine.

2. **MIDI input support**: The Web MIDI API (`navigator.requestMIDIAccess()`) is widely supported. Routing MIDI input through `detectLoop`'s note-matching logic (with far higher accuracy than FFT pitch detection) would dramatically improve chord detection reliability for users with MIDI keyboards.

3. **Audio recording / playback of practice clips**: Using `MediaRecorder` with the existing `AudioContext` graph, short practice clips (10–30s) could be recorded and played back, letting users hear themselves and compare to the watch demo.

4. **Reverb / room simulation**: Adding a `ConvolverNode` with a short impulse response (or a simple Schroeder reverb built from `DelayNode` + `BiquadFilterNode`) would make the synthesized piano sound far more realistic, increasing practice motivation.

5. **Chord detection confidence display**: `getChordMatch` returns a 0–100 score and `getCoachFeedback` returns a string, but there is no persistent per-session accuracy tracking. Storing match scores over time in `S.detectionHistory` and displaying a rolling accuracy graph would close a key feedback loop for learners.

6. **Pitch detection calibration**: The `A4 = 440 Hz` assumption in `midiToFreq` is hard-coded. Adding a tuning offset setting (A4 = 432–446 Hz) with a simple tuner display (show detected fundamental vs. nearest note) would help users with non-standard tunings or slightly out-of-tune instruments.

7. **Variable metronome sounds**: Currently the metronome uses sine waves at 800/1000 Hz. Offering preset sounds (woodblock, clap, hi-hat simulation using filtered noise) would be a low-cost quality-of-life improvement using only existing Web Audio primitives.

8. **Polyphonic pitch detection upgrade**: The current FFT approach with harmonic suppression is reasonable but limited. Implementing the CREPE algorithm's simplified version or YIN algorithm via an `AudioWorklet` would significantly improve multi-note detection accuracy, especially for closely-voiced chords.

---

## Summary

`audio.js` is well-structured and shows real DSP knowledge, but has several bugs that directly affect user experience: the broken WAV preload promise chain (chords may silently fail to load), dangling unstarted oscillator nodes on every `playSound("complete")` call, the inaccurate LH third interval for non-major/minor chords, and the `setInterval`-based metronome that drifts badly in background tabs. The `startDetection` missing `render()` call leaves UI in a broken state after mic denial.

**Priority recommendations (ordered):**

1. **Fix dangling oscillator/gain nodes in `playSound`** — affects every session completion, reward, and jackpot sound; nodes accumulate and may degrade audio graph performance over a long session.
2. **Fix `preloadWavs` promise chain** — chords may silently fall back to synthesis without the user or developer knowing.
3. **Replace `setInterval` metronome with Web Audio lookahead scheduler** — the current implementation is unreliable in background tabs and at high BPMs.
4. **Fix `playNote` envelope click on short durations** — audible artifact on every arpeggiated or Alberti-bass note.
5. **Fix `startDetection` missing `render()` call** and add `speechSynthesis.cancel()` before `speak()` — both are one-line fixes with immediate UX impact.
</review>
**Weaknesses:**

1. **Mixed concerns**: Static data, derived data, and utility functions are all in one file with no module boundary. `getAvailableExercises`, `chordsUpToLevel`, `midiToFreq`, and `CURRICULUM` have no reason to share a scope.

2. **`var` throughout**: All declarations use `var`, causing function-scope hoisting and no block isolation. Constants like `CHORDS`, `SONGS`, `BADGES` etc. should be `const`.

3. **No input validation in utility functions**: `chordsUpToLevel(0)` returns all chords where `level <= 0` — an empty array that will silently break callers. `findChord("")` returns `null` silently. `midiToNote(-1)` returns `NOTE_NAMES[-1 % 12]` which in JS is `NOTE_NAMES[-1]` = `undefined`.

4. **`CHORD_NOTES` builder is fragile**: The IIFE uses `n.replace(/\d/g, "")` to strip octave numbers, then looks up the result in `NOTE_NAMES`. If a note name contains a flat (e.g., `"Bb3"` → `"Bb"`), `NOTE_NAMES.indexOf("Bb")` returns `-1`, falling through to `FLAT_NAMES`. But if both fail (e.g., a typo like `"Ab4"` which is valid in `FLAT_NAMES`), the fallback `NOTE_NAMES[0]` = `"C"` silently corrupts the chord detection map.

5. **Inconsistent `bassMidi` values**: Several chords have `bassNote` strings that don't match their `bassMidi` MIDI numbers (detailed in Errors section).

6. **Magic numbers throughout session plans**: `duration:60`, `duration:240`, `duration:120` etc. appear hundreds of times with no named constant. A single typo changes a session length silently.

7. **`SESSION_PLANS` references songs not in `SONGS`**: Multiple session plan `songSlice` fields reference song titles (e.g., `"12-Bar Blues"`, `"Clocks"`, `"All of Me"`) that exist in `SONGS`, but `"All of Me"` is referenced at session 40 (Level 7) while it's defined at Level 3 in `SONGS`. This mismatch will confuse users.

8. **`PLACEMENT_TESTS` is incomplete**: Only the last entry has `passesTo`. The rest only have `failsTo`. The `placement_pass` action in `app.js` increments `_placementIdx` and checks if it equals `PLACEMENT_TESTS.length` to use the last entry's `passesTo` — but if the user passes test 1 through 5 sequentially, they always land at index 5's `passesTo:21` rather than being placed based on which test they passed. There's no granular pass placement.

9. **No JSDoc or type annotations**: `chordMidi(c)` — what is `c`? `levelForSession(n)` is called in `app.js` but not defined in this file or any visible file.

10. **`SCALES` is defined but never referenced**: The entire `SCALES` object appears unused by any other function in either reviewed file.

---

## Redundant Files

Within `data.js`:

- **`allChordKeys()` and `allChords()`**: These are trivial one-liners that simply wrap `Object.keys(CHORDS)` and `.map()`. Every call site could reference `CHORDS` directly, or these could be replaced by a single `Object.values(CHORDS)` call. The added function-call overhead is unnecessary for static data.

- **`chordMidi()`, `chordFingers()`, `chordNoteNames()`**: All three are one-liners accessing `c.rootPosition.*`. They provide no abstraction benefit (callers still need to pass the chord object) and don't handle inversions — the naming implies they return "the" MIDI/fingers/notes when in reality they only return root position data.

- **`SCALES`**: Defined but referenced nowhere in either reviewed file. Dead code.

- **`STYLE_PREFS` vs `PLAY_STYLES`**: Both relate to musical style preferences. `STYLE_PREFS` is a genre list (for onboarding), `PLAY_STYLES` is a playing technique list — different purposes, but both stored as flat arrays in the same file with no cross-reference documentation.

- **`getAvailableExercises` and `getExercisesByTier` and `getWarmUpExercise` and `getSessionExercise`**: Four near-identical filter functions over `FINGER_EXERCISES`. They could be unified into a single `queryExercises(opts)` function accepting a filter object.

---

## Errors and Bugs

1. **`bassMidi` mismatches in `CHORDS`**:
   - `"F"`: `bassNote:"F2"` → MIDI for F2 is **41**. Defined as `bassMidi:41`. ✓ But `rootPosition.midi` starts at `[65,69,72]` (F4), while `bassNote` is F2. The LH plays F2 (41) but the chord diagram shows F4. This is intentional (bass is lower), but `bassMidi:41` being F2 contradicts `bassNote:"F2"` — F2 in standard MIDI numbering is 41. Correct. However:
   - `"Eb"`: `bassNote:"Eb3"`, `bassMidi:51`. Eb3 = MIDI 51. ✓
   - `"Bb"`: `bassNote:"Bb2"`, `bassMidi:46`. Bb2 = MIDI 46. ✓
   - `"Bm"`: `bassNote:"B2"`, `bassMidi:47`. B2 = MIDI 47. ✓
   - **`"G7"`**: `bassNote:"G2"`, `bassMidi:43`. G2 = MIDI 43. ✓ But `rootPosition.midi:[55,59,62,65]` starts at G3 (55), inconsistent with the bass at G2. The `playLHPattern` function uses `bassMidi` (G2=43), which is correct, but `chordMidi()` returns `[55,59,62,65]` for chord display — the visual chord diagram will show G3 as the root while the bass plays G2. Minor UX confusion.
   - **`"Gm"` `voiceLeadTo.Dm` movement**: `"G3→A3, Bb3→A3"` — both notes move to A3? The second should be `"Bb3→A3"` (correct) but the first `"G3→A3"` is wrong for a Gm→Dm transition. Dm is D-F-A; G3 should move to F3 (or D3 for root). The voice-leading text is pedagogically incorrect.

2. **`CHORD_NOTES` IIFE — silent `"C"` fallback for unknown notes** (line ~220): When `NOTE_NAMES.indexOf(noteName)` and `FLAT_NAMES.indexOf(noteName)` both return -1 (possible for `Ab`, `Db`, `Eb`, `Gb` which appear in some chords), `NOTE_NAMES[idx >= 0 ? idx : 0]` returns `"C"`, corrupting the detection map for those chords. `Ab` is in `FLAT_NAMES` so it resolves correctly, but any future chord with an enharmonic not in either array would silently become `"C"`. The guard should throw or warn:
   ```js
   if (idx < 0) { console.warn("Unknown note:", noteName); return null; }
   ```

3. **`midiToNote(-1)` returns `undefined`**: `-1 % 12` in JavaScript is `-1`, not `11`. `NOTE_NAMES[-1]` is `undefined`. Any caller passing a negative MIDI number (possible if `bassMidi` arithmetic goes wrong) gets silent `undefined`.

4. **`noteToMidi` with unknown note name returns `-1`** but callers don't check this: `((-1 + 1) * 12 + -1)` = `-1`. If passed to `playNote`, `midiToFreq(-1)` = `440 * Math.pow(2, (-1-69)/12)` = a very low frequency (~0.24 Hz) — inaudible but not an error signal.

5. **`PLACEMENT_TESTS` missing `passesTo` on intermediate entries**: Tests 0–4 only have `failsTo`. If the user passes test 3 (C→G→Am→F) but fails test 4, `app.js`'s `placement_pass` code only checks if `_placementIdx >= PLACEMENT_TESTS.length` to use `passesTo`. Passing tests 1–4 all accumulate index increments, meaning partial passes are never used for placement — the user is either placed at the start of the failed test's `failsTo` or all the way to session 21. Mid-curriculum placement is broken.

6. **`SESSION_PLANS[49]` (Session 50) `review.chords` includes `"Bm"`** which is Level 5. The graduation review chord list `["C","F","G","Am","Em","Dm","G7","D","Bm"]` is fine pedagogically, but the chord `"G7"` in `SESSION_PLANS[15].newMove.chord` is set to `"G7"` while session 15 is supposed to introduce `"Dm"`. The `newMove.chord` for session 16 should be `"G7"`, not session 15. Cross-checking: session 15 title is "The Dm Chord" with `newMove.chord:"Dm"` ✓. Session 16 title is "The G7 Chord" with `newMove.chord:"G7"` ✓. Actually correct — false alarm. However:

7. **`SESSION_PLANS[6]` (Session 7, "12-Bar Blues") `songSlice.song:"12-Bar Blues"`** — `SONGS` contains a `"12-Bar Blues"` entry at Level 2 with `chords:["C","F","G"]` ✓. But `SESSION_PLANS[44]` (Session 45) also references `"12-Bar Blues"` for a Level 8 session — playing a Level 2 song in a Level 8 session is a curriculum mismatch, suggesting the song list or plan needs a Level 8 blues variant.

8. **`SONGS` "All of Me" is Level 3** (`chords:["Am","F","C","G"]`) but Session 40 (Level 7) uses it as the song slice. A Level 7 user playing a Level 3 song with a Level 3 chord set is pedagogically inconsistent and breaks the expectation of progressive challenge.

9. **`LH_PATTERNS[5]` ("R6", Syncopated)** has `beat:2.5` in the pattern: `{beat:2.5,note:"fifth",hold:0.5}`. The `playLHPattern` function in `audio.js` computes `var delay = (p.beat - 1) * beatMs / 1000`, so beat 2.5 → delay = `1.5 * beatMs/1000`. This is correct arithmetically, but the `hold:0.5` means the note plays for half a beat. At 80 BPM that's `0.5 * (60000/80)/1000 = 0.375s`. Fine for a syncopated feel, but the pattern only has 3 notes per bar (beats 1, 2.5, 3), leaving beat 4 silent — not a traditional syncopated bass. This is a musical design issue rather than a code bug, but worth flagging.

10. **`CURRICULUM[1]` (Level 2) `chords:["F/inv2","G/inv1"]`**: The slash notation `"F/inv2"` is not a valid key in `CHORDS` (which has `"F"` and `"G"`). If any code tries `findChord("F/inv2")`, it returns `null`. This notation is only descriptive text, but it creates a trap for any code that iterates `CURRICULUM[n].chords` and calls `findChord()`.

11. **`getRewardPhase` fallback**: The function returns `REWARD_PHASES[REWARD_PHASES.length - 1]` (the `"intrinsic"` phase) for any session number, including 0 and negative numbers. A `sessionNum` of `0` (possible during onboarding before `currentSession` is set) will use intrinsic scheduling, potentially firing surprise rewards during setup.

12. **`INJURY_TIPS` array is defined but never referenced** in either reviewed file — dead data.

---

## Potential Improvements

1. **Fix the `CHORD_NOTES` fallback** to warn rather than silently corrupt:
   ```js
   var notes = c.rootPosition.notes.map(function(n) {
     var noteName = n.replace(/\d/g, "");
     var idx = NOTE_NAMES.indexOf(noteName);
     if (idx < 0) idx = FLAT_NAMES.indexOf(noteName);
     if (idx < 0) { console.warn("CHORD_NOTES: unresolved note", noteName, "in chord", c.short); return null; }
     return NOTE_NAMES[idx];
   }).filter(Boolean);
   ```

2. **Fix `midiToNote` for negative input**:
   ```js
   function midiToNote(m) {
     var pc = ((m % 12) + 12) % 12; // handles negative values
     return NOTE_NAMES[pc];
   }
   ```

3. **Add `passesTo` to all `PLACEMENT_TESTS` entries** to enable proper mid-curriculum placement:
   ```js
   { prompt:"Play a C major chord (C-E-G)", failsTo:1, passesTo:4 },
   { prompt:"Play an F major chord",         failsTo:4, passesTo:9 },
   // etc.
   ```

4. **Fix `CURRICULUM` chord arrays** to use valid `CHORDS` keys, not descriptive slash notation:
   ```js
   { num:2, ..., chords:["F","G"], ... } // not "F/inv2","G/inv1"
   ```
   Move the inversion preference to a separate `preferredInversion` map or to the voice-leading data.

5. **Unify the four `FINGER_EXERCISES` query functions** into one:
   ```js
   function queryExercises(opts) {
     return FINGER_EXERCISES.filter(function(ex) {
       if (opts.tier !== undefined && ex.tier !== opts.tier) return false;
       if (opts.session !== undefined && (opts.session < ex.sessionRange[0] || opts.session > ex.sessionRange[1])) return false;
       if (opts.integration !== undefined && ex.sessionIntegration !== opts.integration) return false;
       if (opts.offInstrument !== undefined && ex.offInstrument !== opts.offInstrument) return false;
       return true;
     });
   }
   ```

6. **Add `levelForSession` to this file** since it's called in `app.js` but not defined in any reviewed file:
   ```js
   function levelForSession(sessionNum) {
     for (var i = 0; i < CURRICULUM.length; i++) {
       var parts = CURRICULUM[i].sessions.split("-");
       var start = parseInt(parts[0]), end = parseInt(parts[1] || parts[0]);
       if (sessionNum >= start && sessionNum <= end) return CURRICULUM[i].num;
     }
     return 8;
   }
   ```
   This also fixes the `checkLevelUp` off-by-one bug identified in `app.js` if `sessions` contains a single number.

7. **Use `Object.freeze()` on all static data** to prevent accidental mutation:
   ```js
   var BADGES = Object.freeze([...]);
   var NOTE_NAMES = Object.freeze([...]);
   ```

8. **Move the `SONGS` level mismatch**: "All of Me" should be elevated to Level 5 or 6 in `SONGS`, or the Session 40 plan should reference a different song, to maintain curriculum integrity.

9. **Add a `validate()` function** (dev-only) to cross-check:
   - All `SESSION_PLANS[n].newMove.chord` values exist in `CHORDS`
   - All `SONGS[n].chords` values exist in `CHORDS`
   - All `CURRICULUM[n].lhPattern` values exist in `LH_PATTERNS`
   - All `SESSION_PLANS[n].songSlice.song` values exist in `SONGS`
   This would catch the 12+ implicit references that are currently untested.

10. **Fix `Gm` voice-leading text**: `"G3→A3, Bb3→A3"` should read `"G3→F3, Bb3→A3"` for a Gm→Dm transition (Dm = D-F-A).

11. **Add `getCurrentSessionPlan` to this file**: It's called in `app.js`'s `startGuidedSession` but defined nowhere in the reviewed files:
    ```js
    function getCurrentSessionPlan() {
      return SESSION_PLANS[S.currentSession - 1] || null;
    }
    ```

12. **Remove or document `SCALES` and `INJURY_TIPS`**: If unused, remove them or add a comment explaining their intended use. Dead data increases cognitive load for maintainers.

---

## Suggested Features

1. **Chord inversion display support**: The `CHORDS` data already contains `firstInversion` and `secondInversion` with MIDI and fingering data, but `chordMidi()` and `chordFingers()` only return root position. Exposing inversion-aware accessors (e.g., `chordMidi(c, "first")`) would let the UI and audio engine use the rich inversion data already authored.

2. **Scale exercise integration**: `SCALES` is fully defined with MIDI note arrays and interval patterns but is never used. A scale practice mode (ascending/descending at variable BPM, with metronome, tracking tempo improvement) would make the data immediately valuable and complements the finger exercise module.

3. **Song difficulty progression tracking**: `SONGS` has `practiceStart` and `target` BPM fields that are never read in the reviewed code. Surfacing these as a "your progress on this song" indicator (e.g., a progress bar from `practiceStart` to `target` based on current `adaptiveBpm`) would make the Songs tab much more motivating.

4. **Chord substitution suggestions**: The `voiceLeadTo` maps in `CHORDS` could power a "try substituting X for Y" feature in the tools tab. For example, replacing `C` with `Cmaj7` in a progression is already documented in the data — the app could surface this as a creative suggestion.

5. **Injury prevention pop-ups**: `INJURY_TIPS` is fully authored but unused. Surfacing one tip at session start (randomly or based on session duration) would add a safety layer that differentiates the app from competitors.

6. **Placement test result persistence**: `PLACEMENT_TESTS` has no mechanism to store which tests the user has passed. Adding `S.placementResults = []` and recording each pass/fail would enable the app to show users why they were placed at a given session and allow retroactive adjustment.

7. **Relative minor / parallel key awareness**: The data contains all chords for keys of C, G, and F, but no explicit key signature metadata on `CHORDS` entries. Adding a `keys: ["C","Am"]` field would enable a "chords in this key" filter and a key-of-the-day challenge.

8. **Song arrangement variants**: Each `SONGS` entry has a single `style` field. Adding an `arrangements` array (e.g., `[{style:"block", difficulty:1}, {style:"arp_up", difficulty:2}, {style:"alberti", difficulty:3}]`) would let users unlock harder arrangements of the same song as they progress, extending replay value.

---

## Summary

`data.js` contains an impressively detailed and pedagogically thoughtful curriculum, but has several bugs that directly affect correctness: the `CHORD_NOTES` silent-C fallback for unresolved notes will corrupt chord detection for flat-key chords; `CURRICULUM.chords` entries use invalid slash notation that will return `null` from `findChord()`; `PLACEMENT_TESTS` lacks `passesTo` on intermediate entries, breaking mid-curriculum placement; and `levelForSession` is called from `app.js` but not defined in any reviewed file. Dead data (`SCALES`, `INJURY_TIPS`) and the song level mismatch ("All of Me" at Level 3 used in a Level 7 session) are lower priority but add confusion.

**Priority recommendations (ordered):**

1. **Define `levelForSession()` and `getCurrentSessionPlan()`** — both are called in `app.js` and their absence will cause runtime errors on every guided session start.
2. **Fix `CURRICULUM.chords` slash notation** — any code iterating these arrays and calling `findChord()` gets silent `null` returns.
3. **Fix `CHORD_NOTES` IIFE fallback** to warn instead of silently substituting `"C"` — corrupts chord detection for all flat-key chords.
4. **Add `passesTo` to all `PLACEMENT_TESTS` entries** — mid-curriculum placement is currently non-functional.
5. **Fix `midiToNote` negative input** and remove/document dead data (`SCALES`, `INJURY_TIPS`) to reduce maintenance confusion.
</review>