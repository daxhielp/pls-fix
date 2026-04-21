---
phase: 10-local-install
plan: 01
subsystem: cli
tags: [local-install, project-config, settings-json, cli]

requires:
  - phase: 09-pause-toggle
    provides: cli.js with pause/resume + slash command management

provides:
  - cli.js — --local flag routing install/uninstall to cwd/.claude/settings.json
  - README.md — local install documentation

affects: []

tech-stack:
  added: []
  patterns:
    - LOCAL flag: process.cwd()/.claude as configDir when --local passed; COMMANDS_DIR always stays user-level

key-files:
  created: []
  modified: [cli.js, README.md]

key-decisions:
  - "--local resolves configDir to process.cwd()/.claude — consistent with Claude Code project-level settings convention"
  - "COMMANDS_DIR stays global regardless of --local — slash commands are user-level only in Claude Code"
  - "Scoped confirmation messages: (local) or (global) in install/uninstall output"

duration: ~10min
started: 2026-04-21T02:00:00Z
completed: 2026-04-21T02:10:00Z
---

# Phase 10 Plan 01: Local Installation Summary

**`--local` flag added to install/uninstall — routes config mutations to `cwd/.claude/settings.json` instead of `~/.claude/settings.json`; slash commands remain global; README documents usage.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~10 min |
| Tasks | 3 completed |
| Files modified | 2 (cli.js, README.md) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Local config path | Pass | `--local` resolves to `process.cwd()/.claude/settings.json` |
| AC-2: Uninstall respects --local | Pass | Hooks removed from local config; global untouched |
| AC-3: Global install unaffected | Pass | No --local = identical behavior to before; verified configs isolated (1 entry each) |
| AC-4: Slash command files stay global | Pass | `COMMANDS_DIR` resolves from `~/.claude` regardless of `--local` |
| AC-5: Confirmation message reflects scope | Pass | "(local)" / "(global)" in install/uninstall output |

## Accomplishments

- Local and global installs can coexist — useful for per-project pls-fix without affecting all Claude Code sessions
- Zero regressions: global path unchanged, `COMMANDS_DIR` unchanged, pause/resume file unchanged
- README clearly documents `--local`, `--local --dry-run` combination

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `cli.js` | Modified | `LOCAL` constant from `--local` flag; conditional `configDir`; scoped log messages |
| `README.md` | Modified | Local install section under ## Install; `--local --dry-run` combination note |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| `process.cwd()/.claude` as local path | Matches Claude Code's own project-level settings convention | Consistent with where Claude Code looks for project settings |
| COMMANDS_DIR always global | Slash commands in Claude Code are user-level only — no project-level commands dir | Avoids broken slash commands if user switches directories |

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

**Ready:** Local install fully functional; no regressions.
**Concerns:** None.
**Blockers:** None — `npm publish` remains the manual step when ready.

---
*Phase: 10-local-install, Plan: 01*
*Completed: 2026-04-21*
