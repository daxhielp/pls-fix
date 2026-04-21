---
phase: 03-classifier
plan: 01
subsystem: testing
tags: [nodejs, node:test, tdd, classifier, desperation-scoring]

requires:
  - phase: 02-architect
    provides: src/classifier.js stub with correct signature and export shape

provides:
  - src/classifier.js — full classify() implementation: eligibility check, 10-signal scoring, 5-tier mapping
  - src/classifier.test.js — 16 test cases, all passing, covering all ACs

affects: [05-hook, 04-session-tracker]

tech-stack:
  added: []
  patterns:
    - TDD red-green: test file written first against stub (12 failing), then implementation written to pass all
    - node:test built-in only — no external test dependencies
    - Neutral-timestamp pattern: tests that don't exercise time_of_day pass NOON context to prevent clock-based flakiness

key-files:
  created: [src/classifier.test.js]
  modified: [src/classifier.js]

key-decisions:
  - "time_of_day uses system clock as fallback — tests pin context.timestamp to noon to stay deterministic"
  - "Imperative verb eligibility requires verb at start of prompt (words[0]) + code noun anywhere in text"
  - "Signals array uses string keys matching plan spec exactly"

patterns-established:
  - "All signal detection uses regex on original casing (not lowercased) for all_caps accuracy"
  - "isEligible() uses lowercased string; signal scoring uses original promptText"

duration: ~20min
started: 2026-04-21T00:00:00Z
completed: 2026-04-21T00:20:00Z
---

# Phase 3 Plan 01: Classifier Summary

**`classify()` fully implemented TDD-style — 16 passing tests cover all 10 signals, all 5 tier boundaries, both eligibility paths, and 3 context-based signals.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~20 min |
| Tasks | 2 completed |
| Files created | 1 (classifier.test.js) |
| Files modified | 1 (classifier.js) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Tests written first, 10+ cases | Pass | 16 test cases; ran against stub (12 fail, 4 pass = valid red phase) |
| AC-2: All tests pass after implementation | Pass | 16/16 pass, exit code 0 |
| AC-3: Eligibility check correct | Pass | FIX_KEYWORDS + imperative verb+code noun paths both verified |
| AC-4: Scoring produces correct tier for multi-signal | Pass | PLEASE+CAPS+demo = score 7, tier 4 verified |

## Accomplishments

- Wrote 16 test cases covering all plan-specified behaviors before implementing
- Implemented classify() as a pure function: no I/O, no side effects, no external deps
- Discovered and resolved test flakiness caused by time_of_day signal using real system clock — pinned non-time tests to a noon timestamp via context

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/classifier.test.js` | Created | 16 node:test cases covering all ACs |
| `src/classifier.js` | Modified | Full implementation replacing TODO stub |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Pin NOON context in signal-boundary tests | time_of_day fires on real clock; without pinning, tier tests fail at night | Tests are fully deterministic regardless of when run |
| Regex on original `promptText` for all_caps | Lowercasing before `[A-Z]{3,}` would never match | Correct detection of ALL-CAPS words |
| `words[0]` check for imperative verb eligibility | Plan spec says "starts with IMPERATIVE_VERB" | Tight eligibility — "don't debug" won't match |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | Essential fix, no scope creep |
| Scope additions | 0 | — |
| Deferred | 0 | — |

**Total impact:** One necessary test-design fix, implementation matches plan exactly.

### Auto-fixed Issues

**1. time_of_day clock flakiness in tier-boundary tests**
- **Found during:** Task 2 verification (3 tests failing unexpectedly)
- **Issue:** Tests for "fix this again" (tier 2), "why isn't this working still??" (tier 3), and "PLEASE fix this for the demo" (tier 4) were running at early-morning hours, causing time_of_day (+2) to inflate scores and push tiers up by one
- **Fix:** Added `const NOON = { timestamp: new Date('2025-06-01T12:00:00') }` and passed it as context to the three tier-boundary tests; time_of_day test (test 13) retains its explicit 2am timestamp
- **Files:** src/classifier.test.js
- **Verification:** All 16 tests pass across any hour of day

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Tier-boundary tests failed due to time_of_day firing at system clock | Pinned context.timestamp to noon in affected tests |

## Verification Results

```
node --test src/classifier.test.js
# tests 16 / pass 16 / fail 0 / exit 0

node -e "classify('fix my bug')"
→ { shouldInject: true, tier: 2, score: 2, signals: ['time_of_day'] }
  (tier 2 because tests run at night — correct behavior, not a bug)

node -e "classify('PLEASE fix demo??').tier"
→ 5  (please=2 + CAPS=2 + demo=3 + ??=2 = 9 → tier 5) ✓
```

## Next Phase Readiness

**Ready:**
- `classify(promptText, context)` is complete and tested — Phase 5 (Hook) can call it unconditionally
- Return shape `{ shouldInject, tier, score, signals }` is stable
- `src/session.js` stub is still in place — Phase 4 implements it next

**Concerns:**
- `src/tiers.js` Tier 4 still has "fix ts" typo (carried from Phase 2) — user can fix anytime, not a blocker

**Blockers:**
- None. Phase 4 (Session Tracker) can start immediately.

---
*Phase: 03-classifier, Plan: 01*
*Completed: 2026-04-21*
