---
phase: 04-session-tracker
plan: 01
subsystem: storage
tags: [nodejs, fs, json, session, streak, persistence]

requires:
  - phase: 03-classifier
    provides: classify() return shape { shouldInject, tier, score, signals } — updateSession receives this

provides:
  - src/session.js — 6 exported functions: readSession, writeSession, resetSession, updateSession, readStreak, writeStreak
  - Session JSON at os.tmpdir()/pls-fix-session.json
  - Streak JSON at ~/.pls-fix/streak.json (directory auto-created)

affects: [05-hook, 06-report-renderer]

tech-stack:
  added: []
  patterns:
    - try/catch JSON.parse for graceful missing-file handling (both session and streak)
    - FRESH_SESSION() is a factory function — never mutated directly
    - writeStreak() creates ~/.pls-fix/ directory if absent (fs.mkdirSync recursive)

key-files:
  created: []
  modified: [src/session.js]

key-decisions:
  - "cwd used as filePleaCounts key — Phase 5 may refine to actual filename extracted from prompt text"
  - "Streak increment logic deferred to Phase 6 (report.js) — session.js provides storage primitives only"
  - "mostDesperatePrompt replaced only when new score strictly exceeds prior score"

patterns-established:
  - "Session functions: always readSession() → mutate → writeSession() — never cache in memory"
  - "passthrough prompts (shouldInject: false): only promptsPassedThrough increments, nothing else"

duration: ~10min
started: 2026-04-21T00:30:00Z
completed: 2026-04-21T00:40:00Z
---

# Phase 4 Plan 01: Session Tracker Summary

**`src/session.js` fully implemented — 6 exported functions covering session I/O, counter tracking, most-desperate-prompt, and streak storage primitives.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~10 min |
| Tasks | 2 completed (merged into single file write) |
| Files created | 0 |
| Files modified | 1 (src/session.js) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Core session I/O works | Pass | readSession() returns FRESH_SESSION() on missing file; writeSession/resetSession verified |
| AC-2: updateSession increments correctly | Pass | promptsBlessed=1, mistakesPrevented=1, tierBreakdown, mostDesperatePrompt all verified |
| AC-3: Streak read/write works | Pass | readStreak() returns zeros on missing file; writeStreak creates dir and file |
| AC-4: Smoke tests pass | Pass | All 4 verification node -e commands match expected output |

## Accomplishments

- All 4 session stubs replaced with real fs I/O — readSession, writeSession, resetSession, updateSession
- readStreak/writeStreak added as storage primitives; streak increment logic correctly deferred to Phase 6
- writeStreak auto-creates `~/.pls-fix/` via `fs.mkdirSync({ recursive: true })` — no manual dir creation needed at install time

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/session.js` | Modified | All 6 functions implemented; module.exports updated |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Use `cwd` as `filePleaCounts` key | stdin provides cwd; actual filename extraction is a deferred issue from Phase 1 | Phase 5 may replace with regex-extracted filename from promptText |
| Streak logic (increment/personalBest) deferred to Phase 6 | report.js is the SessionEnd handler — it owns the "update and render" cycle | Phase 6 calls readStreak/writeStreak and handles the date comparison logic |
| mostDesperatePrompt: strict greater-than | Ties keep the earlier prompt — simpler, no tie-breaking needed | First desperate prompt of a given score level is preserved |

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Verification Results

```
node -e "s.resetSession(); console.log(s.readSession().promptsBlessed)"
→ 0  ✓

node -e "s.resetSession(); s.updateSession({shouldInject:true,tier:2,score:3,signals:[]}, 'fix my bug', '/tmp'); const sess = s.readSession(); console.log(sess.promptsBlessed, sess.tierBreakdown['2'], sess.mostDesperatePrompt.tier)"
→ 1 1 2  ✓

node -e "s.writeStreak({currentStreak:3,personalBest:5,lastSessionDate:'2026-04-21'}); console.log(s.readStreak().currentStreak)"
→ 3  ✓

node -e "console.log(Object.keys(s).join(','))"
→ readSession,writeSession,resetSession,updateSession,readStreak,writeStreak  ✓
```

## Next Phase Readiness

**Ready:**
- `updateSession(classifyResult, promptText, cwd)` ready to call from hook.js after classify()
- `readSession()` ready for report.js to read counters and mostDesperatePrompt
- `readStreak()` / `writeStreak()` ready for report.js to manage streak state
- `resetSession()` ready for cli.js `uninstall` command

**Concerns:**
- `filePleaCounts` uses `cwd` (directory) as key, not filename — Phase 5 deferred issue: extract filename from promptText if desired

**Blockers:**
- None. Phase 5 (Hook) can start immediately.

---
*Phase: 04-session-tracker, Plan: 01*
*Completed: 2026-04-21*
