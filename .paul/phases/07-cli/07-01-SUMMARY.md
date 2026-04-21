---
phase: 07-cli
plan: 01
subsystem: cli
tags: [nodejs, cli, settings.json, install, uninstall, hooks]

requires:
  - phase: 05-hook
    provides: src/hook.js — UserPromptSubmit handler registered by install
  - phase: 06-report-renderer
    provides: src/report.js + printReport() — called by uninstall and report subcommand

provides:
  - cli.js — fully implemented install/uninstall/report with settings.json mutation

affects: [08-launch]

tech-stack:
  added: []
  patterns:
    - CLAUDE_CONFIG_DIR env override for config path isolation (enables safe testing without touching real ~/.claude/settings.json)
    - _pls-fix: true tag on outer hook entry object for clean uninstall filtering
    - isAlreadyInstalled() guard prevents duplicate hook registration

key-files:
  modified: [cli.js]

key-decisions:
  - "_pls-fix tag on outer entry (with matcher+hooks), not inner hook object — simpler filter at uninstall"
  - "isAlreadyInstalled() checks both UserPromptSubmit and SessionEnd arrays — avoids partial-install duplicates"
  - "Uninstall deletes empty arrays to keep settings.json clean (no leftover empty hooks objects)"
  - "Farewell printed before printReport() so report appears last in terminal output"

patterns-established:
  - "cli.js uses CLAUDE_CONFIG_DIR env override — always test with CLAUDE_CONFIG_DIR=/tmp/pls-fix-test to avoid touching real config"

duration: ~10min
started: 2026-04-21T01:15:00Z
completed: 2026-04-21T01:25:00Z
---

# Phase 7 Plan 01: CLI Summary

**`cli.js` fully implemented — `install` (settings.json mutation + already-installed guard + --dry-run), `uninstall` (filter removal + session temp cleanup + final report), `report` (direct printReport call); all verified against isolated CLAUDE_CONFIG_DIR.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~10 min |
| Tasks | 2 completed (1 auto + 1 checkpoint:human-verify) |
| Files modified | 1 (cli.js) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: install registers both hooks | Pass | UserPromptSubmit + SessionEnd entries with _pls-fix: true written to settings.json |
| AC-2: install --dry-run uses DRY_RUN prefix | Pass | hookCmd prefixed with `PLS_FIX_DRY_RUN=true `; confirmation prints "Dry-run mode: ON" |
| AC-3: uninstall removes hooks + prints final report | Pass | Filters _pls-fix entries, deletes session temp, calls printReport() |
| AC-4: report subcommand renders box report | Pass | `node cli.js report` calls printReport() directly |
| AC-5: unknown subcommand prints usage | Pass | Usage line printed, exit 0 |

## Accomplishments

- Full `cli.js` implementation replacing all stubs — install/uninstall/report + --dry-run flag
- `isAlreadyInstalled()` guard prevents duplicate hook entries on repeated `install` calls
- Uninstall cleans up empty hook arrays from settings.json (no leftover `{}` remnants)
- `~/.pls-fix/` directory ensured at install time (streak file will be ready on first use)

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `cli.js` | Modified | Full implementation replacing TODO stubs; all three subcommands + --dry-run |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| `_pls-fix: true` on outer entry object | Outer entry (with `matcher`+`hooks`) is the array element — filtering it is simpler than traversing inner hooks arrays | Uninstall is a clean `.filter(e => !e['_pls-fix'])` |
| Delete empty hook arrays after uninstall | Settings.json stays clean — no leftover `"UserPromptSubmit": []` | Cleaner config for users who inspect it |
| Farewell message before printReport() | Report should appear last in terminal for emphasis | Better UX at uninstall |

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Verification Results

```
node cli.js report
→ Box-drawing report rendered, streak shown  ✓

CLAUDE_CONFIG_DIR=/tmp/pls-fix-test node cli.js install
→ settings.json written with UserPromptSubmit + SessionEnd entries, _pls-fix: true  ✓

CLAUDE_CONFIG_DIR=/tmp/pls-fix-test node cli.js install  (second run)
→ "pls-fix is already installed." — no duplicates  ✓

CLAUDE_CONFIG_DIR=/tmp/pls-fix-test node cli.js install --dry-run
→ hookCmd: "PLS_FIX_DRY_RUN=true node /path/to/src/hook.js"  ✓

CLAUDE_CONFIG_DIR=/tmp/pls-fix-test node cli.js uninstall
→ hooks filtered, empty arrays removed, farewell + report printed  ✓

node cli.js / node cli.js badcmd
→ Usage line, exit 0  ✓

node --test src/classifier.test.js → 16 pass, 0 fail  ✓
```

## Next Phase Readiness

**Ready:**
- All 7 source modules complete: classifier, tiers, session, hook, report, cli
- `npx pls-fix install` flow is fully implemented and manually verified
- Phase 8 (Launch) can proceed immediately: README + end-to-end verification + v1.0.0 tag

**Concerns:**
- None.

**Blockers:**
- None. Phase 8 (Launch) can start immediately.

---
*Phase: 07-cli, Plan: 01*
*Completed: 2026-04-21*
