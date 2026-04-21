---
phase: 01-plan
plan: 01
subsystem: planning
tags: [hooks, claude-code, UserPromptSubmit, SessionEnd, classifier, npx]

requires: []
provides:
  - IMPLEMENTATION-PLAN.md — complete technical spec for all 8 build phases
  - Hook type decision: UserPromptSubmit (prompt interception) + SessionEnd (report)
  - Classifier design: eligibility check + 10-signal desperation scoring + 5-tier mapping
  - Session storage schema + streak persistence strategy
  - Tier phrase format: integer-keyed CommonJS object, single string per tier
  - npx distribution approach: node path via process.execPath, no build step
affects: [02-architect, 03-classifier, 04-session-tracker, 05-hook, 06-report-renderer, 07-cli, 08-launch]

tech-stack:
  added: []
  patterns:
    - CommonJS (require/module.exports) — no ESM, no build step
    - node:test for unit testing (built-in, no external dep)
    - User-level settings.json mutation with _pls-fix tag for clean uninstall

key-files:
  created: [IMPLEMENTATION-PLAN.md]
  modified: []

key-decisions:
  - "Hook type: UserPromptSubmit (not PreToolUse) — PRD was wrong, PreToolUse has no prompt field"
  - "Session report hook: SessionEnd (not Stop) — Stop fires per-turn, SessionEnd fires at true session end"
  - "Streak persistence: ~/.pls-fix/streak.json — persistent across sessions"
  - "Tier phrases: single string per tier in tiers.js, integer keys 1-5"
  - "No external runtime dependencies — Node.js built-ins only"
  - "CommonJS throughout — no ESM, no transpilation"

patterns-established:
  - "Hook I/O: read JSON from stdin, write plain text to stdout for context injection, exit 0"
  - "Config tagging: _pls-fix: true on every hook entry for clean filter-based uninstall"
  - "Command resolution: process.execPath + path.resolve(__dirname, ...) for npx-safe paths"

duration: ~30min
started: 2026-04-20T00:00:00Z
completed: 2026-04-20T00:30:00Z
---

# Phase 1 Plan 01: Plan Summary

**IMPLEMENTATION-PLAN.md produced — all 8 technical areas specified, hook type corrected from PRD (UserPromptSubmit + SessionEnd), Phase 2 can scaffold immediately.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~30 min |
| Tasks | 2 completed + 1 decision checkpoint |
| Files modified | 1 created |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Hook type confirmed | Pass | UserPromptSubmit confirmed via official docs; SessionEnd for report. I/O schema documented. |
| AC-2: Implementation plan complete | Pass | All 8 sections present, no TBD entries. Phase 2 can scaffold without questions. |
| AC-3: Tier phrase format confirmed | Pass | Integer-keyed object, single string per tier, `[TIER_N_PHRASE]` placeholder format for scaffold. |

## Accomplishments

- Researched Claude Code hook documentation — confirmed PRD had two incorrect hook types
- Resolved hook type via decision checkpoint: `UserPromptSubmit` + `SessionEnd` (option-a)
- Produced complete `IMPLEMENTATION-PLAN.md` covering: file structure, hook registration, I/O protocol, classifier design, session storage, tier phrase format, npx distribution, dry-run mode

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `IMPLEMENTATION-PLAN.md` | Created | Complete technical spec — reference for all subsequent phases |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| `UserPromptSubmit` hook (not `PreToolUse`) | PreToolUse fires before tool calls and has no `prompt` field in stdin — cannot read user text | hook.js architecture, stdin parsing, install config mutation all change accordingly |
| `SessionEnd` hook (not `Stop`) | Stop fires after every Claude turn; SessionEnd fires once at true session end — correct for a session summary | report.js registers under SessionEnd, not Stop |
| `~/.pls-fix/streak.json` for streak persistence | Deferred question from PRD — resolved to persistent file so streak survives across sessions | session.js creates `~/.pls-fix/` dir on first install |
| CommonJS only (`require`/`module.exports`) | No build step, simpler npx distribution, Node 18+ supports both | All src files use require, no .mjs or type:module |
| `node:test` for unit testing | Built-in — zero extra install, works with `node --test` | No jest/mocha dependency in package.json |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | Minor — pseudocode syntax only |
| Deferred | 0 | — |

### Auto-fixed Issues

**1. Documentation — time-of-day signal pseudocode**
- **Found during:** Task 2 qualify pass
- **Issue:** `context.timestamp.getHours() >= 23 || <= 3` — invalid JS syntax (bare `<= 3` without LHS)
- **Fix:** Changed to `const h = context.timestamp.getHours(); h >= 23 || h <= 3`
- **Files:** `IMPLEMENTATION-PLAN.md` Section 4
- **Verification:** Read file — correct syntax in place

## Issues Encountered

None.

## Next Phase Readiness

**Ready:**
- `IMPLEMENTATION-PLAN.md` is the single source of truth for Phase 2 (Architect)
- All file paths, exports, imports, and stubs specified — scaffold is mechanical
- `tiers.js` placeholder format defined — user fills in before Phase 3
- Hook registration approach fully documented — install/uninstall logic is clear

**Concerns:**
- `filePleaCounts` tracking in `updateSession` needs context about which file is "active" — the stdin JSON includes `cwd` but not an active file. Phase 5 (Hook) will need to decide how to extract the relevant filename from the prompt text or cwd.

**Blockers:**
- None. Phase 2 (Architect) can start immediately.

---
*Phase: 01-plan, Plan: 01*
*Completed: 2026-04-20*
