---
phase: 05-hook
plan: 01
subsystem: api
tags: [nodejs, stdin, stdout, hooks, claude-code, UserPromptSubmit, dry-run]

requires:
  - phase: 03-classifier
    provides: classify(promptText, context) → { shouldInject, tier, score, signals }
  - phase: 04-session-tracker
    provides: readSession(), updateSession() for filePleaCounts context and counter tracking

provides:
  - src/hook.js — fully implemented UserPromptSubmit handler: parse stdin JSON, classify, inject phrase or dry-run log, update session

affects: [07-cli]

tech-stack:
  added: []
  patterns:
    - All errors caught and swallowed with exit 0 — hooks must never block Claude
    - stdout is injection-only channel — no debug output, no JSON, phrase text only
    - DRY_RUN reads from process.env at module load; no runtime toggling

key-files:
  modified: [src/hook.js]

key-decisions:
  - "classify() error → exit 0 silently (same as JSON.parse error — hook must be non-blocking)"
  - "DRY_RUN still calls updateSession() — tracking continues even when injection skipped"
  - "input.prompt and input.cwd default to empty string if absent — defensive, not throwing"

patterns-established:
  - "hook.js exit 0 on all paths — never exit 1, never throw uncaught"
  - "stdout is a clean injection channel — process.stdout.write only for phrase, nothing else"

duration: ~10min
started: 2026-04-21T00:45:00Z
completed: 2026-04-21T00:55:00Z
---

# Phase 5 Plan 01: Hook Summary

**`src/hook.js` end handler fully implemented — parses UserPromptSubmit stdin JSON, classifies prompt, writes tier phrase to stdout (or dry-run log to stderr), and updates session on all paths including passthrough and dry-run.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~10 min |
| Tasks | 1 completed |
| Files modified | 1 (src/hook.js) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Normal injection path works | Pass | `"fix my bug"` → stdout `"pls fix. make no mistakes."`, exit 0 |
| AC-2: Non-eligible prompt produces no stdout | Pass | `wc -c` → `0` on passthrough prompt |
| AC-3: Dry-run logs to stderr, stdout empty | Pass | stderr contains `[pls-fix dry-run]` + Tier 5 phrase; stdout empty |
| AC-4: Invalid JSON exits cleanly | Pass | `echo 'bad json' | node src/hook.js; echo $?` → `0` |

## Accomplishments

- Full `UserPromptSubmit` protocol implemented — stdin JSON parse → classify → stdout inject → session update
- All four input paths handled: eligible injection, passthrough, dry-run, bad JSON — all exit 0
- stdout kept strictly clean — phrase text only, never polluted with debug or status output
- Classifier regression check: 16/16 tests still passing after hook implementation

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/hook.js` | Modified | `end` handler body replacing TODO stub — ~35 lines |

## Decisions Made

None beyond plan spec — implemented exactly as designed.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Verification Results

```
# AC-1: eligible prompt
echo '{"prompt":"fix my bug","cwd":"/tmp"}' | node src/hook.js
→ "pls fix. make no mistakes."  ✓

# AC-2: non-eligible
echo '{"prompt":"what is the weather?","cwd":"/tmp"}' | node src/hook.js | wc -c
→ 0  ✓

# AC-3: dry-run
echo '{"prompt":"PLEASE fix this for the demo","cwd":"/tmp"}' | PLS_FIX_DRY_RUN=true node src/hook.js 2>&1 >/dev/null
→ [pls-fix dry-run] Would have appended (Tier 5):
    "😭😭😭 fix this plsssss 🙏🙏🙏"
  ⚠️  Prompt sent without blessing. Mistake prevention not guaranteed.  ✓

# AC-4: bad JSON
echo 'bad json' | node src/hook.js; echo "exit: $?"
→ exit: 0  ✓

# Regression
node --test src/classifier.test.js → 16 pass, 0 fail  ✓
```

## Next Phase Readiness

**Ready:**
- `src/hook.js` is the live plugin — Phase 7 (CLI) registers its absolute path in `~/.claude/settings.json`
- `src/session.js` is being updated by hook on every prompt — Phase 6 (Report) can now read real accumulated data
- `src/report.js` stub is in place — Phase 6 implements it next

**Concerns:**
- None.

**Blockers:**
- None. Phase 6 (Report Renderer) can start immediately.

---
*Phase: 05-hook, Plan: 01*
*Completed: 2026-04-21*
